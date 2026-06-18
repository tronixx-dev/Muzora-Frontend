import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
  FiSearch, FiTrash2, FiEdit2,
  FiPlay, FiCheck, FiX,
} from 'react-icons/fi';

export default function AdminSongs() {
  const [songs,    setSongs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [editing,  setEditing]  = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleting, setDeleting] = useState(null);

  const fetchSongs = (q = '') => {
    setLoading(true);
    api.get(`/admin/songs?search=${q}`)
      .then((r) => setSongs(r.data.songs))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSongs(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    clearTimeout(window._st);
    window._st = setTimeout(() => fetchSongs(e.target.value), 400);
  };

  const startEdit = (song) => {
    setEditing(song._id);
    setEditForm({ title: song.title, genre: song.genre || '' });
  };

  const saveEdit = async (songId) => {
    try {
      const { data } = await api.patch(`/songs/${songId}`, editForm);
      setSongs((prev) => prev.map((s) => s._id === songId ? { ...s, ...data.song } : s));
      setEditing(null);
      toast.success('Song updated!');
    } catch {
      toast.error('Could not update song');
    }
  };

  const deleteSong = async (songId) => {
    try {
      await api.delete(`/songs/${songId}`);
      setSongs((prev) => prev.filter((s) => s._id !== songId));
      setDeleting(null);
      toast.success('Song deleted');
    } catch {
      toast.error('Could not delete song');
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage songs</h1>
          <p className="text-gray-500 text-sm mt-0.5">{songs.length} songs total</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search songs..."
          value={search}
          onChange={handleSearch}
          className="w-full bg-dark-200 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-green-500/50"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {songs.map((song) => (
            <div
              key={song._id}
              className="bg-dark-200 rounded-xl border border-white/5 overflow-hidden"
            >
              {editing === song._id ? (
                /* Edit mode */
                <div className="flex items-center gap-3 p-4">
                  <img
                    src={song.coverUrl || '/placeholder.png'}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="bg-dark-300 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={editForm.genre}
                      onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                      className="bg-dark-300 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
                      placeholder="Genre"
                    />
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => saveEdit(song._id)}
                      className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center hover:bg-green-400 transition-colors"
                    >
                      <FiCheck size={16} className="text-black" />
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="w-9 h-9 bg-dark-100 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <FiX size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              ) : deleting === song._id ? (
                /* Delete confirm */
                <div className="flex items-center gap-3 p-4">
                  <img
                    src={song.coverUrl || '/placeholder.png'}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Delete "{song.title}"?</p>
                    <p className="text-gray-500 text-xs">This cannot be undone</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => deleteSong(song._id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleting(null)}
                      className="px-4 py-2 bg-dark-100 hover:bg-white/10 text-white text-sm rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal view */
                <div className="flex items-center gap-3 p-4 group">
                  <img
                    src={song.coverUrl || '/placeholder.png'}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{song.title}</p>
                    <p className="text-gray-500 text-xs truncate">
                      {song.artist?.name}
                      {song.genre ? ` · ${song.genre}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 text-xs flex-shrink-0 mr-2">
                    <FiPlay size={11} /> {song.plays?.toLocaleString() || 0}
                  </div>
                  <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(song)}
                      className="w-9 h-9 bg-dark-100 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <FiEdit2 size={15} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => setDeleting(song._id)}
                      className="w-9 h-9 bg-dark-100 hover:bg-red-500/20 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <FiTrash2 size={15} className="text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}