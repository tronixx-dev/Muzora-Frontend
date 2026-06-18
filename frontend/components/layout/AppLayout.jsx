import Link from 'next/link';
import { useRouter } from 'next/router';
import Player from '../player/Player';
import { useAuthStore } from '../../context/store';
import { useTheme } from '../../context/ThemeContext';
import {
  FiHome, FiSearch, FiHeart, FiClock,
  FiList, FiLogOut, FiShield, FiMusic,
  FiPlusSquare, FiBell, FiUser, FiSun, FiMoon,
} from 'react-icons/fi';
import {
  FiHome, FiSearch, FiHeart, FiClock,
  FiList, FiLogOut, FiShield, FiMusic,
  FiPlusSquare, FiBell, FiUser, FiSun, FiMoon,
  FiTrendingUp, FiStar, FiZap,
} from 'react-icons/fi';

const navItems = [
  { href: '/',              label: 'Home',           icon: FiHome      },
  { href: '/search',        label: 'Search',          icon: FiSearch    },
  { href: '/trending',      label: 'Trending',        icon: FiTrendingUp},
  { href: '/new-releases',  label: 'New releases',    icon: FiStar      },
  { href: '/recommended',   label: 'Recommended',     icon: FiZap       },
  { href: '/notifications', label: 'Notifications',   icon: FiBell      },
  { href: '/profile',       label: 'Profile',         icon: FiUser      },
];

const libraryItems = [
  { href: '/playlists', label: 'My playlists',    icon: FiList   },
  { href: '/liked',     label: 'Liked songs',     icon: FiHeart  },
  { href: '/history',   label: 'Recently played', icon: FiClock  },
];

export default function AppLayout({ children }) {
  const router          = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col flex-shrink-0 gap-2 p-2">

        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <Link href="/" className="flex items-center gap-3 mb-6 px-2">
            <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FiMusic className="text-black" size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Muzora
            </span>
          </Link>

          <nav className="flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  router.pathname === href
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all w-full mt-1"
          >
            {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>

        <div
          className="rounded-lg p-4 flex-1 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
              <FiList size={18} /> Your Library
            </span>
            <Link href="/playlists" className="text-gray-400 hover:text-white transition-colors">
              <FiPlusSquare size={18} />
            </Link>
          </div>

          <nav className="flex flex-col gap-1">
            {libraryItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  router.pathname === href
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                  router.pathname === href ? 'bg-green-500' : 'bg-white/10'
                }`}>
                  <Icon size={16} className={router.pathname === href ? 'text-black' : 'text-gray-400'} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-gray-500 text-xs">Playlist</p>
                </div>
              </Link>
            ))}
          </nav>

          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mt-2 transition-all ${
                router.pathname.startsWith('/admin')
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                <FiShield size={16} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Admin panel</p>
                <p className="text-gray-500 text-xs">Manage music</p>
              </div>
            </Link>
          )}
        </div>

        {user && (
          <Link
            href="/profile"
            className="rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-sm flex-shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name?.[0]?.toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); logout(); }}
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              <FiLogOut size={16} />
            </button>
          </Link>
        )}
      </aside>

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto md:rounded-lg md:m-2 md:ml-0 pb-36 md:pb-28 dynamic-bg"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 pt-8 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <FiMusic className="text-black" size={16} />
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Muzora</span>
          </div>
          <div className="flex items-center gap-4">
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

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-2 md:py-8">
          {children}
        </div>
      </main>

      <Player />
    </div>
  );
}