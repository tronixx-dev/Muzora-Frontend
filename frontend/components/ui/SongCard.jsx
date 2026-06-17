import { usePlayerStore } from '../../context/store';
import { FiPlay, FiPause, FiHeart } from 'react-icons/fi';

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
      className={`flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer group transition-colors ${
        isActive ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      {/* Index / Play icon */}
      <div className="w-5 flex-shrink-0 text-center">
        {isActive && isPlaying ? (
          <div className="flex items-end justify-center gap-0.5 h-4">
            <div className="w-0.5 bg-green-500 animate-bounce" style={{height:'60%', animationDelay:'0ms'}} />
            <div className="w-0.5 bg-green-500 animate-bounce" style={{height:'100%', animationDelay:'150ms'}} />
            <div className="w-0.5 bg-green-500 animate-bounce" style={{height:'40%', animationDelay:'300ms'}} />
          </div>
        ) : (
          <>
            <span className="text-gray-400 text-sm group-hover:hidden">{index + 1}</span>
            <FiPlay size={14} className="text-white hidden group-hover:block mx-auto" fill="currentColor" />
          </>
        )}
      </div>

      {/* Cover + info */}
      <img
        src={song.coverUrl || '/placeholder.png'}
        alt={song.title}
        className="w-10 h-10 rounded object-cover flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-green-500' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="text-xs text-gray-400 truncate hover:text-white cursor-pointer">
          {song.artist?.name}
        </p>
      </div>

      {/* Album */}
      <p className="text-xs text-gray-400 hidden md:block truncate max-w-[150px] hover:text-white cursor-pointer">
        {song.album?.title}
      </p>

      {/* Like + duration */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all"
        >
          <FiHeart size={15} />
        </button>
        <span className="text-gray-400 text-sm tabular-nums w-10 text-right">
          {fmt(song.duration)}
        </span>
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
      className="bg-dark-200 hover:bg-dark-100 p-4 rounded-xl cursor-pointer group transition-all duration-300"
    >
      <div className="relative mb-4">
        <img
          src={song.coverUrl || '/placeholder.png'}
          alt={song.title}
          className="w-full aspect-square object-cover rounded-lg shadow-lg"
        />
        <button className={`absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
        }`}>
          {isActive && isPlaying
            ? <FiPause size={18} className="text-black" fill="currentColor" />
            : <FiPlay size={18} className="text-black ml-0.5" fill="currentColor" />}
        </button>
      </div>
      <p className={`text-sm font-semibold truncate mb-1 ${isActive ? 'text-green-500' : 'text-white'}`}>
        {song.title}
      </p>
      <p className="text-xs text-gray-400 truncate">{song.artist?.name}</p>
    </div>
  );
}