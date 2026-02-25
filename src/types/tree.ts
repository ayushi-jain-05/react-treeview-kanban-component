export interface TreeNode {
  id: string;
  label: string;
  children: TreeNode[];
  isExpanded: boolean;
  isLoading: boolean;
  hasChildren: boolean;
}

export interface FlattenedTreeNode {
  id: string;
  label: string;
  depth: number;
  parentId: string | null;
  index: number;
  isExpanded: boolean;
  isLoading: boolean;
  hasChildren: boolean;
  childrenCount: number;
  isLastChild: boolean;
  /** For each ancestor depth, whether that ancestor is the last child at its level */
  ancestorIsLast: boolean[];
}
