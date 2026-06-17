import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { SongCard, SongRow } from '../components/ui/SongCard';
import AlbumCard from '../components/ui/AlbumCard';
import api from '../lib/api';
import { useAuthStore } from '../context/store';

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
      {/* Greeting */}
      <h1 className="text-3xl font-bold text-white mb-8">
        {getGreeting()}{user ? `, ${user.name.split(' ')[0]}` : ''} 👋
      </h1>

      {/* Trending songs grid */}
      {songs.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Trending now</h2>
            <button className="text-gray-400 text-sm hover:text-white transition-colors font-medium">
              Show all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {songs.map((song) => (
              <SongCard key={song._id} song={song} queue={songs} />
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">New albums</h2>
            <button className="text-gray-400 text-sm hover:text-white transition-colors font-medium">
              Show all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album._id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* Popular artists */}
      {artists.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Popular artists</h2>
            <button className="text-gray-400 text-sm hover:text-white transition-colors font-medium">
              Show all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {artists.map((artist) => (
              <div
                key={artist._id}
                className="flex flex-col items-center gap-3 group cursor-pointer"
              >
                <div className="w-full aspect-square rounded-full overflow-hidden bg-dark-100">
                  <img
                    src={artist.imageUrl || '/placeholder.png'}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-white text-sm font-medium text-center truncate w-full">
                  {artist.name}
                </p>
                <p className="text-gray-500 text-xs">Artist</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top songs list */}
      {songs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Top songs</h2>
          </div>
          <div className="flex items-center gap-4 px-4 pb-2 mb-2 border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
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
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🎵</span>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">No music yet</h2>
          <p className="text-gray-400 text-sm mb-6">
            Upload songs from the admin panel to get started
          </p>
        </div>
      )}
    </AppLayout>
  );
}