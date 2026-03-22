import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../../config/db';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();

// GET /api/videos/:videoId (auth)
router.get('/:videoId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const videoId = parseInt(req.params.videoId as string);
    const userId = req.user!.id;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        section: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!video) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Video not found' });
      return;
    }

    const subjectId = video.section.subject.id;

    // To compute locking and prev/next, we need the whole tree flattened
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            videos: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!subject) throw new Error('Subject not found');

    const allVideos = subject.sections.flatMap((s: any) => s.videos);
    const currentVideoIndex = allVideos.findIndex((v: any) => v.id === videoId);

    if (currentVideoIndex === -1) throw new Error('Video not found in tree');

    const previousVideoId = currentVideoIndex > 0 ? allVideos[currentVideoIndex - 1].id : null;
    const nextVideoId = currentVideoIndex < allVideos.length - 1 ? allVideos[currentVideoIndex + 1].id : null;

    let locked = false;
    let unlockReason = null;

    if (previousVideoId) {
      const prevProgress = await prisma.videoProgress.findUnique({
        where: { userId_videoId: { userId, videoId: previousVideoId } },
      });

      if (!prevProgress?.isCompleted) {
        locked = true;
        unlockReason = 'Complete previous video';
      }
    }

    res.status(StatusCodes.OK).json({
      id: video.id,
      title: video.title,
      description: video.description,
      youtubeUrl: video.youtubeUrl,
      orderIndex: video.orderIndex,
      durationSeconds: video.durationSeconds,
      sectionId: video.section.id,
      sectionTitle: video.section.title,
      subjectId: subject.id,
      subjectTitle: subject.title,
      previousVideoId,
      nextVideoId,
      locked,
      unlockReason,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
