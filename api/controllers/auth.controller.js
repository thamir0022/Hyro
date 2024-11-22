import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id, user.role);

    const { password: _, _id: id, ...userData } = user._doc;

    res
      .status(200)
      .cookie("access_token", token)
      .json({
        success: true,
        message: "Sign In Success",
        user: { ...userData, id },
      });
  } catch (error) {
    console.error("SignIn Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const signUp = async (req, res) => {
  const { firstName, lastName, role = "employee", email, password } = req.body;

  // Validation for missing fields
  const missingFields = ["firstName", "lastName", "email", "password"].filter(
    (field) => !req.body[field]
  );

  if (missingFields.length) {
    return res.status(400).json({
      success: false,
      message: `All field are required, Missing fields: ${missingFields.join(
        ", "
      )}`,
    });
  }

  // Additional validations
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }
  if (!["admin", "hr", "employee"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role. Must be 'admin', 'hr', or 'employee'",
    });
  }

  try {
    // Check for existing user and create new user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      firstName,
      lastName,
      role,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ success: true, message: "Sign Up Success" });
  } catch (error) {
    console.error("SignUp Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("access_token");
    return res.status(200).json({ success: true, message: "Sign Out Success" });
  } catch (error) {
    console.error("SignOut Error:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const editProfile = async (req, res) => {
  const { firstName, lastName, oldPassword, newPassword, confirmPassword } =
    req.body;

  // Validate input: Ensure at least one field is provided for update
  if (
    !firstName &&
    !lastName &&
    !oldPassword &&
    !newPassword &&
    !confirmPassword
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide at least one field to update",
    });
  }

  try {
    // Determine the user ID based on role
    const userId =
      req.user.role === "admin" ? req.user.query || req.user.id : req.user.id;

    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Handle password updates
    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Old password, new password, and confirm password are required",
        });
      }

      // Validate old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Old password is incorrect",
        });
      }

      // Check if new password matches confirm password
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "New password and confirm password do not match",
        });
      }

      // Ensure new password meets length requirement
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Update other fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    // Save updated user
    await user.save();

    // Exclude sensitive data like password
    const { password, performance, totalPerformance, position, joiningDate, _id, ...updatedUser } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {id: _id, ...updatedUser},
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
