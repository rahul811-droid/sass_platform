import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/authRoles.middleware.js";
import { createLession ,getLessonsBySection,updateLesson,deleteLesson, getLessonDetailsById} from "../controllers/lession.controller.js";
import { checkLessonAccess } from "../middleware/lessonAccess.middleware.js";


const router = express.Router();
router.post('/:sectionId',authMiddleware,authorizeRoles('ADMIN'), createLession);
router.get('/section/:sectionId',authMiddleware,getLessonsBySection);
router.put('/:lessonId',authMiddleware,authorizeRoles('ADMIN'), updateLesson);
router.delete('/:lessonId',authMiddleware,authorizeRoles('ADMIN'), deleteLesson);
router.get('/:lessonId',authMiddleware,checkLessonAccess, getLessonDetailsById);
export default router;