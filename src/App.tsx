import { useState, useEffect } from "react";
import "./App.css";
import Editor from "@monaco-editor/react";
import { Pane, ResizablePanes } from 'resizable-panes-react';

export default function App() {
	const [itemCount, setItemCount] = useState(25);
	const [items, setItems] = useState(() =>
		[...Array(itemCount).keys()].sort(() => Math.random() - 0.5)
	);

	// useEffect(() => {
	//   const commandGenerator = visualize(items);
	//   let command = commandGenerator.next();
	//   while (!command.done) {
	//     switch (command.value.kind) {
	//       case "swap": {
	//         const [i, j] = [command.value.firstIndex, command.value.secondIndex];
	//         [items[i], items[j]] = [items[j], items[i]];
	//         break;
	//       }
	//     }
	//     command = commandGenerator.next();
	//   }
	// }, items);

	return (
		<div
			style={{
				// width: "100%",
				// height: "100%",
				// display: "flex",
				// flexDirection: "row",
				// gap: "12px",
			}}
		>
			<ResizablePanes uniqueId="uniqueId" vertical resizerSize={5}>
				<Pane id="editor" size={1} minSize={0.5}>
					<Editor defaultLanguage="typescript" theme="vs-dark" defaultValue={`function* sort(items: number[]): Generator<VisualizerCommand, void, void> {
	// Your code
}`} height="100vh" width="100%" />
				</Pane>
				<Pane id="visualization" size={1}>
					<div
						style={{
							flexGrow: "1",
							// height: '100%',
							width: '100%',
							aspectRatio: '1 / 1',
							display: "flex",
							flexDirection: "row",
							alignItems: "end",
						}}
					>
						{items.map((item, index) => {
							return (
								<div
									style={{
										backgroundColor: "white",
										border: "1px solid black",
										height: `${((index + 1) / itemCount) * 100}%`,
										width: "100%",
										order: `${item}`,
									}}
									key={item}
								></div>
							);
						})}
					</div>
				</Pane>
			</ResizablePanes>
		</div>
	);
}