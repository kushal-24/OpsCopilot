import { User } from "../generated/prisma/models";

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "password" | "refreshToken">;
    }
  }
}

export {};
//It tells TypeScript that our authentication middleware adds a user 
// property to req, and Omit ensures sensitive fields like password and refreshToken aren't included in that type.”
/**
 HTTP request
     ↓
Express
     ↓
req (Request object)
     ├── body
     ├── params
     ├── query
     ├── headers
     └── user ← our custom addition
 */