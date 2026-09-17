import { is } from "zod/locales";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppErrors.js";
import prisma from "../config/db.js";
import { includes, success } from "zod";

export const createQuiz = asyncHandler(async (req, res, next) => {
  const lessionId = parseInt(req.params.lessonId);
  const title = req.body.title;
  if (isNaN(lessionId)) {
    throw new AppError("Invalid lesson ID", 400);
  }
  if (!title) {
    throw new AppError("Quiz title is required", 400);
  }
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessionId,
    },
  });
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }
  const existingQuiz = await prisma.quiz.findUnique({
    where: {
      lessonId: lessionId,
    },
  });
  if (existingQuiz) {
    throw new AppError("Quiz already exists for this lesson", 400);
  }
  const quiz = await prisma.quiz.create({
    data: {
      title: title,
      lessonId: lessionId,
    },
  });
  return res.status(201).json({
    status: "success",
    message: "Quiz created successfully",
    data: quiz,
  });
});

export const createQuizQuestion = asyncHandler(async (req, res, next) => {
  const quizId = parseInt(req.params.quizId);
  const { question, options } = req.body;
  if (isNaN(quizId)) {
    throw new AppError("Invalid quiz ID", 400);
  }
  if (!question) {
    throw new AppError("Question is required", 400);
  }

  if (!Array.isArray(options) || options.length < 2) {
    throw new AppError("At least 2 options are required", 400);
  }
  const correctOptions = options.filter((option) => option.isCorrect);
  if (correctOptions.length !== 1) {
    throw new AppError("Exactly one option must be marked as correct", 400);
  }

  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
  });

  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }
  const newQuestion = await prisma.quizQuestion.create({
    data: {
      question: question,
      quizId: quizId,
      options: {
        create: options.map((option) => ({
          optionText: option.optionText,
          isCorrect: option.isCorrect,
        })),
      },
    },
    include: {
      options: true,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Question created successfully",
    data: newQuestion,
  });
});

export const getQuizById = asyncHandler(async (req, res, next) => {
  const user = req.user.id;
  const quizId = parseInt(req.params.quizId);
  if (isNaN(quizId)) {
    throw new AppError("Invalid quiz ID", 400);
  }
  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      lesson: {
        include: {
          section: {
            select: {
              courseId: true,
            },
          },
        },
      },
      questions: {
        select: {
          id: true,
          question: true,
          options: {
            select: {
              id: true,
              optionText: true,
            },
          },
        },
      },
    },
  });

  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }
  const courseId = quiz.lesson.section.courseId;
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user,
        courseId: courseId,
      },
    },
  });
  if (!enrollment) {
    throw new AppError("You are not enrolled in this course", 403);
  }
  return res.status(200).json({
    success: true,
    message: "Quiz retrieved successfully",
    data: quiz,
  });
});
