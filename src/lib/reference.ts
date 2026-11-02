import { BOOKS } from "./books";

export interface Ref {
  book: string; // USFM
  chapter: number;
  verse?: number;
  verseEnd?: number;
}

const norm = (s: string) => s.toLowerCase().replace(/([a-z])\./g, "$1").replace(/\s+/g, " ").trim();

/** name/abbr -> USFM, with "1 john" / "1john" / "i john" forms. */
const LOOKUP = new Map<string, string>();
for (const b of BOOKS) {
  for (const n of [b.name, b.usfm, b.osis, ...b.abbr]) {
    const k = norm(n);
    LOOKUP.set(k, b.usfm);
    LOOKUP.set(k.replace(/ /g, ""), b.usfm);
  }
}

function findBook(name: string): string | null {
  const k = norm(name);
  const direct = LOOKUP.get(k) ?? LOOKUP.get(k.replace(/ /g, ""));
  if (direct) return direct;
  // unique prefix of a full book name ("genes", "philipp", "1 thes")
  const compact = k.replace(/ /g, "");
  const hits = BOOKS.filter((b) => norm(b.name).replace(/ /g, "").startsWith(compact));
  return compact.length >= 2 && hits.length === 1 ? hits[0].usfm : null;
}

/**
 * Parse "John 3:16", "jn 3.16-18", "1 Cor 13", "Psalm 23", "Jude 5" (single-chapter books).
 * Returns null if it isn't a reference.
 */
export function parseReference(input: string, chapterCount?: (usfm: string) => number): Ref | null {
  const m = norm(input).match(/^((?:[123]|i{1,3})?\s?[a-z][a-z ]*?)\s*(\d+)?(?:\s*[:.]\s*(\d+)(?:\s*[-–]\s*(\d+))?)?$/);
  if (!m) return null;
  const book = findBook(m[1]);
  if (!book) return null;
  const a = m[2] ? Number(m[2]) : 1;
  // Single-chapter books: "Jude 5" means verse 5.
  if (m[2] && !m[3] && chapterCount?.(book) === 1) return { book, chapter: 1, verse: a };
  return {
    book,
    chapter: a,
    ...(m[3] ? { verse: Number(m[3]) } : {}),
    ...(m[4] ? { verseEnd: Number(m[4]) } : {}),
  };
}

export function formatRef(name: string, chapter: number, verses: number[]): string {
  if (!verses.length) return `${name} ${chapter}`;
  const v = [...verses].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < v.length; ) {
    let j = i;
    while (j + 1 < v.length && v[j + 1] === v[j] + 1) j++;
    parts.push(i === j ? `${v[i]}` : `${v[i]}–${v[j]}`);
    i = j + 1;
  }
  return `${name} ${chapter}:${parts.join(", ")}`;
}
