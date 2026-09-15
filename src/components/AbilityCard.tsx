import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ability } from "../types/entities";
import { colors, spacing, typography } from "../theme";
import { ExpandableCard } from "./ExpandableCard";
import { Badge } from "./Badge";
import { Button } from "./Button";

const categoryColor: Record<Ability["category"], string> = {
  Basic: colors.offWhite,
  Signature: "#7CA9D8",
  Ultimate: colors.red,
};

interface AbilityCardProps {
  ability: Ability;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AbilityCard({
  ability,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: AbilityCardProps) {
  return (
    <ExpandableCard
      expanded={expanded}
      onToggle={onToggle}
      accentColor={categoryColor[ability.category]}
      header={
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={typography.subtitle}>{ability.name}</Text>
            <View style={styles.badgeRow}>
              <Badge label={ability.category} color={categoryColor[ability.category]} />
            </View>
          </View>
        </View>
      }
    >
      <Text style={typography.body}>{ability.description}</Text>
      <View style={styles.statsRow}>
        {ability.cost !== undefined && (
          <Text style={typography.caption}>Cost: {ability.cost}</Text>
        )}
        {ability.charges !== undefined && (
          <Text style={typography.caption}>Charges: {ability.charges}</Text>
        )}
        {ability.ultPoints !== undefined && (
          <Text style={typography.caption}>Ult points: {ability.ultPoints}</Text>
        )}
      </View>
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
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
