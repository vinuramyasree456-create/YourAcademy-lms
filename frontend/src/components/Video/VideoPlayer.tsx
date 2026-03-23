'use client';

interface PlayerProps {
  videoId: string | undefined;
  startSeconds: number;
  onProgress: (currentTime: number) => void;
  onCompleted: () => void;
}

export default function VideoPlayer({ videoId, startSeconds, onCompleted }: PlayerProps) {
  if (!videoId) return <div className="aspect-video bg-black flex items-center justify-center text-white">Invalid Video</div>;

  return (
    <div className="w-full aspect-video bg-zinc-900 flex flex-col items-center justify-center relative border border-zinc-800 rounded-lg overflow-hidden">
      <div className="text-center p-8">
        <h3 className="text-white text-2xl font-bold mb-3">Watch on YouTube</h3>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">This lesson video is hosted externally. Click below to continue learning directly on YouTube.</p>
        
        <a 
          href={`https://www.youtube.com/watch?v=${videoId}${startSeconds ? `&t=${Math.floor(startSeconds)}s` : ''}`} 
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            // Mark as complete when they click the link
            onCompleted();
          }}
          className="inline-flex px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors items-center gap-2"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C.001 8.07 0 12 0 12s.001 3.93.5 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.378.55 9.378.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Open in YouTube
        </a>
      </div>
    </div>
  );
}
