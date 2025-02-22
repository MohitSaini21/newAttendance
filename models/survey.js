import mongoose from "mongoose";

// Define the schema for storing survey responses
const surveyResponseSchema = new mongoose.Schema({
  feedQuality: {
    type: String,
    required: true,
    trim: true,
  },
  nutritionSufficient: {
    type: String,
    required: true,
    trim: true,
  },
  cattleHealth: {
    type: String,
    required: true,
    trim: true,
  },
  milkProduction: {
    type: String,
    required: true,
    trim: true,
  },
  recommendation: {
    type: String,
    required: true,
    trim: true,
  },
  givenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a 'User' model for users in the system
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Create the model from the schema
const SurveyResponse = mongoose.model("SurveyResponse", surveyResponseSchema);

export default SurveyResponse;
