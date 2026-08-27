import { ReactiveController, ReactiveControllerHost } from 'lit';
import { $projectorZoom } from '../stores/zoom';
import { CycleZoomUseCase } from '../../domain/use-cases/cycle-zoom';

export class ProjectorScaleController implements ReactiveController {
  private host: ReactiveControllerHost;
  private unsubscribe?: () => void;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected(): void {
    this.unsubscribe = $projectorZoom.subscribe((zoom) => {
      const factor = CycleZoomUseCase.getScaleFactor(zoom);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-zoom', zoom);
        document.documentElement.style.setProperty('--zoom-factor', String(factor));
      }
      this.host.requestUpdate();
    });
  }

  hostDisconnected(): void {
    this.unsubscribe?.();
  }
}
