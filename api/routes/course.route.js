import express from "express";
import { verifyToken } from "../utils/index.js";
import { addCourse, deleteCourse, editCourse, getCourses } from "../controllers/course.controller.js";

const app = express();

app.post('/add-course', verifyToken, addCourse);
app.patch('/edit-course/:courseId', verifyToken, editCourse);
app.get('/get-courses', verifyToken,getCourses);
app.delete('/delete-course/:courseId', verifyToken, deleteCourse);

export default app;