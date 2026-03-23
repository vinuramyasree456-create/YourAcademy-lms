'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import YouTube from 'react-youtube';

interface PlayerProps {
  videoId: string | undefined;
  startSeconds: number;
  onProgress: (currentTime: number) => void;
  onCompleted: () => void;
}

export default function VideoPlayer({ videoId, startSeconds, onProgress, onCompleted }: PlayerProps) {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isReady, setIsReady] = useState(false);

  const startTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(async () => {
      if (playerRef.current) {
        const time = await playerRef.current.getCurrentTime();
        onProgress(time);
      }
    }, 5000); // update every 5 seconds
  }, [onProgress]);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  if (!videoId) return <div className="aspect-video bg-black flex items-center justify-center text-white">Invalid Video</div>;

  return (
    <div className="w-full aspect-video bg-black relative">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-zinc-900 border border-zinc-800">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      )}
      <YouTube
        videoId={videoId}
        opts={{
          width: '100%',
          height: '100%',
          playerVars: {
            start: Math.floor(startSeconds),
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
          },
        }}
        className="absolute inset-0 w-full h-full"
        onReady={(e) => {
          playerRef.current = e.target;
          setIsReady(true);
        }}
        onPlay={startTracking}
        onPause={stopTracking}
        onEnd={() => {
          stopTracking();
          onCompleted();
        }}
      />
    </div>
  );
}
