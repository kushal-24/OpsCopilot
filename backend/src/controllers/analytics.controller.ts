import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import * as analyticsService from "../services/analytics.service";

// datasetId is optional today (single-dataset demo), but every handler
// already threads it through so scoping to a dataset later is a query-param
// change, not a rewrite.
function getDatasetId(req: Request): string | undefined {
  const datasetId = req.query.datasetId;
  return typeof datasetId === "string" ? datasetId : undefined;
}

//* Purpose * : safely determine how many results the API should return.
function getLimit(req: Request, fallback: number): number {
  const limit = Number(req.query.limit);
  return Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : fallback;
}

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.getDashboard(
    getDatasetId(req),
    getLimit(req, 10)
  );

  res.status(200).json(new apiResponse(data, 200, "Dashboard data fetched"));
});

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.getSummary(getDatasetId(req));

  res.status(200).json(new apiResponse(data, 200, "Summary fetched"));
});

export const getActivityPerformance = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await analyticsService.getActivityPerformance(getDatasetId(req));

    res
      .status(200)
      .json(new apiResponse(data, 200, "Activity performance fetched"));
  }
);

export const getThroughput = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.getThroughput(getDatasetId(req));

  res.status(200).json(new apiResponse(data, 200, "Throughput fetched"));
});

export const getSlowestCases = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.getSlowestCases(
    getDatasetId(req),
    getLimit(req, 10)
  );

  res.status(200).json(new apiResponse(data, 200, "Slowest cases fetched"));
});

export const getCasesByStatus = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.getCasesByStatus(getDatasetId(req));

  res.status(200).json(new apiResponse(data, 200, "Cases by status fetched"));
});

export const getCasesByPriority = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await analyticsService.getCasesByPriority(getDatasetId(req));

    res
      .status(200)
      .json(new apiResponse(data, 200, "Cases by priority fetched"));
  }
);
