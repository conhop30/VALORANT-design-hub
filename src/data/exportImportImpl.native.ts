import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { ExportPayload } from "../types/entities";
import { ExportImportAdapter } from "./exportImportTypes";

export const exportImport: ExportImportAdapter = {
  async exportData(payload) {
    const file = new File(Paths.cache, "valorant-agent-designer-export.json");
    if (file.exists) {
      file.delete();
    }
    file.create();
    file.write(JSON.stringify(payload, null, 2));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        dialogTitle: "Export design data",
      });
    } else {
      throw new Error("Sharing isn't available on this device.");
    }
  },

  async importData() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) {
      return null;
    }
    const file = new File(result.assets[0].uri);
    const text = await file.text();
    return JSON.parse(text) as ExportPayload;
  },
};
