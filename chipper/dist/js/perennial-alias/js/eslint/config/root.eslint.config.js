// Copyright 2015-2021, University of Colorado Boulder
function _extends() {
    _extends = Object.assign || function(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source){
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
import stylisticEslintPlugin from '@stylistic/eslint-plugin';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser';
import html from 'eslint-plugin-html';
import globals from 'globals';
import getNodeConfiguration from './util/getNodeConfiguration.mjs';
import phetRulesPlugin from './util/phetRulesPlugin.mjs';
import rootRules from './util/rootRules.mjs';
import rootRulesTypeScript from './util/rootRulesTypeScript.mjs';
// Keep this in a separate block from all other keys to make sure this behaves globally. These paths are relative to the root of a repo.
const TOP_LEVEL_IGNORES = {
    ignores: [
        '.git/',
        'build/',
        'dist/',
        'node_modules/',
        'templates/',
        'js/*Strings.ts',
        'images/',
        'doc/',
        'sounds/',
        'mipmaps/',
        'assets/',
        '*_en.html',
        '*-tests.html',
        '*_a11y_view.html'
    ]
};
// Adapt an eslint config so it is suitable for a non-top-level location. This is because some config assumes paths
// from the top of a repo. We only want to use the above "ignores" paths when at the root level of a repo. For
// example, don't want to ignore `js/common/images/*`.
export function mutateForNestedConfig(eslintConfig) {
    return eslintConfig.filter((configObject)=>configObject !== TOP_LEVEL_IGNORES);
}
/**
 * The base eslint configuration for the PhET projects.
 *
 * Please note! Changing this file can also effect phet website repos. Please let that team know when changing.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ export default [
    {
        // Keep this in a separate block from all other keys to make sure this behaves globally.
        files: [
            '{**/*,*}.{js,ts,jsx,tsx,html,mjs,cjs}'
        ]
    },
    TOP_LEVEL_IGNORES,
    // Main config block that applies everywhere. Do NOT add `files` or `ignores` here.
    {
        plugins: {
            phet: phetRulesPlugin
        },
        linterOptions: {
            reportUnusedDisableDirectives: 'error'
        },
        languageOptions: {
            // Without a parser, .js files are linted without es6 transpilation. Use the same parser that we use for TypeScript.
            parser: typescriptEslintParser,
            globals: _extends({}, globals.es2018)
        },
        rules: rootRules
    },
    // TypeScript files config block.
    {
        files: [
            '**/*.ts',
            '**/*.tsx'
        ],
        languageOptions: {
            parserOptions: {
                projectService: true // Look up type information from the closest tsconfig.json
            }
        },
        plugins: {
            '@typescript-eslint': typescriptEslintPlugin,
            '@stylistic': stylisticEslintPlugin
        },
        rules: rootRulesTypeScript
    },
    // Only HTML Files
    {
        files: [
            '**/*.html'
        ],
        languageOptions: {
            globals: _extends({}, globals.browser)
        },
        rules: {
            // DUPLICATION ALERT, this overrides the base rule, just for HTML.
            'no-multiple-empty-lines': [
                'error',
                {
                    max: 2,
                    maxBOF: 2,
                    maxEOF: 1
                }
            ],
            'bad-sim-text': 'off'
        },
        // Lint javascript in HTML files too
        plugins: {
            html: html
        }
    },
    // Not HTML files
    {
        ignores: [
            '**/*.html'
        ],
        rules: {
            // Require or disallow newline at the end of files. Not a good fit for HTML, since that just moves the
            // `<script>` tag up to the same line as the last javscript code
            'eol-last': [
                'error',
                'never'
            ]
        }
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // File-specific overrides should go after the main configuration and rules are set up (above).
    //
    //
    // A couple of workarounds to make our testing files a bit easier.
    {
        files: [
            '**/*[Tt]est*.{js,ts,jsx,tsx}',
            '**/*qunit*.{js,ts,jsx,tsx}',
            '**/*QUnit*.{js,ts,jsx,tsx}'
        ],
        languageOptions: {
            globals: {
                QUnit: 'readonly',
                Assert: 'readonly' // type for QUnit assert
            }
        },
        rules: {
            // Test files are allowed to use bracket notation to circumnavigate private member access. Typescript
            // doesn't complain when accessing a private member this way as an intentional "escape hatch".
            // Decision in https://github.com/phetsims/chipper/issues/1295, and see https://github.com/microsoft/TypeScript/issues/19335
            'dot-notation': 'off',
            '@typescript-eslint/dot-notation': 'off'
        }
    },
    // Use node configuration just for these two files
    ...getNodeConfiguration({
        files: [
            '**/Gruntfile.{js,cjs}',
            '**/eslint.config.mjs'
        ]
    }),
    {
        files: [
            '**/Gruntfile.{js,cjs}'
        ],
        rules: {
            strict: 'off'
        }
    }
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvY29uZmlnL3Jvb3QuZXNsaW50LmNvbmZpZy5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbmltcG9ydCBzdHlsaXN0aWNFc2xpbnRQbHVnaW4gZnJvbSAnQHN0eWxpc3RpYy9lc2xpbnQtcGx1Z2luJztcbmltcG9ydCB0eXBlc2NyaXB0RXNsaW50UGx1Z2luIGZyb20gJ0B0eXBlc2NyaXB0LWVzbGludC9lc2xpbnQtcGx1Z2luJztcbmltcG9ydCB0eXBlc2NyaXB0RXNsaW50UGFyc2VyIGZyb20gJ0B0eXBlc2NyaXB0LWVzbGludC9wYXJzZXInO1xuaW1wb3J0IGh0bWwgZnJvbSAnZXNsaW50LXBsdWdpbi1odG1sJztcbmltcG9ydCBnbG9iYWxzIGZyb20gJ2dsb2JhbHMnO1xuaW1wb3J0IGdldE5vZGVDb25maWd1cmF0aW9uIGZyb20gJy4vdXRpbC9nZXROb2RlQ29uZmlndXJhdGlvbi5tanMnO1xuaW1wb3J0IHBoZXRSdWxlc1BsdWdpbiBmcm9tICcuL3V0aWwvcGhldFJ1bGVzUGx1Z2luLm1qcyc7XG5pbXBvcnQgcm9vdFJ1bGVzIGZyb20gJy4vdXRpbC9yb290UnVsZXMubWpzJztcbmltcG9ydCByb290UnVsZXNUeXBlU2NyaXB0IGZyb20gJy4vdXRpbC9yb290UnVsZXNUeXBlU2NyaXB0Lm1qcyc7XG5cblxuLy8gS2VlcCB0aGlzIGluIGEgc2VwYXJhdGUgYmxvY2sgZnJvbSBhbGwgb3RoZXIga2V5cyB0byBtYWtlIHN1cmUgdGhpcyBiZWhhdmVzIGdsb2JhbGx5LiBUaGVzZSBwYXRocyBhcmUgcmVsYXRpdmUgdG8gdGhlIHJvb3Qgb2YgYSByZXBvLlxuY29uc3QgVE9QX0xFVkVMX0lHTk9SRVMgPSB7XG4gIGlnbm9yZXM6IFtcbiAgICAnLmdpdC8nLFxuICAgICdidWlsZC8nLFxuICAgICdkaXN0LycsXG4gICAgJ25vZGVfbW9kdWxlcy8nLFxuICAgICd0ZW1wbGF0ZXMvJyxcbiAgICAnanMvKlN0cmluZ3MudHMnLFxuICAgICdpbWFnZXMvJyxcbiAgICAnZG9jLycsXG4gICAgJ3NvdW5kcy8nLFxuICAgICdtaXBtYXBzLycsXG4gICAgJ2Fzc2V0cy8nLFxuICAgICcqX2VuLmh0bWwnLFxuICAgICcqLXRlc3RzLmh0bWwnLFxuICAgICcqX2ExMXlfdmlldy5odG1sJ1xuICBdXG59O1xuXG4vLyBBZGFwdCBhbiBlc2xpbnQgY29uZmlnIHNvIGl0IGlzIHN1aXRhYmxlIGZvciBhIG5vbi10b3AtbGV2ZWwgbG9jYXRpb24uIFRoaXMgaXMgYmVjYXVzZSBzb21lIGNvbmZpZyBhc3N1bWVzIHBhdGhzXG4vLyBmcm9tIHRoZSB0b3Agb2YgYSByZXBvLiBXZSBvbmx5IHdhbnQgdG8gdXNlIHRoZSBhYm92ZSBcImlnbm9yZXNcIiBwYXRocyB3aGVuIGF0IHRoZSByb290IGxldmVsIG9mIGEgcmVwby4gRm9yXG4vLyBleGFtcGxlLCBkb24ndCB3YW50IHRvIGlnbm9yZSBganMvY29tbW9uL2ltYWdlcy8qYC5cbmV4cG9ydCBmdW5jdGlvbiBtdXRhdGVGb3JOZXN0ZWRDb25maWcoIGVzbGludENvbmZpZyApIHtcbiAgcmV0dXJuIGVzbGludENvbmZpZy5maWx0ZXIoIGNvbmZpZ09iamVjdCA9PiBjb25maWdPYmplY3QgIT09IFRPUF9MRVZFTF9JR05PUkVTICk7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgZXNsaW50IGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBQaEVUIHByb2plY3RzLlxuICpcbiAqIFBsZWFzZSBub3RlISBDaGFuZ2luZyB0aGlzIGZpbGUgY2FuIGFsc28gZWZmZWN0IHBoZXQgd2Vic2l0ZSByZXBvcy4gUGxlYXNlIGxldCB0aGF0IHRlYW0ga25vdyB3aGVuIGNoYW5naW5nLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmV4cG9ydCBkZWZhdWx0IFtcbiAge1xuICAgIC8vIEtlZXAgdGhpcyBpbiBhIHNlcGFyYXRlIGJsb2NrIGZyb20gYWxsIG90aGVyIGtleXMgdG8gbWFrZSBzdXJlIHRoaXMgYmVoYXZlcyBnbG9iYWxseS5cbiAgICBmaWxlczogWyAneyoqLyosKn0ue2pzLHRzLGpzeCx0c3gsaHRtbCxtanMsY2pzfScgXVxuICB9LFxuICBUT1BfTEVWRUxfSUdOT1JFUyxcblxuICAvLyBNYWluIGNvbmZpZyBibG9jayB0aGF0IGFwcGxpZXMgZXZlcnl3aGVyZS4gRG8gTk9UIGFkZCBgZmlsZXNgIG9yIGBpZ25vcmVzYCBoZXJlLlxuICB7XG4gICAgcGx1Z2luczoge1xuICAgICAgcGhldDogcGhldFJ1bGVzUGx1Z2luXG4gICAgfSxcblxuICAgIGxpbnRlck9wdGlvbnM6IHtcbiAgICAgIHJlcG9ydFVudXNlZERpc2FibGVEaXJlY3RpdmVzOiAnZXJyb3InXG4gICAgfSxcblxuICAgIGxhbmd1YWdlT3B0aW9uczoge1xuXG4gICAgICAvLyBXaXRob3V0IGEgcGFyc2VyLCAuanMgZmlsZXMgYXJlIGxpbnRlZCB3aXRob3V0IGVzNiB0cmFuc3BpbGF0aW9uLiBVc2UgdGhlIHNhbWUgcGFyc2VyIHRoYXQgd2UgdXNlIGZvciBUeXBlU2NyaXB0LlxuICAgICAgcGFyc2VyOiB0eXBlc2NyaXB0RXNsaW50UGFyc2VyLFxuICAgICAgZ2xvYmFsczoge1xuICAgICAgICAuLi5nbG9iYWxzLmVzMjAxOFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBydWxlczogcm9vdFJ1bGVzXG4gIH0sXG5cbiAgLy8gVHlwZVNjcmlwdCBmaWxlcyBjb25maWcgYmxvY2suXG4gIHtcbiAgICBmaWxlczogW1xuICAgICAgJyoqLyoudHMnLFxuICAgICAgJyoqLyoudHN4J1xuICAgIF0sXG4gICAgbGFuZ3VhZ2VPcHRpb25zOiB7XG4gICAgICBwYXJzZXJPcHRpb25zOiB7XG4gICAgICAgIHByb2plY3RTZXJ2aWNlOiB0cnVlIC8vIExvb2sgdXAgdHlwZSBpbmZvcm1hdGlvbiBmcm9tIHRoZSBjbG9zZXN0IHRzY29uZmlnLmpzb25cbiAgICAgIH1cbiAgICB9LFxuICAgIHBsdWdpbnM6IHtcbiAgICAgICdAdHlwZXNjcmlwdC1lc2xpbnQnOiB0eXBlc2NyaXB0RXNsaW50UGx1Z2luLFxuICAgICAgJ0BzdHlsaXN0aWMnOiBzdHlsaXN0aWNFc2xpbnRQbHVnaW5cbiAgICB9LFxuICAgIHJ1bGVzOiByb290UnVsZXNUeXBlU2NyaXB0XG4gIH0sXG5cbiAgLy8gT25seSBIVE1MIEZpbGVzXG4gIHtcbiAgICBmaWxlczogWyAnKiovKi5odG1sJyBdLFxuICAgIGxhbmd1YWdlT3B0aW9uczoge1xuICAgICAgZ2xvYmFsczoge1xuICAgICAgICAuLi5nbG9iYWxzLmJyb3dzZXJcbiAgICAgIH1cbiAgICB9LFxuICAgIHJ1bGVzOiB7XG4gICAgICAvLyBEVVBMSUNBVElPTiBBTEVSVCwgdGhpcyBvdmVycmlkZXMgdGhlIGJhc2UgcnVsZSwganVzdCBmb3IgSFRNTC5cbiAgICAgICduby1tdWx0aXBsZS1lbXB0eS1saW5lcyc6IFsgJ2Vycm9yJywgeyBtYXg6IDIsIG1heEJPRjogMiwgbWF4RU9GOiAxIH0gXSxcbiAgICAgICdiYWQtc2ltLXRleHQnOiAnb2ZmJ1xuICAgIH0sXG4gICAgLy8gTGludCBqYXZhc2NyaXB0IGluIEhUTUwgZmlsZXMgdG9vXG4gICAgcGx1Z2luczoge1xuICAgICAgaHRtbDogaHRtbFxuICAgIH1cbiAgfSxcblxuICAvLyBOb3QgSFRNTCBmaWxlc1xuICB7XG4gICAgaWdub3JlczogWyAnKiovKi5odG1sJyBdLFxuICAgIHJ1bGVzOiB7XG5cbiAgICAgIC8vIFJlcXVpcmUgb3IgZGlzYWxsb3cgbmV3bGluZSBhdCB0aGUgZW5kIG9mIGZpbGVzLiBOb3QgYSBnb29kIGZpdCBmb3IgSFRNTCwgc2luY2UgdGhhdCBqdXN0IG1vdmVzIHRoZVxuICAgICAgLy8gYDxzY3JpcHQ+YCB0YWcgdXAgdG8gdGhlIHNhbWUgbGluZSBhcyB0aGUgbGFzdCBqYXZzY3JpcHQgY29kZVxuICAgICAgJ2VvbC1sYXN0JzogWyAnZXJyb3InLCAnbmV2ZXInIF1cbiAgICB9XG4gIH0sXG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gRmlsZS1zcGVjaWZpYyBvdmVycmlkZXMgc2hvdWxkIGdvIGFmdGVyIHRoZSBtYWluIGNvbmZpZ3VyYXRpb24gYW5kIHJ1bGVzIGFyZSBzZXQgdXAgKGFib3ZlKS5cbiAgLy9cbiAgLy9cblxuICAvLyBBIGNvdXBsZSBvZiB3b3JrYXJvdW5kcyB0byBtYWtlIG91ciB0ZXN0aW5nIGZpbGVzIGEgYml0IGVhc2llci5cbiAge1xuICAgIGZpbGVzOiBbXG4gICAgICAnKiovKltUdF1lc3QqLntqcyx0cyxqc3gsdHN4fScsXG4gICAgICAnKiovKnF1bml0Ki57anMsdHMsanN4LHRzeH0nLFxuICAgICAgJyoqLypRVW5pdCoue2pzLHRzLGpzeCx0c3h9J1xuICAgIF0sXG4gICAgbGFuZ3VhZ2VPcHRpb25zOiB7XG4gICAgICBnbG9iYWxzOiB7XG4gICAgICAgIFFVbml0OiAncmVhZG9ubHknLCAvLyBRVW5pdFxuICAgICAgICBBc3NlcnQ6ICdyZWFkb25seScgLy8gdHlwZSBmb3IgUVVuaXQgYXNzZXJ0XG4gICAgICB9XG4gICAgfSxcbiAgICBydWxlczoge1xuXG4gICAgICAvLyBUZXN0IGZpbGVzIGFyZSBhbGxvd2VkIHRvIHVzZSBicmFja2V0IG5vdGF0aW9uIHRvIGNpcmN1bW5hdmlnYXRlIHByaXZhdGUgbWVtYmVyIGFjY2Vzcy4gVHlwZXNjcmlwdFxuICAgICAgLy8gZG9lc24ndCBjb21wbGFpbiB3aGVuIGFjY2Vzc2luZyBhIHByaXZhdGUgbWVtYmVyIHRoaXMgd2F5IGFzIGFuIGludGVudGlvbmFsIFwiZXNjYXBlIGhhdGNoXCIuXG4gICAgICAvLyBEZWNpc2lvbiBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTI5NSwgYW5kIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE5MzM1XG4gICAgICAnZG90LW5vdGF0aW9uJzogJ29mZicsXG4gICAgICAnQHR5cGVzY3JpcHQtZXNsaW50L2RvdC1ub3RhdGlvbic6ICdvZmYnXG4gICAgfVxuICB9LFxuXG4gIC8vIFVzZSBub2RlIGNvbmZpZ3VyYXRpb24ganVzdCBmb3IgdGhlc2UgdHdvIGZpbGVzXG4gIC4uLmdldE5vZGVDb25maWd1cmF0aW9uKCB7XG4gICAgZmlsZXM6IFtcbiAgICAgICcqKi9HcnVudGZpbGUue2pzLGNqc30nLFxuICAgICAgJyoqL2VzbGludC5jb25maWcubWpzJ1xuICAgIF1cbiAgfSApLFxuICB7XG4gICAgZmlsZXM6IFsgJyoqL0dydW50ZmlsZS57anMsY2pzfScgXSxcbiAgICBydWxlczoge1xuICAgICAgc3RyaWN0OiAnb2ZmJ1xuICAgIH1cbiAgfVxuXTsiXSwibmFtZXMiOlsic3R5bGlzdGljRXNsaW50UGx1Z2luIiwidHlwZXNjcmlwdEVzbGludFBsdWdpbiIsInR5cGVzY3JpcHRFc2xpbnRQYXJzZXIiLCJodG1sIiwiZ2xvYmFscyIsImdldE5vZGVDb25maWd1cmF0aW9uIiwicGhldFJ1bGVzUGx1Z2luIiwicm9vdFJ1bGVzIiwicm9vdFJ1bGVzVHlwZVNjcmlwdCIsIlRPUF9MRVZFTF9JR05PUkVTIiwiaWdub3JlcyIsIm11dGF0ZUZvck5lc3RlZENvbmZpZyIsImVzbGludENvbmZpZyIsImZpbHRlciIsImNvbmZpZ09iamVjdCIsImZpbGVzIiwicGx1Z2lucyIsInBoZXQiLCJsaW50ZXJPcHRpb25zIiwicmVwb3J0VW51c2VkRGlzYWJsZURpcmVjdGl2ZXMiLCJsYW5ndWFnZU9wdGlvbnMiLCJwYXJzZXIiLCJlczIwMTgiLCJydWxlcyIsInBhcnNlck9wdGlvbnMiLCJwcm9qZWN0U2VydmljZSIsImJyb3dzZXIiLCJtYXgiLCJtYXhCT0YiLCJtYXhFT0YiLCJRVW5pdCIsIkFzc2VydCIsInN0cmljdCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEOzs7Ozs7Ozs7Ozs7Ozs7QUFFdEQsT0FBT0EsMkJBQTJCLDJCQUEyQjtBQUM3RCxPQUFPQyw0QkFBNEIsbUNBQW1DO0FBQ3RFLE9BQU9DLDRCQUE0Qiw0QkFBNEI7QUFDL0QsT0FBT0MsVUFBVSxxQkFBcUI7QUFDdEMsT0FBT0MsYUFBYSxVQUFVO0FBQzlCLE9BQU9DLDBCQUEwQixrQ0FBa0M7QUFDbkUsT0FBT0MscUJBQXFCLDZCQUE2QjtBQUN6RCxPQUFPQyxlQUFlLHVCQUF1QjtBQUM3QyxPQUFPQyx5QkFBeUIsaUNBQWlDO0FBR2pFLHdJQUF3STtBQUN4SSxNQUFNQyxvQkFBb0I7SUFDeEJDLFNBQVM7UUFDUDtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO0tBQ0Q7QUFDSDtBQUVBLG1IQUFtSDtBQUNuSCw4R0FBOEc7QUFDOUcsc0RBQXNEO0FBQ3RELE9BQU8sU0FBU0Msc0JBQXVCQyxZQUFZO0lBQ2pELE9BQU9BLGFBQWFDLE1BQU0sQ0FBRUMsQ0FBQUEsZUFBZ0JBLGlCQUFpQkw7QUFDL0Q7QUFFQTs7Ozs7OztDQU9DLEdBQ0QsZUFBZTtJQUNiO1FBQ0Usd0ZBQXdGO1FBQ3hGTSxPQUFPO1lBQUU7U0FBeUM7SUFDcEQ7SUFDQU47SUFFQSxtRkFBbUY7SUFDbkY7UUFDRU8sU0FBUztZQUNQQyxNQUFNWDtRQUNSO1FBRUFZLGVBQWU7WUFDYkMsK0JBQStCO1FBQ2pDO1FBRUFDLGlCQUFpQjtZQUVmLG9IQUFvSDtZQUNwSEMsUUFBUW5CO1lBQ1JFLFNBQVMsYUFDSkEsUUFBUWtCLE1BQU07UUFFckI7UUFFQUMsT0FBT2hCO0lBQ1Q7SUFFQSxpQ0FBaUM7SUFDakM7UUFDRVEsT0FBTztZQUNMO1lBQ0E7U0FDRDtRQUNESyxpQkFBaUI7WUFDZkksZUFBZTtnQkFDYkMsZ0JBQWdCLEtBQUssMERBQTBEO1lBQ2pGO1FBQ0Y7UUFDQVQsU0FBUztZQUNQLHNCQUFzQmY7WUFDdEIsY0FBY0Q7UUFDaEI7UUFDQXVCLE9BQU9mO0lBQ1Q7SUFFQSxrQkFBa0I7SUFDbEI7UUFDRU8sT0FBTztZQUFFO1NBQWE7UUFDdEJLLGlCQUFpQjtZQUNmaEIsU0FBUyxhQUNKQSxRQUFRc0IsT0FBTztRQUV0QjtRQUNBSCxPQUFPO1lBQ0wsa0VBQWtFO1lBQ2xFLDJCQUEyQjtnQkFBRTtnQkFBUztvQkFBRUksS0FBSztvQkFBR0MsUUFBUTtvQkFBR0MsUUFBUTtnQkFBRTthQUFHO1lBQ3hFLGdCQUFnQjtRQUNsQjtRQUNBLG9DQUFvQztRQUNwQ2IsU0FBUztZQUNQYixNQUFNQTtRQUNSO0lBQ0Y7SUFFQSxpQkFBaUI7SUFDakI7UUFDRU8sU0FBUztZQUFFO1NBQWE7UUFDeEJhLE9BQU87WUFFTCxzR0FBc0c7WUFDdEcsZ0VBQWdFO1lBQ2hFLFlBQVk7Z0JBQUU7Z0JBQVM7YUFBUztRQUNsQztJQUNGO0lBRUEsb0hBQW9IO0lBQ3BILG9IQUFvSDtJQUNwSCxvSEFBb0g7SUFDcEgsK0ZBQStGO0lBQy9GLEVBQUU7SUFDRixFQUFFO0lBRUYsa0VBQWtFO0lBQ2xFO1FBQ0VSLE9BQU87WUFDTDtZQUNBO1lBQ0E7U0FDRDtRQUNESyxpQkFBaUI7WUFDZmhCLFNBQVM7Z0JBQ1AwQixPQUFPO2dCQUNQQyxRQUFRLFdBQVcsd0JBQXdCO1lBQzdDO1FBQ0Y7UUFDQVIsT0FBTztZQUVMLHFHQUFxRztZQUNyRyw4RkFBOEY7WUFDOUYsNEhBQTRIO1lBQzVILGdCQUFnQjtZQUNoQixtQ0FBbUM7UUFDckM7SUFDRjtJQUVBLGtEQUFrRDtPQUMvQ2xCLHFCQUFzQjtRQUN2QlUsT0FBTztZQUNMO1lBQ0E7U0FDRDtJQUNIO0lBQ0E7UUFDRUEsT0FBTztZQUFFO1NBQXlCO1FBQ2xDUSxPQUFPO1lBQ0xTLFFBQVE7UUFDVjtJQUNGO0NBQ0QsQ0FBQyJ9