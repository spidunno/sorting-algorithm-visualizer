import { onCleanup } from "solid-js";

export type CreateOscillator = {
	ctx: AudioContext;
	oscillator: OscillatorNode;
	gain: GainNode;

	mute: () => void;
	unmute: () => void;
};

export function createOscillator() {
		let hasStarted = false;
		const audioCtx = new AudioContext();

		const oscillatorNode = new OscillatorNode(audioCtx, {
			type: "triangle",
		});
		const gainNode = new GainNode(audioCtx);
		gainNode.gain.value = 0.1;

		oscillatorNode.connect(gainNode).connect(audioCtx.destination);

		const createOscillatorObject: CreateOscillator = {
			ctx: audioCtx,
			oscillator: oscillatorNode,
			gain: gainNode,
			unmute: () => {
				if (hasStarted) {
					gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
				} else {
					gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
					oscillatorNode.start();
					hasStarted = true;
				}
			},
			mute: () => {
				gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
			},
		};
		
		onCleanup(() => {
			audioCtx.close();
		});

		return createOscillatorObject;
}
