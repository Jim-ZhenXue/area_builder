// Copyright 2015-2021, University of Colorado Boulder
/**
 * Typescript-ESLint rules for our TypeScript codebase.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ export default {
    // TypeScript ESLint Rules.  Legend
    // ✅ - recommended
    // 🔒 - strict
    // 🔧 - fixable
    // 🛠 - has-suggestions
    // 💭 - requires type information
    ////////////////////////////////////////////////////////////////////////
    // Supported Rules
    // Require that member overloads be consecutive ✅
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    // Require using either T[] or Array<T> for arrays 🔒 🔧
    '@typescript-eslint/array-type': 'off',
    // Disallow awaiting a value that is not a Thenable ✅  💭
    '@typescript-eslint/await-thenable': 'error',
    // Disallow @ts-<directive> comments or require descriptions after directive ✅
    // A value of true for a particular directive means that this rule will report if it finds any usage of said directive.
    // See banTSCommentConfig.mjs for a reusable strict configuration.
    '@typescript-eslint/ban-ts-comment': [
        'error',
        {
            'ts-ignore': false,
            'ts-check': true,
            'ts-expect-error': false,
            'ts-nocheck': false // TODO: Chip way as dev team https://github.com/phetsims/chipper/issues/1277
        }
    ],
    // Disallow // tslint:<rule-flag> comments 🔒 🔧
    '@typescript-eslint/ban-tslint-comment': 'error',
    // Disallow certain types ✅ 🔧
    '@typescript-eslint/no-restricted-types': [
        'error',
        {
            types: {
                Omit: {
                    message: 'Prefer StrictOmit for type safety',
                    fixWith: 'StrictOmit'
                },
                // Defaults copied from http://condensed.physics.usyd.edu.au/frontend/node_modules/@typescript-eslint/eslint-plugin/docs/rules/ban-types.md
                String: {
                    message: 'Use string instead',
                    fixWith: 'string'
                },
                Boolean: {
                    message: 'Use boolean instead',
                    fixWith: 'boolean'
                },
                Number: {
                    message: 'Use number instead',
                    fixWith: 'number'
                },
                Symbol: {
                    message: 'Use symbol instead',
                    fixWith: 'symbol'
                },
                BigInt: {
                    message: 'Use bigint instead',
                    fixWith: 'bigint'
                },
                Function: {
                    message: [
                        'The `Function` type accepts any function-like value.',
                        'It provides no type safety when calling the function, which can be a common source of bugs.',
                        'It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.',
                        'If you are expecting the function to accept certain arguments, you should explicitly define the function shape.'
                    ].join('\n')
                },
                // object typing
                Object: {
                    message: [
                        'The `Object` type actually means "any non-nullish value", so it is marginally better than `unknown`.',
                        '- If you want a type meaning "any object", you probably want `object` instead.',
                        '- If you want a type meaning "any value", you probably want `unknown` instead.',
                        '- If you really want a type meaning "any non-nullish value", you probably want `NonNullable<unknown>` instead.'
                    ].join('\n'),
                    suggest: [
                        'object',
                        'unknown',
                        'NonNullable<unknown>'
                    ]
                },
                '{}': {
                    message: [
                        '`{}` actually means "any non-nullish value".',
                        '- If you want a type meaning "any object", you probably want `object` instead.',
                        '- If you want a type meaning "any value", you probably want `unknown` instead.',
                        '- If you want a type meaning "empty object", you probably want `Record<string, never>` instead.',
                        '- If you really want a type meaning "any non-nullish value", you probably want `NonNullable<unknown>` instead.'
                    ].join('\n'),
                    suggest: [
                        'object',
                        'unknown',
                        'Record<string, never>',
                        'NonNullable<unknown>'
                    ]
                }
            }
        }
    ],
    // Enforce that literals on classes are exposed in a consistent style 🔒 🔧
    '@typescript-eslint/class-literal-property-style': 'off',
    // Enforce specifying generic type arguments on type annotation or constructor name of a constructor call 🔒 🔧
    '@typescript-eslint/consistent-generic-constructors': 'error',
    // Require or disallow the Record type 🔒 🔧
    '@typescript-eslint/consistent-indexed-object-style': 'error',
    // Enforce consistent usage of type assertions 🔒
    '@typescript-eslint/consistent-type-assertions': 'error',
    // Enforce type definitions to consistently use either interface or type 🔒 🔧
    '@typescript-eslint/consistent-type-definitions': [
        'error',
        'type'
    ],
    // Enforce consistent usage of type exports  🔧 💭
    '@typescript-eslint/consistent-type-exports': 'off',
    // Enforce consistent usage of type imports  🔧
    '@typescript-eslint/consistent-type-imports': 'off',
    // Require explicit return types on functions and class methods
    '@typescript-eslint/explicit-function-return-type': 'off',
    // Require explicit accessibility modifiers on class properties and methods  🔧
    '@typescript-eslint/explicit-member-accessibility': 'error',
    // Require explicit return and argument types on exported functions' and classes' public class methods
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    // Require a specific member delimiter style for interfaces and type literals  🔧
    '@stylistic/member-delimiter-style': 'error',
    // Require a consistent member declaration order
    '@typescript-eslint/member-ordering': 'off',
    // Enforce using a particular method signature syntax  🔧
    '@typescript-eslint/method-signature-style': 'off',
    // Enforce naming conventions for everything across a codebase   💭
    '@typescript-eslint/naming-convention': 'off',
    // Require .toString() to only be called on objects which provide useful information when stringified 🔒  💭
    '@typescript-eslint/no-base-to-string': 'error',
    // Disallow non-null assertion in locations that may be confusing 🔒 🔧 🛠
    '@typescript-eslint/no-confusing-non-null-assertion': 'error',
    // Require expressions of type void to appear in statement position  🔧 🛠 💭
    '@typescript-eslint/no-confusing-void-expression': 'off',
    // Disallow duplicate enum member values 🔒 🛠
    '@typescript-eslint/no-duplicate-enum-values': 'error',
    // Disallow using the delete operator on computed key expressions 🔒 🔧
    '@typescript-eslint/no-dynamic-delete': 'off',
    // Disallow the declaration of empty interfaces ✅ 🔧 🛠
    '@typescript-eslint/no-empty-interface': 'error',
    // Disallow the any type ✅ 🔧 🛠
    '@typescript-eslint/no-explicit-any': 'error',
    // Disallow extra non-null assertion ✅ 🔧
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    // Disallow classes used as namespaces 🔒
    '@typescript-eslint/no-extraneous-class': 'off',
    // Require Promise-like statements to be handled appropriately ✅ 🛠 💭
    '@typescript-eslint/no-floating-promises': 'error',
    // Disallow iterating over an array with a for-in loop ✅  💭
    '@typescript-eslint/no-for-in-array': 'error',
    // Disallow usage of the implicit any type in catch clauses  🔧 🛠
    '@typescript-eslint/no-implicit-any-catch': 'off',
    // Disallow explicit type declarations for variables or parameters initialized to a number, string, or boolean ✅ 🔧
    '@typescript-eslint/no-inferrable-types': 'error',
    // Disallow void type outside of generic or return types 🔒
    '@typescript-eslint/no-invalid-void-type': 'error',
    // Disallow the void operator except when used to discard a value 🔒 🔧 🛠 💭
    '@typescript-eslint/no-meaningless-void-operator': 'error',
    // Enforce valid definition of new and constructor ✅
    '@typescript-eslint/no-misused-new': 'error',
    // Disallow Promises in places not designed to handle them ✅  💭
    '@typescript-eslint/no-misused-promises': 'off',
    // Disallow custom TypeScript modules and namespaces ✅
    '@typescript-eslint/no-namespace': 'error',
    // Disallow non-null assertions in the left operand of a nullish coalescing operator 🔒 🛠
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
    // Disallow non-null assertions after an optional chain expression ✅ 🛠
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
    // Disallow non-null assertions using the ! postfix operator ✅ 🛠
    '@typescript-eslint/no-non-null-assertion': 'off',
    // Disallow the use of parameter properties in class constructors
    '@typescript-eslint/no-parameter-properties': 'off',
    // Disallow members of unions and intersections that do nothing or override type information   💭
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    // Disallow invocation of require()
    '@typescript-eslint/no-require-imports': 'error',
    // Disallow aliasing this ✅
    '@typescript-eslint/no-this-alias': 'error',
    // Disallow type aliases
    '@typescript-eslint/no-type-alias': 'off',
    // Disallow unnecessary equality comparisons against boolean literals 🔒 🔧 💭
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    // Disallow conditionals where the type is always truthy or always falsy 🔒 🔧 💭
    '@typescript-eslint/no-unnecessary-condition': 'off',
    // Disallow unnecessary namespace qualifiers  🔧 💭
    '@typescript-eslint/no-unnecessary-qualifier': 'off',
    // Disallow type arguments that are equal to the default 🔒 🔧 💭
    '@typescript-eslint/no-unnecessary-type-arguments': 'error',
    // Disallow type assertions that do not change the type of an expression ✅ 🔧 💭
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    // Disallow unnecessary constraints on generic types ✅ 🛠
    '@typescript-eslint/no-unnecessary-type-constraint': 'error',
    // Disallow calling a function with a value with type any ✅  💭
    '@typescript-eslint/no-unsafe-argument': 'off',
    // Disallow assigning a value with type any to variables and properties ✅  💭
    '@typescript-eslint/no-unsafe-assignment': 'off',
    // Disallow calling a value with type any ✅  💭
    '@typescript-eslint/no-unsafe-call': 'off',
    // Disallow member access on a value with type any ✅  💭
    '@typescript-eslint/no-unsafe-member-access': 'off',
    // Disallow returning a value with type any from a function ✅  💭
    '@typescript-eslint/no-unsafe-return': 'off',
    // Disallow empty exports that don't change anything in a module file  🔧 🛠
    '@typescript-eslint/no-useless-empty-export': 'error',
    // Disallow require statements except in import statements ✅
    '@typescript-eslint/no-var-requires': 'error',
    // Enforce non-null assertions over explicit type casts 🔒 🔧 💭
    '@typescript-eslint/non-nullable-type-assertion-style': 'error',
    // Require or disallow parameter properties in class constructors
    '@typescript-eslint/parameter-properties': 'off',
    // Enforce the use of as const over literal type ✅ 🔧 🛠
    '@typescript-eslint/prefer-as-const': 'error',
    // Require each enum member value to be explicitly initialized  🛠
    '@typescript-eslint/prefer-enum-initializers': 'error',
    // Enforce the use of for-of loop over the standard for loop where possible 🔒
    '@typescript-eslint/prefer-for-of': 'off',
    // Enforce using function types instead of interfaces with call signatures 🔒 🔧
    '@typescript-eslint/prefer-function-type': 'off',
    // Enforce includes method over indexOf method 🔒 🔧 💭
    '@typescript-eslint/prefer-includes': 'error',
    // Require all enum members to be literal values 🔒
    '@typescript-eslint/prefer-literal-enum-member': 'error',
    // Require using namespace keyword over module keyword to declare custom TypeScript modules ✅ 🔧
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    // Enforce using the nullish coalescing operator instead of logical chaining 🔒 🛠 💭
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    // Enforce using concise optional chain expressions instead of chained logical ands 🔒 🛠
    '@typescript-eslint/prefer-optional-chain': 'off',
    // Require private members to be marked as readonly if they're never modified outside of the constructor  🔧 💭
    '@typescript-eslint/prefer-readonly': 'off',
    // Require function parameters to be typed as readonly to prevent accidental mutation of inputs   💭
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    // Enforce using type parameter when calling Array#reduce instead of casting 🔒 🔧 💭
    '@typescript-eslint/prefer-reduce-type-parameter': 'off',
    // Enforce RegExp#exec over String#match if no global flag is provided  🔧 💭
    '@typescript-eslint/prefer-regexp-exec': 'off',
    // Enforce that this is used when only this type is returned 🔒 🔧 💭
    '@typescript-eslint/prefer-return-this-type': 'off',
    // Enforce using String#startsWith and String#endsWith over other equivalent methods of checking substrings 🔒 🔧 💭
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    // Enforce using @ts-expect-error over @ts-ignore 🔒 🔧
    '@typescript-eslint/prefer-ts-expect-error': 'error',
    // Require any function or method that returns a Promise to be marked async  🔧 💭
    '@typescript-eslint/promise-function-async': 'off',
    // Require Array#sort calls to always provide a compareFunction   💭
    '@typescript-eslint/require-array-sort-compare': 'off',
    // Require both operands of addition to have type number or string ✅  💭
    '@typescript-eslint/restrict-plus-operands': 'off',
    // Enforce template literal expressions to be of string type ✅  💭
    '@typescript-eslint/restrict-template-expressions': 'off',
    // Enforce members of a type union/intersection to be sorted alphabetically  🔧 🛠
    '@typescript-eslint/sort-type-union-intersection-members': 'off',
    // Disallow certain types in boolean expressions  🔧 🛠 💭
    '@typescript-eslint/strict-boolean-expressions': 'off',
    // Require switch-case statements to be exhaustive with union type  🛠 💭
    '@typescript-eslint/switch-exhaustiveness-check': 'off',
    // Disallow certain triple slash directives in favor of ES6-style import declarations ✅
    '@typescript-eslint/triple-slash-reference': 'error',
    // Require consistent spacing around type annotations  🔧
    '@typescript-eslint/type-annotation-spacing': 'off',
    // Require type annotations in certain places
    '@typescript-eslint/typedef': 'error',
    // Enforce unbound methods are called with their expected scope ✅  💭
    '@typescript-eslint/unbound-method': 'off',
    // Disallow two overloads that could be unified into one with a union or an optional/rest parameter 🔒
    '@typescript-eslint/unified-signatures': 'off',
    ////////////////////////////////////////////////////////////////////////
    // Extension Rules
    // In some cases, ESLint provides a rule itself, but it doesn't support TypeScript syntax; either it crashes, or
    // it ignores the syntax, or it falsely reports against it. In these cases, we create what we call an extension
    // rule; a rule within our plugin that has the same functionality, but also supports TypeScript.
    // You must disable the base rule to avoid duplicate/incorrect errors for an extension rule.
    // Enforce consistent brace style for blocks  🔧
    '@stylistic/brace-style': [
        'error',
        'stroustrup',
        {
            allowSingleLine: true
        }
    ],
    // Require or disallow trailing commas  🔧
    '@stylistic/comma-dangle': 'error',
    // Enforce consistent spacing before and after commas  🔧
    '@stylistic/comma-spacing': 'error',
    // Enforce default parameters to be last
    'default-param-last': 'off',
    '@typescript-eslint/default-param-last': 'error',
    // Enforce dot notation whenever possible 🔒 🔧 💭
    'dot-notation': 'off',
    '@typescript-eslint/dot-notation': 'error',
    // Require or disallow spacing between function identifiers and their invocations  🔧
    '@stylistic/func-call-spacing': 'error',
    // Enforce consistent indentation  🔧
    indent: 'off',
    '@typescript-eslint/indent': 'off',
    // Require or disallow initialization in variable declarations
    'init-declarations': 'off',
    '@typescript-eslint/init-declarations': 'off',
    // Enforce consistent spacing before and after keywords  🔧
    '@stylistic/keyword-spacing': [
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
    // Require or disallow an empty line between class members  🔧
    'lines-between-class-members': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    // Disallow generic Array constructors ✅ 🔧
    'no-array-constructor': 'off',
    '@typescript-eslint/no-array-constructor': 'error',
    // Disallow duplicate class members
    'no-dupe-class-members': 'off',
    '@typescript-eslint/no-dupe-class-members': 'error',
    // Disallow duplicate imports
    'no-duplicate-imports': 'off',
    '@typescript-eslint/no-duplicate-imports': 'off',
    // Disallow empty functions ✅
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'error',
    // Disallow unnecessary parentheses  🔧
    'no-extra-parens': 'off',
    '@typescript-eslint/no-extra-parens': 'off',
    // Disallow unnecessary semicolons ✅ 🔧
    '@stylistic/no-extra-semi': 'error',
    // Disallow the use of eval()-like methods ✅  💭
    'no-implied-eval': 'off',
    '@typescript-eslint/no-implied-eval': 'off',
    // Disallow this keywords outside of classes or class-like objects
    'no-invalid-this': 'off',
    '@typescript-eslint/no-invalid-this': 'error',
    // Disallow function declarations that contain unsafe references inside loop statements
    'no-loop-func': 'off',
    '@typescript-eslint/no-loop-func': 'error',
    // Disallow literal numbers that lose precision ✅
    'no-loss-of-precision': 'off',
    '@typescript-eslint/no-loss-of-precision': 'error',
    // Disallow magic numbers
    'no-magic-numbers': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    // Disallow variable redeclaration
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': 'error',
    // Disallow specified modules when loaded by import
    'no-restricted-imports': 'off',
    '@typescript-eslint/no-restricted-imports': 'error',
    // Disallow variable declarations from shadowing variables declared in the outer scope
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'off',
    // Disallow throwing literals as exceptions 🔒  💭
    'no-throw-literal': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    // Disallow unused expressions
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    // Disallow unused variables ✅
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
        'error',
        {
            // We don't want to turn this on because of the example in https://github.com/phetsims/chipper/issues/1230#issuecomment-1185843199
            vars: 'all',
            args: 'none',
            caughtErrors: 'none'
        }
    ],
    // Disallow the use of variables before they are defined
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    // Disallow unnecessary constructors 🔒
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'off',
    // Enforce consistent spacing inside braces  🔧
    '@stylistic/object-curly-spacing': [
        'error',
        'always'
    ],
    // Require or disallow padding lines between statements  🔧 🛠
    '@stylistic/padding-line-between-statements': 'error',
    // Enforce the consistent use of either backticks, double, or single quotes  🔧
    '@stylistic/quotes': [
        'error',
        'single'
    ],
    // Disallow async functions which have no await expression ✅  💭
    'require-await': 'off',
    '@typescript-eslint/require-await': 'off',
    // Enforce consistent returning of awaited values  🔧 🛠 💭
    'return-await': 'off',
    '@typescript-eslint/return-await': 'off',
    // Require or disallow semicolons instead of ASI  🔧
    '@stylistic/semi': [
        'error',
        'always'
    ],
    // Enforce consistent spacing before blocks  🔧
    '@stylistic/space-before-blocks': 'error',
    // Enforce consistent spacing before function parenthesis  🔧
    '@stylistic/space-before-function-paren': [
        'error',
        {
            anonymous: 'never',
            named: 'never',
            asyncArrow: 'always'
        }
    ],
    // Require spacing around infix operators  🔧
    '@stylistic/space-infix-ops': 'error',
    ////////////////////////////////////////////////////////////////////////
    // Custom TypeScript Rules
    'phet/bad-typescript-text': 'error',
    'phet/no-simple-type-checking-assertions': 'error',
    // Custom return type rule that only requires for methods. The includes return type was too overarching.
    'phet/explicit-method-return-type': 'error',
    // Variables that are Properties should end in "Property", like const myProperty = new Property();
    'phet/require-property-suffix': 'error',
    // Static fields should have the 'readonly' modifier
    'phet/uppercase-statics-should-be-readonly': 'error',
    // Prevent spread operator on non-literals because it does not do excess property detection. In general, this rule
    // helps catch potential errors, and mistakes with PhET's option pattern, but please feel free to disable this rule
    // in cases where you feel confident, and strongly don't want the type safety of excess property checking.
    'phet/no-object-spread-on-non-literals': 'error',
    // Often we mistakenly Pick<PhetioObject,'tandem'> but it should be picked from PhetioObjectOptions
    'phet/phet-io-object-options-should-not-pick-from-phet-io-object': 'error'
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvY29uZmlnL3V0aWwvcm9vdFJ1bGVzVHlwZVNjcmlwdC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVHlwZXNjcmlwdC1FU0xpbnQgcnVsZXMgZm9yIG91ciBUeXBlU2NyaXB0IGNvZGViYXNlLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcblxuICAvLyBUeXBlU2NyaXB0IEVTTGludCBSdWxlcy4gIExlZ2VuZFxuICAvLyDinIUgLSByZWNvbW1lbmRlZFxuICAvLyDwn5SSIC0gc3RyaWN0XG4gIC8vIPCflKcgLSBmaXhhYmxlXG4gIC8vIPCfm6AgLSBoYXMtc3VnZ2VzdGlvbnNcbiAgLy8g8J+SrSAtIHJlcXVpcmVzIHR5cGUgaW5mb3JtYXRpb25cblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gU3VwcG9ydGVkIFJ1bGVzXG5cbiAgLy8gUmVxdWlyZSB0aGF0IG1lbWJlciBvdmVybG9hZHMgYmUgY29uc2VjdXRpdmUg4pyFXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvYWRqYWNlbnQtb3ZlcmxvYWQtc2lnbmF0dXJlcyc6ICdlcnJvcicsXG5cbiAgLy8gUmVxdWlyZSB1c2luZyBlaXRoZXIgVFtdIG9yIEFycmF5PFQ+IGZvciBhcnJheXMg8J+UkiDwn5SnXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvYXJyYXktdHlwZSc6ICdvZmYnLCAvLyBXZSBhZ3JlZWQgdGhpcyBzaG91bGQgYmUgZGV2ZWxvcGVyIHByZWZlcmVuY2VcblxuICAvLyBEaXNhbGxvdyBhd2FpdGluZyBhIHZhbHVlIHRoYXQgaXMgbm90IGEgVGhlbmFibGUg4pyFICDwn5KtXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvYXdhaXQtdGhlbmFibGUnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IEB0cy08ZGlyZWN0aXZlPiBjb21tZW50cyBvciByZXF1aXJlIGRlc2NyaXB0aW9ucyBhZnRlciBkaXJlY3RpdmUg4pyFXG4gIC8vIEEgdmFsdWUgb2YgdHJ1ZSBmb3IgYSBwYXJ0aWN1bGFyIGRpcmVjdGl2ZSBtZWFucyB0aGF0IHRoaXMgcnVsZSB3aWxsIHJlcG9ydCBpZiBpdCBmaW5kcyBhbnkgdXNhZ2Ugb2Ygc2FpZCBkaXJlY3RpdmUuXG4gIC8vIFNlZSBiYW5UU0NvbW1lbnRDb25maWcubWpzIGZvciBhIHJldXNhYmxlIHN0cmljdCBjb25maWd1cmF0aW9uLlxuICAnQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50JzogWyAnZXJyb3InLCB7XG4gICAgJ3RzLWlnbm9yZSc6IGZhbHNlLCAvLyBDb3ZlcmVkIGJ5ICdAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLXRzLWV4cGVjdC1lcnJvcidcbiAgICAndHMtY2hlY2snOiB0cnVlLFxuICAgICd0cy1leHBlY3QtZXJyb3InOiBmYWxzZSwgLy8gVE9ETzogQ2hpcCB3YXkgYXMgZGV2IHRlYW0gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEyNzdcbiAgICAndHMtbm9jaGVjayc6IGZhbHNlIC8vIFRPRE86IENoaXAgd2F5IGFzIGRldiB0ZWFtIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG4gIH0gXSxcblxuICAvLyBEaXNhbGxvdyAvLyB0c2xpbnQ6PHJ1bGUtZmxhZz4gY29tbWVudHMg8J+UkiDwn5SnXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzbGludC1jb21tZW50JzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBjZXJ0YWluIHR5cGVzIOKchSDwn5SnXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVzdHJpY3RlZC10eXBlcyc6IFtcbiAgICAnZXJyb3InLFxuICAgIHtcbiAgICAgIHR5cGVzOiB7XG4gICAgICAgIE9taXQ6IHtcbiAgICAgICAgICBtZXNzYWdlOiAnUHJlZmVyIFN0cmljdE9taXQgZm9yIHR5cGUgc2FmZXR5JyxcbiAgICAgICAgICBmaXhXaXRoOiAnU3RyaWN0T21pdCdcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBEZWZhdWx0cyBjb3BpZWQgZnJvbSBodHRwOi8vY29uZGVuc2VkLnBoeXNpY3MudXN5ZC5lZHUuYXUvZnJvbnRlbmQvbm9kZV9tb2R1bGVzL0B0eXBlc2NyaXB0LWVzbGludC9lc2xpbnQtcGx1Z2luL2RvY3MvcnVsZXMvYmFuLXR5cGVzLm1kXG4gICAgICAgIFN0cmluZzoge1xuICAgICAgICAgIG1lc3NhZ2U6ICdVc2Ugc3RyaW5nIGluc3RlYWQnLFxuICAgICAgICAgIGZpeFdpdGg6ICdzdHJpbmcnXG4gICAgICAgIH0sXG4gICAgICAgIEJvb2xlYW46IHtcbiAgICAgICAgICBtZXNzYWdlOiAnVXNlIGJvb2xlYW4gaW5zdGVhZCcsXG4gICAgICAgICAgZml4V2l0aDogJ2Jvb2xlYW4nXG4gICAgICAgIH0sXG4gICAgICAgIE51bWJlcjoge1xuICAgICAgICAgIG1lc3NhZ2U6ICdVc2UgbnVtYmVyIGluc3RlYWQnLFxuICAgICAgICAgIGZpeFdpdGg6ICdudW1iZXInXG4gICAgICAgIH0sXG4gICAgICAgIFN5bWJvbDoge1xuICAgICAgICAgIG1lc3NhZ2U6ICdVc2Ugc3ltYm9sIGluc3RlYWQnLFxuICAgICAgICAgIGZpeFdpdGg6ICdzeW1ib2wnXG4gICAgICAgIH0sXG4gICAgICAgIEJpZ0ludDoge1xuICAgICAgICAgIG1lc3NhZ2U6ICdVc2UgYmlnaW50IGluc3RlYWQnLFxuICAgICAgICAgIGZpeFdpdGg6ICdiaWdpbnQnXG4gICAgICAgIH0sXG4gICAgICAgIEZ1bmN0aW9uOiB7XG4gICAgICAgICAgbWVzc2FnZTogW1xuICAgICAgICAgICAgJ1RoZSBgRnVuY3Rpb25gIHR5cGUgYWNjZXB0cyBhbnkgZnVuY3Rpb24tbGlrZSB2YWx1ZS4nLFxuICAgICAgICAgICAgJ0l0IHByb3ZpZGVzIG5vIHR5cGUgc2FmZXR5IHdoZW4gY2FsbGluZyB0aGUgZnVuY3Rpb24sIHdoaWNoIGNhbiBiZSBhIGNvbW1vbiBzb3VyY2Ugb2YgYnVncy4nLFxuICAgICAgICAgICAgJ0l0IGFsc28gYWNjZXB0cyB0aGluZ3MgbGlrZSBjbGFzcyBkZWNsYXJhdGlvbnMsIHdoaWNoIHdpbGwgdGhyb3cgYXQgcnVudGltZSBhcyB0aGV5IHdpbGwgbm90IGJlIGNhbGxlZCB3aXRoIGBuZXdgLicsXG4gICAgICAgICAgICAnSWYgeW91IGFyZSBleHBlY3RpbmcgdGhlIGZ1bmN0aW9uIHRvIGFjY2VwdCBjZXJ0YWluIGFyZ3VtZW50cywgeW91IHNob3VsZCBleHBsaWNpdGx5IGRlZmluZSB0aGUgZnVuY3Rpb24gc2hhcGUuJ1xuICAgICAgICAgIF0uam9pbiggJ1xcbicgKVxuICAgICAgICB9LFxuICAgICAgICAvLyBvYmplY3QgdHlwaW5nXG4gICAgICAgIE9iamVjdDoge1xuICAgICAgICAgIG1lc3NhZ2U6IFtcbiAgICAgICAgICAgICdUaGUgYE9iamVjdGAgdHlwZSBhY3R1YWxseSBtZWFucyBcImFueSBub24tbnVsbGlzaCB2YWx1ZVwiLCBzbyBpdCBpcyBtYXJnaW5hbGx5IGJldHRlciB0aGFuIGB1bmtub3duYC4nLFxuICAgICAgICAgICAgJy0gSWYgeW91IHdhbnQgYSB0eXBlIG1lYW5pbmcgXCJhbnkgb2JqZWN0XCIsIHlvdSBwcm9iYWJseSB3YW50IGBvYmplY3RgIGluc3RlYWQuJyxcbiAgICAgICAgICAgICctIElmIHlvdSB3YW50IGEgdHlwZSBtZWFuaW5nIFwiYW55IHZhbHVlXCIsIHlvdSBwcm9iYWJseSB3YW50IGB1bmtub3duYCBpbnN0ZWFkLicsXG4gICAgICAgICAgICAnLSBJZiB5b3UgcmVhbGx5IHdhbnQgYSB0eXBlIG1lYW5pbmcgXCJhbnkgbm9uLW51bGxpc2ggdmFsdWVcIiwgeW91IHByb2JhYmx5IHdhbnQgYE5vbk51bGxhYmxlPHVua25vd24+YCBpbnN0ZWFkLidcbiAgICAgICAgICBdLmpvaW4oICdcXG4nICksXG4gICAgICAgICAgc3VnZ2VzdDogWyAnb2JqZWN0JywgJ3Vua25vd24nLCAnTm9uTnVsbGFibGU8dW5rbm93bj4nIF1cbiAgICAgICAgfSxcbiAgICAgICAgJ3t9Jzoge1xuICAgICAgICAgIG1lc3NhZ2U6IFtcbiAgICAgICAgICAgICdge31gIGFjdHVhbGx5IG1lYW5zIFwiYW55IG5vbi1udWxsaXNoIHZhbHVlXCIuJyxcbiAgICAgICAgICAgICctIElmIHlvdSB3YW50IGEgdHlwZSBtZWFuaW5nIFwiYW55IG9iamVjdFwiLCB5b3UgcHJvYmFibHkgd2FudCBgb2JqZWN0YCBpbnN0ZWFkLicsXG4gICAgICAgICAgICAnLSBJZiB5b3Ugd2FudCBhIHR5cGUgbWVhbmluZyBcImFueSB2YWx1ZVwiLCB5b3UgcHJvYmFibHkgd2FudCBgdW5rbm93bmAgaW5zdGVhZC4nLFxuICAgICAgICAgICAgJy0gSWYgeW91IHdhbnQgYSB0eXBlIG1lYW5pbmcgXCJlbXB0eSBvYmplY3RcIiwgeW91IHByb2JhYmx5IHdhbnQgYFJlY29yZDxzdHJpbmcsIG5ldmVyPmAgaW5zdGVhZC4nLFxuICAgICAgICAgICAgJy0gSWYgeW91IHJlYWxseSB3YW50IGEgdHlwZSBtZWFuaW5nIFwiYW55IG5vbi1udWxsaXNoIHZhbHVlXCIsIHlvdSBwcm9iYWJseSB3YW50IGBOb25OdWxsYWJsZTx1bmtub3duPmAgaW5zdGVhZC4nXG4gICAgICAgICAgXS5qb2luKCAnXFxuJyApLFxuICAgICAgICAgIHN1Z2dlc3Q6IFtcbiAgICAgICAgICAgICdvYmplY3QnLFxuICAgICAgICAgICAgJ3Vua25vd24nLFxuICAgICAgICAgICAgJ1JlY29yZDxzdHJpbmcsIG5ldmVyPicsXG4gICAgICAgICAgICAnTm9uTnVsbGFibGU8dW5rbm93bj4nXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICBdLFxuXG4gIC8vIEVuZm9yY2UgdGhhdCBsaXRlcmFscyBvbiBjbGFzc2VzIGFyZSBleHBvc2VkIGluIGEgY29uc2lzdGVudCBzdHlsZSDwn5SSIPCflKdcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9jbGFzcy1saXRlcmFsLXByb3BlcnR5LXN0eWxlJzogJ29mZicsIC8vIFRoaXMgcnVsZSBpcyBub3QgY29tcGF0aWJsZSB3aXRoIG91ciBtaXhpbiBzdHJhdGVneSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc5XG5cbiAgLy8gRW5mb3JjZSBzcGVjaWZ5aW5nIGdlbmVyaWMgdHlwZSBhcmd1bWVudHMgb24gdHlwZSBhbm5vdGF0aW9uIG9yIGNvbnN0cnVjdG9yIG5hbWUgb2YgYSBjb25zdHJ1Y3RvciBjYWxsIPCflJIg8J+Up1xuICAnQHR5cGVzY3JpcHQtZXNsaW50L2NvbnNpc3RlbnQtZ2VuZXJpYy1jb25zdHJ1Y3RvcnMnOiAnZXJyb3InLCAvLyBJdCBzZWVtcyBwcmVmZXJhYmxlIHRvIHNwZWNpZnkgdGhlIHR5cGUgcGFyYW1ldGVycyBhdCB0aGUgYG5ld2AgaW5zdGFudGlhdGlvbiBzaXRlXG5cbiAgLy8gUmVxdWlyZSBvciBkaXNhbGxvdyB0aGUgUmVjb3JkIHR5cGUg8J+UkiDwn5SnXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvY29uc2lzdGVudC1pbmRleGVkLW9iamVjdC1zdHlsZSc6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSBjb25zaXN0ZW50IHVzYWdlIG9mIHR5cGUgYXNzZXJ0aW9ucyDwn5SSXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvY29uc2lzdGVudC10eXBlLWFzc2VydGlvbnMnOiAnZXJyb3InLFxuXG4gIC8vIEVuZm9yY2UgdHlwZSBkZWZpbml0aW9ucyB0byBjb25zaXN0ZW50bHkgdXNlIGVpdGhlciBpbnRlcmZhY2Ugb3IgdHlwZSDwn5SSIPCflKdcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9jb25zaXN0ZW50LXR5cGUtZGVmaW5pdGlvbnMnOiBbICdlcnJvcicsICd0eXBlJyBdLCAvLyBXZSBwcmVmZXIgdXNpbmcgVHlwZS1BbGlhc1xuXG4gIC8vIEVuZm9yY2UgY29uc2lzdGVudCB1c2FnZSBvZiB0eXBlIGV4cG9ydHMgIPCflKcg8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L2NvbnNpc3RlbnQtdHlwZS1leHBvcnRzJzogJ29mZicsIC8vIFdlIGRpZCBub3Qgb2JzZXJ2ZSBhIHBlcmZvcm1hbmNlIGJvb3N0LCBub3IgZG8gd2Ugc2VlIGEgc2lnbmlmaWNhbnQgYmVuZWZpdCBmcm9tIHRoaXMgcnVsZS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjgzXG5cbiAgLy8gRW5mb3JjZSBjb25zaXN0ZW50IHVzYWdlIG9mIHR5cGUgaW1wb3J0cyAg8J+Up1xuICAnQHR5cGVzY3JpcHQtZXNsaW50L2NvbnNpc3RlbnQtdHlwZS1pbXBvcnRzJzogJ29mZicsIC8vIFdlIGRpZCBub3Qgb2JzZXJ2ZSBhIHBlcmZvcm1hbmNlIGJvb3N0LCBub3IgZG8gd2Ugc2VlIGEgc2lnbmlmaWNhbnQgYmVuZWZpdCBmcm9tIHRoaXMgcnVsZS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjgzXG5cbiAgLy8gUmVxdWlyZSBleHBsaWNpdCByZXR1cm4gdHlwZXMgb24gZnVuY3Rpb25zIGFuZCBjbGFzcyBtZXRob2RzXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtZnVuY3Rpb24tcmV0dXJuLXR5cGUnOiAnb2ZmJywgLy8gV2Ugd2FudCB0byB1c2UgaW5mZXJlbmNlIG9uIGxvY2FsIGFycm93IGZ1bmN0aW9ucy4gV2UgdXNlIGV4cGxpY2l0LW1ldGhvZC1yZXR1cm4tdHlwZSBmb3IgdGhlIGltcG9ydGFudCBjYXNlcy5cblxuICAvLyBSZXF1aXJlIGV4cGxpY2l0IGFjY2Vzc2liaWxpdHkgbW9kaWZpZXJzIG9uIGNsYXNzIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMgIPCflKdcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tZW1iZXItYWNjZXNzaWJpbGl0eSc6ICdlcnJvcicsXG5cbiAgLy8gUmVxdWlyZSBleHBsaWNpdCByZXR1cm4gYW5kIGFyZ3VtZW50IHR5cGVzIG9uIGV4cG9ydGVkIGZ1bmN0aW9ucycgYW5kIGNsYXNzZXMnIHB1YmxpYyBjbGFzcyBtZXRob2RzXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbW9kdWxlLWJvdW5kYXJ5LXR5cGVzJzogJ2Vycm9yJyxcblxuICAvLyBSZXF1aXJlIGEgc3BlY2lmaWMgbWVtYmVyIGRlbGltaXRlciBzdHlsZSBmb3IgaW50ZXJmYWNlcyBhbmQgdHlwZSBsaXRlcmFscyAg8J+Up1xuICAnQHN0eWxpc3RpYy9tZW1iZXItZGVsaW1pdGVyLXN0eWxlJzogJ2Vycm9yJywgLy8gc2VtaSBjb2xvbnMgaW4gdHlwZSBkZWNsYXJhdGlvbnMuXG5cbiAgLy8gUmVxdWlyZSBhIGNvbnNpc3RlbnQgbWVtYmVyIGRlY2xhcmF0aW9uIG9yZGVyXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbWVtYmVyLW9yZGVyaW5nJzogJ29mZicsIC8vIFdlIGFncmVlZCB0byBsZWF2ZSB0aGlzIHJ1bGUgb2ZmIGJlY2F1c2UgaXQgaXMgbW9yZSBpbXBvcnRhbnQgdG8gc29ydCBzZW1hbnRpY2FsbHkgdGhhbiBhbHBoYWJldGljYWxseVxuXG4gIC8vIEVuZm9yY2UgdXNpbmcgYSBwYXJ0aWN1bGFyIG1ldGhvZCBzaWduYXR1cmUgc3ludGF4ICDwn5SnXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbWV0aG9kLXNpZ25hdHVyZS1zdHlsZSc6ICdvZmYnLCAvLyBXZSBhZ3JlZWQgdG8gbGVhdmUgdGhpcyBhcyBkZXZlbG9wZXIgcHJlZmVyZW5jZS4gIFNvbWUgZGV2ZWxvcGVycyBwcmVmZXIgdG8gdXNlIG1ldGhvZCBzdHlsZSBpbiBpbnRlcmZhY2VzIGFuZCBwcm9wZXJ0eSBzdHlsZSBpbiB0eXBlcywgYnV0IHRoZSBydWxlIGRvZXNuJ3Qgc3VwcG9ydCB0aGF0IG9wdGlvbi5cblxuICAvLyBFbmZvcmNlIG5hbWluZyBjb252ZW50aW9ucyBmb3IgZXZlcnl0aGluZyBhY3Jvc3MgYSBjb2RlYmFzZSAgIPCfkq1cbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvbic6ICdvZmYnLCAvLyBUT0RPOiBXZSBzaG91bGQgZGVjaWRlIG9uIHRoZSBjb252ZW50aW9ucyBhbmQgZW5hYmxlIHRoaXMgcnVsZS4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEyNzdcblxuICAvLyBSZXF1aXJlIC50b1N0cmluZygpIHRvIG9ubHkgYmUgY2FsbGVkIG9uIG9iamVjdHMgd2hpY2ggcHJvdmlkZSB1c2VmdWwgaW5mb3JtYXRpb24gd2hlbiBzdHJpbmdpZmllZCDwn5SSICDwn5KtXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tYmFzZS10by1zdHJpbmcnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IG5vbi1udWxsIGFzc2VydGlvbiBpbiBsb2NhdGlvbnMgdGhhdCBtYXkgYmUgY29uZnVzaW5nIPCflJIg8J+UpyDwn5ugXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tY29uZnVzaW5nLW5vbi1udWxsLWFzc2VydGlvbic6ICdlcnJvcicsXG5cbiAgLy8gUmVxdWlyZSBleHByZXNzaW9ucyBvZiB0eXBlIHZvaWQgdG8gYXBwZWFyIGluIHN0YXRlbWVudCBwb3NpdGlvbiAg8J+UpyDwn5ugIPCfkq1cbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1jb25mdXNpbmctdm9pZC1leHByZXNzaW9uJzogJ29mZicsIC8vIEl0IHRyYW5zZm9ybXMgYCgpID0+IHRoaXMudXBkYXRlKClgIHRvIGAoKSA9PiB7IHRoaXMudXBkYXRlKCk7IH1gLCBzbyBpcyBpdCByZWFsbHkgZGVzaXJhYmxlPyAgRXJyb3JzIGluIDIwMCBmaWxlc1xuXG4gIC8vIERpc2FsbG93IGR1cGxpY2F0ZSBlbnVtIG1lbWJlciB2YWx1ZXMg8J+UkiDwn5ugXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZHVwbGljYXRlLWVudW0tdmFsdWVzJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB1c2luZyB0aGUgZGVsZXRlIG9wZXJhdG9yIG9uIGNvbXB1dGVkIGtleSBleHByZXNzaW9ucyDwn5SSIPCflKdcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1keW5hbWljLWRlbGV0ZSc6ICdvZmYnLCAvLyBUT0RPOiBDb2RlIHNob3VsZCB1c2UgTWFwIG9yIFNldCBpbnN0ZWFkLiAgMjIgZmFpbHVyZXMgYXQgdGhlIG1vbWVudC4gIFdlIHdvdWxkIGxpa2UgdG8gZW5hYmxlIHRoaXMgcnVsZS4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEyNzdcblxuICAvLyBEaXNhbGxvdyB0aGUgZGVjbGFyYXRpb24gb2YgZW1wdHkgaW50ZXJmYWNlcyDinIUg8J+UpyDwn5ugXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZW1wdHktaW50ZXJmYWNlJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB0aGUgYW55IHR5cGUg4pyFIPCflKcg8J+boFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgZXh0cmEgbm9uLW51bGwgYXNzZXJ0aW9uIOKchSDwn5SnXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXh0cmEtbm9uLW51bGwtYXNzZXJ0aW9uJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBjbGFzc2VzIHVzZWQgYXMgbmFtZXNwYWNlcyDwn5SSXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXh0cmFuZW91cy1jbGFzcyc6ICdvZmYnLCAvLyBJdCBpcyBzb21ldGltZXMgdXNlZnVsIHRvIGhhdmUgYSBjbGFzcyB3aXRoIHN0YXRpYyBtZXRob2RzIHRoYXQgY2FuIGNhbGwgZWFjaCBvdGhlclxuXG4gIC8vIFJlcXVpcmUgUHJvbWlzZS1saWtlIHN0YXRlbWVudHMgdG8gYmUgaGFuZGxlZCBhcHByb3ByaWF0ZWx5IOKchSDwn5ugIPCfkq1cbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1mbG9hdGluZy1wcm9taXNlcyc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgaXRlcmF0aW5nIG92ZXIgYW4gYXJyYXkgd2l0aCBhIGZvci1pbiBsb29wIOKchSAg8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLWZvci1pbi1hcnJheSc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdXNhZ2Ugb2YgdGhlIGltcGxpY2l0IGFueSB0eXBlIGluIGNhdGNoIGNsYXVzZXMgIPCflKcg8J+boFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLWltcGxpY2l0LWFueS1jYXRjaCc6ICdvZmYnLCAvLyBEZXByZWNhdGVkIHJ1bGVcblxuICAvLyBEaXNhbGxvdyBleHBsaWNpdCB0eXBlIGRlY2xhcmF0aW9ucyBmb3IgdmFyaWFibGVzIG9yIHBhcmFtZXRlcnMgaW5pdGlhbGl6ZWQgdG8gYSBudW1iZXIsIHN0cmluZywgb3IgYm9vbGVhbiDinIUg8J+Up1xuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLWluZmVycmFibGUtdHlwZXMnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHZvaWQgdHlwZSBvdXRzaWRlIG9mIGdlbmVyaWMgb3IgcmV0dXJuIHR5cGVzIPCflJJcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1pbnZhbGlkLXZvaWQtdHlwZSc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdGhlIHZvaWQgb3BlcmF0b3IgZXhjZXB0IHdoZW4gdXNlZCB0byBkaXNjYXJkIGEgdmFsdWUg8J+UkiDwn5SnIPCfm6Ag8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLW1lYW5pbmdsZXNzLXZvaWQtb3BlcmF0b3InOiAnZXJyb3InLFxuXG4gIC8vIEVuZm9yY2UgdmFsaWQgZGVmaW5pdGlvbiBvZiBuZXcgYW5kIGNvbnN0cnVjdG9yIOKchVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLW1pc3VzZWQtbmV3JzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBQcm9taXNlcyBpbiBwbGFjZXMgbm90IGRlc2lnbmVkIHRvIGhhbmRsZSB0aGVtIOKchSAg8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLW1pc3VzZWQtcHJvbWlzZXMnOiAnb2ZmJywgLy8gVE9ETzogRGlzY3VzcyB0aGlzIHJ1bGUuICA2IGZhaWx1cmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gRGlzYWxsb3cgY3VzdG9tIFR5cGVTY3JpcHQgbW9kdWxlcyBhbmQgbmFtZXNwYWNlcyDinIVcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1uYW1lc3BhY2UnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IG5vbi1udWxsIGFzc2VydGlvbnMgaW4gdGhlIGxlZnQgb3BlcmFuZCBvZiBhIG51bGxpc2ggY29hbGVzY2luZyBvcGVyYXRvciDwn5SSIPCfm6BcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRlZC1udWxsaXNoLWNvYWxlc2NpbmcnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IG5vbi1udWxsIGFzc2VydGlvbnMgYWZ0ZXIgYW4gb3B0aW9uYWwgY2hhaW4gZXhwcmVzc2lvbiDinIUg8J+boFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGVkLW9wdGlvbmFsLWNoYWluJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBub24tbnVsbCBhc3NlcnRpb25zIHVzaW5nIHRoZSAhIHBvc3RmaXggb3BlcmF0b3Ig4pyFIPCfm6BcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb24nOiAnb2ZmJywgLy8gV2UgZG8gbm90IHN1cHBvcnQgdGhpcyBydWxlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzExMTQjaXNzdWVjb21tZW50LTEwOTk1MzYxMzNcblxuICAvLyBEaXNhbGxvdyB0aGUgdXNlIG9mIHBhcmFtZXRlciBwcm9wZXJ0aWVzIGluIGNsYXNzIGNvbnN0cnVjdG9yc1xuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXBhcmFtZXRlci1wcm9wZXJ0aWVzJzogJ29mZicsIC8vIFRoaXMgcnVsZSBpcyBkZXByZWNhdGVkLlxuXG4gIC8vIERpc2FsbG93IG1lbWJlcnMgb2YgdW5pb25zIGFuZCBpbnRlcnNlY3Rpb25zIHRoYXQgZG8gbm90aGluZyBvciBvdmVycmlkZSB0eXBlIGluZm9ybWF0aW9uICAg8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlZHVuZGFudC10eXBlLWNvbnN0aXR1ZW50cyc6ICdvZmYnLFxuXG4gIC8vIERpc2FsbG93IGludm9jYXRpb24gb2YgcmVxdWlyZSgpXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyBhbGlhc2luZyB0aGlzIOKchVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXMnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHR5cGUgYWxpYXNlc1xuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXR5cGUtYWxpYXMnOiAnb2ZmJywgLy8gV2UgdXNlIHR5cGUtYWxpYXMgZnJlcXVlbnRseSBhbmQgcHJlZmVyIHRoZW0gb3ZlciBpbnRlcmZhY2VzXG5cbiAgLy8gRGlzYWxsb3cgdW5uZWNlc3NhcnkgZXF1YWxpdHkgY29tcGFyaXNvbnMgYWdhaW5zdCBib29sZWFuIGxpdGVyYWxzIPCflJIg8J+UpyDwn5KtXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5uZWNlc3NhcnktYm9vbGVhbi1saXRlcmFsLWNvbXBhcmUnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGNvbmRpdGlvbmFscyB3aGVyZSB0aGUgdHlwZSBpcyBhbHdheXMgdHJ1dGh5IG9yIGFsd2F5cyBmYWxzeSDwn5SSIPCflKcg8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LWNvbmRpdGlvbic6ICdvZmYnLCAvLyBUT0RPOiBXb3VsZCBiZSBuaWNlIHRvIGVuYWJsZSBidXQgNTAwIHByb2JsZW1zIG1heSBwcmV2ZW50IHVzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gRGlzYWxsb3cgdW5uZWNlc3NhcnkgbmFtZXNwYWNlIHF1YWxpZmllcnMgIPCflKcg8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXF1YWxpZmllcic6ICdvZmYnLCAvLyBUT0RPOiBFbmFibGUgdGhpcyBydWxlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gRGlzYWxsb3cgdHlwZSBhcmd1bWVudHMgdGhhdCBhcmUgZXF1YWwgdG8gdGhlIGRlZmF1bHQg8J+UkiDwn5SnIPCfkq1cbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby11bm5lY2Vzc2FyeS10eXBlLWFyZ3VtZW50cyc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdHlwZSBhc3NlcnRpb25zIHRoYXQgZG8gbm90IGNoYW5nZSB0aGUgdHlwZSBvZiBhbiBleHByZXNzaW9uIOKchSDwn5SnIPCfkq1cbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby11bm5lY2Vzc2FyeS10eXBlLWFzc2VydGlvbic6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgdW5uZWNlc3NhcnkgY29uc3RyYWludHMgb24gZ2VuZXJpYyB0eXBlcyDinIUg8J+boFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtY29uc3RyYWludCc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgY2FsbGluZyBhIGZ1bmN0aW9uIHdpdGggYSB2YWx1ZSB3aXRoIHR5cGUgYW55IOKchSAg8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1hcmd1bWVudCc6ICdvZmYnLCAvLyBUT0RPOiBXZSBzaG91bGQgZW5hYmxlIHRoaXMgcnVsZSwgYnV0IGl0IG1heSBiZSB0cmlja3kgc2luY2Ugc29tZSBvZiB0aGUgYW55IGNvbWUgZnJvbSBKUyBmaWxlcy4gNDEyIGZhaWx1cmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gRGlzYWxsb3cgYXNzaWduaW5nIGEgdmFsdWUgd2l0aCB0eXBlIGFueSB0byB2YXJpYWJsZXMgYW5kIHByb3BlcnRpZXMg4pyFICDwn5KtXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFzc2lnbm1lbnQnOiAnb2ZmJywgLy8gVE9ETzogRW5hYmxlIHRoaXMgcnVsZSBzaW5jZSBpdCB3aWxsIGhlbHAgdXMgYXZvaWQgYW55LiAgNTQ3IHByb2JsZW1zLCB3aWxsIG5lZWQgdG8gY2hpcC1hd2F5IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gRGlzYWxsb3cgY2FsbGluZyBhIHZhbHVlIHdpdGggdHlwZSBhbnkg4pyFICDwn5KtXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWNhbGwnOiAnb2ZmJywgLy8gVE9ETzogRW5hYmxlIHRoaXMgcnVsZSBzaW5jZSBpdCB3aWxsIGhlbHAgdXMgYXZvaWQgYW55IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gRGlzYWxsb3cgbWVtYmVyIGFjY2VzcyBvbiBhIHZhbHVlIHdpdGggdHlwZSBhbnkg4pyFICDwn5KtXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLW1lbWJlci1hY2Nlc3MnOiAnb2ZmJywgLy8gVE9ETzogRW5hYmxlIHRoaXMgcnVsZSBzaW5jZSBpdCB3aWxsIGhlbHAgdXMgYXZvaWQgYW55IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gRGlzYWxsb3cgcmV0dXJuaW5nIGEgdmFsdWUgd2l0aCB0eXBlIGFueSBmcm9tIGEgZnVuY3Rpb24g4pyFICDwn5KtXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLXJldHVybic6ICdvZmYnLCAvLyBUT0RPOiBFbmFibGUgdGhpcyBydWxlIHNpbmNlIGl0IHdpbGwgaGVscCB1cyBhdm9pZCBhbnkgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEyNzdcblxuICAvLyBEaXNhbGxvdyBlbXB0eSBleHBvcnRzIHRoYXQgZG9uJ3QgY2hhbmdlIGFueXRoaW5nIGluIGEgbW9kdWxlIGZpbGUgIPCflKcg8J+boFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXVzZWxlc3MtZW1wdHktZXhwb3J0JzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyByZXF1aXJlIHN0YXRlbWVudHMgZXhjZXB0IGluIGltcG9ydCBzdGF0ZW1lbnRzIOKchVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlcyc6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSBub24tbnVsbCBhc3NlcnRpb25zIG92ZXIgZXhwbGljaXQgdHlwZSBjYXN0cyDwn5SSIPCflKcg8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vbi1udWxsYWJsZS10eXBlLWFzc2VydGlvbi1zdHlsZSc6ICdlcnJvcicsXG5cbiAgLy8gUmVxdWlyZSBvciBkaXNhbGxvdyBwYXJhbWV0ZXIgcHJvcGVydGllcyBpbiBjbGFzcyBjb25zdHJ1Y3RvcnNcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9wYXJhbWV0ZXItcHJvcGVydGllcyc6ICdvZmYnLCAvLyBUT0RPOiBMZXQncyBkaXNjdXNzIGFzIGEgdGVhbS4gMTYgZmFpbHVyZXMuICBEaXNjdXNzIHBhcmFtZXRlciBwcm9wZXJ0aWVzIHRvIGRpc2N1c3Mgd2l0aCB0aGUgdGVhbS4gIFdyaXRlIHVwIHJlc3VsdHMgaW4gdGhlIHR5cGVzY3JpcHQtY29udmVudGlvbnMgZG9jIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gRW5mb3JjZSB0aGUgdXNlIG9mIGFzIGNvbnN0IG92ZXIgbGl0ZXJhbCB0eXBlIOKchSDwn5SnIPCfm6BcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItYXMtY29uc3QnOiAnZXJyb3InLFxuXG4gIC8vIFJlcXVpcmUgZWFjaCBlbnVtIG1lbWJlciB2YWx1ZSB0byBiZSBleHBsaWNpdGx5IGluaXRpYWxpemVkICDwn5ugXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLWVudW0taW5pdGlhbGl6ZXJzJzogJ2Vycm9yJyxcblxuICAvLyBFbmZvcmNlIHRoZSB1c2Ugb2YgZm9yLW9mIGxvb3Agb3ZlciB0aGUgc3RhbmRhcmQgZm9yIGxvb3Agd2hlcmUgcG9zc2libGUg8J+UklxuICAnQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1mb3Itb2YnOiAnb2ZmJywgLy8gVE9ETzogV2UgYWdyZWVkIHRvIGVuYWJsZSB0aGlzIHJ1bGUuICBJdCB3aWxsIHJlcXVpcmUgY2hpcC1hd2F5IHNpbmNlIGl0IGhhcyBubyBhdXRvZml4LiAgMjg5IGZhaWx1cmVzLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTI3N1xuXG4gIC8vIEVuZm9yY2UgdXNpbmcgZnVuY3Rpb24gdHlwZXMgaW5zdGVhZCBvZiBpbnRlcmZhY2VzIHdpdGggY2FsbCBzaWduYXR1cmVzIPCflJIg8J+Up1xuICAnQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1mdW5jdGlvbi10eXBlJzogJ29mZicsIC8vIFRPRE86IFdlIGFncmVlZCB0byBlbmFibGUgdGhpcyBydWxlLiAgNCBmYWlsdXJlcyBjYW4gYmUgYXV0b2ZpeGVkLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTI3N1xuXG4gIC8vIEVuZm9yY2UgaW5jbHVkZXMgbWV0aG9kIG92ZXIgaW5kZXhPZiBtZXRob2Qg8J+UkiDwn5SnIPCfkq1cbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItaW5jbHVkZXMnOiAnZXJyb3InLFxuXG4gIC8vIFJlcXVpcmUgYWxsIGVudW0gbWVtYmVycyB0byBiZSBsaXRlcmFsIHZhbHVlcyDwn5SSXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLWxpdGVyYWwtZW51bS1tZW1iZXInOiAnZXJyb3InLFxuXG4gIC8vIFJlcXVpcmUgdXNpbmcgbmFtZXNwYWNlIGtleXdvcmQgb3ZlciBtb2R1bGUga2V5d29yZCB0byBkZWNsYXJlIGN1c3RvbSBUeXBlU2NyaXB0IG1vZHVsZXMg4pyFIPCflKdcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItbmFtZXNwYWNlLWtleXdvcmQnOiAnZXJyb3InLFxuXG4gIC8vIEVuZm9yY2UgdXNpbmcgdGhlIG51bGxpc2ggY29hbGVzY2luZyBvcGVyYXRvciBpbnN0ZWFkIG9mIGxvZ2ljYWwgY2hhaW5pbmcg8J+UkiDwn5ugIPCfkq1cbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItbnVsbGlzaC1jb2FsZXNjaW5nJzogJ29mZicsIC8vIFRPRE86IEVuYWJsZSBydWxlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gRW5mb3JjZSB1c2luZyBjb25jaXNlIG9wdGlvbmFsIGNoYWluIGV4cHJlc3Npb25zIGluc3RlYWQgb2YgY2hhaW5lZCBsb2dpY2FsIGFuZHMg8J+UkiDwn5ugXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLW9wdGlvbmFsLWNoYWluJzogJ29mZicsIC8vIFRPRE86IFdlIHdvdWxkIGxpa2UgdG8gZGlzY3VzcyBhcyBhIHRlYW0uICBJdCBzZWVtcyBlYXNpZXIgdG8gcmVhZCBhbmQgd3JpdGUsIHNvIHdlIHdvdWxkIGxpa2UgdG8gcHVyc3VlIGl0LiAzMjI3IGZhaWx1cmVzLiAgTWFueSBjYXNlcyBtYXkgYmUgYXNzZXJ0aW9ucy4gIEJ1dCBzb21lIGRldmVsb3BlcnMgbWF5IHdhbnQgdG8gdXNlICYmIGluIHNvbWUgY2FzZXMuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gUmVxdWlyZSBwcml2YXRlIG1lbWJlcnMgdG8gYmUgbWFya2VkIGFzIHJlYWRvbmx5IGlmIHRoZXkncmUgbmV2ZXIgbW9kaWZpZWQgb3V0c2lkZSBvZiB0aGUgY29uc3RydWN0b3IgIPCflKcg8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1yZWFkb25seSc6ICdvZmYnLFxuXG4gIC8vIFJlcXVpcmUgZnVuY3Rpb24gcGFyYW1ldGVycyB0byBiZSB0eXBlZCBhcyByZWFkb25seSB0byBwcmV2ZW50IGFjY2lkZW50YWwgbXV0YXRpb24gb2YgaW5wdXRzICAg8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1yZWFkb25seS1wYXJhbWV0ZXItdHlwZXMnOiAnb2ZmJyxcblxuICAvLyBFbmZvcmNlIHVzaW5nIHR5cGUgcGFyYW1ldGVyIHdoZW4gY2FsbGluZyBBcnJheSNyZWR1Y2UgaW5zdGVhZCBvZiBjYXN0aW5nIPCflJIg8J+UpyDwn5KtXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLXJlZHVjZS10eXBlLXBhcmFtZXRlcic6ICdvZmYnLCAvLyBUT0RPOiBFbmFibGUgdGhpcyBydWxlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gRW5mb3JjZSBSZWdFeHAjZXhlYyBvdmVyIFN0cmluZyNtYXRjaCBpZiBubyBnbG9iYWwgZmxhZyBpcyBwcm92aWRlZCAg8J+UpyDwn5KtXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLXJlZ2V4cC1leGVjJzogJ29mZicsXG5cbiAgLy8gRW5mb3JjZSB0aGF0IHRoaXMgaXMgdXNlZCB3aGVuIG9ubHkgdGhpcyB0eXBlIGlzIHJldHVybmVkIPCflJIg8J+UpyDwn5KtXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLXJldHVybi10aGlzLXR5cGUnOiAnb2ZmJyxcblxuICAvLyBFbmZvcmNlIHVzaW5nIFN0cmluZyNzdGFydHNXaXRoIGFuZCBTdHJpbmcjZW5kc1dpdGggb3ZlciBvdGhlciBlcXVpdmFsZW50IG1ldGhvZHMgb2YgY2hlY2tpbmcgc3Vic3RyaW5ncyDwn5SSIPCflKcg8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1zdHJpbmctc3RhcnRzLWVuZHMtd2l0aCc6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSB1c2luZyBAdHMtZXhwZWN0LWVycm9yIG92ZXIgQHRzLWlnbm9yZSDwn5SSIPCflKdcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItdHMtZXhwZWN0LWVycm9yJzogJ2Vycm9yJyxcblxuICAvLyBSZXF1aXJlIGFueSBmdW5jdGlvbiBvciBtZXRob2QgdGhhdCByZXR1cm5zIGEgUHJvbWlzZSB0byBiZSBtYXJrZWQgYXN5bmMgIPCflKcg8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L3Byb21pc2UtZnVuY3Rpb24tYXN5bmMnOiAnb2ZmJyxcblxuICAvLyBSZXF1aXJlIEFycmF5I3NvcnQgY2FsbHMgdG8gYWx3YXlzIHByb3ZpZGUgYSBjb21wYXJlRnVuY3Rpb24gICDwn5KtXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvcmVxdWlyZS1hcnJheS1zb3J0LWNvbXBhcmUnOiAnb2ZmJyxcblxuICAvLyBSZXF1aXJlIGJvdGggb3BlcmFuZHMgb2YgYWRkaXRpb24gdG8gaGF2ZSB0eXBlIG51bWJlciBvciBzdHJpbmcg4pyFICDwn5KtXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvcmVzdHJpY3QtcGx1cy1vcGVyYW5kcyc6ICdvZmYnLFxuXG4gIC8vIEVuZm9yY2UgdGVtcGxhdGUgbGl0ZXJhbCBleHByZXNzaW9ucyB0byBiZSBvZiBzdHJpbmcgdHlwZSDinIUgIPCfkq1cbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9yZXN0cmljdC10ZW1wbGF0ZS1leHByZXNzaW9ucyc6ICdvZmYnLFxuXG4gIC8vIEVuZm9yY2UgbWVtYmVycyBvZiBhIHR5cGUgdW5pb24vaW50ZXJzZWN0aW9uIHRvIGJlIHNvcnRlZCBhbHBoYWJldGljYWxseSAg8J+UpyDwn5ugXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvc29ydC10eXBlLXVuaW9uLWludGVyc2VjdGlvbi1tZW1iZXJzJzogJ29mZicsIC8vIFdlIGFncmVlZCB0byBzb3J0IHRoaW5ncyBzZW1hbnRpY2FsbHkgcmF0aGVyIHRoYW4gYWxwaGFiZXRpY2FsbHlcblxuICAvLyBEaXNhbGxvdyBjZXJ0YWluIHR5cGVzIGluIGJvb2xlYW4gZXhwcmVzc2lvbnMgIPCflKcg8J+boCDwn5KtXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvc3RyaWN0LWJvb2xlYW4tZXhwcmVzc2lvbnMnOiAnb2ZmJywgLy8gVE9ETzogSXMgdGhpcyBhIGdvb2QgcnVsZSBmb3Igb3VyIHRlYW0/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gUmVxdWlyZSBzd2l0Y2gtY2FzZSBzdGF0ZW1lbnRzIHRvIGJlIGV4aGF1c3RpdmUgd2l0aCB1bmlvbiB0eXBlICDwn5ugIPCfkq1cbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9zd2l0Y2gtZXhoYXVzdGl2ZW5lc3MtY2hlY2snOiAnb2ZmJywgLy8gVE9ETzogRW5hYmxlIHJ1bGUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEyNzdcblxuICAvLyBEaXNhbGxvdyBjZXJ0YWluIHRyaXBsZSBzbGFzaCBkaXJlY3RpdmVzIGluIGZhdm9yIG9mIEVTNi1zdHlsZSBpbXBvcnQgZGVjbGFyYXRpb25zIOKchVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L3RyaXBsZS1zbGFzaC1yZWZlcmVuY2UnOiAnZXJyb3InLFxuXG4gIC8vIFJlcXVpcmUgY29uc2lzdGVudCBzcGFjaW5nIGFyb3VuZCB0eXBlIGFubm90YXRpb25zICDwn5SnXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvdHlwZS1hbm5vdGF0aW9uLXNwYWNpbmcnOiAnb2ZmJywgLy8gVE9ETzogSW52ZXN0aWdhdGUuICA3IGZhaWx1cmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gUmVxdWlyZSB0eXBlIGFubm90YXRpb25zIGluIGNlcnRhaW4gcGxhY2VzXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvdHlwZWRlZic6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSB1bmJvdW5kIG1ldGhvZHMgYXJlIGNhbGxlZCB3aXRoIHRoZWlyIGV4cGVjdGVkIHNjb3BlIOKchSAg8J+SrVxuICAnQHR5cGVzY3JpcHQtZXNsaW50L3VuYm91bmQtbWV0aG9kJzogJ29mZicsXG5cbiAgLy8gRGlzYWxsb3cgdHdvIG92ZXJsb2FkcyB0aGF0IGNvdWxkIGJlIHVuaWZpZWQgaW50byBvbmUgd2l0aCBhIHVuaW9uIG9yIGFuIG9wdGlvbmFsL3Jlc3QgcGFyYW1ldGVyIPCflJJcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC91bmlmaWVkLXNpZ25hdHVyZXMnOiAnb2ZmJywgLy8gVE9ETzogSW52ZXN0aWdhdGUuIFByb2JhYmx5IGVuYWJsZS4gNiBmYWlsdXJlcyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTI3N1xuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBFeHRlbnNpb24gUnVsZXNcbiAgLy8gSW4gc29tZSBjYXNlcywgRVNMaW50IHByb3ZpZGVzIGEgcnVsZSBpdHNlbGYsIGJ1dCBpdCBkb2Vzbid0IHN1cHBvcnQgVHlwZVNjcmlwdCBzeW50YXg7IGVpdGhlciBpdCBjcmFzaGVzLCBvclxuICAvLyBpdCBpZ25vcmVzIHRoZSBzeW50YXgsIG9yIGl0IGZhbHNlbHkgcmVwb3J0cyBhZ2FpbnN0IGl0LiBJbiB0aGVzZSBjYXNlcywgd2UgY3JlYXRlIHdoYXQgd2UgY2FsbCBhbiBleHRlbnNpb25cbiAgLy8gcnVsZTsgYSBydWxlIHdpdGhpbiBvdXIgcGx1Z2luIHRoYXQgaGFzIHRoZSBzYW1lIGZ1bmN0aW9uYWxpdHksIGJ1dCBhbHNvIHN1cHBvcnRzIFR5cGVTY3JpcHQuXG4gIC8vIFlvdSBtdXN0IGRpc2FibGUgdGhlIGJhc2UgcnVsZSB0byBhdm9pZCBkdXBsaWNhdGUvaW5jb3JyZWN0IGVycm9ycyBmb3IgYW4gZXh0ZW5zaW9uIHJ1bGUuXG5cbiAgLy8gRW5mb3JjZSBjb25zaXN0ZW50IGJyYWNlIHN0eWxlIGZvciBibG9ja3MgIPCflKdcbiAgJ0BzdHlsaXN0aWMvYnJhY2Utc3R5bGUnOiBbICdlcnJvcicsICdzdHJvdXN0cnVwJywgeyBhbGxvd1NpbmdsZUxpbmU6IHRydWUgfSBdLFxuXG4gIC8vIFJlcXVpcmUgb3IgZGlzYWxsb3cgdHJhaWxpbmcgY29tbWFzICDwn5SnXG4gICdAc3R5bGlzdGljL2NvbW1hLWRhbmdsZSc6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSBjb25zaXN0ZW50IHNwYWNpbmcgYmVmb3JlIGFuZCBhZnRlciBjb21tYXMgIPCflKdcbiAgJ0BzdHlsaXN0aWMvY29tbWEtc3BhY2luZyc6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSBkZWZhdWx0IHBhcmFtZXRlcnMgdG8gYmUgbGFzdFxuICAnZGVmYXVsdC1wYXJhbS1sYXN0JzogJ29mZicsXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvZGVmYXVsdC1wYXJhbS1sYXN0JzogJ2Vycm9yJyxcblxuICAvLyBFbmZvcmNlIGRvdCBub3RhdGlvbiB3aGVuZXZlciBwb3NzaWJsZSDwn5SSIPCflKcg8J+SrVxuICAnZG90LW5vdGF0aW9uJzogJ29mZicsXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvZG90LW5vdGF0aW9uJzogJ2Vycm9yJyxcblxuICAvLyBSZXF1aXJlIG9yIGRpc2FsbG93IHNwYWNpbmcgYmV0d2VlbiBmdW5jdGlvbiBpZGVudGlmaWVycyBhbmQgdGhlaXIgaW52b2NhdGlvbnMgIPCflKdcbiAgJ0BzdHlsaXN0aWMvZnVuYy1jYWxsLXNwYWNpbmcnOiAnZXJyb3InLFxuXG4gIC8vIEVuZm9yY2UgY29uc2lzdGVudCBpbmRlbnRhdGlvbiAg8J+Up1xuICBpbmRlbnQ6ICdvZmYnLFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L2luZGVudCc6ICdvZmYnLCAvLyBUaGlzIHJ1bGUgaGFzIDE1MTAyMyBmYWlsdXJlcywgcGVyaGFwcyBpdCBpcyBpbmNvbXBhdGlibGUgd2l0aCBvdXIgZm9ybWF0dGluZ1xuXG4gIC8vIFJlcXVpcmUgb3IgZGlzYWxsb3cgaW5pdGlhbGl6YXRpb24gaW4gdmFyaWFibGUgZGVjbGFyYXRpb25zXG4gICdpbml0LWRlY2xhcmF0aW9ucyc6ICdvZmYnLFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L2luaXQtZGVjbGFyYXRpb25zJzogJ29mZicsIC8vIDIzNyBGYWlsdXJlc1xuXG4gIC8vIEVuZm9yY2UgY29uc2lzdGVudCBzcGFjaW5nIGJlZm9yZSBhbmQgYWZ0ZXIga2V5d29yZHMgIPCflKdcbiAgJ0BzdHlsaXN0aWMva2V5d29yZC1zcGFjaW5nJzogWyAnZXJyb3InLCB7IC8vIFRPRE86IENoZWNrIHRoaXMgcnVsZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTI3N1xuICAgIGJlZm9yZTogdHJ1ZSxcbiAgICBhZnRlcjogdHJ1ZSxcbiAgICBvdmVycmlkZXM6IHtcbiAgICAgIGNhc2U6IHsgYWZ0ZXI6IHRydWUgfSwgLy8gZGVmYXVsdFxuICAgICAgc3dpdGNoOiB7IGFmdGVyOiBmYWxzZSB9LFxuICAgICAgY2F0Y2g6IHsgYWZ0ZXI6IGZhbHNlIH1cbiAgICB9XG4gIH0gXSxcblxuICAvLyBSZXF1aXJlIG9yIGRpc2FsbG93IGFuIGVtcHR5IGxpbmUgYmV0d2VlbiBjbGFzcyBtZW1iZXJzICDwn5SnXG4gICdsaW5lcy1iZXR3ZWVuLWNsYXNzLW1lbWJlcnMnOiAnb2ZmJyxcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9saW5lcy1iZXR3ZWVuLWNsYXNzLW1lbWJlcnMnOiAnb2ZmJywgLy8gUHJvYmFibHkgbGVhdmUgdGhpcyBvZmYsIGl0IGhhcyAyNzc1IGZhaWx1cmVzXG5cbiAgLy8gRGlzYWxsb3cgZ2VuZXJpYyBBcnJheSBjb25zdHJ1Y3RvcnMg4pyFIPCflKdcbiAgJ25vLWFycmF5LWNvbnN0cnVjdG9yJzogJ29mZicsXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tYXJyYXktY29uc3RydWN0b3InOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGR1cGxpY2F0ZSBjbGFzcyBtZW1iZXJzXG4gICduby1kdXBlLWNsYXNzLW1lbWJlcnMnOiAnb2ZmJyxcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1kdXBlLWNsYXNzLW1lbWJlcnMnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGR1cGxpY2F0ZSBpbXBvcnRzXG4gICduby1kdXBsaWNhdGUtaW1wb3J0cyc6ICdvZmYnLFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLWR1cGxpY2F0ZS1pbXBvcnRzJzogJ29mZicsIC8vIFRPRE86IERlcHJlY2F0ZWQuIEludmVzdGlnYXRlIHRoaXMgaW5zdGVhZCBodHRwczovL2dpdGh1Yi5jb20vaW1wb3J0LWpzL2VzbGludC1wbHVnaW4taW1wb3J0L2Jsb2IvSEVBRC9kb2NzL3J1bGVzL25vLWR1cGxpY2F0ZXMubWQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEyNzdcblxuICAvLyBEaXNhbGxvdyBlbXB0eSBmdW5jdGlvbnMg4pyFXG4gICduby1lbXB0eS1mdW5jdGlvbic6ICdvZmYnLFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWZ1bmN0aW9uJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB1bm5lY2Vzc2FyeSBwYXJlbnRoZXNlcyAg8J+Up1xuICAnbm8tZXh0cmEtcGFyZW5zJzogJ29mZicsXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXh0cmEtcGFyZW5zJzogJ29mZicsIC8vIHdlIGZpbmQgdGhhdCBleHRyYW5lb3VzIHBhcmVudGhlc2VzIHNvbWV0aW1lcyBpbXByb3ZlIHJlYWRhYmlsaXR5XG5cbiAgLy8gRGlzYWxsb3cgdW5uZWNlc3Nhcnkgc2VtaWNvbG9ucyDinIUg8J+Up1xuICAnQHN0eWxpc3RpYy9uby1leHRyYS1zZW1pJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB0aGUgdXNlIG9mIGV2YWwoKS1saWtlIG1ldGhvZHMg4pyFICDwn5KtXG4gICduby1pbXBsaWVkLWV2YWwnOiAnb2ZmJyxcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1pbXBsaWVkLWV2YWwnOiAnb2ZmJyxcblxuICAvLyBEaXNhbGxvdyB0aGlzIGtleXdvcmRzIG91dHNpZGUgb2YgY2xhc3NlcyBvciBjbGFzcy1saWtlIG9iamVjdHNcbiAgJ25vLWludmFsaWQtdGhpcyc6ICdvZmYnLFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLWludmFsaWQtdGhpcyc6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgZnVuY3Rpb24gZGVjbGFyYXRpb25zIHRoYXQgY29udGFpbiB1bnNhZmUgcmVmZXJlbmNlcyBpbnNpZGUgbG9vcCBzdGF0ZW1lbnRzXG4gICduby1sb29wLWZ1bmMnOiAnb2ZmJyxcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1sb29wLWZ1bmMnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IGxpdGVyYWwgbnVtYmVycyB0aGF0IGxvc2UgcHJlY2lzaW9uIOKchVxuICAnbm8tbG9zcy1vZi1wcmVjaXNpb24nOiAnb2ZmJyxcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1sb3NzLW9mLXByZWNpc2lvbic6ICdlcnJvcicsXG5cbiAgLy8gRGlzYWxsb3cgbWFnaWMgbnVtYmVyc1xuICAnbm8tbWFnaWMtbnVtYmVycyc6ICdvZmYnLFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLW1hZ2ljLW51bWJlcnMnOiAnb2ZmJywgLy8gV2UgaGF2ZSBtYW55IG1hZ2ljIG51bWJlcnNcblxuICAvLyBEaXNhbGxvdyB2YXJpYWJsZSByZWRlY2xhcmF0aW9uXG4gICduby1yZWRlY2xhcmUnOiAnb2ZmJyxcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1yZWRlY2xhcmUnOiAnZXJyb3InLFxuXG4gIC8vIERpc2FsbG93IHNwZWNpZmllZCBtb2R1bGVzIHdoZW4gbG9hZGVkIGJ5IGltcG9ydFxuICAnbm8tcmVzdHJpY3RlZC1pbXBvcnRzJzogJ29mZicsXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVzdHJpY3RlZC1pbXBvcnRzJzogJ2Vycm9yJyxcblxuICAvLyBEaXNhbGxvdyB2YXJpYWJsZSBkZWNsYXJhdGlvbnMgZnJvbSBzaGFkb3dpbmcgdmFyaWFibGVzIGRlY2xhcmVkIGluIHRoZSBvdXRlciBzY29wZVxuICAnbm8tc2hhZG93JzogJ29mZicsXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tc2hhZG93JzogJ29mZicsIC8vIERpc2FibGVkIGZvciB0aGUgc2FtZSByZWFzb24gYXMgaW4gdGhlIEpTIENvZGUuIDE3MyBmYWlsdXJlc1xuXG4gIC8vIERpc2FsbG93IHRocm93aW5nIGxpdGVyYWxzIGFzIGV4Y2VwdGlvbnMg8J+UkiAg8J+SrVxuICAnbm8tdGhyb3ctbGl0ZXJhbCc6ICdvZmYnLFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXRocm93LWxpdGVyYWwnOiAnb2ZmJywgLy8gVE9ETzogRW5hYmxlIHJ1bGUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEyNzdcblxuICAvLyBEaXNhbGxvdyB1bnVzZWQgZXhwcmVzc2lvbnNcbiAgJ25vLXVudXNlZC1leHByZXNzaW9ucyc6ICdvZmYnLFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC1leHByZXNzaW9ucyc6ICdvZmYnLCAvLyBTZWUgbm90ZXMgYmVsb3dcblxuICAvLyBEaXNhbGxvdyB1bnVzZWQgdmFyaWFibGVzIOKchVxuICAnbm8tdW51c2VkLXZhcnMnOiAnb2ZmJyxcbiAgJ0B0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFycyc6IFsgJ2Vycm9yJywge1xuXG4gICAgLy8gV2UgZG9uJ3Qgd2FudCB0byB0dXJuIHRoaXMgb24gYmVjYXVzZSBvZiB0aGUgZXhhbXBsZSBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTIzMCNpc3N1ZWNvbW1lbnQtMTE4NTg0MzE5OVxuICAgIHZhcnM6ICdhbGwnLFxuICAgIGFyZ3M6ICdub25lJyxcbiAgICBjYXVnaHRFcnJvcnM6ICdub25lJ1xuICB9IF0sXG5cbiAgLy8gRGlzYWxsb3cgdGhlIHVzZSBvZiB2YXJpYWJsZXMgYmVmb3JlIHRoZXkgYXJlIGRlZmluZWRcbiAgJ25vLXVzZS1iZWZvcmUtZGVmaW5lJzogJ29mZicsXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdXNlLWJlZm9yZS1kZWZpbmUnOiAnb2ZmJywgLy8gV2Ugb2Z0ZW4gZGVjbGFyZSBhdXhpbGlhcnkgY2xhc3NlcyBhdCB0aGUgYm90dG9tIG9mIGEgZmlsZSwgd2hpY2ggYXJlIHVzZWQgaW4gdGhlIHByaW1hcnkgY2xhc3NcblxuICAvLyBEaXNhbGxvdyB1bm5lY2Vzc2FyeSBjb25zdHJ1Y3RvcnMg8J+UklxuICAnbm8tdXNlbGVzcy1jb25zdHJ1Y3Rvcic6ICdvZmYnLFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXVzZWxlc3MtY29uc3RydWN0b3InOiAnb2ZmJywgLy8gV2UgZGV0ZXJtaW5lZCB0aGUgdXNlbGVzcyBjb25zdHJ1Y3RvcnMgYXJlIGdvb2QgZm9yIGRvY3VtZW50YXRpb24gYW5kIGNsYXJpdHkuXG5cbiAgLy8gRW5mb3JjZSBjb25zaXN0ZW50IHNwYWNpbmcgaW5zaWRlIGJyYWNlcyAg8J+Up1xuICAnQHN0eWxpc3RpYy9vYmplY3QtY3VybHktc3BhY2luZyc6IFsgJ2Vycm9yJywgJ2Fsd2F5cycgXSxcblxuICAvLyBSZXF1aXJlIG9yIGRpc2FsbG93IHBhZGRpbmcgbGluZXMgYmV0d2VlbiBzdGF0ZW1lbnRzICDwn5SnIPCfm6BcbiAgJ0BzdHlsaXN0aWMvcGFkZGluZy1saW5lLWJldHdlZW4tc3RhdGVtZW50cyc6ICdlcnJvcicsXG5cbiAgLy8gRW5mb3JjZSB0aGUgY29uc2lzdGVudCB1c2Ugb2YgZWl0aGVyIGJhY2t0aWNrcywgZG91YmxlLCBvciBzaW5nbGUgcXVvdGVzICDwn5SnXG4gICdAc3R5bGlzdGljL3F1b3Rlcyc6IFsgJ2Vycm9yJywgJ3NpbmdsZScgXSxcblxuICAvLyBEaXNhbGxvdyBhc3luYyBmdW5jdGlvbnMgd2hpY2ggaGF2ZSBubyBhd2FpdCBleHByZXNzaW9uIOKchSAg8J+SrVxuICAncmVxdWlyZS1hd2FpdCc6ICdvZmYnLFxuICAnQHR5cGVzY3JpcHQtZXNsaW50L3JlcXVpcmUtYXdhaXQnOiAnb2ZmJyxcblxuICAvLyBFbmZvcmNlIGNvbnNpc3RlbnQgcmV0dXJuaW5nIG9mIGF3YWl0ZWQgdmFsdWVzICDwn5SnIPCfm6Ag8J+SrVxuICAncmV0dXJuLWF3YWl0JzogJ29mZicsXG4gICdAdHlwZXNjcmlwdC1lc2xpbnQvcmV0dXJuLWF3YWl0JzogJ29mZicsIC8vIFRPRE86IEVuYWJsZSBydWxlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMjc3XG5cbiAgLy8gUmVxdWlyZSBvciBkaXNhbGxvdyBzZW1pY29sb25zIGluc3RlYWQgb2YgQVNJICDwn5SnXG4gICdAc3R5bGlzdGljL3NlbWknOiBbICdlcnJvcicsICdhbHdheXMnIF0sXG5cbiAgLy8gRW5mb3JjZSBjb25zaXN0ZW50IHNwYWNpbmcgYmVmb3JlIGJsb2NrcyAg8J+Up1xuICAnQHN0eWxpc3RpYy9zcGFjZS1iZWZvcmUtYmxvY2tzJzogJ2Vycm9yJyxcblxuICAvLyBFbmZvcmNlIGNvbnNpc3RlbnQgc3BhY2luZyBiZWZvcmUgZnVuY3Rpb24gcGFyZW50aGVzaXMgIPCflKdcbiAgJ0BzdHlsaXN0aWMvc3BhY2UtYmVmb3JlLWZ1bmN0aW9uLXBhcmVuJzogWyAnZXJyb3InLCB7XG4gICAgYW5vbnltb3VzOiAnbmV2ZXInLFxuICAgIG5hbWVkOiAnbmV2ZXInLFxuICAgIGFzeW5jQXJyb3c6ICdhbHdheXMnXG4gIH0gXSxcblxuICAvLyBSZXF1aXJlIHNwYWNpbmcgYXJvdW5kIGluZml4IG9wZXJhdG9ycyAg8J+Up1xuICAnQHN0eWxpc3RpYy9zcGFjZS1pbmZpeC1vcHMnOiAnZXJyb3InLFxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBDdXN0b20gVHlwZVNjcmlwdCBSdWxlc1xuICAncGhldC9iYWQtdHlwZXNjcmlwdC10ZXh0JzogJ2Vycm9yJyxcblxuICAncGhldC9uby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zJzogJ2Vycm9yJyxcblxuICAvLyBDdXN0b20gcmV0dXJuIHR5cGUgcnVsZSB0aGF0IG9ubHkgcmVxdWlyZXMgZm9yIG1ldGhvZHMuIFRoZSBpbmNsdWRlcyByZXR1cm4gdHlwZSB3YXMgdG9vIG92ZXJhcmNoaW5nLlxuICAncGhldC9leHBsaWNpdC1tZXRob2QtcmV0dXJuLXR5cGUnOiAnZXJyb3InLFxuXG4gIC8vIFZhcmlhYmxlcyB0aGF0IGFyZSBQcm9wZXJ0aWVzIHNob3VsZCBlbmQgaW4gXCJQcm9wZXJ0eVwiLCBsaWtlIGNvbnN0IG15UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoKTtcbiAgJ3BoZXQvcmVxdWlyZS1wcm9wZXJ0eS1zdWZmaXgnOiAnZXJyb3InLFxuXG4gIC8vIFN0YXRpYyBmaWVsZHMgc2hvdWxkIGhhdmUgdGhlICdyZWFkb25seScgbW9kaWZpZXJcbiAgJ3BoZXQvdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5JzogJ2Vycm9yJyxcblxuICAvLyBQcmV2ZW50IHNwcmVhZCBvcGVyYXRvciBvbiBub24tbGl0ZXJhbHMgYmVjYXVzZSBpdCBkb2VzIG5vdCBkbyBleGNlc3MgcHJvcGVydHkgZGV0ZWN0aW9uLiBJbiBnZW5lcmFsLCB0aGlzIHJ1bGVcbiAgLy8gaGVscHMgY2F0Y2ggcG90ZW50aWFsIGVycm9ycywgYW5kIG1pc3Rha2VzIHdpdGggUGhFVCdzIG9wdGlvbiBwYXR0ZXJuLCBidXQgcGxlYXNlIGZlZWwgZnJlZSB0byBkaXNhYmxlIHRoaXMgcnVsZVxuICAvLyBpbiBjYXNlcyB3aGVyZSB5b3UgZmVlbCBjb25maWRlbnQsIGFuZCBzdHJvbmdseSBkb24ndCB3YW50IHRoZSB0eXBlIHNhZmV0eSBvZiBleGNlc3MgcHJvcGVydHkgY2hlY2tpbmcuXG4gICdwaGV0L25vLW9iamVjdC1zcHJlYWQtb24tbm9uLWxpdGVyYWxzJzogJ2Vycm9yJyxcblxuICAvLyBPZnRlbiB3ZSBtaXN0YWtlbmx5IFBpY2s8UGhldGlvT2JqZWN0LCd0YW5kZW0nPiBidXQgaXQgc2hvdWxkIGJlIHBpY2tlZCBmcm9tIFBoZXRpb09iamVjdE9wdGlvbnNcbiAgJ3BoZXQvcGhldC1pby1vYmplY3Qtb3B0aW9ucy1zaG91bGQtbm90LXBpY2stZnJvbS1waGV0LWlvLW9iamVjdCc6ICdlcnJvcidcbn07Il0sIm5hbWVzIjpbInR5cGVzIiwiT21pdCIsIm1lc3NhZ2UiLCJmaXhXaXRoIiwiU3RyaW5nIiwiQm9vbGVhbiIsIk51bWJlciIsIlN5bWJvbCIsIkJpZ0ludCIsIkZ1bmN0aW9uIiwiam9pbiIsIk9iamVjdCIsInN1Z2dlc3QiLCJhbGxvd1NpbmdsZUxpbmUiLCJpbmRlbnQiLCJiZWZvcmUiLCJhZnRlciIsIm92ZXJyaWRlcyIsImNhc2UiLCJzd2l0Y2giLCJjYXRjaCIsInZhcnMiLCJhcmdzIiwiY2F1Z2h0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