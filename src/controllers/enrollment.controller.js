import prisma from "../config/db.js";
import AppError from "../utils/AppErrors.js";
import asyncHandler from "../utils/asyncHandler.js";



export const enrollCourse = asyncHandler(
  async (req, res) => {

    const userId = req.user.id;

    const { courseId } = req.body;

    // TRANSACTION
    const enrollment =
      await prisma.$transaction(
        async (tx) => {

          // CHECK COURSE EXISTS
          const course =
            await tx.course.findUnique({
              where: {
                id: courseId,
              },
            });

          if (!course) {
            throw new AppError(
              "Course not found",
              404
            );
          }

          // CHECK ALREADY ENROLLED
          const existingEnrollment =
            await tx.enrollment.findFirst({
              where: {
                userId,
                courseId,
              },
            });

          if (existingEnrollment) {
            throw new AppError(
              "Already enrolled",
              400
            );
          }

          // CREATE ENROLLMENT
          const newEnrollment =
            await tx.enrollment.create({
              data: {
                userId,
                courseId,
              },
            });

          return newEnrollment;
        }
      );

    res.status(201).json({
      success: true,
      message: "Enrollment successful",
      enrollment,
    });
  }
);