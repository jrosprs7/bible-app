import type { StyledText } from "../src/lib/model";

/**
 * Normalise whitespace across a run of styled segments. The XML sources wrap
 * lines inside words' surroundings (`darkness\n<transChange>was\n</transChange> upon`),
 * so whitespace must be collapsed *across* segment boundaries, then trimmed at
 * both ends. Adjacent segments with identical styling are merged.
 */
export function normalizeSegments(segs: StyledText[]): StyledText[] {
  const out: StyledText[] = [];
  let lastSpace = true; // treat start as following a space => trims leading
  for (const s of segs) {
    let t = s.t.replace(/\s+/g, " ");
    if (lastSpace && t.startsWith(" ")) t = t.slice(1);
    if (!t) continue;
    lastSpace = t.endsWith(" ");
    const prev = out[out.length - 1];
    if (prev && !!prev.add === !!s.add && !!prev.wj === !!s.wj) prev.t += t;
    else out.push({ t, ...(s.add ? { add: 1 as const } : {}), ...(s.wj ? { wj: 1 as const } : {}) });
  }
  // trim trailing
  while (out.length) {
    const last = out[out.length - 1];
    last.t = last.t.replace(/\s+$/, "");
    if (last.t) break;
    out.pop();
  }
  // Keep spaces outside italic (supplied-word) runs: "_are _not" -> "_are_ not".
  for (let i = 0; i < out.length - 1; i++) {
    const a = out[i];
    if (a.add && a.t.endsWith(" ") && !out[i + 1].add) {
      a.t = a.t.slice(0, -1);
      out[i + 1].t = " " + out[i + 1].t;
    }
    const b = out[i + 1];
    if (b.add && b.t.startsWith(" ") && !a.add) {
      b.t = b.t.slice(1);
      a.t += " ";
    }
  }
  return out.filter((s) => s.t);
}

export const plain = (segs: StyledText[]) => segs.map((s) => s.t).join("");

/** Does this verse text end a sentence-level unit, so a paragraph may start after it? */
export function endsSentence(text: string, punct = ".?!:;"): boolean {
  const t = text.replace(/[\s’”'")\]]+$/u, "");
  return t.length > 0 && punct.includes(t[t.length - 1]);
}
