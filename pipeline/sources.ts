/** Pinned source files. Both are public domain; mirrored from eBible.org in seven1m/open-bibles. */
const COMMIT = "579eaba256c674beb652991bd04ad941af829532";
const base = `https://raw.githubusercontent.com/seven1m/open-bibles/${COMMIT}`;

export const SOURCES = {
  kjv: {
    name: "King James Version (1769 standard text), eBible.org OSIS",
    file: "eng-kjv.osis.xml",
    url: `${base}/eng-kjv.osis.xml`,
    sha256: "eeeae647fc28360ce47f9c0d5cc3b397b7fdd9913fe53dc9f44eb6deee50e253",
    role: "text",
  },
  web: {
    name: "World English Bible, eBible.org USFX",
    file: "eng-web.usfx.xml",
    url: `${base}/eng-web.usfx.xml`,
    sha256: "5ffa2626f170a109a4a96afc90775c06f0821cb4ba81ed34e63663e085708d68",
    role: "paragraph and poetry layout only (no WEB text is used)",
  },
} as const;

export const SOURCES_DIR = "sources";
