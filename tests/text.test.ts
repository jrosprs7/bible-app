import { describe, expect, it } from "vitest";
import { endsSentence, normalizeSegments } from "../pipeline/text";

describe("normalizeSegments", () => {
  it("collapses whitespace across segment boundaries and trims", () => {
    expect(normalizeSegments([{ t: "  And darkness\n" }, { t: "was\n", add: 1 }, { t: " upon the deep.\n" }])).toEqual([
      { t: "And darkness " },
      { t: "was", add: 1 },
      { t: " upon the deep." },
    ]);
  });
  it("moves spaces out of italic runs", () => {
    expect(normalizeSegments([{ t: "time " }, { t: "are ", add: 1 }, { t: "not" }])).toEqual([
      { t: "time " },
      { t: "are", add: 1 },
      { t: " not" },
    ]);
  });
  it("merges adjacent runs with identical style", () => {
    expect(normalizeSegments([{ t: "Verily, ", wj: 1 }, { t: "verily", wj: 1 }])).toEqual([{ t: "Verily, verily", wj: 1 }]);
  });
});

describe("endsSentence", () => {
  it("accepts terminal punctuation, ignoring closing quotes", () => {
    expect(endsSentence("and it was so.")).toBe(true);
    expect(endsSentence("children of God:")).toBe(true);
    expect(endsSentence("saith the LORD.’")).toBe(true);
    expect(endsSentence("and the earth,")).toBe(false);
    expect(endsSentence("which")).toBe(false);
  });
});
