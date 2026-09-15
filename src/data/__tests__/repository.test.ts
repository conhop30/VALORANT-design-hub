jest.mock("../persistenceImpl", () => ({
  persistence: {
    init: jest.fn(),
    getAll: jest.fn(),
    upsert: jest.fn(),
    remove: jest.fn(),
    getFeatureFlags: jest.fn(),
    setFeatureFlags: jest.fn(),
    getAudioSettings: jest.fn(),
    setAudioSettings: jest.fn(),
    getUiSettings: jest.fn(),
    setUiSettings: jest.fn(),
  },
}));

import { abilityRepo, agentRepo, configRepo, weaponRepo } from "../repository";
import { persistence } from "../persistenceImpl";

const mockPersistence = persistence as jest.Mocked<typeof persistence>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("repository Result wrapping", () => {
  it("wraps a successful call in { ok: true, value }", async () => {
    mockPersistence.getAll.mockResolvedValue([{ id: "a1" } as any]);

    const result = await abilityRepo.list();

    expect(result).toEqual({ ok: true, value: [{ id: "a1" }] });
  });

  it("wraps a thrown Error in { ok: false, error }", async () => {
    mockPersistence.upsert.mockRejectedValue(new Error("boom"));

    const result = await weaponRepo.save({ id: "w1" } as any);

    expect(result).toEqual({ ok: false, error: "boom" });
  });

  it("wraps a non-Error throw by stringifying it", async () => {
    mockPersistence.remove.mockRejectedValue("plain string failure");

    const result = await agentRepo.remove("a1");

    expect(result).toEqual({ ok: false, error: "plain string failure" });
  });

  it("delegates configRepo.getFeatureFlags to the persistence adapter", async () => {
    const flags = {
      agentCreationEnabled: true,
      weaponCreationEnabled: false,
      abilityCreationEnabled: true,
    };
    mockPersistence.getFeatureFlags.mockResolvedValue(flags);

    const result = await configRepo.getFeatureFlags();

    expect(result).toEqual({ ok: true, value: flags });
  });

  it("delegates configRepo.setUiSettings to the persistence adapter", async () => {
    mockPersistence.setUiSettings.mockResolvedValue(undefined);

    const result = await configRepo.setUiSettings({ confirmDeletes: false });

    expect(mockPersistence.setUiSettings).toHaveBeenCalledWith({ confirmDeletes: false });
    expect(result).toEqual({ ok: true, value: undefined });
  });
});
