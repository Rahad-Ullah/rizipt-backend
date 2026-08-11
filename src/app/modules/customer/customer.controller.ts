import { Request, Response, NextFunction } from 'express';
import { CustomerServices } from './customer.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create customer
const createCustomer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CustomerServices.createCustomer({
      ...req.body,
      merchant: req.user.id,
    });

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Customer created successfully',
      data: result,
    });
  },
);

// update customer
const updateCustomer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CustomerServices.updateCustomer(
      req.params.id,
      req.body,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Customer updated successfully',
      data: result,
    });
  },
);

export const CustomerController = {
  createCustomer,
  updateCustomer,
};