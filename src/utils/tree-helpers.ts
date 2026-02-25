import type { TreeNode, FlattenedTreeNode } from "../types/tree";

export function flattenTree(
  nodes: TreeNode[],
  parentId: string | null = null,
  depth: number = 0,
  ancestorIsLast: boolean[] = []
): FlattenedTreeNode[] {
  const result: FlattenedTreeNode[] = [];

  nodes.forEach((node, index) => {
    const childrenCount = countDescendants(node);
    const isLastChild = index === nodes.length - 1;

    result.push({
      id: node.id,
      label: node.label,
      depth,
      parentId,
      index,
      isExpanded: node.isExpanded,
      isLoading: node.isLoading,
      hasChildren: node.hasChildren,
      childrenCount,
      isLastChild,
      ancestorIsLast: [...ancestorIsLast],
    });

    if (node.isExpanded && node.children.length > 0) {
      result.push(
        ...flattenTree(node.children, node.id, depth + 1, [
          ...ancestorIsLast,
          isLastChild,
        ])
      );
    }
  });

  return result;
}

function countDescendants(node: TreeNode): number {
  let count = node.children.length;
  for (const child of node.children) {
    count += countDescendants(child);
  }
  return count;
}

export function findNodeById(
  nodes: TreeNode[],
  id: string
): { node: TreeNode; parent: TreeNode[]; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      return { node: nodes[i], parent: nodes, index: i };
    }
    if (nodes[i].children.length > 0) {
      const found = findNodeById(nodes[i].children, id);
      if (found) return found;
    }
  }
  return null;
}

export function insertNode(
  roots: TreeNode[],
  parentId: string | null,
  newNode: TreeNode
): TreeNode[] {
  if (parentId === null) {
    return [...roots, newNode];
  }
  return roots.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...node.children, newNode],
        isExpanded: true,
        hasChildren: true,
      };
    }
    if (node.children.length > 0) {
      return {
        ...node,
        children: insertNode(node.children, parentId, newNode),
      };
    }
    return node;
  });
}

export function removeNode(roots: TreeNode[], id: string): TreeNode[] {
  return roots
    .filter((node) => node.id !== id)
    .map((node) => {
      const updatedChildren = removeNode(node.children, id);
      return {
        ...node,
        children: updatedChildren,
        hasChildren: updatedChildren.length > 0 || node.hasChildren,
      };
    });
}

export function updateNode(
  roots: TreeNode[],
  id: string,
  patch: Partial<TreeNode>
): TreeNode[] {
  return roots.map((node) => {
    if (node.id === id) {
      return { ...node, ...patch };
    }
    if (node.children.length > 0) {
      return { ...node, children: updateNode(node.children, id, patch) };
    }
    return node;
  });
}

export function moveNode(
  roots: TreeNode[],
  activeId: string,
  overId: string,
  position: "before" | "after" | "inside"
): TreeNode[] {
  const activeResult = findNodeById(roots, activeId);
  if (!activeResult) return roots;

  const activeNode = { ...activeResult.node };
  let newRoots = removeNode(roots, activeId);

  if (position === "inside") {
    newRoots = insertNode(newRoots, overId, activeNode);
  } else {
    newRoots = insertAtPosition(newRoots, overId, activeNode, position);
  }

  return newRoots;
}

function insertAtPosition(
  nodes: TreeNode[],
  targetId: string,
  newNode: TreeNode,
  position: "before" | "after"
): TreeNode[] {
  const result: TreeNode[] = [];

  for (const node of nodes) {
    if (node.id === targetId) {
      if (position === "before") {
        result.push(newNode);
        result.push(node);
      } else {
        result.push(node);
        result.push(newNode);
      }
    } else {
      result.push({
        ...node,
        children: insertAtPosition(node.children, targetId, newNode, position),
      });
    }
  }

  return result;
}

export function isDescendant(
  roots: TreeNode[],
  nodeId: string,
  potentialAncestorId: string
): boolean {
  const ancestor = findNodeById(roots, potentialAncestorId);
  if (!ancestor) return false;
  return findNodeById(ancestor.node.children, nodeId) !== null;
}

const lazyChildrenPool = [
  "Documents",
  "Pictures",
  "Videos",
  "Music",
  "Archive",
  "Backup",
  "Logs",
  "Config",
  "Templates",
  "Scripts",
  "Data",
  "Reports",
];

function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateLazyChildren(parentLabel: string): TreeNode[] {
  const count = 2 + Math.floor(Math.random() * 3);
  const shuffled = fisherYatesShuffle(lazyChildrenPool);
  return shuffled.slice(0, count).map((name) => ({
    id: crypto.randomUUID(),
    label: `${parentLabel}/${name}`,
    children: [],
    isExpanded: false,
    isLoading: false,
    hasChildren: Math.random() > 0.5,
  }));
}
