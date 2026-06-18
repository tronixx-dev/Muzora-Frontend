import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../lib/api';
import { useAuthStore } from '../context/store';
import toast from 'react-hot-toast';
import { FiEdit2, FiMusic, FiHeart, FiUsers, FiSave, FiX } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, login, token } = useAuthStore();
  const [editing, setEditing]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [stats,   setStats]     = useState({ songs: 0, liked: 0, following: 0 });
  const [form, setForm] = useState({
    name:   user?.name   || '',
    bio:    user?.bio    || '',
    avatar: user?.avatar || '',
  });

  useEffect(() => {
    Promise.all([
      api.get('/users/likes'),
      api.get('/users/following'),
    ]).then(([likes, following]) => {
      setStats({
        liked:     likes.data.songs.length,
        following: following.data.artists.length,
      });
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch('/users/profile', form);
      login(token, data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Could not update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">

        {/* Profile header */}
        <div className="relative mb-8">
          <div
            className="h-32 md:h-48 rounded-2xl mb-16 md:mb-20"
            style={{ background: 'linear-gradient(135deg, #1db954 0%, #191414 100%)' }}
          />

          <div className="absolute bottom-0 left-6 flex items-end gap-4">
            <div className="relative">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-dark-400 overflow-hidden bg-dark-100 shadow-xl">
                {form.avatar ? (
                  <img src={form.avatar} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-500">
                    <span className="text-black text-3xl md:text-4xl font-bold">
                      {user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="pb-2">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Profile</p>
              <h1 className="text-white text-2xl md:text-3xl font-bold">{user?.name}</h1>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="absolute top-4 right-4 flex items-center gap-2 bg-dark-200 hover:bg-dark-100 text-white text-sm font-medium px-4 py-2 rounded-full border border-white/10 transition-all"
          >
            {editing ? <><FiX size={14} /> Cancel</> : <><FiEdit2 size={14} /> Edit profile</>}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: FiHeart,  label: 'Liked songs',      value: stats.liked },
            { icon: FiUsers,  label: 'Following',         value: stats.following },
            { icon: FiMusic,  label: 'Playlists',         value: 0 },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-dark-200 rounded-xl p-4 text-center border border-white/5">
              <Icon size={20} className="text-green-500 mx-auto mb-2" />
              <p className="text-white text-xl font-bold">{value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Edit form */}
        {editing && (
          <div className="bg-dark-200 rounded-2xl p-6 mb-8 border border-white/10">
            <h2 className="text-white font-bold text-lg mb-5">Edit profile</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Display name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500/50"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500/50 resize-none"
                  placeholder="Tell people about yourself..."
                  rows={3}
                  maxLength={150}
                />
                <p className="text-gray-600 text-xs mt-1 text-right">{form.bio.length}/150</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Avatar URL</label>
                <input
                  type="text"
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500/50"
                  placeholder="https://your-image-url.com/photo.jpg"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full mt-5 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full py-3 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Saving...</>
                : <><FiSave size={16} /> Save changes</>}
            </button>
          </div>
        )}

        {/* Bio display */}
        {!editing && user?.bio && (
          <div className="bg-dark-200 rounded-2xl p-5 mb-8 border border-white/5">
            <p className="text-gray-400 text-sm leading-relaxed">{user.bio}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}