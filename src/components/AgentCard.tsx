import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Agent, AgentAbility, AbilitySlotKey, ABILITY_SLOT_KEYS } from "../types/entities";
import { colors, roleColors, spacing, typography } from "../theme";
import { ExpandableCard } from "./ExpandableCard";
import { Badge } from "./Badge";
import { Button } from "./Button";

interface AgentCardProps {
  agent: Agent;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function abilityMetaLine(ability: AgentAbility): string | null {
  const parts = [
    ability.cost !== undefined && `Cost: ${ability.cost}`,
    ability.charges !== undefined && `Charges: ${ability.charges}`,
    ability.ultPoints !== undefined && `Ult points: ${ability.ultPoints}`,
  ].filter((p): p is string => !!p);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function AbilitySlotRow({ slot, ability }: { slot: AbilitySlotKey; ability: AgentAbility }) {
  const hasContent = ability.name.trim().length > 0;
  const meta = abilityMetaLine(ability);
  return (
    <View style={styles.slotRow}>
      <View style={styles.slotKey}>
        <Text style={styles.slotKeyText}>{slot}</Text>
      </View>
      {!hasContent ? (
        <Text style={[typography.body, styles.unavailable]}>Not yet defined</Text>
      ) : (
        <View style={{ flex: 1 }}>
          <Text style={typography.body}>{ability.name}</Text>
          {!!ability.description && <Text style={typography.caption}>{ability.description}</Text>}
          {meta && <Text style={typography.caption}>{meta}</Text>}
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
        <AbilitySlotRow key={slot} slot={slot} ability={agent.abilities[slot]} />
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
