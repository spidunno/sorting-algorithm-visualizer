import Editor, { Monaco } from "@monaco-editor/react";
import { useCallback, useState } from "react";
import { Pane, ResizablePanes } from "resizable-panes-react";
import { useInterval } from "usehooks-ts";
import defaultScript from "./defaultScript?raw";
import editorExtraTypes from "./types?raw";

import "./business/audio";
import "./App.css";

import { visualizeJackieSort } from "./business/commands";
import { transformTypescript } from "./ts";
import { useOscillator } from "./business/audio";

function setUpMonaco(monaco: Monaco): void {
	monaco.languages.typescript.typescriptDefaults.addExtraLib(editorExtraTypes);
}

let lastScript = "";
export default function App() {
	const [itemCount] = useState(50);
	const [swaps, setSwaps] = useState<boolean[]>(Array(itemCount).fill(false));
	const [sorted, setSorted] = useState<boolean[]>(Array(itemCount).fill(false));
	const [items, setItems] = useState(
		() => [...Array(itemCount).keys()].sort(() => Math.random() - 0.5)
		// [...Array(itemCount).keys()].map((v, i, a) => (a.length - 1) - i)
	);

	const [cursors, setCursors] = useState<number[]>([]);
	const [latestCursor, setLatestCursor] = useState(-1);

	const oscillator = useOscillator();

	const [commandGenerator, setCommandGenerator] = useState<Generator<
		VisualizerCommand,
		void,
		number[]
	> | null>(() => visualizeJackieSort(items));

	useInterval(() => {
		if (!commandGenerator) return;
		const command = commandGenerator.next(items);
		if (!command.done) {
			swaps.fill(false);
			switch (command.value.kind) {
				case "swap": {
					const [i, j] = [command.value.firstIndex, command.value.secondIndex];
					swaps[i] = true;
					swaps[j] = true;
					[items[i], items[j]] = [items[j], items[i]];
					break;
				}
				case "setCursors": {
					const newCursor = command.value.cursors.find(
						(c) => !cursors.includes(c)
					);
					if (newCursor) {
						setLatestCursor(newCursor);
					}
					setCursors(command.value.cursors);
					break;
				}
				case "sorted": {
					for (const index of command.value.indexes) {
						sorted[index] = true;
					}
					break;
				}
				case "notSorted": {
					for (const index of command.value.indexes) {
						sorted[index] = false;
					}
					break;
				}
			}
			setSorted(sorted.slice());
			setSwaps(swaps.slice());
			setItems(items.slice());
			if (sorted.every((s) => s)) {
				oscillator.current.gain.gain.setValueAtTime(0, 0);
			} else {
				oscillator.current.gain.gain.setValueAtTime(0.1, 0);
			}
		}
		oscillator.current.oscillator.frequency.setValueAtTime(
			30 * latestCursor,
			0
		);
	}, 10);

	const onTextChange = useCallback(async (text: string) => {
		try {
			const javascriptCode = transformTypescript(text)!;
			console.log(`"${javascriptCode}"`);
			if (lastScript === javascriptCode) return;
			else {
				setItems([...Array(itemCount).keys()].sort(() => Math.random() - 0.5));
				setSorted([]);
				setSwaps([]);
			}
			if (javascriptCode) lastScript = javascriptCode;
			const newGenerator = (
				await import(
					/* @vite-ignore */ URL.createObjectURL(
						new Blob(
							[
								`${editorExtraTypes}
								${javascriptCode}`,
							],
							{ type: "text/javascript" }
						)
					)
				)
			).default;
			// console.log(newGenerator)
			console.log(newGenerator);
			if (typeof newGenerator === "function") {
				setCommandGenerator(newGenerator(items));
			} else {
				setCommandGenerator(null);
			}
		} catch (e) {
			setCommandGenerator(null);
			console.warn(e);
		}
	}, []);

	return (
		<div
			style={
				{
					// width: "100%",
					// height: "100%",
					// display: "flex",
					// flexDirection: "row",
					// gap: "12px",
				}
			}
		>
			<button onClick={() => oscillator.current.oscillator.start()}>
				Play
			</button>
			<ResizablePanes uniqueId="uniqueId" vertical resizerSize={5}>
				<Pane id="editor" size={1} minSize={0.5}>
					<Editor
						beforeMount={setUpMonaco}
						defaultLanguage="typescript"
						theme="vs-dark"
						defaultValue={defaultScript}
						height="100vh"
						width="100%"
						onChange={(text) => onTextChange(text || "")}
					/>
				</Pane>
				<Pane id="visualization" size={1}>
					<div
						style={{
							flexGrow: "1",
							height: "100%",
							width: "100%",
							// position: "relative",
							display: "flex",
							flexDirection: "row",
							alignItems: "end",
						}}
					>
						{items.map((item, index) => {
							return (
								<div
									className="list-item"
									style={{
										backgroundColor: sorted[index]
											? "lime"
											: swaps[index]
											? "red"
											: cursors.includes(index)
											? "yellow"
											: "white",
										border: "1px solid black",
										height: `${((item + 1) / itemCount) * 100}%`,
										width: "100%",
									}}
									key={index}
								></div>
							);
						})}
					</div>
				</Pane>
			</ResizablePanes>
		</div>
	);
}
