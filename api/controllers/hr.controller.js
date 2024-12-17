import mongoose, { isValidObjectId } from "mongoose";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/index.js";
import employeeCTCModel from "../models/employeeCTC.model.js";
import LeaveApplications from "../models/leaveApplication.model.js";
import bcrypt from "bcryptjs";
import LeaveApplication from "../models/leaveApplication.model.js";
import moment from "moment";
import Attendance from "../models/attendance.model.js";
import Feedback from "../models/feedback.model.js";
import Mail from "../models/mail.model.js";
import Job from "../models/job.model.js";
import JobApplications from "../models/jobApplication.model.js";
import Course from "../models/course.model.js";




export const getEmployees = async (req, res, next) => {
  try {
    // Check if user has 'hr' or 'admin' role
    if (!["hr", "admin"].includes(req.user.role)) {
      return next({
        statusCode: 403,
        message: "You are not allowed to access this API.",
      });
    }

    // Fetch total employee count and top-performing employees, excluding passwords
    const [totalEmployees, employees] = await Promise.all([
      User.countDocuments({ role: "employee" }),
      User.find({ role: "employee" })
        .select("-password")
        .sort({ totalPerformance: -1 }),
    ]);

    res.status(200).json({ totalEmployees, employees });
  } catch (error) {
    console.error(error); // Log error for debugging
    return next(
      errorHandler(
        error.statusCode || 500,
        error.message || "An unexpected error occurred."
      )
    );
  }
};

export const getEmployee = async (req, res, next) => {
  try {
    const { role } = req.user;
    const { id } = req.params;

    // Role check
    if (!["hr", "admin"].includes(role)) {
      return next({ statusCode: 403, message: "Access denied." });
    }

    // Validate ID
    if (!id || !isValidObjectId(id)) {
      return next(
        errorHandler(
          400,
          id ? "Invalid Employee ID." : "Employee ID is required."
        )
      );
    }

    // Find employee
    const employee = await User.findById(id);
    if (!employee) return next(errorHandler(404, "Employee not found."));

    res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    next(error);
  }
};

export const search = async (req, res, next) => {
  try {
    // Extract the search query from the request query
    const { query } = req.query;

    // Check if the query is provided
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // Convert the query to a regular expression for case-insensitive matching
    const regex = new RegExp(query, "i"); // 'i' makes the regex case-insensitive

    // Find employees matching the search term in either first name, last name, or email
    const employees = await User.find({
      role: "employee",
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { email: { $regex: regex } },
      ],
    });

    // Return the results
    return res.status(200).json(employees);
  } catch (error) {
    console.error("Error searching employees:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addEmployee = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      position,
      joiningDate,
      annualCTC,
      monthlyInHand,
      housingAllowance,
      transportAllowance,
      mealAllowance,
      performanceBonus,
      yearEndBonus,
      tax,
      healthInsurance,
      providentFund,
    } = req.body;

    const { role: userRole } = req.user;

    // Permission check
    if (!["admin", "hr"].includes(userRole)) {
      return next(
        errorHandler(403, "You do not have permission to access this API")
      );
    }

    // Check for missing fields
    const missingFields = [
      "firstName",
      "lastName",
      "email",
      "position",
      "annualCTC",
      "monthlyInHand",
      "housingAllowance",
      "transportAllowance",
      "mealAllowance",
      "performanceBonus",
      "yearEndBonus",
      "tax",
      "healthInsurance",
      "providentFund",
    ].filter((field) => !req.body[field]);

    if (missingFields.length) {
      return next(
        errorHandler(
          400,
          `All fields are required! Missing fields: ${missingFields.join(", ")}`
        )
      );
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user entry
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword, // Save hashed password
      position,
      joiningDate,
    });

    // Create CTC entry
    const employeeCTC = await employeeCTCModel.create({
      employeeId: user._id,
      annualCTC,
      monthlyInHand,
      effectiveDate: joiningDate,
      otherComponents: {
        allowances: {
          housingAllowance,
          transportAllowance,
          mealAllowance,
        },
        bonuses: {
          performanceBonus,
          yearEndBonus,
        },
        deductions: {
          tax,
          healthInsurance,
          providentFund,
        },
      },
    });

    return res.status(201).json({
      message: "Employee added successfully!",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        position: user.position,
      },
      employeeCTC,
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Internal Server Error"));
  }
};

