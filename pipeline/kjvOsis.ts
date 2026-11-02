import { SaxesParser } from "saxes";
import { BOOK_BY_OSIS } from "../src/lib/books";
import type { StyledText } from "../src/lib/model";
import { normalizeSegments } from "./text";

export type KjvItem =
  | { kind: "verse"; c: number; v: number; segs: StyledText[]; kjvPara: boolean }
  | { kind: "title"; c: number; segs: StyledText[] };

export interface KjvBook {
  usfm: string;
  title: string;
  items: KjvItem[];
}

/**
 * Parse the eBible KJV OSIS (milestone style: <verse sID/>…<verse eID/>,
 * <q who="Jesus" sID/>…<q eID/>). Only the 66 canonical books are kept.
 */
export function parseKjvOsis(xml: string): { books: KjvBook[]; warnings: string[] } {
  const books: KjvBook[] = [];
  const warnings: string[] = [];
  const parser = new SaxesParser({ xmlns: false });

  let book: KjvBook | null = null;
  let bookDivDepth = -1;
  let divDepth = 0;
  let chapter = 0;
  let pendingPara = false;
  let addDepth = 0;
  let wj = false;
  let verse: { c: number; v: number; segs: StyledText[]; kjvPara: boolean } | null = null;
  let title: { type: string; segs: StyledText[] } | null = null;

  parser.on("opentag", (tag) => {
    const a = tag.attributes as Record<string, string>;
    switch (tag.name) {
      case "div":
        divDepth++;
        if (a.type === "book") {
          const def = BOOK_BY_OSIS.get(a.osisID);
          if (def) {
            book = { usfm: def.usfm, title: "", items: [] };
            bookDivDepth = divDepth;
          }
        }
        break;
      case "chapter":
        if (book && a.sID) {
          chapter = Number(a.n);
          pendingPara = true;
        }
        break;
      case "p":
        if (book) pendingPara = true;
        break;
      case "verse":
        if (!book) break;
        if (a.sID) {
          if (verse) warnings.push(`verse ${a.osisID} opened inside another verse`);
          const [, c, v] = a.osisID.split(".");
          if (Number(c) !== chapter) warnings.push(`verse ${a.osisID} outside its chapter`);
          verse = { c: Number(c), v: Number(v), segs: [], kjvPara: pendingPara && Number(v) !== 1 };
          pendingPara = false;
        } else if (a.eID) {
          if (verse) {
            book.items.push({ kind: "verse", ...verse, segs: normalizeSegments(verse.segs) });
            verse = null;
          }
        }
        break;
      case "transChange":
        addDepth++;
        break;
      case "q":
        if (a.sID) wj = a.who === "Jesus";
        else if (a.eID) wj = false;
        break;
      case "title":
        if (book) title = { type: a.type ?? "", segs: [] };
        break;
    }
  });

  parser.on("closetag", (tag) => {
    switch (tag.name) {
      case "div":
        if (book && divDepth === bookDivDepth) {
          books.push(book);
          book = null;
          bookDivDepth = -1;
        }
        divDepth--;
        break;
      case "transChange":
        addDepth--;
        break;
      case "title":
        if (book && title) {
          const segs = normalizeSegments(title.segs);
          if (title.type === "main") book.title = segs.map((s) => s.t).join("");
          else if (title.type === "psalm") book.items.push({ kind: "title", c: chapter, segs });
          else warnings.push(`${book.usfm}: ignored title type="${title.type}"`);
          title = null;
        }
        break;
    }
  });

  parser.on("text", (text) => {
    if (!book) return;
    const seg: StyledText = { t: text, ...(addDepth > 0 ? { add: 1 as const } : {}), ...(wj ? { wj: 1 as const } : {}) };
    if (title) title.segs.push(seg);
    else if (verse) verse.segs.push(seg);
    // The eBible OSIS has the Psalter's "Book I"…"Book V" divisions as loose text; not part of the KJV text.
    else if (/^\s*Book [IV]+\s*$/.test(text)) return;
    else if (text.trim()) warnings.push(`${book.usfm} ${chapter}: text outside a verse: ${JSON.stringify(text.trim().slice(0, 60))}`);
  });

  parser.write(xml).close();
  return { books, warnings };
}
