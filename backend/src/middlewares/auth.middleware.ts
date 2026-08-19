import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import { prisma } from "../lib/prisma";

export const verifyJWT = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new apiError(401, "Unauthorized request");
    }

    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as jwt.JwtPayload;
    } catch {
      throw new apiError(401, "Invalid or expired access token");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        profilePic: true,
      },
    });

    if (!user) {
      throw new apiError(401, "Invalid access token: user no longer exists");
    }

    req.user = user;
    next();
  }
);
