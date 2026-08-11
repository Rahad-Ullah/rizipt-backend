import { z } from 'zod';
import { objectId } from '../../../shared/objectIdValidator';

const lineItemSchema = z
  .object({
    name: z.string().trim().min(1, 'Item name is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0, 'Price cannot be negative'),
  })
  .strict();

// create receipt validation
export const createReceipt = z.object({
  body: z
    .object({
      folder: objectId('Folder ID').optional().nullable(),
      reference: z.string().trim().optional(),
      customer: objectId('Customer ID').optional().nullable(),
      merchant: z
        .object({
          id: objectId('Merchant ID').optional().nullable(),
          businessName: z.string().trim().min(1, 'Business name is required'),
          address: z.string().trim().optional(),
          phone: z.string().trim().optional(),
        })
        .strict(),
      lineItems: z
        .array(lineItemSchema)
        .min(1, 'At least one line item is required'),
      subtotal: z.number().min(0, 'Subtotal cannot be negative'),
      taxPercentage: z
        .number()
        .min(0, 'Tax percentage cannot be negative')
        .max(100, 'Tax percentage cannot exceed 100'),
      taxAmount: z.number().min(0, 'Tax amount cannot be negative'),
      total: z.number().min(0, 'Total cannot be negative'),
    })
    .strict(),
});

// update receipt validation
export const updateReceipt = z.object({
  params: z.object({
    id: objectId('Receipt ID'),
  }),
  body: z
    .object({
      folder: objectId('Folder ID').optional().nullable(),
      reference: z.string().trim().optional(),
      customer: objectId('Customer ID').optional().nullable(),
      merchant: z
        .object({
          id: objectId('Merchant ID').optional().nullable(),
          businessName: z.string().trim().min(1, 'Business name is required'),
          address: z.string().trim().optional(),
          phone: z.string().trim().optional(),
        })
        .strict()
        .optional(),
      lineItems: z
        .array(lineItemSchema)
        .min(1, 'At least one line item is required')
        .optional(),
      subtotal: z.number().min(0, 'Subtotal cannot be negative').optional(),
      taxPercentage: z
        .number()
        .min(0, 'Tax percentage cannot be negative')
        .max(100, 'Tax percentage cannot exceed 100')
        .optional(),
      taxAmount: z.number().min(0, 'Tax amount cannot be negative').optional(),
      total: z.number().min(0, 'Total cannot be negative').optional(),
    })
    .strict(),
});

// delete receipt validation
export const deleteReceipt = z.object({
  params: z.object({
    id: objectId('Receipt ID'),
  }),
});

// get single receipt validation
export const getSingleReceipt = z.object({
  params: z.object({
    id: objectId('Receipt ID'),
  }),
});

export const ReceiptValidations = {
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getSingleReceipt,
};
