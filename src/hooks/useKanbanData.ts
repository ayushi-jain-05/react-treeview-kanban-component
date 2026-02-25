import { useState, useCallback } from "react";
import type { KanbanCard, KanbanColumnData, ColumnId } from "../types/kanban";
import {
  reorderInColumn,
  moveCardBetweenColumns,
  findColumnForCard,
} from "../utils/kanban-helpers";
import { generateId } from "../utils/id";

const INITIAL_CARDS: Record<string, KanbanCard> = {
  "card-1": { id: "card-1", title: "Set up project structure" },
  "card-2": { id: "card-2", title: "Design database schema" },
  "card-3": { id: "card-3", title: "Implement authentication" },
  "card-4": { id: "card-4", title: "Create API endpoints" },
  "card-5": { id: "card-5", title: "Write unit tests" },
  "card-6": { id: "card-6", title: "Deploy to staging" },
};

const INITIAL_COLUMNS: Record<ColumnId, KanbanColumnData> = {
  todo: {
    id: "todo",
    title: "Todo",
    cardIds: ["card-3", "card-4", "card-5"],
  },
  "in-progress": {
    id: "in-progress",
    title: "In Progress",
    cardIds: ["card-2"],
  },
  done: {
    id: "done",
    title: "Done",
    cardIds: ["card-1", "card-6"],
  },
};

const COLUMN_IDS: ColumnId[] = ["todo", "in-progress", "done"];

export function useKanbanData() {
  const [cards, setCards] = useState<Record<string, KanbanCard>>(INITIAL_CARDS);
  const [columns, setColumns] =
    useState<Record<ColumnId, KanbanColumnData>>(INITIAL_COLUMNS);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const addCard = useCallback((columnId: ColumnId) => {
    const title = prompt("Enter card title:");
    if (!title?.trim()) return;
    const id = generateId();
    const newCard: KanbanCard = { id, title: title.trim() };
    setCards((prev) => ({ ...prev, [id]: newCard }));
    setColumns((prev) => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        cardIds: [...prev[columnId].cardIds, id],
      },
    }));
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setCards((prev) => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
    setColumns((prev) => {
      const colId = findColumnForCard(prev, cardId);
      if (!colId) return prev;
      return {
        ...prev,
        [colId]: {
          ...prev[colId],
          cardIds: prev[colId].cardIds.filter((id) => id !== cardId),
        },
      };
    });
  }, []);

  const updateCardTitle = useCallback((cardId: string, title: string) => {
    setCards((prev) => ({
      ...prev,
      [cardId]: { ...prev[cardId], title },
    }));
  }, []);

  const onDragStart = useCallback((activeId: string) => {
    setActiveCardId(activeId);
  }, []);

  const onDragOver = useCallback((activeId: string, overId: string) => {
    setColumns((prev) => {
      const activeCol = findColumnForCard(prev, activeId);
      const isColumn = COLUMN_IDS.includes(overId as ColumnId);
      const overCol = isColumn
        ? (overId as ColumnId)
        : findColumnForCard(prev, overId);

      if (!activeCol || !overCol || activeCol === overCol) return prev;

      const destIndex = isColumn
        ? prev[overCol].cardIds.length
        : prev[overCol].cardIds.indexOf(overId);

      return moveCardBetweenColumns(
        prev,
        activeCol,
        overCol,
        activeId,
        destIndex >= 0 ? destIndex : prev[overCol].cardIds.length
      );
    });
  }, []);

  const onDragEnd = useCallback((activeId: string, overId: string | null) => {
    setActiveCardId(null);
    if (!overId) return;

    setColumns((prev) => {
      const activeCol = findColumnForCard(prev, activeId);
      const isColumn = COLUMN_IDS.includes(overId as ColumnId);
      const overCol = isColumn
        ? (overId as ColumnId)
        : findColumnForCard(prev, overId);

      if (!activeCol || !overCol) return prev;

      if (activeCol === overCol && !isColumn) {
        const cardIds = prev[activeCol].cardIds;
        const fromIndex = cardIds.indexOf(activeId);
        const toIndex = cardIds.indexOf(overId);
        if (fromIndex !== toIndex) {
          return {
            ...prev,
            [activeCol]: {
              ...prev[activeCol],
              cardIds: reorderInColumn(prev[activeCol].cardIds, fromIndex, toIndex),
            },
          };
        }
      }
      return prev;
    });
  }, []);

  return {
    cards,
    columns,
    activeCardId,
    addCard,
    deleteCard,
    updateCardTitle,
    onDragStart,
    onDragOver,
    onDragEnd,
  };
}
