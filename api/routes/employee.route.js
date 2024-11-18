import express from 'express';
import { verifyToken } from '../utils/index.js';
import { applyLeave, checkIn, checkOut, getAllLeaveApplications, getAttendance, getEmployee, getEmployeeCTC,addPersonalGoal, editPersonalGoal, getPersonalGoal, deletePersonalGoal } from '../controllers/employee.controller.js';


const app = express();

app.get("/user/:id?", verifyToken, getEmployee);
app.get("/ctc/:id?", verifyToken, getEmployeeCTC);
app.post('/check-in', verifyToken, checkIn);
app.post('/check-out', verifyToken, checkOut);
app.post('/apply-leave', verifyToken, applyLeave);
app.get('/all-leaves', verifyToken, getAllLeaveApplications);
app.get('/attendance', verifyToken, getAttendance );
app.post('/add-goal', verifyToken, addPersonalGoal)
app.patch('/edit-goal/:goalId?', verifyToken, editPersonalGoal);
app.get('/all-goal', verifyToken, getPersonalGoal);
app.delete('/delete-goal/:goalId?', verifyToken, deletePersonalGoal);

export default app;