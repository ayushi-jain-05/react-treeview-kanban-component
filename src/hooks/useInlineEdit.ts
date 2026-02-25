import { useState, useCallback, useEffect } from "react";

export function useInlineEdit(
  initialValue: string,
  onSave: (value: string) => void
) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialValue);

  useEffect(() => {
    setDraft(initialValue);
  }, [initialValue]);

  const startEdit = useCallback(() => {
    setDraft(initialValue);
    setIsEditing(true);
  }, [initialValue]);

  const cancel = useCallback(() => {
    setDraft(initialValue);
    setIsEditing(false);
  }, [initialValue]);

  const save = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== initialValue) {
      onSave(trimmed);
    }
    setIsEditing(false);
  }, [draft, initialValue, onSave]);

  return { isEditing, draft, setDraft, startEdit, cancel, save };
}
