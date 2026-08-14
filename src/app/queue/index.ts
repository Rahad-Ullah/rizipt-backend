import { scheduleMediaCleanupJob } from '../modules/mediaUpload/mediaUpload.queue';
import { initMediaUploadWorker } from '../modules/mediaUpload/mediaUpload.worker';
import { initNotificationWorker } from '../modules/notification/notification.worker';

export const initAppQueuesAndWorkers = async () => {
  // Initialize Workers
  initMediaUploadWorker();
  initNotificationWorker();

  // Schedule Repeatable Jobs
  await scheduleMediaCleanupJob();

  console.log('🚀 All BullMQ Queues and Workers initialized.');
};
