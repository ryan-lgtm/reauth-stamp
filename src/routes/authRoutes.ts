import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { requireMasterToken } from '../middleware/requireMasterToken';
import { validateTokenCreation } from '../utils/validation';

const router = Router();

// Create a new API token (requires master token)
router.post('/tokens', authenticateToken, requireMasterToken, validateTokenCreation, AuthController.createToken);

// List all tokens for a user (requires authentication)
router.get('/tokens/:userId', authenticateToken, AuthController.listTokens);

// Revoke a token (requires authentication)
router.post('/tokens/:id/revoke', authenticateToken, AuthController.revokeToken);

// Reset a master token by ID (requires master token)
router.post('/tokens/:id/reset-master', authenticateToken, requireMasterToken, AuthController.resetMasterToken);

// Validate a token
router.get('/validate', AuthController.validateToken);

export default router;