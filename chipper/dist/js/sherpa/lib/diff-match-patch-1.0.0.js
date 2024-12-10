/**
 * Diff Match and Patch
 * Copyright 2018 The diff-match-patch Authors.
 * https://github.com/google/diff-match-patch
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * @fileoverview Computes the difference between two texts to create a patch.
 * Applies the patch onto another text, allowing for errors.
 * @author fraser@google.com (Neil Fraser)
 */ /**
 * Class containing the diff, match and patch methods.
 * @constructor
 */ function diff_match_patch() {
    // Defaults.
    // Redefine these in your program to override the defaults.
    // Number of seconds to map a diff before giving up (0 for infinity).
    this.Diff_Timeout = 1.0;
    // Cost of an empty edit operation in terms of edit characters.
    this.Diff_EditCost = 4;
    // At what point is no match declared (0.0 = perfection, 1.0 = very loose).
    this.Match_Threshold = 0.5;
    // How far to search for a match (0 = exact location, 1000+ = broad match).
    // A match this many characters away from the expected location will add
    // 1.0 to the score (0.0 is a perfect match).
    this.Match_Distance = 1000;
    // When deleting a large block of text (over ~64 characters), how close do
    // the contents have to be to match the expected contents. (0.0 = perfection,
    // 1.0 = very loose).  Note that Match_Threshold controls how closely the
    // end points of a delete need to match.
    this.Patch_DeleteThreshold = 0.5;
    // Chunk size for context length.
    this.Patch_Margin = 4;
    // The number of bits in an int.
    this.Match_MaxBits = 32;
}
//  DIFF FUNCTIONS
/**
 * The data structure representing a diff is an array of tuples:
 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
 */ var DIFF_DELETE = -1;
