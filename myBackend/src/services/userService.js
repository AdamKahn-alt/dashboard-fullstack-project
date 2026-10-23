import User from "../models/userModel.js";

export const getUserByIdService = async (id) => {
  try {
    const user = await User.findById(id).select("-password -__v");
    if (!user) {
      throw new Error(`Error, user with ID: ${id} not found`);
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const publicUser = (user) => {
  const userObject = user.toObject ? user.toObject() : { ...user };

  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

export const stillExistingUser = async (id) => {
  try {
    const matchingUser = await User.findById(id).select("-password -__v");
    if (!matchingUser) {
      throw new Error(`User with ${id} no longer exists`);
    }
    return matchingUser;
  } catch (error) {
    throw new Error(error.message);
  }
};
