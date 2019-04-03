import { UnzipFile } from '../../utils/zip';

const WORKBOOK_XML = /xl[\/,\\]workbook\.xml/i;

export default {
  match: (file: UnzipFile) => WORKBOOK_XML.test(file.path),
  apply: (data: Buffer) => {
    // TODO
    return data;
  }
};
