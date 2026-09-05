import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { KeyboardController } from '../controllers/keyboard';
import { ProjectorScaleController } from '../controllers/projector-scale';
import { slideRepository } from '../../data/slide-repository';
import { setActiveDeck } from '../stores/deck';
import { setThemeMode } from '../stores/theme';
import { setProjectorZoom } from '../stores/zoom';
import { router } from '../../router';

import './montre-top-nav';
import './montre-viewport';
import './montre-floating-pill';
import './montre-svg-lightbox';
import './montre-share-modal';

@customElement('montre-app')
export class MontreApp extends LitElement {
  public keyboardCtrl = new KeyboardController(this);
  public scaleCtrl = new ProjectorScaleController(this);

  createRenderRoot() {
    return this;
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();

    // 1. Restore Theme and Zoom from LocalStorage
    const session = slideRepository.loadSession();
    setThemeMode(session.theme || 'light');
    setProjectorZoom(session.zoom || '100');

    // 2. Resolve initial Deck from ?url= or Cache or template.md
    const urlParams = new URLSearchParams(window.location.search);
    const queryParamUrl = urlParams.get('url') || urlParams.get('deck') || undefined;

    const { deck } = await slideRepository.resolveInitialDeck(queryParamUrl);
    setActiveDeck(deck);

    // 3. Initialize Router (handles hash routing, URL sync, slide navigation)
    router.init();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    router.destroy();
  }

  render() {
    return html`
      <montre-top-nav></montre-top-nav>
      <montre-viewport></montre-viewport>
      <montre-floating-pill></montre-floating-pill>
      <montre-svg-lightbox></montre-svg-lightbox>
      <montre-share-modal></montre-share-modal>
    `;
  }
}

