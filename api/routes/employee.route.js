import express from "express";
import { verifyToken } from "../utils/index.js";
import {
  checkIn,
  checkOut,
  getAttendance,
  getEmployee,
  getEmployeeCTC,
  addPersonalGoal,
  editPersonalGoal,
  getPersonalGoal,
  deletePersonalGoal,
  getFeedbacks,
  getAllLeaveApplications,
  applyLeave,
  getLeaveApplicationStatus,
  sendMail,
  getMails,
  markAsRead,
  getHrMails,
  getAllJobs,
  getJob,
  createJobApplication,
  getMyPerformance,
} from "../controllers/employee.controller.js";
import { allProgress, courseProgress, employeeCourse, updateProgress } from "../controllers/progress.controller.js";

const router = express();

router.get("/user/:id?", verifyToken, getEmployee);
router.get("/ctc/:id?", verifyToken, getEmployeeCTC);
router.post("/check-in", verifyToken, checkIn);
router.post("/check-out", verifyToken, checkOut);
router.get("/all-leaves", verifyToken, getAllLeaveApplications);
router.get("/leave-application-status", verifyToken, getLeaveApplicationStatus);
router.post("/apply-leave", verifyToken, applyLeave);
router.get("/attendance", verifyToken, getAttendance);
router.post("/add-goal", verifyToken, addPersonalGoal);
router.patch("/edit-goal/:goalId?", verifyToken, editPersonalGoal);
router.get("/all-goal", verifyToken, getPersonalGoal);
router.delete("/delete-goal/:goalId?", verifyToken, deletePersonalGoal);
router.get("/feedbacks", verifyToken, getFeedbacks);
router.post("/send-mail", verifyToken, sendMail);
router.get("/get-mails", verifyToken, getMails);
router.patch("/mark-as-read", verifyToken, markAsRead);
router.get("/hr-mails", verifyToken, getHrMails);
router.get("/get-all-job-openings", getAllJobs);
router.get("/job/:id?", getJob);
router.post("/apply-job", createJobApplication);
router.get("/get-my-performance", verifyToken, getMyPerformance);
router.patch('/update', verifyToken, updateProgress);
router.get('/course-progress/:courseId/progress/:userId', verifyToken, courseProgress);
router.get('/employee-course', verifyToken, employeeCourse);
router.get('/all-progress', verifyToken, allProgress);


export default router;
