import { parseXml, convertXml, findElementByName } from "../../utils/xml";
import without from "../../utils/without";
import { env } from "../../env";

import { UnzipFile } from "../../utils/zip";

const debug = env.debug("vba-blocks:target.transforms.workbook-xml");
const WORKBOOK_XML = /xl[\/,\\]workbook\.xml/i;

export default function transformWorkbookXml(file: UnzipFile): UnzipFile {
	if (!WORKBOOK_XML.test(file.path)) return file;

	const xml = parseXml(file.data.toString("utf8"));

	// 1. workbook > mc:AlternateContent > mc:Choice > x15ac:absPath -> Replace 'url' with empty string
	// 2. workbook > bookViews > workbookView -> Remove (maybe bookViews too)
	// 3. workbook > fileVersion -> Remove
	// 4. workbook > calcPr -> Set calcId="0"
	const workbook = findElementByName(xml.elements, "workbook");
	if (workbook) {
		const alternate_content = findElementByName(workbook.elements, "mc:AlternateContent");
		const choice = findElementByName(alternate_content && alternate_content.elements, "mc:Choice");
		const abs_path = findElementByName(choice && choice.elements, "x15ac:absPath");

		if (abs_path) {
			abs_path.attributes!.url = "";
		}

		const book_views = findElementByName(workbook.elements, "bookViews");
		if (book_views) {
			workbook.elements = without(workbook.elements!, book_views);
		}

		const file_version = findElementByName(workbook.elements, "fileVersion");
		if (file_version) {
			workbook.elements = without(workbook.elements!, file_version);
		}

		const calc_pr = findElementByName(workbook.elements, "calcPr");
		if (calc_pr) {
			calc_pr.attributes!.calcId = "0";
		}
	} else {
		debug("Warning: workbook not found, unable to transform workbook.xml");
	}

	file.data = Buffer.from(convertXml(xml));
	return file;
}
