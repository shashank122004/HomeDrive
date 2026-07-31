import path from 'path';

// Filenames come from users, so we strip anything that could be used for
// path traversal (../) or that breaks the filesystem.
export function sanitizeFilename(name) {
  return name
    .replace(/[/\\?%*:|"<>]/g, '-') // remove characters illegal on most filesystems
    .replace(/\.\./g, '')           // block ".." traversal attempts
    .trim();
}

// Confirms a resolved path is still inside the expected base directory.
// This is the last line of defense against path traversal.
export function isInsideBase(basePath, targetPath) {
  const relative = path.relative(basePath, targetPath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}
