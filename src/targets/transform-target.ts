import transformCoreXml from './transforms/core-xml';
import transformWorkbookXml from './transforms/workbook-xml';
import { pipeFilter, pipeMap } from '../utils/pipe';

import { UnzipFile } from '../utils/zip';

const VBA_BIN = /vba.*\.bin/i;
function filterVbaBin(file: UnzipFile): boolean {
  return !VBA_BIN.test(file.path);
}

export const filterTarget = pipeFilter(filterVbaBin);
export const mapTarget = pipeMap(transformCoreXml, transformWorkbookXml);
