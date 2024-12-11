import Course from "../models/course.model.js";
import { errorHandler } from "../utils/index.js";
import { isValidObjectId } from "mongoose";

// Add a new course
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

// Retrieve all courses
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
      return next(errorHandler(400, courseId ? "Course ID is invalid" : "Course ID is required"));
    }

    // Delete the course
    const deletedCourse = await Course.findOneAndDelete({
      _id: courseId,
      createdBy: req.user.id, // Ensures only the creator can delete
    });

    if (!deletedCourse) {
      return next(errorHandler(404, "Course not found or not authorized to delete"));
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
