import { ReactiveController, ReactiveControllerHost } from 'lit';
import DOMPurify from 'dompurify';
import mermaid from 'mermaid';
import '@plantuml/core/viz-global.js';
import { renderToString as renderPlantUMLToString } from '@plantuml/core';
import { openLightbox } from '../stores/lightbox';
import { SwitchThemeUseCase } from '../../domain/use-cases/switch-theme';

// Polyfill DOMPurify for Mermaid 10.x in ESM Vite environments
if (typeof window !== 'undefined') {
  const purify = (DOMPurify as any).default || DOMPurify;
  (window as any).DOMPurify = purify;
}

// Global LRU Cache for rendered SVG strings: `${type}_${theme}_${codeHash}` -> SVG string
const svgRenderCache = new Map<string, string>();

/**
 * Extracts 100% clean, unescaped diagram code immune to markdown escaping or stray HTML tags
 */
function extractCleanDiagramCode(srcEl: HTMLElement): string {
  const dataCode = srcEl.getAttribute('data-code');
  if (dataCode) {
    try {
      return decodeURIComponent(dataCode).trim();
    } catch {
      // fallback
    }
  }
  let code = srcEl.textContent || '';
  // Strip any stray HTML tags injected by markdown parsers
  code = code.replace(/<\/?p>/gi, '').replace(/<br\s*\/?>/gi, '\n');
  // Unescape HTML entities
  code = code
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');
  return code.trim();
}

export class DiagramRenderController implements ReactiveController {
  public host: ReactiveControllerHost & HTMLElement;

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected(): void {
    // Event delegation on host element to ensure zero missed clicks
    this.host.addEventListener('click', this.handleDelegatedClick);
  }

  hostDisconnected(): void {
    this.host.removeEventListener('click', this.handleDelegatedClick);
  }

  /**
   * Delegated click handler to guarantee lightbox opens reliably even with async rendering
   */
  private handleDelegatedClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    const canvas = target.closest<HTMLElement>('.mermaid-canvas, .plantuml-canvas');
    if (!canvas) return;

    const svgEl = canvas.querySelector('svg');
    if (svgEl) {
      const type = canvas.classList.contains('plantuml-canvas') ? 'PlantUML' : 'Mermaid';
      openLightbox(svgEl.outerHTML, `${type} Diagram`);
    }
  };

  /**
   * Fully async diagram rendering pipeline with caching and reliable injection
   */
  async renderForSlide(slideElement: HTMLElement, isDark: boolean): Promise<void> {
    if (!slideElement) return;

    const themeKey = isDark ? 'dark' : 'light';

    // 1. Process Mermaid Diagrams
    const mermaidCanvases = slideElement.querySelectorAll<HTMLElement>('.mermaid-canvas');
    if (mermaidCanvases.length > 0) {
      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          htmlLabels: true,
          flowchart: { htmlLabels: true, useMaxWidth: true },
          theme: isDark ? 'dark' : 'default',
          themeVariables: SwitchThemeUseCase.getMermaidThemeVariables(isDark),
        });
      } catch {
        // Ignore re-init warnings
      }

      for (let i = 0; i < mermaidCanvases.length; i++) {
        const canvas = mermaidCanvases[i];
        const srcEl = canvas.querySelector<HTMLScriptElement>('.mermaid-src');
        const targetEl = canvas.querySelector<HTMLElement>('.mermaid-target');
        if (!srcEl || !targetEl) continue;

        const rawCode = extractCleanDiagramCode(srcEl);
        if (!rawCode) continue;

        const cacheKey = `mermaid_${themeKey}_${rawCode}`;

        // Fast path: synchronous cache hit (0ms)
        if (svgRenderCache.has(cacheKey)) {
          targetEl.innerHTML = svgRenderCache.get(cacheKey)!;
          canvas.style.cursor = 'zoom-in';
          continue;
        }

        // Async path
        const tempId = `m_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
        try {
          const { svg, bindFunctions } = await mermaid.render(tempId, rawCode);

          if (svg && svg.trim()) {
            svgRenderCache.set(cacheKey, svg);
            targetEl.innerHTML = svg;
            canvas.style.cursor = 'zoom-in';

            if (typeof bindFunctions === 'function') {
              bindFunctions(targetEl);
            }
          }
        } catch (err) {
          console.error('[Montre] Mermaid Async Render Error:', err);
          targetEl.innerHTML = `<div style="color: var(--accent-red); font-size: 13px; padding: 12px; font-family: monospace;">⚠️ Mermaid Render Error: ${(err as Error).message || String(err)}</div>`;
        }
      }
    }

    // 2. Process PlantUML Diagrams (Pure Async In-Browser TeaVM)
    const plantumlCanvases = slideElement.querySelectorAll<HTMLElement>('.plantuml-canvas');
    for (let i = 0; i < plantumlCanvases.length; i++) {
      const canvas = plantumlCanvases[i];
      const srcEl = canvas.querySelector<HTMLScriptElement>('.plantuml-src');
      const targetEl = canvas.querySelector<HTMLElement>('.plantuml-target');
      if (!srcEl || !targetEl) continue;

      let rawCode = extractCleanDiagramCode(srcEl);
      if (!rawCode) continue;

      if (!rawCode.startsWith('@startuml')) {
        rawCode = `@startuml\n${rawCode}\n@enduml`;
      }
      const cacheKey = `plantuml_${themeKey}_${rawCode}`;

      // Fast path: synchronous cache hit (0ms)
      if (svgRenderCache.has(cacheKey)) {
        targetEl.innerHTML = svgRenderCache.get(cacheKey)!;
        canvas.style.cursor = 'zoom-in';
        continue;
      }

      const lines = rawCode.split('\n');
      try {
        const svg = await new Promise<string>((resolve, reject) => {
          renderPlantUMLToString(
            lines,
            (resSvg) => resolve(resSvg),
            (err) => reject(new Error(String(err)))
          );
        });

        svgRenderCache.set(cacheKey, svg);
        targetEl.innerHTML = svg;
        canvas.style.cursor = 'zoom-in';
      } catch (err) {
        console.error('[Montre] PlantUML Async Render Error:', err);
        targetEl.innerHTML = `<div style="color: var(--accent-red); font-size: 13px; padding: 12px; font-family: monospace;">⚠️ PlantUML Render Error: ${(err as Error).message || String(err)}</div>`;
      }
    }
  }
}
