'use client';

import React from 'react';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, Text } from '@mantine/core';

type Item = { name: string; value: number };

export default function OrderByDirectoryBar({ data }: { data: Item[] }) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      style={{
        transition: 'all 0.3s ease',
      }}
      className="hover-card"
    >
      <Text fw={500} mb="sm">
        Order by Directory
      </Text>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#2F80ED" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
