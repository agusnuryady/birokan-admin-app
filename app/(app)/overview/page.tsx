'use client';

import { useCallback, useEffect } from 'react';
import { Grid, SimpleGrid, Stack, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { getMe } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { notifyApiError } from '@/utils/handleApiError';
import GrowthCard from './_components/GrowthCard';
import OrderByDirectoryBar from './_components/OrderByDirectoryBar';
import OrderByMonthBar from './_components/OrderByMonthBar';
import OrderByProcedureDots from './_components/OrderByProcedureBar';
import TotalUsersBar from './_components/TotalUsersBar';
import TraficByOrderLocationPie from './_components/TraficByOrderLocationPie';

// Example dummy data
const userGrowth = [
  { month: 'Jan', thisYear: 10000, lastYear: 12000 },
  { month: 'Feb', thisYear: 8000, lastYear: 11000 },
  { month: 'Mar', thisYear: 12000, lastYear: 15000 },
  { month: 'Apr', thisYear: 15000, lastYear: 13000 },
  { month: 'May', thisYear: 20000, lastYear: 17000 },
  { month: 'Jun', thisYear: 18000, lastYear: 16000 },
  { month: 'Jul', thisYear: 22000, lastYear: 19000 },
];

const procedureData = [
  { label: 'Pajak tahunan STNK', value: 15000, color: '#111' },
  { label: 'Perpanjang SIM', value: 7000, color: '#222' },
  { label: 'Pindah Domisili KTP', value: 3000, color: '#444' },
  { label: 'Dokumen Pernikahan', value: 1000, color: '#888' },
  { label: 'Pembuatan SKCK', value: 800, color: '#999' },
];

const traffic = [
  { name: 'Jakarta Selatan', value: 52.1 },
  { name: 'Tangerang Selatan', value: 22.8 },
  { name: 'Jakarta Utara', value: 13.9 },
  { name: 'Bekasi', value: 11.2 },
];

const directoryData = [
  { name: 'SIM', value: 20000 },
  { name: 'KTP', value: 25000 },
  { name: 'SKCK', value: 15000 },
  { name: 'STNK', value: 28000 },
  { name: 'KK', value: 18000 },
  { name: 'Other', value: 22000 },
];

const monthlyOrders = [
  { month: 'Feb', value: 20000 },
  { month: 'Mar', value: 25000 },
  { month: 'Apr', value: 18000 },
  { month: 'May', value: 30000 },
  { month: 'Jun', value: 22000 },
  { month: 'Jul', value: 28000 },
  { month: 'Aug', value: 26000 },
  { month: 'Sep', value: 24000 },
  { month: 'Oct', value: 30000 },
  { month: 'Nov', value: 27000 },
  { month: 'Dec', value: 23000 },
];

export default function OverviewPage() {
  const { setLoading, setUser } = useAuthStore();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const getUserData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMe();
      setUser(res);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      notifyApiError(err);
    }
  }, []);

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <Stack gap="md">
      {/* Top stats cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <GrowthCard
          title="Transactions"
          value="493B"
          isPositive
          growthValue="+11.01%"
          bgColor={colorScheme === 'dark' ? theme.colors.grape[5] : theme.colors.grape[1]}
        />
        <GrowthCard
          title="Orders"
          value="3,671"
          growthValue="-0.03%"
          bgColor={colorScheme === 'dark' ? theme.colors.blue[5] : theme.colors.blue[1]}
          isPositive={false}
        />
        <GrowthCard
          title="New Users"
          value="156"
          isPositive
          growthValue="+15.03%"
          bgColor={colorScheme === 'dark' ? theme.colors.indigo[5] : theme.colors.indigo[1]}
        />
        <GrowthCard
          title="Active Users"
          value="2,318"
          isPositive
          growthValue="+6.08%"
          bgColor={colorScheme === 'dark' ? theme.colors.cyan[5] : theme.colors.cyan[1]}
        />
      </SimpleGrid>

      {/* Line chart */}
      <TotalUsersBar data={userGrowth} />

      {/* Procedure + Traffic */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <OrderByProcedureDots data={procedureData} />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <TraficByOrderLocationPie data={traffic} />
        </Grid.Col>
      </Grid>

      {/* Directory bar chart */}
      <OrderByDirectoryBar data={directoryData} />

      {/* Orders bar chart */}
      <OrderByMonthBar data={monthlyOrders} />
    </Stack>
  );
}
