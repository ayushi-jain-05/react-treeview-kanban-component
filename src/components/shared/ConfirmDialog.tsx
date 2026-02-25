import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={(e) => {
        // Close when clicking the backdrop (not the dialog itself)
        if (e.target === e.currentTarget) onCancel();
      }}
      role="presentation"
    >
      <div className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className={styles.content}>
          <h3 id="confirm-title" className={styles.title}>{title}</h3>
          <p className={styles.message}>{message}</p>
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
            <button
              ref={confirmRef}
              className={styles.confirmBtn}
              onClick={() => {
                onConfirm();
                onCancel();
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
