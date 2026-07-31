import { Router } from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '../controllers/authController.js';
import { requireAuthApi } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', requireAuthApi, logoutUser);
router.get('/me', requireAuthApi, getCurrentUser);

export default router;
