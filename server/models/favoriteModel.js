import pool from '../config/db.js';

export async function addFavorite(userId, fileId) {
  const result = await pool.query(
    `INSERT INTO favorites (user_id, file_id) VALUES ($1, $2)
     ON CONFLICT (user_id, file_id) DO NOTHING RETURNING *`,
    [userId, fileId]
  );
  return result.rows[0];
}

export async function removeFavorite(userId, fileId) {
  await pool.query('DELETE FROM favorites WHERE user_id = $1 AND file_id = $2', [userId, fileId]);
}

export async function getFavorites(userId) {
  const result = await pool.query(
    `SELECT f.* FROM files f
     JOIN favorites fav ON fav.file_id = f.id
     WHERE fav.user_id = $1 AND f.is_trashed = false
     ORDER BY fav.created_at DESC`,
    [userId]
  );
  return result.rows;
}
