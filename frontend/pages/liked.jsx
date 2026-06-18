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
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <FiHeart size={20} className="text-white" fill="white" />
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Playlist</p>
          <h1 className="text-xl md:text-3xl font-bold text-white">Liked songs</h1>
          <p className="text-gray-400 text-xs md:text-sm mt-0.5">{songs.length} songs</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-16 md:py-20">
          <FiHeart size={48} className="mx-auto mb-4 text-gray-700" />
          <p className="text-white font-bold text-lg mb-1">Songs you like will appear here</p>
          <p className="text-gray-400 text-sm">Save songs by tapping the heart icon</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {songs.map((song, i) => (
            <SongRow key={song._id} song={song} index={i} queue={songs} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}