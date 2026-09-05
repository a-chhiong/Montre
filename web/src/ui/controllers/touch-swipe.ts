import { ReactiveController, ReactiveControllerHost } from 'lit';
import { nextSlide, prevSlide } from '../stores/navigation';

export class TouchSwipeController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    this.host.addController(this);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  }

  hostConnected(): void {
    this.host.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.host.addEventListener('touchend', this.onTouchEnd, { passive: true });
  }

  hostDisconnected(): void {
    this.host.removeEventListener('touchstart', this.onTouchStart);
    this.host.removeEventListener('touchend', this.onTouchEnd);
  }

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = Date.now();
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    if (e.changedTouches.length === 1) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - this.touchStartX;
      const deltaY = touchEndY - this.touchStartY;
      const deltaTime = Date.now() - this.touchStartTime;

      // Ensure horizontal swipe is dominant over vertical scrolling
      if (Math.abs(deltaX) >= 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && deltaTime < 800) {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.closest('input, button, .deck-controls-floating'))) {
          return;
        }

        if (deltaX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }
  }
}
