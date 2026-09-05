// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { router, $currentRoute } from '../src/router';
import { setActiveDeck } from '../src/ui/stores/deck';
import { parseDeck } from '../src/domain/use-cases/parse-deck';

describe('Router Unit Tests', () => {
  beforeEach(() => {
    router.destroy();
    const deck = parseDeck(`
# Slide 1
---
# Slide 2
---
# Slide 3
`);
    setActiveDeck(deck);
    window.location.hash = '';
  });

  it('should initialize router and parse default hash route', () => {
    router.init();
    expect($currentRoute.get().slideIndex).toBe(1);
    expect($currentRoute.get().hash).toBe('#slide-1');
  });

  it('should navigate to specific slide route', () => {
    router.navigateToSlide(2);
    expect(window.location.hash).toBe('#slide-2');
  });

  it('should clamp slide navigation to deck boundaries', () => {
    router.navigateToSlide(999);
    expect(window.location.hash).toBe('#slide-3');
  });

  it('should preserve data route payload during slide navigation', () => {
    window.location.hash = '#data/testPayload123';
    router.init();
    expect($currentRoute.get().slideIndex).toBe(1);

    router.navigateToSlide(2);
    expect(window.location.hash).toBe('#data/testPayload123/2');
    expect($currentRoute.get().slideIndex).toBe(2);
  });
});
