import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppLayout from '../../components/layout/AppLayout';
import { SongCard } from '../../components/ui/SongCard';
import api from '../../lib/api';
import { FiMusic } from 'react-icons/fi';

const genreColors = {
  'Afrobeats':  'from-orange-500 to-red-600',
  'Hip-hop':    'from-purple-600 to-blue-700',
  'R&B':        'from-pink-500 to-purple-600',
  'Pop':        'from-blue-400 to-cyan-500',
  'Gospel':     'from-yellow-400 to-orange-500',
  'Jazz':       'from-indigo-500 to-purple-600',
  'Classical':  'from-gray-500 to-gray-700',
  'Electronic': 'from-cyan-400 to-blue-500',
  'Amapiano':   'from-green-400 to-teal-500',
  'Afropop':    'from-red-400 to-pink-500',
};

export default function GenrePage() {
  const router       = useRouter();
  const { genre }    = router.query;
  const [songs,   setSongs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!genre) return;
    api.get(`/songs/genre/${encodeURIComponent(genre)}`)
      .then((r) => setSongs(r.data.songs))
      .finally(() => setLoading(false));
  }, [genre]);

  const gradient = genreColors[genre] || 'from-green-500 to-teal-600';

  return (
    <AppLayout>
      {/* Header */}
      <div
        className={`rounded-2xl p-8 md:p-12 mb-8 bg-gradient-to-br ${gradient} relative overflow-hidden`}
      >
        <h1 className="text-white text-5xl md:text-7xl font-black relative z-10">
          {genre}
        </h1>
        <p className="text-white/70 text-sm mt-2 relative z-10">
          {songs.length} songs
        </p>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-black/10 rounded-full" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-20">
          <FiMusic size={48} className="mx-auto mb-4 text-gray-700" />
          <p className="text-white font-bold text-lg mb-1">No songs in this genre yet</p>
          <p className="text-gray-500 text-sm">Check back later</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {songs.map((song) => (
            <SongCard key={song._id} song={song} queue={songs} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}