import { UnzipFile } from '../../utils/zip';

const CORE_XML = /docProps[\/,\\]core\.xml/i;

export default {
  match: (file: UnzipFile) => CORE_XML.test(file.path),
  apply: (data: Buffer) => {
    // TODO
    return data;
  }
};
