// Type-checking fallback only. Metro always resolves the platform-suffixed
// file (persistenceImpl.native.ts / persistenceImpl.web.ts) first at bundle
// time on every platform, so this file is never actually shipped — it exists
// purely so `tsc` (which doesn't understand Metro's platform extensions) can
// resolve the bare `./persistenceImpl` import used by repository.ts.
export * from "./persistenceImpl.native";
