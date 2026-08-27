import { ThemeMode, ThemeConfig } from '../models/theme';

export class SwitchThemeUseCase {
  static toggle(current: ThemeMode): ThemeMode {
    return current === 'light' ? 'dark' : 'light';
  }

  static getConfig(mode: ThemeMode): ThemeConfig {
    return {
      mode,
      isDark: mode === 'dark',
    };
  }

  static getMermaidThemeVariables(isDark: boolean) {
    if (isDark) {
      return {
        darkMode: true,
        background: '#131e33',
        primaryColor: '#1a2942',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#38bdf8',
        lineColor: '#38bdf8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
        fontSize: '15px',
      };
    }
    return {
      darkMode: false,
      background: '#ffffff',
      primaryColor: '#f1f5f9',
      primaryTextColor: '#0f172a',
      primaryBorderColor: '#0284c7',
      lineColor: '#0284c7',
      secondaryColor: '#e2e8f0',
      tertiaryColor: '#f8fafc',
      fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
      fontSize: '15px',
    };
  }
}
