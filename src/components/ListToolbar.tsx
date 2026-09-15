import React from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "../theme";
import { FormField } from "./FormField";
import { SelectField } from "./SelectField";
import { SORT_OPTIONS, SortOption } from "../utils/listQuery";

interface FilterOption {
  id: string;
  label: string;
}

interface ListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  filterLabel: string;
  filterOptions: FilterOption[];
  filterValue: string;
  onFilterChange: (value: string) => void;
}

export function ListToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  filterLabel,
  filterOptions,
  filterValue,
  onFilterChange,
}: ListToolbarProps) {
  return (
    <View style={styles.container}>
      <FormField
        label="Search"
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search by name…"
        autoCorrect={false}
      />
      <SelectField
        label="Sort"
        options={SORT_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
        value={sort}
        onChange={(id) => onSortChange(id as SortOption)}
      />
      <SelectField
        label={filterLabel}
        options={filterOptions}
        value={filterValue}
        onChange={onFilterChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
});
