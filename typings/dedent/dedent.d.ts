declare module 'dedent' {
  export default function dedent(
    strings: string | string[] | TemplateStringsArray,
    ...values: string[]
  ): string;
}
