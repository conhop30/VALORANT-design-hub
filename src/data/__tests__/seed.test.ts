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

import { abilityRepo, agentRepo, weaponRepo } from "../repository";
import { useDesignStore } from "../store";
import { seedIfEmpty } from "../seed";

const mocked = {
  abilityRepo: abilityRepo as jest.Mocked<typeof abilityRepo>,
  weaponRepo: weaponRepo as jest.Mocked<typeof weaponRepo>,
  agentRepo: agentRepo as jest.Mocked<typeof agentRepo>,
};

beforeEach(() => {
  jest.clearAllMocks();
  useDesignStore.setState({ abilities: {}, weapons: {}, agents: {} });
  mocked.abilityRepo.save.mockResolvedValue({ ok: true, value: undefined });
  mocked.weaponRepo.save.mockResolvedValue({ ok: true, value: undefined });
  mocked.agentRepo.save.mockResolvedValue({ ok: true, value: undefined });
});

describe("seedIfEmpty", () => {
  it("seeds 4 abilities, 1 weapon, and 1 agent into an empty store", async () => {
    await seedIfEmpty();

    const state = useDesignStore.getState();
    expect(Object.keys(state.abilities)).toHaveLength(4);
    expect(Object.keys(state.weapons)).toHaveLength(1);
    expect(Object.keys(state.agents)).toHaveLength(1);
  });

  it("wires the seeded agent's ability slots to real seeded ability ids", async () => {
    await seedIfEmpty();

    const state = useDesignStore.getState();
    const agent = Object.values(state.agents)[0];
    for (const abilityId of Object.values(agent.abilityIds)) {
      expect(state.abilities[abilityId]).toBeDefined();
    }
  });

  it("does nothing if the store already has data", async () => {
    useDesignStore.setState({
      abilities: {},
      weapons: {},
      agents: { existing: { id: "existing" } as any },
    });

    await seedIfEmpty();

    expect(mocked.abilityRepo.save).not.toHaveBeenCalled();
    expect(mocked.weaponRepo.save).not.toHaveBeenCalled();
    expect(mocked.agentRepo.save).not.toHaveBeenCalled();
  });
});
