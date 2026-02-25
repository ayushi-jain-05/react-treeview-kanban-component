# React Assessment — Tree View & Kanban Board

**Live:** [https://react-treeview-kanban-component.vercel.app](https://react-treeview-kanban-component.vercel.app)

Both questions built in a single React + TypeScript project. They share enough in common (drag-and-drop, inline editing, confirmation dialogs) that it made sense to combine them with React Router rather than making two separate apps.

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
```

## Project Structure

```
src/
  types/          — TreeNode, KanbanCard, etc.
  utils/          — pure helper functions (no React dependency)
  hooks/          — useTreeData, useKanbanData, useInlineEdit, useConfirmDialog
  components/
    tree/         — TreeView, TreeNodeItem
    kanban/       — KanbanBoard, KanbanColumn, KanbanCard
    shared/       — InlineEditInput, ConfirmDialog, IconButton
    layout/       — AppLayout (nav + routes)
```

All the logic lives in custom hooks. Components are mostly just rendering. The utility functions in `utils/` are pure — no React, just data in → data out — which makes them easy to reason about and test.

---

## Question 1 — Tree View

**What it does:** Expand/collapse, add/remove/edit nodes, drag-and-drop (same level + cross-parent), and lazy loading with simulated async calls.

**Key decisions:**

- **Nested data, flat rendering** — The tree state is stored as nested `TreeNode[]` (natural for CRUD operations), but I flatten it into an array for rendering. This is necessary because `@dnd-kit/sortable` needs a flat ID list, and it also simplifies the connector line logic.

- **Connector lines** — Each node carries an `ancestorIsLast[]` array that tracks whether each ancestor is the last child at its depth. This tells the renderer where to draw (or not draw) vertical continuation lines. Took some trial and error to get right for deeply nested trees.

- **Cross-parent drag-and-drop** — Dropping a node onto an expanded parent inserts it as a child. There's a guard to prevent dropping a node into its own subtree (which would create a cycle).

- **Lazy loading** — Nodes with `hasChildren: true` but empty `children[]` fetch data on first expand. I simulate a 600-1000ms API delay. There's a race condition guard using functional setState — if the user clicks rapidly, the second click is ignored while the first is still loading.

- **Functional setState everywhere** — All handlers use `setRoots(prev => ...)` instead of reading state directly. This avoids stale closure bugs during rapid DnD operations and lets me use `useCallback` with empty deps.

**Data model:**
```typescript
interface TreeNode {
  id: string;
  label: string;
  children: TreeNode[];
  isExpanded: boolean;
  isLoading: boolean;
  hasChildren: boolean;  // lazy-load hint
}

// Flattened for rendering (derived via useMemo)
interface FlattenedTreeNode extends Omit<TreeNode, 'children'> {
  depth: number;
  parentId: string | null;
  childrenCount: number;
  isLastChild: boolean;
  ancestorIsLast: boolean[];
}
```

---

## Question 2 — Kanban Board

**What it does:** Three columns (Todo, In Progress, Done), add/delete cards, drag across columns, inline editable titles, responsive layout.

**Key decisions:**

- **Normalized state** — Cards are stored in a flat `Record<string, KanbanCard>` map, and columns hold ordered `cardIds[]` arrays. Moving a card between columns is just splicing an ID from one array to another — O(1).

- **Real-time cross-column feedback** — Card movement happens in `onDragOver` (not `onDragEnd`), so you see the card slot into the new column while still dragging. Much smoother UX.

- **DragOverlay** — Renders a floating clone of the card during drag. Without this, the original card just disappears and the drag feels janky.

- **Responsive** — Columns use flexbox and stack vertically below 768px.

- **Sensors** — PointerSensor (with 8px distance threshold to avoid accidental drags), TouchSensor (with delay for mobile), and KeyboardSensor for accessibility.

---

## Shared Components

Both features reuse:

- **InlineEditInput** — Double-click to edit, Enter/blur to save, Escape to cancel. Backed by a `useInlineEdit` hook.
- **ConfirmDialog** — Portal-based modal (rendered at `document.body` via `createPortal`). Initially tried native `<dialog>` but had positioning issues inside scrollable containers, so switched to a portal approach. Has backdrop click-to-close, Escape support, and auto-focuses the confirm button.
- **IconButton** — Small action button with size and color variants.
- **ErrorBoundary** — Wraps the entire app. Class component (only valid use case for one in React). Shows a fallback UI with retry instead of a white screen if something crashes.

## Styling approach

CSS Modules for scoping — no runtime cost, no extra deps. I set up CSS custom properties (`:root` variables) for colors, spacing, and radii so the whole theme is controlled from one place. Picked this over styled-components or Tailwind because it keeps styles colocated with components without adding bundle size, and the design token setup means swapping a color or spacing value is a single-line change.

## Tech Stack

- React 19 + TypeScript + Vite
- `@dnd-kit` for drag-and-drop (both features)
- React Router for navigation
- CSS Modules with CSS custom properties for theming
- No state management library — state is local to each page via hooks
- No component library — everything custom, wanted to show I understand the underlying patterns rather than just wiring up a library

## What I'd add with more time

- Tests for the pure utility functions (they're already structured for it — pure functions, no mocking needed)
- `react-window` for virtualizing large trees
- `localStorage` persistence so the board state survives refresh
- Expand/collapse animations with `framer-motion`
- Undo/redo — would use a command pattern with a history stack, similar to what I've seen work well in content-heavy UIs
- Git hooks via Husky + lint-staged — run linting and type checks before every commit so broken code never makes it into the repo
