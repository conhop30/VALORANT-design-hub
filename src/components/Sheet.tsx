import React, { useEffect } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors, cut, spacing } from "../theme";
import { ClippedSurface } from "./ClippedSurface";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Lightweight animated bottom sheet built directly on Reanimated (no
 * @gorhom/bottom-sheet — that lib's compatibility with Reanimated 4 /
 * React Native's new-architecture-only setup, both very recent, isn't yet
 * confirmed, so a small custom sheet avoids that risk). Renders inline in
 * the Hub's own tree rather than an RN <Modal>, which keeps the "single
 * page, never lose navigation context" feel from the design doc.
 */
export function Sheet({ visible, onClose, children }: SheetProps) {
  const { height } = useWindowDimensions();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 200 : 160,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.6,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height }],
  }));

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[panelStyle, { maxHeight: height * 0.88 }, styles.panelWrap]}>
        <ClippedSurface
          fill={colors.surface}
          matte={colors.ink}
          corners={["topLeft", "topRight"]}
          cut={cut.lg}
          borderWidth={1}
          borderColor={colors.steel}
          accentColor={colors.red}
          style={styles.panel}
        >
          <View style={styles.handleRow}>
            <View style={styles.tick} />
          </View>
          {children}
        </ClippedSurface>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "#000000",
  },
  panelWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  panel: {
    padding: spacing.md,
  },
  handleRow: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  tick: {
    width: 28,
    height: 3,
    backgroundColor: colors.red,
  },
});
