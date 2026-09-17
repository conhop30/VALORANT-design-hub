import { useCallback } from "react";
import { useAudioPlayer } from "expo-audio";
import { useDesignStore } from "../data/store";
import { clickSound } from "./sounds";

/** Returns a function that plays the UI click sound, gated by the Settings toggle. */
export function useClickSound() {
  const player = useAudioPlayer(clickSound);
  const sfxEnabled = useDesignStore((s) => s.audioSettings.sfxEnabled);
  const sfxVolume = useDesignStore((s) => s.audioSettings.sfxVolume);

  return useCallback(() => {
    if (!sfxEnabled) return;
    player.volume = sfxVolume;
    // Await the seek before play() — firing both at once can race with the
    // web player's underlying HTMLMediaElement and surface a spurious
    // "play() interrupted by pause()" AbortError in the console.
    player.seekTo(0).finally(() => player.play());
  }, [player, sfxEnabled, sfxVolume]);
}
