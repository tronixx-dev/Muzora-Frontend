import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { FiUpload, FiCheckCircle, FiMusic } from 'react-icons/fi';

export default function AdminUpload() {
  const [artists,   setArtists]   = useState([]);
  const [albums,    setAlbums]    = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '', artistId: '', albumId: '',
    genre: '', trackNumber: '', lyrics: '',
  });

  useEffect(() => {
    Promise.all([api.get('/artists'), api.get('/albums')]).then(([a, b]) => {
      setArtists(a.data.artists);
      setAlbums(b.data.albums);
    });
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.artistId || !audioFile)
      return toast.error('Title, artist, and audio file are required');

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('audio', audioFile);
      if (coverFile) fd.append('cover', coverFile);
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      await api.post('/songs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Song uploaded successfully!');
      setForm({ title: '', artistId: '', albumId: '', genre: '', trackNumber: '', lyrics: '' });
      setAudioFile(null);
      setCoverFile(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const Dropzone = ({ label, file, setFile, accept, icon }) => (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-green-500/50 hover:bg-white/5 transition-all bg-dark-300">
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FiCheckCircle size={28} className="text-green-500" />
            <span className="text-sm text-gray-300 px-4 truncate max-w-full text-center">{file.name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FiUpload size={24} className="text-gray-500" />
            <span className="text-sm text-gray-500">Click to upload</span>
            <span className="text-xs text-gray-600">{accept === 'audio/*' ? 'MP3, WAV, FLAC' : 'JPG, PNG, WEBP'}</span>
          </div>
        )}
        <input type="file" accept={accept} className="hidden" onChange={(e) => setFile(e.target.files[0])} />
      </label>
    </div>
  );

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Upload song</h1>
        <p className="text-gray-400 mt-1">Add a new track to your music library</p>
      </div>

      <div className="bg-dark-200 rounded-2xl p-6 max-w-2xl border border-white/5">
        <div className="space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Song title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
              placeholder="Enter song title"
            />
          </div>

          {/* Artist + Album */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Artist *</label>
              <select
                value={form.artistId}
                onChange={(e) => setForm({ ...form, artistId: e.target.value })}
                className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500/50 transition-colors"
              >
                <option value="">Select artist</option>
                {artists.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Album</label>
              <select
                value={form.albumId}
                onChange={(e) => setForm({ ...form, albumId: e.target.value })}
                className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500/50 transition-colors"
              >
                <option value="">No album</option>
                {albums.map((a) => (
                  <option key={a._id} value={a._id}>{a.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Genre + Track */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
              <input
                type="text"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
                placeholder="Afrobeats, Hip-hop..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Track #</label>
              <input
                type="number"
                value={form.trackNumber}
                onChange={(e) => setForm({ ...form, trackNumber: e.target.value })}
                className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500/50 transition-colors"
                min={1}
                placeholder="1"
              />
            </div>
          </div>

          {/* File uploads */}
          <div className="grid grid-cols-2 gap-4">
            <Dropzone
              label="Audio file (MP3) *"
              file={audioFile}
              setFile={setAudioFile}
              accept="audio/*"
            />
            <Dropzone
              label="Cover image"
              file={coverFile}
              setFile={setCoverFile}
              accept="image/*"
            />
          </div>

          {/* Lyrics */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Lyrics (optional)</label>
            <textarea
              value={form.lyrics}
              onChange={(e) => setForm({ ...form, lyrics: e.target.value })}
              className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors resize-none"
              placeholder="Paste song lyrics here..."
              rows={4}
            />
          </div>
        </div>

        {/* Upload button */}
        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="w-full mt-6 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full py-3.5 text-sm transition-all disabled:opacity-50 hover:scale-105 active:scale-100 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FiUpload size={16} />
              Upload song
            </>
          )}
        </button>
      </div>
    </AppLayout>
  );
}