import { atom } from 'nanostores';
import { SlideDeck } from '../../domain/models/deck';
import { parseDeck } from '../../domain/use-cases/parse-deck';

export const $activeDeck = atom<SlideDeck>(parseDeck(''));

export function setActiveDeck(deck: SlideDeck) {
  $activeDeck.set(deck);
}
