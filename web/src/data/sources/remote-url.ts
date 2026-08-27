import { SlideDeck } from '../../domain/models/deck';
import { parseDeck } from '../../domain/use-cases/parse-deck';

export class RemoteUrlSource {
  static async load(url: string): Promise<SlideDeck> {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'text/markdown, text/plain, */*',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const text = await res.text();
      return parseDeck(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const errorSlide = `---
<!-- _class: lead -->
# ⚠️ 無法載入遠端簡報
### Error loading Markdown from URL

**請求網址**：\`${url}\`  
**錯誤訊息**：\`${msg}\`

> [!WARNING]
> 請確認該網址允許跨來源資源共享 (CORS) 存取，或改為使用本地檔案選擇器開啟檔案。
`;
      return parseDeck(errorSlide);
    }
  }
}
