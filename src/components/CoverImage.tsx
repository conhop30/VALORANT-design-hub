import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, LayoutChangeEvent, StyleSheet, View, ViewStyle } from "react-native";

export interface ImageFocal {
  /** 0..1, fraction of the image's width from the left that should sit at the frame's horizontal center. */
  x: number;
  /** 0..1, fraction of the image's height from the top that should sit at the frame's vertical center. */
  y: number;
}

export const DEFAULT_FOCAL: ImageFocal = { x: 0.5, y: 0.5 };

interface Geometry {
  containerWidth: number;
  containerHeight: number;
  renderedWidth: number;
  renderedHeight: number;
}

interface CoverImageProps {
  uri: string;
  focal?: ImageFocal;
  style?: ViewStyle;
  children?: React.ReactNode;
  /** Fires whenever the frame's size or the image's natural size (and so the pannable overflow) changes. */
  onGeometry?: (geometry: Geometry) => void;
}

/**
 * Renders an image scaled to cover its container (like CSS `object-fit:
 * cover`) with a controllable focal point (like `object-position`), since
 * React Native's Image has no equivalent of the latter. The container must
 * clip via `overflow: hidden` (done here) — the image itself is rendered
 * oversized and shifted so the focal point lands at the frame's center.
 */
export function CoverImage({ uri, focal = DEFAULT_FOCAL, style, children, onGeometry }: CoverImageProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  }, []);

  // Image's onLoad event doesn't reliably carry natural dimensions across
  // platforms (react-native-web in particular), so ask for them directly.
  useEffect(() => {
    let cancelled = false;
    setNaturalSize({ width: 0, height: 0 });
    Image.getSize(
      uri,
      (width, height) => {
        if (!cancelled) setNaturalSize({ width, height });
      },
      () => {}
    );
    return () => {
      cancelled = true;
    };
  }, [uri]);

  const { width: cw, height: ch } = containerSize;
  const { width: nw, height: nh } = naturalSize;

  let renderedW = cw;
  let renderedH = ch;
  let left = 0;
  let top = 0;
  if (cw > 0 && ch > 0 && nw > 0 && nh > 0) {
    const scale = Math.max(cw / nw, ch / nh);
    renderedW = nw * scale;
    renderedH = nh * scale;
    left = -(renderedW - cw) * focal.x;
    top = -(renderedH - ch) * focal.y;
  }

  const lastGeometry = useRef<Geometry | null>(null);
  if (cw > 0 && ch > 0) {
    const g = { containerWidth: cw, containerHeight: ch, renderedWidth: renderedW, renderedHeight: renderedH };
    const prev = lastGeometry.current;
    if (
      !prev ||
      prev.containerWidth !== g.containerWidth ||
      prev.containerHeight !== g.containerHeight ||
      prev.renderedWidth !== g.renderedWidth ||
      prev.renderedHeight !== g.renderedHeight
    ) {
      lastGeometry.current = g;
      onGeometry?.(g);
    }
  }

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {cw > 0 && ch > 0 && (
        <Image
          source={{ uri }}
          resizeMode="cover"
          style={{ position: "absolute", left, top, width: renderedW, height: renderedH }}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
