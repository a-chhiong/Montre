import { describe, it, expect } from 'vitest';
import { NavigateSlideUseCase } from '../../src/domain/use-cases/navigate-slide';
import { SwitchThemeUseCase } from '../../src/domain/use-cases/switch-theme';
import { CycleZoomUseCase } from '../../src/domain/use-cases/cycle-zoom';
import { TransformLightboxUseCase } from '../../src/domain/use-cases/transform-lightbox';

describe('Domain Use-Cases: Navigation, Theme, Zoom, Lightbox', () => {
  describe('NavigateSlideUseCase', () => {
    it('should clamp index within [1, totalSlides]', () => {
      expect(NavigateSlideUseCase.clampIndex(0, 10)).toBe(1);
      expect(NavigateSlideUseCase.clampIndex(-5, 10)).toBe(1);
      expect(NavigateSlideUseCase.clampIndex(11, 10)).toBe(10);
      expect(NavigateSlideUseCase.clampIndex(5, 10)).toBe(5);
    });

    it('should calculate next and prev indices correctly', () => {
      expect(NavigateSlideUseCase.nextIndex(1, 5)).toBe(2);
      expect(NavigateSlideUseCase.nextIndex(5, 5)).toBe(5);
      expect(NavigateSlideUseCase.prevIndex(3, 5)).toBe(2);
      expect(NavigateSlideUseCase.prevIndex(1, 5)).toBe(1);
    });

    it('should parse URL hash and format hash correctly', () => {
      expect(NavigateSlideUseCase.parseHash('#slide-4', 10)).toBe(4);
      expect(NavigateSlideUseCase.parseHash('#7', 10)).toBe(7);
      expect(NavigateSlideUseCase.parseHash('#invalid', 10)).toBe(1);
      expect(NavigateSlideUseCase.formatHash(3)).toBe('#slide-3');
    });
  });

  describe('SwitchThemeUseCase', () => {
    it('should toggle between light and dark', () => {
      expect(SwitchThemeUseCase.toggle('light')).toBe('dark');
      expect(SwitchThemeUseCase.toggle('dark')).toBe('light');
    });

    it('should generate theme config and mermaid variables', () => {
      const darkConfig = SwitchThemeUseCase.getConfig('dark');
      expect(darkConfig.isDark).toBe(true);

      const darkVars = SwitchThemeUseCase.getMermaidThemeVariables(true);
      expect(darkVars.darkMode).toBe(true);
      expect(darkVars.background).toBe('#131e33');

      const lightVars = SwitchThemeUseCase.getMermaidThemeVariables(false);
      expect(lightVars.darkMode).toBe(false);
      expect(lightVars.primaryColor).toBe('#f1f5f9');
    });
  });

  describe('CycleZoomUseCase', () => {
    it('should cycle 100 -> 115 -> 130 -> 100', () => {
      expect(CycleZoomUseCase.next('100')).toBe('115');
      expect(CycleZoomUseCase.next('115')).toBe('130');
      expect(CycleZoomUseCase.next('130')).toBe('100');
    });

    it('should map zoom level to scale factor', () => {
      expect(CycleZoomUseCase.getScaleFactor('100')).toBe(1.0);
      expect(CycleZoomUseCase.getScaleFactor('115')).toBe(1.15);
      expect(CycleZoomUseCase.getScaleFactor('130')).toBe(1.3);
    });
  });

  describe('TransformLightboxUseCase', () => {
    it('should pinch zoom within min and max scale limits [0.4, 6.0]', () => {
      const initial = { scale: 1.0, translateX: 0, translateY: 0 };
      const zoomedIn = TransformLightboxUseCase.applyPinch(initial, -100);
      expect(zoomedIn.scale).toBeGreaterThan(1.0);

      const extremeZoomOut = TransformLightboxUseCase.applyPinch(initial, 10000);
      expect(extremeZoomOut.scale).toBe(0.4);

      const extremeZoomIn = TransformLightboxUseCase.applyPinch(initial, -10000);
      expect(extremeZoomIn.scale).toBe(6.0);
    });

    it('should pan coordinates correctly', () => {
      const initial = { scale: 1.0, translateX: 0, translateY: 0 };
      const panned = TransformLightboxUseCase.applyPan(initial, 50, -30);
      expect(panned.translateX).toBe(-50);
      expect(panned.translateY).toBe(30);
    });

    it('should reset transform to scale 1.0 and origin 0,0', () => {
      const reset = TransformLightboxUseCase.reset();
      expect(reset.scale).toBe(1.0);
      expect(reset.translateX).toBe(0);
      expect(reset.translateY).toBe(0);
    });
  });
});
