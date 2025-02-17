import express from "express";
import User from "../models/userSchema.js";
import Attendance from "../models/attendance.js";
import moment from "moment-timezone";
const router = express.Router();

router.get("/", async (req, res) => {
  const admin = await User.findById(req.user.id);
  return res.render("Dash/adminDash/index.ejs", { admin });
});
router.get("/addEmploye", async (req, res) => {
  const admin = await User.findById(req.user.id);
  return res.render("Dash/adminDash/form.ejs", { admin });
});
router.post("/addEmploye", async (req, res) => {
  try {
    // 2. Extract data from req.body
    const {
      employeeName,
      employeeID,
      employeeEmail,
      employeePassword,
      contactNumber,
      isEmailVerified,
    } = req.body;

    // 3. Validate if all required fields are present
    if (
      !employeeName ||
      !employeeID ||
      !employeeEmail ||
      !employeePassword ||
      !contactNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill in all required fields (Name, ID, Email, Password, Contact Number).",
      });
    }

    // 6. Create the new employee object
    const newEmployee = new User({
      role: "employee", // Assuming the role is always 'employee' for this route
      userName: employeeName,
      employeeID,
      email: employeeEmail,
      password: employeePassword,
      isEmailVerified: isEmailVerified === "true", // Convert to boolean
      profile: {
        profilePicture: "/profileImages/DefaultProfileImage.jpeg", // Default profile picture
        contactNumber,
      },
    });

    // 7. Save the new employee to the database
    await newEmployee.save();

    // 8. Send success response
    return res.json({
      success: true,
      message: "Employee added successfully.",
      employee: {
        employeeName: newEmployee.userName,
        employeeID: newEmployee.employeeID,
        email: newEmployee.email,
        contactNumber: newEmployee.profile.contactNumber,
        isEmailVerified: newEmployee.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

router.get("/mesgEmployee", async (req, res) => {
  const admin = await User.findById(req.user.id);
  return res.render("Dash/adminDash/Message.ejs", { admin });
});

router.get("/todayAttendance", async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);

    // Get today's date in the start and end of the day format (e.g., 2025-02-16T00:00:00.000Z)
    const startOfDay = moment().startOf("day").toISOString(); // Starting at 12:00 AM today
    const endOfDay = moment().endOf("day").toISOString(); // Ending at 11:59 PM today

    // Fetch attendance records where checkInTime or checkOutTime fall within today's date range
    const attendances = await Attendance.find({
      $or: [
        {
          checkInTime: { $gte: startOfDay, $lte: endOfDay }, // checkInTime within today
        },
      ],
    })
      // Populate the Didby field with the userName from the User model
      .populate("Didby", "userName"); // This will include the userName field from the User document

    console.log(attendances);

    // Render the attendance data to the "attendance.ejs" view
    return res.render("Dash/adminDash/attendance.ejs", { admin, attendances });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
});


router.get("/allEmployee", async (req, res) => {
  const admin = await User.findById(req.user.id);
  const users = await User.find({});
  return res.render("Dash/adminDash/table.ejs", { admin, users });
});
export const adminRouter = router;
