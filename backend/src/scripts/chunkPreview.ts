// Phase R4 experiment - prints how every SOP in data/sops gets chunked:
//   npx tsx src/scripts/chunkPreview.ts            (all files, summary)
//   npx tsx src/scripts/chunkPreview.ts refund-approval-sop.md   (full text)
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chunkDocument } from "../services/chunking.service";

const dir = join(process.cwd(), "data", "sops");
const only = process.argv[2];

for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const chunks = chunkDocument(file, readFileSync(join(dir, file), "utf8"));
  const sizes = chunks.map((c) => c.text.length);
  console.log(`\n${file}: ${chunks.length} chunks, sizes ${sizes.join("/")}`);

  for (const c of chunks) {
    if (only === file) console.log(`\n--- #${c.chunkIndex} [${c.section}]\n${c.text}`);
    else console.log(`  #${c.chunkIndex} [${c.section}]`);
  }
}
