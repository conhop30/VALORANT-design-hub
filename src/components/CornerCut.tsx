import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Svg, { Line, Polygon } from "react-native-svg";

export type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

interface CornerCutProps {
  corner: Corner;
  /** Size in px of the diagonal cut. */
  size?: number;
  /** Color painted over the corner — must match whatever sits behind this surface. */
  matte: string;
  /** Optional thin line traced along the new cut edge, to stand in for a border/bevel. */
  accentColor?: string;
  accentWidth?: number;
}

const BOX_POSITION: Record<Corner, StyleProp<ViewStyle>> = {
  topLeft: { top: -0.5, left: -0.5 },
  topRight: { top: -0.5, right: -0.5 },
  bottomLeft: { bottom: -0.5, left: -0.5 },
  bottomRight: { bottom: -0.5, right: -0.5 },
};

/**
 * Per-corner geometry in box-local coordinates (box is a `size`x`size`
 * square pinned to one corner of the parent). `hide` is the triangle that
 * covers the original square corner; `line` is the new diagonal edge it
 * creates. See CornerCut.md-equivalent reasoning in the stylization pass —
 * derived by hand per corner, not guessed, so don't "simplify" without
 * re-deriving.
 */
function geometry(corner: Corner, s: number) {
  switch (corner) {
    case "topLeft":
      return { hide: `0,0 ${s},0 0,${s}`, line: { x1: s, y1: 0, x2: 0, y2: s } };
    case "topRight":
      return { hide: `${s},0 ${s},${s} 0,0`, line: { x1: 0, y1: 0, x2: s, y2: s } };
    case "bottomRight":
      return { hide: `${s},0 ${s},${s} 0,${s}`, line: { x1: s, y1: 0, x2: 0, y2: s } };
    case "bottomLeft":
      return { hide: `0,0 0,${s} ${s},${s}`, line: { x1: 0, y1: 0, x2: s, y2: s } };
  }
}

export function CornerCut({ corner, size = 10, matte, accentColor, accentWidth = 1.5 }: CornerCutProps) {
  const { hide, line } = geometry(corner, size);
  return (
    <Svg
      width={size}
      height={size}
      style={[{ position: "absolute" }, BOX_POSITION[corner]]}
      pointerEvents="none"
    >
      <Polygon points={hide} fill={matte} />
      {accentColor && (
        <Line
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={accentColor}
          strokeWidth={accentWidth}
        />
      )}
    </Svg>
  );
}
