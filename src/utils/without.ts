export default function without<TValue>(array: TValue[], ...values: TValue[]): TValue[] {
	array = array.slice();
	for (const value of values) {
		const index = array.indexOf(value);
		array.splice(index, 1);
	}
	return array;
}
