import Editor, { Monaco } from "@monaco-editor/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pane, ResizablePanes } from "resizable-panes-react";
import { useInterval } from "usehooks-ts";
import defaultScript from "./defaultScript?raw";
import editorExtraTypes from "./types?raw";

import "./business/audio";
import "./App.css";

import { visualizeJackieSort } from "./business/commands";
import { transformTypescript } from "./ts";
import { useOscillator } from "./business/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";

const JS_EXTRA_FUNCTIONS = transformTypescript(editorExtraTypes);
console.log(JS_EXTRA_FUNCTIONS);

function setUpMonaco(monaco: Monaco): void {
	monaco.languages.typescript.typescriptDefaults.addExtraLib(editorExtraTypes);
}
// let lastScript = "";
export default function App() {
	const [itemCount] = useState(50);
	const interval = useRef<number | null>(null);
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

	const [commandGeneratorFunction, setCommandGeneratorFunction] = useState(() => visualizeJackieSort);

	const [sortPlaying, setSortPlaying] = useState(false);
	const [muted, setMuted] = useState(false);
	const [sortFinished, setSortFinished] = useState(false);
	// useEffect(() => {
	// 	if(commandGeneratorFunction) setCommandGenerator(commandGeneratorFunction(items));
	// }, [commandGenerator])
	useEffect(() => {

		if (sortPlaying && commandGenerator) {
			interval.current = setInterval(() => {
				// if (!commandGenerator) return;
				// if (!sortPlaying) return;

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
						setSortPlaying(false);
						setSortFinished(true);
						oscillator.current.mute();
					}
				}
				oscillator.current.oscillator.frequency.setValueAtTime(
					150 + ((latestCursor / itemCount) * 1350),
					oscillator.current.ctx.currentTime
				);
			}, 10);
		} else {
			if (typeof interval.current === 'number') clearInterval(interval.current);
		}
		return () => { if (typeof interval.current === 'number') clearInterval(interval.current) };
	}, [sortPlaying, commandGenerator, latestCursor]);
	// Run a step of the sorting algorithm every x ms
	// useInterval(() => {
	// 	if (!commandGenerator) return;
	// 	if (!sortPlaying) return;

	// 	const command = commandGenerator.next(items);
	// 	if (!command.done) {
	// 		swaps.fill(false);
	// 		switch (command.value.kind) {
	// 			case "swap": {
	// 				const [i, j] = [command.value.firstIndex, command.value.secondIndex];
	// 				swaps[i] = true;
	// 				swaps[j] = true;
	// 				[items[i], items[j]] = [items[j], items[i]];
	// 				break;
	// 			}
	// 			case "setCursors": {
	// 				const newCursor = command.value.cursors.find(
	// 					(c) => !cursors.includes(c)
	// 				);
	// 				if (newCursor) {
	// 					setLatestCursor(newCursor);
	// 				}
	// 				setCursors(command.value.cursors);
	// 				break;
	// 			}
	// 			case "sorted": {
	// 				for (const index of command.value.indexes) {
	// 					sorted[index] = true;
	// 				}
	// 				break;
	// 			}
	// 			case "notSorted": {
	// 				for (const index of command.value.indexes) {
	// 					sorted[index] = false;
	// 				}
	// 				break;
	// 			}
	// 		}
	// 		setSorted(sorted.slice());
	// 		setSwaps(swaps.slice());
	// 		setItems(items.slice());
	// 		if (sorted.every((s) => s)) {
	// 			setSortPlaying(false);
	// 			setSortFinished(true);
	// 			oscillator.current.mute();
	// 		}
	// 	}
	// 	oscillator.current.oscillator.frequency.setValueAtTime(
	// 		150 + ((latestCursor / itemCount) * 1350),
	// 		0
	// 	);
	// }, 10);

	const reset = /*useCallback(*/() => {
		setItems(
			[...Array(itemCount).keys()].sort(() => Math.random() - 0.5)
		);
		setSorted(items.map(() => false));
		setSwaps(items.map(() => false));
		setSortFinished(false);
		setCursors([]);
		setCommandGenerator(commandGeneratorFunction(items));
		setLatestCursor(0);

	}/*, [setItems, itemCount, setSorted, setSwaps, setCursors, commandGeneratorFunction, setCommandGenerator])*/;

	const onTextChange = useCallback(
		async (text: string) => {
			try {
				const javascriptCode = transformTypescript(text);
				// if (lastScript === javascriptCode) return;
				// else {
				// }
				if (javascriptCode) {
					// lastScript = javascriptCode;
					const newGenerator = (
						await import(
						/* @vite-ignore */ URL.createObjectURL(
							new Blob(
								[
									`${JS_EXTRA_FUNCTIONS}
								${javascriptCode}`,
								],
								{ type: "text/javascript" }
							)
						)
						)
					).default;

					if (typeof newGenerator === "function") {
						setCommandGeneratorFunction(newGenerator);
						reset();
					} else {
						// setCommandGenerator(null);
						reset();
					}
				}
			} catch (e) {
				setCommandGenerator(null);
				console.warn(e);
			}
		},
		[items, itemCount]
	);

	const toggleVolume = useCallback(() => {
		if (muted && sortPlaying) {
			oscillator.current.unmute();
		} else {
			oscillator.current.mute();
		}
		setMuted(!muted);
	}, [muted, setMuted, oscillator, sortPlaying]);
	const togglePlaying = useCallback(() => {
		if (sortPlaying) {
			oscillator.current.mute();
		} else if (!muted) {
			oscillator.current.unmute();
		}
		if (!sortPlaying && sortFinished) {
			reset();
		}
		setSortPlaying(!sortPlaying);
	}, [sortPlaying, setSortPlaying, muted, oscillator, sortFinished, reset]);

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
						defaultValue={defaultScript}
						height="90vh"
						width="100%"
						onChange={(text) => onTextChange(text || "")}
					/>
					<div
						style={{
							height: "10vh",
						}}
					>
						<button onClick={() => toggleVolume()}>
							<FontAwesomeIcon
								icon={muted ? Icons.faVolumeMute : Icons.faVolumeUp}
							/>
						</button>
						<button onClick={() => reset()}>
							<FontAwesomeIcon icon={Icons.faRefresh} />
						</button>
						<button onClick={() => togglePlaying()}>
							<FontAwesomeIcon
								icon={sortPlaying ? Icons.faPause : Icons.faPlay}
							/>
						</button>
					</div>
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