import Progress from "../models/progress.model.js";
import Course from "../models/course.model.js";
import { errorHandler } from "../utils/index.js";

export const progressEnroll = async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const newProgress = new Progress({
      userId,
      courseId,
      videosWatched: [],
    });

    await newProgress.save();
    res
      .status(201)
      .json({ success: true, message: "Employee enrolled successfully" });
  } catch (error) {
    console.error("error enrolling progress", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const updateProgress = async (req, res) => {
  const { userId, courseId, videoId } = req.body;

  try {
    // Find the progress document for the given user and course
    const progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      return res.status(404).json({ success: false, message: "Progress not found" });
    }

    // Check if the video is already in the videosWatched array
    const videoAlreadyWatched = progress.videosWatched.some(
      (video) => video.videoId === videoId
    );

    if (!videoAlreadyWatched) {
      // Add the video to the watched list
      progress.videosWatched.push({ videoId });
      await progress.save();
    }

    res.status(200).json({ success: true, message: "Progress updated successfully" });
  } catch (error) {
    console.error("Failed to update progress:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const courseProgress = async (req, res) => {
  const { courseId, userId } = req.params;
  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found!" });
    }

    const totalVideos = course.playlist.length;

    const progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      return res
        .status(404)
        .json({ error: "Progress not found for this course!" });
    }

    const videosWatched = progress.videosWatched.length;

    const percentage = ((videosWatched / totalVideos) * 100).toFixed(2);

    res.status(200).json({
      courseId,
      userId,
      totalVideos,
      videosWatched,
      progressPercentage: `${percentage}%`,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching progress." });
  }
};

export const employeeCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const enrollments = await Progress.find({ courseId }).populate(
      "userId",
      "name email"
    );

    if (enrollments.length === 0) {
      return res
        .status(404)
        .json({ message: "No employees enrolled in this course!" });
    }

    const employees = enrollments.map((enrollment) => ({
      userId: enrollment.userId._id,
      name: enrollment.userId.name,
      email: enrollment.userId.email,
    }));

    res.status(200).json({ courseId, employees });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching employees." });
  }
};

export const allProgress = async (req, res) => {
  try {
    const courses = await Course.find();

    const courseProgressData = await Promise.all(
      courses.map(async (course) => {
        // Fetch all enrollments for this course
        const enrollments = await Progress.find({
          courseId: course._id,
        }).populate("userId", "name email");

        const progressDetails = enrollments.map((enrollment) => {
          const totalVideos = course.playlist.length;
          const videosWatched = enrollment.videosWatched.length;
          const progressPercentage = (
            (videosWatched / totalVideos) *
            100
          ).toFixed(2);

          return {
            userId: enrollment.userId._id,
            name: enrollment.userId.name,
            email: enrollment.userId.email,
            progressPercentage: `${progressPercentage}%`,
          };
        });

        return {
          courseId: course._id,
          title: course.title,
          description: course.description,
          employees: progressDetails,
        };
      })
    );
    res.status(200).json(courseProgressData);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching course progress." });
  }
};
