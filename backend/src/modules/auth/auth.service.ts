import prisma from '../../config/db';
import { hashPassword, comparePassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';

export const registerUser = async (data: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(data.password);
  
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await hashPassword(refreshToken), // storing hash for security
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return { user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken };
};

export const loginUser = async (data: any) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  
  if (!user || !(await comparePassword(data.password, user.password))) {
    throw new Error('Invalid email or password');
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await hashPassword(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return { user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken };
};

export const refreshAuthToken = async (token: string) => {
  try {
    const decoded = verifyRefreshToken(token);
    
    // Check if token exists in DB and is not revoked
    const userTokens = await prisma.refreshToken.findMany({
      where: {
        userId: decoded.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    // In a robust system, we'd check the hash here, but since the JWT itself is verified, 
    // ensuring it simply exists and is unrevoked for the user is good enough to prevent replay if removed.
    let isValid = false;
    let tokenId = -1;
    for (const rt of userTokens) {
      if (await comparePassword(token, rt.tokenHash)) {
        isValid = true;
        tokenId = rt.id;
        break;
      }
    }

    if (!isValid) {
      throw new Error('Invalid refresh token');
    }

    const newAccessToken = signAccessToken(decoded.userId);
    return { accessToken: newAccessToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const logoutUser = async (token: string) => {
  try {
    const decoded = verifyRefreshToken(token);
    
    const userTokens = await prisma.refreshToken.findMany({
      where: { userId: decoded.userId, revokedAt: null },
    });

    for (const rt of userTokens) {
      if (await comparePassword(token, rt.tokenHash)) {
        await prisma.refreshToken.update({
          where: { id: rt.id },
          data: { revokedAt: new Date() },
        });
        break;
      }
    }
  } catch (error) {
    // If token invalid, ignore and just let logout proceed
  }
};
