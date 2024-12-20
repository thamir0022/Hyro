import { isValidObjectId } from "mongoose";
import { errorHandler } from "../utils/index.js";
import User from "../models/user.model.js";
import Attendance from "../models/attendance.model.js";
import employeeCTCModel from "../models/employeeCTC.model.js";
import LeaveApplication from "../models/leaveApplication.model.js";
import PersonalGoal from "../models/personalGoal.model.js";
import Feedback from "../models/feedback.model.js";
import Mail from "../models/mail.model.js";
import Job from "../models/job.model.js";
import JobApplication from "../models/jobApplication.model.js";
import Course from "../models/course.model.js";
import Progress from "../models/progress.model.js";


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
    const existingAttendance = await Attendance.findOne({
      userId,
      date: today,
    });
    if (existingAttendance) {
      return res
        .status(400)
        .json({ message: "You have already checked in for today." });
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
      return res
        .status(400)
        .json({ message: "No check-in record found for today." });
    }

    if (attendance.checkOutTime) {
      return res
        .status(400)
        .json({ message: "You have already checked out for today." });
    }

    // Update check-out time and calculate duration
    const checkOutTime = new Date();
    const duration = (
      (checkOutTime - attendance.checkInTime) /
      (1000 * 60 * 60)
    ).toFixed(2); // Convert milliseconds to hours

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
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    // Validate required fields
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }

    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Calculate total days of leave
    const totalDays =
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 3600 * 24)
      ) + 1;

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

    return res.status(201).json({
      message: "Leave application submitted successfully.",
      leaveApplication,
    });
  } catch (error) {
    console.error("Error applying for leave:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

export const getAllLeaveApplications = async (req, res) => {
  try {
    // Fetch all leave applications from the database
    const { employeeId } = req.query;
    const leaveApplications = await LeaveApplication.find({ employeeId }).sort({
      createdAt: -1,
    }); // Sort by creation date (newest first)

    return res.status(200).json({
      message: "Leave applications retrieved successfully.",
      leaveApplications,
    });
  } catch (error) {
    console.error("Error retrieving leave applications:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

export const getLeaveApplicationStatus = async (req, res, next) => {
  try {
    const userId = req.user.id || req.query.userId;

    // Get the current date
    const currentDate = new Date();

    // Get the start and end date of the current month
    const currentMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ); // First day of current month
    const currentMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ); // Last day of current month

    // Find leave applications for the current month
    const leaveApplications = await LeaveApplication.find({
      employeeId: userId,
      startDate: { $gte: currentMonthStart, $lte: currentMonthEnd }, // Filter by date range (start date within current month)
    });

    // Count the leave applications by status
    const approvedLeaves = leaveApplications.filter(
      (leave) => leave.status === "Approved"
    ).length;
    const pendingLeaves = leaveApplications.filter(
      (leave) => leave.status === "Pending"
    ).length;
    const rejectedLeaves = leaveApplications.filter(
      (leave) => leave.status === "Rejected"
    ).length;

    // Check if the employee has exceeded the allowed leave limit (e.g., 4 leaves in the current month)
    const totalLeaves = approvedLeaves + pendingLeaves; // Pending ones are not approved yet, but still count towards the limit
    if (totalLeaves > 4) {
      return res.status(200).json({
        message: "You cannot have more than 4 leaves in a month.",
        approvedLeaves,
        pendingLeaves,
        rejectedLeaves,
        appliedLeaves: leaveApplications.length,
      });
    }

    // If total leaves are less than 4, calculate remaining leaves
    const remainingLeaves = 4 - totalLeaves;

    res.status(200).json({
      approvedLeaves,
      pendingLeaves,
      rejectedLeaves,
      totalLeavesForTheMonth: totalLeaves,
      appliedLeaves: leaveApplications.length,
      message: `You have ${remainingLeaves} leaves remaining`,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error.message || "Internal server error. Please try again later.",
    });
  }
};

// Helper function to generate date ranges
const getDateRange = (period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case "weekly":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
      );
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

  if (userId !== req.user.id) {
    return next(
      403,
      "You do not have permission to access this user attendance data!"
    );
  }

  try {
    // Fetch attendance data within the date range
    const attendanceData = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Calculate total worked hours
    const workedHours = attendanceData.reduce(
      (total, record) => total + (record.duration || 0),
      0
    );

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
      totalWorkingHours,
    });
  } catch (error) {
    console.error("Error retrieving attendance data:", error);
    res.status(500).json({ error: "Failed to retrieve attendance data" });
  }
};

