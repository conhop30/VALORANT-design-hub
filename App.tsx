import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Hub } from "./src/screens/Hub";
import { AmbientMusicController } from "./src/audio/AmbientMusicController";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { colors } from "./src/theme";

export default function App() {
  const [fontsLoaded] = useFonts({
    "BebasNeue-Regular": require("./assets/fonts/BebasNeue-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.ink }} />;
  }

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
