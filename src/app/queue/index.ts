import { Worker } from 'bullmq';
import { scheduleMediaCleanupJob } from '../modules/mediaUpload/mediaUpload.queue';
import { initMediaUploadWorker } from '../modules/mediaUpload/mediaUpload.worker';
import { initNotificationWorker } from '../modules/notification/notification.worker';
import { scheduleCouponExpirationJob } from '../modules/coupon/coupon.queue';
import { initCouponExpirationWorker } from '../modules/coupon/coupon.worker';

export interface AppQueuesAndWorkers {
  workers: Worker<any, any, any>[];
  closeWorkers: () => Promise<void>;
}

export const initAppQueuesAndWorkers =
  async (): Promise<AppQueuesAndWorkers> => {
    // 1. Initialize Workers
    const mediaWorker = initMediaUploadWorker();
    const notificationWorker = initNotificationWorker();
    const couponWorker = initCouponExpirationWorker();

    const workers: Worker<any, any, any>[] = [
      mediaWorker,
      notificationWorker,
      couponWorker,
    ];

    // 2. Schedule Repeatable Jobs
    await scheduleMediaCleanupJob();
    await scheduleCouponExpirationJob();

    console.log('🚀 All BullMQ Queues and Workers initialized.');

    // 3. Helper to gracefully close all workers
    const closeWorkers = async () => {
      console.log('[BullMQ] Closing all workers...');
      await Promise.all(workers.map(worker => worker.close()));
      console.log('[BullMQ] All workers closed.');
    };

    return { workers, closeWorkers };
  };
