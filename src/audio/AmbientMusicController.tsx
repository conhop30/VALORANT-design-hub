import { useEffect } from "react";
import { useAudioPlayer } from "expo-audio";
import { useDesignStore } from "../data/store";
import { ambientSound } from "./sounds";

/** No UI — mounted once at the app root to own the looping ambient track. */
export function AmbientMusicController() {
  const player = useAudioPlayer(ambientSound);
  const musicEnabled = useDesignStore((s) => s.audioSettings.musicEnabled);
  const musicVolume = useDesignStore((s) => s.audioSettings.musicVolume);

  useEffect(() => {
    player.loop = true;
  }, [player]);

  useEffect(() => {
    player.volume = musicVolume;
  }, [player, musicVolume]);

  useEffect(() => {
    if (musicEnabled) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, musicEnabled]);

  return null;
}
