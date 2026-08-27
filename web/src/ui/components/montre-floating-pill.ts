import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '../controllers/store';
import { $activeDeck } from '../stores/deck';
import { $currentSlideIndex, nextSlide, prevSlide, setCurrentSlideIndex } from '../stores/navigation';

@customElement('montre-floating-pill')
export class MontreFloatingPill extends LitElement {
  public deckCtrl = new StoreController(this, $activeDeck);
  public navCtrl = new StoreController(this, $currentSlideIndex);

  createRenderRoot() {
    return this;
  }

  private onSliderInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const val = parseInt(input.value, 10);
    if (!isNaN(val)) {
      setCurrentSlideIndex(val);
    }
  }

  render() {
    const deck = this.deckCtrl.value;
    const current = this.navCtrl.value;
    const total = Math.max(1, deck.totalSlides);
    const formattedCurrent = String(current).padStart(2, '0');
    const formattedTotal = String(total).padStart(2, '0');

    return html`
      <footer class="deck-controls-floating">
        <button
          class="floating-nav-btn"
          @click=${prevSlide}
          ?disabled=${current <= 1}
          title="上一頁 (← / PageUp)"
        >
          ◀
        </button>

        <div class="floating-slider-wrapper">
          <input
            type="range"
            class="floating-range-slider"
            min="1"
            max="${total}"
            .value="${String(current)}"
            @input=${this.onSliderInput}
          />
          <span class="floating-progress-badge">
            ${formattedCurrent} / ${formattedTotal}
          </span>
        </div>

        <button
          class="floating-nav-btn"
          @click=${nextSlide}
          ?disabled=${current >= total}
          title="下一頁 (→ / Space / PageDown)"
        >
          ▶
        </button>
      </footer>
    `;
  }
}
