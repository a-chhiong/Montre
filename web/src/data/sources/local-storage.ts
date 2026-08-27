import { SessionState } from '../contracts/slide-repository';
import { ThemeMode } from '../../domain/models/theme';
import { ZoomLevel } from '../../domain/models/zoom';

const STORAGE_KEYS = {
  THEME: 'montre_theme',
  ZOOM: 'montre_zoom',
  SLIDE_INDEX: 'montre_last_slide',
  DECK_CACHE: 'montre_cached_deck',
};

export class LocalStorageSource {
  static saveSession(state: Partial<SessionState>): void {
    try {
      if (state.theme) localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
      if (state.zoom) localStorage.setItem(STORAGE_KEYS.ZOOM, state.zoom);
      if (state.slideIndex !== undefined) localStorage.setItem(STORAGE_KEYS.SLIDE_INDEX, String(state.slideIndex));
      if (state.cachedDeckMarkdown !== undefined) localStorage.setItem(STORAGE_KEYS.DECK_CACHE, state.cachedDeckMarkdown);
    } catch {
      // Ignore quota/private browsing errors
    }
  }

  static loadSession(): SessionState {
    let theme: ThemeMode = 'light';
    let zoom: ZoomLevel = '100';
    let slideIndex = 1;
    let cachedDeckMarkdown: string | undefined;

    try {
      const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (storedTheme === 'dark' || storedTheme === 'light') {
        theme = storedTheme;
      }

      const storedZoom = localStorage.getItem(STORAGE_KEYS.ZOOM);
      if (storedZoom === '100' || storedZoom === '115' || storedZoom === '130') {
        zoom = storedZoom;
      }

      const storedSlide = localStorage.getItem(STORAGE_KEYS.SLIDE_INDEX);
      if (storedSlide) {
        const parsed = parseInt(storedSlide, 10);
        if (!isNaN(parsed) && parsed >= 1) {
          slideIndex = parsed;
        }
      }

      const storedDeck = localStorage.getItem(STORAGE_KEYS.DECK_CACHE);
      if (storedDeck) {
        cachedDeckMarkdown = storedDeck;
      }
    } catch {
      // Ignore
    }

    return { theme, zoom, slideIndex, cachedDeckMarkdown };
  }
}
