import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import * as authService from "../services/auth.service";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, password, profilePic } = req.body;

  if (!fullName || !email || !password) {
    throw new apiError(400, "fullName, email and password are required");
  }

  const user = await authService.registerUser({
    fullName,
    email,
    password,
    profilePic,
  });

  res.status(201).json(new apiResponse(user, 201, "Signup successful"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new apiError(400, "email and password are required");
  }

  const { user, accessToken, refreshToken } = await authService.loginUser({
    email,
    password,
  });

  res
    .status(200)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(new apiResponse({ user, accessToken, refreshToken }, 200, "Login successful"));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutUser(req.user!.id);

  res
    .status(200)
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .json(new apiResponse(null, 200, "Logout successful"));
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const incoming = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incoming) {
    throw new apiError(401, "Refresh token is required");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(incoming);

  res
    .status(200)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
    .json(
      new apiResponse(
        { accessToken, refreshToken: newRefreshToken },
        200,
        "Access token refreshed"
      )
    );
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);

  res.status(200).json(new apiResponse(user, 200, "Current user fetched"));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, profilePic } = req.body;

  const user = await authService.updateProfile(req.user!.id, {
    fullName,
    profilePic,
  });

  res.status(200).json(new apiResponse(user, 200, "Profile updated"));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new apiError(400, "oldPassword and newPassword are required");
  }

  await authService.changePassword(req.user!.id, { oldPassword, newPassword });

  res.status(200).json(new apiResponse(null, 200, "Password changed"));
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await authService.deleteAccount(req.user!.id);

  res
    .status(200)
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .json(new apiResponse(null, 200, "Account deleted"));
});
