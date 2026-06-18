import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { SongCard } from '../components/ui/SongCard';
import api from '../lib/api';
import { useAuthStore } from '../context/store';
import { FiZap } from 'react-icons/fi';
import Link from 'next/link';

export default function RecommendedPage() {
  const [songs,   setSongs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get('/songs/recommended')
      .then((r) => setSongs(r.data.songs))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <AppLayout>
      {/* Header */}
      <div
        className="rounded-2xl p-6 md:p-10 mb-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #191414 100%)' }}
      >
        <div className="relative z-10">
          <p className="text-yellow-200 text-sm font-medium uppercase tracking-wider mb-2">
            Made for you
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-black mb-2">
            Recommended
          </h1>
          <p className="text-yellow-100 text-sm">
            Based on what you've been listening to
          </p>
        </div>
        <FiZap
          size={120}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10"
        />
      </div>

      {!user ? (
        <div className="text-center py-20">
          <FiZap size={48} className="mx-auto mb-4 text-gray-700" />
          <p className="text-white font-bold text-lg mb-2">
            Login to get recommendations
          </p>
          <p className="text-gray-500 text-sm mb-6">
            We'll suggest songs based on your listening history
          </p>
          <Link
            href="/login"
            className="bg-green-500 text-black font-bold px-8 py-3 rounded-full hover:bg-green-400 transition-colors inline-block"
          >
            Log in
          </Link>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-20">
          <FiZap size={48} className="mx-auto mb-4 text-gray-700" />
          <p className="text-white font-bold text-lg mb-2">No recommendations yet</p>
          <p className="text-gray-500 text-sm">
            Play some songs first and we'll suggest similar ones
          </p>
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