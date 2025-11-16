'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Loader,
  Pagination,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';

const FilterMenu = dynamic(() => import('./FilterMenu'), { ssr: false });

type Column<T> = {
  accessor: keyof T | string;
  title: string;
  searchable?: boolean;
  render?: (row: T) => React.ReactNode;
};

type Filter<T> = {
  accessor: keyof T | string;
  title: string;
  options?: string[];
  customFilters?: (params: {
    value?: any;
    onChange?: (v: any) => void;
    close: () => void;
  }) => React.ReactNode;
};

type DataTableProps<T> = {
  title: string;
  desc: string;
  data: T[];
  columns: Column<T>[];
  filters?: Filter<T>[];
  page: number;
  limit: number;
  total: number;
  loading?: boolean;
  striped?: boolean;
  highlightOnHover?: boolean;
  searchable?: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
  handleAddButton?: () => void;
  onPageChange?: (page: number) => void;
  onSearch?: (value: string) => void;
  onFilterChange?: (accessor: string, value: string | Record<string, string>) => void;
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
};

export default function DataTable<T>({
  title,
  desc,
  data,
  columns,
  filters = [],
  page,
  limit,
  total,
  loading = false,
  striped = false,
  highlightOnHover = false,
  searchable = false,
  searchValue,
  setSearchValue,
  handleAddButton,
  onPageChange,
  onSearch,
  onFilterChange,
  rowKey,
  onRowClick,
}: DataTableProps<T>) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleFilterClick = (accessor: string, value: string) => {
    const newFilters = {
      ...activeFilters,
      [accessor]: activeFilters[accessor] === value ? '' : value,
    };

    setActiveFilters(newFilters);

    // 🔹 Now send ALL filters instead of just one accessor/value
    onFilterChange?.(accessor, newFilters[accessor]); // optional backward compatibility
    onFilterChange?.('ALL_FILTERS', newFilters as any);
  };

  // 🔹 Debounce search effect
  useEffect(() => {
    const delay = setTimeout(() => {
      onSearch?.(searchValue);
    }, 500); // wait 500ms after typing

    return () => clearTimeout(delay);
  }, [searchValue]);

  return (
    <Box>
      <Group justify="space-between" align="center" mb="md">
        <Stack gap={0}>
          <Text fw={600}>{title}</Text>
          <Text size="sm" c="dimmed">
            {desc}
          </Text>
        </Stack>

        <Group>
          {/* 🔹 Filters */}
          {filters.length > 0 && (
            <FilterMenu
              filters={filters}
              activeFilters={activeFilters}
              onFilterClick={handleFilterClick}
            />
          )}

          {/* 🔹 Search */}
          {searchable && (
            <TextInput
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setSearchValue(value);
              }}
              leftSection={<IconSearch size={16} />}
              rightSection={
                searchValue ? (
                  <ActionIcon
                    variant="subtle"
                    onClick={() => {
                      setSearchValue('');
                      onSearch?.('');
                    }}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                ) : (
                  <Group w={28} />
                )
              }
            />
          )}

          {handleAddButton && (
            <Button leftSection={<IconPlus size={16} />} onClick={handleAddButton}>
              Add
            </Button>
          )}
        </Group>
      </Group>

      {/* 🔹 Table */}
      <ScrollArea>
        <Table
          striped={striped}
          highlightOnHover={highlightOnHover}
          withTableBorder
          withColumnBorders
        >
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col.accessor as string}>
                  <Text fw={600} size="sm">
                    {col.title}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Group justify="center" py="md">
                    <Loader size="sm" />
                    <Text c="dimmed">Loading...</Text>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ) : data.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Text ta="center" c="dimmed" py="md">
                    No data found
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              data.map((row) => (
                <Table.Tr
                  key={rowKey(row)} // 🔹 rowKey instead of hardcoded id
                  onClick={() => onRowClick?.(row)} // 🔹 customizable row click
                >
                  {columns.map((col) => (
                    <Table.Td key={col.accessor as string}>
                      {col.render ? col.render(row) : String((row as any)[col.accessor] ?? '')}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {/* 🔹 Pagination (server-side) */}
      {total > limit && (
        <Group justify="flex-end" mt="md">
          <Pagination
            total={Math.ceil(total / limit)}
            value={page}
            onChange={onPageChange}
            size="sm"
          />
        </Group>
      )}
    </Box>
  );
}
