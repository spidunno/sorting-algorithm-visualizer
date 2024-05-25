import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const common: UserConfig = {
		plugins: [react()],
	};
	if (mode === "gh-pages") {
		return { ...common, base: "/sorting-algorithm-visualizer" };
	} else {
		return common;
	}
});
