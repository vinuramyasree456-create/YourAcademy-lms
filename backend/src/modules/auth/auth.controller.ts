import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from './auth.validator';
import * as authService from './auth.service';
import { refreshCookieOptions } from '../../config/security';
import { StatusCodes } from 'http-status-codes';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.registerUser(validatedData);

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    res.status(StatusCodes.CREATED).json({ user, accessToken });
  } catch (error: any) {
    if (error.message === 'User already exists') {
      res.status(StatusCodes.CONFLICT).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.loginUser(validatedData);

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    res.status(StatusCodes.OK).json({ user, accessToken });
  } catch (error: any) {
    if (error.message === 'Invalid email or password') {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Refresh token missing' });
      return;
    }

    const { accessToken } = await authService.refreshAuthToken(refreshToken);
    res.status(StatusCodes.OK).json({ accessToken });
  } catch (error: any) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }

    res.clearCookie('refreshToken', { ...refreshCookieOptions, maxAge: 0 });
    res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
