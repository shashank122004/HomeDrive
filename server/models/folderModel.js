import pool from '../config/db.js';

export async function createFolder(userId, name, parentId) {
  const result = await pool.query(
    `INSERT INTO folders (user_id, name, parent_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, name, parentId || null]
  );
  return result.rows[0];
}

// Fetches all folders that live directly inside parentId (or the root
// folder list when parentId is null).
export async function getFoldersByParent(userId, parentId) {
  const result = await pool.query(
    `SELECT * FROM folders
     WHERE user_id = $1 AND parent_id IS NOT DISTINCT FROM $2
     ORDER BY name ASC`,
    [userId, parentId || null]
  );
  return result.rows;
}

export async function getFolderById(userId, folderId) {
  const result = await pool.query(
    'SELECT * FROM folders WHERE id = $1 AND user_id = $2',
    [folderId, userId]
  );
  return result.rows[0];
}

export async function renameFolder(userId, folderId, newName) {
  const result = await pool.query(
    `UPDATE folders SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
    [newName, folderId, userId]
  );
  return result.rows[0];
}

export async function moveFolder(userId, folderId, newParentId) {
  const result = await pool.query(
    `UPDATE folders SET parent_id = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
    [newParentId || null, folderId, userId]
  );
  return result.rows[0];
}

export async function deleteFolder(userId, folderId) {
  await pool.query('DELETE FROM folders WHERE id = $1 AND user_id = $2', [folderId, userId]);
}
