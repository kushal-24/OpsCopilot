import { User as PrismaUser } from "../generated/prisma/client";

declare global {
  namespace Express {
    // Augmenting Express.User (not redeclaring Request.user directly) so it
    // merges with passport's own `interface User {}` / `Request.user?: User`
    // declarations instead of silently losing to them.
    interface User extends Omit<PrismaUser, "password" | "refreshToken"> {}
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