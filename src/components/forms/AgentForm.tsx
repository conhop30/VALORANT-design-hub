import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
import { colors, radius, spacing, typography } from "../../theme";
import { FormField, NumberField } from "../FormField";
import { SelectField } from "../SelectField";
import { Button } from "../Button";
import { ImagePickerField } from "../ImagePickerField";
import { HeroImagePositioner } from "../HeroImagePositioner";
import { DEFAULT_FOCAL, ImageFocal } from "../CoverImage";
import { FormSheetLayout } from "../FormSheetLayout";
import { useClickSound } from "../../audio/useClickSound";

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

/**
 * One podium spot per ability slot — clicking a slot swaps the fields below
 * to that slot's ability, instead of stacking all four inline. A dot marks
 * slots that already have a name filled in, so progress stays visible even
 * while collapsed.
 */
function AbilitySlotTabs({
  activeSlot,
  onChange,
  abilities,
}: {
  activeSlot: AbilitySlotKey;
  onChange: (slot: AbilitySlotKey) => void;
  abilities: Record<AbilitySlotKey, AgentAbility>;
}) {
  const playClick = useClickSound();
  return (
    <View style={styles.slotTabs}>
      {ABILITY_SLOT_KEYS.map((slot) => {
        const active = slot === activeSlot;
        const filled = abilities[slot].name.trim().length > 0;
        return (
          <Pressable
            key={slot}
            onPress={() => {
              playClick();
              onChange(slot);
            }}
            style={[styles.slotTab, active && styles.slotTabActive]}
            hitSlop={4}
          >
            {filled && <View style={[styles.slotTabDot, active && styles.slotTabDotActive]} />}
            <Text style={[styles.slotTabKey, active && styles.slotTabKeyActive]}>{slot}</Text>
            <Text style={[styles.slotTabCategory, active && styles.slotTabCategoryActive]}>
              {SLOT_CATEGORY[slot]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function AgentForm({ initial, onSave, onCancel }: AgentFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState<Role>(initial?.role ?? ROLES[0]);
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [heroImageUri, setHeroImageUri] = useState<string | undefined>(initial?.heroImageUri);
  const [heroFocal, setHeroFocal] = useState<ImageFocal>(initial?.heroFocal ?? { ...DEFAULT_FOCAL });
  const [abilities, setAbilities] = useState<Record<AbilitySlotKey, AgentAbility>>(
    defaultAbilities(initial)
  );
  const [activeSlot, setActiveSlot] = useState<AbilitySlotKey>("C");

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
      heroFocal: heroImageUri ? heroFocal : undefined,
      abilities: finalAbilities,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    });
  };

  const activeCategory = SLOT_CATEGORY[activeSlot];
  const activeAbility = abilities[activeSlot];

  return (
    <FormSheetLayout
      footer={
        <>
          <Button label="Cancel" variant="secondary" onPress={onCancel} />
          <Button label="Save" onPress={handleSave} disabled={!canSave} />
        </>
      }
    >
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
        onChange={(uri) => {
          setHeroImageUri(uri);
          setHeroFocal({ ...DEFAULT_FOCAL });
        }}
        size={128}
      />
      {heroImageUri && (
        <HeroImagePositioner uri={heroImageUri} focal={heroFocal} onChange={setHeroFocal} />
      )}

      <View style={styles.divider} />
      <Text style={typography.subtitle}>Abilities</Text>
      <Text style={typography.caption}>
        Optional — fill these in as you develop the kit. Only the agent's name is required to save.
      </Text>

      <AbilitySlotTabs activeSlot={activeSlot} onChange={setActiveSlot} abilities={abilities} />

      <View style={styles.slotBlock}>
        <Text style={typography.subtitle}>
          {activeSlot} — {activeCategory}
        </Text>
        <ImagePickerField
          label="Icon"
          value={activeAbility.iconUri}
          onChange={(uri) => updateAbility(activeSlot, { iconUri: uri })}
          size={64}
        />
        <FormField
          label="Ability name"
          value={activeAbility.name}
          onChangeText={(v) => updateAbility(activeSlot, { name: v })}
          placeholder="Optional for now"
        />
        <FormField
          label="Description"
          value={activeAbility.description}
          onChangeText={(v) => updateAbility(activeSlot, { description: v })}
          placeholder="What does it do?"
          multiline
          numberOfLines={2}
        />
        {activeCategory === "Basic" && (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <NumberField
                label="Cost (credits)"
                value={activeAbility.cost}
                onChangeValue={(v) => updateAbility(activeSlot, { cost: v })}
                placeholder="200"
              />
            </View>
            <View style={{ flex: 1 }}>
              <NumberField
                label="Charges"
                value={activeAbility.charges}
                onChangeValue={(v) => updateAbility(activeSlot, { charges: v })}
                placeholder="1"
              />
            </View>
          </View>
        )}
        {activeCategory === "Ultimate" && (
          <NumberField
            label="Ult points"
            value={activeAbility.ultPoints}
            onChangeValue={(v) => updateAbility(activeSlot, { ultPoints: v })}
            placeholder="7"
          />
        )}
      </View>
    </FormSheetLayout>
  );
}

const styles = StyleSheet.create({
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
  slotTabs: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  slotTab: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.steel,
  },
  slotTabActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  slotTabKey: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.offWhite,
  },
  slotTabKeyActive: {
    color: colors.ink,
  },
  slotTabCategory: {
    fontSize: 10,
    color: colors.offWhite,
    opacity: 0.7,
  },
  slotTabCategoryActive: {
    color: colors.ink,
    opacity: 0.85,
  },
  slotTabDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  slotTabDotActive: {
    backgroundColor: colors.ink,
  },
});
