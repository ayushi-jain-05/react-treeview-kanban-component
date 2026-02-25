import {
  DndContext,
  closestCorners,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback } from "react";
import { useKanbanData } from "../../hooks/useKanbanData";
import { KanbanColumn } from "./KanbanColumn";
import type { ColumnId } from "../../types/kanban";
import styles from "./KanbanBoard.module.css";

const COLUMN_ORDER: ColumnId[] = ["todo", "in-progress", "done"];

export function KanbanBoard() {
  const {
    cards,
    columns,
    activeCardId,
    addCard,
    deleteCard,
    updateCardTitle,
    onDragStart,
    onDragOver,
    onDragEnd,
  } = useKanbanData();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      onDragStart(event.active.id as string);
    },
    [onDragStart]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;
      onDragOver(active.id as string, over.id as string);
    },
    [onDragOver]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      onDragEnd(active.id as string, over?.id as string | null);
    },
    [onDragEnd]
  );

  const activeCard = activeCardId ? cards[activeCardId] : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Kanban Board</h2>
        <p className={styles.subtitle}>
          Drag cards between columns &middot; Double-click to edit
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.board}>
          {COLUMN_ORDER.map((colId) => (
            <KanbanColumn
              key={colId}
              column={columns[colId]}
              cards={cards}
              onAddCard={addCard}
              onDeleteCard={deleteCard}
              onUpdateCardTitle={updateCardTitle}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className={styles.dragOverlay}>{activeCard.title}</div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
