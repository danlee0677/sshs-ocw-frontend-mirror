// MantineSortableTable.tsx
import React, { useMemo, useState } from "react";
import {
  Table,
  Paper,
  ActionIcon,
  Badge, // optional, handy for examples
  useMantineTheme,
  useComputedColorScheme,
  rem,
} from "@mantine/core";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";

/* =========================
   Types
   ========================= */

export type Row = { id: string; [k: string]: any };

export type Column<T extends Row> = {
  key: keyof T;
  header: React.ReactNode;
  render?: (r: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  /** Width for this column: number (px) or CSS string (e.g., '20%', '12rem') */
  w?: number | string;
};

/* =========================
   Helpers
   ========================= */

// Single place to compute background/borders for overlay & sticky header
function overlayRowStyle(
  theme: ReturnType<typeof useMantineTheme>,
  scheme: "light" | "dark"
) {
  return {
    background: scheme === "dark" ? theme.colors.dark[7] : theme.white,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    border: `1px dashed ${theme.colors.gray[4]}`,
  } as const;
}

// Colgroup shared by main table and overlay table to keep widths aligned
function Cols<T extends Row>({ columns }: { columns: Column<T>[] }) {
  return (
    <colgroup>
      <col style={{ width: rem(36) }} />
      {columns.map((c, i) => (
        <col key={i} style={{ width: c.w as any }} />
      ))}
    </colgroup>
  );
}

/* =========================
   Sortable Row (memoized)
   - Applies transform to an inner <div> wrapper (Safari-safe)
   ========================= */

type SortableRowProps<T extends Row> = {
  row: T;
  columns: Column<T>[];
  /** When using wrapper we need total colSpan = columns.length + 1 (drag col) */
  colSpan: number;
};

function _SortableRow<T extends Row>({ row, columns, colSpan }: SortableRowProps<T>) {
  const theme = useMantineTheme();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });

  // Prevent tabIndex clash: strip from attributes, re-apply with fallback
  const { tabIndex, ...attrNoTabIndex } = attributes;

  // Visual row with transform applied to a block wrapper (works better across browsers)
  return (
    <Table.Tr>
      <Table.Td colSpan={colSpan} style={{ padding: 0, borderTop: "none" }}>
        <div
          ref={setNodeRef}
          style={{
            display: "grid",
            gridTemplateColumns: `36px ${columns.map((c) => (c.w ? c.w : "1fr")).join(" ")}`,
            alignItems: "center",
            transform: CSS.Translate.toString(transform),
            transition,
            background: isDragging ? theme.colors.gray[1] : undefined,
          }}
        >
          {/* Drag handle cell */}
          <div
            style={{
              width: rem(36),
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "8px",
            }}
          >
            <ActionIcon
              variant="subtle"
              aria-label="Reorder row"
              {...attrNoTabIndex}
              tabIndex={tabIndex ?? 0}
              {...listeners}
              style={{ cursor: "grab" }}
            >
              <IconGripVertical size={16} />
            </ActionIcon>
          </div>

          {/* Data cells */}
          {columns.map((c) => (
            <div
              key={String(c.key)}
              style={{
                textAlign: c.align ?? "left",
                padding: "8px 12px",
                borderTop: `1px solid ${theme.colors.gray[3]}`,
              }}
            >
              {c.render ? c.render(row) : String(row[c.key])}
            </div>
          ))}
        </div>
      </Table.Td>
    </Table.Tr>
  );
}

const SortableRow = React.memo(_SortableRow) as typeof _SortableRow;

/* =========================
   Main component
   ========================= */

