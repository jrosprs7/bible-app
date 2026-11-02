import { useCallback, useEffect, useMemo, useState } from "react";
import { Picker } from "./components/Picker";
import { Reader, type ScrollTarget } from "./components/Reader";
import { SettingsPanel } from "./components/SettingsPanel";
import { selectionText } from "./lib/copy";
import { loadBook, loadIndex } from "./lib/data";
import type { BookText, TranslationIndex } from "./lib/model";
import type { Ref } from "./lib/reference";
import { useSettings } from "./lib/settings";
import { readJson, writeJson } from "./lib/storage";

const LAST_KEY = "bible.last.v1";

function parseHash(): Ref | null {
  const m = location.hash.match(/^#\/([1-3A-Z]{3})\/(\d+)(?:\/(\d+))?$/);
  return m ? { book: m[1], chapter: Number(m[2]), ...(m[3] ? { verse: Number(m[3]) } : {}) } : null;
}
const toHash = (r: Ref) => `#/${r.book}/${r.chapter}${r.verse ? `/${r.verse}` : ""}`;

export default function App() {
  const [settings, update] = useSettings();
  const [index, setIndex] = useState<TranslationIndex | null>(null);
  const [book, setBook] = useState<BookText | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<ScrollTarget>(() => ({
    ...(parseHash() ?? readJson<Ref>(LAST_KEY) ?? { book: "GEN", chapter: 1 }),
    seq: 0,
  }));
  const [chapter, setChapter] = useState(target.chapter);
  const [panel, setPanel] = useState<"picker" | "settings" | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadIndex().then(setIndex, (e) => setError(String(e)));
  }, []);

  const meta = index?.books.find((b) => b.id === target.book);

  // Validate the requested location against the index; fall back to Genesis 1.
  const apply = useCallback(
    (r: Ref) => {
      if (index) {
        const m = index.books.find((b) => b.id === r.book);
        if (!m) r = { book: "GEN", chapter: 1 };
        else if (r.chapter < 1 || r.chapter > m.verseCounts.length) r = { book: r.book, chapter: 1 };
      }
      setTarget((t) => ({ ...r, seq: t.seq + 1 }));
      setChapter(r.chapter);
      setPanel(null);
    },
    [index],
  );

  const navigate = useCallback(
    (r: Ref) => {
      const h = toHash(r);
      if (location.hash === h) apply(r);
      else location.hash = h; // pushes history; hashchange applies it
    },
    [apply],
  );

  useEffect(() => {
    const onHash = () => {
      const r = parseHash();
      if (r) apply(r);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [apply]);

  // Re-validate the initial target once the index arrives.
  useEffect(() => {
    if (index) apply({ book: target.book, chapter: target.chapter, verse: target.verse });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    if (book?.id === target.book) return;
    let live = true;
    loadBook(target.book).then(
      (b) => {
        if (!live) return;
        setBook(b);
        setSelected(new Set());
      },
      (e) => live && setError(String(e)),
    );
    return () => {
      live = false;
    };
  }, [target.book, book?.id]);

  // Keep the URL and "last read" in step with the chapter in view (without adding history entries).
  const onVisibleChapter = useCallback(
    (c: number) => {
      setChapter(c);
      if (!book) return;
      history.replaceState(null, "", toHash({ book: book.id, chapter: c }));
      writeJson(LAST_KEY, { book: book.id, chapter: c });
    },
    [book],
  );
  useEffect(() => {
    if (book) writeJson(LAST_KEY, { book: book.id, chapter });
  }, [book, chapter]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!index || !book) return;
      const bi = index.books.findIndex((b) => b.id === book.id);
      const count = index.books[bi].verseCounts.length;
      const c = chapter + dir;
      if (c >= 1 && c <= count) return navigate({ book: book.id, chapter: c });
      const nb = index.books[bi + dir];
      if (nb) navigate({ book: nb.id, chapter: dir === 1 ? 1 : nb.verseCounts.length });
    },
    [index, book, chapter, navigate],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panel || e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest("input,textarea")) return;
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "/" || e.key === "g") {
        e.preventDefault();
        setPanel("picker");
      } else if (e.key === "Escape") setSelected(new Set());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, step]);

  const toggleVerse = useCallback((id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  const sel = useMemo(() => (book && selected.size ? selectionText(book, selected, settings.layout) : null), [book, selected, settings.layout]);

  const copy = async () => {
    if (!sel) return;
    try {
      await navigator.clipboard.writeText(sel.text);
      setToast(`Copied ${sel.ref}`);
    } catch {
      setToast("Couldn't copy — select the text instead");
    }
    setSelected(new Set());
    setTimeout(() => setToast(null), 2200);
  };

  const bookIndex = index && book ? index.books.findIndex((b) => b.id === book.id) : -1;
  const nextBook = bookIndex >= 0 ? index!.books[bookIndex + 1] : undefined;
  const prevBook = bookIndex > 0 ? index!.books[bookIndex - 1] : undefined;

  const readerClass = [
    "page",
    `layout-${settings.layout}`,
    settings.verseNumbers ? "" : "no-vn",
    settings.redLetter ? "red-letter" : "",
    settings.italics ? "" : "no-italics",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <nav className="topbar" aria-label="Navigation">
        <button className="loc" onClick={() => setPanel("picker")} aria-label="Choose book and chapter">
          {book ? `${book.id === "PSA" ? "Psalm" : book.name} ${chapter}` : (meta?.name ?? "…")}
          <span className="caret" aria-hidden="true">
            ▾
          </span>
        </button>
        <span className="spacer" />
        <button className="icon" onClick={() => step(-1)} aria-label="Previous chapter" disabled={!book}>
          ‹
        </button>
        <button className="icon" onClick={() => step(1)} aria-label="Next chapter" disabled={!book}>
          ›
        </button>
        <button className="icon aa" onClick={() => setPanel("settings")} aria-label="Reading settings">
          Aa
        </button>
      </nav>

      <main className={readerClass}>
        {error && <p className="error">Couldn't load the text: {error}</p>}
        {book && book.id === target.book ? (
          <>
            {prevBook && (
              <button className="book-nav prev" onClick={() => navigate({ book: prevBook.id, chapter: prevBook.verseCounts.length })}>
                ‹ {prevBook.name}
              </button>
            )}
            <Reader book={book} target={target} selected={selected} onToggleVerse={toggleVerse} onVisibleChapter={onVisibleChapter} />
            {nextBook && (
              <button className="book-nav next" onClick={() => navigate({ book: nextBook.id, chapter: 1 })}>
                Continue to {nextBook.name} ›
              </button>
            )}
            <footer className="colophon">King James Version (1769), public domain. Paragraphing adapted from the World English Bible.</footer>
          </>
        ) : (
          !error && <p className="loading">Loading…</p>
        )}
      </main>

      {sel && (
        <div className="selbar" role="region" aria-label="Selected verses">
          <span className="selref">{sel.ref}</span>
          <button onClick={copy}>Copy</button>
          <button className="link" onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      {panel === "picker" && index && <Picker books={index.books} currentBook={target.book} onGo={navigate} onClose={() => setPanel(null)} />}
      {panel === "settings" && <SettingsPanel settings={settings} update={update} onClose={() => setPanel(null)} />}
    </>
  );
}
