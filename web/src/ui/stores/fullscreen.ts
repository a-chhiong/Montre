import { atom } from 'nanostores';

export const $isFullscreen = atom<boolean>(false);

export function toggleFullscreen() {
  if (typeof document === 'undefined') return;

  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      $isFullscreen.set(true);
    }).catch(() => {
      // Ignore
    });
  } else {
    document.exitFullscreen().then(() => {
      $isFullscreen.set(false);
    }).catch(() => {
      // Ignore
    });
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('fullscreenchange', () => {
    $isFullscreen.set(!!document.fullscreenElement);
  });
}
