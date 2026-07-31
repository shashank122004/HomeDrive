import pool from '../config/db.js';

export async function createFile(userId, folderId, name, storedPath, size, mimeType) {
  const result = await pool.query(
    `INSERT INTO files (user_id, folder_id, name, stored_path, size, mime_type)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, folderId || null, name, storedPath, size, mimeType]
  );
  return result.rows[0];
}

export async function getFilesByFolder(userId, folderId) {
  const result = await pool.query(
    `SELECT * FROM files
     WHERE user_id = $1 AND folder_id IS NOT DISTINCT FROM $2 AND is_trashed = false
     ORDER BY created_at DESC`,
    [userId, folderId || null]
  );
  return result.rows;
}

export async function getFileById(userId, fileId) {
  const result = await pool.query('SELECT * FROM files WHERE id = $1 AND user_id = $2', [
    fileId,
    userId,
  ]);
  return result.rows[0];
}

export async function getRecentFiles(userId, limit = 10) {
  const result = await pool.query(
    `SELECT * FROM files WHERE user_id = $1 AND is_trashed = false
     ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

export async function searchFiles(userId, term) {
  const result = await pool.query(
    `SELECT * FROM files WHERE user_id = $1 AND is_trashed = false AND name ILIKE $2
     ORDER BY created_at DESC`,
    [userId, `%${term}%`]
  );
  return result.rows;
}

export async function renameFile(userId, fileId, newName) {
  const result = await pool.query(
    `UPDATE files SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
    [newName, fileId, userId]
  );
  return result.rows[0];
}

export async function moveFile(userId, fileId, newFolderId) {
  const result = await pool.query(
    `UPDATE files SET folder_id = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
    [newFolderId || null, fileId, userId]
  );
  return result.rows[0];
}

export async function trashFile(userId, fileId) {
  const result = await pool.query(
    `UPDATE files SET is_trashed = true, trashed_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`,
    [fileId, userId]
  );
  return result.rows[0];
}

export async function restoreFile(userId, fileId) {
  const result = await pool.query(
    `UPDATE files SET is_trashed = false, trashed_at = NULL WHERE id = $1 AND user_id = $2 RETURNING *`,
    [fileId, userId]
  );
  return result.rows[0];
}

export async function getTrashedFiles(userId) {
  const result = await pool.query(
    'SELECT * FROM files WHERE user_id = $1 AND is_trashed = true ORDER BY trashed_at DESC',
    [userId]
  );
  return result.rows;
}

export async function permanentlyDeleteFile(userId, fileId) {
  await pool.query('DELETE FROM files WHERE id = $1 AND user_id = $2', [fileId, userId]);
}

export async function getTotalStorageUsed(userId) {
  const result = await pool.query(
    'SELECT COALESCE(SUM(size), 0) AS total FROM files WHERE user_id = $1 AND is_trashed = false',
    [userId]
  );
  return Number(result.rows[0].total);
}
