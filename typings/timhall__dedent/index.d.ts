declare module '@timhall/dedent' {
  export default function dedent(
    strings: string | string[] | TemplateStringsArray,
    ...values: string[]
  ): string;
}

declare module '@timhall/dedent/macro' {
  export default function dedent(
    strings: string | string[] | TemplateStringsArray,
    ...values: string[]
  ): string;
}
