import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { v4 as uuid } from "uuid";
import { WEAPON_CATEGORIES, Weapon, WeaponCategory } from "../../types/entities";
import { spacing, typography } from "../../theme";
import { FormField, NumberField } from "../FormField";
import { SelectField } from "../SelectField";
import { Button } from "../Button";

interface WeaponFormProps {
  initial?: Weapon;
  onSave: (weapon: Weapon) => void;
  onCancel: () => void;
}

export function WeaponForm({ initial, onSave, onCancel }: WeaponFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<WeaponCategory>(initial?.category ?? "Rifle");
  const [cost, setCost] = useState<number | undefined>(initial?.cost);
  const [fireRate, setFireRate] = useState<number | undefined>(initial?.fireRate);
  const [magazineSize, setMagazineSize] = useState<number | undefined>(initial?.magazineSize);
  const [close, setClose] = useState<number | undefined>(initial?.damage.close);
  const [mid, setMid] = useState<number | undefined>(initial?.damage.mid);
  const [far, setFar] = useState<number | undefined>(initial?.damage.far);

  const canSave =
    name.trim().length > 0 &&
    cost !== undefined &&
    fireRate !== undefined &&
    magazineSize !== undefined &&
    close !== undefined &&
    mid !== undefined &&
    far !== undefined;

  const handleSave = () => {
    if (!canSave) return;
    const now = new Date().toISOString();
    onSave({
      id: initial?.id ?? uuid(),
      name: name.trim(),
      category,
      cost: cost!,
      fireRate: fireRate!,
      magazineSize: magazineSize!,
      damage: { close: close!, mid: mid!, far: far! },
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ gap: spacing.md }}>
      <Text style={typography.title}>{initial ? "Edit Weapon" : "New Weapon"}</Text>
      <FormField label="Name" value={name} onChangeText={setName} placeholder="e.g. Halcyon SR-9" />
      <SelectField
        label="Category"
        options={WEAPON_CATEGORIES.map((c) => ({ id: c, label: c }))}
        value={category}
        onChange={(id) => setCategory(id as WeaponCategory)}
      />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <NumberField label="Cost (credits)" value={cost} onChangeValue={setCost} placeholder="2900" />
        </View>
        <View style={{ flex: 1 }}>
          <NumberField label="Fire rate (/s)" value={fireRate} onChangeValue={setFireRate} placeholder="9.75" />
        </View>
        <View style={{ flex: 1 }}>
          <NumberField label="Magazine" value={magazineSize} onChangeValue={setMagazineSize} placeholder="25" />
        </View>
      </View>
      <Text style={typography.caption}>Damage by range</Text>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <NumberField label="Close" value={close} onChangeValue={setClose} placeholder="40" />
        </View>
        <View style={{ flex: 1 }}>
          <NumberField label="Mid" value={mid} onChangeValue={setMid} placeholder="35" />
        </View>
        <View style={{ flex: 1 }}>
          <NumberField label="Far" value={far} onChangeValue={setFar} placeholder="30" />
        </View>
      </View>
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
