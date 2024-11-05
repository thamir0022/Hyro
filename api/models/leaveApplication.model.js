import mongoose from "mongoose";

const leaveApplicationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    hrComments: { type: String },
    submissionDate: { type: Date, default: Date.now },
    approvalDate: { type: Date },
  },
  { timestamps: true }
);

const LeaveApplication = mongoose.model(
  "LeaveApplication",
  leaveApplicationSchema
);

export default LeaveApplication;
