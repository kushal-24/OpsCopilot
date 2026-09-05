import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import * as explorerService from "../services/explorer.service";

function getStringParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function parseDateParam(req: Request, key: string): Date | undefined {
  const raw = getStringParam(req, key);
  if (!raw) return undefined;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new apiError(400, `${key} is not a valid date`);
  }

  return date;
}

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page);
  const pageSize = Number(req.query.pageSize);

  const data = await explorerService.getEvents({
    datasetId: getStringParam(req, "datasetId"),
    activity: getStringParam(req, "activity"),
    caseId: getStringParam(req, "caseId"),
    status: getStringParam(req, "status"),
    startDate: parseDateParam(req, "startDate"),
    endDate: parseDateParam(req, "endDate"),
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    pageSize:
      Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), 100) : 20,
  });

  res.status(200).json(new apiResponse(data, 200, "Events fetched"));
});
