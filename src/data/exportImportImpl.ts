// Type-checking fallback only — see persistenceImpl.ts for why this exists.
// Metro always resolves exportImportImpl.native.ts / exportImportImpl.web.ts
// first at bundle time; this file is never actually shipped.
export * from "./exportImportImpl.native";
