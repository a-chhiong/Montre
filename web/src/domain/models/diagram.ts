export type DiagramType = 'mermaid' | 'plantuml';

export interface DiagramBlock {
  type: DiagramType;
  rawCode: string;
  renderId: string;
}
