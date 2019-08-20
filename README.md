# tagged-template-literal-comments

[![npm](https://img.shields.io/npm/v/tagged-template-literal-comments.svg?label=npm%20version)](https://www.npmjs.com/package/tagged-template-literal-comments)
[![Linux Build Status](https://img.shields.io/circleci/project/github/chrisblossom/tagged-template-literal-comments/master.svg?label=linux%20build)](https://circleci.com/gh/chrisblossom/tagged-template-literal-comments/tree/master)
[![Windows Build Status](https://img.shields.io/appveyor/ci/chrisblossom/tagged-template-literal-comments/master.svg?label=windows%20build)](https://ci.appveyor.com/project/chrisblossom/tagged-template-literal-comments/branch/master)
[![Code Coverage](https://img.shields.io/codecov/c/github/chrisblossom/tagged-template-literal-comments/master.svg)](https://codecov.io/gh/chrisblossom/tagged-template-literal-comments/branch/master)

## About

Adds comments to [tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates).

## Features

-   Removes commented out strings and values
-   Supports single line and multiline comments
-   Trims excess whitespace and new lines

## Installation

`npm install tagged-template-literal-comments`

## Usage

```js
import { createCommentParser } from 'tagged-template-literal-comments';

// defaults to javascript parser
const jsCommentParser = createCommentParser();

const jsWithComments = jsCommentParser`
	a    | b    | expected

	// test a subset of issues
	${0} | ${1} | ${1}

	// test another subset of issues
	${1} | ${1} | ${2}
	${2} | ${2} | ${4} // fix for: https://github.com/facebook/jest/pull/8717
	${3} | ${3} | ${6} // some random note

	// enable later
	// ${1} | ${1} | ${2}
	// ${1} | ${1} | ${2}
`;

const jsWithoutComments = `
	a    | b    | expected
	${0} | ${1} | ${1}
	${1} | ${1} | ${2}
	${2} | ${2} | ${4}
	${3} | ${3} | ${6}
`;

// jsWithComments === jsWithoutComments

const htmlCommentParser = createCommentParser({ preset: 'html' });

const htmlWithComments = htmlCommentParser`
	<!-- remove comment -->
	<!--<p>${1}</p>-->
	<p>${2}</p>
`;

const htmlWithoutComments = `
	<p>${2}</p>
`;

// htmlWithComments === htmlWithoutComments
```

## Options

```js
const parser = createCommentParser({
	/**
	 * Comment language parser preset
	 *
	 * available: javascript, html, ignore
	 * default: 'javascript'
	 */
	preset: 'javascript',

	/**
	 * Set single line comment marker
	 *
	 * disable preset single line comments by setting to false
	 */
	singleLine: '//',

	/**
	 * Set multiline comment marker
	 *
	 * disable preset multiline comments by setting to false
	 */
	multiline: { open: '/*', close: '*/' },

	/**
	 * Throw on invalid syntax
	 *
	 * default: true
	 */
	throwOnSyntaxError: true,
});
```
