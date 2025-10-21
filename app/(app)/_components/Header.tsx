'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconBell,
  IconLayoutSidebar,
  IconLockPassword,
  IconLogout,
  IconMoon,
  IconSun,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Anchor,
  Avatar,
  Breadcrumbs,
  Burger,
  Button,
  Drawer,
  Flex,
  Group,
  Image,
  Menu,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { logoutAction } from '@/app/(auth)/login/actions';
import { useAuthStore } from '@/store/authStore';

type HeaderProps = {
  toggleLeft: () => void;
  toggleRight: () => void;
};

export default function Header({ toggleLeft, toggleRight }: HeaderProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const pathname = usePathname();
  const router = useRouter();
  const { user, setAccessToken, setRefreshToken, setHasPin, setIsVerified, setUser } =
    useAuthStore();

  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  const [mounted, setMounted] = useState(false);

  // Convert pathname into crumbs, e.g. "/directories/123" -> ["directories", "123"]
  const parts = pathname.split('/').filter(Boolean);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render nothing (or a placeholder) until mounted on client
  if (!mounted) {
    return null;
  }

  return (
    <Flex justify="space-between" align="center" px="md" style={{ height: '100%' }}>
      {/* Left Section */}
      <Group gap="sm" align="center">
        {/* 🔹 Logo */}
        <Link href="/" className="m-2">
          <Group gap="8px" className="cursor-pointer">
            <Image src="/sidebar-logo.png" alt="Birokan Logo" w={40} h={40} />
            <Text fw={700} size="lg" c="blue" visibleFrom="sm">
              Birokan
            </Text>
          </Group>
        </Link>

        {/* Sidebar toggle (desktop only) */}
        <ActionIcon variant="subtle" onClick={toggleLeft} aria-label="Toggle sidebar">
          <IconLayoutSidebar size={20} />
        </ActionIcon>

        {/* Breadcrumbs (hide on mobile) */}
        <Breadcrumbs separator=" / " visibleFrom="md">
          {parts.map((part, i) => {
            const href = `/${parts.slice(0, i + 1).join('/')}`;
            const isLast = i === parts.length - 1;
            const label = part.charAt(0).toUpperCase() + part.slice(1);

            return isLast ? (
              <Text key={i} size="sm" fw={500}>
                {label}
              </Text>
            ) : (
              <Anchor
                key={i}
                component={Link}
                href={href}
                size="sm"
                fw={400}
                c="blue"
                underline="hover"
              >
                {label}
              </Anchor>
            );
          })}
        </Breadcrumbs>
      </Group>

      {/* Right Section (desktop) */}
      <Group gap="sm" visibleFrom="sm">
        {/* Theme toggle */}
        <ActionIcon variant="subtle" onClick={toggleColorScheme} aria-label="Toggle color scheme">
          {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </ActionIcon>

        {/* Notifications */}
        <ActionIcon variant="subtle" onClick={toggleRight} aria-label="Toggle notifications">
          <IconBell size={20} />
        </ActionIcon>

        {/* User Profile */}
        <Menu shadow="md" width={180}>
          <Menu.Target>
            <Button variant="subtle">
              <Group>
                <Avatar radius="xl" size={28} color="blue" />
                <Text size="sm" fw={500}>
                  {user?.fullName || user?.email}
                </Text>
              </Group>
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item component={Link} href="/otp-reset-pin">
              <Group>
                <IconLockPassword size={20} />
                <Text>Change PIN</Text>
              </Group>
            </Menu.Item>
            <Menu.Item
              color="red"
              onClick={async () => {
                setAccessToken(null);
                setRefreshToken(null);
                setHasPin(false);
                setIsVerified(false);
                setUser(null);
                await logoutAction().finally(() => router.push('/login'));
              }}
            >
              <Group>
                <IconLogout size={20} />
                <Text>Logout</Text>
              </Group>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* Mobile Burger */}
      <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" aria-label="Open menu" />

      {/* Mobile Drawer */}
      <Drawer opened={drawerOpened} onClose={closeDrawer} padding="md" size="xs" title="Menu">
        <Group gap="md" dir="column">
          <ActionIcon variant="subtle" onClick={toggleColorScheme}>
            {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </ActionIcon>
          <ActionIcon variant="subtle" onClick={toggleRight}>
            <IconBell size={20} />
          </ActionIcon>
          <Button
            fullWidth
            variant="light"
            onClick={() => {
              closeDrawer();
              router.push('/reset-pin');
            }}
          >
            Change PIN
          </Button>
          <Button
            fullWidth
            color="red"
            onClick={async () => {
              setAccessToken(null);
              setRefreshToken(null);
              setHasPin(false);
              setIsVerified(false);
              setUser(null);
              await logoutAction().finally(() => router.push('/login'));
            }}
          >
            Logout
          </Button>
        </Group>
      </Drawer>
    </Flex>
  );
}
