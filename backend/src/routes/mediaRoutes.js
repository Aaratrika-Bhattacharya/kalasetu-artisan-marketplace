const express = require('express');
const multer = require('multer');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { writeFile } = require('node:fs/promises');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024, files: 1, fields: 0, parts: 2 } });

const extensions = {
  'image/jpeg': ['jpg', (bytes) => bytes.subarray(0, 3).toString('hex') === 'ffd8ff'],
  'image/png': ['png', (bytes) => bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a'],
  'image/webp': ['webp', (bytes) => bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'],
  'video/mp4': ['mp4', (bytes) => bytes.toString('ascii', 4, 8) === 'ftyp'],
  'video/webm': ['webm', (bytes) => bytes.subarray(0, 4).toString('hex') === '1a45dfa3'],
};

router.post('/', authenticate, requireRole(['ARTISAN']), (req, res, next) => {
  upload.single('file')(req, res, async (error) => {
    if (error) return res.status(400).json({ error: 'Upload one image or video up to 20 MB.' });
    const file = req.file;
    const type = file && Object.hasOwn(extensions, file.mimetype) && extensions[file.mimetype];
    if (!type || !type[1](file.buffer)) {
      return res.status(400).json({ error: 'Choose a JPEG, PNG, WebP, MP4 or WebM file.' });
    }
    try {
      const filename = `craft-${randomUUID()}.${type[0]}`;
      await writeFile(path.join(__dirname, '..', '..', 'uploads', filename), file.buffer, { flag: 'wx' });
      res.status(201).json({ url: `/uploads/${filename}` });
    } catch (err) {
      next(err);
    }
  });
});

module.exports = router;
