'use client';

import { useEffect, useState } from 'react';
import { Accordion, Badge, Card, Divider, Group, Modal, Stack, Text } from '@mantine/core';
import { getOrderDetail, OrderResponse } from '@/services/orderService';

interface Props {
  orderId: string;
  onClose: () => void;
}

export default function OrderDetailModal({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<OrderResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await getOrderDetail({ orderId });
      setOrder(data);
    };
    load();
  }, [orderId]);

  if (!order) {
    return null;
  }

  const currency = (value: number) =>
    Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value || 0);

  return (
    <Modal opened onClose={onClose} title="Order Details" centered size="xl">
      <Stack gap="md">
        {/* ORDER BASIC INFO */}
        <Card shadow="sm" radius="md" withBorder>
          <Text fw={700}>Order Summary</Text>
          <Divider my="xs" />

          <Group justify="space-between">
            <div>
              <Text size="sm" fw={600}>
                Order ID
              </Text>
              <Text size="sm">{order.id}</Text>
            </div>

            <div>
              <Text size="sm" fw={600}>
                Status
              </Text>
              <Badge
                color={
                  order.status === 'COMPLETED'
                    ? 'green'
                    : order.status === 'CANCELLED'
                      ? 'red'
                      : order.status === 'PAID'
                        ? 'blue'
                        : 'yellow'
                }
              >
                {order.status}
              </Badge>
            </div>
          </Group>
          <Group justify="space-between" mt={16}>
            <div>
              <Text size="sm" fw={600}>
                Invoice URL
              </Text>
              <Text size="sm">{order.invoiceUrl ?? '-'}</Text>
            </div>
            <div>
              <Text size="sm" fw={600}>
                Total Amount
              </Text>
              <Text size="sm">{currency(order.totalAmount)}</Text>
            </div>
          </Group>
        </Card>

        {/* USER INFO */}
        <Card shadow="sm" radius="md" withBorder>
          <Text fw={700}>User Information</Text>
          <Divider my="xs" />

          <Text fw={600}>{order.user?.fullName || '-'}</Text>
          <Text size="sm">{order.user?.email}</Text>
          <Text size="sm" c="dimmed">
            {order.user?.phoneNumber || '-'}
          </Text>
        </Card>

        {/* PROCEDURE INFO */}
        <Card shadow="sm" radius="md" withBorder>
          <Text fw={700}>Procedure</Text>
          <Divider my="xs" />

          <Text fw={600}>{order.procedure?.name}</Text>
          {order.procedure?.description && (
            <Text size="sm" c="dimmed">
              {order.procedure.description}
            </Text>
          )}

          <Accordion mt="sm">
            <Accordion.Item value="cost-options">
              <Accordion.Control>Cost Options</Accordion.Control>
              <Accordion.Panel>
                {order.procedure?.costOptions?.map((opt: any, idx: number) => (
                  <Card key={idx} withBorder radius="md" p="sm" mb="sm">
                    <Text fw={600}>{opt.title}</Text>
                    <Text>{currency(opt.cost)}</Text>
                    <Text size="sm" c="dimmed">
                      {opt.minTime}–{opt.maxTime} days
                    </Text>
                  </Card>
                ))}
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Card>

        {/* LOCATION */}
        <Card shadow="sm" radius="md" withBorder>
          <Text fw={700}>Location</Text>
          <Divider my="xs" />
          <Text>{order.address || '-'}</Text>
          <Text size="xs" c="dimmed">
            Lat: {order.latitude} | Long: {order.longitude}
          </Text>
        </Card>

        {/* NOTES */}
        <Card shadow="sm" radius="md" withBorder>
          <Text fw={700}>Notes</Text>
          <Divider my="xs" />
          <Text>{order.notes || '-'}</Text>
        </Card>

        {/* AMOUNT BREAKDOWN */}
        <Accordion variant="separated">
          <Accordion.Item value="amount">
            <Accordion.Control>Amount Breakdown</Accordion.Control>

            <Accordion.Panel>
              {(() => {
                const breakdown = order.amountBreakdown || {};
                const { vouchers, total, ...rest } = breakdown;

                return (
                  <>
                    {/* REGULAR AMOUNT ITEMS (excluding vouchers + total) */}
                    {Object.entries(rest).map(([key, value]) => (
                      <Group key={key} justify="space-between" mb="xs">
                        <Text tt="capitalize">{key}</Text>
                        <Text fw={600}>{currency(value as number)}</Text>
                      </Group>
                    ))}

                    {/* VOUCHERS */}
                    <div style={{ marginTop: 16 }}>
                      <Text fw={600} mb={4}>
                        Voucher Discount
                      </Text>

                      {!vouchers?.length && (
                        <Text size="sm" c="dimmed">
                          No vouchers applied
                        </Text>
                      )}

                      {vouchers?.map((v: any, idx: number) => (
                        <Card key={idx} withBorder radius="md" p="xs" mb="xs">
                          <Group justify="space-between">
                            <div>
                              <Text fw={600}>{v.code ?? '-'}</Text>
                              <Text size="sm">Type: {v.type}</Text>
                            </div>

                            {/* NEGATIVE DISCOUNT */}
                            <Text fw={600} c="red">
                              -{currency(v.discount)}
                            </Text>
                          </Group>
                        </Card>
                      ))}
                    </div>

                    {/* DIVIDER BEFORE TOTAL */}
                    <Divider my="md" />

                    {/* TOTAL AT BOTTOM */}
                    <Group justify="space-between">
                      <Text fw={700} size="lg">
                        Total
                      </Text>
                      <Text fw={700} size="lg">
                        {currency(total || 0)}
                      </Text>
                    </Group>
                  </>
                );
              })()}
            </Accordion.Panel>
          </Accordion.Item>

          {/* ORDER ANSWERS */}
          <Accordion.Item value="answers">
            <Accordion.Control>Order Answers</Accordion.Control>
            <Accordion.Panel>
              {order.orderAnswers?.map((ans: any) => (
                <Card key={ans.id} withBorder p="sm" mb="sm">
                  <Text fw={600}>{ans.question?.questionText}</Text>
                  <Text>{ans.value}</Text>
                </Card>
              ))}
            </Accordion.Panel>
          </Accordion.Item>

          {/* DECLARATIONS */}
          <Accordion.Item value="declarations">
            <Accordion.Control>Declarations</Accordion.Control>
            <Accordion.Panel>
              {order.orderDeclarations?.map((d: any) => (
                <Group key={d.id} mb="xs" justify="space-between">
                  <Text>{d.declarationId}</Text>
                  <Badge color={d.value ? 'green' : 'red'}>{d.value ? 'Yes' : 'No'}</Badge>
                </Group>
              ))}
            </Accordion.Panel>
          </Accordion.Item>

          {/* AGENTS */}
          <Accordion.Item value="agents">
            <Accordion.Control>Assigned Agents</Accordion.Control>
            <Accordion.Panel>
              {!order.agents?.length && <Text>No agents assigned.</Text>}

              {order.agents?.map((a: any) => (
                <Card key={a.id} withBorder p="sm" mb="sm">
                  <Text fw={600}>{a.agent?.idFullName}</Text>
                  <Text size="sm">Phone: {a.agent?.relativePhoneNumber}</Text>
                  <Text size="sm">Joined: {new Date(a.joinedAt).toLocaleString()}</Text>
                </Card>
              ))}
            </Accordion.Panel>
          </Accordion.Item>

          {/* VOUCHERS */}
          <Accordion.Item value="vouchers">
            <Accordion.Control>Vouchers</Accordion.Control>
            <Accordion.Panel>
              {(!order.vouchers || order.vouchers.length === 0) && (
                <Text>No vouchers applied.</Text>
              )}

              {order.vouchers?.map((v: any) => (
                <Card key={v.id} withBorder radius="md" p="sm" mb="sm">
                  <Text fw={600}>{v.voucher.code}</Text>
                  <Text size="sm">Type: {v.voucher.discountType}</Text>

                  {v.voucher.discountType === 'PERCENTAGE' ? (
                    <Text size="sm">Discount: {v.voucher.discountValue}%</Text>
                  ) : (
                    <Text size="sm">Discount: {currency(v.voucher.discountValue)}</Text>
                  )}
                </Card>
              ))}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </Modal>
  );
}
