import Link from 'next/link';

export default function AlbumCard({ album }) {
  return (
    <Link href={`/albums/${album._id}`} className="bg-dark-200 hover:bg-dark-100 p-4 rounded-xl cursor-pointer group transition-all duration-300 block">
      <div className="relative mb-4">
        <img
          src={album.coverUrl || '/placeholder.png'}
          alt={album.title}
          className="w-full aspect-square object-cover rounded-lg shadow-lg"
        />
      </div>
      <p className="text-white text-sm font-semibold truncate mb-1">{album.title}</p>
      <p className="text-gray-400 text-xs truncate">{album.artist?.name}</p>
    </Link>
  );
}