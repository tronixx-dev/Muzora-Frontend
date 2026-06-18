import { useState, useRef } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { SongRow } from '../components/ui/SongCard';
import api from '../lib/api';
import { FiSearch } from 'react-icons/fi';

const genres = ['Afrobeats', 'Hip-hop', 'R&B', 'Pop', 'Gospel', 'Jazz', 'Classical', 'Electronic'];
const genreColors = [
  'from-pink-500 to-purple-600',
  'from-yellow-400 to-orange-500',
  'from-blue-500 to-cyan-400',
  'from-green-400 to-teal-500',
  'from-red-500 to-pink-500',
  'from-indigo-500 to-blue-400',
  'from-purple-500 to-pink-400',
  'from-orange-400 to-red-500',
];

export default function SearchPage() {
  const [query,   setQuery]   = useState('');
  const [songs,   setSongs]   = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  const doSearch = (q) => {
    clearTimeout(timer.current);
    if (!q.trim()) { setSongs([]); setArtists([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const [s, a] = await Promise.all([
          api.get(`/songs?search=${encodeURIComponent(q)}&limit=10`),
          api.get(`/artists?search=${encodeURIComponent(q)}`),
        ]);
        setSongs(s.data.songs);
        setArtists(a.data.artists);
      } catch { }
      finally { setLoading(false); }
    }, 400);
  };

  return (
    <AppLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">Search</h1>

      <div className="relative mb-6 md:mb-10">
        <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Artists, songs, podcasts"
          value={query}
          onChange={(e) => { setQuery(e.target.value); doSearch(e.target.value); }}
          className="w-full bg-white text-black rounded-full pl-11 pr-4 py-3 text-sm font-medium focus:outline-none placeholder-gray-500"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Genre browse */}
      {!query && (
        <section>
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-5">Browse categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {genres.map((genre, i) => (
              <div
                key={genre}
                className={`bg-gradient-to-br ${genreColors[i]} rounded-xl p-4 md:p-6 cursor-pointer hover:scale-105 transition-transform relative overflow-hidden h-20 md:h-28`}
              >
                <p className="text-white font-bold text-sm md:text-lg">{genre}</p>
                <div className="absolute -bottom-3 -right-3 w-14 h-14 md:w-20 md:h-20 bg-black/20 rounded-xl transform rotate-12" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {query && (
        <>
          {artists.length > 0 && (
            <section className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-5">Artists</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {artists.slice(0, 6).map((artist) => (
                  <div key={artist._id} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-full aspect-square rounded-full overflow-hidden bg-dark-100">
                      <img
                        src={artist.imageUrl || '/placeholder.png'}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <p className="text-white text-xs font-medium text-center truncate w-full">{artist.name}</p>
                    <p className="text-gray-500 text-xs">Artist</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {songs.length > 0 && (
            <section>
              <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-5">Songs</h2>
              <div className="flex flex-col">
                {songs.map((song, i) => (
                  <SongRow key={song._id} song={song} index={i} queue={songs} />
                ))}
              </div>
            </section>
          )}

          {!loading && songs.length === 0 && artists.length === 0 && (
            <div className="text-center py-16 md:py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-white text-lg font-bold mb-2">No results found</p>
              <p className="text-gray-400 text-sm">Try searching for something else</p>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}