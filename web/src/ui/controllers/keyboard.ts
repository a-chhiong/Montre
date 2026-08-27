import { ReactiveController, ReactiveControllerHost } from 'lit';
import { nextSlide, prevSlide, setCurrentSlideIndex } from '../stores/navigation';
import { toggleThemeMode } from '../stores/theme';
import { cycleProjectorZoom } from '../stores/zoom';
import { toggleFullscreen } from '../stores/fullscreen';
import { $lightboxState, closeLightbox } from '../stores/lightbox';
import { $activeDeck } from '../stores/deck';

export class KeyboardController implements ReactiveController {
  private host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.host.addController(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  hostConnected(): void {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  hostDisconnected(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Ignore input events when focusing on text input or textarea
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      if (e.key === 'Escape') target.blur();
      return;
    }

    const lightbox = $lightboxState.get();

    if (lightbox.isOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ': // Spacebar
      case 'Enter':
        e.preventDefault();
        nextSlide();
        break;

      case 'ArrowLeft':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault();
        prevSlide();
        break;

      case 'Home':
        e.preventDefault();
        setCurrentSlideIndex(1);
        break;

      case 'End':
        e.preventDefault();
        setCurrentSlideIndex($activeDeck.get().totalSlides);
        break;

      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;

      case 't':
      case 'T':
        e.preventDefault();
        toggleThemeMode();
        break;

      case 'z':
      case 'Z':
        e.preventDefault();
        cycleProjectorZoom();
        break;

      default:
        break;
    }
  }
}
