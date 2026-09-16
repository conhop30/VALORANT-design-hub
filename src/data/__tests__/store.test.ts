jest.mock("../repository", () => ({
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
  Agent,
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_UI_SETTINGS,
  EMPTY_AGENT_ABILITY,
} from "../../types/entities";
import { agentRepo, configRepo, weaponRepo } from "../repository";
import { useDesignStore } from "../store";

const mocked = {
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

beforeEach(() => {
  jest.clearAllMocks();
  useDesignStore.setState({
    hydrated: false,
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
    mocked.weaponRepo.list.mockResolvedValue(ok([]));
    mocked.agentRepo.list.mockResolvedValue(ok([agent]));
    mocked.configRepo.getFeatureFlags.mockResolvedValue(ok(DEFAULT_FEATURE_FLAGS));
    mocked.configRepo.getAudioSettings.mockResolvedValue(ok(DEFAULT_AUDIO_SETTINGS));
    mocked.configRepo.getUiSettings.mockResolvedValue(ok(DEFAULT_UI_SETTINGS));

    await useDesignStore.getState().hydrate();

    const state = useDesignStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.agents).toEqual({ a1: agent });
    expect(state.lastError).toBeNull();
  });

  it("hydrate() surfaces an init failure and never touches hydrated state", async () => {
    mocked.configRepo.init.mockResolvedValue(err("init failed"));

    await useDesignStore.getState().hydrate();

    expect(useDesignStore.getState().lastError).toBe("init failed");
    expect(useDesignStore.getState().hydrated).toBe(false);
    expect(mocked.agentRepo.list).not.toHaveBeenCalled();
  });

  it("saveAgent adds the record to state on success", async () => {
    mocked.agentRepo.save.mockResolvedValue(ok(undefined));

    const result = await useDesignStore.getState().saveAgent(agent);

    expect(result).toBe(true);
    expect(useDesignStore.getState().agents.a1).toEqual(agent);
  });

  it("saveAgent surfaces an error and leaves state untouched", async () => {
    mocked.agentRepo.save.mockResolvedValue(err("write failed"));

    const result = await useDesignStore.getState().saveAgent(agent);

    expect(result).toBe(false);
    expect(useDesignStore.getState().agents.a1).toBeUndefined();
    expect(useDesignStore.getState().lastError).toBe("write failed");
  });

  it("removeAgent deletes the record from state on success", async () => {
    useDesignStore.setState({ agents: { a1: agent } });
    mocked.agentRepo.remove.mockResolvedValue(ok(undefined));

    const result = await useDesignStore.getState().removeAgent("a1");

    expect(result).toBe(true);
    expect(useDesignStore.getState().agents.a1).toBeUndefined();
  });

  it("removeAgent keeps the record in state when the repo rejects", async () => {
    useDesignStore.setState({ agents: { a1: agent } });
    mocked.agentRepo.remove.mockResolvedValue(err("disk full"));

    const result = await useDesignStore.getState().removeAgent("a1");

    expect(result).toBe(false);
    expect(useDesignStore.getState().agents.a1).toEqual(agent);
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
