import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import * as documentService from "../services/document.service";

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new apiError(400, "No file uploaded - attach a .md or .txt SOP as 'file'");
  }

  const { name } = req.body;
  const document = await documentService.ingestDocument(
    req.user!.id,
    req.file.buffer,
    req.file.originalname,
    typeof name === "string" ? name : undefined,
  );

  res.status(201).json(new apiResponse(document, 201, "SOP uploaded"));
});

export const listDocuments = asyncHandler(async (req: Request, res: Response) => {
  const documents = await documentService.listDocuments(req.user!.id);
  res.status(200).json(new apiResponse(documents, 200, "Documents fetched"));
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  await documentService.deleteDocument(req.user!.id, String(req.params.id));
  res.status(200).json(new apiResponse(null, 200, "Document deleted"));
});
