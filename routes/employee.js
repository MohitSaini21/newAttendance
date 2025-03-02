import express from "express";
import User from "../models/userSchema.js";
import moment from "moment-timezone";
import multer from "multer";
import path from "path"; // Import the path module
import Attendance from "../models/attendance.js";

const router = express.Router();

// Storage configurations for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the directory exists or create it before saving
    cb(null, path.resolve(`./public/livePicture/`)); // Ensure path is correctly set
  },
  filename: function (req, file, cb) {
    const FileName = `${Date.now()}-${file.originalname}`;
    cb(null, FileName); // Use unique filename with timestamp
  },
});

// Multer configuration with a file size limit and file type validation
// Multer configuration with a file size limit and file type validation
const uploadLivePicture = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      req.fileValidationError =
        "Only images (JPEG, JPG, PNG, GIF) are allowed.";
      return cb(null, false); // Return false to indicate file type is invalid
    }
  },
});

// Get Request page renderer
router.get("/", async (req, res) => {
  const employee = await User.findById(req.user.id);
  return res.render("Dash/employeeDash/index.ejs", { employee });
});

// Attendance Page
router.get("/attendance", async (req, res) => {
  const currentDateInIST = moment.utc().tz("Asia/Kolkata").format("YYYY-MM-DD");

  const Currmonth = moment(currentDateInIST).month() + 1;
  const Currday = moment(currentDateInIST).date();

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
        const day = date.getDate();

        if (Currmonth == month && Currday == day) {
          return res.redirect(
            `/employee/checkout/attendance/${attendance._id}`
          );
        }
      });
    }

    return res.render("Dash/employeeDash/form.ejs", { employee });
  } catch (error) {
    console.error("Error while fetching attendance:", error);
    return res
      .status(500)
      .json({ message: "Error while processing the request" });
  }
});

// Checkout Attendance
router.get("/checkout/attendance/:attendanceID", async (req, res) => {
  const { attendanceID } = req.params;
  const employee = await User.findById(req.user.id);
  const attendance = await Attendance.findById(attendanceID);

  return res.render("Dash/employeeDash/checkout.ejs", { employee, attendance });
});

// Handle Checkout Post Request
router.post("/checkout/attendance/:attendanceID", async (req, res) => {
  const { attendanceID } = req.params;
  const attendance = await Attendance.findById(attendanceID);

  if (!attendance) {
    return res
      .status(404)
      .json({ success: false, message: "Attendance record not found." });
  }

  // Set the checkout time to the current time
  attendance.checkOutTime = req.body.checkOutTime;

  await attendance.save();

  // Remove locationUrl from the response data before sending it
  const { locationUrl, ...attendanceData } = attendance.toObject();

  return res.json({ success: true, data: attendanceData });
});

// Mark Attendance (with file upload)
router.post(
  "/attendance",
  uploadLivePicture.single("livePicture"),
  async (req, res, next) => {
    // If there is a file validation error, send a structured JSON response
    if (req.fileValidationError) {
      return res
        .status(400)
        .json({ success: false, message: req.fileValidationError });
    }
    // If a file is uploaded, we save its path
    if (req.file) {
      const livePicturePath = "/livePicture/".concat(req.file.filename);
      req.body.livePicturePath = livePicturePath;
    }

    next();
  },
  async (req, res) => {
    try {
      const employee = await User.findById(req.user.id);
      const { checkInTime, locationUrl, livePicturePath } = req.body;

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
        livePicture: livePicturePath,
        status: "On Duty",
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
      console.error("Error during attendance creation:", error.message);
      return res
        .status(500)
        .json({ success: false, message: "Error saving attendance." });
    }
  }
);

import SurveyResponse from "../models/survey.js"; // Import the SurveyResponse model

router.get("/survey", async (req, res) => {
  const employee = await User.findById(req.user.id);
  const Survey = await SurveyResponse.findOne({ givenBy: req.user.id });

  if (Survey) {
    return res.render("Dash/employeeDash/survey.ejs", {
      employee,
      message: "Filled",
    });
  } else {
    return res.render("Dash/employeeDash/survey.ejs", {
      employee,
    });
  }
});

router.post("/survey", async (req, res) => {
  try {
    // Destructure the responses from the request body
    const {
      feedQuality,
      nutritionSufficient,
      cattleHealth,
      milkProduction,
      recommendation,
    } = req.body;

    // Create a new survey record in the database
    const survey = await SurveyResponse.create({
      feedQuality,
      nutritionSufficient,
      cattleHealth,
      milkProduction,
      recommendation,
      givenBy: req.user.id, // Assuming req.user.id contains the ID of the logged-in employee
    });

    // Redirect back to the employee page
    return res.redirect("/employee/survey");
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error submitting survey:", error);

    // Redirect back to the employee page
    return res.redirect("/employee/survey");
  }
});

router.get("/location", async (req, res) => {
    const employee = await User.findById(req.user.id);
  return res.render("Dash/employeeDash/location.ejs", {
    employee,
  });
});

export const employeeRouter = router;
