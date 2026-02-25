import {
  DndContext,
  closestCenter,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useCallback, useMemo } from "react";
import { useTreeData } from "../../hooks/useTreeData";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { TreeNodeItem } from "./TreeNodeItem";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import styles from "./TreeView.module.css";

export function TreeView() {
  const {
    flattenedNodes,
    addNode,
    deleteNode,
    updateNodeLabel,
    toggleExpand,
    handleMove,
  } = useTreeData();

  const { dialogState, requestConfirm, closeDialog } = useConfirmDialog();
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over || active.id === over.id) return;

      const activeNode = flattenedNodes.find((n) => n.id === active.id);
      const overNode = flattenedNodes.find((n) => n.id === over.id);
      if (!activeNode || !overNode) return;

      // If the over node is expanded and has children, drop as first child ("inside")
      // This lets users reparent by dropping onto an expanded parent node
      if (
        overNode.isExpanded &&
        (overNode.hasChildren || overNode.childrenCount > 0)
      ) {
        handleMove(active.id as string, over.id as string, "inside");
      } else {
        // Otherwise reorder — "after" works for both same-parent and cross-parent
        // because insertAtPosition is recursive
        handleMove(active.id as string, over.id as string, "after");
      }
    },
    [handleMove, flattenedNodes]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const node = flattenedNodes.find((n) => n.id === id);
      requestConfirm(
        "Delete Node",
        `Are you sure you want to delete "${node?.label}"${
          node?.childrenCount
            ? ` and its ${node.childrenCount} child node(s)`
            : ""
        }?`,
        () => deleteNode(id)
      );
    },
    [flattenedNodes, requestConfirm, deleteNode]
  );

  const activeNode = activeId
    ? flattenedNodes.find((n) => n.id === activeId)
    : null;

  const sortableIds = useMemo(
    () => flattenedNodes.map((n) => n.id),
    [flattenedNodes]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tree View</h2>
        <p className={styles.subtitle}>
          Drag to reorder or reparent &middot; Double-click to edit &middot;
          Lazy-loaded children
        </p>
      </div>

      <div className={styles.toolbar}>
        <button className={styles.addRootBtn} onClick={() => addNode(null)}>
          + Add Root Node
        </button>
      </div>

      <div className={styles.tree}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            {flattenedNodes.map((node) => (
              <TreeNodeItem
                key={node.id}
                node={node}
                onToggleExpand={toggleExpand}
                onAddChild={addNode}
                onDelete={handleDelete}
                onUpdateLabel={updateNodeLabel}
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeNode ? (
              <div className={styles.dragOverlay}>
                {activeNode.label}
                {activeNode.childrenCount > 0 && (
                  <span className={styles.badge}>
                    +{activeNode.childrenCount}
                  </span>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {flattenedNodes.length === 0 && (
          <div className={styles.empty}>
            No nodes yet. Click "Add Root Node" to get started.
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        confirmLabel="Delete"
        onConfirm={dialogState.onConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
