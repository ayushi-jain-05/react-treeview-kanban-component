import { useRef, useEffect } from "react";
import { useInlineEdit } from "../../hooks/useInlineEdit";
import styles from "./InlineEditInput.module.css";

interface InlineEditInputProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
}

export function InlineEditInput({
  value,
  onSave,
  className,
}: InlineEditInputProps) {
  const { isEditing, draft, setDraft, startEdit, cancel, save } =
    useInlineEdit(value, onSave);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        className={`${styles.input} ${className ?? ""}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") cancel();
        }}
        onBlur={save}
      />
    );
  }

  return (
    <span
      className={`${styles.label} ${className ?? ""}`}
      onDoubleClick={startEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "F2") startEdit();
      }}
      role="button"
      tabIndex={0}
      title="Double-click to edit"
    >
      {value}
    </span>
  );
}
