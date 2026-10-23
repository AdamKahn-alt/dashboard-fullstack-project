import { getUserByIdService, publicUser } from "../services/userService.js";
import User from "../models/userModel.js";

export const getAllUser = async (req, res) => {
  try {
    const getAllUsers = await User.find();
    res.status(200).json({
      success: true,
      message: `All users in the Database`,
      data: {
        database: getAllUsers.map(publicUser),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `failed to get all users in the database, error: ${err}`,
    });
  }
};

export const deleteUserAsAdmin = async (req, res) => {
  try {
    const targetID = req.params.id;
    const requesterID = req.user.id;

    const target = await User.findById(targetID);
    const requester = await User.findById(requesterID);

    if (!target) {
      return res.status(400).json({
        success: false,
        message: `User with ID: ${targetID} doesn't exist`,
      });
    }
    if (!requester) {
      return res.status(404).json({
        success: false,
        message: `User with ID: ${requesterID} doesn't exist`,
      });
    }

    if (String(requester._id) === String(target?._id)) {
      return res.status(403).json({
        success: false,
        message: "Self deletion is forbidden",
      });
    }

    if (
      requester.role === "admin" &&
      ["admin", "super-admin"].includes(target?.role)
    ) {
      return res
        .status(403)
        .json({ success: false, message: `Admins can only delete students` });
    }

    await User.findByIdAndDelete(target?._id);

    // return res.sendStatus(204).send();
    return res.status(200).json({
      success: true,
      message: `User deleted successfully`,
      data: publicUser(target),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateRole = async (req, res) => {
  const targetID = req.params.id;
  const requesterID = req.user.id;
  const { role } = req.body;

  if (!["admin", "super-admin", "student"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role",
    });
  }

  try {
    //check if exists
    const target = await User.findById(targetID);
    const requester = await User.findById(requesterID);

    if (!requester || !target) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    //prevent self update
    if (String(requester?._id) === String(target?._id)) {
      return res.status(403).json({
        success: false,
        message: "Self role update is forbidden",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      target._id,
      { role: role !== undefined ? role : target.role },
      { runValidators: true, returnDocument: "after" },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: `User with ID: ${targetID} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `User with ID: ${targetID} was assigned the ${role} role`,
      data: {
        user: publicUser(updatedUser),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: `failed to update role due to error: ${error}`,
    });
  }
};
