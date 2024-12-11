import express from "express";
import { verifyToken } from "../utils";
import { allProgress, courseProgress, employeeCourse, progressEnroll, updateProgress } from "../controllers/progress.controller.js";

const app = express();

app.post('/enroll', verifyToken,progressEnroll);
app.patch('/update', verifyToken, updateProgress);
app.get('/course-progress', verifyToken, courseProgress);
app.get('/employee-course', verifyToken, employeeCourse);
app.get('/all-progress', verifyToken, allProgress);

export default app;