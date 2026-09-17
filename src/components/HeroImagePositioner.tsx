import React, { useCallback, useRef, useState } from "react";
import { GestureResponderEvent, PanResponder, PanResponderGestureState, StyleSheet, Text, View } from "react-native";
import { CoverImage, DEFAULT_FOCAL, ImageFocal } from "./CoverImage";
import { Button } from "./Button";
import { CornerCut } from "./CornerCut";
import { colors, cut, spacing, typography } from "../theme";

interface HeroImagePositionerProps {
  uri: string;
  focal?: ImageFocal;
  onChange: (focal: ImageFocal) => void;
}

const PREVIEW_WIDTH = 200;
const PREVIEW_HEIGHT = 320;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * Lets the user drag the just-uploaded hero image around behind a fixed
 * frame to choose what stays centered when it's cropped to the hero panel's
 * shape — the frame here mirrors that panel's crop, so what's inside the
 * border is what actually shows up there.
 */
export function HeroImagePositioner({ uri, focal = DEFAULT_FOCAL, onChange }: HeroImagePositionerProps) {
  const [dragging, setDragging] = useState(false);
  const focalRef = useRef(focal);
  focalRef.current = focal;
  const startFocalRef = useRef(focal);
  const overflowRef = useRef({ width: 0, height: 0 });

  const handleGeometry = useCallback(
    (g: { containerWidth: number; containerHeight: number; renderedWidth: number; renderedHeight: number }) => {
      overflowRef.current = {
        width: g.renderedWidth - g.containerWidth,
        height: g.renderedHeight - g.containerHeight,
      };
    },
    []
  );

  const applyDelta = useCallback(
    (gesture: PanResponderGestureState) => {
      const { width: overflowW, height: overflowH } = overflowRef.current;
      const start = startFocalRef.current;
      const nextX = overflowW > 0 ? clamp01(start.x - gesture.dx / overflowW) : start.x;
      const nextY = overflowH > 0 ? clamp01(start.y - gesture.dy / overflowH) : start.y;
      onChange({ x: nextX, y: nextY });
    },
    [onChange]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startFocalRef.current = focalRef.current;
        setDragging(true);
      },
      onPanResponderMove: (_e: GestureResponderEvent, gesture: PanResponderGestureState) => applyDelta(gesture),
      onPanResponderRelease: () => setDragging(false),
      onPanResponderTerminate: () => setDragging(false),
    })
  ).current;

  const isCentered = Math.abs(focal.x - 0.5) < 0.01 && Math.abs(focal.y - 0.5) < 0.01;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Drag to reposition</Text>
      <View
        style={[styles.frame, dragging && styles.frameDragging]}
        {...panResponder.panHandlers}
      >
        <CoverImage uri={uri} focal={focal} style={styles.image} onGeometry={handleGeometry} />
        <View style={[StyleSheet.absoluteFill, styles.borderOverlay]} pointerEvents="none" />
        <CornerCut corner="topRight" size={cut.lg} matte={colors.surface} accentColor={colors.red} accentWidth={2} />
        <CornerCut corner="bottomLeft" size={cut.lg} matte={colors.surface} accentColor={colors.red} accentWidth={2} />
      </View>
      <View style={styles.footer}>
        <Text style={typography.caption}>This is how the image will appear in the highlight panel.</Text>
        {!isCentered && (
          <Button label="Center" variant="secondary" onPress={() => onChange({ ...DEFAULT_FOCAL })} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
  },
  frame: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  frameDragging: {
    opacity: 0.9,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  borderOverlay: {
    borderWidth: 2,
    borderColor: colors.red,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    maxWidth: PREVIEW_WIDTH,
  },
});
