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

interface ActualPresets {
	[key: string]: Custom;
}

const Shape = <M extends ActualPresets>(presets: M): M => {
	return presets;
};

const presets = Shape({
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

const availablePresets = Object.keys(presets) as (keyof typeof presets)[];

interface Preset {
	preset?: keyof typeof presets;
	singleLine?: false;
	multiline?: false;
}

export type Options = Custom | Preset;

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
	if ('preset' in options) {
		if (options.preset !== undefined) {
			if (availablePresets.includes(options.preset) === false) {
				const message = `Invalid option preset. Actual: "${
					options.preset
				}" Available: "${availablePresets.join(', ')}" `;

				throw new Error(message);
			}
		}

		if (
			options.preset !== undefined &&
			(options.singleLine !== undefined && options.singleLine !== false)
		) {
			const message =
				'preset is not a valid option in-combination with singleLine';
			throw new Error(message);
		}

		if (
			options.preset !== undefined &&
			(options.multiline !== undefined && options.multiline !== false)
		) {
			const message =
				'preset is not a valid option in-combination with multiline';
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
		const preset =
			options.preset !== undefined ? options.preset : 'javascript';

		const matchedPreset = presets[preset];
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

export { generateRegexps, presets };
