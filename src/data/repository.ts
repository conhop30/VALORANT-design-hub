import { Ability, Agent, AudioSettings, FeatureFlags, Weapon } from "../types/entities";
import { persistence } from "./persistenceImpl";
import { TableName } from "./persistenceTypes";

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

async function attempt<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    const value = await fn();
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function makeRepo<T extends { id: string }>(table: TableName) {
  return {
    list: (): Promise<Result<T[]>> =>
      attempt(() => persistence.getAll(table) as unknown as Promise<T[]>),
    save: (row: T): Promise<Result<void>> =>
      attempt(() => persistence.upsert(table, row as any)),
    remove: (id: string): Promise<Result<void>> =>
      attempt(() => persistence.remove(table, id)),
  };
}

export const abilityRepo = makeRepo<Ability>("abilities");
export const weaponRepo = makeRepo<Weapon>("weapons");
export const agentRepo = makeRepo<Agent>("agents");

export const configRepo = {
  init: (): Promise<Result<void>> => attempt(() => persistence.init()),
  getFeatureFlags: (): Promise<Result<FeatureFlags>> =>
    attempt(() => persistence.getFeatureFlags()),
  setFeatureFlags: (flags: FeatureFlags): Promise<Result<void>> =>
    attempt(() => persistence.setFeatureFlags(flags)),
  getAudioSettings: (): Promise<Result<AudioSettings>> =>
    attempt(() => persistence.getAudioSettings()),
  setAudioSettings: (settings: AudioSettings): Promise<Result<void>> =>
    attempt(() => persistence.setAudioSettings(settings)),
};
