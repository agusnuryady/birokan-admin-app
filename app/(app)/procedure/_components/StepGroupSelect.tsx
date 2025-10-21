'use client';

import React, { useEffect, useState } from 'react';
import { IconSelector, IconX } from '@tabler/icons-react';
import { ActionIcon, Combobox, Group, InputBase, useCombobox } from '@mantine/core';

type Props = {
  value?: string;
  onChange: (value: string) => void;
  options: string[];
  setOptions: (opts: string[]) => void;
};

export default function StepGroupSelect({ value = '', onChange, options, setOptions }: Props) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState('');
  const [selectedValue, setSelectedValue] = useState<string>(value || '');

  useEffect(() => {
    setSelectedValue(value || '');
    setSearch('');
  }, [value]);

  const handleSelect = (val: string) => {
    if (val === '$create') {
      const label = search.trim();
      if (!label) {
        return;
      }

      if (!options.includes(label)) {
        setOptions([...options, label]);
      }

      setSelectedValue(label);
      onChange(label);
      setSearch('');
      combobox.closeDropdown();
    } else {
      setSelectedValue(val);
      onChange(val);
      setSearch('');
      combobox.closeDropdown();
    }
  };

  const showCreate =
    search.trim().length > 0 &&
    !options.some((o) => o.toLowerCase() === search.trim().toLowerCase());

  const filteredOptions = options.filter((o) =>
    o.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <Combobox store={combobox} onOptionSubmit={handleSelect}>
      <Combobox.Target>
        <InputBase
          label="Group"
          placeholder="Select or add group"
          value={search || selectedValue}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setSearch(val);
            if (selectedValue) {
              setSelectedValue('');
              onChange('');
            }
            if (!combobox.dropdownOpened) {
              combobox.openDropdown();
            }
          }}
          onClick={() => {
            if (!combobox.dropdownOpened) {
              combobox.openDropdown();
            }
          }}
          rightSection={
            <Group gap={4}>
              {search || selectedValue ? (
                <ActionIcon
                  size="sm"
                  variant="transparent"
                  onClick={() => {
                    setSelectedValue('');
                    setSearch('');
                    onChange('');
                  }}
                >
                  <IconX size={16} />
                </ActionIcon>
              ) : (
                <IconSelector size={16} />
              )}
            </Group>
          }
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {filteredOptions.length === 0 && !showCreate && (
            <Combobox.Empty>No results found</Combobox.Empty>
          )}

          {filteredOptions.map((opt) => (
            <Combobox.Option key={opt} value={opt}>
              {opt}
            </Combobox.Option>
          ))}

          {showCreate && <Combobox.Option value="$create">+ Add "{search.trim()}"</Combobox.Option>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
