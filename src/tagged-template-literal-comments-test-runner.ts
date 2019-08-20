/* eslint-disable @typescript-eslint/explicit-function-return-type */

import {
	createCommentParser,
	Options,
} from './tagged-template-literal-comments';
import { presets, Options as GenerateRegexpsOptions } from './generate-regexps';

// TODO: add custom options of fake preset
const withFakePresets = {
	...presets,
} as const;

const keys = Object.keys as <T>(o: T) => (Extract<keyof T, string>)[];
const entries = Object.entries as <T>(
	o: T,
) => [Extract<keyof T, string>, T[keyof T]][];

// https://stackoverflow.com/a/53289298/3199947
type Params = Parameters<ReturnType<typeof createCommentParser>>;

function s(...params: Params): Params {
	const [strings, ...values] = params;
	return [strings, ...values];
}

function e(...params: Params): Params {
	const [strings, ...values] = params;
	const normalizedStrings = strings.map((line) => {
		return line
			.split('\n')
			.map((subLine) => {
				return subLine.trim();
			})
			.join('\n');
	});

	return [normalizedStrings, ...values];
}

type S = ReturnType<typeof s>;
type E = ReturnType<typeof e>;

type TestOptions = Omit<Options, keyof GenerateRegexpsOptions>;

type Focus = keyof typeof withFakePresets | true;

interface BaseTest {
	title: string;
	focus?: Focus;
	options?: TestOptions;
	singleLine?: S;
	multiline?: S;
	mixed?: S;
}

interface SingleNormalTest extends BaseTest {
	toEqual: E;
}

interface SingleErrorTest extends BaseTest {
	toThrow: string;
}

type SingleTest = SingleNormalTest | SingleErrorTest;

interface MultipleTests {
	describe: string;
	focus?: Focus;
	options?: TestOptions;
	tests: SingleTest[];

	title?: never;
	singleLine?: never;
	multiline?: never;
	mixed?: never;
}

type Tests = SingleTest | MultipleTests;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isSingleTest = (tests: any): tests is SingleTest => {
	return tests.tests === undefined;
};

interface PendingTestBase {
	describe?: string;
	title: string;
	options?: TestOptions;
	focus?: Focus;
	params: Params;
}

interface PendingNormalTest extends PendingTestBase {
	toEqual: E;
}

interface PendingErrorTest extends PendingTestBase {
	toThrow: string;
}

type PendingTest = PendingNormalTest | PendingErrorTest;

type PendingFormattedNormalTest = Omit<PendingNormalTest, 'describe' | 'focus'>;
type PendingFormattedErrorTest = Omit<PendingErrorTest, 'describe' | 'focus'>;

type PendingFormattedTest =
	| PendingFormattedNormalTest
	| PendingFormattedErrorTest;

const expectedToThrow = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	pendingTest: any,
): pendingTest is PendingFormattedErrorTest => {
	return typeof pendingTest.toThrow === 'string';
};

const expectToEqual = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	pendingTest: any,
): pendingTest is PendingFormattedNormalTest => {
	return typeof pendingTest.toEqual !== 'undefined';
};

type Types =
	| 'single line'
	| 'singleLine: false'
	| 'multiline'
	| 'multiline: false'
	| 'mixed';
type Writeable<T> = { -readonly [P in keyof T]-?: T[P] };
type Pending = Writeable<
	{
		[key in keyof typeof withFakePresets]: {
			[key in Types]: { [key: string]: PendingFormattedTest[] };
		};
	}
>;

// @ts-ignore
const pending: Pending = {};
// @ts-ignore
const pendingOnly: Pending = {};

