
import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { enrollCourse } from '../controllers/enrollment.controller.js';



const router = express.Router();

router.post(
  "/enroll",
  authMiddleware,
  enrollCourse
);

export default router;