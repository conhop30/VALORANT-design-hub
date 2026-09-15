import { Ability, Agent, Weapon } from "../types/entities";
import { useDesignStore } from "./store";

const now = () => new Date().toISOString();

/**
 * Original, fictional placeholder content (not official Riot/VALORANT agents)
 * so the hub isn't empty on first launch. Safe to delete/edit freely.
 */
export async function seedIfEmpty() {
  const store = useDesignStore.getState();
  if (
    Object.keys(store.abilities).length > 0 ||
    Object.keys(store.weapons).length > 0 ||
    Object.keys(store.agents).length > 0
  ) {
    return;
  }

  const abilities: Ability[] = [
    {
      id: "seed-ability-basic-1",
      name: "Ward Charge",
      description: "Throw a small drone that pulses a short-range motion ping when an enemy passes near it.",
      category: "Basic",
      cost: 200,
      charges: 2,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "seed-ability-basic-2",
      name: "Kinetic Snap",
      description: "Instantly recall to your position from up to 15 meters away, canceling incoming momentum.",
      category: "Basic",
      cost: 250,
      charges: 1,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "seed-ability-signature",
      name: "Bulwark Field",
      description: "Deploy a directional energy barrier that blocks bullets and vision for 12 seconds.",
      category: "Signature",
      charges: 1,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "seed-ability-ultimate",
      name: "Overwatch Protocol",
      description: "Reveal every enemy's position through walls for 6 seconds and mark them for your team.",
      category: "Ultimate",
      ultPoints: 7,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  const weapon: Weapon = {
    id: "seed-weapon-1",
    name: "Halcyon SR-9",
    category: "Rifle",
    cost: 2900,
    fireRate: 9.75,
    magazineSize: 25,
    damage: { close: 40, mid: 35, far: 30 },
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  };

  const agent: Agent = {
    id: "seed-agent-1",
    name: "Vantage",
    role: "Sentinel",
    bio: "A former recon officer who trades mobility for absolute board control.",
    abilityIds: {
      C: abilities[0].id,
      Q: abilities[1].id,
      E: abilities[2].id,
      X: abilities[3].id,
    },
    createdAt: now(),
    updatedAt: now(),
  };

  for (const a of abilities) await store.saveAbility(a);
  await store.saveWeapon(weapon);
  await store.saveAgent(agent);
}
