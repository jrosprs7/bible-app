import { BOOK_BY_USFM } from "../src/lib/books";
import type { Block, BookText, Chapter, Inline, StyledText } from "../src/lib/model";
import type { KjvBook } from "./kjvOsis";
import { endsSentence, plain } from "./text";
import type { LayoutMap } from "./webLayout";

export interface MergeStats {
  verses: number;
  missingLayout: string[];
  /** WEB paragraph breaks skipped because the KJV verse before doesn't end a sentence */
  rejectedBreaks: string[];
  acceptedBreaks: number;
}

const toInline = (s: StyledText): Inline => (s.add || s.wj ? s : s.t);

/**
 * Lay the KJV text out using the WEB's paragraph and poetry structure.
 * Rules:
 *  - every chapter starts a new block (print-Bible convention);
 *  - a poetry verse is its own line ("q"); prose↔poetry switches start a block;
 *  - a WEB prose paragraph break is honoured only when the preceding KJV verse
 *    ends a sentence, so the KJV never gets a paragraph mid-sentence;
 *  - Psalm titles / acrostic letters are "d" blocks.
 */
export function mergeBook(kjv: KjvBook, layout: LayoutMap, stats: MergeStats, punct = ".?!:;"): BookText {
  const def = BOOK_BY_USFM.get(kjv.usfm)!;
  const chapters: Chapter[] = [];
  let ch: Chapter | null = null;
  let cur: Block | null = null;
  let prevText = "";
  let forceBreak = false;

  for (const item of kjv.items) {
    if (!ch || ch.n !== item.c) {
      ch = { n: item.c, blocks: [] };
      chapters.push(ch);
      cur = null;
      forceBreak = true;
    }
    if (item.kind === "title") {
      ch.blocks.push({ type: "d", content: item.segs.map(toInline) });
      cur = null;
      forceBreak = true;
      continue;
    }

    stats.verses++;
    const key = `${kjv.usfm}.${item.c}.${item.v}`;
    const L = layout.get(key);
    if (!L) stats.missingLayout.push(key);
    const poetry = L ? L.kind === "q" : cur?.type === "q";

    let start = forceBreak || !cur || poetry || cur.type === "q";
    if (!start && L?.breakBefore) {
      if (endsSentence(prevText, punct)) {
        start = true;
        stats.acceptedBreaks++;
      } else stats.rejectedBreaks.push(key);
    }

    if (start) {
      const type: Block["type"] = poetry ? "q" : cur?.type === "q" && !L?.breakBefore ? "m" : L?.kind === "m" ? "m" : "p";
      const block: Block = { type, content: [] };
      const prevInChapter = ch.blocks[ch.blocks.length - 1];
      if (poetry && L?.stanza && prevInChapter?.type === "q") block.stanza = 1;
      ch.blocks.push(block);
      cur = block;
      forceBreak = false;
    }

    cur!.content.push(item.kjvPara ? { v: item.v, k: 1 } : { v: item.v });
    for (const s of item.segs) cur!.content.push(toInline(s));
    prevText = plain(item.segs);
  }

  return { id: kjv.usfm, name: def.name, title: kjv.title, chapters };
}
