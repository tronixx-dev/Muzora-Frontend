import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../context/store';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiVolume, FiHeart, FiShuffle,
  FiRepeat, FiList,
} from 'react-icons/fi';

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Player() {
  const audioRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const {
    currentSong, isPlaying, volume, progress, duration,
    togglePlay, playNext, playPrev,
    setProgress, setDuration, setVolume,
  } = usePlayerStore();

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  if (!currentSong) return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-dark-300 border-t border-dark-100 flex items-center justify-center">
      <p className="text-gray-600 text-sm">No song playing</p>
    </div>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-300 border-t border-white/5 px-4 py-3 z-50">
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={playNext}
      />

      <div className="max-w-screen-xl mx-auto grid grid-cols-3 items-center gap-4">

        {/* Left — Song info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={currentSong.coverUrl || '/placeholder.png'}
              alt={currentSong.title}
              className="w-14 h-14 rounded-md object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate hover:underline cursor-pointer">
              {currentSong.title}
            </p>
            <p className="text-gray-400 text-xs truncate hover:text-white cursor-pointer">
              {currentSong.artist?.name}
            </p>
          </div>
          <button
            onClick={() => setLiked(!liked)}
            className={`flex-shrink-0 transition-colors ${liked ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}
          >
            <FiHeart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Center — Controls */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-5">
            <button className="text-gray-500 hover:text-white transition-colors">
              <FiShuffle size={16} />
            </button>
            <button
              onClick={playPrev}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FiSkipBack size={20} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying
                ? <FiPause size={16} className="text-black" fill="currentColor" />
                : <FiPlay size={16} className="text-black ml-0.5" fill="currentColor" />}
            </button>
            <button
              onClick={playNext}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FiSkipForward size={20} fill="currentColor" />
            </button>
            <button className="text-gray-500 hover:text-white transition-colors">
              <FiRepeat size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-gray-500 text-xs w-10 text-right tabular-nums">{fmt(progress)}</span>
            <div className="flex-1 relative group">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                step={1}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setProgress(val);
                  if (audioRef.current) audioRef.current.currentTime = val;
                }}
                className="w-full h-1 cursor-pointer rounded-full"
                style={{ '--progress': `${progressPercent}%` }}
              />
            </div>
            <span className="text-gray-500 text-xs w-10 tabular-nums">{fmt(duration)}</span>
          </div>
        </div>

        {/* Right — Volume */}
        <div className="flex items-center justify-end gap-3">
          <button className="text-gray-500 hover:text-white transition-colors">
            <FiList size={16} />
          </button>
          <button className="text-gray-500 hover:text-white transition-colors">
            {volume === 0 ? <FiVolume size={16} /> : <FiVolume2 size={16} />}
          </button>
          <div className="w-24">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ '--progress': `${volume * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}