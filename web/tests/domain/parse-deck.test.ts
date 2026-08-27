import { describe, it, expect } from 'vitest';
import { parseDeck, parseDirectives, transformGithubAlerts, isolateDiagrams } from '../../src/domain/use-cases/parse-deck';
import mermaid from 'mermaid';
import * as fs from 'fs';
import * as path from 'path';

describe('Domain Use-Case: parseDeck', () => {
  it('should parse an empty deck gracefully', () => {
    const deck = parseDeck('');
    expect(deck.totalSlides).toBe(1);
    expect(deck.slides).toHaveLength(1);
    expect(deck.title).toBe('Untitled Presentation');
  });

  it('should parse Marp comment directives', () => {
    const sample = '<!-- _class: lead invert -->\n<!-- paginate: true -->\n# Hello World';
    const { directives, cleanText } = parseDirectives(sample);
    expect(directives.class).toBe('lead invert');
    expect(directives.paginate).toBe(true);
    expect(cleanText).toContain('# Hello World');
  });

  it('should transform GitHub Alerts into alert callouts', () => {
    const sample = '> [!NOTE]\n> This is a note alert\n> Second line';
    const result = transformGithubAlerts(sample);
    expect(result).toContain('<div class="alert-callout note">');
    expect(result).toContain('This is a note alert');
  });

  it('should isolate Mermaid and PlantUML diagrams from marked escaping', () => {
    const sample = '```mermaid\nflowchart LR\n  A[Start <br/> Node] --> B[End]\n```\n\n```plantuml\nAlice -> Bob: Hello\n```';
    const { processedMarkdown, hasMermaid, hasPlantUML } = isolateDiagrams(sample, 1);
    expect(hasMermaid).toBe(true);
    expect(hasPlantUML).toBe(true);
    expect(processedMarkdown).toContain('<div class="mermaid-canvas"><script type="text/mermaid" class="mermaid-src" data-code=');
    expect(processedMarkdown).toContain('<div class="plantuml-canvas"><script type="text/plantuml" class="plantuml-src" data-code=');
  });

  it('should parse a multi-slide Markdown deck segmented by ---', () => {
    const md = `---
marp: true
theme: default
---
<!-- _class: lead -->
# Slide 1 Title
Welcome

---
# Slide 2 Title
- Item 1
- Item 2
`;
    const deck = parseDeck(md);
    expect(deck.totalSlides).toBe(2);
    expect(deck.slides[0].title).toBe('Slide 1 Title');
    expect(deck.slides[0].directives.class).toBe('lead');
    expect(deck.slides[1].title).toBe('Slide 2 Title');
    expect(deck.globalDirectives.marp).toBe(true);
  });

  it('should parse official showcase template template.md into exactly 10 slides with both Mermaid and PlantUML diagrams', () => {
    const templatePath = path.resolve(__dirname, '../../public/template.md');
    if (fs.existsSync(templatePath)) {
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const deck = parseDeck(templateSource);
      expect(deck.totalSlides).toBe(10);
      expect(deck.slides).toHaveLength(10);

      // Slide 1 title
      expect(deck.slides[0].title).toContain('Montre');

      // Slide 2 has 3-Layer flowchart
      expect(deck.slides[1].hasMermaid).toBe(true);

      // Slide 3 has Mindmap
      expect(deck.slides[2].hasMermaid).toBe(true);

      // Slide 4 has PlantUML sequence diagram
      expect(deck.slides[3].hasPlantUML).toBe(true);
      expect(deck.slides[3].htmlContent).toContain('class="plantuml-canvas"');

      // Slide 5 has comparison table
      expect(deck.slides[4].htmlContent).toContain('<table>');

      // Slide 6 has Zoom flowchart
      expect(deck.slides[5].hasMermaid).toBe(true);

      // Slide 7 has Lightbox flowchart
      expect(deck.slides[6].hasMermaid).toBe(true);

      // Slide 8 has Multi-Source table
      expect(deck.slides[7].htmlContent).toContain('<table>');

      // Slide 9 has Keyboard shortcuts table
      expect(deck.slides[8].htmlContent).toContain('<table>');
    }
  });

  it('should validate all mermaid blocks in template.md against mermaid.parse', async () => {
    const { Window } = await import('happy-dom');
    const win = new Window();
    (globalThis as any).window = win;
    (globalThis as any).document = win.document;
    const rawDOMPurify = await import('dompurify');
    const purifyFactory = (rawDOMPurify as any).default || rawDOMPurify;
    const purifyInstance = purifyFactory(win);
    Object.assign(purifyFactory, purifyInstance);
    (globalThis as any).DOMPurify = purifyInstance;

    const templatePath = path.resolve(__dirname, '../../public/template.md');
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/gi;
    let match: RegExpExecArray | null;
    let count = 0;
    while ((match = mermaidRegex.exec(templateSource)) !== null) {
      count++;
      const code = match[1].trim();
      const isValid = await mermaid.parse(code);
      expect(isValid).toBeTruthy();
    }
    expect(count).toBeGreaterThanOrEqual(4);
  });

});
