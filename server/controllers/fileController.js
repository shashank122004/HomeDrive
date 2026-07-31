// Handles upload, download, and file management. Actual disk I/O stays in
// this file; database bookkeeping is delegated to the file model.
import path from 'path';
import fs from 'fs';
import * as File from '../models/fileModel.js';
import { getUserRoot, getTrashRoot } from '../utils/storagePaths.js';
import { sanitizeFilename } from '../utils/sanitize.js';
import { logEvent } from '../utils/logger.js';

export async function uploadFile(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file was uploaded' });

    const relativePath = path.relative(getUserRoot(req.user.id), req.file.path);
    const file = await File.createFile(
      req.user.id,
      req.body.folderId || null,
      req.file.originalname,
      relativePath,
      req.file.size,
      req.file.mimetype
    );

    logEvent('UPLOAD', `${req.user.email} uploaded ${req.file.originalname}`);
    res.status(201).json({ file });
  } catch (err) {
    next(err);
  }
}

export async function listFiles(req, res, next) {
  try {
    const folderId = req.query.folderId || null;
    const files = await File.getFilesByFolder(req.user.id, folderId);
    res.json({ files });
  } catch (err) {
    next(err);
  }
}

export async function searchFiles(req, res, next) {
  try {
    const term = req.query.q || '';
    const files = await File.searchFiles(req.user.id, term);
    res.json({ files });
  } catch (err) {
    next(err);
  }
}

export async function recentFiles(req, res, next) {
  try {
    const files = await File.getRecentFiles(req.user.id, 8);
    res.json({ files });
  } catch (err) {
    next(err);
  }
}

export async function storageUsed(req, res, next) {
  try {
    const used = await File.getTotalStorageUsed(req.user.id);
    res.json({ used });
  } catch (err) {
    next(err);
  }
}

// Streams the file instead of loading it fully into memory, which matters
// once files get into the hundreds of MB.
export async function downloadFile(req, res, next) {
  try {
    const file = await File.getFileById(req.user.id, req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const fullPath = path.join(getUserRoot(req.user.id), file.stored_path);
    if (!fullPath.startsWith(getUserRoot(req.user.id))) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    logEvent('DOWNLOAD', `${req.user.email} downloaded ${file.name}`);
    res.download(fullPath, file.name);
  } catch (err) {
    next(err);
  }
}

// Serves the file "inline" so the browser renders it (image/video/audio/
// pdf/text) instead of downloading it. This is the same file on disk as
// downloadFile above - only the response headers differ.
export async function previewFile(req, res, next) {
  try {
    const file = await File.getFileById(req.user.id, req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const fullPath = path.join(getUserRoot(req.user.id), file.stored_path);
    if (!fullPath.startsWith(getUserRoot(req.user.id))) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File missing on disk' });
    }

    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
    // "inline" (vs "attachment") is what tells the browser to render the
    // file itself rather than prompting a download.
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
    res.setHeader('Accept-Ranges', 'bytes');

    streamWithRangeSupport(req, res, fullPath);
  } catch (err) {
    next(err);
  }
}

// Video/audio players seek by requesting byte ranges (e.g. "bytes=1000-").
// Without honoring that header, scrubbing a video's progress bar won't work.
function streamWithRangeSupport(req, res, fullPath) {
  const { size } = fs.statSync(fullPath);
  const range = req.headers.range;

  if (!range) {
    res.setHeader('Content-Length', size);
    fs.createReadStream(fullPath).pipe(res);
    return;
  }

  const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
  const start = Number(startStr);
  const end = endStr ? Number(endStr) : size - 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${size}`,
    'Content-Length': end - start + 1,
  });
  fs.createReadStream(fullPath, { start, end }).pipe(res);
}

export async function renameFile(req, res, next) {
  try {
    const newName = sanitizeFilename(req.body.name || '');
    const file = await File.renameFile(req.user.id, req.params.id, newName);
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json({ file });
  } catch (err) {
    next(err);
  }
}

export async function moveFile(req, res, next) {
  try {
    const file = await File.moveFile(req.user.id, req.params.id, req.body.folderId);
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json({ file });
  } catch (err) {
    next(err);
  }
}

// Soft delete: the row is flagged is_trashed and the physical file is moved
// into storage/trash so it can be restored later.
export async function trashFile(req, res, next) {
  try {
    const file = await File.getFileById(req.user.id, req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const source = path.join(getUserRoot(req.user.id), file.stored_path);
    const destination = path.join(getTrashRoot(), `${req.user.id}-${path.basename(source)}`);
    fs.renameSync(source, destination);

    const trashed = await File.trashFile(req.user.id, req.params.id);
    res.json({ file: trashed });
  } catch (err) {
    next(err);
  }
}

export async function restoreFile(req, res, next) {
  try {
    const file = await File.getFileById(req.user.id, req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const trashedPath = path.join(getTrashRoot(), `${req.user.id}-${path.basename(file.stored_path)}`);
    const destination = path.join(getUserRoot(req.user.id), file.stored_path);
    fs.renameSync(trashedPath, destination);

    const restored = await File.restoreFile(req.user.id, req.params.id);
    res.json({ file: restored });
  } catch (err) {
    next(err);
  }
}

export async function listTrash(req, res, next) {
  try {
    const files = await File.getTrashedFiles(req.user.id);
    res.json({ files });
  } catch (err) {
    next(err);
  }
}

export async function deleteFilePermanently(req, res, next) {
  try {
    const file = await File.getFileById(req.user.id, req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const trashedPath = path.join(getTrashRoot(), `${req.user.id}-${path.basename(file.stored_path)}`);
    fs.rm(trashedPath, { force: true }, () => {});

    await File.permanentlyDeleteFile(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
