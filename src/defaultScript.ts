export default function* visualizeJackieSort(
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
				for (
					let j = items.length - ((sortedCount % (items.length - i)) + 1);
					j > i;
					j--
				) {
					yield cursors([i, j]);
					if (items[j] < items[i]) {
						// yield notSorted([i, j]);
						items = yield swap(i, j);
						// yield sorted([i, j]);
						break;
					}
				}
				sortedCount += 1;
				clean = false;
			} else yield sorted([i, i + 1]);
		}
	}
}
