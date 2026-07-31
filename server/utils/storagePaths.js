// Every user gets their own folder under storage/users/<id>. Centralizing
// the path logic here means no other file needs to know the layout.
import path from 'path';
import fs from 'fs';

const STORAGE_ROOT = path.join(process.cwd(), 'storage');

export function getUserRoot(userId) {
  return path.join(STORAGE_ROOT, 'users', String(userId));
}

export function getTrashRoot() {
  return path.join(STORAGE_ROOT, 'trash');
}

// Creates the default folder tree (Documents/Photos/Videos) for a new user.
export function createUserStorage(userId) {
  const root = getUserRoot(userId);
  ['Documents', 'Photos', 'Videos'].forEach((folder) => {
    fs.mkdirSync(path.join(root, folder), { recursive: true });
  });
}
