
import express from 'express';

import { createCourse ,getCourses,updateCourse,deleteCourse} from '../controllers/course.controller.js';
import authorizeRoles from '../middleware/authRoles.middleware.js';  
import authMiddleware from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/create',authMiddleware,upload.single('thumbnail'), createCourse);
router.put('/update/:id',authMiddleware, authorizeRoles('ADMIN', 'INSTRUCTOR'), upload.single('thumbnail'), updateCourse);
router.delete('/delete/:id',authMiddleware, deleteCourse);
router.get('/', getCourses);


export default router;