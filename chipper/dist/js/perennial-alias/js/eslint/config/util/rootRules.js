// Copyright 2015-2021, University of Colorado Boulder
/**
 * The rules are organized like they are in the list at https://eslint.org/docs/rules/
 * First by type, then alphabetically within type
 * Explicitly list all rules so it is easy to see what's here and to keep organized
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ export default {
    ////////////////////////////////////////////////////////////////////
    // Possible Problems
    // These rules relate to possible logic errors in code:
    // Enforce return statements in callbacks of array methods
    'array-callback-return': 'error',
    // Require `super()` calls in constructors
    'constructor-super': 'error',
    // Enforce "for" loop update clause moving the counter in the right direction.
    'for-direction': 'error',
    // Enforce `return` statements in getters
    'getter-return': 'error',
    // Disallow using an async function as a Promise executor
    'no-async-promise-executor': 'error',
    // Disallow `await` inside of loops
    'no-await-in-loop': 'off',
    // Disallow reassigning class members
    'no-class-assign': 'error',
    // Disallow comparing against -0
    'no-compare-neg-zero': 'error',
    // Disallow assignment operators in conditional expressions
    'no-cond-assign': 'error',
    // Disallow reassigning `const` variables
    'no-const-assign': 'error',
    // Disallow expressions where the operation doesn't affect the value
    'no-constant-binary-expression': 'error',
    // Disallow constant expressions in conditions
    'no-constant-condition': 'error',
    // Disallow returning value from constructor
    'no-constructor-return': 'error',
    // Disallow control characters in regular expressions
    'no-control-regex': 'error',
    // Disallow the use of `debugger`
    'no-debugger': 'error',
    // Disallow duplicate arguments in `function` definitions
    'no-dupe-args': 'error',
    // Disallow duplicate class members
    'no-dupe-class-members': 'error',
    // Disallow duplicate conditions in if-else-if chains
    'no-dupe-else-if': 'error',
    // Disallow duplicate keys in object literals
    'no-dupe-keys': 'error',
    // Disallow duplicate case labels
    'no-duplicate-case': 'error',
    // Disallow duplicate module imports
    'no-duplicate-imports': 'off',
    // Disallow empty character classes in regular expressions
    'no-empty-character-class': 'error',
    // Disallow empty destructuring patterns
    'no-empty-pattern': 'error',
    // Disallow reassigning exceptions in `catch` clauses
    'no-ex-assign': 'error',
    // Disallow fallthrough of `case` statements
    'no-fallthrough': 'error',
    // Disallow reassigning `function` declarations
    'no-func-assign': 'error',
    // Disallow assigning to imported bindings
    'no-import-assign': 'error',
    // Disallow variable or `function` declarations in nested blocks
    'no-inner-declarations': 'error',
    // Disallow invalid regular expression strings in `RegExp` constructors
    'no-invalid-regexp': 'error',
    // Disallow irregular whitespace
    'no-irregular-whitespace': 'error',
    // Disallow literal numbers that lose precision
    'no-loss-of-precision': 'error',
    // Disallow characters which are made with multiple code points in character
    // class syntax
    'no-misleading-character-class': 'error',
    // Disallow `new` operators with the `Symbol` object
    'no-new-symbol': 'error',
    // Disallow calling global object properties as functions
    'no-obj-calls': 'error',
    // Disallow returning values from Promise executor functions
    'no-promise-executor-return': 'off',
    // Disallow calling some `Object.prototype` methods directly on objects
    'no-prototype-builtins': 'off',
    // Disallow assignments where both sides are exactly the same
    'no-self-assign': 'error',
    // Disallow comparisons where both sides are exactly the same
    'no-self-compare': 'error',
    // Disallow returning values from setters
    'no-setter-return': 'error',
    // Disallow sparse arrays
    'no-sparse-arrays': 'error',
    // Disallow template literal placeholder syntax in regular strings
    'no-template-curly-in-string': 'error',
    // Disallow `this`/`super` before calling `super()` in constructors
    'no-this-before-super': 'error',
    // Disallow the use of undeclared variables unless mentioned in `/*global */` comments
    'no-undef': 'error',
    // Disallow confusing multiline expressions
    'no-unexpected-multiline': 'error',
    // Disallow unmodified loop conditions
    'no-unmodified-loop-condition': 'error',
    // Disallow unreachable code after `return`, `throw`, `continue`, and `break` statements
    'no-unreachable': 'error',
    // Disallow loops with a body that allows only one iteration
    'no-unreachable-loop': 'error',
    // Disallow control flow statements in `finally` blocks
    'no-unsafe-finally': 'error',
    // Disallow negating the left operand of relational operators
    'no-unsafe-negation': 'error',
    // Disallow use of optional chaining in contexts where the `undefined` value is not allowed
    'no-unsafe-optional-chaining': 'error',
    // Disallow unused private class members
    'no-unused-private-class-members': 'error',
    // Disallow unused variables
    'no-unused-vars': [
        'error',
        {
            vars: 'all',
            args: 'none',
            caughtErrors: 'none'
        }
    ],
    // Disallow the use of variables before they are defined
    'no-use-before-define': 'off',
    // Disallow useless backreferences in regular expressions
    'no-useless-backreference': 'error',
    // Disallow assignments that can lead to race conditions due to usage of `await` or `yield`
    'require-atomic-updates': 'error',
    // Require calls to `isNaN()` when checking for `NaN`
    'use-isnan': 'error',
    // Enforce comparing `typeof` expressions against valid strings
    'valid-typeof': 'error',
    ////////////////////////////////////////////////////////////////
    // Suggestions
    // These rules suggest alternate ways of doing things:
    // Enforce getter and setter pairs in objects and classes
    'accessor-pairs': 'off',
    // Require braces around arrow function bodies
    'arrow-body-style': 'off',
    // Enforce the use of variables within the scope they are defined
    'block-scoped-var': 'off',
    // Enforce camelcase naming convention
    camelcase: 'off',
    // Enforce or disallow capitalization of the first letter of a comment
    'capitalized-comments': 'off',
    // Enforce that class methods utilize `this`
    'class-methods-use-this': 'off',
    // Enforce a maximum cyclomatic complexity allowed in a program
    complexity: 'off',
    // Require `return` statements to either always or never specify values
    'consistent-return': 'error',
    // Enforce consistent naming when capturing the current execution context
    'consistent-this': [
        'error',
        'self'
    ],
    // Enforce consistent brace style for all control statements
    curly: 'error',
    // Require `default` cases in `switch` statements
    'default-case': 'error',
    // Enforce default clauses in switch statements to be last
    'default-case-last': 'error',
    // Enforce default parameters to be last
    'default-param-last': 'error',
    // Enforce dot notation whenever possible
    'dot-notation': 'error',
    // Require the use of `===` and `!==`
    eqeqeq: 'error',
    // Require function names to match the name of the variable or property to which they are assigned
    'func-name-matching': [
        'error',
        'always',
        {
            includeCommonJSModuleExports: false,
            considerPropertyDescriptor: true
        }
    ],
    // Require or disallow named `function` expressions
    'func-names': 'off',
    // Enforce the consistent use of either `function` declarations or expressions
    'func-style': 'off',
    // Require grouped accessor pairs in object literals and classes
    'grouped-accessor-pairs': 'off',
    // Require `for-in` loops to include an `if` statement
    'guard-for-in': 'off',
    // Disallow specified identifiers
    'id-denylist': 'error',
    // Enforce minimum and maximum identifier lengths
    'id-length': 'off',
    // Require identifiers to match a specified regular expression
    'id-match': 'error',
    // Require or disallow initialization in variable declarations
    'init-declarations': 'off',
    // Enforce a maximum number of classes per file
    'max-classes-per-file': 'off',
    // Enforce a maximum depth that blocks can be nested
    'max-depth': 'off',
    // Enforce a maximum number of lines per file
    'max-lines': 'off',
    // Enforce a maximum number of lines of code in a function
    'max-lines-per-function': 'off',
    // Enforce a maximum depth that callbacks can be nested
    'max-nested-callbacks': 'error',
    // Enforce a maximum number of parameters in function definitions
    'max-params': 'off',
    // Enforce a maximum number of statements allowed in function blocks
    'max-statements': 'off',
    // Enforce a particular style for multiline comments
    'multiline-comment-style': 'off',
    // Require constructor names to begin with a capital letter
    'new-cap': [
        'error',
        {
            newIsCap: true,
            newIsCapExceptionPattern: '^(options|this|window)\\.\\w+',
            newIsCapExceptions: [
                'rsync',
                'jimp',
                'Math.seedrandom'
            ],
            capIsNew: false,
            capIsNewExceptions: [
                'Immutable.Map',
                'Immutable.Set',
                'Immutable.List'
            ]
        }
    ],
    // Disallow the use of `alert`, `confirm`, and `prompt`
    'no-alert': 'off',
    // Disallow `Array` constructors
    'no-array-constructor': 'error',
    // Disallow bitwise operators
    'no-bitwise': 'error',
    // Disallow the use of `arguments.caller` or `arguments.callee`
    'no-caller': 'error',
    // Disallow lexical declarations in case clauses
    'no-case-declarations': 'error',
    // Disallow arrow functions where they could be confused with comparisons
    'no-confusing-arrow': 'off',
    // Disallow the use of `console`
    'no-console': 'off',
    // Disallow `continue` statements
    'no-continue': 'off',
    // Disallow deleting variables
    'no-delete-var': 'error',
    // Disallow division operators explicitly at the beginning of regular expressions
    'no-div-regex': 'error',
    // Disallow `else` blocks after `return` statements in `if` statements
    'no-else-return': 'off',
    // Disallow empty block statements
    'no-empty': 'error',
    // Disallow empty functions
    'no-empty-function': 'off',
    // Disallow `null` comparisons without type-checking operators
    'no-eq-null': 'error',
    // Disallow the use of `eval()`
    'no-eval': 'error',
    // Disallow extending native types
    'no-extend-native': 'error',
    // Disallow unnecessary calls to `.bind()`
    'no-extra-bind': 'error',
    // Disallow unnecessary boolean casts
    'no-extra-boolean-cast': 'error',
    // Disallow unnecessary labels
    'no-extra-label': 'error',
    // Disallow unnecessary semicolons
    'no-extra-semi': 'error',
    // Disallow leading or trailing decimal points in numeric literals
    'no-floating-decimal': 'error',
    // Disallow assignments to native objects or read-only global variables
    'no-global-assign': 'error',
    // Disallow shorthand type conversions
    'no-implicit-coercion': 'off',
    // Disallow declarations in the global scope
    'no-implicit-globals': 'error',
    // Disallow the use of `eval()`-like methods
    'no-implied-eval': 'error',
    // Disallow inline comments after code
    'no-inline-comments': 'off',
    // Disallow use of `this` in contexts where the value of `this` is `undefined`
    'no-invalid-this': 'off',
    // Disallow the use of the `__iterator__` property
    'no-iterator': 'error',
    // Disallow labels that share a name with a variable
    'no-label-var': 'error',
    // Disallow labeled statements
    'no-labels': 'error',
    // Disallow unnecessary nested blocks
    'no-lone-blocks': 'off',
    // Disallow `if` statements as the only statement in `else` blocks
    'no-lonely-if': 'off',
    // Disallow function declarations that contain unsafe references inside loop statements
    'no-loop-func': 'off',
    // Disallow magic numbers
    'no-magic-numbers': 'off',
    // Disallow mixed binary operators
    'no-mixed-operators': 'off',
    // Disallow use of chained assignment expressions
    'no-multi-assign': [
        'error',
        {
            ignoreNonDeclaration: true
        }
    ],
    // Disallow multiline strings
    'no-multi-str': 'error',
    // Disallow negated conditions
    'no-negated-condition': 'off',
    // Disallow nested ternary expressions
    'no-nested-ternary': 'off',
    // Disallow `new` operators outside of assignments or comparisons
    'no-new': 'error',
    // Disallow `new` operators with the `Function` object
    'no-new-func': 'error',
    // Disallow `Object` constructors
    'no-new-object': 'error',
    // Disallow `new` operators with the `String`, `Number`, and `Boolean` objects
    'no-new-wrappers': 'error',
    // Disallow `\8` and `\9` escape sequences in string literals
    'no-nonoctal-decimal-escape': 'error',
    // Disallow octal literals
    'no-octal': 'error',
    // Disallow octal escape sequences in string literals
    'no-octal-escape': 'error',
    // Disallow reassigning `function` parameters
    'no-param-reassign': 'off',
    // Disallow the unary operators `++` and `--`
    'no-plusplus': 'off',
    // Disallow the use of the `__proto__` property
    'no-proto': 'error',
    // Disallow variable redeclaration
    'no-redeclare': 'error',
    // Disallow multiple spaces in regular expressions
    'no-regex-spaces': 'error',
    // Disallow specified names in exports
    'no-restricted-exports': 'error',
    // Disallow specified global variables
    'no-restricted-globals': 'error',
    // // Disallow specified modules when loaded by `import`, commented out until there are imports to restrict everywhere.
    // NOTE! There is already a usage of this for node configuration. Be careful about how this overrides.
    // 'no-restricted-imports': 'error',
    // Disallow certain properties on certain objects
    'no-restricted-properties': 'error',
    // Disallow specified syntax
    'no-restricted-syntax': [
        'off',
        {
            selector: 'ForInStatement',
            message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.'
        },
        {
            selector: 'ForOfStatement',
            message: 'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.'
        },
        {
            selector: 'LabeledStatement',
            message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.'
        },
        {
            selector: 'WithStatement',
            message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.'
        }
    ],
    // Disallow assignment operators in `return` statements
    'no-return-assign': 'error',
    // Disallow unnecessary `return await`
    'no-return-await': 'error',
    // Disallow `javascript:` urls
    'no-script-url': 'error',
    // Disallow comma operators
    'no-sequences': 'error',
    // Disallow variable declarations from shadowing variables declared in the outer scope
    'no-shadow': 'off',
    // Disallow identifiers from shadowing restricted names
    'no-shadow-restricted-names': 'error',
    // Disallow ternary operators
    'no-ternary': 'off',
    // Disallow throwing literals as exceptions
    'no-throw-literal': 'error',
    // Disallow initializing variables to `undefined`
    'no-undef-init': 'error',
    // Disallow the use of `undefined` as an identifier
    'no-undefined': 'off',
    // Disallow dangling underscores in identifiers
    'no-underscore-dangle': 'off',
    // Disallow ternary operators when simpler alternatives exist
    'no-unneeded-ternary': 'error',
    // Disallow unused expressions
    'no-unused-expressions': 'off',
    // Disallow unused labels
    'no-unused-labels': 'error',
    // Disallow unnecessary calls to `.call()` and `.apply()`
    'no-useless-call': 'error',
    // Disallow unnecessary `catch` clauses
    'no-useless-catch': 'error',
    // Disallow unnecessary computed property keys in objects and classes
    'no-useless-computed-key': 'error',
    // Disallow unnecessary concatenation of literals or template literals
    'no-useless-concat': 'error',
    // Disallow unnecessary constructors
    'no-useless-constructor': 'off',
    // Disallow unnecessary escape characters
    'no-useless-escape': 'error',
    // Disallow renaming import, export, and destructured assignments to the same name
    'no-useless-rename': 'error',
    // Disallow redundant return statements
    'no-useless-return': 'error',
    // Require `let` or `const` instead of `var`
    'no-var': 'error',
    // Disallow `void` operators
    'no-void': 'error',
    // Disallow specified warning terms in comments
    'no-warning-comments': 'off',
    // Disallow `with` statements
    'no-with': 'error',
    // Require or disallow method and property shorthand syntax for object literals
    'object-shorthand': [
        'off',
        'never'
    ],
    // Enforce variables to be declared either together or separately in functions
    'one-var': [
        'error',
        'never'
    ],
    // Require or disallow newlines around variable declarations
    'one-var-declaration-per-line': [
        'error',
        'always'
    ],
    // Require or disallow assignment operator shorthand where possible
    'operator-assignment': 'off',
    // Require using arrow functions for callbacks
    'prefer-arrow-callback': 'error',
    // Require `const` declarations for variables that are never reassigned after declared
    'prefer-const': [
        'error',
        {
            destructuring: 'any',
            ignoreReadBeforeAssign: false
        }
    ],
    // Require destructuring from arrays and/or objects
    'prefer-destructuring': 'off',
    // Disallow the use of `Math.pow` in favor of the `**` operator
    'prefer-exponentiation-operator': 'off',
    // Enforce using named capture group in regular expression
    'prefer-named-capture-group': 'off',
    // Disallow `parseInt()` and `Number.parseInt()` in favor of binary, octal, and hexadecimal literals
    'prefer-numeric-literals': 'error',
    // Disallow use of `Object.prototype.hasOwnProperty.call()` and prefer use of `Object.hasOwn()`
    'prefer-object-has-own': 'error',
    // Disallow using Object.assign with an object literal as the first argument and prefer the use of object spread instead.
    'prefer-object-spread': 'off',
    // Require using Error objects as Promise rejection reasons
    'prefer-promise-reject-errors': 'error',
    // Disallow use of the `RegExp` constructor in favor of regular expression literals
    'prefer-regex-literals': 'off',
    // Require rest parameters instead of `arguments`
    'prefer-rest-params': 'error',
    // Require spread operators instead of `.apply()`
    'prefer-spread': 'error',
    // Require template literals instead of string concatenation
    'prefer-template': 'off',
    // require quotes around object literal property names
    'quote-props': [
        'error',
        'as-needed',
        {
            keywords: false,
            unnecessary: true,
            numbers: false
        }
    ],
    // Enforce the consistent use of the radix argument when using `parseInt()`
    radix: 'error',
    // Disallow async functions which have no `await` expression
    'require-await': 'off',
    // Enforce the use of `u` flag on RegExp
    'require-unicode-regexp': 'off',
    // Require generator functions to contain `yield`
    'require-yield': 'error',
    // Enforce sorted import declarations within modules
    'sort-imports': 'off',
    // Require object keys to be sorted
    'sort-keys': 'off',
    // Require variables within the same declaration block to be sorted
    'sort-vars': 'off',
    // Enforce consistent spacing after the `//` or `/*` in a comment
    'spaced-comment': 'off',
    // Require or disallow strict mode directives
    strict: 'error',
    // Require symbol descriptions
    'symbol-description': 'error',
    // Require `var` declarations be placed at the top of their containing scope
    'vars-on-top': 'off',
    // Require or disallow "Yoda" conditions
    yoda: 'error',
    ////////////////////////////////////////////////////////////
    // These rules care about how the code looks rather than how it executes:
    // Layout & Formatting
    // Enforce linebreaks after opening and before closing array brackets
    'array-bracket-newline': 'off',
    // Enforce consistent spacing inside array brackets
    'array-bracket-spacing': [
        'error',
        'always'
    ],
    // Enforce line breaks after each array element
    'array-element-newline': 'off',
    // Require parentheses around arrow function arguments
    'arrow-parens': [
        'error',
        'as-needed'
    ],
    // Enforce consistent spacing before and after the arrow in arrow functions
    'arrow-spacing': 'error',
    // Disallow or enforce spaces inside of blocks after opening block and before closing block
    'block-spacing': 'off',
    // Enforce consistent brace style for blocks
    'brace-style': [
        'error',
        'stroustrup',
        {
            allowSingleLine: true
        }
    ],
    // Require or disallow trailing commas
    'comma-dangle': 'error',
    // Enforce consistent spacing before and after commas
    'comma-spacing': [
        'error',
        {
            before: false,
            after: true
        }
    ],
    // Enforce consistent comma style
    'comma-style': [
        'error',
        'last',
        {
            exceptions: {
                ArrayExpression: false,
                ArrayPattern: false,
                ArrowFunctionExpression: false,
                CallExpression: false,
                FunctionDeclaration: false,
                FunctionExpression: false,
                ImportDeclaration: false,
                ObjectExpression: false,
                ObjectPattern: false,
                VariableDeclaration: false,
                NewExpression: false
            }
        }
    ],
    // Enforce consistent spacing inside computed property brackets
    'computed-property-spacing': [
        'error',
        'always'
    ],
    // Enforce consistent newlines before and after dots
    'dot-location': 'off',
    // Require or disallow newline at the end of files
    // NOTE: This is off in the main config because it doesn't behave well with HTML files, see overrides for usage.
    'eol-last': 'off',
    // Require or disallow spacing between function identifiers and their invocations
    'func-call-spacing': [
        'error',
        'never'
    ],
    // Enforce line breaks between arguments of a function call
    'function-call-argument-newline': [
        'off',
        'consistent'
    ],
    // Enforce consistent line breaks inside function parentheses
    'function-paren-newline': 'off',
    // Enforce consistent spacing around `*` operators in generator functions
    'generator-star-spacing': 'error',
    // Enforce the location of arrow function bodies
    'implicit-arrow-linebreak': 'off',
    // Enforce consistent indentation
    indent: 'off',
    // Enforce the consistent use of either double or single quotes in JSX attributes
    'jsx-quotes': 'error',
    // Enforce consistent spacing between keys and values in object literal properties
    'key-spacing': [
        'error',
        {
            beforeColon: false,
            afterColon: true
        }
    ],
    // Enforce consistent spacing before and after keywords
    'keyword-spacing': [
        'error',
        {
            before: true,
            after: true,
            overrides: {
                case: {
                    after: true
                },
                switch: {
                    after: false
                },
                catch: {
                    after: false
                }
            }
        }
    ],
    // Enforce position of line comments
    'line-comment-position': 'off',
    // Enforce consistent linebreak style
    'linebreak-style': 'off',
    // Require empty lines around comments
    // SR Would like this rule enabled in his repos like so: 'lines-around-comment': [ 'error', { beforeLineComment: true } ]
    // JO really likes having the ability to have comments right under code.
    // MK understands both thoughts.
    // We will likely never turn this on fully, but feel free to add to your project!
    'lines-around-comment': 'off',
    // Require or disallow an empty line between class members
    'lines-between-class-members': [
        'error',
        'always',
        {
            exceptAfterSingleLine: true
        }
    ],
    // Enforce a maximum line length
    'max-len': 'off',
    // Enforce a maximum number of statements allowed per line
    'max-statements-per-line': 'off',
    // Enforce newlines between operands of ternary expressions
    'multiline-ternary': 'off',
    // Enforce or disallow parentheses when invoking a constructor with no arguments
    'new-parens': 'error',
    // Require a newline after each call in a method chain
    'newline-per-chained-call': 'off',
    // Disallow unnecessary parentheses
    'no-extra-parens': 'off',
    // Disallow mixed spaces and tabs for indentation
    'no-mixed-spaces-and-tabs': 'error',
    // Disallow multiple spaces
    'no-multi-spaces': [
        'error',
        {
            ignoreEOLComments: true
        }
    ],
    // Disallow multiple empty lines
    // DUPLICATION ALERT, this is overridden for html files, see above "overrides"
    'no-multiple-empty-lines': [
        'error',
        {
            max: 2,
            maxBOF: 0,
            maxEOF: 1
        }
    ],
    // Disallow all tabs
    'no-tabs': 'error',
    // Disallow trailing whitespace at the end of lines
    'no-trailing-spaces': [
        'error',
        {
            skipBlankLines: true,
            ignoreComments: true
        }
    ],
    // Disallow whitespace before properties
    'no-whitespace-before-property': 'error',
    // Enforce the location of single-line statements
    'nonblock-statement-body-position': [
        'error',
        'beside',
        {
            overrides: {}
        }
    ],
    // Enforce consistent line breaks after opening and before closing braces
    'object-curly-newline': 'error',
    // Enforce consistent spacing inside braces
    'object-curly-spacing': [
        'error',
        'always'
    ],
    // Enforce placing object properties on separate lines
    'object-property-newline': 'off',
    // Enforce consistent linebreak style for operators
    'operator-linebreak': 'off',
    // Require or disallow padding within blocks
    'padded-blocks': 'off',
    // Require or disallow padding lines between statements
    'padding-line-between-statements': 'error',
    // Enforce the consistent use of either backticks, double, or single quotes
    quotes: [
        'error',
        'single'
    ],
    // Enforce spacing between rest and spread operators and their expressions
    'rest-spread-spacing': 'error',
    // Require or disallow semicolons instead of ASI
    semi: [
        'error',
        'always'
    ],
    // Enforce consistent spacing before and after semicolons
    'semi-spacing': [
        'error',
        {
            before: false,
            after: true
        }
    ],
    // Enforce location of semicolons
    'semi-style': [
        'error',
        'last'
    ],
    // Enforce consistent spacing before blocks
    'space-before-blocks': 'error',
    // Enforce consistent spacing before `function` definition opening parenthesis
    'space-before-function-paren': [
        'error',
        {
            anonymous: 'never',
            named: 'never',
            asyncArrow: 'always'
        }
    ],
    // Enforce consistent spacing inside parentheses
    'space-in-parens': [
        'error',
        'always'
    ],
    // Require spacing around infix operators
    'space-infix-ops': 'error',
    // Enforce consistent spacing before or after unary operators
    'space-unary-ops': [
        'error',
        {
            words: true,
            nonwords: false,
            overrides: {}
        }
    ],
    // Enforce spacing around colons of switch statements
    'switch-colon-spacing': [
        'error',
        {
            after: true,
            before: false
        }
    ],
    // Require or disallow spacing around embedded expressions of template strings
    'template-curly-spacing': 'error',
    // Require or disallow spacing between template tags and their literals
    'template-tag-spacing': [
        'error',
        'never'
    ],
    // Require or disallow Unicode byte order mark (BOM)
    'unicode-bom': [
        'error',
        'never'
    ],
    // Require parentheses around immediate `function` invocations
    'wrap-iife': 'off',
    // Require parenthesis around regex literals
    'wrap-regex': 'off',
    // Require or disallow spacing around the `*` in `yield*` expressions
    'yield-star-spacing': 'error',
    // disallow space between function identifier and application
    'no-spaced-func': 'error',
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Custom Rules
    //
    'phet/bad-text': 'error',
    // Custom rule for checking the copyright.
    'phet/copyright': 'error',
    // Custom rule for checking TO-DOs have issues
    'phet/todo-should-have-issue': 'error',
    // Custom rule for ensuring that images and text use scenery node
    'phet/no-html-constructors': 'error',
    // Custom rule for avoiding instanceof Array.
    'phet/no-instanceof-array': 'error',
    // Custom rule for keeping import statements on a single line.
    'phet/single-line-import': 'error',
    // method declarations must have a visibility annotation
    'phet/visibility-annotation': 'error',
    // key and value arguments to namespace.register() must match
    'phet/namespace-match': 'error',
    // never allow object shorthand for properties, functions are ok.
    'phet/phet-object-shorthand': 'error',
    // a default import variable name should be the same as the filename
    'phet/default-import-match-filename': 'error',
    // When the default export of a file is a class, it should have a namespace register call
    'phet/default-export-class-should-register-namespace': 'error',
    // Importing the view from the model, uh oh. TODO: This is still in discussion, numerous repos opt out, see: https://github.com/phetsims/chipper/issues/1385
    'phet/no-view-imported-from-model': 'error',
    // Class names should match filename when exported.
    'phet/default-export-match-filename': 'error',
    // Use DerivedStringProperty for its PhET-iO benefits and consistency, see https://github.com/phetsims/phet-io/issues/1943
    'phet/prefer-derived-string-property': 'error',
    // A variable or attribute name should generally match the tandem name.
    'phet/tandem-name-should-match': 'error',
    // Each source file should list at least one author
    'phet/author-annotation': 'error',
    // Importing a relative path should have an extension
    'phet/import-statement-extension': 'error',
    // Importing should prefer *.js to *.ts etc.
    'phet/import-statement-extension-js': 'error'
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvY29uZmlnL3V0aWwvcm9vdFJ1bGVzLm1qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGUgcnVsZXMgYXJlIG9yZ2FuaXplZCBsaWtlIHRoZXkgYXJlIGluIHRoZSBsaXN0IGF0IGh0dHBzOi8vZXNsaW50Lm9yZy9kb2NzL3J1bGVzL1xuICogRmlyc3QgYnkgdHlwZSwgdGhlbiBhbHBoYWJldGljYWxseSB3aXRoaW4gdHlwZVxuICogRXhwbGljaXRseSBsaXN0IGFsbCBydWxlcyBzbyBpdCBpcyBlYXN5IHRvIHNlZSB3aGF0J3MgaGVyZSBhbmQgdG8ga2VlcCBvcmdhbml6ZWRcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gUG9zc2libGUgUHJvYmxlbXNcbiAgLy8gVGhlc2UgcnVsZXMgcmVsYXRlIHRvIHBvc3NpYmxlIGxvZ2ljIGVycm9ycyBpbiBjb2RlOlxuXG4gIC8vIEVuZm9yY2UgcmV0dXJuIHN0YXRlbWVudHMgaW4gY2FsbGJhY2tzIG9mIGFycmF5IG1ldGhvZHNcbiAgJ2FycmF5LWNhbGxiYWNrLXJldHVybic6ICdlcnJvcicsXG5cbiAgLy8gUmVxdWlyZSBgc3VwZXIoKWAgY2FsbHMgaW4gY29uc3RydWN0b3JzXG4gICdjb25zdHJ1Y3Rvci1zdXBlcic6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSBcImZvclwiIGxvb3AgdXBkYXRlIGNsYXVzZSBtb3ZpbmcgdGhlIGNvdW50ZXIgaW4gdGhlIHJpZ2h0IGRpcmVjdGlvbi5cbiAgJ2Zvci1kaXJlY3Rpb24nOiAnZXJyb3InLFxuXG4gIC8vIEVuZm9yY2UgYHJldHVybmAgc3RhdGVtZW50cyBpbiBnZXR0ZXJzXG4gICdnZXR0ZXItcmV0dXJuJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB1c2luZyBhbiBhc3luYyBmdW5jdGlvbiBhcyBhIFByb21pc2UgZXhlY3V0b3JcbiAgJ25vLWFzeW5jLXByb21pc2UtZXhlY3V0b3InOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGBhd2FpdGAgaW5zaWRlIG9mIGxvb3BzXG4gICduby1hd2FpdC1pbi1sb29wJzogJ29mZicsIC8vIFdlIHVzZSBhd2FpdCBpbiBsb29wcyBhbGwgdGhlIHRpbWUgaW4gYnVpbGQgdG9vbHNcblxuICAvLyBEaXNhbGxvdyByZWFzc2lnbmluZyBjbGFzcyBtZW1iZXJzXG4gICduby1jbGFzcy1hc3NpZ24nOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGNvbXBhcmluZyBhZ2FpbnN0IC0wXG4gICduby1jb21wYXJlLW5lZy16ZXJvJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBhc3NpZ25tZW50IG9wZXJhdG9ycyBpbiBjb25kaXRpb25hbCBleHByZXNzaW9uc1xuICAnbm8tY29uZC1hc3NpZ24nOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHJlYXNzaWduaW5nIGBjb25zdGAgdmFyaWFibGVzXG4gICduby1jb25zdC1hc3NpZ24nOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGV4cHJlc3Npb25zIHdoZXJlIHRoZSBvcGVyYXRpb24gZG9lc24ndCBhZmZlY3QgdGhlIHZhbHVlXG4gICduby1jb25zdGFudC1iaW5hcnktZXhwcmVzc2lvbic6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgY29uc3RhbnQgZXhwcmVzc2lvbnMgaW4gY29uZGl0aW9uc1xuICAnbm8tY29uc3RhbnQtY29uZGl0aW9uJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyByZXR1cm5pbmcgdmFsdWUgZnJvbSBjb25zdHJ1Y3RvclxuICAnbm8tY29uc3RydWN0b3ItcmV0dXJuJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBjb250cm9sIGNoYXJhY3RlcnMgaW4gcmVndWxhciBleHByZXNzaW9uc1xuICAnbm8tY29udHJvbC1yZWdleCc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdGhlIHVzZSBvZiBgZGVidWdnZXJgXG4gICduby1kZWJ1Z2dlcic6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgZHVwbGljYXRlIGFyZ3VtZW50cyBpbiBgZnVuY3Rpb25gIGRlZmluaXRpb25zXG4gICduby1kdXBlLWFyZ3MnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGR1cGxpY2F0ZSBjbGFzcyBtZW1iZXJzXG4gICduby1kdXBlLWNsYXNzLW1lbWJlcnMnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGR1cGxpY2F0ZSBjb25kaXRpb25zIGluIGlmLWVsc2UtaWYgY2hhaW5zXG4gICduby1kdXBlLWVsc2UtaWYnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGR1cGxpY2F0ZSBrZXlzIGluIG9iamVjdCBsaXRlcmFsc1xuICAnbm8tZHVwZS1rZXlzJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBkdXBsaWNhdGUgY2FzZSBsYWJlbHNcbiAgJ25vLWR1cGxpY2F0ZS1jYXNlJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBkdXBsaWNhdGUgbW9kdWxlIGltcG9ydHNcbiAgJ25vLWR1cGxpY2F0ZS1pbXBvcnRzJzogJ29mZicsIC8vIFdlYlN0b3JtIHR5cGljYWxseSB0ZWxscyB1cyBpZiB3ZSBoYXZlIGR1cGxpY2F0ZSBpbXBvcnRzLCBhbmQgd2Ugc29tZXRpbWVzIGFkZCAyIGltcG9ydHMgZnJvbSBzY2VuZXJ5IGR1ZSB0byBpdHMgZXhwb3J0IHBhdHRlcm5cblxuICAvLyBEaXNhbGxvdyBlbXB0eSBjaGFyYWN0ZXIgY2xhc3NlcyBpbiByZWd1bGFyIGV4cHJlc3Npb25zXG4gICduby1lbXB0eS1jaGFyYWN0ZXItY2xhc3MnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGVtcHR5IGRlc3RydWN0dXJpbmcgcGF0dGVybnNcbiAgJ25vLWVtcHR5LXBhdHRlcm4nOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHJlYXNzaWduaW5nIGV4Y2VwdGlvbnMgaW4gYGNhdGNoYCBjbGF1c2VzXG4gICduby1leC1hc3NpZ24nOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGZhbGx0aHJvdWdoIG9mIGBjYXNlYCBzdGF0ZW1lbnRzXG4gICduby1mYWxsdGhyb3VnaCc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgcmVhc3NpZ25pbmcgYGZ1bmN0aW9uYCBkZWNsYXJhdGlvbnNcbiAgJ25vLWZ1bmMtYXNzaWduJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBhc3NpZ25pbmcgdG8gaW1wb3J0ZWQgYmluZGluZ3NcbiAgJ25vLWltcG9ydC1hc3NpZ24nOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHZhcmlhYmxlIG9yIGBmdW5jdGlvbmAgZGVjbGFyYXRpb25zIGluIG5lc3RlZCBibG9ja3NcbiAgJ25vLWlubmVyLWRlY2xhcmF0aW9ucyc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgaW52YWxpZCByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5ncyBpbiBgUmVnRXhwYCBjb25zdHJ1Y3RvcnNcbiAgJ25vLWludmFsaWQtcmVnZXhwJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBpcnJlZ3VsYXIgd2hpdGVzcGFjZVxuICAnbm8taXJyZWd1bGFyLXdoaXRlc3BhY2UnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGxpdGVyYWwgbnVtYmVycyB0aGF0IGxvc2UgcHJlY2lzaW9uXG4gICduby1sb3NzLW9mLXByZWNpc2lvbic6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgY2hhcmFjdGVycyB3aGljaCBhcmUgbWFkZSB3aXRoIG11bHRpcGxlIGNvZGUgcG9pbnRzIGluIGNoYXJhY3RlclxuICAvLyBjbGFzcyBzeW50YXhcbiAgJ25vLW1pc2xlYWRpbmctY2hhcmFjdGVyLWNsYXNzJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBgbmV3YCBvcGVyYXRvcnMgd2l0aCB0aGUgYFN5bWJvbGAgb2JqZWN0XG4gICduby1uZXctc3ltYm9sJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBjYWxsaW5nIGdsb2JhbCBvYmplY3QgcHJvcGVydGllcyBhcyBmdW5jdGlvbnNcbiAgJ25vLW9iai1jYWxscyc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgcmV0dXJuaW5nIHZhbHVlcyBmcm9tIFByb21pc2UgZXhlY3V0b3IgZnVuY3Rpb25zXG4gICduby1wcm9taXNlLWV4ZWN1dG9yLXJldHVybic6ICdvZmYnLCAvLyBXZSB0dXJuIHRoaXMgcnVsZSBvZmYgc28geW91IGNhbiB1c2UgYW4gYXJyb3cgZnVuY3Rpb24gYXMgYW4gZXhlY3V0b3JcblxuICAvLyBEaXNhbGxvdyBjYWxsaW5nIHNvbWUgYE9iamVjdC5wcm90b3R5cGVgIG1ldGhvZHMgZGlyZWN0bHkgb24gb2JqZWN0c1xuICAnbm8tcHJvdG90eXBlLWJ1aWx0aW5zJzogJ29mZicsIC8vIFdlIHByZWZlciBgZm9vLmhhc093blByb3BlcnR5KFwiYmFyXCIpO2AgdG8gYE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChmb28sIFwiYmFyXCIpO2BcblxuICAvLyBEaXNhbGxvdyBhc3NpZ25tZW50cyB3aGVyZSBib3RoIHNpZGVzIGFyZSBleGFjdGx5IHRoZSBzYW1lXG4gICduby1zZWxmLWFzc2lnbic6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgY29tcGFyaXNvbnMgd2hlcmUgYm90aCBzaWRlcyBhcmUgZXhhY3RseSB0aGUgc2FtZVxuICAnbm8tc2VsZi1jb21wYXJlJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyByZXR1cm5pbmcgdmFsdWVzIGZyb20gc2V0dGVyc1xuICAnbm8tc2V0dGVyLXJldHVybic6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgc3BhcnNlIGFycmF5c1xuICAnbm8tc3BhcnNlLWFycmF5cyc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdGVtcGxhdGUgbGl0ZXJhbCBwbGFjZWhvbGRlciBzeW50YXggaW4gcmVndWxhciBzdHJpbmdzXG4gICduby10ZW1wbGF0ZS1jdXJseS1pbi1zdHJpbmcnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGB0aGlzYC9gc3VwZXJgIGJlZm9yZSBjYWxsaW5nIGBzdXBlcigpYCBpbiBjb25zdHJ1Y3RvcnNcbiAgJ25vLXRoaXMtYmVmb3JlLXN1cGVyJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB0aGUgdXNlIG9mIHVuZGVjbGFyZWQgdmFyaWFibGVzIHVubGVzcyBtZW50aW9uZWQgaW4gYC8qZ2xvYmFsICovYCBjb21tZW50c1xuICAnbm8tdW5kZWYnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGNvbmZ1c2luZyBtdWx0aWxpbmUgZXhwcmVzc2lvbnNcbiAgJ25vLXVuZXhwZWN0ZWQtbXVsdGlsaW5lJzogJ2Vycm9yJywgLy8gQXZvaWQgY29kZSB0aGF0IGxvb2tzIGxpa2UgdHdvIGV4cHJlc3Npb25zIGJ1dCBpcyBhY3R1YWxseSBvbmVcblxuICAvLyBEaXNhbGxvdyB1bm1vZGlmaWVkIGxvb3AgY29uZGl0aW9uc1xuICAnbm8tdW5tb2RpZmllZC1sb29wLWNvbmRpdGlvbic6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdW5yZWFjaGFibGUgY29kZSBhZnRlciBgcmV0dXJuYCwgYHRocm93YCwgYGNvbnRpbnVlYCwgYW5kIGBicmVha2Agc3RhdGVtZW50c1xuICAnbm8tdW5yZWFjaGFibGUnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGxvb3BzIHdpdGggYSBib2R5IHRoYXQgYWxsb3dzIG9ubHkgb25lIGl0ZXJhdGlvblxuICAnbm8tdW5yZWFjaGFibGUtbG9vcCc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgY29udHJvbCBmbG93IHN0YXRlbWVudHMgaW4gYGZpbmFsbHlgIGJsb2Nrc1xuICAnbm8tdW5zYWZlLWZpbmFsbHknOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IG5lZ2F0aW5nIHRoZSBsZWZ0IG9wZXJhbmQgb2YgcmVsYXRpb25hbCBvcGVyYXRvcnNcbiAgJ25vLXVuc2FmZS1uZWdhdGlvbic6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdXNlIG9mIG9wdGlvbmFsIGNoYWluaW5nIGluIGNvbnRleHRzIHdoZXJlIHRoZSBgdW5kZWZpbmVkYCB2YWx1ZSBpcyBub3QgYWxsb3dlZFxuICAnbm8tdW5zYWZlLW9wdGlvbmFsLWNoYWluaW5nJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB1bnVzZWQgcHJpdmF0ZSBjbGFzcyBtZW1iZXJzXG4gICduby11bnVzZWQtcHJpdmF0ZS1jbGFzcy1tZW1iZXJzJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB1bnVzZWQgdmFyaWFibGVzXG4gICduby11bnVzZWQtdmFycyc6IFsgLy8gT3ZlcnJpZGRlbiB0byBhbGxvdyB1bnVzZWQgYXJnc1xuICAgICdlcnJvcicsXG4gICAge1xuICAgICAgdmFyczogJ2FsbCcsXG4gICAgICBhcmdzOiAnbm9uZScsXG4gICAgICBjYXVnaHRFcnJvcnM6ICdub25lJ1xuICAgIH1cbiAgXSxcblxuICAvLyBEaXNhbGxvdyB0aGUgdXNlIG9mIHZhcmlhYmxlcyBiZWZvcmUgdGhleSBhcmUgZGVmaW5lZFxuICAnbm8tdXNlLWJlZm9yZS1kZWZpbmUnOiAnb2ZmJywgLy8gV2Ugb2Z0ZW4gZGVjbGFyZSBhdXhpbGlhcnkgY2xhc3NlcyBhdCB0aGUgYm90dG9tIG9mIGEgZmlsZSwgd2hpY2ggYXJlIHVzZWQgaW4gdGhlIHByaW1hcnkgY2xhc3NcblxuICAvLyBEaXNhbGxvdyB1c2VsZXNzIGJhY2tyZWZlcmVuY2VzIGluIHJlZ3VsYXIgZXhwcmVzc2lvbnNcbiAgJ25vLXVzZWxlc3MtYmFja3JlZmVyZW5jZSc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgYXNzaWdubWVudHMgdGhhdCBjYW4gbGVhZCB0byByYWNlIGNvbmRpdGlvbnMgZHVlIHRvIHVzYWdlIG9mIGBhd2FpdGAgb3IgYHlpZWxkYFxuICAncmVxdWlyZS1hdG9taWMtdXBkYXRlcyc6ICdlcnJvcicsXG5cbiAgLy8gUmVxdWlyZSBjYWxscyB0byBgaXNOYU4oKWAgd2hlbiBjaGVja2luZyBmb3IgYE5hTmBcbiAgJ3VzZS1pc25hbic6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSBjb21wYXJpbmcgYHR5cGVvZmAgZXhwcmVzc2lvbnMgYWdhaW5zdCB2YWxpZCBzdHJpbmdzXG4gICd2YWxpZC10eXBlb2YnOiAnZXJyb3InLFxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gU3VnZ2VzdGlvbnNcbiAgLy8gVGhlc2UgcnVsZXMgc3VnZ2VzdCBhbHRlcm5hdGUgd2F5cyBvZiBkb2luZyB0aGluZ3M6XG5cbiAgLy8gRW5mb3JjZSBnZXR0ZXIgYW5kIHNldHRlciBwYWlycyBpbiBvYmplY3RzIGFuZCBjbGFzc2VzXG4gICdhY2Nlc3Nvci1wYWlycyc6ICdvZmYnLCAvLyBPbmx5IDE3IGZhaWxzLCBidXQgSSdtIG5vdCBzdXJlIHdlIG5lZWQgdGhpcy4gIFBlcmhhcHMgb25jZSBpdCBiaXRlcyB1cyB3ZSB3aWxsIGNoYW5nZSBvdXIgbWluZD9cblxuICAvLyBSZXF1aXJlIGJyYWNlcyBhcm91bmQgYXJyb3cgZnVuY3Rpb24gYm9kaWVzXG4gICdhcnJvdy1ib2R5LXN0eWxlJzogJ29mZicsIC8vIE9LIHRvIGhhdmUgYnJhY2VzIG9yIG5vdCBicmFjZXNcblxuICAvLyBFbmZvcmNlIHRoZSB1c2Ugb2YgdmFyaWFibGVzIHdpdGhpbiB0aGUgc2NvcGUgdGhleSBhcmUgZGVmaW5lZFxuICAnYmxvY2stc2NvcGVkLXZhcic6ICdvZmYnLCAvLyBXZSBoYXZlIHRvbyBtdWNoIG9sZCBjb2RlIHdpdGggdmFyIGkgYmVpbmcgdXNlZCBhY3Jvc3Mgc2V2ZXJhbCBsb29wcy5cblxuICAvLyBFbmZvcmNlIGNhbWVsY2FzZSBuYW1pbmcgY29udmVudGlvblxuICBjYW1lbGNhc2U6ICdvZmYnLCAvLyAzNTEyIG9jY3VycmVuY2VzIE1hcmNoIDIwMjFcblxuICAvLyBFbmZvcmNlIG9yIGRpc2FsbG93IGNhcGl0YWxpemF0aW9uIG9mIHRoZSBmaXJzdCBsZXR0ZXIgb2YgYSBjb21tZW50XG4gICdjYXBpdGFsaXplZC1jb21tZW50cyc6ICdvZmYnLFxuXG4gIC8vIEVuZm9yY2UgdGhhdCBjbGFzcyBtZXRob2RzIHV0aWxpemUgYHRoaXNgXG4gICdjbGFzcy1tZXRob2RzLXVzZS10aGlzJzogJ29mZicsIC8vIFdlIGhhdmUgbWFueSBvdmVycmlkZWFibGUgbWV0aG9kcyB0aGF0IGp1c3QgdGhyb3cgYW4gZXJyb3JcblxuICAvLyBFbmZvcmNlIGEgbWF4aW11bSBjeWNsb21hdGljIGNvbXBsZXhpdHkgYWxsb3dlZCBpbiBhIHByb2dyYW1cbiAgY29tcGxleGl0eTogJ29mZicsIC8vIFdlIGhhdmUgYXJvdW5kIDI0MiBvZmZlbmRlcnMgYXMgb2YgTWFyY2gsIDIwMjFcblxuICAvLyBSZXF1aXJlIGByZXR1cm5gIHN0YXRlbWVudHMgdG8gZWl0aGVyIGFsd2F5cyBvciBuZXZlciBzcGVjaWZ5IHZhbHVlc1xuICAnY29uc2lzdGVudC1yZXR1cm4nOiAnZXJyb3InLFxuXG4gIC8vIEVuZm9yY2UgY29uc2lzdGVudCBuYW1pbmcgd2hlbiBjYXB0dXJpbmcgdGhlIGN1cnJlbnQgZXhlY3V0aW9uIGNvbnRleHRcbiAgJ2NvbnNpc3RlbnQtdGhpcyc6IFsgJ2Vycm9yJywgJ3NlbGYnIF0sXG5cbiAgLy8gRW5mb3JjZSBjb25zaXN0ZW50IGJyYWNlIHN0eWxlIGZvciBhbGwgY29udHJvbCBzdGF0ZW1lbnRzXG4gIGN1cmx5OiAnZXJyb3InLFxuXG4gIC8vIFJlcXVpcmUgYGRlZmF1bHRgIGNhc2VzIGluIGBzd2l0Y2hgIHN0YXRlbWVudHNcbiAgJ2RlZmF1bHQtY2FzZSc6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSBkZWZhdWx0IGNsYXVzZXMgaW4gc3dpdGNoIHN0YXRlbWVudHMgdG8gYmUgbGFzdFxuICAnZGVmYXVsdC1jYXNlLWxhc3QnOiAnZXJyb3InLFxuXG4gIC8vIEVuZm9yY2UgZGVmYXVsdCBwYXJhbWV0ZXJzIHRvIGJlIGxhc3RcbiAgJ2RlZmF1bHQtcGFyYW0tbGFzdCc6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSBkb3Qgbm90YXRpb24gd2hlbmV2ZXIgcG9zc2libGVcbiAgJ2RvdC1ub3RhdGlvbic6ICdlcnJvcicsXG5cbiAgLy8gUmVxdWlyZSB0aGUgdXNlIG9mIGA9PT1gIGFuZCBgIT09YFxuICBlcWVxZXE6ICdlcnJvcicsXG5cbiAgLy8gUmVxdWlyZSBmdW5jdGlvbiBuYW1lcyB0byBtYXRjaCB0aGUgbmFtZSBvZiB0aGUgdmFyaWFibGUgb3IgcHJvcGVydHkgdG8gd2hpY2ggdGhleSBhcmUgYXNzaWduZWRcbiAgJ2Z1bmMtbmFtZS1tYXRjaGluZyc6IFsgJ2Vycm9yJywgJ2Fsd2F5cycsIHtcbiAgICBpbmNsdWRlQ29tbW9uSlNNb2R1bGVFeHBvcnRzOiBmYWxzZSxcbiAgICBjb25zaWRlclByb3BlcnR5RGVzY3JpcHRvcjogdHJ1ZVxuICB9IF0sXG5cbiAgLy8gUmVxdWlyZSBvciBkaXNhbGxvdyBuYW1lZCBgZnVuY3Rpb25gIGV4cHJlc3Npb25zXG4gICdmdW5jLW5hbWVzJzogJ29mZicsIC8vIHdlIHNvbWV0aW1lcyBuYW1lIG91ciBmdW5jdGlvbnMgZm9yIGRlYnVnZ2luZ1xuXG4gIC8vIEVuZm9yY2UgdGhlIGNvbnNpc3RlbnQgdXNlIG9mIGVpdGhlciBgZnVuY3Rpb25gIGRlY2xhcmF0aW9ucyBvciBleHByZXNzaW9uc1xuICAnZnVuYy1zdHlsZSc6ICdvZmYnLCAvLyAxMTc5IG9jY3VycmVuY2VzIG9uIE1hcmNoIDIwMjFcblxuICAvLyBSZXF1aXJlIGdyb3VwZWQgYWNjZXNzb3IgcGFpcnMgaW4gb2JqZWN0IGxpdGVyYWxzIGFuZCBjbGFzc2VzXG4gICdncm91cGVkLWFjY2Vzc29yLXBhaXJzJzogJ29mZicsIC8vIEluIHNjZW5lcnksIHdlIGdyb3VwIGFsbCB0aGUgZ2V0dGVycyB0b2dldGhlciwgdGhlbiB0aGUgc2V0dGVycyB0b2dldGhlclxuXG4gIC8vIFJlcXVpcmUgYGZvci1pbmAgbG9vcHMgdG8gaW5jbHVkZSBhbiBgaWZgIHN0YXRlbWVudFxuICAnZ3VhcmQtZm9yLWluJzogJ29mZicsIC8vIFRoaXMgaGFzbid0IGJpdCB1cyB5ZXRcblxuICAvLyBEaXNhbGxvdyBzcGVjaWZpZWQgaWRlbnRpZmllcnNcbiAgJ2lkLWRlbnlsaXN0JzogJ2Vycm9yJyxcblxuICAvLyBFbmZvcmNlIG1pbmltdW0gYW5kIG1heGltdW0gaWRlbnRpZmllciBsZW5ndGhzXG4gICdpZC1sZW5ndGgnOiAnb2ZmJyxcblxuICAvLyBSZXF1aXJlIGlkZW50aWZpZXJzIHRvIG1hdGNoIGEgc3BlY2lmaWVkIHJlZ3VsYXIgZXhwcmVzc2lvblxuICAnaWQtbWF0Y2gnOiAnZXJyb3InLFxuXG4gIC8vIFJlcXVpcmUgb3IgZGlzYWxsb3cgaW5pdGlhbGl6YXRpb24gaW4gdmFyaWFibGUgZGVjbGFyYXRpb25zXG4gICdpbml0LWRlY2xhcmF0aW9ucyc6ICdvZmYnLCAvLyAxMjg2IGZhaWx1cmVzIGFzIG9mIE1hcmNoIDIwMjFcblxuICAvLyBFbmZvcmNlIGEgbWF4aW11bSBudW1iZXIgb2YgY2xhc3NlcyBwZXIgZmlsZVxuICAnbWF4LWNsYXNzZXMtcGVyLWZpbGUnOiAnb2ZmJywgLy8gaGF2ZSBhcyBtYW55IGFzIHlvdSBuZWVkIVxuXG4gIC8vIEVuZm9yY2UgYSBtYXhpbXVtIGRlcHRoIHRoYXQgYmxvY2tzIGNhbiBiZSBuZXN0ZWRcbiAgJ21heC1kZXB0aCc6ICdvZmYnLCAvLyBHbyBmb3IgaXQhXG5cbiAgLy8gRW5mb3JjZSBhIG1heGltdW0gbnVtYmVyIG9mIGxpbmVzIHBlciBmaWxlXG4gICdtYXgtbGluZXMnOiAnb2ZmJywgLy8gR28gZm9yIGl0IVxuXG4gIC8vIEVuZm9yY2UgYSBtYXhpbXVtIG51bWJlciBvZiBsaW5lcyBvZiBjb2RlIGluIGEgZnVuY3Rpb25cbiAgJ21heC1saW5lcy1wZXItZnVuY3Rpb24nOiAnb2ZmJywgLy8gR28gZm9yIGl0IVxuXG4gIC8vIEVuZm9yY2UgYSBtYXhpbXVtIGRlcHRoIHRoYXQgY2FsbGJhY2tzIGNhbiBiZSBuZXN0ZWRcbiAgJ21heC1uZXN0ZWQtY2FsbGJhY2tzJzogJ2Vycm9yJyxcblxuICAvLyBFbmZvcmNlIGEgbWF4aW11bSBudW1iZXIgb2YgcGFyYW1ldGVycyBpbiBmdW5jdGlvbiBkZWZpbml0aW9uc1xuICAnbWF4LXBhcmFtcyc6ICdvZmYnLFxuXG4gIC8vIEVuZm9yY2UgYSBtYXhpbXVtIG51bWJlciBvZiBzdGF0ZW1lbnRzIGFsbG93ZWQgaW4gZnVuY3Rpb24gYmxvY2tzXG4gICdtYXgtc3RhdGVtZW50cyc6ICdvZmYnLFxuXG4gIC8vIEVuZm9yY2UgYSBwYXJ0aWN1bGFyIHN0eWxlIGZvciBtdWx0aWxpbmUgY29tbWVudHNcbiAgJ211bHRpbGluZS1jb21tZW50LXN0eWxlJzogJ29mZicsXG5cbiAgLy8gUmVxdWlyZSBjb25zdHJ1Y3RvciBuYW1lcyB0byBiZWdpbiB3aXRoIGEgY2FwaXRhbCBsZXR0ZXJcbiAgJ25ldy1jYXAnOiBbICdlcnJvcicsIHtcbiAgICBuZXdJc0NhcDogdHJ1ZSxcbiAgICBuZXdJc0NhcEV4Y2VwdGlvblBhdHRlcm46ICdeKG9wdGlvbnN8dGhpc3x3aW5kb3cpXFxcXC5cXFxcdysnLCAvLyBBbGxvdyBjb25zdHJ1Y3RvcnMgdG8gYmUgcGFzc2VkIHRocm91Z2ggb3B0aW9ucy5cbiAgICBuZXdJc0NhcEV4Y2VwdGlvbnM6IFsgJ3JzeW5jJywgJ2ppbXAnLCAnTWF0aC5zZWVkcmFuZG9tJyBdLFxuICAgIGNhcElzTmV3OiBmYWxzZSxcbiAgICBjYXBJc05ld0V4Y2VwdGlvbnM6IFsgJ0ltbXV0YWJsZS5NYXAnLCAnSW1tdXRhYmxlLlNldCcsICdJbW11dGFibGUuTGlzdCcgXVxuICB9IF0sXG5cbiAgLy8gRGlzYWxsb3cgdGhlIHVzZSBvZiBgYWxlcnRgLCBgY29uZmlybWAsIGFuZCBgcHJvbXB0YFxuICAnbm8tYWxlcnQnOiAnb2ZmJywgLy8gV2Ugc29tZXRpbWVzIHVzZSB0aGlzIHdoZW4gbmVjZXNzYXJ5XG5cbiAgLy8gRGlzYWxsb3cgYEFycmF5YCBjb25zdHJ1Y3RvcnNcbiAgJ25vLWFycmF5LWNvbnN0cnVjdG9yJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBiaXR3aXNlIG9wZXJhdG9yc1xuICAnbm8tYml0d2lzZSc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdGhlIHVzZSBvZiBgYXJndW1lbnRzLmNhbGxlcmAgb3IgYGFyZ3VtZW50cy5jYWxsZWVgXG4gICduby1jYWxsZXInOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGxleGljYWwgZGVjbGFyYXRpb25zIGluIGNhc2UgY2xhdXNlc1xuICAnbm8tY2FzZS1kZWNsYXJhdGlvbnMnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGFycm93IGZ1bmN0aW9ucyB3aGVyZSB0aGV5IGNvdWxkIGJlIGNvbmZ1c2VkIHdpdGggY29tcGFyaXNvbnNcbiAgJ25vLWNvbmZ1c2luZy1hcnJvdyc6ICdvZmYnLCAvLyAzMSBvY2N1cnJlbmNlcywgZGlkbid0IHNlZW0gdG9vIGJhZFxuXG4gIC8vIERpc2FsbG93IHRoZSB1c2Ugb2YgYGNvbnNvbGVgXG4gICduby1jb25zb2xlJzogJ29mZicsIC8vIFdlIGxpa2UgdG8gYmUgYWJsZSB0byBjb21taXQgY29uc29sZS5sb2dcblxuICAvLyBEaXNhbGxvdyBgY29udGludWVgIHN0YXRlbWVudHNcbiAgJ25vLWNvbnRpbnVlJzogJ29mZicsIC8vIDU3IGNvbnRpbnVlcyBhcyBvZiBNYXJjaCAyMDIxXG5cbiAgLy8gRGlzYWxsb3cgZGVsZXRpbmcgdmFyaWFibGVzXG4gICduby1kZWxldGUtdmFyJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBkaXZpc2lvbiBvcGVyYXRvcnMgZXhwbGljaXRseSBhdCB0aGUgYmVnaW5uaW5nIG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnNcbiAgJ25vLWRpdi1yZWdleCc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgYGVsc2VgIGJsb2NrcyBhZnRlciBgcmV0dXJuYCBzdGF0ZW1lbnRzIGluIGBpZmAgc3RhdGVtZW50c1xuICAnbm8tZWxzZS1yZXR1cm4nOiAnb2ZmJywgLy8gQWxsb3cgdGhlIGV4dHJhIGVsc2UgZm9yIHN5bW1ldHJ5XG5cbiAgLy8gRGlzYWxsb3cgZW1wdHkgYmxvY2sgc3RhdGVtZW50c1xuICAnbm8tZW1wdHknOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGVtcHR5IGZ1bmN0aW9uc1xuICAnbm8tZW1wdHktZnVuY3Rpb24nOiAnb2ZmJywgLy8gSXQgaXMgbmF0dXJhbCBhbmQgY29udmVuaWVudCB0byBzcGVjaWZ5IGVtcHR5IGZ1bmN0aW9ucyBpbnN0ZWFkIG9mIGhhdmluZyB0byBzaGFyZSBhIGxvZGFzaCBfLm5vb3BcblxuICAvLyBEaXNhbGxvdyBgbnVsbGAgY29tcGFyaXNvbnMgd2l0aG91dCB0eXBlLWNoZWNraW5nIG9wZXJhdG9yc1xuICAnbm8tZXEtbnVsbCc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdGhlIHVzZSBvZiBgZXZhbCgpYFxuICAnbm8tZXZhbCc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgZXh0ZW5kaW5nIG5hdGl2ZSB0eXBlc1xuICAnbm8tZXh0ZW5kLW5hdGl2ZSc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdW5uZWNlc3NhcnkgY2FsbHMgdG8gYC5iaW5kKClgXG4gICduby1leHRyYS1iaW5kJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB1bm5lY2Vzc2FyeSBib29sZWFuIGNhc3RzXG4gICduby1leHRyYS1ib29sZWFuLWNhc3QnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHVubmVjZXNzYXJ5IGxhYmVsc1xuICAnbm8tZXh0cmEtbGFiZWwnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHVubmVjZXNzYXJ5IHNlbWljb2xvbnNcbiAgJ25vLWV4dHJhLXNlbWknOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGxlYWRpbmcgb3IgdHJhaWxpbmcgZGVjaW1hbCBwb2ludHMgaW4gbnVtZXJpYyBsaXRlcmFsc1xuICAnbm8tZmxvYXRpbmctZGVjaW1hbCc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgYXNzaWdubWVudHMgdG8gbmF0aXZlIG9iamVjdHMgb3IgcmVhZC1vbmx5IGdsb2JhbCB2YXJpYWJsZXNcbiAgJ25vLWdsb2JhbC1hc3NpZ24nOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHNob3J0aGFuZCB0eXBlIGNvbnZlcnNpb25zXG4gICduby1pbXBsaWNpdC1jb2VyY2lvbic6ICdvZmYnLCAvLyBXZSBsaWtlIHVzaW5nICEhdmFsdWUgYW5kIG51bWJlcisnJy4gIE1heWJlIG9uZSBkYXkgd2Ugd2lsbCB0dXJuIHRoaXMgcnVsZSBvblxuXG4gIC8vIERpc2FsbG93IGRlY2xhcmF0aW9ucyBpbiB0aGUgZ2xvYmFsIHNjb3BlXG4gICduby1pbXBsaWNpdC1nbG9iYWxzJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB0aGUgdXNlIG9mIGBldmFsKClgLWxpa2UgbWV0aG9kc1xuICAnbm8taW1wbGllZC1ldmFsJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBpbmxpbmUgY29tbWVudHMgYWZ0ZXIgY29kZVxuICAnbm8taW5saW5lLWNvbW1lbnRzJzogJ29mZicsXG5cbiAgLy8gRGlzYWxsb3cgdXNlIG9mIGB0aGlzYCBpbiBjb250ZXh0cyB3aGVyZSB0aGUgdmFsdWUgb2YgYHRoaXNgIGlzIGB1bmRlZmluZWRgXG4gICduby1pbnZhbGlkLXRoaXMnOiAnb2ZmJywgLy8gV2UgaGF2ZSB0b28gbXVjaCBvbGQgY29kZSB0aGF0IHVzZXMgZnVuY3Rpb25zIHdpdGggdGhpcyAob3V0c2lkZSBvZiBjbGFzc2VzKVxuXG4gIC8vIERpc2FsbG93IHRoZSB1c2Ugb2YgdGhlIGBfX2l0ZXJhdG9yX19gIHByb3BlcnR5XG4gICduby1pdGVyYXRvcic6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgbGFiZWxzIHRoYXQgc2hhcmUgYSBuYW1lIHdpdGggYSB2YXJpYWJsZVxuICAnbm8tbGFiZWwtdmFyJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBsYWJlbGVkIHN0YXRlbWVudHNcbiAgJ25vLWxhYmVscyc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdW5uZWNlc3NhcnkgbmVzdGVkIGJsb2Nrc1xuICAnbm8tbG9uZS1ibG9ja3MnOiAnb2ZmJywgLy8gRXZlbiB0aG91Z2ggbG9uZSBibG9ja3MgYXJlIGN1cnJlbnRseSByYXJlIGZvciBvdXIgcHJvamVjdCwgd2UgYWdyZWUgdGhleSBhcmUgYXBwcm9wcmlhdGUgaW4gc29tZSBzaXR1YXRpb25zLiAgRGV0YWlscyBhcmUgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEwMjZcblxuICAvLyBEaXNhbGxvdyBgaWZgIHN0YXRlbWVudHMgYXMgdGhlIG9ubHkgc3RhdGVtZW50IGluIGBlbHNlYCBibG9ja3NcbiAgJ25vLWxvbmVseS1pZic6ICdvZmYnLCAvLyBTb21ldGltZXMgdGhpcyBzZWVtcyBtb3JlIHJlYWRhYmxlIG9yIHN5bW1ldHJpY1xuXG4gIC8vIERpc2FsbG93IGZ1bmN0aW9uIGRlY2xhcmF0aW9ucyB0aGF0IGNvbnRhaW4gdW5zYWZlIHJlZmVyZW5jZXMgaW5zaWRlIGxvb3Agc3RhdGVtZW50c1xuICAnbm8tbG9vcC1mdW5jJzogJ29mZicsIC8vIEl0IHNlZW1zIHdlIGFyZSBkZWFsaW5nIHdpdGggdGhpcyBzYWZlbHksIHdlIGhhdmUgMzggb2NjdXJyZW5jZXMgb24gTWFyY2ggMjAyMVxuXG4gIC8vIERpc2FsbG93IG1hZ2ljIG51bWJlcnNcbiAgJ25vLW1hZ2ljLW51bWJlcnMnOiAnb2ZmJywgLy8gV2UgaGF2ZSBtYW55IG1hZ2ljIG51bWJlcnNcblxuICAvLyBEaXNhbGxvdyBtaXhlZCBiaW5hcnkgb3BlcmF0b3JzXG4gICduby1taXhlZC1vcGVyYXRvcnMnOiAnb2ZmJywgIC8vIDMrMi80IHNob3VsZCBiZSBhbGxvd2VkXG5cbiAgLy8gRGlzYWxsb3cgdXNlIG9mIGNoYWluZWQgYXNzaWdubWVudCBleHByZXNzaW9uc1xuICAnbm8tbXVsdGktYXNzaWduJzogWyAnZXJyb3InLCB7IGlnbm9yZU5vbkRlY2xhcmF0aW9uOiB0cnVlIH0gXSxcblxuICAvLyBEaXNhbGxvdyBtdWx0aWxpbmUgc3RyaW5nc1xuICAnbm8tbXVsdGktc3RyJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBuZWdhdGVkIGNvbmRpdGlvbnNcbiAgJ25vLW5lZ2F0ZWQtY29uZGl0aW9uJzogJ29mZicsIC8vIHNvbWV0aW1lcyBhIG5lZ2F0ZWQgY29uZGl0aW9uIGlzIGNsZWFyZXJcblxuICAvLyBEaXNhbGxvdyBuZXN0ZWQgdGVybmFyeSBleHByZXNzaW9uc1xuICAnbm8tbmVzdGVkLXRlcm5hcnknOiAnb2ZmJywgLy8gR28gZm9yIGl0IVxuXG4gIC8vIERpc2FsbG93IGBuZXdgIG9wZXJhdG9ycyBvdXRzaWRlIG9mIGFzc2lnbm1lbnRzIG9yIGNvbXBhcmlzb25zXG4gICduby1uZXcnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGBuZXdgIG9wZXJhdG9ycyB3aXRoIHRoZSBgRnVuY3Rpb25gIG9iamVjdFxuICAnbm8tbmV3LWZ1bmMnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGBPYmplY3RgIGNvbnN0cnVjdG9yc1xuICAnbm8tbmV3LW9iamVjdCc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgYG5ld2Agb3BlcmF0b3JzIHdpdGggdGhlIGBTdHJpbmdgLCBgTnVtYmVyYCwgYW5kIGBCb29sZWFuYCBvYmplY3RzXG4gICduby1uZXctd3JhcHBlcnMnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGBcXDhgIGFuZCBgXFw5YCBlc2NhcGUgc2VxdWVuY2VzIGluIHN0cmluZyBsaXRlcmFsc1xuICAnbm8tbm9ub2N0YWwtZGVjaW1hbC1lc2NhcGUnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IG9jdGFsIGxpdGVyYWxzXG4gICduby1vY3RhbCc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgb2N0YWwgZXNjYXBlIHNlcXVlbmNlcyBpbiBzdHJpbmcgbGl0ZXJhbHNcbiAgJ25vLW9jdGFsLWVzY2FwZSc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgcmVhc3NpZ25pbmcgYGZ1bmN0aW9uYCBwYXJhbWV0ZXJzXG4gICduby1wYXJhbS1yZWFzc2lnbic6ICdvZmYnLCAvLyBXZSByZWFzc2lnbiBvcHRpb25zIGZyZXF1ZW50bHlcblxuICAvLyBEaXNhbGxvdyB0aGUgdW5hcnkgb3BlcmF0b3JzIGArK2AgYW5kIGAtLWBcbiAgJ25vLXBsdXNwbHVzJzogJ29mZicsXG5cbiAgLy8gRGlzYWxsb3cgdGhlIHVzZSBvZiB0aGUgYF9fcHJvdG9fX2AgcHJvcGVydHlcbiAgJ25vLXByb3RvJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB2YXJpYWJsZSByZWRlY2xhcmF0aW9uXG4gICduby1yZWRlY2xhcmUnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IG11bHRpcGxlIHNwYWNlcyBpbiByZWd1bGFyIGV4cHJlc3Npb25zXG4gICduby1yZWdleC1zcGFjZXMnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHNwZWNpZmllZCBuYW1lcyBpbiBleHBvcnRzXG4gICduby1yZXN0cmljdGVkLWV4cG9ydHMnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHNwZWNpZmllZCBnbG9iYWwgdmFyaWFibGVzXG4gICduby1yZXN0cmljdGVkLWdsb2JhbHMnOiAnZXJyb3InLFxuXG4gIC8vIC8vIERpc2FsbG93IHNwZWNpZmllZCBtb2R1bGVzIHdoZW4gbG9hZGVkIGJ5IGBpbXBvcnRgLCBjb21tZW50ZWQgb3V0IHVudGlsIHRoZXJlIGFyZSBpbXBvcnRzIHRvIHJlc3RyaWN0IGV2ZXJ5d2hlcmUuXG4gIC8vIE5PVEUhIFRoZXJlIGlzIGFscmVhZHkgYSB1c2FnZSBvZiB0aGlzIGZvciBub2RlIGNvbmZpZ3VyYXRpb24uIEJlIGNhcmVmdWwgYWJvdXQgaG93IHRoaXMgb3ZlcnJpZGVzLlxuICAvLyAnbm8tcmVzdHJpY3RlZC1pbXBvcnRzJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBjZXJ0YWluIHByb3BlcnRpZXMgb24gY2VydGFpbiBvYmplY3RzXG4gICduby1yZXN0cmljdGVkLXByb3BlcnRpZXMnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHNwZWNpZmllZCBzeW50YXhcbiAgJ25vLXJlc3RyaWN0ZWQtc3ludGF4JzogW1xuICAgICdvZmYnLFxuXG4gICAgeyAvLyBXZSBhbGxvdyBmb3IuLi5pbiBsb29wcyBhdCBkZXYgZGlzY3JldGlvbi5cbiAgICAgIHNlbGVjdG9yOiAnRm9ySW5TdGF0ZW1lbnQnLFxuICAgICAgbWVzc2FnZTogJ2Zvci4uaW4gbG9vcHMgaXRlcmF0ZSBvdmVyIHRoZSBlbnRpcmUgcHJvdG90eXBlIGNoYWluLCB3aGljaCBpcyB2aXJ0dWFsbHkgbmV2ZXIgd2hhdCB5b3Ugd2FudC4gVXNlIE9iamVjdC57a2V5cyx2YWx1ZXMsZW50cmllc30sIGFuZCBpdGVyYXRlIG92ZXIgdGhlIHJlc3VsdGluZyBhcnJheS4nXG4gICAgfSxcbiAgICB7IC8vIFdlIGFsbG93IGZvci4uLm9mIGxvb3BzIGF0IGRldiBkaXNjcmV0aW9uLlxuICAgICAgc2VsZWN0b3I6ICdGb3JPZlN0YXRlbWVudCcsXG4gICAgICBtZXNzYWdlOiAnaXRlcmF0b3JzL2dlbmVyYXRvcnMgcmVxdWlyZSByZWdlbmVyYXRvci1ydW50aW1lLCB3aGljaCBpcyB0b28gaGVhdnl3ZWlnaHQgZm9yIHRoaXMgZ3VpZGUgdG8gYWxsb3cgdGhlbS4gU2VwYXJhdGVseSwgbG9vcHMgc2hvdWxkIGJlIGF2b2lkZWQgaW4gZmF2b3Igb2YgYXJyYXkgaXRlcmF0aW9ucy4nXG4gICAgfSxcbiAgICB7IC8vIER1cGxpY2F0ZSBvZiB0aGUgbm8tbGFiZWxzIHJ1bGVcbiAgICAgIHNlbGVjdG9yOiAnTGFiZWxlZFN0YXRlbWVudCcsXG4gICAgICBtZXNzYWdlOiAnTGFiZWxzIGFyZSBhIGZvcm0gb2YgR09UTzsgdXNpbmcgdGhlbSBtYWtlcyBjb2RlIGNvbmZ1c2luZyBhbmQgaGFyZCB0byBtYWludGFpbiBhbmQgdW5kZXJzdGFuZC4nXG4gICAgfSxcbiAgICB7IC8vIER1cGxpY2F0ZSBvZiBuby13aXRoIHJ1bGVcbiAgICAgIHNlbGVjdG9yOiAnV2l0aFN0YXRlbWVudCcsXG4gICAgICBtZXNzYWdlOiAnYHdpdGhgIGlzIGRpc2FsbG93ZWQgaW4gc3RyaWN0IG1vZGUgYmVjYXVzZSBpdCBtYWtlcyBjb2RlIGltcG9zc2libGUgdG8gcHJlZGljdCBhbmQgb3B0aW1pemUuJ1xuICAgIH1cbiAgXSxcblxuICAvLyBEaXNhbGxvdyBhc3NpZ25tZW50IG9wZXJhdG9ycyBpbiBgcmV0dXJuYCBzdGF0ZW1lbnRzXG4gICduby1yZXR1cm4tYXNzaWduJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB1bm5lY2Vzc2FyeSBgcmV0dXJuIGF3YWl0YFxuICAnbm8tcmV0dXJuLWF3YWl0JzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBgamF2YXNjcmlwdDpgIHVybHNcbiAgJ25vLXNjcmlwdC11cmwnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGNvbW1hIG9wZXJhdG9yc1xuICAnbm8tc2VxdWVuY2VzJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB2YXJpYWJsZSBkZWNsYXJhdGlvbnMgZnJvbSBzaGFkb3dpbmcgdmFyaWFibGVzIGRlY2xhcmVkIGluIHRoZSBvdXRlciBzY29wZVxuICAnbm8tc2hhZG93JzogJ29mZicsIC8vIFdlIGhhdmUgNDYyIHNoYWRvd3MgYXMgb2YgTWFyY2gsIDIwMjFcblxuICAvLyBEaXNhbGxvdyBpZGVudGlmaWVycyBmcm9tIHNoYWRvd2luZyByZXN0cmljdGVkIG5hbWVzXG4gICduby1zaGFkb3ctcmVzdHJpY3RlZC1uYW1lcyc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdGVybmFyeSBvcGVyYXRvcnNcbiAgJ25vLXRlcm5hcnknOiAnb2ZmJywgLy8gUGhFVCBsb3ZlcyB0aGUgdGVybmFyeVxuXG4gIC8vIERpc2FsbG93IHRocm93aW5nIGxpdGVyYWxzIGFzIGV4Y2VwdGlvbnNcbiAgJ25vLXRocm93LWxpdGVyYWwnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGluaXRpYWxpemluZyB2YXJpYWJsZXMgdG8gYHVuZGVmaW5lZGBcbiAgJ25vLXVuZGVmLWluaXQnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHRoZSB1c2Ugb2YgYHVuZGVmaW5lZGAgYXMgYW4gaWRlbnRpZmllclxuICAnbm8tdW5kZWZpbmVkJzogJ29mZicsIC8vIDYwOCBmYWlscyBhcyBvZiBNYXJjaCAyMDIxXG5cbiAgLy8gRGlzYWxsb3cgZGFuZ2xpbmcgdW5kZXJzY29yZXMgaW4gaWRlbnRpZmllcnNcbiAgJ25vLXVuZGVyc2NvcmUtZGFuZ2xlJzogJ29mZicsIC8vIFdlIG9mdGVuIHVzZSB0aGlzIGZvciBwcml2YXRlIHZhcmlhYmxlc1xuXG4gIC8vIERpc2FsbG93IHRlcm5hcnkgb3BlcmF0b3JzIHdoZW4gc2ltcGxlciBhbHRlcm5hdGl2ZXMgZXhpc3RcbiAgJ25vLXVubmVlZGVkLXRlcm5hcnknOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHVudXNlZCBleHByZXNzaW9uc1xuICAnbm8tdW51c2VkLWV4cHJlc3Npb25zJzogJ29mZicsIC8vIFRoaXMgYmxvY2tzIHRoaW5ncyBsaWtlIGNpcmN1aXROb2RlICYmIGNpcmN1aXROb2RlLmNpcmN1aXQuY2lyY3VpdENoYW5nZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB1cGRhdGVUZXh0ICk7XG5cbiAgLy8gRGlzYWxsb3cgdW51c2VkIGxhYmVsc1xuICAnbm8tdW51c2VkLWxhYmVscyc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdW5uZWNlc3NhcnkgY2FsbHMgdG8gYC5jYWxsKClgIGFuZCBgLmFwcGx5KClgXG4gICduby11c2VsZXNzLWNhbGwnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHVubmVjZXNzYXJ5IGBjYXRjaGAgY2xhdXNlc1xuICAnbm8tdXNlbGVzcy1jYXRjaCc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdW5uZWNlc3NhcnkgY29tcHV0ZWQgcHJvcGVydHkga2V5cyBpbiBvYmplY3RzIGFuZCBjbGFzc2VzXG4gICduby11c2VsZXNzLWNvbXB1dGVkLWtleSc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdW5uZWNlc3NhcnkgY29uY2F0ZW5hdGlvbiBvZiBsaXRlcmFscyBvciB0ZW1wbGF0ZSBsaXRlcmFsc1xuICAnbm8tdXNlbGVzcy1jb25jYXQnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHVubmVjZXNzYXJ5IGNvbnN0cnVjdG9yc1xuICAnbm8tdXNlbGVzcy1jb25zdHJ1Y3Rvcic6ICdvZmYnLCAvLyBXZSBkZXRlcm1pbmVkIHRoZSB1c2VsZXNzIGNvbnN0cnVjdG9ycyBhcmUgZ29vZCBmb3IgZG9jdW1lbnRhdGlvbiBhbmQgY2xhcml0eS5cblxuICAvLyBEaXNhbGxvdyB1bm5lY2Vzc2FyeSBlc2NhcGUgY2hhcmFjdGVyc1xuICAnbm8tdXNlbGVzcy1lc2NhcGUnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHJlbmFtaW5nIGltcG9ydCwgZXhwb3J0LCBhbmQgZGVzdHJ1Y3R1cmVkIGFzc2lnbm1lbnRzIHRvIHRoZSBzYW1lIG5hbWVcbiAgJ25vLXVzZWxlc3MtcmVuYW1lJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyByZWR1bmRhbnQgcmV0dXJuIHN0YXRlbWVudHNcbiAgJ25vLXVzZWxlc3MtcmV0dXJuJzogJ2Vycm9yJyxcblxuICAvLyBSZXF1aXJlIGBsZXRgIG9yIGBjb25zdGAgaW5zdGVhZCBvZiBgdmFyYFxuICAnbm8tdmFyJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBgdm9pZGAgb3BlcmF0b3JzXG4gICduby12b2lkJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBzcGVjaWZpZWQgd2FybmluZyB0ZXJtcyBpbiBjb21tZW50c1xuICAnbm8td2FybmluZy1jb21tZW50cyc6ICdvZmYnLCAvLyBXZSBkb24ndCB3YW50IFRPLURPcyB0byBiZSBsaW50IGVycm9yc1xuXG4gIC8vIERpc2FsbG93IGB3aXRoYCBzdGF0ZW1lbnRzXG4gICduby13aXRoJzogJ2Vycm9yJyxcblxuICAvLyBSZXF1aXJlIG9yIGRpc2FsbG93IG1ldGhvZCBhbmQgcHJvcGVydHkgc2hvcnRoYW5kIHN5bnRheCBmb3Igb2JqZWN0IGxpdGVyYWxzXG4gICdvYmplY3Qtc2hvcnRoYW5kJzogWyAnb2ZmJywgJ25ldmVyJyBdLCAvLyBQaEVUIGhhcyBhIHJ1bGUgcGhldC1vYmplY3Qtc2hvcnRoYW5kIHRoYXQgZGV0ZWN0cyB0aGlzIGluIG9iamVjdCBsaXRlcmFsc1xuXG4gIC8vIEVuZm9yY2UgdmFyaWFibGVzIHRvIGJlIGRlY2xhcmVkIGVpdGhlciB0b2dldGhlciBvciBzZXBhcmF0ZWx5IGluIGZ1bmN0aW9uc1xuICAnb25lLXZhcic6IFsgJ2Vycm9yJywgJ25ldmVyJyBdLCAvLyBTZWUgIzM5MFxuXG4gIC8vIFJlcXVpcmUgb3IgZGlzYWxsb3cgbmV3bGluZXMgYXJvdW5kIHZhcmlhYmxlIGRlY2xhcmF0aW9uc1xuICAnb25lLXZhci1kZWNsYXJhdGlvbi1wZXItbGluZSc6IFsgJ2Vycm9yJywgJ2Fsd2F5cycgXSxcblxuICAvLyBSZXF1aXJlIG9yIGRpc2FsbG93IGFzc2lnbm1lbnQgb3BlcmF0b3Igc2hvcnRoYW5kIHdoZXJlIHBvc3NpYmxlXG4gICdvcGVyYXRvci1hc3NpZ25tZW50JzogJ29mZicsIC8vIE9wZXJhdG9yIGFzc2lnbm1lbnQgY2FuIG9mdGVuIGJlIGhhcmRlciB0byByZWFkXG5cbiAgLy8gUmVxdWlyZSB1c2luZyBhcnJvdyBmdW5jdGlvbnMgZm9yIGNhbGxiYWNrc1xuICAncHJlZmVyLWFycm93LWNhbGxiYWNrJzogJ2Vycm9yJyxcblxuICAvLyBSZXF1aXJlIGBjb25zdGAgZGVjbGFyYXRpb25zIGZvciB2YXJpYWJsZXMgdGhhdCBhcmUgbmV2ZXIgcmVhc3NpZ25lZCBhZnRlciBkZWNsYXJlZFxuICAncHJlZmVyLWNvbnN0JzogWyAvLyBlcnJvciB3aGVuIGxldCBpcyB1c2VkIGJ1dCB0aGUgdmFyaWFibGUgaXMgbmV2ZXIgcmVhc3NpZ25lZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YXNrcy9pc3N1ZXMvOTczXG4gICAgJ2Vycm9yJyxcbiAgICB7XG4gICAgICBkZXN0cnVjdHVyaW5nOiAnYW55JyxcbiAgICAgIGlnbm9yZVJlYWRCZWZvcmVBc3NpZ246IGZhbHNlXG4gICAgfVxuICBdLFxuXG4gIC8vIFJlcXVpcmUgZGVzdHJ1Y3R1cmluZyBmcm9tIGFycmF5cyBhbmQvb3Igb2JqZWN0c1xuICAncHJlZmVyLWRlc3RydWN0dXJpbmcnOiAnb2ZmJywgLy8gY29uc3Qge0NVUlZFX1hfUkFOR0V9ID0gQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzOyBzZWVtcyB3b3JzZSB0aGFuIGNvbnN0IENVUlZFX1hfUkFOR0UgPSBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuQ1VSVkVfWF9SQU5HRTtcblxuICAvLyBEaXNhbGxvdyB0aGUgdXNlIG9mIGBNYXRoLnBvd2AgaW4gZmF2b3Igb2YgdGhlIGAqKmAgb3BlcmF0b3JcbiAgJ3ByZWZlci1leHBvbmVudGlhdGlvbi1vcGVyYXRvcic6ICdvZmYnLCAvLyBNYXRoLnBvdygpIHNlZW1zIHZlcnkgY2xlYXIuXG5cbiAgLy8gRW5mb3JjZSB1c2luZyBuYW1lZCBjYXB0dXJlIGdyb3VwIGluIHJlZ3VsYXIgZXhwcmVzc2lvblxuICAncHJlZmVyLW5hbWVkLWNhcHR1cmUtZ3JvdXAnOiAnb2ZmJywgLy8gV2UgaGF2ZSBtYW55IG9jY3VycmVuY2VzIGluIHlvdHRhL2pzL2FwYWNoZVBhcnNpbmcuanNcblxuICAvLyBEaXNhbGxvdyBgcGFyc2VJbnQoKWAgYW5kIGBOdW1iZXIucGFyc2VJbnQoKWAgaW4gZmF2b3Igb2YgYmluYXJ5LCBvY3RhbCwgYW5kIGhleGFkZWNpbWFsIGxpdGVyYWxzXG4gICdwcmVmZXItbnVtZXJpYy1saXRlcmFscyc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdXNlIG9mIGBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoKWAgYW5kIHByZWZlciB1c2Ugb2YgYE9iamVjdC5oYXNPd24oKWBcbiAgJ3ByZWZlci1vYmplY3QtaGFzLW93bic6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdXNpbmcgT2JqZWN0LmFzc2lnbiB3aXRoIGFuIG9iamVjdCBsaXRlcmFsIGFzIHRoZSBmaXJzdCBhcmd1bWVudCBhbmQgcHJlZmVyIHRoZSB1c2Ugb2Ygb2JqZWN0IHNwcmVhZCBpbnN0ZWFkLlxuICAncHJlZmVyLW9iamVjdC1zcHJlYWQnOiAnb2ZmJywgLy8gVGhlIGZpeCBmb3IgdGhpcyBzYXlzIFwidW5leHBlY3RlZCB0b2tlblwiLCBzbyBsZXQncyBnbyB3aXRob3V0IGl0LlxuXG4gIC8vIFJlcXVpcmUgdXNpbmcgRXJyb3Igb2JqZWN0cyBhcyBQcm9taXNlIHJlamVjdGlvbiByZWFzb25zXG4gICdwcmVmZXItcHJvbWlzZS1yZWplY3QtZXJyb3JzJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB1c2Ugb2YgdGhlIGBSZWdFeHBgIGNvbnN0cnVjdG9yIGluIGZhdm9yIG9mIHJlZ3VsYXIgZXhwcmVzc2lvbiBsaXRlcmFsc1xuICAncHJlZmVyLXJlZ2V4LWxpdGVyYWxzJzogJ29mZicsIC8vIG5ldyBSZWdFeHAoKSBsb29rcyBuYXR1cmFsIHRvIG1lXG5cbiAgLy8gUmVxdWlyZSByZXN0IHBhcmFtZXRlcnMgaW5zdGVhZCBvZiBgYXJndW1lbnRzYFxuICAncHJlZmVyLXJlc3QtcGFyYW1zJzogJ2Vycm9yJyxcblxuICAvLyBSZXF1aXJlIHNwcmVhZCBvcGVyYXRvcnMgaW5zdGVhZCBvZiBgLmFwcGx5KClgXG4gICdwcmVmZXItc3ByZWFkJzogJ2Vycm9yJyxcblxuICAvLyBSZXF1aXJlIHRlbXBsYXRlIGxpdGVyYWxzIGluc3RlYWQgb2Ygc3RyaW5nIGNvbmNhdGVuYXRpb25cbiAgJ3ByZWZlci10ZW1wbGF0ZSc6ICdvZmYnLCAvLyBXZSBkZWNpZGVkIGl0IGlzIGNvbnZlbmllbnQgdG8gc29tZXRpbWVzIHVzZSBzdHJpbmcgY29uY2F0ZW5hdGlvbiwgc2VlIGRpc2N1c3Npb24gaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEwMjdcblxuICAvLyByZXF1aXJlIHF1b3RlcyBhcm91bmQgb2JqZWN0IGxpdGVyYWwgcHJvcGVydHkgbmFtZXNcbiAgJ3F1b3RlLXByb3BzJzogWyAnZXJyb3InLCAnYXMtbmVlZGVkJywgeyBrZXl3b3JkczogZmFsc2UsIHVubmVjZXNzYXJ5OiB0cnVlLCBudW1iZXJzOiBmYWxzZSB9IF0sXG5cbiAgLy8gRW5mb3JjZSB0aGUgY29uc2lzdGVudCB1c2Ugb2YgdGhlIHJhZGl4IGFyZ3VtZW50IHdoZW4gdXNpbmcgYHBhcnNlSW50KClgXG4gIHJhZGl4OiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGFzeW5jIGZ1bmN0aW9ucyB3aGljaCBoYXZlIG5vIGBhd2FpdGAgZXhwcmVzc2lvblxuICAncmVxdWlyZS1hd2FpdCc6ICdvZmYnLCAvLyA1OSBlcnJvcnMgYXMgb2YgNy8yMSwgYnV0IHdlIHdpbGwga2VlcCBvZmYsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTAyOFxuXG4gIC8vIEVuZm9yY2UgdGhlIHVzZSBvZiBgdWAgZmxhZyBvbiBSZWdFeHBcbiAgJ3JlcXVpcmUtdW5pY29kZS1yZWdleHAnOiAnb2ZmJywgLy8gVE9ETzogRGlzY3VzczogMjcyIGZhaWxzIG9yIHNvLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTAyOSBpcyB0aGVyZSBhIGdvb2QgcmVhc29uIGZvciB0aGlzIHJ1bGU/XG5cbiAgLy8gUmVxdWlyZSBnZW5lcmF0b3IgZnVuY3Rpb25zIHRvIGNvbnRhaW4gYHlpZWxkYFxuICAncmVxdWlyZS15aWVsZCc6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSBzb3J0ZWQgaW1wb3J0IGRlY2xhcmF0aW9ucyB3aXRoaW4gbW9kdWxlc1xuICAnc29ydC1pbXBvcnRzJzogJ29mZicsIC8vIFdlYnN0b3JtIGFuZCBFU0xpbnQgc29ydGluZyBydWxlcyBkb24ndCBhbGlnblxuXG4gIC8vIFJlcXVpcmUgb2JqZWN0IGtleXMgdG8gYmUgc29ydGVkXG4gICdzb3J0LWtleXMnOiAnb2ZmJyxcblxuICAvLyBSZXF1aXJlIHZhcmlhYmxlcyB3aXRoaW4gdGhlIHNhbWUgZGVjbGFyYXRpb24gYmxvY2sgdG8gYmUgc29ydGVkXG4gICdzb3J0LXZhcnMnOiAnb2ZmJyxcblxuICAvLyBFbmZvcmNlIGNvbnNpc3RlbnQgc3BhY2luZyBhZnRlciB0aGUgYC8vYCBvciBgLypgIGluIGEgY29tbWVudFxuICAnc3BhY2VkLWNvbW1lbnQnOiAnb2ZmJyxcblxuICAvLyBSZXF1aXJlIG9yIGRpc2FsbG93IHN0cmljdCBtb2RlIGRpcmVjdGl2ZXNcbiAgc3RyaWN0OiAnZXJyb3InLFxuXG4gIC8vIFJlcXVpcmUgc3ltYm9sIGRlc2NyaXB0aW9uc1xuICAnc3ltYm9sLWRlc2NyaXB0aW9uJzogJ2Vycm9yJyxcblxuICAvLyBSZXF1aXJlIGB2YXJgIGRlY2xhcmF0aW9ucyBiZSBwbGFjZWQgYXQgdGhlIHRvcCBvZiB0aGVpciBjb250YWluaW5nIHNjb3BlXG4gICd2YXJzLW9uLXRvcCc6ICdvZmYnLFxuXG4gIC8vIFJlcXVpcmUgb3IgZGlzYWxsb3cgXCJZb2RhXCIgY29uZGl0aW9uc1xuICB5b2RhOiAnZXJyb3InLFxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBUaGVzZSBydWxlcyBjYXJlIGFib3V0IGhvdyB0aGUgY29kZSBsb29rcyByYXRoZXIgdGhhbiBob3cgaXQgZXhlY3V0ZXM6XG4gIC8vIExheW91dCAmIEZvcm1hdHRpbmdcblxuICAvLyBFbmZvcmNlIGxpbmVicmVha3MgYWZ0ZXIgb3BlbmluZyBhbmQgYmVmb3JlIGNsb3NpbmcgYXJyYXkgYnJhY2tldHNcbiAgJ2FycmF5LWJyYWNrZXQtbmV3bGluZSc6ICdvZmYnLFxuXG4gIC8vIEVuZm9yY2UgY29uc2lzdGVudCBzcGFjaW5nIGluc2lkZSBhcnJheSBicmFja2V0c1xuICAnYXJyYXktYnJhY2tldC1zcGFjaW5nJzogWyAnZXJyb3InLCAnYWx3YXlzJyBdLFxuXG4gIC8vIEVuZm9yY2UgbGluZSBicmVha3MgYWZ0ZXIgZWFjaCBhcnJheSBlbGVtZW50XG4gICdhcnJheS1lbGVtZW50LW5ld2xpbmUnOiAnb2ZmJyxcblxuICAvLyBSZXF1aXJlIHBhcmVudGhlc2VzIGFyb3VuZCBhcnJvdyBmdW5jdGlvbiBhcmd1bWVudHNcbiAgJ2Fycm93LXBhcmVucyc6IFsgJ2Vycm9yJywgJ2FzLW5lZWRlZCcgXSxcblxuICAvLyBFbmZvcmNlIGNvbnNpc3RlbnQgc3BhY2luZyBiZWZvcmUgYW5kIGFmdGVyIHRoZSBhcnJvdyBpbiBhcnJvdyBmdW5jdGlvbnNcbiAgJ2Fycm93LXNwYWNpbmcnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IG9yIGVuZm9yY2Ugc3BhY2VzIGluc2lkZSBvZiBibG9ja3MgYWZ0ZXIgb3BlbmluZyBibG9jayBhbmQgYmVmb3JlIGNsb3NpbmcgYmxvY2tcbiAgJ2Jsb2NrLXNwYWNpbmcnOiAnb2ZmJywgLy8gT3VyIGNvZGUgc3R5bGUgc3VwcG9ydHMgZS5nLiw6IGlmICggIWlzRmluaXRlKCBuZXdTdGF0ZS5nZXRUb3RhbEVuZXJneSgpICkgKSB7IHRocm93IG5ldyBFcnJvciggJ25vdCBmaW5pdGUnICk7fVxuXG4gIC8vIEVuZm9yY2UgY29uc2lzdGVudCBicmFjZSBzdHlsZSBmb3IgYmxvY2tzXG4gICdicmFjZS1zdHlsZSc6IFsgJ2Vycm9yJywgJ3N0cm91c3RydXAnLCB7IGFsbG93U2luZ2xlTGluZTogdHJ1ZSB9IF0sXG5cbiAgLy8gUmVxdWlyZSBvciBkaXNhbGxvdyB0cmFpbGluZyBjb21tYXNcbiAgJ2NvbW1hLWRhbmdsZSc6ICdlcnJvcicsIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFza3MvaXNzdWVzLzk0MFxuXG4gIC8vIEVuZm9yY2UgY29uc2lzdGVudCBzcGFjaW5nIGJlZm9yZSBhbmQgYWZ0ZXIgY29tbWFzXG4gICdjb21tYS1zcGFjaW5nJzogWyAnZXJyb3InLCB7IGJlZm9yZTogZmFsc2UsIGFmdGVyOiB0cnVlIH0gXSxcblxuICAvLyBFbmZvcmNlIGNvbnNpc3RlbnQgY29tbWEgc3R5bGVcbiAgJ2NvbW1hLXN0eWxlJzogWyAnZXJyb3InLCAnbGFzdCcsIHsgLy8gZ29vZFxuICAgIGV4Y2VwdGlvbnM6IHtcbiAgICAgIEFycmF5RXhwcmVzc2lvbjogZmFsc2UsXG4gICAgICBBcnJheVBhdHRlcm46IGZhbHNlLFxuICAgICAgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb246IGZhbHNlLFxuICAgICAgQ2FsbEV4cHJlc3Npb246IGZhbHNlLFxuICAgICAgRnVuY3Rpb25EZWNsYXJhdGlvbjogZmFsc2UsXG4gICAgICBGdW5jdGlvbkV4cHJlc3Npb246IGZhbHNlLFxuICAgICAgSW1wb3J0RGVjbGFyYXRpb246IGZhbHNlLFxuICAgICAgT2JqZWN0RXhwcmVzc2lvbjogZmFsc2UsXG4gICAgICBPYmplY3RQYXR0ZXJuOiBmYWxzZSxcbiAgICAgIFZhcmlhYmxlRGVjbGFyYXRpb246IGZhbHNlLFxuICAgICAgTmV3RXhwcmVzc2lvbjogZmFsc2VcbiAgICB9XG4gIH0gXSxcblxuICAvLyBFbmZvcmNlIGNvbnNpc3RlbnQgc3BhY2luZyBpbnNpZGUgY29tcHV0ZWQgcHJvcGVydHkgYnJhY2tldHNcbiAgJ2NvbXB1dGVkLXByb3BlcnR5LXNwYWNpbmcnOiBbICdlcnJvcicsICdhbHdheXMnIF0sXG5cbiAgLy8gRW5mb3JjZSBjb25zaXN0ZW50IG5ld2xpbmVzIGJlZm9yZSBhbmQgYWZ0ZXIgZG90c1xuICAnZG90LWxvY2F0aW9uJzogJ29mZicsIC8vIFdlIHVzZSBXZWJTdG9ybSBmb3JtYXR0aW5nIHdoaWNoIG1vdmVzIGxvd2VyIGRvdHMgdG8gdGhlIGxlZnRcblxuICAvLyBSZXF1aXJlIG9yIGRpc2FsbG93IG5ld2xpbmUgYXQgdGhlIGVuZCBvZiBmaWxlc1xuICAvLyBOT1RFOiBUaGlzIGlzIG9mZiBpbiB0aGUgbWFpbiBjb25maWcgYmVjYXVzZSBpdCBkb2Vzbid0IGJlaGF2ZSB3ZWxsIHdpdGggSFRNTCBmaWxlcywgc2VlIG92ZXJyaWRlcyBmb3IgdXNhZ2UuXG4gICdlb2wtbGFzdCc6ICdvZmYnLFxuXG4gIC8vIFJlcXVpcmUgb3IgZGlzYWxsb3cgc3BhY2luZyBiZXR3ZWVuIGZ1bmN0aW9uIGlkZW50aWZpZXJzIGFuZCB0aGVpciBpbnZvY2F0aW9uc1xuICAnZnVuYy1jYWxsLXNwYWNpbmcnOiBbICdlcnJvcicsICduZXZlcicgXSxcblxuICAvLyBFbmZvcmNlIGxpbmUgYnJlYWtzIGJldHdlZW4gYXJndW1lbnRzIG9mIGEgZnVuY3Rpb24gY2FsbFxuICAnZnVuY3Rpb24tY2FsbC1hcmd1bWVudC1uZXdsaW5lJzogWyAnb2ZmJywgJ2NvbnNpc3RlbnQnIF0sIC8vIE5vdCBQaEVUJ3Mgc3R5bGVcblxuICAvLyBFbmZvcmNlIGNvbnNpc3RlbnQgbGluZSBicmVha3MgaW5zaWRlIGZ1bmN0aW9uIHBhcmVudGhlc2VzXG4gICdmdW5jdGlvbi1wYXJlbi1uZXdsaW5lJzogJ29mZicsIC8vIHdlIG9mdGVuIHByZWZlciBwYXJhbWV0ZXJzIG9uIHRoZSBzYW1lIGxpbmVcblxuICAvLyBFbmZvcmNlIGNvbnNpc3RlbnQgc3BhY2luZyBhcm91bmQgYCpgIG9wZXJhdG9ycyBpbiBnZW5lcmF0b3IgZnVuY3Rpb25zXG4gICdnZW5lcmF0b3Itc3Rhci1zcGFjaW5nJzogJ2Vycm9yJyxcblxuICAvLyBFbmZvcmNlIHRoZSBsb2NhdGlvbiBvZiBhcnJvdyBmdW5jdGlvbiBib2RpZXNcbiAgJ2ltcGxpY2l0LWFycm93LWxpbmVicmVhayc6ICdvZmYnLCAvLyBPSyB0byBsaW5lIGJyZWFrIGluIGFycm93IGZ1bmN0aW9ucyBpZiBpdCBpbXByb3ZlcyByZWFkYWJpbGl0eS5cblxuICAvLyBFbmZvcmNlIGNvbnNpc3RlbnQgaW5kZW50YXRpb25cbiAgaW5kZW50OiAnb2ZmJyxcblxuICAvLyBFbmZvcmNlIHRoZSBjb25zaXN0ZW50IHVzZSBvZiBlaXRoZXIgZG91YmxlIG9yIHNpbmdsZSBxdW90ZXMgaW4gSlNYIGF0dHJpYnV0ZXNcbiAgJ2pzeC1xdW90ZXMnOiAnZXJyb3InLFxuXG4gIC8vIEVuZm9yY2UgY29uc2lzdGVudCBzcGFjaW5nIGJldHdlZW4ga2V5cyBhbmQgdmFsdWVzIGluIG9iamVjdCBsaXRlcmFsIHByb3BlcnRpZXNcbiAgJ2tleS1zcGFjaW5nJzogWyAnZXJyb3InLCB7IGJlZm9yZUNvbG9uOiBmYWxzZSwgYWZ0ZXJDb2xvbjogdHJ1ZSB9IF0sXG5cbiAgLy8gRW5mb3JjZSBjb25zaXN0ZW50IHNwYWNpbmcgYmVmb3JlIGFuZCBhZnRlciBrZXl3b3Jkc1xuICAna2V5d29yZC1zcGFjaW5nJzogWyAnZXJyb3InLCB7XG4gICAgYmVmb3JlOiB0cnVlLFxuICAgIGFmdGVyOiB0cnVlLFxuICAgIG92ZXJyaWRlczoge1xuICAgICAgY2FzZTogeyBhZnRlcjogdHJ1ZSB9LCAvLyBkZWZhdWx0XG4gICAgICBzd2l0Y2g6IHsgYWZ0ZXI6IGZhbHNlIH0sXG4gICAgICBjYXRjaDogeyBhZnRlcjogZmFsc2UgfVxuICAgIH1cbiAgfSBdLFxuXG4gIC8vIEVuZm9yY2UgcG9zaXRpb24gb2YgbGluZSBjb21tZW50c1xuICAnbGluZS1jb21tZW50LXBvc2l0aW9uJzogJ29mZicsXG5cbiAgLy8gRW5mb3JjZSBjb25zaXN0ZW50IGxpbmVicmVhayBzdHlsZVxuICAnbGluZWJyZWFrLXN0eWxlJzogJ29mZicsIC8vIFdpbmRvd3MgbWF5IGNoZWNrIG91dCBhIGRpZmZlcmVudCBsaW5lIHN0eWxlIHRoYW4gbWFjLCBzbyB3ZSBjYW5ub3QgdGVzdCB0aGlzIG9uIGxvY2FsIHdvcmtpbmcgY29waWVzIGNyb3NzLXBsYXRmb3JtXG5cbiAgLy8gUmVxdWlyZSBlbXB0eSBsaW5lcyBhcm91bmQgY29tbWVudHNcbiAgLy8gU1IgV291bGQgbGlrZSB0aGlzIHJ1bGUgZW5hYmxlZCBpbiBoaXMgcmVwb3MgbGlrZSBzbzogJ2xpbmVzLWFyb3VuZC1jb21tZW50JzogWyAnZXJyb3InLCB7IGJlZm9yZUxpbmVDb21tZW50OiB0cnVlIH0gXVxuICAvLyBKTyByZWFsbHkgbGlrZXMgaGF2aW5nIHRoZSBhYmlsaXR5IHRvIGhhdmUgY29tbWVudHMgcmlnaHQgdW5kZXIgY29kZS5cbiAgLy8gTUsgdW5kZXJzdGFuZHMgYm90aCB0aG91Z2h0cy5cbiAgLy8gV2Ugd2lsbCBsaWtlbHkgbmV2ZXIgdHVybiB0aGlzIG9uIGZ1bGx5LCBidXQgZmVlbCBmcmVlIHRvIGFkZCB0byB5b3VyIHByb2plY3QhXG4gICdsaW5lcy1hcm91bmQtY29tbWVudCc6ICdvZmYnLFxuXG4gIC8vIFJlcXVpcmUgb3IgZGlzYWxsb3cgYW4gZW1wdHkgbGluZSBiZXR3ZWVuIGNsYXNzIG1lbWJlcnNcbiAgJ2xpbmVzLWJldHdlZW4tY2xhc3MtbWVtYmVycyc6IFsgJ2Vycm9yJywgJ2Fsd2F5cycsIHsgZXhjZXB0QWZ0ZXJTaW5nbGVMaW5lOiB0cnVlIH0gXSxcblxuICAvLyBFbmZvcmNlIGEgbWF4aW11bSBsaW5lIGxlbmd0aFxuICAnbWF4LWxlbic6ICdvZmYnLCAvLyBOb3QgYSBzdHJpY3QgcnVsZVxuXG4gIC8vIEVuZm9yY2UgYSBtYXhpbXVtIG51bWJlciBvZiBzdGF0ZW1lbnRzIGFsbG93ZWQgcGVyIGxpbmVcbiAgJ21heC1zdGF0ZW1lbnRzLXBlci1saW5lJzogJ29mZicsIC8vIDcwMCsgb2NjdXJyZW5jZXMgaW4gTWFyY2ggMjAyMVxuXG4gIC8vIEVuZm9yY2UgbmV3bGluZXMgYmV0d2VlbiBvcGVyYW5kcyBvZiB0ZXJuYXJ5IGV4cHJlc3Npb25zXG4gICdtdWx0aWxpbmUtdGVybmFyeSc6ICdvZmYnLCAvLyBXZSB1c2UgYWxsIHN0eWxlcyBvZiB0ZXJuYXJpZXNcblxuICAvLyBFbmZvcmNlIG9yIGRpc2FsbG93IHBhcmVudGhlc2VzIHdoZW4gaW52b2tpbmcgYSBjb25zdHJ1Y3RvciB3aXRoIG5vIGFyZ3VtZW50c1xuICAnbmV3LXBhcmVucyc6ICdlcnJvcicsXG5cbiAgLy8gUmVxdWlyZSBhIG5ld2xpbmUgYWZ0ZXIgZWFjaCBjYWxsIGluIGEgbWV0aG9kIGNoYWluXG4gICduZXdsaW5lLXBlci1jaGFpbmVkLWNhbGwnOiAnb2ZmJywgLy8gc2hvdWxkIGJlIGZsZXhpYmxlXG5cbiAgLy8gRGlzYWxsb3cgdW5uZWNlc3NhcnkgcGFyZW50aGVzZXNcbiAgJ25vLWV4dHJhLXBhcmVucyc6ICdvZmYnLCAvLyB3ZSBmaW5kIHRoYXQgZXh0cmFuZW91cyBwYXJlbnRoZXNlcyBzb21ldGltZXMgaW1wcm92ZSByZWFkYWJpbGl0eVxuXG4gIC8vIERpc2FsbG93IG1peGVkIHNwYWNlcyBhbmQgdGFicyBmb3IgaW5kZW50YXRpb25cbiAgJ25vLW1peGVkLXNwYWNlcy1hbmQtdGFicyc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgbXVsdGlwbGUgc3BhY2VzXG4gICduby1tdWx0aS1zcGFjZXMnOiBbICdlcnJvcicsIHsgaWdub3JlRU9MQ29tbWVudHM6IHRydWUgfSBdLFxuXG4gIC8vIERpc2FsbG93IG11bHRpcGxlIGVtcHR5IGxpbmVzXG4gIC8vIERVUExJQ0FUSU9OIEFMRVJULCB0aGlzIGlzIG92ZXJyaWRkZW4gZm9yIGh0bWwgZmlsZXMsIHNlZSBhYm92ZSBcIm92ZXJyaWRlc1wiXG4gICduby1tdWx0aXBsZS1lbXB0eS1saW5lcyc6IFsgJ2Vycm9yJywgeyBtYXg6IDIsIG1heEJPRjogMCwgbWF4RU9GOiAxIH0gXSxcblxuICAvLyBEaXNhbGxvdyBhbGwgdGFic1xuICAnbm8tdGFicyc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdHJhaWxpbmcgd2hpdGVzcGFjZSBhdCB0aGUgZW5kIG9mIGxpbmVzXG4gICduby10cmFpbGluZy1zcGFjZXMnOiBbICdlcnJvcicsIHsgc2tpcEJsYW5rTGluZXM6IHRydWUsIGlnbm9yZUNvbW1lbnRzOiB0cnVlIH0gXSxcblxuICAvLyBEaXNhbGxvdyB3aGl0ZXNwYWNlIGJlZm9yZSBwcm9wZXJ0aWVzXG4gICduby13aGl0ZXNwYWNlLWJlZm9yZS1wcm9wZXJ0eSc6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSB0aGUgbG9jYXRpb24gb2Ygc2luZ2xlLWxpbmUgc3RhdGVtZW50c1xuICAnbm9uYmxvY2stc3RhdGVtZW50LWJvZHktcG9zaXRpb24nOiBbICdlcnJvcicsICdiZXNpZGUnLCB7IG92ZXJyaWRlczoge30gfSBdLFxuXG4gIC8vIEVuZm9yY2UgY29uc2lzdGVudCBsaW5lIGJyZWFrcyBhZnRlciBvcGVuaW5nIGFuZCBiZWZvcmUgY2xvc2luZyBicmFjZXNcbiAgJ29iamVjdC1jdXJseS1uZXdsaW5lJzogJ2Vycm9yJyxcblxuICAvLyBFbmZvcmNlIGNvbnNpc3RlbnQgc3BhY2luZyBpbnNpZGUgYnJhY2VzXG4gICdvYmplY3QtY3VybHktc3BhY2luZyc6IFsgJ2Vycm9yJywgJ2Fsd2F5cycgXSxcblxuICAvLyBFbmZvcmNlIHBsYWNpbmcgb2JqZWN0IHByb3BlcnRpZXMgb24gc2VwYXJhdGUgbGluZXNcbiAgJ29iamVjdC1wcm9wZXJ0eS1uZXdsaW5lJzogJ29mZicsXG5cbiAgLy8gRW5mb3JjZSBjb25zaXN0ZW50IGxpbmVicmVhayBzdHlsZSBmb3Igb3BlcmF0b3JzXG4gICdvcGVyYXRvci1saW5lYnJlYWsnOiAnb2ZmJyxcblxuICAvLyBSZXF1aXJlIG9yIGRpc2FsbG93IHBhZGRpbmcgd2l0aGluIGJsb2Nrc1xuICAncGFkZGVkLWJsb2Nrcyc6ICdvZmYnLCAvLyAxMDlrIGZhaWxzXG5cbiAgLy8gUmVxdWlyZSBvciBkaXNhbGxvdyBwYWRkaW5nIGxpbmVzIGJldHdlZW4gc3RhdGVtZW50c1xuICAncGFkZGluZy1saW5lLWJldHdlZW4tc3RhdGVtZW50cyc6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSB0aGUgY29uc2lzdGVudCB1c2Ugb2YgZWl0aGVyIGJhY2t0aWNrcywgZG91YmxlLCBvciBzaW5nbGUgcXVvdGVzXG4gIHF1b3RlczogWyAnZXJyb3InLCAnc2luZ2xlJyBdLFxuXG4gIC8vIEVuZm9yY2Ugc3BhY2luZyBiZXR3ZWVuIHJlc3QgYW5kIHNwcmVhZCBvcGVyYXRvcnMgYW5kIHRoZWlyIGV4cHJlc3Npb25zXG4gICdyZXN0LXNwcmVhZC1zcGFjaW5nJzogJ2Vycm9yJyxcblxuICAvLyBSZXF1aXJlIG9yIGRpc2FsbG93IHNlbWljb2xvbnMgaW5zdGVhZCBvZiBBU0lcbiAgc2VtaTogWyAnZXJyb3InLCAnYWx3YXlzJyBdLFxuXG4gIC8vIEVuZm9yY2UgY29uc2lzdGVudCBzcGFjaW5nIGJlZm9yZSBhbmQgYWZ0ZXIgc2VtaWNvbG9uc1xuICAnc2VtaS1zcGFjaW5nJzogWyAnZXJyb3InLCB7IGJlZm9yZTogZmFsc2UsIGFmdGVyOiB0cnVlIH0gXSxcblxuICAvLyBFbmZvcmNlIGxvY2F0aW9uIG9mIHNlbWljb2xvbnNcbiAgJ3NlbWktc3R5bGUnOiBbICdlcnJvcicsICdsYXN0JyBdLFxuXG4gIC8vIEVuZm9yY2UgY29uc2lzdGVudCBzcGFjaW5nIGJlZm9yZSBibG9ja3NcbiAgJ3NwYWNlLWJlZm9yZS1ibG9ja3MnOiAnZXJyb3InLFxuXG4gIC8vIEVuZm9yY2UgY29uc2lzdGVudCBzcGFjaW5nIGJlZm9yZSBgZnVuY3Rpb25gIGRlZmluaXRpb24gb3BlbmluZyBwYXJlbnRoZXNpc1xuICAnc3BhY2UtYmVmb3JlLWZ1bmN0aW9uLXBhcmVuJzogWyAnZXJyb3InLCB7XG4gICAgYW5vbnltb3VzOiAnbmV2ZXInLFxuICAgIG5hbWVkOiAnbmV2ZXInLFxuICAgIGFzeW5jQXJyb3c6ICdhbHdheXMnXG4gIH0gXSxcblxuICAvLyBFbmZvcmNlIGNvbnNpc3RlbnQgc3BhY2luZyBpbnNpZGUgcGFyZW50aGVzZXNcbiAgJ3NwYWNlLWluLXBhcmVucyc6IFsgJ2Vycm9yJywgJ2Fsd2F5cycgXSxcblxuICAvLyBSZXF1aXJlIHNwYWNpbmcgYXJvdW5kIGluZml4IG9wZXJhdG9yc1xuICAnc3BhY2UtaW5maXgtb3BzJzogJ2Vycm9yJyxcblxuICAvLyBFbmZvcmNlIGNvbnNpc3RlbnQgc3BhY2luZyBiZWZvcmUgb3IgYWZ0ZXIgdW5hcnkgb3BlcmF0b3JzXG4gICdzcGFjZS11bmFyeS1vcHMnOiBbICdlcnJvcicsIHtcbiAgICB3b3JkczogdHJ1ZSxcbiAgICBub253b3JkczogZmFsc2UsXG4gICAgb3ZlcnJpZGVzOiB7fVxuICB9IF0sXG5cbiAgLy8gRW5mb3JjZSBzcGFjaW5nIGFyb3VuZCBjb2xvbnMgb2Ygc3dpdGNoIHN0YXRlbWVudHNcbiAgJ3N3aXRjaC1jb2xvbi1zcGFjaW5nJzogWyAnZXJyb3InLCB7IGFmdGVyOiB0cnVlLCBiZWZvcmU6IGZhbHNlIH0gXSxcblxuICAvLyBSZXF1aXJlIG9yIGRpc2FsbG93IHNwYWNpbmcgYXJvdW5kIGVtYmVkZGVkIGV4cHJlc3Npb25zIG9mIHRlbXBsYXRlIHN0cmluZ3NcbiAgJ3RlbXBsYXRlLWN1cmx5LXNwYWNpbmcnOiAnZXJyb3InLFxuXG4gIC8vIFJlcXVpcmUgb3IgZGlzYWxsb3cgc3BhY2luZyBiZXR3ZWVuIHRlbXBsYXRlIHRhZ3MgYW5kIHRoZWlyIGxpdGVyYWxzXG4gICd0ZW1wbGF0ZS10YWctc3BhY2luZyc6IFsgJ2Vycm9yJywgJ25ldmVyJyBdLFxuXG4gIC8vIFJlcXVpcmUgb3IgZGlzYWxsb3cgVW5pY29kZSBieXRlIG9yZGVyIG1hcmsgKEJPTSlcbiAgJ3VuaWNvZGUtYm9tJzogWyAnZXJyb3InLCAnbmV2ZXInIF0sXG5cbiAgLy8gUmVxdWlyZSBwYXJlbnRoZXNlcyBhcm91bmQgaW1tZWRpYXRlIGBmdW5jdGlvbmAgaW52b2NhdGlvbnNcbiAgJ3dyYXAtaWlmZSc6ICdvZmYnLCAvLyBOb3Qgb3VyIHN0eWxlXG5cbiAgLy8gUmVxdWlyZSBwYXJlbnRoZXNpcyBhcm91bmQgcmVnZXggbGl0ZXJhbHNcbiAgJ3dyYXAtcmVnZXgnOiAnb2ZmJywgLy8gSXQgYWxyZWFkeSBzZWVtcyBwcmV0dHkgYW1iaWd1b3VzIHRvIG1lLCBidXQgdGhlbiBhZ2FpbiB3ZSBvbmx5IGhhdmUgMTcgb2NjdXJyZW5jZXMgYXQgdGhlIG1vbWVudC5cblxuICAvLyBSZXF1aXJlIG9yIGRpc2FsbG93IHNwYWNpbmcgYXJvdW5kIHRoZSBgKmAgaW4gYHlpZWxkKmAgZXhwcmVzc2lvbnNcbiAgJ3lpZWxkLXN0YXItc3BhY2luZyc6ICdlcnJvcicsXG5cbiAgLy8gZGlzYWxsb3cgc3BhY2UgYmV0d2VlbiBmdW5jdGlvbiBpZGVudGlmaWVyIGFuZCBhcHBsaWNhdGlvblxuICAnbm8tc3BhY2VkLWZ1bmMnOiAnZXJyb3InLFxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIEN1c3RvbSBSdWxlc1xuICAvL1xuXG4gICdwaGV0L2JhZC10ZXh0JzogJ2Vycm9yJyxcblxuICAvLyBDdXN0b20gcnVsZSBmb3IgY2hlY2tpbmcgdGhlIGNvcHlyaWdodC5cbiAgJ3BoZXQvY29weXJpZ2h0JzogJ2Vycm9yJyxcblxuICAvLyBDdXN0b20gcnVsZSBmb3IgY2hlY2tpbmcgVE8tRE9zIGhhdmUgaXNzdWVzXG4gICdwaGV0L3RvZG8tc2hvdWxkLWhhdmUtaXNzdWUnOiAnZXJyb3InLFxuXG4gIC8vIEN1c3RvbSBydWxlIGZvciBlbnN1cmluZyB0aGF0IGltYWdlcyBhbmQgdGV4dCB1c2Ugc2NlbmVyeSBub2RlXG4gICdwaGV0L25vLWh0bWwtY29uc3RydWN0b3JzJzogJ2Vycm9yJyxcblxuICAvLyBDdXN0b20gcnVsZSBmb3IgYXZvaWRpbmcgaW5zdGFuY2VvZiBBcnJheS5cbiAgJ3BoZXQvbm8taW5zdGFuY2VvZi1hcnJheSc6ICdlcnJvcicsXG5cbiAgLy8gQ3VzdG9tIHJ1bGUgZm9yIGtlZXBpbmcgaW1wb3J0IHN0YXRlbWVudHMgb24gYSBzaW5nbGUgbGluZS5cbiAgJ3BoZXQvc2luZ2xlLWxpbmUtaW1wb3J0JzogJ2Vycm9yJyxcblxuICAvLyBtZXRob2QgZGVjbGFyYXRpb25zIG11c3QgaGF2ZSBhIHZpc2liaWxpdHkgYW5ub3RhdGlvblxuICAncGhldC92aXNpYmlsaXR5LWFubm90YXRpb24nOiAnZXJyb3InLFxuXG4gIC8vIGtleSBhbmQgdmFsdWUgYXJndW1lbnRzIHRvIG5hbWVzcGFjZS5yZWdpc3RlcigpIG11c3QgbWF0Y2hcbiAgJ3BoZXQvbmFtZXNwYWNlLW1hdGNoJzogJ2Vycm9yJyxcblxuICAvLyBuZXZlciBhbGxvdyBvYmplY3Qgc2hvcnRoYW5kIGZvciBwcm9wZXJ0aWVzLCBmdW5jdGlvbnMgYXJlIG9rLlxuICAncGhldC9waGV0LW9iamVjdC1zaG9ydGhhbmQnOiAnZXJyb3InLFxuXG4gIC8vIGEgZGVmYXVsdCBpbXBvcnQgdmFyaWFibGUgbmFtZSBzaG91bGQgYmUgdGhlIHNhbWUgYXMgdGhlIGZpbGVuYW1lXG4gICdwaGV0L2RlZmF1bHQtaW1wb3J0LW1hdGNoLWZpbGVuYW1lJzogJ2Vycm9yJyxcblxuICAvLyBXaGVuIHRoZSBkZWZhdWx0IGV4cG9ydCBvZiBhIGZpbGUgaXMgYSBjbGFzcywgaXQgc2hvdWxkIGhhdmUgYSBuYW1lc3BhY2UgcmVnaXN0ZXIgY2FsbFxuICAncGhldC9kZWZhdWx0LWV4cG9ydC1jbGFzcy1zaG91bGQtcmVnaXN0ZXItbmFtZXNwYWNlJzogJ2Vycm9yJyxcblxuICAvLyBJbXBvcnRpbmcgdGhlIHZpZXcgZnJvbSB0aGUgbW9kZWwsIHVoIG9oLiBUT0RPOiBUaGlzIGlzIHN0aWxsIGluIGRpc2N1c3Npb24sIG51bWVyb3VzIHJlcG9zIG9wdCBvdXQsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEzODVcbiAgJ3BoZXQvbm8tdmlldy1pbXBvcnRlZC1mcm9tLW1vZGVsJzogJ2Vycm9yJyxcblxuICAvLyBDbGFzcyBuYW1lcyBzaG91bGQgbWF0Y2ggZmlsZW5hbWUgd2hlbiBleHBvcnRlZC5cbiAgJ3BoZXQvZGVmYXVsdC1leHBvcnQtbWF0Y2gtZmlsZW5hbWUnOiAnZXJyb3InLFxuXG4gIC8vIFVzZSBEZXJpdmVkU3RyaW5nUHJvcGVydHkgZm9yIGl0cyBQaEVULWlPIGJlbmVmaXRzIGFuZCBjb25zaXN0ZW5jeSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xOTQzXG4gICdwaGV0L3ByZWZlci1kZXJpdmVkLXN0cmluZy1wcm9wZXJ0eSc6ICdlcnJvcicsXG5cbiAgLy8gQSB2YXJpYWJsZSBvciBhdHRyaWJ1dGUgbmFtZSBzaG91bGQgZ2VuZXJhbGx5IG1hdGNoIHRoZSB0YW5kZW0gbmFtZS5cbiAgJ3BoZXQvdGFuZGVtLW5hbWUtc2hvdWxkLW1hdGNoJzogJ2Vycm9yJyxcblxuICAvLyBFYWNoIHNvdXJjZSBmaWxlIHNob3VsZCBsaXN0IGF0IGxlYXN0IG9uZSBhdXRob3JcbiAgJ3BoZXQvYXV0aG9yLWFubm90YXRpb24nOiAnZXJyb3InLFxuXG4gIC8vIEltcG9ydGluZyBhIHJlbGF0aXZlIHBhdGggc2hvdWxkIGhhdmUgYW4gZXh0ZW5zaW9uXG4gICdwaGV0L2ltcG9ydC1zdGF0ZW1lbnQtZXh0ZW5zaW9uJzogJ2Vycm9yJyxcblxuICAvLyBJbXBvcnRpbmcgc2hvdWxkIHByZWZlciAqLmpzIHRvICoudHMgZXRjLlxuICAncGhldC9pbXBvcnQtc3RhdGVtZW50LWV4dGVuc2lvbi1qcyc6ICdlcnJvcidcbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxufTsiXSwibmFtZXMiOlsidmFycyIsImFyZ3MiLCJjYXVnaHRFcnJvcnMiLCJjYW1lbGNhc2UiLCJjb21wbGV4aXR5IiwiY3VybHkiLCJlcWVxZXEiLCJpbmNsdWRlQ29tbW9uSlNNb2R1bGVFeHBvcnRzIiwiY29uc2lkZXJQcm9wZXJ0eURlc2NyaXB0b3IiLCJuZXdJc0NhcCIsIm5ld0lzQ2FwRXhjZXB0aW9uUGF0dGVybiIsIm5ld0lzQ2FwRXhjZXB0aW9ucyIsImNhcElzTmV3IiwiY2FwSXNOZXdFeGNlcHRpb25zIiwiaWdub3JlTm9uRGVjbGFyYXRpb24iLCJzZWxlY3RvciIsIm1lc3NhZ2UiLCJkZXN0cnVjdHVyaW5nIiwiaWdub3JlUmVhZEJlZm9yZUFzc2lnbiIsImtleXdvcmRzIiwidW5uZWNlc3NhcnkiLCJudW1iZXJzIiwicmFkaXgiLCJzdHJpY3QiLCJ5b2RhIiwiYWxsb3dTaW5nbGVMaW5lIiwiYmVmb3JlIiwiYWZ0ZXIiLCJleGNlcHRpb25zIiwiQXJyYXlFeHByZXNzaW9uIiwiQXJyYXlQYXR0ZXJuIiwiQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24iLCJDYWxsRXhwcmVzc2lvbiIsIkZ1bmN0aW9uRGVjbGFyYXRpb24iLCJGdW5jdGlvbkV4cHJlc3Npb24iLCJJbXBvcnREZWNsYXJhdGlvbiIsIk9iamVjdEV4cHJlc3Npb24iLCJPYmplY3RQYXR0ZXJuIiwiVmFyaWFibGVEZWNsYXJhdGlvbiIsIk5ld0V4cHJlc3Npb24iLCJpbmRlbnQiLCJiZWZvcmVDb2xvbiIsImFmdGVyQ29sb24iLCJvdmVycmlkZXMiLCJjYXNlIiwic3dpdGNoIiwiY2F0Y2giLCJleGNlcHRBZnRlclNpbmdsZUxpbmUiLCJpZ25vcmVFT0xDb21tZW50cyIsIm1heCIsIm1heEJPRiIsIm1heEVPRiIsInNraXBCbGFua0xpbmVzIiwiaWdub3JlQ29tbWVudHMiLCJxdW90ZXMiLCJzZW1pIiwiYW5vbnltb3VzIiwibmFtZWQiLCJhc3luY0Fycm93Iiwid29yZHMiLCJub253b3JkcyJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FDRCxlQUFlO0lBRWIsb0VBQW9FO0lBQ3BFLG9CQUFvQjtJQUNwQix1REFBdUQ7SUFFdkQsMERBQTBEO0lBQzFELHlCQUF5QjtJQUV6QiwwQ0FBMEM7SUFDMUMscUJBQXFCO0lBRXJCLDhFQUE4RTtJQUM5RSxpQkFBaUI7SUFFakIseUNBQXlDO0lBQ3pDLGlCQUFpQjtJQUVqQix5REFBeUQ7SUFDekQsNkJBQTZCO0lBRTdCLG1DQUFtQztJQUNuQyxvQkFBb0I7SUFFcEIscUNBQXFDO0lBQ3JDLG1CQUFtQjtJQUVuQixnQ0FBZ0M7SUFDaEMsdUJBQXVCO0lBRXZCLDJEQUEyRDtJQUMzRCxrQkFBa0I7SUFFbEIseUNBQXlDO0lBQ3pDLG1CQUFtQjtJQUVuQixvRUFBb0U7SUFDcEUsaUNBQWlDO0lBRWpDLDhDQUE4QztJQUM5Qyx5QkFBeUI7SUFFekIsNENBQTRDO0lBQzVDLHlCQUF5QjtJQUV6QixxREFBcUQ7SUFDckQsb0JBQW9CO0lBRXBCLGlDQUFpQztJQUNqQyxlQUFlO0lBRWYseURBQXlEO0lBQ3pELGdCQUFnQjtJQUVoQixtQ0FBbUM7SUFDbkMseUJBQXlCO0lBRXpCLHFEQUFxRDtJQUNyRCxtQkFBbUI7SUFFbkIsNkNBQTZDO0lBQzdDLGdCQUFnQjtJQUVoQixpQ0FBaUM7SUFDakMscUJBQXFCO0lBRXJCLG9DQUFvQztJQUNwQyx3QkFBd0I7SUFFeEIsMERBQTBEO0lBQzFELDRCQUE0QjtJQUU1Qix3Q0FBd0M7SUFDeEMsb0JBQW9CO0lBRXBCLHFEQUFxRDtJQUNyRCxnQkFBZ0I7SUFFaEIsNENBQTRDO0lBQzVDLGtCQUFrQjtJQUVsQiwr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