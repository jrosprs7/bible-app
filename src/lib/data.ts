import type { BookText, TranslationIndex } from "./model";

const BASE = `${import.meta.env.BASE_URL}data/kjv/`;

let indexPromise: Promise<TranslationIndex> | null = null;
const books = new Map<string, Promise<BookText>>();

const getJson = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
};

export const loadIndex = () => (indexPromise ??= getJson<TranslationIndex>(`${BASE}index.json`));

export function loadBook(id: string): Promise<BookText> {
  let p = books.get(id);
  if (!p) {
    p = getJson<BookText>(`${BASE}${id}.json`);
    p.catch(() => books.delete(id));
    books.set(id, p);
  }
  return p;
}
