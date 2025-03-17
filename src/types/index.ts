// User type definition
export interface User {
    id: string;
    name: string;
    email: string;
  }
  
  // API response type
  export interface APIResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: any[];
  }
  
  // MFA related types
  export interface MFAEntry {
    id: string;
    name: string;
    code?: string;
    validUntil?: string;
    createdAt: Date;
    updatedAt?: Date;
  }
  
  // Token related types
  export interface TokenEntry {
    id: string;
    name: string;
    token?: string;
    lastUsed?: Date;
    expiresAt?: Date;
    createdAt: Date;
    isActive: boolean;
  }