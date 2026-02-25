import styles from "./IconButton.module.css";

interface IconButtonProps {
  icon: string;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  size?: "sm" | "md";
  variant?: "default" | "danger";
  className?: string;
}

export function IconButton({
  icon,
  label,
  onClick,
  size = "sm",
  variant = "default",
  className,
}: IconButtonProps) {
  return (
    <button
      className={`${styles.btn} ${styles[size]} ${styles[variant]} ${className ?? ""}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
