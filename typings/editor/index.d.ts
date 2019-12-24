declare module 'editor' {
  export default function editor(file: string, callback: (code: number) => void): void;
}
