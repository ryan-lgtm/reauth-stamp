import { authenticator } from 'otplib';
import { IMFASecret } from '../models/mfaSecret';

export class TOTPService {
  /**
   * Generate a TOTP code based on the provided secret
   */
  static generateTOTP(mfaSecret: IMFASecret): string {
    authenticator.options = { 
      digits: mfaSecret.digits,
      step: mfaSecret.period,
      algorithm: mfaSecret.algorithm.toLowerCase() as any
    };
    
    return authenticator.generate(mfaSecret.secret);
  }
  
  /**
   * Verify if a provided token is valid for the given secret
   */
  static verifyTOTP(token: string, mfaSecret: IMFASecret): boolean {
    authenticator.options = { 
      digits: mfaSecret.digits,
      step: mfaSecret.period,
      algorithm: mfaSecret.algorithm.toLowerCase() as any
    };
    
    return authenticator.verify({ token, secret: mfaSecret.secret });
  }
  
  /**
   * Generate a new TOTP secret
   */
  static generateSecret(): string {
    return authenticator.generateSecret();
  }
}