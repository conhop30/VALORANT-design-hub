import React, { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { v4 as uuid } from "uuid";
import {
  ABILITY_SLOT_KEYS,
  Agent,
  AbilitySlotKey,
  ROLES,
  Role,
} from "../../types/entities";
import { spacing, typography } from "../../theme";
import { FormField } from "../FormField";
import { SelectField } from "../SelectField";
import { Button } from "../Button";
import { useDesignStore } from "../../data/store";

interface AgentFormProps {
  initial?: Agent;
  onSave: (agent: Agent) => void;
  onCancel: () => void;
}

const SLOT_CATEGORY: Record<AbilitySlotKey, "Basic" | "Signature" | "Ultimate"> = {
  C: "Basic",
  Q: "Basic",
  E: "Signature",
  X: "Ultimate",
};

export function AgentForm({ initial, onSave, onCancel }: AgentFormProps) {
  const abilities = useDesignStore((s) => s.abilities);

  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState<Role>(initial?.role ?? ROLES[0]);
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [abilityIds, setAbilityIds] = useState<Record<AbilitySlotKey, string | undefined>>({
    C: initial?.abilityIds.C,
    Q: initial?.abilityIds.Q,
    E: initial?.abilityIds.E,
    X: initial?.abilityIds.X,
  });

  const allAbilities = Object.values(abilities);

  const canSave =
    name.trim().length > 0 &&
    ABILITY_SLOT_KEYS.every((slot) => !!abilityIds[slot]);

  const handleSave = () => {
    if (!canSave) return;
    const now = new Date().toISOString();
    onSave({
      id: initial?.id ?? uuid(),
      name: name.trim(),
      role,
      bio: bio.trim() || undefined,
      abilityIds: {
        C: abilityIds.C!,
        Q: abilityIds.Q!,
        E: abilityIds.E!,
        X: abilityIds.X!,
      },
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ gap: spacing.md }}>
      <Text style={typography.title}>{initial ? "Edit Agent" : "New Agent"}</Text>
      <FormField label="Name" value={name} onChangeText={setName} placeholder="e.g. Vantage" />
      <SelectField
        label="Role"
        options={ROLES.map((r) => ({ id: r, label: r }))}
        value={role}
        onChange={(id) => setRole(id as Role)}
      />
      <FormField
        label="Bio (optional)"
        value={bio}
        onChangeText={setBio}
        placeholder="A short flavor line"
        multiline
        numberOfLines={2}
      />
      {ABILITY_SLOT_KEYS.map((slot) => {
        const wantedCategory = SLOT_CATEGORY[slot];
        const options = allAbilities
          .filter((a) => a.category === wantedCategory && a.isActive)
          .map((a) => ({ id: a.id, label: a.name }));
        return (
          <SelectField
            key={slot}
            label={`${slot} slot — ${wantedCategory} ability`}
            options={options}
            value={abilityIds[slot]}
            onChange={(id) => setAbilityIds((prev) => ({ ...prev, [slot]: id }))}
            emptyMessage={`No active ${wantedCategory} abilities yet — create one first.`}
          />
        );
      })}
      <SelectFieldNote canSave={canSave} />
      <Button label="Cancel" variant="secondary" onPress={onCancel} />
      <Button label="Save" onPress={handleSave} disabled={!canSave} />
    </ScrollView>
  );
}

function SelectFieldNote({ canSave }: { canSave: boolean }) {
  if (canSave) return null;
  return (
    <Text style={[typography.caption, { color: "#F2C94C" }]}>
      Name and all four ability slots (C/Q/E/X) are required to save.
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: "100%",
  },
});
