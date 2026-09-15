import * as SQLite from "expo-sqlite";
import {
  Ability,
  Agent,
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_FEATURE_FLAGS,
  FeatureFlags,
  Weapon,
} from "../types/entities";
import { EntityMap, PersistenceAdapter, TableName } from "./persistenceTypes";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("valorant-agent-designer.db");
  }
  return dbPromise;
}

const SCHEMA = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS abilities (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    cost INTEGER,
    charges INTEGER,
    ult_points INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS weapons (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    cost INTEGER NOT NULL,
    fire_rate REAL NOT NULL,
    magazine_size INTEGER NOT NULL,
    damage_close INTEGER NOT NULL,
    damage_mid INTEGER NOT NULL,
    damage_far INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    ability_c_id TEXT NOT NULL REFERENCES abilities(id),
    ability_q_id TEXT NOT NULL REFERENCES abilities(id),
    ability_e_id TEXT NOT NULL REFERENCES abilities(id),
    ability_x_id TEXT NOT NULL REFERENCES abilities(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS feature_flags (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    agent_creation_enabled INTEGER NOT NULL DEFAULT 1,
    weapon_creation_enabled INTEGER NOT NULL DEFAULT 1,
    ability_creation_enabled INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS audio_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    music_enabled INTEGER NOT NULL DEFAULT 0,
    music_volume REAL NOT NULL DEFAULT 0.5,
    sfx_enabled INTEGER NOT NULL DEFAULT 1
  );
`;

function abilityToRow(a: Ability) {
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    category: a.category,
    cost: a.cost ?? null,
    charges: a.charges ?? null,
    ult_points: a.ultPoints ?? null,
    is_active: a.isActive ? 1 : 0,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  };
}

function rowToAbility(r: any): Ability {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    category: r.category,
    cost: r.cost ?? undefined,
    charges: r.charges ?? undefined,
    ultPoints: r.ult_points ?? undefined,
    isActive: !!r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function weaponToRow(w: Weapon) {
  return {
    id: w.id,
    name: w.name,
    category: w.category,
    cost: w.cost,
    fire_rate: w.fireRate,
    magazine_size: w.magazineSize,
    damage_close: w.damage.close,
    damage_mid: w.damage.mid,
    damage_far: w.damage.far,
    is_active: w.isActive ? 1 : 0,
    created_at: w.createdAt,
    updated_at: w.updatedAt,
  };
}

function rowToWeapon(r: any): Weapon {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    cost: r.cost,
    fireRate: r.fire_rate,
    magazineSize: r.magazine_size,
    damage: { close: r.damage_close, mid: r.damage_mid, far: r.damage_far },
    isActive: !!r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function agentToRow(a: Agent) {
  return {
    id: a.id,
    name: a.name,
    role: a.role,
    bio: a.bio ?? null,
    ability_c_id: a.abilityIds.C,
    ability_q_id: a.abilityIds.Q,
    ability_e_id: a.abilityIds.E,
    ability_x_id: a.abilityIds.X,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  };
}

function rowToAgent(r: any): Agent {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    bio: r.bio ?? undefined,
    abilityIds: {
      C: r.ability_c_id,
      Q: r.ability_q_id,
      E: r.ability_e_id,
      X: r.ability_x_id,
    },
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export const persistence: PersistenceAdapter = {
  async init() {
    const db = await getDb();
    await db.execAsync(SCHEMA);
  },

  async getAll<K extends TableName>(table: K): Promise<EntityMap[K][]> {
    const db = await getDb();
    const rows = await db.getAllAsync(`SELECT * FROM ${table}`);
    if (table === "abilities") return rows.map(rowToAbility) as EntityMap[K][];
    if (table === "weapons") return rows.map(rowToWeapon) as EntityMap[K][];
    return rows.map(rowToAgent) as EntityMap[K][];
  },

  async upsert(table, row) {
    const db = await getDb();
    if (table === "abilities") {
      const r = abilityToRow(row as Ability);
      await db.runAsync(
        `INSERT INTO abilities (id, name, description, category, cost, charges, ult_points, is_active, created_at, updated_at)
         VALUES ($id, $name, $description, $category, $cost, $charges, $ult_points, $is_active, $created_at, $updated_at)
         ON CONFLICT(id) DO UPDATE SET name=$name, description=$description, category=$category,
           cost=$cost, charges=$charges, ult_points=$ult_points, is_active=$is_active, updated_at=$updated_at`,
        {
          $id: r.id,
          $name: r.name,
          $description: r.description,
          $category: r.category,
          $cost: r.cost,
          $charges: r.charges,
          $ult_points: r.ult_points,
          $is_active: r.is_active,
          $created_at: r.created_at,
          $updated_at: r.updated_at,
        }
      );
    } else if (table === "weapons") {
      const r = weaponToRow(row as Weapon);
      await db.runAsync(
        `INSERT INTO weapons (id, name, category, cost, fire_rate, magazine_size, damage_close, damage_mid, damage_far, is_active, created_at, updated_at)
         VALUES ($id, $name, $category, $cost, $fire_rate, $magazine_size, $damage_close, $damage_mid, $damage_far, $is_active, $created_at, $updated_at)
         ON CONFLICT(id) DO UPDATE SET name=$name, category=$category, cost=$cost, fire_rate=$fire_rate,
           magazine_size=$magazine_size, damage_close=$damage_close, damage_mid=$damage_mid, damage_far=$damage_far,
           is_active=$is_active, updated_at=$updated_at`,
        {
          $id: r.id,
          $name: r.name,
          $category: r.category,
          $cost: r.cost,
          $fire_rate: r.fire_rate,
          $magazine_size: r.magazine_size,
          $damage_close: r.damage_close,
          $damage_mid: r.damage_mid,
          $damage_far: r.damage_far,
          $is_active: r.is_active,
          $created_at: r.created_at,
          $updated_at: r.updated_at,
        }
      );
    } else {
      const r = agentToRow(row as Agent);
      await db.runAsync(
        `INSERT INTO agents (id, name, role, bio, ability_c_id, ability_q_id, ability_e_id, ability_x_id, created_at, updated_at)
         VALUES ($id, $name, $role, $bio, $ability_c_id, $ability_q_id, $ability_e_id, $ability_x_id, $created_at, $updated_at)
         ON CONFLICT(id) DO UPDATE SET name=$name, role=$role, bio=$bio, ability_c_id=$ability_c_id,
           ability_q_id=$ability_q_id, ability_e_id=$ability_e_id, ability_x_id=$ability_x_id,
           updated_at=$updated_at`,
        {
          $id: r.id,
          $name: r.name,
          $role: r.role,
          $bio: r.bio,
          $ability_c_id: r.ability_c_id,
          $ability_q_id: r.ability_q_id,
          $ability_e_id: r.ability_e_id,
          $ability_x_id: r.ability_x_id,
          $created_at: r.created_at,
          $updated_at: r.updated_at,
        }
      );
    }
  },

  async remove(table, id) {
    const db = await getDb();
    try {
      await db.runAsync(`DELETE FROM ${table} WHERE id = $id`, { $id: id });
    } catch (e) {
      throw new Error(
        "This record is still used by an Agent — remove the referencing Agent first."
      );
    }
  },

  async getFeatureFlags(): Promise<FeatureFlags> {
    const db = await getDb();
    const row: any = await db.getFirstAsync(
      "SELECT * FROM feature_flags WHERE id = 1"
    );
    if (!row) {
      await this.setFeatureFlags(DEFAULT_FEATURE_FLAGS);
      return DEFAULT_FEATURE_FLAGS;
    }
    return {
      agentCreationEnabled: !!row.agent_creation_enabled,
      weaponCreationEnabled: !!row.weapon_creation_enabled,
      abilityCreationEnabled: !!row.ability_creation_enabled,
    };
  },

  async setFeatureFlags(flags: FeatureFlags) {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO feature_flags (id, agent_creation_enabled, weapon_creation_enabled, ability_creation_enabled)
       VALUES (1, $a, $w, $ab)
       ON CONFLICT(id) DO UPDATE SET agent_creation_enabled=$a, weapon_creation_enabled=$w, ability_creation_enabled=$ab`,
      {
        $a: flags.agentCreationEnabled ? 1 : 0,
        $w: flags.weaponCreationEnabled ? 1 : 0,
        $ab: flags.abilityCreationEnabled ? 1 : 0,
      }
    );
  },

  async getAudioSettings(): Promise<AudioSettings> {
    const db = await getDb();
    const row: any = await db.getFirstAsync(
      "SELECT * FROM audio_settings WHERE id = 1"
    );
    if (!row) {
      await this.setAudioSettings(DEFAULT_AUDIO_SETTINGS);
      return DEFAULT_AUDIO_SETTINGS;
    }
    return {
      musicEnabled: !!row.music_enabled,
      musicVolume: row.music_volume,
      sfxEnabled: !!row.sfx_enabled,
    };
  },

  async setAudioSettings(settings: AudioSettings) {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO audio_settings (id, music_enabled, music_volume, sfx_enabled)
       VALUES (1, $m, $v, $s)
       ON CONFLICT(id) DO UPDATE SET music_enabled=$m, music_volume=$v, sfx_enabled=$s`,
      {
        $m: settings.musicEnabled ? 1 : 0,
        $v: settings.musicVolume,
        $s: settings.sfxEnabled ? 1 : 0,
      }
    );
  },
};
