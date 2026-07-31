// One small wrapper around fetch. Every HomeDrive API call goes through
// here so auth headers/error handling stay in one place.
async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  me: () => request('/api/auth/me'),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),

  // Folders
  listFolders: (parentId) => request(`/api/folders?parentId=${parentId ?? ''}`),
  createFolder: (name, parentId) =>
    request('/api/folders', { method: 'POST', body: JSON.stringify({ name, parentId }) }),
  renameFolder: (id, name) =>
    request(`/api/folders/${id}/rename`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteFolder: (id) => request(`/api/folders/${id}`, { method: 'DELETE' }),

  // Files
  listFiles: (folderId) => request(`/api/files?folderId=${folderId ?? ''}`),
  recentFiles: () => request('/api/files/recent'),
  searchFiles: (term) => request(`/api/files/search?q=${encodeURIComponent(term)}`),
  favorites: () => request('/api/files/favorites'),
  trash: () => request('/api/files/trash'),
  storageUsed: () => request('/api/files/storage'),
  renameFile: (id, name) =>
    request(`/api/files/${id}/rename`, { method: 'PUT', body: JSON.stringify({ name }) }),
  moveFile: (id, folderId) =>
    request(`/api/files/${id}/move`, { method: 'PUT', body: JSON.stringify({ folderId }) }),
  trashFile: (id) => request(`/api/files/${id}/trash`, { method: 'POST' }),
  restoreFile: (id) => request(`/api/files/${id}/restore`, { method: 'POST' }),
  deleteForever: (id) => request(`/api/files/${id}`, { method: 'DELETE' }),
  favorite: (id) => request(`/api/files/${id}/favorite`, { method: 'POST' }),
  unfavorite: (id) => request(`/api/files/${id}/favorite`, { method: 'DELETE' }),
  upload: async (file, folderId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);
    const res = await fetch('/api/files/upload', { method: 'POST', body: formData, credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
  downloadUrl: (id) => `/api/files/${id}/download`,
  previewUrl: (id) => `/api/files/${id}/preview`,
};

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** exp).toFixed(1)} ${units[exp]}`;
}
