
import express from 'express';

import { createCourse ,getCourses,updateCourse,deleteCourse,getCourseDetailsById} from '../controllers/course.controller.js';
import authorizeRoles from '../middleware/authRoles.middleware.js';  
import authMiddleware from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { checkEnrollMent } from '../middleware/enrollMent.middleware.js';

const router = express.Router();

router.post('/create',authMiddleware,upload.single('thumbnail'), createCourse);
router.put('/update/:id',authMiddleware, authorizeRoles('ADMIN', 'INSTRUCTOR'), upload.single('thumbnail'), updateCourse);
router.delete('/delete/:id',authMiddleware, deleteCourse);
router.get('/',authMiddleware, getCourses);

router.get('/:id',authMiddleware, getCourseDetailsById );


export default router;