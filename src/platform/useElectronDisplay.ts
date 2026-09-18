import { useCallback, useEffect, useState } from "react";

// Kept in sync with SIZE_PRESETS in electron/main.js — the renderer only
// ever sends a mode id over IPC, never raw pixels. "fullscreenWindow" is a
// maximized-but-still-windowed state (title bar stays); "fullscreen" is true
// OS fullscreen (no window chrome at all).
export const SCREEN_SIZE_OPTIONS = [
  { id: "compact", label: "Compact (1024×768)" },
  { id: "standard", label: "Standard (1280×900)" },
  { id: "large", label: "Large (1600×1000)" },
  { id: "fullscreenWindow", label: "Fullscreen (window)" },
  { id: "fullscreen", label: "Fullscreen" },
] as const;

export type DisplayMode = (typeof SCREEN_SIZE_OPTIONS)[number]["id"];

interface ElectronDisplayState {
  mode: DisplayMode | null;
}

interface ElectronAPI {
  isElectron: true;
  getDisplayState: () => Promise<ElectronDisplayState>;
  setDisplayMode: (mode: DisplayMode) => Promise<ElectronDisplayState>;
}

function getElectronAPI(): ElectronAPI | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { electronAPI?: ElectronAPI }).electronAPI ?? null;
}

/** No-op (state always null) outside the Electron desktop build. */
export function useElectronDisplay() {
  const api = getElectronAPI();
  const [state, setState] = useState<ElectronDisplayState | null>(null);

  useEffect(() => {
    if (!api) return;
    api.getDisplayState().then(setState);
  }, [api]);

  const setMode = useCallback(
    async (mode: DisplayMode) => {
      if (!api) return;
      setState(await api.setDisplayMode(mode));
    },
    [api]
  );

  return { available: !!api, state, setMode };
}
