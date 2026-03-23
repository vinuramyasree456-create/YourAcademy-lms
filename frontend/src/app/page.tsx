'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/apiClient';
import Link from 'next/link';

interface Subject {
  id: number;
  title: string;
  slug: string;
  description: string;
}

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await apiClient.get('/subjects');
        setSubjects(data.subjects);
      } catch (err) {
        console.error('Failed to load subjects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">
          Discover learning paths
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl">
          Content-first subjects designed to help you master new skills effectively.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/subjects/${subject.id}`}
              className="group block p-6 bg-white border border-zinc-200 rounded-2xl hover:shadow-md transition-all hover:border-zinc-300"
            >
              <h3 className="text-xl font-semibold text-zinc-900 mb-2 group-hover:text-blue-600 transition-colors">
                {subject.title}
              </h3>
              <p className="text-zinc-600 text-sm line-clamp-3">
                {subject.description}
              </p>
              <div className="mt-6 flex items-center text-sm font-medium text-zinc-900">
                Start learning
                <svg
                  className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
          
          {subjects.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
              <p className="text-zinc-500">No subjects available right now.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
