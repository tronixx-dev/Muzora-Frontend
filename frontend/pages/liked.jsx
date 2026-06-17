import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { SongRow } from '../components/ui/SongCard';
import api from '../lib/api';
import { FiHeart } from 'react-icons/fi';

export default function LikedPage() {
  const [songs,   setSongs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/likes')
      .then((r) => setSongs(r.data.songs))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
          <FiHeart size={22} className="text-pink-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Liked songs</h1>
          <p className="text-sm text-gray-500">{songs.length} songs</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FiHeart size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Songs you like will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {songs.map((song, i) => (
            <SongRow key={song._id} song={song} index={i} queue={songs} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}