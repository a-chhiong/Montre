export interface SlideDirective {
  class?: string;
  theme?: string;
  paginate?: boolean;
  header?: string;
  footer?: string;
  [key: string]: unknown;
}

export interface SlideNode {
  index: number;
  rawMarkdown: string;
  htmlContent: string;
  directives: SlideDirective;
  title?: string;
  hasMermaid: boolean;
  hasPlantUML: boolean;
}

export interface SlideDeck {
  title: string;
  totalSlides: number;
  slides: SlideNode[];
  globalDirectives: SlideDirective;
  rawSource: string;
}
