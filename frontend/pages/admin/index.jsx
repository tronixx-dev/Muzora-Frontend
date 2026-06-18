import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { SongCard, SongRow } from '../components/ui/SongCard';
import AlbumCard from '../components/ui/AlbumCard';
import api from '../lib/api';
import { useAuthStore, usePlayerStore } from '../context/store';
import { FiPlay, FiTrendingUp, FiStar, FiZap } from 'react-icons/fi';
import Link from 'next/link';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const [songs,        setSongs]        = useState([]);
  const [albums,       setAlbums]       = useState([]);
  const [artists,      setArtists]      = useState([]);
  const [featuredSong, setFeaturedSong] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const { user }  = useAuthStore();
  const playSong  = usePlayerStore((s) => s.playSong);

  useEffect(() => {
    Promise.all([
      api.get('/songs?limit=8'),
      api.get('/albums?limit=6'),
      api.get('/artists?limit=8'),
      api.get('/admin/featured'),
    ])
      .then(([s, a, ar, f]) => {
        setSongs(s.data.songs);
        setAlbums(a.data.albums);
        setArtists(ar.data.artists);
        if (f.data.song) setFeaturedSong(f.data.song);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hero = featuredSong || songs[0];

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
      {/* Greeting */}
      <div className="mb-8 md:mb-10">
        <p className="text-gray-400 text-sm md:text-base mb-1">
          {getGreeting()}{user ? `, ${user.name.split(' ')[0]}` : ''} 👋
        </p>
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
          What do you want<br className="hidden md:block" /> to listen to?
        </h1>
      </div>

      {/* Featured hero song */}
      {hero && (
        <div
          className="relative rounded-2xl overflow-hidden mb-8 md:mb-10 cursor-pointer group"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
          onClick={() => playSong(hero, songs)}
        >
          <div className="flex items-center gap-4 md:gap-8 p-5 md:p-8">
            <div className="relative flex-shrink-0">
              <img
                src={hero.coverUrl || '/placeholder.png'}
                alt={hero.title}
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
                  {featuredSong ? '⭐ Featured' : '🔥 Trending'}
                </span>
              </div>
              <h2 className="text-white text-2xl md:text-4xl font-bold truncate mb-1">
                {hero.title}
              </h2>
              <p className="text-gray-300 text-sm md:text-lg">{hero.artist?.name}</p>
              <p className="text-gray-500 text-xs md:text-sm mt-2">{hero.genre}</p>
              <button
                className="mt-4 flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full px-5 py-2 text-sm transition-all hover:scale-105"
                onClick={(e) => { e.stopPropagation(); playSong(hero, songs); }}
              >
                <FiPlay size={14} fill="currentColor" /> Play now
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-green-500/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* Trending songs */}
      {songs.length > 0 && (
        <section className="mb-8 md:mb-10">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <div className="flex items-center gap-2">
              <FiTrendingUp size={20} className="text-green-500" />
              <h2 className="text-lg md:text-xl font-bold text-white">Trending now</h2>
            </div>
            <Link
              href="/trending"
              className="text-gray-400 text-sm hover:text-white transition-colors font-medium"
            >
              Show all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {songs.map((song) => (
              <SongCard key={song._id} song={song} queue={songs} />
            ))}
          </div>
        </section>
      )}

      {/* Popular artists */}
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
              <Link
                key={artist._id}
                href={`/artists/${artist._id}`}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-full aspect-square rounded-full overflow-hidden bg-dark-100 ring-2 ring-transparent group-hover:ring-green-500 transition-all duration-300">
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
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New albums */}
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

      {/* Discover section */}
      <section className="mb-8 md:mb-10">
        <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-5">
          Discover
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/trending"
            className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all"
          >
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiTrendingUp size={22} className="text-black" />
            </div>
            <div>
              <p className="text-white font-bold">Trending Charts</p>
              <p className="text-gray-400 text-xs mt-0.5">Top 10 most played</p>
            </div>
          </Link>

          <Link
            href="/new-releases"
            className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-500/20 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all"
          >
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiStar size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold">New Releases</p>
              <p className="text-gray-400 text-xs mt-0.5">Fresh tracks just dropped</p>
            </div>
          </Link>

          <Link
            href="/recommended"
            className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
          >
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiZap size={22} className="text-black" />
            </div>
            <div>
              <p className="text-white font-bold">Recommended</p>
              <p className="text-gray-400 text-xs mt-0.5">Made just for you</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Top songs - desktop only */}
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
          <p className="text-gray-400 text-sm">
            Upload songs from the admin panel to get started
          </p>
        </div>
      )}
    </AppLayout>
  );
}