'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { login } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useGlobalLoading } from '@/store/useGlobalLoading';
import { loginAction } from './actions';
import classes from './notification.module.css';

export default function LoginPage() {
  const { showLoading, hideLoading } = useGlobalLoading();
  const { setAccessToken, setRefreshToken, setHasPin, setUser } = useAuthStore();
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      showLoading();
      const idToken = credentialResponse.credential;
      if (!idToken) {
        throw new Error('Google credential invalid');
      }

      // 🔑 Send token to backend for validation
      const res = await login('google', idToken);

      // console.log('res', res);
      await loginAction(res.accessToken, res.hasPin);
      setAccessToken(res.accessToken);
      setRefreshToken(res.refreshToken);
      setHasPin(res.hasPin);
      setUser(res.user);

      if (res.hasPin) {
        router.push('/pin');
      } else {
        router.push('/reset-pin?type=new');
      }

      notifications.show({
        title: 'Success',
        message: 'You have logged in successfully 🎉',
        color: 'green',
      });

      // window.location.href = '/pin'; // redirect after success
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.message || 'Something went wrong',
        color: 'red',
        autoClose: 3000, // auto dismiss dalam 3 detik
        classNames: classes,
      });
      // if (err.response) {
      //   // Backend responded with error status
      //   console.log('Error response:', err.response.data);
      //   console.log('Status:', err.response.status);
      //   console.log('Headers:', err.response.headers);
      // } else if (err.request) {
      //   // Request made but no response received
      //   console.log('No response received:', err.request);
      // } else {
      //   // Something else triggered the error
      //   console.log('Error setting up request:', err.message);
      // }
    } finally {
      hideLoading();
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        backgroundImage: 'url("/auth-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack align="center" gap="lg">
        {/* Logo */}
        <Image
          priority
          src="/logo.png" // put your logo in /public/logo.png
          alt="Birokan Logo"
          width={139}
          height={125}
          style={{ objectFit: 'contain' }}
        />

        {/* Google login button */}
        <GoogleLogin
          // useOneTap
          theme="filled_black"
          onSuccess={handleGoogleSuccess}
          onError={() => {
            // alert('Login Failed');
          }}
        />
      </Stack>
    </div>
  );
}
