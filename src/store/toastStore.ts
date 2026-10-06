import { create } from "zustand";

export interface ToastMessage {
  id: number;
  text: string;
  action?: { label: string; onClick: () => void };
}

interface ToastStore {
  toast: ToastMessage | null;
  show: (text: string, action?: ToastMessage["action"]) => void;
  dismiss: () => void;
}

let seq = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  show: (text, action) => {
    clearTimeout(timer);
    const id = ++seq;
    set({ toast: { id, text, action } });
    timer = setTimeout(() => set((s) => (s.toast?.id === id ? { toast: null } : s)), action ? 6000 : 3000);
  },
  dismiss: () => set({ toast: null }),
}));
