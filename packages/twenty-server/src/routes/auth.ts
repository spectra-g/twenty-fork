import { type NextFunction, type Request, type Response } from 'express';

export const requireAuth = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const token = request.header('x-auth-token');

  if (!token) {
    response.status(401).json({
      error: 'Authentication required',
    });

    return;
  }

  next();
};
