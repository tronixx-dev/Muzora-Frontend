import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../context/store';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiVolume, FiHeart, FiShuffle,
  FiRepeat, FiChevronDown, FiMaximize2, FiMic,
} from 'react-icons/fi';
import { MdOutlineQueueMusic, MdRepeatOne } from 'react-icons/md';

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
      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
        <div
          className="h-full bg-white group-hover:bg-green-500 rounded-full transition-colors relative"
          style={{ width: `${percent}%` }}
        />
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
  return (
    <div className="relative w-full h-4 flex items-center group cursor-pointer">
      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
        <div
          className="h-full bg-white group-hover:bg-green-500 rounded-full transition-colors"
          style={{ width: `${value * 100}%` }}
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

function LyricsPanel({ song, progress }) {
  if (!song?.lyrics) return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <FiMic size={40} className="text-gray-600 mb-4" />
      <p className="text-gray-500 text-sm">No lyrics available</p>
      <p className="text-gray-600 text-xs mt-1">for {song?.title}</p>
    </div>
  );

  return (
    <div className="px-6 py-4 h-full overflow-y-auto">
      <h3 className="text-white font-bold text-lg mb-1">{song.title}</h3>
      <p className="text-gray-400 text-sm mb-6">{song.artist?.name}</p>
      <div className="text-gray-300 text-sm leading-8 whitespace-pre-line">
        {song.lyrics}
      </div>
    </div>
  );
}

