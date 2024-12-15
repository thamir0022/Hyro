import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import hrRoutes from "./routes/hr.route.js";
import adminRoutes from "./routes/admin.route.js";
import employeeRoutes from "./routes/employee.route.js";
import CourseRoutes from "./routes/course.route.js";
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;
dotenv.config();

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log("MongoDB Connection Error: ", error);
  });

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/employee", employeeRoutes);


//Middleware for error messages
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Sajadh updates...
