const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// إعداد Multer
const upload = multer({ dest: 'uploads/' });

// Route اختبار السيرفر
app.get('/', (req, res) => {
  res.send('✅ QuickTools Backend Running!');
});

// رفع ملف وإرجاعه مباشرة
app.post('/upload', upload.single('file'), (req, res) => {
  if(!req.file) return res.status(400).send('No file uploaded');

  const outputPath = path.join(__dirname, req.file.originalname);

  fs.renameSync(req.file.path, outputPath);

  res.download(outputPath, req.file.originalname, () => {
    fs.unlinkSync(outputPath);
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
