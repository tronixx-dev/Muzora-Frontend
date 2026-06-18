import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../lib/api';
import { FiBell, FiMusic, FiCheck } from 'react-icons/fi';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    api.get('/users/notifications')
      .then((r) => setNotifications(r.data.notifications))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.patch('/users/notifications/read');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
            >
              <FiCheck size={16} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <FiBell size={48} className="mx-auto mb-4 text-gray-700" />
            <p className="text-white font-bold text-lg mb-1">No notifications yet</p>
            <p className="text-gray-500 text-sm">We'll notify you when something happens</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notif, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                  notif.read
                    ? 'bg-dark-200 border-white/5'
                    : 'bg-green-500/5 border-green-500/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notif.read ? 'bg-dark-100' : 'bg-green-500/20'
                }`}>
                  <FiMusic size={18} className={notif.read ? 'text-gray-500' : 'text-green-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notif.read ? 'text-gray-400' : 'text-white font-medium'}`}>
                    {notif.message}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}