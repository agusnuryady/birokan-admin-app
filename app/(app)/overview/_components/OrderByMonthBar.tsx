'use client';

import React from 'react';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, Text } from '@mantine/core';

type Item = { month: string; value: number };

export default function OrderByMonthBar({ data }: { data: Item[] }) {
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
        Orders
      </Text>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#56CCF2" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
