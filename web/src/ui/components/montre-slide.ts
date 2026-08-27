import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { SlideNode } from '../../domain/models/deck';
import { DiagramRenderController } from '../controllers/diagram-render';
import { StoreController } from '../controllers/store';
import { $themeMode } from '../stores/theme';

@customElement('montre-slide')
export class MontreSlide extends LitElement {
  @property({ type: Object }) slide?: SlideNode;
  @property({ type: Boolean, reflect: true }) active = false;

  public diagramCtrl = new DiagramRenderController(this);
  public themeCtrl = new StoreController(this, $themeMode);

  createRenderRoot() {
    return this;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    if (this.active && this.slide) {
      const isDark = this.themeCtrl.value === 'dark';

      // Always reset slide scroll position to the top when activated
      const pageEl = this.querySelector('.slide-page') as HTMLElement;
      if (pageEl) {
        pageEl.scrollTop = 0;
      }

      // Trigger diagram on-demand rendering
      requestAnimationFrame(() => {
        this.diagramCtrl.renderForSlide(this as unknown as HTMLElement, isDark);
      });
    }
  }

  render() {
    if (!this.slide) return html``;

    const customClass = this.slide.directives.class || '';
    const isLead = customClass.includes('lead');
    const isInvert = customClass.includes('invert') ? 'invert' : '';
    const headerTag = this.slide.directives.header;

    return html`
      <div
        class="slide-page ${this.active ? 'active' : ''} ${isInvert}"
        data-slide-index="${this.slide.index}"
      >
        <div class="slide-inner">
          ${isLead
            ? html`
                <div class="hero-layout">
                  ${headerTag ? html`<div class="slide-tag-line">${headerTag}</div>` : ''}
                  ${unsafeHTML(this.slide.htmlContent)}
                </div>
              `
            : html`
                ${headerTag ? html`<div class="slide-tag-line">${headerTag}</div>` : ''}
                ${unsafeHTML(this.slide.htmlContent)}
              `}
        </div>
      </div>
    `;
  }
}
