import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { FiStar, FiCheck, FiPlay } from 'react-icons/fi';

export default function AdminFeatured() {
  const [songs,      setSongs]      = useState([]);
  const [featured,   setFeatured]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [setting,    setSetting]    = useState(null);
  const [search,     setSearch]     = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/songs'),
      api.get('/admin/featured'),
    ]).then(([s, f]) => {
      setSongs(s.data.songs);
      setFeatured(f.data.song);
    }).finally(() => setLoading(false));
  }, []);

  const setAsFeatured = async (songId) => {
    setSetting(songId);
    try {
      const { data } = await api.post(`/admin/featured/${songId}`);
      setFeatured(data.song);
      toast.success(`"${data.song.title}" is now featured!`);
    } catch {
      toast.error('Could not set featured song');
    } finally {
      setSetting(null);
    }
  };

  const filtered = songs.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Featured song</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Choose which song appears as the hero on the homepage
        </p>
      </div>

      {/* Current featured */}
      {featured && (
        <div className="mb-8">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">
            Currently featured
          </p>
          <div
            className="relative rounded-2xl overflow-hidden p-6 flex items-center gap-5"
            style={{ background: 'linear-gradient(135deg, #1db954 0%, #191414 100%)' }}
          >
            <img
              src={featured.coverUrl || '/placeholder.png'}
              alt={featured.title}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiStar size={14} className="text-yellow-400" fill="currentColor" />
                <span className="text-green-300 text-xs font-bold uppercase tracking-wider">
                  Featured
                </span>
              </div>
              <p className="text-white text-xl font-bold">{featured.title}</p>
              <p className="text-green-200 text-sm">{featured.artist?.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Song picker */}
      <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">
        Pick a song
      </p>

      <input
        type="text"
        placeholder="Search songs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-dark-200 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500/50 mb-4"
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((song) => {
            const isFeatured = featured?._id === song._id;
            return (
              <div
                key={song._id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isFeatured
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-dark-200 border-white/5 hover:border-white/10'
                }`}
              >
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
                <button
                  onClick={() => !isFeatured && setAsFeatured(song._id)}
                  disabled={isFeatured || setting === song._id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                    isFeatured
                      ? 'bg-green-500 text-black cursor-default'
                      : 'bg-dark-100 text-white hover:bg-green-500 hover:text-black'
                  }`}
                >
                  {setting === song._id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isFeatured ? (
                    <><FiCheck size={14} /> Featured</>
                  ) : (
                    <><FiStar size={14} /> Feature</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}