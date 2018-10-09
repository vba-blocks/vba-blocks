declare module 'prompts' {
  export interface Question {
    name: string;
    type: string;
    [key: string]: any;
  }
  export interface Options {
    onSubmit?: () => void;
    onCancel?: () => void;
  }
  export interface Answers {
    [name: string]: any;
  }

  export default function prompts(
    questions: Question | Question[],
    options?: Options
  ): Promise<Answers>;
}
