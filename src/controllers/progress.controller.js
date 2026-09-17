import { th } from "zod/locales";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppErrors.js";
import prisma from "../config/db.js";
import { compare } from "bcryptjs";

export const markLessonAsCompleted = asyncHandler(async (req, res, next) => {
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
    const checkEnrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: userId,
                courseId: lesson.section.courseId,
            },
        },
    });
    if(!checkEnrollment){
        throw new AppError("You are not enrolled in this course", 403);
    } 
    const progress = await prisma.lessonProgress.upsert({
        where: {
            userId_lessonId: {
                userId: userId,
                lessonId: lessonId,
            },
    
    },
    create: {
        userId: userId,
        lessonId: lessonId,
        completed:true,
        completedAt: new Date(),
    },
    update: {
        completed:true,
        completedAt: new Date(),

    }
    });
    return res.status(200).json({
        status: "success",
        message: "Lesson marked as completed",
        data: progress,
    });
})

export const getCourseProgress = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const courseId = parseInt(req.params.courseId);
    if(isNaN(courseId)){
        throw new AppError("Invalid course ID", 400);
    }
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
    });
    if(!course){
        throw new AppError("Course not found", 404);
    }
    const checkEnrollment = await prisma.enrollment.findUnique({    
        where: {
            userId_courseId: {
                userId: userId,
                courseId: courseId,
            },
        },
    });
    if(!checkEnrollment){
        throw new AppError("You are not enrolled in this course", 403);
    }
    const totalLession = await prisma.lesson.count({
        where: {
            section: {
                courseId: courseId,
            },
        },
    });
    const completedLession = await prisma.lessonProgress.count({
        where: {
            userId: userId,
            completed: true,
            lesson: {
                section: {
                    courseId: courseId,
                },
            },
        },
    });
    const progressPercentage = totalLession === 0 ? 0 : Math.round(completedLession / totalLession) * 100;
    return res.status(200).json({
        status: "success",
        message: "Course progress retrieved successfully",
        data: {
            totalLessons: totalLession,
            completedLessons: completedLession,
            progressPercentage: progressPercentage.toFixed(2),
        },
    });
})