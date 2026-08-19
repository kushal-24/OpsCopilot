import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

type TokenPayload = {
  id: string;
  email: string;
  fullName: string;
};

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function isPasswordCorrect(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function generateAccessToken(user: TokenPayload): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      fullName: user.fullName 
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { 
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any 
    }
  );
}

export function generateRefreshToken(user: TokenPayload): string {
  return jwt.sign(
    { 
      id: user.id 
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    { 
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY as any 
    }
  );
}
