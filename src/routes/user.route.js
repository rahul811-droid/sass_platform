import express from 'express';

import {
  createUser,
  getUsers,loginUser,getProfile
} from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';


const router = express.Router();

router.post('/create', createUser);
router.get('/login', loginUser);
router.get('/profile', authMiddleware, getProfile);

router.get('/', getUsers);

export default router;