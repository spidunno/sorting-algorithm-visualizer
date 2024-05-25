import { useEffect, useRef } from "react";

export type UseOscillator = {
	ctx: AudioContext;
	oscillator: OscillatorNode;
	gain: GainNode;
};

export function useOscillator(): React.MutableRefObject<UseOscillator> {
	const useOscillatorObject = useRef<UseOscillator>(null!);
	useEffect(() => {
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
		};

		return () => {
			audioCtx.close();
		};
	}, []);

	return useOscillatorObject;
}
