import express from "express";
import { verifyToken } from "../utils/index.js";
import {
  addCourse,
  addEmployee,
  addFeedback,
  addJob,
  addPerformance,
  assignCourseToEmployees,
  deleteCourse,
  deleteEmployee,
  editCourse,
  editEmployee,
  getAllEmployeeProgress,
  getAllJobApplications,
  getAllLeaveApplications,
  getAttendance,
  getEmployee,
  getEmployeeMails,
  getEmployees,
  getJobApllication,
  getMails,
  getPerfomance,
  markAsRead,
  search,
  sendMail,
  updateLeaveApplicationStatus,
} from "../controllers/hr.controller.js";
import { progressEnroll } from "../controllers/progress.controller.js";

const router = express();

router.get("/employees", verifyToken, getEmployees);
router.get("/employee-mails", verifyToken, getEmployeeMails);
router.post("/add-employee", verifyToken, addEmployee);
router.get("/employee/:id?", verifyToken, getEmployee);
router.put("/employee/edit", verifyToken, editEmployee);
router.delete("/delete-employee/:id?", verifyToken, deleteEmployee);
router.get("/search", verifyToken, search);
router.get("/leave-applications", verifyToken, getAllLeaveApplications);
router.patch(
  "/update-leave-application-status/:id?",
  verifyToken,
  updateLeaveApplicationStatus
);
router.get("/employee-attendance", verifyToken, getAttendance);
router.post("/feedback", verifyToken, addFeedback);
router.post("/send-mail", verifyToken, sendMail);
router.get("/get-mails", verifyToken, getMails);
router.patch("/mark-as-read", verifyToken, markAsRead);
router.post("/add-job", verifyToken, addJob);
router.get("/get-all-job-applications", verifyToken, getAllJobApplications);
router.get("/get-job-application/:id?", verifyToken, getJobApllication);
router.post("/add-perfomance/:id?", verifyToken, addPerformance);
router.get("/get-perfomance/:id?", verifyToken, getPerfomance);
router.get("/get-all-employee-progress", verifyToken, getAllEmployeeProgress);
router.post('/enroll', verifyToken,progressEnroll);
router.post('/add-course', verifyToken, addCourse);
router.delete('/delete-course/:courseId', verifyToken, deleteCourse);
router.post('/assign-course', verifyToken, assignCourseToEmployees);
router.patch('/edit-course/:courseId', verifyToken, editCourse);

export default router;