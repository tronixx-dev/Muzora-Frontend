import Link from 'next/link';
import { FiPlay } from 'react-icons/fi';

export default function AlbumCard({ album }) {
  return (
    <Link
      href={`/albums/${album._id}`}
      className="bg-dark-200 hover:bg-dark-100 p-3 rounded-xl cursor-pointer group transition-all duration-300 block border border-white/5 hover:border-white/10"
    >
      <div className="relative mb-3">
        <img
          src={album.coverUrl || '/placeholder.png'}
          alt={album.title}
          className="w-full aspect-square object-cover rounded-lg shadow-lg"
        />
        <div className="absolute bottom-2 right-2 w-9 h-9 bg-green-500 rounded-full flex items-center justify-center shadow-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
          <FiPlay size={14} className="text-black ml-0.5" fill="currentColor" />
        </div>
      </div>
      <p className="text-white text-xs font-semibold truncate mb-0.5">{album.title}</p>
      <p className="text-gray-500 text-xs truncate">{album.artist?.name}</p>
    </Link>
  );
}