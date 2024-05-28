import { defineConfig, UserConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig(({ mode }) => {
	const common: UserConfig = {
		plugins: [solid()],
	};
	if (mode === "gh-pages") {
		return { ...common, base: "/sorting-algorithm-visualizer" };
	} else {
		return common;
	}
});