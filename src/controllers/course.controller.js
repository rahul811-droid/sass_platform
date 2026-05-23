import prisma from "../config/db.js";
import asyncHandler from '../utils/asyncHandler.js'
import AppError from '../utils/AppErrors.js';
import { file, success } from 'zod';


export const createCourse = asyncHandler(async (req, res) =>{
            const {title, description, price} = req.body;
            if(!title || !description || !price){
                throw new AppError('All fields are required', 400);
            }
            const course = await prisma.course.create({
                data:{
                    title,
                    description,
                    price: parseFloat(price)
                }
            })
            res.status(201).json({
                success:true,
                menubar: 'Course created successfully',
                course
            })
})


export const getCourses = asyncHandler(async(req,res,)=>{
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const skip = (page-1)*limit;
            const search = req.query.search || '';
            const sortby = req.query.sortby || 'createdAt';
            const order = req.query.order || 'desc';
            const minimumPrice = req.query.minimumPrice || 0;
            const maxPrice = req.query.maxPrice || 100000;

            const where = {
                AND:[
                    {title:{contains:search,mode:'insensitive'}},
                    {price:{gte: parseFloat(minimumPrice), lte: parseFloat(maxPrice)}}
                ]
            }

            const totalCourses = await prisma.course.count({where});
            const courses  = await prisma.course.findMany({
            where,
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy:{
                [sortby]: order
            }
        })
        res.status(200).json({
            success:true,
            pagination:{
                totalCourses,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCourses/limit),
                limit: parseInt(limit)
            },
            filters:{
                search,
                minimumPrice,
                maxPrice,
                sortby,
                order
            },
            courses
        })

})