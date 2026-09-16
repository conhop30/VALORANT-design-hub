import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";
import { useDesignStore } from "../data/store";
import { Button } from "./Button";
import { SelectField } from "./SelectField";
import { useClickSound } from "../audio/useClickSound";
import { exportAllData, importAllData } from "../data/exportImport";

interface FeatureFlagsSheetProps {
  onClose: () => void;
}

const VOLUME_PRESETS = [
  { id: "0.25", label: "25%" },
  { id: "0.5", label: "50%" },
  { id: "0.75", label: "75%" },
  { id: "1", label: "100%" },
];

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const playClick = useClickSound();
  return (
    <Pressable
      style={styles.row}
      onPress={() => {
        playClick();
        onChange(!value);
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={typography.subtitle}>{label}</Text>
        <Text style={typography.caption}>{hint}</Text>
      </View>
      <Switch
        value={value}
        pointerEvents="none"
        trackColor={{ true: colors.red, false: colors.steel }}
        thumbColor={colors.offWhite}
      />
    </Pressable>
  );
}

export function FeatureFlagsSheet({ onClose }: FeatureFlagsSheetProps) {
  const flags = useDesignStore((s) => s.featureFlags);
  const setFlag = useDesignStore((s) => s.setFeatureFlag);
  const audio = useDesignStore((s) => s.audioSettings);
  const setAudioSetting = useDesignStore((s) => s.setAudioSetting);
  const uiSettings = useDesignStore((s) => s.uiSettings);
  const setUiSetting = useDesignStore((s) => s.setUiSetting);
  const [transferStatus, setTransferStatus] = useState<string | null>(null);
  const [transferBusy, setTransferBusy] = useState(false);

  const handleExport = async () => {
    setTransferBusy(true);
    setTransferStatus(null);
    const res = await exportAllData();
    setTransferStatus(res.status === "success" ? "Exported." : res.error);
    setTransferBusy(false);
  };

  const handleImport = async () => {
    setTransferBusy(true);
    setTransferStatus(null);
    const res = await importAllData();
    if (res.status === "success") {
      setTransferStatus(
        `Imported ${res.counts.agents} agent(s) and ${res.counts.weapons} weapon(s).`
      );
    } else if (res.status === "error") {
      setTransferStatus(res.error);
    }
    setTransferBusy(false);
  };

  const rows: { key: keyof typeof flags; label: string; hint: string }[] = [
    {
      key: "agentCreationEnabled",
      label: "Agent creation",
      hint: "Show the 'New Agent' entry point.",
    },
    {
      key: "weaponCreationEnabled",
      label: "Weapon creation",
      hint: "Show the 'New Weapon' entry point.",
    },
  ];

  return (
    <ScrollView style={{ maxHeight: "100%" }} contentContainerStyle={{ gap: spacing.md }}>
      <Text style={typography.title}>Settings</Text>
      <Text style={typography.caption}>
        Turning a feature off only hides its "Create" entry point — anything already
        built with it keeps working exactly as before.
      </Text>
      {rows.map((row) => (
        <ToggleRow
          key={row.key}
          label={row.label}
          hint={row.hint}
          value={flags[row.key]}
          onChange={(v) => setFlag(row.key, v)}
        />
      ))}

      <View style={styles.divider} />
      <Text style={typography.subtitle}>General</Text>

      <ToggleRow
        label="Confirm before deleting"
        hint="Show a confirmation dialog before deleting agents or weapons."
        value={uiSettings.confirmDeletes}
        onChange={(v) => setUiSetting("confirmDeletes", v)}
      />

      <View style={styles.divider} />
      <Text style={typography.subtitle}>Audio</Text>

      <ToggleRow
        label="Ambient music"
        hint="Loop a soft background track while you work."
        value={audio.musicEnabled}
        onChange={(v) => setAudioSetting("musicEnabled", v)}
      />

      {audio.musicEnabled && (
        <SelectField
          label="Music volume"
          options={VOLUME_PRESETS}
          value={String(audio.musicVolume)}
          onChange={(id) => setAudioSetting("musicVolume", Number(id))}
        />
      )}

      <ToggleRow
        label="Sound effects"
        hint="Play a click sound on buttons and taps."
        value={audio.sfxEnabled}
        onChange={(v) => setAudioSetting("sfxEnabled", v)}
      />

      <View style={styles.divider} />
      <Text style={typography.subtitle}>Data</Text>
      <Text style={typography.caption}>
        Export everything to a JSON file, or import one back in — fully offline, no account
        needed. Useful for backups or moving your work to another device.
      </Text>
      <View style={styles.row}>
        <Button label="Export data" variant="secondary" onPress={handleExport} disabled={transferBusy} />
        <Button label="Import data" variant="secondary" onPress={handleImport} disabled={transferBusy} />
      </View>
      {transferStatus && <Text style={typography.caption}>{transferStatus}</Text>}

      <Button label="Close" variant="secondary" onPress={onClose} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.steel,
    opacity: 0.3,
  },
});
