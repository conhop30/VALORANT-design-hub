import { create } from "zustand";
import {
  Agent,
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_UI_SETTINGS,
  UiSettings,
  Weapon,
} from "../types/entities";
import { agentRepo, configRepo, weaponRepo } from "./repository";

interface DesignStore {
  hydrated: boolean;
  weapons: Record<string, Weapon>;
  agents: Record<string, Agent>;
  audioSettings: AudioSettings;
  uiSettings: UiSettings;
  lastError: string | null;

  hydrate: () => Promise<void>;
  dismissError: () => void;

  saveWeapon: (w: Weapon) => Promise<boolean>;
  removeWeapon: (id: string) => Promise<boolean>;
  saveAgent: (a: Agent) => Promise<boolean>;
  removeAgent: (id: string) => Promise<boolean>;
  setAudioSetting: <K extends keyof AudioSettings>(
    key: K,
    value: AudioSettings[K]
  ) => Promise<void>;
  setUiSetting: <K extends keyof UiSettings>(
    key: K,
    value: UiSettings[K]
  ) => Promise<void>;
}

function toRecord<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((i) => [i.id, i]));
}

export const useDesignStore = create<DesignStore>((set, get) => ({
  hydrated: false,
  weapons: {},
  agents: {},
  audioSettings: DEFAULT_AUDIO_SETTINGS,
  uiSettings: DEFAULT_UI_SETTINGS,
  lastError: null,

  hydrate: async () => {
    const init = await configRepo.init();
    if (!init.ok) {
      set({ lastError: init.error });
      return;
    }
    const [weapons, agents, audio, ui] = await Promise.all([
      weaponRepo.list(),
      agentRepo.list(),
      configRepo.getAudioSettings(),
      configRepo.getUiSettings(),
    ]);
    set({
      weapons: weapons.ok ? toRecord(weapons.value) : {},
      agents: agents.ok ? toRecord(agents.value) : {},
      audioSettings: audio.ok ? audio.value : DEFAULT_AUDIO_SETTINGS,
      uiSettings: ui.ok ? ui.value : DEFAULT_UI_SETTINGS,
      lastError: !weapons.ok
        ? weapons.error
        : !agents.ok
        ? agents.error
        : !audio.ok
        ? audio.error
        : !ui.ok
        ? ui.error
        : null,
      hydrated: true,
    });
  },

  dismissError: () => set({ lastError: null }),

  saveWeapon: async (w) => {
    const res = await weaponRepo.save(w);
    if (!res.ok) {
      set({ lastError: res.error });
      return false;
    }
    set((s) => ({ weapons: { ...s.weapons, [w.id]: w } }));
    return true;
  },

  removeWeapon: async (id) => {
    const res = await weaponRepo.remove(id);
    if (!res.ok) {
      set({ lastError: res.error });
      return false;
    }
    set((s) => {
      const next = { ...s.weapons };
      delete next[id];
      return { weapons: next };
    });
    return true;
  },

  saveAgent: async (a) => {
    const res = await agentRepo.save(a);
    if (!res.ok) {
      set({ lastError: res.error });
      return false;
    }
    set((s) => ({ agents: { ...s.agents, [a.id]: a } }));
    return true;
  },

  removeAgent: async (id) => {
    const res = await agentRepo.remove(id);
    if (!res.ok) {
      set({ lastError: res.error });
      return false;
    }
    set((s) => {
      const next = { ...s.agents };
      delete next[id];
      return { agents: next };
    });
    return true;
  },

  setAudioSetting: async (key, value) => {
    const next = { ...get().audioSettings, [key]: value };
    const res = await configRepo.setAudioSettings(next);
    if (!res.ok) {
      set({ lastError: res.error });
      return;
    }
    set({ audioSettings: next });
  },

  setUiSetting: async (key, value) => {
    const next = { ...get().uiSettings, [key]: value };
    const res = await configRepo.setUiSettings(next);
    if (!res.ok) {
      set({ lastError: res.error });
      return;
    }
    set({ uiSettings: next });
  },
}));
