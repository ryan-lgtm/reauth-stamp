import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IAPIToken extends Document {
  token: string;
  name: string;
  userId: string;
  lastUsed?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  master: boolean;
}

const APITokenSchema = new Schema<IAPIToken>(
  {
    token: { type: String, required: true, unique: true, default: () => uuidv4() },
    name: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    lastUsed: { type: Date },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    master: { type: Boolean, default: false },
  },
  { timestamps: true }
);

APITokenSchema.index({ token: 1 });

export const APIToken = mongoose.model<IAPIToken>('APIToken', APITokenSchema);