// Personal Goal fuction of employee

export const addPersonalGoal = async (req, res, next) => {
  try {
    const { title, description, targetDate } = req.body;
    const userId = req.user.id;

    if (!title || !description || !targetDate) {
      return next(errorHandler(400, "Reaquired all feilds."));
    }

    const employee = await User.findById(userId);
    if (!employee) {
      return next(errorHandler(404, "Employee not found."));
    }

    const newGoal = new PersonalGoal({
      title,
      description,
      userId,
      targetDate,
      completed: false,
    });

    await newGoal.save();

    return res.status(201).json({
      sucess: true,
      message: "Personal goal adedd succesfully.",
      newGoal,
    });
  } catch (error) {
    console.error("Error adding personal goal", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

// retrieve personal goal

export const getPersonalGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const personalGoals = await PersonalGoal.find({ userId }).sort({
      createdAt: -1,
    });
    if (!personalGoals || personalGoals.length === 0) {
      return next(
        errorHandler(404, "No personal goal found for this employee")
      );
    }

    return res.status(200).json({
      success: true,
      personalGoals,
      message: "Personal goals retrived Successfully",
      totalGoals: personalGoals.length,
    });
  } catch (error) {
    console.error("Error getting personal goal", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Edit personal goal

export const editPersonalGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    if (!goalId || !isValidObjectId(goalId)) {
      return next(
        errorHandler(
          400,
          goalId ? "Goal id is Invalied" : "Goal id is Required"
        )
      );
    }
    const { title, description, targetDate, completed } = req.body;

    if (!title || !description || !targetDate) {
      return next(errorHandler(400, "All fields are required"));
    }

    const UpdatedGoal = await PersonalGoal.findOneAndUpdate(
      { _id: goalId, userId },
      { title, description, targetDate, completed },
      { new: true, runValidators: true }
    );

    if (!UpdatedGoal) {
      return next(
        errorHandler(
          404,
          "personal goal not found or not authorized by this employee"
        )
      );
    }

    return res.status(200).json({
      sucess: true,
      message: "Personal goal updated succesfully",
      updatedGoal: UpdatedGoal,
    });
  } catch (error) {
    console.error("error updating personal goal", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete personal goal

export const deletePersonalGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    if (!goalId || !isValidObjectId(goalId)) {
      return next(
        errorHandler(
          400,
          goalId ? "Goal id is Invalied" : "Goal id is Required"
        )
      );
    }

    const deleteGoal = await PersonalGoal.findOneAndDelete({
      _id: goalId,
      userId,
    });

    if (!deleteGoal) {
      return next(
        errorHandler(
          404,
          "Personal goal not found or not accessible by this employee"
        )
      );
    }

    return res
      .status(200)
      .json({ success: true, message: "personal goal deleted successfully" });
  } catch (error) {
    console.error("error deleting personal goal", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const getFeedbacks = async (req, res, next) => {
  try {
    const userId = req.query.userId || req.user.id;

    if (!userId) {
      return next(errorHandler(400, "User ID is required!"));
    }

    // Fetch all feedbacks for the user
    const feedbacks = await Feedback.find({ userId })
      .populate("hr", "firstName lastName")
      .sort({ createdAt: -1 });

    if (!feedbacks || feedbacks.length === 0) {
      return next(errorHandler(404, "You have no feedbacks from the HR"));
    }

    res.status(200).json(feedbacks);
  } catch (error) {
    // Handle unexpected errors
    next(errorHandler(500, "Internal Server Error"));
  }
};

export const getMails = async (req, res, next) => {
  try {
    const filter = req.query.filter || "all"; // Can be "sent", "received", or "all"

    let receivedMails = [];
    let sentMails = [];

    // Fetch and sort received mails
    if (filter === "received" || filter === "all") {
      receivedMails = await Mail.find({ receiver: req.user.id })
        .populate("sender", "firstName lastName")
        .sort({ readAt: 1, createdAt: -1 }); // Sort unread first, then latest
    }

    // Fetch and sort sent mails
    if (filter === "sent" || filter === "all") {
      sentMails = await Mail.find({ sender: req.user.id })
        .populate("receiver", "firstName lastName")
        .sort({ readAt: 1, createdAt: -1 }); // Sort unread first, then latest
    }

    const response = {};

    // Attach data based on the filter
    if (filter === "received" && receivedMails.length) {
      response.receivedMails = receivedMails;
    } else if (filter === "sent" && sentMails.length) {
      response.sentMails = sentMails;
    } else if (filter === "all") {
      if (receivedMails.length) response.receivedMails = receivedMails;
      if (sentMails.length) response.sentMails = sentMails;
    }

    // If no data is found, send 404
    if (!Object.keys(response).length) {
      return next(errorHandler(404, "No mails available for you"));
    }

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "An error occurred while fetching mails"));
  }
};

export const sendMail = async (req, res, next) => {
  const { sender, receiver, subject, content } = req.body;

  if (!sender || !receiver || !subject || !content) {
    return next(errorHandler(400, "All fields are required"));
  }

  if (!isValidObjectId(sender) || !isValidObjectId(receiver)) {
    return next(
      errorHandler(400, "You can't send an email with these user id")
    );
  }

  if (sender !== req.user.id) {
    return next(
      errorHandler(
        401,
        "You are not allowed to send an email with this user id"
      )
    );
  }

  try {
    const newMail = new Mail({
      sender,
      receiver,
      subject,
      content,
    });

    await newMail.save();

    res.status(200).json({ success: true, message: "Mail sent successfully" });
  } catch (error) {
    console.log(error);
  }
};

export const markAsRead = async (req, res, next) => {
  const { status, mailId } = req.body;

  if (
    !status ||
    !["sent", "read", "archived"].includes(status) ||
    !mailId ||
    !isValidObjectId(mailId)
  ) {
    const errorMessage = !status
      ? "Status is required!"
      : !["sent", "read", "archived"].includes(status)
      ? `Invalid status: '${status}'. Status should be one of sent, read, or archived.`
      : "Invalid mailId provided.";

    return next(errorHandler(400, errorMessage));
  }
  try {
    const updatedMail = await Mail.findByIdAndUpdate(
      mailId,
      { status, readAt: status === "read" ? new Date() : null },
      { new: true }
    );

    if (!updatedMail) {
      return next(errorHandler(404, "Email not found"));
    }

    res.status(200).json({
      success: true,
      message: `Mail status updated to ${status}`,
      updatedMail,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getHrMails = async (req, res, next) => {
  try {
    // Fetch hr with email addresses, sorted in ascending order by email
    const hr = await User.find({ role: { $in: ["hr", "admin"] } })
      .select("_id email") // Select both _id and email fields
      .sort({ email: 1 }); // Sort by email in ascending order

    // Check if there are any employees
    if (!hr.length) {
      return next(errorHandler(404, "No HR found"));
    }

    res.status(200).json({
      success: true,
      user: hr, // Return array of hr with _id and email
    });
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "An error occurred while fetching employee emails"));
  }
};

export const getAllJobs = async (req, res, next) => {
  try {
    const allJobs = await Job.find()
      .populate("postedBy", "firstName lastName")
      .sort({ createdAt: -1 });
    if (!allJobs) {
      return next(errorHandler(404, "No openings found!"));
    }

    res.status(200).json({ success: true, allJobs });
  } catch (error) {
    next(
      errorHandler(500, `Error fetching job openings, Error ${error.message}`)
    );
    console.log(error);
  }
};

export const getJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return next(
        errorHandler(400, id ? "Invalid Job ID" : "Job ID is required!")
      );
    }

    const job = await Job.findById(id).populate(
      "postedBy",
      "firstName lastName"
    );
    if (!job) {
      return next(
        errorHandler(
          404,
          `Job with ID ${id} not found or may have been deleted.`
        )
      );
    }

    res.status(200).json({ success: true, job });
  } catch (error) {
    next(errorHandler(500, "An error occurred while retrieving the job."));
  }
};

export const createJobApplication = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    linkedInProfile,
    portfolio,
    jobId,
    education,
    workExperience,
    willingToRelocate,
    expectedSalaryRange,
  } = req.body;

  // Validate required fields
  const missingFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "jobId",
    "education",
    "willingToRelocate",
    "expectedSalaryRange",
  ].filter((field) => !req.body[field]);

  if (missingFields.length) {
    return next(
      errorHandler(400, `Missing required fields: ${missingFields.join(", ")}`)
    );
  }

  if (!Array.isArray(education) || education.length === 0) {
    return next(errorHandler(400, "Education must be an array with at least one entry."));
  }

  // Validate education entries
  for (const edu of education) {
    if (!edu.degree || !edu.institutionName || !edu.graduationYear) {
      return next(
        errorHandler(400, "Each education entry must have degree, institutionName, and graduationYear.")
      );
    }
  }

  try {
    // Validate Job ID
    const job = await Job.findById(jobId);
    if (!job) {
      return next(errorHandler(404, "Job not found"));
    }

    // Create new candidate application
    const newApplication = new JobApplication({
      firstName,
      lastName,
      email,
      phone,
      linkedInProfile,
      portfolio,
      jobId,
      education,
      workExperience: workExperience || [], // Optional field
      willingToRelocate,
      expectedSalaryRange,
    });

    // Save the application
    await newApplication.save();

    res
      .status(201)
      .json({ success: true, message: "Application submitted successfully", application: newApplication });
  } catch (error) {
    next(errorHandler(500, `Error on job application, Error: ${error.message}`));
  }
};


