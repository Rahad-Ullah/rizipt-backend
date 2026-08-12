import { Request, Response, NextFunction } from 'express';
import { CouponServices } from './coupon.service';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

// create coupon
export const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponServices.createCouponService({
    createdBy: req.user.id,
    ...req.body,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Coupon created successfully',
    data: result,
  });
});

// update coupon
export const updateCoupon = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CouponServices.updateCouponService(
      req.params.id,
      req.body,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Coupon updated successfully',
      data: result,
    });
  },
);

// delete coupon
export const deleteCoupon = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CouponServices.deleteCouponService(
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Coupon deleted successfully',
      data: result,
    });
  },
);

// get single coupon
export const getCoupon = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CouponServices.getSingleCouponService(
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Coupon retrieved successfully',
      data: result,
    });
  },
);

// get my coupons
export const getMyCoupons = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CouponServices.getCouponsByUserIdService(
      req.user.id as string,
      req.query as Record<string, unknown>,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Coupons retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  },
);

// get public coupons
export const getPublicCoupons = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CouponServices.getPublicCouponsService(
      req.query as Record<string, unknown>,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Public coupons retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  },
);

// get all coupons
export const getAllCoupons = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CouponServices.getAllCouponsService(
      req.query as Record<string, unknown>,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'All coupons retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  },
);

export const CouponController = {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCoupon,
  getMyCoupons,
  getPublicCoupons,
  getAllCoupons,
};