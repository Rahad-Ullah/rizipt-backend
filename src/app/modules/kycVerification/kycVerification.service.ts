import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IKycVerification } from './kycVerification.interface';
import { KycVerification } from './kycVerification.model';
import deleteS3File from '../../../shared/deleteS3File';
import QueryBuilder from '../../builder/QueryBuilder';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { NotificationType } from '../notification/notification.constant';
import { User } from '../user/user.model';
import { UserRole } from '../user/user.constant';
import { KycStatus } from './kycVerification.constants';
import { CareProvider } from '../careProvider/careProvider.model';
import mongoose from 'mongoose';

// --------------- create kyc verification service ----------------
const createKycVerification = async (payload: IKycVerification): Promise<IKycVerification> => {
  const existingKyc = await KycVerification.findOne({
    user: payload.user,
    type: payload.type
  });

  const result = await KycVerification.findOneAndUpdate(
    {
      user: payload.user,
      type: payload.type
    },
    {
      $set: payload
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  )

  // delete old documents
  if (existingKyc && existingKyc?.documents.length > 0) {
    const oldDocuments = existingKyc.documents;
    const newDocuments = result.documents;
    const documentsToDelete = oldDocuments.filter((document) => !newDocuments.includes(document));
    for (const document of documentsToDelete) {
      await deleteS3File(document)
    }
  }

  // send notification to admins
  const admins = await User.find({ role: { $in: [UserRole.SuperAdmin, UserRole.Admin] } }).select('_id').lean();

  admins.forEach(admin => {
    sendNotifications({
      type: NotificationType.KycRequest,
      receiver: admin._id,
      title: 'New Verification Request',
      message: `New kyc verification request is waiting for your approval.`,
      referenceId: result._id.toString(),
    }).catch(err => console.error(err));
  });

  return result;
};

// --------------- update kyc verification service ----------------
const updateKycVerificationStatus = async (
  id: string,
  payload: Partial<IKycVerification>
): Promise<IKycVerification> => {
  const session = await mongoose.startSession();
  let updatedKyc: IKycVerification | null = null;

  try {
    session.startTransaction();

    // 1. Update the KYC record inside the transaction
    updatedKyc = await KycVerification.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      session,
    });

    if (!updatedKyc) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Kyc verification not found');
    }

    // 2. Check total approved items for this user within the transaction
    if (payload.status === KycStatus.Approved) {
      const verifiedItems = await KycVerification.countDocuments({
        user: updatedKyc.user,
        status: KycStatus.Approved,
      }).session(session);

      // If user has 3 or more approved verifications, mark care provider as verified
      if (verifiedItems >= 3) {
        await CareProvider.findOneAndUpdate(
          { user: updatedKyc.user },
          { isKycVerified: true },
          { session }
        );
      }
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  // 3. Send background notification OUTSIDE the transaction
  if (updatedKyc) {
    sendNotifications({
      type: NotificationType.KycReview,
      receiver: updatedKyc.user,
      title: 'Verification Request Updated',
      message: `Your ${updatedKyc.type} verification request is ${updatedKyc.status}.`,
      referenceId: updatedKyc._id.toString(),
    }).catch((err) => console.error('Background notification error:', err));
  }

  return updatedKyc;
};

// --------------- get kyc verification by user service ----------------
const getKycVerificationByUser = async (userId: string): Promise<IKycVerification[]> => {
  const result = await KycVerification.find({ user: userId });
  return result;
};

// --------------- get all kyc verification service ----------------
const getAllKycVerification = async (query: Record<string, unknown>) => {
  const kycQuery = new QueryBuilder(KycVerification.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields()

  const [data, pagination] = await Promise.all([
    kycQuery.modelQuery.populate('user').lean(),
    kycQuery.getPaginationInfo(),
  ])

  return { data, pagination };
};

export const KycVerificationServices = {
  createKycVerification,
  getKycVerificationByUser,
  updateKycVerificationStatus,
  getAllKycVerification
};