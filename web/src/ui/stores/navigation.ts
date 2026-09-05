import { atom } from 'nanostores';
import { NavigateSlideUseCase } from '../../domain/use-cases/navigate-slide';
import { $activeDeck } from './deck';

export const $currentSlideIndex = atom<number>(1);

/**
 * Resets all vertical scrollbars to the top when navigating slides
 */
export function resetScrollToTop() {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  if (document.documentElement) document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;

  const scrollContainers = document.querySelectorAll('.slide-page, .deck-viewport, montre-slide');
  scrollContainers.forEach((el) => {
    el.scrollTop = 0;
  });
}

export function setCurrentSlideIndex(index: number) {
  const deck = $activeDeck.get();
  const clamped = NavigateSlideUseCase.clampIndex(index, deck.totalSlides);
  $currentSlideIndex.set(clamped);
  if (typeof window !== 'undefined') {
    const currentHash = window.location.hash || '';
    if (NavigateSlideUseCase.isDataRoute(currentHash)) {
      const dataRoute = NavigateSlideUseCase.extractDataRoute(currentHash, deck.totalSlides);
      if (dataRoute && dataRoute.payload) {
        const newHash = NavigateSlideUseCase.formatDataHash(dataRoute.payload, clamped);
        if (window.location.hash !== newHash) {
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', newHash);
          } else {
            window.location.hash = newHash;
          }
        }
        resetScrollToTop();
        return;
      }
    }
    const standardHash = NavigateSlideUseCase.formatHash(clamped);
    if (window.location.hash !== standardHash) {
      window.location.hash = standardHash;
    }
    resetScrollToTop();
  }
}

export function nextSlide() {
  const deck = $activeDeck.get();
  const current = $currentSlideIndex.get();
  setCurrentSlideIndex(NavigateSlideUseCase.nextIndex(current, deck.totalSlides));
}

export function prevSlide() {
  const deck = $activeDeck.get();
  const current = $currentSlideIndex.get();
  setCurrentSlideIndex(NavigateSlideUseCase.prevIndex(current, deck.totalSlides));
}
