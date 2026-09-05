import { ReactiveController, ReactiveControllerHost } from 'lit';
import { updateLightboxTransform, resetLightboxZoom } from '../stores/lightbox';
import { TransformLightboxUseCase } from '../../domain/use-cases/transform-lightbox';

export class LightboxGesturesController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;
  private isDragging = false;
  private startX = 0;
  private startY = 0;

  private initialPinchDist = 0;
  private lastTouchX = 0;
  private lastTouchY = 0;

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    this.host.addController(this);

    this.onWheel = this.onWheel.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onDoubleClick = this.onDoubleClick.bind(this);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  }

  hostConnected(): void {
    this.host.addEventListener('wheel', this.onWheel, { passive: false });
    this.host.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    this.host.addEventListener('dblclick', this.onDoubleClick);

    this.host.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.host.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.host.addEventListener('touchend', this.onTouchEnd);
  }

  hostDisconnected(): void {
    this.host.removeEventListener('wheel', this.onWheel);
    this.host.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.host.removeEventListener('dblclick', this.onDoubleClick);

    this.host.removeEventListener('touchstart', this.onTouchStart);
    this.host.removeEventListener('touchmove', this.onTouchMove);
    this.host.removeEventListener('touchend', this.onTouchEnd);
  }


  private onWheel(e: WheelEvent): void {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Pinch to Zoom
      updateLightboxTransform((prev) => TransformLightboxUseCase.applyPinch(prev, e.deltaY));
    } else {
      // 2-Finger Pan
      updateLightboxTransform((prev) => TransformLightboxUseCase.applyPan(prev, e.deltaX, e.deltaY));
    }
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return; // Left click only
    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    const deltaX = this.startX - e.clientX;
    const deltaY = this.startY - e.clientY;
    this.startX = e.clientX;
    this.startY = e.clientY;

    updateLightboxTransform((prev) => TransformLightboxUseCase.applyPan(prev, deltaX, deltaY));
  }

  private onMouseUp(): void {
    this.isDragging = false;
  }

  private onDoubleClick(e: MouseEvent): void {
    e.stopPropagation();
    resetLightboxZoom();
  }

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      this.lastTouchX = e.touches[0].clientX;
      this.lastTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.initialPinchDist = Math.sqrt(dx * dx + dy * dy);
    }
  }

  private onTouchMove(e: TouchEvent): void {
    if (e.touches.length === 1) {
      e.preventDefault();
      const deltaX = this.lastTouchX - e.touches[0].clientX;
      const deltaY = this.lastTouchY - e.touches[0].clientY;
      this.lastTouchX = e.touches[0].clientX;
      this.lastTouchY = e.touches[0].clientY;
      updateLightboxTransform((prev) => TransformLightboxUseCase.applyPan(prev, deltaX, deltaY));
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      if (this.initialPinchDist > 0) {
        const deltaDist = this.initialPinchDist - newDist;
        updateLightboxTransform((prev) => TransformLightboxUseCase.applyPinch(prev, deltaDist * 2));
      }
      this.initialPinchDist = newDist;
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    if (e.touches.length < 2) {
      this.initialPinchDist = 0;
    }
    if (e.touches.length === 1) {
      this.lastTouchX = e.touches[0].clientX;
      this.lastTouchY = e.touches[0].clientY;
    }
  }
}

