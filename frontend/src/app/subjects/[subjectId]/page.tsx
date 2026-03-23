'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/apiClient';

export default function SubjectRedirectPage({ params }: { params: { subjectId: string } }) {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFirstVideo = async () => {
      try {
        const { data } = await apiClient.get(`/subjects/${params.subjectId}/first-video`);
        if (data.videoId) {
          router.replace(`/subjects/${params.subjectId}/video/${data.videoId}`);
        } else {
          setError('No content available for this subject.');
        }
      } catch (err: any) {
        if (err?.response?.status === 401) {
          router.replace('/auth/login');
        } else {
          setError(err?.response?.data?.error || 'Failed to resolve subject.');
        }
      }
    };

    fetchFirstVideo();
  }, [params.subjectId, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
    </div>
  );
}
