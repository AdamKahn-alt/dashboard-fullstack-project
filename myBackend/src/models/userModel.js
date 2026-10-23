import { model, Schema } from "mongoose";

const userSchema = new Schema({
  fullname: {
    type: String,
    required: true,
    minLength: [3, "Full name cannot be less than 3 characters"],
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: [6, "Password cannot be less than 6 characters"],
  },
  role: {
    type: String,
    default: "student",
    enum: ["student", "admin", "super-admin"],
  },
  gender: {
    type: String,
    enum: ["male", "female", "others"],
  },
});

const User = model("user", userSchema);

export default User;
