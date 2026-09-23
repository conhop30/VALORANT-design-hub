export type UpdateTarget = "windows" | "android";

export type UpdateResult =
  | { status: "available"; version: string; url: string }
  | { status: "current" }
  // Offline, rate-limited, malformed response, etc. — an offline-first app
  // must treat all of these as "nothing to report", never as an error.
  | { status: "unavailable" };

export const RELEASES_API = "https://api.github.com/repos/conhop30/VALORANT-design-hub/releases/latest";

// Kept constant across releases so `releases/latest/download/<name>` links
// (README, portfolio site) never need editing — see the README's release steps.
export const ASSET_NAMES: Record<UpdateTarget, string> = {
  windows: "VALORANT-Design-Hub-Setup.exe",
  android: "VALORANT-Design-Hub.apk",
};

const TIMEOUT_MS = 8000;

function parseVersion(v: string): [number, number, number] | null {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(v.trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/** True only when `latest` is strictly greater than `current`. Anything that
 * doesn't parse as a version returns false, so junk never triggers a prompt. */
export function isNewerVersion(current: string, latest: string): boolean {
  const a = parseVersion(current);
  const b = parseVersion(latest);
  if (!a || !b) return false;
  for (let i = 0; i < 3; i++) {
    if (b[i] !== a[i]) return b[i] > a[i];
  }
  return false;
}

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface ReleasePayload {
  tag_name?: string;
  html_url?: string;
  assets?: ReleaseAsset[];
}

function isHttps(url: unknown): url is string {
  return typeof url === "string" && url.startsWith("https://");
}

export async function checkForUpdate(
  currentVersion: string,
  target: UpdateTarget,
  fetchImpl: typeof fetch = fetch
): Promise<UpdateResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(RELEASES_API, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
    });
    if (!res.ok) return { status: "unavailable" };
    const release = (await res.json()) as ReleasePayload;
    if (typeof release.tag_name !== "string" || !parseVersion(release.tag_name)) {
      return { status: "unavailable" };
    }
    if (!isNewerVersion(currentVersion, release.tag_name)) return { status: "current" };

    // Prefer the platform's own installer; fall back to the release page if
    // this release doesn't carry an asset for it. Only https URLs are ever
    // handed to the OS to open.
    const asset = release.assets?.find((a) => a.name === ASSET_NAMES[target]);
    const url = isHttps(asset?.browser_download_url)
      ? asset!.browser_download_url
      : isHttps(release.html_url)
        ? release.html_url
        : null;
    if (!url) return { status: "unavailable" };
    return { status: "available", version: release.tag_name.replace(/^v/, ""), url };
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}
