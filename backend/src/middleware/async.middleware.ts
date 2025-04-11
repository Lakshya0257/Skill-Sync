// src/middleware/async.middleware.ts
import { Request, Response, NextFunction } from 'express';

// Higher-order function to wrap async controllers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Once you implement authentication, add auth middleware here
// src/middleware/auth.middleware.ts
// export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   // To be implemented with JWT or other auth mechanism
// };