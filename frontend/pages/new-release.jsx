import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { SongCard } from '../components/ui/SongCard';
import api from '../lib/api';
import { FiStar } from 'react-icons/fi';

export default function NewReleasesPage() {
  const [songs,   setSongs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/songs/new-releases')
      .then((r) => setSongs(r.data.songs))
      .finally(() => setLoading(false));
  }, []);

  function timeAgo(date) {
    const days = Math.floor((new Date() - new Date(date)) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7)  return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  return (
    <AppLayout>
      {/* Header */}
      <div
        className="rounded-2xl p-6 md:p-10 mb-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #191414 100%)' }}
      >
        <div className="relative z-10">
          <p className="text-purple-300 text-sm font-medium uppercase tracking-wider mb-2">
            Fresh picks
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-black mb-2">
            New Releases
          </h1>
          <p className="text-purple-200 text-sm">
            The latest tracks just dropped
          </p>
        </div>
        <FiStar
          size={120}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-20">
          <FiStar size={48} className="mx-auto mb-4 text-gray-700" />
          <p className="text-white font-bold text-lg mb-1">No new releases yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {songs.map((song) => (
            <div key={song._id} className="relative">
              <SongCard song={song} queue={songs} />
              <span className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
                {timeAgo(song.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}