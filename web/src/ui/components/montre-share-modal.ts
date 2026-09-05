import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ShareController } from '../controllers/share';

@customElement('montre-share-modal')
export class MontreShareModal extends LitElement {
  public shareCtrl = new ShareController(this);

  createRenderRoot() {
    return this;
  }

  render() {
    if (!this.shareCtrl.isOpen) return html``;

    const shareUrl = this.shareCtrl.shareUrl;
    const isCompressing = this.shareCtrl.isCompressing;
    const originalKb = (this.shareCtrl.originalBytes / 1024).toFixed(1);
    const compressedKb = (this.shareCtrl.compressedBytes / 1024).toFixed(1);
    const reduction = this.shareCtrl.reductionPercentage;
    const copied = this.shareCtrl.copied;

    return html`
      <div
        class="share-modal-backdrop"
        @click=${(e: Event) => {
          if ((e.target as HTMLElement).classList.contains('share-modal-backdrop')) {
            this.shareCtrl.close();
          }
        }}
      >
        <div class="share-modal-dialog">
          <div class="share-modal-header">
            <div class="share-modal-title">
              <span class="share-modal-icon">🔗</span>
              <span>離線簡報分享 (URL Payload)</span>
            </div>
            <button class="share-close-btn" @click=${() => this.shareCtrl.close()} title="關閉 (Esc)">✕</button>
          </div>

          <div class="share-modal-body">
            <p class="share-desc">
              透過純客戶端 <strong>DEFLATE-Raw 壓縮</strong> 與 <strong>Base64URL 網址編碼</strong>，將完整簡報直接嵌入網址 Hash 中。對方無須下載檔案或連線至特定伺服器，開箱即看！
            </p>

            ${isCompressing
              ? html`
                  <div class="share-loading">
                    <span class="spinner">⏳</span>
                    <span>正在即時壓縮簡報資料...</span>
                  </div>
                `
              : html`
                  <div class="share-stats-grid">
                    <div class="share-stat-item">
                      <span class="stat-label">原始 Markdown</span>
                      <span class="stat-val">${originalKb} KB</span>
                    </div>
                    <div class="share-stat-arrow">➔</div>
                    <div class="share-stat-item">
                      <span class="stat-label">網址資料負載</span>
                      <span class="stat-val accent">${compressedKb} KB</span>
                    </div>
                    <div class="share-stat-badge">
                      <span>節省 ${reduction}%</span>
                    </div>
                  </div>

                  <div class="share-options">
                    <label class="share-checkbox-label">
                      <input
                        type="checkbox"
                        .checked=${this.shareCtrl.includeCurrentSlide}
                        @change=${(e: Event) => {
                          this.shareCtrl.toggleIncludeCurrentSlide((e.target as HTMLInputElement).checked);
                        }}
                      />
                      <span>鎖定目前投影片頁面 (第 ${this.shareCtrl.currentSlide} 頁)</span>
                    </label>
                  </div>

                  <div class="share-url-box">
                    <input
                      type="text"
                      class="share-url-input"
                      readonly
                      .value=${shareUrl}
                      @click=${(e: Event) => (e.target as HTMLInputElement).select()}
                    />
                  </div>

                  <div class="share-actions">
                    <button
                      class="tool-btn primary share-copy-btn ${copied ? 'copied' : ''}"
                      @click=${() => this.shareCtrl.copyToClipboard()}
                    >
                      <span>${copied ? '✅ 已複製分享連結！' : '📋 複製離線分享連結'}</span>
                    </button>

                    ${this.shareCtrl.canNativeShare
                      ? html`
                          <button class="tool-btn share-native-btn" @click=${() => this.shareCtrl.nativeShare()}>
                            <span>📲 系統原生分享</span>
                          </button>
                        `
                      : ''}
                  </div>

                  <div class="share-privacy-notice">
                    <span class="notice-icon">🔒</span>
                    <span><strong>100% 隱私無伺服器</strong>：網址 Hash (#) 絕不會在 HTTP 請求中發送給伺服器，投影片內容完全安全儲存於客戶端。</span>
                  </div>
                `}
          </div>
        </div>
      </div>
    `;
  }
}
