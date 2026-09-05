import { atom } from 'nanostores';

export const $isShareModalOpen = atom<boolean>(false);

export function openShareModal() {
  $isShareModalOpen.set(true);
}

export function closeShareModal() {
  $isShareModalOpen.set(false);
}

export function toggleShareModal() {
  $isShareModalOpen.set(!$isShareModalOpen.get());
}
