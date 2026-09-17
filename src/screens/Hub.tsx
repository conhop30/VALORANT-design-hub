import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDesignStore } from "../data/store";
import { seedIfEmpty } from "../data/seed";
import { colors, spacing, typography } from "../theme";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { AgentCard } from "../components/AgentCard";
import { WeaponCard } from "../components/WeaponCard";
import { Sheet } from "../components/Sheet";
import { AgentForm } from "../components/forms/AgentForm";
import { WeaponForm } from "../components/forms/WeaponForm";
import { SettingsSheet } from "../components/SettingsSheet";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ListToolbar } from "../components/ListToolbar";
import { HeroPanel } from "../components/HeroPanel";
import { Button } from "../components/Button";
import { useClickSound } from "../audio/useClickSound";
import { Agent, Weapon, ROLES, WEAPON_CATEGORIES } from "../types/entities";
import { applySearchAndSort, SortOption } from "../utils/listQuery";

type Library = "agents" | "weapons";
type SheetMode =
  | { kind: "none" }
  | { kind: "agent"; agent?: Agent }
  | { kind: "weapon"; weapon?: Weapon }
  | { kind: "settings" };
type DeleteRequest = { library: Library; id: string; name: string };

interface ListQuery {
  search: string;
  sort: SortOption;
  filter: string;
}

const DEFAULT_LIST_QUERY: ListQuery = { search: "", sort: "name-asc", filter: "all" };

// Below this viewport width there isn't room for the content column plus a
// meaningfully-sized hero panel side by side, so the hero image is simply
// not shown rather than being squeezed into an unreadable sliver.
const HERO_PANEL_MIN_WIDTH = 1000;

const ROLE_FILTER_OPTIONS = [
  { id: "all", label: "All roles" },
  ...ROLES.map((r) => ({ id: r, label: r })),
];
const WEAPON_FILTER_OPTIONS = [
  { id: "all", label: "All categories" },
  ...WEAPON_CATEGORIES.map((c) => ({ id: c, label: c })),
];

