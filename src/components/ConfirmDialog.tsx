import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme";
import { Button } from "./Button";
import { useClickSound } from "../audio/useClickSound";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: (suppressFuture: boolean) => void;
}

/**
 * Mount/unmount this from the parent (e.g. `{request && <ConfirmDialog ... />}`)
 * rather than toggling a `visible` prop — the "don't ask again" checkbox is
 * local state that should reset for each new confirmation, which a fresh
 * mount gives for free.
 */
export function ConfirmDialog({ title, message, onCancel, onConfirm }: ConfirmDialogProps) {
  const [suppressFuture, setSuppressFuture] = useState(false);
  const playClick = useClickSound();

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.panel}>
          <Text style={typography.title}>{title}</Text>
          <Text style={[typography.body, styles.message]}>{message}</Text>
          <Pressable
            style={styles.toggleRow}
            onPress={() => {
              playClick();
              setSuppressFuture((v) => !v);
            }}
          >
            <Switch
              value={suppressFuture}
              pointerEvents="none"
              trackColor={{ true: colors.red, false: colors.steel }}
              thumbColor={colors.offWhite}
            />
            <Text style={typography.caption}>Don't ask me again for deletes</Text>
          </Pressable>
          <View style={styles.actions}>
            <Button label="Cancel" variant="secondary" onPress={onCancel} />
            <Button label="Delete" variant="danger" onPress={() => onConfirm(suppressFuture)} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  panel: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.steel,
  },
  message: {
    marginTop: spacing.sm,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
