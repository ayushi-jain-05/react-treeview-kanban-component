export type ColumnId = "todo" | "in-progress" | "done";

export interface KanbanCard {
  id: string;
  title: string;
}

export interface KanbanColumnData {
  id: ColumnId;
  title: string;
  cardIds: string[];
}
