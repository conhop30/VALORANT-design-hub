import { ExportPayload } from "../types/entities";
import { ExportImportAdapter } from "./exportImportTypes";

export const exportImport: ExportImportAdapter = {
  async exportData(payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "valorant-agent-designer-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importData() {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.style.display = "none";
      document.body.appendChild(input);

      let resolved = false;
      const onFocus = () => {
        // If the OS file dialog is dismissed without picking anything, the
        // window regains focus shortly after with no 'change' event at all.
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve(null);
          }
        }, 300);
      };
      const cleanup = () => {
        document.body.removeChild(input);
        window.removeEventListener("focus", onFocus);
      };

      input.addEventListener("change", async () => {
        resolved = true;
        const file = input.files?.[0];
        cleanup();
        if (!file) {
          resolve(null);
          return;
        }
        const text = await file.text();
        resolve(JSON.parse(text) as ExportPayload);
      });

      window.addEventListener("focus", onFocus);
      input.click();
    });
  },
};
