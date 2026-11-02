/** Canonical 66-book Protestant order. `osis` and `usfm` are the IDs used by the source files. */
export interface BookDef {
  usfm: string;
  osis: string;
  name: string;
  testament: "OT" | "NT";
  /** Extra names/abbreviations accepted when parsing references (lowercase, no dots). */
  abbr: string[];
}

const B = (usfm: string, osis: string, name: string, testament: "OT" | "NT", abbr: string[] = []): BookDef => ({
  usfm,
  osis,
  name,
  testament,
  abbr,
});

export const BOOKS: BookDef[] = [
  B("GEN", "Gen", "Genesis", "OT", ["gen", "ge", "gn"]),
  B("EXO", "Exod", "Exodus", "OT", ["exod", "exo", "ex"]),
  B("LEV", "Lev", "Leviticus", "OT", ["lev", "le", "lv"]),
  B("NUM", "Num", "Numbers", "OT", ["num", "nu", "nm", "nb"]),
  B("DEU", "Deut", "Deuteronomy", "OT", ["deut", "deu", "dt"]),
  B("JOS", "Josh", "Joshua", "OT", ["josh", "jos", "jsh"]),
  B("JDG", "Judg", "Judges", "OT", ["judg", "jdg", "jg", "jdgs"]),
  B("RUT", "Ruth", "Ruth", "OT", ["ruth", "rth", "ru"]),
  B("1SA", "1Sam", "1 Samuel", "OT", ["1sam", "1sa", "1sm", "1 sam", "i samuel", "first samuel"]),
  B("2SA", "2Sam", "2 Samuel", "OT", ["2sam", "2sa", "2sm", "2 sam", "ii samuel", "second samuel"]),
  B("1KI", "1Kgs", "1 Kings", "OT", ["1kgs", "1ki", "1kg", "1 kgs", "i kings", "first kings"]),
  B("2KI", "2Kgs", "2 Kings", "OT", ["2kgs", "2ki", "2kg", "2 kgs", "ii kings", "second kings"]),
  B("1CH", "1Chr", "1 Chronicles", "OT", ["1chr", "1ch", "1 chron", "1chron", "i chronicles"]),
  B("2CH", "2Chr", "2 Chronicles", "OT", ["2chr", "2ch", "2 chron", "2chron", "ii chronicles"]),
  B("EZR", "Ezra", "Ezra", "OT", ["ezra", "ezr"]),
  B("NEH", "Neh", "Nehemiah", "OT", ["neh", "ne"]),
  B("EST", "Esth", "Esther", "OT", ["esth", "est", "es"]),
  B("JOB", "Job", "Job", "OT", ["job", "jb"]),
  B("PSA", "Ps", "Psalms", "OT", ["psalm", "ps", "psa", "pss", "psm"]),
  B("PRO", "Prov", "Proverbs", "OT", ["prov", "pro", "pr", "prv"]),
  B("ECC", "Eccl", "Ecclesiastes", "OT", ["eccl", "ecc", "ec", "qoh"]),
  B("SNG", "Song", "Song of Solomon", "OT", ["song", "song of songs", "sos", "so", "canticles"]),
  B("ISA", "Isa", "Isaiah", "OT", ["isa", "is"]),
  B("JER", "Jer", "Jeremiah", "OT", ["jer", "je", "jr"]),
  B("LAM", "Lam", "Lamentations", "OT", ["lam", "la"]),
  B("EZK", "Ezek", "Ezekiel", "OT", ["ezek", "eze", "ezk"]),
  B("DAN", "Dan", "Daniel", "OT", ["dan", "da", "dn"]),
  B("HOS", "Hos", "Hosea", "OT", ["hos", "ho"]),
  B("JOL", "Joel", "Joel", "OT", ["joel", "jl"]),
  B("AMO", "Amos", "Amos", "OT", ["amos", "am"]),
  B("OBA", "Obad", "Obadiah", "OT", ["obad", "ob"]),
  B("JON", "Jonah", "Jonah", "OT", ["jonah", "jnh", "jon"]),
  B("MIC", "Mic", "Micah", "OT", ["mic", "mc"]),
  B("NAM", "Nah", "Nahum", "OT", ["nah", "na"]),
  B("HAB", "Hab", "Habakkuk", "OT", ["hab", "hb"]),
  B("ZEP", "Zeph", "Zephaniah", "OT", ["zeph", "zep", "zp"]),
  B("HAG", "Hag", "Haggai", "OT", ["hag", "hg"]),
  B("ZEC", "Zech", "Zechariah", "OT", ["zech", "zec", "zc"]),
  B("MAL", "Mal", "Malachi", "OT", ["mal", "ml"]),
  B("MAT", "Matt", "Matthew", "NT", ["matt", "mat", "mt"]),
  B("MRK", "Mark", "Mark", "NT", ["mark", "mrk", "mar", "mk", "mr"]),
  B("LUK", "Luke", "Luke", "NT", ["luke", "luk", "lk"]),
  B("JHN", "John", "John", "NT", ["john", "jhn", "jn", "joh"]),
  B("ACT", "Acts", "Acts", "NT", ["acts", "act", "ac"]),
  B("ROM", "Rom", "Romans", "NT", ["rom", "ro", "rm"]),
  B("1CO", "1Cor", "1 Corinthians", "NT", ["1cor", "1co", "1 cor", "i corinthians"]),
  B("2CO", "2Cor", "2 Corinthians", "NT", ["2cor", "2co", "2 cor", "ii corinthians"]),
  B("GAL", "Gal", "Galatians", "NT", ["gal", "ga"]),
  B("EPH", "Eph", "Ephesians", "NT", ["eph", "ephes"]),
  B("PHP", "Phil", "Philippians", "NT", ["phil", "php", "pp"]),
  B("COL", "Col", "Colossians", "NT", ["col", "co"]),
  B("1TH", "1Thess", "1 Thessalonians", "NT", ["1thess", "1th", "1 thess", "i thessalonians"]),
  B("2TH", "2Thess", "2 Thessalonians", "NT", ["2thess", "2th", "2 thess", "ii thessalonians"]),
  B("1TI", "1Tim", "1 Timothy", "NT", ["1tim", "1ti", "1 tim", "i timothy"]),
  B("2TI", "2Tim", "2 Timothy", "NT", ["2tim", "2ti", "2 tim", "ii timothy"]),
  B("TIT", "Titus", "Titus", "NT", ["titus", "tit"]),
  B("PHM", "Phlm", "Philemon", "NT", ["phlm", "phm", "philem"]),
  B("HEB", "Heb", "Hebrews", "NT", ["heb"]),
  B("JAS", "Jas", "James", "NT", ["jas", "jm", "jam"]),
  B("1PE", "1Pet", "1 Peter", "NT", ["1pet", "1pe", "1pt", "1 pet", "i peter"]),
  B("2PE", "2Pet", "2 Peter", "NT", ["2pet", "2pe", "2pt", "2 pet", "ii peter"]),
  B("1JN", "1John", "1 John", "NT", ["1john", "1jn", "1jo", "1 jn", "i john"]),
  B("2JN", "2John", "2 John", "NT", ["2john", "2jn", "2jo", "2 jn", "ii john"]),
  B("3JN", "3John", "3 John", "NT", ["3john", "3jn", "3jo", "3 jn", "iii john"]),
  B("JUD", "Jude", "Jude", "NT", ["jude", "jud", "jd"]),
  B("REV", "Rev", "Revelation", "NT", ["rev", "re", "revelations", "apocalypse"]),
];

export const BOOK_BY_USFM = new Map(BOOKS.map((b) => [b.usfm, b]));
export const BOOK_BY_OSIS = new Map(BOOKS.map((b) => [b.osis, b]));
