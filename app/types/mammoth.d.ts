declare module 'mammoth/mammoth.browser' {
  export interface ConvertOptions {
    arrayBuffer?: ArrayBuffer;
    path?: string;
    buffer?: Buffer;
  }

  export interface ConvertResult {
    value: string;
    messages: any[];
  }

  export function convertToMarkdown(options: ConvertOptions): Promise<ConvertResult>;
} 