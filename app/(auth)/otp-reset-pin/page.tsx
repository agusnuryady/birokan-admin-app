'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Anchor, Group, Paper, PinInput, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { hashPin } from '@/lib/crypto';
import { createPin, requestOtp, verifyOtp, verifyPin } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import maskEmail from '@/utils/maskEmail';
import { loginAction } from '../login/actions';
import classes from './notification.module.css';

export default function OtpResetPinPage() {
  const router = useRouter();
  const { user, setLoading } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60); // countdown in seconds

  // Mock API call to request OTP
  const handleRequestOtp = async () => {
    try {
      setLoading(true);
      // TODO: call your backend API here
      // await requestOtp();
      await notifications.show({
        title: 'Success',
        message: 'Kode OTP berhasil terkirim 🎉',
        color: 'green',
      });
    } catch (err) {
      console.error('Failed to send OTP:', err);
    } finally {
      setLoading(false);
      setTimer(60); // reset countdown after sending
    }
  };

  const handleInputOTP = async (otp: string) => {
    try {
      setLoading(true);
      // TODO: call your backend API here
      const res = await verifyOtp(otp);
      console.log('res', res);
      setLoading(false);
      // router.navigate('/');
    } catch (err: any) {
      console.error('Failed to send OTP:', err);
      setLoading(false);
      if (err?.response?.data?.message === 'Invalid OTP') {
        notifications.show({
          title: 'Error',
          message: 'OTP yang anda masukan salah',
          color: 'red',
          autoClose: 3000, // auto dismiss dalam 3 detik
          classNames: classes,
        });
      }
    }
  };

  // Auto send OTP when first enter the screen
  useEffect(() => {
    handleRequestOtp();
  }, []);

  // Countdown effect
  useEffect(() => {
    if (timer <= 0) {
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        backgroundImage: 'url("/auth-bg.jpg")', // 🔥 your background
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper shadow="md" radius="md" p="xl" withBorder style={{ minWidth: 360 }}>
        <Stack align="center" gap="lg">
          <Stack align="center" gap="xs">
            {/* Title */}
            <Text fw={600} size="lg">
              Verifikasi OTP
            </Text>
            <Stack align="center" gap="xs">
              <Text size="sm">Masukan kode OTP yang dikirim melalui email</Text>
              <Text fw={600} size="sm">
                {user?.email ? maskEmail(user?.email) : ''}
              </Text>
            </Stack>
          </Stack>

          {/* PIN input */}
          <PinInput
            value={otp}
            size="lg"
            length={6}
            oneTimeCode
            mt="lg"
            onChange={setOtp}
            onComplete={handleInputOTP}
          />

          {/* Actions */}
          <Stack align="center" w="100%" mt="lg">
            <Group gap="xs">
              {timer > 0 ? (
                <div className="flex items-center gap-1">
                  Kirim ulang OTP dalam
                  <Text size="sm" c="red">
                    {timer}
                  </Text>
                  detik
                </div>
              ) : (
                <Anchor size="sm" href="#" onClick={handleRequestOtp}>
                  Kirim ulang OTP
                </Anchor>
              )}
            </Group>
          </Stack>
        </Stack>
      </Paper>
    </div>
  );
}
