import prisma from '../config/db.js';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUserSchema } from '../validations/auth.validation.js';



export const createUser = async (req, res) => {
  try {
    const validateData = createUserSchema.safeParse(req.body);
    if (!validateData.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: validateData.error.issues
      });
    }
    const { name, email, password } = validateData.data;

    console.log("req.body", req.body);

    
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
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
      user,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json({
      success: true,
      users,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};


export const loginUser = async(req,res)=>{
      try {
          const {email,password} = req.body;
          const user = await prisma.user.findUnique({
            where:{
              email
            }
          })

          if(!user){
            return res.status(404).json({
              success:false,
              message:"User not found"
            })
          }

          const isMatch  = await bcrypt.compare(password,user.password);
          if(!isMatch){
            return res.status(400).json({
              success:false,
              message:"Invalid credentials"
            })
          }
          const token = jwt.sign({id:user.id},process.env.JWT_SECRET,{
          expiresIn:"1d"
        })
        res.json({
          success:true,
          message:"Login successful",
          token
        })
      } catch (error) {
        
        console.log(error);
        res.status(500).json({
          success:false,
          message:"Server Error"
        })
        
      }
}

export const getProfile = async(req,res)=>{
      try {
        const user = await prisma.user.findUnique({
          where:{
            id:req.user.id
          },
          select:{
            id:true,
            name:true,
            email:true
          }
        })
        if(!user){
          return res.status(404).json({
            success:false,
            message:"User not found"
          })
        }
        res.json({
          success:true,
          user
        })
      } catch (error) {
          console.log(error);
          res.status(500).json({
            success:false,
            message:"Server Error"
          })
      }

}