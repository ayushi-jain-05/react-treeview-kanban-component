import { useState, useCallback } from "react";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const INITIAL_STATE: ConfirmDialogState = {
  isOpen: false,
  title: "",
  message: "",
  onConfirm: () => {},
};

export function useConfirmDialog() {
  const [dialogState, setDialogState] =
    useState<ConfirmDialogState>(INITIAL_STATE);

  const requestConfirm = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      setDialogState({ isOpen: true, title, message, onConfirm });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogState(INITIAL_STATE);
  }, []);

  return { dialogState, requestConfirm, closeDialog };
}
