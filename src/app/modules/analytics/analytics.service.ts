import { Types } from 'mongoose';
import { Customer } from '../customer/customer.model';
import { Receipt } from '../receipt/receipt.model';
import { UserRole } from '../user/user.constant';
import { User } from '../user/user.model';
import { Coupon } from '../coupon/coupon.model';

// ----------------- get user overview -----------------
const getUserOverview = async (userId: string) => {
  const [totalReceipts, totalAmount] = await Promise.all([
    Receipt.countDocuments({ createdBy: userId, isDeleted: false }),
    Receipt.aggregate([
      {
        $match: {
          createdBy: new Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]),
  ]);

  return {
    totalReceipts,
    totalAmount: totalAmount[0]?.total ?? 0,
  };
};

// ----------------- get merchant overview -----------------
const getMerchantOverview = async (userId: string) => {
  const [totalReceiptsSent, totalAmountResult, totalCustomers] =
    await Promise.all([
      Receipt.countDocuments({ createdBy: userId, isDeleted: false }),

      Receipt.aggregate([
        {
          $match: {
            createdBy: new Types.ObjectId(userId),
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ]),

      Customer.countDocuments({ merchant: userId }),
    ]);

  return {
    totalReceiptsSent,
    totalAmountSold: totalAmountResult[0]?.total ?? 0,
    totalCustomers,
  };
};

// ---------------- admin dashboard overview -----------------
const getAdminOverview = async () => {
  const [
    totalUsers,
    totalMerchants,
    totalReceipts,
    totalCoupons,
    activeCoupons,
  ] = await Promise.all([
    User.countDocuments({ role: UserRole.User, isDeleted: false }),
    User.countDocuments({ role: UserRole.Merchant, isDeleted: false }),
    Receipt.countDocuments({ isDeleted: false }),
    Coupon.countDocuments({ isDeleted: false }),
    Coupon.countDocuments({ isDeleted: false, expiresAt: { $gt: new Date() } }),
  ]);

  return {
    totalUsers,
    totalMerchants,
    totalReceipts,
    totalCoupons,
    activeCoupons,
  };
};

// ---------------- get monthly user growth ----------------
const getUserGrowth = async (query: Record<string, unknown>) => {
  const targetYear =
    parseInt(query?.year as string, 10) || new Date().getFullYear();

  const startDate = new Date(`${targetYear}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${targetYear + 1}-01-01T00:00:00.000Z`);

  const aggregateResult = await User.aggregate<{ _id: number; count: number }>([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' }, // Group strictly by month (1-12)
        count: { $sum: 1 },
      },
    },
  ]);

  // Create a fast lookup map: { monthNumber: count }
  const countsByMonth = aggregateResult.reduce<Record<number, number>>(
    (acc, item) => {
      acc[item._id] = item.count;
      return acc;
    },
    {},
  );

  // Month names for clean reporting
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Fill in all 12 months (guaranteeing complete data)
  const formattedResult = Array.from({ length: 12 }, (_, index) => {
    const monthNumber = index + 1; // 1 to 12
    return {
      year: targetYear,
      month: monthNumber,
      monthName: monthNames[index],
      count: countsByMonth[monthNumber] || 0,
    };
  });

  return formattedResult;
};

export const AnalyticsServices = {
  getUserOverview,
  getMerchantOverview,
  getAdminOverview,
  getUserGrowth,
};
