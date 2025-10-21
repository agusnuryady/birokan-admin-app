'use client';

import React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, Text } from '@mantine/core';

type Item = { name: string; value: number };

export default function TraficByOrderLocationPie({ data }: { data: Item[] }) {
  if (!data || data.length === 0) {
    return null;
  }

  const COLORS = ['#2F80ED', '#9B51E0', '#56CCF2', '#6FCF97'];

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
        Traffic by Order Location
      </Text>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
