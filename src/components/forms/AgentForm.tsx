import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { v4 as uuid } from "uuid";
import {
  ABILITY_SLOT_KEYS,
  Agent,
  AgentAbility,
  AbilitySlotKey,
  EMPTY_AGENT_ABILITY,
  ROLES,
  Role,
  SLOT_CATEGORY,
} from "../../types/entities";
import { colors, spacing, typography } from "../../theme";
import { FormField, NumberField } from "../FormField";
import { SelectField } from "../SelectField";
import { Button } from "../Button";
import { ImagePickerField } from "../ImagePickerField";

interface AgentFormProps {
  initial?: Agent;
  onSave: (agent: Agent) => void;
  onCancel: () => void;
}

function defaultAbilities(initial?: Agent): Record<AbilitySlotKey, AgentAbility> {
  return {
    C: initial?.abilities?.C ?? { ...EMPTY_AGENT_ABILITY },
    Q: initial?.abilities?.Q ?? { ...EMPTY_AGENT_ABILITY },
    E: initial?.abilities?.E ?? { ...EMPTY_AGENT_ABILITY },
    X: initial?.abilities?.X ?? { ...EMPTY_AGENT_ABILITY },
  };
}

export function AgentForm({ initial, onSave, onCancel }: AgentFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState<Role>(initial?.role ?? ROLES[0]);
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [heroImageUri, setHeroImageUri] = useState<string | undefined>(initial?.heroImageUri);
  const [abilities, setAbilities] = useState<Record<AbilitySlotKey, AgentAbility>>(
    defaultAbilities(initial)
  );

  const updateAbility = (slot: AbilitySlotKey, patch: Partial<AgentAbility>) =>
    setAbilities((prev) => ({ ...prev, [slot]: { ...prev[slot], ...patch } }));

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const now = new Date().toISOString();
    const finalAbilities = ABILITY_SLOT_KEYS.reduce((acc, slot) => {
      const a = abilities[slot];
      const category = SLOT_CATEGORY[slot];
      acc[slot] = {
        name: a.name.trim(),
        description: a.description.trim(),
        cost: category === "Basic" ? a.cost : undefined,
        charges: category === "Basic" ? a.charges : undefined,
        ultPoints: category === "Ultimate" ? a.ultPoints : undefined,
        iconUri: a.iconUri,
      };
      return acc;
    }, {} as Record<AbilitySlotKey, AgentAbility>);

    onSave({
      id: initial?.id ?? uuid(),
      name: name.trim(),
      role,
      bio: bio.trim() || undefined,
      heroImageUri,
      abilities: finalAbilities,
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
      <ImagePickerField
        label="Hero image"
        value={heroImageUri}
        onChange={setHeroImageUri}
        size={128}
      />

      <View style={styles.divider} />
      <Text style={typography.subtitle}>Abilities</Text>
      <Text style={typography.caption}>
        Optional — fill these in as you develop the kit. Only the agent's name is required to save.
      </Text>

      {ABILITY_SLOT_KEYS.map((slot) => {
        const category = SLOT_CATEGORY[slot];
        const ability = abilities[slot];
        return (
          <View key={slot} style={styles.slotBlock}>
            <Text style={typography.subtitle}>
              {slot} — {category}
            </Text>
            <ImagePickerField
              label="Icon"
              value={ability.iconUri}
              onChange={(uri) => updateAbility(slot, { iconUri: uri })}
              size={64}
            />
            <FormField
              label="Ability name"
              value={ability.name}
              onChangeText={(v) => updateAbility(slot, { name: v })}
              placeholder="Optional for now"
            />
            <FormField
              label="Description"
              value={ability.description}
              onChangeText={(v) => updateAbility(slot, { description: v })}
              placeholder="What does it do?"
              multiline
              numberOfLines={2}
            />
            {category === "Basic" && (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <NumberField
                    label="Cost (credits)"
                    value={ability.cost}
                    onChangeValue={(v) => updateAbility(slot, { cost: v })}
                    placeholder="200"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <NumberField
                    label="Charges"
                    value={ability.charges}
                    onChangeValue={(v) => updateAbility(slot, { charges: v })}
                    placeholder="1"
                  />
                </View>
              </View>
            )}
            {category === "Ultimate" && (
              <NumberField
                label="Ult points"
                value={ability.ultPoints}
                onChangeValue={(v) => updateAbility(slot, { ultPoints: v })}
                placeholder="7"
              />
            )}
          </View>
        );
      })}

      <View style={styles.actions}>
        <Button label="Cancel" variant="secondary" onPress={onCancel} />
        <Button label="Save" onPress={handleSave} disabled={!canSave} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: colors.steel,
    opacity: 0.3,
  },
  slotBlock: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
