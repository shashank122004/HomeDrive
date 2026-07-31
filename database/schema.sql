-- HomeDrive schema. Kept deliberately flat (no deep normalization) so it
-- stays easy to read for someone learning SQL.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,          -- bcrypt hash, never plain text
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS folders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE, -- NULL = root folder
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL, -- NULL = lives at root
  name VARCHAR(255) NOT NULL,
  stored_path TEXT NOT NULL,          -- path relative to the user's storage root
  size BIGINT NOT NULL,               -- bytes
  mime_type VARCHAR(150),
  is_trashed BOOLEAN DEFAULT false,
  trashed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, file_id)
);

-- Kept for symmetry with the "trash" concept described in the spec.
-- In practice, trashing is handled by files.is_trashed; this table is
-- reserved for folder-level trash if that feature is extended later.
CREATE TABLE IF NOT EXISTS trash (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(10) NOT NULL,     -- 'file' or 'folder'
  item_id INTEGER NOT NULL,
  deleted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shared_links (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,  -- random token used in the public share URL
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_user ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);
