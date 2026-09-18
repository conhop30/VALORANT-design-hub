import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";

interface BadgeProps {
  label: string;
  color?: string;
  muted?: boolean;
}

export function Badge({ label, color = colors.red, muted }: BadgeProps) {
  const lineColor = muted ? colors.steel : color;
  return (
    <View style={[styles.badge, { borderColor: lineColor }]}>
      <Text style={[styles.label, { color: lineColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
