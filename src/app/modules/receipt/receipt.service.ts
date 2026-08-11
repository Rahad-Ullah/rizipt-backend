import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Customer } from '../customer/customer.model';
import { IReceipt } from './receipt.interface';
import { Receipt } from './receipt.model';
import { Folder } from '../folder/folder.model';
import { Merchant } from '../merchant/merchant.model';
import { ReceiptStatus } from './receipt.constants';

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

export const ReceiptServices = {
  createReceiptService,
  updateReceiptService,
  deleteReceiptService,
};
