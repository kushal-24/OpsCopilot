import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import * as datasetService from "../services/dataset.service";

export const uploadDataset = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new apiError(400, "No file uploaded — attach a CSV as 'file'");
  }

  const { name, description } = req.body;

  const dataset = await datasetService.uploadDataset(
    req.user!.id,
    req.file.buffer,
    req.file.originalname,
    typeof name === "string" ? name : undefined,
    typeof description === "string" ? description : undefined,
  );

  res.status(201).json(new apiResponse(dataset, 201, "Dataset uploaded"));
});

export const useDemoDataset = asyncHandler(async (req: Request, res: Response) => {
  const dataset = await datasetService.useDemoDataset(req.user!.id);

  res.status(201).json(new apiResponse(dataset, 201, "Demo dataset created"));
});

export const getCurrentDatasetInfo = asyncHandler(async (req: Request, res: Response) => {
  const info = await datasetService.getDatasetInfo(req.user!.id);

  res
    .status(200)
    .json(new apiResponse(info, 200, info ? "Dataset info fetched" : "No dataset yet"));
});
