import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
  },
  performance: {
    type: Number,
    required: true,
  },
});

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: ["employee", "admin", "hr"],
      required: true,
      default: "employee",
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    performance: {
      type: [performanceSchema],
      required: false,
      default: [],
    },
    totalPerformance: {
      type: Number,
      default: 0,
    },
    // Employee-specific fields
    position: {
      type: String,
      required: function () {
        return this.role === "employee";
      },
    },
    joiningDate: {
      type: Date,
      required: function () {
        return this.role === "employee";
      },
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        if (ret.role !== "employee") {
          delete ret.performance;
          delete ret.totalPerformance;
          delete ret.position;
          delete ret.joiningDate;
        }
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        if (ret.role !== "employee") {
          delete ret.performance;
          delete ret.totalPerformance;
          delete ret.position;
          delete ret.joiningDate;
        }
        return ret;
      },
    },
  }
);

// Middleware to calculate totalPerformance before saving, only for employees
UserSchema.pre("save", function (next) {
  if (
    this.role === "employee" &&
    this.performance &&
    this.performance.length > 0
  ) {
    this.totalPerformance = this.performance.reduce(
      (acc, item) => acc + item.performance,
      0
    );
  } else {
    this.totalPerformance = 0;
  }
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
