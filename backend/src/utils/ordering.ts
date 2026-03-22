export const computePrevNext = (videos: { id: number; orderIndex: number }[], currentVideoIndex: number) => {
  const previousVideoId = currentVideoIndex > 0 ? videos[currentVideoIndex - 1].id : null;
  const nextVideoId = currentVideoIndex < videos.length - 1 ? videos[currentVideoIndex + 1].id : null;
  
  return { previousVideoId, nextVideoId };
};
