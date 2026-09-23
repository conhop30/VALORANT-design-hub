import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Linking } from "react-native";
import { checkForUpdate, UpdateResult } from "./checkForUpdate";
import { APP_VERSION } from "./appVersion";
import { getUpdateTarget } from "./updateTarget";

/**
 * Looks for a newer release once when `autoCheck` becomes true, and on demand
 * via `checkNow`. Callers must pass `autoCheck` only after settings have
 * hydrated — before that the default (on) would fire a check for a user who
 * turned it off.
 */
export function useUpdateCheck(autoCheck: boolean) {
  const target = useMemo(getUpdateTarget, []);
  const [result, setResult] = useState<UpdateResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const autoRan = useRef(false);

  const checkNow = useCallback(async () => {
    if (!target) return;
    setChecking(true);
    const next = await checkForUpdate(APP_VERSION, target);
    setResult(next);
    setDismissed(false);
    setChecking(false);
  }, [target]);

  useEffect(() => {
    if (autoCheck && target && !autoRan.current) {
      autoRan.current = true;
      checkNow();
    }
  }, [autoCheck, target, checkNow]);

  const openDownload = useCallback(() => {
    if (result?.status !== "available") return;
    Linking.openURL(result.url).catch(() => {});
    setDismissed(true);
  }, [result]);

  return {
    supported: target !== null,
    version: APP_VERSION,
    result,
    checking,
    showBanner: result?.status === "available" && !dismissed,
    checkNow,
    openDownload,
    dismiss: () => setDismissed(true),
  };
}

export type UpdateCheck = ReturnType<typeof useUpdateCheck>;
