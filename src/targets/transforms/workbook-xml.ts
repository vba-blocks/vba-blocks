import { parseXml, convertXml } from '../../utils/xml';
import { UnzipFile } from '../../utils/zip';

const WORKBOOK_XML = /xl[\/,\\]workbook\.xml/i;

export default function transformWorkbookXml(file: UnzipFile): UnzipFile {
  if (!WORKBOOK_XML.test(file.path)) return file;

  const xml = parseXml(file.data.toString('utf8'));
  // TODO

  file.data = Buffer.from(convertXml(xml));
  return file;
}
