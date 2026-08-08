import { Model, Types } from 'mongoose';

export interface IMediaUpload {
  _id: Types.ObjectId;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MediaUploadModel = Model<IMediaUpload>;
