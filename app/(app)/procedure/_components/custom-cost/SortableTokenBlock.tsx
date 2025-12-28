'use client';

import React from 'react';
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';
import { ActionIcon, Group, Paper } from '@mantine/core';

/* ================== TYPES ================== */

export type SortableItem<T extends { id: string }> = T;

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}

/* ================== SORTABLE ITEM ================== */

function SortableItemWrapper<T extends { id: string }>({
  item,
  children,
}: {
  item: T;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <Paper ref={setNodeRef} style={style} withBorder radius="md" p="sm">
      <Group align="flex-start" gap="xs">
        <ActionIcon
          variant="subtle"
          color="gray"
          {...attributes}
          {...listeners}
          aria-label="Drag handle"
        >
          <IconGripVertical size={18} />
        </ActionIcon>

        <div style={{ flex: 1 }}>{children}</div>
      </Group>
    </Paper>
  );
}

/* ================== MAIN LIST ================== */

export function SortableList<T extends { id: string }>({
  items,
  onChange,
  renderItem,
}: SortableListProps<T>) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const updated = [...items];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);

    onChange(updated);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div
          className="
            grid gap-6
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {items.map((item, idx) => (
            <SortableItemWrapper key={item.id} item={item}>
              {renderItem(item, idx)}
            </SortableItemWrapper>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
