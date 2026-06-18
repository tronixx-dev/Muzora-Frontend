import { usePlayerStore } from '../../context/store';
import { FiPlay, FiPause, FiHeart, FiMoreHorizontal } from 'react-icons/fi';
import Equalizer from './Equalizer';

function fmt(sec) {
  if (!sec) return '--';
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
}

export function SongRow({ song, index, queue = [] }) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const isActive = currentSong?._id === song._id;

  const handleClick = () => {
    if (isActive) togglePlay();
    else playSong(song, queue.length > 0 ? queue : [song]);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 rounded-xl cursor-pointer group transition-all ${
        isActive ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      {/* Index / Equalizer */}
      <div className="w-5 flex-shrink-0 flex items-center justify-center">
        {isActive ? (
          <Equalizer isPlaying={isPlaying} size="sm" color="#1db954" />
        ) : (
          <>
            <span className="text-gray-500 text-sm group-hover:hidden block">{index + 1}</span>
            <FiPlay size={13} className="text-white hidden group-hover:block" fill="currentColor" />
          </>
        )}
      </div>

      {/* Cover */}
      <img
        src={song.coverUrl || '/placeholder.png'}
        alt={song.title}
        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-md"
      />

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold truncate ${isActive ? 'text-green-400' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="text-xs text-gray-500 truncate hover:text-white cursor-pointer transition-colors">
          {song.artist?.name}
        </p>
      </div>

      {/* Album - hidden on mobile */}
      <p className="text-xs text-gray-500 hidden md:block truncate max-w-[150px] hover:text-white cursor-pointer transition-colors">
        {song.album?.title}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <button
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-green-400 transition-all"
        >
          <FiHeart size={15} />
        </button>
        <span className="text-gray-500 text-xs tabular-nums w-8 md:w-10 text-right">
          {fmt(song.duration)}
        </span>
        <button
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-all hidden md:block"
        >
          <FiMoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}

export function SongCard({ song, queue = [] }) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const isActive = currentSong?._id === song._id;

  const handleClick = () => {
    if (isActive) togglePlay();
    else playSong(song, queue.length > 0 ? queue : [song]);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-dark-200 hover:bg-dark-100 p-3 md:p-4 rounded-xl cursor-pointer group transition-all duration-300 border border-white/5 hover:border-white/10"
    >
      <div className="relative mb-3 md:mb-4">
        <img
          src={song.coverUrl || '/placeholder.png'}
          alt={song.title}
          className="w-full aspect-square object-cover rounded-lg shadow-lg"
        />
        <div className={`absolute bottom-2 right-2 w-9 h-9 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
          isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
        }`}>
          {isActive && isPlaying
            ? <Equalizer isPlaying={true} size="sm" color="#000" />
            : <FiPlay size={16} className="text-black ml-0.5" fill="currentColor" />}
        </div>
      </div>
      <p className={`text-sm font-semibold truncate mb-0.5 ${isActive ? 'text-green-400' : 'text-white'}`}>
        {song.title}
      </p>
      <p className="text-xs text-gray-500 truncate">{song.artist?.name}</p>
    </div>
  );
}