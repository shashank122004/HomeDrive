import { Folder, Pencil, Trash2, Eye, Download, Star, FolderInput, RotateCcw, XCircle } from 'lucide-react';
import { api, formatBytes } from '../api';

// Small icon-only action button used on both card types.
function IconBtn({ onClick, title, danger, children }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={title}
      className={`p-1 rounded hover:bg-line ${danger ? 'text-red-400/80 hover:text-red-400' : 'text-paper/50 hover:text-paper'}`}
    >
      {children}
    </button>
  );
}

export function FolderCard({ folder, onOpen, onRename, onDelete }) {
  return (
    <div
      onClick={onOpen}
      className="group bg-panel border border-line rounded-xl p-4 hover:border-amber/60 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <Folder className="text-amber" size={22} />
        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          <IconBtn onClick={onRename} title="Rename"><Pencil size={14} /></IconBtn>
          <IconBtn onClick={onDelete} title="Delete" danger><Trash2 size={14} /></IconBtn>
        </div>
      </div>
      <div className="text-sm truncate">{folder.name}</div>
    </div>
  );
}

export function FileCard({ file, view, onPreview, onFavorite, onUnfavorite, onRename, onMove, onTrash, onRestore, onDeleteForever }) {
  return (
    <div className="group bg-panel border border-line rounded-xl p-4 hover:border-teal/60 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-ink border border-line flex items-center justify-center text-teal font-mono text-[10px]">
          {file.name.split('.').pop()?.slice(0, 4).toUpperCase()}
        </div>
        <div className="opacity-0 group-hover:opacity-100 flex flex-wrap justify-end gap-1 transition-opacity max-w-[92px]">
          <IconBtn onClick={onPreview} title="Preview"><Eye size={14} /></IconBtn>
          {view === 'trash' ? (
            <>
              <IconBtn onClick={onRestore} title="Restore"><RotateCcw size={14} /></IconBtn>
              <IconBtn onClick={onDeleteForever} title="Delete forever" danger><XCircle size={14} /></IconBtn>
            </>
          ) : view === 'favorites' ? (
            <>
              <IconBtn onClick={() => (window.location.href = api.downloadUrl(file.id))} title="Download"><Download size={14} /></IconBtn>
              <IconBtn onClick={onUnfavorite} title="Remove favorite"><Star size={14} className="fill-amber text-amber" /></IconBtn>
            </>
          ) : (
            <>
              <IconBtn onClick={() => (window.location.href = api.downloadUrl(file.id))} title="Download"><Download size={14} /></IconBtn>
              <IconBtn onClick={onFavorite} title="Favorite"><Star size={14} /></IconBtn>
              <IconBtn onClick={onRename} title="Rename"><Pencil size={14} /></IconBtn>
              <IconBtn onClick={onMove} title="Move"><FolderInput size={14} /></IconBtn>
              <IconBtn onClick={onTrash} title="Trash" danger><Trash2 size={14} /></IconBtn>
            </>
          )}
        </div>
      </div>
      <div className="text-sm truncate">{file.name}</div>
      <div className="text-xs font-mono text-paper/40">{formatBytes(file.size)}</div>
    </div>
  );
}
