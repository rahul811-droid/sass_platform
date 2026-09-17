import prisma from "../config/db.js";
import AppError from "../utils/AppErrors.js";
import asyncHandler from "../utils/asyncHandler.js";


export const checkLessonAccess  = asyncHandler(async (req, res, next) => {

    const userId = req.user.id;
    const lessonId = parseInt(req.params.lessonId);
    if(isNaN(lessonId)){
        throw new AppError("Invalid lesson ID", 400);
    }
    const lesson = await prisma.lesson.findUnique({
        where: {
            id: lessonId,
        },
        include: {
            section: {
                select: {
                    courseId: true,
                },
            },
        },
    });
    if(!lesson){
        throw new AppError("Lesson not found", 404);
    }
    const courseId = lesson.section.courseId;

    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: userId,
                courseId: courseId,
            },
        },
    });
    if(!enrollment){
        return res.status(403).json({
            success: false,
            message: "You are not enrolled in this course",
        });
    }
    req.lesson = lesson;
    req.enrollment = enrollment;
    return next();

})