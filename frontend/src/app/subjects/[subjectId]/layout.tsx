'use client';
import SubjectSidebar from '@/components/Sidebar/SubjectSidebar';

export default function SubjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { subjectId: string };
}) {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <SubjectSidebar subjectId={parseInt(params.subjectId)} />
      <div className="flex-1 overflow-y-auto bg-white">
        {children}
      </div>
    </div>
  );
}
