import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FlattenedTreeNode } from "../../types/tree";
import { InlineEditInput } from "../shared/InlineEditInput";
import { IconButton } from "../shared/IconButton";
import styles from "./TreeNodeItem.module.css";

const DEPTH_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const INDENT = 60; // px per depth level

interface TreeNodeItemProps {
  node: FlattenedTreeNode;
  onToggleExpand: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
}

export function TreeNodeItem({
  node,
  onToggleExpand,
  onAddChild,
  onDelete,
  onUpdateLabel,
}: TreeNodeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${node.depth * INDENT}px`,
    opacity: isDragging ? 0.35 : 1,
  };

  const badgeLabel = DEPTH_LABELS[node.depth] ?? DEPTH_LABELS[DEPTH_LABELS.length - 1];

  const BADGE_DEPTH_CLASSES: Record<number, string> = {
    0: styles.badgeD0,
    1: styles.badgeD1,
    2: styles.badgeD2,
    3: styles.badgeD3,
  };

  const badgeClass = node.isLoading
    ? styles.badgeLoading
    : BADGE_DEPTH_CLASSES[node.depth] ?? styles.badgeDeep;

  // Build connector lines
  const connectors: React.ReactNode[] = [];

  if (node.depth > 0) {
    // For each ancestor depth d (0 to depth-2):
    // Draw a continuing vertical line if the ancestor at depth d+1 is NOT the last child.
    // That means the subtree at depth d still has more siblings below.
    for (let d = 0; d < node.depth - 1; d++) {
      const nextAncestorIsLast = node.ancestorIsLast[d + 1];
      if (!nextAncestorIsLast) {
        connectors.push(
          <div
            key={`v-${d}`}
            className={styles.connectorVert}
            style={{ left: `${d * INDENT + 19}px` }}
          />
        );
      }
    }

    // Direct parent connection at depth (node.depth - 1)
    const parentDepth = node.depth - 1;
    const lineLeft = parentDepth * INDENT + 19;

    if (node.isLastChild) {
      // Terminal: vertical line stops at the center of this row
      connectors.push(
        <div
          key="vt"
          className={styles.connectorVertTerminal}
          style={{ left: `${lineLeft}px` }}
        />
      );
    } else {
      // Continuing: vertical line runs full height of this row
      connectors.push(
        <div
          key="vc"
          className={styles.connectorVert}
          style={{ left: `${lineLeft}px` }}
        />
      );
    }

    // Horizontal connector from parent's vertical line to the badge
    connectors.push(
      <div
        key="h"
        className={styles.connectorHoriz}
        style={{
          left: `${lineLeft}px`,
          width: `${INDENT - 19 - 3}px`,
        }}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.row} ${isDragging ? styles.dragging : ""}`}
      {...attributes}
    >
      {connectors}

      <div
        className={`${styles.badge} ${badgeClass}`}
        onClick={() => onToggleExpand(node.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleExpand(node.id);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={node.isExpanded}
        aria-label={`${node.label} - ${node.isExpanded ? "collapse" : "expand"}`}
        title={
          node.hasChildren || node.childrenCount > 0
            ? node.isExpanded
              ? "Collapse"
              : "Expand"
            : node.label
        }
      >
        {node.isLoading ? <span className={styles.spinner} /> : badgeLabel}
      </div>

      <div className={styles.nodeCard} {...listeners}>
        <div className={styles.label}>
          <InlineEditInput
            value={node.label}
            onSave={(val) => onUpdateLabel(node.id, val)}
          />
        </div>

        <button
          className={styles.addBtn}
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(node.id);
          }}
          title="Add child node"
        >
          +
        </button>

        <IconButton
          icon="×"
          label="Delete node"
          variant="danger"
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
        />
      </div>
    </div>
  );
}