export default function Player() {
  const audioRef    = useRef(null);
  const fadeRef     = useRef(null);
  const [liked,     setLiked]     = useState(false);
  const [expanded,  setExpanded]  = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const {
    currentSong, isPlaying, volume, progress, duration,
    shuffle, repeat, showLyrics,
    togglePlay, playNext, playPrev,
    toggleShuffle, toggleRepeat, toggleLyrics,
    setProgress, setDuration, setVolume,
    queue, queueIndex,
  } = usePlayerStore();

  // Sync play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying]);

  // Load new song with crossfade
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;
    audioRef.current.src = currentSong.audioUrl;
    audioRef.current.load();
    audioRef.current.play().catch(() => {});
  }, [currentSong]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handleSeek = (e) => {
    const val = Number(e.target.value);
    setProgress(val);
    if (audioRef.current) audioRef.current.currentTime = val;
  };

  // Repeat icon
  const RepeatIcon = repeat === 'one' ? MdRepeatOne : FiRepeat;

  if (!currentSong) return (
    <div className="fixed bottom-0 left-0 right-0 h-16 md:h-20 bg-[#181818] border-t border-white/5 flex items-center justify-center">
      <p className="text-gray-600 text-xs">No song playing</p>
    </div>
  );

  return (
    <>
      {/* Full screen mobile player */}
      {expanded && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col"
          style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0a 100%)' }}
        >
          <div className="flex items-center justify-between px-6 pt-12 pb-4">
            <button onClick={() => setExpanded(false)} className="text-white">
              <FiChevronDown size={28} />
            </button>
            <p className="text-white text-sm font-semibold">Now Playing</p>
            <button className="text-gray-400" onClick={toggleLyrics}>
              <FiMic size={20} className={showLyrics ? 'text-green-400' : ''} />
            </button>
          </div>

          {showLyrics ? (
            <div className="flex-1 overflow-hidden">
              <LyricsPanel song={currentSong} progress={progress} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center px-8">
              <img
                src={currentSong.coverUrl || '/placeholder.png'}
                alt={currentSong.title}
                className="w-full max-w-xs aspect-square object-cover rounded-2xl shadow-2xl"
              />
            </div>
          )}

          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-5">
              <div className="min-w-0 flex-1">
                <p className="text-white text-xl font-bold truncate">{currentSong.title}</p>
                <p className="text-gray-400 text-sm mt-0.5">{currentSong.artist?.name}</p>
              </div>
              <button
                onClick={() => setLiked(!liked)}
                className={`ml-4 flex-shrink-0 ${liked ? 'text-green-400' : 'text-gray-500'}`}
              >
                <FiHeart size={24} fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="mb-4">
              <ProgressBar value={progress} max={duration} onChange={handleSeek} />
              <div className="flex justify-between mt-1">
                <span className="text-gray-500 text-xs tabular-nums">{fmt(progress)}</span>
                <span className="text-gray-500 text-xs tabular-nums">{fmt(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <button
                onClick={toggleShuffle}
                className={shuffle ? 'text-green-400' : 'text-gray-500'}
              >
                <FiShuffle size={22} />
              </button>
              <button onClick={playPrev} className="text-white">
                <FiSkipBack size={30} fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl"
              >
                {isPlaying
                  ? <FiPause size={26} className="text-black" fill="currentColor" />
                  : <FiPlay size={26} className="text-black ml-1" fill="currentColor" />}
              </button>
              <button onClick={playNext} className="text-white">
                <FiSkipForward size={30} fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={repeat !== 'none' ? 'text-green-400' : 'text-gray-500'}
              >
                <RepeatIcon size={22} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <FiVolume size={16} className="text-gray-500 flex-shrink-0" />
              <VolumeBar value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
              <FiVolume2 size={16} className="text-gray-500 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Queue sidebar */}
      {showQueue && (
        <div className="hidden md:flex fixed right-0 bottom-20 w-72 bg-[#121212] border border-white/10 rounded-tl-xl flex-col z-40 max-h-96 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="text-white font-bold text-sm">Queue</p>
            <button onClick={() => setShowQueue(false)} className="text-gray-500 hover:text-white text-xs">
              Close
            </button>
          </div>
          <div className="overflow-y-auto flex-1 py-2">
            <p className="text-gray-500 text-xs px-4 mb-2 uppercase tracking-wider">Now playing</p>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5">
              <img src={currentSong.coverUrl || '/placeholder.png'} className="w-9 h-9 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-green-400 text-xs font-semibold truncate">{currentSong.title}</p>
                <p className="text-gray-500 text-xs truncate">{currentSong.artist?.name}</p>
              </div>
            </div>
            {queue.length > 1 && (
              <>
                <p className="text-gray-500 text-xs px-4 mb-2 mt-3 uppercase tracking-wider">Next up</p>
                {queue.slice(queueIndex + 1, queueIndex + 6).map((song) => (
                  <div key={song._id} className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer">
                    <img src={song.coverUrl || '/placeholder.png'} className="w-9 h-9 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs font-medium truncate">{song.title}</p>
                      <p className="text-gray-500 text-xs truncate">{song.artist?.name}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Lyrics sidebar desktop */}
      {showLyrics && (
        <div className="hidden md:flex fixed right-0 bottom-20 w-72 bg-[#121212] border border-white/10 rounded-tl-xl flex-col z-40 max-h-96 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="text-white font-bold text-sm">Lyrics</p>
            <button onClick={toggleLyrics} className="text-gray-500 hover:text-white text-xs">
              Close
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            <LyricsPanel song={currentSong} progress={progress} />
          </div>
        </div>
      )}

      {/* Bottom player */}
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
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setLiked(!liked)} className={liked ? 'text-green-400' : 'text-gray-500'}>
                <FiHeart size={20} fill={liked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center"
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
          <div className="px-3 pb-1">
            <div className="w-full h-0.5 bg-white/10 rounded-full">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Desktop player */}
        <div className="hidden md:grid grid-cols-3 items-center px-4 py-3 gap-4">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
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
              className={`flex-shrink-0 transition-all ${liked ? 'text-green-400' : 'text-gray-500 hover:text-white'}`}
            >
              <FiHeart size={17} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Center */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-5">
              <button
                onClick={toggleShuffle}
                className={`transition-colors relative ${shuffle ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                title="Shuffle"
              >
                <FiShuffle size={17} />
                {shuffle && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />}
              </button>
              <button onClick={playPrev} className="text-gray-300 hover:text-white transition-colors hover:scale-105">
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
              <button onClick={playNext} className="text-gray-300 hover:text-white transition-colors hover:scale-105">
                <FiSkipForward size={22} fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`transition-colors relative ${repeat !== 'none' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                title={repeat === 'none' ? 'No repeat' : repeat === 'all' ? 'Repeat all' : 'Repeat one'}
              >
                <RepeatIcon size={17} />
                {repeat !== 'none' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />}
              </button>
            </div>
            <div className="flex items-center gap-3 w-full max-w-lg">
              <span className="text-gray-500 text-xs w-10 text-right tabular-nums">{fmt(progress)}</span>
              <ProgressBar value={progress} max={duration} onChange={handleSeek} />
              <span className="text-gray-500 text-xs w-10 tabular-nums">{fmt(duration)}</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={toggleLyrics}
              className={`transition-colors ${showLyrics ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
              title="Lyrics"
            >
              <FiMic size={17} />
            </button>
            <button
              onClick={() => { setShowQueue(!showQueue); }}
              className={`transition-colors ${showQueue ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
              title="Queue"
            >
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
    </>
  );
}