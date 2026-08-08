import { z } from 'zod';
import { objectId } from '../../../shared/objectIdValidator';

// create coupon validation schema
const createCouponSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    code: z.string().min(1, 'Code is required'),
    discountPercentage: z
      .number()
      .min(0, 'Discount percentage must be at least 0')
      .max(100, 'Discount percentage cannot exceed 100'),
    image: z.string().url().min(1, 'Image URL is required'),
    expiresAt: z.date().refine(date => date > new Date(), {
      message: 'Expiration date must be in the future',
    }),
  }),
});

// update coupon validation schema
const updateCouponSchema = z.object({
  params: z.object({
    id: objectId('Coupon ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    code: z.string().min(1, 'Code is required').optional(),
    discountPercentage: z
      .number()
      .min(0, 'Discount percentage must be at least 0')
      .max(100, 'Discount percentage cannot exceed 100')
      .optional(),
    image: z.string().url().min(1, 'Image URL is required').optional(),
    expiresAt: z
      .date()
      .refine(date => date > new Date(), {
        message: 'Expiration date must be in the future',
      })
      .optional(),
  }),
});

// delete coupon validation schema
const deleteCouponSchema = z.object({
  params: z.object({
    id: objectId('Coupon ID'),
  }),
});

// get single coupon validation schema
const getCouponSchema = z.object({
  params: z.object({
    id: objectId('Coupon ID'),
  }),
});

export const CouponValidations = {
  createCouponSchema,
  updateCouponSchema,
  deleteCouponSchema,
  getCouponSchema,
};
