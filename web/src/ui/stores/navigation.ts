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
    window.location.hash = NavigateSlideUseCase.formatHash(clamped);
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
