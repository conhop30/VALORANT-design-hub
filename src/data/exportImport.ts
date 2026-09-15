import { exportImport } from "./exportImportImpl";
import { EXPORT_SCHEMA_VERSION, ExportPayload } from "../types/entities";
import { useDesignStore } from "./store";

export type ExportResult = { status: "success" } | { status: "error"; error: string };

export async function exportAllData(): Promise<ExportResult> {
  const state = useDesignStore.getState();
  const payload: ExportPayload = {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    abilities: Object.values(state.abilities),
    weapons: Object.values(state.weapons),
    agents: Object.values(state.agents),
  };
  try {
    await exportImport.exportData(payload);
    return { status: "success" };
  } catch (e) {
    return { status: "error", error: e instanceof Error ? e.message : String(e) };
  }
}

export type ImportResult =
  | { status: "success"; counts: { abilities: number; weapons: number; agents: number } }
  | { status: "cancelled" }
  | { status: "error"; error: string };

function isValidPayload(value: unknown): value is ExportPayload {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<ExportPayload>;
  return (
    typeof p.schemaVersion === "number" &&
    Array.isArray(p.abilities) &&
    Array.isArray(p.weapons) &&
    Array.isArray(p.agents)
  );
}

/**
 * Imports in FK-safe order — abilities and weapons before the agents that
 * reference them — so native SQLite's foreign key constraints never reject
 * a row for referencing something that hasn't been inserted yet.
 */
export async function importAllData(): Promise<ImportResult> {
  try {
    const payload = await exportImport.importData();
    if (!payload) return { status: "cancelled" };
    if (!isValidPayload(payload)) {
      return { status: "error", error: "That file doesn't look like a valid export." };
    }

    const store = useDesignStore.getState();
    for (const ability of payload.abilities) {
      const ok = await store.saveAbility(ability);
      if (!ok) return { status: "error", error: useDesignStore.getState().lastError ?? "Import failed." };
    }
    for (const weapon of payload.weapons) {
      const ok = await store.saveWeapon(weapon);
      if (!ok) return { status: "error", error: useDesignStore.getState().lastError ?? "Import failed." };
    }
    for (const agent of payload.agents) {
      const ok = await store.saveAgent(agent);
      if (!ok) return { status: "error", error: useDesignStore.getState().lastError ?? "Import failed." };
    }

    return {
      status: "success",
      counts: {
        abilities: payload.abilities.length,
        weapons: payload.weapons.length,
        agents: payload.agents.length,
      },
    };
  } catch (e) {
    return { status: "error", error: e instanceof Error ? e.message : String(e) };
  }
}
