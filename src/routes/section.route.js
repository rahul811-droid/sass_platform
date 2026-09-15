
import express from "express";

import {  createSection,getSectionsByCourse,updateSection,deleteSection } from "../controllers/section.controller.js";
import authorizeRoles from "../middleware/authRoles.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

router.post('/:courseId', authMiddleware,authorizeRoles("ADMIN"), createSection);
router.get('/course/:courseId', authMiddleware, getSectionsByCourse);
router.put('/:sectionId', authMiddleware,authorizeRoles("ADMIN"), updateSection);
router.delete('/:sectionId', authMiddleware,authorizeRoles("ADMIN"),deleteSection )


export default router;