import { create } from "zustand";
import { loadBookmarks, setBookmark } from "@/lib/db";
import { enqueue } from "@/lib/sync";

interface BookmarkStore {
  keys: string[];
  hydrate: () => Promise<void>;
  toggle: (duaKey: string) => Promise<void>;
}

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  keys: [],
  hydrate: async () => set({ keys: await loadBookmarks() }),
  toggle: async (duaKey) => {
    const on = !get().keys.includes(duaKey);
    set({ keys: on ? [duaKey, ...get().keys] : get().keys.filter((k) => k !== duaKey) });
    await setBookmark(duaKey, on);
    await enqueue({ type: "bookmark", duaKey, on });
  },
}));
