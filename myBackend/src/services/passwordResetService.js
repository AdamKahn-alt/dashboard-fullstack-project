import bcrypt from "bcrypt";
import { signToken, verifyToken } from "../middlewares/jwt.js";
import User from "../models/userModel.js";
import { sendPasswordResetEmail } from "./emailService.js";
import { publicUser } from "./userService.js";

export const forgotPasswordService = async (email) => {
  try {
    if (!email) {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return {
        message: `A password reset email has been sent to ${normalizedEmail}`,
      };
    }

    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    const resetToken = signToken(payload, { expiresIn: "5m" });

    const isSent = await sendPasswordResetEmail({
      userName: payload.username,
      email: payload.email,
      resetToken: resetToken,
    });

    if (!isSent) {
      const error = new Error("Failed to send password reset email");
      error.statusCode = 500;
      throw error;
    }

    return {
      message: `A password reset email has been sent to ${normalizedEmail}`,
    };
  } catch (error) {
    throw error;
  }
};

export const resetUserPasswordService = async (newPassword, token) => {
  if (!newPassword || !token) {
    const error = new Error("Password and token are required");
    error.statusCode = 400;
    throw error;
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    const error = new Error(
      "Password must be a string with at least 8 characters",
    );
    error.statusCode = 400;
    throw error;
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      const error = new Error("Invalid or expired token");
      error.statusCode = 400;
      throw error;
    }
    const ID = decoded.id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findByIdAndUpdate(
      ID,
      { password: hashedPassword },
      { returnDocument: "after", runValidators: true },
    );
    if (!updatedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

// PASSWORD RESET CONTROLLERS
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await forgotPasswordService(email);
    return res.status(200).json({
      success: true,
      message: user.message,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const updatedUser = await resetUserPasswordService(newPassword, token);
    return res.status(200).json({
      success: true,
      message: `Password reset successful for user ${updatedUser.username}`,
      data: {
        user: publicUser(updatedUser),
      },
    });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
