import { trimLines } from './line-utils';

describe('trimLines', () => {
	test.each`
		line                                            | expected
		${''}                                           | ${''}
		${'no whitespace'}                              | ${'no whitespace'}
		${' whitespace '}                               | ${'whitespace'}
		${'\n inside \n'}                               | ${'\ninside\n'}
		${'  \n inside \n  '}                           | ${'\ninside\n'}
		${'    \n one two \n three \n four    \nfive '} | ${'\none two\nthree\nfour\nfive'}
	`('"$line" result: "$expected"', ({ line, expected }) => {
		const result = trimLines(line);

		expect(result).toEqual(expected);
	});
});
