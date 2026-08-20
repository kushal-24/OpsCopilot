-- CreateTable
CREATE TABLE "EvalRun" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvalRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvalResult" (
    "id" TEXT NOT NULL,
    "evalRunId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "expectedAnswer" TEXT NOT NULL,
    "actualAnswer" TEXT NOT NULL,
    "pass" BOOLEAN NOT NULL,
    "judgeReasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvalResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EvalRun" ADD CONSTRAINT "EvalRun_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvalResult" ADD CONSTRAINT "EvalResult_evalRunId_fkey" FOREIGN KEY ("evalRunId") REFERENCES "EvalRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
