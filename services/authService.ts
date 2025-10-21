import api from '@/lib/axios';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email?: string;
    fullName?: string;
  };
  hasPin: boolean;
}

// Example login
export async function login(provider: 'google' | 'apple', idToken: string) {
  const { data } = await api.post<AuthResponse>('/v1/auth/oauth', {
    provider,
    idToken,
    isAdmin: true,
  });

  //   // Simpan token di localStorage
  //   if (typeof window !== 'undefined') {
  //     localStorage.setItem('token', data.accessToken);
  //   }

  return data;
}

export async function logout() {
  //   const cookieStore = await cookies();
  //   cookieStore.delete('token');
  //   cookieStore.delete('pinVerified');
}

export async function verifyPin(pin: string) {
  const { data } = await api.post<AuthResponse>('/v1/auth/pin/verify', { pin });
  //   const cookieStore = await cookies();

  //   if (data.success) {
  //     cookieStore.set('pinVerified', 'true', {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === 'production',
  //       path: '/',
  //     });
  //   }

  return data;
}

export async function createPin(pin: string) {
  const { data } = await api.post<AuthResponse>('/v1/auth/pin/create', {
    pin,
  });

  // Set JWT globally for subsequent API requests
  // setHedersAuth(data.accessToken);
  return data;
}

export async function resetPin(pin: string) {
  const { data } = await api.post('/v1/auth/pin/reset', {
    pin,
  });

  // Set JWT globally for subsequent API requests
  // setHedersAuth(data.accessToken);
  return data;
}

export async function requestOtp() {
  const { data } = await api.get('/v1/auth/otp/request');

  // Set JWT globally for subsequent API requests
  // setHedersAuth(data.accessToken);
  return data;
}

export async function verifyOtp(otp: string) {
  const { data } = await api.post('/v1/auth/otp/verify', {
    otp,
  });

  // Set JWT globally for subsequent API requests
  // setHedersAuth(data.accessToken);
  return data;
}
