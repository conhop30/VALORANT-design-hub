import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
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
    <Animated.View
      layout={cardLayout}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[styles.card, { borderLeftColor: accentColor }]}
    >
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
      {expanded && (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(180)} style={styles.body}>
          {children}
        </Animated.View>
      )}
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
