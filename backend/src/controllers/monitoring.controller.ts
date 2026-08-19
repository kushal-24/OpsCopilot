import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import * as monitoringService from "../services/monitoring.service";
import { RequestLogStatus } from "../services/monitoring.service";

// datasetId is optional today (single-dataset demo), same convention as
// analytics.controller.ts — scoping to a dataset later is a query-param change.
function getDatasetId(req: Request): string | undefined {
  const datasetId = req.query.datasetId;
  return typeof datasetId === "string" ? datasetId : undefined;
}

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const data = await monitoringService.getOverview(getDatasetId(req));

  res.status(200).json(new apiResponse(data, 200, "Monitoring overview fetched"));
});

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const data = await monitoringService.getSummary(getDatasetId(req));

  res.status(200).json(new apiResponse(data, 200, "Monitoring summary fetched"));
});

export const getLatencyOverTime = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await monitoringService.getLatencyOverTime(getDatasetId(req));

    res.status(200).json(new apiResponse(data, 200, "Latency over time fetched"));
  }
);

export const getRequestVolumeOverTime = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await monitoringService.getRequestVolumeOverTime(getDatasetId(req));

    res
      .status(200)
      .json(new apiResponse(data, 200, "Request volume over time fetched"));
  }
);

export const getRequestLog = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;

  if (status !== undefined && status !== "success" && status !== "error") {
    throw new apiError(400, "status must be 'success' or 'error'");
  }

  const page = Number(req.query.page);
  const pageSize = Number(req.query.pageSize);

  const data = await monitoringService.getRequestLog({
    datasetId: getDatasetId(req),
    status: status as RequestLogStatus | undefined,
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    pageSize:
      Number.isFinite(pageSize) && pageSize > 0
        ? Math.min(Math.floor(pageSize), 100)
        : 20,
  });

  res.status(200).json(new apiResponse(data, 200, "Request log fetched"));
});
