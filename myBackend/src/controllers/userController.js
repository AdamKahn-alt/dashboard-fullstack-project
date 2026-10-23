import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import { getUserByIdService, publicUser } from "../services/userService.js";
import { signToken } from "../middlewares/jwt.js";
import { sendWelcomeEmail } from "../services/emailService.js";
import {
  forgotPasswordService,
  resetUserPasswordService,
} from "../services/passwordResetService.js";

export const createUser = async (req, res) => {
  try {
    const { fullname, username, email, password, gender } = req.body;

    if (!fullname || !username || !email || !password || !gender)
      return res.status(400).json({
        success: false,
        message: "Fullname, username, email, and password are required",
      });

    if (password.length < 8)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedEmail = email.toLowerCase().trim();
    const newUser = await User.create({
      fullname,
      username,
      email: normalizedEmail,
      password: hashedPassword,
      gender,
    });

    //WELCOME EMAIL RESPONSE
    const user = {
      fullname: newUser.fullname,
      email: newUser.email,
    };
    const isWelcomeEmailSent = await sendWelcomeEmail(user);
    if (isWelcomeEmailSent === false) {
      console.error(`Failed to send welcome email to ${user.email}`);
      return res.status(201).json({
        success: true,
        warning: {
          code: "WELCOME_EMAIL_FAILED",
          message: `New User created successfully, but failed to send welcome email`,
        },
        data: {
          user: publicUser(newUser),
        },
        welcomeEmailSent: false,
      });
    }

    res.status(201).json({
      success: true,
      message: `New User created successfully`,
      data: {
        user: publicUser(newUser),
      },
      welcomeEmailSent: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "One or more credentials submitted already exists under another user",
      });
    }

    return res.status(500).json({
      success: false,
      status: "error",
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "Email and Password required",
      });

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: `Invalid Credentials`,
      });
    }

    if (!(await bcrypt.compare(password, existingUser.password))) {
      return res.status(401).json({
        success: false,
        message: `Invalid Credentials`,
      });
    }

    const payload = {
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
      fullname: existingUser.fullname,
      username: existingUser.username,
    };

    const token = signToken(payload, { expiresIn: "20m" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 3600000, // 1hour
    });

    res.status(200).json({
      success: true,
      message: `Login Successful`,
      data: publicUser(existingUser),
      // token: token,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

export const getUserByName = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    console.log(` found user by name: ${username}`);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User ${username} not found`,
      });
    }
    res.status(200).json({
      success: true,
      message: `found user with name ${username}`,
      data: {
        user: publicUser(user),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: `unable to retrive user with name, error:${error}`,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userOfId = await getUserByIdService(id);

    if (!userOfId) {
      return res.status(404).json({
        success: false,
        message: `User with ID: ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Found User with ID: ${id}`,
      data: {
        user: { userOfId },
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const existingUser = await getUserByIdService(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: `User with ID: ${id} does not exist`,
      });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: `User with ID: ${id} was deleted from the database`,
      data: publicUser(existingUser),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, username, gender } = req.body;

    const existingUser = await getUserByIdService(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: `User with ID: ${id} does not exist`,
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      {
        fullname: fullname !== undefined ? fullname : existingUser.fullname,
        gender: gender !== undefined ? gender : existingUser.gender,
        username: username !== undefined ? username : existingUser.username,
      },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: `User with ID: ${id} does not exist`,
      });
    }

    res.status(200).json({
      success: true,
      message: `User named ${id} was updated successfully`,
      data: {
        user: publicUser(updatedUser),
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 3600000,
    path: "/",
  });
  return res.sendStatus(204);
};

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
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
