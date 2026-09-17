import prisma from "../config/db.js";
import AppError from "../utils/AppErrors.js";
import asyncHandler from "../utils/asyncHandler.js";

export const checkEnrollMent = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const courseId = parseInt(req.params.courseId);
    if(isNaN(courseId)){
        throw new AppError("Invalid course ID", 400);
    }
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
        req.enrollment = enrollment;
        return next();
})