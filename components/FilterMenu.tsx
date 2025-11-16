'use client';

import { IconCheck, IconFilter } from '@tabler/icons-react';
import { ActionIcon, Box, Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function FilterMenu({ filters, activeFilters, onFilterClick }: any) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Menu
      shadow="md"
      width={250}
      opened={opened}
      onChange={(o) => (o ? open() : close())}
      closeOnItemClick={false}
    >
      <Menu.Target>
        <ActionIcon w={34} h={34} variant="outline" onClick={opened ? close : open}>
          <IconFilter size={20} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {filters.map((filter: any) => (
          <Box key={filter.accessor}>
            <Menu.Label>{filter.title}</Menu.Label>

            {/* NORMAL FILTER OPTIONS */}
            {filter.options &&
              filter.options.map((option: string) => (
                <Menu.Item
                  key={option}
                  onClick={() => {
                    onFilterClick(filter.accessor, option);
                    close(); // ✔ close only for normal items
                  }}
                  rightSection={
                    activeFilters[filter.accessor] === option ? <IconCheck size={14} /> : null
                  }
                >
                  {option}
                </Menu.Item>
              ))}

            {/* CUSTOM FILTER (ex: DatePicker) */}
            {filter.customFilters && (
              <Box
                mt={8}
                // prevent Mantine from closing menu when interacting with DatePicker
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {filter.customFilters({
                  value: activeFilters[filter.accessor],
                  onChange: (v: any) => onFilterClick(filter.accessor, v),
                  close,
                })}
              </Box>
            )}

            <Menu.Divider />
          </Box>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
