import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { TreeView } from "./components/tree/TreeView";
import { KanbanBoard } from "./components/kanban/KanbanBoard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/tree" replace /> },
      { path: "tree", element: <TreeView /> },
      { path: "kanban", element: <KanbanBoard /> },
    ],
  },
]);