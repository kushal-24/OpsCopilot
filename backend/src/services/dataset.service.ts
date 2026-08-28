import fs from "fs";
import { Readable } from "stream";
import csv from "csv-parser";
import { prisma } from "../lib/prisma";
import apiError from "../utils/apiError.js";

const REQUIRED_COLUMNS = [
  "event_id",
  "case_id",
  "activity",
  "timestamp",
  "resource",
  "status",
  "priority",
  "channel",
  "customer_type",
  "case_created_at",
];

type CsvRow = Record<string, string>;

//Takes a readable stream → eventually returns a Promise containing CsvRow[].
function parseCsvStream(stream: NodeJS.ReadableStream): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const rows: CsvRow[] = [];
    //rows = [CsvRow, CsvRow, CsvRow, ...]

    stream
      .pipe(csv()) //Passes the stream into csv-parser.
      .on("data", (row: CsvRow) => rows.push(row)) //jo bhi row mil raha hai of type csvRow push
      .on("end", () => {
        if (rows.length === 0) {
          reject(new apiError(400, "CSV file is empty"));
          return;
        }

        const missing = REQUIRED_COLUMNS.filter((col) => !(col in rows[0]));
        if (missing.length > 0) {
          reject(new apiError(400, `CSV is missing required column(s): ${missing.join(", ")}`));
          return;
        }

        resolve(rows);
      })
      .on("error", reject);
  });
}

/**
 * Wraps Dataset + Case + Event creation in one transaction so a mid-import
 * failure never leaves a half-written Dataset. Bulk-inserts (createMany)
 * instead of per-row awaited inserts since this runs inline in an HTTP
 * request, not a background script.
 */
async function buildDatasetFromRows(
  userId: string,
  rows: CsvRow[],
  name: string,
  fileName: string,
  description?: string,
) {
  // The CSV is flat/denormalized — every event row repeats its case's
  // fields, so the first occurrence per case_id is authoritative.
  const caseRowByCaseId = new Map<string, CsvRow>(); //case table ke liye tayaar data 
  for (const row of rows) {
    if (!caseRowByCaseId.has(row.case_id)) {
      caseRowByCaseId.set(row.case_id, row);
    }
  }

  return prisma.$transaction(async (tx) => {
    const dataset = await tx.dataset.create({
      data: { userId, name, fileName, description },
    });

    const createdCases = await tx.case.createManyAndReturn({
      data: Array.from(caseRowByCaseId.values()).map((row) => ({
        caseId: row.case_id,
        priority: row.priority,
        channel: row.channel,
        customerType: row.customer_type,
        createdAt: new Date(row.case_created_at),
        datasetId: dataset.id,
      })),
      select: { id: true, caseId: true },
    });

    const caseIdLookup = new Map(createdCases.map((c) => [c.caseId, c.id]));

    const eventRows = rows
      .map((row) => {
        const caseId = caseIdLookup.get(row.case_id);
        if (!caseId) return null;

        return {
          eventId: row.event_id,
          activity: row.activity,
          timestamp: new Date(row.timestamp),
          resource: row.resource,
          status: row.status,
          caseId,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    await tx.event.createMany({ data: eventRows });

    return dataset;
  });
}

/** Single source of truth for "current dataset": the newest one this user owns. */
export async function getCurrentDataset(userId: string) {
  return prisma.dataset.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function uploadDataset(
  userId: string,
  fileBuffer: Buffer,
  originalFileName: string,
  name?: string,
  description?: string,
) {
  const rows = await parseCsvStream(Readable.from(fileBuffer));

  // TODO(ML): hook point for a data-preprocessing/anomaly-detection pass
  // over `rows` before they're persisted. Needs scikit-learn (Python-only,
  // per Architecture.md's stack notes) — would call out to a separate
  // Python step (subprocess or a small FastAPI service), not inline TS.

  return buildDatasetFromRows(userId, rows, name?.trim() || originalFileName, originalFileName, description);
}

export async function useDemoDataset(userId: string) {
  const rows = await parseCsvStream(fs.createReadStream("data/event_log_flat.csv"));

  // TODO(ML): same hook point as uploadDataset() above — see note there.

  return buildDatasetFromRows(userId, rows, "Demo Dataset", "event_log_flat.csv");
}

export async function getDatasetInfo(userId: string) {
  const dataset = await getCurrentDataset(userId);
  if (!dataset) return null;

  const [caseCount, eventCount, range] = await Promise.all([
    prisma.case.count({ where: { datasetId: dataset.id } }),
    prisma.event.count({ where: { case: { datasetId: dataset.id } } }),
    prisma.case.aggregate({
      where: { datasetId: dataset.id },
      _min: { createdAt: true },
      _max: { createdAt: true },
    }),
  ]);

  return {
    ...dataset,
    caseCount,
    eventCount,
    dateRange: { from: range._min.createdAt, to: range._max.createdAt },
  };
}