export const editEmployee = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const { role: userRole } = req.user;
    const {
      firstName,
      lastName,
      email,
      position,
      joiningDate,
      role,
      annualCTC,
      monthlyInHand,
      housingAllowance,
      transportAllowance,
      mealAllowance,
      performanceBonus,
      yearEndBonus,
      tax,
      healthInsurance,
      providentFund,
    } = req.body;

    // Authorization check
    if (!["admin", "hr"].includes(userRole)) {
      return next(errorHandler(403, "Unauthorized access"));
    }

    // Validation check for userId
    if (!isValidObjectId(userId)) {
      return next(errorHandler(400, "Invalid User ID"));
    }

    // Ensure required fields are provided
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "position",
      "role",
      "annualCTC",
      "monthlyInHand",
      "housingAllowance",
      "transportAllowance",
      "mealAllowance",
      "performanceBonus",
      "yearEndBonus",
      "tax",
      "healthInsurance",
      "providentFund",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length) {
      return next(
        errorHandler(400, `Missing fields: ${missingFields.join(", ")}`)
      );
    }

    // Update user data and CTC data in parallel
    const [updatedUser, updatedCTC] = await Promise.all([
      User.findByIdAndUpdate(
        userId,
        { firstName, lastName, email, role, position, joiningDate },
        { new: true, runValidators: true }
      ),
      employeeCTCModel.findOneAndUpdate(
        { employeeId: userId },
        {
          annualCTC,
          monthlyInHand,
          otherComponents: {
            allowances: {
              housingAllowance,
              transportAllowance,
              mealAllowance,
            },
            bonuses: {
              performanceBonus,
              yearEndBonus,
            },
            deductions: {
              tax,
              healthInsurance,
              providentFund,
            },
          },
        },
        { new: true, upsert: true }
      ),
    ]);

    if (!updatedUser) {
      return next(errorHandler(404, "Employee not found"));
    }

    res.status(200).json({
      message: "Employee data updated successfully",
      data: { user: updatedUser, ctc: updatedCTC },
    });
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "Internal Server Error"));
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    // Check if user has permission to delete
    if (!["admin", "hr"].includes(role)) {
      return next(
        errorHandler(403, "You don't have permission to access this API.")
      );
    }

    // Validate the employee ID
    if (!id || !isValidObjectId(id)) {
      return next(errorHandler(400, "A valid Employee ID is required."));
    }

    // Attempt to delete the employee
    const employee = await User.findByIdAndDelete(id);

    // Handle case where employee does not exist
    if (!employee) {
      return next(
        errorHandler(
          404,
          "Employee does not exist or may have already been deleted."
        )
      );
    }

    // Respond with success message
    res.status(200).json({
      success: true,
      message: `Employee ${employee.firstName} ${employee.lastName} deleted successfully!`,
    });
  } catch (error) {
    next(
      errorHandler(
        500,
        error.message || "An error occurred while deleting the employee."
      )
    );
  }
};

