import { useEffect, useRef } from "react";

export type UseOscillator = {
	ctx: AudioContext;
	oscillator: OscillatorNode;
	gain: GainNode;

	mute: () => void;
	unmute: () => void;
};

export function useOscillator(): React.MutableRefObject<UseOscillator> {
	const useOscillatorObject = useRef<UseOscillator>(null!);
	useEffect(() => {
		let hasStarted = false;
		const audioCtx = new AudioContext();

		const oscillatorNode = new OscillatorNode(audioCtx, {
			type: "triangle",
		});
		const gainNode = new GainNode(audioCtx);
		gainNode.gain.value = 0.1;

		oscillatorNode.connect(gainNode).connect(audioCtx.destination);

		useOscillatorObject.current = {
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

		return () => {
			audioCtx.close();
		};
	}, []);

	return useOscillatorObject;
}
