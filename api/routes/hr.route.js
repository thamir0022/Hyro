import express from "express";
import { verifyToken } from "../utils/index.js";
import {
  addEmployee,
  addFeedback,
  deleteEmployee,
  editEmployee,
  getAllLeaveApplications,
  getAttendance,
  getEmployee,
  getEmployeeMails,
  getEmployees,
  getMails,
  search,
  sendMail,
  updateLeaveApplicationStatus,
} from "../controllers/hr.controller.js";

const app = express();

app.get("/employees", verifyToken, getEmployees);
app.get("/employee-mails", verifyToken, getEmployeeMails);
app.post("/add-employee", verifyToken, addEmployee);
app.get("/employee/:id?", verifyToken, getEmployee);
app.put("/employee/edit", verifyToken, editEmployee);
app.delete("/delete-employee/:id?", verifyToken, deleteEmployee);
app.get("/search", verifyToken, search);
app.get("/leave-applications", verifyToken, getAllLeaveApplications);
app.patch(
  "/update-leave-application-status/:id?",
  verifyToken,
  updateLeaveApplicationStatus
);
app.get("/employee-attendance", verifyToken, getAttendance);
app.post("/feedback", verifyToken, addFeedback);
app.post("/send-mail", verifyToken, sendMail);
app.get("/get-mails", verifyToken, getMails);

export default app;