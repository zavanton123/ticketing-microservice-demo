import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

// Request is a 3-rd party library object
// We are adding a custom filed (i.e. 'currentUser') to Request
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // if there is no cookie that contains JWT
  // that req.currentUser is null
  if (!req.session?.jwt) {
    return next();
  }

  // extract the user payload from JWT (contained in the cookie) and
  // save it as request field (i.e. req.currentUser)
  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
    req.currentUser = payload;
  } catch (err) {
  }
  next();
}
