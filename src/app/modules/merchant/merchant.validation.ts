import { z } from 'zod';
import { objectId } from '../../../shared/objectIdValidator';
import { KycStatus } from './merchant.constants';

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

// update merchant kyc status validation
export const updateMerchantKycStatusSchema = z.object({
  params: z.object({
    id: objectId('Merchant ID'),
  }),
  body: z
    .object({
      kycStatus: z.enum([KycStatus.Approved, KycStatus.Rejected]),
    })
    .strict(),
});

export const MerchantValidations = {
  updateMerchantProfileSchema,
  updateMerchantKycStatusSchema,
};
