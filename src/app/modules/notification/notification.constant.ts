export enum NotificationType {
  CouponCreated = 'coupon_created',
  PolicyUpdated = 'policy_updated',
  KycRequest = 'kyc_request',
  KycReview = 'kyc_review',
  RefundFailed = 'refund_failed',
}

export enum NotificationQueueJob {
  BroadcastToUsers = 'broadcast-to-users',
}
