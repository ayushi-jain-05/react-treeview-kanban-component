import type { KanbanColumnData, ColumnId } from "../types/kanban";

export function reorderInColumn(
  cardIds: string[],
  fromIndex: number,
  toIndex: number
): string[] {
  const result = [...cardIds];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

export function moveCardBetweenColumns(
  columns: Record<ColumnId, KanbanColumnData>,
  sourceColId: ColumnId,
  destColId: ColumnId,
  cardId: string,
  destIndex: number
): Record<ColumnId, KanbanColumnData> {
  const sourceCardIds = columns[sourceColId].cardIds.filter(
    (id) => id !== cardId
  );
  const destCardIds = [...columns[destColId].cardIds];
  destCardIds.splice(destIndex, 0, cardId);

  return {
    ...columns,
    [sourceColId]: { ...columns[sourceColId], cardIds: sourceCardIds },
    [destColId]: { ...columns[destColId], cardIds: destCardIds },
  };
}

export function findColumnForCard(
  columns: Record<ColumnId, KanbanColumnData>,
  cardId: string
): ColumnId | null {
  for (const colId of Object.keys(columns) as ColumnId[]) {
    if (columns[colId].cardIds.includes(cardId)) {
      return colId;
    }
  }
  return null;
}
