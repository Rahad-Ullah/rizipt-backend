import { Queue } from 'bullmq';
import { redis } from '../../../config/redis';
import { CouponQueueJob } from './coupon.constants';

export const COUPON_QUEUE = 'coupon-queue';

export const couponQueue = new Queue(COUPON_QUEUE, {
  connection: redis,
});

export const scheduleCouponExpirationJob = async () => {
  await couponQueue.add(CouponQueueJob.UpdateExpiredCoupons, {}, {
    repeat: {
      cron: '0 0 * * *', // Runs daily at midnight
    },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  } as any);
};
