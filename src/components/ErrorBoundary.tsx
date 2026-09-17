import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";
import { Button } from "./Button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Last-resort safety net for render/lifecycle errors that slip past the data
 * layer's own Result<T> handling (see data/repository.ts — every store
 * action already catches and surfaces persistence failures without
 * throwing). Without this, an uncaught render error crashes to a blank
 * white screen with no way to recover short of a full app reload. Ships in
 * every build, including production — this isn't test tooling.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={typography.title}>Something went wrong</Text>
          <Text style={[typography.body, styles.message]}>
            {this.state.error.message || "An unexpected error occurred."}
          </Text>
          <Button label="Try again" onPress={this.reset} matte={colors.ink} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  message: {
    textAlign: "center",
  },
});
