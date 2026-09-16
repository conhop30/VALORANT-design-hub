export type Role = "Duelist" | "Initiator" | "Controller" | "Sentinel";

export const ROLES: Role[] = ["Duelist", "Initiator", "Controller", "Sentinel"];

export type AbilityCategory = "Basic" | "Signature" | "Ultimate";

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

/** Which ability tier occupies each keystroke slot — fixed by convention, not user-editable. */
export const SLOT_CATEGORY: Record<AbilitySlotKey, AbilityCategory> = {
  C: "Basic",
  Q: "Basic",
  E: "Signature",
  X: "Ultimate",
};

/**
 * An ability is authored inline as part of its Agent — no standalone id or
 * lifecycle of its own, so an agent can be saved and fleshed out slot by
 * slot instead of requiring a fully-built ability to be picked from a
 * separate library first.
 */
export interface AgentAbility {
  name: string;
  description: string;
  /** Credits cost — meaningful for Basic abilities. */
  cost?: number;
  /** Charges available per round — meaningful for Basic abilities. */
  charges?: number;
  /** Ult points required to charge — meaningful only for the Ultimate slot. */
  ultPoints?: number;
  /** Icon image as a data URI — picked via expo-image-picker, stored inline. */
  iconUri?: string;
}

export const EMPTY_AGENT_ABILITY: AgentAbility = { name: "", description: "" };

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
  /** Portrait/splash art as a data URI — picked via expo-image-picker, stored inline. */
  heroImageUri?: string;
  abilities: Record<AbilitySlotKey, AgentAbility>;
  createdAt: string;
  updatedAt: string;
}

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

export type EntityKind = "agent" | "weapon";

// Bumped from 1: abilities moved from a standalone array into each agent's
// own `abilities` field, so an old export's shape no longer matches.
export const EXPORT_SCHEMA_VERSION = 2;

export interface ExportPayload {
  schemaVersion: number;
  exportedAt: string;
  weapons: Weapon[];
  agents: Agent[];
}
