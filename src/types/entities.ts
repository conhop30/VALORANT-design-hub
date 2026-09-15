export type Role = "Duelist" | "Initiator" | "Controller" | "Sentinel";

export const ROLES: Role[] = ["Duelist", "Initiator", "Controller", "Sentinel"];

export type AbilityCategory = "Basic" | "Signature" | "Ultimate";

export const ABILITY_CATEGORIES: AbilityCategory[] = [
  "Basic",
  "Signature",
  "Ultimate",
];

export type WeaponCategory =
  | "Sidearm"
  | "SMG"
  | "Shotgun"
  | "Rifle"
  | "Sniper"
  | "Heavy";

export const WEAPON_CATEGORIES: WeaponCategory[] = [
  "Sidearm",
  "SMG",
  "Shotgun",
  "Rifle",
  "Sniper",
  "Heavy",
];

export type AbilitySlotKey = "C" | "Q" | "E" | "X";

export const ABILITY_SLOT_KEYS: AbilitySlotKey[] = ["C", "Q", "E", "X"];

export interface Ability {
  id: string;
  name: string;
  description: string;
  category: AbilityCategory;
  /** Credits cost — meaningful for Basic abilities, omitted for Signature/Ultimate. */
  cost?: number;
  /** Charges available per round — meaningful for Basic abilities. */
  charges?: number;
  /** Ult points required to charge — meaningful only when category is Ultimate. */
  ultPoints?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Weapon {
  id: string;
  name: string;
  category: WeaponCategory;
  cost: number;
  fireRate: number;
  magazineSize: number;
  damage: {
    close: number;
    mid: number;
    far: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  role: Role;
  bio?: string;
  abilityIds: Record<AbilitySlotKey, string>;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlags {
  agentCreationEnabled: boolean;
  weaponCreationEnabled: boolean;
  abilityCreationEnabled: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  agentCreationEnabled: true,
  weaponCreationEnabled: true,
  abilityCreationEnabled: true,
};

export interface AudioSettings {
  musicEnabled: boolean;
  musicVolume: number; // 0..1
  sfxEnabled: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  musicEnabled: false, // opt-in: browsers block autoplay, and it's a user preference
  musicVolume: 0.5,
  sfxEnabled: true,
};

export interface UiSettings {
  confirmDeletes: boolean;
}

export const DEFAULT_UI_SETTINGS: UiSettings = {
  confirmDeletes: true,
};

export type EntityKind = "agent" | "weapon" | "ability";

export const EXPORT_SCHEMA_VERSION = 1;

export interface ExportPayload {
  schemaVersion: number;
  exportedAt: string;
  abilities: Ability[];
  weapons: Weapon[];
  agents: Agent[];
}
