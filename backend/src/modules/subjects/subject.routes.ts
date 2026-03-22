import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../../config/db';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();

// GET /api/subjects (public)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const q = (req.query.q as string) || '';

    const subjects = await prisma.subject.findMany({
      where: {
        isPublished: true,
        title: { contains: q },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    res.status(StatusCodes.OK).json({ subjects });
  } catch (error) {
    next(error);
  }
});

// GET /api/subjects/:subjectId (public or auth)
router.get('/:subjectId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subjectId = parseInt(req.params.subjectId as string);
    
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId, isPublished: true },
    });

    if (!subject) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Subject not found' });
      return;
    }

    res.status(StatusCodes.OK).json({ subject });
  } catch (error) {
    next(error);
  }
});

// GET /api/subjects/:subjectId/tree (auth)
router.get('/:subjectId/tree', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subjectId = parseInt(req.params.subjectId as string);
    const userId = req.user!.id;

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

    if (!subject) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Subject not found' });
      return;
    }

    // Flatten videos to compute locking
    const allVideos = subject.sections.flatMap((s: any) => s.videos);
    
    // Get user progress
    const userProgress = await prisma.videoProgress.findMany({
      where: { userId, videoId: { in: allVideos.map((v: any) => v.id) } },
    });
    
    const progressMap = new Map(userProgress.map((p: any) => [p.videoId, p]));

    let previousCompleted = true; // First video is unlocked

    // Re-map the tree with locking logic
    const sectionsWithLocking = subject.sections.map((section: any) => {
      const mappedVideos = section.videos.map((video: any) => {
        const progress: any = progressMap.get(video.id);
        const isCompleted = progress?.isCompleted || false;
        
        const locked = !previousCompleted;
        // The *next* video can only be unlocked if *this* one is completed
        previousCompleted = isCompleted;

        return {
          id: video.id,
          title: video.title,
          orderIndex: video.orderIndex,
          isCompleted,
          locked,
        };
      });

      return {
        id: section.id,
        title: section.title,
        orderIndex: section.orderIndex,
        videos: mappedVideos,
      };
    });

    res.status(StatusCodes.OK).json({
      id: subject.id,
      title: subject.title,
      sections: sectionsWithLocking,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/subjects/:subjectId/first-video (auth)
router.get('/:subjectId/first-video', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subjectId = parseInt(req.params.subjectId as string);
    const userId = req.user!.id;

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

    if (!subject) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Subject not found' });
      return;
    }

    const allVideos = subject.sections.flatMap((s: any) => s.videos);
    
    const userProgress = await prisma.videoProgress.findMany({
      where: { userId, videoId: { in: allVideos.map((v: any) => v.id) } },
    });
    const progressMap = new Map(userProgress.map((p: any) => [p.videoId, p]));

    let firstUnlockedVideoId = allVideos[0]?.id; // default to first

    for (const video of allVideos) {
      const isCompleted = (progressMap.get(video.id) as any)?.isCompleted || false;
      if (!isCompleted) {
        firstUnlockedVideoId = video.id;
        break;
      }
    }

    if (!firstUnlockedVideoId) {
      // If all completed, just return the first one or throw an error. 
      // Let's just return the first one
      firstUnlockedVideoId = allVideos[0]?.id; 
    }

    res.status(StatusCodes.OK).json({ videoId: firstUnlockedVideoId });
  } catch (error) {
    next(error);
  }
});

export default router;
