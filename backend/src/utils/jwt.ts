import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const signAccessToken = (userId: number) => {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

export const signRefreshToken = (userId: number) => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: number };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: number };
};
