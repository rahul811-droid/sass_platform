import express from 'express';

import {
  refreshToken,logoutUser
} from '../controllers/auth.controller.js';


const router = express.Router();

router.post('/refresh-token', refreshToken);
router.post('/logout', logoutUser);

export default router;