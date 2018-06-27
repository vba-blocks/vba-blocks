export default function truncate(value: string, len: number): string {
  if (value.length < len) return value;

  let chars = 0;
  let index = 0;
  while (chars < len && index < value.length) {
    const code = value.charCodeAt(index);
    if (code >= 32 && code <= 126) chars++;

    index++;
  }

  return `${value.slice(0, index)}...`;
}
