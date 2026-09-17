import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { colors, spacing } from "../theme";

interface FormSheetLayoutProps {
  /** Scrollable form fields. */
  children: React.ReactNode;
  /** Pinned to the bottom of the sheet, outside the scroll area — typically Cancel/Save. */
  footer: React.ReactNode;
}

/**
 * Splits a form sheet into a scrolling field area and a footer that stays
 * put at the bottom of the sheet, so Save/Cancel are always reachable
 * without scrolling all the way down through a long form.
 */
export function FormSheetLayout({ children, footer }: FormSheetLayoutProps) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {children}
      </ScrollView>
      <View style={styles.footer}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: "100%",
    flexShrink: 1,
  },
  scroll: {
    flexGrow: 1,
    flexShrink: 1,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.steel,
  },
});
