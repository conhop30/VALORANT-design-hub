import { persistence } from "../persistenceImpl.web";
import {
  Agent,
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_UI_SETTINGS,
  EMPTY_AGENT_ABILITY,
  Weapon,
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

const weapon: Weapon = {
  id: "w1",
  name: "Test Weapon",
  category: "Rifle",
  cost: 2900,
  fireRate: 9.75,
  magazineSize: 25,
  damage: { close: 40, mid: 35, far: 30 },
  createdAt: "t",
  updatedAt: "t",
};

const agent: Agent = {
  id: "a1",
  name: "Test Agent",
  role: "Duelist",
  abilities: {
    C: { ...EMPTY_AGENT_ABILITY },
    Q: { ...EMPTY_AGENT_ABILITY },
    E: { ...EMPTY_AGENT_ABILITY },
    X: { ...EMPTY_AGENT_ABILITY },
  },
  createdAt: "t",
  updatedAt: "t",
};

describe("web persistence adapter", () => {
  it("returns an empty list for a table that has never been written", async () => {
    expect(await persistence.getAll("weapons")).toEqual([]);
  });

  it("upsert inserts a new row and getAll returns it", async () => {
    await persistence.upsert("weapons", weapon);

    expect(await persistence.getAll("weapons")).toEqual([weapon]);
  });

  it("upsert updates an existing row in place instead of duplicating it", async () => {
    await persistence.upsert("weapons", weapon);
    const renamed = { ...weapon, name: "Renamed" };

    await persistence.upsert("weapons", renamed);

    const all = await persistence.getAll("weapons");
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("Renamed");
  });

  it("remove deletes a row", async () => {
    await persistence.upsert("weapons", weapon);

    await persistence.remove("weapons", "w1");

    expect(await persistence.getAll("weapons")).toEqual([]);
  });

  it("stores and retrieves an agent with its embedded abilities intact", async () => {
    const withAbilities: Agent = {
      ...agent,
      abilities: {
        ...agent.abilities,
        C: { name: "Ward Charge", description: "Pulses nearby motion.", cost: 200, charges: 2 },
        X: { name: "Overwatch Protocol", description: "Reveals enemies.", ultPoints: 7 },
      },
    };

    await persistence.upsert("agents", withAbilities);

    const [stored] = await persistence.getAll("agents");
    expect(stored.abilities.C).toEqual({
      name: "Ward Charge",
      description: "Pulses nearby motion.",
      cost: 200,
      charges: 2,
    });
    expect(stored.abilities.X.ultPoints).toBe(7);
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
