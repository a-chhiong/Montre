import { SlideDeck } from '../../domain/models/deck';
import { parseDeck } from '../../domain/use-cases/parse-deck';

export class FileDropSource {
  static async readFile(file: File): Promise<SlideDeck> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result as string;
          const deck = parseDeck(content);
          resolve(deck);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}
