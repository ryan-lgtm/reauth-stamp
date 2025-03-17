import { Request, Response, NextFunction } from 'express';
import { APIToken } from '../models/apiToken';

// Extended Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        isMaster?: boolean; // Add isMaster flag
      };
      token?: string;
    }
  }
}

export const authenticateToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token required' });
    return;
  }

  try {
    // Find and validate API token
    const apiToken = await APIToken.findOne({ token, isActive: true });
    
    if (!apiToken) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
      return;
    }
    
    // Check if token is expired
    if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
      res.status(401).json({ success: false, message: 'Token expired' });
      return;
    }
    
    // Update last used timestamp
    apiToken.lastUsed = new Date();
    await apiToken.save();
    
    // Set user information for route handlers
    req.user = { 
      id: apiToken.userId,
      isMaster: apiToken.master // Pass the master flag
    };
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};