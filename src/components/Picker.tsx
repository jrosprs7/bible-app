import { useEffect, useRef, useState } from "react";
import type { BookMeta } from "../lib/model";
import { parseReference, type Ref } from "../lib/reference";

interface Props {
  books: BookMeta[];
  currentBook: string;
  onGo: (ref: Ref) => void;
  onClose: () => void;
}

export function Picker({ books, currentBook, onGo, onClose }: Props) {
  const [book, setBook] = useState<BookMeta | null>(null);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const chapterCount = (id: string) => books.find((b) => b.id === id)?.verseCounts.length ?? 0;
  const parsed = query.trim() ? parseReference(query, chapterCount) : null;
  const valid = parsed && parsed.chapter <= chapterCount(parsed.book) ? parsed : null;

  useEffect(() => {
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pickBook = (b: BookMeta) => (b.verseCounts.length === 1 ? onGo({ book: b.id, chapter: 1 }) : setBook(b));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet picker" role="dialog" aria-label="Go to passage" onClick={(e) => e.stopPropagation()}>
        <form
          className="goto"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) onGo(valid);
          }}
        >
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Go to… e.g. John 3:16"
            aria-label="Reference"
            enterKeyHint="go"
          />
          <button type="submit" disabled={!valid}>
            Go
          </button>
        </form>
        {query.trim() && (
          <p className="hint">{valid ? `${books.find((b) => b.id === valid.book)!.name} ${valid.chapter}${valid.verse ? `:${valid.verse}` : ""}` : "Not a reference yet"}</p>
        )}
        {book ? (
          <>
            <div className="picker-head">
              <button className="link" onClick={() => setBook(null)}>
                ‹ Books
              </button>
              <h3>{book.name}</h3>
            </div>
            <div className="grid chapters">
              {book.verseCounts.map((_, i) => (
                <button key={i} onClick={() => onGo({ book: book.id, chapter: i + 1 })}>
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        ) : (
          (["OT", "NT"] as const).map((t) => (
            <div key={t}>
              <h3>{t === "OT" ? "Old Testament" : "New Testament"}</h3>
              <div className="grid books">
                {books
                  .filter((b) => b.testament === t)
                  .map((b) => (
                    <button key={b.id} className={b.id === currentBook ? "current" : ""} onClick={() => pickBook(b)}>
                      {b.name}
                    </button>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
