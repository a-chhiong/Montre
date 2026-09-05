import { SlideDeck } from '../../domain/models/deck';
import { ThemeMode } from '../../domain/models/theme';
import { ZoomLevel } from '../../domain/models/zoom';

export interface SessionState {
  theme: ThemeMode;
  zoom: ZoomLevel;
  slideIndex: number;
  cachedDeckMarkdown?: string;
}

export interface ISlideRepository {
  loadDefaultDeck(): Promise<SlideDeck>;
  loadFromUrl(url: string): Promise<SlideDeck>;
  loadFromFile(file: File): Promise<SlideDeck>;
  loadFromHashPayload(payload: string): Promise<SlideDeck>;
  saveSession(state: Partial<SessionState>): void;
  loadSession(): SessionState;
  resolveInitialDeck(queryParamUrl?: string): Promise<{ deck: SlideDeck; initialIndex: number }>;
}
