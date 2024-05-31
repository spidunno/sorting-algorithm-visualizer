import { MonacoEditor } from "solid-monaco";
import type { Monaco } from "@monaco-editor/loader";
import {
	PanelGroup,
	Panel,
	PanelResizeHandle,
} from "solid-resizable-panels-port";
import editorExtraTypes from "./types?raw";

import "./business/audio";
import "./App.css";

import { quickSort, VisualizerGenerator } from "./business/commands";
import { transformTypescript } from "./ts";
import { createOscillator } from "./business/audio";
import { Pause, Play, RefreshCw, Volume2, VolumeX } from "lucide-solid";
import { createEffect, createSignal, Index } from "solid-js";

import quicksortScript from "./assets/algorithms/quicksort?raw";
import bubblesortScript from "./assets/algorithms/bubblesort?raw";
import mergesortScript from "./assets/algorithms/mergesort?raw";
import { createStore, unwrap } from "solid-js/store";
import { produce } from "solid-js/store";

const JS_EXTRA_FUNCTIONS = transformTypescript(editorExtraTypes);

function setUpMonaco(monaco: Monaco): void {
	monaco.editor.setTheme("vs-dark");
	monaco.languages.typescript.typescriptDefaults.addExtraLib(editorExtraTypes);
}
export default function App() {
	const [itemCount, setItemCount] = createSignal(50);
	let interval: ReturnType<typeof setInterval> | null = null;
	const [defaultScript, setDefaultScript] = createSignal(quicksortScript);
	const [latestCursor, setLatestCursor] = createSignal(-1);

	const [buckets, setBuckets] = createStore({
		swaps: Array<boolean>(itemCount()).fill(false),
		sorted: Array<boolean>(itemCount()).fill(false),
		items: [...Array(itemCount()).keys()].sort(() => Math.random() - 0.5),
		justSet: Array<boolean>(itemCount()).fill(false),
		cursors: new Array<number>(),
	});

	const oscillator = createOscillator();

	const [commandGenerator, setCommandGenerator] =
		createSignal<VisualizerGenerator | null>(quickSort(buckets.items));

	const [commandGeneratorFunction, setCommandGeneratorFunction] =
		createSignal(quickSort);

	const [sortPlaying, setSortPlaying] = createSignal(false);
	const [muted, setMuted] = createSignal(false);
	const [sortFinished, setSortFinished] = createSignal(false);
	const [delay, setDelay] = createSignal(10);
	createEffect(() => {
		if (interval) clearInterval(interval);
		const gen = commandGenerator();
		if (sortPlaying() && gen) {
			interval = setInterval(() => {
				const command = gen.next(buckets.items);
				if (!command.done) {
					setBuckets(
						produce(({ swaps, justSet }) => {
							swaps.fill(false);
							justSet.fill(false);
						})
					);
					switch (command.value.kind) {
						case "swap": {
							const [i, j] = [
								command.value.firstIndex,
								command.value.secondIndex,
							];
							setBuckets("swaps", i, true);
							setBuckets("swaps", j, true);
							setBuckets(
								produce(({ items }) => {
									[items[i], items[j]] = [items[j], items[i]];
								})
							);
							break;
						}
						case "setCursors": {
							const newCursor = command.value.cursors.find(
								(c) => !buckets.cursors.includes(c)
							);
							if (newCursor) {
								setLatestCursor(newCursor);
							}
							setBuckets("cursors", command.value.cursors);
							break;
						}
						case "sorted": {
							for (const index of command.value.indexes) {
								setBuckets("sorted", index, true);
							}
							break;
						}
						case "notSorted": {
							for (const index of command.value.indexes) {
								setBuckets("sorted", index, false);
							}
							break;
						}
						case "set": {
							for (const [index, value] of command.value.values) {
								setBuckets("items", index, value);
								setBuckets("justSet", index, true);
							}
						}
					}
					if (buckets.sorted.every((s) => s)) {
						setSortPlaying(false);
						setSortFinished(true);
						oscillator.mute();
					}
				}
				oscillator.oscillator.frequency.setValueAtTime(
					150 + (latestCursor() / itemCount()) * 1350,
					oscillator.ctx.currentTime
				);
			}, delay());
		} else {
			if (interval) clearInterval(interval);
		}
	});

	const reset = () => {
		const items = [...Array(itemCount()).keys()].sort(
			() => Math.random() - 0.5
		);
		setBuckets({
			items: items,
			sorted: items.map(() => false),
			swaps: items.map(() => false),
			cursors: [],
		});
		setSortFinished(false);
		setCommandGenerator(commandGeneratorFunction()(buckets.items));
		setLatestCursor(0);
	};

	const onTextChange = async (text: string) => {
		setDefaultScript(text);
		try {
			const javascriptCode = transformTypescript(text);
			if (javascriptCode) {
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
					reset();
				}
			}
		} catch (e) {
			setCommandGenerator(null);
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
						display: "flex",
						"justify-content": "center",
						"align-content": "center",
						position: "relative",
					}}
					id="controls"
				>
					<select
						onChange={(e) => {
							switch (e.target.value) {
								case "quicksort": {
									onTextChange(quicksortScript);
									break;
								}
								case "bubblesort": {
									onTextChange(bubblesortScript);
									break;
								}
								case "mergesort": {
									onTextChange(mergesortScript);
									break;
								}
							}
						}}
						style={{
							position: "absolute",
							left: "0",
							"min-width": "100px",
							height: "32px",
						}}
					>
						<option value="quicksort">Quicksort</option>
						<option value="bubblesort">Bubble Sort</option>
						<option value="mergesort">Merge Sort</option>
					</select>
					<button onClick={() => toggleVolume()}>
						{muted() ? <VolumeX /> : <Volume2 />}
					</button>
					<button onClick={() => reset()}>
						<RefreshCw />
					</button>
					<button onClick={() => togglePlaying()}>
						{sortPlaying() ? <Pause /> : <Play />}
					</button>
					<input
						type="number"
						value={itemCount()}
						onBlur={(e) => {
							setItemCount(parseInt(e.target.value));
							reset();
						}}
					/>
				</div>
				<div
					style={{
						height: "5vh",
						display: "flex",
						"justify-content": "center",
						"align-content": "center",
					}}
					id="controls"
				>
					<span>
						Delay of{" "}
						<input
							id="delay"
							onInput={(e) => setDelay(parseFloat(e.target.value) || 10)}
							value={delay()}
							step="1"
							type="number"
							min="1"
							max="1000"
						/>
						ms
					</span>
				</div>
			</Panel>
			<PanelResizeHandle
				style={{
					width: "2px",
					"background-color": "#b9b7df",
					margin: "2px",
					"border-radius": "12px",
					border: "1px solid #80809b",
					cursor: "ew-resize",
				}}
			/>
			<Panel id="visualization" defaultSize={1}>
				<div
					style={{
						"flex-grow": "1",
						height: "100%",
						width: "100%",
						// position: "relative",
						display: "flex",
						"flex-direction": "row",
						"align-items": "end",
					}}
				>
					<svg width="100%" height="100vh" style={{ position: "relative" }}>
						<Index each={buckets.items}>
							{(item, index) => {
								return (
									<g
										style={{
											translate: `${index * ((1 / itemCount()) * 100)}% 100%`,
											scale: "1 -1",
											transition: "translate 0.1s ease",
										}}
									>
										<rect
											class="list-item"
											fill={
												buckets.sorted[index]
													? "lime"
													: buckets.swaps[index] || buckets.justSet[index]
													? "red"
													: buckets.cursors.includes(index)
													? "yellow"
													: "white"
											}
											stroke="black"
											stroke-width={`${(1 / itemCount()) * 8}%`}
											height={`${((item() + 1) / itemCount()) * 100}%`}
											width={`${100 / itemCount()}%`}
										/>
									</g>
								);
							}}
						</Index>
					</svg>
				</div>
			</Panel>
		</PanelGroup>
	);
}
