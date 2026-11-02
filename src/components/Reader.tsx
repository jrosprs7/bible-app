import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { BookText } from "../lib/model";
import { ChapterView } from "./Passage";

export interface ScrollTarget {
  book: string;
  chapter: number;
  verse?: number;
  seq: number;
}

interface Props {
  book: BookText;
  target: ScrollTarget;
  selected: ReadonlySet<string>;
  onToggleVerse: (id: string) => void;
  onVisibleChapter: (chapter: number) => void;
}

const EMPTY: ReadonlySet<string> = new Set();

/** The whole book as one continuous scroll; the top bar follows the chapter in view. */
export function Reader({ book, target, selected, onToggleVerse, onVisibleChapter }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const lastReported = useRef(0);

  // Per-chapter selection sets so unaffected chapters skip re-rendering.
  const selByChapter = useMemo(() => {
    const m = new Map<number, Set<string>>();
    for (const id of selected) {
      const c = Number(id.split(":")[0]);
      if (!m.has(c)) m.set(c, new Set());
      m.get(c)!.add(id);
    }
    return m;
  }, [selected]);

  useLayoutEffect(() => {
    if (target.book !== book.id) return;
    const el =
      (target.verse && document.getElementById(`v${target.chapter}-${target.verse}`)) ||
      document.getElementById(`c${target.chapter}`);
    if (!el) return;
    if (target.chapter === 1 && !target.verse) window.scrollTo(0, 0);
    else el.scrollIntoView({ block: target.verse ? "center" : "start" });
    lastReported.current = target.chapter;
    if (target.verse) {
      el.classList.add("flash");
      const t = setTimeout(() => el.classList.remove("flash"), 1600);
      return () => clearTimeout(t);
    }
  }, [book, target]);

  // Track which chapter is at the top of the viewport.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const sections = root.current?.querySelectorAll<HTMLElement>("section.chapter");
        if (!sections) return;
        let current = 1;
        for (const s of sections) {
          if (s.getBoundingClientRect().top <= 96) current = Number(s.dataset.chapter);
          else break;
        }
        if (current !== lastReported.current) {
          lastReported.current = current;
          onVisibleChapter(current);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [onVisibleChapter]);

  const onClick = (e: React.MouseEvent) => {
    if (window.getSelection()?.toString()) return; // user is selecting text, not tapping a verse
    const v = (e.target as HTMLElement).closest<HTMLElement>(".verse");
    if (v?.dataset.v) onToggleVerse(v.dataset.v);
  };

  return (
    <div className="reader" ref={root} onClick={onClick}>
      <header className="book-head">
        <h1>{book.title || book.name}</h1>
      </header>
      {book.chapters.map((c) => (
        <ChapterView key={c.n} book={book} chapter={c} selected={selByChapter.get(c.n) ?? EMPTY} />
      ))}
    </div>
  );
}
