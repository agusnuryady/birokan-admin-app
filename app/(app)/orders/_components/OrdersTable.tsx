'use client';

import { useEffect, useState } from 'react';
import { Badge, Card } from '@mantine/core';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';
import DataTable from '@/components/DataTable';
import { OrderStatus } from '@/services/orderService';
import { useOrderStore } from '@/store/orderStore';
import OrderDetailModal from './OrderDetailModal';

const statusFilters = ['PENDING', 'PAID', 'COMPLETED', 'CANCELLED'];

export default function OrdersTable() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDateRange, setOrderDateRange] = useState<DatesRangeValue<string>>([null, null]);
  const [orderCreatedRange, setOrderCreatedRange] = useState<DatesRangeValue<string>>([null, null]);
  const [orderUpdateRange, setOrderUpdateRange] = useState<DatesRangeValue<string>>([null, null]);

  const { orders, loading, page, limit, total, search, setSearch, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders({ page: 1 });
  }, []);

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'yellow.7';
      case 'PAID':
        return 'blue.7';
      case 'COMPLETED':
        return 'green.7';
      case 'CANCELLED':
        return 'red.7';
      default:
        return 'gray.6';
    }
  };

  const formatDate = (val: string) =>
    new Date(val).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <DataTable
          title="Orders"
          desc="List of user orders from Birokan App"
          data={orders}
          loading={loading}
          rowKey={(row) => row.id}
          highlightOnHover
          searchable
          searchValue={search}
          setSearchValue={setSearch}
          onSearch={(value) => fetchOrders({ search: value || undefined, page: 1 })}
          columns={[
            {
              accessor: 'id',
              title: 'ID',
            },
            {
              accessor: 'procedure',
              title: 'Procedure',
              render: (row) => row.procedure?.name || '-',
            },
            {
              accessor: 'user',
              title: 'User',
              render: (row) => row.user?.fullName || '-',
            },
            {
              accessor: 'totalAmount',
              title: 'Amount',
              render: (row) =>
                Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                }).format(row.totalAmount),
            },
            {
              accessor: 'status',
              title: 'Status',
              render: (row) => (
                <Badge color={statusBadgeColor(row.status)} variant="filled">
                  {row.status}
                </Badge>
              ),
            },
            {
              accessor: 'date',
              title: 'Date',
              render: (row) => formatDate(row.date),
            },
            {
              accessor: 'createdAt',
              title: 'Created',
              render: (row) => formatDate(row.createdAt),
            },
            {
              accessor: 'updatedAt',
              title: 'Updated',
              render: (row) => formatDate(row.updatedAt),
            },
          ]}
          filters={[
            {
              accessor: 'status',
              title: 'Status',
              options: statusFilters,
            },
            {
              accessor: 'date',
              title: 'Order Pick-Up Date',
              customFilters: ({ onChange, close }) => (
                <DatePickerInput
                  type="range"
                  value={orderDateRange}
                  onChange={(range) => {
                    setOrderDateRange(range);

                    const [start, end] = range;
                    const iso = {
                      from: start ? start.toString() : undefined,
                      to: end ? end.toString() : undefined,
                    };

                    onChange?.(iso);
                    fetchOrders({ page: 1, dateFrom: iso.from, dateTo: iso.to });

                    if (start && end) {
                      setTimeout(close, 150);
                    }
                  }}
                  clearable
                  onClick={(e) => e.stopPropagation()}
                />
              ),
            },
            {
              accessor: 'createdFrom',
              title: 'Order Created Date',
              customFilters: ({ onChange, close }) => (
                <DatePickerInput
                  type="range"
                  value={orderCreatedRange}
                  onChange={(range) => {
                    setOrderCreatedRange(range);

                    const [start, end] = range;
                    const iso = {
                      from: start ? start.toString() : undefined,
                      to: end ? end.toString() : undefined,
                    };

                    onChange?.(iso);
                    fetchOrders({ page: 1, createdFrom: iso.from, createdTo: iso.to });

                    if (start && end) {
                      setTimeout(close, 150);
                    }
                  }}
                  clearable
                  onClick={(e) => e.stopPropagation()}
                />
              ),
            },
            {
              accessor: 'updatedFrom',
              title: 'Order Updated Date',
              customFilters: ({ onChange, close }) => (
                <DatePickerInput
                  type="range"
                  value={orderUpdateRange}
                  onChange={(range) => {
                    setOrderUpdateRange(range);

                    const [start, end] = range;
                    const iso = {
                      from: start ? start.toString() : undefined,
                      to: end ? end.toString() : undefined,
                    };

                    onChange?.(iso);
                    fetchOrders({ page: 1, updatedFrom: iso.from, updatedTo: iso.to });

                    if (start && end) {
                      setTimeout(close, 150);
                    }
                  }}
                  clearable
                  onClick={(e) => e.stopPropagation()}
                />
              ),
            },
          ]}
          onFilterChange={(key, value) => {
            if (key === 'status') {
              fetchOrders({
                status: (value as OrderStatus) || undefined,
                page: 1,
              });
            }
          }}
          page={page}
          limit={limit}
          total={total}
          onPageChange={(next) => fetchOrders({ page: next })}
          onRowClick={(row) => setSelectedOrderId(row.id)}
        />
      </Card>

      {selectedOrderId && (
        <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      )}
    </>
  );
}
