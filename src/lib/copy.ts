import { type BookText, inlineText, isVerseMark } from "./model";
import { formatRef } from "./reference";

/** Plain-text of selected verses ("c:v" ids) with a reference line, for the clipboard. */
export function selectionText(book: BookText, ids: Iterable<string>, layout: "paragraph" | "verse"): { text: string; ref: string } {
  const byChapter = new Map<number, Set<number>>();
  for (const id of ids) {
    const [c, v] = id.split(":").map(Number);
    if (!byChapter.has(c)) byChapter.set(c, new Set());
    byChapter.get(c)!.add(v);
  }
  const chapters = [...byChapter.keys()].sort((a, b) => a - b);
  const pieces: string[] = [];
  const refs: string[] = [];
  for (const c of chapters) {
    const want = byChapter.get(c)!;
    const texts = new Map<number, string>();
    let cur = 0;
    for (const blk of book.chapters[c - 1].blocks) {
      if (blk.type === "d") continue;
      for (const x of blk.content) {
        if (isVerseMark(x)) cur = x.v;
        else if (want.has(cur)) texts.set(cur, (texts.get(cur) ?? "") + inlineText(x));
      }
    }
    const vs = [...want].sort((a, b) => a - b);
    pieces.push(layout === "verse" || vs.length === 1 ? vs.map((v) => (vs.length > 1 ? `${v} ` : "") + texts.get(v)).join("\n") : vs.map((v) => texts.get(v)).join(" "));
    refs.push(formatRef(book.name, c, vs));
  }
  const ref = refs.length > 1 ? refs.join("; ") : refs[0] ?? "";
  return { text: `${pieces.join("\n")}\n— ${ref} (KJV)`, ref };
}
