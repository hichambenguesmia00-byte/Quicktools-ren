const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({ dest: "uploads/" });

// Test route
app.get("/", (req, res) => {
  res.send("✅ QuickTools Backend Running on Render!");
});

// Example: Upload & return the same file
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const outputPath = path.join(__dirname, "uploads", req.file.originalname);

  // Rename file
  fs.renameSync(req.file.path, outputPath);

  // Send file back to client
  res.download(outputPath, req.file.originalname, () => {
    fs.unlinkSync(outputPath); // cleanup
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
