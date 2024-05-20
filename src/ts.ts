import { transform } from '@babel/standalone';

export function transformTypescript(code: string): string | null | undefined {
	return transform(code, { presets: ["typescript"], filename: "sort.ts"}).code;
}