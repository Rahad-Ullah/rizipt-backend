import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Customer } from '../customer/customer.model';
import { IReceipt } from './receipt.interface';
import { Receipt } from './receipt.model';
import { Folder } from '../folder/folder.model';
import { Merchant } from '../merchant/merchant.model';
import { ReceiptStatus } from './receipt.constants';
import QueryBuilder from '../../builder/QueryBuilder';
import { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../user/user.constant';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { gemini } from '../../../config/gemini';
import { IOcrParsedReceipt, ReceiptValidations } from './receipt.validation';

// --------------- ocr receipt ai extraction ---------------
const ocrReceiptAiExtraction = async (rawOcrText: string) => {
  const cleanedOcr = rawOcrText.replace(/\n\s*\n/g, '\n').trim();

  const systemInstruction = `
    You are a high-speed receipt parser. Return ONLY a valid, raw JSON object matching this structure:
    {
      "reference": string | null,
      "merchant": { "businessName": string, "address": string | null, "phone": string | null },
      "lineItems": [{ "name": string, "quantity": number, "price": number }],
      "subtotal": number,
      "taxPercentage": number,
      "taxAmount": number,
      "total": number
    }
    Do not include markdown backticks (no \`\`\`json). Extract literal values only, do not compute missing math. Return 0 for missing numbers.
  `;

  const response = await gemini.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: `Extract the receipt fields from this OCR text:\n\n${cleanedOcr}`,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.0,
      maxOutputTokens: 8192,
      thinkingConfig: {
        thinkingBudget: 1,
      },
      responseMimeType: 'application/json',
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Gemini returned an empty response.',
    );
  }

  // Parse and validate strictly against the Zod schema
  const parsedData: IOcrParsedReceipt = JSON.parse(responseText);
  return ReceiptValidations.OcrReceiptAiParseSchema.parse(parsedData);
};

// --------------- create receipt service ---------------
const createReceiptService = async (
  payload: IReceipt,
  user: JwtPayload,
): Promise<IReceipt> => {
  // validate customer id
  let customer = null;
  if (payload.customer) {
    customer = await Customer.findById(payload.customer).lean();
    if (!customer) {
      throw new ApiError(StatusCodes.CONFLICT, 'Invalid customer id');
    }
  }
  // validate folder id
  if (payload.folder) {
    const folder = await Folder.exists({ _id: payload.folder });
    if (!folder) {
      throw new ApiError(StatusCodes.CONFLICT, 'Invalid folder id');
    }
  }

  // attach merchant info
  if (user.role === UserRole.Merchant) {
    const merchant = await Merchant.findOne({ user: payload.createdBy });
    if (merchant) {
      payload.merchant = {
        id: merchant._id,
        businessName: merchant.businessName,
        address: merchant.address,
        phone: `${merchant.phone.countryCode} ${merchant.phone.number}`,
      };
    }
  }

  const receipt = await Receipt.create(payload);

  // send email to the customer
  if (
    user.role === UserRole.Merchant &&
    customer?.email &&
    receipt.status === ReceiptStatus.Sent
  ) {
    const template = emailTemplate.customerInvoice(receipt, customer);
    emailHelper
      .sendEmail({
        to: customer.email,
        subject: template.subject,
        html: template.html,
      })
      .catch(error =>
        console.error('Error while sending receipt email: ', error),
      );
  }

  return receipt;
};

// --------------- update receipt service ---------------
const updateReceiptService = async (id: string, payload: Partial<IReceipt>) => {
  // validate customer id
  if (payload.customer) {
    const customer = await Customer.exists({ _id: payload.customer });
    if (!customer) {
      throw new ApiError(StatusCodes.CONFLICT, 'Invalid customer id');
    }
  }
  // validate folder id
  if (payload.folder) {
    const folder = await Folder.exists({ _id: payload.folder });
    if (!folder) {
      throw new ApiError(StatusCodes.CONFLICT, 'Invalid folder id');
    }
  }

  const result = await Receipt.findByIdAndUpdate(id, payload, { new: true });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Receipt not found');
  }

  return result;
};

// --------------- delete receipt service ---------------
const deleteReceiptService = async (id: string) => {
  const result = await Receipt.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Receipt not found');
  }
  return result;
};

// --------------- get receipt by id service ----------------
const getSingleReceipt = async (id: string): Promise<IReceipt> => {
  const result = await Receipt.findById(id).populate('customer', 'name email');
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Receipt not found');
  }
  return result;
};

// ---------------- get receipts by user service ----------------
const getReceiptsByUser = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const receiptQuery = new QueryBuilder(
    Receipt.find({ createdBy: userId, isDeleted: false }),
    query,
  )
    .filter()
    .search(['title', 'reference', 'merchant.businessName'])
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    receiptQuery.modelQuery.populate('customer', 'name email'),
    receiptQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

// ---------------- get all receipts service ----------------
const getAllReceipts = async (query: Record<string, unknown>) => {
  const receiptQuery = new QueryBuilder(
    Receipt.find({ isDeleted: false }),
    query,
  )
    .filter()
    .search(['title', 'reference', 'merchant.businessName'])
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    receiptQuery.modelQuery.populate('customer', 'name email'),
    receiptQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const ReceiptServices = {
  ocrReceiptAiExtraction,
  createReceiptService,
  updateReceiptService,
  deleteReceiptService,
  getSingleReceipt,
  getReceiptsByUser,
  getAllReceipts,
};
