// Copyright 2018-2019, University of Colorado Boulder
/* eslint-disable phet/bad-text */ /**
 * Lint detector for invalid text.
 * Lint is disabled for this file so the bad texts aren't themselves flagged.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ const getBadTextTester = require('./getBadTextTester');
module.exports = {
    create: function(context) {
        // see getBadTextTester for schema
        const forbiddenTextObjects = [
            // Proper casing for *boxes
            // toolbox is one word
            'toolBox',
            'ToolBox',
            'TOOL_BOX',
            // checkbox is one word
            'checkBox',
            'CheckBox',
            'CHECK_BOX',
            'Overriden',
            'overriden',
            'iFrame',
            // event.keyCode according to spec, rather than event.keycode
            'keycode',
            // prefer hotkey (one word)
            'hot key',
            'hotKey',
            'HotKey',
            'HOT_KEY',
            // embarrassingly enough, zepumph is so bad at typing this word that he needs these lint rules, see https://github.com/phetsims/friction/issues/234
            'respones',
            'Respones',
            // Avoid string literal in assert predicate, see https://github.com/phetsims/assert/issues/7
            'assert( \'',
            // In ES6, extending object causes methods to be dropped
            {
                id: 'extends Object ',
                codeTokens: [
                    'extends',
                    'Object'
                ]
            },
            // Forbid common duplicate words
            ' the the ',
            ' a a ',
            'dipose',
            // For phet-io use PHET_IO in constants
            'PHETIO',
            'PHET-IO',
            'Phet-iO',
            ' Phet ',
            'phetio element',
            'PhET-iO element',
            'Phet-iO',
            {
                id: 'IO type',
                regex: /\bIO type/
            },
            // prefer PhET-iO Type name , https://github.com/phetsims/phet-io/issues/1972
            'IO Typename',
            'IO TypeName',
            'IO Type Name',
            // prefer PhET-iO Type (public name) or IOType (class name) https://github.com/phetsims/phet-io/issues/1972
            'IO Type',
            ' IO type',
            '@return ',
            // see https://thenewstack.io/words-matter-finally-tech-looks-at-removing-exclusionary-language/ and
            // https://github.com/phetsims/special-ops/issues/221
            // The regex works around github links that include a `master` branch with a slash, as well as `Ron LeMaster`, a
            // PhET team member
            {
                id: 'words matter',
                regex: RegExp("(slave|black-?list|white-?list|(?<!\\/)\\bmaster\\b)", "i")
            },
            // Any instances of youtube.com should enforce that we use youtube-nocookie.com
            // https://github.com/phetsims/website/issues/1376
            // https://support.google.com/youtube/answer/171780?hl=en#zippy=%2Cturn-on-privacy-enhanced-mode
            {
                id: 'require youtube privacy enhanced mode',
                regex: /youtube(?:(?!-nocookie).)*\.com/
            },
            '../phet-lib/js/phet-lib-only-imports',
            'Util = require( \'',
            // if on a one line arrow function returning something, prefer instead `() => theReturn`, see https://github.com/phetsims/chipper/issues/790
            ' => { return ',
            'define( function( require ) {',
            // optional 'options' should use brackets and required 'config' shouldn't use brackets, see https://github.com/phetsims/chipper/issues/859
            '@param {Object} options',
            '@param {Object} [config]',
            // PhET prefers to use the term "position" to refer to the physical (x,y) position of objects.
            // The lint rule can be disabled for occurrences where we do prefer locationProperty, for instance if we
            // had a sim about people that are from three different named locations.
            'locationProperty',
            // optionize cannot infer its type arguments, pass them like `optionize<MyOptions. . .>()()
            'optionize(',
            // In general, you should not duplicate QueryStringMachine getting phetioDebug, instead just use PhetioClient.prototype.getDebugModeEnabled(), see https://github.com/phetsims/phet-io/issues/1859
            'phetioDebug:',
            {
                id: 'Export statements should not have a register call',
                predicate: (line)=>{
                    if (line.trim().indexOf('export default') === 0 && line.indexOf('.register(') >= 0) {
                        return false;
                    }
                    return true;
                }
            },
            // Should have a period before "<", see https://github.com/phetsims/chipper/issues/1005 and https://github.com/phetsims/chipper/issues/1003
            {
                id: 'Type<Parameter> (add a dot)',
                regex: /{[^\n:]*[A-z]<[A-z][|'<>A-z]+>[^\n:{}]*}}/
            },
            // eslint disable line directives must have an explanation
            {
                id: 'eslint-disable-line directives must have explanation',
                predicate: (line)=>!line.trim().endsWith('eslint-disable-line'),
                // Report the error on the previous line so it doesn't get disabled
                lineNumberDelta: -1
            },
            // eslint disable next line directives must have an explanation
            {
                id: 'eslint-disable-next-line directives must have explanation',
                predicate: (line)=>!line.trim().endsWith('eslint-disable-next-line')
            },
            // Prefer _.assignIn() which returns the object in its type doc, https://github.com/phetsims/tasks/issues/1130
            ' = _.extend('
        ];
        return {
            Program: getBadTextTester('bad-text', forbiddenTextObjects, context)
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9iYWQtdGV4dC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDE5LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8qIGVzbGludC1kaXNhYmxlIHBoZXQvYmFkLXRleHQgKi9cblxuLyoqXG4gKiBMaW50IGRldGVjdG9yIGZvciBpbnZhbGlkIHRleHQuXG4gKiBMaW50IGlzIGRpc2FibGVkIGZvciB0aGlzIGZpbGUgc28gdGhlIGJhZCB0ZXh0cyBhcmVuJ3QgdGhlbXNlbHZlcyBmbGFnZ2VkLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuXG5jb25zdCBnZXRCYWRUZXh0VGVzdGVyID0gcmVxdWlyZSggJy4vZ2V0QmFkVGV4dFRlc3RlcicgKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogZnVuY3Rpb24oIGNvbnRleHQgKSB7XG5cbiAgICAvLyBzZWUgZ2V0QmFkVGV4dFRlc3RlciBmb3Igc2NoZW1hXG4gICAgY29uc3QgZm9yYmlkZGVuVGV4dE9iamVjdHMgPSBbXG5cbiAgICAgIC8vIFByb3BlciBjYXNpbmcgZm9yICpib3hlc1xuXG4gICAgICAvLyB0b29sYm94IGlzIG9uZSB3b3JkXG4gICAgICAndG9vbEJveCcsIC8vIHByZWZlciB0b29sYm94XG4gICAgICAnVG9vbEJveCcsIC8vIHByZWZlciBUb29sYm94XG4gICAgICAnVE9PTF9CT1gnLCAvLyBwcmVmZXIgVE9PTEJPWFxuXG4gICAgICAvLyBjaGVja2JveCBpcyBvbmUgd29yZFxuICAgICAgJ2NoZWNrQm94JywgLy8gcHJlZmVyIGNoZWNrYm94XG4gICAgICAnQ2hlY2tCb3gnLCAvLyBwcmVmZXIgQ2hlY2tib3hcbiAgICAgICdDSEVDS19CT1gnLCAvLyBwcmVmZXIgQ0hFQ0tCT1hcblxuICAgICAgJ092ZXJyaWRlbicsIC8vIHNob3VsZCBoYXZlIDIgXCJkXCJzXG4gICAgICAnb3ZlcnJpZGVuJywgLy8gc2hvdWxkIGhhdmUgMiBcImRcInNcblxuICAgICAgJ2lGcmFtZScsIC8vIHNob3VsZCBiZSBpZnJhbWVcblxuICAgICAgLy8gZXZlbnQua2V5Q29kZSBhY2NvcmRpbmcgdG8gc3BlYywgcmF0aGVyIHRoYW4gZXZlbnQua2V5Y29kZVxuICAgICAgJ2tleWNvZGUnLFxuXG4gICAgICAvLyBwcmVmZXIgaG90a2V5IChvbmUgd29yZClcbiAgICAgICdob3Qga2V5JyxcbiAgICAgICdob3RLZXknLFxuICAgICAgJ0hvdEtleScsXG4gICAgICAnSE9UX0tFWScsXG5cbiAgICAgIC8vIGVtYmFycmFzc2luZ2x5IGVub3VnaCwgemVwdW1waCBpcyBzbyBiYWQgYXQgdHlwaW5nIHRoaXMgd29yZCB0aGF0IGhlIG5lZWRzIHRoZXNlIGxpbnQgcnVsZXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZnJpY3Rpb24vaXNzdWVzLzIzNFxuICAgICAgJ3Jlc3BvbmVzJyxcbiAgICAgICdSZXNwb25lcycsXG5cbiAgICAgIC8vIEF2b2lkIHN0cmluZyBsaXRlcmFsIGluIGFzc2VydCBwcmVkaWNhdGUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXNzZXJ0L2lzc3Vlcy83XG4gICAgICAnYXNzZXJ0KCBcXCcnLFxuXG4gICAgICAvLyBJbiBFUzYsIGV4dGVuZGluZyBvYmplY3QgY2F1c2VzIG1ldGhvZHMgdG8gYmUgZHJvcHBlZFxuICAgICAgeyBpZDogJ2V4dGVuZHMgT2JqZWN0ICcsIGNvZGVUb2tlbnM6IFsgJ2V4dGVuZHMnLCAnT2JqZWN0JyBdIH0sXG5cbiAgICAgIC8vIEZvcmJpZCBjb21tb24gZHVwbGljYXRlIHdvcmRzXG4gICAgICAnIHRoZSB0aGUgJyxcbiAgICAgICcgYSBhICcsXG4gICAgICAnZGlwb3NlJywgLy8gaGFwcGVucyBtb3JlIHRoYW4geW91J2QgdGhpbmtcblxuICAgICAgLy8gRm9yIHBoZXQtaW8gdXNlIFBIRVRfSU8gaW4gY29uc3RhbnRzXG4gICAgICAnUEhFVElPJyxcbiAgICAgICdQSEVULUlPJyxcbiAgICAgICdQaGV0LWlPJyxcbiAgICAgICcgUGhldCAnLFxuICAgICAgJ3BoZXRpbyBlbGVtZW50JywgLy8gdXNlIFwicGhldC1pbyBlbGVtZW50XCIgb3IgXCJQaEVULWlPIEVsZW1lbnRcIlxuICAgICAgJ1BoRVQtaU8gZWxlbWVudCcsIC8vIHVzZSBcInBoZXQtaW8gZWxlbWVudFwiIG9yIFwiUGhFVC1pTyBFbGVtZW50XCIgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE5NjhcbiAgICAgICdQaGV0LWlPJyxcbiAgICAgIHsgaWQ6ICdJTyB0eXBlJywgcmVnZXg6IC9cXGJJTyB0eXBlLyB9LCAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvOTc3XG4gICAgICAvLyBwcmVmZXIgUGhFVC1pTyBUeXBlIG5hbWUgLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTk3MlxuICAgICAgJ0lPIFR5cGVuYW1lJyxcbiAgICAgICdJTyBUeXBlTmFtZScsXG4gICAgICAnSU8gVHlwZSBOYW1lJyxcblxuICAgICAgLy8gcHJlZmVyIFBoRVQtaU8gVHlwZSAocHVibGljIG5hbWUpIG9yIElPVHlwZSAoY2xhc3MgbmFtZSkgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE5NzJcbiAgICAgICdJTyBUeXBlJyxcbiAgICAgICcgSU8gdHlwZScsXG5cbiAgICAgICdAcmV0dXJuICcsXG5cbiAgICAgIC8vIHNlZSBodHRwczovL3RoZW5ld3N0YWNrLmlvL3dvcmRzLW1hdHRlci1maW5hbGx5LXRlY2gtbG9va3MtYXQtcmVtb3ZpbmctZXhjbHVzaW9uYXJ5LWxhbmd1YWdlLyBhbmRcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zcGVjaWFsLW9wcy9pc3N1ZXMvMjIxXG4gICAgICAvLyBUaGUgcmVnZXggd29ya3MgYXJvdW5kIGdpdGh1YiBsaW5rcyB0aGF0IGluY2x1ZGUgYSBgbWFzdGVyYCBicmFuY2ggd2l0aCBhIHNsYXNoLCBhcyB3ZWxsIGFzIGBSb24gTGVNYXN0ZXJgLCBhXG4gICAgICAvLyBQaEVUIHRlYW0gbWVtYmVyXG4gICAgICB7XG4gICAgICAgIGlkOiAnd29yZHMgbWF0dGVyJyxcbiAgICAgICAgcmVnZXg6IC8oc2xhdmV8YmxhY2stP2xpc3R8d2hpdGUtP2xpc3R8KD88IVxcLylcXGJtYXN0ZXJcXGIpL2lcbiAgICAgIH0sXG5cbiAgICAgIC8vIEFueSBpbnN0YW5jZXMgb2YgeW91dHViZS5jb20gc2hvdWxkIGVuZm9yY2UgdGhhdCB3ZSB1c2UgeW91dHViZS1ub2Nvb2tpZS5jb21cbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93ZWJzaXRlL2lzc3Vlcy8xMzc2XG4gICAgICAvLyBodHRwczovL3N1cHBvcnQuZ29vZ2xlLmNvbS95b3V0dWJlL2Fuc3dlci8xNzE3ODA/aGw9ZW4jemlwcHk9JTJDdHVybi1vbi1wcml2YWN5LWVuaGFuY2VkLW1vZGVcbiAgICAgIHtcbiAgICAgICAgaWQ6ICdyZXF1aXJlIHlvdXR1YmUgcHJpdmFjeSBlbmhhbmNlZCBtb2RlJyxcbiAgICAgICAgcmVnZXg6IC95b3V0dWJlKD86KD8hLW5vY29va2llKS4pKlxcLmNvbS9cbiAgICAgIH0sXG5cbiAgICAgICcuLi9waGV0LWxpYi9qcy9waGV0LWxpYi1vbmx5LWltcG9ydHMnLCAvLyB1c2UgZGlyZWN0IGltcG9ydHNcblxuICAgICAgJ1V0aWwgPSByZXF1aXJlKCBcXCcnLCAvLyBVdGlscyBzaG91bGQgbm93IGJlIHBsdXJhbCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YXNrcy9pc3N1ZXMvOTY2XG5cbiAgICAgIC8vIGlmIG9uIGEgb25lIGxpbmUgYXJyb3cgZnVuY3Rpb24gcmV0dXJuaW5nIHNvbWV0aGluZywgcHJlZmVyIGluc3RlYWQgYCgpID0+IHRoZVJldHVybmAsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvNzkwXG4gICAgICAnID0+IHsgcmV0dXJuICcsXG5cbiAgICAgICdkZWZpbmUoIGZ1bmN0aW9uKCByZXF1aXJlICkgeycsIC8vIHVzZSBkZWZpbmUoIHJlcXVpcmUgPT4geyB0byBzdGFuZGFyZGl6ZSBiZWZvcmUgZXM2IG1vZHVsZSBtaWdyYXRpb25cblxuICAgICAgLy8gb3B0aW9uYWwgJ29wdGlvbnMnIHNob3VsZCB1c2UgYnJhY2tldHMgYW5kIHJlcXVpcmVkICdjb25maWcnIHNob3VsZG4ndCB1c2UgYnJhY2tldHMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvODU5XG4gICAgICAnQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMnLFxuICAgICAgJ0BwYXJhbSB7T2JqZWN0fSBbY29uZmlnXScsXG5cbiAgICAgIC8vIFBoRVQgcHJlZmVycyB0byB1c2UgdGhlIHRlcm0gXCJwb3NpdGlvblwiIHRvIHJlZmVyIHRvIHRoZSBwaHlzaWNhbCAoeCx5KSBwb3NpdGlvbiBvZiBvYmplY3RzLlxuICAgICAgLy8gVGhlIGxpbnQgcnVsZSBjYW4gYmUgZGlzYWJsZWQgZm9yIG9jY3VycmVuY2VzIHdoZXJlIHdlIGRvIHByZWZlciBsb2NhdGlvblByb3BlcnR5LCBmb3IgaW5zdGFuY2UgaWYgd2VcbiAgICAgIC8vIGhhZCBhIHNpbSBhYm91dCBwZW9wbGUgdGhhdCBhcmUgZnJvbSB0aHJlZSBkaWZmZXJlbnQgbmFtZWQgbG9jYXRpb25zLlxuICAgICAgJ2xvY2F0aW9uUHJvcGVydHknLFxuXG4gICAgICAvLyBvcHRpb25pemUgY2Fubm90IGluZmVyIGl0cyB0eXBlIGFyZ3VtZW50cywgcGFzcyB0aGVtIGxpa2UgYG9wdGlvbml6ZTxNeU9wdGlvbnMuIC4gLj4oKSgpXG4gICAgICAnb3B0aW9uaXplKCcsXG5cbiAgICAgIC8vIEluIGdlbmVyYWwsIHlvdSBzaG91bGQgbm90IGR1cGxpY2F0ZSBRdWVyeVN0cmluZ01hY2hpbmUgZ2V0dGluZyBwaGV0aW9EZWJ1ZywgaW5zdGVhZCBqdXN0IHVzZSBQaGV0aW9DbGllbnQucHJvdG90eXBlLmdldERlYnVnTW9kZUVuYWJsZWQoKSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xODU5XG4gICAgICAncGhldGlvRGVidWc6JyxcblxuICAgICAge1xuICAgICAgICBpZDogJ0V4cG9ydCBzdGF0ZW1lbnRzIHNob3VsZCBub3QgaGF2ZSBhIHJlZ2lzdGVyIGNhbGwnLFxuICAgICAgICBwcmVkaWNhdGU6IGxpbmUgPT4ge1xuICAgICAgICAgIGlmICggbGluZS50cmltKCkuaW5kZXhPZiggJ2V4cG9ydCBkZWZhdWx0JyApID09PSAwICYmIGxpbmUuaW5kZXhPZiggJy5yZWdpc3RlcignICkgPj0gMCApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIFNob3VsZCBoYXZlIGEgcGVyaW9kIGJlZm9yZSBcIjxcIiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMDA1IGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTAwM1xuICAgICAgeyBpZDogJ1R5cGU8UGFyYW1ldGVyPiAoYWRkIGEgZG90KScsIHJlZ2V4OiAve1teXFxuOl0qW0Etel08W0Etel1bfCc8PkEtel0rPlteXFxuOnt9XSp9fS8gfSxcblxuICAgICAgLy8gZXNsaW50IGRpc2FibGUgbGluZSBkaXJlY3RpdmVzIG11c3QgaGF2ZSBhbiBleHBsYW5hdGlvblxuICAgICAge1xuICAgICAgICBpZDogJ2VzbGludC1kaXNhYmxlLWxpbmUgZGlyZWN0aXZlcyBtdXN0IGhhdmUgZXhwbGFuYXRpb24nLFxuICAgICAgICBwcmVkaWNhdGU6IGxpbmUgPT4gIWxpbmUudHJpbSgpLmVuZHNXaXRoKCAnZXNsaW50LWRpc2FibGUtbGluZScgKSxcblxuICAgICAgICAvLyBSZXBvcnQgdGhlIGVycm9yIG9uIHRoZSBwcmV2aW91cyBsaW5lIHNvIGl0IGRvZXNuJ3QgZ2V0IGRpc2FibGVkXG4gICAgICAgIGxpbmVOdW1iZXJEZWx0YTogLTFcbiAgICAgIH0sXG5cbiAgICAgIC8vIGVzbGludCBkaXNhYmxlIG5leHQgbGluZSBkaXJlY3RpdmVzIG11c3QgaGF2ZSBhbiBleHBsYW5hdGlvblxuICAgICAge1xuICAgICAgICBpZDogJ2VzbGludC1kaXNhYmxlLW5leHQtbGluZSBkaXJlY3RpdmVzIG11c3QgaGF2ZSBleHBsYW5hdGlvbicsXG4gICAgICAgIHByZWRpY2F0ZTogbGluZSA9PiAhbGluZS50cmltKCkuZW5kc1dpdGgoICdlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUnIClcbiAgICAgIH0sXG5cbiAgICAgIC8vIFByZWZlciBfLmFzc2lnbkluKCkgd2hpY2ggcmV0dXJucyB0aGUgb2JqZWN0IGluIGl0cyB0eXBlIGRvYywgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Rhc2tzL2lzc3Vlcy8xMTMwXG4gICAgICAnID0gXy5leHRlbmQoJ1xuICAgIF07XG5cbiAgICByZXR1cm4ge1xuICAgICAgUHJvZ3JhbTogZ2V0QmFkVGV4dFRlc3RlciggJ2JhZC10ZXh0JywgZm9yYmlkZGVuVGV4dE9iamVjdHMsIGNvbnRleHQgKVxuICAgIH07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLnNjaGVtYSA9IFtcbiAgLy8gSlNPTiBTY2hlbWEgZm9yIHJ1bGUgb3B0aW9ucyBnb2VzIGhlcmVcbl07Il0sIm5hbWVzIjpbImdldEJhZFRleHRUZXN0ZXIiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsImNyZWF0ZSIsImNvbnRleHQiLCJmb3JiaWRkZW5UZXh0T2JqZWN0cyIsImlkIiwiY29kZVRva2VucyIsInJlZ2V4IiwicHJlZGljYXRlIiwibGluZSIsInRyaW0iLCJpbmRleE9mIiwiZW5kc1dpdGgiLCJsaW5lTnVtYmVyRGVsdGEiLCJQcm9ncmFtIiwic2NoZW1hIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFDdEQsZ0NBQWdDLEdBRWhDOzs7OztDQUtDLEdBR0QsTUFBTUEsbUJBQW1CQyxRQUFTO0FBRWxDQyxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsUUFBUSxTQUFVQyxPQUFPO1FBRXZCLGtDQUFrQztRQUNsQyxNQUFNQyx1QkFBdUI7WUFFM0IsMkJBQTJCO1lBRTNCLHNCQUFzQjtZQUN0QjtZQUNBO1lBQ0E7WUFFQSx1QkFBdUI7WUFDdkI7WUFDQTtZQUNBO1lBRUE7WUFDQTtZQUVBO1lBRUEsNkRBQTZEO1lBQzdEO1lBRUEsMkJBQTJCO1lBQzNCO1lBQ0E7WUFDQTtZQUNBO1lBRUEsbUpBQW1KO1lBQ25KO1lBQ0E7WUFFQSw0RkFBNEY7WUFDNUY7WUFFQSx3REFBd0Q7WUFDeEQ7Z0JBQUVDLElBQUk7Z0JBQW1CQyxZQUFZO29CQUFFO29CQUFXO2lCQUFVO1lBQUM7WUFFN0QsZ0NBQWdDO1lBQ2hDO1lBQ0E7WUFDQTtZQUVBLHVDQUF1QztZQUN2QztZQUNBO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBO2dCQUFFRCxJQUFJO2dCQUFXRSxPQUFPO1lBQVk7WUFDcEMsNkVBQTZFO1lBQzdFO1lBQ0E7WUFDQTtZQUVBLDJHQUEyRztZQUMzRztZQUNBO1lBRUE7WUFFQSxvR0FBb0c7WUFDcEcscURBQXFEO1lBQ3JELGdIQUFnSDtZQUNoSCxtQkFBbUI7WUFDbkI7Z0JBQ0VGLElBQUk7Z0JBQ0pFLE9BQU87WUFDVDtZQUVBLCtFQUErRTtZQUMvRSxrREFBa0Q7WUFDbEQsZ0dBQWdHO1lBQ2hHO2dCQUNFRixJQUFJO2dCQUNKRSxPQUFPO1lBQ1Q7WUFFQTtZQUVBO1lBRUEsNElBQTRJO1lBQzVJO1lBRUE7WUFFQSwwSUFBMEk7WUFDMUk7WUFDQTtZQUVBLDhGQUE4RjtZQUM5Rix3R0FBd0c7WUFDeEcsd0VBQXdFO1lBQ3hFO1lBRUEsMkZBQTJGO1lBQzNGO1lBRUEsa01BQWtNO1lBQ2xNO1lBRUE7Z0JBQ0VGLElBQUk7Z0JBQ0pHLFdBQVdDLENBQUFBO29CQUNULElBQUtBLEtBQUtDLElBQUksR0FBR0MsT0FBTyxDQUFFLHNCQUF1QixLQUFLRixLQUFLRSxPQUFPLENBQUUsaUJBQWtCLEdBQUk7d0JBQ3hGLE9BQU87b0JBQ1Q7b0JBQ0EsT0FBTztnQkFDVDtZQUNGO1lBRUEsMklBQTJJO1lBQzNJO2dCQUFFTixJQUFJO2dCQUErQkUsT0FBTztZQUE0QztZQUV4RiwwREFBMEQ7WUFDMUQ7Z0JBQ0VGLElBQUk7Z0JBQ0pHLFdBQVdDLENBQUFBLE9BQVEsQ0FBQ0EsS0FBS0MsSUFBSSxHQUFHRSxRQUFRLENBQUU7Z0JBRTFDLG1FQUFtRTtnQkFDbkVDLGlCQUFpQixDQUFDO1lBQ3BCO1lBRUEsK0RBQStEO1lBQy9EO2dCQUNFUixJQUFJO2dCQUNKRyxXQUFXQyxDQUFBQSxPQUFRLENBQUNBLEtBQUtDLElBQUksR0FBR0UsUUFBUSxDQUFFO1lBQzVDO1lBRUEsOEdBQThHO1lBQzlHO1NBQ0Q7UUFFRCxPQUFPO1lBQ0xFLFNBQVNoQixpQkFBa0IsWUFBWU0sc0JBQXNCRDtRQUMvRDtJQUNGO0FBQ0Y7QUFFQUgsT0FBT0MsT0FBTyxDQUFDYyxNQUFNLEdBQUcsRUFFdkIifQ==