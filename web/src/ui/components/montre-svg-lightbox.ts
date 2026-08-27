import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { StoreController } from '../controllers/store';
import {
  $lightboxState,
  closeLightbox,
  zoomInLightbox,
  zoomOutLightbox,
  resetLightboxZoom,
} from '../stores/lightbox';
import { LightboxGesturesController } from '../controllers/lightbox-gestures';

@customElement('montre-svg-lightbox')
export class MontreSvgLightbox extends LitElement {
  public lightboxCtrl = new StoreController(this, $lightboxState);
  public gesturesCtrl = new LightboxGesturesController(this);

  createRenderRoot() {
    return this;
  }

  render() {
    const state = this.lightboxCtrl.value;
    if (!state.isOpen) return html``;

    const { scale, translateX, translateY } = state.transform;
    const transformStyle = `transform: translate3d(${translateX}px, ${translateY}px, 0) scale(${scale});`;

    return html`
      <div class="svg-modal-backdrop active">
        <div
          class="svg-modal-viewport"
          @click=${(e: MouseEvent) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <div
            class="svg-modal-canvas"
            style="${transformStyle}"
          >
            ${unsafeHTML(state.svgContent)}
          </div>
        </div>

        <div class="svg-modal-controls">
          <button class="svg-modal-btn" @click=${zoomInLightbox} title="Zoom In">
            ➕ <span>放大</span>
          </button>

          <button class="svg-modal-btn" @click=${zoomOutLightbox} title="Zoom Out">
            ➖ <span>縮小</span>
          </button>

          <span class="scale-indicator">
            ${Math.round(scale * 100)}%
          </span>

          <button class="svg-modal-btn" @click=${resetLightboxZoom} title="Reset (1.0x)">
            🔄 <span>重設</span>
          </button>

          <button class="svg-modal-btn close-btn" @click=${closeLightbox} title="Close (Esc)">
            ✕ <span>關閉</span>
          </button>
        </div>
      </div>
    `;
  }
}
