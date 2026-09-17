import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { colors, cut, spacing } from "../theme";
import { useClickSound } from "../audio/useClickSound";
import { ClippedSurface } from "./ClippedSurface";

const cardLayout = LinearTransition.duration(180).easing(Easing.out(Easing.quad));

interface ExpandableCardProps {
  expanded: boolean;
  onToggle: () => void;
  header: React.ReactNode;
  children?: React.ReactNode;
  accentColor?: string;
  /** Color behind this card, for the corner-cut mask. Cards sit directly on the hub's `colors.ink` page. */
  matte?: string;
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
  matte = colors.ink,
}: ExpandableCardProps) {
  const playClick = useClickSound();
  return (
    <Animated.View layout={cardLayout} entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)}>
      <ClippedSurface
        fill={colors.surface}
        matte={matte}
        cut={cut.md}
        corners={["topRight"]}
        borderWidth={1}
        borderColor={colors.steel}
        accentColor={colors.steel}
        style={styles.card}
      >
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
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
          <Animated.View
            entering={FadeIn.duration(140)}
            exiting={FadeOut.duration(140)}
            style={styles.body}
          >
            {children}
          </Animated.View>
        )}
      </ClippedSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  headerRow: {
    padding: spacing.md,
    paddingLeft: spacing.md + 4,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.md + 4,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
});
