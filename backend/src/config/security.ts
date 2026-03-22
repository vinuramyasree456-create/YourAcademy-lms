import { CookieOptions } from 'express';
import { env } from './env';

export const corsOptions = {
  origin: env.CORS_ORIGIN,
  credentials: true,
};

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  domain: env.COOKIE_DOMAIN,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
