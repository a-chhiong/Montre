import { ReactiveController, ReactiveControllerHost } from 'lit';
import { $isShareModalOpen, closeShareModal } from '../stores/share';
import { $activeDeck } from '../stores/deck';
import { $currentSlideIndex } from '../stores/navigation';
import { compressDeck } from '../../domain/use-cases/compress-deck';
import { NavigateSlideUseCase } from '../../domain/use-cases/navigate-slide';

export class ShareController implements ReactiveController {
  private host: ReactiveControllerHost;
  private unsubs: Array<() => void> = [];

  public isCompressing = false;
  public payload = '';
  public originalBytes = 0;
  public compressedBytes = 0;
  public copied = false;
  public includeCurrentSlide = true;
  private copyTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.host.addController(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  hostConnected(): void {
    window.addEventListener('keydown', this.onKeyDown);

    // Subscribe to modal open/close
    this.unsubs.push(
      $isShareModalOpen.subscribe((isOpen) => {
        if (isOpen && !this.payload && !this.isCompressing) {
          this.generatePayload();
        } else if (!isOpen) {
          this.reset();
        }
        this.host.requestUpdate();
      })
    );

    // Subscribe to active deck changes
    this.unsubs.push(
      $activeDeck.subscribe(() => {
        if ($isShareModalOpen.get()) {
          this.payload = '';
          this.generatePayload();
        }
      })
    );

    // Subscribe to navigation slide index
    this.unsubs.push(
      $currentSlideIndex.subscribe(() => {
        if ($isShareModalOpen.get()) {
          this.host.requestUpdate();
        }
      })
    );
  }

  hostDisconnected(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs = [];
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
      this.copyTimeout = null;
    }
  }

  get isOpen(): boolean {
    return $isShareModalOpen.get();
  }

  get deckTitle(): string {
    return $activeDeck.get().title || 'Montre 簡報';
  }

  get currentSlide(): number {
    return $currentSlideIndex.get();
  }

  get reductionPercentage(): number {
    if (this.originalBytes <= 0) return 0;
    return Math.max(0, Math.round((1 - this.compressedBytes / this.originalBytes) * 100));
  }

  get canNativeShare(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  }

  get shareUrl(): string {
    if (typeof window === 'undefined' || !this.payload) return '';
    const origin = window.location.origin + window.location.pathname;
    const slide = this.currentSlide;
    const hash = this.includeCurrentSlide && slide > 1
      ? NavigateSlideUseCase.formatDataHash(this.payload, slide)
      : NavigateSlideUseCase.formatDataHash(this.payload, 1);
    return origin + hash;
  }

  public toggleIncludeCurrentSlide(val?: boolean): void {
    this.includeCurrentSlide = typeof val === 'boolean' ? val : !this.includeCurrentSlide;
    this.host.requestUpdate();
  }

  public close(): void {
    closeShareModal();
  }

  public async copyToClipboard(): Promise<boolean> {
    const url = this.shareUrl;
    if (!url) return false;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      this.copied = true;
      this.host.requestUpdate();

      if (this.copyTimeout) clearTimeout(this.copyTimeout);
      this.copyTimeout = setTimeout(() => {
        this.copied = false;
        this.host.requestUpdate();
      }, 2500);

      return true;
    } catch (err) {
      console.error('[Montre] Failed to copy share URL:', err);
      return false;
    }
  }

  public async nativeShare(): Promise<void> {
    const url = this.shareUrl;
    if (!url || !navigator.share) return;

    try {
      await navigator.share({
        title: this.deckTitle,
        text: `觀看簡報：${this.deckTitle}`,
        url,
      });
    } catch {
      // User cancelled or share dismissed
    }
  }

  private async generatePayload(): Promise<void> {
    const deck = $activeDeck.get();
    const raw = deck.rawSource || '';
    if (!raw.trim()) return;

    this.isCompressing = true;
    this.host.requestUpdate();

    try {
      this.originalBytes = new TextEncoder().encode(raw).length;
      const compressed = await compressDeck(raw);
      this.payload = compressed;
      this.compressedBytes = compressed.length;
    } catch (err) {
      console.error('[Montre] Error compressing presentation deck:', err);
    } finally {
      this.isCompressing = false;
      this.host.requestUpdate();
    }
  }

  private reset(): void {
    this.payload = '';
    this.copied = false;
    this.isCompressing = false;
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
      this.copyTimeout = null;
    }
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }
}
