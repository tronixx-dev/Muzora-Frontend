export default function Equalizer({ isPlaying, size = 'sm', color = '#1db954' }) {
  const bars  = size === 'sm' ? 3 : 5;
  const width = size === 'sm' ? 2 : 3;
  const height = size === 'sm' ? 14 : 20;

  return (
    <div
      className="flex items-end gap-0.5"
      style={{ height: `${height}px` }}
      aria-label={isPlaying ? 'Playing' : 'Paused'}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          style={{
            width:            `${width}px`,
            background:       color,
            borderRadius:     '1px',
            height:           isPlaying ? '100%' : '30%',
            transformOrigin:  'bottom',
            animation:        isPlaying
              ? `equalize 0.8s ease-in-out infinite alternate`
              : 'none',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes equalize {
          0%   { height: 20%; }
          25%  { height: 80%; }
          50%  { height: 40%; }
          75%  { height: 100%; }
          100% { height: 30%; }
        }
      `}</style>
    </div>
  );
}