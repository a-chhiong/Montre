import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { StoreController } from '../controllers/store';
import { $activeDeck, setActiveDeck } from '../stores/deck';
import { $currentSlideIndex, setCurrentSlideIndex } from '../stores/navigation';
import { $themeMode, toggleThemeMode } from '../stores/theme';
import { $projectorZoom, cycleProjectorZoom } from '../stores/zoom';
import { $isFullscreen, toggleFullscreen } from '../stores/fullscreen';
import { openShareModal } from '../stores/share';
import { slideRepository } from '../../data/slide-repository';

@customElement('montre-top-nav')
export class MontreTopNav extends LitElement {
  public deckCtrl = new StoreController(this, $activeDeck);
  public navCtrl = new StoreController(this, $currentSlideIndex);
  public themeCtrl = new StoreController(this, $themeMode);
  public zoomCtrl = new StoreController(this, $projectorZoom);
  public fullscreenCtrl = new StoreController(this, $isFullscreen);

  @state() private isMobileMenuOpen = false;

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this.onKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.onKeyDown);
  }

  createRenderRoot() {
    return this;
  }

  private onOpenFileClick() {
    this.isMobileMenuOpen = false;
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
    this.isMobileMenuOpen = false;
    const deck = this.deckCtrl.value;
    const content = deck.rawSource && deck.rawSource.trim() ? deck.rawSource : '';

    if (content) {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'montre-presentation.md';
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
          <span class="brand-title" @click=${() => setCurrentSlideIndex(1)} title="${deck.title}">${deck.title}</span>
        </div>

        <input
          type="file"
          id="file-input"
          style="display: none;"
          accept=".md,.markdown,text/markdown,text/plain"
          @change=${this.onFileChange}
        />

        <!-- Unified Navigation Actions across all viewports -->
        <div class="header-tools">
          <button class="tool-btn highlight-btn" @click=${openShareModal} title="離線分享此簡報 (產生 #data/ 網址)">
            <span style="color: var(--accent-blue);">🔗</span>
            <span class="btn-label">分享</span>
          </button>

          <button class="tool-btn" @click=${toggleFullscreen} title="${isFullscreen ? '退出全螢幕 (F)' : '全螢幕放映 (F)'}">
            <span>${isFullscreen ? '🗗' : '⛶'}</span>
            <span class="btn-label">${isFullscreen ? '退出' : '全螢幕'}</span>
          </button>

          <button
            class="tool-btn menu-toggle-btn ${this.isMobileMenuOpen ? 'active' : ''}"
            @click=${() => { this.isMobileMenuOpen = !this.isMobileMenuOpen; }}
            title="功能選單"
            aria-label="功能選單"
          >
            <span>${this.isMobileMenuOpen ? '✕' : '☰'}</span>
            <span class="btn-label">選單</span>
          </button>
        </div>
      </header>

      <!-- Slide-Over Drawer -->
      ${this.isMobileMenuOpen
        ? html`
            <div class="mobile-drawer-backdrop" @click=${() => { this.isMobileMenuOpen = false; }}>
              <div class="mobile-right-drawer" @click=${(e: Event) => e.stopPropagation()}>
                <div class="drawer-header">
                  <div class="drawer-title-row">
                    <span class="drawer-brand-icon">📽️</span>
                    <span class="drawer-title">功能選單</span>
                  </div>
                  <button class="drawer-close-btn" @click=${() => { this.isMobileMenuOpen = false; }} aria-label="關閉 (Close)">✕</button>
                </div>

                <div class="drawer-content">
                  <div class="drawer-section-label">外觀風格</div>
                  <div class="drawer-menu-group">
                    <button class="drawer-menu-row" @click=${toggleThemeMode}>
                      <div class="row-left">
                        <span class="row-icon">${isDark ? '🌙' : '☀️'}</span>
                        <span class="row-label">切換主題模式</span>
                      </div>
                      <div class="row-right">
                        <kbd class="row-shortcut">T</kbd>
                        <span class="row-badge">${isDark ? '深色' : '淺色'}</span>
                      </div>
                    </button>
                  </div>

                  <div class="drawer-section-label">簡報管理</div>
                  <div class="drawer-menu-group">
                    <button class="drawer-menu-row" @click=${this.onOpenFileClick}>
                      <div class="row-left">
                        <span class="row-icon">📂</span>
                        <span class="row-label">開啟 Markdown 檔案</span>
                      </div>
                      <span class="row-badge">本機</span>
                    </button>

                    <button class="drawer-menu-row" @click=${this.onDownloadTemplate}>
                      <div class="row-left">
                        <span class="row-icon">📥</span>
                        <span class="row-label">下載簡報原始檔</span>
                      </div>
                      <span class="row-badge">.md</span>
                    </button>
                  </div>

                  <div class="drawer-section-label">放映設定</div>
                  <div class="drawer-menu-group">
                    <button class="drawer-menu-row" @click=${cycleProjectorZoom}>
                      <div class="row-left">
                        <span class="row-icon">🔍</span>
                        <span class="row-label">視窗縮放比例</span>
                      </div>
                      <div class="row-right">
                        <kbd class="row-shortcut">Z</kbd>
                        <span class="row-badge accent">${zoom}%</span>
                      </div>
                    </button>

                    <button class="drawer-menu-row" @click=${toggleFullscreen}>
                      <div class="row-left">
                        <span class="row-icon">${isFullscreen ? '🗗' : '⛶'}</span>
                        <span class="row-label">${isFullscreen ? '退出全螢幕放映' : '進入全螢幕放映'}</span>
                      </div>
                      <div class="row-right">
                        <kbd class="row-shortcut">F</kbd>
                        <span class="row-badge">${isFullscreen ? '放映中' : '視窗'}</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div class="drawer-footer">
                  <div class="drawer-footer-tip">
                    <span>💡 左右箭頭 / 空白鍵 翻頁</span>
                  </div>
                  <div class="drawer-version-chip">Montre v1.0.0</div>
                </div>
              </div>
            </div>
          `
        : ''}
    `;
  }
}
