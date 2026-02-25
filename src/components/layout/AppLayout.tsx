import { NavLink, Outlet } from "react-router-dom";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.logo}>React Assessment</h1>
        <nav className={styles.nav}>
          <NavLink
            to="/tree"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Tree View
          </NavLink>
          <NavLink
            to="/kanban"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Kanban Board
          </NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
