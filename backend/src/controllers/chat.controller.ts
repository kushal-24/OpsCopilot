import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import * as chatService from "../services/chat.service";

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await chatService.createSession(req.user!.id, req.body.title);

  res.status(201).json(new apiResponse(session, 201, "Chat session created"));
});

export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const sessions = await chatService.listSessions(req.user!.id);

  res.status(200).json(new apiResponse(sessions, 200, "Chat sessions fetched"));
});

export const getSessionMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const messages = await chatService.getSessionMessages(
      req.params.sessionId,
      req.user!.id
    );

    res.status(200).json(new apiResponse(messages, 200, "Messages fetched"));
  }
);

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { content } = req.body;

  if (!content || typeof content !== "string" || !content.trim()) {
    throw new apiError(400, "content is required");
  }

  const result = await chatService.sendMessage(
    req.params.sessionId,
    req.user!.id,
    content.trim()
  );

  res.status(200).json(new apiResponse(result, 200, "Message sent"));
});

export const deleteSession = asyncHandler(async (req: Request, res: Response) => {
  await chatService.deleteSession(req.params.sessionId, req.user!.id);

  res.status(200).json(new apiResponse(null, 200, "Chat session deleted"));
});
