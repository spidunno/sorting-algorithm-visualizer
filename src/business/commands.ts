export type VisualizerSwapCommand = {
	kind: "swap";
	firstIndex: number;
	secondIndex: number;
};
export type VisualizerCursorCommand = {
	kind: "setCursors";
	cursors: number[];
};
export type VisualizerSortedCommand = {
	kind: "sorted";
	indexes: number[];
};
export type VisualizerNotSortedCommand = {
	kind: "notSorted";
	indexes: number[];
};
export type VisualizerCommand =
	| VisualizerSwapCommand
	| VisualizerCursorCommand
	| VisualizerSortedCommand
	| VisualizerNotSortedCommand;

export function swap(
	firstIndex: number,
	secondIndex: number
): VisualizerSwapCommand {
	return { kind: "swap", firstIndex, secondIndex };
}
export function notSorted(indexes: number[]): VisualizerNotSortedCommand {
	return { kind: "notSorted", indexes };
}
export function cursors(cursors: number[]): VisualizerCursorCommand {
	return { kind: "setCursors", cursors: cursors };
}

export function sorted(indexes: number[]): VisualizerSortedCommand {
	return { kind: "sorted", indexes };
}

export function* visualizeBubbleSort(
	items: number[]
): Generator<VisualizerCommand, void, number[]> {
	let clean = false;
	while (!clean) {
		clean = true;
		for (let i = 0; i < items.length - 1; i++) {
			items = yield cursors([i, i + 1]);
			if (items[i] > items[i + 1]) {
				items = yield swap(i, i + 1);
				clean = false;
			}
		}
	}
}

export function* visualizeJackieSortOld(
	items: number[]
): Generator<VisualizerCommand, void, number[]> {
	let clean = false;

	while (!clean) {
		clean = true;
		for (let i = 0; i < items.length - 1; i++) {
			yield cursors([i, i + 1]);
			if (items[i] > items[i + 1]) {
				for (let j = items.length - 1; j > i; j--) {
					yield cursors([i, j]);
					if (items[j] < items[i]) {
						items = yield swap(i, j);
						break;
					} else {
						yield sorted([i, j]);
					}
					// items = yield swap(i, j);
				}
				clean = false;
			} else {
				yield sorted([i, i + 1]);
			}
		}
	}
}
export function* visualizeJackieSort(
	items: number[]
): Generator<VisualizerCommand, void, number[]> {
	let clean = false;

	let sortedCount = 0;

	while (!clean) {
		clean = true;
		yield notSorted([...Array(items.length).keys()]);
		for (let i = 0; i < items.length - 1; i++) {
			yield cursors([i, i + 1]);
			if (items[i] > items[i + 1]) {
				yield notSorted([i, i + 1]);
				for (
					let j = items.length - ((sortedCount % (items.length - i)) + 1);
					j > i;
					j--
				) {
					yield cursors([i, j]);
					if (items[j] < items[i]) {
						yield notSorted([i, j]);
						items = yield swap(i, j);
						// yield sorted([i, j]);
						break;
					}
					// else yield sorted([i, j]);
					// items = yield swap(i, j);
				}
				sortedCount += 1;
				clean = false;
			} else yield sorted([i, i + 1]);
		}
	}
}


export function* quickSort(items: number[]): Generator<VisualizerCommand, void, number[]> {
	function* quicksort(arr: number[], low: number, high: number): Generator<VisualizerCommand, void, number[]> {
		arr = yield cursors([low, high]);
		if (low < high) {
			const [pivotIndex, updatedArr] = yield* partition(arr, low, high);
			arr = updatedArr; // update the array after partition
			yield* quicksort(arr, low, pivotIndex - 1);
			yield* quicksort(arr, pivotIndex + 1, high);
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
	yield* quicksort(items, 0, items.length - 1);
	yield sorted([...Array(items.length).keys()]);
}