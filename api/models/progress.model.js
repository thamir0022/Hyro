import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    totalVideos: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },        
    videosWatched: [
      {
        videoId: {
          type: String,
          required: true,
        },
        watchedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;
