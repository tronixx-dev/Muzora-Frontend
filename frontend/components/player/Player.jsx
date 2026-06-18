import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../context/store';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiVolumeX, FiHeart, FiShuffle,
  FiRepeat, FiChevronDown, FiChevronUp, FiMic,
} from 'react-icons/fi';
import { MdOutlineQueueMusic, MdRepeatOne } from 'react-icons/md';

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
}

export default function Player() {
  const audioRef    = useRef(null);
  const [liked,     setLiked]     = useState(false);
  const [expanded,  setExpanded]  = useState(false);
  const [bgColor,   setBgColor]   = useState('29, 185, 84');
  const [showQueue, setShowQueue] = useState(false);

  const {
    currentSong, isPlaying, volume, progress, duration,
    shuffle, repeat, showLyrics,
    togglePlay, playNext, playPrev,
    toggleShuffle, toggleRepeat, toggleLyrics,
    setProgress, setDuration, setVolume,
    queue, queueIndex,
  } = usePlayerStore();

  useEffect(() => {
    if (!currentSong?.coverUrl) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = currentSong.coverUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1; canvas.height = 1;
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

  const pct = duration ? (progress / duration) * 100 : 0;
  const RepeatIcon = repeat === 'one' ? MdRepeatOne : FiRepeat;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={playNext}
      />

      {/* MOBILE FULLSCREEN PLAYER */}
      {expanded && currentSong && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col"
          style={{
            background: `linear-gradient(160deg, rgba(${bgColor},0.9) 0%, #050505 60%)`,
            backdropFilter: 'blur(60px)',
          }}
        >
          <div className="flex items-center justify-between px-6 pt-14 pb-4">
            <button onClick={() => setExpanded(false)}>
              <FiChevronDown size={28} className="text-white/70" />
            </button>
            <p className="text-white/60 text-xs uppercase tracking-widest font-medium">Now Playing</p>
            <button onClick={toggleLyrics}>
              <FiMic size={20} className={showLyrics ? 'text-green-400' : 'text-white/40'} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-10">
            <div
              className="w-full max-w-[280px] aspect-square rounded-3xl overflow-hidden"
              style={{
                boxShadow: `0 40px 100px rgba(${bgColor},0.7)`,
                transform: isPlaying ? 'scale(1.0)' : 'scale(0.9)',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <img src={currentSong.coverUrl} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="px-8 pb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-white text-2xl font-bold">{currentSong.title}</p>
                <p className="text-white/50 mt-1">{currentSong.artist?.name}</p>
              </div>
              <button onClick={() => setLiked(!liked)}>
                <FiHeart size={26} className={liked ? 'text-green-400' : 'text-white/30'} fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Progress */}
            <div className="mb-1 relative h-1.5 rounded-full cursor-pointer group" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, rgba(${bgColor},1), #1db954)` }} />
              <input type="range" min={0} max={duration || 100} value={progress} step={1} onChange={handleSeek} className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
            </div>
            <div className="flex justify-between text-white/30 text-xs mt-2 mb-6">
              <span>{fmt(progress)}</span><span>{fmt(duration)}</span>
            </div>

            <div className="flex items-center justify-between mb-8">
              <button onClick={toggleShuffle}>
                <FiShuffle size={22} className={shuffle ? 'text-green-400' : 'text-white/40'} />
              </button>
              <button onClick={playPrev}>
                <FiSkipBack size={34} className="text-white" fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 70, height: 70, background: 'white',
                  boxShadow: `0 0 40px rgba(${bgColor},0.9), 0 0 80px rgba(${bgColor},0.4)`,
                }}
              >
                {isPlaying ? <FiPause size={28} className="text-black" fill="currentColor" /> : <FiPlay size={28} className="text-black ml-1" fill="currentColor" />}
              </button>
              <button onClick={playNext}>
                <FiSkipForward size={34} className="text-white" fill="currentColor" />
              </button>
              <button onClick={toggleRepeat}>
                <RepeatIcon size={22} className={repeat !== 'none' ? 'text-green-400' : 'text-white/40'} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <FiVolumeX size={14} className="text-white/30" />
              <div className="flex-1 h-1 rounded-full relative" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div className="h-full rounded-full" style={{ width: `${volume * 100}%`, background: 'rgba(255,255,255,0.6)' }} />
                <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
              </div>
              <FiVolume2 size={14} className="text-white/30" />
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM BAR */}
      {!currentSong ? (
        <div className="h-20 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-white/20 text-sm">No song playing</p>
        </div>
      ) : (
        <div className="relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Dynamic background */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, rgba(${bgColor},0.25) 0%, rgba(8,8,8,0.97) 35%, rgba(8,8,8,0.97) 65%, rgba(${bgColor},0.1) 100%)`,
              backdropFilter: 'blur(40px)',
            }}
          />

          {/* Glow line on top */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent 0%, rgba(${bgColor},0.8) 30%, rgba(29,185,84,0.6) 50%, rgba(${bgColor},0.8) 70%, transparent 100%)` }}
          />

          {/* PROGRESS BAR — full width at very top */}
          <div className="relative w-full h-1 cursor-pointer group" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full transition-all"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, rgba(${bgColor},0.9), #1db954, #1ed760)`,
                boxShadow: `0 0 8px rgba(${bgColor},0.6), 0 0 20px rgba(29,185,84,0.4)`,
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              style={{ left: `calc(${pct}% - 6px)`, boxShadow: `0 0 10px rgba(${bgColor},0.8)` }}
            />
            <input type="range" min={0} max={duration || 100} value={progress} step={1} onChange={handleSeek} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
          </div>

          {/* MOBILE MINI PLAYER */}
          <div className="md:hidden relative flex items-center gap-3 px-4 py-3">
            <div className="relative flex-shrink-0" onClick={() => setExpanded(true)}>
              <img
                src={currentSong.coverUrl}
                className="w-12 h-12 rounded-xl object-cover cursor-pointer"
                style={{ boxShadow: `0 4px 20px rgba(${bgColor},0.6)` }}
              />
              {isPlaying && (
                <div className="absolute -inset-1 rounded-2xl opacity-40" style={{ background: `rgba(${bgColor},0.4)`, filter: 'blur(6px)', zIndex: -1 }} />
              )}
            </div>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
              <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
              <p className="text-white/40 text-xs truncate">{currentSong.artist?.name}</p>
            </div>
            <button onClick={() => setLiked(!liked)} className="flex-shrink-0 mr-1">
              <FiHeart size={20} className={liked ? 'text-green-400' : 'text-white/30'} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={togglePlay}
              className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: 'white', boxShadow: `0 0 20px rgba(${bgColor},0.7)` }}
            >
              {isPlaying ? <FiPause size={19} className="text-black" fill="currentColor" /> : <FiPlay size={19} className="text-black ml-0.5" fill="currentColor" />}
            </button>
            <button onClick={playNext} className="flex-shrink-0 text-white/50">
              <FiSkipForward size={22} fill="currentColor" />
            </button>
          </div>

          {/* DESKTOP PLAYER */}
          <div className="hidden md:grid grid-cols-3 items-center px-6 py-3 gap-4 relative">

            {/* LEFT — song info */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src={currentSong.coverUrl}
                  className="w-14 h-14 rounded-xl object-cover"
                  style={{ boxShadow: `0 6px 24px rgba(${bgColor},0.6)` }}
                />
                {isPlaying && (
                  <div
                    className="absolute -inset-2 rounded-2xl -z-10"
                    style={{
                      background: `rgba(${bgColor},0.3)`,
                      filter: 'blur(10px)',
                      animation: 'playerGlow 2s ease-in-out infinite alternate',
                    }}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
                <p className="text-white/40 text-xs truncate mt-0.5">{currentSong.artist?.name}</p>
              </div>
              <button onClick={() => setLiked(!liked)} className="flex-shrink-0">
                <FiHeart size={16} className={`transition-all ${liked ? 'text-green-400 scale-110' : 'text-white/30 hover:text-white'}`} fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* CENTER — controls */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-5">
                <button onClick={toggleShuffle} className="relative">
                  <FiShuffle size={16} className={shuffle ? 'text-green-400' : 'text-white/40 hover:text-white'} />
                  {shuffle && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />}
                </button>

                <button onClick={playPrev} className="text-white/70 hover:text-white hover:scale-110 transition-all">
                  <FiSkipBack size={20} fill="currentColor" />
                </button>

                <button
                  onClick={togglePlay}
                  className="rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  style={{
                    width: 38, height: 38,
                    background: 'white',
                    boxShadow: `0 0 20px rgba(${bgColor},0.8), 0 0 50px rgba(${bgColor},0.3), 0 0 80px rgba(29,185,84,0.2)`,
                  }}
                >
                  {isPlaying
                    ? <FiPause size={16} className="text-black" fill="currentColor" />
                    : <FiPlay size={16} className="text-black ml-0.5" fill="currentColor" />}
                </button>

                <button onClick={playNext} className="text-white/70 hover:text-white hover:scale-110 transition-all">
                  <FiSkipForward size={20} fill="currentColor" />
                </button>

                <button onClick={toggleRepeat} className="relative">
                  <RepeatIcon size={16} className={repeat !== 'none' ? 'text-green-400' : 'text-white/40 hover:text-white'} />
                  {repeat !== 'none' && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />}
                </button>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 text-white/30 text-xs w-full max-w-xs">
                <span className="tabular-nums w-8 text-right">{fmt(progress)}</span>
                <span className="flex-1 text-center tabular-nums text-white/20">
                  {fmt(duration)}
                </span>
              </div>
            </div>

            {/* RIGHT — volume */}
            <div className="flex items-center justify-end gap-3">
              <button onClick={toggleLyrics}>
                <FiMic size={16} className={showLyrics ? 'text-green-400' : 'text-white/30 hover:text-white'} />
              </button>
              <button onClick={() => setShowQueue(!showQueue)}>
                <MdOutlineQueueMusic size={18} className={showQueue ? 'text-green-400' : 'text-white/30 hover:text-white'} />
              </button>
              <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
                {volume === 0
                  ? <FiVolumeX size={16} className="text-white/30 hover:text-white" />
                  : <FiVolume2 size={16} className="text-white/30 hover:text-white" />}
              </button>
              <div className="w-24 h-1 rounded-full relative group cursor-pointer" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div className="h-full rounded-full group-hover:bg-green-400 transition-colors" style={{ width: `${volume * 100}%`, background: 'rgba(255,255,255,0.7)' }} />
                <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes playerGlow {
              from { opacity: 0.3; transform: scale(0.95); }
              to   { opacity: 0.7; transform: scale(1.05); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}