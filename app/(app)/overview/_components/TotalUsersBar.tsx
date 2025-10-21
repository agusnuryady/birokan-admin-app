'use client';

import React from 'react';
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, Text } from '@mantine/core';

type Item = { month: string; thisYear: number; lastYear: number };

export default function TotalUsersBar({ data }: { data: Item[] }) {
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
        Total Users
      </Text>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="thisYear" stroke="#2F80ED" strokeWidth={2} />
          <Line type="monotone" dataKey="lastYear" stroke="#8884d8" strokeDasharray="4 4" />
          <Tooltip />
          <Legend />
          <XAxis dataKey="month" />
          <YAxis />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
