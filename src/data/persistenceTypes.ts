import { Agent, AudioSettings, UiSettings, Weapon } from "../types/entities";

export type TableName = "weapons" | "agents";

export interface EntityMap {
  weapons: Weapon;
  agents: Agent;
}

/**
 * Storage boundary. Native builds implement this over expo-sqlite (real
 * tables). Web builds implement it over localStorage, since expo-sqlite's
 * web target is alpha/unstable — same shape either way, enforced by the app
 * layer (see data/store.ts) rather than the engine. No table references
 * another by id — abilities are authored inline on their Agent, and
 * agents/weapons are otherwise independent — so `remove` is a plain delete.
 */
export interface PersistenceAdapter {
  init(): Promise<void>;
  getAll<K extends TableName>(table: K): Promise<EntityMap[K][]>;
  upsert<K extends TableName>(table: K, row: EntityMap[K]): Promise<void>;
  remove(table: TableName, id: string): Promise<void>;
  getAudioSettings(): Promise<AudioSettings>;
  setAudioSettings(settings: AudioSettings): Promise<void>;
  getUiSettings(): Promise<UiSettings>;
  setUiSettings(settings: UiSettings): Promise<void>;
}
