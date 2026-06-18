import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '../../context/store';
import { FiSend, FiHeart, FiTrash2, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Comments({ songId }) {
  const { user }  = useAuthStore();
  const [comments, setComments] = useState([]);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [posting,  setPosting]  = useState(false);

  useEffect(() => {
    if (!songId) return;
    setLoading(true);
    api.get(`/comments/${songId}`)
      .then((r) => setComments(r.data.comments))
      .finally(() => setLoading(false));
  }, [songId]);

  const postComment = async () => {
    if (!text.trim()) return;
    if (!user) return toast.error('Login to comment');
    setPosting(true);
    try {
      const { data } = await api.post(`/comments/${songId}`, { text });
      setComments((prev) => [data.comment, ...prev]);
      setText('');
      toast.success('Comment posted!');
    } catch {
      toast.error('Could not post comment');
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Could not delete comment');
    }
  };

  const likeComment = async (commentId) => {
    try {
      const { data } = await api.patch(`/comments/${commentId}/like`);
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, likes: Array(data.likes).fill(null) } : c
        )
      );
    } catch { }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-5">
        <FiMessageCircle size={20} className="text-white" />
        <h3 className="text-white font-bold text-lg">
          Comments <span className="text-gray-500 font-normal text-base">({comments.length})</span>
        </h3>
      </div>

      {/* Input */}
      {user && (
        <div className="flex gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && postComment()}
              placeholder="Add a comment..."
              maxLength={300}
              className="flex-1 bg-dark-300 border border-white/10 rounded-full px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
            />
            <button
              onClick={postComment}
              disabled={posting || !text.trim()}
              className="w-10 h-10 bg-green-500 hover:bg-green-400 text-black rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-all"
            >
              {posting
                ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                : <FiSend size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <FiMessageCircle size={32} className="mx-auto mb-3 text-gray-700" />
          <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 group">
              <div className="w-9 h-9 rounded-full bg-dark-100 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                {comment.user?.avatar ? (
                  <img src={comment.user.avatar} className="w-full h-full object-cover" />
                ) : (
                  comment.user?.name?.[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white text-sm font-semibold">{comment.user?.name}</p>
                  <p className="text-gray-600 text-xs">{timeAgo(comment.createdAt)}</p>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{comment.text}</p>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => likeComment(comment._id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-green-400 transition-colors text-xs"
                  >
                    <FiHeart size={13} />
                    {comment.likes?.length > 0 && <span>{comment.likes.length}</span>}
                  </button>
                  {user?._id === comment.user?._id && (
                    <button
                      onClick={() => deleteComment(comment._id)}
                      className="flex items-center gap-1 text-gray-600 hover:text-red-400 transition-colors text-xs opacity-0 group-hover:opacity-100"
                    >
                      <FiTrash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}