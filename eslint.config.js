import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default defineConfig([
	js.configs.recommended,
	{
		files: ['src/**/*.ts', 'src/**/*.tsx'],
		plugins: {
			'@typescript-eslint': tseslint,
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: './tsconfig.json',
			},
		},
		rules: {
			'no-undef': 'off',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/no-empty-interface': 'error',
			'@typescript-eslint/no-empty-function': 'error',
			'@typescript-eslint/no-var-requires': 'error',
			'@typescript-eslint/ban-ts-comment': 'warn',
		},
	},
]);