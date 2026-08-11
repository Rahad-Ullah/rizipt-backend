import { Model, Types } from 'mongoose';

export interface IFolder {
  _id: Types.ObjectId;
  name: string;
  parent?: Types.ObjectId | IFolder | null;
  ancestors: Types.ObjectId[];
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type FolderModel = Model<IFolder>;
