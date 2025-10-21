'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, Text } from '@mantine/core';

type Item = { label: string; value: number; color?: string };

export default function OrderByProcedureBar({ data }: { data: Item[] }) {
  if (!data || data.length === 0) {
    return null;
  }

  // Recharts wants an array top->bottom, we want label left, bar to right:
  const chartData = data.map((d) => ({
    name: d.label,
    value: d.value,
    color: d.color || '#2F80ED',
  }));

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
      <Text fw={600} mb="sm">
        Order by Procedure
      </Text>

      <div style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={160} />
            <Tooltip formatter={(val: any) => (val >= 1000 ? `${Math.round(val / 1000)}K` : val)} />
            <Bar dataKey="value" barSize={12} radius={[6, 6, 6, 6]}>
              {chartData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(label: React.ReactNode) => {
                  if (typeof label === 'number') {
                    return label >= 1000 ? `${Math.round(label / 1000)}K` : label;
                  }
                  return label;
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
