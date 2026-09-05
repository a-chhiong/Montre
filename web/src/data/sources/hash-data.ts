import { SlideDeck } from '../../domain/models/deck';
import { parseDeck } from '../../domain/use-cases/parse-deck';
import { decompressDeck } from '../../domain/use-cases/compress-deck';

export class HashDataSource {
  /**
   * Decompresses and parses a slide deck from a URL hash data payload
   */
  static async load(payload: string): Promise<SlideDeck> {
    if (!payload || !payload.trim()) {
      throw new Error('[Montre] Empty hash data payload.');
    }

    const markdown = await decompressDeck(payload.trim());
    if (!markdown || !markdown.trim()) {
      throw new Error('[Montre] Failed to decompress hash data payload.');
    }

    return parseDeck(markdown);
  }
}
