// index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Weather from "./models/Weather.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json()); // parse JSON bodies

// Serve static client from /public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Basic health
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// Create (Insert) a weather record
// POST /api/weather
// Body: { city, country, temperature, description }
app.post("/api/weather", async (req, res) => {
  try {
    const { city, country, temperature, description } = req.body;
    if (!city || temperature === undefined) {
      return res.status(400).json({ error: "city and temperature are required" });
    }

    const record = new Weather({ city, country, temperature, description });
    const saved = await record.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

// Read all records
// GET /api/weather
app.get("/api/weather", async (req, res) => {
  try {
    const list = await Weather.find().sort({ recordedAt: -1 }).limit(100);
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

// Read single record by id
// GET /api/weather/:id
app.get("/api/weather/:id", async (req, res) => {
  try {
    const rec = await Weather.findById(req.params.id);
    if (!rec) return res.status(404).json({ error: "Not found" });
    return res.json(rec);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Invalid id" });
  }
});

// Delete by id
// DELETE /api/weather/:id
app.delete("/api/weather/:id", async (req, res) => {
  try {
    const removed = await Weather.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: "Not found" });
    return res.json({ deleted: true, id: removed._id });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Invalid id" });
  }
});

// Optional: Delete all (for testing) - CAREFUL
// DELETE /api/weather   (no body) -> deletes all
app.delete("/api/weather", async (req, res) => {
  try {
    await Weather.deleteMany({});
    return res.json({ deletedAll: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

// Connect to MongoDB then start server
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
