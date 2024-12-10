// Copyright 2019-2022, University of Colorado Boulder
/**
 * Lint detector for invalid text.
 * Lint is disabled for this file so the bad texts aren't themselves flagged.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ const getBadTextTester = require('./getBadTextTester');
module.exports = {
    create: function(context) {
        // see getBadTextTester for schema.
        const forbiddenTextObjects = [
            // should be using phet.dot.Utils.roundSymmetric, Math.round does not treat positive and negative numbers
            // symmetrically see https://github.com/phetsims/dot/issues/35#issuecomment-113587879
            {
                id: 'Math.round(',
                codeTokens: [
                    'Math',
                    '.',
                    'round',
                    '('
                ]
            },
            // should be using `DOT/dotRandom`
            {
                id: 'Math.random()',
                codeTokens: [
                    'Math',
                    '.',
                    'random',
                    '(',
                    ')'
                ]
            },
            {
                id: '_.shuffle(',
                codeTokens: [
                    '_',
                    '.',
                    'shuffle',
                    '('
                ]
            },
            {
                id: '_.sample(',
                codeTokens: [
                    '_',
                    '.',
                    'sample',
                    '('
                ]
            },
            {
                id: '_.random(',
                codeTokens: [
                    '_',
                    '.',
                    'random',
                    '('
                ]
            },
            {
                id: 'new Random()',
                codeTokens: [
                    'new',
                    'Random',
                    '(',
                    ')'
                ]
            },
            // You can use parseInt if you need a non base 10 radix
            {
                id: 'Number.parseInt(',
                codeTokens: [
                    'Number',
                    '.',
                    'parseInt',
                    '('
                ]
            },
            {
                id: 'Array.prototype.find',
                codeTokens: [
                    'Array',
                    '.',
                    'prototype',
                    '.',
                    'find'
                ]
            },
            // ParallelDOM.pdomOrder should not be mutated, instead only set with `setPDOMOrder`
            '.pdomOrder.push(',
            // Should import dotRandom instead of using the namespace
            'phet.dot.dotRandom',
            // Prefer using Pointer.isTouchLike() to help support Pen. This is not set in stone, please see
            // https://github.com/phetsims/scenery/issues/1156 and feel free to discuss if there are usages you want to support.
            ' instanceof Touch ',
            // Prevent accidental importing of files from the TypeScript build output directory
            'chipper/dist',
            // Relying on these in sim code can break PhET-iO playback, instead use Sim.dimensionProperty, see https://github.com/phetsims/joist/issues/768
            'window.innerWidth',
            'window.innerHeight',
            // These are types that can be inferred by the common code and provided arguments
            'new Enumeration<',
            'new EnumerationProperty<',
            // Voicing utterances should be registered with a Node for "voicing visibility", using Voicing.alertUtterance asserts
            // that. See https://github.com/phetsims/scenery/issues/1403
            'voicingUtteranceQueue.addToBack',
            // Please use Text/RichText.STRING_PROPERTY_TANDEM_NAME when appropriate (though not all usages apply here, and
            // you can ignore this rule), https://github.com/phetsims/scenery/issues/1451#issuecomment-1270576831
            '\'stringProperty\'',
            // Just pass these through, they work with structured cloning as is! See https://github.com/phetsims/tandem/issues/280
            ' NumberIO.toStateObject',
            ' NumberIO.fromStateObject',
            ' BooleanIO.toStateObject',
            ' BooleanIO.fromStateObject',
            ' StringIO.toStateObject',
            ' StringIO.fromStateObject',
            'new Tandem(',
            // Instead of using your own assertion, see and use Disposable.assertNotDisposable(), https://github.com/phetsims/axon/issues/436
            'dispose is not supported, exists for the lifetime of the sim',
            // In sims, don't allow setTimout and setInterval calls coming from window, see https://github.com/phetsims/phet-info/issues/59
            {
                id: 'setTimeout(',
                regex: /(window\.| )setTimeout\(/
            },
            {
                id: 'setInterval(',
                regex: /(window\.| )setInterval\(/
            },
            // Decided on during developer meeting, in regards to https://github.com/phetsims/scenery/issues/1324, use `{ Type }`
            // import syntax from SCENERY/imports.js
            {
                id: 'should import from SCENERY/imports.js instead of directly',
                regex: /import.*from.*\/scenery\/(?!js\/imports.js)/
            },
            // Decided on during developer meeting, in regards to https://github.com/phetsims/scenery/issues/1324, use `{ Type }`
            // import syntax from KITE/imports.js
            {
                id: 'should import from KITE/imports.js instead of directly',
                regex: /import.*from.*\/kite\/(?!js\/imports.js)/
            },
            // See https://github.com/phetsims/tandem/issues/302. We don't want to duplicate this type everywhere. Also use 2
            // spaces to prevent false positive for class fields like `public tandem: Tandem;` (which is fine).
            {
                id: 'Do not duplicate the definition of Tandem, instead use PickRequired<PhetioObjectOptions, \'tandem\'>',
                regex: / {2}tandem\??: Tandem;/
            },
            // DOT/Utils.toFixed or DOT/Utils.toFixedNumber should be used instead of toFixed.
            // JavaScript's toFixed is notoriously buggy. Behavior differs depending on browser,
            // because the spec doesn't specify whether to round or floor.
            {
                id: '.toFixed(',
                regex: new RegExp('(?<!Utils)\\.toFixed\\(') // NOTE: eslint parsing breaks when using regex syntax like `/regex/`
            },
            {
                id: 'Import statements require a *.js suffix',
                predicate: (line)=>{
                    if (line.trim().indexOf('import \'') === 0 && line.indexOf(';') >= 0 && line.indexOf('.js') === -1) {
                        return false;
                    }
                    return true;
                }
            },
            {
                id: 'Prefer "Standard PhET-iO Wrapper to "standard wrapper"',
                regex: /[Ss][Tt][Aa][Nn][Dd][Aa][Rr][Dd][- _][Ww][Rr][Aa][Pp][Pp][Ee][Rr]/
            },
            // combo box is two words, moved to sim-specific bad text from the general one because of https://github.com/phetsims/website-meteor/issues/690
            'combobox',
            'Combobox',
            'COMBOBOX' // prefer COMBO_BOX
        ];
        return {
            Program: getBadTextTester('bad-sim-text', forbiddenTextObjects, context)
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9iYWQtc2ltLXRleHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cblxuLyoqXG4gKiBMaW50IGRldGVjdG9yIGZvciBpbnZhbGlkIHRleHQuXG4gKiBMaW50IGlzIGRpc2FibGVkIGZvciB0aGlzIGZpbGUgc28gdGhlIGJhZCB0ZXh0cyBhcmVuJ3QgdGhlbXNlbHZlcyBmbGFnZ2VkLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgZ2V0QmFkVGV4dFRlc3RlciA9IHJlcXVpcmUoICcuL2dldEJhZFRleHRUZXN0ZXInICk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uKCBjb250ZXh0ICkge1xuXG4gICAgLy8gc2VlIGdldEJhZFRleHRUZXN0ZXIgZm9yIHNjaGVtYS5cbiAgICBjb25zdCBmb3JiaWRkZW5UZXh0T2JqZWN0cyA9IFtcblxuICAgICAgLy8gc2hvdWxkIGJlIHVzaW5nIHBoZXQuZG90LlV0aWxzLnJvdW5kU3ltbWV0cmljLCBNYXRoLnJvdW5kIGRvZXMgbm90IHRyZWF0IHBvc2l0aXZlIGFuZCBuZWdhdGl2ZSBudW1iZXJzXG4gICAgICAvLyBzeW1tZXRyaWNhbGx5IHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy8zNSNpc3N1ZWNvbW1lbnQtMTEzNTg3ODc5XG4gICAgICB7IGlkOiAnTWF0aC5yb3VuZCgnLCBjb2RlVG9rZW5zOiBbICdNYXRoJywgJy4nLCAncm91bmQnLCAnKCcgXSB9LFxuXG4gICAgICAvLyBzaG91bGQgYmUgdXNpbmcgYERPVC9kb3RSYW5kb21gXG4gICAgICB7IGlkOiAnTWF0aC5yYW5kb20oKScsIGNvZGVUb2tlbnM6IFsgJ01hdGgnLCAnLicsICdyYW5kb20nLCAnKCcsICcpJyBdIH0sXG4gICAgICB7IGlkOiAnXy5zaHVmZmxlKCcsIGNvZGVUb2tlbnM6IFsgJ18nLCAnLicsICdzaHVmZmxlJywgJygnIF0gfSxcbiAgICAgIHsgaWQ6ICdfLnNhbXBsZSgnLCBjb2RlVG9rZW5zOiBbICdfJywgJy4nLCAnc2FtcGxlJywgJygnIF0gfSxcbiAgICAgIHsgaWQ6ICdfLnJhbmRvbSgnLCBjb2RlVG9rZW5zOiBbICdfJywgJy4nLCAncmFuZG9tJywgJygnIF0gfSxcbiAgICAgIHsgaWQ6ICduZXcgUmFuZG9tKCknLCBjb2RlVG9rZW5zOiBbICduZXcnLCAnUmFuZG9tJywgJygnLCAnKScgXSB9LFxuXG4gICAgICAvLyBZb3UgY2FuIHVzZSBwYXJzZUludCBpZiB5b3UgbmVlZCBhIG5vbiBiYXNlIDEwIHJhZGl4XG4gICAgICB7IGlkOiAnTnVtYmVyLnBhcnNlSW50KCcsIGNvZGVUb2tlbnM6IFsgJ051bWJlcicsICcuJywgJ3BhcnNlSW50JywgJygnIF0gfSxcbiAgICAgIHsgaWQ6ICdBcnJheS5wcm90b3R5cGUuZmluZCcsIGNvZGVUb2tlbnM6IFsgJ0FycmF5JywgJy4nLCAncHJvdG90eXBlJywgJy4nLCAnZmluZCcgXSB9LFxuXG4gICAgICAvLyBQYXJhbGxlbERPTS5wZG9tT3JkZXIgc2hvdWxkIG5vdCBiZSBtdXRhdGVkLCBpbnN0ZWFkIG9ubHkgc2V0IHdpdGggYHNldFBET01PcmRlcmBcbiAgICAgICcucGRvbU9yZGVyLnB1c2goJyxcblxuICAgICAgLy8gU2hvdWxkIGltcG9ydCBkb3RSYW5kb20gaW5zdGVhZCBvZiB1c2luZyB0aGUgbmFtZXNwYWNlXG4gICAgICAncGhldC5kb3QuZG90UmFuZG9tJyxcblxuICAgICAgLy8gUHJlZmVyIHVzaW5nIFBvaW50ZXIuaXNUb3VjaExpa2UoKSB0byBoZWxwIHN1cHBvcnQgUGVuLiBUaGlzIGlzIG5vdCBzZXQgaW4gc3RvbmUsIHBsZWFzZSBzZWVcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMTU2IGFuZCBmZWVsIGZyZWUgdG8gZGlzY3VzcyBpZiB0aGVyZSBhcmUgdXNhZ2VzIHlvdSB3YW50IHRvIHN1cHBvcnQuXG4gICAgICAnIGluc3RhbmNlb2YgVG91Y2ggJyxcblxuICAgICAgLy8gUHJldmVudCBhY2NpZGVudGFsIGltcG9ydGluZyBvZiBmaWxlcyBmcm9tIHRoZSBUeXBlU2NyaXB0IGJ1aWxkIG91dHB1dCBkaXJlY3RvcnlcbiAgICAgICdjaGlwcGVyL2Rpc3QnLFxuXG4gICAgICAvLyBSZWx5aW5nIG9uIHRoZXNlIGluIHNpbSBjb2RlIGNhbiBicmVhayBQaEVULWlPIHBsYXliYWNrLCBpbnN0ZWFkIHVzZSBTaW0uZGltZW5zaW9uUHJvcGVydHksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzc2OFxuICAgICAgJ3dpbmRvdy5pbm5lcldpZHRoJyxcbiAgICAgICd3aW5kb3cuaW5uZXJIZWlnaHQnLFxuXG4gICAgICAvLyBUaGVzZSBhcmUgdHlwZXMgdGhhdCBjYW4gYmUgaW5mZXJyZWQgYnkgdGhlIGNvbW1vbiBjb2RlIGFuZCBwcm92aWRlZCBhcmd1bWVudHNcbiAgICAgICduZXcgRW51bWVyYXRpb248JyxcbiAgICAgICduZXcgRW51bWVyYXRpb25Qcm9wZXJ0eTwnLFxuXG4gICAgICAvLyBWb2ljaW5nIHV0dGVyYW5jZXMgc2hvdWxkIGJlIHJlZ2lzdGVyZWQgd2l0aCBhIE5vZGUgZm9yIFwidm9pY2luZyB2aXNpYmlsaXR5XCIsIHVzaW5nIFZvaWNpbmcuYWxlcnRVdHRlcmFuY2UgYXNzZXJ0c1xuICAgICAgLy8gdGhhdC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNDAzXG4gICAgICAndm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjaycsXG5cbiAgICAgIC8vIFBsZWFzZSB1c2UgVGV4dC9SaWNoVGV4dC5TVFJJTkdfUFJPUEVSVFlfVEFOREVNX05BTUUgd2hlbiBhcHByb3ByaWF0ZSAodGhvdWdoIG5vdCBhbGwgdXNhZ2VzIGFwcGx5IGhlcmUsIGFuZFxuICAgICAgLy8geW91IGNhbiBpZ25vcmUgdGhpcyBydWxlKSwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE0NTEjaXNzdWVjb21tZW50LTEyNzA1NzY4MzFcbiAgICAgICdcXCdzdHJpbmdQcm9wZXJ0eVxcJycsXG5cbiAgICAgIC8vIEp1c3QgcGFzcyB0aGVzZSB0aHJvdWdoLCB0aGV5IHdvcmsgd2l0aCBzdHJ1Y3R1cmVkIGNsb25pbmcgYXMgaXMhIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFuZGVtL2lzc3Vlcy8yODBcbiAgICAgICcgTnVtYmVySU8udG9TdGF0ZU9iamVjdCcsXG4gICAgICAnIE51bWJlcklPLmZyb21TdGF0ZU9iamVjdCcsXG4gICAgICAnIEJvb2xlYW5JTy50b1N0YXRlT2JqZWN0JyxcbiAgICAgICcgQm9vbGVhbklPLmZyb21TdGF0ZU9iamVjdCcsXG4gICAgICAnIFN0cmluZ0lPLnRvU3RhdGVPYmplY3QnLFxuICAgICAgJyBTdHJpbmdJTy5mcm9tU3RhdGVPYmplY3QnLFxuXG4gICAgICAnbmV3IFRhbmRlbSgnLCAvLyB1c2UgY3JlYXRlVGFuZGVtKCksIG5ldmVyIGluc3RhbnRpYXRlIHlvdXIgb3duIFRhbmRlbSBwbGVhc2VcblxuICAgICAgLy8gSW5zdGVhZCBvZiB1c2luZyB5b3VyIG93biBhc3NlcnRpb24sIHNlZSBhbmQgdXNlIERpc3Bvc2FibGUuYXNzZXJ0Tm90RGlzcG9zYWJsZSgpLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXhvbi9pc3N1ZXMvNDM2XG4gICAgICAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyxcblxuICAgICAgLy8gSW4gc2ltcywgZG9uJ3QgYWxsb3cgc2V0VGltb3V0IGFuZCBzZXRJbnRlcnZhbCBjYWxscyBjb21pbmcgZnJvbSB3aW5kb3csIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pbmZvL2lzc3Vlcy81OVxuICAgICAge1xuICAgICAgICBpZDogJ3NldFRpbWVvdXQoJyxcbiAgICAgICAgcmVnZXg6IC8od2luZG93XFwufCApc2V0VGltZW91dFxcKC9cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiAnc2V0SW50ZXJ2YWwoJyxcbiAgICAgICAgcmVnZXg6IC8od2luZG93XFwufCApc2V0SW50ZXJ2YWxcXCgvXG4gICAgICB9LFxuXG4gICAgICAvLyBEZWNpZGVkIG9uIGR1cmluZyBkZXZlbG9wZXIgbWVldGluZywgaW4gcmVnYXJkcyB0byBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTMyNCwgdXNlIGB7IFR5cGUgfWBcbiAgICAgIC8vIGltcG9ydCBzeW50YXggZnJvbSBTQ0VORVJZL2ltcG9ydHMuanNcbiAgICAgIHtcbiAgICAgICAgaWQ6ICdzaG91bGQgaW1wb3J0IGZyb20gU0NFTkVSWS9pbXBvcnRzLmpzIGluc3RlYWQgb2YgZGlyZWN0bHknLFxuICAgICAgICByZWdleDogL2ltcG9ydC4qZnJvbS4qXFwvc2NlbmVyeVxcLyg/IWpzXFwvaW1wb3J0cy5qcykvXG4gICAgICB9LFxuXG4gICAgICAvLyBEZWNpZGVkIG9uIGR1cmluZyBkZXZlbG9wZXIgbWVldGluZywgaW4gcmVnYXJkcyB0byBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTMyNCwgdXNlIGB7IFR5cGUgfWBcbiAgICAgIC8vIGltcG9ydCBzeW50YXggZnJvbSBLSVRFL2ltcG9ydHMuanNcbiAgICAgIHtcbiAgICAgICAgaWQ6ICdzaG91bGQgaW1wb3J0IGZyb20gS0lURS9pbXBvcnRzLmpzIGluc3RlYWQgb2YgZGlyZWN0bHknLFxuICAgICAgICByZWdleDogL2ltcG9ydC4qZnJvbS4qXFwva2l0ZVxcLyg/IWpzXFwvaW1wb3J0cy5qcykvXG4gICAgICB9LFxuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbmRlbS9pc3N1ZXMvMzAyLiBXZSBkb24ndCB3YW50IHRvIGR1cGxpY2F0ZSB0aGlzIHR5cGUgZXZlcnl3aGVyZS4gQWxzbyB1c2UgMlxuICAgICAgLy8gc3BhY2VzIHRvIHByZXZlbnQgZmFsc2UgcG9zaXRpdmUgZm9yIGNsYXNzIGZpZWxkcyBsaWtlIGBwdWJsaWMgdGFuZGVtOiBUYW5kZW07YCAod2hpY2ggaXMgZmluZSkuXG4gICAgICB7XG4gICAgICAgIGlkOiAnRG8gbm90IGR1cGxpY2F0ZSB0aGUgZGVmaW5pdGlvbiBvZiBUYW5kZW0sIGluc3RlYWQgdXNlIFBpY2tSZXF1aXJlZDxQaGV0aW9PYmplY3RPcHRpb25zLCBcXCd0YW5kZW1cXCc+JyxcbiAgICAgICAgcmVnZXg6IC8gezJ9dGFuZGVtXFw/PzogVGFuZGVtOy9cbiAgICAgIH0sXG5cbiAgICAgIC8vIERPVC9VdGlscy50b0ZpeGVkIG9yIERPVC9VdGlscy50b0ZpeGVkTnVtYmVyIHNob3VsZCBiZSB1c2VkIGluc3RlYWQgb2YgdG9GaXhlZC5cbiAgICAgIC8vIEphdmFTY3JpcHQncyB0b0ZpeGVkIGlzIG5vdG9yaW91c2x5IGJ1Z2d5LiBCZWhhdmlvciBkaWZmZXJzIGRlcGVuZGluZyBvbiBicm93c2VyLFxuICAgICAgLy8gYmVjYXVzZSB0aGUgc3BlYyBkb2Vzbid0IHNwZWNpZnkgd2hldGhlciB0byByb3VuZCBvciBmbG9vci5cbiAgICAgIHtcbiAgICAgICAgaWQ6ICcudG9GaXhlZCgnLCAvLyBzdXBwb3J0IHJlZ2V4IHdpdGggZW5nbGlzaCBuYW1lcyB0aGlzIHdheVxuICAgICAgICByZWdleDogbmV3IFJlZ0V4cCggJyg/PCFVdGlscylcXFxcLnRvRml4ZWRcXFxcKCcgKSAvLyBOT1RFOiBlc2xpbnQgcGFyc2luZyBicmVha3Mgd2hlbiB1c2luZyByZWdleCBzeW50YXggbGlrZSBgL3JlZ2V4L2BcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiAnSW1wb3J0IHN0YXRlbWVudHMgcmVxdWlyZSBhICouanMgc3VmZml4JyxcbiAgICAgICAgcHJlZGljYXRlOiBsaW5lID0+IHtcbiAgICAgICAgICBpZiAoIGxpbmUudHJpbSgpLmluZGV4T2YoICdpbXBvcnQgXFwnJyApID09PSAwICYmIGxpbmUuaW5kZXhPZiggJzsnICkgPj0gMCAmJiBsaW5lLmluZGV4T2YoICcuanMnICkgPT09IC0xICkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAge1xuICAgICAgICBpZDogJ1ByZWZlciBcIlN0YW5kYXJkIFBoRVQtaU8gV3JhcHBlciB0byBcInN0YW5kYXJkIHdyYXBwZXJcIicsXG4gICAgICAgIHJlZ2V4OiAvW1NzXVtUdF1bQWFdW05uXVtEZF1bQWFdW1JyXVtEZF1bLSBfXVtXd11bUnJdW0FhXVtQcF1bUHBdW0VlXVtScl0vXG4gICAgICB9LFxuXG4gICAgICAvLyBjb21ibyBib3ggaXMgdHdvIHdvcmRzLCBtb3ZlZCB0byBzaW0tc3BlY2lmaWMgYmFkIHRleHQgZnJvbSB0aGUgZ2VuZXJhbCBvbmUgYmVjYXVzZSBvZiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvd2Vic2l0ZS1tZXRlb3IvaXNzdWVzLzY5MFxuICAgICAgJ2NvbWJvYm94JywgLy8gcHJlZmVyIGNvbWJvIGJveFxuICAgICAgJ0NvbWJvYm94JywgLy8gcHJlZmVyIENvbWJvIEJveFxuICAgICAgJ0NPTUJPQk9YJyAvLyBwcmVmZXIgQ09NQk9fQk9YXG4gICAgXTtcblxuICAgIHJldHVybiB7XG4gICAgICBQcm9ncmFtOiBnZXRCYWRUZXh0VGVzdGVyKCAnYmFkLXNpbS10ZXh0JywgZm9yYmlkZGVuVGV4dE9iamVjdHMsIGNvbnRleHQgKVxuICAgIH07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLnNjaGVtYSA9IFtcbiAgLy8gSlNPTiBTY2hlbWEgZm9yIHJ1bGUgb3B0aW9ucyBnb2VzIGhlcmVcbl07Il0sIm5hbWVzIjpbImdldEJhZFRleHRUZXN0ZXIiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsImNyZWF0ZSIsImNvbnRleHQiLCJmb3JiaWRkZW5UZXh0T2JqZWN0cyIsImlkIiwiY29kZVRva2VucyIsInJlZ2V4IiwiUmVnRXhwIiwicHJlZGljYXRlIiwibGluZSIsInRyaW0iLCJpbmRleE9mIiwiUHJvZ3JhbSIsInNjaGVtYSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBR3REOzs7Ozs7Q0FNQyxHQUVELE1BQU1BLG1CQUFtQkMsUUFBUztBQUVsQ0MsT0FBT0MsT0FBTyxHQUFHO0lBQ2ZDLFFBQVEsU0FBVUMsT0FBTztRQUV2QixtQ0FBbUM7UUFDbkMsTUFBTUMsdUJBQXVCO1lBRTNCLHlHQUF5RztZQUN6RyxxRkFBcUY7WUFDckY7Z0JBQUVDLElBQUk7Z0JBQWVDLFlBQVk7b0JBQUU7b0JBQVE7b0JBQUs7b0JBQVM7aUJBQUs7WUFBQztZQUUvRCxrQ0FBa0M7WUFDbEM7Z0JBQUVELElBQUk7Z0JBQWlCQyxZQUFZO29CQUFFO29CQUFRO29CQUFLO29CQUFVO29CQUFLO2lCQUFLO1lBQUM7WUFDdkU7Z0JBQUVELElBQUk7Z0JBQWNDLFlBQVk7b0JBQUU7b0JBQUs7b0JBQUs7b0JBQVc7aUJBQUs7WUFBQztZQUM3RDtnQkFBRUQsSUFBSTtnQkFBYUMsWUFBWTtvQkFBRTtvQkFBSztvQkFBSztvQkFBVTtpQkFBSztZQUFDO1lBQzNEO2dCQUFFRCxJQUFJO2dCQUFhQyxZQUFZO29CQUFFO29CQUFLO29CQUFLO29CQUFVO2lCQUFLO1lBQUM7WUFDM0Q7Z0JBQUVELElBQUk7Z0JBQWdCQyxZQUFZO29CQUFFO29CQUFPO29CQUFVO29CQUFLO2lCQUFLO1lBQUM7WUFFaEUsdURBQXVEO1lBQ3ZEO2dCQUFFRCxJQUFJO2dCQUFvQkMsWUFBWTtvQkFBRTtvQkFBVTtvQkFBSztvQkFBWTtpQkFBSztZQUFDO1lBQ3pFO2dCQUFFRCxJQUFJO2dCQUF3QkMsWUFBWTtvQkFBRTtvQkFBUztvQkFBSztvQkFBYTtvQkFBSztpQkFBUTtZQUFDO1lBRXJGLG9GQUFvRjtZQUNwRjtZQUVBLHlEQUF5RDtZQUN6RDtZQUVBLCtGQUErRjtZQUMvRixvSEFBb0g7WUFDcEg7WUFFQSxtRkFBbUY7WUFDbkY7WUFFQSwrSUFBK0k7WUFDL0k7WUFDQTtZQUVBLGlGQUFpRjtZQUNqRjtZQUNBO1lBRUEscUhBQXFIO1lBQ3JILDREQUE0RDtZQUM1RDtZQUVBLCtHQUErRztZQUMvRyxxR0FBcUc7WUFDckc7WUFFQSxzSEFBc0g7WUFDdEg7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBO1lBRUE7WUFFQSxpSUFBaUk7WUFDakk7WUFFQSwrSEFBK0g7WUFDL0g7Z0JBQ0VELElBQUk7Z0JBQ0pFLE9BQU87WUFDVDtZQUNBO2dCQUNFRixJQUFJO2dCQUNKRSxPQUFPO1lBQ1Q7WUFFQSxxSEFBcUg7WUFDckgsd0NBQXdDO1lBQ3hDO2dCQUNFRixJQUFJO2dCQUNKRSxPQUFPO1lBQ1Q7WUFFQSxxSEFBcUg7WUFDckgscUNBQXFDO1lBQ3JDO2dCQUNFRixJQUFJO2dCQUNKRSxPQUFPO1lBQ1Q7WUFFQSxpSEFBaUg7WUFDakgsbUdBQW1HO1lBQ25HO2dCQUNFRixJQUFJO2dCQUNKRSxPQUFPO1lBQ1Q7WUFFQSxrRkFBa0Y7WUFDbEYsb0ZBQW9GO1lBQ3BGLDhEQUE4RDtZQUM5RDtnQkFDRUYsSUFBSTtnQkFDSkUsT0FBTyxJQUFJQyxPQUFRLDJCQUE0QixxRUFBcUU7WUFDdEg7WUFDQTtnQkFDRUgsSUFBSTtnQkFDSkksV0FBV0MsQ0FBQUE7b0JBQ1QsSUFBS0EsS0FBS0MsSUFBSSxHQUFHQyxPQUFPLENBQUUsaUJBQWtCLEtBQUtGLEtBQUtFLE9BQU8sQ0FBRSxRQUFTLEtBQUtGLEtBQUtFLE9BQU8sQ0FBRSxXQUFZLENBQUMsR0FBSTt3QkFDMUcsT0FBTztvQkFDVDtvQkFDQSxPQUFPO2dCQUNUO1lBQ0Y7WUFFQTtnQkFDRVAsSUFBSTtnQkFDSkUsT0FBTztZQUNUO1lBRUEsK0lBQStJO1lBQy9JO1lBQ0E7WUFDQSxXQUFXLG1CQUFtQjtTQUMvQjtRQUVELE9BQU87WUFDTE0sU0FBU2YsaUJBQWtCLGdCQUFnQk0sc0JBQXNCRDtRQUNuRTtJQUNGO0FBQ0Y7QUFFQUgsT0FBT0MsT0FBTyxDQUFDYSxNQUFNLEdBQUcsRUFFdkIifQ==