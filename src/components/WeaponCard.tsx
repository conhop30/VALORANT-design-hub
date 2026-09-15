import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Weapon } from "../types/entities";
import { colors, spacing, typography } from "../theme";
import { ExpandableCard } from "./ExpandableCard";
import { Badge } from "./Badge";
import { Button } from "./Button";

interface WeaponCardProps {
  weapon: Weapon;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function WeaponCard({
  weapon,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: WeaponCardProps) {
  return (
    <ExpandableCard
      expanded={expanded}
      onToggle={onToggle}
      accentColor="#7CA9D8"
      header={
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={typography.subtitle}>{weapon.name}</Text>
            <View style={styles.badgeRow}>
              <Badge label={weapon.category} color="#7CA9D8" />
            </View>
          </View>
          <Text style={typography.caption}>{weapon.cost}cr</Text>
        </View>
      }
    >
      <View style={styles.statsRow}>
        <Text style={typography.caption}>Fire rate: {weapon.fireRate}/s</Text>
        <Text style={typography.caption}>Mag: {weapon.magazineSize}</Text>
      </View>
      <View style={styles.statsRow}>
        <Text style={typography.caption}>Dmg close: {weapon.damage.close}</Text>
        <Text style={typography.caption}>mid: {weapon.damage.mid}</Text>
        <Text style={typography.caption}>far: {weapon.damage.far}</Text>
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
