import { useState } from 'react';
import { FiShare2, FiLink, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ShareButton({ song }) {
  const [open,   setOpen]   = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/songs/${song._id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: song.title,
        text:  `Listen to ${song.title} by ${song.artist?.name} on Muzora`,
        url:   shareUrl,
      });
    } else {
      copyLink();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <FiShare2 size={16} />
        <span className="hidden md:block">Share</span>
      </button>

      {open && (
        <div className="absolute bottom-8 right-0 bg-[#282828] rounded-xl shadow-2xl border border-white/10 p-2 w-52 z-50">
          <div className="flex items-center justify-between px-3 py-2 mb-1">
            <p className="text-white text-sm font-semibold">Share</p>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white">
              <FiX size={16} />
            </button>
          </div>

          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-left"
          >
            {copied ? <FiCheck size={16} className="text-green-400" /> : <FiLink size={16} className="text-gray-400" />}
            <span className="text-white text-sm">{copied ? 'Copied!' : 'Copy link'}</span>
          </button>

          <button
            onClick={shareNative}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-left"
          >
            <FiShare2 size={16} className="text-gray-400" />
            <span className="text-white text-sm">Share via...</span>
          </button>

          <div className="border-t border-white/10 mt-2 pt-2 px-3">
            <p className="text-gray-600 text-xs truncate">{song.title} • {song.artist?.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}