import transformCoreXml from './transforms/core-xml';
import transformWorkbookXml from './transforms/workbook-xml';

import { UnzipFile } from '../utils/zip';

const VBA_BIN = /vba.*\.bin/i;
const transforms = [transformCoreXml, transformWorkbookXml];

export function filterTarget(file: UnzipFile): boolean {
  return !VBA_BIN.test(file.path);
}

export function mapTarget(file: UnzipFile): UnzipFile {
  const transform = transforms.find(transform => transform.match(file));
  if (transform) {
    file.data = transform.apply(file.data);
  }

  return file;
}
