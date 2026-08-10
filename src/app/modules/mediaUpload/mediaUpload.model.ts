import { Schema, model } from 'mongoose';
import { IMediaUpload, MediaUploadModel } from './mediaUpload.interface';

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