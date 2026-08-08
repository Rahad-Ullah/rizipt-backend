import { z } from 'zod';

// update merchant profile validation
export const updateMerchantProfileSchema = z.object({
  body: z
    .object({
      businessName: z.string().optional(),
      businessType: z.string().optional(),
      businessDescription: z.string().optional(),
      logo: z.string().url().optional(),
      tradeLicense: z.string().url().optional(),
      phone: z
        .object({
          countryCode: z.string().optional(),
          number: z.string().optional(),
        })
        .optional(),
      address: z.string().optional(),
      location: z
        .object({
          type: z.literal('Point').optional(),
          coordinates: z.tuple([z.number(), z.number()]).optional(), // [longitude, latitude]
        })
        .optional(),
    })
    .strict(),
});

export const MerchantValidations = {
  updateMerchantProfileSchema,
};
