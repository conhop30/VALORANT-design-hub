import { Platform } from "react-native";
import { UpdateTarget } from "./checkForUpdate";

/** Which installer this running copy would be replaced by, or null when
 * there's nothing to check for (plain browser tab, iOS). The Electron shell
 * is identified by the preload bridge, and only ships for Windows. */
export function getUpdateTarget(): UpdateTarget | null {
  if (Platform.OS === "android") return "android";
  if (Platform.OS === "web" && typeof window !== "undefined") {
    if ((window as unknown as { electronAPI?: { isElectron?: boolean } }).electronAPI?.isElectron) {
      return "windows";
    }
  }
  return null;
}
