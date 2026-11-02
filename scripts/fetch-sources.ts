/** Download the pinned source files into ./sources and verify their SHA-256. */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SOURCES, SOURCES_DIR } from "../pipeline/sources";

const sha256 = (buf: Buffer) => createHash("sha256").update(buf).digest("hex");

mkdirSync(SOURCES_DIR, { recursive: true });
for (const src of Object.values(SOURCES)) {
  const path = join(SOURCES_DIR, src.file);
  if (existsSync(path) && sha256(readFileSync(path)) === src.sha256) {
    console.log(`✓ ${src.file} (cached)`);
    continue;
  }
  console.log(`↓ ${src.url}`);
  const res = await fetch(src.url);
  if (!res.ok) throw new Error(`${src.url}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const got = sha256(buf);
  if (got !== src.sha256) throw new Error(`${src.file}: sha256 mismatch (got ${got})`);
  writeFileSync(path, buf);
  console.log(`✓ ${src.file}`);
}
