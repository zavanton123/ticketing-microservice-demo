import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from "../errors/not-authorized-error";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // redirect to error handler
  // if there is no cookie with JWT
  if (!req.currentUser) {
    throw new NotAuthorizedError()
  }
  next();
};
