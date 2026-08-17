import { Job, Worker } from 'bullmq';
import { redis } from '../../../config/redis';
import { COUPON_QUEUE } from './coupon.queue';
import { CouponServices } from './coupon.service';
import { CouponQueueJob } from './coupon.constants';

interface CouponExpirationJobData {}

interface CouponExpirationJob extends Job<
  CouponExpirationJobData,
  void,
  CouponQueueJob
> {}

export const initCouponExpirationWorker = () => {
  const worker = new Worker<CouponExpirationJobData, void, CouponQueueJob>(
    COUPON_QUEUE,
    async (job: CouponExpirationJob) => {
      if (job.name === CouponQueueJob.UpdateExpiredCoupons) {
        await CouponServices.updateExpiredCoupons();
      }
    },
    { connection: redis },
  );

  worker.on('completed', (job: CouponExpirationJob) => {
    console.info(`[BullMQ] Coupon expiration job completed: id-${job.id}`);
  });

  worker.on('failed', (job: CouponExpirationJob | undefined, err: Error) => {
    console.error(`[BullMQ] Coupon expiration job failed: id-${job?.id}`, err);
  });

  worker.on('error', (err: Error) => {
    console.error('[BullMQ] Coupon expiration worker error:', err);
  });

  return worker;
};
