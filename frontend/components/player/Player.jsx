import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../context/store';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiVolumeX, FiHeart, FiShuffle,
  FiRepeat, FiChevronDown, FiMic,
} from 'react-icons/fi';
import { MdOutlineQueueMusic, MdRepeatOne } from 'react-icons/md';

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
}

function Equalizer({ isPlaying }) {
  const bars = [0.4, 1, 0.6, 0.8, 0.5, 0.9, 0.3, 0.7, 0.5, 0.8];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '20px' }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            borderRadius: '2px',
            background: `linear-gradient(to top, #1db954, #00ffcc)`,
            height: isPlaying ? `${h * 100}%` : '20%',
            boxShadow: isPlaying ? '0 0 6px #1db954, 0 0 12px #00ffcc44' : 'none',
            animation: isPlaying ? `eq${i} ${0.4 + i * 0.1}s ease-in-out infinite alternate` : 'none',
            transformOrigin: 'bottom',
          }}
        />
      ))}
      <style>{`
        ${bars.map((h, i) => `
          @keyframes eq${i} {
            from { height: ${Math.max(15, h * 40)}%; }
            to   { height: ${h * 100}%; }
          }
        `).join('')}
      `}</style>
    </div>
  );
}

export default function Player() {
  const audioRef   = useRef(null);
  const [liked,    setLiked]    = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [neonColor, setNeonColor] = useState('29, 185, 84');

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
        setNeonColor(`${r}, ${g}, ${b}`);
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

      {/* MOBILE FULLSCREEN */}
      {expanded && currentSong && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col"
          style={{
            background: '#050505',
            borderTop: `1px solid rgba(${neonColor},0.3)`,
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: `linear-gradient(90deg, transparent, rgba(${neonColor},1), #1db954, rgba(${neonColor},1), transparent)`,
            boxShadow: `0 0 20px rgba(${neonColor},0.8), 0 0 40px rgba(29,185,84,0.4)`,
          }} />

          <div className="flex items-center justify-between px-6 pt-14 pb-4">
            <button onClick={() => setExpanded(false)}>
              <FiChevronDown size={28} style={{ color: `rgba(${neonColor},0.8)` }} />
            </button>
            <div className="flex items-center gap-2">
              <Equalizer isPlaying={isPlaying} />
            </div>
            <button onClick={toggleLyrics}>
              <FiMic size={20} style={{ color: showLyrics ? '#1db954' : 'rgba(255,255,255,0.3)' }} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-10">
            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
              <div style={{
                position: 'absolute', inset: '-3px',
                borderRadius: '20px',
                background: `linear-gradient(135deg, rgba(${neonColor},0.8), #1db954, rgba(${neonColor},0.4))`,
                padding: '2px',
                boxShadow: `0 0 30px rgba(${neonColor},0.6), 0 0 60px rgba(29,185,84,0.3)`,
              }} />
              <img
                src={currentSong.coverUrl}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  objectFit: 'cover',
                  borderRadius: '18px',
                  position: 'relative',
                  zIndex: 1,
                  transform: isPlaying ? 'scale(1)' : 'scale(0.95)',
                  transition: 'transform 0.4s ease',
                  border: `2px solid rgba(${neonColor},0.5)`,
                }}
              />
            </div>
          </div>

          <div className="px-8 pb-10 pt-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p style={{ color: 'white', fontSize: '22px', fontWeight: 700, margin: 0 }}>{currentSong.title}</p>
                <p style={{ color: `rgba(${neonColor},0.7)`, fontSize: '14px', marginTop: '4px' }}>{currentSong.artist?.name}</p>
              </div>
              <button onClick={() => setLiked(!liked)}>
                <FiHeart size={24} style={{ color: liked ? '#1db954' : 'rgba(255,255,255,0.3)' }} fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div style={{ position: 'relative', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '8px', cursor: 'pointer' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: `${pct}%`, height: '100%',
                background: `linear-gradient(90deg, rgba(${neonColor},0.8), #1db954, #00ffcc)`,
                borderRadius: '2px',
                boxShadow: `0 0 8px rgba(${neonColor},0.6), 0 0 20px rgba(29,185,84,0.4)`,
              }} />
              <div style={{
                position: 'absolute', top: '50%', left: `${pct}%`,
                transform: 'translate(-50%, -50%)',
                width: '12px', height: '12px',
                background: 'white',
                borderRadius: '50%',
                boxShadow: `0 0 10px rgba(${neonColor},0.8), 0 0 20px rgba(29,185,84,0.6)`,
              }} />
              <input type="range" min={0} max={duration || 100} value={progress} step={1} onChange={handleSeek}
                style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', height: '100%' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginBottom: '24px' }}>
              <span>{fmt(progress)}</span><span>{fmt(duration)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <button onClick={toggleShuffle} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiShuffle size={22} style={{ color: shuffle ? '#1db954' : 'rgba(255,255,255,0.4)' }} />
              </button>
              <button onClick={playPrev} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiSkipBack size={34} style={{ color: 'white' }} fill="white" />
              </button>

              <button
                onClick={togglePlay}
                style={{
                  width: '70px', height: '70px', borderRadius: '50%',
                  background: `linear-gradient(135deg, rgba(${neonColor},0.9), #1db954)`,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 30px rgba(${neonColor},0.7), 0 0 60px rgba(29,185,84,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`,
                }}
              >
                {isPlaying
                  ? <FiPause size={28} color="black" fill="black" />
                  : <FiPlay size={28} color="black" fill="black" style={{ marginLeft: '3px' }} />}
              </button>

              <button onClick={playNext} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiSkipForward size={34} style={{ color: 'white' }} fill="white" />
              </button>
              <button onClick={toggleRepeat} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <RepeatIcon size={22} style={{ color: repeat !== 'none' ? '#1db954' : 'rgba(255,255,255,0.4)' }} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiVolumeX size={16} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative' }}>
                <div style={{ width: `${volume * 100}%`, height: '100%', background: '#1db954', borderRadius: '2px', boxShadow: '0 0 8px #1db954' }} />
                <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))}
                  style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer' }} />
              </div>
              <FiVolume2 size={16} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM BAR */}
      {!currentSong ? (
        <div style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>No song playing</p>
        </div>
      ) : (
        <div style={{ position: 'relative', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: `linear-gradient(90deg, transparent 0%, rgba(${neonColor},0.8) 25%, #1db954 50%, rgba(${neonColor},0.8) 75%, transparent 100%)`,
            boxShadow: `0 0 15px rgba(${neonColor},0.5), 0 0 30px rgba(29,185,84,0.3)`,
          }} />

          <div
            style={{ position: 'relative', height: '3px', background: 'rgba(255,255,255,0.06)', cursor: 'pointer' }}
            className="group"
          >
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: `${pct}%`, height: '100%',
              background: `linear-gradient(90deg, rgba(${neonColor},0.9), #1db954, #00ffcc)`,
              boxShadow: `0 0 10px rgba(${neonColor},0.6), 0 0 25px rgba(29,185,84,0.5)`,
            }} />
            <div style={{
              position: 'absolute', top: '50%',
              left: `${pct}%`,
              transform: 'translate(-50%,-50%)',
              width: '10px', height: '10px',
              background: 'white',
              borderRadius: '50%',
              opacity: 0,
              transition: 'opacity 0.2s',
              boxShadow: `0 0 10px rgba(${neonColor},1)`,
            }}
              className="group-hover:opacity-100"
            />
            <input type="range" min={0} max={duration || 100} value={progress} step={1} onChange={handleSeek}
              style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', height: '100%' }} />
          </div>

          {/* MOBILE MINI - fixed display conflict */}
          <div className="flex md:hidden" style={{ alignItems: 'center', gap: '12px', padding: '10px 16px' }}>
            <img
              src={currentSong.coverUrl}
              onClick={() => setExpanded(true)}
              style={{
                width: '46px', height: '46px', borderRadius: '10px', objectFit: 'cover',
                cursor: 'pointer', flexShrink: 0,
                border: `1px solid rgba(${neonColor},0.5)`,
                boxShadow: `0 0 15px rgba(${neonColor},0.4)`,
              }}
            />
            <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpanded(true)}>
              <p style={{ color: 'white', fontSize: '13px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentSong.title}</p>
              <p style={{ color: `rgba(${neonColor},0.6)`, fontSize: '11px', margin: '3px 0 0' }}>{currentSong.artist?.name}</p>
            </div>
            <Equalizer isPlaying={isPlaying} />
            <button onClick={togglePlay} style={{
              width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, rgba(${neonColor},0.9), #1db954)`,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 15px rgba(${neonColor},0.6), 0 0 30px rgba(29,185,84,0.3)`,
            }}>
              {isPlaying ? <FiPause size={17} color="black" fill="black" /> : <FiPlay size={17} color="black" fill="black" style={{ marginLeft: '2px' }} />}
            </button>
            <button onClick={playNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
              <FiSkipForward size={22} fill="currentColor" />
            </button>
          </div>

          {/* DESKTOP */}
          <div className="hidden md:grid" style={{ gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '10px 24px', gap: '16px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={currentSong.coverUrl}
                  style={{
                    width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover',
                    border: `1px solid rgba(${neonColor},0.6)`,
                    boxShadow: `0 0 20px rgba(${neonColor},0.5), 0 0 40px rgba(29,185,84,0.2)`,
                  }}
                />
                {isPlaying && (
                  <div style={{
                    position: 'absolute', inset: '-4px',
                    borderRadius: '14px',
                    background: `rgba(${neonColor},0.15)`,
                    filter: 'blur(8px)',
                    zIndex: -1,
                    animation: 'neonPulse 2s ease-in-out infinite alternate',
                  }} />
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ color: 'white', fontSize: '13px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentSong.title}
                </p>
                <p style={{ color: `rgba(${neonColor},0.6)`, fontSize: '11px', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentSong.artist?.name}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <Equalizer isPlaying={isPlaying} />
                <button onClick={() => setLiked(!liked)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#1db954' : 'rgba(255,255,255,0.25)' }}>
                  <FiHeart size={16} fill={liked ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button onClick={toggleShuffle} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
                  <FiShuffle size={16} style={{ color: shuffle ? '#1db954' : 'rgba(255,255,255,0.35)' }} />
                  {shuffle && <span style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', background: '#1db954', borderRadius: '50%', boxShadow: '0 0 6px #1db954' }} />}
                </button>

                <button onClick={playPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>
                  <FiSkipBack size={20} fill="currentColor" />
                </button>

                <button
                  onClick={togglePlay}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: `linear-gradient(135deg, rgba(${neonColor},0.9), #1db954)`,
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 20px rgba(${neonColor},0.7), 0 0 40px rgba(29,185,84,0.4), inset 0 1px 0 rgba(255,255,255,0.15)`,
                  }}
                >
                  {isPlaying
                    ? <FiPause size={16} color="black" fill="black" />
                    : <FiPlay size={16} color="black" fill="black" style={{ marginLeft: '2px' }} />}
                </button>

                <button onClick={playNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>
                  <FiSkipForward size={20} fill="currentColor" />
                </button>

                <button onClick={toggleRepeat} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
                  <RepeatIcon size={16} style={{ color: repeat !== 'none' ? '#1db954' : 'rgba(255,255,255,0.35)' }} />
                  {repeat !== 'none' && <span style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', background: '#1db954', borderRadius: '50%', boxShadow: '0 0 6px #1db954' }} />}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>
                <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: '32px', textAlign: 'right' }}>{fmt(progress)}</span>
                <span style={{ color: 'rgba(255,255,255,0.12)' }}>/</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: '32px' }}>{fmt(duration)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={toggleLyrics} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiMic size={15} style={{ color: showLyrics ? '#1db954' : 'rgba(255,255,255,0.25)' }} />
              </button>
              <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                {volume === 0
                  ? <FiVolumeX size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
                  : <FiVolume2 size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />}
              </button>
              <div style={{ position: 'relative', width: '80px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', cursor: 'pointer' }}>
                <div style={{ width: `${volume * 100}%`, height: '100%', background: `linear-gradient(90deg, rgba(${neonColor},0.8), #1db954)`, borderRadius: '2px', boxShadow: '0 0 8px #1db954' }} />
                <input type="range" min={0} max={1} step={0.01} value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer' }} />
              </div>
            </div>
          </div>

          <style>{`
            @keyframes neonPulse {
              from { opacity: 0.3; transform: scale(0.95); }
              to   { opacity: 0.8; transform: scale(1.05); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}