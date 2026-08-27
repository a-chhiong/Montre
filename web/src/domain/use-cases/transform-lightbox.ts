import { LightboxTransform, INITIAL_LIGHTBOX_TRANSFORM } from '../models/lightbox';

export class TransformLightboxUseCase {
  static readonly MIN_SCALE = 0.4;
  static readonly MAX_SCALE = 6.0;

  static applyPinch(current: LightboxTransform, wheelDeltaY: number): LightboxTransform {
    const zoomDelta = -wheelDeltaY * 0.012;
    const nextScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, current.scale + zoomDelta));
    return {
      ...current,
      scale: parseFloat(nextScale.toFixed(3)),
    };
  }

  static applyZoomStep(current: LightboxTransform, factor: number): LightboxTransform {
    const nextScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, current.scale * factor));
    return {
      ...current,
      scale: parseFloat(nextScale.toFixed(3)),
    };
  }

  static applyPan(current: LightboxTransform, deltaX: number, deltaY: number): LightboxTransform {
    return {
      ...current,
      translateX: current.translateX - deltaX,
      translateY: current.translateY - deltaY,
    };
  }

  static reset(): LightboxTransform {
    return { ...INITIAL_LIGHTBOX_TRANSFORM };
  }
}
