import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    playlist: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        videoId: {
          type: String,
          required: true,
        },
      },
    ],
    assignedTo: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User", // Reference to the User model for employees
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
