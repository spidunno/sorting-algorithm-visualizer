import Editor, { Monaco } from "@monaco-editor/react";
import { useCallback, useMemo, useState } from "react";
import { Pane, ResizablePanes } from "resizable-panes-react";
import { useInterval } from "usehooks-ts";
import editorExtraTypes from './types?raw';

import "./App.css";


import {
	visualizeJackieSort,
	visualizeJackieSortOld,
} from "./business/commands";
import { transformTypescript } from "./ts";

function setUpMonaco(monaco: Monaco): void {
	monaco.languages.typescript.typescriptDefaults
		.addExtraLib(editorExtraTypes);
}

export default function App() {
	const [itemCount, setItemCount] = useState(50);
	const [items, setItems] = useState(() =>
		[...Array(itemCount).keys()].sort(() => Math.random() - 0.5)
	);

	const [cursors, setCursors] = useState<number[]>([]);

	const [commandGenerator, setCommandGenerator] = useState(() =>
		visualizeJackieSort(items)
	);

	useInterval(() => {
		const command = commandGenerator.next(items);
		if (!command.done) {
			switch (command.value.kind) {
				case "swap": {
					const [i, j] = [
						command.value.firstIndex,
						command.value.secondIndex,
					];
					[items[i], items[j]] = [items[j], items[i]];
					break;
				}
				case "setCursors": {
					setCursors(command.value.cursors);
					break;
				}
			}
			setItems(items.slice());
		}
	}, 40);

	const onTextChange = useCallback((text: string) => {
		// const javascriptCode = transformTypescript(text)!;
		// const newGenerator = eval?.(javascriptCode);
		// console.log(newGenerator);
		// if (newGenerator) {
		// 	setCommandGenerator(newGenerator(items));
		// }
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
			<ResizablePanes uniqueId="uniqueId" vertical resizerSize={5}>
				<Pane id="editor" size={1} minSize={0.5}>
					<Editor
						beforeMount={setUpMonaco}
						defaultLanguage="typescript"
						theme="vs-dark"
						defaultValue={`function* sort(items: number[]): Generator<VisualizerCommand, void, void> {
	// Your code
}`}
						height="100vh"
						width="100%"
						onChange={(text) => onTextChange(text)}
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
										backgroundColor: cursors.includes(index)
											? "green"
											: "white",
										border: "1px solid black",
										height: `${
											((item + 1) / itemCount) * 100
										}%`,
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