function t(tests: Tests): void {
	const singleLineTests: PendingTest[] = [];
	const multilineTests: PendingTest[] = [];
	const mixedLineTests: PendingTest[] = [];

	function sortSingle(singleTest: SingleTest): void {
		const { singleLine, multiline, mixed, ...testSettings } = singleTest;

		if (singleLine !== undefined) {
			const singleLineTest = { ...testSettings, params: singleLine };
			singleLineTests.push(singleLineTest);
		}

		if (multiline !== undefined) {
			const multilineTest = { ...testSettings, params: multiline };
			multilineTests.push(multilineTest);
		}

		if (mixed !== undefined) {
			const mixedTests = { ...testSettings, params: mixed };
			mixedLineTests.push(mixedTests);
		}
	}

	function sortMultiple(multipleTests: MultipleTests): void {
		multipleTests.tests.forEach((singleTest) => {
			const options: TestOptions = {
				...multipleTests.options,
				...singleTest.options,
			};

			const mergedTest: SingleTest & { describe: string } = {
				focus: multipleTests.focus,
				...singleTest,
				describe: multipleTests.describe,
				options,
			};

			sortSingle(mergedTest);
		});
	}

	if (isSingleTest(tests)) {
		sortSingle(tests);
	} else {
		sortMultiple(tests);
	}

	function convertMarkers(
		line: string,
		open: string,
		close?: string,
	): string {
		/* eslint-disable no-param-reassign */
		// is single line
		if (close === undefined) {
			// // open
			line = line.replace(/\/\//g, open);
			return line;
		}

		// is multiline
		line = line
			// /* open
			.replace(/\/\*/g, open)
			// */ close
			.replace(/\*\//g, close);

		return line;
		/* eslint-enable no-param-reassign */
	}

	entries(withFakePresets).forEach(([preset, testTypes]) => {
		function addToPending(
			type: Types,
			currentTests: PendingTest[],
			baseOptions: Options,
			open: string,
			close?: string,
		) {
			currentTests.forEach(
				({
					describe = '_',
					params,
					focus,
					options: testOptions,
					...testParams
				}) => {
					const [lines, ...values] = params;

					const convertedMarkers = lines.map((line) => {
						return convertMarkers(line, open, close);
					});

					// eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
					const updatedOptions = {
						...testOptions,
						...baseOptions,
					} as Options;

					const updatedParams: Params = [convertedMarkers, ...values];

					const updatedTitle = convertMarkers(
						testParams.title,
						open,
						close,
					);

					let toEqualUpdated: E | undefined;
					if (expectToEqual(testParams)) {
						const [
							expectedStrings,
							...expectedValues
						] = testParams.toEqual;

						const updatedStrings = expectedStrings.map((line) => {
							return convertMarkers(line, open, close);
						});

						toEqualUpdated = [updatedStrings, ...expectedValues];
					}

					const toThrowUpdated = expectedToThrow(testParams)
						? convertMarkers(testParams.toThrow, open, close)
						: undefined;

					// @ts-ignore
					const formattedTest: PendingFormattedTest = {
						...testParams,
						options: updatedOptions,
						toThrow: toThrowUpdated,
						toEqual: toEqualUpdated,
						title: updatedTitle,
						params: updatedParams,
					};

					const targetObject =
						focus === true || focus === preset
							? pendingOnly
							: pending;

					if (targetObject[preset] === undefined) {
						// @ts-ignore
						targetObject[preset] = {};
					}

					if (targetObject[preset][type] === undefined) {
						targetObject[preset][type] = {};
					}

					if (targetObject[preset][type][describe] === undefined) {
						targetObject[preset][type][describe] = [];
					}

					targetObject[preset][type][describe].push(formattedTest);
				},
			);
		}

		if ('singleLine' in testTypes && testTypes.singleLine !== undefined) {
			addToPending(
				'single line',
				singleLineTests,
				{ preset },
				testTypes.singleLine,
			);
		}

		if ('multiline' in testTypes && testTypes.multiline !== undefined) {
			addToPending(
				'multiline',
				multilineTests,
				{ preset },
				testTypes.multiline.open,
				testTypes.multiline.close,
			);
		}

		if (
			'singleLine' in testTypes &&
			testTypes.singleLine !== undefined &&
			'multiline' in testTypes &&
			testTypes.multiline !== undefined
		) {
			addToPending(
				'mixed',
				mixedLineTests,
				{ preset },
				testTypes.multiline.open,
				testTypes.multiline.close,
			);

			addToPending(
				'multiline: false',
				singleLineTests,
				{ preset, multiline: false },
				testTypes.singleLine,
			);

			addToPending(
				'singleLine: false',
				multilineTests,
				{ preset, singleLine: false },
				testTypes.multiline.open,
				testTypes.multiline.close,
			);
		}
	});
}

function addTest(pendingTest: PendingFormattedTest) {
	test(pendingTest.title, () => {
		// eslint-disable-next-line jest/no-if
		if (expectedToThrow(pendingTest)) {
			expect(() => {
				const commentParser = createCommentParser(pendingTest.options);
				return commentParser(...pendingTest.params);
			}).toThrow(pendingTest.toThrow);

			return;
		}

		const commentParser = createCommentParser(pendingTest.options);
		const result = commentParser(...pendingTest.params);
		expect(result).toEqual(pendingTest.toEqual);
	});
}

/**
 * run tests after they been added so we can filter them out with .only
 */
function runTests() {
	const pendingTests =
		Object.keys(pendingOnly).length !== 0 ? pendingOnly : pending;

	/* eslint-disable jest/valid-describe */
	entries(pendingTests).forEach(([preset, presetTests]) => {
		entries(presetTests).forEach(([testType, currentTests]) => {
			entries(currentTests).forEach(([testDescribe, subTests]) => {
				subTests.forEach((actualTest) => {
					describe(preset, () => {
						describe(testType, () => {
							if (testDescribe !== '_') {
								describe(`${testDescribe}`, () => {
									addTest(actualTest);
								});

								return;
							}

							// no describe
							addTest(actualTest);
						});
					});
				});
			});
		});
	});
	/* eslint-enable jest/valid-describe */

	// clear all tests
	for (const prop of keys(pending)) {
		delete pending[prop];
	}

	for (const prop of keys(pendingOnly)) {
		delete pendingOnly[prop];
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const skip = (obj: Tests) => {};
t.skip = skip;

export { t, s, e, runTests };
