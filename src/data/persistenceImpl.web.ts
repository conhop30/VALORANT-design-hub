import {
  Agent,
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_UI_SETTINGS,
  FeatureFlags,
  UiSettings,
} from "../types/entities";
import { EntityMap, PersistenceAdapter, TableName } from "./persistenceTypes";
import { normalizeAgentAbilities } from "./normalizeAgent";

const KEY_PREFIX = "valorant-agent-designer:";
const tableKey = (table: TableName) => `${KEY_PREFIX}${table}`;
const flagsKey = `${KEY_PREFIX}feature_flags`;
const audioKey = `${KEY_PREFIX}audio_settings`;
const uiKey = `${KEY_PREFIX}ui_settings`;

function readTable<K extends TableName>(table: K): EntityMap[K][] {
  const raw = localStorage.getItem(tableKey(table));
  return raw ? JSON.parse(raw) : [];
}

function writeTable<K extends TableName>(table: K, rows: EntityMap[K][]): void {
  localStorage.setItem(tableKey(table), JSON.stringify(rows));
}

export const persistence: PersistenceAdapter = {
  async init() {
    // Nothing to migrate — localStorage reads default to empty arrays.
  },

  async getAll(table) {
    const rows = readTable(table);
    if (table === "agents") {
      return (rows as Agent[]).map((r) => ({
        ...r,
        abilities: normalizeAgentAbilities(r.abilities),
      })) as EntityMap[typeof table][];
    }
    return rows;
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

  async getUiSettings() {
    const raw = localStorage.getItem(uiKey);
    return raw ? JSON.parse(raw) : DEFAULT_UI_SETTINGS;
  },

  async setUiSettings(settings: UiSettings) {
    localStorage.setItem(uiKey, JSON.stringify(settings));
  },
};