export function Hub() {
  const playClick = useClickSound();
  const { width: windowWidth } = useWindowDimensions();
  const hydrated = useDesignStore((s) => s.hydrated);
  const hydrate = useDesignStore((s) => s.hydrate);
  const lastError = useDesignStore((s) => s.lastError);
  const dismissError = useDesignStore((s) => s.dismissError);

  const agents = useDesignStore((s) => s.agents);
  const weapons = useDesignStore((s) => s.weapons);
  const uiSettings = useDesignStore((s) => s.uiSettings);
  const setUiSetting = useDesignStore((s) => s.setUiSetting);

  const saveAgent = useDesignStore((s) => s.saveAgent);
  const removeAgent = useDesignStore((s) => s.removeAgent);
  const saveWeapon = useDesignStore((s) => s.saveWeapon);
  const removeWeapon = useDesignStore((s) => s.removeWeapon);

  const [library, setLibrary] = useState<Library>("agents");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetMode>({ kind: "none" });
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(null);
  const [queries, setQueries] = useState<Record<Library, ListQuery>>({
    agents: { ...DEFAULT_LIST_QUERY },
    weapons: { ...DEFAULT_LIST_QUERY },
  });
  const query = queries[library];
  const updateQuery = (patch: Partial<ListQuery>) =>
    setQueries((prev) => ({ ...prev, [library]: { ...prev[library], ...patch } }));

  const performDelete = (library: Library, id: string) => {
    if (library === "agents") removeAgent(id);
    else removeWeapon(id);
  };

  const requestDelete = (library: Library, id: string, name: string) => {
    if (!uiSettings.confirmDeletes) {
      performDelete(library, id);
      return;
    }
    setDeleteRequest({ library, id, name });
  };

  useEffect(() => {
    hydrate().then(seedIfEmpty);
  }, [hydrate]);

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={colors.red} />
      </SafeAreaView>
    );
  }

  const closeSheet = () => setSheet({ kind: "none" });

  const renderList = () => {
    if (library === "agents") {
      const raw = Object.values(agents);
      if (raw.length === 0) return <EmptyState label="No agents yet." />;
      const items = applySearchAndSort(raw, query.search, query.sort).filter(
        (a) => query.filter === "all" || a.role === query.filter
      );
      return (
        <>
          <ListToolbar
            search={query.search}
            onSearchChange={(v) => updateQuery({ search: v })}
            sort={query.sort}
            onSortChange={(v) => updateQuery({ sort: v })}
            filterLabel="Role"
            filterOptions={ROLE_FILTER_OPTIONS}
            filterValue={query.filter}
            onFilterChange={(v) => updateQuery({ filter: v })}
          />
          {items.length === 0 ? (
            <EmptyState label="No agents match your search." />
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {items.map((item) => (
                <AgentCard
                  key={item.id}
                  agent={item}
                  expanded={expandedId === item.id}
                  onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
                  onEdit={() => setSheet({ kind: "agent", agent: item })}
                  onDelete={() => requestDelete("agents", item.id, item.name)}
                />
              ))}
            </ScrollView>
          )}
        </>
      );
    }
    const raw = Object.values(weapons);
    if (raw.length === 0) return <EmptyState label="No weapons yet." />;
    const items = applySearchAndSort(raw, query.search, query.sort).filter(
      (w) => query.filter === "all" || w.category === query.filter
    );
    return (
      <>
        <ListToolbar
          search={query.search}
          onSearchChange={(v) => updateQuery({ search: v })}
          sort={query.sort}
          onSortChange={(v) => updateQuery({ sort: v })}
          filterLabel="Category"
          filterOptions={WEAPON_FILTER_OPTIONS}
          filterValue={query.filter}
          onFilterChange={(v) => updateQuery({ filter: v })}
        />
        {items.length === 0 ? (
          <EmptyState label="No weapons match your search." />
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {items.map((item) => (
              <WeaponCard
                key={item.id}
                weapon={item}
                expanded={expandedId === item.id}
                onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
                onEdit={() => setSheet({ kind: "weapon", weapon: item })}
                onDelete={() => requestDelete("weapons", item.id, item.name)}
              />
            ))}
          </ScrollView>
        )}
      </>
    );
  };

  const expandedAgent = library === "agents" && expandedId ? agents[expandedId] : undefined;
  const expandedHeroUri = expandedAgent?.heroImageUri;
  const showHeroPanel = !!expandedHeroUri && windowWidth >= HERO_PANEL_MIN_WIDTH;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={[styles.body, showHeroPanel ? styles.bodySplit : styles.bodyLeft]}>
        <View style={[styles.content, showHeroPanel && styles.contentWithHero]}>
          <View style={styles.topBar}>
            <Text style={typography.title}>Design Hub</Text>
            <Pressable
              onPress={() => {
                playClick();
                setSheet({ kind: "settings" });
              }}
              hitSlop={8}
            >
              <Text style={styles.gear}>⚙</Text>
            </Pressable>
          </View>

          {lastError && (
            <Pressable style={styles.errorBanner} onPress={dismissError}>
              <Text style={styles.errorText}>{lastError} (tap to dismiss)</Text>
            </Pressable>
          )}

          <View style={styles.tabsWrap}>
            <SegmentedTabs
              value={library}
              onChange={setLibrary}
              options={[
                { key: "agents", label: "Agents" },
                { key: "weapons", label: "Weapons" },
              ]}
            />
          </View>

          {renderList()}

          <View style={styles.fabWrap}>
            <Button
              label={`+ New ${library === "agents" ? "Agent" : "Weapon"}`}
              onPress={() =>
                setSheet(library === "agents" ? { kind: "agent" } : { kind: "weapon" })
              }
            />
          </View>
        </View>

        {showHeroPanel && (
          <View style={styles.heroPanelWrap}>
            <HeroPanel key={expandedId} uri={expandedHeroUri!} focal={expandedAgent?.heroFocal} />
          </View>
        )}
      </View>

      <Sheet visible={sheet.kind !== "none"} onClose={closeSheet}>
        {sheet.kind === "agent" && (
          <AgentForm
            key={sheet.agent?.id ?? "new-agent"}
            initial={sheet.agent}
            onCancel={closeSheet}
            onSave={async (a) => {
              const ok = await saveAgent(a);
              if (ok) closeSheet();
            }}
          />
        )}
        {sheet.kind === "weapon" && (
          <WeaponForm
            key={sheet.weapon?.id ?? "new-weapon"}
            initial={sheet.weapon}
            onCancel={closeSheet}
            onSave={async (w) => {
              const ok = await saveWeapon(w);
              if (ok) closeSheet();
            }}
          />
        )}
        {sheet.kind === "settings" && <SettingsSheet onClose={closeSheet} />}
      </Sheet>

      {deleteRequest && (
        <ConfirmDialog
          key={deleteRequest.id}
          title={`Delete "${deleteRequest.name}"?`}
          message="This can't be undone."
          onCancel={() => setDeleteRequest(null)}
          onConfirm={(suppressFuture) => {
            performDelete(deleteRequest.library, deleteRequest.id);
            if (suppressFuture) setUiSetting("confirmDeletes", false);
            setDeleteRequest(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <View style={styles.empty}>
      <Text style={typography.body}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  body: {
    flex: 1,
    flexDirection: "row",
  },
  bodyLeft: {
    justifyContent: "flex-start",
  },
  bodySplit: {
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 640,
    paddingHorizontal: spacing.md,
  },
  contentWithHero: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 640,
    width: "auto",
    alignSelf: "stretch",
  },
  heroPanelWrap: {
    width: 340,
    minWidth: 240,
    flexShrink: 1,
    marginLeft: spacing.lg,
    marginVertical: spacing.md,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  gear: {
    fontSize: 22,
    color: colors.offWhite,
  },
  tabsWrap: {
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: 96,
  },
  fabWrap: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  empty: {
    padding: spacing.lg,
    alignItems: "center",
  },
  errorBanner: {
    backgroundColor: colors.redDark,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.offWhite,
    fontSize: 13,
  },
});
