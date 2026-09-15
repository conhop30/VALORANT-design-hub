import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Agent, AbilitySlotKey, ABILITY_SLOT_KEYS } from "../types/entities";
import { colors, roleColors, spacing, typography } from "../theme";
import { ExpandableCard } from "./ExpandableCard";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { toRefStatus, useDesignStore } from "../data/store";

interface AgentCardProps {
  agent: Agent;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function AbilitySlotRow({ slot, agent }: { slot: AbilitySlotKey; agent: Agent }) {
  const abilityId = agent.abilityIds[slot];
  const record = useDesignStore((s) => (abilityId ? s.abilities[abilityId] : undefined));
  const resolved = toRefStatus(record);
  return (
    <View style={styles.slotRow}>
      <View style={styles.slotKey}>
        <Text style={styles.slotKeyText}>{slot}</Text>
      </View>
      {resolved.status === "missing" && (
        <Text style={[typography.body, styles.unavailable]}>
          Ability unavailable (removed)
        </Text>
      )}
      {resolved.status === "inactive" && (
        <Text style={[typography.body, styles.unavailable]}>
          {resolved.record.name} — currently deactivated
        </Text>
      )}
      {resolved.status === "active" && (
        <View style={{ flex: 1 }}>
          <Text style={typography.body}>{resolved.record.name}</Text>
          <Text style={typography.caption}>{resolved.record.description}</Text>
        </View>
      )}
    </View>
  );
}

export function AgentCard({ agent, expanded, onToggle, onEdit, onDelete }: AgentCardProps) {
  const roleColor = roleColors[agent.role] ?? colors.red;
  return (
    <ExpandableCard
      expanded={expanded}
      onToggle={onToggle}
      accentColor={roleColor}
      header={
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={typography.subtitle}>{agent.name}</Text>
            <Badge label={agent.role} color={roleColor} />
          </View>
        </View>
      }
    >
      {agent.bio && <Text style={typography.body}>{agent.bio}</Text>}
      {ABILITY_SLOT_KEYS.map((slot) => (
        <AbilitySlotRow key={slot} slot={slot} agent={agent} />
      ))}
      <View style={styles.actions}>
        <Button label="Edit" variant="secondary" onPress={onEdit} />
        <Button label="Delete" variant="danger" onPress={onDelete} />
      </View>
    </ExpandableCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  slotKey: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.red,
    alignItems: "center",
    justifyContent: "center",
  },
  slotKeyText: {
    color: colors.ink,
    fontWeight: "800",
    fontSize: 12,
  },
  unavailable: {
    fontStyle: "italic",
    opacity: 0.7,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
