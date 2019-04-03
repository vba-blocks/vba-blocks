import decompressUnzip from 'decompress-unzip';
import transformCoreXml from './transforms/core-xml';
import transformWorkbookXml from './transforms/workbook-xml';

import { UnzipFile, UnzipPlugin } from '../utils/zip';

const VBA_BIN = /vba.*\.bin/i;
const transforms = [transformCoreXml, transformWorkbookXml];

export function filter(file: UnzipFile): boolean {
  return !VBA_BIN.test(file.path);
}

export async function map(file: UnzipFile): Promise<UnzipFile> {
  const transform = transforms.find(transform => transform.match(file));
  if (transform) {
    file.data = await transform.apply(file.data);
  }

  return file;
}

export default function transformTarget(): UnzipPlugin {
  const unzip = decompressUnzip();

  return async buffer => {
    const files: UnzipFile[] = await unzip(buffer);
    const filtered_and_mapped = files.reduce(
      (memo, file) => {
        if (filter(file)) {
          memo.push(map(file));
        }

        return memo;
      },
      [] as Promise<UnzipFile>[]
    );

    return Promise.all(filtered_and_mapped);
  };
}