function ReorderTable<T extends Row>({
  rows,
  columns,
  onChange,
  paper = true,
  minTableWidth = 640,
  striped = "odd" as const,
}: {
  rows: T[];
  columns: Column<T>[];
  onChange: (next: T[]) => void;
  /** Wrap table in Paper with border/radius */
  paper?: boolean;
  /** Min width for horizontal scroll container */
  minTableWidth?: number;
  /** Striped option for Mantine v8 ('odd' | 'even' | boolean) */
  striped?: "odd" | "even" | boolean;
}) {
  const theme = useMantineTheme();
  const scheme = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeRow = useMemo(() => rows.find((r) => r.id === activeId) ?? null, [rows, activeId]);
  const colSpan = columns.length + 1; // +1 for drag handle column

  const TableShell = paper ? Paper : React.Fragment;
  const shellProps = paper
    ? ({
        withBorder: true,
        radius: "md",
        p: 0,
        style: { overflow: "hidden" },
      } as any)
    : {};

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragEnd={(e) => {
        setActiveId(null);
        if (!e.over || e.active.id === e.over.id) return;
        const oldIndex = rows.findIndex((r) => r.id === e.active.id);
        const newIndex = rows.findIndex((r) => r.id === e.over!.id);
        onChange(arrayMove(rows, oldIndex, newIndex));
      }}
      onDragCancel={() => setActiveId(null)}
    >
      <TableShell {...shellProps}>
        <Table.ScrollContainer minWidth={minTableWidth}>
          <Table
            striped={striped}
            highlightOnHover
            verticalSpacing="sm"
            horizontalSpacing="md"
            stickyHeader
            style={{ tableLayout: "fixed", width: "100%" }}
          >
            <Cols columns={columns} />
            <Table.Thead>
              <Table.Tr>
                <Table.Th
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    background:
                      scheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
                    width: rem(36),
                  }}
                />
                {columns.map((c) => (
                  <Table.Th
                    key={String(c.key)}
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      background:
                        scheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
                      textAlign: c.align ?? "left",
                      width: c.w as any,
                    }}
                  >
                    {c.header}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>

            <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <Table.Tbody>
                {rows.map((r) => (
                  <SortableRow key={r.id} row={r} columns={columns} colSpan={colSpan} />
                ))}
              </Table.Tbody>
            </SortableContext>
          </Table>
        </Table.ScrollContainer>
      </TableShell>

      {/* Drag overlay mirrors widths & uses same header/row styling */}
      <DragOverlay dropAnimation={null}>
        {activeRow ? (
          <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
            <Table verticalSpacing="sm" horizontalSpacing="md" style={{ tableLayout: "fixed" }}>
              <Cols columns={columns} />
              <Table.Tbody>
                <Table.Tr style={overlayRowStyle(theme, scheme)}>
                  <Table.Td style={{ width: rem(36), textAlign: "center" }}>
                    <IconGripVertical size={18} />
                  </Table.Td>
                  {columns.map((c) => (
                    <Table.Td key={`overlay-${String(c.key)}`} style={{ textAlign: c.align ?? "left" }}>
                      {c.render ? c.render(activeRow) : String(activeRow[c.key])}
                    </Table.Td>
                  ))}
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Paper>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default ReorderTable

/* =========================
   Example usage (optional)
   - Remove this block in your app and import MantineSortableTable instead.
   ========================= */

// Uncomment this section if you want an inline demo.
// Otherwise, import MantineSortableTable in your SubjectEditor / ModuleEditor files.
/*
type Lesson = { id: string; title: string; status: "draft" | "published"; updatedAt: string };

export default function Demo() {
  const [rows, setRows] = useState<Lesson[]>([
    { id: "a1", title: "Lesson 1", status: "draft",     updatedAt: "2025-10-01" },
    { id: "b2", title: "Lesson 2", status: "published", updatedAt: "2025-10-13" },
    { id: "c3", title: "Lesson 3", status: "draft",     updatedAt: "2025-10-20" },
  ]);

  const columns: Column<Lesson>[] = [
    { key: "title", header: "Title", w: "40%" },
    {
      key: "status",
      header: "Status",
      w: 160,
      render: (r) => (
        <Badge variant="light" color={r.status === "published" ? "green" : "gray"}>
          {r.status}
        </Badge>
      ),
    },
    { key: "updatedAt", header: "Updated", align: "right", w: 140 },
  ];

  return (
    <div style={{ maxWidth: 840, margin: "40px auto" }}>
      <MantineSortableTable rows={rows} columns={columns} onChange={setRows} />
    </div>
  );
}
*/
