type VisualizerSwapCommand = {
	kind: "swap";
	firstIndex: number;
	secondIndex: number;
};
type VisualizerCursorCommand = {
	kind: "setCursors";
	cursors: number[];
};
type VisualizerSortedCommand = {
	kind: "sorted";
	indexes: number[];
};
type VisualizerNotSortedCommand = {
	kind: "notSorted";
	indexes: number[];
};
type VisualizerSetCommand = {
	kind: "set";
	values: [number, number][];
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type VisualizerCommand =
	| VisualizerSwapCommand
	| VisualizerCursorCommand
	| VisualizerSortedCommand
	| VisualizerNotSortedCommand
	| VisualizerSetCommand;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function swap(firstIndex: number, secondIndex: number): VisualizerSwapCommand {
	return { kind: "swap", firstIndex, secondIndex };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function cursors(cursors: number[]): VisualizerCursorCommand {
	return { kind: "setCursors", cursors: cursors };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function sorted(indexes: number[]): VisualizerSortedCommand {
	return { kind: "sorted", indexes };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function notSorted(indexes: number[]): VisualizerNotSortedCommand {
	return { kind: "notSorted", indexes };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setItems(
	values: [number, number][]
): VisualizerSetCommand {
	return { kind: "set", values };
}