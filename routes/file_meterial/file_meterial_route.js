const { upload, UPLOAD_FOLDER } = require('../../config/file');
const file_meterial_router = require('express').Router();
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

// -----------------------------
// ✅ Upload
// -----------------------------
file_meterial_router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Invalid file type' });

  let protocol = req.protocol;
  if (req.headers['x-forwarded-proto']) {
    protocol = req.headers['x-forwarded-proto'].split(',')[0];
  }

  // =========== Dynamic URL build (no hardcoding)
  const fileUrl = `${protocol}://${req.get('host')}/file/${req.file.filename}`;

  res.json({
    message: 'Uploaded successfully',
    url: fileUrl,
    path: req.file.filename,
  });
});

// -----------------------------
// ✅ Get file by filename
// -----------------------------
file_meterial_router.get('/file/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_FOLDER, req.params.filename);
  console.log(filePath);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');

  const stat = fs.statSync(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';

  const readStream = fs.createReadStream(filePath);

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Content-Disposition': `inline; filename="${req.params.filename}"`, // inline = browser open
  });

  readStream.pipe(res);
});

// -----------------------------
// ✅ Update file (overwrite same filename)
// -----------------------------
file_meterial_router.put(
  '/file/update/:filename',
  upload.single('file'),
  (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_FOLDER, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    fs.unlinkSync(filePath);

    const newFilePath = path.join(UPLOAD_FOLDER, filename);
    fs.renameSync(req.file.path, newFilePath);

    const fileUrl = `${req.protocol}://${req.get('host')}/file/${filename}`;
    res.json({ message: 'File updated successfully', url: fileUrl });
  }
);

// -----------------------------
// ✅ Delete file
// -----------------------------
file_meterial_router.delete('/file/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_FOLDER, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  fs.unlinkSync(filePath);
  res.json({ message: 'File deleted successfully' });
});

module.exports = file_meterial_router;
