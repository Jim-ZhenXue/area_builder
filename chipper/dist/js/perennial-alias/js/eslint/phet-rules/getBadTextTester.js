// Copyright 2019, University of Colorado Boulder
/**
 * Bad text testing function for testing bad text in the project. Supports bad text as string ForbiddenTextObject.
 * ForbiddenTextObject's schema was designed to support getting accurate line numbers from bad text in comments and
 * in code. To support code, use `codeTokens` to specify how the bad text will be tokenized into Esprima nodes.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ const _ = require('lodash');
const assert = require('assert');
/**
 * @param {string} ruleName
 * @param {Array.<string|ForbiddenTextObject>} badTexts - if a string, will be converted into a ForbiddenTextObject
 * @param {Object} context - eslinting context given from the engine
 * @returns {function(node:Object)} - function that reports any bad text lint errors to the context
 */ module.exports = (ruleName, badTexts, context)=>{
    return (node)=>{
        const sourceCode = context.getSourceCode();
        const codeTokens = sourceCode.getTokens(node);
        const codeLines = sourceCode.lines;
        const text = sourceCode.text;
        /**
     * @param {number} lineNumber
     * @param {number} columnIndex
     * @param {number} lineLength
     * @param {string} message
     */ const reportBadText = (lineNumber, columnIndex, lineLength, message)=>{
            // esprima Token loc object, see https://esprima.readthedocs.io/en/latest/lexical-analysis.html
            const loc = {
                start: {
                    line: lineNumber,
                    column: columnIndex
                },
                end: {
                    line: lineNumber,
                    column: lineLength
                }
            };
            context.report({
                node: node,
                loc: loc,
                message: `Line contains bad text: '${message}'`
            });
        };
        /**
     *
     * @param {ForbiddenTextObject} forbiddenText
     */ const testBadText = (forbiddenText)=>{
            // no need to iterate through lines if the bad text isn't anywhere in the source code (unless we are checking a predicate)
            if (text.indexOf(forbiddenText.id) >= 0 || forbiddenText.predicate || forbiddenText.regex) {
                // If codeTokens are provided, only test this bad text in code, and not anywhere else.
                if (forbiddenText.codeTokens) {
                    testCodeTokens(context, codeTokens, forbiddenText);
                } else {
                    // test each line for the presence of the bad text
                    for(let i = 0; i < codeLines.length; i++){
                        const lineString = codeLines[i];
                        // lines are 1 based, codeLines array is 0 based. Can also add a delta so that rules about
                        // disable-line can report on an adjacent line. Seems to work correctly if badLineNumber === 0
                        const badLineNumber = i + 1 + (forbiddenText.lineNumberDelta || 0);
                        // only test regex if provided
                        if (forbiddenText.regex) {
                            const match = lineString.match(forbiddenText.regex);
                            if (match) {
                                reportBadText(badLineNumber, match.index, lineString.length, forbiddenText.id);
                            }
                        } else if (forbiddenText.predicate) {
                            const ok = forbiddenText.predicate(lineString);
                            if (!ok) {
                                reportBadText(badLineNumber, 0, lineString.length, forbiddenText.id);
                            }
                        } else {
                            const columnIndex = lineString.indexOf(forbiddenText.id);
                            if (columnIndex >= 0) {
                                reportBadText(badLineNumber, columnIndex, columnIndex + forbiddenText.id.length, forbiddenText.id);
                            }
                        }
                    }
                }
            }
        };
        badTexts.forEach((badText)=>{
            if (typeof badText === 'string') {
                badText = {
                    id: badText
                };
            }
            badText.regex && assert(badText.regex instanceof RegExp, 'regex, if provided, should be a RegExp');
            badText.predicate && assert(typeof badText.predicate === 'function', 'predicate, if provided, should be a function');
            if (badText.predicate) {
                assert(!badText.regex, 'Cannot supply predicate and regex');
            }
            badText.codeTokens && assert(Array.isArray(badText.codeTokens) && _.every(badText.codeTokens, (token)=>typeof token === 'string'), 'codeTokens, if provided, should be an array of strings');
            (!!badText.regex || !!badText.codeTokens) && assert(badText.regex !== badText.codeTokens, 'bad text can have codeTokens or regex, but not both');
            assert(typeof badText.id === 'string', 'id required');
            testBadText(badText);
        });
    };
/**
   * @typedef {Object} ForbiddenTextObject
   * @property {string} id - the "string-form" id of the bad text. should occur in the source code. Also what is
   *                            displayed on error. Used when checking for bad text in comments.
   * @property {Array.<string>} [codeTokens] - a list of the tokenized, ordered code sections that make up the bad text
   *                                           within the javascript code (not used for checking comments). If there
   *                                           is only one codeToken, then it will also be checked as a substring of each
   *                                           code tokens. Required unless specifying "global". If this is provided,
   *                                           then the bad text will only be checked in code, and not via each line.
   * @property {RegExp} [regex] - if provided, instead of checking the id as a string, test each line with this regex.
   * @property {function} [predicate] - if provided, instead of checking the id as a string, test each line with this function
   * @property {number} [lineNumberDelta] - if provided, instead report the error on a different line, to avoid lines
   *                                           that have eslint-disable directives
   */ };
