import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
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
    jobType: {
      type: String,
      enum: [
        "full-time",
        "part-time",
        "contract",
        "internship",
        "remote",
        "hybrid",
      ],
      required: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    salaryRange: {
      type: String,
      required: true,
    },
    workHours: {
      type: String,
      required: true,
      trim: true,
    },
    experienceRequired: {
      type: String,
      required: true,
      trim: true,
    },
    qualifications: {
      type: [String], // Array to allow multiple qualifications
      required: true,
    },
    skillsRequired: {
      type: [String], // Array to allow multiple skills
      required: true,
    },
    applicationDeadline: {
      type: Date,
      required: true,
    },
    jobStatus: {
      type: String,
      enum: ["open", "closed", "archived"],
      default: "open",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the user model
      ref: "User",
      required: true,
    },
    contactInfo: {
      email: {
        type: String,
        required: true,
        match: /^\S+@\S+\.\S+$/, // Simple email regex
      },
      phone: {
        type: String,
        required: true,
        match: /^[\d-+\s]{7,15}$/, // Allows valid phone numbers
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps automatically
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
