import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './src/routes/user.route.js';
import courseRoutes from './src/routes/course.route.js';
import errorMiddleware from './src/middleware/error.middler.js';


const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());


app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use(errorMiddleware)
app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});