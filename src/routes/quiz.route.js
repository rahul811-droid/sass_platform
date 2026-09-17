import express from "express";
import {
  createQuiz,
  createQuizQuestion,
  getQuizById,
} from "../controllers/quiz.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/authRoles.middleware.js";
const router = express.Router();
router.post(
  "/lessons/:lessonId",
  authMiddleware,
  authorizeRoles("ADMIN"),
  createQuiz,
);
router.post(
  "/:quizId/questions",
  authMiddleware,
  authorizeRoles("ADMIN"),
  createQuizQuestion,
);

router.get(
  "/:quizId",
  authMiddleware,
  getQuizById
);
export default router;
