import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.browser,
			},
			parserOptions: {
				ecmaVersion: 2021,
				sourceType: 'module',
			},
		},
	},
	pluginJs.configs.recommended,
	{
		rules: {
			'no-unused-vars': 'error',
			'no-console': 'warn',
			'consistent-return': 'error',
			eqeqeq: ['error', 'always'],
			semi: ['error', 'always'],
			quotes: ['error', 'single'],
			indent: ['error', 2],
		},
	},
];
