import { prisma } from "../lib/prisma";
import { getCollection } from "../lib/chroma";
import { embedBatch } from "../lib/gemini";
import { SOP_COLLECTION } from "../config/constants";
import { chunkDocument } from "./chunking.service";
import { getCurrentDataset } from "./dataset.service";
import apiError from "../utils/apiError.js";

const ALLOWED_EXTENSIONS = [".md", ".txt"];

/**
 * The whole ingestion pipeline for one SOP file:
 *   text -> chunks -> Gemini vectors -> Chroma, plus a Document row in Postgres.
 *
 * The row is created FIRST with status "processing" so a crash mid-way leaves
 * a visible "failed" document instead of orphaned vectors nobody knows about.
 */
export async function ingestDocument(
  userId: string,
  fileBuffer: Buffer,
  originalFileName: string,
  name?: string,
  datasetIdOverride?: string,
) {
  const dataset = datasetIdOverride
    ? await prisma.dataset.findFirst({ where: { id: datasetIdOverride, userId } })
    : await getCurrentDataset(userId);
  if (!dataset) {
    throw new apiError(400, "Import a dataset first - SOPs are attached to your current dataset");
  }

  const extension = originalFileName.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new apiError(400, "Only .md and .txt SOP files are accepted");
  }

  const text = fileBuffer.toString("utf8");
  if (!text.trim()) throw new apiError(400, "The SOP file is empty");

  const chunks = chunkDocument(originalFileName, text);
  if (chunks.length === 0) throw new apiError(400, "No readable content found in the SOP file");

  const document = await prisma.document.create({
    data: {
      datasetId: dataset.id,
      name: name?.trim() || chunks[0]!.documentName,
      fileName: originalFileName,
      fileType: extension.slice(1),
      status: "processing",
    },
  });

  try {
    const vectors = await embedBatch(chunks.map((c) => c.text), "document");
    const collection = await getCollection(SOP_COLLECTION);

    await collection.upsert({
      // Stable ids: re-running ingestion for a document overwrites, not duplicates.
      ids: chunks.map((c) => `${document.id}:${c.chunkIndex}`),
      documents: chunks.map((c) => c.text),
      embeddings: vectors,
      // These "sticky notes" power filtering (datasetId), cleanup (documentId)
      // and citations (documentName, section) later.
      metadatas: chunks.map((c) => ({
        documentId: document.id,
        datasetId: dataset.id,
        documentName: document.name,
        section: c.section,
        chunkIndex: c.chunkIndex,
      })),
    });

    return await prisma.document.update({
      where: { id: document.id },
      data: { status: "ready", chunkCount: chunks.length },
    });
  } catch (err) {
    // Undo any partial write, then record the failure on the row.
    await deleteChunks({ documentId: document.id }).catch(() => {});
    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: "failed",
        error: err instanceof Error ? err.message.slice(0, 500) : "Ingestion failed",
      },
    });
    throw new apiError(502, "Could not process the SOP file - please try again");
  }
}

/** Documents attached to the user's current dataset, newest first. */
export async function listDocuments(userId: string) {
  const dataset = await getCurrentDataset(userId);
  if (!dataset) return [];

  return prisma.document.findMany({
    where: { datasetId: dataset.id },
    orderBy: { uploadedAt: "desc" },
  });
}

/** Delete the Postgres row AND its Chroma chunks (Postgres can't cascade into Chroma). */
export async function deleteDocument(userId: string, documentId: string) {
  // Ownership check: the document must belong to one of THIS user's datasets.
  const document = await prisma.document.findFirst({
    where: { id: documentId, dataset: { userId } },
  });
  if (!document) throw new apiError(404, "Document not found");

  await deleteChunks({ documentId });
  await prisma.document.delete({ where: { id: documentId } });
}

/**
 * Remove chunks from Chroma by metadata. Used for one document, or for every
 * dataset of a user when their account is deleted (see auth.service.ts).
 */
export async function deleteChunks(
  filter: { documentId: string } | { datasetId: string },
) {
  const collection = await getCollection(SOP_COLLECTION);
  await collection.delete({ where: filter });
}
