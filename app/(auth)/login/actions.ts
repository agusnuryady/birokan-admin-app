'use server';

import { cookies } from 'next/headers';

export async function loginAction(
  accessToken: string,
  hasPin: boolean = false,
  isVerified: boolean = false
) {
  if (accessToken) {
    const cookieStore = await cookies(); // ✅ returns a RequestCookies object

    await cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    if (hasPin) {
      await cookieStore.set('hasPin', `${hasPin}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
    }

    if (isVerified) {
      await cookieStore.set('isVerified', `${isVerified}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
    }

    return { success: true };
  }
  return { success: false, error: 'Invalid credentials' };
}

export async function logoutAction() {
  const cookieStore = await cookies(); // ✅ same here
  await cookieStore.delete('accessToken');
  await cookieStore.delete('refreshToken');
  await cookieStore.delete('hasPin');
  await cookieStore.delete('isVerified');
  return { success: true };
}
