export class NavigateSlideUseCase {
  static clampIndex(targetIndex: number, totalSlides: number): number {
    if (totalSlides <= 0) return 1;
    return Math.max(1, Math.min(targetIndex, totalSlides));
  }

  static nextIndex(currentIndex: number, totalSlides: number): number {
    return this.clampIndex(currentIndex + 1, totalSlides);
  }

  static prevIndex(currentIndex: number, totalSlides: number): number {
    return this.clampIndex(currentIndex - 1, totalSlides);
  }

  static isDataRoute(hash: string): boolean {
    const clean = hash.startsWith('#') ? hash.slice(1) : hash;
    return clean.startsWith('data/');
  }

  static extractDataRoute(hash: string, totalSlides = 9999): { payload: string; slideIndex: number } | null {
    const clean = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!clean.startsWith('data/')) return null;

    const rest = clean.slice(5); // after 'data/'
    const slashIndex = rest.indexOf('/');
    if (slashIndex === -1) {
      return { payload: rest, slideIndex: 1 };
    }

    const payload = rest.slice(0, slashIndex);
    const indexPart = rest.slice(slashIndex + 1);
    const parsed = parseInt(indexPart, 10);
    const slideIndex = !isNaN(parsed) ? this.clampIndex(parsed, totalSlides) : 1;

    return { payload, slideIndex };
  }

  static parseHash(hash: string, totalSlides: number): number {
    if (this.isDataRoute(hash)) {
      const dataRoute = this.extractDataRoute(hash, totalSlides);
      return dataRoute ? dataRoute.slideIndex : 1;
    }

    const clean = hash.startsWith('#') ? hash.slice(1) : hash;
    const match = clean.match(/^(?:slide-)?(\d+)$/i) || clean.match(/(?:slide-)?(\d+)/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed)) {
        return this.clampIndex(parsed, totalSlides);
      }
    }
    return 1;
  }

  static formatHash(slideIndex: number): string {
    return `#slide-${slideIndex}`;
  }

  static formatDataHash(payload: string, slideIndex: number): string {
    return slideIndex > 1 ? `#data/${payload}/${slideIndex}` : `#data/${payload}`;
  }
}

