export default function* quicksort(items: number[]): Generator<VisualizerCommand, void, number[]> {
	yield* _quicksort(items, 0, items.length - 1);

	// Final sweep, three at a time so it's faster
	for (let i = 0; i < items.length; i += 3) {
		yield cursors([i, i + 1, i + 2]);
		yield sorted([i, i + 1, i + 2]);
	}
}

function* _quicksort(arr: number[], low: number, high: number): Generator<VisualizerCommand, void, number[]> {
	arr = yield cursors([low, high]);
	if (low < high) {
		const [pivotIndex, updatedArr] = yield* partition(arr, low, high);
		arr = updatedArr; // update the array after partition
		yield* _quicksort(arr, low, pivotIndex - 1);
		yield* _quicksort(arr, pivotIndex + 1, high);
	}
}

function* partition(arr: number[], low: number, high: number): Generator<VisualizerCommand, [number, number[]], number[]> {
	let pivot = arr[high];
	let i = low - 1;

	for (let j = low; j < high; j++) {
		yield cursors([i, j, high]);
		if (arr[j] < pivot) {
			i++;
			arr = yield swap(i, j);
		}
	}
	arr = yield swap(i + 1, high);
	yield sorted([i + 1]);
	return [i + 1, arr];
}