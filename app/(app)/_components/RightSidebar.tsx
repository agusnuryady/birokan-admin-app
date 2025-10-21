import { IconBroadcast, IconBug, IconUserCircle } from '@tabler/icons-react';
import { Avatar, Divider, Group, ScrollArea, Stack, Text, ThemeIcon } from '@mantine/core';

export default function RightSidebar() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ScrollArea style={{ height: '100%' }}>
        <Stack gap="lg" p="md">
          {/* Notifications */}
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Notifications
            </Text>

            <Group align="flex-start" gap="sm">
              <ThemeIcon variant="light" size="lg" radius="xl">
                <IconBug size={20} />
              </ThemeIcon>
              <div>
                <Text size="sm">You fixed a bug.</Text>
                <Text size="xs" c="dimmed">
                  Just now
                </Text>
              </div>
            </Group>

            <Group align="flex-start" gap="sm">
              <ThemeIcon variant="light" size="lg" radius="xl">
                <IconUserCircle size={20} />
              </ThemeIcon>
              <div>
                <Text size="sm">New user registered.</Text>
                <Text size="xs" c="dimmed">
                  59 minutes ago
                </Text>
              </div>
            </Group>

            <Group align="flex-start" gap="sm">
              <ThemeIcon variant="light" size="lg" radius="xl">
                <IconBug size={20} />
              </ThemeIcon>
              <div>
                <Text size="sm">You fixed a bug.</Text>
                <Text size="xs" c="dimmed">
                  12 hours ago
                </Text>
              </div>
            </Group>

            <Group align="flex-start" gap="sm">
              <ThemeIcon variant="light" size="lg" radius="xl">
                <IconBroadcast size={20} />
              </ThemeIcon>
              <div>
                <Text size="sm">Andi Lane subscribed to you.</Text>
                <Text size="xs" c="dimmed">
                  Today, 11:59 AM
                </Text>
              </div>
            </Group>
          </Stack>

          <Divider />

          {/* Activities */}
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Activities
            </Text>

            <Group align="flex-start" gap="sm">
              <Avatar radius="xl" src="https://i.pravatar.cc/100?img=5" />
              <div>
                <Text size="sm">Changed the style.</Text>
                <Text size="xs" c="dimmed">
                  Just now
                </Text>
              </div>
            </Group>

            <Group align="flex-start" gap="sm">
              <Avatar radius="xl" src="https://i.pravatar.cc/100?img=6" />
              <div>
                <Text size="sm">Released a new version.</Text>
                <Text size="xs" c="dimmed">
                  59 minutes ago
                </Text>
              </div>
            </Group>

            <Group align="flex-start" gap="sm">
              <Avatar radius="xl" src="https://i.pravatar.cc/100?img=7" />
              <div>
                <Text size="sm">Submitted a bug.</Text>
                <Text size="xs" c="dimmed">
                  12 hours ago
                </Text>
              </div>
            </Group>

            <Group align="flex-start" gap="sm">
              <Avatar radius="xl" src="https://i.pravatar.cc/100?img=8" />
              <div>
                <Text size="sm">Modified A data in Page X.</Text>
                <Text size="xs" c="dimmed">
                  Today, 11:59 AM
                </Text>
              </div>
            </Group>

            <Group align="flex-start" gap="sm">
              <Avatar radius="xl" src="https://i.pravatar.cc/100?img=9" />
              <div>
                <Text size="sm">Deleted a page in Project X.</Text>
                <Text size="xs" c="dimmed">
                  Feb 2, 2025
                </Text>
              </div>
            </Group>
          </Stack>
        </Stack>
      </ScrollArea>
    </div>
  );
}
