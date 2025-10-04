const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ----------------------------
// 1️⃣ Setup Upload Folder
// ----------------------------
const UPLOAD_FOLDER = path.join(__dirname, '../uploads'); // project folder এর বাইরে
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

// ----------------------------
// 2️⃣ Allowed Extensions
// ----------------------------
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
// ----------------------------
// 3️⃣ Multer Storage + Filter
// ----------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
  filename: (req, file, cb) => {
    const original_name = file.originalname?.split(' ').join('_');
    const uniqueName = Date.now() + '-' + original_name;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = { upload, UPLOAD_FOLDER };
