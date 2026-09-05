import { atom } from 'nanostores';
import { setCurrentSlideIndex } from './ui/stores/navigation';
import { $activeDeck } from './ui/stores/deck';
import { NavigateSlideUseCase } from './domain/use-cases/navigate-slide';

export interface RouteState {
  hash: string;
  slideIndex: number;
  params: Record<string, string>;
  query: Record<string, string>;
}

export const $currentRoute = atom<RouteState>({
  hash: '#slide-1',
  slideIndex: 1,
  params: { slide: '1' },
  query: {},
});

export class Router {
  private static instance: Router;
  private isListening = false;

  private constructor() {}

  static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  /**
   * Initializes global hash routing and popstate listeners
   */
  init(): void {
    if (this.isListening || typeof window === 'undefined') return;
    this.isListening = true;

    window.addEventListener('hashchange', this.handleHashChange);
    window.addEventListener('popstate', this.handleHashChange);

    // Initial parse on load
    this.handleHashChange();
  }

  /**
   * Destroys listeners on app teardown
   */
  destroy(): void {
    if (!this.isListening || typeof window === 'undefined') return;
    window.removeEventListener('hashchange', this.handleHashChange);
    window.removeEventListener('popstate', this.handleHashChange);
    this.isListening = false;
  }

  /**
   * Navigates to a specific hash route
   */
  navigate(target: string): void {
    if (typeof window === 'undefined') return;
    const formatted = target.startsWith('#') ? target : `#${target}`;
    if (window.location.hash !== formatted) {
      window.location.hash = formatted;
      this.handleHashChange();
    }
  }

  /**
   * Navigates directly to a target slide index (1-based)
   */
  navigateToSlide(slideIndex: number, replaceHistory = false): void {
    if (typeof window === 'undefined') return;
    const deck = $activeDeck.get();
    const clamped = NavigateSlideUseCase.clampIndex(slideIndex, deck.totalSlides);

    // If currently on a data route (#data/<payload>), preserve payload
    const currentHash = window.location.hash || '';
    if (NavigateSlideUseCase.isDataRoute(currentHash)) {
      const dataRoute = NavigateSlideUseCase.extractDataRoute(currentHash, deck.totalSlides);
      if (dataRoute && dataRoute.payload) {
        const newHash = NavigateSlideUseCase.formatDataHash(dataRoute.payload, clamped);
        if (window.location.hash !== newHash) {
          if (replaceHistory && window.history && window.history.replaceState) {
            window.history.replaceState(null, '', newHash);
            this.handleHashChange();
            return;
          }
          this.navigate(newHash);
        }
        return;
      }
    }

    this.navigate(NavigateSlideUseCase.formatHash(clamped));
  }

  /**
   * Reads current URL query params (?url=..., etc.)
   */
  getQueryParams(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const searchParams = new URLSearchParams(window.location.search);
    const query: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      query[key] = val;
    });
    return query;
  }

  private handleHashChange = (): void => {
    const hash = window.location.hash || '#slide-1';
    const deck = $activeDeck.get();
    const slideIndex = NavigateSlideUseCase.parseHash(hash, deck.totalSlides || 9999);
    const query = this.getQueryParams();

    const routeState: RouteState = {
      hash,
      slideIndex,
      params: { slide: String(slideIndex) },
      query,
    };

    $currentRoute.set(routeState);
    setCurrentSlideIndex(slideIndex);
  };
}

export const router = Router.getInstance();
