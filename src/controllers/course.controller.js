import prisma from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppErrors.js";
import redisClient from "../config/redis.js";
import { clearCourseCache } from "../utils/cache.js";
import cloudinary from "../config/cloudinary.js";
import { th } from "zod/locales";

export const createCourse = asyncHandler(async (req, res) => {
  const { title, description, price, file } = req.body;
  console.log("req.file", req.file);
  if (!title || !description || !price) {
    throw new AppError("All fields are required", 400);
  }

  let thumbnailUrl = null;

  try {
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: "lms/courses",
      },
    );
    thumbnailUrl = result.secure_url;
    console.log("Cloudinary Response:", result);
  } catch (error) {
    console.error("CLOUDINARY ERROR:", error);
    throw error;
  }
  const course = await prisma.course.create({
    data: {
      title,
      description,
      price: parseFloat(price),
      thumbnail: thumbnailUrl,
      thumbnail: result.secure_url,
      thumbnailPublicId: result.public_id,
    },
  });
  await clearCourseCache();

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    course,
  });
});

export const getCourses = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";
  const sortby = req.query.sortby || "createdAt";
  const order = req.query.order || "desc";
  const minimumPrice = req.query.minimumPrice || 0;
  const maxPrice = req.query.maxPrice || 100000;

  const cacheKey = `
    courses:
    ${page}:
    ${limit}:
    ${search}:
    ${sortby}:
    ${order}:
    ${minimumPrice}:
    ${maxPrice}
    `;

  const cacheCourses = await redisClient.get(cacheKey);
  if (cacheCourses) {
    console.log("CACHE HIT");

    return res.status(200).json({
      success: true,
      fromCache: true,
      courses: JSON.parse(cacheCourses),
    });
  }
  console.log("CACHE MISS");

  const where = {
    AND: [
      { title: { contains: search, mode: "insensitive" } },
      { price: { gte: parseFloat(minimumPrice), lte: parseFloat(maxPrice) } },
    ],
  };

  const totalCourses = await prisma.course.count({ where });
  const courses = await prisma.course.findMany({
    where,
    skip: parseInt(skip),
    take: parseInt(limit),
    orderBy: {
      [sortby]: order,
    },
  });

  const responseDataObj = {
    success: true,
    pagination: {
      totalCourses,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCourses / limit),
      limit: parseInt(limit),
    },
    filters: {
      search,
      minimumPrice,
      maxPrice,
      sortby,
      order,
    },
    courses,
  };
  await redisClient.set(cacheKey, JSON.stringify(responseDataObj), {
    EX: 60,
  });

  // SEND RESPONSE
  res.status(200).json(responseDataObj);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const courseId = parseInt(req.params.id);
  const { title, description, price } = req.body;
  const existingCourse = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!existingCourse) {
    throw new AppError("Course not found", 404);
  }

  let thumbnailUrl = existingCourse.thumbnail;
  let thumbnailPublicId = existingCourse.thumbnailPublicId;

  if (req.file) {
    // Delete old image
    if (existingCourse.thumbnailPublicId) {
      await cloudinary.uploader.destroy(existingCourse.thumbnailPublicId);
    }

    // Upload new image
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: "lms/courses",
      },
    );

    thumbnailUrl = result.secure_url;
    thumbnailPublicId = result.public_id;
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: {
      title: title || existingCourse.title,
      description: description || existingCourse.description,
      price: price !== undefined ? parseFloat(price) : existingCourse.price,
      thumbnail: thumbnailUrl,
      thumbnailPublicId: thumbnailPublicId,
    },
  });
  await clearCourseCache();

  res.status(200).json({
    success: true,
    message: "Course updated successfully",
    course: updatedCourse,
  });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const courseId = parseInt(req.params.id);
  const existingCourse = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!existingCourse) {
    throw new AppError("Course not found", 404);
  }
  await prisma.course.delete({
    where: { id: courseId },
  });
  await clearCourseCache();
  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});
