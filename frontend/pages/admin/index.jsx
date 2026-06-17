import AppLayout from '../../components/layout/AppLayout';
import Link from 'next/link';
import { FiUpload, FiUsers, FiDisc, FiMusic } from 'react-icons/fi';

const adminLinks = [
  { href: '/admin/upload',      label: 'Upload song',  desc: 'Add a new track',          icon: FiUpload },
  { href: '/admin/artists/new', label: 'Add artist',   desc: 'Create an artist profile', icon: FiUsers  },
  { href: '/admin/albums/new',  label: 'Create album', desc: 'Group songs into album',   icon: FiDisc   },
  { href: '/admin/songs',       label: 'Manage songs', desc: 'Edit or delete songs',     icon: FiMusic  },
];

export default function AdminPage() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Admin panel</h1>
      <p className="text-gray-500 text-sm mb-8">Manage your music library</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {adminLinks.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:border-purple-300 hover:shadow-sm transition-all group"
          >
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
              <Icon size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}