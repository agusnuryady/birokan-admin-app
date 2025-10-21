'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { IconSelector, IconX } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  Combobox,
  Group,
  InputBase,
  Modal,
  Textarea,
  TextInput,
  useCombobox,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export interface DocumentFormValues {
  name: string;
  type: string;
  desc?: string;
}

interface DocumentFormModalProps {
  opened: boolean;
  mode: 'add' | 'edit';
  initialValues?: DocumentFormValues;
  defaultOptions: string[];
  onClose: () => void;
  onSubmit: (values: DocumentFormValues) => void;
}

export function DocumentFormModal({
  opened,
  mode,
  initialValues,
  defaultOptions,
  onClose,
  onSubmit,
}: DocumentFormModalProps) {
  // Options state (includes programmatically created options)
  const [options, setOptions] = useState<string[]>(defaultOptions);

  // search text typed into input (when typing / editing)
  const [search, setSearch] = useState('');

  // currently selected value (value string) — kept separate from `search`
  const [selectedValue, setSelectedValue] = useState<string>('');

  // Combobox store (for dropdown control)
  // then inside the component:
  const combobox = useCombobox();
  // NOTE: some Mantine builds provide `useCombobox`, others `Combobox.useStore`.
  // If your build exposes useCombobox hook from '@mantine/core', you can replace above accordingly.
  // If you use the hook provided earlier in your project, use that.

  // Input ref for focusing
  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<DocumentFormValues>({
    initialValues: {
      name: '',
      type: '',
      desc: '',
      ...((initialValues as any) || {}),
    },
    validate: {
      name: (v) => (v?.trim().length ? null : 'Name is required'),
    },
  });

  // ✅ Update options dynamically when fetched defaults change
  useEffect(() => {
    if (defaultOptions?.length) {
      setOptions((prev) => Array.from(new Set([...prev, ...defaultOptions])));
    }
  }, [defaultOptions]);

  // Ensure options contain the initial type value (when editing)
  useEffect(() => {
    if (initialValues?.type) {
      const exists = options.some((o) => o === initialValues.type);
      if (!exists) {
        // add it as created option so it's selectable
        setOptions((s) => [...s, initialValues.type]);
      }
      setSelectedValue(initialValues.type);
      setSearch(''); // clear local search
      form.setFieldValue('type', initialValues.type || '');
    } else {
      // If new form, reset selection
      setSelectedValue('');
      setSearch('');
      form.setFieldValue('type', '');
    }
  }, [initialValues]);

  // When user types in the input:
  // - If currently a selection exists and user types, we clear selection and start searching
  const handleInputChange = (val: string) => {
    if (selectedValue) {
      // user is editing after selecting -> drop selection
      setSelectedValue('');
      form.setFieldValue('type', '');
    }
    setSearch(val);
    // open dropdown so user can see options
    try {
      combobox?.openDropdown?.();
    } catch {
      // ignore if combobox doesn't expose methods in this build
    }
  };

  // Create option from the search string
  const createNewOption = (label: string) => {
    // avoid duplicates
    if (!options.some((o) => o === label)) {
      setOptions((s) => [...s, label]);
      return label;
    }
    return options.find((o) => o === label)!;
  };

  // Called when an option is selected from the dropdown
  const handleOptionSelect = (val: string) => {
    if (val === '$create') {
      const label = search.trim();
      if (!label) {
        return;
      }
      const newItem = createNewOption(label);
      setSelectedValue(newItem);
      form.setFieldValue('type', newItem);
      setSearch('');
    } else {
      // normal selection
      setSelectedValue(val);
      form.setFieldValue('type', val);
      setSearch('');
    }
    try {
      combobox?.closeDropdown?.();
    } catch (error) {
      // console.log('error', error);
    }
  };

  // Clear selection/search
  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedValue('');
    setSearch('');
    form.setFieldValue('type', '');
    inputRef.current?.focus();
  };

  // Build Combobox.Options elements + create option if necessary
  const renderedOptions = useMemo(
    () =>
      options.map((opt) => (
        <Combobox.Option value={opt} key={opt}>
          <Group justify="space-between" wrap="nowrap" style={{ width: '100%' }}>
            <Box>{opt}</Box>
          </Group>
        </Combobox.Option>
      )),
    [options]
  );

  // Create option show logic: show only when search non-empty & label not present already
  const showCreateOption =
    search.trim().length > 0 &&
    !options.some((o) => o.toLowerCase() === search.trim().toLowerCase());

  // Keyboard: allow Backspace to clear selection if input empty
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Backspace' && !search && selectedValue) {
      e.preventDefault();
      handleClear();
    }
  };

  // reset form when modal changes
  useEffect(() => {
    form.setValues({
      name: initialValues?.name || '',
      type: initialValues?.type || '',
      desc: initialValues?.desc || '',
    });
    setSelectedValue(initialValues?.type ?? '');
  }, [opened, mode, initialValues]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'add' ? 'Add New Document' : 'Edit Document'}
      centered
      size="md"
      radius="md"
    >
      <form
        onSubmit={form.onSubmit((values) => {
          onSubmit(values);
          onClose();
        })}
      >
        {/* Name */}
        <TextInput
          label="Name"
          placeholder="Enter document name"
          required
          {...form.getInputProps('name')}
          mb="md"
        />

        {/* Type */}
        <Combobox onOptionSubmit={handleOptionSelect} store={combobox}>
          <Combobox.Target>
            <InputBase
              label="Type"
              placeholder="Select or add type"
              value={
                // if user typing => show search, else show label of selectedValue
                search || options.find((o) => o === selectedValue) || ''
              }
              onChange={(e) => handleInputChange(e.currentTarget.value)}
              onClick={() => combobox?.openDropdown?.()}
              onKeyDown={handleKeyDown}
              required
              ref={inputRef}
              rightSection={
                <Group gap={4}>
                  {/* Clear button */}
                  {search || selectedValue ? (
                    <ActionIcon
                      size="sm"
                      variant="transparent"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={handleClear}
                      aria-label="Clear type"
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  ) : (
                    <IconSelector size={16} />
                  )}
                </Group>
              }
              mb="md"
            />
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>
              {renderedOptions}
              {showCreateOption && (
                <Combobox.Option value="$create">+ Add "{search}"</Combobox.Option>
              )}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Enter description"
          autosize
          minRows={3}
          {...form.getInputProps('desc')}
          mb="lg"
        />

        {/* Buttons */}
        <Group justify="end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" color="blue">
            {mode === 'add' ? 'Submit' : 'Save'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
