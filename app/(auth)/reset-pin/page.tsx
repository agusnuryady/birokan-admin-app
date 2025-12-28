'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Anchor, Avatar, Group, Paper, PinInput, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { hashPin } from '@/lib/crypto';
import { createPin, resetPin } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useGlobalLoading } from '@/store/useGlobalLoading';
import maskEmail from '@/utils/maskEmail';
import { loginAction, logoutAction } from '../login/actions';
import classes from './notification.module.css';

export default function ResetPinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPinType = searchParams.get('type') || 'new'; // new | forgot

  const { showLoading, hideLoading } = useGlobalLoading();
  const { user, setAccessToken, setRefreshToken, setHasPin, setIsVerified, setUser } =
    useAuthStore();
  const [pin, setPin] = useState('');
  const [newPin, setnewPin] = useState('');

  const handleInputPIN = async (pin: string) => {
    if (newPin !== pin) {
      setPin('');
      setnewPin('');
      notifications.show({
        title: 'Error',
        message: 'PIN not matched, please try again!',
        color: 'red',
        autoClose: 3000, // auto dismiss dalam 3 detik
        classNames: classes,
      });
    } else {
      try {
        showLoading();
        const pinHash = await hashPin(pin);
        const res = resetPinType === 'new' ? await createPin(pinHash) : await resetPin(pinHash);
        if (!!res.accessToken && !!res.refreshToken) {
          await loginAction(res.accessToken, true, true);
          setAccessToken(res.accessToken);
          setRefreshToken(res.refreshToken);
          setHasPin(true);
          setIsVerified(true);

          notifications.show({
            title: 'Success',
            message: 'PIN correct 🎉',
            color: 'green',
          });
          router.push('/overview');
          // window.location.href = '/overview'; // redirect after success
        }
      } catch (error: any) {
        // console.log('error', error);
        setPin('');
        setnewPin('');
        if (error?.response?.data?.message) {
          notifications.show({
            title: 'Error',
            message: error?.response?.data?.message || 'Something went wrong',
            color: 'red',
            autoClose: 3000, // auto dismiss dalam 3 detik
            classNames: classes,
          });
        }
      } finally {
        hideLoading();
      }
    }
  };

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
          {/* Title */}
          <Text fw={600} size="lg">
            {newPin.length >= 6 ? 'Konfirmasi PIN Baru' : 'Buat PIN Baru'}
          </Text>

          {/* Email chip */}
          <Group
            gap="xs"
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '6px 12px',
              boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <Avatar radius="xl" size="sm">
              👤
            </Avatar>
            <Text size="sm" c="dimmed">
              {user?.email ? maskEmail(user?.email) : ''}
            </Text>
          </Group>

          {/* PIN input */}
          {newPin.length >= 6 ? (
            <PinInput
              value={pin}
              size="lg"
              length={6}
              mask
              oneTimeCode
              inputType="number"
              mt="lg"
              onChange={setPin}
              onComplete={handleInputPIN}
            />
          ) : (
            <PinInput
              size="lg"
              length={6}
              mask
              autoFocus
              oneTimeCode
              inputType="number"
              mt="lg"
              onComplete={setnewPin}
            />
          )}

          {/* Actions */}
          <Group justify="space-between" w="100%" mt="lg">
            <Anchor
              size="sm"
              c="dimmed"
              href="#"
              onClick={() => {
                setnewPin('');
                setPin('');
              }}
            >
              Reset
            </Anchor>
            <Anchor
              size="sm"
              c="dimmed"
              href="#"
              onClick={async () => {
                setAccessToken(null);
                setRefreshToken(null);
                setHasPin(false);
                setIsVerified(false);
                setUser(null);
                await logoutAction().finally(() => router.push('/login'));
              }}
            >
              Ubah Akun?
            </Anchor>
          </Group>
        </Stack>
      </Paper>
    </div>
  );
}
