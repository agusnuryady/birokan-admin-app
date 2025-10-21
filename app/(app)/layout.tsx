'use client';

import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Header from './_components/Header';
import RightSidebar from './_components/RightSidebar';
import Sidebar from './_components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [leftOpened, { toggle: toggleLeft }] = useDisclosure(true);
  const [rightOpened, { toggle: toggleRight }] = useDisclosure(false);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 220,
        breakpoint: 'sm',
        collapsed: { mobile: !leftOpened, desktop: !leftOpened },
      }}
      aside={{
        width: 300,
        breakpoint: 'md',
        collapsed: { mobile: !rightOpened, desktop: !rightOpened },
      }}
      padding="md"
      // layout="alt"
    >
      <AppShell.Header>
        <Header toggleLeft={toggleLeft} toggleRight={toggleRight} />
      </AppShell.Header>

      {/* Left Sidebar */}
      <AppShell.Navbar>
        <Sidebar />
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>{children}</AppShell.Main>

      {/* Right Sidebar */}
      <AppShell.Aside>
        <RightSidebar />
      </AppShell.Aside>
    </AppShell>
  );
}
