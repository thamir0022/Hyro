import mongoose from "mongoose";

const MailSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  receiver: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["sent", "read", "archived"],
    default: "sent"
  },
  readAt: {
    type: Date,
  },
},{timestamps: true});

const Mail = mongoose.model("Mail", MailSchema);

export default Mail;