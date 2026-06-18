import Link from 'next/link';
import { useRouter } from 'next/router';
import Player from '../player/Player';
import { useAuthStore, usePlayerStore } from '../../context/store';
import { useTheme } from '../../context/ThemeContext';
import {
  FiHome, FiSearch, FiHeart, FiClock,
  FiList, FiLogOut, FiShield, FiMusic,
  FiPlusSquare, FiBell, FiUser, FiSun, FiMoon,
  FiTrendingUp, FiStar, FiZap,
} from 'react-icons/fi';

const libraryItems = [
  { href: '/playlists', label: 'My playlists',    icon: FiList,  type: 'Playlist' },
  { href: '/liked',     label: 'Liked songs',     icon: FiHeart, type: 'Playlist' },
  { href: '/history',   label: 'Recently played', icon: FiClock, type: 'Playlist' },
];

export default function AppLayout({ children }) {
  const router             = useRouter();
  const { user, logout }   = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { currentSong }    = usePlayerStore();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">

      {/* Top row: sidebar + main + right panel */}
      <div className="flex flex-1 min-h-0 gap-2 p-2 pb-0">

        {/* LEFT SIDEBAR */}
        <aside className="hidden md:flex flex-col gap-2 w-64 flex-shrink-0">

          {/* Nav */}
          <div className="bg-[#121212] rounded-xl p-4">
            <Link href="/" className="flex items-center gap-3 mb-6 px-2">
              <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FiMusic className="text-black" size={18} />
              </div>
              <span className="font-bold text-white text-xl tracking-tight">Muzora</span>
            </Link>

            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  router.pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiHome size={22} /> Home
              </Link>
              <Link
                href="/search"
                className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  router.pathname === '/search' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiSearch size={22} /> Search
              </Link>
              <Link
                href="/trending"
                className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  router.pathname === '/trending' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiTrendingUp size={22} /> Trending
              </Link>
              <Link
                href="/new-releases"
                className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  router.pathname === '/new-releases' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiStar size={22} /> New releases
              </Link>
              <Link
                href="/recommended"
                className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  router.pathname === '/recommended' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiZap size={22} /> Recommended
              </Link>
              <Link
                href="/notifications"
                className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  router.pathname === '/notifications' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiBell size={22} /> Notifications
              </Link>
              <Link
                href="/profile"
                className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  router.pathname === '/profile' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiUser size={22} /> Profile
              </Link>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all w-full"
              >
                {isDark ? <FiSun size={22} /> : <FiMoon size={22} />}
                {isDark ? 'Light mode' : 'Dark mode'}
              </button>
            </nav>
          </div>

          {/* Library */}
          <div className="bg-[#121212] rounded-xl flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-white font-bold text-sm flex items-center gap-2">
                <FiList size={18} /> Your Library
              </span>
              <Link href="/playlists" className="text-gray-400 hover:text-white transition-colors">
                <FiPlusSquare size={18} />
              </Link>
            </div>

            {/* Library items with album art thumbnails */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {libraryItems.map(({ href, label, icon: Icon, type }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-all hover:bg-white/10 ${
                    router.pathname === href ? 'bg-white/10' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    href === '/liked' ? 'bg-gradient-to-br from-blue-700 to-purple-500' :
                    href === '/history' ? 'bg-gradient-to-br from-green-700 to-green-400' :
                    'bg-gradient-to-br from-gray-700 to-gray-500'
                  }`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{label}</p>
                    <p className="text-gray-500 text-xs">{type}</p>
                  </div>
                </Link>
              ))}

              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-all hover:bg-white/10 mt-1 ${
                    router.pathname.startsWith('/admin') ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-400 flex items-center justify-center flex-shrink-0">
                    <FiShield size={18} className="text-black" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Admin panel</p>
                    <p className="text-gray-500 text-xs">Management</p>
                  </div>
                </Link>
              )}
            </div>

            {/* User at bottom of library */}
            {user && (
              <div className="border-t border-white/10 px-4 py-3 flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-sm flex-shrink-0 overflow-hidden">
                    {user.avatar
                      ? <img src={user.avatar} className="w-full h-full object-cover" />
                      : user.name?.[0]?.toUpperCase()}
                  </div>
                  <p className="text-white text-sm font-medium truncate">{user.name}</p>
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <FiLogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-[#121212] rounded-xl overflow-y-auto min-w-0">

          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between px-4 pt-6 pb-4 sticky top-0 bg-[#121212] z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <FiMusic className="text-black" size={16} />
              </div>
              <span className="font-bold text-white text-lg">Muzora</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="text-gray-400 hover:text-white">
                {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <Link href="/notifications" className="text-gray-400 hover:text-white">
                <FiBell size={20} />
              </Link>
              <Link href="/profile" className="text-gray-400 hover:text-white">
                <FiUser size={20} />
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-yellow-400">
                  <FiShield size={20} />
                </Link>
              )}
              {user && (
                <button onClick={logout} className="text-gray-400 hover:text-red-400">
                  <FiLogOut size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="px-4 md:px-6 py-4 md:py-6 pb-6">
            {children}
          </div>
        </main>

        {/* RIGHT PANEL — Now playing */}
        {currentSong && (
          <aside className="hidden lg:flex w-72 flex-shrink-0 flex-col gap-2">
            <NowPlayingPanel song={currentSong} />
          </aside>
        )}
      </div>

      {/* PLAYER — fixed at bottom */}
      <div className="flex-shrink-0">
        <Player />
      </div>
    </div>
  );
}

function NowPlayingPanel({ song }) {
  return (
    <div className="bg-[#121212] rounded-xl flex flex-col overflow-hidden h-full">
      <div className="p-4 border-b border-white/10">
        <p className="text-white font-bold text-sm">Now playing</p>
      </div>

      {/* Large album art */}
      <div className="p-4">
        <img
          src={song.coverUrl || '/placeholder.png'}
          alt={song.title}
          className="w-full aspect-square object-cover rounded-xl shadow-2xl"
        />
      </div>

      {/* Song info */}
      <div className="px-4 pb-4">
        <p className="text-white font-bold text-lg truncate">{song.title}</p>
        <p className="text-gray-400 text-sm truncate mt-0.5">{song.artist?.name}</p>
        {song.genre && (
          <span className="inline-block mt-2 bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full">
            {song.genre}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 mx-4" />

      {/* Related / Up next placeholder */}
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-white font-bold text-sm mb-3">Up next</p>
        <p className="text-gray-600 text-xs">Play a queue to see upcoming songs</p>
      </div>
    </div>
  );
}