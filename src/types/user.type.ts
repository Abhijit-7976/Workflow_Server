import { Document, Model, Types } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password?: string;
  workflow: Types.ObjectId[];
}

export interface IUserMethods {
  checkPassword: (password: string) => Promise<boolean>;
}

export interface UserDocument extends IUser, IUserMethods, Document<any, {}, IUser> {
  _id: Types.ObjectId;
  _doc: IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserModel extends Model<UserDocument> {}
