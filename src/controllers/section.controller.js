import prisma from "../config/db.js";
import AppError from "../utils/AppErrors.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createSection = asyncHandler(async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const { title, order } = req.body;
  if (!title) {
    throw new AppError("Title is required", 400);
  }
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    throw new AppError("Course not found", 404);
  }
  const section = await prisma.section.create({
    data: {
      title,
      order: order || 1,
      courseId,
    },
  });
  res.status(201).json({
    success: true,
    message: "Section created successfully",
    section,
  });
});

export const getSectionsByCourse = asyncHandler(async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    throw new AppError("Course not found", 404);
  }
  const sections = await prisma.section.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });
  return res.status(200).json({
    success: true,
    message: "Sections retrieved successfully",
    totalSections: sections.length,
    sections,
  });
});

export const updateSection = asyncHandler(async (req, res) => {
  const sectionId = parseInt(req.params.sectionId);
  const { titke, order } = req.body;
  const existingSection = await prisma.section.findUnique({
    where: { id: sectionId },
  });
  if (!existingSection) {
    throw new AppError("Section not found", 404);
  }
  const updatedSection = await prisma.section.update({
    where: { id: sectionId },
    data: {
      title: title || existingSection.title,
      order: order ?? existingSection.order,
    },
  });
  res.status(200).json({
    success: true,
    message: "Section updated successfully",
    section: updatedSection,
  });
});

export const deleteSection = asyncHandler(async (req, res) => {
  const sectionId = parseInt(req.params.sectionId);
  const existingSection = await prisma.section.findUnique({
    where: { id: sectionId },
  });
  if (!existingSection) {
    throw new AppError("Section not found", 404);
  }
  const lessonCount = await prisma.lesson.count({
    where: {
      sectionId,
    },
  });

  if (lessonCount > 0) {
    throw new AppError("Cannot delete section with existing lessons", 400);
  }
  await prisma.section.delete({ where: { id: sectionId } });
  res.status(200).json({
    success: true,
    message: "Section deleted successfully",
  });
});
