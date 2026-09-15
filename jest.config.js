/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
  },
  reporters: ["default", "<rootDir>/scripts/jestDevReporter.js"],
  // Only populated when a run passes --coverage (see the "test:watch"/"dev"
  // scripts) — scoped to the pure-logic modules that are realistically unit
  // testable without a React Native rendering environment.
  collectCoverageFrom: [
    "src/data/repository.ts",
    "src/data/store.ts",
    "src/data/seed.ts",
    "src/data/persistenceImpl.web.ts",
    "src/data/exportImport.ts",
    "src/data/exportImportImpl.web.ts",
    "src/utils/**/*.ts",
  ],
  coverageReporters: ["text-summary", "json-summary"],
};
