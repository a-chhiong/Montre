import { SlideDeck } from '../../domain/models/deck';
import { parseDeck } from '../../domain/use-cases/parse-deck';

export class EmbeddedSlideSource {
  static async loadDefault(): Promise<SlideDeck> {
    try {
      const response = await fetch(`./template.md?v=${Date.now()}`);
      if (response.ok) {
        const text = await response.text();
        return parseDeck(text);
      }
    } catch {
      // Fallback
    }

    // Default inline fallback if fetch fails
    const fallbackMarkdown = `---
marp: true
theme: default
paginate: true
---
<!-- _class: lead -->
# Montre
### 現代化 Marp 超集簡報引擎

> [!NOTE]
> 開啟或拖入任何 Markdown 檔案，即刻享受 60 FPS 劇院級放映與向量圖表檢視！
`;
    return parseDeck(fallbackMarkdown);
  }
}
