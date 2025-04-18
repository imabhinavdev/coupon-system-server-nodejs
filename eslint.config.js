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
			'no-undef': 'error', // Add this line to catch undefined variables
			'no-unused-vars': 'error',
			// 'no-console': 'warn',
			// 'consistent-return': 'warn',
			eqeqeq: ['error', 'always'],
			semi: ['error', 'always'],
			quotes: ['error', 'single'],
			indent: ['error', 'tab'],
		},
	},
];
