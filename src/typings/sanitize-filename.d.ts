declare module 'sanitize-filename' {
  export interface SanitizeOptions {
    replacement: string;
  }
  export default function sanitizeFilename(inputString: string, options?: SanitizeOptions): string;
}
