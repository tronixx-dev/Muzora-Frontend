import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiList, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [name,      setName]      = useState('');
  const [creating,  setCreating]  = useState(false);
  const [loading,   setLoading]   = useState(true);

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
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">My playlists</h1>

      <div className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="New playlist name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        />
        <button
          onClick={createPlaylist}
          disabled={creating || !name.trim()}
          className="flex items-center gap-2 bg-purple-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          <FiPlus size={16} /> Create
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FiList size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Create your first playlist above</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {playlists.map((pl) => (
            <div key={pl._id} className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4 group">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiList size={20} className="text-purple-400" />
              </div>
              <Link href={`/playlists/${pl._id}`} className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{pl.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{pl.songs?.length || 0} songs</p>
              </Link>
              <button
                onClick={() => deletePlaylist(pl._id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
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