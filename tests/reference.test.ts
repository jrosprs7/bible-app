import { describe, expect, it } from "vitest";
import { formatRef, parseReference } from "../src/lib/reference";

const chapters = (b: string) => (["JUD", "OBA", "PHM", "2JN", "3JN"].includes(b) ? 1 : 50);

describe("parseReference", () => {
  it.each([
    ["John 3:16", { book: "JHN", chapter: 3, verse: 16 }],
    ["jn 3.16-18", { book: "JHN", chapter: 3, verse: 16, verseEnd: 18 }],
    ["1 Cor 13", { book: "1CO", chapter: 13 }],
    ["1cor 13:4", { book: "1CO", chapter: 13, verse: 4 }],
    ["Psalm 23", { book: "PSA", chapter: 23 }],
    ["ps 119:105", { book: "PSA", chapter: 119, verse: 105 }],
    ["Song of Solomon 2", { book: "SNG", chapter: 2 }],
    ["Gen", { book: "GEN", chapter: 1 }],
    ["genes 3", { book: "GEN", chapter: 3 }],
    ["Jude 5", { book: "JUD", chapter: 1, verse: 5 }],
    ["III John 2", { book: "3JN", chapter: 1, verse: 2 }],
    ["Rev. 21:1", { book: "REV", chapter: 21, verse: 1 }],
  ])("%s", (input, want) => expect(parseReference(input, chapters)).toEqual(want));

  it("rejects non-references", () => {
    expect(parseReference("love one another")).toBeNull();
    expect(parseReference("j 3")).toBeNull(); // ambiguous
  });
});

describe("formatRef", () => {
  it("collapses ranges", () => expect(formatRef("John", 3, [18, 16, 17, 20])).toBe("John 3:16–18, 20"));
});
