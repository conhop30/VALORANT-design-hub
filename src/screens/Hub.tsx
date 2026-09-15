import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDesignStore } from "../data/store";
import { seedIfEmpty } from "../data/seed";
import { colors, spacing, typography } from "../theme";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { AgentCard } from "../components/AgentCard";
import { WeaponCard } from "../components/WeaponCard";
import { AbilityCard } from "../components/AbilityCard";
import { Sheet } from "../components/Sheet";
import { AgentForm } from "../components/forms/AgentForm";
import { WeaponForm } from "../components/forms/WeaponForm";
import { AbilityForm } from "../components/forms/AbilityForm";
import { FeatureFlagsSheet } from "../components/FeatureFlagsSheet";
import { Button } from "../components/Button";
import { useClickSound } from "../audio/useClickSound";
import { Agent, Weapon, Ability } from "../types/entities";

type Library = "agents" | "weapons" | "abilities";
type SheetMode =
  | { kind: "none" }
  | { kind: "agent"; agent?: Agent }
  | { kind: "weapon"; weapon?: Weapon }
  | { kind: "ability"; ability?: Ability }
  | { kind: "settings" };

export function Hub() {
  const playClick = useClickSound();
  const hydrated = useDesignStore((s) => s.hydrated);
  const hydrate = useDesignStore((s) => s.hydrate);
  const lastError = useDesignStore((s) => s.lastError);
  const dismissError = useDesignStore((s) => s.dismissError);

  const agents = useDesignStore((s) => s.agents);
  const weapons = useDesignStore((s) => s.weapons);
  const abilities = useDesignStore((s) => s.abilities);
  const flags = useDesignStore((s) => s.featureFlags);

  const saveAgent = useDesignStore((s) => s.saveAgent);
  const removeAgent = useDesignStore((s) => s.removeAgent);
  const saveWeapon = useDesignStore((s) => s.saveWeapon);
  const removeWeapon = useDesignStore((s) => s.removeWeapon);
  const saveAbility = useDesignStore((s) => s.saveAbility);
  const removeAbility = useDesignStore((s) => s.removeAbility);

  const [library, setLibrary] = useState<Library>("agents");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetMode>({ kind: "none" });

  useEffect(() => {
    hydrate().then(seedIfEmpty);
  }, [hydrate]);

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={colors.red} />
      </SafeAreaView>
    );
  }

  const closeSheet = () => setSheet({ kind: "none" });

  const renderList = () => {
    if (library === "agents") {
      const items = Object.values(agents);
      if (items.length === 0) return <EmptyState label="No agents yet." />;
      return (
        <ScrollView contentContainerStyle={styles.list}>
          {items.map((item) => (
            <AgentCard
              key={item.id}
              agent={item}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
              onEdit={() => setSheet({ kind: "agent", agent: item })}
              onDelete={() => removeAgent(item.id)}
            />
          ))}
        </ScrollView>
      );
    }
    if (library === "weapons") {
      const items = Object.values(weapons);
      if (items.length === 0) return <EmptyState label="No weapons yet." />;
      return (
        <ScrollView contentContainerStyle={styles.list}>
          {items.map((item) => (
            <WeaponCard
              key={item.id}
              weapon={item}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
              onEdit={() => setSheet({ kind: "weapon", weapon: item })}
              onDelete={() => removeWeapon(item.id)}
            />
          ))}
        </ScrollView>
      );
    }
    const items = Object.values(abilities);
    if (items.length === 0) return <EmptyState label="No abilities yet." />;
    return (
      <ScrollView contentContainerStyle={styles.list}>
        {items.map((item) => (
          <AbilityCard
            key={item.id}
            ability={item}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
            onEdit={() => setSheet({ kind: "ability", ability: item })}
            onDelete={() => removeAbility(item.id)}
          />
        ))}
      </ScrollView>
    );
  };

  const creationEnabled =
    library === "agents"
      ? flags.agentCreationEnabled
      : library === "weapons"
      ? flags.weaponCreationEnabled
      : flags.abilityCreationEnabled;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.topBar}>
          <Text style={typography.title}>Design Hub</Text>
          <Pressable
            onPress={() => {
              playClick();
              setSheet({ kind: "settings" });
            }}
            hitSlop={8}
          >
            <Text style={styles.gear}>⚙</Text>
          </Pressable>
        </View>

        {lastError && (
          <Pressable style={styles.errorBanner} onPress={dismissError}>
            <Text style={styles.errorText}>{lastError} (tap to dismiss)</Text>
          </Pressable>
        )}

        <View style={styles.tabsWrap}>
          <SegmentedTabs
            value={library}
            onChange={setLibrary}
            options={[
              { key: "agents", label: "Agents" },
              { key: "weapons", label: "Weapons" },
              { key: "abilities", label: "Abilities" },
            ]}
          />
        </View>

        {renderList()}

        {creationEnabled && (
          <View style={styles.fabWrap}>
            <Button
              label={`+ New ${library === "agents" ? "Agent" : library === "weapons" ? "Weapon" : "Ability"}`}
              onPress={() =>
                setSheet(
                  library === "agents"
                    ? { kind: "agent" }
                    : library === "weapons"
                    ? { kind: "weapon" }
                    : { kind: "ability" }
                )
              }
            />
          </View>
        )}
      </View>

      <Sheet visible={sheet.kind !== "none"} onClose={closeSheet}>
        {sheet.kind === "agent" && (
          <AgentForm
            key={sheet.agent?.id ?? "new-agent"}
            initial={sheet.agent}
            onCancel={closeSheet}
            onSave={async (a) => {
              const ok = await saveAgent(a);
              if (ok) closeSheet();
            }}
          />
        )}
        {sheet.kind === "weapon" && (
          <WeaponForm
            key={sheet.weapon?.id ?? "new-weapon"}
            initial={sheet.weapon}
            onCancel={closeSheet}
            onSave={async (w) => {
              const ok = await saveWeapon(w);
              if (ok) closeSheet();
            }}
          />
        )}
        {sheet.kind === "ability" && (
          <AbilityForm
            key={sheet.ability?.id ?? "new-ability"}
            initial={sheet.ability}
            onCancel={closeSheet}
            onSave={async (a) => {
              const ok = await saveAbility(a);
              if (ok) closeSheet();
            }}
          />
        )}
        {sheet.kind === "settings" && <FeatureFlagsSheet onClose={closeSheet} />}
      </Sheet>
    </SafeAreaView>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <View style={styles.empty}>
      <Text style={typography.body}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    paddingHorizontal: spacing.md,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  gear: {
    fontSize: 22,
    color: colors.offWhite,
  },
  tabsWrap: {
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: 96,
  },
  fabWrap: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  empty: {
    padding: spacing.lg,
    alignItems: "center",
  },
  errorBanner: {
    backgroundColor: colors.redDark,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.offWhite,
    fontSize: 13,
  },
});
