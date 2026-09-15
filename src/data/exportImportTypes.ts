import { ExportPayload } from "../types/entities";

export interface ExportImportAdapter {
  /** Hands the JSON off to the OS share sheet (native) or triggers a browser download (web). */
  exportData(payload: ExportPayload): Promise<void>;
  /** Opens a file picker and returns the parsed payload, or null if the user cancelled. */
  importData(): Promise<ExportPayload | null>;
}
