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

  static parseHash(hash: string, totalSlides: number): number {
    const match = hash.match(/#?(?:slide-)?(\d+)/i);
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
}
