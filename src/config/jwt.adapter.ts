import { JwtPayload } from '@modules/auth/interfaces/jwt-payload';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { envs } from './envs';

const JWT_SECRET = envs.JWT_SECRET;

export class JWTAdapter {
  static async generateToken(payload: string | Buffer | object, options?: SignOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const signOptions: SignOptions = {
        expiresIn: options?.expiresIn || '1h',
      };

      jwt.sign(payload, JWT_SECRET, signOptions, (err, token) => {
        if (err || !token) return reject(new Error('Failed to generate token'));
        resolve(token);
      });
    });
  }

  static async validateToken<T extends JwtPayload>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      try {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
          if (err) return resolve(null);
          resolve(decoded as T);
        });
      } catch {
        resolve(null);
      }
    });
  }

  static async generateRefreshToken(payload: string | Buffer | object): Promise<string> {
    return JWTAdapter.generateToken(payload, { expiresIn: '7d' });
  }
}
