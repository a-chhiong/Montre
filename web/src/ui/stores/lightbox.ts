import { atom } from 'nanostores';
import { LightboxState, INITIAL_LIGHTBOX_STATE } from '../../domain/models/lightbox';
import { TransformLightboxUseCase } from '../../domain/use-cases/transform-lightbox';

export const $lightboxState = atom<LightboxState>(INITIAL_LIGHTBOX_STATE);

/**
 * Normalizes SVG to guarantee seamless auto-fit scaling in modal viewport
 */
export function normalizeSvgForLightbox(svg: string): string {
  if (!svg) return '';

  return svg
    .replace(/style="([^"]*max-width:[^;"]*;?)*"/gi, '')
    .replace(/<svg\b([^>]*)>/i, (_match, attrs: string) => {
      let cleaned = attrs
        .replace(/\bstyle="[^"]*"/gi, '')
        .replace(/\bwidth="[^"]*"/gi, '')
        .replace(/\bheight="[^"]*"/gi, '');

      if (!attrs.includes('preserveAspectRatio')) {
        cleaned += ' preserveAspectRatio="xMidYMid meet"';
      }
      return `<svg ${cleaned.trim()}>`;
    });
}

export function openLightbox(svgContent: string, title?: string) {
  $lightboxState.set({
    isOpen: true,
    svgContent: normalizeSvgForLightbox(svgContent),
    title,
    transform: TransformLightboxUseCase.reset(),
  });
}

export function closeLightbox() {
  $lightboxState.set({
    ...$lightboxState.get(),
    isOpen: false,
  });
}

export function zoomInLightbox() {
  const current = $lightboxState.get();
  $lightboxState.set({
    ...current,
    transform: TransformLightboxUseCase.applyZoomStep(current.transform, 1.25),
  });
}

export function zoomOutLightbox() {
  const current = $lightboxState.get();
  $lightboxState.set({
    ...current,
    transform: TransformLightboxUseCase.applyZoomStep(current.transform, 0.8),
  });
}

export function resetLightboxZoom() {
  const current = $lightboxState.get();
  $lightboxState.set({
    ...current,
    transform: TransformLightboxUseCase.reset(),
  });
}

export function updateLightboxTransform(updater: (prev: LightboxState['transform']) => LightboxState['transform']) {
  const current = $lightboxState.get();
  $lightboxState.set({
    ...current,
    transform: updater(current.transform),
  });
}
