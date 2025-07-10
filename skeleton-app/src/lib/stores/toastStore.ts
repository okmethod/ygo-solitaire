import { writable } from "svelte/store";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<ToastMessage[]>([]);

  return {
    subscribe,
    add: (toast: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      update((toasts) => [...toasts, { ...toast, id }]);
    },
    remove: (id: string) => {
      update((toasts) => toasts.filter((t) => t.id !== id));
    },
    clear: () => {
      update(() => []);
    },
    // 便利メソッド
    success: (message: string, duration?: number) => {
      const id = Math.random().toString(36).substring(2, 9);
      update((toasts) => [...toasts, { id, message, type: "success", duration }]);
    },
    error: (message: string, duration?: number) => {
      const id = Math.random().toString(36).substring(2, 9);
      update((toasts) => [...toasts, { id, message, type: "error", duration }]);
    },
    info: (message: string, duration?: number) => {
      const id = Math.random().toString(36).substring(2, 9);
      update((toasts) => [...toasts, { id, message, type: "info", duration }]);
    },
    warning: (message: string, duration?: number) => {
      const id = Math.random().toString(36).substring(2, 9);
      update((toasts) => [...toasts, { id, message, type: "warning", duration }]);
    },
  };
}

export const toastStore = createToastStore();
