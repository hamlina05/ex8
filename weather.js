// models/Weather.js
import mongoose from "mongoose";

const weatherSchema = new mongoose.Schema({
  city: { type: String, required: true },
  country: { type: String },           // optional
  temperature: { type: Number, required: true }, // in Celsius
  description: { type: String },       // e.g., "clear sky"
  recordedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Weather", weatherSchema);
