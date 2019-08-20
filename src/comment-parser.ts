import { generateRegexps } from './generate-regexps';
import { trimLines, normalizeLineEndings, replace } from './line-utils';
import { Options } from './tagged-template-literal-comments';

type RemoveComments = [readonly string[], ...readonly unknown[]];

class CommentParser {
	private readonly throwOnSyntaxError: boolean;
	private readonly regex: ReturnType<typeof generateRegexps>;
	private openCommentType: 'singleLine' | 'multiline' | null = null;
	private previousValueWasCommented = false;

	public constructor(options: Options = {}) {
		const { throwOnSyntaxError = true, ...commentOptions } = options;

		this.throwOnSyntaxError =
			typeof throwOnSyntaxError === 'boolean' ? throwOnSyntaxError : true;

		this.regex = generateRegexps(commentOptions);

		this.removeCommentsFromLine = this.removeCommentsFromLine.bind(this);
		this.removeComments = this.removeComments.bind(this);
	}

	public removeComments(...params: RemoveComments): RemoveComments {
		const [strings, ...values] = params;

		const result = strings
			// .map((line) => {
			// 	return trimLines(line);
			// })
			.reduce(
				(
					acc: { strings: string[]; values: unknown[] },
					line,
					index,
					array,
				) => {
					let commentsRemoved = this.removeCommentsFromLine(line);

					const isLastLine = index === array.length - 1;
					if (this.throwOnSyntaxError !== false) {
						if (
							isLastLine === true &&
							this.openCommentType === 'multiline' &&
							this.regex.source.multiline !== undefined
						) {
							throw new SyntaxError(
								`Parsing error: "${this.regex.source.multiline.close}" expected`,
							);
						}
					}

					if (commentsRemoved !== null) {
						const previousLine =
							acc.strings[acc.strings.length - 1];
						if (
							previousLine !== undefined &&
							previousLine.includes('\n') &&
							commentsRemoved.trim() === ''
						) {
							commentsRemoved = '\n';
						}

						if (this.previousValueWasCommented === true) {
							if (previousLine === undefined) {
								// shouldn't be able to get here. Added as a safety measure
								acc.strings.push('');
							}

							acc.strings[
								acc.strings.length - 1
							] += commentsRemoved;
						} else {
							acc.strings.push(commentsRemoved);
						}
					}

					if (isLastLine === true) {
						acc.strings[acc.strings.length - 1] = trimLines(
							acc.strings[acc.strings.length - 1],
						);

						return acc;
					}

					if (this.openCommentType !== null) {
						this.previousValueWasCommented = true;
						return acc;
					}

					acc.strings[acc.strings.length - 1] = trimLines(
						acc.strings[acc.strings.length - 1],
					);

					this.previousValueWasCommented = false;

					const matchedData = values[index];

					acc.values.push(matchedData);

					return acc;
				},
				{ strings: [], values: [] },
			);

		return [result.strings, ...result.values];
	}

	private removeCommentsFromLine(line: string): string | null {
		if (
			this.openCommentType === null &&
			this.regex.includesComments.test(line) === false
		) {
			return line;
		}

		let parsedLine = normalizeLineEndings(line);

		if (this.openCommentType !== null) {
			// if openCommentType === singleLine, regex.singleLine cannot be null
			// if openCommentType === multiline, regex.multiline cannot be null
			/* eslint-disable @typescript-eslint/no-non-null-assertion */
			const closeCommentRegex =
				this.openCommentType === 'singleLine'
					? this.regex.singleLine!.close
					: this.regex.multiline!.close;
			/* eslint-enable */

			const removeClosed = replace(closeCommentRegex, parsedLine, '');

			// comment is not ended
			if (removeClosed === parsedLine) {
				return null;
			}

			parsedLine = removeClosed;
			this.openCommentType = null;
		}

		if (this.regex.singleLine !== undefined) {
			// remove complete new lines
			parsedLine = replace(
				this.regex.singleLine.matched,
				parsedLine,
				'\n',
			);

			// opened single line that were not closed
			const removeAllSingleLines = replace(
				this.regex.singleLine.open,
				parsedLine,
				'',
			);

			// single line comment not closed yet
			const nextIsSingleLine = removeAllSingleLines !== parsedLine;
			if (nextIsSingleLine === true) {
				this.openCommentType = 'singleLine';
				parsedLine = removeAllSingleLines;
			}
		}

		if (this.regex.multiline === undefined) {
			return parsedLine;
		}

		parsedLine = replace(this.regex.multiline.matched, parsedLine, '');

		// opened multi line that was not closed
		const removeAllMultiLines = replace(
			this.regex.multiline.open,
			parsedLine,
			'',
		);

		// multi line comment not closed yet
		const nextIsMultiline = removeAllMultiLines !== parsedLine;
		if (nextIsMultiline === true) {
			this.openCommentType = 'multiline';
			return removeAllMultiLines;
		}

		if (
			this.throwOnSyntaxError !== false &&
			this.regex.source.multiline !== undefined
		) {
			const multilineWasNeverOpened = parsedLine.includes(
				this.regex.source.multiline.close,
			);
			if (multilineWasNeverOpened === true) {
				throw new SyntaxError(
					`Parsing error: "${this.regex.source.multiline.open}" expected`,
				);
			}
		}

		return parsedLine;
	}
}

export { CommentParser };
