import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["admin", "employee"],
  },

  userName: {
    type: String,
    required: true,
  },
  employeeID: {
    type: Number, // Changed from String to Number
    unique: true, // Ensures no duplicate employee IDs
    required: true, // Ensures employeeID is always present
  },
  email: {
    type: String,
    lowercase: true,
  },
  WorkingDays: {
    type: Number,
    default: 243,
  },
  password: {
    type: String,
  },

  resetPasswordToken: {
    type: String,
  },
  resetPasswordTokenExpiry: {
    type: Date,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  Ntoken: {
    type: String,
  },
  // employee Related Schema
  profile: {
    bio: {
      type: String,
      default: "I am Employee",
    },
    profilePicture: {
      type: String, // URL or path to the profile picture
      default: "/profileImages/DefaultProfileImage.jpeg",
    },

    contactNumber: {
      type: String, // Phone number
    },
  },
});

// You can add methods here for token generation, validation, etc.
const User = mongoose.model("User", userSchema);

export default User;
