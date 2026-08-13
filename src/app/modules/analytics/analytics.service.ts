import { Types } from 'mongoose';
import { Customer } from '../customer/customer.model';
import { Receipt } from '../receipt/receipt.model';
import { UserRole } from '../user/user.constant';
import { User } from '../user/user.model';

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
  const [totalUsers, totalMerchants] = await Promise.all([
    User.countDocuments({ role: UserRole.User }),
    User.countDocuments({ role: UserRole.Merchant }),
  ]);

  return {
    totalUsers,
    totalMerchants,
  };
};

// ---------------- get monthly user growth ----------------
const getMonthlyUserGrowth = async (query: Record<string, unknown>) => {
  const year = (query?.year as string) || new Date().getFullYear().toString();

  const result = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${parseInt(year as string) + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
  ]);

  // format the result
  const formattedResult = result.map(item => ({
    year: item._id.year,
    month: item._id.month,
    count: item.count,
  }));

  return formattedResult;
};

export const AnalyticsServices = {
  getMerchantOverview,
  getAdminOverview,
  getMonthlyUserGrowth,
};
