import { marked } from 'marked';
import { SlideDeck, SlideNode, SlideDirective } from '../models/deck';

/**
 * Parses Marp-style comment directives:
 * e.g., <!-- _class: lead invert -->, <!-- paginate: true -->, <!-- header: "Foo" -->
 */
export function parseDirectives(text: string): { directives: SlideDirective; cleanText: string } {
  const directives: SlideDirective = {};
  const commentRegex = /<!--\s*([_a-zA-Z0-9-]+)\s*:\s*(.*?)\s*-->/g;

  let cleanText = text.replace(commentRegex, (_, key: string, val: string) => {
    const cleanKey = key.startsWith('_') ? key.substring(1) : key;
    let parsedVal: unknown = val.trim();
    if (parsedVal === 'true') parsedVal = true;
    else if (parsedVal === 'false') parsedVal = false;
    else if (typeof parsedVal === 'string' && (parsedVal.startsWith('"') || parsedVal.startsWith("'"))) {
      parsedVal = parsedVal.slice(1, -1);
    }
    directives[cleanKey] = parsedVal;
    return '';
  });

  return { directives, cleanText };
}

/**
 * Parses frontmatter if present at the start of the document (--- ... ---)
 */
export function parseFrontmatter(firstChunk: string): { globalDirectives: SlideDirective; body: string } {
  const globalDirectives: SlideDirective = {};
  const trimmed = firstChunk.trim();

  if (!trimmed.startsWith('---')) {
    return { globalDirectives, body: firstChunk };
  }

  const lines = trimmed.split('\n');
  if (lines[0].trim() !== '---') {
    return { globalDirectives, body: firstChunk };
  }

  const endIndex = lines.slice(1).findIndex((line) => line.trim() === '---');
  if (endIndex === -1) {
    return { globalDirectives, body: firstChunk };
  }

  const frontmatterLines = lines.slice(1, endIndex + 1);
  const bodyLines = lines.slice(endIndex + 2);

  for (const line of frontmatterLines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let val: unknown = line.slice(colonIndex + 1).trim();
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (typeof val === 'string' && (val.startsWith('"') || val.startsWith("'"))) {
        val = val.slice(1, -1);
      }
      globalDirectives[key] = val;
    }
  }

  return { globalDirectives, body: bodyLines.join('\n') };
}

/**
 * Line-by-line parser for GitHub Alerts (> [!NOTE], > [!IMPORTANT], > [!TIP], etc.)
 */
const ALERT_ICONS: Record<string, string> = {
  note: '🎯',
  tip: '💡',
  important: '🏆',
  warning: '⚠️',
  caution: '🛑',
};

function buildAlertHtml(type: string, lines: string[]): string {
  const icon = ALERT_ICONS[type] || '📌';
  const rawText = lines.join('\n').trim();
  const parsedContent = marked.parse(rawText, { async: false }) as string;
  return `\n<div class="alert-callout ${type}"><div class="callout-icon">${icon}</div><div class="callout-text">${parsedContent}</div></div>\n`;
}

export function transformGithubAlerts(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  let inAlert = false;
  let currentAlertType = '';
  let currentAlertLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const alertHeaderMatch = line.match(/^>\s*\[!(NOTE|IMPORTANT|TIP|WARNING|CAUTION)\]\s*(.*)$/i);

    if (alertHeaderMatch) {
      if (inAlert) {
        result.push(buildAlertHtml(currentAlertType, currentAlertLines));
        currentAlertLines = [];
      }
      inAlert = true;
      currentAlertType = alertHeaderMatch[1].toLowerCase();
      if (alertHeaderMatch[2]?.trim()) {
        currentAlertLines.push(alertHeaderMatch[2].trim());
      }
      continue;
    }

    if (inAlert) {
      if (line.startsWith('>')) {
        currentAlertLines.push(line.replace(/^>\s?/, ''));
        continue;
      } else {
        result.push(buildAlertHtml(currentAlertType, currentAlertLines));
        inAlert = false;
        currentAlertType = '';
        currentAlertLines = [];
      }
    }

    result.push(line);
  }

  if (inAlert) {
    result.push(buildAlertHtml(currentAlertType, currentAlertLines));
  }

  return result.join('\n');
}

