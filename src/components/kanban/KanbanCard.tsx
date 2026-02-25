import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { KanbanCard as KanbanCardType, ColumnId } from "../../types/kanban";
import { InlineEditInput } from "../shared/InlineEditInput";
import styles from "./KanbanCard.module.css";

const ACCENT_CLASSES: Record<ColumnId, string> = {
  todo: styles.accentTodo,
  "in-progress": styles.accentInProgress,
  done: styles.accentDone,
};

interface KanbanCardProps {
  card: KanbanCardType;
  columnId: ColumnId;
  onUpdateTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function KanbanCardComponent({
  card,
  columnId,
  onUpdateTitle,
  onDelete,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const accentClass = ACCENT_CLASSES[columnId] ?? "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${accentClass} ${isDragging ? styles.dragging : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className={styles.topRow}>
        <div className={styles.content}>
          <InlineEditInput
            value={card.title}
            onSave={(val) => onUpdateTitle(card.id, val)}
          />
        </div>
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          title="Delete card"
          aria-label={`Delete ${card.title}`}
        >
          {"🗑"}
        </button>
      </div>
      <div className={styles.dragIndicator}>
        <div className={styles.dragDots} />
      </div>
    </div>
  );
}
