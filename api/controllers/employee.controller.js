import { isValidObjectId } from "mongoose";
import { errorHandler } from "../utils/index.js";
import User from "../models/user.model.js";
import Attendance from "../models/attendance.model.js";
import employeeCTCModel from "../models/employeeCTC.model.js";
import LeaveApplication from "../models/leaveApplication.model.js";

export const getEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(errorHandler(400, "Id is required!"));
    }

    if (!isValidObjectId(id)) {
      return next(errorHandler(400, "Id is not a valid"));
    }

    if (req.user.id !== id) {
      return next(
        errorHandler(403, "You do not have permission to access this user.")
      );
    }

    const userData = await User.findById(id);

    if (!userData) {
      return next(errorHandler(404, "Requested user does not exist!"));
    }

    res.status(200).json(userData);
  } catch (error) {
    console.log(error);
  }
};


// Employee Check-In
export const checkIn = async (req, res) => {
  const userId = req.user.id;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's already a check-in for today
    const existingAttendance = await Attendance.findOne({ userId, date: today });
    if (existingAttendance) {
      return res.status(400).json({ message: "You have already checked in for today." });
    }

    // Create a new attendance record with check-in time
    const attendance = new Attendance({
      userId,
      checkInTime: new Date(),
      date: today,
    });

    await attendance.save();
    res.status(201).json({ message: "Check-in successful", attendance });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ message: "Server error during check-in." });
  }
};

// Employee Check-Out
export const checkOut = async (req, res) => {
  const userId = req.user.id;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the check-in record for today
    const attendance = await Attendance.findOne({ userId, date: today });
    if (!attendance) {
      return res.status(400).json({ message: "No check-in record found for today." });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: "You have already checked out for today." });
    }

    // Update check-out time and calculate duration
    const checkOutTime = new Date();
    const duration = ((checkOutTime - attendance.checkInTime) / (1000 * 60 * 60)).toFixed(2); // Convert milliseconds to hours

    attendance.checkOutTime = checkOutTime;
    attendance.duration = parseFloat(duration); // Save duration in hours (as a number)

    await attendance.save();
    res.status(200).json({ message: "Check-out successful", attendance });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({ message: "Server error during check-out." });
  }
};


export const getEmployeeCTC = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(errorHandler(400, "Id is required!"));
    }

    if (!isValidObjectId(id)) {
      return next(errorHandler(400, "Id is not a valid"));
    }

    if (req.user.role !== "admin" && req.user.id !== id) {
      return next(errorHandler(403, "You are not allowed to access this API"));
    }

    // Find the CTC data for the specified user
    const ctcData = await employeeCTCModel
      .findOne({ employeeId: id })
      .populate("employeeId", "firstName lastName email");

    if (!ctcData) {
      return next(errorHandler(404, "CTC data not found for this user"));
    }

    return res.status(200).json({
      message: "CTC data retrieved successfully",
      ctc: ctcData,
    });
  } catch (error) {
    console.error(error.message);
    return next(errorHandler(500, "Internal Server Error"));
  }
};


export const applyLeave = async (req, res) => {
  try {
    const {
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
    } = req.body;

    // Validate required fields
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // Calculate total days of leave
    const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 3600 * 24)) + 1;

    // Create a new leave application
    const leaveApplication = new LeaveApplication({
      employeeId,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
    });

    // Save the leave application to the database
    await leaveApplication.save();

    return res.status(201).json({ message: 'Leave application submitted successfully.', leaveApplication });
  } catch (error) {
    console.error('Error applying for leave:', error);
    return res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};


export const getAllLeaveApplications = async (req, res) => {
  try {
    // Fetch all leave applications from the database
    const {employeeId} = req.query;
    const leaveApplications = await LeaveApplication.find({employeeId}).sort({ createdAt: -1 }); // Sort by creation date (newest first)

    return res.status(200).json({ message: 'Leave applications retrieved successfully.', leaveApplications });
  } catch (error) {
    console.error('Error retrieving leave applications:', error);
    return res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

// Helper function to generate date ranges
const getDateRange = (period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case "weekly":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      break;
    case "monthly":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the current month
      break;
    case "yearly":
      startDate = new Date(now.getFullYear(), 0, 1); // First day of the current year
      break;
    case "today":
    default:
      startDate = new Date(now.setHours(0, 0, 0, 0)); // Midnight of current day
  }

  return { startDate, endDate: now };
};

// Controller function
export const getAttendance = async (req, res, next) => {
  const { userId } = req.query;
  const period = req.query.period || "today"; // Default to 'today' if not provided
  const { startDate, endDate } = getDateRange(period);

  if(userId !== req.user.id) {
    return next(403, "You do not have permission to access this user attendance data!");
  }

  try {
    // Fetch attendance data within the date range
    const attendanceData = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Calculate total worked hours
    const workedHours = attendanceData.reduce((total, record) => total + (record.duration || 0), 0);

    // Calculate total working hours based on the period
    let totalWorkingHours;
    if (period === "weekly") {
      totalWorkingHours = 5 * 8; // 5 working days * 8 hours
    } else if (period === "monthly") {
      totalWorkingHours = 20 * 8; // 20 working days in a month * 8 hours
    } else if (period === "yearly") {
      totalWorkingHours = 240 * 8; // Approx 240 working days in a year * 8 hours
    } else {
      totalWorkingHours = 8; // Single day
    }

    // Respond with structured data
    res.status(200).json({
      attendanceData,
      workedHours,
      totalWorkingHours
    });
  } catch (error) {
    console.error("Error retrieving attendance data:", error);
    res.status(500).json({ error: "Failed to retrieve attendance data" });
  }
};
