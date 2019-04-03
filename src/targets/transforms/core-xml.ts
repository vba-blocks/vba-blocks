import { parseXml, convertXml, findElementByName } from '../../utils/xml';
import { UnzipFile } from '../../utils/zip';
import env from '../../env';

const debug = env.debug('vba-blocks:target.transforms.core-xml');
const CORE_XML = /docProps[\/,\\]core\.xml/i;

export default {
  match: (file: UnzipFile) => CORE_XML.test(file.path),
  apply: (data: Buffer) => {
    const xml = parseXml(data.toString('utf8'));

    // 1. cp:coreProperties > cp:lastModifiedBy -> Replace with dc:creator
    // 2. cp:coreProperties > dcterms:modified -> Replace with dcterms:created
    const core_properties = findElementByName(xml.elements, 'cp:coreProperties');
    if (core_properties) {
      // 1.
      const last_modified_by = findElementByName(core_properties.elements, 'cp:lastModifiedBy');
      const creator = findElementByName(core_properties.elements, 'dc:creator');
      if (last_modified_by && creator) {
        last_modified_by.elements![0].text = creator.elements![0].text;
      }

      // 2.
      const modified = findElementByName(core_properties.elements, 'dcterms:modified');
      const created = findElementByName(core_properties.elements, 'dcterms:created');
      if (modified && created) {
        modified.elements![0].text = created.elements![0].text;
      }
    } else {
      debug('Warning: cp:coreProperties not found, unable to transform core.xml');
    }

    return Buffer.from(convertXml(xml));
  }
};
