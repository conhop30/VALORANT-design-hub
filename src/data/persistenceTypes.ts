import { Ability, Agent, AudioSettings, FeatureFlags, UiSettings, Weapon } from "../types/entities";

export type TableName = "abilities" | "weapons" | "agents";

export interface EntityMap {
  abilities: Ability;
  weapons: Weapon;
  agents: Agent;
}

/**
 * Storage boundary. Native builds implement this over expo-sqlite (real tables,
 * real foreign keys). Web builds implement it over localStorage, since
 * expo-sqlite's web target is alpha/unstable — same relational shape either
 * way, enforced by the app layer (see data/store.ts) rather than the engine.
 */
export interface PersistenceAdapter {
  init(): Promise<void>;
  getAll<K extends TableName>(table: K): Promise<EntityMap[K][]>;
  upsert<K extends TableName>(table: K, row: EntityMap[K]): Promise<void>;
  /** Rejects if another row still references this id (FK safety net for hard deletes). */
  remove(table: TableName, id: string): Promise<void>;
  getFeatureFlags(): Promise<FeatureFlags>;
  setFeatureFlags(flags: FeatureFlags): Promise<void>;
  getAudioSettings(): Promise<AudioSettings>;
  setAudioSettings(settings: AudioSettings): Promise<void>;
  getUiSettings(): Promise<UiSettings>;
  setUiSettings(settings: UiSettings): Promise<void>;
}
