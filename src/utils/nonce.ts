const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export default function nonce(len: number = 32): string {
  let text = '';

  for (var i = 0; i < len; i++) {
    const index = Math.floor(Math.random() * characters.length);
    text += characters.charAt(index);
  }
  return text;
}
