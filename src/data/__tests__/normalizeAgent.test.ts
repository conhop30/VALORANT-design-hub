import { normalizeAgentAbilities } from "../normalizeAgent";
import { EMPTY_AGENT_ABILITY } from "../../types/entities";

describe("normalizeAgentAbilities", () => {
  it("passes a fully-formed abilities object through unchanged", () => {
    const abilities = {
      C: { name: "Ward Charge", description: "d", cost: 200, charges: 2 },
      Q: { name: "Kinetic Snap", description: "d", cost: 250, charges: 1 },
      E: { name: "Bulwark Field", description: "d" },
      X: { name: "Overwatch Protocol", description: "d", ultPoints: 7 },
    };

    expect(normalizeAgentAbilities(abilities)).toEqual(abilities);
  });

  it("fills every slot with an empty ability when given undefined (legacy abilityIds record)", () => {
    const result = normalizeAgentAbilities(undefined);

    expect(result).toEqual({
      C: EMPTY_AGENT_ABILITY,
      Q: EMPTY_AGENT_ABILITY,
      E: EMPTY_AGENT_ABILITY,
      X: EMPTY_AGENT_ABILITY,
    });
  });

  it("fills every slot with an empty ability when given a non-object", () => {
    expect(normalizeAgentAbilities("abilityIds")).toEqual({
      C: EMPTY_AGENT_ABILITY,
      Q: EMPTY_AGENT_ABILITY,
      E: EMPTY_AGENT_ABILITY,
      X: EMPTY_AGENT_ABILITY,
    });
  });

  it("normalizes only the missing slots, leaving valid ones intact", () => {
    const result = normalizeAgentAbilities({
      C: { name: "Ward Charge", description: "d", cost: 200, charges: 2 },
    });

    expect(result.C).toEqual({ name: "Ward Charge", description: "d", cost: 200, charges: 2 });
    expect(result.Q).toEqual(EMPTY_AGENT_ABILITY);
    expect(result.E).toEqual(EMPTY_AGENT_ABILITY);
    expect(result.X).toEqual(EMPTY_AGENT_ABILITY);
  });

  it("drops garbage field types instead of propagating them", () => {
    const result = normalizeAgentAbilities({
      C: { name: 123, description: null, cost: "200", charges: 2 },
    });

    expect(result.C).toEqual({ name: "", description: "", cost: undefined, charges: 2 });
  });

  it("treats a slot that is itself not an object as empty", () => {
    const result = normalizeAgentAbilities({ C: "ability-id-123" });

    expect(result.C).toEqual(EMPTY_AGENT_ABILITY);
  });
});
