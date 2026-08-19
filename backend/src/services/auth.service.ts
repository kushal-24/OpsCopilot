import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import apiError from "../utils/apiError.js";
import {
  hashPassword,
  isPasswordCorrect,
  generateAccessToken,
  generateRefreshToken,
} from "../models/user.model";

const SAFE_USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  profilePic: true,
} as const;

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  profilePic?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new apiError(409, "A user with this email already exists");
  }

  const hashedPassword = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      password: hashedPassword,
      profilePic: input.profilePic,
    },
    select: SAFE_USER_SELECT,
  });
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw new apiError(401, "Invalid email or password");
  }

  const passwordValid = await isPasswordCorrect(input.password, user.password);

  if (!passwordValid) {
    throw new apiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    },
    accessToken,
    refreshToken,
  };
}

export async function logoutUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
}

export async function refreshAccessToken(incomingRefreshToken: string) {
  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as jwt.JwtPayload;
  } catch {
    throw new apiError(401, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new apiError(401, "Refresh token is invalid or has been revoked");
  }

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function updateProfile(
  userId: string,
  input: { fullName?: string; profilePic?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      fullName: input.fullName,
      profilePic: input.profilePic,
    },
    select: SAFE_USER_SELECT,
  });
}

export async function changePassword(
  userId: string,
  input: { oldPassword: string; newPassword: string }
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new apiError(404, "User not found");
  }

  const oldPasswordValid = await isPasswordCorrect(
    input.oldPassword,
    user.password
  );

  if (!oldPasswordValid) {
    throw new apiError(401, "Current password is incorrect");
  }

  const hashedPassword = await hashPassword(input.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

export async function deleteAccount(userId: string) {
  // Cascades to datasets, chatSessions, aiRequests per schema.prisma relations.
  await prisma.user.delete({ where: { id: userId } });
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: SAFE_USER_SELECT,
  });

  if (!user) {
    throw new apiError(404, "User not found");
  }

  return user;
}
