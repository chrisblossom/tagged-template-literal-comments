import { CommentParser } from './comment-parser';
import { Options } from './tagged-template-literal-comments';

type Params = Parameters<CommentParser['removeComments']>;
type Return = ReturnType<CommentParser['removeComments']>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createCommentParser(options: Options = {}) {
	const commentParser = new CommentParser(options);
	return (...params: Params): Return => {
		return commentParser.removeComments(...params);
	};
}

export { createCommentParser };
