import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Customer } from '../customer/customer.model';
import { IReceipt } from './receipt.interface';
import { Receipt } from './receipt.model';
import { Folder } from '../folder/folder.model';
import { Merchant } from '../merchant/merchant.model';
import { ReceiptStatus } from './receipt.constants';
import QueryBuilder from '../../builder/QueryBuilder';

// --------------- create receipt service ---------------
const createReceiptService = async (payload: IReceipt): Promise<IReceipt> => {
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
  // attach merchant info
  const merchant = await Merchant.findOne({ user: payload.createdBy });
  if (merchant) {
    payload.merchant = {
      id: merchant._id,
      businessName: merchant.businessName,
      address: merchant.address,
      phone: `${merchant.phone.countryCode} ${merchant.phone.number}`,
    };
  }

  const result = await Receipt.create(payload);
  return result;
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

  // send email to the customer
  if (payload.status && payload.status === ReceiptStatus.Sent) {
    // TODO: send email
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
  createReceiptService,
  updateReceiptService,
  deleteReceiptService,
  getSingleReceipt,
  getReceiptsByUser,
  getAllReceipts,
};