/**
 * @param {Object} context
 * @param {Object} codeTokens - from sourceCode object
 * @param {ForbiddenTextObject} forbiddenTextObject
 * @returns {boolean} - false if no errors found via code tokens
 */ const testCodeTokens = (context, codeTokens, forbiddenTextObject)=>{
    const codeTokensArray = forbiddenTextObject.codeTokens;
    let foundFailure = false;
    // iterate through each code token in the node
    for(let i = 0; i < codeTokens.length; i++){
        const token = codeTokens[i]; // {Token}
        const failures = []; // a list of the tokens that match the forbidden code tokens,
        // loop through, looking ahead at each subsequent code token, breaking if they don't match the  forbidden tokens
        for(let j = 0; j < codeTokensArray.length; j++){
            const forbiddenCodePart = codeTokensArray[j];
            const combinedIndex = i + j;
            const tokenValue = codeTokens[combinedIndex].value;
            // multiple code tokens must match perfectly to conglomerate
            if (combinedIndex < codeTokens.length && tokenValue === forbiddenCodePart || // if there is only one, then check as a substring too
            codeTokensArray.length === 1 && tokenValue.indexOf(forbiddenCodePart) >= 0) {
                // if at the end of the sequence, then we have successfully found bad code text, add it to a list of failures.
                if (j === codeTokensArray.length - 1) {
                    failures.push(forbiddenTextObject);
                    foundFailure = true;
                }
            } else {
                break; // quit early because it was a non-match
            }
        }
        failures.forEach((failedTextObject)=>{
            context.report({
                loc: token.loc,
                message: `bad code text: "${failedTextObject.id}"`
            });
        });
    }
    return foundFailure;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9nZXRCYWRUZXh0VGVzdGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBCYWQgdGV4dCB0ZXN0aW5nIGZ1bmN0aW9uIGZvciB0ZXN0aW5nIGJhZCB0ZXh0IGluIHRoZSBwcm9qZWN0LiBTdXBwb3J0cyBiYWQgdGV4dCBhcyBzdHJpbmcgRm9yYmlkZGVuVGV4dE9iamVjdC5cbiAqIEZvcmJpZGRlblRleHRPYmplY3QncyBzY2hlbWEgd2FzIGRlc2lnbmVkIHRvIHN1cHBvcnQgZ2V0dGluZyBhY2N1cmF0ZSBsaW5lIG51bWJlcnMgZnJvbSBiYWQgdGV4dCBpbiBjb21tZW50cyBhbmRcbiAqIGluIGNvZGUuIFRvIHN1cHBvcnQgY29kZSwgdXNlIGBjb2RlVG9rZW5zYCB0byBzcGVjaWZ5IGhvdyB0aGUgYmFkIHRleHQgd2lsbCBiZSB0b2tlbml6ZWQgaW50byBFc3ByaW1hIG5vZGVzLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cblxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBydWxlTmFtZVxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nfEZvcmJpZGRlblRleHRPYmplY3Q+fSBiYWRUZXh0cyAtIGlmIGEgc3RyaW5nLCB3aWxsIGJlIGNvbnZlcnRlZCBpbnRvIGEgRm9yYmlkZGVuVGV4dE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgLSBlc2xpbnRpbmcgY29udGV4dCBnaXZlbiBmcm9tIHRoZSBlbmdpbmVcbiAqIEByZXR1cm5zIHtmdW5jdGlvbihub2RlOk9iamVjdCl9IC0gZnVuY3Rpb24gdGhhdCByZXBvcnRzIGFueSBiYWQgdGV4dCBsaW50IGVycm9ycyB0byB0aGUgY29udGV4dFxuICovXG5tb2R1bGUuZXhwb3J0cyA9ICggcnVsZU5hbWUsIGJhZFRleHRzLCBjb250ZXh0ICkgPT4ge1xuXG4gIHJldHVybiBub2RlID0+IHtcbiAgICBjb25zdCBzb3VyY2VDb2RlID0gY29udGV4dC5nZXRTb3VyY2VDb2RlKCk7XG4gICAgY29uc3QgY29kZVRva2VucyA9IHNvdXJjZUNvZGUuZ2V0VG9rZW5zKCBub2RlICk7XG4gICAgY29uc3QgY29kZUxpbmVzID0gc291cmNlQ29kZS5saW5lcztcbiAgICBjb25zdCB0ZXh0ID0gc291cmNlQ29kZS50ZXh0O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxpbmVOdW1iZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY29sdW1uSW5kZXhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGluZUxlbmd0aFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXG4gICAgICovXG4gICAgY29uc3QgcmVwb3J0QmFkVGV4dCA9ICggbGluZU51bWJlciwgY29sdW1uSW5kZXgsIGxpbmVMZW5ndGgsIG1lc3NhZ2UgKSA9PiB7XG5cbiAgICAgIC8vIGVzcHJpbWEgVG9rZW4gbG9jIG9iamVjdCwgc2VlIGh0dHBzOi8vZXNwcmltYS5yZWFkdGhlZG9jcy5pby9lbi9sYXRlc3QvbGV4aWNhbC1hbmFseXNpcy5odG1sXG4gICAgICBjb25zdCBsb2MgPSB7XG4gICAgICAgIHN0YXJ0OiB7IGxpbmU6IGxpbmVOdW1iZXIsIGNvbHVtbjogY29sdW1uSW5kZXggfSxcbiAgICAgICAgZW5kOiB7IGxpbmU6IGxpbmVOdW1iZXIsIGNvbHVtbjogbGluZUxlbmd0aCB9XG4gICAgICB9O1xuXG4gICAgICBjb250ZXh0LnJlcG9ydCgge1xuICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICBsb2M6IGxvYyxcbiAgICAgICAgbWVzc2FnZTogYExpbmUgY29udGFpbnMgYmFkIHRleHQ6ICcke21lc3NhZ2V9J2BcbiAgICAgIH0gKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0ZvcmJpZGRlblRleHRPYmplY3R9IGZvcmJpZGRlblRleHRcbiAgICAgKi9cbiAgICBjb25zdCB0ZXN0QmFkVGV4dCA9IGZvcmJpZGRlblRleHQgPT4ge1xuXG4gICAgICAvLyBubyBuZWVkIHRvIGl0ZXJhdGUgdGhyb3VnaCBsaW5lcyBpZiB0aGUgYmFkIHRleHQgaXNuJ3QgYW55d2hlcmUgaW4gdGhlIHNvdXJjZSBjb2RlICh1bmxlc3Mgd2UgYXJlIGNoZWNraW5nIGEgcHJlZGljYXRlKVxuICAgICAgaWYgKCB0ZXh0LmluZGV4T2YoIGZvcmJpZGRlblRleHQuaWQgKSA+PSAwIHx8IGZvcmJpZGRlblRleHQucHJlZGljYXRlIHx8IGZvcmJpZGRlblRleHQucmVnZXggKSB7XG5cbiAgICAgICAgLy8gSWYgY29kZVRva2VucyBhcmUgcHJvdmlkZWQsIG9ubHkgdGVzdCB0aGlzIGJhZCB0ZXh0IGluIGNvZGUsIGFuZCBub3QgYW55d2hlcmUgZWxzZS5cbiAgICAgICAgaWYgKCBmb3JiaWRkZW5UZXh0LmNvZGVUb2tlbnMgKSB7XG4gICAgICAgICAgdGVzdENvZGVUb2tlbnMoIGNvbnRleHQsIGNvZGVUb2tlbnMsIGZvcmJpZGRlblRleHQgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcblxuICAgICAgICAgIC8vIHRlc3QgZWFjaCBsaW5lIGZvciB0aGUgcHJlc2VuY2Ugb2YgdGhlIGJhZCB0ZXh0XG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY29kZUxpbmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgY29uc3QgbGluZVN0cmluZyA9IGNvZGVMaW5lc1sgaSBdO1xuXG4gICAgICAgICAgICAvLyBsaW5lcyBhcmUgMSBiYXNlZCwgY29kZUxpbmVzIGFycmF5IGlzIDAgYmFzZWQuIENhbiBhbHNvIGFkZCBhIGRlbHRhIHNvIHRoYXQgcnVsZXMgYWJvdXRcbiAgICAgICAgICAgIC8vIGRpc2FibGUtbGluZSBjYW4gcmVwb3J0IG9uIGFuIGFkamFjZW50IGxpbmUuIFNlZW1zIHRvIHdvcmsgY29ycmVjdGx5IGlmIGJhZExpbmVOdW1iZXIgPT09IDBcbiAgICAgICAgICAgIGNvbnN0IGJhZExpbmVOdW1iZXIgPSBpICsgMSArICggZm9yYmlkZGVuVGV4dC5saW5lTnVtYmVyRGVsdGEgfHwgMCApO1xuXG4gICAgICAgICAgICAvLyBvbmx5IHRlc3QgcmVnZXggaWYgcHJvdmlkZWRcbiAgICAgICAgICAgIGlmICggZm9yYmlkZGVuVGV4dC5yZWdleCApIHtcbiAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lU3RyaW5nLm1hdGNoKCBmb3JiaWRkZW5UZXh0LnJlZ2V4ICk7XG5cbiAgICAgICAgICAgICAgaWYgKCBtYXRjaCApIHtcbiAgICAgICAgICAgICAgICByZXBvcnRCYWRUZXh0KCBiYWRMaW5lTnVtYmVyLCBtYXRjaC5pbmRleCwgbGluZVN0cmluZy5sZW5ndGgsIGZvcmJpZGRlblRleHQuaWQgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIGZvcmJpZGRlblRleHQucHJlZGljYXRlICkge1xuICAgICAgICAgICAgICBjb25zdCBvayA9IGZvcmJpZGRlblRleHQucHJlZGljYXRlKCBsaW5lU3RyaW5nICk7XG4gICAgICAgICAgICAgIGlmICggIW9rICkge1xuICAgICAgICAgICAgICAgIHJlcG9ydEJhZFRleHQoIGJhZExpbmVOdW1iZXIsIDAsIGxpbmVTdHJpbmcubGVuZ3RoLCBmb3JiaWRkZW5UZXh0LmlkICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JbmRleCA9IGxpbmVTdHJpbmcuaW5kZXhPZiggZm9yYmlkZGVuVGV4dC5pZCApO1xuICAgICAgICAgICAgICBpZiAoIGNvbHVtbkluZGV4ID49IDAgKSB7XG4gICAgICAgICAgICAgICAgcmVwb3J0QmFkVGV4dCggYmFkTGluZU51bWJlciwgY29sdW1uSW5kZXgsIGNvbHVtbkluZGV4ICsgZm9yYmlkZGVuVGV4dC5pZC5sZW5ndGgsIGZvcmJpZGRlblRleHQuaWQgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBiYWRUZXh0cy5mb3JFYWNoKCBiYWRUZXh0ID0+IHtcblxuICAgICAgaWYgKCB0eXBlb2YgYmFkVGV4dCA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgIGJhZFRleHQgPSB7IGlkOiBiYWRUZXh0IH07XG4gICAgICB9XG4gICAgICBiYWRUZXh0LnJlZ2V4ICYmIGFzc2VydCggYmFkVGV4dC5yZWdleCBpbnN0YW5jZW9mIFJlZ0V4cCwgJ3JlZ2V4LCBpZiBwcm92aWRlZCwgc2hvdWxkIGJlIGEgUmVnRXhwJyApO1xuICAgICAgYmFkVGV4dC5wcmVkaWNhdGUgJiYgYXNzZXJ0KCB0eXBlb2YgYmFkVGV4dC5wcmVkaWNhdGUgPT09ICdmdW5jdGlvbicsICdwcmVkaWNhdGUsIGlmIHByb3ZpZGVkLCBzaG91bGQgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgIGlmICggYmFkVGV4dC5wcmVkaWNhdGUgKSB7XG4gICAgICAgIGFzc2VydCggIWJhZFRleHQucmVnZXgsICdDYW5ub3Qgc3VwcGx5IHByZWRpY2F0ZSBhbmQgcmVnZXgnICk7XG4gICAgICB9XG4gICAgICBiYWRUZXh0LmNvZGVUb2tlbnMgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBiYWRUZXh0LmNvZGVUb2tlbnMgKSAmJlxuICAgICAgXy5ldmVyeSggYmFkVGV4dC5jb2RlVG9rZW5zLCB0b2tlbiA9PiB0eXBlb2YgdG9rZW4gPT09ICdzdHJpbmcnICksXG4gICAgICAgICdjb2RlVG9rZW5zLCBpZiBwcm92aWRlZCwgc2hvdWxkIGJlIGFuIGFycmF5IG9mIHN0cmluZ3MnICk7XG4gICAgICAoICEhYmFkVGV4dC5yZWdleCB8fCAhIWJhZFRleHQuY29kZVRva2VucyApICYmIGFzc2VydCggYmFkVGV4dC5yZWdleCAhPT0gYmFkVGV4dC5jb2RlVG9rZW5zLFxuICAgICAgICAnYmFkIHRleHQgY2FuIGhhdmUgY29kZVRva2VucyBvciByZWdleCwgYnV0IG5vdCBib3RoJyApO1xuICAgICAgYXNzZXJ0KCB0eXBlb2YgYmFkVGV4dC5pZCA9PT0gJ3N0cmluZycsICdpZCByZXF1aXJlZCcgKTtcbiAgICAgIHRlc3RCYWRUZXh0KCBiYWRUZXh0ICk7XG4gICAgfSApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBGb3JiaWRkZW5UZXh0T2JqZWN0XG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpZCAtIHRoZSBcInN0cmluZy1mb3JtXCIgaWQgb2YgdGhlIGJhZCB0ZXh0LiBzaG91bGQgb2NjdXIgaW4gdGhlIHNvdXJjZSBjb2RlLiBBbHNvIHdoYXQgaXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheWVkIG9uIGVycm9yLiBVc2VkIHdoZW4gY2hlY2tpbmcgZm9yIGJhZCB0ZXh0IGluIGNvbW1lbnRzLlxuICAgKiBAcHJvcGVydHkge0FycmF5LjxzdHJpbmc+fSBbY29kZVRva2Vuc10gLSBhIGxpc3Qgb2YgdGhlIHRva2VuaXplZCwgb3JkZXJlZCBjb2RlIHNlY3Rpb25zIHRoYXQgbWFrZSB1cCB0aGUgYmFkIHRleHRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aGluIHRoZSBqYXZhc2NyaXB0IGNvZGUgKG5vdCB1c2VkIGZvciBjaGVja2luZyBjb21tZW50cykuIElmIHRoZXJlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzIG9ubHkgb25lIGNvZGVUb2tlbiwgdGhlbiBpdCB3aWxsIGFsc28gYmUgY2hlY2tlZCBhcyBhIHN1YnN0cmluZyBvZiBlYWNoXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgdG9rZW5zLiBSZXF1aXJlZCB1bmxlc3Mgc3BlY2lmeWluZyBcImdsb2JhbFwiLiBJZiB0aGlzIGlzIHByb3ZpZGVkLFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIHRoZSBiYWQgdGV4dCB3aWxsIG9ubHkgYmUgY2hlY2tlZCBpbiBjb2RlLCBhbmQgbm90IHZpYSBlYWNoIGxpbmUuXG4gICAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBbcmVnZXhdIC0gaWYgcHJvdmlkZWQsIGluc3RlYWQgb2YgY2hlY2tpbmcgdGhlIGlkIGFzIGEgc3RyaW5nLCB0ZXN0IGVhY2ggbGluZSB3aXRoIHRoaXMgcmVnZXguXG4gICAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IFtwcmVkaWNhdGVdIC0gaWYgcHJvdmlkZWQsIGluc3RlYWQgb2YgY2hlY2tpbmcgdGhlIGlkIGFzIGEgc3RyaW5nLCB0ZXN0IGVhY2ggbGluZSB3aXRoIHRoaXMgZnVuY3Rpb25cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFtsaW5lTnVtYmVyRGVsdGFdIC0gaWYgcHJvdmlkZWQsIGluc3RlYWQgcmVwb3J0IHRoZSBlcnJvciBvbiBhIGRpZmZlcmVudCBsaW5lLCB0byBhdm9pZCBsaW5lc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0IGhhdmUgZXNsaW50LWRpc2FibGUgZGlyZWN0aXZlc1xuICAgKi9cbn07XG5cbi8qKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb2RlVG9rZW5zIC0gZnJvbSBzb3VyY2VDb2RlIG9iamVjdFxuICogQHBhcmFtIHtGb3JiaWRkZW5UZXh0T2JqZWN0fSBmb3JiaWRkZW5UZXh0T2JqZWN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBmYWxzZSBpZiBubyBlcnJvcnMgZm91bmQgdmlhIGNvZGUgdG9rZW5zXG4gKi9cbmNvbnN0IHRlc3RDb2RlVG9rZW5zID0gKCBjb250ZXh0LCBjb2RlVG9rZW5zLCBmb3JiaWRkZW5UZXh0T2JqZWN0ICkgPT4ge1xuICBjb25zdCBjb2RlVG9rZW5zQXJyYXkgPSBmb3JiaWRkZW5UZXh0T2JqZWN0LmNvZGVUb2tlbnM7XG5cbiAgbGV0IGZvdW5kRmFpbHVyZSA9IGZhbHNlO1xuXG4gIC8vIGl0ZXJhdGUgdGhyb3VnaCBlYWNoIGNvZGUgdG9rZW4gaW4gdGhlIG5vZGVcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgY29kZVRva2Vucy5sZW5ndGg7IGkrKyApIHtcbiAgICBjb25zdCB0b2tlbiA9IGNvZGVUb2tlbnNbIGkgXTsgLy8ge1Rva2VufVxuICAgIGNvbnN0IGZhaWx1cmVzID0gW107IC8vIGEgbGlzdCBvZiB0aGUgdG9rZW5zIHRoYXQgbWF0Y2ggdGhlIGZvcmJpZGRlbiBjb2RlIHRva2VucyxcblxuICAgIC8vIGxvb3AgdGhyb3VnaCwgbG9va2luZyBhaGVhZCBhdCBlYWNoIHN1YnNlcXVlbnQgY29kZSB0b2tlbiwgYnJlYWtpbmcgaWYgdGhleSBkb24ndCBtYXRjaCB0aGUgIGZvcmJpZGRlbiB0b2tlbnNcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBjb2RlVG9rZW5zQXJyYXkubGVuZ3RoOyBqKysgKSB7XG4gICAgICBjb25zdCBmb3JiaWRkZW5Db2RlUGFydCA9IGNvZGVUb2tlbnNBcnJheVsgaiBdO1xuICAgICAgY29uc3QgY29tYmluZWRJbmRleCA9IGkgKyBqO1xuXG4gICAgICBjb25zdCB0b2tlblZhbHVlID0gY29kZVRva2Vuc1sgY29tYmluZWRJbmRleCBdLnZhbHVlO1xuXG4gICAgICAvLyBtdWx0aXBsZSBjb2RlIHRva2VucyBtdXN0IG1hdGNoIHBlcmZlY3RseSB0byBjb25nbG9tZXJhdGVcbiAgICAgIGlmICggKCBjb21iaW5lZEluZGV4IDwgY29kZVRva2Vucy5sZW5ndGggJiYgdG9rZW5WYWx1ZSA9PT0gZm9yYmlkZGVuQ29kZVBhcnQgKSB8fFxuXG4gICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIGNoZWNrIGFzIGEgc3Vic3RyaW5nIHRvb1xuICAgICAgICAgICAoIGNvZGVUb2tlbnNBcnJheS5sZW5ndGggPT09IDEgJiYgdG9rZW5WYWx1ZS5pbmRleE9mKCBmb3JiaWRkZW5Db2RlUGFydCApID49IDAgKSApIHtcblxuICAgICAgICAvLyBpZiBhdCB0aGUgZW5kIG9mIHRoZSBzZXF1ZW5jZSwgdGhlbiB3ZSBoYXZlIHN1Y2Nlc3NmdWxseSBmb3VuZCBiYWQgY29kZSB0ZXh0LCBhZGQgaXQgdG8gYSBsaXN0IG9mIGZhaWx1cmVzLlxuICAgICAgICBpZiAoIGogPT09IGNvZGVUb2tlbnNBcnJheS5sZW5ndGggLSAxICkge1xuICAgICAgICAgIGZhaWx1cmVzLnB1c2goIGZvcmJpZGRlblRleHRPYmplY3QgKTtcbiAgICAgICAgICBmb3VuZEZhaWx1cmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYnJlYWs7IC8vIHF1aXQgZWFybHkgYmVjYXVzZSBpdCB3YXMgYSBub24tbWF0Y2hcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmYWlsdXJlcy5mb3JFYWNoKCBmYWlsZWRUZXh0T2JqZWN0ID0+IHtcbiAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgIGxvYzogdG9rZW4ubG9jLFxuICAgICAgICBtZXNzYWdlOiBgYmFkIGNvZGUgdGV4dDogXCIke2ZhaWxlZFRleHRPYmplY3QuaWR9XCJgXG4gICAgICB9ICk7XG4gICAgfSApO1xuICB9XG4gIHJldHVybiBmb3VuZEZhaWx1cmU7XG59OyJdLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsImFzc2VydCIsIm1vZHVsZSIsImV4cG9ydHMiLCJydWxlTmFtZSIsImJhZFRleHRzIiwiY29udGV4dCIsIm5vZGUiLCJzb3VyY2VDb2RlIiwiZ2V0U291cmNlQ29kZSIsImNvZGVUb2tlbnMiLCJnZXRUb2tlbnMiLCJjb2RlTGluZXMiLCJsaW5lcyIsInRleHQiLCJyZXBvcnRCYWRUZXh0IiwibGluZU51bWJlciIsImNvbHVtbkluZGV4IiwibGluZUxlbmd0aCIsIm1lc3NhZ2UiLCJsb2MiLCJzdGFydCIsImxpbmUiLCJjb2x1bW4iLCJlbmQiLCJyZXBvcnQiLCJ0ZXN0QmFkVGV4dCIsImZvcmJpZGRlblRleHQiLCJpbmRleE9mIiwiaWQiLCJwcmVkaWNhdGUiLCJyZWdleCIsInRlc3RDb2RlVG9rZW5zIiwiaSIsImxlbmd0aCIsImxpbmVTdHJpbmciLCJiYWRMaW5lTnVtYmVyIiwibGluZU51bWJlckRlbHRhIiwibWF0Y2giLCJpbmRleCIsIm9rIiwiZm9yRWFjaCIsImJhZFRleHQiLCJSZWdFeHAiLCJBcnJheSIsImlzQXJyYXkiLCJldmVyeSIsInRva2VuIiwiZm9yYmlkZGVuVGV4dE9iamVjdCIsImNvZGVUb2tlbnNBcnJheSIsImZvdW5kRmFpbHVyZSIsImZhaWx1cmVzIiwiaiIsImZvcmJpZGRlbkNvZGVQYXJ0IiwiY29tYmluZWRJbmRleCIsInRva2VuVmFsdWUiLCJ2YWx1ZSIsInB1c2giLCJmYWlsZWRUZXh0T2JqZWN0Il0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Ozs7Q0FPQyxHQUdELE1BQU1BLElBQUlDLFFBQVM7QUFDbkIsTUFBTUMsU0FBU0QsUUFBUztBQUV4Qjs7Ozs7Q0FLQyxHQUNERSxPQUFPQyxPQUFPLEdBQUcsQ0FBRUMsVUFBVUMsVUFBVUM7SUFFckMsT0FBT0MsQ0FBQUE7UUFDTCxNQUFNQyxhQUFhRixRQUFRRyxhQUFhO1FBQ3hDLE1BQU1DLGFBQWFGLFdBQVdHLFNBQVMsQ0FBRUo7UUFDekMsTUFBTUssWUFBWUosV0FBV0ssS0FBSztRQUNsQyxNQUFNQyxPQUFPTixXQUFXTSxJQUFJO1FBRTVCOzs7OztLQUtDLEdBQ0QsTUFBTUMsZ0JBQWdCLENBQUVDLFlBQVlDLGFBQWFDLFlBQVlDO1lBRTNELCtGQUErRjtZQUMvRixNQUFNQyxNQUFNO2dCQUNWQyxPQUFPO29CQUFFQyxNQUFNTjtvQkFBWU8sUUFBUU47Z0JBQVk7Z0JBQy9DTyxLQUFLO29CQUFFRixNQUFNTjtvQkFBWU8sUUFBUUw7Z0JBQVc7WUFDOUM7WUFFQVosUUFBUW1CLE1BQU0sQ0FBRTtnQkFDZGxCLE1BQU1BO2dCQUNOYSxLQUFLQTtnQkFDTEQsU0FBUyxDQUFDLHlCQUF5QixFQUFFQSxRQUFRLENBQUMsQ0FBQztZQUNqRDtRQUNGO1FBRUE7OztLQUdDLEdBQ0QsTUFBTU8sY0FBY0MsQ0FBQUE7WUFFbEIsMEhBQTBIO1lBQzFILElBQUtiLEtBQUtjLE9BQU8sQ0FBRUQsY0FBY0UsRUFBRSxLQUFNLEtBQUtGLGNBQWNHLFNBQVMsSUFBSUgsY0FBY0ksS0FBSyxFQUFHO2dCQUU3RixzRkFBc0Y7Z0JBQ3RGLElBQUtKLGNBQWNqQixVQUFVLEVBQUc7b0JBQzlCc0IsZUFBZ0IxQixTQUFTSSxZQUFZaUI7Z0JBQ3ZDLE9BQ0s7b0JBRUgsa0RBQWtEO29CQUNsRCxJQUFNLElBQUlNLElBQUksR0FBR0EsSUFBSXJCLFVBQVVzQixNQUFNLEVBQUVELElBQU07d0JBQzNDLE1BQU1FLGFBQWF2QixTQUFTLENBQUVxQixFQUFHO3dCQUVqQywwRkFBMEY7d0JBQzFGLDhGQUE4Rjt3QkFDOUYsTUFBTUcsZ0JBQWdCSCxJQUFJLElBQU1OLENBQUFBLGNBQWNVLGVBQWUsSUFBSSxDQUFBO3dCQUVqRSw4QkFBOEI7d0JBQzlCLElBQUtWLGNBQWNJLEtBQUssRUFBRzs0QkFDekIsTUFBTU8sUUFBUUgsV0FBV0csS0FBSyxDQUFFWCxjQUFjSSxLQUFLOzRCQUVuRCxJQUFLTyxPQUFRO2dDQUNYdkIsY0FBZXFCLGVBQWVFLE1BQU1DLEtBQUssRUFBRUosV0FBV0QsTUFBTSxFQUFFUCxjQUFjRSxFQUFFOzRCQUNoRjt3QkFDRixPQUNLLElBQUtGLGNBQWNHLFNBQVMsRUFBRzs0QkFDbEMsTUFBTVUsS0FBS2IsY0FBY0csU0FBUyxDQUFFSzs0QkFDcEMsSUFBSyxDQUFDSyxJQUFLO2dDQUNUekIsY0FBZXFCLGVBQWUsR0FBR0QsV0FBV0QsTUFBTSxFQUFFUCxjQUFjRSxFQUFFOzRCQUN0RTt3QkFDRixPQUNLOzRCQUNILE1BQU1aLGNBQWNrQixXQUFXUCxPQUFPLENBQUVELGNBQWNFLEVBQUU7NEJBQ3hELElBQUtaLGVBQWUsR0FBSTtnQ0FDdEJGLGNBQWVxQixlQUFlbkIsYUFBYUEsY0FBY1UsY0FBY0UsRUFBRSxDQUFDSyxNQUFNLEVBQUVQLGNBQWNFLEVBQUU7NEJBQ3BHO3dCQUNGO29CQUNGO2dCQUNGO1lBQ0Y7UUFDRjtRQUVBeEIsU0FBU29DLE9BQU8sQ0FBRUMsQ0FBQUE7WUFFaEIsSUFBSyxPQUFPQSxZQUFZLFVBQVc7Z0JBQ2pDQSxVQUFVO29CQUFFYixJQUFJYTtnQkFBUTtZQUMxQjtZQUNBQSxRQUFRWCxLQUFLLElBQUk5QixPQUFReUMsUUFBUVgsS0FBSyxZQUFZWSxRQUFRO1lBQzFERCxRQUFRWixTQUFTLElBQUk3QixPQUFRLE9BQU95QyxRQUFRWixTQUFTLEtBQUssWUFBWTtZQUN0RSxJQUFLWSxRQUFRWixTQUFTLEVBQUc7Z0JBQ3ZCN0IsT0FBUSxDQUFDeUMsUUFBUVgsS0FBSyxFQUFFO1lBQzFCO1lBQ0FXLFFBQVFoQyxVQUFVLElBQUlULE9BQVEyQyxNQUFNQyxPQUFPLENBQUVILFFBQVFoQyxVQUFVLEtBQy9EWCxFQUFFK0MsS0FBSyxDQUFFSixRQUFRaEMsVUFBVSxFQUFFcUMsQ0FBQUEsUUFBUyxPQUFPQSxVQUFVLFdBQ3JEO1lBQ0EsQ0FBQSxDQUFDLENBQUNMLFFBQVFYLEtBQUssSUFBSSxDQUFDLENBQUNXLFFBQVFoQyxVQUFVLEFBQUQsS0FBT1QsT0FBUXlDLFFBQVFYLEtBQUssS0FBS1csUUFBUWhDLFVBQVUsRUFDekY7WUFDRlQsT0FBUSxPQUFPeUMsUUFBUWIsRUFBRSxLQUFLLFVBQVU7WUFDeENILFlBQWFnQjtRQUNmO0lBQ0Y7QUFFQTs7Ozs7Ozs7Ozs7OztHQWFDLEdBQ0g7QUFFQTs7Ozs7Q0FLQyxHQUNELE1BQU1WLGlCQUFpQixDQUFFMUIsU0FBU0ksWUFBWXNDO0lBQzVDLE1BQU1DLGtCQUFrQkQsb0JBQW9CdEMsVUFBVTtJQUV0RCxJQUFJd0MsZUFBZTtJQUVuQiw4Q0FBOEM7SUFDOUMsSUFBTSxJQUFJakIsSUFBSSxHQUFHQSxJQUFJdkIsV0FBV3dCLE1BQU0sRUFBRUQsSUFBTTtRQUM1QyxNQUFNYyxRQUFRckMsVUFBVSxDQUFFdUIsRUFBRyxFQUFFLFVBQVU7UUFDekMsTUFBTWtCLFdBQVcsRUFBRSxFQUFFLDZEQUE2RDtRQUVsRixnSEFBZ0g7UUFDaEgsSUFBTSxJQUFJQyxJQUFJLEdBQUdBLElBQUlILGdCQUFnQmYsTUFBTSxFQUFFa0IsSUFBTTtZQUNqRCxNQUFNQyxvQkFBb0JKLGVBQWUsQ0FBRUcsRUFBRztZQUM5QyxNQUFNRSxnQkFBZ0JyQixJQUFJbUI7WUFFMUIsTUFBTUcsYUFBYTdDLFVBQVUsQ0FBRTRDLGNBQWUsQ0FBQ0UsS0FBSztZQUVwRCw0REFBNEQ7WUFDNUQsSUFBSyxBQUFFRixnQkFBZ0I1QyxXQUFXd0IsTUFBTSxJQUFJcUIsZUFBZUYscUJBRXRELHNEQUFzRDtZQUNwREosZ0JBQWdCZixNQUFNLEtBQUssS0FBS3FCLFdBQVczQixPQUFPLENBQUV5QixzQkFBdUIsR0FBTTtnQkFFdEYsOEdBQThHO2dCQUM5RyxJQUFLRCxNQUFNSCxnQkFBZ0JmLE1BQU0sR0FBRyxHQUFJO29CQUN0Q2lCLFNBQVNNLElBQUksQ0FBRVQ7b0JBQ2ZFLGVBQWU7Z0JBQ2pCO1lBQ0YsT0FDSztnQkFDSCxPQUFPLHdDQUF3QztZQUNqRDtRQUNGO1FBRUFDLFNBQVNWLE9BQU8sQ0FBRWlCLENBQUFBO1lBQ2hCcEQsUUFBUW1CLE1BQU0sQ0FBRTtnQkFDZEwsS0FBSzJCLE1BQU0zQixHQUFHO2dCQUNkRCxTQUFTLENBQUMsZ0JBQWdCLEVBQUV1QyxpQkFBaUI3QixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BEO1FBQ0Y7SUFDRjtJQUNBLE9BQU9xQjtBQUNUIn0=