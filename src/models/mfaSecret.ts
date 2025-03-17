import mongoose, { Document, Schema } from 'mongoose';

export interface IMFASecret extends Document {
  name: string;
  secret: string;  // Encrypted TOTP secret
  userId: string;  // Reference to the user/owner
  algorithm: string; // TOTP algorithm (default: SHA1)
  digits: number;   // Number of digits (default: 6)
  period: number;   // Period in seconds (default: 30)
  createdAt: Date;
  updatedAt: Date;
}

const MFASecretSchema = new Schema<IMFASecret>(
  {
    name: { type: String, required: true },
    secret: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    algorithm: { type: String, default: 'SHA1' },
    digits: { type: Number, default: 6 },
    period: { type: Number, default: 30 },
  },
  { timestamps: true }
);

// Ensure we have an index for faster lookups
MFASecretSchema.index({ userId: 1, name: 1 }, { unique: true });

export const MFASecret = mongoose.model<IMFASecret>('MFASecret', MFASecretSchema);