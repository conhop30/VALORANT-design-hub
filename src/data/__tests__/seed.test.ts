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

import { ABILITY_SLOT_KEYS } from "../../types/entities";
import { agentRepo, weaponRepo } from "../repository";
import { useDesignStore } from "../store";
import { seedIfEmpty } from "../seed";

const mocked = {
  weaponRepo: weaponRepo as jest.Mocked<typeof weaponRepo>,
  agentRepo: agentRepo as jest.Mocked<typeof agentRepo>,
};

beforeEach(() => {
  jest.clearAllMocks();
  useDesignStore.setState({ weapons: {}, agents: {} });
  mocked.weaponRepo.save.mockResolvedValue({ ok: true, value: undefined });
  mocked.agentRepo.save.mockResolvedValue({ ok: true, value: undefined });
});

describe("seedIfEmpty", () => {
  it("seeds 1 weapon and 1 agent into an empty store", async () => {
    await seedIfEmpty();

    const state = useDesignStore.getState();
    expect(Object.keys(state.weapons)).toHaveLength(1);
    expect(Object.keys(state.agents)).toHaveLength(1);
  });

  it("gives the seeded agent a filled-in ability in every slot", async () => {
    await seedIfEmpty();

    const state = useDesignStore.getState();
    const agent = Object.values(state.agents)[0];
    for (const slot of ABILITY_SLOT_KEYS) {
      expect(agent.abilities[slot].name.length).toBeGreaterThan(0);
    }
  });

  it("does nothing if the store already has data", async () => {
    useDesignStore.setState({
      weapons: {},
      agents: { existing: { id: "existing" } as any },
    });

    await seedIfEmpty();

    expect(mocked.weaponRepo.save).not.toHaveBeenCalled();
    expect(mocked.agentRepo.save).not.toHaveBeenCalled();
  });
});
