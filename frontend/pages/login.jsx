import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../lib/api';
import { useAuthStore } from '../context/store';
import toast from 'react-hot-toast';
import { FiMusic, FiMail, FiLock } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const login  = useAuthStore((s) => s.login);
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <FiMusic className="text-black" size={22} />
          </div>
          <span className="text-3xl font-bold text-white">Muzora</span>
        </div>

        <div className="bg-dark-200 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Log in to Muzora</h1>
          <p className="text-gray-400 text-sm text-center mb-8">Welcome back!</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-dark-100 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-dark-100 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-bold rounded-full py-3 text-sm transition-all disabled:opacity-50 hover:scale-105 active:scale-100 mt-2"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-white font-medium hover:text-green-500 transition-colors">
                Sign up for Muzora
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}