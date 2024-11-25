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
} from "../controllers/employee.controller.js";

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

export default router;
