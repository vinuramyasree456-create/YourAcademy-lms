'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/apiClient';
import useVideoStore from '@/store/videoStore';
import useSidebarStore from '@/store/sidebarStore';
import VideoPlayer from '@/components/Video/VideoPlayer';
import Link from 'next/link';

interface VideoMeta {
  id: number;
  title: string;
  description: string;
  youtubeUrl: string;
  sectionTitle: string;
  subjectId: number;
  subjectTitle: string;
  previousVideoId: number | null;
  nextVideoId: number | null;
  locked: boolean;
  unlockReason: string | null;
}

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = parseInt(params.videoId as string);
  const subjectId = parseInt(params.subjectId as string);

  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { fetchProgress, lastPositionSeconds, markCompleted, isCompleted } = useVideoStore();
  const { markVideoCompleted } = useSidebarStore(); // to immediately reflect checkmark

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/videos/${videoId}`);
        if (data.locked) {
          setError(data.unlockReason || 'This video is locked.');
          return;
        }
        setMeta(data);
        await fetchProgress(videoId);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to load video.');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId, fetchProgress]);

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url; // Assume URL might already be just the ID
  };

  const handleProgress = useCallback(async (currentTime: number) => {
    try {
      if (currentTime > 0) {
        await apiClient.post(`/progress/videos/${videoId}`, { lastPositionSeconds: Math.floor(currentTime) });
      }
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  }, [videoId]);

  const handleCompleted = useCallback(async () => {
    await markCompleted(videoId);
    markVideoCompleted(videoId);
    
    // Auto-advance if there's a next video
    if (meta?.nextVideoId) {
      router.push(`/subjects/${subjectId}/video/${meta.nextVideoId}`);
    }
  }, [meta, videoId, subjectId, markCompleted, markVideoCompleted, router]);

  const handleManualComplete = async () => {
    await markCompleted(videoId);
    markVideoCompleted(videoId);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center p-20 text-center">
      <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 mb-2">Content Locked</h2>
      <p className="text-zinc-600 max-w-md">{error}</p>
      
      {meta?.previousVideoId && (
        <Link 
          href={`/subjects/${subjectId}/video/${meta.previousVideoId}`}
          className="mt-8 btn-primary inline-flex items-center"
        >
          ← Go to previous video
        </Link>
      )}
    </div>
  );

  if (!meta) return null;

  return (
    <div className="max-w-5xl mx-auto pb-20 w-full animate-in fade-in duration-500">
      <VideoPlayer 
        videoId={extractYoutubeId(meta.youtubeUrl)}
        startSeconds={lastPositionSeconds}
        onProgress={handleProgress}
        onCompleted={handleCompleted}
      />
      
      <div className="px-8 mt-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">
              {meta.sectionTitle}
            </p>
            <h1 className="text-3xl font-bold text-zinc-900 mb-4">{meta.title}</h1>
          </div>
          <button 
            onClick={handleManualComplete}
            disabled={isCompleted}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
              isCompleted 
                ? 'bg-zinc-100 text-zinc-500 border-zinc-200 cursor-default' 
                : 'bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            {isCompleted ? '✓ Completed' : 'Mark as Complete'}
          </button>
        </div>

        <div className="prose prose-zinc max-w-none mt-6 text-zinc-600 bg-zinc-50 p-6 rounded-xl border border-zinc-100">
          <p>{meta.description}</p>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 pt-8 mt-12">
          {meta.previousVideoId ? (
            <Link 
              href={`/subjects/${subjectId}/video/${meta.previousVideoId}`}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center"
            >
              ← Previous Lesson
            </Link>
          ) : <div />}
          
          {meta.nextVideoId && (
            <Link 
              href={`/subjects/${subjectId}/video/${meta.nextVideoId}`}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center"
            >
              Next Lesson →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
