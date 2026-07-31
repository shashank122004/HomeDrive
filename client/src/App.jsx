import { useEffect, useState } from 'react';
import { api } from './api';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = still checking

  useEffect(() => {
    api.me().then((d) => setUser(d.user)).catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return (
      <div className="h-screen flex items-center justify-center font-mono text-sm text-line">
        loading_
      </div>
    );
  }

  if (!user) return <Auth onAuthed={setUser} />;

  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}
