import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiList, FiTrash2, FiMusic } from 'react-icons/fi';
import Link from 'next/link';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [name,      setName]      = useState('');
  const [creating,  setCreating]  = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [showing,   setShowing]   = useState(false);

  useEffect(() => {
    api.get('/playlists/mine')
      .then((r) => setPlaylists(r.data.playlists))
      .finally(() => setLoading(false));
  }, []);

  const createPlaylist = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post('/playlists', { name });
      setPlaylists((prev) => [data.playlist, ...prev]);
      setName('');
      setShowing(false);
      toast.success('Playlist created!');
    } catch {
      toast.error('Could not create playlist');
    } finally {
      setCreating(false);
    }
  };

  const deletePlaylist = async (id) => {
    try {
      await api.delete(`/playlists/${id}`);
      setPlaylists((prev) => prev.filter((p) => p._id !== id));
      toast.success('Playlist deleted');
    } catch {
      toast.error('Could not delete playlist');
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-white">My playlists</h1>
        <button
          onClick={() => setShowing(!showing)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full px-4 py-2 text-sm transition-all"
        >
          <FiPlus size={16} /> New
        </button>
      </div>

      {/* Create playlist form */}
      {showing && (
        <div className="bg-dark-200 rounded-xl p-4 mb-6 border border-white/10">
          <p className="text-white font-medium mb-3">Create playlist</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Playlist name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
              autoFocus
              className="flex-1 bg-dark-300 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50"
            />
            <button
              onClick={createPlaylist}
              disabled={creating || !name.trim()}
              className="bg-green-500 text-black font-bold rounded-lg px-4 py-2 text-sm disabled:opacity-50"
            >
              {creating ? '...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-16 md:py-20">
          <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMusic size={28} className="text-gray-600" />
          </div>
          <p className="text-white font-bold text-lg mb-1">Create your first playlist</p>
          <p className="text-gray-400 text-sm">Tap the New button to get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {playlists.map((pl) => (
            <div
              key={pl._id}
              className="flex items-center gap-3 md:gap-4 bg-dark-200 hover:bg-dark-100 rounded-xl px-4 py-3 group transition-colors"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiList size={18} className="text-white" />
              </div>
              <Link href={`/playlists/${pl._id}`} className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{pl.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{pl.songs?.length || 0} songs</p>
              </Link>
              <button
                onClick={() => deletePlaylist(pl._id)}
                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all p-2"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}