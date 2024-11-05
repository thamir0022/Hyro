import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  checkInTime: {
    type: Date,
    required: true,
  },
  checkOutTime: {
    type: Date,
  },
  date: {
    type: Date,
    required: true,
    default: () => new Date().setHours(0, 0, 0, 0),
  },
  checkInHour: {
    type: Number, // Storing hour for optimized querying (e.g., 9 for 9 AM)
    required: false,
  },
  checkOutHour: {
    type: Number, // Storing hour for optimized querying (e.g., 17 for 5 PM)
    required: false,
  },
  duration: {
    type: Number, // Total hours or minutes worked
    required: false,
  },
});

// Index to ensure each user can only have one check-in per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;