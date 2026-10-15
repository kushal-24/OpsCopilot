// Chunking = splitting a document into small, self-contained pieces so that a
// search returns the one relevant paragraph, not a whole 20-page SOP.
// Too big -> a chunk mixes topics and its vector gets blurry.
// Too small -> a chunk loses the context needed to make sense of it.

export const CHUNK_MAX_CHARS = 800;
export const CHUNK_OVERLAP_CHARS = 100;

export type DocumentChunk = {
  // What gets embedded and later shown to the model.
  text: string;
  // Sticky notes stored next to the vector in Chroma (documentId/datasetId
  // are added at ingestion time in R5).
  documentName: string;
  section: string;
  chunkIndex: number;
};

/**
 * Split a markdown SOP into chunks. Strategy:
 *  1. Split on "## " headings - an SOP section is already one idea.
 *  2. A section that fits in CHUNK_MAX_CHARS becomes exactly one chunk.
 *  3. A longer section is packed line by line into several chunks, each
 *     starting with the tail of the previous one (overlap) so a sentence
 *     cut at a boundary still appears whole in one of the two.
 *  4. Every chunk is prefixed with "<doc title> - <section>". Without it a
 *     chunk like "within 24 hours" has no idea what it is about.
 */
export function chunkDocument(fallbackName: string, markdown: string): DocumentChunk[] {
  const text = markdown.replace(/\r\n/g, "\n").trim();

  const titleMatch = text.match(/^#\s+(.+)$/m);
  const documentName = titleMatch?.[1]?.trim() || fallbackName;

  // Drop the "# Title" line, then cut at each "## " heading.
  const body = titleMatch ? text.replace(titleMatch[0], "") : text;
  const parts = body.split(/^##\s+/m);

  const sections: { heading: string; content: string }[] = [];
  // parts[0] is any text before the first "##" (usually empty).
  if (parts[0]!.trim()) sections.push({ heading: "Overview", content: parts[0]!.trim() });
  for (const part of parts.slice(1)) {
    const newline = part.indexOf("\n");
    const heading = (newline === -1 ? part : part.slice(0, newline)).trim();
    const content = newline === -1 ? "" : part.slice(newline + 1).trim();
    if (content) sections.push({ heading, content });
  }

  const chunks: DocumentChunk[] = [];
  for (const { heading, content } of sections) {
    for (const piece of splitWithOverlap(content)) {
      chunks.push({
        text: `${documentName} - ${heading}\n${piece}`,
        documentName,
        section: heading,
        chunkIndex: chunks.length,
      });
    }
  }
  return chunks;
}

function splitWithOverlap(content: string): string[] {
  if (content.length <= CHUNK_MAX_CHARS) return [content];

  const pieces: string[] = [];
  let current = "";

  // Pack whole lines; a single line longer than the limit is cut by words.
  for (const line of content.split("\n").flatMap(splitLongLine)) {
    if (current && current.length + line.length + 1 > CHUNK_MAX_CHARS) {
      pieces.push(current);
      current = overlapTail(current) + line;
    } else {
      current = current ? `${current}\n${line}` : line;
    }
  }
  if (current.trim()) pieces.push(current);
  return pieces;
}

function splitLongLine(line: string): string[] {
  if (line.length <= CHUNK_MAX_CHARS) return [line];
  const words = line.split(" ");
  const out: string[] = [];
  let cur = "";
  for (const word of words) {
    if (cur && cur.length + word.length + 1 > CHUNK_MAX_CHARS) {
      out.push(cur);
      cur = word;
    } else {
      cur = cur ? `${cur} ${word}` : word;
    }
  }
  if (cur) out.push(cur);
  return out;
}

// Last ~CHUNK_OVERLAP_CHARS of the previous chunk, trimmed to a word start.
function overlapTail(previous: string): string {
  const tail = previous.slice(-CHUNK_OVERLAP_CHARS);
  const firstSpace = tail.indexOf(" ");
  return (firstSpace === -1 ? tail : tail.slice(firstSpace + 1)) + "\n";
}
