export default function without<T>(array: T[], ...values: T[]): T[] {
	array = array.slice();
	for (const value of values) {
		const index = array.indexOf(value);
		array.splice(index, 1);
	}
	return array;
}
