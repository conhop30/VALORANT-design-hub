import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme";

interface FormFieldProps extends TextInputProps {
  label: string;
}

export function FormField({ label, style, ...rest }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.steel}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

export function NumberField(
  props: Omit<FormFieldProps, "value" | "onChangeText"> & {
    value: number | undefined;
    onChangeValue: (n: number | undefined) => void;
  }
) {
  const { value, onChangeValue, ...rest } = props;
  return (
    <FormField
      {...rest}
      keyboardType="numeric"
      value={value === undefined ? "" : String(value)}
      onChangeText={(t) => {
        const cleaned = t.replace(/[^0-9.]/g, "");
        onChangeValue(cleaned === "" ? undefined : Number(cleaned));
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
  },
  input: {
    backgroundColor: colors.ink,
    color: colors.offWhite,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.steel,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 14,
  },
});
