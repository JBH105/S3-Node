const express = require("express");
const {
  uploadMiddleware,
  uploadFile,
} = require("./src/middleware/uploadMiddleware");
require('dotenv').config()

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.post("/api/upload", uploadMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const liveUrl = await uploadFile(req.file);

    return res
      .status(200)
      .json({ message: "File uploaded successfully", liveUrl });
  } catch (error) {
    console.error("Error in route:", error);
    return res.status(500).json({ message: "Error uploading file" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
