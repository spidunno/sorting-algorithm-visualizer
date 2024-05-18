export type VisualizerSwapCommand = {
  kind: "swap";
  firstIndex: number;
  secondIndex: number;
};
export type VisualizerCommand = VisualizerSwapCommand;

export function swap(firstIndex: number, secondIndex: number): VisualizerSwapCommand {
  return { kind: "swap", firstIndex, secondIndex };
}

function* visualize(items: number[]): Generator<VisualizerCommand, void, void> {
  let clean = false;
  while (!clean) {
    clean = true;
    for (let i = 0; i < items.length - 1; i++) {
      if (items[i] > items[i + 1]) {
        yield swap(i, i + 1);
        clean = false;
      }
    }
  }
}
