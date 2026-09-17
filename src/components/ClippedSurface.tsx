import React from "react";
import { View, ViewProps, ViewStyle } from "react-native";
import { Corner, CornerCut } from "./CornerCut";

interface ClippedSurfaceProps extends ViewProps {
  /** Background fill of the surface itself. */
  fill?: string;
  /** Color behind this surface — what the corner-cut mask paints over. */
  matte: string;
  corners?: Corner[];
  cut?: number;
  accentColor?: string;
  accentWidth?: number;
  borderColor?: string;
  borderWidth?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Diagonal-cut-corner panel used throughout the VALORANT-style pass (cards,
 * buttons, badges, sheets, tabs). One or two corners are cut, never all
 * four — matches the reference's convention of a single accent cut rather
 * than a fully chamfered box.
 */
export function ClippedSurface({
  fill,
  matte,
  corners = ["topRight"],
  cut = 10,
  accentColor,
  accentWidth,
  borderColor,
  borderWidth,
  style,
  children,
  ...rest
}: ClippedSurfaceProps) {
  return (
    <View
      style={[
        { backgroundColor: fill, borderColor, borderWidth },
        style,
      ]}
      {...rest}
    >
      {children}
      {corners.map((corner) => (
        <CornerCut
          key={corner}
          corner={corner}
          size={cut}
          matte={matte}
          accentColor={accentColor}
          accentWidth={accentWidth}
        />
      ))}
    </View>
  );
}
