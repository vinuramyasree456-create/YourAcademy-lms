'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/apiClient';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';

interface SubjectProgress {
  subjectId: number;
  subjectTitle: string;
  totalVideos: number;
  completedVideos: number;
  percentComplete: number;
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [enrolledSubjects, setEnrolledSubjects] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we might have an endpoint for ALL user enrollments.
    // For now, let's fetch all subjects and then progress for each to build the dashboard.
    // This is N+1, but fine for a minimal prototype. A better backend endpoint would be `/progress/all`
    
    const fetchProgress = async () => {
      try {
        const { data: { subjects } } = await apiClient.get('/subjects');
        
        const progressPromises = subjects.map((sub: any) => 
          apiClient.get(`/progress/subjects/${sub.id}`)
            .then(res => ({
              subjectId: sub.id,
              subjectTitle: sub.title,
              ...res.data
            }))
            .catch(() => null)
        );
        
        const results = await Promise.all(progressPromises);
        // Only show subjects where they have some progress or enrollment
        const active = results.filter(r => r && r.completedVideos > 0 || r?.lastVideoId);
        
        setEnrolledSubjects(active);
      } catch (err) {
        console.error('Failed to load progress', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgress();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center space-x-6 mb-12 border-b border-zinc-200 pb-8">
        <div className="h-24 w-24 bg-zinc-900 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">{user?.name}</h1>
          <p className="text-zinc-500">{user?.email}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-zinc-900 mb-6">Your Learning Progress</h2>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
      ) : enrolledSubjects.length === 0 ? (
        <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-xl p-8 text-center">
          <p className="text-zinc-600 mb-4">You haven't started any subjects yet.</p>
          <Link href="/" className="btn-primary inline-block">
            Browse Subjects
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrolledSubjects.map(sub => (
            <div key={sub.subjectId} className="bg-white border border-zinc-200 py-4 px-6 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-900 text-lg">{sub.subjectTitle}</h3>
                <p className="text-sm text-zinc-500">
                  {sub.completedVideos} / {sub.totalVideos} videos completed
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="w-32">
                  <div className="flex justify-between text-xs text-zinc-600 mb-1">
                    <span>Progress</span>
                    <span>{sub.percentComplete}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-zinc-900 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${sub.percentComplete}%` }}
                    />
                  </div>
                </div>
                <Link href={`/subjects/${sub.subjectId}`} className="btn-secondary text-sm">
                  Continue
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
