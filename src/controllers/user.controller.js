import prisma from "../config/db.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUserSchema } from "../validations/auth.validation.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createUser = asyncHandler(async (req, res, next) => {
  const validateData = createUserSchema.safeParse(req.body);

  if (!validateData.success) {
    return next(new AppError("Invalid input data", 400));
  }

  const { name, email, password } = validateData.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return next(new AppError("User already exists", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = page > 1 ? (page - 1) * 10 : 0;
  const search = req.query.search || "";
  const sortby = req.query.sortby || "id";
  const sortorder = req.query.sortorder || "desc";
  const role = req.query.role || "";

  const where = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      role ? { role: role } : {},
    ],
  };

  const totalUsers = await prisma.user.count({ where });

  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  res.status(200).json({
    success: true,
    pagination: {
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      limit,
    },
    filters:{
      search,
      sortby,
      sortorder,
      role
    },
    users,
  });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return next(new AppError("Invalid credentials", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
  });
});

export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});
