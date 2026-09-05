// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { compressDeck, decompressDeck, uint8ArrayToBase64Url, base64UrlToUint8Array } from '../../src/domain/use-cases/compress-deck';
import { NavigateSlideUseCase } from '../../src/domain/use-cases/navigate-slide';

describe('Domain: Deck Compression & Decompression Use Cases', () => {
  it('should roundtrip byte conversion between Uint8Array and Base64URL', () => {
    const original = new Uint8Array([0, 1, 2, 42, 128, 255, 64, 13]);
    const b64 = uint8ArrayToBase64Url(original);
    expect(b64).not.toContain('+');
    expect(b64).not.toContain('/');
    expect(b64).not.toContain('=');

    const decoded = base64UrlToUint8Array(b64);
    expect(Array.from(decoded)).toEqual(Array.from(original));
  });

  it('should compress and decompress ASCII and Markdown text', async () => {
    const text = '# Slide Title\n\n* Item 1\n* Item 2\n\n```js\nconsole.log("hello");\n```';
    const compressed = await compressDeck(text);
    expect(typeof compressed).toBe('string');
    expect(compressed.length).toBeGreaterThan(0);

    const recovered = await decompressDeck(compressed);
    expect(recovered).toBe(text);
  });

  it('should roundtrip CJK Traditional Chinese, emoji, and diagram code', async () => {
    const text = `---
marp: true
---
# 📽️ 現代化簡報引擎
### 台灣華語支援與零裁切視窗

\`\`\`mermaid
flowchart TD
  A[開始 🚀] --> B{決策 💡}
  B -->|是| C[完成 ✅]
\`\`\`
`;
    const compressed = await compressDeck(text);
    const recovered = await decompressDeck(compressed);
    expect(recovered).toBe(text);
  });

  it('should handle empty string safely', async () => {
    expect(await compressDeck('')).toBe('');
    expect(await decompressDeck('')).toBe('');
  });

  it('should parse and format data routes in NavigateSlideUseCase', () => {
    const samplePayload = 'eJztwTEBAAAAwqD1T20ND6AAAA';
    const hash1 = `#data/${samplePayload}`;
    const hash2 = `#data/${samplePayload}/3`;

    expect(NavigateSlideUseCase.isDataRoute(hash1)).toBe(true);
    expect(NavigateSlideUseCase.isDataRoute(hash2)).toBe(true);
    expect(NavigateSlideUseCase.isDataRoute('#slide-2')).toBe(false);

    expect(NavigateSlideUseCase.extractDataRoute(hash1, 10)).toEqual({
      payload: samplePayload,
      slideIndex: 1,
    });

    expect(NavigateSlideUseCase.extractDataRoute(hash2, 10)).toEqual({
      payload: samplePayload,
      slideIndex: 3,
    });

    expect(NavigateSlideUseCase.parseHash(hash1, 10)).toBe(1);
    expect(NavigateSlideUseCase.parseHash(hash2, 10)).toBe(3);

    expect(NavigateSlideUseCase.formatDataHash(samplePayload, 1)).toBe(`#data/${samplePayload}`);
    expect(NavigateSlideUseCase.formatDataHash(samplePayload, 4)).toBe(`#data/${samplePayload}/4`);
  });

  it('should end-to-end load deck via SlideRepository from hash payload', async () => {
    const markdown = `# Shared Slide 1\n---\n# Shared Slide 2`;
    const payload = await compressDeck(markdown);

    const originalHash = window.location.hash;
    try {
      window.location.hash = `#data/${payload}/2`;
      const { slideRepository } = await import('../../src/data/slide-repository');
      const { deck, initialIndex } = await slideRepository.resolveInitialDeck();

      expect(deck.totalSlides).toBe(2);
      expect(initialIndex).toBe(2);
      expect(deck.slides[0].rawMarkdown).toContain('# Shared Slide 1');
      expect(deck.slides[1].rawMarkdown).toContain('# Shared Slide 2');
    } finally {
      window.location.hash = originalHash;
    }
  });
});

