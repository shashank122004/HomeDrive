import * as Folder from '../models/folderModel.js';
import { getUserRoot } from '../utils/storagePaths.js';
import { sanitizeFilename } from '../utils/sanitize.js';
import fs from 'fs';
import path from 'path';

export async function listFolders(req, res, next) {
  try {
    const parentId = req.query.parentId || null;
    const folders = await Folder.getFoldersByParent(req.user.id, parentId);
    res.json({ folders });
  } catch (err) {
    next(err);
  }
}

export async function createFolder(req, res, next) {
  try {
    const name = sanitizeFilename(req.body.name || '');
    if (!name) return res.status(400).json({ error: 'Folder name is required' });

    const folder = await Folder.createFolder(req.user.id, name, req.body.parentId);

    // Mirror the folder structure on disk so uploads have somewhere to go.
    const diskPath = path.join(getUserRoot(req.user.id), name);
    fs.mkdirSync(diskPath, { recursive: true });

    res.status(201).json({ folder });
  } catch (err) {
    next(err);
  }
}

export async function renameFolder(req, res, next) {
  try {
    const newName = sanitizeFilename(req.body.name || '');
    const folder = await Folder.renameFolder(req.user.id, req.params.id, newName);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    res.json({ folder });
  } catch (err) {
    next(err);
  }
}

export async function moveFolder(req, res, next) {
  try {
    const folder = await Folder.moveFolder(req.user.id, req.params.id, req.body.parentId);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    res.json({ folder });
  } catch (err) {
    next(err);
  }
}

export async function deleteFolder(req, res, next) {
  try {
    await Folder.deleteFolder(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
