import { ISlideRepository, SessionState } from './contracts/slide-repository';
import { EmbeddedSlideSource } from './sources/embedded-slide';
import { RemoteUrlSource } from './sources/remote-url';
import { FileDropSource } from './sources/file-drop';
import { LocalStorageSource } from './sources/local-storage';
import { HashDataSource } from './sources/hash-data';
import { SlideDeck } from '../domain/models/deck';
import { parseDeck } from '../domain/use-cases/parse-deck';
import { NavigateSlideUseCase } from '../domain/use-cases/navigate-slide';

export class SlideRepository implements ISlideRepository {
  async loadDefaultDeck(): Promise<SlideDeck> {
    return EmbeddedSlideSource.loadDefault();
  }

  async loadFromUrl(url: string): Promise<SlideDeck> {
    const deck = await RemoteUrlSource.load(url);
    this.saveSession({ cachedDeckMarkdown: deck.rawSource });
    return deck;
  }

  async loadFromFile(file: File): Promise<SlideDeck> {
    const deck = await FileDropSource.readFile(file);
    this.saveSession({ cachedDeckMarkdown: deck.rawSource, slideIndex: 1 });
    return deck;
  }

  async loadFromHashPayload(payload: string): Promise<SlideDeck> {
    const deck = await HashDataSource.load(payload);
    this.saveSession({ cachedDeckMarkdown: deck.rawSource });
    return deck;
  }

  saveSession(state: Partial<SessionState>): void {
    LocalStorageSource.saveSession(state);
  }

  loadSession(): SessionState {
    return LocalStorageSource.loadSession();
  }

  async resolveInitialDeck(queryParamUrl?: string): Promise<{ deck: SlideDeck; initialIndex: number }> {
    const session = this.loadSession();

    // 1. If URL hash contains offline #data/<payload>
    if (typeof window !== 'undefined' && window.location && window.location.hash) {
      const hash = window.location.hash;
      if (NavigateSlideUseCase.isDataRoute(hash)) {
        const dataRoute = NavigateSlideUseCase.extractDataRoute(hash);
        if (dataRoute && dataRoute.payload) {
          try {
            const deck = await this.loadFromHashPayload(dataRoute.payload);
            return { deck, initialIndex: dataRoute.slideIndex || 1 };
          } catch (err) {
            console.warn('[Montre] Failed to load from hash data route, falling back:', err);
          }
        }
      }
    }

    // 2. If URL query parameter ?url=... is present
    if (queryParamUrl && queryParamUrl.trim()) {
      const deck = await this.loadFromUrl(queryParamUrl.trim());
      return { deck, initialIndex: 1 };
    }

    // 3. If cached custom deck in localStorage exists
    if (session.cachedDeckMarkdown && session.cachedDeckMarkdown.trim()) {
      try {
        const deck = parseDeck(session.cachedDeckMarkdown);
        return { deck, initialIndex: session.slideIndex || 1 };
      } catch {
        // Fallback
      }
    }

    // 4. Fallback to default demo deck
    const deck = await this.loadDefaultDeck();
    return { deck, initialIndex: session.slideIndex || 1 };
  }
}

// Global Singleton Instance
export const slideRepository = new SlideRepository();
