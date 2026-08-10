import { scheduleMediaCleanupJob } from '../modules/mediaUpload/mediaUpload.queue';
import { initMediaUploadWorker } from '../modules/mediaUpload/mediaUpload.worker';

export const initAppQueuesAndWorkers = async () => {
  // Initialize Workers
  initMediaUploadWorker();

  // Schedule Repeatable Jobs
  await scheduleMediaCleanupJob();

  console.log('🚀 All BullMQ Queues and Workers initialized.');
};
