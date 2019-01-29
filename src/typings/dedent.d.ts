declare module 'dedent' {
  export default function dedent(
    strings: string | string[] | TemplateStringsArray,
    ...values: string[]
  ): string;
}

declare module 'dedent/macro' {
  export default function dedent(
    strings: string | string[] | TemplateStringsArray,
    ...values: string[]
  ): string;
}
