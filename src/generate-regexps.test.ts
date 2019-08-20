/* eslint-disable no-useless-escape */

import { generateRegexps } from './generate-regexps';

describe('generate-regexps', () => {
	test('defaults to javascript', () => {
		const result = generateRegexps();

		expect(result).toEqual({
			source: {
				singleLine: '//',
				multiline: { open: '/*', close: '*/' },
			},
			includesComments: /(\/\/|\/\*|\*\/)/,
			singleLine: {
				open: /\/\/(.*?).*/,
				close: /(.*?)\n/,
				matched: /\/\/(.*?)\n/g,
			},
			multiline: {
				open: /\/\*([\s\S]*.?)/,
				close: /([\s\S]*?)\*\//,
				matched: /\/\*([\s\S]*?)\*\//g,
			},
		});
	});

	test('defaults to javascript with multiline: false', () => {
		const result = generateRegexps({
			multiline: false,
		});

		expect(result).toEqual({
			source: { singleLine: '//' },
			includesComments: /(\/\/)/,
			singleLine: {
				open: /\/\/(.*?).*/,
				close: /(.*?)\n/,
				matched: /\/\/(.*?)\n/g,
			},
			multiline: undefined,
		});
	});

	test('defaults to javascript with singleLine: false', () => {
		const result = generateRegexps({
			singleLine: false,
		});

		expect(result).toEqual({
			source: { multiline: { open: '/*', close: '*/' } },
			includesComments: /(\/\*|\*\/)/,
			singleLine: undefined,
			multiline: {
				open: /\/\*([\s\S]*.?)/,
				close: /([\s\S]*?)\*\//,
				matched: /\/\*([\s\S]*?)\*\//g,
			},
		});
	});

	test('javascript preset', () => {
		const result = generateRegexps({ preset: 'javascript' });

		expect(result).toEqual({
			source: {
				singleLine: '//',
				multiline: { open: '/*', close: '*/' },
			},
			includesComments: /(\/\/|\/\*|\*\/)/,
			singleLine: {
				open: /\/\/(.*?).*/,
				close: /(.*?)\n/,
				matched: /\/\/(.*?)\n/g,
			},
			multiline: {
				open: /\/\*([\s\S]*.?)/,
				close: /([\s\S]*?)\*\//,
				matched: /\/\*([\s\S]*?)\*\//g,
			},
		});
	});

	test('automatically escapes markers', () => {
		const result = generateRegexps({
			singleLine: '//',
			multiline: {
				open: '/*',
				close: '*/',
			},
		});

		expect(result).toEqual({
			source: {
				singleLine: '//',
				multiline: { open: '/*', close: '*/' },
			},
			includesComments: /(\/\/|\/\*|\*\/)/,
			singleLine: {
				open: /\/\/(.*?).*/,
				close: /(.*?)\n/,
				matched: /\/\/(.*?)\n/g,
			},
			multiline: {
				open: /\/\*([\s\S]*.?)/,
				close: /([\s\S]*?)\*\//,
				matched: /\/\*([\s\S]*?)\*\//g,
			},
		});
	});

	test('disable preset singleLine section', () => {
		const result = generateRegexps({
			preset: 'javascript',
			singleLine: false,
		});

		expect(result).toEqual({
			source: { multiline: { open: '/*', close: '*/' } },
			includesComments: /(\/\*|\*\/)/,
			singleLine: undefined,
			multiline: {
				open: /\/\*([\s\S]*.?)/,
				close: /([\s\S]*?)\*\//,
				matched: /\/\*([\s\S]*?)\*\//g,
			},
		});
	});

	test('disable preset multiline section', () => {
		const result = generateRegexps({
			preset: 'javascript',
			multiline: false,
		});

		expect(result).toEqual({
			source: { singleLine: '//' },
			includesComments: /(\/\/)/,
			singleLine: {
				open: /\/\/(.*?).*/,
				close: /(.*?)\n/,
				matched: /\/\/(.*?)\n/g,
			},
			multiline: undefined,
		});
	});

	test('html preset', () => {
		const result = generateRegexps({ preset: 'html' });

		expect(result).toEqual({
			source: { multiline: { open: '<!--', close: '-->' } },
			includesComments: /(<!\-\-|\-\->)/,
			singleLine: undefined,
			multiline: {
				open: /<!\-\-([\s\S]*.?)/,
				close: /([\s\S]*?)\-\->/,
				matched: /<!\-\-([\s\S]*?)\-\->/g,
			},
		});
	});

	test('custom singleLine', () => {
		const result = generateRegexps({ singleLine: '#' });

		expect(result).toEqual({
			source: { singleLine: '#' },
			includesComments: /(#)/,
			singleLine: {
				open: /#(.*?).*/,
				close: /(.*?)\n/,
				matched: /#(.*?)\n/g,
			},
			multiline: undefined,
		});
	});

	test('custom multiline', () => {
		const result = generateRegexps({
			multiline: { open: '#^', close: '^#' },
		});

		expect(result).toEqual({
			source: { multiline: { open: '#^', close: '^#' } },
			includesComments: /(#\^|\^#)/,
			singleLine: undefined,
			multiline: {
				open: /#\^([\s\S]*.?)/,
				close: /([\s\S]*?)\^#/,
				matched: /#\^([\s\S]*?)\^#/g,
			},
		});
	});

	test('both custom singleLine and multiline', () => {
		const result = generateRegexps({
			singleLine: '%',
			multiline: { open: '#^', close: '^#' },
		});

		expect(result).toEqual({
			source: { singleLine: '%', multiline: { open: '#^', close: '^#' } },
			includesComments: /(%|#\^|\^#)/,
			singleLine: {
				open: /%(.*?).*/,
				close: /(.*?)\n/,
				matched: /%(.*?)\n/g,
			},
			multiline: {
				open: /#\^([\s\S]*.?)/,
				close: /([\s\S]*?)\^#/,
				matched: /#\^([\s\S]*?)\^#/g,
			},
		});
	});

	describe('errors', () => {
		test('throws when preset not found', () => {
			// @ts-ignore
			expect(() => generateRegexps({ preset: 'unknown' })).toThrow(
				'Invalid option preset. Actual: "unknown" Available: "',
			);
		});

		test('throws when preset is empty', () => {
			// @ts-ignore
			expect(() => generateRegexps({ preset: '' })).toThrow(
				'Invalid option preset. Actual: "" Available: "',
			);
		});

		test('throws when preset is provided along with singleLine', () => {
			expect(() =>
				// @ts-ignore
				generateRegexps({ preset: 'javascript', singleLine: '#' }),
			).toThrow(
				'preset is not a valid option in-combination with singleLine',
			);
		});

		test('throws when preset is provided along with multiline', () => {
			expect(() =>
				generateRegexps({
					// @ts-ignore
					preset: 'javascript',
					multiline: { open: '#-', close: '-#' },
				}),
			).toThrow(
				'preset is not a valid option in-combination with multiline',
			);
		});

		test('multiline without start', () => {
			expect(() =>
				// @ts-ignore
				generateRegexps({ multiline: { close: '-#' } }),
			).toThrow('multiline.start is required');
		});

		test('multiline without end', () => {
			expect(() =>
				// @ts-ignore
				generateRegexps({ multiline: { open: '#-' } }),
			).toThrow('multiline.end is required');
		});
	});
});
