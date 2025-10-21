import { useState } from 'react';
import { Button, Group, Modal, Text, TextInput } from '@mantine/core';

interface DeleteFlowModalProps {
  title: string;
  opened: boolean;
  itemName: string;
  confirmText: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteFlowModal({
  title,
  opened,
  itemName,
  confirmText,
  onClose,
  onConfirm,
}: DeleteFlowModalProps) {
  const [step, setStep] = useState<'delete' | 'confirm'>('delete');
  const [inputValue, setInputValue] = useState('');

  const resetFlow = () => {
    setStep('delete');
    setInputValue('');
    onClose();
  };

  return (
    <>
      {/* Step 1: Delete Directory Modal */}
      <Modal opened={opened && step === 'delete'} onClose={resetFlow} title={title} centered>
        <Text size="sm" mb="md">
          Are you sure you want to delete{' '}
          <Text span fw={600}>
            {itemName}
          </Text>
          ?
        </Text>
        <Group justify="flex-end">
          <Button color="red" onClick={() => setStep('confirm')}>
            {title}
          </Button>
          <Button variant="default" onClick={resetFlow}>
            No, don’t delete it
          </Button>
        </Group>
      </Modal>

      {/* Step 2: Confirm Deletion Modal */}
      <Modal
        opened={opened && step === 'confirm'}
        onClose={resetFlow}
        title="Confirm Deletion"
        centered
      >
        <Text size="sm" mb="xs">
          To confirm, type{' '}
          <Text span fw={600}>
            {confirmText}
          </Text>{' '}
          in the box below
        </Text>
        <TextInput
          placeholder={confirmText}
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={resetFlow}>
            Cancel
          </Button>
          <Button
            color="red"
            disabled={inputValue.trim() !== confirmText}
            onClick={() => {
              onConfirm();
              resetFlow();
            }}
          >
            Confirm
          </Button>
        </Group>
      </Modal>
    </>
  );
}
