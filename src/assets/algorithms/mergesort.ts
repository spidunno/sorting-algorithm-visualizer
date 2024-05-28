export default function* mergeSort(items: number[]): Generator<VisualizerCommand, void, number[]> {
	function* merge(low: number, mid: number, high: number): Generator<VisualizerCommand, void, number[]> {
		let left = items.slice(low, mid + 1);
		let right = items.slice(mid + 1, high + 1);
		let i = 0, j = 0, k = low;

		while (i < left.length && j < right.length) {
			items = yield cursors([k, k + 1]);
			if (left[i] <= right[j]) {
				items[k] = left[i];
				yield setItems([[k, left[i]]]);
				i++;
			} else {
				items = yield setItems([[k, right[j]]]);
				j++;
			}
			k++;
			items = yield sorted([k - 1,]);
		}

		while (i < left.length) {
			items[k] = left[i];
			yield setItems([[k, left[i]]]);
			i++;
			k++;
		}

		while (j < right.length) {
			items[k] = right[j];
			yield setItems([[k, right[j]]]);
			j++;
			k++;
		}
	}

	function* sort(low: number, high: number): Generator<any, void, number[]> {
		if (low < high) {
			const mid = Math.floor((low + high) / 2);
			yield* sort(low, mid);
			yield* sort(mid + 1, high);
			yield* merge(low, mid, high);
		}
	}

	yield* sort(0, items.length - 1);
	yield sorted([...Array(items.length).keys()]);
}