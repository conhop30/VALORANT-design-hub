import { ABILITY_SLOT_KEYS, Agent, AgentAbility, EMPTY_AGENT_ABILITY } from "../types/entities";

function normalizeAbility(value: unknown): AgentAbility {
  if (!value || typeof value !== "object") return { ...EMPTY_AGENT_ABILITY };
  const a = value as Partial<AgentAbility>;
  return {
    name: typeof a.name === "string" ? a.name : "",
    description: typeof a.description === "string" ? a.description : "",
    cost: typeof a.cost === "number" ? a.cost : undefined,
    charges: typeof a.charges === "number" ? a.charges : undefined,
    ultPoints: typeof a.ultPoints === "number" ? a.ultPoints : undefined,
  };
}

/**
 * Defends against agent records saved before abilities were folded inline
 * onto the agent (those have `abilityIds`, not `abilities`) or any other
 * malformed/partial data, so every consumer can assume `agent.abilities` is
 * a fully-populated Record<AbilitySlotKey, AgentAbility> with no further
 * checks. A legacy record's ability content can't be recovered — its
 * abilityIds pointed at a separate abilities table that no longer exists —
 * so a missing/legacy slot normalizes to empty rather than crashing. Once
 * the agent is next saved, the normalized shape is written back and the
 * record is healed for good.
 */
export function normalizeAgentAbilities(rawAbilities: unknown): Agent["abilities"] {
  const raw = (rawAbilities && typeof rawAbilities === "object" ? rawAbilities : {}) as Record<
    string,
    unknown
  >;
  return ABILITY_SLOT_KEYS.reduce((acc, slot) => {
    acc[slot] = normalizeAbility(raw[slot]);
    return acc;
  }, {} as Agent["abilities"]);
}
