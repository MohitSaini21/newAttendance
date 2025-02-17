import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: Number, // Employee ID is now a number
    },
    checkInTime: {
      type: Date,
      required: true,
    },
    Didby: {
      type: mongoose.Schema.Types.ObjectId, // Corrected
      ref: "User", // Corrected
    },

    checkOutTime: {
      type: Date,
      default: null, // Will be updated when the employee checks out
    },
    workingHours: {
      type: Number, // Stored in hours
      default: -1,
    },
    locationUrl: {
      type: String, // Google Maps live location URL
    },
    photo: {
      type: String, // URL of the employee's check-in photo (stored in cloud)
    },
    status: {
      type: String,
      enum: ["On Duty", "Checked Out"],
      default: "On Duty",
    },
  },
  { timestamps: true }
);

// Middleware to update status and working hours on checkout
import moment from "moment";

attendanceSchema.pre("save", function (next) {
  if (this.checkOutTime) {
    // Ensure checkInTime and checkOutTime are in UTC and human-readable format
    const formattedCheckInTime = moment(this.checkInTime).utc();
    const formattedCheckOutTime = moment(this.checkOutTime).utc();

    // Calculate the difference in time (in milliseconds)
    const timeDifference = formattedCheckOutTime.diff(formattedCheckInTime); // Difference in milliseconds

    this.workingHours = (timeDifference / (1000 * 60 * 60)).toFixed(2); // Optional for rounding

    console.log(this.workingHours);

    this.status = "Checked Out";
    this.locationUrl = null;
  }
  next();
});

attendanceSchema.index({ employeeId: 1, checkInTime: -1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
