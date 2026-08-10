import { Schema, model } from 'mongoose';
import { IMediaUpload, MediaUploadModel } from './mediaUpload.interface';
import deleteS3File from '../../../shared/deleteS3File';

const mediaUploadSchema = new Schema<IMediaUpload, MediaUploadModel>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const MediaUpload = model<IMediaUpload, MediaUploadModel>(
  'MediaUpload',
  mediaUploadSchema,
);

mediaUploadSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 }, // Auto-deletes document after 24h
);

mediaUploadSchema.pre('findOneAndDelete', async function (next) {
  const docToClean = await this.model.findOne(this.getQuery());
  if (docToClean?.url) {
    await deleteS3File(docToClean.url);
  }
  next();
});