import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import * as evalService from "../services/eval.service";

// datasetId is optional today (single-dataset demo), same convention as
// analytics.controller.ts / monitoring.controller.ts.
function getDatasetId(req: Request): string | undefined {
  const datasetId = req.query.datasetId;
  return typeof datasetId === "string" ? datasetId : undefined;
}

export const getLatestRun = asyncHandler(async (req: Request, res: Response) => {
  const data = await evalService.getLatestRun(getDatasetId(req));

  res.status(200).json(new apiResponse(data, 200, "Latest eval run fetched"));
});

export const listRuns = asyncHandler(async (req: Request, res: Response) => {
  const data = await evalService.listRuns(getDatasetId(req));

  res.status(200).json(new apiResponse(data, 200, "Eval runs fetched"));
});

export const getRunById = asyncHandler(async (req: Request, res: Response) => {
  const data = await evalService.getRunById(req.params.runId as string);

  res.status(200).json(new apiResponse(data, 200, "Eval run fetched"));
});
