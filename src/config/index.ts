import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/mfa_service',
  environment: process.env.NODE_ENV || 'development',
  encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars-long',
  encryptionIv: process.env.ENCRYPTION_IV || 'default-iv-16-ch',
};