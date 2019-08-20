function replace(regexp: RegExp, string: string, replaceWith: string): string {
	const matched = regexp.test(string);

	if (matched !== false) {
		// eslint-disable-next-line no-param-reassign
		string = string.replace(regexp, replaceWith);
	}

	return string;
}

// https://stackoverflow.com/a/52947649
const crossPlatformNewLineRegex = new RegExp(`\\r\\n|\\r`);
function normalizeLineEndings(line: string): string {
	// eslint-disable-next-line no-param-reassign
	line = replace(crossPlatformNewLineRegex, line, '\n');

	return line;
}

const excessNewLineRegex = new RegExp(`(\\n)\\1+`, 'g');
function removeExcessNewLines(line: string): string {
	const result = replace(excessNewLineRegex, line, '\n');

	return result;
}

function trimLines(line: string): string {
	const result = line.split('\n').reduce((acc, subLine, index, array) => {
		/* eslint-disable no-param-reassign */
		const isLast = index === array.length - 1;
		if (isLast === true) {
			acc += subLine.trim();
			acc = removeExcessNewLines(acc);

			return acc;
		}

		acc += `${subLine.trim()}\n`;
		/* eslint-enable no-param-reassign */

		return acc;
	}, '');

	return result;
}

export { trimLines, normalizeLineEndings, replace, removeExcessNewLines };
