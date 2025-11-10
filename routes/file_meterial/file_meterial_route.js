const { upload, UPLOAD_FOLDER } = require('../../config/file');
const file_meterial_router = require('express').Router();
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const responseGenerator = require('../../utils/responseGenerator');

// -----------------------------
// ✅ Upload
// -----------------------------
file_meterial_router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file)
    return responseGenerator(400, res, {
      message: 'Invalid file type',
      success: false,
      error: true,
    });

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
  if (!fs.existsSync(filePath))
    return responseGenerator(404, res, {
      message: 'file not found',
      success: false,
      error: true,
    });

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
      return responseGenerator(404, res, {
        message: 'file not found',
        success: false,
        error: true,
      });
    }

    if (!req.file)
      return responseGenerator(400, res, {
        message: 'No file uploaded',
        success: false,
        error: true,
      });

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
    return responseGenerator(400, res, {
      message: 'File not found',
      error: true,
      success: false,
    });
  }

  fs.unlinkSync(filePath);
  res.json({ message: 'File deleted successfully' });
});

module.exports = file_meterial_router;
