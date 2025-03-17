import crypto from 'crypto';
import config from '../config';

// Encryption settings
const algorithm = 'aes-256-cbc';
const key = Buffer.from(config.encryptionKey, 'utf8').slice(0, 32);
const iv = Buffer.from(config.encryptionIv, 'utf8').slice(0, 16);

/**
 * Encrypts sensitive data
 */
export const encrypt = (text: string): string => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

/**
 * Decrypts encrypted data
 */
export const decrypt = (encryptedText: string): string => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Generates a secure random string
 */
export const generateRandomString = (length: number): string => {
  return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex')
    .slice(0, length);
};