import { useEffect, useState } from 'react';
import { Lock, Upload, FolderPlus, Search, LogOut, HardDrive, Star, Trash2 } from 'lucide-react';
import { api, formatBytes } from '../api';
import { FolderCard, FileCard } from '../components/Cards.jsx';
import { UploadModal, NewFolderModal, PreviewModal } from '../components/Modals.jsx';

const NAV = [
  { key: 'drive', label: 'My Drive', icon: HardDrive },
  { key: 'favorites', label: 'Favorites', icon: Star },
  { key: 'trash', label: 'Trash', icon: Trash2 },
];

export default function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('drive');
  const [folderPath, setFolderPath] = useState([]); // [{id,name}]
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'upload' | 'newFolder' | null
  const [previewing, setPreviewing] = useState(null);

  const currentFolderId = folderPath.at(-1)?.id ?? null;

  useEffect(() => { loadDrive(null); refreshStorage(); }, []);

  function refreshStorage() {
    api.storageUsed().then((d) => setStorageUsed(d.used ?? 0)).catch(() => {});
  }

  async function loadDrive(folderId) {
    setView('drive');
    const [f, fl] = await Promise.all([
      api.listFolders(folderId),
      folderId ? api.listFiles(folderId) : api.recentFiles(),
    ]);
    setFolders(f.folders);
    setFiles(fl.files);
  }

  async function loadFavorites() {
    setView('favorites');
    setFolderPath([]);
    setFolders([]);
    setFiles((await api.favorites()).files);
  }

  async function loadTrash() {
    setView('trash');
    setFolderPath([]);
    setFolders([]);
    setFiles((await api.trash()).files);
  }

  async function runSearch(term) {
    setSearch(term);
    if (!term) { loadDrive(currentFolderId); return; }
    setView('search');
    setFolders([]);
    setFiles((await api.searchFiles(term)).files);
  }

  function openFolder(folder) {
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
    loadDrive(folder.id);
  }

  function goToCrumb(index) {
    const next = index < 0 ? [] : folderPath.slice(0, index + 1);
    setFolderPath(next);
    loadDrive(next.at(-1)?.id ?? null);
  }

  function switchNav(key) {
    setSearch('');
    setFolderPath([]);
    if (key === 'drive') loadDrive(null);
    if (key === 'favorites') loadFavorites();
    if (key === 'trash') loadTrash();
  }

  // ---- Folder actions ----
  async function renameFolder(folder) {
    const name = prompt('Rename folder', folder.name);
    if (name?.trim()) { await api.renameFolder(folder.id, name.trim()); loadDrive(currentFolderId); }
  }
  async function deleteFolder(folder) {
    if (confirm(`Delete "${folder.name}"? Files inside move to My Drive; subfolders are deleted too.`)) {
      await api.deleteFolder(folder.id);
      loadDrive(currentFolderId);
    }
  }
  async function createFolder(name) {
    await api.createFolder(name, currentFolderId);
    setModal(null);
    loadDrive(currentFolderId);
  }

  // ---- File actions ----
  const reload = () => {
    if (view === 'drive') loadDrive(currentFolderId);
    else if (view === 'favorites') loadFavorites();
    else if (view === 'trash') loadTrash();
    else if (view === 'search') runSearch(search);
    refreshStorage();
  };

  async function renameFile(file) {
    const name = prompt('Rename file', file.name);
    if (name?.trim()) { await api.renameFile(file.id, name.trim()); reload(); }
  }
  async function moveFile(file) {
    const id = prompt('Destination folder ID (blank = My Drive root):');
    if (id !== null) { await api.moveFile(file.id, id.trim() || null); reload(); }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-panel border-r border-line p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-6 font-mono text-amber px-1">
          <Lock size={16} />
          <span className="text-sm tracking-widest uppercase">HomeDrive</span>
        </div>
        <button
          onClick={() => setModal('upload')}
          className="flex items-center justify-center gap-2 bg-amber hover:bg-amber-dim text-ink font-medium py-2.5 rounded-lg mb-4 transition-colors"
        >
          <Upload size={16} /> Upload
        </button>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => switchNav(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                view === key ? 'bg-line text-paper' : 'text-paper/60 hover:bg-line/60 hover:text-paper'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto text-xs text-paper/40 px-1 truncate">{user.email}</div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-paper/40" />
            <input
              value={search}
              onChange={(e) => runSearch(e.target.value)}
              placeholder="Search files…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-panel border border-line text-sm focus:outline-none focus:border-amber"
            />
          </div>
          <button
            onClick={() => setModal('newFolder')}
            className="flex items-center gap-1.5 text-sm bg-panel hover:bg-line border border-line rounded-lg px-3 py-2 transition-colors"
          >
            <FolderPlus size={15} /> New folder
          </button>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="text-paper/50 font-mono">{formatBytes(storageUsed)} used</span>
            <button
              onClick={async () => { await api.logout(); onLogout(); }}
              className="flex items-center gap-1.5 text-paper/50 hover:text-paper"
            >
              <LogOut size={15} /> Log out
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        {view === 'drive' && (
          <nav className="text-sm text-paper/40 mb-4 flex flex-wrap gap-1">
            <button onClick={() => goToCrumb(-1)} className="hover:text-paper">My Drive</button>
            {folderPath.map((f, i) => (
              <span key={f.id}> / <button onClick={() => goToCrumb(i)} className="hover:text-paper">{f.name}</button></span>
            ))}
          </nav>
        )}

        {folders.length > 0 && (
          <>
            <h2 className="text-xs font-mono uppercase tracking-widest text-paper/40 mb-2">Folders</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8">
              {folders.map((folder) => (
                <FolderCard key={folder.id} folder={folder} onOpen={() => openFolder(folder)} onRename={() => renameFolder(folder)} onDelete={() => deleteFolder(folder)} />
              ))}
            </div>
          </>
        )}

        <h2 className="text-xs font-mono uppercase tracking-widest text-paper/40 mb-2">
          {view === 'favorites' ? 'Favorites' : view === 'trash' ? 'Trash' : view === 'search' ? `Results for "${search}"` : currentFolderId ? 'Files' : 'Recent files'}
        </h2>
        {files.length === 0 ? (
          <p className="text-sm text-paper/30 font-mono">Nothing here yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                view={view}
                onPreview={() => setPreviewing(file)}
                onFavorite={async () => { await api.favorite(file.id); }}
                onUnfavorite={async () => { await api.unfavorite(file.id); reload(); }}
                onRename={() => renameFile(file)}
                onMove={() => moveFile(file)}
                onTrash={async () => { if (confirm(`Move "${file.name}" to trash?`)) { await api.trashFile(file.id); reload(); } }}
                onRestore={async () => { await api.restoreFile(file.id); reload(); }}
                onDeleteForever={async () => { if (confirm(`Permanently delete "${file.name}"?`)) { await api.deleteForever(file.id); reload(); } }}
              />
            ))}
          </div>
        )}
      </main>

      {modal === 'upload' && <UploadModal folderId={currentFolderId} onClose={() => setModal(null)} onUploaded={() => { setModal(null); reload(); }} />}
      {modal === 'newFolder' && <NewFolderModal onClose={() => setModal(null)} onCreate={createFolder} />}
      {previewing && <PreviewModal file={previewing} onClose={() => setPreviewing(null)} />}
    </div>
  );
}
