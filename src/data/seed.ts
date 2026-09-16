import { Agent, Weapon } from "../types/entities";
import { useDesignStore } from "./store";

const now = () => new Date().toISOString();

/**
 * Original, fictional placeholder content (not official Riot/VALORANT agents)
 * so the hub isn't empty on first launch. Safe to delete/edit freely.
 */
export async function seedIfEmpty() {
  const store = useDesignStore.getState();
  if (Object.keys(store.weapons).length > 0 || Object.keys(store.agents).length > 0) {
    return;
  }

  const weapon: Weapon = {
    id: "seed-weapon-1",
    name: "Halcyon SR-9",
    category: "Rifle",
    cost: 2900,
    fireRate: 9.75,
    magazineSize: 25,
    damage: { close: 40, mid: 35, far: 30 },
    createdAt: now(),
    updatedAt: now(),
  };

  const agent: Agent = {
    id: "seed-agent-1",
    name: "Vantage",
    role: "Sentinel",
    bio: "A former recon officer who trades mobility for absolute board control.",
    abilities: {
      C: {
        name: "Ward Charge",
        description:
          "Throw a small drone that pulses a short-range motion ping when an enemy passes near it.",
        cost: 200,
        charges: 2,
      },
      Q: {
        name: "Kinetic Snap",
        description:
          "Instantly recall to your position from up to 15 meters away, canceling incoming momentum.",
        cost: 250,
        charges: 1,
      },
      E: {
        name: "Bulwark Field",
        description: "Deploy a directional energy barrier that blocks bullets and vision for 12 seconds.",
      },
      X: {
        name: "Overwatch Protocol",
        description: "Reveal every enemy's position through walls for 6 seconds and mark them for your team.",
        ultPoints: 7,
      },
    },
    createdAt: now(),
    updatedAt: now(),
  };

  await store.saveWeapon(weapon);
  await store.saveAgent(agent);
}
