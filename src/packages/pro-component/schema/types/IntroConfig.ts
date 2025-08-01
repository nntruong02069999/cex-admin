export interface IntroConfig {
  content: string;                    // The actual content
  type: 'text' | 'html';             // Content type
  collapsible?: boolean;              // Can be expanded/collapsed
  defaultExpanded?: boolean;          // Default expansion state
  maxLines?: number;                  // Max lines before truncation (default: 3)
  showToggle?: boolean;               // Show expand/collapse toggle (default: true)
}

export type IntroType = string | IntroConfig;

// Helper function to normalize intro to IntroConfig
export const normalizeIntro = (intro: IntroType): IntroConfig | null => {
  if (!intro) return null;
  
  if (typeof intro === 'string') {
    return {
      content: intro,
      type: 'text',
      collapsible: false,
      defaultExpanded: true,
      maxLines: 3,
      showToggle: false
    };
  }
  
  return {
    maxLines: 3,
    showToggle: true,
    defaultExpanded: false,
    collapsible: true,
    ...intro
  };
};

// Helper to check if intro content is long enough for truncation
export const shouldTruncateIntro = (content: string, maxLines: number = 3): boolean => {
  const lines = content.split('\n').length;
  const averageLineLength = 80; // Characters per line
  const estimatedLines = Math.ceil(content.length / averageLineLength);
  
  return Math.max(lines, estimatedLines) > maxLines;
}; 