export const getAllLeaveApplications = async (req, res, next) => {
  try {
    const { role } = req.user;

    // Check if user has permission to access this API
    if (!["admin", "hr"].includes(role)) {
      return next(
        errorHandler(403, "You don't have permission to access this API.")
      );
    }

    // Fetch all leave applications
    const leaveApplications = await LeaveApplications.find().populate(
      "employeeId",
      "-password"
    );

    // Return a successful response with leave applications
    res.status(200).json(leaveApplications);
  } catch (error) {
    console.error("Error fetching leave applications:", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

export const updateLeaveApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params; // Get the leave application ID from the request parameters
    const { status, hrComments } = req.body; // Get the action (approve or reject) and optional comments from the request body
    const { role } = req.user; // Get the user role from the request

    console.log(status, hrComments);
    // Check if the user is authorized to approve/reject leave applications
    if (!["admin", "hr"].includes(role)) {
      return next(
        errorHandler(403, "You don't have permission to perform this action.")
      );
    }

    // Find the leave application by ID
    const leaveApplication = await LeaveApplication.findById(id);
    if (!leaveApplication) {
      return next(errorHandler(404, "Leave application not found."));
    }

    // Validate the action
    if (status !== "Approved" && status !== "Rejected") {
      return next(
        errorHandler(400, "Invalid action. Please use 'approve' or 'reject'.")
      );
    }

    // Update the leave application status and add comments if provided
    leaveApplication.status = status;
    leaveApplication.hrComments = hrComments || ""; // Store comments if provided

    // Save the updated leave application
    await leaveApplication.save();

    res.status(200).json({
      message: `Leave application ${status}d successfully.`,
      leaveApplication,
    });
  } catch (error) {
    console.error("Error updating leave application status:", error);
    return next(errorHandler(500, "Internal server error"));
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
export const getAttendance = async (req, res) => {
  const { userId } = req.query;
  const period = req.query.period || "today"; // Default to 'today' if not provided
  const { startDate, endDate } = getDateRange(period);

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

export const addFeedback = async (req, res, next) => {
  if (!["admin", "hr"].includes(req.user.role)) {
    return next(
      errorHandler(401, "You do not have permission to access this API.")
    );
  }

  const { userId, content } = req.body;

  if (!userId || !content) {
    return next(errorHandler(400, "User ID and feedback content is required."));
  }

  try {
    // Create and save the feedback
    const newFeedback = await new Feedback({
      userId,
      hr: req.user.id,
      content,
    }).save();

    // Populate the hr field after saving
    const populatedFeedback = await Feedback.findById(newFeedback._id).populate(
      "hr",
      "firstName lastName"
    );

    res.status(200).json({
      message: "Feedback created successfully",
      feedback: populatedFeedback,
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Internal Server Error"));
  }
};

export const sendMail = async (req, res, next) => {
  const { sender, receiver, subject, content } = req.body;

  if (!["admin", "hr"].includes(req.user.role)) {
    return next(errorHandler(403, "You are not allowed to access this api"));
  }

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

export const getEmployeeMails = async (req, res, next) => {
  // Ensure only admins or HRs can access this API
  if (!["admin", "hr"].includes(req.user.role)) {
    return next(errorHandler(403, "You are not allowed to access this API"));
  }

  try {
    // Fetch employees with email addresses, sorted in ascending order by email
    const employees = await User.find({ role: "employee" })
      .select("_id email") // Select both _id and email fields
      .sort({ email: 1 }); // Sort by email in ascending order

    // Check if there are any employees
    if (!employees.length) {
      return next(errorHandler(404, "No employees found"));
    }

    res.status(200).json({
      success: true,
      user: employees, // Return array of employees with _id and email
    });
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "An error occurred while fetching employee emails"));
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

export const addJob = async (req, res, next) => {
  try {
    const user = req.user;

    // Check user role
    if (!["hr", "admin"].includes(user.role)) {
      return next(errorHandler(401, "You can't access this API"));
    }

    // Extract fields from request body
    const {
      title,
      description,
      jobType,
      department,
      location,
      salaryRange,
      workHours,
      experienceRequired,
      qualifications = [],
      skillsRequired = [],
      applicationDeadline,
      jobStatus = "open",
      email,
      phone,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "jobType",
      "department",
      "location",
      "salaryRange",
      "workHours",
      "experienceRequired",
      "applicationDeadline",
      "email",
      "phone",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length) {
      return next(
        errorHandler(
          400,
          `All fields are required! Missing fields: ${missingFields.join(", ")}`
        )
      );
    }

    // Ensure qualifications and skillsRequired are arrays
    if (!Array.isArray(qualifications) || !Array.isArray(skillsRequired)) {
      return next(
        errorHandler(400, "Qualifications and skillsRequired must be arrays")
      );
    }

    // Create and save job
    const newJob = new Job({
      title,
      description,
      jobType,
      department,
      location,
      salaryRange,
      workHours,
      experienceRequired,
      qualifications,
      skillsRequired,
      applicationDeadline,
      jobStatus,
      postedBy: user.id,
      contactInfo: { email, phone },
    });

    await newJob.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: "New Job Opening Created",
      job: newJob,
    });
  } catch (error) {
    next(
      errorHandler(
        500,
        `An error occurred while creating the job, Error: ${error.message}`
      )
    );
  }
};

export const getAllJobApplications = async (req, res, next) => {
  if (!["hr", "admin"].includes(req.user.role)) {
    return next(errorHandler(401, "You can't access this API"));
  }

  try {
    const applications = await JobApplications.find()
      .populate("jobId", "title applicationDeadline")
      .sort({ createdAt: -1 });

    if (!applications) {
      return res
        .status(404)
        .json({ success: false, message: "No job applications found!" });
    }

    res.status(200).json({ success: true, applications });
  } catch (error) {
    res.json({
      success: false,
      message: "Error fetching all job applications",
      error: error.message,
    });
  }
};

export const getJobApllication = async (req, res, next) => {
  if (!["hr", "admin"].includes(req.user.role)) {
    return next(errorHandler(401, "You can't access this API"));
  }

  const { id } = req.params;

  if (!id || !isValidObjectId(id)) {
    return res
      .status(400)
      .json({
        success: false,
        message: id ? "Job Id is invalid" : "Job Id is required",
      });
  }

  try {
    const application = await JobApplications.findById(id)
      .populate("jobId", "title applicationDeadline")
      .sort({ createdAt: -1 });

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "No job applications found!" });
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    res.json({
      success: false,
      message: "Error fetching all job applications",
      error: error.message,
    });
  }
};

export const getPerfomance = async (req, res, next) => {
  if (!["hr", "admin"].includes(req.user.role)) {
    return next(errorHandler(401, "Your are not allowed to use this API"));
  }

  const { id } = req.params;

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

export const addPerformance = async (req, res, next) => {
  const { id } = req.params;
  const { month, performance, year } = req.body;

  // Check if the user role is authorized
  if (!["hr", "admin"].includes(req.user.role)) {
    return next(errorHandler(401, "You are not allowed to use this API"));
  }

  // Validate `id`, `month`, `performance`, and `year`
  if (!id || !isValidObjectId(id)) {
    return next(errorHandler(400, id ? "ID is not valid" : "ID is required"));
  }

  if (!month || !performance || !year) {
    return next(errorHandler(400, "Month, year, and performance are required!"));
  }

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return next(errorHandler(404, "User not found with this ID"));
    }

    // Push the new performance object into the user's performance array
    user.performance.push({ month: `${month} ${year}`, performance });

    // Save the user document to trigger the middleware
    await user.save();

    // Respond with the updated user
    res.status(200).json({ message: "Performance added successfully", user });
  } catch (error) {
    next(errorHandler(500, `Error adding performance: ${error.message}`));
  }
};

export const addCourse = async (req, res, next) => {
  try {
    const { title, description, playlist } = req.body;
    const userId = req.user.id; // Assuming the admin's userId is in the token

    if (!title || !description || !playlist || !Array.isArray(playlist)) {
      return next(errorHandler(400, "All fields are required and playlist must be an array"));
    }

    // Validate playlist
    const invalidPlaylist = playlist.some(
      (video) => !video.title || !video.url
    );
    if (invalidPlaylist) {
      return next(errorHandler(400, "Each video in the playlist must have a title and URL"));
    }

    // Create a new course
    const newCourse = new Course({
      title,
      description,
      playlist,
      createdBy: userId, // Store the creator's userId (admin)
    });

    await newCourse.save();

    return res.status(201).json({
      success: true,
      message: "Course added successfully",
      newCourse,
    });
  } catch (error) {
    console.error("Error adding course", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// Edit a course
export const editCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, playlist } = req.body;

    // Validate courseId
    if (!courseId || !isValidObjectId(courseId)) {
      return next(errorHandler(400, courseId ? "Course ID is invalid" : "Course ID is required"));
    }

    if (!title || !description || !playlist || !Array.isArray(playlist)) {
      return next(errorHandler(400, "All fields (title, description, playlist) are required"));
    }

    // Validate playlist
    const invalidPlaylist = playlist.some(
      (video) => !video.title || !video.url
    );
    if (invalidPlaylist) {
      return next(errorHandler(400, "Each video in the playlist must have a title and URL"));
    }

    // Update the course
    const updatedCourse = await Course.findOneAndUpdate(
      { _id: courseId, createdBy: req.user.id }, // Ensures only the creator can edit
      { title, description, playlist },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return next(errorHandler(404, "Course not found or not authorized to update"));
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a course
export const deleteCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Validate courseId
    if (!courseId || !isValidObjectId(courseId)) {
      return next(errorHandler(400, "Invalid course ID"));
    }

    // Delete the course, ensuring only the creator can delete
    const deletedCourse = await Course.findOneAndDelete({ 
      _id: courseId, 
      createdBy: req.user.id 
    });

    if (!deletedCourse) {
      return next(errorHandler(404, "Course not found or not authorized to delete"));
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting course", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const assignCourseToEmployees = async (req, res) => {
  try {
    const { courseId, employeeIds } = req.body;

    // Validate courseId
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    // Validate employeeIds
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid employee ID is required",
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Validate employee IDs
    const validEmployees = await User.find({
      _id: { $in: employeeIds },
      role: "employee",
    });

    if (validEmployees.length !== employeeIds.length) {
      const invalidIds = employeeIds.filter(
        (id) => !validEmployees.some((user) => user._id.toString() === id)
      );
      return res.status(400).json({
        success: false,
        message: `Invalid employee IDs: ${invalidIds.join(", ")}`,
      });
    }

    // Assign course to employees using $addToSet for atomic operation
    await Course.updateOne(
      { _id: courseId },
      { $addToSet: { assignedTo: { $each: employeeIds } } }
    );

    // Optionally assign the course to employees' assignedCourses field
    await User.updateMany(
      { _id: { $in: employeeIds } },
      { $addToSet: { assignedCourses: courseId } }
    );

    res.status(200).json({
      success: true,
      message: "Course successfully assigned to employees",
      data: {
        courseId,
        assignedEmployees: employeeIds,
      },
    });
  } catch (error) {
    console.error("Error in assignCourseToEmployees:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


