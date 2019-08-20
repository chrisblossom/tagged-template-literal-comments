import { createCommentParser } from './create-comment-parser';
import { Options as GenerateRegexpsOptions } from './generate-regexps';

export type Options = {
	throwOnSyntaxError?: boolean;
} & GenerateRegexpsOptions;

export { createCommentParser };
