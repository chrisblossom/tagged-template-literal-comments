import { Options } from './tagged-template-literal-comments';
import { createCommentParser } from './create-comment-parser';
import { s } from './tagged-template-literal-comments-test-runner';

describe('createCommentParser', () => {
	test('creates parser', () => {
		const options: Options = { language: 'javascript' };
		const parser = createCommentParser(options);
		const js = s`
		a | b | c
		${1} | ${2} | ${3}
		// ${4} | ${5} | ${6}
		/* ${7} | ${8} | ${9} */
		`;

		const result = parser(...js);
		expect(result).toEqual([['\na | b | c\n', '|', '|', '\n'], 1, 2, 3]);
	});

	test('can initialize with tagged template', () => {
		const options: Options = { language: 'javascript' };
		const parser = createCommentParser(options);
		const result = parser`
		a | b | c
		${1} | ${2} | ${3}
		// ${4} | ${5} | ${6}
		/* ${7} | ${8} | ${9} */
		`;

		expect(result).toEqual([['\na | b | c\n', '|', '|', '\n'], 1, 2, 3]);
	});

	test('passes options', () => {
		const options: Options = { language: 'html' };
		const parser = createCommentParser(options);
		const result = parser`
	 			<!-- remove comment -->
				<!--<p>${1}</p>-->
				<p>${2}</p>
		`;

		expect(result).toEqual([['\n<p>', '</p>\n'], 2]);
	});
});
