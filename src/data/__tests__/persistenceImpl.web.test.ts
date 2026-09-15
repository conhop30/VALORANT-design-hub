import { persistence } from "../persistenceImpl.web";
import {
  Ability,
  Agent,
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_UI_SETTINGS,
} from "../../types/entities";

function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

beforeEach(() => {
  (global as any).localStorage = createLocalStorageMock();
});

const ability: Ability = {
  id: "ab1",
  name: "Test Ability",
  description: "desc",
  category: "Basic",
  createdAt: "t",
  updatedAt: "t",
};

describe("web persistence adapter", () => {
  it("returns an empty list for a table that has never been written", async () => {
    expect(await persistence.getAll("abilities")).toEqual([]);
  });

  it("upsert inserts a new row and getAll returns it", async () => {
    await persistence.upsert("abilities", ability);

    expect(await persistence.getAll("abilities")).toEqual([ability]);
  });

  it("upsert updates an existing row in place instead of duplicating it", async () => {
    await persistence.upsert("abilities", ability);
    const renamed = { ...ability, name: "Renamed" };

    await persistence.upsert("abilities", renamed);

    const all = await persistence.getAll("abilities");
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("Renamed");
  });

  it("remove deletes a row that nothing references", async () => {
    await persistence.upsert("abilities", ability);

    await persistence.remove("abilities", "ab1");

    expect(await persistence.getAll("abilities")).toEqual([]);
  });

  it("remove rejects when an agent still references the ability (FK safety net)", async () => {
    const agent: Agent = {
      id: "ag1",
      name: "Vantage",
      role: "Sentinel",
      abilityIds: { C: "ab1", Q: "ab1", E: "ab1", X: "ab1" },
      createdAt: "t",
      updatedAt: "t",
    };
    await persistence.upsert("abilities", ability);
    await persistence.upsert("agents", agent);

    await expect(persistence.remove("abilities", "ab1")).rejects.toThrow(
      /still used by an Agent/
    );
    expect(await persistence.getAll("abilities")).toEqual([ability]);
  });

  it("feature flags default to DEFAULT_FEATURE_FLAGS until set", async () => {
    expect(await persistence.getFeatureFlags()).toEqual(DEFAULT_FEATURE_FLAGS);
  });

  it("feature flags round-trip through set/get", async () => {
    const flags = { ...DEFAULT_FEATURE_FLAGS, weaponCreationEnabled: false };

    await persistence.setFeatureFlags(flags);

    expect(await persistence.getFeatureFlags()).toEqual(flags);
  });

  it("audio settings round-trip through set/get", async () => {
    const settings = { ...DEFAULT_AUDIO_SETTINGS, musicEnabled: true };

    await persistence.setAudioSettings(settings);

    expect(await persistence.getAudioSettings()).toEqual(settings);
  });

  it("ui settings default to DEFAULT_UI_SETTINGS until set, then round-trip", async () => {
    expect(await persistence.getUiSettings()).toEqual(DEFAULT_UI_SETTINGS);

    await persistence.setUiSettings({ confirmDeletes: false });

    expect(await persistence.getUiSettings()).toEqual({ confirmDeletes: false });
  });
});
