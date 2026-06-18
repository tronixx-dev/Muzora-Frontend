import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { SongCard, SongRow } from '../components/ui/SongCard';
import AlbumCard from '../components/ui/AlbumCard';
import api from '../lib/api';
import { useAuthStore } from '../context/store';
import { FiPlay, FiTrendingUp } from 'react-icons/fi';
import { usePlayerStore } from '../context/store';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const [songs,   setSongs]   = useState([]);
  const [albums,  setAlbums]  = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const playSong = usePlayerStore((s) => s.playSong);

  useEffect(() => {
    Promise.all([
      api.get('/songs?limit=8'),
      api.get('/albums?limit=6'),
      api.get('/artists?limit=8'),
    ])
      .then(([s, a, ar]) => {
        setSongs(s.data.songs);
        setAlbums(a.data.albums);
        setArtists(ar.data.artists);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Hero greeting */}
      <div className="mb-8 md:mb-10">
        <p className="text-gray-400 text-sm md:text-base mb-1">{getGreeting()}{user ? `, ${user.name.split(' ')[0]}` : ''} 👋</p>
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
          What do you want<br className="hidden md:block" /> to listen to?
        </h1>
      </div>

      {/* Featured hero song */}
      {songs[0] && (
        <div
          className="relative rounded-2xl overflow-hidden mb-8 md:mb-10 cursor-pointer group"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
          onClick={() => playSong(songs[0], songs)}
        >
          <div className="flex items-center gap-4 md:gap-8 p-5 md:p-8">
            <div className="relative flex-shrink-0">
              <img
                src={songs[0].coverUrl || '/placeholder.png'}
                alt={songs[0].title}
                className="w-24 h-24 md:w-40 md:h-40 rounded-xl object-cover shadow-2xl"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl">
                  <FiPlay size={20} className="text-black ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  🔥 Featured
                </span>
              </div>
              <h2 className="text-white text-2xl md:text-4xl font-bold truncate mb-1">
                {songs[0].title}
              </h2>
              <p className="text-gray-300 text-sm md:text-lg">{songs[0].artist?.name}</p>
              <p className="text-gray-500 text-xs md:text-sm mt-2">{songs[0].genre}</p>
              <button
                className="mt-4 flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full px-5 py-2 text-sm transition-all hover:scale-105"
                onClick={(e) => { e.stopPropagation(); playSong(songs[0], songs); }}
              >
                <FiPlay size={14} fill="currentColor" /> Play now
              </button>
            </div>
          </div>
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-green-500/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* Quick picks row */}
      {songs.length > 0 && (
        <section className="mb-8 md:mb-10">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <div className="flex items-center gap-2">
              <FiTrendingUp size={20} className="text-green-500" />
              <h2 className="text-lg md:text-xl font-bold text-white">Trending now</h2>
            </div>
            <button className="text-gray-400 text-sm hover:text-white transition-colors font-medium">
              Show all
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {songs.map((song) => (
              <SongCard key={song._id} song={song} queue={songs} />
            ))}
          </div>
        </section>
      )}

      {/* Artists */}
      {artists.length > 0 && (
        <section className="mb-8 md:mb-10">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <h2 className="text-lg md:text-xl font-bold text-white">Popular artists</h2>
            <button className="text-gray-400 text-sm hover:text-white transition-colors font-medium">
              Show all
            </button>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-5">
            {artists.map((artist) => (
              <div key={artist._id} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full aspect-square rounded-full overflow-hidden bg-dark-100 ring-2 ring-transparent group-hover:ring-green-500 transition-all">
                  <img
                    src={artist.imageUrl || '/placeholder.png'}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <p className="text-white text-xs font-medium text-center truncate w-full">
                  {artist.name}
                </p>
                <p className="text-gray-600 text-xs hidden md:block">Artist</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <section className="mb-8 md:mb-10">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <h2 className="text-lg md:text-xl font-bold text-white">New albums</h2>
            <button className="text-gray-400 text-sm hover:text-white transition-colors font-medium">
              Show all
            </button>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {albums.map((album) => (
              <AlbumCard key={album._id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* Top songs list desktop */}
      {songs.length > 0 && (
        <section className="hidden md:block mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Top songs</h2>
          </div>
          <div className="flex items-center gap-4 px-4 pb-2 mb-2 border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
            <span className="w-5 text-center">#</span>
            <span className="flex-1">Title</span>
            <span className="hidden md:block max-w-[150px] w-full">Album</span>
            <span className="w-10 text-right">⏱</span>
          </div>
          <div className="flex flex-col">
            {songs.map((song, i) => (
              <SongRow key={song._id} song={song} index={i} queue={songs} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {songs.length === 0 && albums.length === 0 && artists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🎵</span>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">No music yet</h2>
          <p className="text-gray-400 text-sm">Upload songs from the admin panel to get started</p>
        </div>
      )}
    </AppLayout>
  );
}