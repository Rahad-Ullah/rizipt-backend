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
  createReceiptService,
  updateReceiptService,
  deleteReceiptService,
  getSingleReceipt,
  getReceiptsByUser,
  getAllReceipts,
};
