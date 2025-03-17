import { Request, Response } from 'express';
import { MFASecret, IMFASecret } from '../models/mfaSecret';
import { TOTPService } from '../services/totpService';

export class MFAController {
  /**
   * Create a new MFA secret
   */
  static async createMFASecret(req: Request, res: Response): Promise<void> {
    try {
      const { name, initialAuth } = req.body;
      const userId = req.user?.id; // From auth middleware
      
      // Check if entry with the same name already exists
      const existingSecret = await MFASecret.findOne({ name, userId });
      if (existingSecret) {
        res.status(400).json({ success: false, message: 'An MFA entry with this name already exists' });
        return;
      }
      
      // Clean up the secret by removing spaces and other non-base32 characters
      // Base32 only uses A-Z and 2-7
      const cleanedSecret = initialAuth.replace(/\s+/g, '').toUpperCase();
      
      // Add this after removing spaces
      if (!/^[A-Z2-7]+$/.test(cleanedSecret)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid MFA secret format. Must contain only base32 characters (A-Z, 2-7).' 
        });
        return;
      }
      
      const mfaSecret = new MFASecret({
        name,
        secret: cleanedSecret,
        userId
      });
      
      await mfaSecret.save();
      
      res.status(201).json({
        success: true,
        data: {
          id: mfaSecret._id,
          name: mfaSecret.name,
          createdAt: mfaSecret.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating MFA secret:', error);
      res.status(500).json({ success: false, message: 'Failed to create MFA secret' });
    }
  }
  
  /**
   * Get current TOTP code for a specific MFA secret
   */
  static async getMFACode(req: Request, res: Response): Promise<void> {
    try {
      const secretId = req.params.id;
      const userId = req.user?.id;
      
      const mfaSecret = await MFASecret.findOne({ _id: secretId, userId });
      
      if (!mfaSecret) {
        res.status(404).json({ success: false, message: 'MFA secret not found' });
        return;
      }
      
      const code = TOTPService.generateTOTP(mfaSecret);
      
      // Calculate the end of the current time window correctly
      const period = mfaSecret.period; // Usually 30 seconds
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const currentWindow = Math.floor(now / period); // Current time window
      const validUntil = new Date((currentWindow + 1) * period * 1000); // End of this window
      
      // Calculate seconds remaining until code expires
      const secondsRemaining = Math.max(0, Math.floor(validUntil.getTime() / 1000) - Math.floor(Date.now() / 1000));
      
      res.status(200).json({
        success: true,
        data: {
          id: mfaSecret._id,
          name: mfaSecret.name,
          code,
          validUntil: validUntil.toISOString(),
          secondsRemaining: secondsRemaining
        }
      });
    } catch (error) {
      console.error('Error getting MFA code:', error);
      res.status(500).json({ success: false, message: 'Failed to get MFA code' });
    }
  }
  
  /**
   * List all MFA secrets for the authenticated user
   */
  static async listMFASecrets(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      const secrets = await MFASecret.find({ userId })
        .select('_id name createdAt updatedAt');
      
      res.status(200).json({
        success: true,
        data: secrets
      });
    } catch (error) {
      console.error('Error listing MFA secrets:', error);
      res.status(500).json({ success: false, message: 'Failed to list MFA secrets' });
    }
  }
  
  /**
   * Delete an MFA secret
   */
  static async deleteMFASecret(req: Request, res: Response): Promise<void> {
    try {
      const secretId = req.params.id;
      const userId = req.user?.id;
      
      const result = await MFASecret.deleteOne({ _id: secretId, userId });
      
      if (result.deletedCount === 0) {
        res.status(404).json({ success: false, message: 'MFA secret not found' });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'MFA secret deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting MFA secret:', error);
      res.status(500).json({ success: false, message: 'Failed to delete MFA secret' });
    }
  }
}