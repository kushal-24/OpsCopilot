import * as fs from "fs";
import "dotenv/config";
import csv from "csv-parser";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { SEEDED_DATASET_ID } from "../config/constants";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

/*fs stands for File System. It's a built-in Node.js module that 
lets me program interact with files on my computer. */

const filePath = "data/event_log_flat.csv";

async function importDataset() {
  const datasetId = SEEDED_DATASET_ID;

  const rows: any[] = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      rows.push(row);
    })
    .on("end", async () => {
      const cases = new Map();
      for (const row of rows) {
        if (!cases.has(row.case_id)) {
          cases.set(row.case_id, row);
        }
      }

      // for (const row of cases.values()) {
      //   await prisma.case.create({
      //     data: {
      //       caseId: row.case_id,
      //       priority: row.priority,
      //       channel: row.channel,
      //       customerType: row.customer_type,
      //       datasetId: datasetId,
      //       createdAt: new Date(row.case_created_at),
      //     },
      //   });
      // }

      for (const row of rows) {
        const caseRecord = await prisma.case.findFirst({
          where: {
            caseId: row.case_id,
            datasetId: datasetId,
          },
        });

        if (!caseRecord){
          console.log(`Case not found: ${row.case_id}`);
          continue;
        }

        await prisma.event.create({
          data: {
            eventId: row.event_id,
            activity: row.activity,
            timestamp: new Date(row.timestamp),
            resource: row.resource,
            status: row.status,
            caseId: caseRecord.id,
          },
        });
      }

      console.log("Events inserted");
    });
}

importDataset();
