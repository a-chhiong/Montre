import { atom } from 'nanostores';
import { ZoomLevel } from '../../domain/models/zoom';
import { CycleZoomUseCase } from '../../domain/use-cases/cycle-zoom';
import { slideRepository } from '../../data/slide-repository';

export const $projectorZoom = atom<ZoomLevel>('100');

export function setProjectorZoom(zoom: ZoomLevel) {
  $projectorZoom.set(zoom);
  const factor = CycleZoomUseCase.getScaleFactor(zoom);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-zoom', zoom);
    document.documentElement.style.setProperty('--zoom-factor', String(factor));
  }
  slideRepository.saveSession({ zoom });
}

export function cycleProjectorZoom() {
  const nextZoom = CycleZoomUseCase.next($projectorZoom.get());
  setProjectorZoom(nextZoom);
}
