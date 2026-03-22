import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../../config/db';
import { requireAuth } from '../../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();

const progressSchema = z.object({
  lastPositionSeconds: z.number().min(0).optional(),
  isCompleted: z.boolean().optional(),
});

// GET /api/progress/subjects/:subjectId (auth)
router.get('/subjects/:subjectId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subjectId = parseInt(req.params.subjectId as string);
    const userId = req.user!.id;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        sections: {
          include: { videos: true },
        },
      },
    });

    if (!subject) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Subject not found' });
      return;
    }

    const allVideos = subject.sections.flatMap((s: any) => s.videos);
    const totalVideos = allVideos.length;

    const userProgress = await prisma.videoProgress.findMany({
      where: { userId, videoId: { in: allVideos.map((v: any) => v.id) } },
      orderBy: { updatedAt: 'desc' },
    });

    const completedVideos = userProgress.filter((p: any) => p.isCompleted).length;
    const percentComplete = totalVideos === 0 ? 0 : Math.round((completedVideos / totalVideos) * 100);

    const lastVideoId = userProgress[0]?.videoId || null;
    const lastPositionSeconds = userProgress[0]?.lastPositionSeconds || 0;

    res.status(StatusCodes.OK).json({
      totalVideos,
      completedVideos,
      percentComplete,
      lastVideoId,
      lastPositionSeconds,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/progress/videos/:videoId (auth)
router.get('/videos/:videoId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const videoId = parseInt(req.params.videoId as string);
    const userId = req.user!.id;

    const progress = await prisma.videoProgress.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });

    res.status(StatusCodes.OK).json({
      lastPositionSeconds: progress?.lastPositionSeconds || 0,
      isCompleted: progress?.isCompleted || false,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/progress/videos/:videoId (auth)
router.post('/videos/:videoId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const videoId = parseInt(req.params.videoId as string);
    const userId = req.user!.id;
    const data = progressSchema.parse(req.body);

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
        res.status(StatusCodes.NOT_FOUND).json({ error: 'Video not found' });
        return;
    }

    let cappedPosition = data.lastPositionSeconds ?? 0;
    if (video.durationSeconds && cappedPosition > video.durationSeconds) {
      cappedPosition = video.durationSeconds;
    }

    const existingProgress = await prisma.videoProgress.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });

    const isCompleted = data.isCompleted ?? existingProgress?.isCompleted ?? false;
    const completedAt = isCompleted && !existingProgress?.isCompleted ? new Date() : existingProgress?.completedAt;

    const progress = await prisma.videoProgress.upsert({
      where: { userId_videoId: { userId, videoId } },
      update: {
        lastPositionSeconds: cappedPosition,
        isCompleted,
        completedAt,
      },
      create: {
        userId,
        videoId,
        lastPositionSeconds: cappedPosition,
        isCompleted,
        completedAt,
      },
    });

    res.status(StatusCodes.OK).json({ progress });
  } catch (error) {
    next(error);
  }
});

export default router;
