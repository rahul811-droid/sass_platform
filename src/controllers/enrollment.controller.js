import { en } from "zod/locales";
import prisma from "../config/db.js";
import AppError from "../utils/AppErrors.js";
import asyncHandler from "../utils/asyncHandler.js";

export const enrollCourse = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const courseId = parseInt(req.params.courseId);
  // TRANSACTION
  const enrollment = await prisma.$transaction(async (tx) => {
    // CHECK COURSE EXISTS
    const course = await tx.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    // CHECK ALREADY ENROLLED
    const existingEnrollment = await tx.enrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (existingEnrollment) {
      throw new AppError("Already enrolled", 400);
    }

    // CREATE ENROLLMENT
    const newEnrollment = await tx.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });

    return newEnrollment;
  });

  res.status(201).json({
    success: true,
    message: "Enrollment successful",
    enrollment,
  });
});

export const myCourses = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: true,
    },
  });
  const courses = enrollments.map((enrollment) => enrollment.course);
  res.status(200).json({
    success: true,
    courses,
  });
});

export const getCourseStudents = asyncHandler(async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    throw new AppError("Course not found", 404);
  }
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  const students = enrollments.map((enrollment)=>enrollment.user);
  res.status(200).json({
    success: true,
    students, 
  })
});
