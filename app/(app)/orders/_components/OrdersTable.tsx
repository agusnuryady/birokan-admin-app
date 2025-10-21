'use client';

import { useMemo, useState } from 'react';
import { IconCancel, IconDots, IconFilter, IconPlus, IconSearch } from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  Pagination,
  ScrollArea,
  Table,
  Text,
  TextInput,
} from '@mantine/core';

const orders = [
  {
    id: '78287574-6d08-4c3b-9a2f-a74538b7881',
    procedure: 'Pajak Tahunan Kendaraan Bermotor',
    userName: 'Alfarizmi Shidqi',
    agentName: '',
    amount: 100000,
    status: 'Draft',
  },
  {
    id: '78287574-6d08-4c3b-9a2f-a74538b7882',
    procedure: 'Pajak Tahunan Kendaraan Bermotor',
    userName: 'Alfarizmi Shidqi',
    agentName: '',
    amount: 100000,
    status: 'Proses Pembayaran',
  },
  {
    id: '78287574-6d08-4c3b-9a2f-a74538b7883',
    procedure: 'Pembuatan SKCK',
    userName: 'Alfarizmi Shidqi',
    agentName: '',
    amount: 150000,
    status: 'Konfirmasi Agen',
  },
  {
    id: '78287574-6d08-4c3b-9a2f-a74538b7884',
    procedure: 'Pajak Tahunan Kendaraan Bermotor',
    userName: 'Alfarizmi Shidqi',
    agentName: 'Agus Nuryady',
    amount: 100000,
    status: 'Ambil Dokumen',
  },
  {
    id: '78287574-6d08-4c3b-9a2f-a74538b7885',
    procedure: 'Dokumen Pernikahan',
    userName: 'Alfarizmi Shidqi',
    agentName: 'Agus Nuryady',
    amount: 200000,
    status: 'Dokumen di Proses',
  },
  {
    id: '78287574-6d08-4c3b-9a2f-a74538b7886',
    procedure: 'Dokumen Pernikahan',
    userName: 'Alfarizmi Shidqi',
    agentName: 'Agus Nuryady',
    amount: 200000,
    status: 'Antar Dokumen',
  },
  {
    id: '78287574-6d08-4c3b-9a2f-a74538b7887',
    procedure: 'Dokumen Pernikahan',
    userName: 'Alfarizmi Shidqi',
    agentName: 'Agus Nuryady',
    amount: 200000,
    status: 'Selesai',
  },
  {
    id: '78287574-6d08-4c3b-9a2f-a74538b7888',
    procedure: 'Perpanjang SIM',
    userName: 'Alfarizmi Shidqi',
    agentName: 'Agus Nuryady',
    amount: 170000,
    status: 'Batal',
  },
];

const filter = [
  'All',
  'Draft',
  'Proses Pembayaran',
  'Konfirmasi Agen',
  'Ambil Dokumen',
  'Dokumen di Proses',
  'Antar Dokumen',
  'Selesai',
  'Batal',
];

export default function OrdersTable() {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Filtering
  const filteredData = useMemo(() => {
    return orders.filter((dir) => {
      const matchStatus = statusFilter === 'All' ? true : dir.status === statusFilter;
      const matchSearch =
        dir.procedure.toLowerCase().includes(search.toLowerCase()) ||
        dir.userName.toLowerCase().includes(search.toLowerCase());
      dir.agentName.toLowerCase().includes(search.toLowerCase());
      dir.amount.toString().toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [statusFilter, search]);

  //status badge color
  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return '#7C91A6';
      case 'Proses Pembayaran':
        return '#F4C441';
      case 'Konfirmasi Agen':
        return '#24486B';
      case 'Ambil Dokumen':
        return '#24486B';
      case 'Dokumen di Proses':
        return '#24486B';
      case 'Antar Dokumen':
        return '#24486B';
      case 'Selesai':
        return '#55AF50';
      case 'Batal':
        return '#B3261E';
      default:
        return '#424a53';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {/* Header */}
      <Group justify="space-between" mb="md" align="flex-start">
        <div>
          <Text fw={600}>Orders</Text>
          <Text size="sm" c="dimmed">
            List of user orders from Birokan app
          </Text>
        </div>

        <Group gap="xs">
          {/* Filter Menu */}
          <Menu width={150} shadow="md">
            <Menu.Target>
              <ActionIcon variant="outline">
                <IconFilter size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Status</Menu.Label>
              {filter.map((item, index) => (
                <Menu.Item
                  key={index}
                  onClick={() => setStatusFilter(item)}
                  rightSection={statusFilter === item ? '✓' : null}
                >
                  {item}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>

          {/* Search */}
          <TextInput
            placeholder="Search here..."
            leftSection={<IconSearch size={16} />}
            radius="md"
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />

          {/* Add Button */}
          <Button size="sm" leftSection={<IconPlus size={16} />}>
            Add
          </Button>
        </Group>
      </Group>

      {/* Table */}
      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Id</Table.Th>
              <Table.Th>Procedure</Table.Th>
              <Table.Th>User Name</Table.Th>
              <Table.Th>Agent Name</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {filteredData.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text ta="center" c="dimmed">
                    No data found
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredData.map((dir) => (
                <Table.Tr key={dir.id}>
                  <Table.Td>{dir.id}</Table.Td>
                  <Table.Td>{dir.procedure}</Table.Td>
                  <Table.Td>{dir.userName}</Table.Td>
                  <Table.Td>{dir.agentName || '-'}</Table.Td>
                  <Table.Td>
                    {Intl.NumberFormat('id', { style: 'currency', currency: 'IDR' }).format(
                      dir.amount
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusBadgeColor(dir.status)} variant="filled" radius="sm">
                      {dir.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {/* Row Action Menu */}
                    <Menu shadow="md" width={180} position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconCancel size={14} />} color="red">
                          Cancel
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {/* Pagination */}
      <Group justify="end" mt="md">
        <Pagination total={10} value={page} onChange={setPage} withEdges />
      </Group>
    </Card>
  );
}
