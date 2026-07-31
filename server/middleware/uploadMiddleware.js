// Configures Multer to stream uploads straight into the user's storage
// folder instead of buffering the whole file in memory.
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getUserRoot } from '../utils/storagePaths.js';
import { sanitizeFilename } from '../utils/sanitize.js';

const storage = multer.diskStorage({
  // All of a user's files live flat under their storage root on disk.
  // Which "folder" a file appears in is purely a database concept
  // (files.folder_id) - keeping disk layout flat avoids having to keep
  // physical paths in sync with folder renames/moves in the database.
  destination: (req, file, cb) => {
    const destination = getUserRoot(req.user.id);
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const safeName = sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const maxSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 100);

export const upload = multer({
  storage,
  limits: { fileSize: maxSizeMb * 1024 * 1024 },
});
