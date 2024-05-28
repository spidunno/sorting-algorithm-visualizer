export default function* bubbleSort(items: number[]): Generator<VisualizerCommand, void, number[]> {
	let clean = false;
	while (!clean) {
		clean = true;
		for (let i = 0; i < items.length - 1; i++) {
			items = yield cursors([i, i + 1]);
			if (items[i] > items[i + 1]) {
				items = yield swap(i, i + 1);
				clean = false;
			}
			if (clean) yield sorted([i]);
			else yield notSorted([i]);
		}
	}
	
	yield cursors([items.length - 1]);
	yield sorted([...Array(items.length).keys()]);
}