import Link from 'next/link';
import { useRouter } from 'next/router';
import Player from '../player/Player';
import { useAuthStore } from '../../context/store';
import {
  FiHome, FiSearch, FiHeart, FiClock,
  FiList, FiLogOut, FiShield, FiMusic,
  FiPlusSquare,
} from 'react-icons/fi';

const navItems = [
  { href: '/',          label: 'Home',           icon: FiHome   },
  { href: '/search',    label: 'Search',          icon: FiSearch },
];

const libraryItems = [
  { href: '/playlists', label: 'My playlists',    icon: FiList   },
  { href: '/liked',     label: 'Liked songs',     icon: FiHeart  },
  { href: '/history',   label: 'Recently played', icon: FiClock  },
];

export default function AppLayout({ children }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-dark-400 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 flex flex-col flex-shrink-0 gap-2 p-2">

        {/* Top nav */}
        <div className="bg-dark-300 rounded-lg p-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-6 px-2">
            <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FiMusic className="text-black" size={18} />
            </div>
            <span className="font-bold text-white text-xl tracking-tight">Muzora</span>
          </Link>

          {/* Main nav */}
          <nav className="flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  router.pathname === href
                    ? 'bg-dark-100 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Library */}
        <div className="bg-dark-300 rounded-lg p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
              <FiList size={18} /> Your Library
            </span>
            <button className="text-gray-400 hover:text-white transition-colors">
              <FiPlusSquare size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {libraryItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  router.pathname === href
                    ? 'bg-dark-100 text-white font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                  router.pathname === href ? 'bg-green-500' : 'bg-dark-100'
                }`}>
                  <Icon size={16} className={router.pathname === href ? 'text-black' : 'text-gray-400'} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-gray-500 text-xs">Playlist</p>
                </div>
              </Link>
            ))}
          </nav>

          {/* Admin */}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mt-2 transition-all ${
                router.pathname.startsWith('/admin')
                  ? 'bg-dark-100 text-white font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="w-10 h-10 rounded bg-dark-100 flex items-center justify-center flex-shrink-0">
                <FiShield size={16} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Admin panel</p>
                <p className="text-gray-500 text-xs">Manage music</p>
              </div>
            </Link>
          )}
        </div>

        {/* User */}
        {user && (
          <div className="bg-dark-300 rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-white transition-colors"
              title="Sign out"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-dark-200 to-dark-400 rounded-lg m-2 ml-0 pb-28">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>

      <Player />
    </div>
  );
}