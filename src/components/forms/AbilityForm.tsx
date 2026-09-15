import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { v4 as uuid } from "uuid";
import { Ability, ABILITY_CATEGORIES, AbilityCategory } from "../../types/entities";
import { spacing, typography } from "../../theme";
import { FormField, NumberField } from "../FormField";
import { SelectField } from "../SelectField";
import { Button } from "../Button";

interface AbilityFormProps {
  initial?: Ability;
  onSave: (ability: Ability) => void;
  onCancel: () => void;
}

export function AbilityForm({ initial, onSave, onCancel }: AbilityFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<AbilityCategory>(initial?.category ?? "Basic");
  const [cost, setCost] = useState<number | undefined>(initial?.cost);
  const [charges, setCharges] = useState<number | undefined>(initial?.charges);
  const [ultPoints, setUltPoints] = useState<number | undefined>(initial?.ultPoints);

  const canSave = name.trim().length > 0 && description.trim().length > 0;

  const handleSave = () => {
    const now = new Date().toISOString();
    onSave({
      id: initial?.id ?? uuid(),
      name: name.trim(),
      description: description.trim(),
      category,
      cost: category === "Basic" ? cost : undefined,
      charges: category === "Basic" ? charges : undefined,
      ultPoints: category === "Ultimate" ? ultPoints : undefined,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ gap: spacing.md }}>
      <Text style={typography.title}>{initial ? "Edit Ability" : "New Ability"}</Text>
      <FormField label="Name" value={name} onChangeText={setName} placeholder="e.g. Kinetic Snap" />
      <FormField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="What does it do?"
        multiline
        numberOfLines={3}
      />
      <SelectField
        label="Category"
        options={ABILITY_CATEGORIES.map((c) => ({ id: c, label: c }))}
        value={category}
        onChange={(id) => setCategory(id as AbilityCategory)}
      />
      {category === "Basic" && (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <NumberField label="Cost (credits)" value={cost} onChangeValue={setCost} placeholder="200" />
          </View>
          <View style={{ flex: 1 }}>
            <NumberField label="Charges" value={charges} onChangeValue={setCharges} placeholder="1" />
          </View>
        </View>
      )}
      {category === "Ultimate" && (
        <NumberField label="Ult points" value={ultPoints} onChangeValue={setUltPoints} placeholder="7" />
      )}
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
