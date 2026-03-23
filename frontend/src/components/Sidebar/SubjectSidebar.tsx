'use client';
import { useEffect } from 'react';
import useSidebarStore from '@/store/sidebarStore';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';

export default function SubjectSidebar({ subjectId }: { subjectId: number }) {
  const { tree, loading, fetchTree } = useSidebarStore();
  const params = useParams();
  const currentVideoId = parseInt(params.videoId as string);

  useEffect(() => {
    fetchTree(subjectId);
  }, [subjectId, fetchTree]);

  if (loading || !tree) {
    return <div className="p-4 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-10 bg-zinc-200 animate-pulse rounded-md" />)}
    </div>;
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 border-r border-zinc-200 w-80 flex-shrink-0">
      <div className="p-6 border-b border-zinc-200">
        <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-900 mb-2 inline-block font-medium uppercase tracking-wider">
          ← Back to paths
        </Link>
        <h2 className="text-xl font-bold text-zinc-900 leading-tight mt-1">{tree.title}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto w-full">
        {tree.sections.map((section, sIdx) => (
          <div key={section.id} className="w-full">
            <div className="px-6 py-3 bg-zinc-100 border-b border-zinc-200 sticky top-0 z-10 w-full">
              <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-wider w-full">
                Section {sIdx + 1}: {section.title}
              </h3>
            </div>
            <div className="w-full">
              {section.videos.map((video) => {
                const isActive = video.id === currentVideoId;
                
                return (
                  <div key={video.id} className="w-full">
                    {video.locked ? (
                      <div className="flex items-start px-6 py-4 w-full cursor-not-allowed opacity-50 bg-white border-b border-zinc-100 last:border-b-0">
                        <Lock className="w-5 h-5 text-zinc-400 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium text-zinc-500 w-full">{video.title}</span>
                      </div>
                    ) : (
                      <Link 
                        href={`/subjects/${subjectId}/video/${video.id}`}
                        className={`flex items-start px-6 py-4 w-full transition-colors border-b border-zinc-100 last:border-b-0 ${
                          isActive 
                            ? 'bg-blue-50 border-l-4 border-l-blue-600 border-b-blue-100' 
                            : 'bg-white hover:bg-zinc-50 border-l-4 border-l-transparent'
                        }`}
                      >
                        {video.isCompleted ? (
                           <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        ) : isActive ? (
                           <PlayCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        ) : (
                           <div className="w-5 h-5 rounded-full border-2 border-zinc-300 mt-0.5 mr-3 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium w-full ${isActive ? 'text-blue-900' : 'text-zinc-700'}`}>
                          {video.title}
                        </span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
