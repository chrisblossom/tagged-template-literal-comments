import escapeStringRegexp from 'escape-string-regexp';

type SingleLine = string;
interface Multiline {
	open: string;
	close: string;
}

interface Custom {
	singleLine?: SingleLine;
	multiline?: Multiline;
}

interface LanguagesShape {
	[key: string]: Custom;
}

const Shape = <M extends LanguagesShape>(presets: M): M => {
	return presets;
};

const languages = Shape({
	javascript: {
		singleLine: '//',
		multiline: {
			open: '/*',
			close: '*/',
		},
	},
	html: {
		multiline: {
			open: '<!--',
			close: '-->',
		},
	},
	ignore: {
		singleLine: '#',
	},
} as const);

const availableLanguages = Object.keys(languages) as (keyof typeof languages)[];

interface Language {
	language?: keyof typeof languages;
	singleLine?: false;
	multiline?: false;
}

export type Options = Custom | Language;

function isCustom(options: Options): options is Custom {
	if (
		'singleLine' in options &&
		options.singleLine !== undefined &&
		typeof options.singleLine !== 'boolean'
	) {
		return true;
	}

	if (
		'multiline' in options &&
		options.multiline !== undefined &&
		typeof options.multiline !== 'boolean'
	) {
		return true;
	}

	return false;
}

interface SingleLineRegex {
	// single line open but no matching new line (must be ran after singleLine.matched)
	open: RegExp;
	// single lines are closed with new lines
	close: RegExp;
	matched: RegExp;
}

interface MultilineRegex {
	// multiline open but no matching close */ (must be ran after multiline.matched)
	open: RegExp;
	// multiline are closed with */
	close: RegExp;
	// https://stackoverflow.com/a/22490592
	matched: RegExp;
}

function validateOptions(options: Options): void {
	if ('language' in options) {
		if (options.language !== undefined) {
			if (availableLanguages.includes(options.language) === false) {
				const message = `Invalid option language. Actual: "${
					options.language
				}" Available: "${availableLanguages.join(', ')}" `;

				throw new Error(message);
			}
		}

		if (
			options.language !== undefined &&
			(options.singleLine !== undefined && options.singleLine !== false)
		) {
			const message =
				'language is not a valid option in-combination with singleLine';
			throw new Error(message);
		}

		if (
			options.language !== undefined &&
			(options.multiline !== undefined && options.multiline !== false)
		) {
			const message =
				'language is not a valid option in-combination with multiline';
			throw new Error(message);
		}
	}

	if (
		'multiline' in options &&
		options.multiline !== undefined &&
		options.multiline !== false
	) {
		if (options.multiline.open === undefined) {
			const message = 'multiline.start is required';
			throw new Error(message);
		}

		if (options.multiline.close === undefined) {
			const message = 'multiline.end is required';
			throw new Error(message);
		}
	}
}

interface Result {
	source: Custom;
	includesComments: RegExp;
	singleLine?: SingleLineRegex;
	multiline?: MultilineRegex;
}

function generateRegexps(options: Options = {}): Result {
	validateOptions(options);

	let SINGLE_LINE: undefined | string;
	let MULTILINE_OPEN: undefined | string;
	let MULTILINE_END: undefined | string;

	if (isCustom(options)) {
		if (options.singleLine !== undefined) {
			SINGLE_LINE = options.singleLine;
		}

		if (options.multiline !== undefined) {
			MULTILINE_OPEN = options.multiline.open;
			MULTILINE_END = options.multiline.close;
		}
	} else {
		const language =
			options.language !== undefined ? options.language : 'javascript';

		const matchedPreset = languages[language];
		if ('singleLine' in matchedPreset && options.singleLine !== false) {
			SINGLE_LINE = matchedPreset.singleLine;
		}

		if ('multiline' in matchedPreset && options.multiline !== false) {
			MULTILINE_OPEN = matchedPreset.multiline.open;
			MULTILINE_END = matchedPreset.multiline.close;
		}
	}

	const source: Custom = {};

	if (SINGLE_LINE !== undefined) {
		source.singleLine = SINGLE_LINE;

		SINGLE_LINE = escapeStringRegexp(SINGLE_LINE);
	}

	if (MULTILINE_OPEN !== undefined && MULTILINE_END !== undefined) {
		source.multiline = {
			open: MULTILINE_OPEN,
			close: MULTILINE_END,
		};

		MULTILINE_OPEN = escapeStringRegexp(MULTILINE_OPEN);
		MULTILINE_END = escapeStringRegexp(MULTILINE_END);
	}

	const includesComments = `(${[SINGLE_LINE, MULTILINE_OPEN, MULTILINE_END]
		.filter((marker) => {
			return marker !== undefined;
		})
		.join('|')})`;

	let singleLine: SingleLineRegex | undefined;
	if (SINGLE_LINE !== undefined) {
		singleLine = {
			// single line open but no matching new line (must be ran after singleLine.matched)
			open: new RegExp(`${SINGLE_LINE}(.*?).*`),
			// single lines are closed with new lines
			close: new RegExp(`(.*?)\\n`),
			matched: new RegExp(`${SINGLE_LINE}(.*?)\\n`, 'g'),
		};
	}

	let multiline: MultilineRegex | undefined;
	if (MULTILINE_OPEN !== undefined && MULTILINE_END !== undefined) {
		multiline = {
			// multiline open but no matching close (must be ran after multiline.matched)
			open: new RegExp(`${MULTILINE_OPEN}([\\s\\S]*.?)`),
			close: new RegExp(`([\\s\\S]*?)${MULTILINE_END}`),
			// https://stackoverflow.com/a/22490592
			matched: new RegExp(
				`${MULTILINE_OPEN}([\\s\\S]*?)${MULTILINE_END}`,
				'g',
			),
		};
	}

	const result: Result = {
		source,
		includesComments: new RegExp(includesComments),
		singleLine,
		multiline,
	};

	return result;
}

export { generateRegexps, languages };
