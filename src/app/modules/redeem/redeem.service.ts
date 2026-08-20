import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IRedeem } from './redeem.interface';
import { Redeem } from './redeem.model';
import { Coupon } from '../coupon/coupon.model';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';

// -------------- create redeem --------------
const createRedeem = async (payload: IRedeem): Promise<IRedeem> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check if coupon is valid
    const existingCoupon = await Coupon.exists({ _id: payload.coupon });
    if (!existingCoupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found');
    }

    // 2. Create redeem record (must pass session in array format for Mongoose)
    const result = await Redeem.create([payload], { session });

    // 3. Increment coupon count within session
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      payload.coupon,
      { $inc: { redeemCount: 1 } },
      { session, new: true },
    );

    if (!updatedCoupon) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to redeem');
    }

    // Commit changes
    await session.commitTransaction();
    return result[0];
  } catch (error) {
    // Rollback changes on any failure
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// --------------- get redeem by user id ---------------
const getRedeemByUserId = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const filter = { user: userId } as any;

  // pre-filter coupon
  if (query.searchTerm) {
    const searchTerm = (query.searchTerm as string).trim();
    const coupons = await Coupon.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { code: { $regex: searchTerm, $options: 'i' } },
      ],
    });
    filter.coupon = coupons.map(coupon => coupon._id);
  }

  const redeemQuery = new QueryBuilder(Redeem.find(filter), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    redeemQuery.modelQuery.populate('coupon').lean(),
    redeemQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

// -------------- get all redeems --------------
const getAllRedeems = async (query: Record<string, unknown>) => {
  const filter = {} as any;

  // pre-filter coupon
  if (query.searchTerm) {
    const searchTerm = (query.searchTerm as string).trim();
    const coupons = await Coupon.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { code: { $regex: searchTerm, $options: 'i' } },
      ],
    });
    filter.coupon = coupons.map(coupon => coupon._id);
  }

  const redeemQuery = new QueryBuilder(Redeem.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    redeemQuery.modelQuery
      .populate({
        path: 'coupon',
        populate: {
          path: 'createdBy',
          select: 'firstName lastName email role image roleRef',
          populate: {
            path: 'roleRef',
            select: 'businessName businessType logo',
          },
        },
      })
      .populate('user', 'firstName lastName email role image')
      .lean(),
    redeemQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const RedeemServices = {
  createRedeem,
  getRedeemByUserId,
  getAllRedeems,
};
