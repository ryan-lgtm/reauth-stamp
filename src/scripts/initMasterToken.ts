import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { APIToken } from '../models/apiToken';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mfa_service';

async function createMasterToken() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Generate a new token
    const tokenValue = uuidv4();
    
    // Create a new master token
    const masterToken = new APIToken({
      name: 'Master Token',
      userId: 'reauth-stamp-admin', // You may want to customize this
      token: tokenValue,
      isActive: true,
      master: true,
    });
    
    await masterToken.save();
    
    console.log('Master token created successfully:');
    console.log('=============================');
    console.log(`Token: ${tokenValue}`);
    console.log('=============================');
    console.log('IMPORTANT: Save this token in a secure place. It will not be shown again.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating master token:', error);
    process.exit(1);
  }
}

createMasterToken();