/** Checks against the generated data in public/data/kjv (run `npm run data` first). */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { type BookText, type Inline, inlineText, isVerseMark, type TranslationIndex } from "../src/lib/model";
import { validateBooks } from "../pipeline/validate";

const dir = "public/data/kjv";
const index: TranslationIndex = JSON.parse(readFileSync(`${dir}/index.json`, "utf8"));
const books: BookText[] = index.books.map((m) => JSON.parse(readFileSync(`${dir}/${m.id}.json`, "utf8")));
const byId = new Map(books.map((b) => [b.id, b]));

/** Plain text of one verse. */
function verse(book: string, c: number, v: number): string {
  let on = false;
  let out = "";
  for (const blk of byId.get(book)!.chapters[c - 1].blocks) {
    for (const x of blk.content as Inline[]) {
      if (isVerseMark(x)) on = x.v === v;
      else if (on && blk.type !== "d") out += inlineText(x);
    }
  }
  return out;
}

describe("KJV data", () => {
  it("is structurally valid: 66 books, 1,189 chapters, 31,102 verses", () => {
    const r = validateBooks(books);
    expect(r.errors).toEqual([]);
    expect(r.chapters).toBe(1189);
    expect(r.verses).toBe(31102);
    expect(index.books.reduce((n, b) => n + b.verseCounts.length, 0)).toBe(1189);
  });

  it("has the expected text in well-known verses", () => {
    expect(verse("GEN", 1, 1)).toBe("In the beginning God created the heaven and the earth.");
    expect(verse("JHN", 11, 35)).toBe("Jesus wept.");
    expect(verse("JHN", 3, 16)).toMatch(/^For God so loved the world, that he gave his only begotten Son/);
    expect(verse("REV", 22, 21)).toBe("The grace of our Lord Jesus Christ be with you all. Amen.");
    expect(index.books.find((b) => b.id === "3JN")!.verseCounts).toEqual([14]);
  });

  it("keeps italics, words of Jesus, and Psalm titles", () => {
    const gen1 = byId.get("GEN")!.chapters[0].blocks.flatMap((b) => b.content);
    expect(gen1).toContainEqual({ t: "was", add: 1 });
    const jhn3 = byId.get("JHN")!.chapters[2].blocks.flatMap((b) => b.content);
    expect(jhn3.some((x) => typeof x === "object" && "wj" in x)).toBe(true);
    const ps23 = byId.get("PSA")!.chapters[22].blocks;
    expect(ps23[0]).toEqual({ type: "d", content: ["A Psalm of David."] });
    expect(ps23.slice(1).every((b) => b.type === "q")).toBe(true);
  });

  it("is paragraphed throughout, including the epistles", () => {
    for (const id of ["ROM", "1CO", "HEB", "REV", "GEN", "MAT"]) {
      const b = byId.get(id)!;
      const verses = b.chapters.reduce((n, c) => n + c.blocks.flatMap((x) => x.content).filter(isVerseMark).length, 0);
      const paras = b.chapters.reduce((n, c) => n + c.blocks.filter((x) => x.type === "p" || x.type === "m").length, 0);
      expect(verses / paras, id).toBeLessThan(9);
    }
  });

  it("never starts a paragraph in the middle of a KJV sentence", () => {
    for (const b of books)
      for (const c of b.chapters) {
        let prev = "";
        for (const blk of c.blocks) {
          if ((blk.type === "p" || blk.type === "m") && prev) expect(prev, `${b.id} ${c.n}`).toMatch(/[.?!:;][’”'")\]]*$/u);
          if (blk.type !== "d") prev = blk.content.map(inlineText).join("");
        }
      }
  });

  it("has no whitespace inside the edges of italic runs", () => {
    for (const b of books)
      for (const c of b.chapters)
        for (const blk of c.blocks)
          for (const x of blk.content)
            if (typeof x === "object" && "add" in x) expect(x.t, `${b.id} ${c.n}`).toBe(x.t.trim());
  });
});
