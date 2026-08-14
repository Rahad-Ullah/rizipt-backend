import { z } from 'zod';
import { objectId } from '../../../shared/objectIdValidator';

// create coupon validation schema
const createCouponSchema = z.object({
  body: z
    .object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      code: z.string().min(1, 'Code is required'),
      discountPercentage: z
        .number()
        .min(0, 'Discount percentage must be at least 0')
        .max(100, 'Discount percentage cannot exceed 100'),
      image: z.string().url().min(1, 'Image URL is required'),
      startsAt: z
        .string()
        .datetime()
        .refine(
          date => {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            return new Date(date) >= today;
          },
          { message: 'Start date must be in the future' },
        ),
      expiresAt: z
        .string()
        .datetime()
        .refine(date => new Date(date) > new Date(), {
          message: 'Expiration date must be in the future',
        }),
    })
    .strict()
    .refine(
      data => {
        if (data.startsAt && data.expiresAt) {
          return new Date(data.startsAt) < new Date(data.expiresAt);
        }
        return true;
      },
      {
        message: 'Start date must be before expiration date',
      },
    ),
});

// update coupon validation schema
const updateCouponSchema = z.object({
  params: z.object({
    id: objectId('Coupon ID'),
  }),
  body: z
    .object({
      title: z.string().min(1, 'Title is required').optional(),
      description: z.string().min(1, 'Description is required').optional(),
      code: z.string().min(1, 'Code is required').optional(),
      discountPercentage: z
        .number()
        .min(0, 'Discount percentage must be at least 0')
        .max(100, 'Discount percentage cannot exceed 100')
        .optional(),
      image: z.string().url().min(1, 'Image URL is required').optional(),
      startsAt: z
        .string()
        .datetime()
        .refine(
          date => {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            return new Date(date) >= today;
          },
          { message: 'Start date must be in the future' },
        )
        .optional(),
      expiresAt: z
        .string()
        .datetime()
        .refine(date => new Date(date) > new Date(), {
          message: 'Expiration date must be in the future',
        })
        .optional(),
    })
    .strict()
    .refine(
      data => {
        if (data.startsAt && data.expiresAt) {
          return new Date(data.startsAt) < new Date(data.expiresAt);
        }
        return true;
      },
      {
        message: 'Start date must be before expiration date',
      },
    ),
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
