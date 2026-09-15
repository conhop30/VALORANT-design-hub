import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Hub } from "./src/screens/Hub";
import { AmbientMusicController } from "./src/audio/AmbientMusicController";
import { ErrorBoundary } from "./src/components/ErrorBoundary";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ErrorBoundary>
        <AmbientMusicController />
        <Hub />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
