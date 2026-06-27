
import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { enrollCourse,myCourses,getCourseStudents } from '../controllers/enrollment.controller.js';
import authorizeRoles from '../middleware/authRoles.middleware.js';  




const router = express.Router();

router.post(
  "/:courseId",
  authMiddleware,
  enrollCourse
);

router.get(
  "/my-courses",
  authMiddleware,
  myCourses
);

router.get(
  "/course/:courseId/students",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getCourseStudents
);

export default router;