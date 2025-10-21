'use client';

import { Loader, Overlay } from '@mantine/core';
import { useGlobalLoading } from '@/store/useGlobalLoading';

export default function GlobalLoadingOverlay() {
  const { visible } = useGlobalLoading();

  if (!visible) {
    return null;
  }

  return (
    <Overlay fixed blur={3} zIndex={1000} center>
      <Loader size="lg" color="blue" />
    </Overlay>
  );
}
