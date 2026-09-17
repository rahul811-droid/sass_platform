import express from "express";
import { getCourseProgress, markLessonAsCompleted } from "../controllers/progress.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();
router.post(
  "/lesson/:lessonId/complete",
  authMiddleware,
  markLessonAsCompleted,
);

router.get(
  "/courses/:courseId",
  authMiddleware,
  getCourseProgress
);
export default router;
