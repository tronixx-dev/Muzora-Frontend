import AppLayout from '../../components/layout/AppLayout';
import Link from 'next/link';
import { FiUpload, FiMusic } from 'react-icons/fi';

export default function AdminPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
        <p className="text-gray-400 mt-1">Manage your music library</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/upload" className="flex items-center gap-4 bg-dark-200 hover:bg-dark-100 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all group">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <FiUpload size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold">Upload song</p>
            <p className="text-gray-500 text-sm mt-0.5">Add a new track</p>
          </div>
        </Link>
        <Link href="/admin/upload" className="flex items-center gap-4 bg-dark-200 hover:bg-dark-100 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all group">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <FiMusic size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold">Upload album</p>
            <p className="text-gray-500 text-sm mt-0.5">Create a new album</p>
          </div>
        </Link>
      </div>
    </AppLayout>
  );
}
