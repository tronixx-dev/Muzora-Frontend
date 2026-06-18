import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import Link from 'next/link';
import api from '../lib/api';
import {
  FiUpload, FiUsers, FiDisc, FiMusic,
  FiTrendingUp, FiPlay, FiHeadphones,
  FiStar, FiArrowRight,
} from 'react-icons/fi';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-dark-200 rounded-2xl p-5 border border-white/5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <p className="text-3xl font-black text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  const [stats,       setStats]       = useState(null);
  const [topSongs,    setTopSongs]    = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((r) => {
        setStats(r.data.stats);
        setTopSongs(r.data.topSongs);
        setRecentUsers(r.data.recentUsers);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Manage your music platform</p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard icon={FiMusic}      label="Total songs"   value={stats?.totalSongs}   color="bg-green-500"  />
            <StatCard icon={FiUsers}      label="Total users"   value={stats?.totalUsers}   color="bg-blue-500"   />
            <StatCard icon={FiHeadphones} label="Total plays"   value={stats?.totalPlays}   color="bg-purple-500" />
            <StatCard icon={FiUsers}      label="Artists"       value={stats?.totalArtists} color="bg-orange-500" />
            <StatCard icon={FiDisc}       label="Albums"        value={stats?.totalAlbums}  color="bg-pink-500"   />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Top songs */}
            <div className="bg-dark-200 rounded-2xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <FiTrendingUp size={18} className="text-green-500" /> Top songs
                </h2>
                <Link href="/trending" className="text-green-400 text-xs hover:text-green-300 flex items-center gap-1">
                  View all <FiArrowRight size={12} />
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {topSongs.map((song, i) => (
                  <div key={song._id} className="flex items-center gap-3">
                    <span className={`w-6 text-center font-bold text-sm ${
                      i === 0 ? 'text-yellow-400' :
                      i === 1 ? 'text-gray-300' :
                      i === 2 ? 'text-orange-400' : 'text-gray-600'
                    }`}>{i + 1}</span>
                    <img
                      src={song.coverUrl || '/placeholder.png'}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{song.title}</p>
                      <p className="text-gray-500 text-xs">{song.artist?.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs flex-shrink-0">
                      <FiPlay size={12} />
                      {song.plays?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent users */}
            <div className="bg-dark-200 rounded-2xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <FiUsers size={18} className="text-blue-500" /> Recent users
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-sm flex-shrink-0 overflow-hidden">
                      {user.avatar
                        ? <img src={user.avatar} className="w-full h-full object-cover" />
                        : user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{user.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                    <p className="text-gray-600 text-xs flex-shrink-0">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quick actions */}
      <h2 className="text-white font-bold text-lg mb-4">Quick actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { href: '/admin/upload',        label: 'Upload song',       desc: 'Add a new track',            icon: FiUpload, color: 'bg-green-500'  },
          { href: '/admin/songs',         label: 'Manage songs',      desc: 'Edit or delete songs',       icon: FiMusic,  color: 'bg-blue-500'   },
          { href: '/admin/artists',       label: 'Manage artists',    desc: 'Add images, edit profiles',  icon: FiUsers,  color: 'bg-orange-500' },
          { href: '/admin/featured',      label: 'Featured song',     desc: 'Pick homepage feature',      icon: FiStar,   color: 'bg-purple-500' },
        ].map(({ href, label, desc, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 bg-dark-200 hover:bg-dark-100 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <Icon size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold">{label}</p>
              <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
            </div>
            <FiArrowRight size={18} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}