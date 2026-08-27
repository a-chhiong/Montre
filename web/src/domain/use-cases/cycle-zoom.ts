import { ZoomLevel, ZOOM_FACTORS } from '../models/zoom';

export class CycleZoomUseCase {
  private static readonly ZOOM_ORDER: ZoomLevel[] = ['100', '115', '130'];

  static next(current: ZoomLevel): ZoomLevel {
    const currentIndex = this.ZOOM_ORDER.indexOf(current);
    if (currentIndex === -1 || currentIndex === this.ZOOM_ORDER.length - 1) {
      return this.ZOOM_ORDER[0];
    }
    return this.ZOOM_ORDER[currentIndex + 1];
  }

  static getScaleFactor(level: ZoomLevel): number {
    return ZOOM_FACTORS[level] ?? 1.0;
  }
}
