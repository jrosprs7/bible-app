import { BOOKS } from "../src/lib/books";
import { type BookText, inlineText, isVerseMark } from "../src/lib/model";

export interface ValidationResult {
  errors: string[];
  verses: number;
  chapters: number;
}

/** Structural checks on generated data: canon complete, verses in order, exactly once, non-empty text. */
export function validateBooks(books: BookText[]): ValidationResult {
  const errors: string[] = [];
  let verses = 0;
  let chapters = 0;
  if (books.length !== 66) errors.push(`expected 66 books, got ${books.length}`);
  books.forEach((b, i) => {
    if (BOOKS[i]?.usfm !== b.id) errors.push(`book ${i} is ${b.id}, expected ${BOOKS[i]?.usfm}`);
    b.chapters.forEach((c, ci) => {
      chapters++;
      if (c.n !== ci + 1) errors.push(`${b.id}: chapter ${c.n} at position ${ci + 1}`);
      let expect = 1;
      let curVerseText: string | null = null;
      const flush = (where: string) => {
        if (curVerseText !== null && !curVerseText.trim()) errors.push(`${where}: empty verse text`);
        if (curVerseText && /\s{2,}|^\s|\s$/.test(curVerseText)) errors.push(`${where}: bad whitespace ${JSON.stringify(curVerseText)}`);
      };
      for (const blk of c.blocks) {
        if (blk.type !== "d" && !isVerseMark(blk.content[0])) errors.push(`${b.id} ${c.n}: block does not start at a verse`);
        if (blk.content.length === 0) errors.push(`${b.id} ${c.n}: empty block`);
        for (const x of blk.content) {
          if (isVerseMark(x)) {
            flush(`${b.id} ${c.n}:${expect - 1}`);
            if (x.v !== expect) errors.push(`${b.id} ${c.n}: verse ${x.v} found, expected ${expect}`);
            expect = x.v + 1;
            verses++;
            curVerseText = "";
          } else if (blk.type !== "d") curVerseText = (curVerseText ?? "") + inlineText(x);
        }
        if (blk.type !== "d") {
          flush(`${b.id} ${c.n}:${expect - 1}`);
          curVerseText = null;
        }
      }
    });
  });
  return { errors, verses, chapters };
}
