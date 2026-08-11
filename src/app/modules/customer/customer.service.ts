import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICustomer } from './customer.interface';
import { Customer } from './customer.model';

// ---------------- create customer service -----------------
const createCustomer = async (payload: ICustomer): Promise<ICustomer> => {
  // check if email already exists
  const existingEmail = await Customer.findOne({ email: payload.email });
  if (existingEmail) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already exists');
  }

  const result = await Customer.create(payload);
  return result;
};

// ---------------- update customer service -----------------
const updateCustomer = async (id: string, payload: Partial<ICustomer>) => {
  // check email already exists
  const existingEmail = await Customer.exists({
    email: payload.email,
    _id: { $ne: id },
  });
  if (existingEmail) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already exists');
  }

  const result = await Customer.findByIdAndUpdate(id, payload, { new: true });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found');
  }
  return result;
};

export const CustomerServices = {
  createCustomer,
  updateCustomer,
};
