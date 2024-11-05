import express from 'express';
import { verifyToken } from '../utils/index.js';
import { applyLeave, checkIn, checkOut, getAllLeaveApplications, getAttendance, getEmployee, getEmployeeCTC } from '../controllers/employee.controller.js';


const app = express();

app.get("/user/:id?", verifyToken, getEmployee);
app.get("/ctc/:id?", verifyToken, getEmployeeCTC);
app.post('/check-in', verifyToken, checkIn);
app.post('/check-out', verifyToken, checkOut);
app.post('/apply-leave', verifyToken, applyLeave);
app.get('/all-leaves', verifyToken, getAllLeaveApplications);
app.get('/attendance', verifyToken, getAttendance );

export default app;