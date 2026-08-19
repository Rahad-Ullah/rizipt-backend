import { z } from 'zod';
import { objectId } from '../../../shared/objectIdValidator';
import { ReceiptStatus } from './receipt.constants';

const lineItemSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Item name is required')
      .describe('Name or description of the purchased item'),
    quantity: z
      .number()
      .min(1, 'Quantity must be greater than 0')
      .default(1)
      .describe('Quantity purchased (e.g. 1, 2, 0.5 for weighted items)'),
    price: z
      .number()
      .min(0, 'Price cannot be negative')
      .describe('Total amount/cost for this line item (not unit price)'),
  })
  .strict();

// ocr receipt ai parse schema
export const OcrReceiptAiParseSchema = z.object({
  reference: z
    .string()
    .nullable()
    .optional()
    .describe(
      'Receipt/invoice number, order ID, or transaction reference code',
    ),
  merchant: z.object({
    businessName: z.string().describe('Merchant or business name'),
    address: z.string().nullable().optional().describe('Merchant address'),
    phone: z.string().nullable().optional().describe('Merchant phone number'),
  }),
  lineItems: z.array(lineItemSchema).describe('List of line items on receipt'),
  subtotal: z
    .number()
    .default(0)
    .describe('Subtotal before taxes/discounts (default to 0 if not found)'),
  taxPercentage: z
    .number()
    .default(0)
    .describe(
      'Tax rate or percentage, e.g. 5 for 5% (default to 0 if not found)',
    ),
  taxAmount: z
    .number()
    .default(0)
    .describe(
      'Total tax charged in currency amount (default to 0 if not found)',
    ),
  total: z.number().describe('Final total amount charged'),
});

// TypeScript type representing what the AI returns
export type IOcrParsedReceipt = z.infer<typeof OcrReceiptAiParseSchema>;

// ocr receipt ai extraction validation
export const ocrReceiptAiExtraction = z.object({
  body: z
    .object({
      rawOcrText: z.string().trim().nonempty('Raw OCR text is required'),
    })
    .strict(),
});

// create receipt validation
export const createReceipt = z.object({
  body: z
    .object({
      title: z.string().trim().optional(),
      image: z.string().url().trim().optional(),
      folder: z.string().optional().nullable(),
      reference: z.string().trim().optional(),
      customer: objectId('Customer ID').optional().nullable(),
      merchant: z
        .object({
          businessName: z.string().trim().min(1, 'Business name is required'),
          address: z.string().trim().optional(),
          phone: z.string().trim().optional(),
        })
        .strict()
        .optional(),
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
      status: z.nativeEnum(ReceiptStatus).optional(),
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
      title: z.string().trim().optional(),
      image: z.string().url().trim().optional(),
      folder: z.string().optional().nullable(),
      reference: z.string().trim().optional(),
      customer: objectId('Customer ID').optional().nullable(),
      merchant: z
        .object({
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
      status: z.nativeEnum(ReceiptStatus).optional(),
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
  OcrReceiptAiParseSchema,
  ocrReceiptAiExtraction,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getSingleReceipt,
};
