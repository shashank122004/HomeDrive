import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api';

function Overlay({ onClose, children, wide }) {
  return (
    <div onClick={onClose} className="fixed inset-0 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 z-20">
      <div onClick={(e) => e.stopPropagation()} className={`bg-panel border border-line rounded-xl w-full ${wide ? 'max-w-2xl' : 'max-w-sm'} p-6`}>
        {children}
      </div>
    </div>
  );
}

export function UploadModal({ folderId, onClose, onUploaded }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const file = fileRef.current.files[0];
    if (!file) return;
    setBusy(true);
    try {
      await api.upload(file, folderId);
      onUploaded();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <h3 className="font-medium mb-4">Upload a file</h3>
      <input ref={fileRef} type="file" className="mb-5 text-sm w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-line file:text-paper" />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-2 text-sm text-paper/50 hover:text-paper">Cancel</button>
        <button onClick={submit} disabled={busy} className="px-4 py-2 text-sm bg-amber text-ink font-medium rounded-lg disabled:opacity-60">
          {busy ? 'Uploading…' : 'Upload'}
        </button>
      </div>
    </Overlay>
  );
}

export function NewFolderModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  return (
    <Overlay onClose={onClose}>
      <h3 className="font-medium mb-4">New folder</h3>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && name.trim() && onCreate(name.trim())}
        placeholder="Folder name"
        className="w-full mb-5 px-3 py-2 rounded-lg bg-ink border border-line text-sm focus:outline-none focus:border-amber"
      />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-2 text-sm text-paper/50 hover:text-paper">Cancel</button>
        <button onClick={() => name.trim() && onCreate(name.trim())} className="px-4 py-2 text-sm bg-amber text-ink font-medium rounded-lg">
          Create
        </button>
      </div>
    </Overlay>
  );
}

// Picks the right in-browser viewer by mime type; falls back to file
// details when a type can't be rendered inline (per original spec).
export function PreviewModal({ file, onClose }) {
  const url = api.previewUrl(file.id);
  const mime = file.mime_type || '';

  return (
    <Overlay onClose={onClose} wide>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium truncate pr-4">{file.name}</h3>
        <button onClick={onClose} className="text-paper/50 hover:text-paper"><X size={18} /></button>
      </div>
      <div className="flex items-center justify-center min-h-[200px]">
        {mime.startsWith('image/') ? (
          <img src={url} className="max-h-[65vh] max-w-full object-contain rounded-lg" />
        ) : mime.startsWith('video/') ? (
          <video src={url} controls autoPlay className="max-h-[65vh] max-w-full rounded-lg" />
        ) : mime.startsWith('audio/') ? (
          <audio src={url} controls autoPlay className="w-full" />
        ) : mime === 'application/pdf' || mime.startsWith('text/') ? (
          <iframe src={url} className="w-full h-[65vh] bg-paper rounded-lg" />
        ) : (
          <div className="text-sm text-paper/60 space-y-2 self-start font-mono">
            <p>name: {file.name}</p>
            <p>type: {mime || 'unknown'}</p>
            <p className="text-paper/40">preview unavailable — download to view</p>
          </div>
        )}
      </div>
    </Overlay>
  );
}
