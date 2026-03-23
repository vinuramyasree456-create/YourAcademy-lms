import { CookieOptions } from 'express';
import { env } from './env';

export const corsOptions = {
  origin: true, // Reflects the incoming origin to allow Vercel dynamically
  credentials: true,
};

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true, // Required for SameSite=none
  sameSite: 'none', // Allows cross-site cookies between Vercel and Render
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
