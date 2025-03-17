import { Request, Response } from 'express';
import { APIToken } from '../models/apiToken';
import { v4 as uuidv4 } from 'uuid';

export class AuthController {
  /**
   * Create a new API token for a user
   */
  static async createToken(req: Request, res: Response): Promise<void> {
    try {
      const { name, userId, expiresInDays } = req.body;
      
      // Generate a new token
      const token = uuidv4();
      
      // Calculate expiration date only if expiresInDays is specifically provided
      // Otherwise, token never expires (expiresAt remains undefined)
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) 
        : undefined;

      const apiToken = new APIToken({
        name,
        userId,
        token,
        expiresAt,
        isActive: true,
        master: req.body.master || false
      });
      
      await apiToken.save();
      
      res.status(201).json({
        success: true,
        data: {
          id: apiToken._id,
          name: apiToken.name,
          token: apiToken.token,
          expiresAt: apiToken.expiresAt,
          createdAt: apiToken.createdAt,
          master: apiToken.master
        }
      });
    } catch (error) {
      console.error('Error creating API token:', error);
      res.status(500).json({ success: false, message: 'Failed to create API token' });
    }
  }

  /**
   * List all tokens for a user
   */
  static async listTokens(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      // Ensure the authenticated user can only view their own tokens
      if (userId !== req.user?.id && !req.user?.isMaster) {
        res.status(403).json({ success: false, message: 'Not authorized to view these tokens' });
        return;
      }
      
      const tokens = await APIToken.find({ userId })
        .select('_id name lastUsed expiresAt createdAt isActive master');
      
      res.status(200).json({
        success: true,
        data: tokens
      });
    } catch (error) {
      console.error('Error listing tokens:', error);
      res.status(500).json({ success: false, message: 'Failed to list tokens' });
    }
  }

  /**
   * Revoke a token
   */
  static async revokeToken(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      // Find the token
      const apiToken = await APIToken.findOne({ _id: id });
      
      if (!apiToken) {
        res.status(404).json({ success: false, message: 'Token not found' });
        return;
      }
      
      // Only the token owner can revoke it
      if (apiToken.userId !== userId) {
        res.status(403).json({ success: false, message: 'Not authorized to revoke this token' });
        return;
      }
      
      apiToken.isActive = false;
      await apiToken.save();
      
      res.status(200).json({
        success: true,
        message: 'Token revoked successfully'
      });
    } catch (error) {
      console.error('Error revoking token:', error);
      res.status(500).json({ success: false, message: 'Failed to revoke token' });
    }
  }

  /**
   * Validate a token
   */
  static async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        res.status(400).json({ success: false, message: 'Token is required' });
        return;
      }
      
      const apiToken = await APIToken.findOne({ token, isActive: true });
      
      if (!apiToken || (apiToken.expiresAt && apiToken.expiresAt < new Date())) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: {
          id: apiToken._id,
          userId: apiToken.userId,
          name: apiToken.name,
          expiresAt: apiToken.expiresAt
        }
      });
    } catch (error) {
      console.error('Error validating token:', error);
      res.status(500).json({ success: false, message: 'Failed to validate token' });
    }
  }

  /**
   * Reset a master token by generating a new token value
   * This can be used if a master token is compromised
   */
  static async resetMasterToken(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Find the token to reset
      const tokenToReset = await APIToken.findById(id);
      
      if (!tokenToReset) {
        res.status(404).json({ success: false, message: 'Token not found' });
        return;
      }
      
      // Verify it's actually a master token
      if (!tokenToReset.master) {
        res.status(400).json({ success: false, message: 'Only master tokens can be reset with this endpoint' });
        return;
      }
      
      // Generate a new token value
      const newTokenValue = uuidv4();
      tokenToReset.token = newTokenValue;
      
      // Update the token's lastUsed timestamp
      tokenToReset.lastUsed = new Date();
      
      await tokenToReset.save();
      
      res.status(200).json({
        success: true,
        message: 'Master token reset successfully',
        data: {
          id: tokenToReset._id,
          name: tokenToReset.name,
          token: newTokenValue,
          createdAt: tokenToReset.createdAt
        }
      });
    } catch (error) {
      console.error('Error resetting master token:', error);
      res.status(500).json({ success: false, message: 'Failed to reset master token' });
    }
  }
}