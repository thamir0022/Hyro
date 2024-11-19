import express from 'express';
import { verifyToken } from '../utils/index.js';
import { addEmployee, addFeedback, deleteEmployee, editEmployee, getAllLeaveApplications, getAttendance, getEmployee, getEmployees, search, updateLeaveApplicationStatus } from '../controllers/hr.controller.js';

const app = express();

app.get("/employees", verifyToken, getEmployees);
app.post("/add-employee", verifyToken, addEmployee);
app.get("/employee/:id?", verifyToken, getEmployee);
app.put("/employee/edit", verifyToken, editEmployee);
app.delete("/delete-employee/:id?", verifyToken, deleteEmployee);
app.get("/search", verifyToken, search);
app.get("/leave-applications", verifyToken, getAllLeaveApplications);
app.patch("/update-leave-application-status/:id?", verifyToken, updateLeaveApplicationStatus);
app.get("/employee-attendance", verifyToken, getAttendance);
app.post("/feedback", verifyToken, addFeedback);

export default app;