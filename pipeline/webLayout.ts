import { SaxesParser } from "saxes";
import { BOOK_BY_USFM } from "../src/lib/books";

export interface VerseLayout {
  /** container the verse *starts* in */
  kind: "p" | "m" | "q";
  /** a paragraph/line break occurs immediately before this verse */
  breakBefore: boolean;
  /** a stanza break (<b/>) occurs immediately before this verse */
  stanza: boolean;
}

/** key: "GEN.1.1" */
export type LayoutMap = Map<string, VerseLayout>;

/** <p sfm=…> styles that are titles/intros/speaker labels, not Scripture paragraphs. */
const IGNORED_P = new Set(["mt", "mt1", "mt2", "mt3", "mte", "ms", "ms1", "ms2", "is", "ip", "ili", "imt", "sp", "s", "s1", "s2", "r", "cl"]);
/** Elements whose text is not body text (notes, headings, psalm titles…). */
const IGNORED_EL = new Set(["f", "x", "id", "ide", "h", "toc", "d", "cl", "rem", "fig"]);

/**
 * Extract paragraph/poetry structure from the WEB USFX. Only *where* breaks
 * fall (at verse granularity) is kept — never any WEB text.
 */
export function parseWebLayout(xml: string): { layout: LayoutMap; midVerseBreaks: number } {
  const layout: LayoutMap = new Map();
  const parser = new SaxesParser({ xmlns: false });
  let book: string | null = null;
  let chapter = 0;
  let container: "p" | "m" | "q" | null = null;
  let pendingBreak = false;
  let pendingStanza = false;
  let ignoreDepth = 0;
  let midVerseBreaks = 0;
  const ignoreStack: boolean[] = [];

  parser.on("opentag", (tag) => {
    const a = tag.attributes as Record<string, string>;
    let ignoring = false;
    switch (tag.name) {
      case "book":
        book = BOOK_BY_USFM.has(a.id) ? a.id : null;
        chapter = 0;
        break;
      case "c":
        chapter = Number(a.id);
        break;
      case "p": {
        const sfm = a.sfm ?? "p";
        if (IGNORED_P.has(sfm)) ignoring = true;
        else {
          container = sfm === "m" ? "m" : "p";
          pendingBreak = sfm !== "nb";
        }
        break;
      }
      case "q":
        container = "q";
        pendingBreak = true;
        break;
      case "b":
        pendingStanza = true;
        break;
      case "v":
        if (book && chapter && container && ignoreDepth === 0) {
          const v = parseInt(a.id, 10);
          layout.set(`${book}.${chapter}.${v}`, { kind: container, breakBefore: pendingBreak, stanza: pendingStanza });
          pendingBreak = pendingStanza = false;
        }
        break;
      default:
        if (IGNORED_EL.has(tag.name)) ignoring = true;
    }
    if (!tag.isSelfClosing) {
      ignoreStack.push(ignoring);
      if (ignoring) ignoreDepth++;
    }
  });

  parser.on("closetag", (tag) => {
    if (tag.isSelfClosing) return;
    if (ignoreStack.pop()) ignoreDepth--;
    if (tag.name === "p" || tag.name === "q") {
      if (ignoreDepth === 0) container = null;
    }
  });

  parser.on("text", (text) => {
    if (ignoreDepth > 0 || !container || !text.trim()) return;
    // Body text before the next verse marker: the break happened mid-verse,
    // which we can't carry over to the KJV wording, so drop it.
    if (pendingBreak && container !== "q") midVerseBreaks++;
    pendingBreak = false;
    pendingStanza = false;
  });

  parser.write(xml).close();
  return { layout, midVerseBreaks };
}
