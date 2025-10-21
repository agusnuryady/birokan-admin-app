'use client';

import React from 'react';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { Card, Group, Text, ThemeIcon } from '@mantine/core';

export default function GrowthCard({
  title,
  value,
  isPositive,
  growthValue,
  bgColor,
}: {
  title: string;
  value: string;
  isPositive: boolean;
  growthValue: string;
  bgColor?: string;
}) {
  return (
    <Card shadow="sm" padding="lg" radius="md" bg={bgColor} className="hover-card">
      <Text size="sm">{title}</Text>
      <Group justify="space-between">
        <Text size="xl" fw={600}>
          {value}
        </Text>
        {isPositive ? (
          <Group gap={4}>
            <ThemeIcon size="sm" color="green" variant="light">
              <IconTrendingUp size={14} />
            </ThemeIcon>
            <Text size="sm" c="green">
              {growthValue}
            </Text>
          </Group>
        ) : (
          <Group gap={4}>
            <ThemeIcon size="sm" color="red" variant="light">
              <IconTrendingDown size={14} />
            </ThemeIcon>
            <Text size="sm" c="red">
              {growthValue}
            </Text>
          </Group>
        )}
      </Group>
    </Card>
  );
}
