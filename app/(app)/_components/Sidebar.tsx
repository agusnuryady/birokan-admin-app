'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconBuildings,
  IconChartPie,
  IconFileText,
  IconFolder,
  IconInbox,
  IconNews,
  IconUsers,
} from '@tabler/icons-react';
import { NavLink, rem, ScrollArea, Stack } from '@mantine/core';

const navItems = [
  { label: 'Overview', href: '/overview', icon: IconChartPie },
  { label: 'Orders', href: '/orders', icon: IconInbox },
  { label: 'Directories', href: '/directories', icon: IconFolder },
  { label: 'Documents', href: '/documents', icon: IconFileText },
  { label: 'Places', href: '/places', icon: IconBuildings },
  { label: 'News & Articles', href: '/news', icon: IconNews },
  { label: 'Accounts', href: '/accounts', icon: IconUsers },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 🔹 Nav Items */}
      <ScrollArea h="100%">
        <Stack p="md" gap="xs">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              component={Link}
              label={item.label}
              href={item.href}
              leftSection={<item.icon size={18} stroke={1.5} />}
              style={{
                borderRadius: rem(8),
                fontWeight: 500,
              }}
              variant="light"
              active={pathname.includes(item.href)} // 👉 replace with router check
            />
          ))}
        </Stack>
      </ScrollArea>
    </div>
  );
}
