import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { StoreController } from '../controllers/store';
import { $activeDeck, setActiveDeck } from '../stores/deck';
import { $currentSlideIndex, setCurrentSlideIndex } from '../stores/navigation';
import { slideRepository } from '../../data/slide-repository';
import './montre-slide';

@customElement('montre-viewport')
export class MontreViewport extends LitElement {
  public deckCtrl = new StoreController(this, $activeDeck);
  public navCtrl = new StoreController(this, $currentSlideIndex);

  @state() private isDraggingOver = false;

  createRenderRoot() {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('dragover', this.onDragOver);
    window.addEventListener('dragleave', this.onDragLeave);
    window.addEventListener('drop', this.onDrop);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('dragover', this.onDragOver);
    window.removeEventListener('dragleave', this.onDragLeave);
    window.removeEventListener('drop', this.onDrop);
  }

  protected updated(): void {
    const viewport = this.querySelector('.deck-viewport');
    if (viewport) viewport.scrollTop = 0;
  }

  private onDragOver = (e: DragEvent) => {
    e.preventDefault();
    this.isDraggingOver = true;
    this.requestUpdate();
  };

  private onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    if (e.relatedTarget === null) {
      this.isDraggingOver = false;
      this.requestUpdate();
    }
  };

  private onDrop = async (e: DragEvent) => {
    e.preventDefault();
    this.isDraggingOver = false;

    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.type.includes('text')) {
        try {
          const deck = await slideRepository.loadFromFile(file);
          setActiveDeck(deck);
          setCurrentSlideIndex(1);
        } catch (err) {
          console.error('[Montre] Drag and drop error:', err);
        }
      }
    }
  };

  render() {
    const deck = this.deckCtrl.value;
    const currentSlideIndex = this.navCtrl.value;

    return html`
      <main class="deck-viewport">
        ${deck.slides.map(
          (slide) => html`
            <montre-slide
              .slide=${slide}
              ?active=${slide.index === currentSlideIndex}
            ></montre-slide>
          `
        )}

        ${this.isDraggingOver
          ? html`
              <div
                style="position: fixed; inset: 0; z-index: 9999; background: rgba(2, 132, 199, 0.25); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 4px dashed var(--accent-blue); display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-main); font-size: 1.6rem; font-weight: 800; pointer-events: none; gap: 1rem;"
              >
                <span style="font-size: 4rem;">📥</span>
                <span>Drop Markdown file to present</span>
              </div>
            `
          : ''}
      </main>
    `;
  }
}
