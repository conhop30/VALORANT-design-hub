jest.mock("../repository", () => ({
  abilityRepo: { list: jest.fn(), save: jest.fn(), remove: jest.fn() },
  weaponRepo: { list: jest.fn(), save: jest.fn(), remove: jest.fn() },
  agentRepo: { list: jest.fn(), save: jest.fn(), remove: jest.fn() },
  configRepo: {
    init: jest.fn(),
    getFeatureFlags: jest.fn(),
    setFeatureFlags: jest.fn(),
    getAudioSettings: jest.fn(),
    setAudioSettings: jest.fn(),
    getUiSettings: jest.fn(),
    setUiSettings: jest.fn(),
  },
}));

import {
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_UI_SETTINGS,
  Ability,
} from "../../types/entities";
import { abilityRepo, agentRepo, configRepo, weaponRepo } from "../repository";
import { useDesignStore } from "../store";

const mocked = {
  abilityRepo: abilityRepo as jest.Mocked<typeof abilityRepo>,
  weaponRepo: weaponRepo as jest.Mocked<typeof weaponRepo>,
  agentRepo: agentRepo as jest.Mocked<typeof agentRepo>,
  configRepo: configRepo as jest.Mocked<typeof configRepo>,
};

function ok<T>(value: T) {
  return { ok: true as const, value };
}
function err(error: string) {
  return { ok: false as const, error };
}

const ability: Ability = {
  id: "ab1",
  name: "Test Ability",
  description: "desc",
  category: "Basic",
  createdAt: "t",
  updatedAt: "t",
};

beforeEach(() => {
  jest.clearAllMocks();
  useDesignStore.setState({
    hydrated: false,
    abilities: {},
    weapons: {},
    agents: {},
    featureFlags: DEFAULT_FEATURE_FLAGS,
    audioSettings: DEFAULT_AUDIO_SETTINGS,
    uiSettings: DEFAULT_UI_SETTINGS,
    lastError: null,
  });
});

describe("useDesignStore", () => {
  it("hydrate() populates state from the repository", async () => {
    mocked.configRepo.init.mockResolvedValue(ok(undefined));
    mocked.abilityRepo.list.mockResolvedValue(ok([ability]));
    mocked.weaponRepo.list.mockResolvedValue(ok([]));
    mocked.agentRepo.list.mockResolvedValue(ok([]));
    mocked.configRepo.getFeatureFlags.mockResolvedValue(ok(DEFAULT_FEATURE_FLAGS));
    mocked.configRepo.getAudioSettings.mockResolvedValue(ok(DEFAULT_AUDIO_SETTINGS));
    mocked.configRepo.getUiSettings.mockResolvedValue(ok(DEFAULT_UI_SETTINGS));

    await useDesignStore.getState().hydrate();

    const state = useDesignStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.abilities).toEqual({ ab1: ability });
    expect(state.lastError).toBeNull();
  });

  it("hydrate() surfaces an init failure and never touches hydrated state", async () => {
    mocked.configRepo.init.mockResolvedValue(err("init failed"));

    await useDesignStore.getState().hydrate();

    expect(useDesignStore.getState().lastError).toBe("init failed");
    expect(useDesignStore.getState().hydrated).toBe(false);
    expect(mocked.abilityRepo.list).not.toHaveBeenCalled();
  });

  it("saveAbility adds the record to state on success", async () => {
    mocked.abilityRepo.save.mockResolvedValue(ok(undefined));

    const result = await useDesignStore.getState().saveAbility(ability);

    expect(result).toBe(true);
    expect(useDesignStore.getState().abilities.ab1).toEqual(ability);
  });

  it("saveAbility surfaces an error and leaves state untouched", async () => {
    mocked.abilityRepo.save.mockResolvedValue(err("still referenced"));

    const result = await useDesignStore.getState().saveAbility(ability);

    expect(result).toBe(false);
    expect(useDesignStore.getState().abilities.ab1).toBeUndefined();
    expect(useDesignStore.getState().lastError).toBe("still referenced");
  });

  it("removeAbility deletes the record from state on success", async () => {
    useDesignStore.setState({ abilities: { ab1: ability } });
    mocked.abilityRepo.remove.mockResolvedValue(ok(undefined));

    const result = await useDesignStore.getState().removeAbility("ab1");

    expect(result).toBe(true);
    expect(useDesignStore.getState().abilities.ab1).toBeUndefined();
  });

  it("removeAbility keeps the record in state when the repo rejects (FK safety net)", async () => {
    useDesignStore.setState({ abilities: { ab1: ability } });
    mocked.abilityRepo.remove.mockResolvedValue(
      err("This record is still used by an Agent — remove the referencing Agent first.")
    );

    const result = await useDesignStore.getState().removeAbility("ab1");

    expect(result).toBe(false);
    expect(useDesignStore.getState().abilities.ab1).toEqual(ability);
  });

  it("setUiSetting persists and updates confirmDeletes", async () => {
    mocked.configRepo.setUiSettings.mockResolvedValue(ok(undefined));

    await useDesignStore.getState().setUiSetting("confirmDeletes", false);

    expect(mocked.configRepo.setUiSettings).toHaveBeenCalledWith({
      ...DEFAULT_UI_SETTINGS,
      confirmDeletes: false,
    });
    expect(useDesignStore.getState().uiSettings.confirmDeletes).toBe(false);
  });

  it("setUiSetting leaves state untouched when persistence fails", async () => {
    mocked.configRepo.setUiSettings.mockResolvedValue(err("disk full"));

    await useDesignStore.getState().setUiSetting("confirmDeletes", false);

    expect(useDesignStore.getState().uiSettings.confirmDeletes).toBe(true);
    expect(useDesignStore.getState().lastError).toBe("disk full");
  });

  it("dismissError clears lastError", () => {
    useDesignStore.setState({ lastError: "boom" });

    useDesignStore.getState().dismissError();

    expect(useDesignStore.getState().lastError).toBeNull();
  });
});
