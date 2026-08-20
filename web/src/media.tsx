import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { readJson, writeJson } from "./lib";

export type MediaItem = {
  id: string;
  title: string;
  url: string;
};

const KEY = "demo.media";

type MediaContextValue = {
  items: MediaItem[];
  add: (input: { title: string; url: string }) => MediaItem;
  update: (id: string, input: { title: string; url: string }) => void;
  remove: (id: string) => void;
  get: (id: string) => MediaItem | undefined;
};

const MediaContext = createContext<MediaContextValue | null>(null);

function isMediaItem(value: unknown): value is MediaItem {
  if (!value || typeof value !== "object") return false;
  const item = value as MediaItem;
  return (
    typeof item.id === "string" && typeof item.title === "string" && typeof item.url === "string"
  );
}

export function MediaProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MediaItem[]>(() => {
    const stored = readJson<unknown>(KEY, []);
    return Array.isArray(stored) ? stored.filter(isMediaItem) : [];
  });

  const persist = (next: MediaItem[]) => {
    setItems(next);
    writeJson(KEY, next);
  };

  const value = useMemo<MediaContextValue>(
    () => ({
      items,
      add: ({ title, url }) => {
        const item = { id: crypto.randomUUID(), title: title.trim(), url: url.trim() };
        persist([...items, item]);
        return item;
      },
      update: (id, { title, url }) => {
        persist(
          items.map((item) =>
            item.id === id ? { ...item, title: title.trim(), url: url.trim() } : item,
          ),
        );
      },
      remove: (id) => {
        persist(items.filter((item) => item.id !== id));
      },
      get: (id) => items.find((item) => item.id === id),
    }),
    [items],
  );

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export function useMedia() {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error("useMedia must be used within MediaProvider");
  return ctx;
}
