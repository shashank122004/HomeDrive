import { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = mode === 'login' ? await api.login(form) : await api.register(form);
      onAuthed(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 font-mono text-amber">
          <Lock size={18} />
          <span className="text-sm tracking-widest uppercase">HomeDrive</span>
        </div>

        <h1 className="text-2xl font-semibold mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create your vault'}
        </h1>
        <p className="text-sm text-paper/50 mb-6">
          {mode === 'login' ? 'Log in to reach your files.' : 'Set up your private storage.'}
        </p>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {mode === 'register' && (
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full mb-3 px-3 py-2.5 rounded-lg bg-panel border border-line text-sm focus:outline-none focus:border-amber"
          />
        )}
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full mb-3 px-3 py-2.5 rounded-lg bg-panel border border-line text-sm focus:outline-none focus:border-amber"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full mb-5 px-3 py-2.5 rounded-lg bg-panel border border-line text-sm focus:outline-none focus:border-amber"
        />

        <button
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-amber hover:bg-amber-dim text-ink font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}
          {!loading && <ArrowRight size={16} />}
        </button>

        <p className="text-sm text-paper/50 mt-5 text-center">
          {mode === 'login' ? "No account yet? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-amber hover:underline"
          >
            {mode === 'login' ? 'Register' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  );
}
