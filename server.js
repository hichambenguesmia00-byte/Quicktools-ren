const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Document, Packer, Paragraph } = require('docx');
const PDFLib = require('pdf-lib');

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

// إعداد multer لتخزين الملفات مؤقتاً
const upload = multer({ dest: 'uploads/' });

// تحقق من وجود مجلد uploads
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

app.get('/', (req, res) => res.send('✅ QuickTools Backend Running!'));

// مسار استقبال PDF وتحويله إلى Word
app.post('/upload', upload.single('file'), async (req, res) => {
    if(!req.file) return res.status(400).send('No file uploaded');

    try {
        const arrayBuffer = fs.readFileSync(req.file.path);
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

        let text = '';
        pdfDoc.getPages().forEach(page => {
            text += page.getTextContent?.() ?? '';
        });

        const doc = new Document({
            sections: [{ children: [new Paragraph(text)] }]
        });

        const outputPath = path.join(__dirname, req.file.originalname.replace('.pdf','.docx'));
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(outputPath, buffer);

        res.download(outputPath, () => {
            fs.unlinkSync(outputPath);
            fs.unlinkSync(req.file.path);
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error converting PDF');
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
