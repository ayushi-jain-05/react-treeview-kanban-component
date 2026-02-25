import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type {
  KanbanCard,
  KanbanColumnData,
  ColumnId,
} from "../../types/kanban";
import { KanbanCardComponent } from "./KanbanCard";
import styles from "./KanbanColumn.module.css";

const HEADER_CLASSES: Record<ColumnId, string> = {
  todo: styles.headerTodo,
  "in-progress": styles.headerInProgress,
  done: styles.headerDone,
};

interface KanbanColumnProps {
  column: KanbanColumnData;
  cards: Record<string, KanbanCard>;
  onAddCard: (columnId: ColumnId) => void;
  onDeleteCard: (cardId: string) => void;
  onUpdateCardTitle: (cardId: string, title: string) => void;
}

export function KanbanColumn({
  column,
  cards,
  onAddCard,
  onDeleteCard,
  onUpdateCardTitle,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className={`${styles.column} ${isOver ? styles.over : ""}`}>
      <div className={`${styles.header} ${HEADER_CLASSES[column.id]}`}>
        <h3 className={styles.title}>{column.title}</h3>
        <span className={styles.count}>{column.cardIds.length}</span>
        <button
          className={styles.headerAddBtn}
          onClick={() => onAddCard(column.id)}
          title={`Add card to ${column.title}`}
        >
          +
        </button>
      </div>

      <button
        className={styles.addCardBtn}
        onClick={() => onAddCard(column.id)}
      >
        + Add Card
      </button>

      <div ref={setNodeRef} className={styles.cardList}>
        <SortableContext
          items={column.cardIds}
          strategy={verticalListSortingStrategy}
        >
          {column.cardIds.map((cardId) => {
            const card = cards[cardId];
            if (!card) return null;
            return (
              <KanbanCardComponent
                key={card.id}
                card={card}
                columnId={column.id}
                onUpdateTitle={onUpdateCardTitle}
                onDelete={onDeleteCard}
              />
            );
          })}
        </SortableContext>

        {column.cardIds.length === 0 && (
          <div className={styles.empty}>No cards</div>
        )}
      </div>
    </div>
  );
}
