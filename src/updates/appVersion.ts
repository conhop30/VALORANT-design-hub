// Single source of truth shared by every platform (web bundle, Electron,
// Android). A test asserts this stays equal to app.json's version, which is
// what the Android build embeds.
export const APP_VERSION: string = require("../../package.json").version;
