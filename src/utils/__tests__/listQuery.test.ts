import { applySearchAndSort } from "../listQuery";

interface Item {
  id: string;
  name: string;
  createdAt: string;
}

const items: Item[] = [
  { id: "1", name: "Vantage", createdAt: "2024-01-02T00:00:00.000Z" },
  { id: "2", name: "Sage", createdAt: "2024-01-03T00:00:00.000Z" },
  { id: "3", name: "brimstone", createdAt: "2024-01-01T00:00:00.000Z" },
];

describe("applySearchAndSort", () => {
  it("returns all items unsorted-by-search when search is empty", () => {
    const result = applySearchAndSort(items, "", "name-asc");
    expect(result).toHaveLength(3);
  });

  it("filters case-insensitively by substring of name", () => {
    const result = applySearchAndSort(items, "sa", "name-asc");
    expect(result.map((i) => i.name)).toEqual(["Sage"]);
  });

  it("matches regardless of the query's casing", () => {
    const result = applySearchAndSort(items, "BRIM", "name-asc");
    expect(result.map((i) => i.name)).toEqual(["brimstone"]);
  });

  it("ignores leading/trailing whitespace in the search query", () => {
    const result = applySearchAndSort(items, "  sage  ", "name-asc");
    expect(result.map((i) => i.name)).toEqual(["Sage"]);
  });

  it("sorts name-asc case-insensitively", () => {
    const result = applySearchAndSort(items, "", "name-asc");
    expect(result.map((i) => i.name)).toEqual(["brimstone", "Sage", "Vantage"]);
  });

  it("sorts name-desc case-insensitively", () => {
    const result = applySearchAndSort(items, "", "name-desc");
    expect(result.map((i) => i.name)).toEqual(["Vantage", "Sage", "brimstone"]);
  });

  it("sorts newest first by createdAt", () => {
    const result = applySearchAndSort(items, "", "newest");
    expect(result.map((i) => i.id)).toEqual(["2", "1", "3"]);
  });

  it("sorts oldest first by createdAt", () => {
    const result = applySearchAndSort(items, "", "oldest");
    expect(result.map((i) => i.id)).toEqual(["3", "1", "2"]);
  });

  it("does not mutate the input array", () => {
    const copy = [...items];
    applySearchAndSort(items, "", "name-desc");
    expect(items).toEqual(copy);
  });

  it("returns an empty array when nothing matches the search", () => {
    const result = applySearchAndSort(items, "nonexistent", "name-asc");
    expect(result).toEqual([]);
  });
});
