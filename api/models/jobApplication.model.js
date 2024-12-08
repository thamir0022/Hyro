import mongoose from "mongoose";

const candidateApplicationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    linkedInProfile: {
      type: String,
      trim: true,
    },
    portfolio: {
      type: String,
      trim: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    education: [
      {
        degree: { type: String, required: true, trim: true },
        institutionName: { type: String, required: true, trim: true },
        graduationYear: { type: Number, required: true },
      },
    ],
    workExperience: [
      {
        role: { type: String, trim: true },
        companyName: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],
    willingToRelocate: {
      type: Boolean,
      required: true,
    },
    expectedSalaryRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

const CandidateApplication = mongoose.model(
  "CandidateApplication",
  candidateApplicationSchema
);

export default CandidateApplication;
