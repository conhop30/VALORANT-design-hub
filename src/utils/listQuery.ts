export type SortOption = "name-asc" | "name-desc" | "newest" | "oldest";

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "name-asc", label: "Name (A–Z)" },
  { id: "name-desc", label: "Name (Z–A)" },
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
];

interface Searchable {
  name: string;
  createdAt: string;
}

/** Case-insensitive substring match on `name`, then the requested sort. Pure — no store/RN dependency, so it's unit tested directly. */
export function applySearchAndSort<T extends Searchable>(
  items: T[],
  search: string,
  sort: SortOption
): T[] {
  const query = search.trim().toLowerCase();
  const filtered = query ? items.filter((item) => item.name.toLowerCase().includes(query)) : items;

  return [...filtered].sort((a, b) => {
    switch (sort) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "newest":
        return b.createdAt.localeCompare(a.createdAt);
      case "oldest":
        return a.createdAt.localeCompare(b.createdAt);
      default:
        return 0;
    }
  });
}
