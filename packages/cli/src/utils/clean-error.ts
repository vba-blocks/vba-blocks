import { isString } from './';

const MESSAGE_REGEXP = /(^(.|\n)*?(?=\n\s*at\s.*\:\d*\:\d*))/;
const ERROR_TEXT = 'Error: ';

export interface Error {
  message: string;
  stack: string;
  original?: Error;
}

export default function cleanError(error: string | Error): Error {
  const content = isString(error) ? error : error.stack;

  let { message, stack } = getErrorParts(content || 'EMPTY ERROR');

  if (!isString(error) && error.original) {
    const original = isString(error.original)
      ? error.original
      : error.original.stack;
    const originalParts = getErrorParts(original);

    message += `\n\n${originalParts.message}`;
    stack = originalParts.stack;
  }

  return { message, stack };
}

function getErrorParts(content: string): Error {
  const messageMatch = content.match(MESSAGE_REGEXP);

  let message = messageMatch ? messageMatch[0] : content;
  const stack = messageMatch ? content.slice(message.length) : '';

  if (message.startsWith(ERROR_TEXT)) {
    message = message.substr(ERROR_TEXT.length);
  }

  return { message, stack };
}
