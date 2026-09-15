import {
  Agent,
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_FEATURE_FLAGS,
  FeatureFlags,
} from "../types/entities";
import { EntityMap, PersistenceAdapter, TableName } from "./persistenceTypes";

const KEY_PREFIX = "valorant-agent-designer:";
const tableKey = (table: TableName) => `${KEY_PREFIX}${table}`;
const flagsKey = `${KEY_PREFIX}feature_flags`;
const audioKey = `${KEY_PREFIX}audio_settings`;

function readTable<K extends TableName>(table: K): EntityMap[K][] {
  const raw = localStorage.getItem(tableKey(table));
  return raw ? JSON.parse(raw) : [];
}

function writeTable<K extends TableName>(table: K, rows: EntityMap[K][]): void {
  localStorage.setItem(tableKey(table), JSON.stringify(rows));
}

function isReferenced(table: TableName, id: string): boolean {
  if (table === "abilities") {
    const agents = readTable("agents") as Agent[];
    return agents.some((a) => Object.values(a.abilityIds).includes(id));
  }
  return false;
}

export const persistence: PersistenceAdapter = {
  async init() {
    // Nothing to migrate — localStorage reads default to empty arrays.
  },

  async getAll(table) {
    return readTable(table);
  },

  async upsert(table, row) {
    const rows = readTable(table);
    const index = rows.findIndex((r) => r.id === row.id);
    if (index >= 0) {
      rows[index] = row;
    } else {
      rows.push(row);
    }
    writeTable(table, rows);
  },

  async remove(table, id) {
    if (isReferenced(table, id)) {
      throw new Error(
        "This record is still used by an Agent — remove the referencing Agent first."
      );
    }
    const rows = readTable(table);
    writeTable(
      table,
      rows.filter((r) => r.id !== id)
    );
  },

  async getFeatureFlags() {
    const raw = localStorage.getItem(flagsKey);
    return raw ? JSON.parse(raw) : DEFAULT_FEATURE_FLAGS;
  },

  async setFeatureFlags(flags: FeatureFlags) {
    localStorage.setItem(flagsKey, JSON.stringify(flags));
  },

  async getAudioSettings() {
    const raw = localStorage.getItem(audioKey);
    return raw ? JSON.parse(raw) : DEFAULT_AUDIO_SETTINGS;
  },

  async setAudioSettings(settings: AudioSettings) {
    localStorage.setItem(audioKey, JSON.stringify(settings));
  },
};
