import {
	t,
	s,
	e,
	runTests,
} from './tagged-template-literal-comments-test-runner';

describe('removeComments', () => {
	/**
	 * empty
	 */
	t({
		describe: 'handles empty',
		tests: [
			{
				title: 'no new lines',
				singleLine: s``,
				multiline: s``,
				toEqual: e``,
			},
			{
				title: 'with new lines',
				singleLine: s`
				`,
				multiline: s`
				`,
				toEqual: e`
				`,
			},
		],
	});

	/**
	 * only string
	 */
	t({
		describe: 'handles only strings',
		tests: [
			{
				title: 'no new lines',
				singleLine: s`only`,
				multiline: s`only`,
				toEqual: e`only`,
			},
			{
				title: 'with new lines',
				singleLine: s`
						only
						`,
				multiline: s`
						only
						`,
				toEqual: e`
						only
						`,
			},
		],
	});

	/**
	 * only data
	 */
	t({
		describe: 'handles only data',
		tests: [
			{
				title: 'no new lines',
				singleLine: s`${1}`,
				multiline: s`${1}`,
				toEqual: e`${1}`,
			},
			{
				title: 'with new lines',
				singleLine: s`
						${1}
						`,
				multiline: s`
						${1}
						`,
				toEqual: e`
						${1}
						`,
			},
		],
	});

	/**
	 * removes excess whitespace
	 */
	t({
		title: 'removes excess whitespace',
		singleLine: s`
		line1


		line2

		${'data1'}


		${'data2'}
		`,
		multiline: s`
		line1


		line2

		${'data1'}


		${'data2'}
		`,
		toEqual: e`
		line1
		line2
		${'data1'}
		${'data2'}
		`,
	});

	/**
	 * only comments
	 */
	t({
		describe: 'handles only comments',
		tests: [
			{
				title: 'no new lines',
				singleLine: s`// drop`,
				multiline: s`/* drop */`,
				toEqual: e``,
			},
			{
				title: 'spans multiple lines',
				multiline: s`/*
			 			drop
			 			*/`,
				toEqual: e``,
			},
		],
	});

	/**
	 * no comments with data
	 */
	t({
		title: 'handles no comments with data',
		singleLine: s`
				a    | b    | c
				${1} | ${2} | ${3}
				a    | b    | c
				`,
		multiline: s`
				a    | b    | c
				${1} | ${2} | ${3}
				a    | b    | c
				`,
		toEqual: e`
				a    | b    | c
				${1} | ${2} | ${3}
				a    | b    | c
			`,
	});

	/**
	 * data before comments
	 */
	t({
		describe: 'handles data before comments',
		tests: [
			{
				title: 'no new lines',
				singleLine: s`${1} // drop`,
				multiline: s`${1} /* drop */`,
				toEqual: e`${1}`,
			},
			{
				title: 'test before data',
				singleLine: s`text ${1} // drop`,
				multiline: s`text ${1} /* drop */`,
				toEqual: e`text ${1}`,
			},
			{
				title: 'spans multiple lines',
				multiline: s`${1} /*
			 				drop
			 				*/`,
				toEqual: e`${1}`,
			},
		],
	});

	/**
	 * data after comments
	 */
	t({
		describe: 'handles data after comments',
		tests: [
			{
				title: 'no new lines',
				singleLine: s`// drop ${1}`,
				multiline: s`/* drop ${1} */`,
				toEqual: e``,
			},
			{
				title: 'with new lines',
				multiline: s`/*
				drop 
				${1}
				*/`,
				toEqual: e``,
			},
		],
	});

	/**
	 * removes trailing from multiple lines
	 */
	t({
		title: 'removes trailing from multiple lines',
		singleLine: s`
		            line1 // is ignored
					${'data1'} | ${'data2'} // data ignored
					`,
		multiline: s`
					line1 /* is ignored */
					${'data1'} | ${'data2'} /* data ignored */
					`,

		toEqual: e`
					line1
					${'data1'} | ${'data2'}
					`,
	});

	/**
	 * remove multiline data as single line
	 */
	t({
		title: 'remove multiline data as single line',
		singleLine: s`
				a
				// ${5} | ${6}
				end
				`,
		multiline: s`
				a
				/* ${5} | ${6} */
				end
				`,
		toEqual: e`
				a
				end
				`,
	});

	/**
	 * remove multiline data
	 */
	t({
		describe: 'remove multiline data',
		tests: [
			{
				title: 'consistent data per line',
				singleLine: s`
				a    | b    | toEqual
				// ${5} | ${5} | ${2}
				// ${5} | ${5} | ${3}
				// ${5} | ${5} | ${4}
				${2} | ${2} | ${4}
				`,
				multiline: s`
				a    | b    | toEqual
				/* ${5} | ${5} | ${2}
				${5} | ${5} | ${3}
				${5} | ${5} | ${4} */
				${2} | ${2} | ${4}
				`,
				toEqual: e`
				a    | b    | toEqual
				${2} | ${2} | ${4}
				`,
			},
			{
				title: 'different data per line',
				singleLine: s`
				a
				// ${5}
				${1}
				// ${5} | ${1}
				${2} | ${3}
				`,
				multiline: s`
				a
				/* ${5} */
				${1}
				/* ${5} | ${1} */
				${2} | ${3}
				`,
				mixed: s`
				a
				/* ${5} */
				/* ${5} | ${1} */
				${1}
				// ${2} | ${3}
				// ${2}
				${2} | ${3}
				`,

				toEqual: e`
				a
				${1}
				${2} | ${3}
				`,
			},
		],
	});

	/**
	 * remove data middle of a line
	 */
	t({
		title: 'remove data middle of a line',
		singleLine: s`
				a    | b    | toEqual
				${4} // | ${5} | ${4}
				${5}// | ${5} | ${4}
				${2} | ${2} | ${4}
				`,
		multiline: s`
				a    | b    | toEqual
				${4} /* | ${5} | ${4} */
				${5}/* | ${5} | ${4}*/
				${2} | ${2} | ${4}
				`,
		toEqual: e`
				a    | b    | toEqual
				${4}
				${5}
				${2} | ${2} | ${4}
				`,
	});

	/**
	 * handles text before data
	 */
	t({
		title: 'handles text before data',
		singleLine: s`
				// ${5}
				before ${2}
				`,
		multiline: s`
				/* ${5} */
				before ${2}
				`,
		toEqual: e`
				before ${2}
				`,
	});

	/**
	 * mixed
	 */
	t({
		title: 'mixed single line and multiline',
		mixed: s`
				a    | b    | toEqual
				/* ${5} | ${5} | ${2}
				${5} | ${5} // | ${3}
				// ${5} | ${5} | ${4} */
				// ${5} | ${5} | ${3}
				${0}
				// ${5} | ${5} | ${3} // hello
				// ${5} | ${5} | ${3} /* works */
				${1} | ${2} | ${4} // ending
				${2} // | ${2} | ${4}
				${3} /* | ${2} | ${4} */
				${4} | ${2} | ${4}
				`,
		toEqual: e`
				a    | b    | toEqual
				${0}
				${1} | ${2} | ${4}
				${2}
				${3}
				${4} | ${2} | ${4}
				`,
	});

	describe('comment parser', () => {
		/**
		 * multiline open comments are ignored inside single line comment
		 */
		t({
			title:
				'multiline open comments are ignored inside single line comment',
			mixed: s`// /*`,
			toEqual: e``,
		});

		/**
		 * multiline close comments are ignored inside single line comment
		 */
		t({
			title:
				'multiline close comments are ignored inside single line comment',
			mixed: s`// */`,
			toEqual: e``,
		});

		/**
		 * single line comments are ignored inside multiline line comment
		 */
		t({
			title:
				'single line comments are ignored inside multiline line comment',
			mixed: s`
					/*
						ignore
						// inside single line
	  					all
					*/
					hello
					`,
			toEqual: e`
					hello
					`,
		});
	});

	/**
	 * errors
	 */
	t({
		describe: 'closing multiline comment was never opened',
		tests: [
			{
				title: 'single line comment after */',
				multiline: s`*/ //`,
				toThrow: 'Parsing error: "/*" expected',
			},
			{
				title: 'no new lines',
				multiline: s`never opened */ after`,
				toThrow: 'Parsing error: "/*" expected',
			},
			{
				title: 'new lines',
				multiline: s`
						never opened
						*/
						after
						`,
				toThrow: 'Parsing error: "/*" expected',
			},
			{
				title: 'no new lines with data',
				multiline: s`${0}never${0} opened${0} */ ${0}after`,
				toThrow: 'Parsing error: "/*" expected',
			},
			{
				title: 'new lines with data',
				multiline: s`
						${0}
						never opened
						${0}
						*/
						${0}
						after
						${0}
						`,
				toThrow: 'Parsing error: "/*" expected',
			},
		],
	});

	t({
		describe: 'closing multiline comment was never closed',
		tests: [
			{
				title: 'no new lines',
				multiline: s`before /* never closed`,
				toThrow: 'Parsing error: "*/" expected',
			},
			{
				title: 'new lines',
				multiline: s`
						before
						/*
					 	never closed
					 	`,
				toThrow: 'Parsing error: "*/" expected',
			},
			{
				title: 'no new lines with data',
				multiline: s`${0}before ${1}/*${2} never closed ${3}`,
				toThrow: 'Parsing error: "*/" expected',
			},
			{
				title: 'new lines with data',
				multiline: s`
						${0}
						before
						${0}
						/*
						${0}
					 	never closed
						${0}
					 	`,
				toThrow: 'Parsing error: "*/" expected',
			},
		],
	});

	t({
		describe: 'multiple multiline comments opened and closed',
		tests: [
			{
				title: 'no new lines',
				multiline: s`before /* /* can only have one multiline comment at a time */ */ after`,
				toThrow: 'Parsing error: "/*" expected',
			},
			{
				title: 'new lines',
				multiline: s`
					before
					 /*
					 	/*
					 	can only have one multiline comment at a time
					 	*/
					 */
					 after
					 `,
				toThrow: 'Parsing error: "/*" expected',
			},
			{
				title: 'no new lines with data',
				multiline: s`${0}before /* /* ${1} can only have one multiline comment at a time */${1} */ ${1} after`,
				toThrow: 'Parsing error: "/*" expected',
			},
			{
				title: 'new lines with data',
				multiline: s`
					${0}
					before
					 /*
					 	/* ${1}
					 	can only have one multiline comment at a time
					 	*/
					 */
					 after
					 ${2}
					 `,
				toThrow: 'Parsing error: "/*" expected',
			},
		],
	});
	/* errors end */

	/**
	 * options
	 */
	t({
		describe: 'throwOnSyntaxError: false',
		options: { throwOnSyntaxError: false },
		tests: [
			{
				title: 'multiline: true handles /* not closed at start',
				multiline: s`/* data ${1}`,
				toEqual: e``,
			},
			{
				title: 'multiline: true handles /* not closed at end',
				multiline: s`data ${1} /*`,
				toEqual: e`data ${1}`,
			},
			{
				title: 'handles */ not opened',
				multiline: s`data ${1} */`,
				toEqual: e`data ${1} */`,
			},
			{
				title: 'handles */ not opened with // comment at end',
				mixed: s`data ${1} */ // last`,
				toEqual: e`data ${1} */`,
			},
		],
	});
	/* options end */

	runTests();
});
