jest.mock("../persistenceImpl", () => ({
  persistence: {
    init: jest.fn(),
    getAll: jest.fn(),
    upsert: jest.fn(),
    remove: jest.fn(),
    getAudioSettings: jest.fn(),
    setAudioSettings: jest.fn(),
    getUiSettings: jest.fn(),
    setUiSettings: jest.fn(),
  },
}));

import { agentRepo, configRepo, weaponRepo } from "../repository";
import { persistence } from "../persistenceImpl";

const mockPersistence = persistence as jest.Mocked<typeof persistence>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("repository Result wrapping", () => {
  it("wraps a successful call in { ok: true, value }", async () => {
    mockPersistence.getAll.mockResolvedValue([{ id: "w1" } as any]);

    const result = await weaponRepo.list();

    expect(result).toEqual({ ok: true, value: [{ id: "w1" }] });
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

  it("delegates configRepo.setUiSettings to the persistence adapter", async () => {
    mockPersistence.setUiSettings.mockResolvedValue(undefined);

    const result = await configRepo.setUiSettings({ confirmDeletes: false, checkForUpdates: true });

    expect(mockPersistence.setUiSettings).toHaveBeenCalledWith({ confirmDeletes: false, checkForUpdates: true });
    expect(result).toEqual({ ok: true, value: undefined });
  });
});
