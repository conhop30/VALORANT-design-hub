import { create } from "zustand";
import {
  Ability,
  Agent,
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_UI_SETTINGS,
  FeatureFlags,
  UiSettings,
  Weapon,
} from "../types/entities";
import { abilityRepo, agentRepo, configRepo, weaponRepo } from "./repository";

export type RefStatus<T> = { status: "found"; record: T } | { status: "missing" };

/**
 * Derives status from an already-selected record. Kept as a plain function
 * (not a store selector) — a Zustand selector must return a referentially
 * stable value when the underlying state hasn't changed, and a function that
 * builds a new `{status, record}` object every call breaks that, causing an
 * infinite render loop (`useSyncExternalStore` "getSnapshot should be cached").
 * Select the raw record with a store selector, then call this on the result.
 */
export function toRefStatus<T>(record: T | undefined): RefStatus<T> {
  if (!record) return { status: "missing" };
  return { status: "found", record };
}

interface DesignStore {
  hydrated: boolean;
  abilities: Record<string, Ability>;
  weapons: Record<string, Weapon>;
  agents: Record<string, Agent>;
  featureFlags: FeatureFlags;
  audioSettings: AudioSettings;
  uiSettings: UiSettings;
  lastError: string | null;

  hydrate: () => Promise<void>;
  dismissError: () => void;

  saveAbility: (a: Ability) => Promise<boolean>;
  removeAbility: (id: string) => Promise<boolean>;
  saveWeapon: (w: Weapon) => Promise<boolean>;
  removeWeapon: (id: string) => Promise<boolean>;
  saveAgent: (a: Agent) => Promise<boolean>;
  removeAgent: (id: string) => Promise<boolean>;
  setFeatureFlag: (key: keyof FeatureFlags, value: boolean) => Promise<void>;
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
  abilities: {},
  weapons: {},
  agents: {},
  featureFlags: DEFAULT_FEATURE_FLAGS,
  audioSettings: DEFAULT_AUDIO_SETTINGS,
  uiSettings: DEFAULT_UI_SETTINGS,
  lastError: null,

  hydrate: async () => {
    const init = await configRepo.init();
    if (!init.ok) {
      set({ lastError: init.error });
      return;
    }
    const [abilities, weapons, agents, flags, audio, ui] = await Promise.all([
      abilityRepo.list(),
      weaponRepo.list(),
      agentRepo.list(),
      configRepo.getFeatureFlags(),
      configRepo.getAudioSettings(),
      configRepo.getUiSettings(),
    ]);
    set({
      abilities: abilities.ok ? toRecord(abilities.value) : {},
      weapons: weapons.ok ? toRecord(weapons.value) : {},
      agents: agents.ok ? toRecord(agents.value) : {},
      featureFlags: flags.ok ? flags.value : DEFAULT_FEATURE_FLAGS,
      audioSettings: audio.ok ? audio.value : DEFAULT_AUDIO_SETTINGS,
      uiSettings: ui.ok ? ui.value : DEFAULT_UI_SETTINGS,
      lastError: !abilities.ok
        ? abilities.error
        : !weapons.ok
        ? weapons.error
        : !agents.ok
        ? agents.error
        : !flags.ok
        ? flags.error
        : !audio.ok
        ? audio.error
        : !ui.ok
        ? ui.error
        : null,
      hydrated: true,
    });
  },

  dismissError: () => set({ lastError: null }),

  saveAbility: async (a) => {
    const res = await abilityRepo.save(a);
    if (!res.ok) {
      set({ lastError: res.error });
      return false;
    }
    set((s) => ({ abilities: { ...s.abilities, [a.id]: a } }));
    return true;
  },

  removeAbility: async (id) => {
    const res = await abilityRepo.remove(id);
    if (!res.ok) {
      set({ lastError: res.error });
      return false;
    }
    set((s) => {
      const next = { ...s.abilities };
      delete next[id];
      return { abilities: next };
    });
    return true;
  },

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

  setFeatureFlag: async (key, value) => {
    const next = { ...get().featureFlags, [key]: value };
    const res = await configRepo.setFeatureFlags(next);
    if (!res.ok) {
      set({ lastError: res.error });
      return;
    }
    set({ featureFlags: next });
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
