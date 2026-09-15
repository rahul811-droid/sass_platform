import prisma from "../config/db.js";
import AppError from "../utils/AppErrors.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createLession = asyncHandler(async (req, res) => {
  const sectionId = parseInt(req.params.sectionId);
  const { title, description, videoUrl, order, content, duration } = req.body;
  if (!title) {
    throw new AppError("Title is required", 400);
  }
  const section = await prisma.section.findUnique({
    where: {
      id: sectionId,
    },
  });
  if (!section) {
    throw new AppError("Section not found", 404);
  }
  const lesson = await prisma.lesson.create({
    data: {
      title,
      description,
      videoUrl,
      order: order || 1,
      content,
      duration,
      sectionId,
    },
  });
  res.status(201).json({
    success: true,
    message: "Lesson created successfully",
    lesson,
  });
});

export const getLessonsBySection = asyncHandler(async (req, res) => {
  const sectionId = parseInt(req.params.sectionId);
  const section  = await prisma.section.findUnique({
    where:{
        id:sectionId
    }
  })
  if(!section){
    throw new AppError("Section not found", 404);
  }
  const lessons = await prisma.lesson.findMany({
    where: {
      sectionId: sectionId,
    },
    orderBy: {
      order: "asc",
    },
  })
  return res.status(200).json({
    success: true,
    message: "Lessons retrieved successfully",
    lessons,
  });
});


export const updateLesson = asyncHandler(async(req,res)=>{
    const lessonId = parseInt(req.params.lessonId);
    const {title, description, videoUrl, order, content, duration} = req.body;
    const existingLession = await prisma.lesson.findUnique({
        where:{
            id:lessonId
        }
    })
    if(!existingLession){
        throw new AppError("Lesson not found", 404);
    }
    const UpdateLesson = await prisma.lesson.update({
        where:{
            id:lessonId
        },
        data:{
            title: title ?? existingLession.title,
            description: description ?? existingLession.description,
            videoUrl: videoUrl ?? existingLession.videoUrl,
            order: order ?? existingLession.order,
            content: content ?? existingLession.content,
            duration: duration ?? existingLession.duration
        }
    })
    return res.status(200).json({
        success: true,
        message: "Lesson updated successfully",
        lesson: UpdateLesson
    })
})

export const deleteLesson = asyncHandler(async(req,res)=>{
    const lessonId = parseInt(req.params.lessonId);
    const existingLession = await prisma.lesson.findUnique({
        where:{
            id:lessonId 
        }
    })
    if(!existingLession){
        throw new AppError("Lesson not found", 404);
    }
    await prisma.lesson.delete({
        where:{
            id:lessonId
        }
    })
    return res.status(200).json({
        success: true,
        message: "Lesson deleted successfully"
    })
})