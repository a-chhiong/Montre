import { atom } from 'nanostores';
import { ThemeMode } from '../../domain/models/theme';
import { SwitchThemeUseCase } from '../../domain/use-cases/switch-theme';
import { slideRepository } from '../../data/slide-repository';

export const $themeMode = atom<ThemeMode>('light');

export function setThemeMode(mode: ThemeMode) {
  $themeMode.set(mode);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', mode);
  }
  slideRepository.saveSession({ theme: mode });
}

export function toggleThemeMode() {
  const nextMode = SwitchThemeUseCase.toggle($themeMode.get());
  setThemeMode(nextMode);
}
