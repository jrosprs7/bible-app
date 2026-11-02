import { memo, type ReactNode } from "react";
import { type Block, type BookText, type Chapter, type Inline, isVerseMark } from "../lib/model";

/** Render ALL-CAPS words (LORD, GOD, I AM…) as small caps, as printed Bibles do. Copy uses the data, not the DOM. */
function smallCaps(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\b([A-Z])([A-Z]+(?:[’'][A-Z]+)?)\b/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <span key={`${key}-${m.index}`}>
        {m[1]}
        <span className="sc">{m[2]}</span>
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderInline(x: Inline, key: string): ReactNode {
  if (typeof x === "string") return <span key={key}>{smallCaps(x, key)}</span>;
  if (isVerseMark(x)) return null;
  let node: ReactNode = smallCaps(x.t, key);
  if (x.add) node = <i className="add">{node}</i>;
  if (x.wj) node = <span className="wj">{node}</span>;
  return <span key={key}>{node}</span>;
}

interface VerseGroup {
  v: number;
  parts: Inline[];
}

function groupVerses(content: Inline[]): VerseGroup[] {
  const groups: VerseGroup[] = [];
  for (const x of content) {
    if (isVerseMark(x)) groups.push({ v: x.v, parts: [] });
    else groups[groups.length - 1]?.parts.push(x);
  }
  return groups;
}

interface BlockProps {
  block: Block;
  chapter: number;
  dropCap: number | null;
  selected: ReadonlySet<string>;
}

const BlockView = memo(function BlockView({ block, chapter, dropCap, selected }: BlockProps) {
  if (block.type === "d") {
    return <p className="blk d">{block.content.map((x, i) => renderInline(x, `d${i}`))}</p>;
  }
  const verses = groupVerses(block.content);
  const cls = `blk ${block.type}${block.stanza ? " stanza" : ""}${dropCap !== null ? " has-cn" : ""}`;
  return (
    <p className={cls}>
      {dropCap !== null && (
        <span className="cn" aria-hidden="true">
          {dropCap}
        </span>
      )}
      {verses.map((g, i) => {
        const id = `${chapter}:${g.v}`;
        return (
          <span key={g.v}>
            <span className={`verse${selected.has(id) ? " sel" : ""}`} data-v={id} id={`v${chapter}-${g.v}`}>
              <sup className={dropCap !== null && i === 0 ? "vn first" : "vn"}>{g.v}</sup>
              {g.parts.map((x, j) => renderInline(x, `${g.v}-${j}`))}
            </span>
            {i < verses.length - 1 ? " " : null}
          </span>
        );
      })}
    </p>
  );
});

interface ChapterProps {
  book: BookText;
  chapter: Chapter;
  selected: ReadonlySet<string>;
}

export const ChapterView = memo(function ChapterView({ book, chapter, selected }: ChapterProps) {
  const isPsalms = book.id === "PSA";
  const firstText = chapter.blocks.findIndex((b) => b.type !== "d");
  return (
    <section className="chapter" id={`c${chapter.n}`} data-chapter={chapter.n} aria-label={`${book.name} ${chapter.n}`}>
      {isPsalms ? <h2 className="psalm-h">Psalm {chapter.n}</h2> : <h2 className="sr-only">{`${book.name} ${chapter.n}`}</h2>}
      {chapter.blocks.map((b, i) => (
        <BlockView
          key={i}
          block={b}
          chapter={chapter.n}
          dropCap={!isPsalms && i === firstText ? chapter.n : null}
          selected={selected}
        />
      ))}
    </section>
  );
});
