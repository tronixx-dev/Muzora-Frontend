import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../context/store';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiVolumeX, FiHeart, FiShuffle,
  FiRepeat, FiChevronDown, FiMic, FiList,
} from 'react-icons/fi';
import { MdOutlineQueueMusic, MdRepeatOne } from 'react-icons/md';

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
}

function ProgressBar({ value, max, onChange }) {
  const pct = max ? (value / max) * 100 : 0;
  return (
    <div className="relative w-full h-5 flex items-center group cursor-pointer">
      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
        <div
          className="h-full rounded-full transition-all relative"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #1db954, #1ed760)',
          }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <input
        type="range" min={0} max={max || 100} value={value} step={1}
        onChange={onChange}
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
      />
    </div>
  );
}

function VolumeBar({ value, onChange }) {
  return (
    <div className="relative w-full h-5 flex items-center group cursor-pointer">
      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${value * 100}%`, background: 'rgba(255,255,255,0.8)' }}
        />
      </div>
      <input
        type="range" min={0} max={1} step={0.01} value={value}
        onChange={onChange}
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
      />
    </div>
  );
}

export default function Player() {
  const audioRef   = useRef(null);
  const [liked,    setLiked]    = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [bgColor,  setBgColor]  = useState('20, 20, 20');

  const {
    currentSong, isPlaying, volume, progress, duration,
    shuffle, repeat, showLyrics,
    togglePlay, playNext, playPrev,
    toggleShuffle, toggleRepeat, toggleLyrics,
    setProgress, setDuration, setVolume,
    queue, queueIndex,
  } = usePlayerStore();

  // Extract dominant color from album art
  useEffect(() => {
    if (!currentSong?.coverUrl) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = currentSong.coverUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        setBgColor(`${r}, ${g}, ${b}`);
      } catch { }
    };
  }, [currentSong]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (!currentSong || !audioRef.current) return;
    audioRef.current.src = currentSong.audioUrl;
    audioRef.current.load();
    audioRef.current.play().catch(() => {});
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handleSeek = (e) => {
    const val = Number(e.target.value);
    setProgress(val);
    if (audioRef.current) audioRef.current.currentTime = val;
  };

  const RepeatIcon = repeat === 'one' ? MdRepeatOne : FiRepeat;

  if (!currentSong) return (
    <div
      className="h-20 flex items-center justify-center border-t"
      style={{
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No song playing</p>
    </div>
  );

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={playNext}
      />

      {/* MOBILE FULL SCREEN PLAYER */}
      {expanded && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col"
          style={{
            background: `linear-gradient(180deg, rgba(${bgColor}, 0.95) 0%, rgba(0,0,0,0.98) 100%)`,
            backdropFilter: 'blur(40px)',
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-12 pb-6">
            <button onClick={() => setExpanded(false)} className="text-white/70 hover:text-white">
              <FiChevronDown size={28} />
            </button>
            <div className="text-center">
              <p className="text-white/50 text-xs uppercase tracking-widest">Now Playing</p>
            </div>
            <button className="text-white/70 hover:text-white" onClick={toggleLyrics}>
              <FiMic size={20} className={showLyrics ? 'text-green-400' : ''} />
            </button>
          </div>

          {/* Album art */}
          <div className="flex-1 flex items-center justify-center px-10">
            <div
              className="w-full max-w-xs aspect-square rounded-3xl overflow-hidden shadow-2xl"
              style={{
                boxShadow: `0 30px 80px rgba(${bgColor}, 0.6)`,
                transform: isPlaying ? 'scale(1)' : 'scale(0.92)',
                transition: 'transform 0.3s ease',
              }}
            >
              <img
                src={currentSong.coverUrl || '/placeholder.png'}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Song info + like */}
          <div className="px-8 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="min-w-0 flex-1">
                <p className="text-white text-2xl font-bold truncate">{currentSong.title}</p>
                <p className="text-white/60 text-base mt-1">{currentSong.artist?.name}</p>
              </div>
              <button
                onClick={() => setLiked(!liked)}
                className={`ml-4 flex-shrink-0 transition-all ${liked ? 'text-green-400 scale-110' : 'text-white/40 hover:text-white'}`}
              >
                <FiHeart size={24} fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Progress */}
            <div className="mb-2">
              <ProgressBar value={progress} max={duration} onChange={handleSeek} />
              <div className="flex justify-between mt-2">
                <span className="text-white/40 text-xs tabular-nums">{fmt(progress)}</span>
                <span className="text-white/40 text-xs tabular-nums">{fmt(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6 mb-8">
              <button onClick={toggleShuffle} className={shuffle ? 'text-green-400' : 'text-white/40 hover:text-white'}>
                <FiShuffle size={22} />
              </button>
              <button onClick={playPrev} className="text-white hover:scale-110 transition-transform">
                <FiSkipBack size={32} fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className="w-18 h-18 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
                style={{
                  width: '72px',
                  height: '72px',
                  background: 'white',
                  boxShadow: `0 0 30px rgba(${bgColor}, 0.8)`,
                }}
              >
                {isPlaying
                  ? <FiPause size={28} className="text-black" fill="currentColor" />
                  : <FiPlay size={28} className="text-black ml-1" fill="currentColor" />}
              </button>
              <button onClick={playNext} className="text-white hover:scale-110 transition-transform">
                <FiSkipForward size={32} fill="currentColor" />
              </button>
              <button onClick={toggleRepeat} className={repeat !== 'none' ? 'text-green-400' : 'text-white/40 hover:text-white'}>
                <RepeatIcon size={22} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 mb-8">
              <FiVolumeX size={16} className="text-white/40 flex-shrink-0" />
              <VolumeBar value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
              <FiVolume2 size={16} className="text-white/40 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP + MOBILE BOTTOM BAR */}
      <div
        className="relative border-t"
        style={{
          background: `linear-gradient(90deg, rgba(${bgColor}, 0.3) 0%, rgba(10,10,10,0.95) 40%, rgba(10,10,10,0.95) 100%)`,
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderColor: `rgba(${bgColor}, 0.2)`,
        }}
      >
        {/* Glowing top border */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, rgba(${bgColor}, 0.6), transparent)` }}
        />

        {/* Mobile mini player */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="relative flex-shrink-0 cursor-pointer"
              onClick={() => setExpanded(true)}
            >
              <img
                src={currentSong.coverUrl || '/placeholder.png'}
                alt={currentSong.title}
                className="w-12 h-12 rounded-xl object-cover shadow-lg"
                style={{ boxShadow: `0 4px 20px rgba(${bgColor}, 0.5)` }}
              />
            </div>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
              <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
              <p className="text-white/50 text-xs truncate">{currentSong.artist?.name}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setLiked(!liked)} className={liked ? 'text-green-400' : 'text-white/40'}>
                <FiHeart size={20} fill={liked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'white', boxShadow: `0 0 20px rgba(${bgColor}, 0.6)` }}
              >
                {isPlaying
                  ? <FiPause size={18} className="text-black" fill="currentColor" />
                  : <FiPlay size={18} className="text-black ml-0.5" fill="currentColor" />}
              </button>
              <button onClick={playNext} className="text-white/70">
                <FiSkipForward size={22} fill="currentColor" />
              </button>
            </div>
          </div>
          {/* Mobile progress */}
          <div className="px-3 pb-1">
            <div className="w-full h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${duration ? (progress / duration) * 100 : 0}%`,
                  background: `linear-gradient(90deg, #1db954, rgba(${bgColor}, 0.8))`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Desktop player */}
        <div className="hidden md:grid grid-cols-3 items-center px-6 py-3 gap-4">

          {/* Left — song info */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={currentSong.coverUrl || '/placeholder.png'}
                alt={currentSong.title}
                className="w-14 h-14 rounded-xl object-cover"
                style={{ boxShadow: `0 4px 20px rgba(${bgColor}, 0.6)` }}
              />
              {isPlaying && (
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `radial-gradient(circle at center, rgba(${bgColor}, 0.3), transparent)`,
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate hover:underline cursor-pointer">
                {currentSong.title}
              </p>
              <p className="text-white/50 text-xs truncate hover:text-white cursor-pointer transition-colors">
                {currentSong.artist?.name}
              </p>
            </div>
            <button
              onClick={() => setLiked(!liked)}
              className={`flex-shrink-0 transition-all ${liked ? 'text-green-400 scale-110' : 'text-white/30 hover:text-white'}`}
            >
              <FiHeart size={17} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Center — controls */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-6">
              <button
                onClick={toggleShuffle}
                className={`transition-all relative ${shuffle ? 'text-green-400' : 'text-white/40 hover:text-white'}`}
              >
                <FiShuffle size={17} />
                {shuffle && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />}
              </button>

              <button onClick={playPrev} className="text-white/70 hover:text-white hover:scale-110 transition-all">
                <FiSkipBack size={22} fill="currentColor" />
              </button>

              <button
                onClick={togglePlay}
                className="rounded-full flex items-center justify-center hover:scale-105 transition-all"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'white',
                  boxShadow: `0 0 25px rgba(${bgColor}, 0.7), 0 0 60px rgba(${bgColor}, 0.3)`,
                }}
              >
                {isPlaying
                  ? <FiPause size={17} className="text-black" fill="currentColor" />
                  : <FiPlay size={17} className="text-black ml-0.5" fill="currentColor" />}
              </button>

              <button onClick={playNext} className="text-white/70 hover:text-white hover:scale-110 transition-all">
                <FiSkipForward size={22} fill="currentColor" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`transition-all relative ${repeat !== 'none' ? 'text-green-400' : 'text-white/40 hover:text-white'}`}
              >
                <RepeatIcon size={17} />
                {repeat !== 'none' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />}
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3 w-full max-w-md">
              <span className="text-white/40 text-xs w-10 text-right tabular-nums">{fmt(progress)}</span>
              <ProgressBar value={progress} max={duration} onChange={handleSeek} />
              <span className="text-white/40 text-xs w-10 tabular-nums">{fmt(duration)}</span>
            </div>
          </div>

          {/* Right — volume + extras */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={toggleLyrics}
              className={`transition-colors ${showLyrics ? 'text-green-400' : 'text-white/40 hover:text-white'}`}
              title="Lyrics"
            >
              <FiMic size={17} />
            </button>
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`transition-colors ${showQueue ? 'text-green-400' : 'text-white/40 hover:text-white'}`}
              title="Queue"
            >
              <MdOutlineQueueMusic size={18} />
            </button>
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="text-white/40 hover:text-white transition-colors"
            >
              {volume === 0 ? <FiVolumeX size={17} /> : <FiVolume2 size={17} />}
            </button>
            <div className="w-24">
              <VolumeBar value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    </>
  );
}