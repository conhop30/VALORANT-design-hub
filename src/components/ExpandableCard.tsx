import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { colors, radius, spacing } from "../theme";
import { useClickSound } from "../audio/useClickSound";

const cardLayout = LinearTransition.duration(220);

interface ExpandableCardProps {
  expanded: boolean;
  onToggle: () => void;
  header: React.ReactNode;
  children?: React.ReactNode;
  accentColor?: string;
}

/** Tap-to-expand card. Reanimated's `layout` prop smoothly resizes this card
 * and shifts its siblings when content is added/removed — the doc's
 * "condense/expand ... without losing control of navigation" in one primitive. */
export function ExpandableCard({
  expanded,
  onToggle,
  header,
  children,
  accentColor = colors.red,
}: ExpandableCardProps) {
  const playClick = useClickSound();
  return (
    <Animated.View layout={cardLayout} style={[styles.card, { borderLeftColor: accentColor }]}>
      <Pressable
        onPress={() => {
          playClick();
          onToggle();
        }}
        style={styles.headerRow}
        hitSlop={4}
      >
        {header}
      </Pressable>
      {expanded && <View style={styles.body}>{children}</View>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  headerRow: {
    padding: spacing.md,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
});
