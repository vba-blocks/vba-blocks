import { xml2js, js2xml, Element } from 'xml-js';

export type Xml = any;

export function parseXml(xml: string | Buffer): Element {
  if (Buffer.isBuffer(xml)) {
    xml = xml.toString('utf8');
  }

  return xml2js(xml, { compact: false }) as Element;
}

export interface ConvertOptions {
  // https://github.com/nashwaan/xml-js#options-for-converting-js-object--json--xml
  compact?: boolean;
}

export function convertXml(value: Xml, options?: ConvertOptions): string {
  return js2xml(value, options);
}

export function findElement(
  elements: Element[] | undefined,
  callback: (element: Element, index: number, elements: Element[]) => boolean
): Element | undefined {
  return elements && elements.find(callback);
}

export function findElementByName(elements: Element[] | undefined, name: string) {
  return findElement(elements, element => element.name === name);
}
