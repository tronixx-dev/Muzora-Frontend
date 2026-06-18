import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppLayout from '../../components/layout/AppLayout';
import { SongRow } from '../../components/ui/SongCard';
import { usePlayerStore, useAuthStore } from '../../context/store';
import api from '../../lib/api';
import { FiPlay, FiUserPlus, FiUserCheck, FiMusic, FiDisc } from 'react-icons/fi';
import Equalizer from '../../components/ui/Equalizer';
import Link from 'next/link';

export default function ArtistPage() {
  const router  = useRouter();
  const { id }  = router.query;
  const [artist,    setArtist]    = useState(null);
  const [songs,     setSongs]     = useState([]);
  const [albums,    setAlbums]    = useState([]);
  const [following, setFollowing] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const { user }  = useAuthStore();
  const { playSong, currentSong, isPlaying } = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/artists/${id}`),
      api.get('/albums'),
    ]).then(([ar, al]) => {
      setArtist(ar.data.artist);
      setSongs(ar.data.songs);
      setAlbums(al.data.albums.filter((a) => String(a.artist?._id) === String(id)));
    }).finally(() => setLoading(false));

    if (user) {
      api.get('/users/following').then((r) => {
        setFollowing(r.data.artists.some((a) => String(a._id) === String(id)));
      }).catch(() => {});
    }
  }, [id, user]);

  const toggleFollow = async () => {
    if (!user) return;
    try {
      const { data } = await api.patch(`/users/follow/${id}`);
      setFollowing(data.following);
      setArtist((prev) => ({
        ...prev,
        followers: prev.followers + (data.following ? 1 : -1),
      }));
    } catch { }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!artist) {
    return (
      <AppLayout>
        <p className="text-gray-400">Artist not found.</p>
      </AppLayout>
    );
  }

  const isCurrentArtistPlaying =
    currentSong?.artist?._id === id && isPlaying;

  return (
    <AppLayout>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8" style={{ minHeight: '280px' }}>
        <div className="absolute inset-0">
          {artist.imageUrl ? (
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-800 to-dark-400" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        <div
          className="relative flex flex-col justify-end p-6 md:p-10"
          style={{ minHeight: '280px' }}
        >
          {artist.verified && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-3 w-fit">
              ✓ Verified Artist
            </span>
          )}
          <h1 className="text-white text-4xl md:text-7xl font-black mb-3 leading-none">
            {artist.name}
          </h1>
          <p className="text-gray-300 text-sm mb-1">
            {artist.followers?.toLocaleString()} followers
          </p>
          {artist.genres?.length > 0 && (
            <p className="text-gray-400 text-xs">
              {artist.genres.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => songs[0] && playSong(songs[0], songs)}
          className="w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all"
        >
          {isCurrentArtistPlaying ? (
            <Equalizer isPlaying={true} size="sm" color="#000" />
          ) : (
            <FiPlay size={24} className="text-black ml-1" fill="currentColor" />
          )}
        </button>

        {user && (
          <button
            onClick={toggleFollow}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full border text-sm font-semibold transition-all ${
              following
                ? 'border-green-500 text-green-400 hover:border-white hover:text-white'
                : 'border-white/30 text-white hover:border-white'
            }`}
          >
            {following
              ? <><FiUserCheck size={16} /> Following</>
              : <><FiUserPlus size={16} /> Follow</>}
          </button>
        )}
      </div>

      {/* Bio */}
      {artist.bio && (
        <div className="bg-white/5 rounded-2xl p-5 mb-8 border border-white/5">
          <p className="text-gray-300 text-sm leading-relaxed">{artist.bio}</p>
        </div>
      )}

      {/* Popular songs */}
      {songs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <FiMusic size={20} className="text-green-500" /> Popular
          </h2>
          <div className="flex flex-col">
            {songs.slice(0, 5).map((song, i) => (
              <SongRow key={song._id} song={song} index={i} queue={songs} />
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <section className="mb-10">
          <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <FiDisc size={20} className="text-green-500" /> Albums
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {albums.map((album) => (
              <Link
                key={album._id}
                href={`/albums/${album._id}`}
                className="bg-white/5 hover:bg-white/10 p-4 rounded-xl cursor-pointer group transition-all border border-white/5"
              >
                <img
                  src={album.coverUrl || '/placeholder.png'}
                  alt={album.title}
                  className="w-full aspect-square object-cover rounded-lg mb-3 shadow-lg"
                />
                <p className="text-white text-sm font-semibold truncate">{album.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {album.releaseDate
                    ? new Date(album.releaseDate).getFullYear()
                    : ''}{' '}
                  · Album
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {songs.length === 0 && (
        <div className="text-center py-16">
          <FiMusic size={40} className="mx-auto mb-4 text-gray-700" />
          <p className="text-gray-500">No songs available yet</p>
        </div>
      )}
    </AppLayout>
  );
}