import { isValidObjectId } from "mongoose";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/index.js";
import bcrypt from "bcryptjs";
import Mail from "../models/mail.model.js";

export const getAllHR = async (req, res, next) => {
  const { role } = req.user;

  // Check if the user has admin privileges
  if (role !== "admin") {
    return next(errorHandler(403, "You are not allowed to access this API"));
  }

  try {
    // Execute count and find concurrently for efficiency
    const [totalHrs, allHr] = await Promise.all([
      User.countDocuments({ role: "hr" }),
      User.find({ role: "hr" }),
    ]);

    return res.status(200).json({ totalHrs, hrs: allHr });
  } catch (error) {
    return next(errorHandler(500, "Failed to retrieve HR data"));
  }
};

export const addHr = async (req, res, next) => {
  const { role } = req.user;

  // Check if the user has admin privileges
  if (role !== "admin") {
    return next(errorHandler(403, "You are not allowed to access this API"));
  }

  const { firstName, lastName, email, password } = req.body;

  // Validate required fields and password length
  const missingFields = ["firstName", "lastName", "email", "password"].filter(
    (field) => !req.body[field]
  );
  if (missingFields.length > 0) {
    return next(
      errorHandler(400, `Missing required fields: ${missingFields.join(", ")}`)
    );
  }
  if (password.length < 8) {
    return next(errorHandler(400, "Password must be at least 8 characters!"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Create and save the new HR user
    const newHr = await new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "hr",
    }).save();

    res
      .status(201)
      .json({ success: true, message: "New HR created successfully!", newHr });
  } catch (error) {
    next(errorHandler(500, error.message || "Failed to create HR"));
  }
};

export const getHR = async (req, res, next) => {
  try {
    const { role } = req.user;
    const { id } = req.params;

    // Role check
    if (role !== "admin") {
      return next({ statusCode: 403, message: "Access denied." });
    }

    // Validate ID
    if (!id || !isValidObjectId(id)) {
      return next(
        errorHandler(400, id ? "Invalid HR ID." : "HR ID is required.")
      );
    }

    // Find hr
    const hr = await User.findOne({ role: "hr", _id: id });
    if (!hr) return next(errorHandler(404, "HR not found."));

    res.status(200).json(hr);
  } catch (error) {
    console.error("Error fetching HR:", error);
    next(error);
  }
};

export const editHR = async (req, res, next) => {
  const { role: userRole } = req.user;
  const { userId: id } = req.query;
  const { firstName, lastName, email, password, role } = req.body;

  // Role check
  if (userRole !== "admin") {
    return next(errorHandler(403, "Access denied."));
  }

  // Validate ID and required fields
  if (!id || !isValidObjectId(id)) {
    return next(
      errorHandler(400, id ? "Invalid HR ID." : "HR ID is required.")
    );
  }

  const missingFields = [
    "firstName",
    "lastName",
    "email",
    "password",
    "role",
  ].filter((field) => !req.body[field]);
  if (missingFields.length > 0) {
    return next(
      errorHandler(400, `Missing required fields: ${missingFields.join(", ")}`)
    );
  }

  // Password length check
  if (password.length < 8) {
    return next(errorHandler(400, "Password must be at least 8 characters!"));
  }

  try {
    // Hash the password and update the HR record
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedHR = await User.findOneAndUpdate(
      { role: "hr", _id: id },
      { firstName, lastName, email, role, password: hashedPassword },
      { new: true }
    );

    if (!updatedHR) {
      return next(errorHandler(404, "HR not found"));
    }

    res.status(200).json({
      success: true,
      message: "HR updated successfully",
      updatedHR,
    });
  } catch (error) {
    console.error("Error editing HR:", error);
    next(errorHandler(500, "Error editing HR"));
  }
};

export const deleteHR = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    // Check if user has permission to delete
    if (role !== "admin") {
      return next(
        errorHandler(403, "You don't have permission to access this API.")
      );
    }

    // Validate the employee ID
    if (!id || !isValidObjectId(id)) {
      return next(
        errorHandler(400, id ? "Invalid HR ID!" : "HR ID is required!")
      );
    }

    // Attempt to delete the employee
    const hr = await User.findOneAndDelete({ role: "hr", _id: id });

    // Handle case where employee does not exist
    if (!hr) {
      return next(
        errorHandler(404, "HR does not exist or may have already been deleted.")
      );
    }

    // Respond with success message
    res.status(200).json({
      success: true,
      message: `HR ${hr.firstName} ${hr.lastName} deleted successfully!`,
    });
  } catch (error) {
    next(
      errorHandler(
        500,
        error.message || "An error occurred while deleting the HR."
      )
    );
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
    const HR = await User.find({
      role: "hr",
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { email: { $regex: regex } },
      ],
    });

    // Return the results
    return res.status(200).json(HR);
  } catch (error) {
    console.error("Error searching HR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

