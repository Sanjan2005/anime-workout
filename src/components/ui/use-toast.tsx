"use client";

import * as React from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

const TOAST_LIMIT = 3;

type ToasterToast = {
  id: string;
  title?: string;
  description?: string;
};

const actionTypes = { ADD: "ADD", REMOVE: "REMOVE" } as const;

type Action =
  | { type: typeof actionTypes.ADD; toast: ToasterToast }
  | { type: typeof actionTypes.REMOVE; toastId: string };

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const listeners: Array<(state: ToasterToast[]) => void> = [];
let memoryState: ToasterToast[] = [];

function dispatch(action: Action) {
  if (action.type === "ADD") {
    memoryState = [action.toast, ...memoryState].slice(0, TOAST_LIMIT);
  } else {
    memoryState = memoryState.filter((t) => t.id !== action.toastId);
  }
  listeners.forEach((listener) => listener(memoryState));
}

export function toast({ title, description }: { title?: string; description?: string }) {
  const id = genId();
  dispatch({ type: "ADD", toast: { id, title, description } });
  setTimeout(() => dispatch({ type: "REMOVE", toastId: id }), 4000);
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const index = listeners.indexOf(setToasts);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id}>
          {t.title && <ToastTitle>{t.title}</ToastTitle>}
          {t.description && <ToastDescription>{t.description}</ToastDescription>}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
