import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { SongRow } from '../components/ui/SongCard';
import api from '../lib/api';
import { FiTrendingUp } from 'react-icons/fi';

export default function TrendingPage() {
  const [songs,   setSongs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/songs/trending')
      .then((r) => setSongs(r.data.songs))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      {/* Header */}
      <div
        className="rounded-2xl p-6 md:p-10 mb-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1db954 0%, #191414 100%)' }}
      >
        <div className="relative z-10">
          <p className="text-green-300 text-sm font-medium uppercase tracking-wider mb-2">
            Charts
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-black mb-2">
            Trending
          </h1>
          <p className="text-green-200 text-sm">
            Top {songs.length} most played songs right now
          </p>
        </div>
        <FiTrendingUp
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
          <FiTrendingUp size={48} className="mx-auto mb-4 text-gray-700" />
          <p className="text-white font-bold text-lg mb-1">No trending songs yet</p>
          <p className="text-gray-500 text-sm">Start playing songs to see the charts</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-4 px-4 pb-2 mb-2 border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
            <span className="w-8 text-center">#</span>
            <span className="flex-1">Title</span>
            <span className="hidden md:block w-20 text-right">Plays</span>
            <span className="w-10 text-right">⏱</span>
          </div>
          <div className="flex flex-col">
            {songs.map((song, i) => (
              <div key={song._id} className="flex items-center">
                <div className="w-8 flex-shrink-0 text-center">
                  <span className={`font-bold text-lg ${
                    i === 0 ? 'text-yellow-400' :
                    i === 1 ? 'text-gray-300' :
                    i === 2 ? 'text-orange-400' :
                    'text-gray-600'
                  }`}>
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <SongRow song={song} index={i} queue={songs} />
                </div>
                <div className="hidden md:flex items-center gap-1 w-20 justify-end pr-4">
                  <span className="text-gray-500 text-xs tabular-nums">
                    {song.plays?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}