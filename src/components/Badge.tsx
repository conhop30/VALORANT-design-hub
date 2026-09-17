import React from "react";
import { StyleSheet, Text } from "react-native";
import { colors, spacing } from "../theme";
import { ClippedSurface } from "./ClippedSurface";

interface BadgeProps {
  label: string;
  color?: string;
  muted?: boolean;
  /** Color behind this badge, for the corner-cut mask. Badges sit inside cards on `colors.surface`. */
  matte?: string;
}

export function Badge({ label, color = colors.red, muted, matte = colors.surface }: BadgeProps) {
  const lineColor = muted ? colors.steel : color;
  return (
    <ClippedSurface
      fill="transparent"
      matte={matte}
      cut={6}
      borderWidth={1}
      borderColor={lineColor}
      accentColor={lineColor}
      style={styles.badge}
    >
      <Text style={[styles.label, { color: lineColor }]}>{label}</Text>
    </ClippedSurface>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
