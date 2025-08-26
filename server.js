const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

const app = express();
const port = process.env.PORT || 3000;

// إعداد Multer لتخزين الملفات مؤقتاً
const upload = multer({ dest: "uploads/" });

// PDF → Word (نسخة مبسطة: PDF → TXT → DOCX يمكن تطويرها لاحقاً)
app.post("/convert/pdf-to-docx", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  try {
    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    let textContent = "";

    const pages = pdfDoc.getPages();
    pages.forEach(page => {
      textContent += page.getTextContent?.() ?? ""; // مبسط
    });

    const outputPath = path.join(__dirname, "uploads", "converted.docx");
    fs.writeFileSync(outputPath, textContent);
    res.download(outputPath, "converted.docx", err => {
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    res.status(500).send("Conversion error: " + err.message);
  }
});

// Word → PDF (مبسط: TXT → PDF مثال)
app.post("/convert/docx-to-pdf", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  try {
    const txtContent = fs.readFileSync(req.file.path, "utf8"); // افتراض TXT داخل DOCX
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText(txtContent || "Empty content", { x: 50, y: 700 });

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, "uploads", "converted.pdf");
    fs.writeFileSync(outputPath, pdfBytes);

    res.download(outputPath, "converted.pdf", err => {
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    res.status(500).send("Conversion error: " + err.message);
  }
});

app.get("/", (req, res) => {
  res.send("QuickTools Backend Running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
