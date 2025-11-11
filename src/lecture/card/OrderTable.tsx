import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';
import { Table } from '@mantine/core';
import { UseListStateHandlers } from '@mantine/hooks';
import classes from './OrderTable.module.css';
import { OrderData, OrderDataRow } from '../../libs/types';

interface RowProps {
  item: OrderData[number];
}

function SortableRow({ item }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item._id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Table.Tr ref={setNodeRef} style={style} className={classes.item} {...attributes}>
      <Table.Td>
        <div className={classes.dragHandle} {...listeners}>
          <IconGripVertical size={18} stroke={1.5} />
        </div>
      </Table.Td>
      <Table.Td w={200}>{item.title}</Table.Td>
    </Table.Tr>
  );
}

function OrderTable({ state, handlers }: { state: OrderData, handlers: UseListStateHandlers<OrderDataRow> }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = state.findIndex((i) => i._id === active.id);
    const newIndex = state.findIndex((i) => i._id === over.id);
    handlers.setState(arrayMove(state, oldIndex, newIndex));
  };

  return (
    <Table.ScrollContainer minWidth={420}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={40} />
              <Table.Th w={200}>제목</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <SortableContext
            items={state.map((i) => i._id)}
            strategy={verticalListSortingStrategy}
          >
            <Table.Tbody>
              {state.map((item) => (
                <SortableRow key={item._id} item={item} />
              ))}
            </Table.Tbody>
          </SortableContext>
        </Table>
      </DndContext>
    </Table.ScrollContainer>
  );
}

export default OrderTable;