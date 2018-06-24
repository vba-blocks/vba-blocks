export default function commaSeparated(values: any[]): string {
  if (values.length < 3) return values.join(' and ');

  const last = values.pop();
  return `${values.join(', ')}, and ${last}`;
}
