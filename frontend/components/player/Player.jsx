import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../context/store';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiVolume, FiHeart, FiShuffle,
  FiRepeat, FiList, FiChevronDown, FiMaximize2,
} from 'react-icons/fi';
import { MdOutlineQueueMusic } from 'react-icons/md';

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function ProgressBar({ value, max, onChange }) {
  const percent = max ? (value / max) * 100 : 0;
  return (
    <div className="relative w-full h-4 flex items-center group cursor-pointer">
      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white group-hover:bg-green-500 rounded-full transition-colors relative"
          style={{ width: `${percent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={max || 100}
        value={value}
        step={1}
        onChange={onChange}
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
      />
    </div>
  );
}

function VolumeBar({ value, onChange }) {
  const percent = value * 100;
  return (
    <div className="relative w-full h-4 flex items-center group cursor-pointer">
      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white group-hover:bg-green-500 rounded-full transition-colors"
          style={{ width: `${percent}%` }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={onChange}
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
      />
    </div>
  );
}

export default function Player() {
  const audioRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [expanded, setExpanded] = useState(false);
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

  const handleSeek = (e) => {
    const val = Number(e.target.value);
    setProgress(val);
    if (audioRef.current) audioRef.current.currentTime = val;
  };

  if (!currentSong) return (
    <div className="fixed bottom-0 left-0 right-0 h-16 md:h-20 bg-[#181818] border-t border-white/5 flex items-center justify-center">
      <p className="text-gray-600 text-xs">No song playing</p>
    </div>
  );

  return (
    <>
      {/* Full screen mobile player */}
      {expanded && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col"
          style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0a 100%)' }}>
          
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-12 pb-4">
            <button onClick={() => setExpanded(false)} className="text-white">
              <FiChevronDown size={28} />
            </button>
            <p className="text-white text-sm font-medium">Now Playing</p>
            <button className="text-white opacity-0">
              <FiMaximize2 size={20} />
            </button>
          </div>

          {/* Album art */}
          <div className="flex-1 flex items-center justify-center px-8">
            <img
              src={currentSong.coverUrl || '/placeholder.png'}
              alt={currentSong.title}
              className="w-full max-w-xs aspect-square object-cover rounded-2xl shadow-2xl"
            />
          </div>

          {/* Song info + like */}
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="min-w-0 flex-1">
                <p className="text-white text-2xl font-bold truncate">{currentSong.title}</p>
                <p className="text-gray-400 text-base mt-1">{currentSong.artist?.name}</p>
              </div>
              <button
                onClick={() => setLiked(!liked)}
                className={`ml-4 flex-shrink-0 ${liked ? 'text-green-400' : 'text-gray-400'}`}
              >
                <FiHeart size={26} fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Progress */}
            <div className="mb-2">
              <ProgressBar value={progress} max={duration} onChange={handleSeek} />
              <div className="flex justify-between mt-1">
                <span className="text-gray-500 text-xs tabular-nums">{fmt(progress)}</span>
                <span className="text-gray-500 text-xs tabular-nums">{fmt(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-4 mb-6">
              <button
                onClick={() => setShuffle(!shuffle)}
                className={shuffle ? 'text-green-400' : 'text-gray-400'}
              >
                <FiShuffle size={22} />
              </button>
              <button onClick={playPrev} className="text-white">
                <FiSkipBack size={30} fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
              >
                {isPlaying
                  ? <FiPause size={26} className="text-black" fill="currentColor" />
                  : <FiPlay size={26} className="text-black ml-1" fill="currentColor" />}
              </button>
              <button onClick={playNext} className="text-white">
                <FiSkipForward size={30} fill="currentColor" />
              </button>
              <button
                onClick={() => setRepeat(!repeat)}
                className={repeat ? 'text-green-400' : 'text-gray-400'}
              >
                <FiRepeat size={22} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <FiVolume size={18} className="text-gray-500 flex-shrink-0" />
              <VolumeBar value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
              <FiVolume2 size={18} className="text-gray-500 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Bottom player bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-white/10 z-40">
        <audio
          ref={audioRef}
          onTimeUpdate={(e) => setProgress(e.target.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onEnded={playNext}
        />

        {/* Mobile mini player */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={currentSong.coverUrl || '/placeholder.png'}
              alt={currentSong.title}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 cursor-pointer shadow-md"
              onClick={() => setExpanded(true)}
            />
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
              <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
              <p className="text-gray-400 text-xs truncate">{currentSong.artist?.name}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setLiked(!liked)}
                className={liked ? 'text-green-400' : 'text-gray-500'}
              >
                <FiHeart size={20} fill={liked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md"
              >
                {isPlaying
                  ? <FiPause size={18} className="text-black" fill="currentColor" />
                  : <FiPlay size={18} className="text-black ml-0.5" fill="currentColor" />}
              </button>
              <button onClick={playNext} className="text-gray-400">
                <FiSkipForward size={22} fill="currentColor" />
              </button>
            </div>
          </div>
          {/* Mobile progress bar */}
          <div className="px-3 pb-1">
            <div className="w-full h-0.5 bg-white/10 rounded-full">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Desktop full player — Spotify style */}
        <div className="hidden md:grid grid-cols-3 items-center px-4 py-3 gap-4">

          {/* Left — Song info */}
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={currentSong.coverUrl || '/placeholder.png'}
              alt={currentSong.title}
              className="w-14 h-14 rounded-md object-cover flex-shrink-0 shadow-lg"
            />
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate hover:underline cursor-pointer">
                {currentSong.title}
              </p>
              <p className="text-gray-400 text-xs truncate hover:text-white cursor-pointer transition-colors">
                {currentSong.artist?.name}
              </p>
            </div>
            <button
              onClick={() => setLiked(!liked)}
              className={`flex-shrink-0 transition-all ${liked ? 'text-green-400 scale-110' : 'text-gray-500 hover:text-white'}`}
            >
              <FiHeart size={17} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Center — Controls */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-5">
              <button
                onClick={() => setShuffle(!shuffle)}
                className={`transition-colors ${shuffle ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
              >
                <FiShuffle size={17} />
              </button>
              <button
                onClick={playPrev}
                className="text-gray-300 hover:text-white transition-colors hover:scale-105"
              >
                <FiSkipBack size={22} fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md"
              >
                {isPlaying
                  ? <FiPause size={17} className="text-black" fill="currentColor" />
                  : <FiPlay size={17} className="text-black ml-0.5" fill="currentColor" />}
              </button>
              <button
                onClick={playNext}
                className="text-gray-300 hover:text-white transition-colors hover:scale-105"
              >
                <FiSkipForward size={22} fill="currentColor" />
              </button>
              <button
                onClick={() => setRepeat(!repeat)}
                className={`transition-colors ${repeat ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
              >
                <FiRepeat size={17} />
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 w-full max-w-lg">
              <span className="text-gray-500 text-xs w-10 text-right tabular-nums">{fmt(progress)}</span>
              <ProgressBar value={progress} max={duration} onChange={handleSeek} />
              <span className="text-gray-500 text-xs w-10 tabular-nums">{fmt(duration)}</span>
            </div>
          </div>

          {/* Right — Volume + extras */}
          <div className="flex items-center justify-end gap-3">
            <button className="text-gray-400 hover:text-white transition-colors">
              <MdOutlineQueueMusic size={18} />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              {volume === 0 ? <FiVolume size={17} /> : <FiVolume2 size={17} />}
            </button>
            <div className="w-24">
              <VolumeBar value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <FiMaximize2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav spacer */}
      <div className="md:hidden h-16" />
    </>
  );
}