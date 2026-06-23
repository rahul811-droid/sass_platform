import express from 'express';
import cors from 'cors';
import userRoutes from './src/routes/user.route.js';
import courseRoutes from './src/routes/course.route.js';
import enrollmentRoutes from './src/routes/enrollment.route.js';
import authRoute from './src/routes/auth.route.js';
import errorMiddleware from './src/middleware/error.middler.js';
import rateLimit from './src/middleware/rateLimit.middleware.js';
import cloudinary from './src/config/cloudinary.js';

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

app.use(rateLimit);
app.use('/api/auth', authRoute);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use(errorMiddleware)
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get("/test-upload", async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    );

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});