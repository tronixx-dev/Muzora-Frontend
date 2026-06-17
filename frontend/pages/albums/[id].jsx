import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppLayout from '../../components/layout/AppLayout';
import { SongRow } from '../../components/ui/SongCard';
import { usePlayerStore } from '../../context/store';
import api from '../../lib/api';
import { FiPlay } from 'react-icons/fi';

export default function AlbumPage() {
  const router = useRouter();
  const { id } = router.query;
  const [album,   setAlbum]   = useState(null);
  const [songs,   setSongs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const playSong = usePlayerStore((s) => s.playSong);

  useEffect(() => {
    if (!id) return;
    api.get(`/albums/${id}`)
      .then((r) => { setAlbum(r.data.album); setSongs(r.data.songs); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!album) return <AppLayout><p className="text-gray-500">Album not found.</p></AppLayout>;

  return (
    <AppLayout>
      <div className="flex items-end gap-6 mb-8">
        <img
          src={album.coverUrl || '/placeholder.png'}
          alt={album.title}
          className="w-40 h-40 rounded-2xl object-cover shadow-md flex-shrink-0"
        />
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Album</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{album.title}</h1>
          <p className="text-gray-500 text-sm">{album.artist?.name}</p>
          <button
            onClick={() => songs[0] && playSong(songs[0], songs)}
            className="mt-4 flex items-center gap-2 bg-purple-600 text-white rounded-full px-6 py-2 text-sm font-medium hover:bg-purple-700"
          >
            <FiPlay size={16} /> Play all
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
        {songs.map((song, i) => (
          <SongRow key={song._id} song={song} index={i} queue={songs} />
        ))}
      </div>
    </AppLayout>
  );
}