export const getMyPerformance = async (req, res, next) => {
  const { id } = req.user;

  if (!id || !isValidObjectId(id)) {
    return next(errorHandler(400, id ? "ID is not valid" : "ID is required"));
  }

  try {
    const user = await User.findById(id);

    if(!user){
      return next(errorHandler(404, "User not found!"));
    }

    const employeePerfomance = {};
    employeePerfomance.monthlyPerfomance = user.performance;
    employeePerfomance.totalPerformance = user.totalPerformance;

    res.status(200).json({success: false, message: "Employee perfomance successfully retrived", employeePerfomance});

  } catch (error) {
    next(errorHandler(500, `Error fetching perfomance, Error: ${error.message}`));
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate("createdBy", "name email") // Populates the admin's name and email
      .sort({ createdAt: -1 });

    if (!courses || courses.length === 0) {
      return next(errorHandler(404, "No courses found"));
    }

    return res.status(200).json({
      success: true,
      courses,
      message: "Courses retrieved successfully",
      totalCourses: courses.length,
    });
  } catch (error) {
    console.error("Error retrieving courses", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// Get all courses assigned to an employee along with progress
export const getEmployeeCoursesAndProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all courses assigned to the employee
    const courses = await Course.find({ assignedTo: userId }).populate("createdBy", "name email");

    if (!courses.length) {
      return res.status(404).json({ message: "No courses assigned to this employee." });
    }

    // Fetch progress data for the employee
    const progress = await Progress.find({ userId }).populate("courseId", "title description");

    // Map courses with their progress
    const courseData = courses.map((course) => {
      const courseProgress = progress.find((prog) => prog.courseId.toString() === course._id.toString());
      return {
        courseId: course._id,
        title: course.title,
        description: course.description,
        playlist: course.playlist,
        createdBy: course.createdBy,
        progress: courseProgress
          ? {
              totalVideos: courseProgress.totalVideos,
              completed: courseProgress.completed,
              videosWatched: courseProgress.videosWatched,
            }
          : null, // No progress recorded for this course
      };
    });

    res.status(200).json(courseData);
  } catch (error) {
    console.error("Error fetching courses and progress:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get progress for a specific course of an employee
export const getCourseProgressForEmployee = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    // Find the progress for the specific course and employee
    const progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      return res.status(404).json({ message: "No progress found for this course and employee." });
    }

    res.status(200).json({
      courseId: progress.courseId,
      totalVideos: progress.totalVideos,
      completed: progress.completed,
      videosWatched: progress.videosWatched,
    });
  } catch (error) {
    console.error("Error fetching course progress:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};