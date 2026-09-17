import { useCallback, useEffect, useState } from "react";

// Kept in sync with WINDOW_SIZE_PRESETS in electron/main.js — the renderer
// only ever sends a preset id over IPC, never raw pixels.
export const WINDOW_SIZE_PRESETS = [
  { id: "compact", label: "Compact (1024×768)" },
  { id: "standard", label: "Standard (1280×900)" },
  { id: "large", label: "Large (1600×1000)" },
] as const;

export type WindowSizePreset = (typeof WINDOW_SIZE_PRESETS)[number]["id"];

interface ElectronDisplayState {
  fullscreen: boolean;
  preset: WindowSizePreset | null;
}

interface ElectronAPI {
  isElectron: true;
  getDisplayState: () => Promise<ElectronDisplayState>;
  setFullscreen: (value: boolean) => Promise<ElectronDisplayState>;
  setWindowSize: (preset: WindowSizePreset) => Promise<ElectronDisplayState>;
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

  const setFullscreen = useCallback(
    async (value: boolean) => {
      if (!api) return;
      setState(await api.setFullscreen(value));
    },
    [api]
  );

  const setWindowSize = useCallback(
    async (preset: WindowSizePreset) => {
      if (!api) return;
      setState(await api.setWindowSize(preset));
    },
    [api]
  );

  return { available: !!api, state, setFullscreen, setWindowSize };
}
