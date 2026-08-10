import { Queue } from 'bullmq';
import { redis } from '../../../config/redis';

export const MEDIA_CLEANUP_QUEUE = 'media-cleanup-queue';

export const mediaUploadQueue = new Queue(MEDIA_CLEANUP_QUEUE, {
  connection: redis,
});

export const scheduleMediaCleanupJob = async () => {
  await mediaUploadQueue.add('delete-junk-media', {}, {
    repeat: {
      cron: '0 0 * * *', // Daily at midnight
    },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  } as any);
};
