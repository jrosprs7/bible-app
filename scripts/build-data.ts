/** Build public/data/kjv/*.json from the pinned sources. Run `npm run data:fetch` first. */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BOOK_BY_USFM } from "../src/lib/books";
import type { BookMeta, BookText, TranslationIndex } from "../src/lib/model";
import { parseKjvOsis } from "../pipeline/kjvOsis";
import { type MergeStats, mergeBook } from "../pipeline/merge";
import { SOURCES, SOURCES_DIR } from "../pipeline/sources";
import { validateBooks } from "../pipeline/validate";
import { parseWebLayout } from "../pipeline/webLayout";

const OUT = "public/data/kjv";
const read = (f: string) => readFileSync(join(SOURCES_DIR, f), "utf8");

const { books: kjvBooks, warnings } = parseKjvOsis(read(SOURCES.kjv.file));
const { layout, midVerseBreaks } = parseWebLayout(read(SOURCES.web.file));

const stats: MergeStats = { verses: 0, missingLayout: [], rejectedBreaks: [], acceptedBreaks: 0 };
const books: BookText[] = kjvBooks.map((b) => mergeBook(b, layout, stats));

const v = validateBooks(books);
if (warnings.length) console.warn(`KJV parser warnings (${warnings.length}):\n  ` + warnings.slice(0, 20).join("\n  "));
console.log(`books=${books.length} chapters=${v.chapters} verses=${v.verses}`);
console.log(`WEB layout: ${layout.size} verses; mid-verse breaks dropped: ${midVerseBreaks}`);
console.log(`paragraph breaks: accepted=${stats.acceptedBreaks} rejected(mid-sentence)=${stats.rejectedBreaks.length}`);
console.log(`verses with no WEB layout: ${stats.missingLayout.length}${stats.missingLayout.length ? " e.g. " + stats.missingLayout.slice(0, 10).join(", ") : ""}`);
if (v.errors.length) {
  console.error(`VALIDATION FAILED (${v.errors.length}):\n  ` + v.errors.slice(0, 40).join("\n  "));
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const metas: BookMeta[] = books.map((b) => {
  writeFileSync(join(OUT, `${b.id}.json`), JSON.stringify(b));
  return {
    id: b.id,
    name: b.name,
    title: b.title,
    testament: BOOK_BY_USFM.get(b.id)!.testament,
    verseCounts: b.chapters.map((c) => c.blocks.flatMap((x) => x.content).filter((i) => typeof i === "object" && "v" in i).length),
  };
});
const index: TranslationIndex = {
  id: "kjv",
  name: "King James Version",
  books: metas,
  sources: Object.values(SOURCES).map((s) => ({ name: s.name, url: s.url, sha256: s.sha256, role: s.role })),
};
writeFileSync(join(OUT, "index.json"), JSON.stringify(index, null, 1));
console.log(`wrote ${OUT}/ (${books.length} books + index.json)`);