/**
 * Isolates Mermaid and PlantUML diagram code blocks from marked parsing
 * to prevent DOM entity escaping bugs (<br/> -> &lt;br/&gt;) and support on-demand rendering.
 */
export function isolateDiagrams(markdown: string, slideIndex: number): {
  processedMarkdown: string;
  hasMermaid: boolean;
  hasPlantUML: boolean;
} {
  let hasMermaid = false;
  let hasPlantUML = false;
  let counter = 0;

  // Match ```mermaid ... ``` or ```plantuml / ```puml ... ```
  const codeBlockRegex = /```(mermaid|plantuml|puml)\n([\s\S]*?)```/gi;

  const processedMarkdown = markdown.replace(codeBlockRegex, (_, lang: string, code: string) => {
    counter++;
    const type = lang.toLowerCase() === 'mermaid' ? 'mermaid' : 'plantuml';
    const trimmedCode = code.trim();
    if (type === 'mermaid') hasMermaid = true;
    if (type === 'plantuml') hasPlantUML = true;

    const canvasClass = `${type}-canvas`;
    const srcClass = `${type}-src`;
    const targetClass = `${type}-target`;
    const targetId = `montre-${type}-s${slideIndex}-${counter}`;

    const encoded = encodeURIComponent(trimmedCode);
    return `\n<div class="${canvasClass}"><script type="text/${type}" class="${srcClass}" data-code="${encoded}">${trimmedCode}</script><div class="${targetClass}" id="${targetId}"></div></div>\n`;
  });

  return { processedMarkdown, hasMermaid, hasPlantUML };
}

/**
 * Extracts first Heading 1, 2, or 3 as slide title
 */
export function extractSlideTitle(markdown: string): string | undefined {
  const match = markdown.match(/^#{1,3}\s+(.+)$/m);
  if (!match) return undefined;
  let title = match[1].replace(/<[^>]*>/g, '').trim();
  // Strip leading emojis/symbols if present so the top-nav brand logo remains unified and clean
  title = title.replace(/^[\p{Emoji}\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim();
  return title || match[1].trim();
}

/**
 * Main Pure TS Deck Parser Use Case
 */
export function parseDeck(rawMarkdown: string): SlideDeck {
  if (!rawMarkdown || !rawMarkdown.trim()) {
    return {
      title: 'Untitled Presentation',
      totalSlides: 1,
      slides: [
        {
          index: 1,
          rawMarkdown: '',
          htmlContent: '<div class="slide-empty">No content</div>',
          directives: {},
          hasMermaid: false,
          hasPlantUML: false,
        },
      ],
      globalDirectives: {},
      rawSource: rawMarkdown,
    };
  }

  // 1. Parse Frontmatter
  const { globalDirectives, body } = parseFrontmatter(rawMarkdown);

  // 2. Segment into slides by '---'
  const rawSlideChunks = body
    .split(/(?:^|\n)---\s*(?:\n|$)/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);

  const slides: SlideNode[] = [];
  let deckTitle = 'Montre Presentation';

  marked.setOptions({
    gfm: true,
    breaks: false,
  });

  rawSlideChunks.forEach((chunk, index) => {
    const slideIndex = index + 1;
    const { directives, cleanText } = parseDirectives(chunk);
    const withAlerts = transformGithubAlerts(cleanText);
    const { processedMarkdown, hasMermaid, hasPlantUML } = isolateDiagrams(withAlerts, slideIndex);

    const title = extractSlideTitle(cleanText);
    if (slideIndex === 1 && title) {
      deckTitle = title;
    }

    const htmlContent = marked.parse(processedMarkdown, { async: false }) as string;

    slides.push({
      index: slideIndex,
      rawMarkdown: chunk,
      htmlContent,
      directives,
      title,
      hasMermaid,
      hasPlantUML,
    });
  });

  return {
    title: deckTitle,
    totalSlides: Math.max(1, slides.length),
    slides,
    globalDirectives,
    rawSource: rawMarkdown,
  };
}
