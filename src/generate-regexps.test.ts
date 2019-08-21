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

	test('javascript language', () => {
		const result = generateRegexps({ language: 'javascript' });

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

	test('disable language singleLine section', () => {
		const result = generateRegexps({
			language: 'javascript',
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

	test('disable language multiline section', () => {
		const result = generateRegexps({
			language: 'javascript',
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

	test('html language', () => {
		const result = generateRegexps({ language: 'html' });

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
		test('throws when language not found', () => {
			// @ts-ignore
			expect(() => generateRegexps({ language: 'unknown' })).toThrow(
				'Invalid option language. Actual: "unknown" Available: "',
			);
		});

		test('throws when language is empty', () => {
			// @ts-ignore
			expect(() => generateRegexps({ language: '' })).toThrow(
				'Invalid option language. Actual: "" Available: "',
			);
		});

		test('throws when language is provided along with singleLine', () => {
			expect(() =>
				// @ts-ignore
				generateRegexps({ language: 'javascript', singleLine: '#' }),
			).toThrow(
				'language is not a valid option in-combination with singleLine',
			);
		});

		test('throws when language is provided along with multiline', () => {
			expect(() =>
				generateRegexps({
					// @ts-ignore
					language: 'javascript',
					multiline: { open: '#-', close: '-#' },
				}),
			).toThrow(
				'language is not a valid option in-combination with multiline',
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
