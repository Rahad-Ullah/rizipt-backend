import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import deleteS3File from '../../../shared/deleteS3File';
import { ICoupon } from './coupon.interface';
import { Coupon } from './coupon.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { MediaUploadServices } from '../mediaUpload/mediaUpload.service';

// -------------- create coupon service ------------------
export const createCouponService = async (payload: ICoupon): Promise<ICoupon> => {
  // check if coupon code already exists
  const existingCoupon = await Coupon.exists({
    code: payload.code,
    createdBy: payload.createdBy,
  });
  if (existingCoupon) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'Coupon code already exists. Please choose a different code.',
    );
  }

  // create new coupon
  const result = await Coupon.create(payload);

  // mark new file as used
  if (payload.image) {
    await MediaUploadServices.markMediaAsUsed(payload.image);
  }

  return result;
};

// ------------- update coupon service ----------------
export const updateCouponService = async (
  couponId: string,
  payload: Partial<ICoupon>,
): Promise<ICoupon | null> => {
  // check if coupon exists
  const existingCoupon = await Coupon.findById(couponId);
  if (!existingCoupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found');
  }

  // check if coupon code is being updated and if it already exists
  if (payload.code && payload.code !== existingCoupon.code) {
    const codeExists = await Coupon.exists({
      code: payload.code,
      _id: { $ne: couponId },
      createdBy: existingCoupon.createdBy,
    });
    if (codeExists) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Coupon code already exists. Please choose a different code.',
      );
    }
  }

  // update coupon
  const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, payload, {
    new: true,
  });

  // delete old file and mark new file
  if (payload.image) {
    await MediaUploadServices.markMediaAsUsed(payload.image);
    if (existingCoupon.image && existingCoupon.image !== payload.image) {
      await deleteS3File(existingCoupon.image);
    }
  }

  return updatedCoupon;
};

// ------------ delete coupon service ----------------
export const deleteCouponService = async (
  couponId: string,
): Promise<ICoupon | null> => {
  const deletedCoupon = await Coupon.findByIdAndUpdate(
    couponId,
    { isDeleted: true },
    { new: true },
  );

  if (!deletedCoupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found');
  }

  return deletedCoupon;
};

// ---------------- get single coupon service ----------------
export const getSingleCouponService = async (
  couponId: string,
): Promise<ICoupon | null> => {
  const coupon = await Coupon.findById(couponId).populate({
    path: 'createdBy',
    select: 'firstName lastName email role image roleRef',
    populate: {
      path: 'roleRef',
    },
  });

  if (!coupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found');
  }

  return coupon;
};

// ---------------- get by user id service ----------------
export const getCouponsByUserIdService = async (
  userId: string,
  query: Record<string, unknown>,
): Promise<{ data: ICoupon[]; pagination: any }> => {
  const couponQuery = new QueryBuilder(
    Coupon.find({ createdBy: userId, isDeleted: false }),
    query,
  )
    .search(['title', 'description', 'code'])
    .filter([])
    .paginate()
    .sort()
    .fields();

  const [data, pagination] = await Promise.all([
    couponQuery.modelQuery,
    couponQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

// ----------------- get all coupons service ----------------
export const getAllCouponsService = async (
  query: Record<string, unknown>,
): Promise<{ data: ICoupon[]; pagination: any }> => {
  const couponQuery = new QueryBuilder(Coupon.find({ isDeleted: false }), query)
    .search(['title', 'description', 'code'])
    .filter([])
    .paginate()
    .sort()
    .fields();

  const [data, pagination] = await Promise.all([
    couponQuery.modelQuery.populate({
      path: 'createdBy',
      populate: {
        path: 'roleRef',
        select:
          'businessName businessType logo tradeLicense address kycStatus isKycVerified',
      },
    }),
    couponQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const CouponServices = {
  createCouponService,
  updateCouponService,
  deleteCouponService,
  getSingleCouponService,
  getCouponsByUserIdService,
  getAllCouponsService,
};
