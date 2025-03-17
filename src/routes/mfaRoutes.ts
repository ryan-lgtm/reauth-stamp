import { Router } from 'express';
import { MFAController } from '../controllers/mfaController';
import { authenticateToken } from '../middleware/auth';
import { validateMFASecret } from '../utils/validation';

const router = Router();

// All MFA routes require authentication
router.use(authenticateToken);

// Create a new MFA secret
router.post('/', validateMFASecret, MFAController.createMFASecret);

// Get current TOTP code for an MFA secret
router.get('/:id/code', MFAController.getMFACode);

// List all MFA secrets for the authenticated user
router.get('/', MFAController.listMFASecrets);

// Delete an MFA secret
router.delete('/:id', MFAController.deleteMFASecret);

export default router;