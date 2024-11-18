import mongoose from "mongoose";

const personalGoalSchema = new mongoose.Schema(
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
    targetDate: {
      type: Date,
      required: true,
    },
    userId:{
      type: mongoose.Types.ObjectId,
      ref:"User",
      required: true,
    },
    feedback: [
      {
        hrId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const PersonalGoal = mongoose.model(
    "PersonalGoal",
     personalGoalSchema
    );

export default PersonalGoal;