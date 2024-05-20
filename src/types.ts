type VisualizerSwapCommand = {
	kind: "swap";
	firstIndex: number;
	secondIndex: number;
};
type VisualizerCursorCommand = {
	kind: "setCursors";
	cursors: number[];
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type VisualizerCommand = VisualizerSwapCommand | VisualizerCursorCommand;


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function swap(
	firstIndex: number,
	secondIndex: number
): VisualizerSwapCommand {
	return { kind: "swap", firstIndex, secondIndex };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function cursors(cursors: number[]): VisualizerCursorCommand {
	return { kind: "setCursors", cursors: cursors };
}