var DIFF_INSERT = 1;
var DIFF_EQUAL = 0;
/** @typedef {{0: number, 1: string}} */ diff_match_patch.Diff;
/**
 * Find the differences between two texts.  Simplifies the problem by stripping
 * any common prefix or suffix off the texts before diffing.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {boolean=} opt_checklines Optional speedup flag. If present and false,
 *     then don't run a line-level diff first to identify the changed areas.
 *     Defaults to true, which does a faster, slightly less optimal diff.
 * @param {number} opt_deadline Optional time when the diff should be complete
 *     by.  Used internally for recursive calls.  Users should set DiffTimeout
 *     instead.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 */ diff_match_patch.prototype.diff_main = function(text1, text2, opt_checklines, opt_deadline) {
    // Set a deadline by which time the diff must be complete.
    if (typeof opt_deadline == 'undefined') {
        if (this.Diff_Timeout <= 0) {
            opt_deadline = Number.MAX_VALUE;
        } else {
            opt_deadline = (new Date).getTime() + this.Diff_Timeout * 1000;
        }
    }
    var deadline = opt_deadline;
    // Check for null inputs.
    if (text1 == null || text2 == null) {
        throw new Error('Null input. (diff_main)');
    }
    // Check for equality (speedup).
    if (text1 == text2) {
        if (text1) {
            return [
                [
                    DIFF_EQUAL,
                    text1
                ]
            ];
        }
        return [];
    }
    if (typeof opt_checklines == 'undefined') {
        opt_checklines = true;
    }
    var checklines = opt_checklines;
    // Trim off common prefix (speedup).
    var commonlength = this.diff_commonPrefix(text1, text2);
    var commonprefix = text1.substring(0, commonlength);
    text1 = text1.substring(commonlength);
    text2 = text2.substring(commonlength);
    // Trim off common suffix (speedup).
    commonlength = this.diff_commonSuffix(text1, text2);
    var commonsuffix = text1.substring(text1.length - commonlength);
    text1 = text1.substring(0, text1.length - commonlength);
    text2 = text2.substring(0, text2.length - commonlength);
    // Compute the diff on the middle block.
    var diffs = this.diff_compute_(text1, text2, checklines, deadline);
    // Restore the prefix and suffix.
    if (commonprefix) {
        diffs.unshift([
            DIFF_EQUAL,
            commonprefix
        ]);
    }
    if (commonsuffix) {
        diffs.push([
            DIFF_EQUAL,
            commonsuffix
        ]);
    }
    this.diff_cleanupMerge(diffs);
    return diffs;
};
/**
 * Find the differences between two texts.  Assumes that the texts do not
 * have any common prefix or suffix.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {boolean} checklines Speedup flag.  If false, then don't run a
 *     line-level diff first to identify the changed areas.
 *     If true, then run a faster, slightly less optimal diff.
 * @param {number} deadline Time when the diff should be complete by.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */ diff_match_patch.prototype.diff_compute_ = function(text1, text2, checklines, deadline) {
    var diffs;
    if (!text1) {
        // Just add some text (speedup).
        return [
            [
                DIFF_INSERT,
                text2
            ]
        ];
    }
    if (!text2) {
        // Just delete some text (speedup).
        return [
            [
                DIFF_DELETE,
                text1
            ]
        ];
    }
    var longtext = text1.length > text2.length ? text1 : text2;
    var shorttext = text1.length > text2.length ? text2 : text1;
    var i = longtext.indexOf(shorttext);
    if (i != -1) {
        // Shorter text is inside the longer text (speedup).
        diffs = [
            [
                DIFF_INSERT,
                longtext.substring(0, i)
            ],
            [
                DIFF_EQUAL,
                shorttext
            ],
            [
                DIFF_INSERT,
                longtext.substring(i + shorttext.length)
            ]
        ];
        // Swap insertions for deletions if diff is reversed.
        if (text1.length > text2.length) {
            diffs[0][0] = diffs[2][0] = DIFF_DELETE;
        }
        return diffs;
    }
    if (shorttext.length == 1) {
        // Single character string.
        // After the previous speedup, the character can't be an equality.
        return [
            [
                DIFF_DELETE,
                text1
            ],
            [
                DIFF_INSERT,
                text2
            ]
        ];
    }
    // Check to see if the problem can be split in two.
    var hm = this.diff_halfMatch_(text1, text2);
    if (hm) {
        // A half-match was found, sort out the return data.
        var text1_a = hm[0];
        var text1_b = hm[1];
        var text2_a = hm[2];
        var text2_b = hm[3];
        var mid_common = hm[4];
        // Send both pairs off for separate processing.
        var diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline);
        var diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
        // Merge the results.
        return diffs_a.concat([
            [
                DIFF_EQUAL,
                mid_common
            ]
        ], diffs_b);
    }
    if (checklines && text1.length > 100 && text2.length > 100) {
        return this.diff_lineMode_(text1, text2, deadline);
    }
    return this.diff_bisect_(text1, text2, deadline);
};
/**
 * Do a quick line-level diff on both strings, then rediff the parts for
 * greater accuracy.
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} deadline Time when the diff should be complete by.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */ diff_match_patch.prototype.diff_lineMode_ = function(text1, text2, deadline) {
    // Scan the text on a line-by-line basis first.
    var a = this.diff_linesToChars_(text1, text2);
    text1 = a.chars1;
    text2 = a.chars2;
    var linearray = a.lineArray;
    var diffs = this.diff_main(text1, text2, false, deadline);
    // Convert the diff back to original text.
    this.diff_charsToLines_(diffs, linearray);
    // Eliminate freak matches (e.g. blank lines)
    this.diff_cleanupSemantic(diffs);
    // Rediff any replacement blocks, this time character-by-character.
    // Add a dummy entry at the end.
    diffs.push([
        DIFF_EQUAL,
        ''
    ]);
    var pointer = 0;
    var count_delete = 0;
    var count_insert = 0;
    var text_delete = '';
    var text_insert = '';
    while(pointer < diffs.length){
        switch(diffs[pointer][0]){
            case DIFF_INSERT:
                count_insert++;
                text_insert += diffs[pointer][1];
                break;
            case DIFF_DELETE:
                count_delete++;
                text_delete += diffs[pointer][1];
                break;
            case DIFF_EQUAL:
                // Upon reaching an equality, check for prior redundancies.
                if (count_delete >= 1 && count_insert >= 1) {
                    // Delete the offending records and add the merged ones.
                    diffs.splice(pointer - count_delete - count_insert, count_delete + count_insert);
                    pointer = pointer - count_delete - count_insert;
                    var a = this.diff_main(text_delete, text_insert, false, deadline);
                    for(var j = a.length - 1; j >= 0; j--){
                        diffs.splice(pointer, 0, a[j]);
                    }
                    pointer = pointer + a.length;
                }
                count_insert = 0;
                count_delete = 0;
                text_delete = '';
                text_insert = '';
                break;
        }
        pointer++;
    }
    diffs.pop(); // Remove the dummy entry at the end.
    return diffs;
};
/**
 * Find the 'middle snake' of a diff, split the problem in two
 * and return the recursively constructed diff.
 * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} deadline Time at which to bail if not yet complete.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */ diff_match_patch.prototype.diff_bisect_ = function(text1, text2, deadline) {
    // Cache the text lengths to prevent multiple calls.
    var text1_length = text1.length;
    var text2_length = text2.length;
    var max_d = Math.ceil((text1_length + text2_length) / 2);
    var v_offset = max_d;
    var v_length = 2 * max_d;
    var v1 = new Array(v_length);
    var v2 = new Array(v_length);
    // Setting all elements to -1 is faster in Chrome & Firefox than mixing
    // integers and undefined.
    for(var x = 0; x < v_length; x++){
        v1[x] = -1;
        v2[x] = -1;
    }
    v1[v_offset + 1] = 0;
    v2[v_offset + 1] = 0;
    var delta = text1_length - text2_length;
    // If the total number of characters is odd, then the front path will collide
    // with the reverse path.
    var front = delta % 2 != 0;
    // Offsets for start and end of k loop.
    // Prevents mapping of space beyond the grid.
    var k1start = 0;
    var k1end = 0;
    var k2start = 0;
    var k2end = 0;
    for(var d = 0; d < max_d; d++){
        // Bail out if deadline is reached.
        if (new Date().getTime() > deadline) {
            break;
        }
        // Walk the front path one step.
        for(var k1 = -d + k1start; k1 <= d - k1end; k1 += 2){
            var k1_offset = v_offset + k1;
            var x1;
            if (k1 == -d || k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1]) {
                x1 = v1[k1_offset + 1];
            } else {
                x1 = v1[k1_offset - 1] + 1;
            }
            var y1 = x1 - k1;
            while(x1 < text1_length && y1 < text2_length && text1.charAt(x1) == text2.charAt(y1)){
                x1++;
                y1++;
            }
            v1[k1_offset] = x1;
            if (x1 > text1_length) {
                // Ran off the right of the graph.
                k1end += 2;
            } else if (y1 > text2_length) {
                // Ran off the bottom of the graph.
                k1start += 2;
            } else if (front) {
                var k2_offset = v_offset + delta - k1;
                if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
                    // Mirror x2 onto top-left coordinate system.
                    var x2 = text1_length - v2[k2_offset];
                    if (x1 >= x2) {
                        // Overlap detected.
                        return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                    }
                }
            }
        }
        // Walk the reverse path one step.
        for(var k2 = -d + k2start; k2 <= d - k2end; k2 += 2){
            var k2_offset = v_offset + k2;
            var x2;
            if (k2 == -d || k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1]) {
                x2 = v2[k2_offset + 1];
            } else {
                x2 = v2[k2_offset - 1] + 1;
            }
            var y2 = x2 - k2;
            while(x2 < text1_length && y2 < text2_length && text1.charAt(text1_length - x2 - 1) == text2.charAt(text2_length - y2 - 1)){
                x2++;
                y2++;
            }
            v2[k2_offset] = x2;
            if (x2 > text1_length) {
                // Ran off the left of the graph.
                k2end += 2;
            } else if (y2 > text2_length) {
                // Ran off the top of the graph.
                k2start += 2;
            } else if (!front) {
                var k1_offset = v_offset + delta - k2;
                if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
                    var x1 = v1[k1_offset];
                    var y1 = v_offset + x1 - k1_offset;
                    // Mirror x2 onto top-left coordinate system.
                    x2 = text1_length - x2;
                    if (x1 >= x2) {
                        // Overlap detected.
                        return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                    }
                }
            }
        }
    }
    // Diff took too long and hit the deadline or
    // number of diffs equals number of characters, no commonality at all.
    return [
        [
            DIFF_DELETE,
            text1
        ],
        [
            DIFF_INSERT,
            text2
        ]
    ];
};
/**
 * Given the location of the 'middle snake', split the diff in two parts
 * and recurse.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} x Index of split point in text1.
 * @param {number} y Index of split point in text2.
 * @param {number} deadline Time at which to bail if not yet complete.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @private
 */ diff_match_patch.prototype.diff_bisectSplit_ = function(text1, text2, x, y, deadline) {
    var text1a = text1.substring(0, x);
    var text2a = text2.substring(0, y);
    var text1b = text1.substring(x);
    var text2b = text2.substring(y);
    // Compute both diffs serially.
    var diffs = this.diff_main(text1a, text2a, false, deadline);
    var diffsb = this.diff_main(text1b, text2b, false, deadline);
    return diffs.concat(diffsb);
};
/**
 * Split two texts into an array of strings.  Reduce the texts to a string of
 * hashes where each Unicode character represents one line.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {{chars1: string, chars2: string, lineArray: !Array.<string>}}
 *     An object containing the encoded text1, the encoded text2 and
 *     the array of unique strings.
 *     The zeroth element of the array of unique strings is intentionally blank.
 * @private
 */ diff_match_patch.prototype.diff_linesToChars_ = function(text1, text2) {
    var lineArray = []; // e.g. lineArray[4] == 'Hello\n'
    var lineHash = {}; // e.g. lineHash['Hello\n'] == 4
    // '\x00' is a valid character, but various debuggers don't like it.
    // So we'll insert a junk entry to avoid generating a null character.
    lineArray[0] = '';
    /**
   * Split a text into an array of strings.  Reduce the texts to a string of
   * hashes where each Unicode character represents one line.
   * Modifies linearray and linehash through being a closure.
   * @param {string} text String to encode.
   * @return {string} Encoded string.
   * @private
   */ function diff_linesToCharsMunge_(text) {
        var chars = '';
        // Walk the text, pulling out a substring for each line.
        // text.split('\n') would would temporarily double our memory footprint.
        // Modifying text would create many large strings to garbage collect.
        var lineStart = 0;
        var lineEnd = -1;
        // Keeping our own length variable is faster than looking it up.
        var lineArrayLength = lineArray.length;
        while(lineEnd < text.length - 1){
            lineEnd = text.indexOf('\n', lineStart);
            if (lineEnd == -1) {
                lineEnd = text.length - 1;
            }
            var line = text.substring(lineStart, lineEnd + 1);
            lineStart = lineEnd + 1;
            if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) : lineHash[line] !== undefined) {
                chars += String.fromCharCode(lineHash[line]);
            } else {
                chars += String.fromCharCode(lineArrayLength);
                lineHash[line] = lineArrayLength;
                lineArray[lineArrayLength++] = line;
            }
        }
        return chars;
    }
    var chars1 = diff_linesToCharsMunge_(text1);
    var chars2 = diff_linesToCharsMunge_(text2);
    return {
        chars1: chars1,
        chars2: chars2,
        lineArray: lineArray
    };
};
/**
 * Rehydrate the text in a diff from a string of line hashes to real lines of
 * text.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @param {!Array.<string>} lineArray Array of unique strings.
 * @private
 */ diff_match_patch.prototype.diff_charsToLines_ = function(diffs, lineArray) {
    for(var x = 0; x < diffs.length; x++){
        var chars = diffs[x][1];
        var text = [];
        for(var y = 0; y < chars.length; y++){
            text[y] = lineArray[chars.charCodeAt(y)];
        }
        diffs[x][1] = text.join('');
    }
};
/**
 * Determine the common prefix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the start of each
 *     string.
 */ diff_match_patch.prototype.diff_commonPrefix = function(text1, text2) {
    // Quick check for common null cases.
    if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
        return 0;
    }
    // Binary search.
    // Performance analysis: http://neil.fraser.name/news/2007/10/09/
    var pointermin = 0;
    var pointermax = Math.min(text1.length, text2.length);
    var pointermid = pointermax;
    var pointerstart = 0;
    while(pointermin < pointermid){
        if (text1.substring(pointerstart, pointermid) == text2.substring(pointerstart, pointermid)) {
            pointermin = pointermid;
            pointerstart = pointermin;
        } else {
            pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    return pointermid;
};
/**
 * Determine the common suffix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of each string.
 */ diff_match_patch.prototype.diff_commonSuffix = function(text1, text2) {
    // Quick check for common null cases.
    if (!text1 || !text2 || text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
        return 0;
    }
    // Binary search.
    // Performance analysis: http://neil.fraser.name/news/2007/10/09/
    var pointermin = 0;
    var pointermax = Math.min(text1.length, text2.length);
    var pointermid = pointermax;
    var pointerend = 0;
    while(pointermin < pointermid){
        if (text1.substring(text1.length - pointermid, text1.length - pointerend) == text2.substring(text2.length - pointermid, text2.length - pointerend)) {
            pointermin = pointermid;
            pointerend = pointermin;
        } else {
            pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    return pointermid;
};
/**
 * Determine if the suffix of one string is the prefix of another.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of the first
 *     string and the start of the second string.
 * @private
 */ diff_match_patch.prototype.diff_commonOverlap_ = function(text1, text2) {
    // Cache the text lengths to prevent multiple calls.
    var text1_length = text1.length;
    var text2_length = text2.length;
    // Eliminate the null case.
    if (text1_length == 0 || text2_length == 0) {
        return 0;
    }
    // Truncate the longer string.
    if (text1_length > text2_length) {
        text1 = text1.substring(text1_length - text2_length);
    } else if (text1_length < text2_length) {
        text2 = text2.substring(0, text1_length);
    }
    var text_length = Math.min(text1_length, text2_length);
    // Quick check for the worst case.
    if (text1 == text2) {
        return text_length;
    }
    // Start by looking for a single character match
    // and increase length until no match is found.
    // Performance analysis: http://neil.fraser.name/news/2010/11/04/
    var best = 0;
    var length = 1;
    while(true){
        var pattern = text1.substring(text_length - length);
        var found = text2.indexOf(pattern);
        if (found == -1) {
            return best;
        }
        length += found;
        if (found == 0 || text1.substring(text_length - length) == text2.substring(0, length)) {
            best = length;
            length++;
        }
    }
};
/**
 * Do the two texts share a substring which is at least half the length of the
 * longer text?
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {Array.<string>} Five element Array, containing the prefix of
 *     text1, the suffix of text1, the prefix of text2, the suffix of
 *     text2 and the common middle.  Or null if there was no match.
 * @private
 */ diff_match_patch.prototype.diff_halfMatch_ = function(text1, text2) {
    if (this.Diff_Timeout <= 0) {
        // Don't risk returning a non-optimal diff if we have unlimited time.
        return null;
    }
    var longtext = text1.length > text2.length ? text1 : text2;
    var shorttext = text1.length > text2.length ? text2 : text1;
    if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
        return null; // Pointless.
    }
    var dmp = this; // 'this' becomes 'window' in a closure.
    /**
   * Does a substring of shorttext exist within longtext such that the substring
   * is at least half the length of longtext?
   * Closure, but does not reference any external variables.
   * @param {string} longtext Longer string.
   * @param {string} shorttext Shorter string.
   * @param {number} i Start index of quarter length substring within longtext.
   * @return {Array.<string>} Five element Array, containing the prefix of
   *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
   *     of shorttext and the common middle.  Or null if there was no match.
   * @private
   */ function diff_halfMatchI_(longtext, shorttext, i) {
        // Start with a 1/4 length substring at position i as a seed.
        var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
        var j = -1;
        var best_common = '';
        var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
        while((j = shorttext.indexOf(seed, j + 1)) != -1){
            var prefixLength = dmp.diff_commonPrefix(longtext.substring(i), shorttext.substring(j));
            var suffixLength = dmp.diff_commonSuffix(longtext.substring(0, i), shorttext.substring(0, j));
            if (best_common.length < suffixLength + prefixLength) {
                best_common = shorttext.substring(j - suffixLength, j) + shorttext.substring(j, j + prefixLength);
                best_longtext_a = longtext.substring(0, i - suffixLength);
                best_longtext_b = longtext.substring(i + prefixLength);
                best_shorttext_a = shorttext.substring(0, j - suffixLength);
                best_shorttext_b = shorttext.substring(j + prefixLength);
            }
        }
        if (best_common.length * 2 >= longtext.length) {
            return [
                best_longtext_a,
                best_longtext_b,
                best_shorttext_a,
                best_shorttext_b,
                best_common
            ];
        } else {
            return null;
        }
    }
    // First check if the second quarter is the seed for a half-match.
    var hm1 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 4));
    // Check again based on the third quarter.
    var hm2 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 2));
    var hm;
    if (!hm1 && !hm2) {
        return null;
    } else if (!hm2) {
        hm = hm1;
    } else if (!hm1) {
        hm = hm2;
    } else {
        // Both matched.  Select the longest.
        hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
    }
    // A half-match was found, sort out the return data.
    var text1_a, text1_b, text2_a, text2_b;
    if (text1.length > text2.length) {
        text1_a = hm[0];
        text1_b = hm[1];
        text2_a = hm[2];
        text2_b = hm[3];
    } else {
        text2_a = hm[0];
        text2_b = hm[1];
        text1_a = hm[2];
        text1_b = hm[3];
    }
    var mid_common = hm[4];
    return [
        text1_a,
        text1_b,
        text2_a,
        text2_b,
        mid_common
    ];
};
/**
 * Reduce the number of edits by eliminating semantically trivial equalities.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */ diff_match_patch.prototype.diff_cleanupSemantic = function(diffs) {
    var changes = false;
    var equalities = []; // Stack of indices where equalities are found.
    var equalitiesLength = 0; // Keeping our own length var is faster in JS.
    /** @type {?string} */ var lastequality = null;
    // Always equal to diffs[equalities[equalitiesLength - 1]][1]
    var pointer = 0; // Index of current position.
    // Number of characters that changed prior to the equality.
    var length_insertions1 = 0;
    var length_deletions1 = 0;
    // Number of characters that changed after the equality.
    var length_insertions2 = 0;
    var length_deletions2 = 0;
    while(pointer < diffs.length){
        if (diffs[pointer][0] == DIFF_EQUAL) {
            equalities[equalitiesLength++] = pointer;
            length_insertions1 = length_insertions2;
            length_deletions1 = length_deletions2;
            length_insertions2 = 0;
            length_deletions2 = 0;
            lastequality = diffs[pointer][1];
        } else {
            if (diffs[pointer][0] == DIFF_INSERT) {
                length_insertions2 += diffs[pointer][1].length;
            } else {
                length_deletions2 += diffs[pointer][1].length;
            }
            // Eliminate an equality that is smaller or equal to the edits on both
            // sides of it.
            if (lastequality && lastequality.length <= Math.max(length_insertions1, length_deletions1) && lastequality.length <= Math.max(length_insertions2, length_deletions2)) {
                // Duplicate record.
                diffs.splice(equalities[equalitiesLength - 1], 0, [
                    DIFF_DELETE,
                    lastequality
                ]);
                // Change second copy to insert.
                diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
                // Throw away the equality we just deleted.
                equalitiesLength--;
                // Throw away the previous equality (it needs to be reevaluated).
                equalitiesLength--;
                pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                length_insertions1 = 0; // Reset the counters.
                length_deletions1 = 0;
                length_insertions2 = 0;
                length_deletions2 = 0;
                lastequality = null;
                changes = true;
            }
        }
        pointer++;
    }
    // Normalize the diff.
    if (changes) {
        this.diff_cleanupMerge(diffs);
    }
    this.diff_cleanupSemanticLossless(diffs);
    // Find any overlaps between deletions and insertions.
    // e.g: <del>abcxxx</del><ins>xxxdef</ins>
    //   -> <del>abc</del>xxx<ins>def</ins>
    // e.g: <del>xxxabc</del><ins>defxxx</ins>
    //   -> <ins>def</ins>xxx<del>abc</del>
    // Only extract an overlap if it is as big as the edit ahead or behind it.
    pointer = 1;
    while(pointer < diffs.length){
        if (diffs[pointer - 1][0] == DIFF_DELETE && diffs[pointer][0] == DIFF_INSERT) {
            var deletion = diffs[pointer - 1][1];
            var insertion = diffs[pointer][1];
            var overlap_length1 = this.diff_commonOverlap_(deletion, insertion);
            var overlap_length2 = this.diff_commonOverlap_(insertion, deletion);
            if (overlap_length1 >= overlap_length2) {
                if (overlap_length1 >= deletion.length / 2 || overlap_length1 >= insertion.length / 2) {
                    // Overlap found.  Insert an equality and trim the surrounding edits.
                    diffs.splice(pointer, 0, [
                        DIFF_EQUAL,
                        insertion.substring(0, overlap_length1)
                    ]);
                    diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlap_length1);
                    diffs[pointer + 1][1] = insertion.substring(overlap_length1);
                    pointer++;
                }
            } else {
                if (overlap_length2 >= deletion.length / 2 || overlap_length2 >= insertion.length / 2) {
                    // Reverse overlap found.
                    // Insert an equality and swap and trim the surrounding edits.
                    diffs.splice(pointer, 0, [
                        DIFF_EQUAL,
                        deletion.substring(0, overlap_length2)
                    ]);
                    diffs[pointer - 1][0] = DIFF_INSERT;
                    diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlap_length2);
                    diffs[pointer + 1][0] = DIFF_DELETE;
                    diffs[pointer + 1][1] = deletion.substring(overlap_length2);
                    pointer++;
                }
            }
            pointer++;
        }
        pointer++;
    }
};
/**
 * Look for single edits surrounded on both sides by equalities
 * which can be shifted sideways to align the edit to a word boundary.
 * e.g: The c<ins>at c</ins>ame. -> The <ins>cat </ins>came.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */ diff_match_patch.prototype.diff_cleanupSemanticLossless = function(diffs) {
    /**
   * Given two strings, compute a score representing whether the internal
   * boundary falls on logical boundaries.
   * Scores range from 6 (best) to 0 (worst).
   * Closure, but does not reference any external variables.
   * @param {string} one First string.
   * @param {string} two Second string.
   * @return {number} The score.
   * @private
   */ function diff_cleanupSemanticScore_(one, two) {
        if (!one || !two) {
            // Edges are the best.
            return 6;
        }
        // Each port of this function behaves slightly differently due to
        // subtle differences in each language's definition of things like
        // 'whitespace'.  Since this function's purpose is largely cosmetic,
        // the choice has been made to use each language's native features
        // rather than force total conformity.
        var char1 = one.charAt(one.length - 1);
        var char2 = two.charAt(0);
        var nonAlphaNumeric1 = char1.match(diff_match_patch.nonAlphaNumericRegex_);
        var nonAlphaNumeric2 = char2.match(diff_match_patch.nonAlphaNumericRegex_);
        var whitespace1 = nonAlphaNumeric1 && char1.match(diff_match_patch.whitespaceRegex_);
        var whitespace2 = nonAlphaNumeric2 && char2.match(diff_match_patch.whitespaceRegex_);
        var lineBreak1 = whitespace1 && char1.match(diff_match_patch.linebreakRegex_);
        var lineBreak2 = whitespace2 && char2.match(diff_match_patch.linebreakRegex_);
        var blankLine1 = lineBreak1 && one.match(diff_match_patch.blanklineEndRegex_);
        var blankLine2 = lineBreak2 && two.match(diff_match_patch.blanklineStartRegex_);
        if (blankLine1 || blankLine2) {
            // Five points for blank lines.
            return 5;
        } else if (lineBreak1 || lineBreak2) {
            // Four points for line breaks.
            return 4;
        } else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
            // Three points for end of sentences.
            return 3;
        } else if (whitespace1 || whitespace2) {
            // Two points for whitespace.
            return 2;
        } else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
            // One point for non-alphanumeric.
            return 1;
        }
        return 0;
    }
    var pointer = 1;
    // Intentionally ignore the first and last element (don't need checking).
    while(pointer < diffs.length - 1){
        if (diffs[pointer - 1][0] == DIFF_EQUAL && diffs[pointer + 1][0] == DIFF_EQUAL) {
            // This is a single edit surrounded by equalities.
            var equality1 = diffs[pointer - 1][1];
            var edit = diffs[pointer][1];
            var equality2 = diffs[pointer + 1][1];
            // First, shift the edit as far left as possible.
            var commonOffset = this.diff_commonSuffix(equality1, edit);
            if (commonOffset) {
                var commonString = edit.substring(edit.length - commonOffset);
                equality1 = equality1.substring(0, equality1.length - commonOffset);
                edit = commonString + edit.substring(0, edit.length - commonOffset);
                equality2 = commonString + equality2;
            }
            // Second, step character by character right, looking for the best fit.
            var bestEquality1 = equality1;
            var bestEdit = edit;
            var bestEquality2 = equality2;
            var bestScore = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
            while(edit.charAt(0) === equality2.charAt(0)){
                equality1 += edit.charAt(0);
                edit = edit.substring(1) + equality2.charAt(0);
                equality2 = equality2.substring(1);
                var score = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
                // The >= encourages trailing rather than leading whitespace on edits.
                if (score >= bestScore) {
                    bestScore = score;
                    bestEquality1 = equality1;
                    bestEdit = edit;
                    bestEquality2 = equality2;
                }
            }
            if (diffs[pointer - 1][1] != bestEquality1) {
                // We have an improvement, save it back to the diff.
                if (bestEquality1) {
                    diffs[pointer - 1][1] = bestEquality1;
                } else {
                    diffs.splice(pointer - 1, 1);
                    pointer--;
                }
                diffs[pointer][1] = bestEdit;
                if (bestEquality2) {
                    diffs[pointer + 1][1] = bestEquality2;
                } else {
                    diffs.splice(pointer + 1, 1);
                    pointer--;
                }
            }
        }
        pointer++;
    }
};
// Define some regex patterns for matching boundaries.
diff_match_patch.nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
diff_match_patch.whitespaceRegex_ = /\s/;
diff_match_patch.linebreakRegex_ = /[\r\n]/;
diff_match_patch.blanklineEndRegex_ = /\n\r?\n$/;
diff_match_patch.blanklineStartRegex_ = /^\r?\n\r?\n/;
/**
 * Reduce the number of edits by eliminating operationally trivial equalities.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */ diff_match_patch.prototype.diff_cleanupEfficiency = function(diffs) {
    var changes = false;
    var equalities = []; // Stack of indices where equalities are found.
    var equalitiesLength = 0; // Keeping our own length var is faster in JS.
    /** @type {?string} */ var lastequality = null;
    // Always equal to diffs[equalities[equalitiesLength - 1]][1]
    var pointer = 0; // Index of current position.
    // Is there an insertion operation before the last equality.
    var pre_ins = false;
    // Is there a deletion operation before the last equality.
    var pre_del = false;
    // Is there an insertion operation after the last equality.
    var post_ins = false;
    // Is there a deletion operation after the last equality.
    var post_del = false;
    while(pointer < diffs.length){
        if (diffs[pointer][0] == DIFF_EQUAL) {
            if (diffs[pointer][1].length < this.Diff_EditCost && (post_ins || post_del)) {
                // Candidate found.
                equalities[equalitiesLength++] = pointer;
                pre_ins = post_ins;
                pre_del = post_del;
                lastequality = diffs[pointer][1];
            } else {
                // Not a candidate, and can never become one.
                equalitiesLength = 0;
                lastequality = null;
            }
            post_ins = post_del = false;
        } else {
            if (diffs[pointer][0] == DIFF_DELETE) {
                post_del = true;
            } else {
                post_ins = true;
            }
            /*
       * Five types to be split:
       * <ins>A</ins><del>B</del>XY<ins>C</ins><del>D</del>
       * <ins>A</ins>X<ins>C</ins><del>D</del>
       * <ins>A</ins><del>B</del>X<ins>C</ins>
       * <ins>A</del>X<ins>C</ins><del>D</del>
       * <ins>A</ins><del>B</del>X<del>C</del>
       */ if (lastequality && (pre_ins && pre_del && post_ins && post_del || lastequality.length < this.Diff_EditCost / 2 && pre_ins + pre_del + post_ins + post_del == 3)) {
                // Duplicate record.
                diffs.splice(equalities[equalitiesLength - 1], 0, [
                    DIFF_DELETE,
                    lastequality
                ]);
                // Change second copy to insert.
                diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
                equalitiesLength--; // Throw away the equality we just deleted;
                lastequality = null;
                if (pre_ins && pre_del) {
                    // No changes made which could affect previous entry, keep going.
                    post_ins = post_del = true;
                    equalitiesLength = 0;
                } else {
                    equalitiesLength--; // Throw away the previous equality.
                    pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                    post_ins = post_del = false;
                }
                changes = true;
            }
        }
        pointer++;
    }
    if (changes) {
        this.diff_cleanupMerge(diffs);
    }
};
/**
 * Reorder and merge like edit sections.  Merge equalities.
 * Any edit section can move as long as it doesn't cross an equality.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 */ diff_match_patch.prototype.diff_cleanupMerge = function(diffs) {
    diffs.push([
        DIFF_EQUAL,
        ''
    ]); // Add a dummy entry at the end.
    var pointer = 0;
    var count_delete = 0;
    var count_insert = 0;
    var text_delete = '';
    var text_insert = '';
    var commonlength;
    while(pointer < diffs.length){
        switch(diffs[pointer][0]){
            case DIFF_INSERT:
                count_insert++;
                text_insert += diffs[pointer][1];
                pointer++;
                break;
            case DIFF_DELETE:
                count_delete++;
                text_delete += diffs[pointer][1];
                pointer++;
                break;
            case DIFF_EQUAL:
                // Upon reaching an equality, check for prior redundancies.
                if (count_delete + count_insert > 1) {
                    if (count_delete !== 0 && count_insert !== 0) {
                        // Factor out any common prefixies.
                        commonlength = this.diff_commonPrefix(text_insert, text_delete);
                        if (commonlength !== 0) {
                            if (pointer - count_delete - count_insert > 0 && diffs[pointer - count_delete - count_insert - 1][0] == DIFF_EQUAL) {
                                diffs[pointer - count_delete - count_insert - 1][1] += text_insert.substring(0, commonlength);
                            } else {
                                diffs.splice(0, 0, [
                                    DIFF_EQUAL,
                                    text_insert.substring(0, commonlength)
                                ]);
                                pointer++;
                            }
                            text_insert = text_insert.substring(commonlength);
                            text_delete = text_delete.substring(commonlength);
                        }
                        // Factor out any common suffixies.
                        commonlength = this.diff_commonSuffix(text_insert, text_delete);
                        if (commonlength !== 0) {
                            diffs[pointer][1] = text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1];
                            text_insert = text_insert.substring(0, text_insert.length - commonlength);
                            text_delete = text_delete.substring(0, text_delete.length - commonlength);
                        }
                    }
                    // Delete the offending records and add the merged ones.
                    if (count_delete === 0) {
                        diffs.splice(pointer - count_insert, count_delete + count_insert, [
                            DIFF_INSERT,
                            text_insert
                        ]);
                    } else if (count_insert === 0) {
                        diffs.splice(pointer - count_delete, count_delete + count_insert, [
                            DIFF_DELETE,
                            text_delete
                        ]);
                    } else {
                        diffs.splice(pointer - count_delete - count_insert, count_delete + count_insert, [
                            DIFF_DELETE,
                            text_delete
                        ], [
                            DIFF_INSERT,
                            text_insert
                        ]);
                    }
                    pointer = pointer - count_delete - count_insert + (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
                } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
                    // Merge this equality with the previous one.
                    diffs[pointer - 1][1] += diffs[pointer][1];
                    diffs.splice(pointer, 1);
                } else {
                    pointer++;
                }
                count_insert = 0;
                count_delete = 0;
                text_delete = '';
                text_insert = '';
                break;
        }
    }
    if (diffs[diffs.length - 1][1] === '') {
        diffs.pop(); // Remove the dummy entry at the end.
    }
    // Second pass: look for single edits surrounded on both sides by equalities
    // which can be shifted sideways to eliminate an equality.
    // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
    var changes = false;
    pointer = 1;
    // Intentionally ignore the first and last element (don't need checking).
    while(pointer < diffs.length - 1){
        if (diffs[pointer - 1][0] == DIFF_EQUAL && diffs[pointer + 1][0] == DIFF_EQUAL) {
            // This is a single edit surrounded by equalities.
            if (diffs[pointer][1].substring(diffs[pointer][1].length - diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
                // Shift the edit over the previous equality.
                diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
                diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
                diffs.splice(pointer - 1, 1);
                changes = true;
            } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) == diffs[pointer + 1][1]) {
                // Shift the edit over the next equality.
                diffs[pointer - 1][1] += diffs[pointer + 1][1];
                diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
                diffs.splice(pointer + 1, 1);
                changes = true;
            }
        }
        pointer++;
    }
    // If shifts were made, the diff needs reordering and another shift sweep.
    if (changes) {
        this.diff_cleanupMerge(diffs);
    }
};
/**
 * loc is a location in text1, compute and return the equivalent location in
 * text2.
 * e.g. 'The cat' vs 'The big cat', 1->1, 5->8
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @param {number} loc Location within text1.
 * @return {number} Location within text2.
 */ diff_match_patch.prototype.diff_xIndex = function(diffs, loc) {
    var chars1 = 0;
    var chars2 = 0;
    var last_chars1 = 0;
    var last_chars2 = 0;
    var x;
    for(x = 0; x < diffs.length; x++){
        if (diffs[x][0] !== DIFF_INSERT) {
            chars1 += diffs[x][1].length;
        }
        if (diffs[x][0] !== DIFF_DELETE) {
            chars2 += diffs[x][1].length;
        }
        if (chars1 > loc) {
            break;
        }
        last_chars1 = chars1;
        last_chars2 = chars2;
    }
    // Was the location was deleted?
    if (diffs.length != x && diffs[x][0] === DIFF_DELETE) {
        return last_chars2;
    }
    // Add the remaining character length.
    return last_chars2 + (loc - last_chars1);
};
/**
 * Convert a diff array into a pretty HTML report.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} HTML representation.
 */ diff_match_patch.prototype.diff_prettyHtml = function(diffs) {
    var html = [];
    var pattern_amp = /&/g;
    var pattern_lt = /</g;
    var pattern_gt = />/g;
    var pattern_para = /\n/g;
    for(var x = 0; x < diffs.length; x++){
        var op = diffs[x][0]; // Operation (insert, delete, equal)
        var data = diffs[x][1]; // Text of change.
        var text = data.replace(pattern_amp, '&amp;').replace(pattern_lt, '&lt;').replace(pattern_gt, '&gt;').replace(pattern_para, '&para;<br>');
        switch(op){
            case DIFF_INSERT:
                html[x] = '<ins style="background:#e6ffe6;">' + text + '</ins>';
                break;
            case DIFF_DELETE:
                html[x] = '<del style="background:#ffe6e6;">' + text + '</del>';
                break;
            case DIFF_EQUAL:
                html[x] = '<span>' + text + '</span>';
                break;
        }
    }
    return html.join('');
};
/**
 * Compute and return the source text (all equalities and deletions).
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Source text.
 */ diff_match_patch.prototype.diff_text1 = function(diffs) {
    var text = [];
    for(var x = 0; x < diffs.length; x++){
        if (diffs[x][0] !== DIFF_INSERT) {
            text[x] = diffs[x][1];
        }
    }
    return text.join('');
};
/**
 * Compute and return the destination text (all equalities and insertions).
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Destination text.
 */ diff_match_patch.prototype.diff_text2 = function(diffs) {
    var text = [];
    for(var x = 0; x < diffs.length; x++){
        if (diffs[x][0] !== DIFF_DELETE) {
            text[x] = diffs[x][1];
        }
    }
    return text.join('');
};
/**
 * Compute the Levenshtein distance; the number of inserted, deleted or
 * substituted characters.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {number} Number of changes.
 */ diff_match_patch.prototype.diff_levenshtein = function(diffs) {
    var levenshtein = 0;
    var insertions = 0;
    var deletions = 0;
    for(var x = 0; x < diffs.length; x++){
        var op = diffs[x][0];
        var data = diffs[x][1];
        switch(op){
            case DIFF_INSERT:
                insertions += data.length;
                break;
            case DIFF_DELETE:
                deletions += data.length;
                break;
            case DIFF_EQUAL:
                // A deletion and an insertion is one substitution.
                levenshtein += Math.max(insertions, deletions);
                insertions = 0;
                deletions = 0;
                break;
        }
    }
    levenshtein += Math.max(insertions, deletions);
    return levenshtein;
};
/**
 * Crush the diff into an encoded string which describes the operations
 * required to transform text1 into text2.
 * E.g. =3\t-2\t+ing  -> Keep 3 chars, delete 2 chars, insert 'ing'.
 * Operations are tab-separated.  Inserted text is escaped using %xx notation.
 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
 * @return {string} Delta text.
 */ diff_match_patch.prototype.diff_toDelta = function(diffs) {
    var text = [];
    for(var x = 0; x < diffs.length; x++){
        switch(diffs[x][0]){
            case DIFF_INSERT:
                text[x] = '+' + encodeURI(diffs[x][1]);
                break;
            case DIFF_DELETE:
                text[x] = '-' + diffs[x][1].length;
                break;
            case DIFF_EQUAL:
                text[x] = '=' + diffs[x][1].length;
                break;
        }
    }
    return text.join('\t').replace(/%20/g, ' ');
};
/**
 * Given the original text1, and an encoded string which describes the
 * operations required to transform text1 into text2, compute the full diff.
 * @param {string} text1 Source string for the diff.
 * @param {string} delta Delta text.
 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
 * @throws {!Error} If invalid input.
 */ diff_match_patch.prototype.diff_fromDelta = function(text1, delta) {
    var diffs = [];
    var diffsLength = 0; // Keeping our own length var is faster in JS.
    var pointer = 0; // Cursor in text1
    var tokens = delta.split(/\t/g);
    for(var x = 0; x < tokens.length; x++){
        // Each token begins with a one character parameter which specifies the
        // operation of this token (delete, insert, equality).
        var param = tokens[x].substring(1);
        switch(tokens[x].charAt(0)){
            case '+':
                try {
                    diffs[diffsLength++] = [
                        DIFF_INSERT,
                        decodeURI(param)
                    ];
                } catch (ex) {
                    // Malformed URI sequence.
                    throw new Error('Illegal escape in diff_fromDelta: ' + param);
                }
                break;
            case '-':
            // Fall through.
            case '=':
                var n = parseInt(param, 10);
                if (isNaN(n) || n < 0) {
                    throw new Error('Invalid number in diff_fromDelta: ' + param);
                }
                var text = text1.substring(pointer, pointer += n);
                if (tokens[x].charAt(0) == '=') {
                    diffs[diffsLength++] = [
                        DIFF_EQUAL,
                        text
                    ];
                } else {
                    diffs[diffsLength++] = [
                        DIFF_DELETE,
                        text
                    ];
                }
                break;
            default:
                // Blank tokens are ok (from a trailing \t).
                // Anything else is an error.
                if (tokens[x]) {
                    throw new Error('Invalid diff operation in diff_fromDelta: ' + tokens[x]);
                }
        }
    }
    if (pointer != text1.length) {
        throw new Error('Delta length (' + pointer + ') does not equal source text length (' + text1.length + ').');
    }
    return diffs;
};
//  MATCH FUNCTIONS
/**
 * Locate the best instance of 'pattern' in 'text' near 'loc'.
 * @param {string} text The text to search.
 * @param {string} pattern The pattern to search for.
 * @param {number} loc The location to search around.
 * @return {number} Best match index or -1.
 */ diff_match_patch.prototype.match_main = function(text, pattern, loc) {
    // Check for null inputs.
    if (text == null || pattern == null || loc == null) {
        throw new Error('Null input. (match_main)');
    }
    loc = Math.max(0, Math.min(loc, text.length));
    if (text == pattern) {
        // Shortcut (potentially not guaranteed by the algorithm)
        return 0;
    } else if (!text.length) {
        // Nothing to match.
        return -1;
    } else if (text.substring(loc, loc + pattern.length) == pattern) {
        // Perfect match at the perfect spot!  (Includes case of null pattern)
        return loc;
    } else {
        // Do a fuzzy compare.
        return this.match_bitap_(text, pattern, loc);
    }
};
/**
 * Locate the best instance of 'pattern' in 'text' near 'loc' using the
 * Bitap algorithm.
 * @param {string} text The text to search.
 * @param {string} pattern The pattern to search for.
 * @param {number} loc The location to search around.
 * @return {number} Best match index or -1.
 * @private
 */ diff_match_patch.prototype.match_bitap_ = function(text, pattern, loc) {
    if (pattern.length > this.Match_MaxBits) {
        throw new Error('Pattern too long for this browser.');
    }
    // Initialise the alphabet.
    var s = this.match_alphabet_(pattern);
    var dmp = this; // 'this' becomes 'window' in a closure.
    /**
   * Compute and return the score for a match with e errors and x location.
   * Accesses loc and pattern through being a closure.
   * @param {number} e Number of errors in match.
   * @param {number} x Location of match.
   * @return {number} Overall score for match (0.0 = good, 1.0 = bad).
   * @private
   */ function match_bitapScore_(e, x) {
        var accuracy = e / pattern.length;
        var proximity = Math.abs(loc - x);
        if (!dmp.Match_Distance) {
            // Dodge divide by zero error.
            return proximity ? 1.0 : accuracy;
        }
        return accuracy + proximity / dmp.Match_Distance;
    }
    // Highest score beyond which we give up.
    var score_threshold = this.Match_Threshold;
    // Is there a nearby exact match? (speedup)
    var best_loc = text.indexOf(pattern, loc);
    if (best_loc != -1) {
        score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
        // What about in the other direction? (speedup)
        best_loc = text.lastIndexOf(pattern, loc + pattern.length);
        if (best_loc != -1) {
            score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
        }
    }
    // Initialise the bit arrays.
    var matchmask = 1 << pattern.length - 1;
    best_loc = -1;
    var bin_min, bin_mid;
    var bin_max = pattern.length + text.length;
    var last_rd;
    for(var d = 0; d < pattern.length; d++){
        // Scan for the best match; each iteration allows for one more error.
        // Run a binary search to determine how far from 'loc' we can stray at this
        // error level.
        bin_min = 0;
        bin_mid = bin_max;
        while(bin_min < bin_mid){
            if (match_bitapScore_(d, loc + bin_mid) <= score_threshold) {
                bin_min = bin_mid;
            } else {
                bin_max = bin_mid;
            }
            bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
        }
        // Use the result from this iteration as the maximum for the next.
        bin_max = bin_mid;
        var start = Math.max(1, loc - bin_mid + 1);
        var finish = Math.min(loc + bin_mid, text.length) + pattern.length;
        var rd = Array(finish + 2);
        rd[finish + 1] = (1 << d) - 1;
        for(var j = finish; j >= start; j--){
            // The alphabet (s) is a sparse hash, so the following line generates
            // warnings.
            var charMatch = s[text.charAt(j - 1)];
            if (d === 0) {
                rd[j] = (rd[j + 1] << 1 | 1) & charMatch;
            } else {
                rd[j] = (rd[j + 1] << 1 | 1) & charMatch | ((last_rd[j + 1] | last_rd[j]) << 1 | 1) | last_rd[j + 1];
            }
            if (rd[j] & matchmask) {
                var score = match_bitapScore_(d, j - 1);
                // This match will almost certainly be better than any existing match.
                // But check anyway.
                if (score <= score_threshold) {
                    // Told you so.
                    score_threshold = score;
                    best_loc = j - 1;
                    if (best_loc > loc) {
                        // When passing loc, don't exceed our current distance from loc.
                        start = Math.max(1, 2 * loc - best_loc);
                    } else {
                        break;
                    }
                }
            }
        }
        // No hope for a (better) match at greater error levels.
        if (match_bitapScore_(d + 1, loc) > score_threshold) {
            break;
        }
        last_rd = rd;
    }
    return best_loc;
};
/**
 * Initialise the alphabet for the Bitap algorithm.
 * @param {string} pattern The text to encode.
 * @return {!Object} Hash of character locations.
 * @private
 */ diff_match_patch.prototype.match_alphabet_ = function(pattern) {
    var s = {};
    for(var i = 0; i < pattern.length; i++){
        s[pattern.charAt(i)] = 0;
    }
    for(var i = 0; i < pattern.length; i++){
        s[pattern.charAt(i)] |= 1 << pattern.length - i - 1;
    }
    return s;
};
//  PATCH FUNCTIONS
/**
 * Increase the context until it is unique,
 * but don't let the pattern expand beyond Match_MaxBits.
 * @param {!diff_match_patch.patch_obj} patch The patch to grow.
 * @param {string} text Source text.
 * @private
 */ diff_match_patch.prototype.patch_addContext_ = function(patch, text) {
    if (text.length == 0) {
        return;
    }
    var pattern = text.substring(patch.start2, patch.start2 + patch.length1);
    var padding = 0;
    // Look for the first and last matches of pattern in text.  If two different
    // matches are found, increase the pattern length.
    while(text.indexOf(pattern) != text.lastIndexOf(pattern) && pattern.length < this.Match_MaxBits - this.Patch_Margin - this.Patch_Margin){
        padding += this.Patch_Margin;
        pattern = text.substring(patch.start2 - padding, patch.start2 + patch.length1 + padding);
    }
    // Add one chunk for good luck.
    padding += this.Patch_Margin;
    // Add the prefix.
    var prefix = text.substring(patch.start2 - padding, patch.start2);
    if (prefix) {
        patch.diffs.unshift([
            DIFF_EQUAL,
            prefix
        ]);
    }
    // Add the suffix.
    var suffix = text.substring(patch.start2 + patch.length1, patch.start2 + patch.length1 + padding);
    if (suffix) {
        patch.diffs.push([
            DIFF_EQUAL,
            suffix
        ]);
    }
    // Roll back the start points.
    patch.start1 -= prefix.length;
    patch.start2 -= prefix.length;
    // Extend the lengths.
    patch.length1 += prefix.length + suffix.length;
    patch.length2 += prefix.length + suffix.length;
};
/**
 * Compute a list of patches to turn text1 into text2.
 * Use diffs if provided, otherwise compute it ourselves.
 * There are four ways to call this function, depending on what data is
 * available to the caller:
 * Method 1:
 * a = text1, b = text2
 * Method 2:
 * a = diffs
 * Method 3 (optimal):
 * a = text1, b = diffs
 * Method 4 (deprecated, use method 3):
 * a = text1, b = text2, c = diffs
 *
 * @param {string|!Array.<!diff_match_patch.Diff>} a text1 (methods 1,3,4) or
 * Array of diff tuples for text1 to text2 (method 2).
 * @param {string|!Array.<!diff_match_patch.Diff>} opt_b text2 (methods 1,4) or
 * Array of diff tuples for text1 to text2 (method 3) or undefined (method 2).
 * @param {string|!Array.<!diff_match_patch.Diff>} opt_c Array of diff tuples
 * for text1 to text2 (method 4) or undefined (methods 1,2,3).
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 */ diff_match_patch.prototype.patch_make = function(a, opt_b, opt_c) {
    var text1, diffs;
    if (typeof a == 'string' && typeof opt_b == 'string' && typeof opt_c == 'undefined') {
        // Method 1: text1, text2
        // Compute diffs from text1 and text2.
        text1 = /** @type {string} */ a;
        diffs = this.diff_main(text1, /** @type {string} */ opt_b, true);
        if (diffs.length > 2) {
            this.diff_cleanupSemantic(diffs);
            this.diff_cleanupEfficiency(diffs);
        }
    } else if (a && typeof a == 'object' && typeof opt_b == 'undefined' && typeof opt_c == 'undefined') {
        // Method 2: diffs
        // Compute text1 from diffs.
        diffs = /** @type {!Array.<!diff_match_patch.Diff>} */ a;
        text1 = this.diff_text1(diffs);
    } else if (typeof a == 'string' && opt_b && typeof opt_b == 'object' && typeof opt_c == 'undefined') {
        // Method 3: text1, diffs
        text1 = /** @type {string} */ a;
        diffs = /** @type {!Array.<!diff_match_patch.Diff>} */ opt_b;
    } else if (typeof a == 'string' && typeof opt_b == 'string' && opt_c && typeof opt_c == 'object') {
        // Method 4: text1, text2, diffs
        // text2 is not used.
        text1 = /** @type {string} */ a;
        diffs = /** @type {!Array.<!diff_match_patch.Diff>} */ opt_c;
    } else {
        throw new Error('Unknown call format to patch_make.');
    }
    if (diffs.length === 0) {
        return []; // Get rid of the null case.
    }
    var patches = [];
    var patch = new diff_match_patch.patch_obj();
    var patchDiffLength = 0; // Keeping our own length var is faster in JS.
    var char_count1 = 0; // Number of characters into the text1 string.
    var char_count2 = 0; // Number of characters into the text2 string.
    // Start with text1 (prepatch_text) and apply the diffs until we arrive at
    // text2 (postpatch_text).  We recreate the patches one by one to determine
    // context info.
    var prepatch_text = text1;
    var postpatch_text = text1;
    for(var x = 0; x < diffs.length; x++){
        var diff_type = diffs[x][0];
        var diff_text = diffs[x][1];
        if (!patchDiffLength && diff_type !== DIFF_EQUAL) {
            // A new patch starts here.
            patch.start1 = char_count1;
            patch.start2 = char_count2;
        }
        switch(diff_type){
            case DIFF_INSERT:
                patch.diffs[patchDiffLength++] = diffs[x];
                patch.length2 += diff_text.length;
                postpatch_text = postpatch_text.substring(0, char_count2) + diff_text + postpatch_text.substring(char_count2);
                break;
            case DIFF_DELETE:
                patch.length1 += diff_text.length;
                patch.diffs[patchDiffLength++] = diffs[x];
                postpatch_text = postpatch_text.substring(0, char_count2) + postpatch_text.substring(char_count2 + diff_text.length);
                break;
            case DIFF_EQUAL:
                if (diff_text.length <= 2 * this.Patch_Margin && patchDiffLength && diffs.length != x + 1) {
                    // Small equality inside a patch.
                    patch.diffs[patchDiffLength++] = diffs[x];
                    patch.length1 += diff_text.length;
                    patch.length2 += diff_text.length;
                } else if (diff_text.length >= 2 * this.Patch_Margin) {
                    // Time for a new patch.
                    if (patchDiffLength) {
                        this.patch_addContext_(patch, prepatch_text);
                        patches.push(patch);
                        patch = new diff_match_patch.patch_obj();
                        patchDiffLength = 0;
                        // Unlike Unidiff, our patch lists have a rolling context.
                        // http://code.google.com/p/google-diff-match-patch/wiki/Unidiff
                        // Update prepatch text & pos to reflect the application of the
                        // just completed patch.
                        prepatch_text = postpatch_text;
                        char_count1 = char_count2;
                    }
                }
                break;
        }
        // Update the current character count.
        if (diff_type !== DIFF_INSERT) {
            char_count1 += diff_text.length;
        }
        if (diff_type !== DIFF_DELETE) {
            char_count2 += diff_text.length;
        }
    }
    // Pick up the leftover patch if not empty.
    if (patchDiffLength) {
        this.patch_addContext_(patch, prepatch_text);
        patches.push(patch);
    }
    return patches;
};
/**
 * Given an array of patches, return another array that is identical.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 */ diff_match_patch.prototype.patch_deepCopy = function(patches) {
    // Making deep copies is hard in JavaScript.
    var patchesCopy = [];
    for(var x = 0; x < patches.length; x++){
        var patch = patches[x];
        var patchCopy = new diff_match_patch.patch_obj();
        patchCopy.diffs = [];
        for(var y = 0; y < patch.diffs.length; y++){
            patchCopy.diffs[y] = patch.diffs[y].slice();
        }
        patchCopy.start1 = patch.start1;
        patchCopy.start2 = patch.start2;
        patchCopy.length1 = patch.length1;
        patchCopy.length2 = patch.length2;
        patchesCopy[x] = patchCopy;
    }
    return patchesCopy;
};
/**
 * Merge a set of patches onto the text.  Return a patched text, as well
 * as a list of true/false values indicating which patches were applied.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @param {string} text Old text.
 * @return {!Array.<string|!Array.<boolean>>} Two element Array, containing the
 *      new text and an array of boolean values.
 */ diff_match_patch.prototype.patch_apply = function(patches, text) {
    if (patches.length == 0) {
        return [
            text,
            []
        ];
    }
    // Deep copy the patches so that no changes are made to originals.
    patches = this.patch_deepCopy(patches);
    var nullPadding = this.patch_addPadding(patches);
    text = nullPadding + text + nullPadding;
    this.patch_splitMax(patches);
    // delta keeps track of the offset between the expected and actual location
    // of the previous patch.  If there are patches expected at positions 10 and
    // 20, but the first patch was found at 12, delta is 2 and the second patch
    // has an effective expected position of 22.
    var delta = 0;
    var results = [];
    for(var x = 0; x < patches.length; x++){
        var expected_loc = patches[x].start2 + delta;
        var text1 = this.diff_text1(patches[x].diffs);
        var start_loc;
        var end_loc = -1;
        if (text1.length > this.Match_MaxBits) {
            // patch_splitMax will only provide an oversized pattern in the case of
            // a monster delete.
            start_loc = this.match_main(text, text1.substring(0, this.Match_MaxBits), expected_loc);
            if (start_loc != -1) {
                end_loc = this.match_main(text, text1.substring(text1.length - this.Match_MaxBits), expected_loc + text1.length - this.Match_MaxBits);
                if (end_loc == -1 || start_loc >= end_loc) {
                    // Can't find valid trailing context.  Drop this patch.
                    start_loc = -1;
                }
            }
        } else {
            start_loc = this.match_main(text, text1, expected_loc);
        }
        if (start_loc == -1) {
            // No match found.  :(
            results[x] = false;
            // Subtract the delta for this failed patch from subsequent patches.
            delta -= patches[x].length2 - patches[x].length1;
        } else {
            // Found a match.  :)
            results[x] = true;
            delta = start_loc - expected_loc;
            var text2;
            if (end_loc == -1) {
                text2 = text.substring(start_loc, start_loc + text1.length);
            } else {
                text2 = text.substring(start_loc, end_loc + this.Match_MaxBits);
            }
            if (text1 == text2) {
                // Perfect match, just shove the replacement text in.
                text = text.substring(0, start_loc) + this.diff_text2(patches[x].diffs) + text.substring(start_loc + text1.length);
            } else {
                // Imperfect match.  Run a diff to get a framework of equivalent
                // indices.
                var diffs = this.diff_main(text1, text2, false);
                if (text1.length > this.Match_MaxBits && this.diff_levenshtein(diffs) / text1.length > this.Patch_DeleteThreshold) {
                    // The end points match, but the content is unacceptably bad.
                    results[x] = false;
                } else {
                    this.diff_cleanupSemanticLossless(diffs);
                    var index1 = 0;
                    var index2;
                    for(var y = 0; y < patches[x].diffs.length; y++){
                        var mod = patches[x].diffs[y];
                        if (mod[0] !== DIFF_EQUAL) {
                            index2 = this.diff_xIndex(diffs, index1);
                        }
                        if (mod[0] === DIFF_INSERT) {
                            text = text.substring(0, start_loc + index2) + mod[1] + text.substring(start_loc + index2);
                        } else if (mod[0] === DIFF_DELETE) {
                            text = text.substring(0, start_loc + index2) + text.substring(start_loc + this.diff_xIndex(diffs, index1 + mod[1].length));
                        }
                        if (mod[0] !== DIFF_DELETE) {
                            index1 += mod[1].length;
                        }
                    }
                }
            }
        }
    }
    // Strip the padding off.
    text = text.substring(nullPadding.length, text.length - nullPadding.length);
    return [
        text,
        results
    ];
};
/**
 * Add some padding on text start and end so that edges can match something.
 * Intended to be called only from within patch_apply.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {string} The padding string added to each side.
 */ diff_match_patch.prototype.patch_addPadding = function(patches) {
    var paddingLength = this.Patch_Margin;
    var nullPadding = '';
    for(var x = 1; x <= paddingLength; x++){
        nullPadding += String.fromCharCode(x);
    }
    // Bump all the patches forward.
    for(var x = 0; x < patches.length; x++){
        patches[x].start1 += paddingLength;
        patches[x].start2 += paddingLength;
    }
    // Add some padding on start of first diff.
    var patch = patches[0];
    var diffs = patch.diffs;
    if (diffs.length == 0 || diffs[0][0] != DIFF_EQUAL) {
        // Add nullPadding equality.
        diffs.unshift([
            DIFF_EQUAL,
            nullPadding
        ]);
        patch.start1 -= paddingLength; // Should be 0.
        patch.start2 -= paddingLength; // Should be 0.
        patch.length1 += paddingLength;
        patch.length2 += paddingLength;
    } else if (paddingLength > diffs[0][1].length) {
        // Grow first equality.
        var extraLength = paddingLength - diffs[0][1].length;
        diffs[0][1] = nullPadding.substring(diffs[0][1].length) + diffs[0][1];
        patch.start1 -= extraLength;
        patch.start2 -= extraLength;
        patch.length1 += extraLength;
        patch.length2 += extraLength;
    }
    // Add some padding on end of last diff.
    patch = patches[patches.length - 1];
    diffs = patch.diffs;
    if (diffs.length == 0 || diffs[diffs.length - 1][0] != DIFF_EQUAL) {
        // Add nullPadding equality.
        diffs.push([
            DIFF_EQUAL,
            nullPadding
        ]);
        patch.length1 += paddingLength;
        patch.length2 += paddingLength;
    } else if (paddingLength > diffs[diffs.length - 1][1].length) {
        // Grow last equality.
        var extraLength = paddingLength - diffs[diffs.length - 1][1].length;
        diffs[diffs.length - 1][1] += nullPadding.substring(0, extraLength);
        patch.length1 += extraLength;
        patch.length2 += extraLength;
    }
    return nullPadding;
};
/**
 * Look through the patches and break up any which are longer than the maximum
 * limit of the match algorithm.
 * Intended to be called only from within patch_apply.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 */ diff_match_patch.prototype.patch_splitMax = function(patches) {
    var patch_size = this.Match_MaxBits;
    for(var x = 0; x < patches.length; x++){
        if (patches[x].length1 <= patch_size) {
            continue;
        }
        var bigpatch = patches[x];
        // Remove the big old patch.
        patches.splice(x--, 1);
        var start1 = bigpatch.start1;
        var start2 = bigpatch.start2;
        var precontext = '';
        while(bigpatch.diffs.length !== 0){
            // Create one of several smaller patches.
            var patch = new diff_match_patch.patch_obj();
            var empty = true;
            patch.start1 = start1 - precontext.length;
            patch.start2 = start2 - precontext.length;
            if (precontext !== '') {
                patch.length1 = patch.length2 = precontext.length;
                patch.diffs.push([
                    DIFF_EQUAL,
                    precontext
                ]);
            }
            while(bigpatch.diffs.length !== 0 && patch.length1 < patch_size - this.Patch_Margin){
                var diff_type = bigpatch.diffs[0][0];
                var diff_text = bigpatch.diffs[0][1];
                if (diff_type === DIFF_INSERT) {
                    // Insertions are harmless.
                    patch.length2 += diff_text.length;
                    start2 += diff_text.length;
                    patch.diffs.push(bigpatch.diffs.shift());
                    empty = false;
                } else if (diff_type === DIFF_DELETE && patch.diffs.length == 1 && patch.diffs[0][0] == DIFF_EQUAL && diff_text.length > 2 * patch_size) {
                    // This is a large deletion.  Let it pass in one chunk.
                    patch.length1 += diff_text.length;
                    start1 += diff_text.length;
                    empty = false;
                    patch.diffs.push([
                        diff_type,
                        diff_text
                    ]);
                    bigpatch.diffs.shift();
                } else {
                    // Deletion or equality.  Only take as much as we can stomach.
                    diff_text = diff_text.substring(0, patch_size - patch.length1 - this.Patch_Margin);
                    patch.length1 += diff_text.length;
                    start1 += diff_text.length;
                    if (diff_type === DIFF_EQUAL) {
                        patch.length2 += diff_text.length;
                        start2 += diff_text.length;
                    } else {
                        empty = false;
                    }
                    patch.diffs.push([
                        diff_type,
                        diff_text
                    ]);
                    if (diff_text == bigpatch.diffs[0][1]) {
                        bigpatch.diffs.shift();
                    } else {
                        bigpatch.diffs[0][1] = bigpatch.diffs[0][1].substring(diff_text.length);
                    }
                }
            }
            // Compute the head context for the next patch.
            precontext = this.diff_text2(patch.diffs);
            precontext = precontext.substring(precontext.length - this.Patch_Margin);
            // Append the end context for this patch.
            var postcontext = this.diff_text1(bigpatch.diffs).substring(0, this.Patch_Margin);
            if (postcontext !== '') {
                patch.length1 += postcontext.length;
                patch.length2 += postcontext.length;
                if (patch.diffs.length !== 0 && patch.diffs[patch.diffs.length - 1][0] === DIFF_EQUAL) {
                    patch.diffs[patch.diffs.length - 1][1] += postcontext;
                } else {
                    patch.diffs.push([
                        DIFF_EQUAL,
                        postcontext
                    ]);
                }
            }
            if (!empty) {
                patches.splice(++x, 0, patch);
            }
        }
    }
};
/**
 * Take a list of patches and return a textual representation.
 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of Patch objects.
 * @return {string} Text representation of patches.
 */ diff_match_patch.prototype.patch_toText = function(patches) {
    var text = [];
    for(var x = 0; x < patches.length; x++){
        text[x] = patches[x];
    }
    return text.join('');
};
/**
 * Parse a textual representation of patches and return a list of Patch objects.
 * @param {string} textline Text representation of patches.
 * @return {!Array.<!diff_match_patch.patch_obj>} Array of Patch objects.
 * @throws {!Error} If invalid input.
 */ diff_match_patch.prototype.patch_fromText = function(textline) {
    var patches = [];
    if (!textline) {
        return patches;
    }
    var text = textline.split('\n');
    var textPointer = 0;
    var patchHeader = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;
    while(textPointer < text.length){
        var m = text[textPointer].match(patchHeader);
        if (!m) {
            throw new Error('Invalid patch string: ' + text[textPointer]);
        }
        var patch = new diff_match_patch.patch_obj();
        patches.push(patch);
        patch.start1 = parseInt(m[1], 10);
        if (m[2] === '') {
            patch.start1--;
            patch.length1 = 1;
        } else if (m[2] == '0') {
            patch.length1 = 0;
        } else {
            patch.start1--;
            patch.length1 = parseInt(m[2], 10);
        }
        patch.start2 = parseInt(m[3], 10);
        if (m[4] === '') {
            patch.start2--;
            patch.length2 = 1;
        } else if (m[4] == '0') {
            patch.length2 = 0;
        } else {
            patch.start2--;
            patch.length2 = parseInt(m[4], 10);
        }
        textPointer++;
        while(textPointer < text.length){
            var sign = text[textPointer].charAt(0);
            try {
                var line = decodeURI(text[textPointer].substring(1));
            } catch (ex) {
                // Malformed URI sequence.
                throw new Error('Illegal escape in patch_fromText: ' + line);
            }
            if (sign == '-') {
                // Deletion.
                patch.diffs.push([
                    DIFF_DELETE,
                    line
                ]);
            } else if (sign == '+') {
                // Insertion.
                patch.diffs.push([
                    DIFF_INSERT,
                    line
                ]);
            } else if (sign == ' ') {
                // Minor equality.
                patch.diffs.push([
                    DIFF_EQUAL,
                    line
                ]);
            } else if (sign == '@') {
                break;
            } else if (sign === '') {
            // Blank line?  Whatever.
            } else {
                // WTF?
                throw new Error('Invalid patch mode "' + sign + '" in: ' + line);
            }
            textPointer++;
        }
    }
    return patches;
};
/**
 * Class representing one patch operation.
 * @constructor
 */ diff_match_patch.patch_obj = function() {
    /** @type {!Array.<!diff_match_patch.Diff>} */ this.diffs = [];
    /** @type {?number} */ this.start1 = null;
    /** @type {?number} */ this.start2 = null;
    /** @type {number} */ this.length1 = 0;
    /** @type {number} */ this.length2 = 0;
};
/**
 * Emmulate GNU diff's format.
 * Header: @@ -382,8 +481,9 @@
 * Indicies are printed as 1-based, not 0-based.
 * @return {string} The GNU diff string.
 */ diff_match_patch.patch_obj.prototype.toString = function() {
    var coords1, coords2;
    if (this.length1 === 0) {
        coords1 = this.start1 + ',0';
    } else if (this.length1 == 1) {
        coords1 = this.start1 + 1;
    } else {
        coords1 = this.start1 + 1 + ',' + this.length1;
    }
    if (this.length2 === 0) {
        coords2 = this.start2 + ',0';
    } else if (this.length2 == 1) {
        coords2 = this.start2 + 1;
    } else {
        coords2 = this.start2 + 1 + ',' + this.length2;
    }
    var text = [
        '@@ -' + coords1 + ' +' + coords2 + ' @@\n'
    ];
    var op;
    // Escape the body of the patch with %xx notation.
    for(var x = 0; x < this.diffs.length; x++){
        switch(this.diffs[x][0]){
            case DIFF_INSERT:
                op = '+';
                break;
            case DIFF_DELETE:
                op = '-';
                break;
            case DIFF_EQUAL:
                op = ' ';
                break;
        }
        text[x + 1] = op + encodeURI(this.diffs[x][1]) + '\n';
    }
    return text.join('').replace(/%20/g, ' ');
};
// Export these global variables so that they survive Google's JS compiler.
// In a browser, 'this' will be 'window'.
// Users of node.js should 'require' the uncompressed version since Google's
// JS compiler may break the following exports for non-browser environments.
this['diff_match_patch'] = diff_match_patch;
this['DIFF_DELETE'] = DIFF_DELETE;
this['DIFF_INSERT'] = DIFF_INSERT;
this['DIFF_EQUAL'] = DIFF_EQUAL;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvZGlmZi1tYXRjaC1wYXRjaC0xLjAuMC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIERpZmYgTWF0Y2ggYW5kIFBhdGNoXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgZGlmZi1tYXRjaC1wYXRjaCBBdXRob3JzLlxuICogaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9kaWZmLW1hdGNoLXBhdGNoXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ29tcHV0ZXMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0d28gdGV4dHMgdG8gY3JlYXRlIGEgcGF0Y2guXG4gKiBBcHBsaWVzIHRoZSBwYXRjaCBvbnRvIGFub3RoZXIgdGV4dCwgYWxsb3dpbmcgZm9yIGVycm9ycy5cbiAqIEBhdXRob3IgZnJhc2VyQGdvb2dsZS5jb20gKE5laWwgRnJhc2VyKVxuICovXG5cbi8qKlxuICogQ2xhc3MgY29udGFpbmluZyB0aGUgZGlmZiwgbWF0Y2ggYW5kIHBhdGNoIG1ldGhvZHMuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gZGlmZl9tYXRjaF9wYXRjaCgpIHtcblxuICAvLyBEZWZhdWx0cy5cbiAgLy8gUmVkZWZpbmUgdGhlc2UgaW4geW91ciBwcm9ncmFtIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0cy5cblxuICAvLyBOdW1iZXIgb2Ygc2Vjb25kcyB0byBtYXAgYSBkaWZmIGJlZm9yZSBnaXZpbmcgdXAgKDAgZm9yIGluZmluaXR5KS5cbiAgdGhpcy5EaWZmX1RpbWVvdXQgPSAxLjA7XG4gIC8vIENvc3Qgb2YgYW4gZW1wdHkgZWRpdCBvcGVyYXRpb24gaW4gdGVybXMgb2YgZWRpdCBjaGFyYWN0ZXJzLlxuICB0aGlzLkRpZmZfRWRpdENvc3QgPSA0O1xuICAvLyBBdCB3aGF0IHBvaW50IGlzIG5vIG1hdGNoIGRlY2xhcmVkICgwLjAgPSBwZXJmZWN0aW9uLCAxLjAgPSB2ZXJ5IGxvb3NlKS5cbiAgdGhpcy5NYXRjaF9UaHJlc2hvbGQgPSAwLjU7XG4gIC8vIEhvdyBmYXIgdG8gc2VhcmNoIGZvciBhIG1hdGNoICgwID0gZXhhY3QgbG9jYXRpb24sIDEwMDArID0gYnJvYWQgbWF0Y2gpLlxuICAvLyBBIG1hdGNoIHRoaXMgbWFueSBjaGFyYWN0ZXJzIGF3YXkgZnJvbSB0aGUgZXhwZWN0ZWQgbG9jYXRpb24gd2lsbCBhZGRcbiAgLy8gMS4wIHRvIHRoZSBzY29yZSAoMC4wIGlzIGEgcGVyZmVjdCBtYXRjaCkuXG4gIHRoaXMuTWF0Y2hfRGlzdGFuY2UgPSAxMDAwO1xuICAvLyBXaGVuIGRlbGV0aW5nIGEgbGFyZ2UgYmxvY2sgb2YgdGV4dCAob3ZlciB+NjQgY2hhcmFjdGVycyksIGhvdyBjbG9zZSBkb1xuICAvLyB0aGUgY29udGVudHMgaGF2ZSB0byBiZSB0byBtYXRjaCB0aGUgZXhwZWN0ZWQgY29udGVudHMuICgwLjAgPSBwZXJmZWN0aW9uLFxuICAvLyAxLjAgPSB2ZXJ5IGxvb3NlKS4gIE5vdGUgdGhhdCBNYXRjaF9UaHJlc2hvbGQgY29udHJvbHMgaG93IGNsb3NlbHkgdGhlXG4gIC8vIGVuZCBwb2ludHMgb2YgYSBkZWxldGUgbmVlZCB0byBtYXRjaC5cbiAgdGhpcy5QYXRjaF9EZWxldGVUaHJlc2hvbGQgPSAwLjU7XG4gIC8vIENodW5rIHNpemUgZm9yIGNvbnRleHQgbGVuZ3RoLlxuICB0aGlzLlBhdGNoX01hcmdpbiA9IDQ7XG5cbiAgLy8gVGhlIG51bWJlciBvZiBiaXRzIGluIGFuIGludC5cbiAgdGhpcy5NYXRjaF9NYXhCaXRzID0gMzI7XG59XG5cblxuLy8gIERJRkYgRlVOQ1RJT05TXG5cblxuLyoqXG4gKiBUaGUgZGF0YSBzdHJ1Y3R1cmUgcmVwcmVzZW50aW5nIGEgZGlmZiBpcyBhbiBhcnJheSBvZiB0dXBsZXM6XG4gKiBbW0RJRkZfREVMRVRFLCAnSGVsbG8nXSwgW0RJRkZfSU5TRVJULCAnR29vZGJ5ZSddLCBbRElGRl9FUVVBTCwgJyB3b3JsZC4nXV1cbiAqIHdoaWNoIG1lYW5zOiBkZWxldGUgJ0hlbGxvJywgYWRkICdHb29kYnllJyBhbmQga2VlcCAnIHdvcmxkLidcbiAqL1xudmFyIERJRkZfREVMRVRFID0gLTE7XG52YXIgRElGRl9JTlNFUlQgPSAxO1xudmFyIERJRkZfRVFVQUwgPSAwO1xuXG4vKiogQHR5cGVkZWYge3swOiBudW1iZXIsIDE6IHN0cmluZ319ICovXG5kaWZmX21hdGNoX3BhdGNoLkRpZmY7XG5cblxuLyoqXG4gKiBGaW5kIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHR3byB0ZXh0cy4gIFNpbXBsaWZpZXMgdGhlIHByb2JsZW0gYnkgc3RyaXBwaW5nXG4gKiBhbnkgY29tbW9uIHByZWZpeCBvciBzdWZmaXggb2ZmIHRoZSB0ZXh0cyBiZWZvcmUgZGlmZmluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBPbGQgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBOZXcgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9jaGVja2xpbmVzIE9wdGlvbmFsIHNwZWVkdXAgZmxhZy4gSWYgcHJlc2VudCBhbmQgZmFsc2UsXG4gKiAgICAgdGhlbiBkb24ndCBydW4gYSBsaW5lLWxldmVsIGRpZmYgZmlyc3QgdG8gaWRlbnRpZnkgdGhlIGNoYW5nZWQgYXJlYXMuXG4gKiAgICAgRGVmYXVsdHMgdG8gdHJ1ZSwgd2hpY2ggZG9lcyBhIGZhc3Rlciwgc2xpZ2h0bHkgbGVzcyBvcHRpbWFsIGRpZmYuXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0X2RlYWRsaW5lIE9wdGlvbmFsIHRpbWUgd2hlbiB0aGUgZGlmZiBzaG91bGQgYmUgY29tcGxldGVcbiAqICAgICBieS4gIFVzZWQgaW50ZXJuYWxseSBmb3IgcmVjdXJzaXZlIGNhbGxzLiAgVXNlcnMgc2hvdWxkIHNldCBEaWZmVGltZW91dFxuICogICAgIGluc3RlYWQuXG4gKiBAcmV0dXJuIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl9tYWluID0gZnVuY3Rpb24odGV4dDEsIHRleHQyLCBvcHRfY2hlY2tsaW5lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdF9kZWFkbGluZSkge1xuICAvLyBTZXQgYSBkZWFkbGluZSBieSB3aGljaCB0aW1lIHRoZSBkaWZmIG11c3QgYmUgY29tcGxldGUuXG4gIGlmICh0eXBlb2Ygb3B0X2RlYWRsaW5lID09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHRoaXMuRGlmZl9UaW1lb3V0IDw9IDApIHtcbiAgICAgIG9wdF9kZWFkbGluZSA9IE51bWJlci5NQVhfVkFMVUU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdF9kZWFkbGluZSA9IChuZXcgRGF0ZSkuZ2V0VGltZSgpICsgdGhpcy5EaWZmX1RpbWVvdXQgKiAxMDAwO1xuICAgIH1cbiAgfVxuICB2YXIgZGVhZGxpbmUgPSBvcHRfZGVhZGxpbmU7XG5cbiAgLy8gQ2hlY2sgZm9yIG51bGwgaW5wdXRzLlxuICBpZiAodGV4dDEgPT0gbnVsbCB8fCB0ZXh0MiA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOdWxsIGlucHV0LiAoZGlmZl9tYWluKScpO1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGVxdWFsaXR5IChzcGVlZHVwKS5cbiAgaWYgKHRleHQxID09IHRleHQyKSB7XG4gICAgaWYgKHRleHQxKSB7XG4gICAgICByZXR1cm4gW1tESUZGX0VRVUFMLCB0ZXh0MV1dO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBpZiAodHlwZW9mIG9wdF9jaGVja2xpbmVzID09ICd1bmRlZmluZWQnKSB7XG4gICAgb3B0X2NoZWNrbGluZXMgPSB0cnVlO1xuICB9XG4gIHZhciBjaGVja2xpbmVzID0gb3B0X2NoZWNrbGluZXM7XG5cbiAgLy8gVHJpbSBvZmYgY29tbW9uIHByZWZpeCAoc3BlZWR1cCkuXG4gIHZhciBjb21tb25sZW5ndGggPSB0aGlzLmRpZmZfY29tbW9uUHJlZml4KHRleHQxLCB0ZXh0Mik7XG4gIHZhciBjb21tb25wcmVmaXggPSB0ZXh0MS5zdWJzdHJpbmcoMCwgY29tbW9ubGVuZ3RoKTtcbiAgdGV4dDEgPSB0ZXh0MS5zdWJzdHJpbmcoY29tbW9ubGVuZ3RoKTtcbiAgdGV4dDIgPSB0ZXh0Mi5zdWJzdHJpbmcoY29tbW9ubGVuZ3RoKTtcblxuICAvLyBUcmltIG9mZiBjb21tb24gc3VmZml4IChzcGVlZHVwKS5cbiAgY29tbW9ubGVuZ3RoID0gdGhpcy5kaWZmX2NvbW1vblN1ZmZpeCh0ZXh0MSwgdGV4dDIpO1xuICB2YXIgY29tbW9uc3VmZml4ID0gdGV4dDEuc3Vic3RyaW5nKHRleHQxLmxlbmd0aCAtIGNvbW1vbmxlbmd0aCk7XG4gIHRleHQxID0gdGV4dDEuc3Vic3RyaW5nKDAsIHRleHQxLmxlbmd0aCAtIGNvbW1vbmxlbmd0aCk7XG4gIHRleHQyID0gdGV4dDIuc3Vic3RyaW5nKDAsIHRleHQyLmxlbmd0aCAtIGNvbW1vbmxlbmd0aCk7XG5cbiAgLy8gQ29tcHV0ZSB0aGUgZGlmZiBvbiB0aGUgbWlkZGxlIGJsb2NrLlxuICB2YXIgZGlmZnMgPSB0aGlzLmRpZmZfY29tcHV0ZV8odGV4dDEsIHRleHQyLCBjaGVja2xpbmVzLCBkZWFkbGluZSk7XG5cbiAgLy8gUmVzdG9yZSB0aGUgcHJlZml4IGFuZCBzdWZmaXguXG4gIGlmIChjb21tb25wcmVmaXgpIHtcbiAgICBkaWZmcy51bnNoaWZ0KFtESUZGX0VRVUFMLCBjb21tb25wcmVmaXhdKTtcbiAgfVxuICBpZiAoY29tbW9uc3VmZml4KSB7XG4gICAgZGlmZnMucHVzaChbRElGRl9FUVVBTCwgY29tbW9uc3VmZml4XSk7XG4gIH1cbiAgdGhpcy5kaWZmX2NsZWFudXBNZXJnZShkaWZmcyk7XG4gIHJldHVybiBkaWZmcztcbn07XG5cblxuLyoqXG4gKiBGaW5kIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHR3byB0ZXh0cy4gIEFzc3VtZXMgdGhhdCB0aGUgdGV4dHMgZG8gbm90XG4gKiBoYXZlIGFueSBjb21tb24gcHJlZml4IG9yIHN1ZmZpeC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBPbGQgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBOZXcgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gY2hlY2tsaW5lcyBTcGVlZHVwIGZsYWcuICBJZiBmYWxzZSwgdGhlbiBkb24ndCBydW4gYVxuICogICAgIGxpbmUtbGV2ZWwgZGlmZiBmaXJzdCB0byBpZGVudGlmeSB0aGUgY2hhbmdlZCBhcmVhcy5cbiAqICAgICBJZiB0cnVlLCB0aGVuIHJ1biBhIGZhc3Rlciwgc2xpZ2h0bHkgbGVzcyBvcHRpbWFsIGRpZmYuXG4gKiBAcGFyYW0ge251bWJlcn0gZGVhZGxpbmUgVGltZSB3aGVuIHRoZSBkaWZmIHNob3VsZCBiZSBjb21wbGV0ZSBieS5cbiAqIEByZXR1cm4geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59IEFycmF5IG9mIGRpZmYgdHVwbGVzLlxuICogQHByaXZhdGVcbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl9jb21wdXRlXyA9IGZ1bmN0aW9uKHRleHQxLCB0ZXh0MiwgY2hlY2tsaW5lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWFkbGluZSkge1xuICB2YXIgZGlmZnM7XG5cbiAgaWYgKCF0ZXh0MSkge1xuICAgIC8vIEp1c3QgYWRkIHNvbWUgdGV4dCAoc3BlZWR1cCkuXG4gICAgcmV0dXJuIFtbRElGRl9JTlNFUlQsIHRleHQyXV07XG4gIH1cblxuICBpZiAoIXRleHQyKSB7XG4gICAgLy8gSnVzdCBkZWxldGUgc29tZSB0ZXh0IChzcGVlZHVwKS5cbiAgICByZXR1cm4gW1tESUZGX0RFTEVURSwgdGV4dDFdXTtcbiAgfVxuXG4gIHZhciBsb25ndGV4dCA9IHRleHQxLmxlbmd0aCA+IHRleHQyLmxlbmd0aCA/IHRleHQxIDogdGV4dDI7XG4gIHZhciBzaG9ydHRleHQgPSB0ZXh0MS5sZW5ndGggPiB0ZXh0Mi5sZW5ndGggPyB0ZXh0MiA6IHRleHQxO1xuICB2YXIgaSA9IGxvbmd0ZXh0LmluZGV4T2Yoc2hvcnR0ZXh0KTtcbiAgaWYgKGkgIT0gLTEpIHtcbiAgICAvLyBTaG9ydGVyIHRleHQgaXMgaW5zaWRlIHRoZSBsb25nZXIgdGV4dCAoc3BlZWR1cCkuXG4gICAgZGlmZnMgPSBbW0RJRkZfSU5TRVJULCBsb25ndGV4dC5zdWJzdHJpbmcoMCwgaSldLFxuICAgICAgW0RJRkZfRVFVQUwsIHNob3J0dGV4dF0sXG4gICAgICBbRElGRl9JTlNFUlQsIGxvbmd0ZXh0LnN1YnN0cmluZyhpICsgc2hvcnR0ZXh0Lmxlbmd0aCldXTtcbiAgICAvLyBTd2FwIGluc2VydGlvbnMgZm9yIGRlbGV0aW9ucyBpZiBkaWZmIGlzIHJldmVyc2VkLlxuICAgIGlmICh0ZXh0MS5sZW5ndGggPiB0ZXh0Mi5sZW5ndGgpIHtcbiAgICAgIGRpZmZzWzBdWzBdID0gZGlmZnNbMl1bMF0gPSBESUZGX0RFTEVURTtcbiAgICB9XG4gICAgcmV0dXJuIGRpZmZzO1xuICB9XG5cbiAgaWYgKHNob3J0dGV4dC5sZW5ndGggPT0gMSkge1xuICAgIC8vIFNpbmdsZSBjaGFyYWN0ZXIgc3RyaW5nLlxuICAgIC8vIEFmdGVyIHRoZSBwcmV2aW91cyBzcGVlZHVwLCB0aGUgY2hhcmFjdGVyIGNhbid0IGJlIGFuIGVxdWFsaXR5LlxuICAgIHJldHVybiBbW0RJRkZfREVMRVRFLCB0ZXh0MV0sIFtESUZGX0lOU0VSVCwgdGV4dDJdXTtcbiAgfVxuXG4gIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgcHJvYmxlbSBjYW4gYmUgc3BsaXQgaW4gdHdvLlxuICB2YXIgaG0gPSB0aGlzLmRpZmZfaGFsZk1hdGNoXyh0ZXh0MSwgdGV4dDIpO1xuICBpZiAoaG0pIHtcbiAgICAvLyBBIGhhbGYtbWF0Y2ggd2FzIGZvdW5kLCBzb3J0IG91dCB0aGUgcmV0dXJuIGRhdGEuXG4gICAgdmFyIHRleHQxX2EgPSBobVswXTtcbiAgICB2YXIgdGV4dDFfYiA9IGhtWzFdO1xuICAgIHZhciB0ZXh0Ml9hID0gaG1bMl07XG4gICAgdmFyIHRleHQyX2IgPSBobVszXTtcbiAgICB2YXIgbWlkX2NvbW1vbiA9IGhtWzRdO1xuICAgIC8vIFNlbmQgYm90aCBwYWlycyBvZmYgZm9yIHNlcGFyYXRlIHByb2Nlc3NpbmcuXG4gICAgdmFyIGRpZmZzX2EgPSB0aGlzLmRpZmZfbWFpbih0ZXh0MV9hLCB0ZXh0Ml9hLCBjaGVja2xpbmVzLCBkZWFkbGluZSk7XG4gICAgdmFyIGRpZmZzX2IgPSB0aGlzLmRpZmZfbWFpbih0ZXh0MV9iLCB0ZXh0Ml9iLCBjaGVja2xpbmVzLCBkZWFkbGluZSk7XG4gICAgLy8gTWVyZ2UgdGhlIHJlc3VsdHMuXG4gICAgcmV0dXJuIGRpZmZzX2EuY29uY2F0KFtbRElGRl9FUVVBTCwgbWlkX2NvbW1vbl1dLCBkaWZmc19iKTtcbiAgfVxuXG4gIGlmIChjaGVja2xpbmVzICYmIHRleHQxLmxlbmd0aCA+IDEwMCAmJiB0ZXh0Mi5sZW5ndGggPiAxMDApIHtcbiAgICByZXR1cm4gdGhpcy5kaWZmX2xpbmVNb2RlXyh0ZXh0MSwgdGV4dDIsIGRlYWRsaW5lKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmRpZmZfYmlzZWN0Xyh0ZXh0MSwgdGV4dDIsIGRlYWRsaW5lKTtcbn07XG5cblxuLyoqXG4gKiBEbyBhIHF1aWNrIGxpbmUtbGV2ZWwgZGlmZiBvbiBib3RoIHN0cmluZ3MsIHRoZW4gcmVkaWZmIHRoZSBwYXJ0cyBmb3JcbiAqIGdyZWF0ZXIgYWNjdXJhY3kuXG4gKiBUaGlzIHNwZWVkdXAgY2FuIHByb2R1Y2Ugbm9uLW1pbmltYWwgZGlmZnMuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDEgT2xkIHN0cmluZyB0byBiZSBkaWZmZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDIgTmV3IHN0cmluZyB0byBiZSBkaWZmZWQuXG4gKiBAcGFyYW0ge251bWJlcn0gZGVhZGxpbmUgVGltZSB3aGVuIHRoZSBkaWZmIHNob3VsZCBiZSBjb21wbGV0ZSBieS5cbiAqIEByZXR1cm4geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59IEFycmF5IG9mIGRpZmYgdHVwbGVzLlxuICogQHByaXZhdGVcbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl9saW5lTW9kZV8gPSBmdW5jdGlvbih0ZXh0MSwgdGV4dDIsIGRlYWRsaW5lKSB7XG4gIC8vIFNjYW4gdGhlIHRleHQgb24gYSBsaW5lLWJ5LWxpbmUgYmFzaXMgZmlyc3QuXG4gIHZhciBhID0gdGhpcy5kaWZmX2xpbmVzVG9DaGFyc18odGV4dDEsIHRleHQyKTtcbiAgdGV4dDEgPSBhLmNoYXJzMTtcbiAgdGV4dDIgPSBhLmNoYXJzMjtcbiAgdmFyIGxpbmVhcnJheSA9IGEubGluZUFycmF5O1xuXG4gIHZhciBkaWZmcyA9IHRoaXMuZGlmZl9tYWluKHRleHQxLCB0ZXh0MiwgZmFsc2UsIGRlYWRsaW5lKTtcblxuICAvLyBDb252ZXJ0IHRoZSBkaWZmIGJhY2sgdG8gb3JpZ2luYWwgdGV4dC5cbiAgdGhpcy5kaWZmX2NoYXJzVG9MaW5lc18oZGlmZnMsIGxpbmVhcnJheSk7XG4gIC8vIEVsaW1pbmF0ZSBmcmVhayBtYXRjaGVzIChlLmcuIGJsYW5rIGxpbmVzKVxuICB0aGlzLmRpZmZfY2xlYW51cFNlbWFudGljKGRpZmZzKTtcblxuICAvLyBSZWRpZmYgYW55IHJlcGxhY2VtZW50IGJsb2NrcywgdGhpcyB0aW1lIGNoYXJhY3Rlci1ieS1jaGFyYWN0ZXIuXG4gIC8vIEFkZCBhIGR1bW15IGVudHJ5IGF0IHRoZSBlbmQuXG4gIGRpZmZzLnB1c2goW0RJRkZfRVFVQUwsICcnXSk7XG4gIHZhciBwb2ludGVyID0gMDtcbiAgdmFyIGNvdW50X2RlbGV0ZSA9IDA7XG4gIHZhciBjb3VudF9pbnNlcnQgPSAwO1xuICB2YXIgdGV4dF9kZWxldGUgPSAnJztcbiAgdmFyIHRleHRfaW5zZXJ0ID0gJyc7XG4gIHdoaWxlIChwb2ludGVyIDwgZGlmZnMubGVuZ3RoKSB7XG4gICAgc3dpdGNoIChkaWZmc1twb2ludGVyXVswXSkge1xuICAgICAgY2FzZSBESUZGX0lOU0VSVDpcbiAgICAgICAgY291bnRfaW5zZXJ0Kys7XG4gICAgICAgIHRleHRfaW5zZXJ0ICs9IGRpZmZzW3BvaW50ZXJdWzFdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRElGRl9ERUxFVEU6XG4gICAgICAgIGNvdW50X2RlbGV0ZSsrO1xuICAgICAgICB0ZXh0X2RlbGV0ZSArPSBkaWZmc1twb2ludGVyXVsxXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERJRkZfRVFVQUw6XG4gICAgICAgIC8vIFVwb24gcmVhY2hpbmcgYW4gZXF1YWxpdHksIGNoZWNrIGZvciBwcmlvciByZWR1bmRhbmNpZXMuXG4gICAgICAgIGlmIChjb3VudF9kZWxldGUgPj0gMSAmJiBjb3VudF9pbnNlcnQgPj0gMSkge1xuICAgICAgICAgIC8vIERlbGV0ZSB0aGUgb2ZmZW5kaW5nIHJlY29yZHMgYW5kIGFkZCB0aGUgbWVyZ2VkIG9uZXMuXG4gICAgICAgICAgZGlmZnMuc3BsaWNlKHBvaW50ZXIgLSBjb3VudF9kZWxldGUgLSBjb3VudF9pbnNlcnQsXG4gICAgICAgICAgICBjb3VudF9kZWxldGUgKyBjb3VudF9pbnNlcnQpO1xuICAgICAgICAgIHBvaW50ZXIgPSBwb2ludGVyIC0gY291bnRfZGVsZXRlIC0gY291bnRfaW5zZXJ0O1xuICAgICAgICAgIHZhciBhID0gdGhpcy5kaWZmX21haW4odGV4dF9kZWxldGUsIHRleHRfaW5zZXJ0LCBmYWxzZSwgZGVhZGxpbmUpO1xuICAgICAgICAgIGZvciAodmFyIGogPSBhLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XG4gICAgICAgICAgICBkaWZmcy5zcGxpY2UocG9pbnRlciwgMCwgYVtqXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBvaW50ZXIgPSBwb2ludGVyICsgYS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgY291bnRfaW5zZXJ0ID0gMDtcbiAgICAgICAgY291bnRfZGVsZXRlID0gMDtcbiAgICAgICAgdGV4dF9kZWxldGUgPSAnJztcbiAgICAgICAgdGV4dF9pbnNlcnQgPSAnJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHBvaW50ZXIrKztcbiAgfVxuICBkaWZmcy5wb3AoKTsgIC8vIFJlbW92ZSB0aGUgZHVtbXkgZW50cnkgYXQgdGhlIGVuZC5cblxuICByZXR1cm4gZGlmZnM7XG59O1xuXG5cbi8qKlxuICogRmluZCB0aGUgJ21pZGRsZSBzbmFrZScgb2YgYSBkaWZmLCBzcGxpdCB0aGUgcHJvYmxlbSBpbiB0d29cbiAqIGFuZCByZXR1cm4gdGhlIHJlY3Vyc2l2ZWx5IGNvbnN0cnVjdGVkIGRpZmYuXG4gKiBTZWUgTXllcnMgMTk4NiBwYXBlcjogQW4gTyhORCkgRGlmZmVyZW5jZSBBbGdvcml0aG0gYW5kIEl0cyBWYXJpYXRpb25zLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQxIE9sZCBzdHJpbmcgdG8gYmUgZGlmZmVkLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQyIE5ldyBzdHJpbmcgdG8gYmUgZGlmZmVkLlxuICogQHBhcmFtIHtudW1iZXJ9IGRlYWRsaW5lIFRpbWUgYXQgd2hpY2ggdG8gYmFpbCBpZiBub3QgeWV0IGNvbXBsZXRlLlxuICogQHJldHVybiB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKiBAcHJpdmF0ZVxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX2Jpc2VjdF8gPSBmdW5jdGlvbih0ZXh0MSwgdGV4dDIsIGRlYWRsaW5lKSB7XG4gIC8vIENhY2hlIHRoZSB0ZXh0IGxlbmd0aHMgdG8gcHJldmVudCBtdWx0aXBsZSBjYWxscy5cbiAgdmFyIHRleHQxX2xlbmd0aCA9IHRleHQxLmxlbmd0aDtcbiAgdmFyIHRleHQyX2xlbmd0aCA9IHRleHQyLmxlbmd0aDtcbiAgdmFyIG1heF9kID0gTWF0aC5jZWlsKCh0ZXh0MV9sZW5ndGggKyB0ZXh0Ml9sZW5ndGgpIC8gMik7XG4gIHZhciB2X29mZnNldCA9IG1heF9kO1xuICB2YXIgdl9sZW5ndGggPSAyICogbWF4X2Q7XG4gIHZhciB2MSA9IG5ldyBBcnJheSh2X2xlbmd0aCk7XG4gIHZhciB2MiA9IG5ldyBBcnJheSh2X2xlbmd0aCk7XG4gIC8vIFNldHRpbmcgYWxsIGVsZW1lbnRzIHRvIC0xIGlzIGZhc3RlciBpbiBDaHJvbWUgJiBGaXJlZm94IHRoYW4gbWl4aW5nXG4gIC8vIGludGVnZXJzIGFuZCB1bmRlZmluZWQuXG4gIGZvciAodmFyIHggPSAwOyB4IDwgdl9sZW5ndGg7IHgrKykge1xuICAgIHYxW3hdID0gLTE7XG4gICAgdjJbeF0gPSAtMTtcbiAgfVxuICB2MVt2X29mZnNldCArIDFdID0gMDtcbiAgdjJbdl9vZmZzZXQgKyAxXSA9IDA7XG4gIHZhciBkZWx0YSA9IHRleHQxX2xlbmd0aCAtIHRleHQyX2xlbmd0aDtcbiAgLy8gSWYgdGhlIHRvdGFsIG51bWJlciBvZiBjaGFyYWN0ZXJzIGlzIG9kZCwgdGhlbiB0aGUgZnJvbnQgcGF0aCB3aWxsIGNvbGxpZGVcbiAgLy8gd2l0aCB0aGUgcmV2ZXJzZSBwYXRoLlxuICB2YXIgZnJvbnQgPSAoZGVsdGEgJSAyICE9IDApO1xuICAvLyBPZmZzZXRzIGZvciBzdGFydCBhbmQgZW5kIG9mIGsgbG9vcC5cbiAgLy8gUHJldmVudHMgbWFwcGluZyBvZiBzcGFjZSBiZXlvbmQgdGhlIGdyaWQuXG4gIHZhciBrMXN0YXJ0ID0gMDtcbiAgdmFyIGsxZW5kID0gMDtcbiAgdmFyIGsyc3RhcnQgPSAwO1xuICB2YXIgazJlbmQgPSAwO1xuICBmb3IgKHZhciBkID0gMDsgZCA8IG1heF9kOyBkKyspIHtcbiAgICAvLyBCYWlsIG91dCBpZiBkZWFkbGluZSBpcyByZWFjaGVkLlxuICAgIGlmICgobmV3IERhdGUoKSkuZ2V0VGltZSgpID4gZGVhZGxpbmUpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIFdhbGsgdGhlIGZyb250IHBhdGggb25lIHN0ZXAuXG4gICAgZm9yICh2YXIgazEgPSAtZCArIGsxc3RhcnQ7IGsxIDw9IGQgLSBrMWVuZDsgazEgKz0gMikge1xuICAgICAgdmFyIGsxX29mZnNldCA9IHZfb2Zmc2V0ICsgazE7XG4gICAgICB2YXIgeDE7XG4gICAgICBpZiAoazEgPT0gLWQgfHwgKGsxICE9IGQgJiYgdjFbazFfb2Zmc2V0IC0gMV0gPCB2MVtrMV9vZmZzZXQgKyAxXSkpIHtcbiAgICAgICAgeDEgPSB2MVtrMV9vZmZzZXQgKyAxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHgxID0gdjFbazFfb2Zmc2V0IC0gMV0gKyAxO1xuICAgICAgfVxuICAgICAgdmFyIHkxID0geDEgLSBrMTtcbiAgICAgIHdoaWxlICh4MSA8IHRleHQxX2xlbmd0aCAmJiB5MSA8IHRleHQyX2xlbmd0aCAmJlxuICAgICAgICAgICAgIHRleHQxLmNoYXJBdCh4MSkgPT0gdGV4dDIuY2hhckF0KHkxKSkge1xuICAgICAgICB4MSsrO1xuICAgICAgICB5MSsrO1xuICAgICAgfVxuICAgICAgdjFbazFfb2Zmc2V0XSA9IHgxO1xuICAgICAgaWYgKHgxID4gdGV4dDFfbGVuZ3RoKSB7XG4gICAgICAgIC8vIFJhbiBvZmYgdGhlIHJpZ2h0IG9mIHRoZSBncmFwaC5cbiAgICAgICAgazFlbmQgKz0gMjtcbiAgICAgIH0gZWxzZSBpZiAoeTEgPiB0ZXh0Ml9sZW5ndGgpIHtcbiAgICAgICAgLy8gUmFuIG9mZiB0aGUgYm90dG9tIG9mIHRoZSBncmFwaC5cbiAgICAgICAgazFzdGFydCArPSAyO1xuICAgICAgfSBlbHNlIGlmIChmcm9udCkge1xuICAgICAgICB2YXIgazJfb2Zmc2V0ID0gdl9vZmZzZXQgKyBkZWx0YSAtIGsxO1xuICAgICAgICBpZiAoazJfb2Zmc2V0ID49IDAgJiYgazJfb2Zmc2V0IDwgdl9sZW5ndGggJiYgdjJbazJfb2Zmc2V0XSAhPSAtMSkge1xuICAgICAgICAgIC8vIE1pcnJvciB4MiBvbnRvIHRvcC1sZWZ0IGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgICAgICAgIHZhciB4MiA9IHRleHQxX2xlbmd0aCAtIHYyW2syX29mZnNldF07XG4gICAgICAgICAgaWYgKHgxID49IHgyKSB7XG4gICAgICAgICAgICAvLyBPdmVybGFwIGRldGVjdGVkLlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGlmZl9iaXNlY3RTcGxpdF8odGV4dDEsIHRleHQyLCB4MSwgeTEsIGRlYWRsaW5lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXYWxrIHRoZSByZXZlcnNlIHBhdGggb25lIHN0ZXAuXG4gICAgZm9yICh2YXIgazIgPSAtZCArIGsyc3RhcnQ7IGsyIDw9IGQgLSBrMmVuZDsgazIgKz0gMikge1xuICAgICAgdmFyIGsyX29mZnNldCA9IHZfb2Zmc2V0ICsgazI7XG4gICAgICB2YXIgeDI7XG4gICAgICBpZiAoazIgPT0gLWQgfHwgKGsyICE9IGQgJiYgdjJbazJfb2Zmc2V0IC0gMV0gPCB2MltrMl9vZmZzZXQgKyAxXSkpIHtcbiAgICAgICAgeDIgPSB2MltrMl9vZmZzZXQgKyAxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHgyID0gdjJbazJfb2Zmc2V0IC0gMV0gKyAxO1xuICAgICAgfVxuICAgICAgdmFyIHkyID0geDIgLSBrMjtcbiAgICAgIHdoaWxlICh4MiA8IHRleHQxX2xlbmd0aCAmJiB5MiA8IHRleHQyX2xlbmd0aCAmJlxuICAgICAgICAgICAgIHRleHQxLmNoYXJBdCh0ZXh0MV9sZW5ndGggLSB4MiAtIDEpID09XG4gICAgICAgICAgICAgdGV4dDIuY2hhckF0KHRleHQyX2xlbmd0aCAtIHkyIC0gMSkpIHtcbiAgICAgICAgeDIrKztcbiAgICAgICAgeTIrKztcbiAgICAgIH1cbiAgICAgIHYyW2syX29mZnNldF0gPSB4MjtcbiAgICAgIGlmICh4MiA+IHRleHQxX2xlbmd0aCkge1xuICAgICAgICAvLyBSYW4gb2ZmIHRoZSBsZWZ0IG9mIHRoZSBncmFwaC5cbiAgICAgICAgazJlbmQgKz0gMjtcbiAgICAgIH0gZWxzZSBpZiAoeTIgPiB0ZXh0Ml9sZW5ndGgpIHtcbiAgICAgICAgLy8gUmFuIG9mZiB0aGUgdG9wIG9mIHRoZSBncmFwaC5cbiAgICAgICAgazJzdGFydCArPSAyO1xuICAgICAgfSBlbHNlIGlmICghZnJvbnQpIHtcbiAgICAgICAgdmFyIGsxX29mZnNldCA9IHZfb2Zmc2V0ICsgZGVsdGEgLSBrMjtcbiAgICAgICAgaWYgKGsxX29mZnNldCA+PSAwICYmIGsxX29mZnNldCA8IHZfbGVuZ3RoICYmIHYxW2sxX29mZnNldF0gIT0gLTEpIHtcbiAgICAgICAgICB2YXIgeDEgPSB2MVtrMV9vZmZzZXRdO1xuICAgICAgICAgIHZhciB5MSA9IHZfb2Zmc2V0ICsgeDEgLSBrMV9vZmZzZXQ7XG4gICAgICAgICAgLy8gTWlycm9yIHgyIG9udG8gdG9wLWxlZnQgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgICAgICAgeDIgPSB0ZXh0MV9sZW5ndGggLSB4MjtcbiAgICAgICAgICBpZiAoeDEgPj0geDIpIHtcbiAgICAgICAgICAgIC8vIE92ZXJsYXAgZGV0ZWN0ZWQuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaWZmX2Jpc2VjdFNwbGl0Xyh0ZXh0MSwgdGV4dDIsIHgxLCB5MSwgZGVhZGxpbmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBEaWZmIHRvb2sgdG9vIGxvbmcgYW5kIGhpdCB0aGUgZGVhZGxpbmUgb3JcbiAgLy8gbnVtYmVyIG9mIGRpZmZzIGVxdWFscyBudW1iZXIgb2YgY2hhcmFjdGVycywgbm8gY29tbW9uYWxpdHkgYXQgYWxsLlxuICByZXR1cm4gW1tESUZGX0RFTEVURSwgdGV4dDFdLCBbRElGRl9JTlNFUlQsIHRleHQyXV07XG59O1xuXG5cbi8qKlxuICogR2l2ZW4gdGhlIGxvY2F0aW9uIG9mIHRoZSAnbWlkZGxlIHNuYWtlJywgc3BsaXQgdGhlIGRpZmYgaW4gdHdvIHBhcnRzXG4gKiBhbmQgcmVjdXJzZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBPbGQgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBOZXcgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSB4IEluZGV4IG9mIHNwbGl0IHBvaW50IGluIHRleHQxLlxuICogQHBhcmFtIHtudW1iZXJ9IHkgSW5kZXggb2Ygc3BsaXQgcG9pbnQgaW4gdGV4dDIuXG4gKiBAcGFyYW0ge251bWJlcn0gZGVhZGxpbmUgVGltZSBhdCB3aGljaCB0byBiYWlsIGlmIG5vdCB5ZXQgY29tcGxldGUuXG4gKiBAcmV0dXJuIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqIEBwcml2YXRlXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfYmlzZWN0U3BsaXRfID0gZnVuY3Rpb24odGV4dDEsIHRleHQyLCB4LCB5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWFkbGluZSkge1xuICB2YXIgdGV4dDFhID0gdGV4dDEuc3Vic3RyaW5nKDAsIHgpO1xuICB2YXIgdGV4dDJhID0gdGV4dDIuc3Vic3RyaW5nKDAsIHkpO1xuICB2YXIgdGV4dDFiID0gdGV4dDEuc3Vic3RyaW5nKHgpO1xuICB2YXIgdGV4dDJiID0gdGV4dDIuc3Vic3RyaW5nKHkpO1xuXG4gIC8vIENvbXB1dGUgYm90aCBkaWZmcyBzZXJpYWxseS5cbiAgdmFyIGRpZmZzID0gdGhpcy5kaWZmX21haW4odGV4dDFhLCB0ZXh0MmEsIGZhbHNlLCBkZWFkbGluZSk7XG4gIHZhciBkaWZmc2IgPSB0aGlzLmRpZmZfbWFpbih0ZXh0MWIsIHRleHQyYiwgZmFsc2UsIGRlYWRsaW5lKTtcblxuICByZXR1cm4gZGlmZnMuY29uY2F0KGRpZmZzYik7XG59O1xuXG5cbi8qKlxuICogU3BsaXQgdHdvIHRleHRzIGludG8gYW4gYXJyYXkgb2Ygc3RyaW5ncy4gIFJlZHVjZSB0aGUgdGV4dHMgdG8gYSBzdHJpbmcgb2ZcbiAqIGhhc2hlcyB3aGVyZSBlYWNoIFVuaWNvZGUgY2hhcmFjdGVyIHJlcHJlc2VudHMgb25lIGxpbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDEgRmlyc3Qgc3RyaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQyIFNlY29uZCBzdHJpbmcuXG4gKiBAcmV0dXJuIHt7Y2hhcnMxOiBzdHJpbmcsIGNoYXJzMjogc3RyaW5nLCBsaW5lQXJyYXk6ICFBcnJheS48c3RyaW5nPn19XG4gKiAgICAgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVuY29kZWQgdGV4dDEsIHRoZSBlbmNvZGVkIHRleHQyIGFuZFxuICogICAgIHRoZSBhcnJheSBvZiB1bmlxdWUgc3RyaW5ncy5cbiAqICAgICBUaGUgemVyb3RoIGVsZW1lbnQgb2YgdGhlIGFycmF5IG9mIHVuaXF1ZSBzdHJpbmdzIGlzIGludGVudGlvbmFsbHkgYmxhbmsuXG4gKiBAcHJpdmF0ZVxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX2xpbmVzVG9DaGFyc18gPSBmdW5jdGlvbih0ZXh0MSwgdGV4dDIpIHtcbiAgdmFyIGxpbmVBcnJheSA9IFtdOyAgLy8gZS5nLiBsaW5lQXJyYXlbNF0gPT0gJ0hlbGxvXFxuJ1xuICB2YXIgbGluZUhhc2ggPSB7fTsgICAvLyBlLmcuIGxpbmVIYXNoWydIZWxsb1xcbiddID09IDRcblxuICAvLyAnXFx4MDAnIGlzIGEgdmFsaWQgY2hhcmFjdGVyLCBidXQgdmFyaW91cyBkZWJ1Z2dlcnMgZG9uJ3QgbGlrZSBpdC5cbiAgLy8gU28gd2UnbGwgaW5zZXJ0IGEganVuayBlbnRyeSB0byBhdm9pZCBnZW5lcmF0aW5nIGEgbnVsbCBjaGFyYWN0ZXIuXG4gIGxpbmVBcnJheVswXSA9ICcnO1xuXG4gIC8qKlxuICAgKiBTcGxpdCBhIHRleHQgaW50byBhbiBhcnJheSBvZiBzdHJpbmdzLiAgUmVkdWNlIHRoZSB0ZXh0cyB0byBhIHN0cmluZyBvZlxuICAgKiBoYXNoZXMgd2hlcmUgZWFjaCBVbmljb2RlIGNoYXJhY3RlciByZXByZXNlbnRzIG9uZSBsaW5lLlxuICAgKiBNb2RpZmllcyBsaW5lYXJyYXkgYW5kIGxpbmVoYXNoIHRocm91Z2ggYmVpbmcgYSBjbG9zdXJlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBTdHJpbmcgdG8gZW5jb2RlLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IEVuY29kZWQgc3RyaW5nLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gZGlmZl9saW5lc1RvQ2hhcnNNdW5nZV8odGV4dCkge1xuICAgIHZhciBjaGFycyA9ICcnO1xuICAgIC8vIFdhbGsgdGhlIHRleHQsIHB1bGxpbmcgb3V0IGEgc3Vic3RyaW5nIGZvciBlYWNoIGxpbmUuXG4gICAgLy8gdGV4dC5zcGxpdCgnXFxuJykgd291bGQgd291bGQgdGVtcG9yYXJpbHkgZG91YmxlIG91ciBtZW1vcnkgZm9vdHByaW50LlxuICAgIC8vIE1vZGlmeWluZyB0ZXh0IHdvdWxkIGNyZWF0ZSBtYW55IGxhcmdlIHN0cmluZ3MgdG8gZ2FyYmFnZSBjb2xsZWN0LlxuICAgIHZhciBsaW5lU3RhcnQgPSAwO1xuICAgIHZhciBsaW5lRW5kID0gLTE7XG4gICAgLy8gS2VlcGluZyBvdXIgb3duIGxlbmd0aCB2YXJpYWJsZSBpcyBmYXN0ZXIgdGhhbiBsb29raW5nIGl0IHVwLlxuICAgIHZhciBsaW5lQXJyYXlMZW5ndGggPSBsaW5lQXJyYXkubGVuZ3RoO1xuICAgIHdoaWxlIChsaW5lRW5kIDwgdGV4dC5sZW5ndGggLSAxKSB7XG4gICAgICBsaW5lRW5kID0gdGV4dC5pbmRleE9mKCdcXG4nLCBsaW5lU3RhcnQpO1xuICAgICAgaWYgKGxpbmVFbmQgPT0gLTEpIHtcbiAgICAgICAgbGluZUVuZCA9IHRleHQubGVuZ3RoIC0gMTtcbiAgICAgIH1cbiAgICAgIHZhciBsaW5lID0gdGV4dC5zdWJzdHJpbmcobGluZVN0YXJ0LCBsaW5lRW5kICsgMSk7XG4gICAgICBsaW5lU3RhcnQgPSBsaW5lRW5kICsgMTtcblxuICAgICAgaWYgKGxpbmVIYXNoLmhhc093blByb3BlcnR5ID8gbGluZUhhc2guaGFzT3duUHJvcGVydHkobGluZSkgOlxuICAgICAgICAgIChsaW5lSGFzaFtsaW5lXSAhPT0gdW5kZWZpbmVkKSkge1xuICAgICAgICBjaGFycyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGxpbmVIYXNoW2xpbmVdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoYXJzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUobGluZUFycmF5TGVuZ3RoKTtcbiAgICAgICAgbGluZUhhc2hbbGluZV0gPSBsaW5lQXJyYXlMZW5ndGg7XG4gICAgICAgIGxpbmVBcnJheVtsaW5lQXJyYXlMZW5ndGgrK10gPSBsaW5lO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hhcnM7XG4gIH1cblxuICB2YXIgY2hhcnMxID0gZGlmZl9saW5lc1RvQ2hhcnNNdW5nZV8odGV4dDEpO1xuICB2YXIgY2hhcnMyID0gZGlmZl9saW5lc1RvQ2hhcnNNdW5nZV8odGV4dDIpO1xuICByZXR1cm4ge2NoYXJzMTogY2hhcnMxLCBjaGFyczI6IGNoYXJzMiwgbGluZUFycmF5OiBsaW5lQXJyYXl9O1xufTtcblxuXG4vKipcbiAqIFJlaHlkcmF0ZSB0aGUgdGV4dCBpbiBhIGRpZmYgZnJvbSBhIHN0cmluZyBvZiBsaW5lIGhhc2hlcyB0byByZWFsIGxpbmVzIG9mXG4gKiB0ZXh0LlxuICogQHBhcmFtIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSBkaWZmcyBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqIEBwYXJhbSB7IUFycmF5LjxzdHJpbmc+fSBsaW5lQXJyYXkgQXJyYXkgb2YgdW5pcXVlIHN0cmluZ3MuXG4gKiBAcHJpdmF0ZVxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX2NoYXJzVG9MaW5lc18gPSBmdW5jdGlvbihkaWZmcywgbGluZUFycmF5KSB7XG4gIGZvciAodmFyIHggPSAwOyB4IDwgZGlmZnMubGVuZ3RoOyB4KyspIHtcbiAgICB2YXIgY2hhcnMgPSBkaWZmc1t4XVsxXTtcbiAgICB2YXIgdGV4dCA9IFtdO1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgY2hhcnMubGVuZ3RoOyB5KyspIHtcbiAgICAgIHRleHRbeV0gPSBsaW5lQXJyYXlbY2hhcnMuY2hhckNvZGVBdCh5KV07XG4gICAgfVxuICAgIGRpZmZzW3hdWzFdID0gdGV4dC5qb2luKCcnKTtcbiAgfVxufTtcblxuXG4vKipcbiAqIERldGVybWluZSB0aGUgY29tbW9uIHByZWZpeCBvZiB0d28gc3RyaW5ncy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBGaXJzdCBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDIgU2Vjb25kIHN0cmluZy5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGNvbW1vbiB0byB0aGUgc3RhcnQgb2YgZWFjaFxuICogICAgIHN0cmluZy5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl9jb21tb25QcmVmaXggPSBmdW5jdGlvbih0ZXh0MSwgdGV4dDIpIHtcbiAgLy8gUXVpY2sgY2hlY2sgZm9yIGNvbW1vbiBudWxsIGNhc2VzLlxuICBpZiAoIXRleHQxIHx8ICF0ZXh0MiB8fCB0ZXh0MS5jaGFyQXQoMCkgIT0gdGV4dDIuY2hhckF0KDApKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgLy8gQmluYXJ5IHNlYXJjaC5cbiAgLy8gUGVyZm9ybWFuY2UgYW5hbHlzaXM6IGh0dHA6Ly9uZWlsLmZyYXNlci5uYW1lL25ld3MvMjAwNy8xMC8wOS9cbiAgdmFyIHBvaW50ZXJtaW4gPSAwO1xuICB2YXIgcG9pbnRlcm1heCA9IE1hdGgubWluKHRleHQxLmxlbmd0aCwgdGV4dDIubGVuZ3RoKTtcbiAgdmFyIHBvaW50ZXJtaWQgPSBwb2ludGVybWF4O1xuICB2YXIgcG9pbnRlcnN0YXJ0ID0gMDtcbiAgd2hpbGUgKHBvaW50ZXJtaW4gPCBwb2ludGVybWlkKSB7XG4gICAgaWYgKHRleHQxLnN1YnN0cmluZyhwb2ludGVyc3RhcnQsIHBvaW50ZXJtaWQpID09XG4gICAgICAgIHRleHQyLnN1YnN0cmluZyhwb2ludGVyc3RhcnQsIHBvaW50ZXJtaWQpKSB7XG4gICAgICBwb2ludGVybWluID0gcG9pbnRlcm1pZDtcbiAgICAgIHBvaW50ZXJzdGFydCA9IHBvaW50ZXJtaW47XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvaW50ZXJtYXggPSBwb2ludGVybWlkO1xuICAgIH1cbiAgICBwb2ludGVybWlkID0gTWF0aC5mbG9vcigocG9pbnRlcm1heCAtIHBvaW50ZXJtaW4pIC8gMiArIHBvaW50ZXJtaW4pO1xuICB9XG4gIHJldHVybiBwb2ludGVybWlkO1xufTtcblxuXG4vKipcbiAqIERldGVybWluZSB0aGUgY29tbW9uIHN1ZmZpeCBvZiB0d28gc3RyaW5ncy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBGaXJzdCBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDIgU2Vjb25kIHN0cmluZy5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGNvbW1vbiB0byB0aGUgZW5kIG9mIGVhY2ggc3RyaW5nLlxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX2NvbW1vblN1ZmZpeCA9IGZ1bmN0aW9uKHRleHQxLCB0ZXh0Mikge1xuICAvLyBRdWljayBjaGVjayBmb3IgY29tbW9uIG51bGwgY2FzZXMuXG4gIGlmICghdGV4dDEgfHwgIXRleHQyIHx8XG4gICAgICB0ZXh0MS5jaGFyQXQodGV4dDEubGVuZ3RoIC0gMSkgIT0gdGV4dDIuY2hhckF0KHRleHQyLmxlbmd0aCAtIDEpKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgLy8gQmluYXJ5IHNlYXJjaC5cbiAgLy8gUGVyZm9ybWFuY2UgYW5hbHlzaXM6IGh0dHA6Ly9uZWlsLmZyYXNlci5uYW1lL25ld3MvMjAwNy8xMC8wOS9cbiAgdmFyIHBvaW50ZXJtaW4gPSAwO1xuICB2YXIgcG9pbnRlcm1heCA9IE1hdGgubWluKHRleHQxLmxlbmd0aCwgdGV4dDIubGVuZ3RoKTtcbiAgdmFyIHBvaW50ZXJtaWQgPSBwb2ludGVybWF4O1xuICB2YXIgcG9pbnRlcmVuZCA9IDA7XG4gIHdoaWxlIChwb2ludGVybWluIDwgcG9pbnRlcm1pZCkge1xuICAgIGlmICh0ZXh0MS5zdWJzdHJpbmcodGV4dDEubGVuZ3RoIC0gcG9pbnRlcm1pZCwgdGV4dDEubGVuZ3RoIC0gcG9pbnRlcmVuZCkgPT1cbiAgICAgICAgdGV4dDIuc3Vic3RyaW5nKHRleHQyLmxlbmd0aCAtIHBvaW50ZXJtaWQsIHRleHQyLmxlbmd0aCAtIHBvaW50ZXJlbmQpKSB7XG4gICAgICBwb2ludGVybWluID0gcG9pbnRlcm1pZDtcbiAgICAgIHBvaW50ZXJlbmQgPSBwb2ludGVybWluO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb2ludGVybWF4ID0gcG9pbnRlcm1pZDtcbiAgICB9XG4gICAgcG9pbnRlcm1pZCA9IE1hdGguZmxvb3IoKHBvaW50ZXJtYXggLSBwb2ludGVybWluKSAvIDIgKyBwb2ludGVybWluKTtcbiAgfVxuICByZXR1cm4gcG9pbnRlcm1pZDtcbn07XG5cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgdGhlIHN1ZmZpeCBvZiBvbmUgc3RyaW5nIGlzIHRoZSBwcmVmaXggb2YgYW5vdGhlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBGaXJzdCBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDIgU2Vjb25kIHN0cmluZy5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGNvbW1vbiB0byB0aGUgZW5kIG9mIHRoZSBmaXJzdFxuICogICAgIHN0cmluZyBhbmQgdGhlIHN0YXJ0IG9mIHRoZSBzZWNvbmQgc3RyaW5nLlxuICogQHByaXZhdGVcbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl9jb21tb25PdmVybGFwXyA9IGZ1bmN0aW9uKHRleHQxLCB0ZXh0Mikge1xuICAvLyBDYWNoZSB0aGUgdGV4dCBsZW5ndGhzIHRvIHByZXZlbnQgbXVsdGlwbGUgY2FsbHMuXG4gIHZhciB0ZXh0MV9sZW5ndGggPSB0ZXh0MS5sZW5ndGg7XG4gIHZhciB0ZXh0Ml9sZW5ndGggPSB0ZXh0Mi5sZW5ndGg7XG4gIC8vIEVsaW1pbmF0ZSB0aGUgbnVsbCBjYXNlLlxuICBpZiAodGV4dDFfbGVuZ3RoID09IDAgfHwgdGV4dDJfbGVuZ3RoID09IDApIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuICAvLyBUcnVuY2F0ZSB0aGUgbG9uZ2VyIHN0cmluZy5cbiAgaWYgKHRleHQxX2xlbmd0aCA+IHRleHQyX2xlbmd0aCkge1xuICAgIHRleHQxID0gdGV4dDEuc3Vic3RyaW5nKHRleHQxX2xlbmd0aCAtIHRleHQyX2xlbmd0aCk7XG4gIH0gZWxzZSBpZiAodGV4dDFfbGVuZ3RoIDwgdGV4dDJfbGVuZ3RoKSB7XG4gICAgdGV4dDIgPSB0ZXh0Mi5zdWJzdHJpbmcoMCwgdGV4dDFfbGVuZ3RoKTtcbiAgfVxuICB2YXIgdGV4dF9sZW5ndGggPSBNYXRoLm1pbih0ZXh0MV9sZW5ndGgsIHRleHQyX2xlbmd0aCk7XG4gIC8vIFF1aWNrIGNoZWNrIGZvciB0aGUgd29yc3QgY2FzZS5cbiAgaWYgKHRleHQxID09IHRleHQyKSB7XG4gICAgcmV0dXJuIHRleHRfbGVuZ3RoO1xuICB9XG5cbiAgLy8gU3RhcnQgYnkgbG9va2luZyBmb3IgYSBzaW5nbGUgY2hhcmFjdGVyIG1hdGNoXG4gIC8vIGFuZCBpbmNyZWFzZSBsZW5ndGggdW50aWwgbm8gbWF0Y2ggaXMgZm91bmQuXG4gIC8vIFBlcmZvcm1hbmNlIGFuYWx5c2lzOiBodHRwOi8vbmVpbC5mcmFzZXIubmFtZS9uZXdzLzIwMTAvMTEvMDQvXG4gIHZhciBiZXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IDE7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgdmFyIHBhdHRlcm4gPSB0ZXh0MS5zdWJzdHJpbmcodGV4dF9sZW5ndGggLSBsZW5ndGgpO1xuICAgIHZhciBmb3VuZCA9IHRleHQyLmluZGV4T2YocGF0dGVybik7XG4gICAgaWYgKGZvdW5kID09IC0xKSB7XG4gICAgICByZXR1cm4gYmVzdDtcbiAgICB9XG4gICAgbGVuZ3RoICs9IGZvdW5kO1xuICAgIGlmIChmb3VuZCA9PSAwIHx8IHRleHQxLnN1YnN0cmluZyh0ZXh0X2xlbmd0aCAtIGxlbmd0aCkgPT1cbiAgICAgICAgICAgICAgICAgICAgICB0ZXh0Mi5zdWJzdHJpbmcoMCwgbGVuZ3RoKSkge1xuICAgICAgYmVzdCA9IGxlbmd0aDtcbiAgICAgIGxlbmd0aCsrO1xuICAgIH1cbiAgfVxufTtcblxuXG4vKipcbiAqIERvIHRoZSB0d28gdGV4dHMgc2hhcmUgYSBzdWJzdHJpbmcgd2hpY2ggaXMgYXQgbGVhc3QgaGFsZiB0aGUgbGVuZ3RoIG9mIHRoZVxuICogbG9uZ2VyIHRleHQ/XG4gKiBUaGlzIHNwZWVkdXAgY2FuIHByb2R1Y2Ugbm9uLW1pbmltYWwgZGlmZnMuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDEgRmlyc3Qgc3RyaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQyIFNlY29uZCBzdHJpbmcuXG4gKiBAcmV0dXJuIHtBcnJheS48c3RyaW5nPn0gRml2ZSBlbGVtZW50IEFycmF5LCBjb250YWluaW5nIHRoZSBwcmVmaXggb2ZcbiAqICAgICB0ZXh0MSwgdGhlIHN1ZmZpeCBvZiB0ZXh0MSwgdGhlIHByZWZpeCBvZiB0ZXh0MiwgdGhlIHN1ZmZpeCBvZlxuICogICAgIHRleHQyIGFuZCB0aGUgY29tbW9uIG1pZGRsZS4gIE9yIG51bGwgaWYgdGhlcmUgd2FzIG5vIG1hdGNoLlxuICogQHByaXZhdGVcbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl9oYWxmTWF0Y2hfID0gZnVuY3Rpb24odGV4dDEsIHRleHQyKSB7XG4gIGlmICh0aGlzLkRpZmZfVGltZW91dCA8PSAwKSB7XG4gICAgLy8gRG9uJ3QgcmlzayByZXR1cm5pbmcgYSBub24tb3B0aW1hbCBkaWZmIGlmIHdlIGhhdmUgdW5saW1pdGVkIHRpbWUuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGxvbmd0ZXh0ID0gdGV4dDEubGVuZ3RoID4gdGV4dDIubGVuZ3RoID8gdGV4dDEgOiB0ZXh0MjtcbiAgdmFyIHNob3J0dGV4dCA9IHRleHQxLmxlbmd0aCA+IHRleHQyLmxlbmd0aCA/IHRleHQyIDogdGV4dDE7XG4gIGlmIChsb25ndGV4dC5sZW5ndGggPCA0IHx8IHNob3J0dGV4dC5sZW5ndGggKiAyIDwgbG9uZ3RleHQubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG51bGw7ICAvLyBQb2ludGxlc3MuXG4gIH1cbiAgdmFyIGRtcCA9IHRoaXM7ICAvLyAndGhpcycgYmVjb21lcyAnd2luZG93JyBpbiBhIGNsb3N1cmUuXG5cbiAgLyoqXG4gICAqIERvZXMgYSBzdWJzdHJpbmcgb2Ygc2hvcnR0ZXh0IGV4aXN0IHdpdGhpbiBsb25ndGV4dCBzdWNoIHRoYXQgdGhlIHN1YnN0cmluZ1xuICAgKiBpcyBhdCBsZWFzdCBoYWxmIHRoZSBsZW5ndGggb2YgbG9uZ3RleHQ/XG4gICAqIENsb3N1cmUsIGJ1dCBkb2VzIG5vdCByZWZlcmVuY2UgYW55IGV4dGVybmFsIHZhcmlhYmxlcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGxvbmd0ZXh0IExvbmdlciBzdHJpbmcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzaG9ydHRleHQgU2hvcnRlciBzdHJpbmcuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpIFN0YXJ0IGluZGV4IG9mIHF1YXJ0ZXIgbGVuZ3RoIHN1YnN0cmluZyB3aXRoaW4gbG9uZ3RleHQuXG4gICAqIEByZXR1cm4ge0FycmF5LjxzdHJpbmc+fSBGaXZlIGVsZW1lbnQgQXJyYXksIGNvbnRhaW5pbmcgdGhlIHByZWZpeCBvZlxuICAgKiAgICAgbG9uZ3RleHQsIHRoZSBzdWZmaXggb2YgbG9uZ3RleHQsIHRoZSBwcmVmaXggb2Ygc2hvcnR0ZXh0LCB0aGUgc3VmZml4XG4gICAqICAgICBvZiBzaG9ydHRleHQgYW5kIHRoZSBjb21tb24gbWlkZGxlLiAgT3IgbnVsbCBpZiB0aGVyZSB3YXMgbm8gbWF0Y2guXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBkaWZmX2hhbGZNYXRjaElfKGxvbmd0ZXh0LCBzaG9ydHRleHQsIGkpIHtcbiAgICAvLyBTdGFydCB3aXRoIGEgMS80IGxlbmd0aCBzdWJzdHJpbmcgYXQgcG9zaXRpb24gaSBhcyBhIHNlZWQuXG4gICAgdmFyIHNlZWQgPSBsb25ndGV4dC5zdWJzdHJpbmcoaSwgaSArIE1hdGguZmxvb3IobG9uZ3RleHQubGVuZ3RoIC8gNCkpO1xuICAgIHZhciBqID0gLTE7XG4gICAgdmFyIGJlc3RfY29tbW9uID0gJyc7XG4gICAgdmFyIGJlc3RfbG9uZ3RleHRfYSwgYmVzdF9sb25ndGV4dF9iLCBiZXN0X3Nob3J0dGV4dF9hLCBiZXN0X3Nob3J0dGV4dF9iO1xuICAgIHdoaWxlICgoaiA9IHNob3J0dGV4dC5pbmRleE9mKHNlZWQsIGogKyAxKSkgIT0gLTEpIHtcbiAgICAgIHZhciBwcmVmaXhMZW5ndGggPSBkbXAuZGlmZl9jb21tb25QcmVmaXgobG9uZ3RleHQuc3Vic3RyaW5nKGkpLFxuICAgICAgICBzaG9ydHRleHQuc3Vic3RyaW5nKGopKTtcbiAgICAgIHZhciBzdWZmaXhMZW5ndGggPSBkbXAuZGlmZl9jb21tb25TdWZmaXgobG9uZ3RleHQuc3Vic3RyaW5nKDAsIGkpLFxuICAgICAgICBzaG9ydHRleHQuc3Vic3RyaW5nKDAsIGopKTtcbiAgICAgIGlmIChiZXN0X2NvbW1vbi5sZW5ndGggPCBzdWZmaXhMZW5ndGggKyBwcmVmaXhMZW5ndGgpIHtcbiAgICAgICAgYmVzdF9jb21tb24gPSBzaG9ydHRleHQuc3Vic3RyaW5nKGogLSBzdWZmaXhMZW5ndGgsIGopICtcbiAgICAgICAgICAgICAgICAgICAgICBzaG9ydHRleHQuc3Vic3RyaW5nKGosIGogKyBwcmVmaXhMZW5ndGgpO1xuICAgICAgICBiZXN0X2xvbmd0ZXh0X2EgPSBsb25ndGV4dC5zdWJzdHJpbmcoMCwgaSAtIHN1ZmZpeExlbmd0aCk7XG4gICAgICAgIGJlc3RfbG9uZ3RleHRfYiA9IGxvbmd0ZXh0LnN1YnN0cmluZyhpICsgcHJlZml4TGVuZ3RoKTtcbiAgICAgICAgYmVzdF9zaG9ydHRleHRfYSA9IHNob3J0dGV4dC5zdWJzdHJpbmcoMCwgaiAtIHN1ZmZpeExlbmd0aCk7XG4gICAgICAgIGJlc3Rfc2hvcnR0ZXh0X2IgPSBzaG9ydHRleHQuc3Vic3RyaW5nKGogKyBwcmVmaXhMZW5ndGgpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoYmVzdF9jb21tb24ubGVuZ3RoICogMiA+PSBsb25ndGV4dC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBbYmVzdF9sb25ndGV4dF9hLCBiZXN0X2xvbmd0ZXh0X2IsXG4gICAgICAgIGJlc3Rfc2hvcnR0ZXh0X2EsIGJlc3Rfc2hvcnR0ZXh0X2IsIGJlc3RfY29tbW9uXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLy8gRmlyc3QgY2hlY2sgaWYgdGhlIHNlY29uZCBxdWFydGVyIGlzIHRoZSBzZWVkIGZvciBhIGhhbGYtbWF0Y2guXG4gIHZhciBobTEgPSBkaWZmX2hhbGZNYXRjaElfKGxvbmd0ZXh0LCBzaG9ydHRleHQsXG4gICAgTWF0aC5jZWlsKGxvbmd0ZXh0Lmxlbmd0aCAvIDQpKTtcbiAgLy8gQ2hlY2sgYWdhaW4gYmFzZWQgb24gdGhlIHRoaXJkIHF1YXJ0ZXIuXG4gIHZhciBobTIgPSBkaWZmX2hhbGZNYXRjaElfKGxvbmd0ZXh0LCBzaG9ydHRleHQsXG4gICAgTWF0aC5jZWlsKGxvbmd0ZXh0Lmxlbmd0aCAvIDIpKTtcbiAgdmFyIGhtO1xuICBpZiAoIWhtMSAmJiAhaG0yKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSBpZiAoIWhtMikge1xuICAgIGhtID0gaG0xO1xuICB9IGVsc2UgaWYgKCFobTEpIHtcbiAgICBobSA9IGhtMjtcbiAgfSBlbHNlIHtcbiAgICAvLyBCb3RoIG1hdGNoZWQuICBTZWxlY3QgdGhlIGxvbmdlc3QuXG4gICAgaG0gPSBobTFbNF0ubGVuZ3RoID4gaG0yWzRdLmxlbmd0aCA/IGhtMSA6IGhtMjtcbiAgfVxuXG4gIC8vIEEgaGFsZi1tYXRjaCB3YXMgZm91bmQsIHNvcnQgb3V0IHRoZSByZXR1cm4gZGF0YS5cbiAgdmFyIHRleHQxX2EsIHRleHQxX2IsIHRleHQyX2EsIHRleHQyX2I7XG4gIGlmICh0ZXh0MS5sZW5ndGggPiB0ZXh0Mi5sZW5ndGgpIHtcbiAgICB0ZXh0MV9hID0gaG1bMF07XG4gICAgdGV4dDFfYiA9IGhtWzFdO1xuICAgIHRleHQyX2EgPSBobVsyXTtcbiAgICB0ZXh0Ml9iID0gaG1bM107XG4gIH0gZWxzZSB7XG4gICAgdGV4dDJfYSA9IGhtWzBdO1xuICAgIHRleHQyX2IgPSBobVsxXTtcbiAgICB0ZXh0MV9hID0gaG1bMl07XG4gICAgdGV4dDFfYiA9IGhtWzNdO1xuICB9XG4gIHZhciBtaWRfY29tbW9uID0gaG1bNF07XG4gIHJldHVybiBbdGV4dDFfYSwgdGV4dDFfYiwgdGV4dDJfYSwgdGV4dDJfYiwgbWlkX2NvbW1vbl07XG59O1xuXG5cbi8qKlxuICogUmVkdWNlIHRoZSBudW1iZXIgb2YgZWRpdHMgYnkgZWxpbWluYXRpbmcgc2VtYW50aWNhbGx5IHRyaXZpYWwgZXF1YWxpdGllcy5cbiAqIEBwYXJhbSB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gZGlmZnMgQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfY2xlYW51cFNlbWFudGljID0gZnVuY3Rpb24oZGlmZnMpIHtcbiAgdmFyIGNoYW5nZXMgPSBmYWxzZTtcbiAgdmFyIGVxdWFsaXRpZXMgPSBbXTsgIC8vIFN0YWNrIG9mIGluZGljZXMgd2hlcmUgZXF1YWxpdGllcyBhcmUgZm91bmQuXG4gIHZhciBlcXVhbGl0aWVzTGVuZ3RoID0gMDsgIC8vIEtlZXBpbmcgb3VyIG93biBsZW5ndGggdmFyIGlzIGZhc3RlciBpbiBKUy5cbiAgLyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuICB2YXIgbGFzdGVxdWFsaXR5ID0gbnVsbDtcbiAgLy8gQWx3YXlzIGVxdWFsIHRvIGRpZmZzW2VxdWFsaXRpZXNbZXF1YWxpdGllc0xlbmd0aCAtIDFdXVsxXVxuICB2YXIgcG9pbnRlciA9IDA7ICAvLyBJbmRleCBvZiBjdXJyZW50IHBvc2l0aW9uLlxuICAvLyBOdW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IGNoYW5nZWQgcHJpb3IgdG8gdGhlIGVxdWFsaXR5LlxuICB2YXIgbGVuZ3RoX2luc2VydGlvbnMxID0gMDtcbiAgdmFyIGxlbmd0aF9kZWxldGlvbnMxID0gMDtcbiAgLy8gTnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBjaGFuZ2VkIGFmdGVyIHRoZSBlcXVhbGl0eS5cbiAgdmFyIGxlbmd0aF9pbnNlcnRpb25zMiA9IDA7XG4gIHZhciBsZW5ndGhfZGVsZXRpb25zMiA9IDA7XG4gIHdoaWxlIChwb2ludGVyIDwgZGlmZnMubGVuZ3RoKSB7XG4gICAgaWYgKGRpZmZzW3BvaW50ZXJdWzBdID09IERJRkZfRVFVQUwpIHsgIC8vIEVxdWFsaXR5IGZvdW5kLlxuICAgICAgZXF1YWxpdGllc1tlcXVhbGl0aWVzTGVuZ3RoKytdID0gcG9pbnRlcjtcbiAgICAgIGxlbmd0aF9pbnNlcnRpb25zMSA9IGxlbmd0aF9pbnNlcnRpb25zMjtcbiAgICAgIGxlbmd0aF9kZWxldGlvbnMxID0gbGVuZ3RoX2RlbGV0aW9uczI7XG4gICAgICBsZW5ndGhfaW5zZXJ0aW9uczIgPSAwO1xuICAgICAgbGVuZ3RoX2RlbGV0aW9uczIgPSAwO1xuICAgICAgbGFzdGVxdWFsaXR5ID0gZGlmZnNbcG9pbnRlcl1bMV07XG4gICAgfSBlbHNlIHsgIC8vIEFuIGluc2VydGlvbiBvciBkZWxldGlvbi5cbiAgICAgIGlmIChkaWZmc1twb2ludGVyXVswXSA9PSBESUZGX0lOU0VSVCkge1xuICAgICAgICBsZW5ndGhfaW5zZXJ0aW9uczIgKz0gZGlmZnNbcG9pbnRlcl1bMV0ubGVuZ3RoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGVuZ3RoX2RlbGV0aW9uczIgKz0gZGlmZnNbcG9pbnRlcl1bMV0ubGVuZ3RoO1xuICAgICAgfVxuICAgICAgLy8gRWxpbWluYXRlIGFuIGVxdWFsaXR5IHRoYXQgaXMgc21hbGxlciBvciBlcXVhbCB0byB0aGUgZWRpdHMgb24gYm90aFxuICAgICAgLy8gc2lkZXMgb2YgaXQuXG4gICAgICBpZiAobGFzdGVxdWFsaXR5ICYmIChsYXN0ZXF1YWxpdHkubGVuZ3RoIDw9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLm1heChsZW5ndGhfaW5zZXJ0aW9uczEsIGxlbmd0aF9kZWxldGlvbnMxKSkgJiZcbiAgICAgICAgICAobGFzdGVxdWFsaXR5Lmxlbmd0aCA8PSBNYXRoLm1heChsZW5ndGhfaW5zZXJ0aW9uczIsXG4gICAgICAgICAgICBsZW5ndGhfZGVsZXRpb25zMikpKSB7XG4gICAgICAgIC8vIER1cGxpY2F0ZSByZWNvcmQuXG4gICAgICAgIGRpZmZzLnNwbGljZShlcXVhbGl0aWVzW2VxdWFsaXRpZXNMZW5ndGggLSAxXSwgMCxcbiAgICAgICAgICBbRElGRl9ERUxFVEUsIGxhc3RlcXVhbGl0eV0pO1xuICAgICAgICAvLyBDaGFuZ2Ugc2Vjb25kIGNvcHkgdG8gaW5zZXJ0LlxuICAgICAgICBkaWZmc1tlcXVhbGl0aWVzW2VxdWFsaXRpZXNMZW5ndGggLSAxXSArIDFdWzBdID0gRElGRl9JTlNFUlQ7XG4gICAgICAgIC8vIFRocm93IGF3YXkgdGhlIGVxdWFsaXR5IHdlIGp1c3QgZGVsZXRlZC5cbiAgICAgICAgZXF1YWxpdGllc0xlbmd0aC0tO1xuICAgICAgICAvLyBUaHJvdyBhd2F5IHRoZSBwcmV2aW91cyBlcXVhbGl0eSAoaXQgbmVlZHMgdG8gYmUgcmVldmFsdWF0ZWQpLlxuICAgICAgICBlcXVhbGl0aWVzTGVuZ3RoLS07XG4gICAgICAgIHBvaW50ZXIgPSBlcXVhbGl0aWVzTGVuZ3RoID4gMCA/IGVxdWFsaXRpZXNbZXF1YWxpdGllc0xlbmd0aCAtIDFdIDogLTE7XG4gICAgICAgIGxlbmd0aF9pbnNlcnRpb25zMSA9IDA7ICAvLyBSZXNldCB0aGUgY291bnRlcnMuXG4gICAgICAgIGxlbmd0aF9kZWxldGlvbnMxID0gMDtcbiAgICAgICAgbGVuZ3RoX2luc2VydGlvbnMyID0gMDtcbiAgICAgICAgbGVuZ3RoX2RlbGV0aW9uczIgPSAwO1xuICAgICAgICBsYXN0ZXF1YWxpdHkgPSBudWxsO1xuICAgICAgICBjaGFuZ2VzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcG9pbnRlcisrO1xuICB9XG5cbiAgLy8gTm9ybWFsaXplIHRoZSBkaWZmLlxuICBpZiAoY2hhbmdlcykge1xuICAgIHRoaXMuZGlmZl9jbGVhbnVwTWVyZ2UoZGlmZnMpO1xuICB9XG4gIHRoaXMuZGlmZl9jbGVhbnVwU2VtYW50aWNMb3NzbGVzcyhkaWZmcyk7XG5cbiAgLy8gRmluZCBhbnkgb3ZlcmxhcHMgYmV0d2VlbiBkZWxldGlvbnMgYW5kIGluc2VydGlvbnMuXG4gIC8vIGUuZzogPGRlbD5hYmN4eHg8L2RlbD48aW5zPnh4eGRlZjwvaW5zPlxuICAvLyAgIC0+IDxkZWw+YWJjPC9kZWw+eHh4PGlucz5kZWY8L2lucz5cbiAgLy8gZS5nOiA8ZGVsPnh4eGFiYzwvZGVsPjxpbnM+ZGVmeHh4PC9pbnM+XG4gIC8vICAgLT4gPGlucz5kZWY8L2lucz54eHg8ZGVsPmFiYzwvZGVsPlxuICAvLyBPbmx5IGV4dHJhY3QgYW4gb3ZlcmxhcCBpZiBpdCBpcyBhcyBiaWcgYXMgdGhlIGVkaXQgYWhlYWQgb3IgYmVoaW5kIGl0LlxuICBwb2ludGVyID0gMTtcbiAgd2hpbGUgKHBvaW50ZXIgPCBkaWZmcy5sZW5ndGgpIHtcbiAgICBpZiAoZGlmZnNbcG9pbnRlciAtIDFdWzBdID09IERJRkZfREVMRVRFICYmXG4gICAgICAgIGRpZmZzW3BvaW50ZXJdWzBdID09IERJRkZfSU5TRVJUKSB7XG4gICAgICB2YXIgZGVsZXRpb24gPSBkaWZmc1twb2ludGVyIC0gMV1bMV07XG4gICAgICB2YXIgaW5zZXJ0aW9uID0gZGlmZnNbcG9pbnRlcl1bMV07XG4gICAgICB2YXIgb3ZlcmxhcF9sZW5ndGgxID0gdGhpcy5kaWZmX2NvbW1vbk92ZXJsYXBfKGRlbGV0aW9uLCBpbnNlcnRpb24pO1xuICAgICAgdmFyIG92ZXJsYXBfbGVuZ3RoMiA9IHRoaXMuZGlmZl9jb21tb25PdmVybGFwXyhpbnNlcnRpb24sIGRlbGV0aW9uKTtcbiAgICAgIGlmIChvdmVybGFwX2xlbmd0aDEgPj0gb3ZlcmxhcF9sZW5ndGgyKSB7XG4gICAgICAgIGlmIChvdmVybGFwX2xlbmd0aDEgPj0gZGVsZXRpb24ubGVuZ3RoIC8gMiB8fFxuICAgICAgICAgICAgb3ZlcmxhcF9sZW5ndGgxID49IGluc2VydGlvbi5sZW5ndGggLyAyKSB7XG4gICAgICAgICAgLy8gT3ZlcmxhcCBmb3VuZC4gIEluc2VydCBhbiBlcXVhbGl0eSBhbmQgdHJpbSB0aGUgc3Vycm91bmRpbmcgZWRpdHMuXG4gICAgICAgICAgZGlmZnMuc3BsaWNlKHBvaW50ZXIsIDAsXG4gICAgICAgICAgICBbRElGRl9FUVVBTCwgaW5zZXJ0aW9uLnN1YnN0cmluZygwLCBvdmVybGFwX2xlbmd0aDEpXSk7XG4gICAgICAgICAgZGlmZnNbcG9pbnRlciAtIDFdWzFdID1cbiAgICAgICAgICAgIGRlbGV0aW9uLnN1YnN0cmluZygwLCBkZWxldGlvbi5sZW5ndGggLSBvdmVybGFwX2xlbmd0aDEpO1xuICAgICAgICAgIGRpZmZzW3BvaW50ZXIgKyAxXVsxXSA9IGluc2VydGlvbi5zdWJzdHJpbmcob3ZlcmxhcF9sZW5ndGgxKTtcbiAgICAgICAgICBwb2ludGVyKys7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChvdmVybGFwX2xlbmd0aDIgPj0gZGVsZXRpb24ubGVuZ3RoIC8gMiB8fFxuICAgICAgICAgICAgb3ZlcmxhcF9sZW5ndGgyID49IGluc2VydGlvbi5sZW5ndGggLyAyKSB7XG4gICAgICAgICAgLy8gUmV2ZXJzZSBvdmVybGFwIGZvdW5kLlxuICAgICAgICAgIC8vIEluc2VydCBhbiBlcXVhbGl0eSBhbmQgc3dhcCBhbmQgdHJpbSB0aGUgc3Vycm91bmRpbmcgZWRpdHMuXG4gICAgICAgICAgZGlmZnMuc3BsaWNlKHBvaW50ZXIsIDAsXG4gICAgICAgICAgICBbRElGRl9FUVVBTCwgZGVsZXRpb24uc3Vic3RyaW5nKDAsIG92ZXJsYXBfbGVuZ3RoMildKTtcbiAgICAgICAgICBkaWZmc1twb2ludGVyIC0gMV1bMF0gPSBESUZGX0lOU0VSVDtcbiAgICAgICAgICBkaWZmc1twb2ludGVyIC0gMV1bMV0gPVxuICAgICAgICAgICAgaW5zZXJ0aW9uLnN1YnN0cmluZygwLCBpbnNlcnRpb24ubGVuZ3RoIC0gb3ZlcmxhcF9sZW5ndGgyKTtcbiAgICAgICAgICBkaWZmc1twb2ludGVyICsgMV1bMF0gPSBESUZGX0RFTEVURTtcbiAgICAgICAgICBkaWZmc1twb2ludGVyICsgMV1bMV0gPVxuICAgICAgICAgICAgZGVsZXRpb24uc3Vic3RyaW5nKG92ZXJsYXBfbGVuZ3RoMik7XG4gICAgICAgICAgcG9pbnRlcisrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwb2ludGVyKys7XG4gICAgfVxuICAgIHBvaW50ZXIrKztcbiAgfVxufTtcblxuXG4vKipcbiAqIExvb2sgZm9yIHNpbmdsZSBlZGl0cyBzdXJyb3VuZGVkIG9uIGJvdGggc2lkZXMgYnkgZXF1YWxpdGllc1xuICogd2hpY2ggY2FuIGJlIHNoaWZ0ZWQgc2lkZXdheXMgdG8gYWxpZ24gdGhlIGVkaXQgdG8gYSB3b3JkIGJvdW5kYXJ5LlxuICogZS5nOiBUaGUgYzxpbnM+YXQgYzwvaW5zPmFtZS4gLT4gVGhlIDxpbnM+Y2F0IDwvaW5zPmNhbWUuXG4gKiBAcGFyYW0geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59IGRpZmZzIEFycmF5IG9mIGRpZmYgdHVwbGVzLlxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX2NsZWFudXBTZW1hbnRpY0xvc3NsZXNzID0gZnVuY3Rpb24oZGlmZnMpIHtcbiAgLyoqXG4gICAqIEdpdmVuIHR3byBzdHJpbmdzLCBjb21wdXRlIGEgc2NvcmUgcmVwcmVzZW50aW5nIHdoZXRoZXIgdGhlIGludGVybmFsXG4gICAqIGJvdW5kYXJ5IGZhbGxzIG9uIGxvZ2ljYWwgYm91bmRhcmllcy5cbiAgICogU2NvcmVzIHJhbmdlIGZyb20gNiAoYmVzdCkgdG8gMCAod29yc3QpLlxuICAgKiBDbG9zdXJlLCBidXQgZG9lcyBub3QgcmVmZXJlbmNlIGFueSBleHRlcm5hbCB2YXJpYWJsZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvbmUgRmlyc3Qgc3RyaW5nLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHdvIFNlY29uZCBzdHJpbmcuXG4gICAqIEByZXR1cm4ge251bWJlcn0gVGhlIHNjb3JlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gZGlmZl9jbGVhbnVwU2VtYW50aWNTY29yZV8ob25lLCB0d28pIHtcbiAgICBpZiAoIW9uZSB8fCAhdHdvKSB7XG4gICAgICAvLyBFZGdlcyBhcmUgdGhlIGJlc3QuXG4gICAgICByZXR1cm4gNjtcbiAgICB9XG5cbiAgICAvLyBFYWNoIHBvcnQgb2YgdGhpcyBmdW5jdGlvbiBiZWhhdmVzIHNsaWdodGx5IGRpZmZlcmVudGx5IGR1ZSB0b1xuICAgIC8vIHN1YnRsZSBkaWZmZXJlbmNlcyBpbiBlYWNoIGxhbmd1YWdlJ3MgZGVmaW5pdGlvbiBvZiB0aGluZ3MgbGlrZVxuICAgIC8vICd3aGl0ZXNwYWNlJy4gIFNpbmNlIHRoaXMgZnVuY3Rpb24ncyBwdXJwb3NlIGlzIGxhcmdlbHkgY29zbWV0aWMsXG4gICAgLy8gdGhlIGNob2ljZSBoYXMgYmVlbiBtYWRlIHRvIHVzZSBlYWNoIGxhbmd1YWdlJ3MgbmF0aXZlIGZlYXR1cmVzXG4gICAgLy8gcmF0aGVyIHRoYW4gZm9yY2UgdG90YWwgY29uZm9ybWl0eS5cbiAgICB2YXIgY2hhcjEgPSBvbmUuY2hhckF0KG9uZS5sZW5ndGggLSAxKTtcbiAgICB2YXIgY2hhcjIgPSB0d28uY2hhckF0KDApO1xuICAgIHZhciBub25BbHBoYU51bWVyaWMxID0gY2hhcjEubWF0Y2goZGlmZl9tYXRjaF9wYXRjaC5ub25BbHBoYU51bWVyaWNSZWdleF8pO1xuICAgIHZhciBub25BbHBoYU51bWVyaWMyID0gY2hhcjIubWF0Y2goZGlmZl9tYXRjaF9wYXRjaC5ub25BbHBoYU51bWVyaWNSZWdleF8pO1xuICAgIHZhciB3aGl0ZXNwYWNlMSA9IG5vbkFscGhhTnVtZXJpYzEgJiZcbiAgICAgICAgICAgICAgICAgICAgICBjaGFyMS5tYXRjaChkaWZmX21hdGNoX3BhdGNoLndoaXRlc3BhY2VSZWdleF8pO1xuICAgIHZhciB3aGl0ZXNwYWNlMiA9IG5vbkFscGhhTnVtZXJpYzIgJiZcbiAgICAgICAgICAgICAgICAgICAgICBjaGFyMi5tYXRjaChkaWZmX21hdGNoX3BhdGNoLndoaXRlc3BhY2VSZWdleF8pO1xuICAgIHZhciBsaW5lQnJlYWsxID0gd2hpdGVzcGFjZTEgJiZcbiAgICAgICAgICAgICAgICAgICAgIGNoYXIxLm1hdGNoKGRpZmZfbWF0Y2hfcGF0Y2gubGluZWJyZWFrUmVnZXhfKTtcbiAgICB2YXIgbGluZUJyZWFrMiA9IHdoaXRlc3BhY2UyICYmXG4gICAgICAgICAgICAgICAgICAgICBjaGFyMi5tYXRjaChkaWZmX21hdGNoX3BhdGNoLmxpbmVicmVha1JlZ2V4Xyk7XG4gICAgdmFyIGJsYW5rTGluZTEgPSBsaW5lQnJlYWsxICYmXG4gICAgICAgICAgICAgICAgICAgICBvbmUubWF0Y2goZGlmZl9tYXRjaF9wYXRjaC5ibGFua2xpbmVFbmRSZWdleF8pO1xuICAgIHZhciBibGFua0xpbmUyID0gbGluZUJyZWFrMiAmJlxuICAgICAgICAgICAgICAgICAgICAgdHdvLm1hdGNoKGRpZmZfbWF0Y2hfcGF0Y2guYmxhbmtsaW5lU3RhcnRSZWdleF8pO1xuXG4gICAgaWYgKGJsYW5rTGluZTEgfHwgYmxhbmtMaW5lMikge1xuICAgICAgLy8gRml2ZSBwb2ludHMgZm9yIGJsYW5rIGxpbmVzLlxuICAgICAgcmV0dXJuIDU7XG4gICAgfSBlbHNlIGlmIChsaW5lQnJlYWsxIHx8IGxpbmVCcmVhazIpIHtcbiAgICAgIC8vIEZvdXIgcG9pbnRzIGZvciBsaW5lIGJyZWFrcy5cbiAgICAgIHJldHVybiA0O1xuICAgIH0gZWxzZSBpZiAobm9uQWxwaGFOdW1lcmljMSAmJiAhd2hpdGVzcGFjZTEgJiYgd2hpdGVzcGFjZTIpIHtcbiAgICAgIC8vIFRocmVlIHBvaW50cyBmb3IgZW5kIG9mIHNlbnRlbmNlcy5cbiAgICAgIHJldHVybiAzO1xuICAgIH0gZWxzZSBpZiAod2hpdGVzcGFjZTEgfHwgd2hpdGVzcGFjZTIpIHtcbiAgICAgIC8vIFR3byBwb2ludHMgZm9yIHdoaXRlc3BhY2UuXG4gICAgICByZXR1cm4gMjtcbiAgICB9IGVsc2UgaWYgKG5vbkFscGhhTnVtZXJpYzEgfHwgbm9uQWxwaGFOdW1lcmljMikge1xuICAgICAgLy8gT25lIHBvaW50IGZvciBub24tYWxwaGFudW1lcmljLlxuICAgICAgcmV0dXJuIDE7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgdmFyIHBvaW50ZXIgPSAxO1xuICAvLyBJbnRlbnRpb25hbGx5IGlnbm9yZSB0aGUgZmlyc3QgYW5kIGxhc3QgZWxlbWVudCAoZG9uJ3QgbmVlZCBjaGVja2luZykuXG4gIHdoaWxlIChwb2ludGVyIDwgZGlmZnMubGVuZ3RoIC0gMSkge1xuICAgIGlmIChkaWZmc1twb2ludGVyIC0gMV1bMF0gPT0gRElGRl9FUVVBTCAmJlxuICAgICAgICBkaWZmc1twb2ludGVyICsgMV1bMF0gPT0gRElGRl9FUVVBTCkge1xuICAgICAgLy8gVGhpcyBpcyBhIHNpbmdsZSBlZGl0IHN1cnJvdW5kZWQgYnkgZXF1YWxpdGllcy5cbiAgICAgIHZhciBlcXVhbGl0eTEgPSBkaWZmc1twb2ludGVyIC0gMV1bMV07XG4gICAgICB2YXIgZWRpdCA9IGRpZmZzW3BvaW50ZXJdWzFdO1xuICAgICAgdmFyIGVxdWFsaXR5MiA9IGRpZmZzW3BvaW50ZXIgKyAxXVsxXTtcblxuICAgICAgLy8gRmlyc3QsIHNoaWZ0IHRoZSBlZGl0IGFzIGZhciBsZWZ0IGFzIHBvc3NpYmxlLlxuICAgICAgdmFyIGNvbW1vbk9mZnNldCA9IHRoaXMuZGlmZl9jb21tb25TdWZmaXgoZXF1YWxpdHkxLCBlZGl0KTtcbiAgICAgIGlmIChjb21tb25PZmZzZXQpIHtcbiAgICAgICAgdmFyIGNvbW1vblN0cmluZyA9IGVkaXQuc3Vic3RyaW5nKGVkaXQubGVuZ3RoIC0gY29tbW9uT2Zmc2V0KTtcbiAgICAgICAgZXF1YWxpdHkxID0gZXF1YWxpdHkxLnN1YnN0cmluZygwLCBlcXVhbGl0eTEubGVuZ3RoIC0gY29tbW9uT2Zmc2V0KTtcbiAgICAgICAgZWRpdCA9IGNvbW1vblN0cmluZyArIGVkaXQuc3Vic3RyaW5nKDAsIGVkaXQubGVuZ3RoIC0gY29tbW9uT2Zmc2V0KTtcbiAgICAgICAgZXF1YWxpdHkyID0gY29tbW9uU3RyaW5nICsgZXF1YWxpdHkyO1xuICAgICAgfVxuXG4gICAgICAvLyBTZWNvbmQsIHN0ZXAgY2hhcmFjdGVyIGJ5IGNoYXJhY3RlciByaWdodCwgbG9va2luZyBmb3IgdGhlIGJlc3QgZml0LlxuICAgICAgdmFyIGJlc3RFcXVhbGl0eTEgPSBlcXVhbGl0eTE7XG4gICAgICB2YXIgYmVzdEVkaXQgPSBlZGl0O1xuICAgICAgdmFyIGJlc3RFcXVhbGl0eTIgPSBlcXVhbGl0eTI7XG4gICAgICB2YXIgYmVzdFNjb3JlID0gZGlmZl9jbGVhbnVwU2VtYW50aWNTY29yZV8oZXF1YWxpdHkxLCBlZGl0KSArXG4gICAgICAgICAgICAgICAgICAgICAgZGlmZl9jbGVhbnVwU2VtYW50aWNTY29yZV8oZWRpdCwgZXF1YWxpdHkyKTtcbiAgICAgIHdoaWxlIChlZGl0LmNoYXJBdCgwKSA9PT0gZXF1YWxpdHkyLmNoYXJBdCgwKSkge1xuICAgICAgICBlcXVhbGl0eTEgKz0gZWRpdC5jaGFyQXQoMCk7XG4gICAgICAgIGVkaXQgPSBlZGl0LnN1YnN0cmluZygxKSArIGVxdWFsaXR5Mi5jaGFyQXQoMCk7XG4gICAgICAgIGVxdWFsaXR5MiA9IGVxdWFsaXR5Mi5zdWJzdHJpbmcoMSk7XG4gICAgICAgIHZhciBzY29yZSA9IGRpZmZfY2xlYW51cFNlbWFudGljU2NvcmVfKGVxdWFsaXR5MSwgZWRpdCkgK1xuICAgICAgICAgICAgICAgICAgICBkaWZmX2NsZWFudXBTZW1hbnRpY1Njb3JlXyhlZGl0LCBlcXVhbGl0eTIpO1xuICAgICAgICAvLyBUaGUgPj0gZW5jb3VyYWdlcyB0cmFpbGluZyByYXRoZXIgdGhhbiBsZWFkaW5nIHdoaXRlc3BhY2Ugb24gZWRpdHMuXG4gICAgICAgIGlmIChzY29yZSA+PSBiZXN0U2NvcmUpIHtcbiAgICAgICAgICBiZXN0U2NvcmUgPSBzY29yZTtcbiAgICAgICAgICBiZXN0RXF1YWxpdHkxID0gZXF1YWxpdHkxO1xuICAgICAgICAgIGJlc3RFZGl0ID0gZWRpdDtcbiAgICAgICAgICBiZXN0RXF1YWxpdHkyID0gZXF1YWxpdHkyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkaWZmc1twb2ludGVyIC0gMV1bMV0gIT0gYmVzdEVxdWFsaXR5MSkge1xuICAgICAgICAvLyBXZSBoYXZlIGFuIGltcHJvdmVtZW50LCBzYXZlIGl0IGJhY2sgdG8gdGhlIGRpZmYuXG4gICAgICAgIGlmIChiZXN0RXF1YWxpdHkxKSB7XG4gICAgICAgICAgZGlmZnNbcG9pbnRlciAtIDFdWzFdID0gYmVzdEVxdWFsaXR5MTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaWZmcy5zcGxpY2UocG9pbnRlciAtIDEsIDEpO1xuICAgICAgICAgIHBvaW50ZXItLTtcbiAgICAgICAgfVxuICAgICAgICBkaWZmc1twb2ludGVyXVsxXSA9IGJlc3RFZGl0O1xuICAgICAgICBpZiAoYmVzdEVxdWFsaXR5Mikge1xuICAgICAgICAgIGRpZmZzW3BvaW50ZXIgKyAxXVsxXSA9IGJlc3RFcXVhbGl0eTI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlmZnMuc3BsaWNlKHBvaW50ZXIgKyAxLCAxKTtcbiAgICAgICAgICBwb2ludGVyLS07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcG9pbnRlcisrO1xuICB9XG59O1xuXG4vLyBEZWZpbmUgc29tZSByZWdleCBwYXR0ZXJucyBmb3IgbWF0Y2hpbmcgYm91bmRhcmllcy5cbmRpZmZfbWF0Y2hfcGF0Y2gubm9uQWxwaGFOdW1lcmljUmVnZXhfID0gL1teYS16QS1aMC05XS87XG5kaWZmX21hdGNoX3BhdGNoLndoaXRlc3BhY2VSZWdleF8gPSAvXFxzLztcbmRpZmZfbWF0Y2hfcGF0Y2gubGluZWJyZWFrUmVnZXhfID0gL1tcXHJcXG5dLztcbmRpZmZfbWF0Y2hfcGF0Y2guYmxhbmtsaW5lRW5kUmVnZXhfID0gL1xcblxccj9cXG4kLztcbmRpZmZfbWF0Y2hfcGF0Y2guYmxhbmtsaW5lU3RhcnRSZWdleF8gPSAvXlxccj9cXG5cXHI/XFxuLztcblxuLyoqXG4gKiBSZWR1Y2UgdGhlIG51bWJlciBvZiBlZGl0cyBieSBlbGltaW5hdGluZyBvcGVyYXRpb25hbGx5IHRyaXZpYWwgZXF1YWxpdGllcy5cbiAqIEBwYXJhbSB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gZGlmZnMgQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfY2xlYW51cEVmZmljaWVuY3kgPSBmdW5jdGlvbihkaWZmcykge1xuICB2YXIgY2hhbmdlcyA9IGZhbHNlO1xuICB2YXIgZXF1YWxpdGllcyA9IFtdOyAgLy8gU3RhY2sgb2YgaW5kaWNlcyB3aGVyZSBlcXVhbGl0aWVzIGFyZSBmb3VuZC5cbiAgdmFyIGVxdWFsaXRpZXNMZW5ndGggPSAwOyAgLy8gS2VlcGluZyBvdXIgb3duIGxlbmd0aCB2YXIgaXMgZmFzdGVyIGluIEpTLlxuICAvKiogQHR5cGUgez9zdHJpbmd9ICovXG4gIHZhciBsYXN0ZXF1YWxpdHkgPSBudWxsO1xuICAvLyBBbHdheXMgZXF1YWwgdG8gZGlmZnNbZXF1YWxpdGllc1tlcXVhbGl0aWVzTGVuZ3RoIC0gMV1dWzFdXG4gIHZhciBwb2ludGVyID0gMDsgIC8vIEluZGV4IG9mIGN1cnJlbnQgcG9zaXRpb24uXG4gIC8vIElzIHRoZXJlIGFuIGluc2VydGlvbiBvcGVyYXRpb24gYmVmb3JlIHRoZSBsYXN0IGVxdWFsaXR5LlxuICB2YXIgcHJlX2lucyA9IGZhbHNlO1xuICAvLyBJcyB0aGVyZSBhIGRlbGV0aW9uIG9wZXJhdGlvbiBiZWZvcmUgdGhlIGxhc3QgZXF1YWxpdHkuXG4gIHZhciBwcmVfZGVsID0gZmFsc2U7XG4gIC8vIElzIHRoZXJlIGFuIGluc2VydGlvbiBvcGVyYXRpb24gYWZ0ZXIgdGhlIGxhc3QgZXF1YWxpdHkuXG4gIHZhciBwb3N0X2lucyA9IGZhbHNlO1xuICAvLyBJcyB0aGVyZSBhIGRlbGV0aW9uIG9wZXJhdGlvbiBhZnRlciB0aGUgbGFzdCBlcXVhbGl0eS5cbiAgdmFyIHBvc3RfZGVsID0gZmFsc2U7XG4gIHdoaWxlIChwb2ludGVyIDwgZGlmZnMubGVuZ3RoKSB7XG4gICAgaWYgKGRpZmZzW3BvaW50ZXJdWzBdID09IERJRkZfRVFVQUwpIHsgIC8vIEVxdWFsaXR5IGZvdW5kLlxuICAgICAgaWYgKGRpZmZzW3BvaW50ZXJdWzFdLmxlbmd0aCA8IHRoaXMuRGlmZl9FZGl0Q29zdCAmJlxuICAgICAgICAgIChwb3N0X2lucyB8fCBwb3N0X2RlbCkpIHtcbiAgICAgICAgLy8gQ2FuZGlkYXRlIGZvdW5kLlxuICAgICAgICBlcXVhbGl0aWVzW2VxdWFsaXRpZXNMZW5ndGgrK10gPSBwb2ludGVyO1xuICAgICAgICBwcmVfaW5zID0gcG9zdF9pbnM7XG4gICAgICAgIHByZV9kZWwgPSBwb3N0X2RlbDtcbiAgICAgICAgbGFzdGVxdWFsaXR5ID0gZGlmZnNbcG9pbnRlcl1bMV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOb3QgYSBjYW5kaWRhdGUsIGFuZCBjYW4gbmV2ZXIgYmVjb21lIG9uZS5cbiAgICAgICAgZXF1YWxpdGllc0xlbmd0aCA9IDA7XG4gICAgICAgIGxhc3RlcXVhbGl0eSA9IG51bGw7XG4gICAgICB9XG4gICAgICBwb3N0X2lucyA9IHBvc3RfZGVsID0gZmFsc2U7XG4gICAgfSBlbHNlIHsgIC8vIEFuIGluc2VydGlvbiBvciBkZWxldGlvbi5cbiAgICAgIGlmIChkaWZmc1twb2ludGVyXVswXSA9PSBESUZGX0RFTEVURSkge1xuICAgICAgICBwb3N0X2RlbCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb3N0X2lucyA9IHRydWU7XG4gICAgICB9XG4gICAgICAvKlxuICAgICAgICogRml2ZSB0eXBlcyB0byBiZSBzcGxpdDpcbiAgICAgICAqIDxpbnM+QTwvaW5zPjxkZWw+QjwvZGVsPlhZPGlucz5DPC9pbnM+PGRlbD5EPC9kZWw+XG4gICAgICAgKiA8aW5zPkE8L2lucz5YPGlucz5DPC9pbnM+PGRlbD5EPC9kZWw+XG4gICAgICAgKiA8aW5zPkE8L2lucz48ZGVsPkI8L2RlbD5YPGlucz5DPC9pbnM+XG4gICAgICAgKiA8aW5zPkE8L2RlbD5YPGlucz5DPC9pbnM+PGRlbD5EPC9kZWw+XG4gICAgICAgKiA8aW5zPkE8L2lucz48ZGVsPkI8L2RlbD5YPGRlbD5DPC9kZWw+XG4gICAgICAgKi9cbiAgICAgIGlmIChsYXN0ZXF1YWxpdHkgJiYgKChwcmVfaW5zICYmIHByZV9kZWwgJiYgcG9zdF9pbnMgJiYgcG9zdF9kZWwpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAoKGxhc3RlcXVhbGl0eS5sZW5ndGggPCB0aGlzLkRpZmZfRWRpdENvc3QgLyAyKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcmVfaW5zICsgcHJlX2RlbCArIHBvc3RfaW5zICsgcG9zdF9kZWwpID09IDMpKSkge1xuICAgICAgICAvLyBEdXBsaWNhdGUgcmVjb3JkLlxuICAgICAgICBkaWZmcy5zcGxpY2UoZXF1YWxpdGllc1tlcXVhbGl0aWVzTGVuZ3RoIC0gMV0sIDAsXG4gICAgICAgICAgW0RJRkZfREVMRVRFLCBsYXN0ZXF1YWxpdHldKTtcbiAgICAgICAgLy8gQ2hhbmdlIHNlY29uZCBjb3B5IHRvIGluc2VydC5cbiAgICAgICAgZGlmZnNbZXF1YWxpdGllc1tlcXVhbGl0aWVzTGVuZ3RoIC0gMV0gKyAxXVswXSA9IERJRkZfSU5TRVJUO1xuICAgICAgICBlcXVhbGl0aWVzTGVuZ3RoLS07ICAvLyBUaHJvdyBhd2F5IHRoZSBlcXVhbGl0eSB3ZSBqdXN0IGRlbGV0ZWQ7XG4gICAgICAgIGxhc3RlcXVhbGl0eSA9IG51bGw7XG4gICAgICAgIGlmIChwcmVfaW5zICYmIHByZV9kZWwpIHtcbiAgICAgICAgICAvLyBObyBjaGFuZ2VzIG1hZGUgd2hpY2ggY291bGQgYWZmZWN0IHByZXZpb3VzIGVudHJ5LCBrZWVwIGdvaW5nLlxuICAgICAgICAgIHBvc3RfaW5zID0gcG9zdF9kZWwgPSB0cnVlO1xuICAgICAgICAgIGVxdWFsaXRpZXNMZW5ndGggPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVxdWFsaXRpZXNMZW5ndGgtLTsgIC8vIFRocm93IGF3YXkgdGhlIHByZXZpb3VzIGVxdWFsaXR5LlxuICAgICAgICAgIHBvaW50ZXIgPSBlcXVhbGl0aWVzTGVuZ3RoID4gMCA/XG4gICAgICAgICAgICAgICAgICAgIGVxdWFsaXRpZXNbZXF1YWxpdGllc0xlbmd0aCAtIDFdIDogLTE7XG4gICAgICAgICAgcG9zdF9pbnMgPSBwb3N0X2RlbCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNoYW5nZXMgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBwb2ludGVyKys7XG4gIH1cblxuICBpZiAoY2hhbmdlcykge1xuICAgIHRoaXMuZGlmZl9jbGVhbnVwTWVyZ2UoZGlmZnMpO1xuICB9XG59O1xuXG5cbi8qKlxuICogUmVvcmRlciBhbmQgbWVyZ2UgbGlrZSBlZGl0IHNlY3Rpb25zLiAgTWVyZ2UgZXF1YWxpdGllcy5cbiAqIEFueSBlZGl0IHNlY3Rpb24gY2FuIG1vdmUgYXMgbG9uZyBhcyBpdCBkb2Vzbid0IGNyb3NzIGFuIGVxdWFsaXR5LlxuICogQHBhcmFtIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSBkaWZmcyBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUuZGlmZl9jbGVhbnVwTWVyZ2UgPSBmdW5jdGlvbihkaWZmcykge1xuICBkaWZmcy5wdXNoKFtESUZGX0VRVUFMLCAnJ10pOyAgLy8gQWRkIGEgZHVtbXkgZW50cnkgYXQgdGhlIGVuZC5cbiAgdmFyIHBvaW50ZXIgPSAwO1xuICB2YXIgY291bnRfZGVsZXRlID0gMDtcbiAgdmFyIGNvdW50X2luc2VydCA9IDA7XG4gIHZhciB0ZXh0X2RlbGV0ZSA9ICcnO1xuICB2YXIgdGV4dF9pbnNlcnQgPSAnJztcbiAgdmFyIGNvbW1vbmxlbmd0aDtcbiAgd2hpbGUgKHBvaW50ZXIgPCBkaWZmcy5sZW5ndGgpIHtcbiAgICBzd2l0Y2ggKGRpZmZzW3BvaW50ZXJdWzBdKSB7XG4gICAgICBjYXNlIERJRkZfSU5TRVJUOlxuICAgICAgICBjb3VudF9pbnNlcnQrKztcbiAgICAgICAgdGV4dF9pbnNlcnQgKz0gZGlmZnNbcG9pbnRlcl1bMV07XG4gICAgICAgIHBvaW50ZXIrKztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERJRkZfREVMRVRFOlxuICAgICAgICBjb3VudF9kZWxldGUrKztcbiAgICAgICAgdGV4dF9kZWxldGUgKz0gZGlmZnNbcG9pbnRlcl1bMV07XG4gICAgICAgIHBvaW50ZXIrKztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERJRkZfRVFVQUw6XG4gICAgICAgIC8vIFVwb24gcmVhY2hpbmcgYW4gZXF1YWxpdHksIGNoZWNrIGZvciBwcmlvciByZWR1bmRhbmNpZXMuXG4gICAgICAgIGlmIChjb3VudF9kZWxldGUgKyBjb3VudF9pbnNlcnQgPiAxKSB7XG4gICAgICAgICAgaWYgKGNvdW50X2RlbGV0ZSAhPT0gMCAmJiBjb3VudF9pbnNlcnQgIT09IDApIHtcbiAgICAgICAgICAgIC8vIEZhY3RvciBvdXQgYW55IGNvbW1vbiBwcmVmaXhpZXMuXG4gICAgICAgICAgICBjb21tb25sZW5ndGggPSB0aGlzLmRpZmZfY29tbW9uUHJlZml4KHRleHRfaW5zZXJ0LCB0ZXh0X2RlbGV0ZSk7XG4gICAgICAgICAgICBpZiAoY29tbW9ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgIGlmICgocG9pbnRlciAtIGNvdW50X2RlbGV0ZSAtIGNvdW50X2luc2VydCkgPiAwICYmXG4gICAgICAgICAgICAgICAgICBkaWZmc1twb2ludGVyIC0gY291bnRfZGVsZXRlIC0gY291bnRfaW5zZXJ0IC0gMV1bMF0gPT1cbiAgICAgICAgICAgICAgICAgIERJRkZfRVFVQUwpIHtcbiAgICAgICAgICAgICAgICBkaWZmc1twb2ludGVyIC0gY291bnRfZGVsZXRlIC0gY291bnRfaW5zZXJ0IC0gMV1bMV0gKz1cbiAgICAgICAgICAgICAgICAgIHRleHRfaW5zZXJ0LnN1YnN0cmluZygwLCBjb21tb25sZW5ndGgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpZmZzLnNwbGljZSgwLCAwLCBbRElGRl9FUVVBTCxcbiAgICAgICAgICAgICAgICAgIHRleHRfaW5zZXJ0LnN1YnN0cmluZygwLCBjb21tb25sZW5ndGgpXSk7XG4gICAgICAgICAgICAgICAgcG9pbnRlcisrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRleHRfaW5zZXJ0ID0gdGV4dF9pbnNlcnQuc3Vic3RyaW5nKGNvbW1vbmxlbmd0aCk7XG4gICAgICAgICAgICAgIHRleHRfZGVsZXRlID0gdGV4dF9kZWxldGUuc3Vic3RyaW5nKGNvbW1vbmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGYWN0b3Igb3V0IGFueSBjb21tb24gc3VmZml4aWVzLlxuICAgICAgICAgICAgY29tbW9ubGVuZ3RoID0gdGhpcy5kaWZmX2NvbW1vblN1ZmZpeCh0ZXh0X2luc2VydCwgdGV4dF9kZWxldGUpO1xuICAgICAgICAgICAgaWYgKGNvbW1vbmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICBkaWZmc1twb2ludGVyXVsxXSA9IHRleHRfaW5zZXJ0LnN1YnN0cmluZyh0ZXh0X2luc2VydC5sZW5ndGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21tb25sZW5ndGgpICsgZGlmZnNbcG9pbnRlcl1bMV07XG4gICAgICAgICAgICAgIHRleHRfaW5zZXJ0ID0gdGV4dF9pbnNlcnQuc3Vic3RyaW5nKDAsIHRleHRfaW5zZXJ0Lmxlbmd0aCAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1vbmxlbmd0aCk7XG4gICAgICAgICAgICAgIHRleHRfZGVsZXRlID0gdGV4dF9kZWxldGUuc3Vic3RyaW5nKDAsIHRleHRfZGVsZXRlLmxlbmd0aCAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1vbmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIERlbGV0ZSB0aGUgb2ZmZW5kaW5nIHJlY29yZHMgYW5kIGFkZCB0aGUgbWVyZ2VkIG9uZXMuXG4gICAgICAgICAgaWYgKGNvdW50X2RlbGV0ZSA9PT0gMCkge1xuICAgICAgICAgICAgZGlmZnMuc3BsaWNlKHBvaW50ZXIgLSBjb3VudF9pbnNlcnQsXG4gICAgICAgICAgICAgIGNvdW50X2RlbGV0ZSArIGNvdW50X2luc2VydCwgW0RJRkZfSU5TRVJULCB0ZXh0X2luc2VydF0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY291bnRfaW5zZXJ0ID09PSAwKSB7XG4gICAgICAgICAgICBkaWZmcy5zcGxpY2UocG9pbnRlciAtIGNvdW50X2RlbGV0ZSxcbiAgICAgICAgICAgICAgY291bnRfZGVsZXRlICsgY291bnRfaW5zZXJ0LCBbRElGRl9ERUxFVEUsIHRleHRfZGVsZXRlXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpZmZzLnNwbGljZShwb2ludGVyIC0gY291bnRfZGVsZXRlIC0gY291bnRfaW5zZXJ0LFxuICAgICAgICAgICAgICBjb3VudF9kZWxldGUgKyBjb3VudF9pbnNlcnQsIFtESUZGX0RFTEVURSwgdGV4dF9kZWxldGVdLFxuICAgICAgICAgICAgICBbRElGRl9JTlNFUlQsIHRleHRfaW5zZXJ0XSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBvaW50ZXIgPSBwb2ludGVyIC0gY291bnRfZGVsZXRlIC0gY291bnRfaW5zZXJ0ICtcbiAgICAgICAgICAgICAgICAgICAgKGNvdW50X2RlbGV0ZSA/IDEgOiAwKSArIChjb3VudF9pbnNlcnQgPyAxIDogMCkgKyAxO1xuICAgICAgICB9IGVsc2UgaWYgKHBvaW50ZXIgIT09IDAgJiYgZGlmZnNbcG9pbnRlciAtIDFdWzBdID09IERJRkZfRVFVQUwpIHtcbiAgICAgICAgICAvLyBNZXJnZSB0aGlzIGVxdWFsaXR5IHdpdGggdGhlIHByZXZpb3VzIG9uZS5cbiAgICAgICAgICBkaWZmc1twb2ludGVyIC0gMV1bMV0gKz0gZGlmZnNbcG9pbnRlcl1bMV07XG4gICAgICAgICAgZGlmZnMuc3BsaWNlKHBvaW50ZXIsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBvaW50ZXIrKztcbiAgICAgICAgfVxuICAgICAgICBjb3VudF9pbnNlcnQgPSAwO1xuICAgICAgICBjb3VudF9kZWxldGUgPSAwO1xuICAgICAgICB0ZXh0X2RlbGV0ZSA9ICcnO1xuICAgICAgICB0ZXh0X2luc2VydCA9ICcnO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGRpZmZzW2RpZmZzLmxlbmd0aCAtIDFdWzFdID09PSAnJykge1xuICAgIGRpZmZzLnBvcCgpOyAgLy8gUmVtb3ZlIHRoZSBkdW1teSBlbnRyeSBhdCB0aGUgZW5kLlxuICB9XG5cbiAgLy8gU2Vjb25kIHBhc3M6IGxvb2sgZm9yIHNpbmdsZSBlZGl0cyBzdXJyb3VuZGVkIG9uIGJvdGggc2lkZXMgYnkgZXF1YWxpdGllc1xuICAvLyB3aGljaCBjYW4gYmUgc2hpZnRlZCBzaWRld2F5cyB0byBlbGltaW5hdGUgYW4gZXF1YWxpdHkuXG4gIC8vIGUuZzogQTxpbnM+QkE8L2lucz5DIC0+IDxpbnM+QUI8L2lucz5BQ1xuICB2YXIgY2hhbmdlcyA9IGZhbHNlO1xuICBwb2ludGVyID0gMTtcbiAgLy8gSW50ZW50aW9uYWxseSBpZ25vcmUgdGhlIGZpcnN0IGFuZCBsYXN0IGVsZW1lbnQgKGRvbid0IG5lZWQgY2hlY2tpbmcpLlxuICB3aGlsZSAocG9pbnRlciA8IGRpZmZzLmxlbmd0aCAtIDEpIHtcbiAgICBpZiAoZGlmZnNbcG9pbnRlciAtIDFdWzBdID09IERJRkZfRVFVQUwgJiZcbiAgICAgICAgZGlmZnNbcG9pbnRlciArIDFdWzBdID09IERJRkZfRVFVQUwpIHtcbiAgICAgIC8vIFRoaXMgaXMgYSBzaW5nbGUgZWRpdCBzdXJyb3VuZGVkIGJ5IGVxdWFsaXRpZXMuXG4gICAgICBpZiAoZGlmZnNbcG9pbnRlcl1bMV0uc3Vic3RyaW5nKGRpZmZzW3BvaW50ZXJdWzFdLmxlbmd0aCAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZzW3BvaW50ZXIgLSAxXVsxXS5sZW5ndGgpID09IGRpZmZzW3BvaW50ZXIgLSAxXVsxXSkge1xuICAgICAgICAvLyBTaGlmdCB0aGUgZWRpdCBvdmVyIHRoZSBwcmV2aW91cyBlcXVhbGl0eS5cbiAgICAgICAgZGlmZnNbcG9pbnRlcl1bMV0gPSBkaWZmc1twb2ludGVyIC0gMV1bMV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZzW3BvaW50ZXJdWzFdLnN1YnN0cmluZygwLCBkaWZmc1twb2ludGVyXVsxXS5sZW5ndGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmc1twb2ludGVyIC0gMV1bMV0ubGVuZ3RoKTtcbiAgICAgICAgZGlmZnNbcG9pbnRlciArIDFdWzFdID0gZGlmZnNbcG9pbnRlciAtIDFdWzFdICsgZGlmZnNbcG9pbnRlciArIDFdWzFdO1xuICAgICAgICBkaWZmcy5zcGxpY2UocG9pbnRlciAtIDEsIDEpO1xuICAgICAgICBjaGFuZ2VzID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZGlmZnNbcG9pbnRlcl1bMV0uc3Vic3RyaW5nKDAsIGRpZmZzW3BvaW50ZXIgKyAxXVsxXS5sZW5ndGgpID09XG4gICAgICAgICAgICAgICAgIGRpZmZzW3BvaW50ZXIgKyAxXVsxXSkge1xuICAgICAgICAvLyBTaGlmdCB0aGUgZWRpdCBvdmVyIHRoZSBuZXh0IGVxdWFsaXR5LlxuICAgICAgICBkaWZmc1twb2ludGVyIC0gMV1bMV0gKz0gZGlmZnNbcG9pbnRlciArIDFdWzFdO1xuICAgICAgICBkaWZmc1twb2ludGVyXVsxXSA9XG4gICAgICAgICAgZGlmZnNbcG9pbnRlcl1bMV0uc3Vic3RyaW5nKGRpZmZzW3BvaW50ZXIgKyAxXVsxXS5sZW5ndGgpICtcbiAgICAgICAgICBkaWZmc1twb2ludGVyICsgMV1bMV07XG4gICAgICAgIGRpZmZzLnNwbGljZShwb2ludGVyICsgMSwgMSk7XG4gICAgICAgIGNoYW5nZXMgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBwb2ludGVyKys7XG4gIH1cbiAgLy8gSWYgc2hpZnRzIHdlcmUgbWFkZSwgdGhlIGRpZmYgbmVlZHMgcmVvcmRlcmluZyBhbmQgYW5vdGhlciBzaGlmdCBzd2VlcC5cbiAgaWYgKGNoYW5nZXMpIHtcbiAgICB0aGlzLmRpZmZfY2xlYW51cE1lcmdlKGRpZmZzKTtcbiAgfVxufTtcblxuXG4vKipcbiAqIGxvYyBpcyBhIGxvY2F0aW9uIGluIHRleHQxLCBjb21wdXRlIGFuZCByZXR1cm4gdGhlIGVxdWl2YWxlbnQgbG9jYXRpb24gaW5cbiAqIHRleHQyLlxuICogZS5nLiAnVGhlIGNhdCcgdnMgJ1RoZSBiaWcgY2F0JywgMS0+MSwgNS0+OFxuICogQHBhcmFtIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSBkaWZmcyBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsb2MgTG9jYXRpb24gd2l0aGluIHRleHQxLlxuICogQHJldHVybiB7bnVtYmVyfSBMb2NhdGlvbiB3aXRoaW4gdGV4dDIuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfeEluZGV4ID0gZnVuY3Rpb24oZGlmZnMsIGxvYykge1xuICB2YXIgY2hhcnMxID0gMDtcbiAgdmFyIGNoYXJzMiA9IDA7XG4gIHZhciBsYXN0X2NoYXJzMSA9IDA7XG4gIHZhciBsYXN0X2NoYXJzMiA9IDA7XG4gIHZhciB4O1xuICBmb3IgKHggPSAwOyB4IDwgZGlmZnMubGVuZ3RoOyB4KyspIHtcbiAgICBpZiAoZGlmZnNbeF1bMF0gIT09IERJRkZfSU5TRVJUKSB7ICAvLyBFcXVhbGl0eSBvciBkZWxldGlvbi5cbiAgICAgIGNoYXJzMSArPSBkaWZmc1t4XVsxXS5sZW5ndGg7XG4gICAgfVxuICAgIGlmIChkaWZmc1t4XVswXSAhPT0gRElGRl9ERUxFVEUpIHsgIC8vIEVxdWFsaXR5IG9yIGluc2VydGlvbi5cbiAgICAgIGNoYXJzMiArPSBkaWZmc1t4XVsxXS5sZW5ndGg7XG4gICAgfVxuICAgIGlmIChjaGFyczEgPiBsb2MpIHsgIC8vIE92ZXJzaG90IHRoZSBsb2NhdGlvbi5cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBsYXN0X2NoYXJzMSA9IGNoYXJzMTtcbiAgICBsYXN0X2NoYXJzMiA9IGNoYXJzMjtcbiAgfVxuICAvLyBXYXMgdGhlIGxvY2F0aW9uIHdhcyBkZWxldGVkP1xuICBpZiAoZGlmZnMubGVuZ3RoICE9IHggJiYgZGlmZnNbeF1bMF0gPT09IERJRkZfREVMRVRFKSB7XG4gICAgcmV0dXJuIGxhc3RfY2hhcnMyO1xuICB9XG4gIC8vIEFkZCB0aGUgcmVtYWluaW5nIGNoYXJhY3RlciBsZW5ndGguXG4gIHJldHVybiBsYXN0X2NoYXJzMiArIChsb2MgLSBsYXN0X2NoYXJzMSk7XG59O1xuXG5cbi8qKlxuICogQ29udmVydCBhIGRpZmYgYXJyYXkgaW50byBhIHByZXR0eSBIVE1MIHJlcG9ydC5cbiAqIEBwYXJhbSB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gZGlmZnMgQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IEhUTUwgcmVwcmVzZW50YXRpb24uXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfcHJldHR5SHRtbCA9IGZ1bmN0aW9uKGRpZmZzKSB7XG4gIHZhciBodG1sID0gW107XG4gIHZhciBwYXR0ZXJuX2FtcCA9IC8mL2c7XG4gIHZhciBwYXR0ZXJuX2x0ID0gLzwvZztcbiAgdmFyIHBhdHRlcm5fZ3QgPSAvPi9nO1xuICB2YXIgcGF0dGVybl9wYXJhID0gL1xcbi9nO1xuICBmb3IgKHZhciB4ID0gMDsgeCA8IGRpZmZzLmxlbmd0aDsgeCsrKSB7XG4gICAgdmFyIG9wID0gZGlmZnNbeF1bMF07ICAgIC8vIE9wZXJhdGlvbiAoaW5zZXJ0LCBkZWxldGUsIGVxdWFsKVxuICAgIHZhciBkYXRhID0gZGlmZnNbeF1bMV07ICAvLyBUZXh0IG9mIGNoYW5nZS5cbiAgICB2YXIgdGV4dCA9IGRhdGEucmVwbGFjZShwYXR0ZXJuX2FtcCwgJyZhbXA7JykucmVwbGFjZShwYXR0ZXJuX2x0LCAnJmx0OycpXG4gICAgICAucmVwbGFjZShwYXR0ZXJuX2d0LCAnJmd0OycpLnJlcGxhY2UocGF0dGVybl9wYXJhLCAnJnBhcmE7PGJyPicpO1xuICAgIHN3aXRjaCAob3ApIHtcbiAgICAgIGNhc2UgRElGRl9JTlNFUlQ6XG4gICAgICAgIGh0bWxbeF0gPSAnPGlucyBzdHlsZT1cImJhY2tncm91bmQ6I2U2ZmZlNjtcIj4nICsgdGV4dCArICc8L2lucz4nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRElGRl9ERUxFVEU6XG4gICAgICAgIGh0bWxbeF0gPSAnPGRlbCBzdHlsZT1cImJhY2tncm91bmQ6I2ZmZTZlNjtcIj4nICsgdGV4dCArICc8L2RlbD4nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRElGRl9FUVVBTDpcbiAgICAgICAgaHRtbFt4XSA9ICc8c3Bhbj4nICsgdGV4dCArICc8L3NwYW4+JztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBodG1sLmpvaW4oJycpO1xufTtcblxuXG4vKipcbiAqIENvbXB1dGUgYW5kIHJldHVybiB0aGUgc291cmNlIHRleHQgKGFsbCBlcXVhbGl0aWVzIGFuZCBkZWxldGlvbnMpLlxuICogQHBhcmFtIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSBkaWZmcyBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqIEByZXR1cm4ge3N0cmluZ30gU291cmNlIHRleHQuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfdGV4dDEgPSBmdW5jdGlvbihkaWZmcykge1xuICB2YXIgdGV4dCA9IFtdO1xuICBmb3IgKHZhciB4ID0gMDsgeCA8IGRpZmZzLmxlbmd0aDsgeCsrKSB7XG4gICAgaWYgKGRpZmZzW3hdWzBdICE9PSBESUZGX0lOU0VSVCkge1xuICAgICAgdGV4dFt4XSA9IGRpZmZzW3hdWzFdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGV4dC5qb2luKCcnKTtcbn07XG5cblxuLyoqXG4gKiBDb21wdXRlIGFuZCByZXR1cm4gdGhlIGRlc3RpbmF0aW9uIHRleHQgKGFsbCBlcXVhbGl0aWVzIGFuZCBpbnNlcnRpb25zKS5cbiAqIEBwYXJhbSB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gZGlmZnMgQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IERlc3RpbmF0aW9uIHRleHQuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLmRpZmZfdGV4dDIgPSBmdW5jdGlvbihkaWZmcykge1xuICB2YXIgdGV4dCA9IFtdO1xuICBmb3IgKHZhciB4ID0gMDsgeCA8IGRpZmZzLmxlbmd0aDsgeCsrKSB7XG4gICAgaWYgKGRpZmZzW3hdWzBdICE9PSBESUZGX0RFTEVURSkge1xuICAgICAgdGV4dFt4XSA9IGRpZmZzW3hdWzFdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGV4dC5qb2luKCcnKTtcbn07XG5cblxuLyoqXG4gKiBDb21wdXRlIHRoZSBMZXZlbnNodGVpbiBkaXN0YW5jZTsgdGhlIG51bWJlciBvZiBpbnNlcnRlZCwgZGVsZXRlZCBvclxuICogc3Vic3RpdHV0ZWQgY2hhcmFjdGVycy5cbiAqIEBwYXJhbSB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gZGlmZnMgQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IE51bWJlciBvZiBjaGFuZ2VzLlxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX2xldmVuc2h0ZWluID0gZnVuY3Rpb24oZGlmZnMpIHtcbiAgdmFyIGxldmVuc2h0ZWluID0gMDtcbiAgdmFyIGluc2VydGlvbnMgPSAwO1xuICB2YXIgZGVsZXRpb25zID0gMDtcbiAgZm9yICh2YXIgeCA9IDA7IHggPCBkaWZmcy5sZW5ndGg7IHgrKykge1xuICAgIHZhciBvcCA9IGRpZmZzW3hdWzBdO1xuICAgIHZhciBkYXRhID0gZGlmZnNbeF1bMV07XG4gICAgc3dpdGNoIChvcCkge1xuICAgICAgY2FzZSBESUZGX0lOU0VSVDpcbiAgICAgICAgaW5zZXJ0aW9ucyArPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERJRkZfREVMRVRFOlxuICAgICAgICBkZWxldGlvbnMgKz0gZGF0YS5sZW5ndGg7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBESUZGX0VRVUFMOlxuICAgICAgICAvLyBBIGRlbGV0aW9uIGFuZCBhbiBpbnNlcnRpb24gaXMgb25lIHN1YnN0aXR1dGlvbi5cbiAgICAgICAgbGV2ZW5zaHRlaW4gKz0gTWF0aC5tYXgoaW5zZXJ0aW9ucywgZGVsZXRpb25zKTtcbiAgICAgICAgaW5zZXJ0aW9ucyA9IDA7XG4gICAgICAgIGRlbGV0aW9ucyA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBsZXZlbnNodGVpbiArPSBNYXRoLm1heChpbnNlcnRpb25zLCBkZWxldGlvbnMpO1xuICByZXR1cm4gbGV2ZW5zaHRlaW47XG59O1xuXG5cbi8qKlxuICogQ3J1c2ggdGhlIGRpZmYgaW50byBhbiBlbmNvZGVkIHN0cmluZyB3aGljaCBkZXNjcmliZXMgdGhlIG9wZXJhdGlvbnNcbiAqIHJlcXVpcmVkIHRvIHRyYW5zZm9ybSB0ZXh0MSBpbnRvIHRleHQyLlxuICogRS5nLiA9M1xcdC0yXFx0K2luZyAgLT4gS2VlcCAzIGNoYXJzLCBkZWxldGUgMiBjaGFycywgaW5zZXJ0ICdpbmcnLlxuICogT3BlcmF0aW9ucyBhcmUgdGFiLXNlcGFyYXRlZC4gIEluc2VydGVkIHRleHQgaXMgZXNjYXBlZCB1c2luZyAleHggbm90YXRpb24uXG4gKiBAcGFyYW0geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59IGRpZmZzIEFycmF5IG9mIGRpZmYgdHVwbGVzLlxuICogQHJldHVybiB7c3RyaW5nfSBEZWx0YSB0ZXh0LlxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX3RvRGVsdGEgPSBmdW5jdGlvbihkaWZmcykge1xuICB2YXIgdGV4dCA9IFtdO1xuICBmb3IgKHZhciB4ID0gMDsgeCA8IGRpZmZzLmxlbmd0aDsgeCsrKSB7XG4gICAgc3dpdGNoIChkaWZmc1t4XVswXSkge1xuICAgICAgY2FzZSBESUZGX0lOU0VSVDpcbiAgICAgICAgdGV4dFt4XSA9ICcrJyArIGVuY29kZVVSSShkaWZmc1t4XVsxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBESUZGX0RFTEVURTpcbiAgICAgICAgdGV4dFt4XSA9ICctJyArIGRpZmZzW3hdWzFdLmxlbmd0aDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERJRkZfRVFVQUw6XG4gICAgICAgIHRleHRbeF0gPSAnPScgKyBkaWZmc1t4XVsxXS5sZW5ndGg7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGV4dC5qb2luKCdcXHQnKS5yZXBsYWNlKC8lMjAvZywgJyAnKTtcbn07XG5cblxuLyoqXG4gKiBHaXZlbiB0aGUgb3JpZ2luYWwgdGV4dDEsIGFuZCBhbiBlbmNvZGVkIHN0cmluZyB3aGljaCBkZXNjcmliZXMgdGhlXG4gKiBvcGVyYXRpb25zIHJlcXVpcmVkIHRvIHRyYW5zZm9ybSB0ZXh0MSBpbnRvIHRleHQyLCBjb21wdXRlIHRoZSBmdWxsIGRpZmYuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDEgU291cmNlIHN0cmluZyBmb3IgdGhlIGRpZmYuXG4gKiBAcGFyYW0ge3N0cmluZ30gZGVsdGEgRGVsdGEgdGV4dC5cbiAqIEByZXR1cm4geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59IEFycmF5IG9mIGRpZmYgdHVwbGVzLlxuICogQHRocm93cyB7IUVycm9yfSBJZiBpbnZhbGlkIGlucHV0LlxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5kaWZmX2Zyb21EZWx0YSA9IGZ1bmN0aW9uKHRleHQxLCBkZWx0YSkge1xuICB2YXIgZGlmZnMgPSBbXTtcbiAgdmFyIGRpZmZzTGVuZ3RoID0gMDsgIC8vIEtlZXBpbmcgb3VyIG93biBsZW5ndGggdmFyIGlzIGZhc3RlciBpbiBKUy5cbiAgdmFyIHBvaW50ZXIgPSAwOyAgLy8gQ3Vyc29yIGluIHRleHQxXG4gIHZhciB0b2tlbnMgPSBkZWx0YS5zcGxpdCgvXFx0L2cpO1xuICBmb3IgKHZhciB4ID0gMDsgeCA8IHRva2Vucy5sZW5ndGg7IHgrKykge1xuICAgIC8vIEVhY2ggdG9rZW4gYmVnaW5zIHdpdGggYSBvbmUgY2hhcmFjdGVyIHBhcmFtZXRlciB3aGljaCBzcGVjaWZpZXMgdGhlXG4gICAgLy8gb3BlcmF0aW9uIG9mIHRoaXMgdG9rZW4gKGRlbGV0ZSwgaW5zZXJ0LCBlcXVhbGl0eSkuXG4gICAgdmFyIHBhcmFtID0gdG9rZW5zW3hdLnN1YnN0cmluZygxKTtcbiAgICBzd2l0Y2ggKHRva2Vuc1t4XS5jaGFyQXQoMCkpIHtcbiAgICAgIGNhc2UgJysnOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIGRpZmZzW2RpZmZzTGVuZ3RoKytdID0gW0RJRkZfSU5TRVJULCBkZWNvZGVVUkkocGFyYW0pXTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAvLyBNYWxmb3JtZWQgVVJJIHNlcXVlbmNlLlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSWxsZWdhbCBlc2NhcGUgaW4gZGlmZl9mcm9tRGVsdGE6ICcgKyBwYXJhbSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICctJzpcbiAgICAgIC8vIEZhbGwgdGhyb3VnaC5cbiAgICAgIGNhc2UgJz0nOlxuICAgICAgICB2YXIgbiA9IHBhcnNlSW50KHBhcmFtLCAxMCk7XG4gICAgICAgIGlmIChpc05hTihuKSB8fCBuIDwgMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBudW1iZXIgaW4gZGlmZl9mcm9tRGVsdGE6ICcgKyBwYXJhbSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRleHQgPSB0ZXh0MS5zdWJzdHJpbmcocG9pbnRlciwgcG9pbnRlciArPSBuKTtcbiAgICAgICAgaWYgKHRva2Vuc1t4XS5jaGFyQXQoMCkgPT0gJz0nKSB7XG4gICAgICAgICAgZGlmZnNbZGlmZnNMZW5ndGgrK10gPSBbRElGRl9FUVVBTCwgdGV4dF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlmZnNbZGlmZnNMZW5ndGgrK10gPSBbRElGRl9ERUxFVEUsIHRleHRdO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gQmxhbmsgdG9rZW5zIGFyZSBvayAoZnJvbSBhIHRyYWlsaW5nIFxcdCkuXG4gICAgICAgIC8vIEFueXRoaW5nIGVsc2UgaXMgYW4gZXJyb3IuXG4gICAgICAgIGlmICh0b2tlbnNbeF0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZGlmZiBvcGVyYXRpb24gaW4gZGlmZl9mcm9tRGVsdGE6ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnNbeF0pO1xuICAgICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChwb2ludGVyICE9IHRleHQxLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRGVsdGEgbGVuZ3RoICgnICsgcG9pbnRlciArXG4gICAgICAgICAgICAgICAgICAgICcpIGRvZXMgbm90IGVxdWFsIHNvdXJjZSB0ZXh0IGxlbmd0aCAoJyArIHRleHQxLmxlbmd0aCArICcpLicpO1xuICB9XG4gIHJldHVybiBkaWZmcztcbn07XG5cblxuLy8gIE1BVENIIEZVTkNUSU9OU1xuXG5cbi8qKlxuICogTG9jYXRlIHRoZSBiZXN0IGluc3RhbmNlIG9mICdwYXR0ZXJuJyBpbiAndGV4dCcgbmVhciAnbG9jJy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFRoZSB0ZXh0IHRvIHNlYXJjaC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuIFRoZSBwYXR0ZXJuIHRvIHNlYXJjaCBmb3IuXG4gKiBAcGFyYW0ge251bWJlcn0gbG9jIFRoZSBsb2NhdGlvbiB0byBzZWFyY2ggYXJvdW5kLlxuICogQHJldHVybiB7bnVtYmVyfSBCZXN0IG1hdGNoIGluZGV4IG9yIC0xLlxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5tYXRjaF9tYWluID0gZnVuY3Rpb24odGV4dCwgcGF0dGVybiwgbG9jKSB7XG4gIC8vIENoZWNrIGZvciBudWxsIGlucHV0cy5cbiAgaWYgKHRleHQgPT0gbnVsbCB8fCBwYXR0ZXJuID09IG51bGwgfHwgbG9jID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ051bGwgaW5wdXQuIChtYXRjaF9tYWluKScpO1xuICB9XG5cbiAgbG9jID0gTWF0aC5tYXgoMCwgTWF0aC5taW4obG9jLCB0ZXh0Lmxlbmd0aCkpO1xuICBpZiAodGV4dCA9PSBwYXR0ZXJuKSB7XG4gICAgLy8gU2hvcnRjdXQgKHBvdGVudGlhbGx5IG5vdCBndWFyYW50ZWVkIGJ5IHRoZSBhbGdvcml0aG0pXG4gICAgcmV0dXJuIDA7XG4gIH0gZWxzZSBpZiAoIXRleHQubGVuZ3RoKSB7XG4gICAgLy8gTm90aGluZyB0byBtYXRjaC5cbiAgICByZXR1cm4gLTE7XG4gIH0gZWxzZSBpZiAodGV4dC5zdWJzdHJpbmcobG9jLCBsb2MgKyBwYXR0ZXJuLmxlbmd0aCkgPT0gcGF0dGVybikge1xuICAgIC8vIFBlcmZlY3QgbWF0Y2ggYXQgdGhlIHBlcmZlY3Qgc3BvdCEgIChJbmNsdWRlcyBjYXNlIG9mIG51bGwgcGF0dGVybilcbiAgICByZXR1cm4gbG9jO1xuICB9IGVsc2Uge1xuICAgIC8vIERvIGEgZnV6enkgY29tcGFyZS5cbiAgICByZXR1cm4gdGhpcy5tYXRjaF9iaXRhcF8odGV4dCwgcGF0dGVybiwgbG9jKTtcbiAgfVxufTtcblxuXG4vKipcbiAqIExvY2F0ZSB0aGUgYmVzdCBpbnN0YW5jZSBvZiAncGF0dGVybicgaW4gJ3RleHQnIG5lYXIgJ2xvYycgdXNpbmcgdGhlXG4gKiBCaXRhcCBhbGdvcml0aG0uXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBUaGUgdGV4dCB0byBzZWFyY2guXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0dGVybiBUaGUgcGF0dGVybiB0byBzZWFyY2ggZm9yLlxuICogQHBhcmFtIHtudW1iZXJ9IGxvYyBUaGUgbG9jYXRpb24gdG8gc2VhcmNoIGFyb3VuZC5cbiAqIEByZXR1cm4ge251bWJlcn0gQmVzdCBtYXRjaCBpbmRleCBvciAtMS5cbiAqIEBwcml2YXRlXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLm1hdGNoX2JpdGFwXyA9IGZ1bmN0aW9uKHRleHQsIHBhdHRlcm4sIGxvYykge1xuICBpZiAocGF0dGVybi5sZW5ndGggPiB0aGlzLk1hdGNoX01heEJpdHMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhdHRlcm4gdG9vIGxvbmcgZm9yIHRoaXMgYnJvd3Nlci4nKTtcbiAgfVxuXG4gIC8vIEluaXRpYWxpc2UgdGhlIGFscGhhYmV0LlxuICB2YXIgcyA9IHRoaXMubWF0Y2hfYWxwaGFiZXRfKHBhdHRlcm4pO1xuXG4gIHZhciBkbXAgPSB0aGlzOyAgLy8gJ3RoaXMnIGJlY29tZXMgJ3dpbmRvdycgaW4gYSBjbG9zdXJlLlxuXG4gIC8qKlxuICAgKiBDb21wdXRlIGFuZCByZXR1cm4gdGhlIHNjb3JlIGZvciBhIG1hdGNoIHdpdGggZSBlcnJvcnMgYW5kIHggbG9jYXRpb24uXG4gICAqIEFjY2Vzc2VzIGxvYyBhbmQgcGF0dGVybiB0aHJvdWdoIGJlaW5nIGEgY2xvc3VyZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGUgTnVtYmVyIG9mIGVycm9ycyBpbiBtYXRjaC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHggTG9jYXRpb24gb2YgbWF0Y2guXG4gICAqIEByZXR1cm4ge251bWJlcn0gT3ZlcmFsbCBzY29yZSBmb3IgbWF0Y2ggKDAuMCA9IGdvb2QsIDEuMCA9IGJhZCkuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBtYXRjaF9iaXRhcFNjb3JlXyhlLCB4KSB7XG4gICAgdmFyIGFjY3VyYWN5ID0gZSAvIHBhdHRlcm4ubGVuZ3RoO1xuICAgIHZhciBwcm94aW1pdHkgPSBNYXRoLmFicyhsb2MgLSB4KTtcbiAgICBpZiAoIWRtcC5NYXRjaF9EaXN0YW5jZSkge1xuICAgICAgLy8gRG9kZ2UgZGl2aWRlIGJ5IHplcm8gZXJyb3IuXG4gICAgICByZXR1cm4gcHJveGltaXR5ID8gMS4wIDogYWNjdXJhY3k7XG4gICAgfVxuICAgIHJldHVybiBhY2N1cmFjeSArIChwcm94aW1pdHkgLyBkbXAuTWF0Y2hfRGlzdGFuY2UpO1xuICB9XG5cbiAgLy8gSGlnaGVzdCBzY29yZSBiZXlvbmQgd2hpY2ggd2UgZ2l2ZSB1cC5cbiAgdmFyIHNjb3JlX3RocmVzaG9sZCA9IHRoaXMuTWF0Y2hfVGhyZXNob2xkO1xuICAvLyBJcyB0aGVyZSBhIG5lYXJieSBleGFjdCBtYXRjaD8gKHNwZWVkdXApXG4gIHZhciBiZXN0X2xvYyA9IHRleHQuaW5kZXhPZihwYXR0ZXJuLCBsb2MpO1xuICBpZiAoYmVzdF9sb2MgIT0gLTEpIHtcbiAgICBzY29yZV90aHJlc2hvbGQgPSBNYXRoLm1pbihtYXRjaF9iaXRhcFNjb3JlXygwLCBiZXN0X2xvYyksIHNjb3JlX3RocmVzaG9sZCk7XG4gICAgLy8gV2hhdCBhYm91dCBpbiB0aGUgb3RoZXIgZGlyZWN0aW9uPyAoc3BlZWR1cClcbiAgICBiZXN0X2xvYyA9IHRleHQubGFzdEluZGV4T2YocGF0dGVybiwgbG9jICsgcGF0dGVybi5sZW5ndGgpO1xuICAgIGlmIChiZXN0X2xvYyAhPSAtMSkge1xuICAgICAgc2NvcmVfdGhyZXNob2xkID1cbiAgICAgICAgTWF0aC5taW4obWF0Y2hfYml0YXBTY29yZV8oMCwgYmVzdF9sb2MpLCBzY29yZV90aHJlc2hvbGQpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEluaXRpYWxpc2UgdGhlIGJpdCBhcnJheXMuXG4gIHZhciBtYXRjaG1hc2sgPSAxIDw8IChwYXR0ZXJuLmxlbmd0aCAtIDEpO1xuICBiZXN0X2xvYyA9IC0xO1xuXG4gIHZhciBiaW5fbWluLCBiaW5fbWlkO1xuICB2YXIgYmluX21heCA9IHBhdHRlcm4ubGVuZ3RoICsgdGV4dC5sZW5ndGg7XG4gIHZhciBsYXN0X3JkO1xuICBmb3IgKHZhciBkID0gMDsgZCA8IHBhdHRlcm4ubGVuZ3RoOyBkKyspIHtcbiAgICAvLyBTY2FuIGZvciB0aGUgYmVzdCBtYXRjaDsgZWFjaCBpdGVyYXRpb24gYWxsb3dzIGZvciBvbmUgbW9yZSBlcnJvci5cbiAgICAvLyBSdW4gYSBiaW5hcnkgc2VhcmNoIHRvIGRldGVybWluZSBob3cgZmFyIGZyb20gJ2xvYycgd2UgY2FuIHN0cmF5IGF0IHRoaXNcbiAgICAvLyBlcnJvciBsZXZlbC5cbiAgICBiaW5fbWluID0gMDtcbiAgICBiaW5fbWlkID0gYmluX21heDtcbiAgICB3aGlsZSAoYmluX21pbiA8IGJpbl9taWQpIHtcbiAgICAgIGlmIChtYXRjaF9iaXRhcFNjb3JlXyhkLCBsb2MgKyBiaW5fbWlkKSA8PSBzY29yZV90aHJlc2hvbGQpIHtcbiAgICAgICAgYmluX21pbiA9IGJpbl9taWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBiaW5fbWF4ID0gYmluX21pZDtcbiAgICAgIH1cbiAgICAgIGJpbl9taWQgPSBNYXRoLmZsb29yKChiaW5fbWF4IC0gYmluX21pbikgLyAyICsgYmluX21pbik7XG4gICAgfVxuICAgIC8vIFVzZSB0aGUgcmVzdWx0IGZyb20gdGhpcyBpdGVyYXRpb24gYXMgdGhlIG1heGltdW0gZm9yIHRoZSBuZXh0LlxuICAgIGJpbl9tYXggPSBiaW5fbWlkO1xuICAgIHZhciBzdGFydCA9IE1hdGgubWF4KDEsIGxvYyAtIGJpbl9taWQgKyAxKTtcbiAgICB2YXIgZmluaXNoID0gTWF0aC5taW4obG9jICsgYmluX21pZCwgdGV4dC5sZW5ndGgpICsgcGF0dGVybi5sZW5ndGg7XG5cbiAgICB2YXIgcmQgPSBBcnJheShmaW5pc2ggKyAyKTtcbiAgICByZFtmaW5pc2ggKyAxXSA9ICgxIDw8IGQpIC0gMTtcbiAgICBmb3IgKHZhciBqID0gZmluaXNoOyBqID49IHN0YXJ0OyBqLS0pIHtcbiAgICAgIC8vIFRoZSBhbHBoYWJldCAocykgaXMgYSBzcGFyc2UgaGFzaCwgc28gdGhlIGZvbGxvd2luZyBsaW5lIGdlbmVyYXRlc1xuICAgICAgLy8gd2FybmluZ3MuXG4gICAgICB2YXIgY2hhck1hdGNoID0gc1t0ZXh0LmNoYXJBdChqIC0gMSldO1xuICAgICAgaWYgKGQgPT09IDApIHsgIC8vIEZpcnN0IHBhc3M6IGV4YWN0IG1hdGNoLlxuICAgICAgICByZFtqXSA9ICgocmRbaiArIDFdIDw8IDEpIHwgMSkgJiBjaGFyTWF0Y2g7XG4gICAgICB9IGVsc2UgeyAgLy8gU3Vic2VxdWVudCBwYXNzZXM6IGZ1enp5IG1hdGNoLlxuICAgICAgICByZFtqXSA9ICgoKHJkW2ogKyAxXSA8PCAxKSB8IDEpICYgY2hhck1hdGNoKSB8XG4gICAgICAgICAgICAgICAgKCgobGFzdF9yZFtqICsgMV0gfCBsYXN0X3JkW2pdKSA8PCAxKSB8IDEpIHxcbiAgICAgICAgICAgICAgICBsYXN0X3JkW2ogKyAxXTtcbiAgICAgIH1cbiAgICAgIGlmIChyZFtqXSAmIG1hdGNobWFzaykge1xuICAgICAgICB2YXIgc2NvcmUgPSBtYXRjaF9iaXRhcFNjb3JlXyhkLCBqIC0gMSk7XG4gICAgICAgIC8vIFRoaXMgbWF0Y2ggd2lsbCBhbG1vc3QgY2VydGFpbmx5IGJlIGJldHRlciB0aGFuIGFueSBleGlzdGluZyBtYXRjaC5cbiAgICAgICAgLy8gQnV0IGNoZWNrIGFueXdheS5cbiAgICAgICAgaWYgKHNjb3JlIDw9IHNjb3JlX3RocmVzaG9sZCkge1xuICAgICAgICAgIC8vIFRvbGQgeW91IHNvLlxuICAgICAgICAgIHNjb3JlX3RocmVzaG9sZCA9IHNjb3JlO1xuICAgICAgICAgIGJlc3RfbG9jID0gaiAtIDE7XG4gICAgICAgICAgaWYgKGJlc3RfbG9jID4gbG9jKSB7XG4gICAgICAgICAgICAvLyBXaGVuIHBhc3NpbmcgbG9jLCBkb24ndCBleGNlZWQgb3VyIGN1cnJlbnQgZGlzdGFuY2UgZnJvbSBsb2MuXG4gICAgICAgICAgICBzdGFydCA9IE1hdGgubWF4KDEsIDIgKiBsb2MgLSBiZXN0X2xvYyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEFscmVhZHkgcGFzc2VkIGxvYywgZG93bmhpbGwgZnJvbSBoZXJlIG9uIGluLlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE5vIGhvcGUgZm9yIGEgKGJldHRlcikgbWF0Y2ggYXQgZ3JlYXRlciBlcnJvciBsZXZlbHMuXG4gICAgaWYgKG1hdGNoX2JpdGFwU2NvcmVfKGQgKyAxLCBsb2MpID4gc2NvcmVfdGhyZXNob2xkKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgbGFzdF9yZCA9IHJkO1xuICB9XG4gIHJldHVybiBiZXN0X2xvYztcbn07XG5cblxuLyoqXG4gKiBJbml0aWFsaXNlIHRoZSBhbHBoYWJldCBmb3IgdGhlIEJpdGFwIGFsZ29yaXRobS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuIFRoZSB0ZXh0IHRvIGVuY29kZS5cbiAqIEByZXR1cm4geyFPYmplY3R9IEhhc2ggb2YgY2hhcmFjdGVyIGxvY2F0aW9ucy5cbiAqIEBwcml2YXRlXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLm1hdGNoX2FscGhhYmV0XyA9IGZ1bmN0aW9uKHBhdHRlcm4pIHtcbiAgdmFyIHMgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXR0ZXJuLmxlbmd0aDsgaSsrKSB7XG4gICAgc1twYXR0ZXJuLmNoYXJBdChpKV0gPSAwO1xuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0dGVybi5sZW5ndGg7IGkrKykge1xuICAgIHNbcGF0dGVybi5jaGFyQXQoaSldIHw9IDEgPDwgKHBhdHRlcm4ubGVuZ3RoIC0gaSAtIDEpO1xuICB9XG4gIHJldHVybiBzO1xufTtcblxuXG4vLyAgUEFUQ0ggRlVOQ1RJT05TXG5cblxuLyoqXG4gKiBJbmNyZWFzZSB0aGUgY29udGV4dCB1bnRpbCBpdCBpcyB1bmlxdWUsXG4gKiBidXQgZG9uJ3QgbGV0IHRoZSBwYXR0ZXJuIGV4cGFuZCBiZXlvbmQgTWF0Y2hfTWF4Qml0cy5cbiAqIEBwYXJhbSB7IWRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqfSBwYXRjaCBUaGUgcGF0Y2ggdG8gZ3Jvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSB0ZXh0LlxuICogQHByaXZhdGVcbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUucGF0Y2hfYWRkQ29udGV4dF8gPSBmdW5jdGlvbihwYXRjaCwgdGV4dCkge1xuICBpZiAodGV4dC5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcGF0dGVybiA9IHRleHQuc3Vic3RyaW5nKHBhdGNoLnN0YXJ0MiwgcGF0Y2guc3RhcnQyICsgcGF0Y2gubGVuZ3RoMSk7XG4gIHZhciBwYWRkaW5nID0gMDtcblxuICAvLyBMb29rIGZvciB0aGUgZmlyc3QgYW5kIGxhc3QgbWF0Y2hlcyBvZiBwYXR0ZXJuIGluIHRleHQuICBJZiB0d28gZGlmZmVyZW50XG4gIC8vIG1hdGNoZXMgYXJlIGZvdW5kLCBpbmNyZWFzZSB0aGUgcGF0dGVybiBsZW5ndGguXG4gIHdoaWxlICh0ZXh0LmluZGV4T2YocGF0dGVybikgIT0gdGV4dC5sYXN0SW5kZXhPZihwYXR0ZXJuKSAmJlxuICAgICAgICAgcGF0dGVybi5sZW5ndGggPCB0aGlzLk1hdGNoX01heEJpdHMgLSB0aGlzLlBhdGNoX01hcmdpbiAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuUGF0Y2hfTWFyZ2luKSB7XG4gICAgcGFkZGluZyArPSB0aGlzLlBhdGNoX01hcmdpbjtcbiAgICBwYXR0ZXJuID0gdGV4dC5zdWJzdHJpbmcocGF0Y2guc3RhcnQyIC0gcGFkZGluZyxcbiAgICAgIHBhdGNoLnN0YXJ0MiArIHBhdGNoLmxlbmd0aDEgKyBwYWRkaW5nKTtcbiAgfVxuICAvLyBBZGQgb25lIGNodW5rIGZvciBnb29kIGx1Y2suXG4gIHBhZGRpbmcgKz0gdGhpcy5QYXRjaF9NYXJnaW47XG5cbiAgLy8gQWRkIHRoZSBwcmVmaXguXG4gIHZhciBwcmVmaXggPSB0ZXh0LnN1YnN0cmluZyhwYXRjaC5zdGFydDIgLSBwYWRkaW5nLCBwYXRjaC5zdGFydDIpO1xuICBpZiAocHJlZml4KSB7XG4gICAgcGF0Y2guZGlmZnMudW5zaGlmdChbRElGRl9FUVVBTCwgcHJlZml4XSk7XG4gIH1cbiAgLy8gQWRkIHRoZSBzdWZmaXguXG4gIHZhciBzdWZmaXggPSB0ZXh0LnN1YnN0cmluZyhwYXRjaC5zdGFydDIgKyBwYXRjaC5sZW5ndGgxLFxuICAgIHBhdGNoLnN0YXJ0MiArIHBhdGNoLmxlbmd0aDEgKyBwYWRkaW5nKTtcbiAgaWYgKHN1ZmZpeCkge1xuICAgIHBhdGNoLmRpZmZzLnB1c2goW0RJRkZfRVFVQUwsIHN1ZmZpeF0pO1xuICB9XG5cbiAgLy8gUm9sbCBiYWNrIHRoZSBzdGFydCBwb2ludHMuXG4gIHBhdGNoLnN0YXJ0MSAtPSBwcmVmaXgubGVuZ3RoO1xuICBwYXRjaC5zdGFydDIgLT0gcHJlZml4Lmxlbmd0aDtcbiAgLy8gRXh0ZW5kIHRoZSBsZW5ndGhzLlxuICBwYXRjaC5sZW5ndGgxICs9IHByZWZpeC5sZW5ndGggKyBzdWZmaXgubGVuZ3RoO1xuICBwYXRjaC5sZW5ndGgyICs9IHByZWZpeC5sZW5ndGggKyBzdWZmaXgubGVuZ3RoO1xufTtcblxuXG4vKipcbiAqIENvbXB1dGUgYSBsaXN0IG9mIHBhdGNoZXMgdG8gdHVybiB0ZXh0MSBpbnRvIHRleHQyLlxuICogVXNlIGRpZmZzIGlmIHByb3ZpZGVkLCBvdGhlcndpc2UgY29tcHV0ZSBpdCBvdXJzZWx2ZXMuXG4gKiBUaGVyZSBhcmUgZm91ciB3YXlzIHRvIGNhbGwgdGhpcyBmdW5jdGlvbiwgZGVwZW5kaW5nIG9uIHdoYXQgZGF0YSBpc1xuICogYXZhaWxhYmxlIHRvIHRoZSBjYWxsZXI6XG4gKiBNZXRob2QgMTpcbiAqIGEgPSB0ZXh0MSwgYiA9IHRleHQyXG4gKiBNZXRob2QgMjpcbiAqIGEgPSBkaWZmc1xuICogTWV0aG9kIDMgKG9wdGltYWwpOlxuICogYSA9IHRleHQxLCBiID0gZGlmZnNcbiAqIE1ldGhvZCA0IChkZXByZWNhdGVkLCB1c2UgbWV0aG9kIDMpOlxuICogYSA9IHRleHQxLCBiID0gdGV4dDIsIGMgPSBkaWZmc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfCFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59IGEgdGV4dDEgKG1ldGhvZHMgMSwzLDQpIG9yXG4gKiBBcnJheSBvZiBkaWZmIHR1cGxlcyBmb3IgdGV4dDEgdG8gdGV4dDIgKG1ldGhvZCAyKS5cbiAqIEBwYXJhbSB7c3RyaW5nfCFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59IG9wdF9iIHRleHQyIChtZXRob2RzIDEsNCkgb3JcbiAqIEFycmF5IG9mIGRpZmYgdHVwbGVzIGZvciB0ZXh0MSB0byB0ZXh0MiAobWV0aG9kIDMpIG9yIHVuZGVmaW5lZCAobWV0aG9kIDIpLlxuICogQHBhcmFtIHtzdHJpbmd8IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5EaWZmPn0gb3B0X2MgQXJyYXkgb2YgZGlmZiB0dXBsZXNcbiAqIGZvciB0ZXh0MSB0byB0ZXh0MiAobWV0aG9kIDQpIG9yIHVuZGVmaW5lZCAobWV0aG9kcyAxLDIsMykuXG4gKiBAcmV0dXJuIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLnBhdGNoX29iaj59IEFycmF5IG9mIFBhdGNoIG9iamVjdHMuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLnBhdGNoX21ha2UgPSBmdW5jdGlvbihhLCBvcHRfYiwgb3B0X2MpIHtcbiAgdmFyIHRleHQxLCBkaWZmcztcbiAgaWYgKHR5cGVvZiBhID09ICdzdHJpbmcnICYmIHR5cGVvZiBvcHRfYiA9PSAnc3RyaW5nJyAmJlxuICAgICAgdHlwZW9mIG9wdF9jID09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gTWV0aG9kIDE6IHRleHQxLCB0ZXh0MlxuICAgIC8vIENvbXB1dGUgZGlmZnMgZnJvbSB0ZXh0MSBhbmQgdGV4dDIuXG4gICAgdGV4dDEgPSAvKiogQHR5cGUge3N0cmluZ30gKi8oYSk7XG4gICAgZGlmZnMgPSB0aGlzLmRpZmZfbWFpbih0ZXh0MSwgLyoqIEB0eXBlIHtzdHJpbmd9ICovKG9wdF9iKSwgdHJ1ZSk7XG4gICAgaWYgKGRpZmZzLmxlbmd0aCA+IDIpIHtcbiAgICAgIHRoaXMuZGlmZl9jbGVhbnVwU2VtYW50aWMoZGlmZnMpO1xuICAgICAgdGhpcy5kaWZmX2NsZWFudXBFZmZpY2llbmN5KGRpZmZzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoYSAmJiB0eXBlb2YgYSA9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb3B0X2IgPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgICB0eXBlb2Ygb3B0X2MgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBNZXRob2QgMjogZGlmZnNcbiAgICAvLyBDb21wdXRlIHRleHQxIGZyb20gZGlmZnMuXG4gICAgZGlmZnMgPSAvKiogQHR5cGUgeyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59ICovKGEpO1xuICAgIHRleHQxID0gdGhpcy5kaWZmX3RleHQxKGRpZmZzKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgYSA9PSAnc3RyaW5nJyAmJiBvcHRfYiAmJiB0eXBlb2Ygb3B0X2IgPT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgICB0eXBlb2Ygb3B0X2MgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBNZXRob2QgMzogdGV4dDEsIGRpZmZzXG4gICAgdGV4dDEgPSAvKiogQHR5cGUge3N0cmluZ30gKi8oYSk7XG4gICAgZGlmZnMgPSAvKiogQHR5cGUgeyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59ICovKG9wdF9iKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgYSA9PSAnc3RyaW5nJyAmJiB0eXBlb2Ygb3B0X2IgPT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICBvcHRfYyAmJiB0eXBlb2Ygb3B0X2MgPT0gJ29iamVjdCcpIHtcbiAgICAvLyBNZXRob2QgNDogdGV4dDEsIHRleHQyLCBkaWZmc1xuICAgIC8vIHRleHQyIGlzIG5vdCB1c2VkLlxuICAgIHRleHQxID0gLyoqIEB0eXBlIHtzdHJpbmd9ICovKGEpO1xuICAgIGRpZmZzID0gLyoqIEB0eXBlIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLkRpZmY+fSAqLyhvcHRfYyk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGNhbGwgZm9ybWF0IHRvIHBhdGNoX21ha2UuJyk7XG4gIH1cblxuICBpZiAoZGlmZnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFtdOyAgLy8gR2V0IHJpZCBvZiB0aGUgbnVsbCBjYXNlLlxuICB9XG4gIHZhciBwYXRjaGVzID0gW107XG4gIHZhciBwYXRjaCA9IG5ldyBkaWZmX21hdGNoX3BhdGNoLnBhdGNoX29iaigpO1xuICB2YXIgcGF0Y2hEaWZmTGVuZ3RoID0gMDsgIC8vIEtlZXBpbmcgb3VyIG93biBsZW5ndGggdmFyIGlzIGZhc3RlciBpbiBKUy5cbiAgdmFyIGNoYXJfY291bnQxID0gMDsgIC8vIE51bWJlciBvZiBjaGFyYWN0ZXJzIGludG8gdGhlIHRleHQxIHN0cmluZy5cbiAgdmFyIGNoYXJfY291bnQyID0gMDsgIC8vIE51bWJlciBvZiBjaGFyYWN0ZXJzIGludG8gdGhlIHRleHQyIHN0cmluZy5cbiAgLy8gU3RhcnQgd2l0aCB0ZXh0MSAocHJlcGF0Y2hfdGV4dCkgYW5kIGFwcGx5IHRoZSBkaWZmcyB1bnRpbCB3ZSBhcnJpdmUgYXRcbiAgLy8gdGV4dDIgKHBvc3RwYXRjaF90ZXh0KS4gIFdlIHJlY3JlYXRlIHRoZSBwYXRjaGVzIG9uZSBieSBvbmUgdG8gZGV0ZXJtaW5lXG4gIC8vIGNvbnRleHQgaW5mby5cbiAgdmFyIHByZXBhdGNoX3RleHQgPSB0ZXh0MTtcbiAgdmFyIHBvc3RwYXRjaF90ZXh0ID0gdGV4dDE7XG4gIGZvciAodmFyIHggPSAwOyB4IDwgZGlmZnMubGVuZ3RoOyB4KyspIHtcbiAgICB2YXIgZGlmZl90eXBlID0gZGlmZnNbeF1bMF07XG4gICAgdmFyIGRpZmZfdGV4dCA9IGRpZmZzW3hdWzFdO1xuXG4gICAgaWYgKCFwYXRjaERpZmZMZW5ndGggJiYgZGlmZl90eXBlICE9PSBESUZGX0VRVUFMKSB7XG4gICAgICAvLyBBIG5ldyBwYXRjaCBzdGFydHMgaGVyZS5cbiAgICAgIHBhdGNoLnN0YXJ0MSA9IGNoYXJfY291bnQxO1xuICAgICAgcGF0Y2guc3RhcnQyID0gY2hhcl9jb3VudDI7XG4gICAgfVxuXG4gICAgc3dpdGNoIChkaWZmX3R5cGUpIHtcbiAgICAgIGNhc2UgRElGRl9JTlNFUlQ6XG4gICAgICAgIHBhdGNoLmRpZmZzW3BhdGNoRGlmZkxlbmd0aCsrXSA9IGRpZmZzW3hdO1xuICAgICAgICBwYXRjaC5sZW5ndGgyICs9IGRpZmZfdGV4dC5sZW5ndGg7XG4gICAgICAgIHBvc3RwYXRjaF90ZXh0ID0gcG9zdHBhdGNoX3RleHQuc3Vic3RyaW5nKDAsIGNoYXJfY291bnQyKSArIGRpZmZfdGV4dCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgcG9zdHBhdGNoX3RleHQuc3Vic3RyaW5nKGNoYXJfY291bnQyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERJRkZfREVMRVRFOlxuICAgICAgICBwYXRjaC5sZW5ndGgxICs9IGRpZmZfdGV4dC5sZW5ndGg7XG4gICAgICAgIHBhdGNoLmRpZmZzW3BhdGNoRGlmZkxlbmd0aCsrXSA9IGRpZmZzW3hdO1xuICAgICAgICBwb3N0cGF0Y2hfdGV4dCA9IHBvc3RwYXRjaF90ZXh0LnN1YnN0cmluZygwLCBjaGFyX2NvdW50MikgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RwYXRjaF90ZXh0LnN1YnN0cmluZyhjaGFyX2NvdW50MiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgZGlmZl90ZXh0Lmxlbmd0aCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBESUZGX0VRVUFMOlxuICAgICAgICBpZiAoZGlmZl90ZXh0Lmxlbmd0aCA8PSAyICogdGhpcy5QYXRjaF9NYXJnaW4gJiZcbiAgICAgICAgICAgIHBhdGNoRGlmZkxlbmd0aCAmJiBkaWZmcy5sZW5ndGggIT0geCArIDEpIHtcbiAgICAgICAgICAvLyBTbWFsbCBlcXVhbGl0eSBpbnNpZGUgYSBwYXRjaC5cbiAgICAgICAgICBwYXRjaC5kaWZmc1twYXRjaERpZmZMZW5ndGgrK10gPSBkaWZmc1t4XTtcbiAgICAgICAgICBwYXRjaC5sZW5ndGgxICs9IGRpZmZfdGV4dC5sZW5ndGg7XG4gICAgICAgICAgcGF0Y2gubGVuZ3RoMiArPSBkaWZmX3RleHQubGVuZ3RoO1xuICAgICAgICB9IGVsc2UgaWYgKGRpZmZfdGV4dC5sZW5ndGggPj0gMiAqIHRoaXMuUGF0Y2hfTWFyZ2luKSB7XG4gICAgICAgICAgLy8gVGltZSBmb3IgYSBuZXcgcGF0Y2guXG4gICAgICAgICAgaWYgKHBhdGNoRGlmZkxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5wYXRjaF9hZGRDb250ZXh0XyhwYXRjaCwgcHJlcGF0Y2hfdGV4dCk7XG4gICAgICAgICAgICBwYXRjaGVzLnB1c2gocGF0Y2gpO1xuICAgICAgICAgICAgcGF0Y2ggPSBuZXcgZGlmZl9tYXRjaF9wYXRjaC5wYXRjaF9vYmooKTtcbiAgICAgICAgICAgIHBhdGNoRGlmZkxlbmd0aCA9IDA7XG4gICAgICAgICAgICAvLyBVbmxpa2UgVW5pZGlmZiwgb3VyIHBhdGNoIGxpc3RzIGhhdmUgYSByb2xsaW5nIGNvbnRleHQuXG4gICAgICAgICAgICAvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvZ29vZ2xlLWRpZmYtbWF0Y2gtcGF0Y2gvd2lraS9VbmlkaWZmXG4gICAgICAgICAgICAvLyBVcGRhdGUgcHJlcGF0Y2ggdGV4dCAmIHBvcyB0byByZWZsZWN0IHRoZSBhcHBsaWNhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgIC8vIGp1c3QgY29tcGxldGVkIHBhdGNoLlxuICAgICAgICAgICAgcHJlcGF0Y2hfdGV4dCA9IHBvc3RwYXRjaF90ZXh0O1xuICAgICAgICAgICAgY2hhcl9jb3VudDEgPSBjaGFyX2NvdW50MjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBjdXJyZW50IGNoYXJhY3RlciBjb3VudC5cbiAgICBpZiAoZGlmZl90eXBlICE9PSBESUZGX0lOU0VSVCkge1xuICAgICAgY2hhcl9jb3VudDEgKz0gZGlmZl90ZXh0Lmxlbmd0aDtcbiAgICB9XG4gICAgaWYgKGRpZmZfdHlwZSAhPT0gRElGRl9ERUxFVEUpIHtcbiAgICAgIGNoYXJfY291bnQyICs9IGRpZmZfdGV4dC5sZW5ndGg7XG4gICAgfVxuICB9XG4gIC8vIFBpY2sgdXAgdGhlIGxlZnRvdmVyIHBhdGNoIGlmIG5vdCBlbXB0eS5cbiAgaWYgKHBhdGNoRGlmZkxlbmd0aCkge1xuICAgIHRoaXMucGF0Y2hfYWRkQ29udGV4dF8ocGF0Y2gsIHByZXBhdGNoX3RleHQpO1xuICAgIHBhdGNoZXMucHVzaChwYXRjaCk7XG4gIH1cblxuICByZXR1cm4gcGF0Y2hlcztcbn07XG5cblxuLyoqXG4gKiBHaXZlbiBhbiBhcnJheSBvZiBwYXRjaGVzLCByZXR1cm4gYW5vdGhlciBhcnJheSB0aGF0IGlzIGlkZW50aWNhbC5cbiAqIEBwYXJhbSB7IUFycmF5LjwhZGlmZl9tYXRjaF9wYXRjaC5wYXRjaF9vYmo+fSBwYXRjaGVzIEFycmF5IG9mIFBhdGNoIG9iamVjdHMuXG4gKiBAcmV0dXJuIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLnBhdGNoX29iaj59IEFycmF5IG9mIFBhdGNoIG9iamVjdHMuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLnBhdGNoX2RlZXBDb3B5ID0gZnVuY3Rpb24ocGF0Y2hlcykge1xuICAvLyBNYWtpbmcgZGVlcCBjb3BpZXMgaXMgaGFyZCBpbiBKYXZhU2NyaXB0LlxuICB2YXIgcGF0Y2hlc0NvcHkgPSBbXTtcbiAgZm9yICh2YXIgeCA9IDA7IHggPCBwYXRjaGVzLmxlbmd0aDsgeCsrKSB7XG4gICAgdmFyIHBhdGNoID0gcGF0Y2hlc1t4XTtcbiAgICB2YXIgcGF0Y2hDb3B5ID0gbmV3IGRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqKCk7XG4gICAgcGF0Y2hDb3B5LmRpZmZzID0gW107XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBwYXRjaC5kaWZmcy5sZW5ndGg7IHkrKykge1xuICAgICAgcGF0Y2hDb3B5LmRpZmZzW3ldID0gcGF0Y2guZGlmZnNbeV0uc2xpY2UoKTtcbiAgICB9XG4gICAgcGF0Y2hDb3B5LnN0YXJ0MSA9IHBhdGNoLnN0YXJ0MTtcbiAgICBwYXRjaENvcHkuc3RhcnQyID0gcGF0Y2guc3RhcnQyO1xuICAgIHBhdGNoQ29weS5sZW5ndGgxID0gcGF0Y2gubGVuZ3RoMTtcbiAgICBwYXRjaENvcHkubGVuZ3RoMiA9IHBhdGNoLmxlbmd0aDI7XG4gICAgcGF0Y2hlc0NvcHlbeF0gPSBwYXRjaENvcHk7XG4gIH1cbiAgcmV0dXJuIHBhdGNoZXNDb3B5O1xufTtcblxuXG4vKipcbiAqIE1lcmdlIGEgc2V0IG9mIHBhdGNoZXMgb250byB0aGUgdGV4dC4gIFJldHVybiBhIHBhdGNoZWQgdGV4dCwgYXMgd2VsbFxuICogYXMgYSBsaXN0IG9mIHRydWUvZmFsc2UgdmFsdWVzIGluZGljYXRpbmcgd2hpY2ggcGF0Y2hlcyB3ZXJlIGFwcGxpZWQuXG4gKiBAcGFyYW0geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqPn0gcGF0Y2hlcyBBcnJheSBvZiBQYXRjaCBvYmplY3RzLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgT2xkIHRleHQuXG4gKiBAcmV0dXJuIHshQXJyYXkuPHN0cmluZ3whQXJyYXkuPGJvb2xlYW4+Pn0gVHdvIGVsZW1lbnQgQXJyYXksIGNvbnRhaW5pbmcgdGhlXG4gKiAgICAgIG5ldyB0ZXh0IGFuZCBhbiBhcnJheSBvZiBib29sZWFuIHZhbHVlcy5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUucGF0Y2hfYXBwbHkgPSBmdW5jdGlvbihwYXRjaGVzLCB0ZXh0KSB7XG4gIGlmIChwYXRjaGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuIFt0ZXh0LCBbXV07XG4gIH1cblxuICAvLyBEZWVwIGNvcHkgdGhlIHBhdGNoZXMgc28gdGhhdCBubyBjaGFuZ2VzIGFyZSBtYWRlIHRvIG9yaWdpbmFscy5cbiAgcGF0Y2hlcyA9IHRoaXMucGF0Y2hfZGVlcENvcHkocGF0Y2hlcyk7XG5cbiAgdmFyIG51bGxQYWRkaW5nID0gdGhpcy5wYXRjaF9hZGRQYWRkaW5nKHBhdGNoZXMpO1xuICB0ZXh0ID0gbnVsbFBhZGRpbmcgKyB0ZXh0ICsgbnVsbFBhZGRpbmc7XG5cbiAgdGhpcy5wYXRjaF9zcGxpdE1heChwYXRjaGVzKTtcbiAgLy8gZGVsdGEga2VlcHMgdHJhY2sgb2YgdGhlIG9mZnNldCBiZXR3ZWVuIHRoZSBleHBlY3RlZCBhbmQgYWN0dWFsIGxvY2F0aW9uXG4gIC8vIG9mIHRoZSBwcmV2aW91cyBwYXRjaC4gIElmIHRoZXJlIGFyZSBwYXRjaGVzIGV4cGVjdGVkIGF0IHBvc2l0aW9ucyAxMCBhbmRcbiAgLy8gMjAsIGJ1dCB0aGUgZmlyc3QgcGF0Y2ggd2FzIGZvdW5kIGF0IDEyLCBkZWx0YSBpcyAyIGFuZCB0aGUgc2Vjb25kIHBhdGNoXG4gIC8vIGhhcyBhbiBlZmZlY3RpdmUgZXhwZWN0ZWQgcG9zaXRpb24gb2YgMjIuXG4gIHZhciBkZWx0YSA9IDA7XG4gIHZhciByZXN1bHRzID0gW107XG4gIGZvciAodmFyIHggPSAwOyB4IDwgcGF0Y2hlcy5sZW5ndGg7IHgrKykge1xuICAgIHZhciBleHBlY3RlZF9sb2MgPSBwYXRjaGVzW3hdLnN0YXJ0MiArIGRlbHRhO1xuICAgIHZhciB0ZXh0MSA9IHRoaXMuZGlmZl90ZXh0MShwYXRjaGVzW3hdLmRpZmZzKTtcbiAgICB2YXIgc3RhcnRfbG9jO1xuICAgIHZhciBlbmRfbG9jID0gLTE7XG4gICAgaWYgKHRleHQxLmxlbmd0aCA+IHRoaXMuTWF0Y2hfTWF4Qml0cykge1xuICAgICAgLy8gcGF0Y2hfc3BsaXRNYXggd2lsbCBvbmx5IHByb3ZpZGUgYW4gb3ZlcnNpemVkIHBhdHRlcm4gaW4gdGhlIGNhc2Ugb2ZcbiAgICAgIC8vIGEgbW9uc3RlciBkZWxldGUuXG4gICAgICBzdGFydF9sb2MgPSB0aGlzLm1hdGNoX21haW4odGV4dCwgdGV4dDEuc3Vic3RyaW5nKDAsIHRoaXMuTWF0Y2hfTWF4Qml0cyksXG4gICAgICAgIGV4cGVjdGVkX2xvYyk7XG4gICAgICBpZiAoc3RhcnRfbG9jICE9IC0xKSB7XG4gICAgICAgIGVuZF9sb2MgPSB0aGlzLm1hdGNoX21haW4odGV4dCxcbiAgICAgICAgICB0ZXh0MS5zdWJzdHJpbmcodGV4dDEubGVuZ3RoIC0gdGhpcy5NYXRjaF9NYXhCaXRzKSxcbiAgICAgICAgICBleHBlY3RlZF9sb2MgKyB0ZXh0MS5sZW5ndGggLSB0aGlzLk1hdGNoX01heEJpdHMpO1xuICAgICAgICBpZiAoZW5kX2xvYyA9PSAtMSB8fCBzdGFydF9sb2MgPj0gZW5kX2xvYykge1xuICAgICAgICAgIC8vIENhbid0IGZpbmQgdmFsaWQgdHJhaWxpbmcgY29udGV4dC4gIERyb3AgdGhpcyBwYXRjaC5cbiAgICAgICAgICBzdGFydF9sb2MgPSAtMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdGFydF9sb2MgPSB0aGlzLm1hdGNoX21haW4odGV4dCwgdGV4dDEsIGV4cGVjdGVkX2xvYyk7XG4gICAgfVxuICAgIGlmIChzdGFydF9sb2MgPT0gLTEpIHtcbiAgICAgIC8vIE5vIG1hdGNoIGZvdW5kLiAgOihcbiAgICAgIHJlc3VsdHNbeF0gPSBmYWxzZTtcbiAgICAgIC8vIFN1YnRyYWN0IHRoZSBkZWx0YSBmb3IgdGhpcyBmYWlsZWQgcGF0Y2ggZnJvbSBzdWJzZXF1ZW50IHBhdGNoZXMuXG4gICAgICBkZWx0YSAtPSBwYXRjaGVzW3hdLmxlbmd0aDIgLSBwYXRjaGVzW3hdLmxlbmd0aDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZvdW5kIGEgbWF0Y2guICA6KVxuICAgICAgcmVzdWx0c1t4XSA9IHRydWU7XG4gICAgICBkZWx0YSA9IHN0YXJ0X2xvYyAtIGV4cGVjdGVkX2xvYztcbiAgICAgIHZhciB0ZXh0MjtcbiAgICAgIGlmIChlbmRfbG9jID09IC0xKSB7XG4gICAgICAgIHRleHQyID0gdGV4dC5zdWJzdHJpbmcoc3RhcnRfbG9jLCBzdGFydF9sb2MgKyB0ZXh0MS5sZW5ndGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dDIgPSB0ZXh0LnN1YnN0cmluZyhzdGFydF9sb2MsIGVuZF9sb2MgKyB0aGlzLk1hdGNoX01heEJpdHMpO1xuICAgICAgfVxuICAgICAgaWYgKHRleHQxID09IHRleHQyKSB7XG4gICAgICAgIC8vIFBlcmZlY3QgbWF0Y2gsIGp1c3Qgc2hvdmUgdGhlIHJlcGxhY2VtZW50IHRleHQgaW4uXG4gICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCBzdGFydF9sb2MpICtcbiAgICAgICAgICAgICAgIHRoaXMuZGlmZl90ZXh0MihwYXRjaGVzW3hdLmRpZmZzKSArXG4gICAgICAgICAgICAgICB0ZXh0LnN1YnN0cmluZyhzdGFydF9sb2MgKyB0ZXh0MS5sZW5ndGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSW1wZXJmZWN0IG1hdGNoLiAgUnVuIGEgZGlmZiB0byBnZXQgYSBmcmFtZXdvcmsgb2YgZXF1aXZhbGVudFxuICAgICAgICAvLyBpbmRpY2VzLlxuICAgICAgICB2YXIgZGlmZnMgPSB0aGlzLmRpZmZfbWFpbih0ZXh0MSwgdGV4dDIsIGZhbHNlKTtcbiAgICAgICAgaWYgKHRleHQxLmxlbmd0aCA+IHRoaXMuTWF0Y2hfTWF4Qml0cyAmJlxuICAgICAgICAgICAgdGhpcy5kaWZmX2xldmVuc2h0ZWluKGRpZmZzKSAvIHRleHQxLmxlbmd0aCA+XG4gICAgICAgICAgICB0aGlzLlBhdGNoX0RlbGV0ZVRocmVzaG9sZCkge1xuICAgICAgICAgIC8vIFRoZSBlbmQgcG9pbnRzIG1hdGNoLCBidXQgdGhlIGNvbnRlbnQgaXMgdW5hY2NlcHRhYmx5IGJhZC5cbiAgICAgICAgICByZXN1bHRzW3hdID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5kaWZmX2NsZWFudXBTZW1hbnRpY0xvc3NsZXNzKGRpZmZzKTtcbiAgICAgICAgICB2YXIgaW5kZXgxID0gMDtcbiAgICAgICAgICB2YXIgaW5kZXgyO1xuICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgcGF0Y2hlc1t4XS5kaWZmcy5sZW5ndGg7IHkrKykge1xuICAgICAgICAgICAgdmFyIG1vZCA9IHBhdGNoZXNbeF0uZGlmZnNbeV07XG4gICAgICAgICAgICBpZiAobW9kWzBdICE9PSBESUZGX0VRVUFMKSB7XG4gICAgICAgICAgICAgIGluZGV4MiA9IHRoaXMuZGlmZl94SW5kZXgoZGlmZnMsIGluZGV4MSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobW9kWzBdID09PSBESUZGX0lOU0VSVCkgeyAgLy8gSW5zZXJ0aW9uXG4gICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCBzdGFydF9sb2MgKyBpbmRleDIpICsgbW9kWzFdICtcbiAgICAgICAgICAgICAgICAgICAgIHRleHQuc3Vic3RyaW5nKHN0YXJ0X2xvYyArIGluZGV4Mik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1vZFswXSA9PT0gRElGRl9ERUxFVEUpIHsgIC8vIERlbGV0aW9uXG4gICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCBzdGFydF9sb2MgKyBpbmRleDIpICtcbiAgICAgICAgICAgICAgICAgICAgIHRleHQuc3Vic3RyaW5nKHN0YXJ0X2xvYyArIHRoaXMuZGlmZl94SW5kZXgoZGlmZnMsXG4gICAgICAgICAgICAgICAgICAgICBpbmRleDEgKyBtb2RbMV0ubGVuZ3RoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobW9kWzBdICE9PSBESUZGX0RFTEVURSkge1xuICAgICAgICAgICAgICBpbmRleDEgKz0gbW9kWzFdLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gU3RyaXAgdGhlIHBhZGRpbmcgb2ZmLlxuICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcobnVsbFBhZGRpbmcubGVuZ3RoLCB0ZXh0Lmxlbmd0aCAtIG51bGxQYWRkaW5nLmxlbmd0aCk7XG4gIHJldHVybiBbdGV4dCwgcmVzdWx0c107XG59O1xuXG5cbi8qKlxuICogQWRkIHNvbWUgcGFkZGluZyBvbiB0ZXh0IHN0YXJ0IGFuZCBlbmQgc28gdGhhdCBlZGdlcyBjYW4gbWF0Y2ggc29tZXRoaW5nLlxuICogSW50ZW5kZWQgdG8gYmUgY2FsbGVkIG9ubHkgZnJvbSB3aXRoaW4gcGF0Y2hfYXBwbHkuXG4gKiBAcGFyYW0geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqPn0gcGF0Y2hlcyBBcnJheSBvZiBQYXRjaCBvYmplY3RzLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgcGFkZGluZyBzdHJpbmcgYWRkZWQgdG8gZWFjaCBzaWRlLlxuICovXG5kaWZmX21hdGNoX3BhdGNoLnByb3RvdHlwZS5wYXRjaF9hZGRQYWRkaW5nID0gZnVuY3Rpb24ocGF0Y2hlcykge1xuICB2YXIgcGFkZGluZ0xlbmd0aCA9IHRoaXMuUGF0Y2hfTWFyZ2luO1xuICB2YXIgbnVsbFBhZGRpbmcgPSAnJztcbiAgZm9yICh2YXIgeCA9IDE7IHggPD0gcGFkZGluZ0xlbmd0aDsgeCsrKSB7XG4gICAgbnVsbFBhZGRpbmcgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh4KTtcbiAgfVxuXG4gIC8vIEJ1bXAgYWxsIHRoZSBwYXRjaGVzIGZvcndhcmQuXG4gIGZvciAodmFyIHggPSAwOyB4IDwgcGF0Y2hlcy5sZW5ndGg7IHgrKykge1xuICAgIHBhdGNoZXNbeF0uc3RhcnQxICs9IHBhZGRpbmdMZW5ndGg7XG4gICAgcGF0Y2hlc1t4XS5zdGFydDIgKz0gcGFkZGluZ0xlbmd0aDtcbiAgfVxuXG4gIC8vIEFkZCBzb21lIHBhZGRpbmcgb24gc3RhcnQgb2YgZmlyc3QgZGlmZi5cbiAgdmFyIHBhdGNoID0gcGF0Y2hlc1swXTtcbiAgdmFyIGRpZmZzID0gcGF0Y2guZGlmZnM7XG4gIGlmIChkaWZmcy5sZW5ndGggPT0gMCB8fCBkaWZmc1swXVswXSAhPSBESUZGX0VRVUFMKSB7XG4gICAgLy8gQWRkIG51bGxQYWRkaW5nIGVxdWFsaXR5LlxuICAgIGRpZmZzLnVuc2hpZnQoW0RJRkZfRVFVQUwsIG51bGxQYWRkaW5nXSk7XG4gICAgcGF0Y2guc3RhcnQxIC09IHBhZGRpbmdMZW5ndGg7ICAvLyBTaG91bGQgYmUgMC5cbiAgICBwYXRjaC5zdGFydDIgLT0gcGFkZGluZ0xlbmd0aDsgIC8vIFNob3VsZCBiZSAwLlxuICAgIHBhdGNoLmxlbmd0aDEgKz0gcGFkZGluZ0xlbmd0aDtcbiAgICBwYXRjaC5sZW5ndGgyICs9IHBhZGRpbmdMZW5ndGg7XG4gIH0gZWxzZSBpZiAocGFkZGluZ0xlbmd0aCA+IGRpZmZzWzBdWzFdLmxlbmd0aCkge1xuICAgIC8vIEdyb3cgZmlyc3QgZXF1YWxpdHkuXG4gICAgdmFyIGV4dHJhTGVuZ3RoID0gcGFkZGluZ0xlbmd0aCAtIGRpZmZzWzBdWzFdLmxlbmd0aDtcbiAgICBkaWZmc1swXVsxXSA9IG51bGxQYWRkaW5nLnN1YnN0cmluZyhkaWZmc1swXVsxXS5sZW5ndGgpICsgZGlmZnNbMF1bMV07XG4gICAgcGF0Y2guc3RhcnQxIC09IGV4dHJhTGVuZ3RoO1xuICAgIHBhdGNoLnN0YXJ0MiAtPSBleHRyYUxlbmd0aDtcbiAgICBwYXRjaC5sZW5ndGgxICs9IGV4dHJhTGVuZ3RoO1xuICAgIHBhdGNoLmxlbmd0aDIgKz0gZXh0cmFMZW5ndGg7XG4gIH1cblxuICAvLyBBZGQgc29tZSBwYWRkaW5nIG9uIGVuZCBvZiBsYXN0IGRpZmYuXG4gIHBhdGNoID0gcGF0Y2hlc1twYXRjaGVzLmxlbmd0aCAtIDFdO1xuICBkaWZmcyA9IHBhdGNoLmRpZmZzO1xuICBpZiAoZGlmZnMubGVuZ3RoID09IDAgfHwgZGlmZnNbZGlmZnMubGVuZ3RoIC0gMV1bMF0gIT0gRElGRl9FUVVBTCkge1xuICAgIC8vIEFkZCBudWxsUGFkZGluZyBlcXVhbGl0eS5cbiAgICBkaWZmcy5wdXNoKFtESUZGX0VRVUFMLCBudWxsUGFkZGluZ10pO1xuICAgIHBhdGNoLmxlbmd0aDEgKz0gcGFkZGluZ0xlbmd0aDtcbiAgICBwYXRjaC5sZW5ndGgyICs9IHBhZGRpbmdMZW5ndGg7XG4gIH0gZWxzZSBpZiAocGFkZGluZ0xlbmd0aCA+IGRpZmZzW2RpZmZzLmxlbmd0aCAtIDFdWzFdLmxlbmd0aCkge1xuICAgIC8vIEdyb3cgbGFzdCBlcXVhbGl0eS5cbiAgICB2YXIgZXh0cmFMZW5ndGggPSBwYWRkaW5nTGVuZ3RoIC0gZGlmZnNbZGlmZnMubGVuZ3RoIC0gMV1bMV0ubGVuZ3RoO1xuICAgIGRpZmZzW2RpZmZzLmxlbmd0aCAtIDFdWzFdICs9IG51bGxQYWRkaW5nLnN1YnN0cmluZygwLCBleHRyYUxlbmd0aCk7XG4gICAgcGF0Y2gubGVuZ3RoMSArPSBleHRyYUxlbmd0aDtcbiAgICBwYXRjaC5sZW5ndGgyICs9IGV4dHJhTGVuZ3RoO1xuICB9XG5cbiAgcmV0dXJuIG51bGxQYWRkaW5nO1xufTtcblxuXG4vKipcbiAqIExvb2sgdGhyb3VnaCB0aGUgcGF0Y2hlcyBhbmQgYnJlYWsgdXAgYW55IHdoaWNoIGFyZSBsb25nZXIgdGhhbiB0aGUgbWF4aW11bVxuICogbGltaXQgb2YgdGhlIG1hdGNoIGFsZ29yaXRobS5cbiAqIEludGVuZGVkIHRvIGJlIGNhbGxlZCBvbmx5IGZyb20gd2l0aGluIHBhdGNoX2FwcGx5LlxuICogQHBhcmFtIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLnBhdGNoX29iaj59IHBhdGNoZXMgQXJyYXkgb2YgUGF0Y2ggb2JqZWN0cy5cbiAqL1xuZGlmZl9tYXRjaF9wYXRjaC5wcm90b3R5cGUucGF0Y2hfc3BsaXRNYXggPSBmdW5jdGlvbihwYXRjaGVzKSB7XG4gIHZhciBwYXRjaF9zaXplID0gdGhpcy5NYXRjaF9NYXhCaXRzO1xuICBmb3IgKHZhciB4ID0gMDsgeCA8IHBhdGNoZXMubGVuZ3RoOyB4KyspIHtcbiAgICBpZiAocGF0Y2hlc1t4XS5sZW5ndGgxIDw9IHBhdGNoX3NpemUpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICB2YXIgYmlncGF0Y2ggPSBwYXRjaGVzW3hdO1xuICAgIC8vIFJlbW92ZSB0aGUgYmlnIG9sZCBwYXRjaC5cbiAgICBwYXRjaGVzLnNwbGljZSh4LS0sIDEpO1xuICAgIHZhciBzdGFydDEgPSBiaWdwYXRjaC5zdGFydDE7XG4gICAgdmFyIHN0YXJ0MiA9IGJpZ3BhdGNoLnN0YXJ0MjtcbiAgICB2YXIgcHJlY29udGV4dCA9ICcnO1xuICAgIHdoaWxlIChiaWdwYXRjaC5kaWZmcy5sZW5ndGggIT09IDApIHtcbiAgICAgIC8vIENyZWF0ZSBvbmUgb2Ygc2V2ZXJhbCBzbWFsbGVyIHBhdGNoZXMuXG4gICAgICB2YXIgcGF0Y2ggPSBuZXcgZGlmZl9tYXRjaF9wYXRjaC5wYXRjaF9vYmooKTtcbiAgICAgIHZhciBlbXB0eSA9IHRydWU7XG4gICAgICBwYXRjaC5zdGFydDEgPSBzdGFydDEgLSBwcmVjb250ZXh0Lmxlbmd0aDtcbiAgICAgIHBhdGNoLnN0YXJ0MiA9IHN0YXJ0MiAtIHByZWNvbnRleHQubGVuZ3RoO1xuICAgICAgaWYgKHByZWNvbnRleHQgIT09ICcnKSB7XG4gICAgICAgIHBhdGNoLmxlbmd0aDEgPSBwYXRjaC5sZW5ndGgyID0gcHJlY29udGV4dC5sZW5ndGg7XG4gICAgICAgIHBhdGNoLmRpZmZzLnB1c2goW0RJRkZfRVFVQUwsIHByZWNvbnRleHRdKTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChiaWdwYXRjaC5kaWZmcy5sZW5ndGggIT09IDAgJiZcbiAgICAgICAgICAgICBwYXRjaC5sZW5ndGgxIDwgcGF0Y2hfc2l6ZSAtIHRoaXMuUGF0Y2hfTWFyZ2luKSB7XG4gICAgICAgIHZhciBkaWZmX3R5cGUgPSBiaWdwYXRjaC5kaWZmc1swXVswXTtcbiAgICAgICAgdmFyIGRpZmZfdGV4dCA9IGJpZ3BhdGNoLmRpZmZzWzBdWzFdO1xuICAgICAgICBpZiAoZGlmZl90eXBlID09PSBESUZGX0lOU0VSVCkge1xuICAgICAgICAgIC8vIEluc2VydGlvbnMgYXJlIGhhcm1sZXNzLlxuICAgICAgICAgIHBhdGNoLmxlbmd0aDIgKz0gZGlmZl90ZXh0Lmxlbmd0aDtcbiAgICAgICAgICBzdGFydDIgKz0gZGlmZl90ZXh0Lmxlbmd0aDtcbiAgICAgICAgICBwYXRjaC5kaWZmcy5wdXNoKGJpZ3BhdGNoLmRpZmZzLnNoaWZ0KCkpO1xuICAgICAgICAgIGVtcHR5ID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoZGlmZl90eXBlID09PSBESUZGX0RFTEVURSAmJiBwYXRjaC5kaWZmcy5sZW5ndGggPT0gMSAmJlxuICAgICAgICAgICAgICAgICAgIHBhdGNoLmRpZmZzWzBdWzBdID09IERJRkZfRVFVQUwgJiZcbiAgICAgICAgICAgICAgICAgICBkaWZmX3RleHQubGVuZ3RoID4gMiAqIHBhdGNoX3NpemUpIHtcbiAgICAgICAgICAvLyBUaGlzIGlzIGEgbGFyZ2UgZGVsZXRpb24uICBMZXQgaXQgcGFzcyBpbiBvbmUgY2h1bmsuXG4gICAgICAgICAgcGF0Y2gubGVuZ3RoMSArPSBkaWZmX3RleHQubGVuZ3RoO1xuICAgICAgICAgIHN0YXJ0MSArPSBkaWZmX3RleHQubGVuZ3RoO1xuICAgICAgICAgIGVtcHR5ID0gZmFsc2U7XG4gICAgICAgICAgcGF0Y2guZGlmZnMucHVzaChbZGlmZl90eXBlLCBkaWZmX3RleHRdKTtcbiAgICAgICAgICBiaWdwYXRjaC5kaWZmcy5zaGlmdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIERlbGV0aW9uIG9yIGVxdWFsaXR5LiAgT25seSB0YWtlIGFzIG11Y2ggYXMgd2UgY2FuIHN0b21hY2guXG4gICAgICAgICAgZGlmZl90ZXh0ID0gZGlmZl90ZXh0LnN1YnN0cmluZygwLFxuICAgICAgICAgICAgcGF0Y2hfc2l6ZSAtIHBhdGNoLmxlbmd0aDEgLSB0aGlzLlBhdGNoX01hcmdpbik7XG4gICAgICAgICAgcGF0Y2gubGVuZ3RoMSArPSBkaWZmX3RleHQubGVuZ3RoO1xuICAgICAgICAgIHN0YXJ0MSArPSBkaWZmX3RleHQubGVuZ3RoO1xuICAgICAgICAgIGlmIChkaWZmX3R5cGUgPT09IERJRkZfRVFVQUwpIHtcbiAgICAgICAgICAgIHBhdGNoLmxlbmd0aDIgKz0gZGlmZl90ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgIHN0YXJ0MiArPSBkaWZmX3RleHQubGVuZ3RoO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbXB0eSA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXRjaC5kaWZmcy5wdXNoKFtkaWZmX3R5cGUsIGRpZmZfdGV4dF0pO1xuICAgICAgICAgIGlmIChkaWZmX3RleHQgPT0gYmlncGF0Y2guZGlmZnNbMF1bMV0pIHtcbiAgICAgICAgICAgIGJpZ3BhdGNoLmRpZmZzLnNoaWZ0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJpZ3BhdGNoLmRpZmZzWzBdWzFdID1cbiAgICAgICAgICAgICAgYmlncGF0Y2guZGlmZnNbMF1bMV0uc3Vic3RyaW5nKGRpZmZfdGV4dC5sZW5ndGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gQ29tcHV0ZSB0aGUgaGVhZCBjb250ZXh0IGZvciB0aGUgbmV4dCBwYXRjaC5cbiAgICAgIHByZWNvbnRleHQgPSB0aGlzLmRpZmZfdGV4dDIocGF0Y2guZGlmZnMpO1xuICAgICAgcHJlY29udGV4dCA9XG4gICAgICAgIHByZWNvbnRleHQuc3Vic3RyaW5nKHByZWNvbnRleHQubGVuZ3RoIC0gdGhpcy5QYXRjaF9NYXJnaW4pO1xuICAgICAgLy8gQXBwZW5kIHRoZSBlbmQgY29udGV4dCBmb3IgdGhpcyBwYXRjaC5cbiAgICAgIHZhciBwb3N0Y29udGV4dCA9IHRoaXMuZGlmZl90ZXh0MShiaWdwYXRjaC5kaWZmcylcbiAgICAgICAgLnN1YnN0cmluZygwLCB0aGlzLlBhdGNoX01hcmdpbik7XG4gICAgICBpZiAocG9zdGNvbnRleHQgIT09ICcnKSB7XG4gICAgICAgIHBhdGNoLmxlbmd0aDEgKz0gcG9zdGNvbnRleHQubGVuZ3RoO1xuICAgICAgICBwYXRjaC5sZW5ndGgyICs9IHBvc3Rjb250ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHBhdGNoLmRpZmZzLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICAgICAgcGF0Y2guZGlmZnNbcGF0Y2guZGlmZnMubGVuZ3RoIC0gMV1bMF0gPT09IERJRkZfRVFVQUwpIHtcbiAgICAgICAgICBwYXRjaC5kaWZmc1twYXRjaC5kaWZmcy5sZW5ndGggLSAxXVsxXSArPSBwb3N0Y29udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXRjaC5kaWZmcy5wdXNoKFtESUZGX0VRVUFMLCBwb3N0Y29udGV4dF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWVtcHR5KSB7XG4gICAgICAgIHBhdGNoZXMuc3BsaWNlKCsreCwgMCwgcGF0Y2gpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuXG4vKipcbiAqIFRha2UgYSBsaXN0IG9mIHBhdGNoZXMgYW5kIHJldHVybiBhIHRleHR1YWwgcmVwcmVzZW50YXRpb24uXG4gKiBAcGFyYW0geyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqPn0gcGF0Y2hlcyBBcnJheSBvZiBQYXRjaCBvYmplY3RzLlxuICogQHJldHVybiB7c3RyaW5nfSBUZXh0IHJlcHJlc2VudGF0aW9uIG9mIHBhdGNoZXMuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLnBhdGNoX3RvVGV4dCA9IGZ1bmN0aW9uKHBhdGNoZXMpIHtcbiAgdmFyIHRleHQgPSBbXTtcbiAgZm9yICh2YXIgeCA9IDA7IHggPCBwYXRjaGVzLmxlbmd0aDsgeCsrKSB7XG4gICAgdGV4dFt4XSA9IHBhdGNoZXNbeF07XG4gIH1cbiAgcmV0dXJuIHRleHQuam9pbignJyk7XG59O1xuXG5cbi8qKlxuICogUGFyc2UgYSB0ZXh0dWFsIHJlcHJlc2VudGF0aW9uIG9mIHBhdGNoZXMgYW5kIHJldHVybiBhIGxpc3Qgb2YgUGF0Y2ggb2JqZWN0cy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0bGluZSBUZXh0IHJlcHJlc2VudGF0aW9uIG9mIHBhdGNoZXMuXG4gKiBAcmV0dXJuIHshQXJyYXkuPCFkaWZmX21hdGNoX3BhdGNoLnBhdGNoX29iaj59IEFycmF5IG9mIFBhdGNoIG9iamVjdHMuXG4gKiBAdGhyb3dzIHshRXJyb3J9IElmIGludmFsaWQgaW5wdXQuXG4gKi9cbmRpZmZfbWF0Y2hfcGF0Y2gucHJvdG90eXBlLnBhdGNoX2Zyb21UZXh0ID0gZnVuY3Rpb24odGV4dGxpbmUpIHtcbiAgdmFyIHBhdGNoZXMgPSBbXTtcbiAgaWYgKCF0ZXh0bGluZSkge1xuICAgIHJldHVybiBwYXRjaGVzO1xuICB9XG4gIHZhciB0ZXh0ID0gdGV4dGxpbmUuc3BsaXQoJ1xcbicpO1xuICB2YXIgdGV4dFBvaW50ZXIgPSAwO1xuICB2YXIgcGF0Y2hIZWFkZXIgPSAvXkBAIC0oXFxkKyksPyhcXGQqKSBcXCsoXFxkKyksPyhcXGQqKSBAQCQvO1xuICB3aGlsZSAodGV4dFBvaW50ZXIgPCB0ZXh0Lmxlbmd0aCkge1xuICAgIHZhciBtID0gdGV4dFt0ZXh0UG9pbnRlcl0ubWF0Y2gocGF0Y2hIZWFkZXIpO1xuICAgIGlmICghbSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBhdGNoIHN0cmluZzogJyArIHRleHRbdGV4dFBvaW50ZXJdKTtcbiAgICB9XG4gICAgdmFyIHBhdGNoID0gbmV3IGRpZmZfbWF0Y2hfcGF0Y2gucGF0Y2hfb2JqKCk7XG4gICAgcGF0Y2hlcy5wdXNoKHBhdGNoKTtcbiAgICBwYXRjaC5zdGFydDEgPSBwYXJzZUludChtWzFdLCAxMCk7XG4gICAgaWYgKG1bMl0gPT09ICcnKSB7XG4gICAgICBwYXRjaC5zdGFydDEtLTtcbiAgICAgIHBhdGNoLmxlbmd0aDEgPSAxO1xuICAgIH0gZWxzZSBpZiAobVsyXSA9PSAnMCcpIHtcbiAgICAgIHBhdGNoLmxlbmd0aDEgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXRjaC5zdGFydDEtLTtcbiAgICAgIHBhdGNoLmxlbmd0aDEgPSBwYXJzZUludChtWzJdLCAxMCk7XG4gICAgfVxuXG4gICAgcGF0Y2guc3RhcnQyID0gcGFyc2VJbnQobVszXSwgMTApO1xuICAgIGlmIChtWzRdID09PSAnJykge1xuICAgICAgcGF0Y2guc3RhcnQyLS07XG4gICAgICBwYXRjaC5sZW5ndGgyID0gMTtcbiAgICB9IGVsc2UgaWYgKG1bNF0gPT0gJzAnKSB7XG4gICAgICBwYXRjaC5sZW5ndGgyID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcGF0Y2guc3RhcnQyLS07XG4gICAgICBwYXRjaC5sZW5ndGgyID0gcGFyc2VJbnQobVs0XSwgMTApO1xuICAgIH1cbiAgICB0ZXh0UG9pbnRlcisrO1xuXG4gICAgd2hpbGUgKHRleHRQb2ludGVyIDwgdGV4dC5sZW5ndGgpIHtcbiAgICAgIHZhciBzaWduID0gdGV4dFt0ZXh0UG9pbnRlcl0uY2hhckF0KDApO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGxpbmUgPSBkZWNvZGVVUkkodGV4dFt0ZXh0UG9pbnRlcl0uc3Vic3RyaW5nKDEpKTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIC8vIE1hbGZvcm1lZCBVUkkgc2VxdWVuY2UuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSWxsZWdhbCBlc2NhcGUgaW4gcGF0Y2hfZnJvbVRleHQ6ICcgKyBsaW5lKTtcbiAgICAgIH1cbiAgICAgIGlmIChzaWduID09ICctJykge1xuICAgICAgICAvLyBEZWxldGlvbi5cbiAgICAgICAgcGF0Y2guZGlmZnMucHVzaChbRElGRl9ERUxFVEUsIGxpbmVdKTtcbiAgICAgIH0gZWxzZSBpZiAoc2lnbiA9PSAnKycpIHtcbiAgICAgICAgLy8gSW5zZXJ0aW9uLlxuICAgICAgICBwYXRjaC5kaWZmcy5wdXNoKFtESUZGX0lOU0VSVCwgbGluZV0pO1xuICAgICAgfSBlbHNlIGlmIChzaWduID09ICcgJykge1xuICAgICAgICAvLyBNaW5vciBlcXVhbGl0eS5cbiAgICAgICAgcGF0Y2guZGlmZnMucHVzaChbRElGRl9FUVVBTCwgbGluZV0pO1xuICAgICAgfSBlbHNlIGlmIChzaWduID09ICdAJykge1xuICAgICAgICAvLyBTdGFydCBvZiBuZXh0IHBhdGNoLlxuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSBpZiAoc2lnbiA9PT0gJycpIHtcbiAgICAgICAgLy8gQmxhbmsgbGluZT8gIFdoYXRldmVyLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV1RGP1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGF0Y2ggbW9kZSBcIicgKyBzaWduICsgJ1wiIGluOiAnICsgbGluZSk7XG4gICAgICB9XG4gICAgICB0ZXh0UG9pbnRlcisrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGF0Y2hlcztcbn07XG5cblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgb25lIHBhdGNoIG9wZXJhdGlvbi5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5kaWZmX21hdGNoX3BhdGNoLnBhdGNoX29iaiA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUgeyFBcnJheS48IWRpZmZfbWF0Y2hfcGF0Y2guRGlmZj59ICovXG4gIHRoaXMuZGlmZnMgPSBbXTtcbiAgLyoqIEB0eXBlIHs/bnVtYmVyfSAqL1xuICB0aGlzLnN0YXJ0MSA9IG51bGw7XG4gIC8qKiBAdHlwZSB7P251bWJlcn0gKi9cbiAgdGhpcy5zdGFydDIgPSBudWxsO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5sZW5ndGgxID0gMDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMubGVuZ3RoMiA9IDA7XG59O1xuXG5cbi8qKlxuICogRW1tdWxhdGUgR05VIGRpZmYncyBmb3JtYXQuXG4gKiBIZWFkZXI6IEBAIC0zODIsOCArNDgxLDkgQEBcbiAqIEluZGljaWVzIGFyZSBwcmludGVkIGFzIDEtYmFzZWQsIG5vdCAwLWJhc2VkLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgR05VIGRpZmYgc3RyaW5nLlxuICovXG5kaWZmX21hdGNoX3BhdGNoLnBhdGNoX29iai5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNvb3JkczEsIGNvb3JkczI7XG4gIGlmICh0aGlzLmxlbmd0aDEgPT09IDApIHtcbiAgICBjb29yZHMxID0gdGhpcy5zdGFydDEgKyAnLDAnO1xuICB9IGVsc2UgaWYgKHRoaXMubGVuZ3RoMSA9PSAxKSB7XG4gICAgY29vcmRzMSA9IHRoaXMuc3RhcnQxICsgMTtcbiAgfSBlbHNlIHtcbiAgICBjb29yZHMxID0gKHRoaXMuc3RhcnQxICsgMSkgKyAnLCcgKyB0aGlzLmxlbmd0aDE7XG4gIH1cbiAgaWYgKHRoaXMubGVuZ3RoMiA9PT0gMCkge1xuICAgIGNvb3JkczIgPSB0aGlzLnN0YXJ0MiArICcsMCc7XG4gIH0gZWxzZSBpZiAodGhpcy5sZW5ndGgyID09IDEpIHtcbiAgICBjb29yZHMyID0gdGhpcy5zdGFydDIgKyAxO1xuICB9IGVsc2Uge1xuICAgIGNvb3JkczIgPSAodGhpcy5zdGFydDIgKyAxKSArICcsJyArIHRoaXMubGVuZ3RoMjtcbiAgfVxuICB2YXIgdGV4dCA9IFsnQEAgLScgKyBjb29yZHMxICsgJyArJyArIGNvb3JkczIgKyAnIEBAXFxuJ107XG4gIHZhciBvcDtcbiAgLy8gRXNjYXBlIHRoZSBib2R5IG9mIHRoZSBwYXRjaCB3aXRoICV4eCBub3RhdGlvbi5cbiAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmRpZmZzLmxlbmd0aDsgeCsrKSB7XG4gICAgc3dpdGNoICh0aGlzLmRpZmZzW3hdWzBdKSB7XG4gICAgICBjYXNlIERJRkZfSU5TRVJUOlxuICAgICAgICBvcCA9ICcrJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERJRkZfREVMRVRFOlxuICAgICAgICBvcCA9ICctJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERJRkZfRVFVQUw6XG4gICAgICAgIG9wID0gJyAnO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdGV4dFt4ICsgMV0gPSBvcCArIGVuY29kZVVSSSh0aGlzLmRpZmZzW3hdWzFdKSArICdcXG4nO1xuICB9XG4gIHJldHVybiB0ZXh0LmpvaW4oJycpLnJlcGxhY2UoLyUyMC9nLCAnICcpO1xufTtcblxuXG4vLyBFeHBvcnQgdGhlc2UgZ2xvYmFsIHZhcmlhYmxlcyBzbyB0aGF0IHRoZXkgc3Vydml2ZSBHb29nbGUncyBKUyBjb21waWxlci5cbi8vIEluIGEgYnJvd3NlciwgJ3RoaXMnIHdpbGwgYmUgJ3dpbmRvdycuXG4vLyBVc2VycyBvZiBub2RlLmpzIHNob3VsZCAncmVxdWlyZScgdGhlIHVuY29tcHJlc3NlZCB2ZXJzaW9uIHNpbmNlIEdvb2dsZSdzXG4vLyBKUyBjb21waWxlciBtYXkgYnJlYWsgdGhlIGZvbGxvd2luZyBleHBvcnRzIGZvciBub24tYnJvd3NlciBlbnZpcm9ubWVudHMuXG50aGlzWydkaWZmX21hdGNoX3BhdGNoJ10gPSBkaWZmX21hdGNoX3BhdGNoO1xudGhpc1snRElGRl9ERUxFVEUnXSA9IERJRkZfREVMRVRFO1xudGhpc1snRElGRl9JTlNFUlQnXSA9IERJRkZfSU5TRVJUO1xudGhpc1snRElGRl9FUVVBTCddID0gRElGRl9FUVVBTDsiXSwibmFtZXMiOlsiZGlmZl9tYXRjaF9wYXRjaCIsIkRpZmZfVGltZW91dCIsIkRpZmZfRWRpdENvc3QiLCJNYXRjaF9UaHJlc2hvbGQiLCJNYXRjaF9EaXN0YW5jZSIsIlBhdGNoX0RlbGV0ZVRocmVzaG9sZCIsIlBhdGNoX01hcmdpbiIsIk1hdGNoX01heEJpdHMiLCJESUZGX0RFTEVURSIsIkRJRkZfSU5TRVJUIiwiRElGRl9FUVVBTCIsIkRpZmYiLCJwcm90b3R5cGUiLCJkaWZmX21haW4iLCJ0ZXh0MSIsInRleHQyIiwib3B0X2NoZWNrbGluZXMiLCJvcHRfZGVhZGxpbmUiLCJOdW1iZXIiLCJNQVhfVkFMVUUiLCJEYXRlIiwiZ2V0VGltZSIsImRlYWRsaW5lIiwiRXJyb3IiLCJjaGVja2xpbmVzIiwiY29tbW9ubGVuZ3RoIiwiZGlmZl9jb21tb25QcmVmaXgiLCJjb21tb25wcmVmaXgiLCJzdWJzdHJpbmciLCJkaWZmX2NvbW1vblN1ZmZpeCIsImNvbW1vbnN1ZmZpeCIsImxlbmd0aCIsImRpZmZzIiwiZGlmZl9jb21wdXRlXyIsInVuc2hpZnQiLCJwdXNoIiwiZGlmZl9jbGVhbnVwTWVyZ2UiLCJsb25ndGV4dCIsInNob3J0dGV4dCIsImkiLCJpbmRleE9mIiwiaG0iLCJkaWZmX2hhbGZNYXRjaF8iLCJ0ZXh0MV9hIiwidGV4dDFfYiIsInRleHQyX2EiLCJ0ZXh0Ml9iIiwibWlkX2NvbW1vbiIsImRpZmZzX2EiLCJkaWZmc19iIiwiY29uY2F0IiwiZGlmZl9saW5lTW9kZV8iLCJkaWZmX2Jpc2VjdF8iLCJhIiwiZGlmZl9saW5lc1RvQ2hhcnNfIiwiY2hhcnMxIiwiY2hhcnMyIiwibGluZWFycmF5IiwibGluZUFycmF5IiwiZGlmZl9jaGFyc1RvTGluZXNfIiwiZGlmZl9jbGVhbnVwU2VtYW50aWMiLCJwb2ludGVyIiwiY291bnRfZGVsZXRlIiwiY291bnRfaW5zZXJ0IiwidGV4dF9kZWxldGUiLCJ0ZXh0X2luc2VydCIsInNwbGljZSIsImoiLCJwb3AiLCJ0ZXh0MV9sZW5ndGgiLCJ0ZXh0Ml9sZW5ndGgiLCJtYXhfZCIsIk1hdGgiLCJjZWlsIiwidl9vZmZzZXQiLCJ2X2xlbmd0aCIsInYxIiwiQXJyYXkiLCJ2MiIsIngiLCJkZWx0YSIsImZyb250IiwiazFzdGFydCIsImsxZW5kIiwiazJzdGFydCIsImsyZW5kIiwiZCIsImsxIiwiazFfb2Zmc2V0IiwieDEiLCJ5MSIsImNoYXJBdCIsImsyX29mZnNldCIsIngyIiwiZGlmZl9iaXNlY3RTcGxpdF8iLCJrMiIsInkyIiwieSIsInRleHQxYSIsInRleHQyYSIsInRleHQxYiIsInRleHQyYiIsImRpZmZzYiIsImxpbmVIYXNoIiwiZGlmZl9saW5lc1RvQ2hhcnNNdW5nZV8iLCJ0ZXh0IiwiY2hhcnMiLCJsaW5lU3RhcnQiLCJsaW5lRW5kIiwibGluZUFycmF5TGVuZ3RoIiwibGluZSIsImhhc093blByb3BlcnR5IiwidW5kZWZpbmVkIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiY2hhckNvZGVBdCIsImpvaW4iLCJwb2ludGVybWluIiwicG9pbnRlcm1heCIsIm1pbiIsInBvaW50ZXJtaWQiLCJwb2ludGVyc3RhcnQiLCJmbG9vciIsInBvaW50ZXJlbmQiLCJkaWZmX2NvbW1vbk92ZXJsYXBfIiwidGV4dF9sZW5ndGgiLCJiZXN0IiwicGF0dGVybiIsImZvdW5kIiwiZG1wIiwiZGlmZl9oYWxmTWF0Y2hJXyIsInNlZWQiLCJiZXN0X2NvbW1vbiIsImJlc3RfbG9uZ3RleHRfYSIsImJlc3RfbG9uZ3RleHRfYiIsImJlc3Rfc2hvcnR0ZXh0X2EiLCJiZXN0X3Nob3J0dGV4dF9iIiwicHJlZml4TGVuZ3RoIiwic3VmZml4TGVuZ3RoIiwiaG0xIiwiaG0yIiwiY2hhbmdlcyIsImVxdWFsaXRpZXMiLCJlcXVhbGl0aWVzTGVuZ3RoIiwibGFzdGVxdWFsaXR5IiwibGVuZ3RoX2luc2VydGlvbnMxIiwibGVuZ3RoX2RlbGV0aW9uczEiLCJsZW5ndGhfaW5zZXJ0aW9uczIiLCJsZW5ndGhfZGVsZXRpb25zMiIsIm1heCIsImRpZmZfY2xlYW51cFNlbWFudGljTG9zc2xlc3MiLCJkZWxldGlvbiIsImluc2VydGlvbiIsIm92ZXJsYXBfbGVuZ3RoMSIsIm92ZXJsYXBfbGVuZ3RoMiIsImRpZmZfY2xlYW51cFNlbWFudGljU2NvcmVfIiwib25lIiwidHdvIiwiY2hhcjEiLCJjaGFyMiIsIm5vbkFscGhhTnVtZXJpYzEiLCJtYXRjaCIsIm5vbkFscGhhTnVtZXJpY1JlZ2V4XyIsIm5vbkFscGhhTnVtZXJpYzIiLCJ3aGl0ZXNwYWNlMSIsIndoaXRlc3BhY2VSZWdleF8iLCJ3aGl0ZXNwYWNlMiIsImxpbmVCcmVhazEiLCJsaW5lYnJlYWtSZWdleF8iLCJsaW5lQnJlYWsyIiwiYmxhbmtMaW5lMSIsImJsYW5rbGluZUVuZFJlZ2V4XyIsImJsYW5rTGluZTIiLCJibGFua2xpbmVTdGFydFJlZ2V4XyIsImVxdWFsaXR5MSIsImVkaXQiLCJlcXVhbGl0eTIiLCJjb21tb25PZmZzZXQiLCJjb21tb25TdHJpbmciLCJiZXN0RXF1YWxpdHkxIiwiYmVzdEVkaXQiLCJiZXN0RXF1YWxpdHkyIiwiYmVzdFNjb3JlIiwic2NvcmUiLCJkaWZmX2NsZWFudXBFZmZpY2llbmN5IiwicHJlX2lucyIsInByZV9kZWwiLCJwb3N0X2lucyIsInBvc3RfZGVsIiwiZGlmZl94SW5kZXgiLCJsb2MiLCJsYXN0X2NoYXJzMSIsImxhc3RfY2hhcnMyIiwiZGlmZl9wcmV0dHlIdG1sIiwiaHRtbCIsInBhdHRlcm5fYW1wIiwicGF0dGVybl9sdCIsInBhdHRlcm5fZ3QiLCJwYXR0ZXJuX3BhcmEiLCJvcCIsImRhdGEiLCJyZXBsYWNlIiwiZGlmZl90ZXh0MSIsImRpZmZfdGV4dDIiLCJkaWZmX2xldmVuc2h0ZWluIiwibGV2ZW5zaHRlaW4iLCJpbnNlcnRpb25zIiwiZGVsZXRpb25zIiwiZGlmZl90b0RlbHRhIiwiZW5jb2RlVVJJIiwiZGlmZl9mcm9tRGVsdGEiLCJkaWZmc0xlbmd0aCIsInRva2VucyIsInNwbGl0IiwicGFyYW0iLCJkZWNvZGVVUkkiLCJleCIsIm4iLCJwYXJzZUludCIsImlzTmFOIiwibWF0Y2hfbWFpbiIsIm1hdGNoX2JpdGFwXyIsInMiLCJtYXRjaF9hbHBoYWJldF8iLCJtYXRjaF9iaXRhcFNjb3JlXyIsImUiLCJhY2N1cmFjeSIsInByb3hpbWl0eSIsImFicyIsInNjb3JlX3RocmVzaG9sZCIsImJlc3RfbG9jIiwibGFzdEluZGV4T2YiLCJtYXRjaG1hc2siLCJiaW5fbWluIiwiYmluX21pZCIsImJpbl9tYXgiLCJsYXN0X3JkIiwic3RhcnQiLCJmaW5pc2giLCJyZCIsImNoYXJNYXRjaCIsInBhdGNoX2FkZENvbnRleHRfIiwicGF0Y2giLCJzdGFydDIiLCJsZW5ndGgxIiwicGFkZGluZyIsInByZWZpeCIsInN1ZmZpeCIsInN0YXJ0MSIsImxlbmd0aDIiLCJwYXRjaF9tYWtlIiwib3B0X2IiLCJvcHRfYyIsInBhdGNoZXMiLCJwYXRjaF9vYmoiLCJwYXRjaERpZmZMZW5ndGgiLCJjaGFyX2NvdW50MSIsImNoYXJfY291bnQyIiwicHJlcGF0Y2hfdGV4dCIsInBvc3RwYXRjaF90ZXh0IiwiZGlmZl90eXBlIiwiZGlmZl90ZXh0IiwicGF0Y2hfZGVlcENvcHkiLCJwYXRjaGVzQ29weSIsInBhdGNoQ29weSIsInNsaWNlIiwicGF0Y2hfYXBwbHkiLCJudWxsUGFkZGluZyIsInBhdGNoX2FkZFBhZGRpbmciLCJwYXRjaF9zcGxpdE1heCIsInJlc3VsdHMiLCJleHBlY3RlZF9sb2MiLCJzdGFydF9sb2MiLCJlbmRfbG9jIiwiaW5kZXgxIiwiaW5kZXgyIiwibW9kIiwicGFkZGluZ0xlbmd0aCIsImV4dHJhTGVuZ3RoIiwicGF0Y2hfc2l6ZSIsImJpZ3BhdGNoIiwicHJlY29udGV4dCIsImVtcHR5Iiwic2hpZnQiLCJwb3N0Y29udGV4dCIsInBhdGNoX3RvVGV4dCIsInBhdGNoX2Zyb21UZXh0IiwidGV4dGxpbmUiLCJ0ZXh0UG9pbnRlciIsInBhdGNoSGVhZGVyIiwibSIsInNpZ24iLCJ0b1N0cmluZyIsImNvb3JkczEiLCJjb29yZHMyIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUVEOzs7O0NBSUMsR0FFRDs7O0NBR0MsR0FDRCxTQUFTQTtJQUVQLFlBQVk7SUFDWiwyREFBMkQ7SUFFM0QscUVBQXFFO0lBQ3JFLElBQUksQ0FBQ0MsWUFBWSxHQUFHO0lBQ3BCLCtEQUErRDtJQUMvRCxJQUFJLENBQUNDLGFBQWEsR0FBRztJQUNyQiwyRUFBMkU7SUFDM0UsSUFBSSxDQUFDQyxlQUFlLEdBQUc7SUFDdkIsMkVBQTJFO0lBQzNFLHdF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