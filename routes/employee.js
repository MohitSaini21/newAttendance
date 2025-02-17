import express from "express";
import User from "../models/userSchema.js";
import moment from "moment-timezone";
import Attendance from "../models/attendance.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const employee = await User.findById(req.user.id);

  return res.render("Dash/employeeDash/index.ejs", { employee });
});

router.get("/attendance", async (req, res) => {
  // Convert current UTC time to IST (Indian Standard Time) and get just the date
  const currentDateInIST = moment.utc().tz("Asia/Kolkata").format("YYYY-MM-DD");

  // Convert the moment object to get the month and day
  const Currmonth = moment(currentDateInIST).month() + 1; // .month() gives 0-based month, so add 1
  const Currday = moment(currentDateInIST).date(); // .date() gives the day of the month (1 to 31)

  try {
    const employee = await User.findById(req.user.id);

    const allAttendance = await Attendance.find({
      employeeId: employee.employeeID,
    });
    if (allAttendance.length > 0) {
      allAttendance.forEach((attendance) => {
        const utcTimestamp = attendance.checkInTime;

        const date = new Date(utcTimestamp);

        const month = date.getMonth() + 1;

        // Get the day of the month
        const day = date.getDate(); // Day of the month (1 to 31)
        if (Currmonth == month && Currday == day) {
          return res.redirect(
            `/employee/checkout/attendance/${attendance._id}`
          );
        }
      });
    }

    // Render the employee dashboard with the employee data
    return res.render("Dash/employeeDash/form.ejs", { employee });
  } catch (error) {
    console.error("Error while fetching attendance:", error);
    return res
      .status(500)
      .json({ message: "Error while processing the request" });
  }
});

router.get("/checkout/attendance/:attendanceID", async (req, res) => {
  const { attendanceID } = req.params;
  const employee = await User.findById(req.user.id);
  const attendance = await Attendance.findById(attendanceID);

  return res.render("Dash/employeeDash/checkout.ejs", { employee, attendance });
});

router.post("/checkout/attendance/:attendanceID", async (req, res) => {
  const { attendanceID } = req.params;

  // Fetch the attendance document by ID
  const attendance = await Attendance.findById(attendanceID);

  if (!attendance) {
    return res
      .status(404)
      .json({ success: false, message: "Attendance record not found." });
  }

  // Set the checkout time to the current time
  attendance.checkOutTime = req.body.checkOutTime; // Current time as checkout time

  // Save the attendance record
  await attendance.save();

  // Remove locationURL from the response data before sending it
  const { locationUrl, ...attendanceData } = attendance.toObject();

  // Send the response without the location URL
  return res.json({ success: true, data: attendanceData });
});

router.post("/attendance", async (req, res) => {
  try {
    const employee = await User.findById(req.user.id);
    const { checkInTime, locationUrl } = req.body;

    // Validate required fields
    if (!checkInTime || !locationUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    // Create a new attendance record
    const newAttendance = new Attendance({
      checkInTime,
      employeeId: employee.employeeID,
      locationUrl,
      Didby: req.user.id,

      status: "On Duty", // Initially mark as "On Duty"
    });

    // Save the new attendance record
    await newAttendance.save();

    // Return success response with the saved attendance data
    return res.json({
      success: true,
      message: "Attendance successfully marked.",
      data: newAttendance,
    });
  } catch (error) {
    console.error("Error during attendance creation:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error saving attendance." });
  }
});

export const employeeRouter = router;
