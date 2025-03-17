import { Request, Response, NextFunction } from 'express';

export const requireMasterToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if user is authenticated and has master token
  if (!req.user || !req.user.isMaster) {
    res.status(403).json({ 
      success: false, 
      message: 'This operation requires a master token' 
    });
    return;
  }
  
  next();
};