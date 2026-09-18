import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";
import { useDesignStore } from "../data/store";
import { Button } from "./Button";
import { SelectField } from "./SelectField";
import { Slider } from "./Slider";
import { useClickSound } from "../audio/useClickSound";
import { exportAllData, importAllData } from "../data/exportImport";
import { DisplayMode, SCREEN_SIZE_OPTIONS, useElectronDisplay } from "../platform/useElectronDisplay";

interface SettingsSheetProps {
  onClose: () => void;
  display: ReturnType<typeof useElectronDisplay>;
}

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

function VolumeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.volumeRow}>
      <Text style={typography.caption}>{label}</Text>
      <View style={styles.volumeControl}>
        <View style={{ flex: 1 }}>
          <Slider value={value} onChange={onChange} />
        </View>
        <Text style={styles.volumeValue}>{Math.round(value * 100)}%</Text>
      </View>
    </View>
  );
}

export function SettingsSheet({ onClose, display }: SettingsSheetProps) {
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

  return (
    <ScrollView style={{ maxHeight: "100%" }} contentContainerStyle={{ gap: spacing.md }}>
      <Text style={typography.title}>Settings</Text>

      <Text style={typography.subtitle}>General</Text>

      <ToggleRow
        label="Confirm before deleting"
        hint="Show a confirmation dialog before deleting agents or weapons."
        value={uiSettings.confirmDeletes}
        onChange={(v) => setUiSetting("confirmDeletes", v)}
      />

      {display.available && display.state && (
        <>
          <View style={styles.divider} />
          <Text style={typography.subtitle}>Display</Text>

          <SelectField
            label="Screen size"
            options={[...SCREEN_SIZE_OPTIONS]}
            value={display.state.mode ?? undefined}
            onChange={(id) => display.setMode(id as DisplayMode)}
          />

          {display.state.mode === "fullscreen" && (
            <Text style={typography.caption}>
              Press Esc or F11 anytime to exit fullscreen, or use the exit button in the top corner.
            </Text>
          )}
        </>
      )}

      <View style={styles.divider} />
      <Text style={typography.subtitle}>Audio</Text>

      <ToggleRow
        label="Ambient music"
        hint="Loop a soft background track while you work."
        value={audio.musicEnabled}
        onChange={(v) => setAudioSetting("musicEnabled", v)}
      />

      {audio.musicEnabled && (
        <VolumeRow
          label="Music volume"
          value={audio.musicVolume}
          onChange={(v) => setAudioSetting("musicVolume", v)}
        />
      )}

      <ToggleRow
        label="Sound effects"
        hint="Play a click sound on buttons and taps."
        value={audio.sfxEnabled}
        onChange={(v) => setAudioSetting("sfxEnabled", v)}
      />

      {audio.sfxEnabled && (
        <VolumeRow
          label="Sound effects volume"
          value={audio.sfxVolume}
          onChange={(v) => setAudioSetting("sfxVolume", v)}
        />
      )}

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
  volumeRow: {
    gap: spacing.xs,
  },
  volumeControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  volumeValue: {
    ...typography.caption,
    width: 40,
    textAlign: "right",
  },
});
