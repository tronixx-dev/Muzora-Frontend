import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { FiUpload, FiCheck, FiEdit2, FiUsers } from 'react-icons/fi';

export default function AdminArtists() {
  const [artists,   setArtists]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(null);
  const [editing,   setEditing]   = useState(null);
  const [editForm,  setEditForm]  = useState({});

  useEffect(() => {
    api.get('/artists')
      .then((r) => setArtists(r.data.artists))
      .finally(() => setLoading(false));
  }, []);

  const uploadImage = async (artistId, file) => {
    if (!file) return;
    setUploading(artistId);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post(
        `/admin/artist-image/${artistId}`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setArtists((prev) =>
        prev.map((a) => a._id === artistId ? { ...a, imageUrl: data.imageUrl } : a)
      );
      toast.success('Artist image updated!');
    } catch {
      toast.error('Could not upload image');
    } finally {
      setUploading(null);
    }
  };

  const saveEdit = async (artistId) => {
    try {
      const { data } = await api.patch(`/artists/${artistId}`, editForm);
      setArtists((prev) =>
        prev.map((a) => a._id === artistId ? { ...a, ...data.artist } : a)
      );
      setEditing(null);
      toast.success('Artist updated!');
    } catch {
      toast.error('Could not update artist');
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Manage artists</h1>
        <p className="text-gray-500 text-sm mt-0.5">{artists.length} artists</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artists.map((artist) => (
            <div
              key={artist._id}
              className="bg-dark-200 rounded-2xl p-5 border border-white/5"
            >
              <div className="flex items-start gap-4 mb-4">
                {/* Artist image with upload */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-dark-100">
                    {artist.imageUrl ? (
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiUsers size={24} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors">
                    {uploading === artist._id ? (
                      <div className="w-3 h-3 border border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiUpload size={11} className="text-black" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => uploadImage(artist._id, e.target.files[0])}
                    />
                  </label>
                </div>

                {/* Artist info */}
                {editing === artist._id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-dark-300 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
                      placeholder="Artist name"
                    />
                    <input
                      type="text"
                      value={editForm.genres?.join(', ')}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        genres: e.target.value.split(',').map((g) => g.trim()),
                      })}
                      className="w-full bg-dark-300 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
                      placeholder="Genres (comma separated)"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full bg-dark-300 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50 resize-none"
                      placeholder="Bio"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(artist._id)}
                        className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <FiCheck size={14} /> Save
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="px-4 bg-dark-100 hover:bg-white/10 text-white rounded-lg py-2 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-white font-bold truncate">{artist.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {artist.followers?.toLocaleString() || 0} followers
                        </p>
                        {artist.genres?.length > 0 && (
                          <p className="text-gray-600 text-xs mt-1">
                            {artist.genres.join(' · ')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditing(artist._id);
                          setEditForm({
                            name:   artist.name,
                            bio:    artist.bio   || '',
                            genres: artist.genres || [],
                          });
                        }}
                        className="w-8 h-8 bg-dark-100 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ml-2"
                      >
                        <FiEdit2 size={14} className="text-gray-400" />
                      </button>
                    </div>
                    {artist.bio && (
                      <p className="text-gray-500 text-xs mt-2 line-clamp-2">{artist.bio}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}