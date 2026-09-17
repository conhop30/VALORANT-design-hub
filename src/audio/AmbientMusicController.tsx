import { useEffect } from "react";
import { useAudioPlayer } from "expo-audio";
import { useDesignStore } from "../data/store";
import { ambientSound } from "./sounds";

/** No UI — mounted once at the app root to own the looping ambient track. */
export function AmbientMusicController() {
  const player = useAudioPlayer(ambientSound);
  const hydrated = useDesignStore((s) => s.hydrated);
  const musicEnabled = useDesignStore((s) => s.audioSettings.musicEnabled);
  const musicVolume = useDesignStore((s) => s.audioSettings.musicVolume);

  useEffect(() => {
    player.loop = true;
  }, [player]);

  // Before hydrate() resolves, audioSettings is still DEFAULT_AUDIO_SETTINGS —
  // skip applying it so the player only ever sees the real persisted values,
  // never a stale default it'd have to immediately correct.
  useEffect(() => {
    if (!hydrated) return;
    player.volume = musicVolume;
  }, [player, musicVolume, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (musicEnabled) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, musicEnabled, hydrated]);

  return null;
}
