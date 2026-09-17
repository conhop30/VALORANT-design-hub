import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";
import { useClickSound } from "../audio/useClickSound";

interface Option {
  id: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  label: string;
  options: Option[];
  value: string | undefined;
  onChange: (id: string) => void;
  emptyMessage?: string;
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  emptyMessage,
}: SelectFieldProps) {
  const playClick = useClickSound();
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {options.length === 0 ? (
        <Text style={styles.empty}>{emptyMessage ?? "Nothing available yet."}</Text>
      ) : (
        <View style={styles.chips}>
          {options.map((opt) => {
            const active = opt.id === value;
            return (
              <Pressable
                key={opt.id}
                disabled={opt.disabled}
                onPress={() => {
                  playClick();
                  onChange(opt.id);
                }}
                style={[
                  styles.chip,
                  active && styles.chipActive,
                  opt.disabled && styles.chipDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    active && styles.chipLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
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
  empty: {
    ...typography.body,
    fontStyle: "italic",
    opacity: 0.7,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.steel,
    backgroundColor: colors.ink,
  },
  chipActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipLabel: {
    color: colors.offWhite,
    fontSize: 13,
    fontWeight: "600",
  },
  chipLabelActive: {
    color: colors.ink,
  },
});
