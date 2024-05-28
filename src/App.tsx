import { MonacoEditor } from "solid-monaco";
import type { Monaco } from '@monaco-editor/loader';
// import { useCallback, useEffect, useRef, useState } from "solid-js";
import { PanelGroup, Panel, PanelResizeHandle } from "solid-resizable-panels-port";
// import { useInterval } from "usehooks-ts";
// import defaultScriptText from "./defaultScript?raw";
import editorExtraTypes from "./types?raw";

import "./business/audio";
import "./App.css";

import { quickSort } from "./business/commands";
import { transformTypescript } from "./ts";
import { createOscillator } from "./business/audio";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import * as Icons from "@fortawesome/free-solid-svg-icons";
import { Pause, Play, RefreshCw, Volume2, VolumeX } from "lucide-solid";
import { createEffect, createSignal, Index } from "solid-js";

import quicksortScript from './assets/algorithms/quicksort?raw';
import bubblesortScript from './assets/algorithms/bubblesort?raw';
import mergesortScript from './assets/algorithms/mergesort?raw';

const JS_EXTRA_FUNCTIONS = transformTypescript(editorExtraTypes);
// console.log(JS_EXTRA_FUNCTIONS);

function setUpMonaco(monaco: Monaco): void {
	monaco.editor.setTheme('vs-dark');
	monaco.languages.typescript.typescriptDefaults.addExtraLib(editorExtraTypes);
}
export default function App() {
	const [itemCount, setItemCount] = createSignal(50);
	let interval: ReturnType<typeof setInterval> | null = null;
	const [swaps, setSwaps] = createSignal<boolean[]>(Array(itemCount()).fill(false));
	const [sorted, setSorted] = createSignal<boolean[]>(Array(itemCount()).fill(false));
	const [items, setItems] = createSignal([...Array(itemCount()).keys()].sort(() => Math.random() - 0.5));
	const [ justSet, setJustSet ] = createSignal(Array(itemCount()).fill(false));

	const [cursors, setCursors] = createSignal<number[]>([]);
	const [defaultScript, setDefaultScript] = createSignal(quicksortScript);
	const [latestCursor, setLatestCursor] = createSignal(-1);

	const oscillator = createOscillator();

	const [commandGenerator, setCommandGenerator] = createSignal<Generator<
		VisualizerCommand,
		void,
		number[]
	> | null>(quickSort(items()));

	const [commandGeneratorFunction, setCommandGeneratorFunction] = createSignal(quickSort);

	const [sortPlaying, setSortPlaying] = createSignal(false);
	const [muted, setMuted] = createSignal(false);
	const [sortFinished, setSortFinished] = createSignal(false);
	const [delay, setDelay] = createSignal(10);
	// useEffect(() => {
	// 	if(commandGeneratorFunction) setCommandGenerator(commandGeneratorFunction(items));
	// }, [commandGenerator])
	// createEffect(() => {
	// 	setItems([...Array(itemCount()).keys()].sort(() => Math.random() - 0.5));
	// }, [itemCount()]);
	createEffect(() => {
		if (interval) clearInterval(interval);
		const gen = commandGenerator();
		if (sortPlaying() && gen) {
			interval = setInterval(() => {
				// if (!commandGenerator) return;
				// if (!sortPlaying) return;

				const command = gen.next(items());
				if (!command.done) {
					swaps().fill(false);
					justSet().fill(false);
					switch (command.value.kind) {
						case "swap": {
							const [i, j] = [command.value.firstIndex, command.value.secondIndex];
							swaps()[i] = true;
							swaps()[j] = true;
							[items()[i], items()[j]] = [items()[j], items()[i]];
							break;
						}
						case "setCursors": {
							const newCursor = command.value.cursors.find(
								(c) => !cursors().includes(c)
							);
							if (newCursor) {
								setLatestCursor(newCursor);
							}
							setCursors(command.value.cursors);
							break;
						}
						case "sorted": {
							for (const index of command.value.indexes) {
								sorted()[index] = true;
							}
							break;
						}
						case "notSorted": {
							for (const index of command.value.indexes) {
								sorted()[index] = false;
							}
							break;
						}
						case "set": {
							for (const [index, value] of command.value.values) {
								items()[index] = value;
								justSet()[index] = true;
							}
						}
					}
					setSorted(sorted().slice());
					setSwaps(swaps().slice());
					setItems(items().slice());
					setJustSet(justSet().slice());
					if (sorted().every((s) => s)) {
						setSortPlaying(false);
						setSortFinished(true);
						oscillator.mute();
					}
				}
				oscillator.oscillator.frequency.setValueAtTime(
					150 + ((latestCursor() / itemCount()) * 1350),
					oscillator.ctx.currentTime
				);
			}, delay());
		} else {
			if (interval) clearInterval(interval);
		}
	});

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
			[...Array(itemCount()).keys()].sort(() => Math.random() - 0.5)
		);
		setSorted(items().map(() => false));
		setSwaps(items().map(() => false));
		setSortFinished(false);
		setCursors([]);
		setCommandGenerator(commandGeneratorFunction()(items()));
		setLatestCursor(0);

	}/*, [setItems, itemCount, setSorted, setSwaps, setCursors, commandGeneratorFunction, setCommandGenerator])*/;

	const onTextChange = async (text: string) => {
		setDefaultScript(text);
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
					setCommandGeneratorFunction(() => newGenerator);
					reset();
				} else {
					// setCommandGenerator(null);
					reset();
				}
			}
		} catch (e) {
			setCommandGenerator(null);
			// console.warn(e);
		}
	};

	const toggleVolume = () => {
		if (muted() && sortPlaying()) {
			oscillator.unmute();
		} else {
			oscillator.mute();
		}
		setMuted(!muted());
	};
	const togglePlaying = () => {
		if (sortPlaying()) {
			oscillator.mute();
		} else if (!muted()) {
			oscillator.unmute();
		}
		if (!sortPlaying() && sortFinished()) {
			reset();
		}
		setSortPlaying(!sortPlaying());
	};

	return (
		<PanelGroup direction="horizontal">
			<Panel id="editor" defaultSize={1} minSize={0.5}>
				<MonacoEditor
					onMount={setUpMonaco}
					language="typescript"
					value={defaultScript()}
					height="90vh"
					width="100%"
					onChange={(text) => onTextChange(text || "")}
				/>
				<div
					style={{
						height: "5vh",
						display: 'flex',
						"justify-content": 'center',
						"align-content": 'center',
						position: 'relative'
					}} id="controls"
				>
				<select onChange={(e) => {
					switch (e.target.value) {
						case 'quicksort': {
							onTextChange(quicksortScript);
							break;
						}
						case 'bubblesort': {
							onTextChange(bubblesortScript);
							break;
						}
						case 'mergesort': {
							onTextChange(mergesortScript);
							break;
						}
					}
				}} style={{ position: 'absolute', left: '0', "min-width": '100px', "height": '32px' }}>
					<option value="quicksort">Quicksort</option>
					<option value="bubblesort">Bubble Sort</option>
					<option value="mergesort">Merge Sort</option>
				</select>
					<button onClick={() => toggleVolume()}>
						{/* <FontAwesomeIcon */}
						{/* // icon={muted ? Icons.faVolumeMute : Icons.faVolumeUp} */}
						{/* // /> */}
						{muted() ? <VolumeX /> : <Volume2 />}
					</button>
					<button onClick={() => reset()}>
						<RefreshCw />
					</button>
					<button onClick={() => togglePlaying()}>
						{/* <FontAwesomeIcon */}
						{/* icon={sortPlaying ? Icons.faPause : Icons.faPlay} */}
						{/* /> */}
						{sortPlaying() ? <Pause /> : <Play />}
					</button>
					<input type="number" value={50} onChange={(e) => { setItemCount(parseInt(e.target.value)); reset() }} />
				</div>
				<div
					style={{
						height: "5vh",
						display: 'flex',
						"justify-content": 'center',
						"align-content": 'center'
					}} id="controls"
				>
					{/* <label for="delay" style={{"text-align": 'center', "align-content": 'center', height: '32px', "margin": '4px', width: '6ch'}}>{delay()}ms</label> */}
					<span>Delay of <input id="delay" onInput={(e) => setDelay(parseFloat(e.target.value) || 10)} value={delay()} step="1" type="number" min="1" max="1000" />ms</span>
				</div>
			</Panel>
			<PanelResizeHandle style={{ width: "2px", "background-color": "#b9b7df", margin: '2px', "border-radius": '12px', border: '1px solid #80809b', cursor: "ew-resize" }} />
			<Panel id="visualization" defaultSize={1}>
				<div
					style={{
						'flex-grow': "1",
						height: "100%",
						width: "100%",
						// position: "relative",
						display: "flex",
						"flex-direction": "row",
						'align-items': "end",
					}}
				>
					<svg width="100%" height="100vh" style={{position: 'relative'}}>
						<Index each={items()}>{(item, index) => {
							return (
								<g style={{translate: `${index * ((1 / itemCount()) * 100)}% 100%`, scale: '1 -1', transition: 'translate 0.1s ease'}}>
									<rect
										class="list-item"
										fill={sorted()[index] ? "lime" : (swaps()[index] || justSet()[index]) ? 'red' : cursors().includes(index) ? 'yellow' : 'white'}
										stroke="black"
										stroke-width={`${(1 / itemCount()) * 8}%`}
										height={`${((item() + 1) / itemCount()) * 100}%`}
										width={`${100/itemCount()}%`}
									/>
								</g>
							);
						}}</Index>
					</svg>
				</div>
			</Panel>
		</PanelGroup>
	);
}