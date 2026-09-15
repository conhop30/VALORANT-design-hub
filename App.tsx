import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Hub } from "./src/screens/Hub";
import { AmbientMusicController } from "./src/audio/AmbientMusicController";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AmbientMusicController />
      <Hub />
    </SafeAreaProvider>
  );
}
