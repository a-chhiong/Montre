import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '../controllers/store';
import { $activeDeck } from '../stores/deck';
import { $currentSlideIndex } from '../stores/navigation';
import { $themeMode, toggleThemeMode } from '../stores/theme';
import { $projectorZoom, cycleProjectorZoom } from '../stores/zoom';
import { $isFullscreen, toggleFullscreen } from '../stores/fullscreen';
import { slideRepository } from '../../data/slide-repository';
import { setActiveDeck } from '../stores/deck';
import { setCurrentSlideIndex } from '../stores/navigation';

@customElement('montre-top-nav')
export class MontreTopNav extends LitElement {
  public deckCtrl = new StoreController(this, $activeDeck);
  public navCtrl = new StoreController(this, $currentSlideIndex);
  public themeCtrl = new StoreController(this, $themeMode);
  public zoomCtrl = new StoreController(this, $projectorZoom);
  public fullscreenCtrl = new StoreController(this, $isFullscreen);

  createRenderRoot() {
    return this;
  }

  private onOpenFileClick() {
    const fileInput = this.querySelector<HTMLInputElement>('#file-input');
    fileInput?.click();
  }

  private async onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        const deck = await slideRepository.loadFromFile(file);
        setActiveDeck(deck);
        setCurrentSlideIndex(1);
      } catch (err) {
        console.error('[Montre] Failed to load file:', err);
      }
    }
  }

  private onDownloadTemplate() {
    const deck = this.deckCtrl.value;
    const content = deck.rawSource && deck.rawSource.trim() ? deck.rawSource : '';

    if (content) {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'montre-template.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const a = document.createElement('a');
      a.href = './template.md';
      a.download = 'montre-template.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  render() {
    const deck = this.deckCtrl.value;
    const isDark = this.themeCtrl.value === 'dark';
    const zoom = this.zoomCtrl.value;
    const isFullscreen = this.fullscreenCtrl.value;

    return html`
      <header class="deck-nav">
        <div class="brand-section">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style="cursor: pointer; flex-shrink: 0; color: var(--accent-blue);"
            @click=${() => setCurrentSlideIndex(1)}
            title="Montre Presentation Engine"
          >
            <rect x="2" y="3" width="20" height="13" rx="2.5" stroke="currentColor" stroke-width="2" />
            <path d="M6 7H12" stroke="var(--accent-green)" stroke-width="2" stroke-linecap="round" />
            <path d="M6 10.5H16" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" />
            <path d="M8 20L10 16H14L16 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="17" cy="7" r="1.2" fill="var(--accent-green)" />
          </svg>
          <span style="cursor: pointer; font-weight: 800;" @click=${() => setCurrentSlideIndex(1)}>${deck.title}</span>
          <span class="brand-chip">v0.3.0</span>
        </div>

        <div class="header-tools">
          <input
            type="file"
            id="file-input"
            style="display: none;"
            accept=".md,.markdown,text/markdown,text/plain"
            @change=${this.onFileChange}
          />

          <button class="tool-btn" @click=${this.onOpenFileClick} title="開啟本地 Markdown 簡報">
            <span>📂 開啟檔案</span>
          </button>

          <button class="tool-btn" @click=${this.onDownloadTemplate} title="下載 Markdown 語法範本 (template.md)">
            <span>📥 範本下載</span>
          </button>

          <button class="tool-btn" @click=${cycleProjectorZoom} title="切換縮放比例 (Z)">
            <span>🔍 縮放:</span>
            <span>${zoom}%</span>
          </button>

          <button class="tool-btn" @click=${toggleThemeMode} title="切換主題 (T)">
            <span>${isDark ? '🌙 深色' : '☀️ 淺色'}</span>
          </button>

          <button class="tool-btn" @click=${toggleFullscreen} title="全螢幕切換 (F)">
            <span>${isFullscreen ? '⛶ 退出' : '⛶ 全螢幕'}</span>
          </button>
        </div>
      </header>
    `;
  }
}
