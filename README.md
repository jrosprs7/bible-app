# Bible

A Bible reader that shows the text **in paragraphs, like a printed Bible**, rather than one verse per line. It starts with the public-domain **King James Version**.

It's a web app (an installable PWA that works offline), written in TypeScript and React and built with Vite.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pipeline, data and reference-parser tests
npm run build      # static site in dist/ (works from any sub-path)
```

The generated Bible data is committed in `public/data/kjv/`, so you don't need to download anything to run the app. To rebuild the data from the sources:

```bash
npm run data       # downloads the pinned sources into sources/, checks their SHA-256, rebuilds public/data/kjv/
```

## Windows app

The same web code is wrapped as a native Windows app with [Tauri](https://tauri.app) (`src-tauri/`).

- **Download:** every push runs the **Windows app** workflow (Actions tab). Open the latest run and download the **Bible-Windows-installer** artifact. It contains a `…-setup.exe` and a `.msi`. The installer isn't code-signed yet, so Windows SmartScreen will say "Windows protected your PC". Click **More info → Run anyway**.
- **Build it yourself on Windows:** install [Rust](https://rustup.rs) and Node 20+, then run `npm install` and `npm run desktop:build`. Use `npm run desktop:dev` for a live-reloading window.

## How the text is laid out

Most Bible software stores `book → chapter → verse` and prints each verse on its own line. Here, the text is stored as **blocks**, and verse numbers sit inside the running text as markers:

```jsonc
// public/data/kjv/GEN.json  (types in src/lib/model.ts)
{ "type": "p", "content": [ {"v": 1}, "In the beginning God created…", {"v": 2}, "And the earth…",
                            {"t": "was", "add": 1}, " upon the face of the deep." ] }
```

| Block | Meaning | Rendered as |
|---|---|---|
| `p` | prose paragraph | first-line indent, no gap between paragraphs |
| `m` | prose resuming after poetry | no indent |
| `q` | poetry line (one verse) | hanging indent; `stanza` adds a gap |
| `d` | Psalm title / Ps 119 acrostic letter | centred italic |

Inline runs: plain strings; `add` marks the translators' supplied words (the KJV's italics); `wj` marks the words of Jesus. A verse marker with `k: 1` means the KJV itself has a ¶ there. That's kept for a possible "1611 paragraphing" option later.

Every block boundary falls on a verse boundary. So each verse sits inside exactly one block, and the reader can wrap it in a single element for tapping, highlighting and copying.

### Where the paragraphs come from

The KJV's own paragraph marks (¶) are fine in the Old Testament but **stop around Acts 20**. After that, the source has roughly one paragraph per chapter, and Job and Proverbs are the same. So:

- **Text** comes from eBible.org's KJV (1769 standard text), in OSIS format, with italics, the words of Jesus and Psalm titles.
- **Layout** (where paragraphs, poetry lines and stanzas break, at the verse level) comes from eBible.org's World English Bible. No WEB wording is used.
- A WEB paragraph break is only used if the KJV verse before it ends a sentence (`. ? ! : ;`). This skips 10 of 5,740 breaks, so a paragraph never starts in the middle of a KJV sentence.
- Every chapter starts a new block, as in printed Bibles.

Both sources are pinned to a commit of [seven1m/open-bibles](https://github.com/seven1m/open-bibles) and checked by SHA-256 (`pipeline/sources.ts`).

### Checks (`npm test`)

- 66 books, 1,189 chapters, **31,102 verses**, each present once and in order, none empty, with no stray whitespace
- Spot checks of known verses, italics, words of Jesus, and Psalm titles
- Paragraph density in the Epistles and Revelation (fewer than 9 verses per paragraph on average)
- No paragraph starts mid-sentence; no spaces at the edges of italic runs
- Reference parser: `John 3:16`, `jn 3.16-18`, `1 Cor 13`, `Ps 119:105`, `Jude 5`, `III John 2`, …

## Features so far

- Continuous scroll through a whole book; the top bar and URL (`#/JHN/3/16`) follow the chapter in view; the last place read is remembered
- Large chapter numbers at the start of each chapter, small raised verse numbers, small caps for LORD and GOD, italic supplied words, Psalm headings and titles, poetry layout
- Book and chapter picker, plus a "Go to" box that takes typed references
- Previous/next chapter (buttons, ← → keys), continuing into the next book; browser back and forward work
- Tap verses to select them → **Copy** with the reference (e.g. "— John 3:16–17 (KJV)")
- Settings: Auto/Light/Sepia/Dark themes, text size, **Paragraphs / Verse by verse**, verse numbers, italics, red letters
- Works offline (the whole Bible is precached, about 1.5 MB gzipped)

## Roadmap

1. ~~Data pipeline and checks~~
2. ~~Reader core (paragraph layout)~~
3. ~~Navigation~~ — remaining: continuous scroll *across* books
4. Verse interaction: ~~select and copy~~ — next: highlights, bookmarks and notes (stored locally)
5. Full-text search (client-side index)
6. Later: reading plans, cross-references (Treasury of Scripture Knowledge, public domain), Strong's numbers, other translations side by side

## Licensing note

The KJV is public domain everywhere except the United Kingdom, where it's under perpetual Crown copyright (letters patent). The WEB is public domain.
