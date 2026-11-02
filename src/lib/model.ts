/**
 * Data model for a paragraph-formatted Bible.
 *
 * Text is stored as *blocks* (paragraphs, poetry lines, Psalm titles) that
 * contain the running text with verse *markers* placed inside it. Verses are
 * not containers: a paragraph holds many verses. Every block boundary falls
 * on a verse boundary, so each verse lives entirely inside one block, which
 * lets the reader wrap a verse in a single element for selection/highlighting.
 */

/** A verse marker. `k` = the KJV itself marks a paragraph (¶) here. */
export interface VerseMark {
  v: number;
  k?: 1;
}

/** Styled text run. `add` = translators' supplied words (KJV italics); `wj` = words of Jesus. */
export interface StyledText {
  t: string;
  add?: 1;
  wj?: 1;
}

/** Plain strings are unstyled text. */
export type Inline = VerseMark | StyledText | string;

export type BlockType =
  | "p" // prose paragraph (first-line indent)
  | "m" // prose continuing after poetry (no indent)
  | "q" // poetry line (one verse per line, hanging indent)
  | "d"; // Psalm title / acrostic heading (canonical, not a verse)

export interface Block {
  type: BlockType;
  /** Poetry only: this line begins a new stanza. */
  stanza?: 1;
  content: Inline[];
}

export interface Chapter {
  n: number;
  blocks: Block[];
}

export interface BookText {
  id: string; // USFM code, e.g. "GEN"
  name: string; // "Genesis"
  title: string; // "The First Book of Moses, called Genesis"
  chapters: Chapter[];
}

export interface BookMeta {
  id: string;
  name: string;
  title: string;
  testament: "OT" | "NT";
  /** verseCounts[i] = number of verses in chapter i+1 */
  verseCounts: number[];
}

export interface TranslationIndex {
  id: string; // "kjv"
  name: string;
  books: BookMeta[];
  sources: { name: string; url: string; sha256: string; role: string }[];
}

export const isVerseMark = (x: Inline): x is VerseMark =>
  typeof x === "object" && "v" in x;
export const isStyled = (x: Inline): x is StyledText =>
  typeof x === "object" && "t" in x;
export const inlineText = (x: Inline): string =>
  typeof x === "string" ? x : isStyled(x) ? x.t : "";
