import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { TreeNode } from "../types/tree";
import {
  flattenTree,
  findNodeById,
  insertNode,
  removeNode,
  updateNode,
  moveNode,
  generateLazyChildren,
} from "../utils/tree-helpers";
import { generateId } from "../utils/id";

const INITIAL_DATA: TreeNode[] = [
  {
    id: generateId(),
    label: "Root",
    isExpanded: true,
    isLoading: false,
    hasChildren: true,
    children: [
      {
        id: generateId(),
        label: "src",
        isExpanded: false,
        isLoading: false,
        hasChildren: true,
        children: [
          {
            id: generateId(),
            label: "components",
            isExpanded: false,
            isLoading: false,
            hasChildren: true,
            children: [],
          },
          {
            id: generateId(),
            label: "utils",
            isExpanded: false,
            isLoading: false,
            hasChildren: true,
            children: [],
          },
          {
            id: generateId(),
            label: "App.tsx",
            isExpanded: false,
            isLoading: false,
            hasChildren: false,
            children: [],
          },
        ],
      },
      {
        id: generateId(),
        label: "public",
        isExpanded: false,
        isLoading: false,
        hasChildren: true,
        children: [],
      },
      {
        id: generateId(),
        label: "package.json",
        isExpanded: false,
        isLoading: false,
        hasChildren: false,
        children: [],
      },
    ],
  },
];

export function useTreeData() {
  const [roots, setRoots] = useState<TreeNode[]>(INITIAL_DATA);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  const flattenedNodes = useMemo(() => flattenTree(roots), [roots]);

  const addNode = useCallback((parentId: string | null) => {
    const name = prompt("Enter node name:");
    if (!name?.trim()) return;
    const newNode: TreeNode = {
      id: generateId(),
      label: name.trim(),
      children: [],
      isExpanded: false,
      isLoading: false,
      hasChildren: false,
    };
    setRoots((prev) => insertNode(prev, parentId, newNode));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setRoots((prev) => removeNode(prev, id));
  }, []);

  const updateNodeLabel = useCallback((id: string, label: string) => {
    setRoots((prev) => updateNode(prev, id, { label }));
  }, []);

  const toggleExpand = useCallback(async (id: string) => {
    // Use functional setState to read fresh state and avoid stale closures
    let needsLazyLoad = false;
    let nodeLabel = "";

    setRoots((prev) => {
      const found = findNodeById(prev, id);
      if (!found) return prev;
      const node = found.node;

      // Guard: don't act if already loading
      if (node.isLoading) return prev;

      if (!node.isExpanded && node.hasChildren && node.children.length === 0) {
        // Needs lazy load — set loading state and flag for async work
        needsLazyLoad = true;
        nodeLabel = node.label;
        return updateNode(prev, id, { isLoading: true });
      }

      // Normal toggle
      return updateNode(prev, id, { isExpanded: !node.isExpanded });
    });

    if (needsLazyLoad) {
      // Simulate API call
      await new Promise((resolve) =>
        setTimeout(resolve, 600 + Math.random() * 400)
      );

      // Guard against state update after unmount
      if (!isMountedRef.current) return;

      const children = generateLazyChildren(nodeLabel);
      setRoots((prev) =>
        updateNode(prev, id, {
          children,
          isLoading: false,
          isExpanded: true,
        })
      );
    }
  }, []);

  const handleMove = useCallback(
    (
      activeId: string,
      overId: string,
      position: "before" | "after" | "inside"
    ) => {
      if (activeId === overId) return;
      setRoots((prev) => {
        // Prevent dropping a node into its own descendant (for ANY position)
        const activeResult = findNodeById(prev, activeId);
        if (!activeResult) return prev;
        if (findNodeById(activeResult.node.children, overId)) return prev;
        return moveNode(prev, activeId, overId, position);
      });
    },
    []
  );

  return {
    roots,
    flattenedNodes,
    addNode,
    deleteNode,
    updateNodeLabel,
    toggleExpand,
    handleMove,
  };
}
