import { ASSET_NAMES, checkForUpdate, isNewerVersion } from "../checkForUpdate";
import { APP_VERSION } from "../appVersion";

const appJson = require("../../../app.json");
const packageJson = require("../../../package.json");

function fakeFetch(body: unknown, init: { ok?: boolean } = {}): typeof fetch {
  return jest.fn(async () => ({
    ok: init.ok ?? true,
    json: async () => body,
  })) as unknown as typeof fetch;
}

const release = (tag: string, extra: object = {}) => ({
  tag_name: tag,
  html_url: "https://github.com/conhop30/VALORANT-design-hub/releases/tag/" + tag,
  assets: [
    { name: ASSET_NAMES.windows, browser_download_url: "https://example.com/setup.exe" },
    { name: ASSET_NAMES.android, browser_download_url: "https://example.com/app.apk" },
  ],
  ...extra,
});

describe("isNewerVersion", () => {
  it("compares numerically, not lexically", () => {
    expect(isNewerVersion("1.9.0", "1.10.0")).toBe(true);
    expect(isNewerVersion("1.10.0", "1.9.0")).toBe(false);
  });
  it("only reports strictly newer versions", () => {
    expect(isNewerVersion("1.1.0", "1.1.0")).toBe(false);
    expect(isNewerVersion("1.1.0", "v1.1.1")).toBe(true);
    expect(isNewerVersion("1.1.0", "2.0.0")).toBe(true);
    expect(isNewerVersion("2.0.0", "1.9.9")).toBe(false);
  });
  it("never prompts on unparseable input", () => {
    expect(isNewerVersion("1.1.0", "latest")).toBe(false);
    expect(isNewerVersion("garbage", "2.0.0")).toBe(false);
  });
});

describe("checkForUpdate", () => {
  it("offers the platform's own installer when a newer release exists", async () => {
    const win = await checkForUpdate("1.1.0", "windows", fakeFetch(release("v1.2.0")));
    const and = await checkForUpdate("1.1.0", "android", fakeFetch(release("v1.2.0")));
    expect(win).toEqual({ status: "available", version: "1.2.0", url: "https://example.com/setup.exe" });
    expect(and).toEqual({ status: "available", version: "1.2.0", url: "https://example.com/app.apk" });
  });

  it("falls back to the release page when the platform's asset is missing", async () => {
    const r = release("v1.2.0", { assets: [] });
    expect(await checkForUpdate("1.1.0", "android", fakeFetch(r))).toEqual({
      status: "available",
      version: "1.2.0",
      url: r.html_url,
    });
  });

  it("reports current when already on the latest or newer", async () => {
    expect(await checkForUpdate("1.2.0", "windows", fakeFetch(release("v1.2.0")))).toEqual({ status: "current" });
    expect(await checkForUpdate("1.3.0", "windows", fakeFetch(release("v1.2.0")))).toEqual({ status: "current" });
  });

  it("treats network failure, bad status, and malformed payloads as unavailable, never throwing", async () => {
    const boom = jest.fn(async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;
    expect(await checkForUpdate("1.1.0", "windows", boom)).toEqual({ status: "unavailable" });
    expect(await checkForUpdate("1.1.0", "windows", fakeFetch({}, { ok: false }))).toEqual({ status: "unavailable" });
    expect(await checkForUpdate("1.1.0", "windows", fakeFetch({ tag_name: "nightly" }))).toEqual({
      status: "unavailable",
    });
  });

  it("refuses to hand back a non-https download URL", async () => {
    const r = release("v1.2.0", {
      html_url: "http://insecure.example/x",
      assets: [{ name: ASSET_NAMES.windows, browser_download_url: "javascript:alert(1)" }],
    });
    expect(await checkForUpdate("1.1.0", "windows", fakeFetch(r))).toEqual({ status: "unavailable" });
  });
});

describe("version sources", () => {
  it("app.json and package.json versions stay in sync (Android embeds one, the update check reads the other)", () => {
    expect(appJson.expo.version).toBe(packageJson.version);
    expect(APP_VERSION).toBe(packageJson.version);
  });
});
