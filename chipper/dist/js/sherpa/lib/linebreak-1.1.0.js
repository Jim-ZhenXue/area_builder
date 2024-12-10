/**
 * Three libraries combined into one file. All are MIT licensed. IIFEs and some glue code to inline classes.trie
 * included.
 *
 * - tiny-inflate 1.0.3. MIT License. Copyright (c) 2015-present Devon Govett
 * - unicode-trie 2.0.0. MIT License. Copyright 2018
 * - linebreak 1.1.0. MIT License. Copyright (c) 2014-present Devon Govett
 *
 * Full licenses are positioned ahead of the combined code.
 */ window.LineBreaker = (()=>{
    /*
tiny-inflate
https://github.com/foliojs/tiny-inflate

MIT License

Copyright (c) 2015-present Devon Govett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

   */ /****** START tiny-inflate/index.js ******/ const inflate = (()=>{
        var TINF_OK = 0;
        var TINF_DATA_ERROR = -3;
        function Tree() {
            this.table = new Uint16Array(16); /* table of code length counts */ 
            this.trans = new Uint16Array(288); /* code -> symbol translation table */ 
        }
        function Data(source, dest) {
            this.source = source;
            this.sourceIndex = 0;
            this.tag = 0;
            this.bitcount = 0;
            this.dest = dest;
            this.destLen = 0;
            this.ltree = new Tree(); /* dynamic length/symbol tree */ 
            this.dtree = new Tree(); /* dynamic distance tree */ 
        }
        /* --------------------------------------------------- *
     * -- uninitialized global data (static structures) -- *
     * --------------------------------------------------- */ var sltree = new Tree();
        var sdtree = new Tree();
        /* extra bits and base tables for length codes */ var length_bits = new Uint8Array(30);
        var length_base = new Uint16Array(30);
        /* extra bits and base tables for distance codes */ var dist_bits = new Uint8Array(30);
        var dist_base = new Uint16Array(30);
        /* special ordering of code length codes */ var clcidx = new Uint8Array([
            16,
            17,
            18,
            0,
            8,
            7,
            9,
            6,
            10,
            5,
            11,
            4,
            12,
            3,
            13,
            2,
            14,
            1,
            15
        ]);
        /* used by tinf_decode_trees, avoids allocations every call */ var code_tree = new Tree();
        var lengths = new Uint8Array(288 + 32);
        /* ----------------------- *
     * -- utility functions -- *
     * ----------------------- */ /* build extra bits and base tables */ function tinf_build_bits_base(bits, base, delta, first) {
            var i, sum;
            /* build bits table */ for(i = 0; i < delta; ++i)bits[i] = 0;
            for(i = 0; i < 30 - delta; ++i)bits[i + delta] = i / delta | 0;
            /* build base table */ for(sum = first, i = 0; i < 30; ++i){
                base[i] = sum;
                sum += 1 << bits[i];
            }
        }
        /* build the fixed huffman trees */ function tinf_build_fixed_trees(lt, dt) {
            var i;
            /* build fixed length tree */ for(i = 0; i < 7; ++i)lt.table[i] = 0;
            lt.table[7] = 24;
            lt.table[8] = 152;
            lt.table[9] = 112;
            for(i = 0; i < 24; ++i)lt.trans[i] = 256 + i;
            for(i = 0; i < 144; ++i)lt.trans[24 + i] = i;
            for(i = 0; i < 8; ++i)lt.trans[24 + 144 + i] = 280 + i;
            for(i = 0; i < 112; ++i)lt.trans[24 + 144 + 8 + i] = 144 + i;
            /* build fixed distance tree */ for(i = 0; i < 5; ++i)dt.table[i] = 0;
            dt.table[5] = 32;
            for(i = 0; i < 32; ++i)dt.trans[i] = i;
        }
        /* given an array of code lengths, build a tree */ var offs = new Uint16Array(16);
        function tinf_build_tree(t, lengths, off, num) {
            var i, sum;
            /* clear code length count table */ for(i = 0; i < 16; ++i)t.table[i] = 0;
            /* scan symbol lengths, and sum code length counts */ for(i = 0; i < num; ++i)t.table[lengths[off + i]]++;
            t.table[0] = 0;
            /* compute offset table for distribution sort */ for(sum = 0, i = 0; i < 16; ++i){
                offs[i] = sum;
                sum += t.table[i];
            }
            /* create code->symbol translation table (symbols sorted by code) */ for(i = 0; i < num; ++i){
                if (lengths[off + i]) t.trans[offs[lengths[off + i]]++] = i;
            }
        }
        /* ---------------------- *
     * -- decode functions -- *
     * ---------------------- */ /* get one bit from source stream */ function tinf_getbit(d) {
            /* check if tag is empty */ if (!d.bitcount--) {
                /* load next tag */ d.tag = d.source[d.sourceIndex++];
                d.bitcount = 7;
            }
            /* shift bit out of tag */ var bit = d.tag & 1;
            d.tag >>>= 1;
            return bit;
        }
        /* read a num bit value from a stream and add base */ function tinf_read_bits(d, num, base) {
            if (!num) return base;
            while(d.bitcount < 24){
                d.tag |= d.source[d.sourceIndex++] << d.bitcount;
                d.bitcount += 8;
            }
            var val = d.tag & 0xffff >>> 16 - num;
            d.tag >>>= num;
            d.bitcount -= num;
            return val + base;
        }
        /* given a data stream and a tree, decode a symbol */ function tinf_decode_symbol(d, t) {
            while(d.bitcount < 24){
                d.tag |= d.source[d.sourceIndex++] << d.bitcount;
                d.bitcount += 8;
            }
            var sum = 0, cur = 0, len = 0;
            var tag = d.tag;
            /* get more bits while code value is above sum */ do {
                cur = 2 * cur + (tag & 1);
                tag >>>= 1;
                ++len;
                sum += t.table[len];
                cur -= t.table[len];
            }while (cur >= 0)
            d.tag = tag;
            d.bitcount -= len;
            return t.trans[sum + cur];
        }
        /* given a data stream, decode dynamic trees from it */ function tinf_decode_trees(d, lt, dt) {
            var hlit, hdist, hclen;
            var i, num, length;
            /* get 5 bits HLIT (257-286) */ hlit = tinf_read_bits(d, 5, 257);
            /* get 5 bits HDIST (1-32) */ hdist = tinf_read_bits(d, 5, 1);
            /* get 4 bits HCLEN (4-19) */ hclen = tinf_read_bits(d, 4, 4);
            for(i = 0; i < 19; ++i)lengths[i] = 0;
            /* read code lengths for code length alphabet */ for(i = 0; i < hclen; ++i){
                /* get 3 bits code length (0-7) */ var clen = tinf_read_bits(d, 3, 0);
                lengths[clcidx[i]] = clen;
            }
            /* build code length tree */ tinf_build_tree(code_tree, lengths, 0, 19);
            /* decode code lengths for the dynamic trees */ for(num = 0; num < hlit + hdist;){
                var sym = tinf_decode_symbol(d, code_tree);
                switch(sym){
                    case 16:
                        /* copy previous code length 3-6 times (read 2 bits) */ var prev = lengths[num - 1];
                        for(length = tinf_read_bits(d, 2, 3); length; --length){
                            lengths[num++] = prev;
                        }
                        break;
                    case 17:
                        /* repeat code length 0 for 3-10 times (read 3 bits) */ for(length = tinf_read_bits(d, 3, 3); length; --length){
                            lengths[num++] = 0;
                        }
                        break;
                    case 18:
                        /* repeat code length 0 for 11-138 times (read 7 bits) */ for(length = tinf_read_bits(d, 7, 11); length; --length){
                            lengths[num++] = 0;
                        }
                        break;
                    default:
                        /* values 0-15 represent the actual code lengths */ lengths[num++] = sym;
                        break;
                }
            }
            /* build dynamic trees */ tinf_build_tree(lt, lengths, 0, hlit);
            tinf_build_tree(dt, lengths, hlit, hdist);
        }
        /* ----------------------------- *
     * -- block inflate functions -- *
     * ----------------------------- */ /* given a stream and two trees, inflate a block of data */ function tinf_inflate_block_data(d, lt, dt) {
            while(1){
                var sym = tinf_decode_symbol(d, lt);
                /* check for end of block */ if (sym === 256) {
                    return TINF_OK;
                }
                if (sym < 256) {
                    d.dest[d.destLen++] = sym;
                } else {
                    var length, dist, offs;
                    var i;
                    sym -= 257;
                    /* possibly get more bits from length code */ length = tinf_read_bits(d, length_bits[sym], length_base[sym]);
                    dist = tinf_decode_symbol(d, dt);
                    /* possibly get more bits from distance code */ offs = d.destLen - tinf_read_bits(d, dist_bits[dist], dist_base[dist]);
                    /* copy match */ for(i = offs; i < offs + length; ++i){
                        d.dest[d.destLen++] = d.dest[i];
                    }
                }
            }
        }
        /* inflate an uncompressed block of data */ function tinf_inflate_uncompressed_block(d) {
            var length, invlength;
            var i;
            /* unread from bitbuffer */ while(d.bitcount > 8){
                d.sourceIndex--;
                d.bitcount -= 8;
            }
            /* get length */ length = d.source[d.sourceIndex + 1];
            length = 256 * length + d.source[d.sourceIndex];
            /* get one's complement of length */ invlength = d.source[d.sourceIndex + 3];
            invlength = 256 * invlength + d.source[d.sourceIndex + 2];
            /* check length */ if (length !== (~invlength & 0x0000ffff)) return TINF_DATA_ERROR;
            d.sourceIndex += 4;
            /* copy block */ for(i = length; i; --i)d.dest[d.destLen++] = d.source[d.sourceIndex++];
            /* make sure we start next block on a byte boundary */ d.bitcount = 0;
            return TINF_OK;
        }
        /* inflate stream from source to dest */ function tinf_uncompress(source, dest) {
            var d = new Data(source, dest);
            var bfinal, btype, res;
            do {
                /* read final block flag */ bfinal = tinf_getbit(d);
                /* read block type (2 bits) */ btype = tinf_read_bits(d, 2, 0);
                /* decompress block */ switch(btype){
                    case 0:
                        /* decompress uncompressed block */ res = tinf_inflate_uncompressed_block(d);
                        break;
                    case 1:
                        /* decompress block with fixed huffman trees */ res = tinf_inflate_block_data(d, sltree, sdtree);
                        break;
                    case 2:
                        /* decompress block with dynamic huffman trees */ tinf_decode_trees(d, d.ltree, d.dtree);
                        res = tinf_inflate_block_data(d, d.ltree, d.dtree);
                        break;
                    default:
                        res = TINF_DATA_ERROR;
                }
                if (res !== TINF_OK) throw new Error('Data error');
            }while (!bfinal)
            if (d.destLen < d.dest.length) {
                if (typeof d.dest.slice === 'function') return d.dest.slice(0, d.destLen);
                else return d.dest.subarray(0, d.destLen);
            }
            return d.dest;
        }
        /* -------------------- *
     * -- initialization -- *
     * -------------------- */ /* build fixed huffman trees */ tinf_build_fixed_trees(sltree, sdtree);
        /* build extra bits and base tables */ tinf_build_bits_base(length_bits, length_base, 4, 3);
        tinf_build_bits_base(dist_bits, dist_base, 2, 1);
        /* fix a special case */ length_bits[28] = 0;
        length_base[28] = 258;
        /****** END tiny-inflate/index.js ******/ return tinf_uncompress;
    })();
    /*
unicode-trie
https://github.com/foliojs/unicode-trie

Copyright 2018

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  */ /****** START unicode-trie/swap.js ******/ const swap32LE = (()=>{
        const isBigEndian = new Uint8Array(new Uint32Array([
            0x12345678
        ]).buffer)[0] === 0x12;
        const swap = (b, n, m)=>{
            let i = b[n];
            b[n] = b[m];
            b[m] = i;
        };
        const swap32 = (array)=>{
            const len = array.length;
            for(let i = 0; i < len; i += 4){
                swap(array, i, i + 3);
                swap(array, i + 1, i + 2);
            }
        };
        const swap32LE = (array)=>{
            if (isBigEndian) {
                swap32(array);
            }
        };
        return swap32LE;
    })();
    /****** END unicode-trie/swap.js ******/ /****** START unicode-trie/index.js ******/ const UnicodeTrie = (()=>{
        // Shift size for getting the index-1 table offset.
        const SHIFT_1 = 6 + 5;
        // Shift size for getting the index-2 table offset.
        const SHIFT_2 = 5;
        // Difference between the two shift sizes,
        // for getting an index-1 offset from an index-2 offset. 6=11-5
        const SHIFT_1_2 = SHIFT_1 - SHIFT_2;
        // Number of index-1 entries for the BMP. 32=0x20
        // This part of the index-1 table is omitted from the serialized form.
        const OMITTED_BMP_INDEX_1_LENGTH = 0x10000 >> SHIFT_1;
        // Number of entries in an index-2 block. 64=0x40
        const INDEX_2_BLOCK_LENGTH = 1 << SHIFT_1_2;
        // Mask for getting the lower bits for the in-index-2-block offset. */
        const INDEX_2_MASK = INDEX_2_BLOCK_LENGTH - 1;
        // Shift size for shifting left the index array values.
        // Increases possible data size with 16-bit index values at the cost
        // of compactability.
        // This requires data blocks to be aligned by DATA_GRANULARITY.
        const INDEX_SHIFT = 2;
        // Number of entries in a data block. 32=0x20
        const DATA_BLOCK_LENGTH = 1 << SHIFT_2;
        // Mask for getting the lower bits for the in-data-block offset.
        const DATA_MASK = DATA_BLOCK_LENGTH - 1;
        // The part of the index-2 table for U+D800..U+DBFF stores values for
        // lead surrogate code _units_ not code _points_.
        // Values for lead surrogate code _points_ are indexed with this portion of the table.
        // Length=32=0x20=0x400>>SHIFT_2. (There are 1024=0x400 lead surrogates.)
        const LSCP_INDEX_2_OFFSET = 0x10000 >> SHIFT_2;
        const LSCP_INDEX_2_LENGTH = 0x400 >> SHIFT_2;
        // Count the lengths of both BMP pieces. 2080=0x820
        const INDEX_2_BMP_LENGTH = LSCP_INDEX_2_OFFSET + LSCP_INDEX_2_LENGTH;
        // The 2-byte UTF-8 version of the index-2 table follows at offset 2080=0x820.
        // Length 32=0x20 for lead bytes C0..DF, regardless of SHIFT_2.
        const UTF8_2B_INDEX_2_OFFSET = INDEX_2_BMP_LENGTH;
        const UTF8_2B_INDEX_2_LENGTH = 0x800 >> 6; // U+0800 is the first code point after 2-byte UTF-8
        // The index-1 table, only used for supplementary code points, at offset 2112=0x840.
        // Variable length, for code points up to highStart, where the last single-value range starts.
        // Maximum length 512=0x200=0x100000>>SHIFT_1.
        // (For 0x100000 supplementary code points U+10000..U+10ffff.)
        //
        // The part of the index-2 table for supplementary code points starts
        // after this index-1 table.
        //
        // Both the index-1 table and the following part of the index-2 table
        // are omitted completely if there is only BMP data.
        const INDEX_1_OFFSET = UTF8_2B_INDEX_2_OFFSET + UTF8_2B_INDEX_2_LENGTH;
        // The alignment size of a data block. Also the granularity for compaction.
        const DATA_GRANULARITY = 1 << INDEX_SHIFT;
        let UnicodeTrie = class UnicodeTrie {
            get(codePoint) {
                let index;
                if (codePoint < 0 || codePoint > 0x10ffff) {
                    return this.errorValue;
                }
                if (codePoint < 0xd800 || codePoint > 0xdbff && codePoint <= 0xffff) {
                    // Ordinary BMP code point, excluding leading surrogates.
                    // BMP uses a single level lookup.  BMP index starts at offset 0 in the index.
                    // data is stored in the index array itself.
                    index = (this.data[codePoint >> SHIFT_2] << INDEX_SHIFT) + (codePoint & DATA_MASK);
                    return this.data[index];
                }
                if (codePoint <= 0xffff) {
                    // Lead Surrogate Code Point.  A Separate index section is stored for
                    // lead surrogate code units and code points.
                    //   The main index has the code unit data.
                    //   For this function, we need the code point data.
                    index = (this.data[LSCP_INDEX_2_OFFSET + (codePoint - 0xd800 >> SHIFT_2)] << INDEX_SHIFT) + (codePoint & DATA_MASK);
                    return this.data[index];
                }
                if (codePoint < this.highStart) {
                    // Supplemental code point, use two-level lookup.
                    index = this.data[INDEX_1_OFFSET - OMITTED_BMP_INDEX_1_LENGTH + (codePoint >> SHIFT_1)];
                    index = this.data[index + (codePoint >> SHIFT_2 & INDEX_2_MASK)];
                    index = (index << INDEX_SHIFT) + (codePoint & DATA_MASK);
                    return this.data[index];
                }
                return this.data[this.data.length - DATA_GRANULARITY];
            }
            constructor(data){
                const isBuffer = typeof data.readUInt32BE === 'function' && typeof data.slice === 'function';
                if (isBuffer || data instanceof Uint8Array) {
                    // read binary format
                    let uncompressedLength;
                    if (isBuffer) {
                        this.highStart = data.readUInt32LE(0);
                        this.errorValue = data.readUInt32LE(4);
                        uncompressedLength = data.readUInt32LE(8);
                        data = data.slice(12);
                    } else {
                        const view = new DataView(data.buffer);
                        this.highStart = view.getUint32(0, true);
                        this.errorValue = view.getUint32(4, true);
                        uncompressedLength = view.getUint32(8, true);
                        data = data.subarray(12);
                    }
                    // double inflate the actual trie data
                    data = inflate(data, new Uint8Array(uncompressedLength));
                    data = inflate(data, new Uint8Array(uncompressedLength));
                    // swap bytes from little-endian
                    swap32LE(data);
                    this.data = new Uint32Array(data.buffer);
                } else {
                    // pre-parsed data
                    ({ data: this.data, highStart: this.highStart, errorValue: this.errorValue } = data);
                }
            }
        };
        /****** END unicode-trie/index.js ******/ return UnicodeTrie;
    })();
    /*
linebreak
https://github.com/foliojs/linebreak

MIT License

Copyright (c) 2014-present Devon Govett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
   */ // Some glue to avoid the file read, and get it into a proper Uint8Array desired by UnicodeTrie
    /****** START linebreak/src/classes.trie ******/ const base64Data = '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';
    /****** END linebreak/src/classes.trie ******/ // Custom conversion code
    const toTypedArray = (base64)=>{
        const binary = window.atob(base64);
        const result = new Uint8Array(binary.length);
        for(var i = 0; i < binary.length; i++){
            result[i] = binary.charCodeAt(i);
        }
        return result;
    };
    const data = toTypedArray(base64Data);
    // line from linebreak/src/linebreaker.js
    const classTrie = new UnicodeTrie(data);
    /****** START linebreak/src/classes.js ******/ // The following break classes are handled by the pair table
    const OP = 0; // Opening punctuation
    const CL = 1; // Closing punctuation
    const CP = 2; // Closing parenthesis
    const QU = 3; // Ambiguous quotation
    const GL = 4; // Glue
    const NS = 5; // Non-starters
    const EX = 6; // Exclamation/Interrogation
    const SY = 7; // Symbols allowing break after
    const IS = 8; // Infix separator
    const PR = 9; // Prefix
    const PO = 10; // Postfix
    const NU = 11; // Numeric
    const AL = 12; // Alphabetic
    const HL = 13; // Hebrew Letter
    const ID = 14; // Ideographic
    const IN = 15; // Inseparable characters
    const HY = 16; // Hyphen
    const BA = 17; // Break after
    const BB = 18; // Break before
    const B2 = 19; // Break on either side (but not pair)
    const ZW = 20; // Zero-width space
    const CM = 21; // Combining marks
    const WJ = 22; // Word joiner
    const H2 = 23; // Hangul LV
    const H3 = 24; // Hangul LVT
    const JL = 25; // Hangul L Jamo
    const JV = 26; // Hangul V Jamo
    const JT = 27; // Hangul T Jamo
    const RI = 28; // Regional Indicator
    const EB = 29; // Emoji Base
    const EM = 30; // Emoji Modifier
    const ZWJ = 31; // Zero Width Joiner
    const CB = 32; // Contingent break
    // The following break classes are not handled by the pair table
    const AI = 33; // Ambiguous (Alphabetic or Ideograph)
    const BK = 34; // Break (mandatory)
    const CJ = 35; // Conditional Japanese Starter
    const CR = 36; // Carriage return
    const LF = 37; // Line feed
    const NL = 38; // Next line
    const SA = 39; // South-East Asian
    const SG = 40; // Surrogates
    const SP = 41; // Space
    const XX = 42; // Unknown
    const DI_BRK = 0; // Direct break opportunity
    const IN_BRK = 1; // Indirect break opportunity
    const CI_BRK = 2; // Indirect break opportunity for combining marks
    const CP_BRK = 3; // Prohibited break for combining marks
    const PR_BRK = 4; // Prohibited break
    /****** END linebreak/src/classes.js ******/ /****** START linebreak/src/pairs.js ******/ // Based on example pair table from https://www.unicode.org/reports/tr14/tr14-37.html#Table2
    // - ZWJ special processing for LB8a of Revision 41
    // - CB manually added as per Rule LB20
    // - CL, CP, NS, SY, IS, PR, PO, HY, BA, B2 and RI manually adjusted as per LB22 of Revision 45
    const pairTable = [
        //OP   , CL    , CP    , QU    , GL    , NS    , EX    , SY    , IS    , PR    , PO    , NU    , AL    , HL    , ID    , IN    , HY    , BA    , BB    , B2    , ZW    , CM    , WJ    , H2    , H3    , JL    , JV    , JT    , RI    , EB    , EM    , ZWJ   , CB
        [
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            CP_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            PR_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK
        ],
        [
            IN_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            IN_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            IN_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            IN_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            IN_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            IN_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            DI_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            DI_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            IN_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            PR_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK
        ],
        [
            IN_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            IN_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            IN_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            IN_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ],
        [
            DI_BRK,
            PR_BRK,
            PR_BRK,
            IN_BRK,
            IN_BRK,
            DI_BRK,
            PR_BRK,
            PR_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            PR_BRK,
            CI_BRK,
            PR_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            DI_BRK,
            IN_BRK,
            DI_BRK
        ] // CB
    ];
    /****** END linebreak/src/pairs.js ******/ /****** START linebreak/src/linebreaker.js ******/ const mapClass = function(c) {
        switch(c){
            case AI:
                return AL;
            case SA:
            case SG:
            case XX:
                return AL;
            case CJ:
                return NS;
            default:
                return c;
        }
    };
    const mapFirst = function(c) {
        switch(c){
            case LF:
            case NL:
                return BK;
            case SP:
                return WJ;
            default:
                return c;
        }
    };
    let Break = class Break {
        constructor(position, required = false){
            this.position = position;
            this.required = required;
        }
    };
    let LineBreaker = class LineBreaker {
        nextCodePoint() {
            const code = this.string.charCodeAt(this.pos++);
            const next = this.string.charCodeAt(this.pos);
            // If a surrogate pair
            if (0xd800 <= code && code <= 0xdbff && 0xdc00 <= next && next <= 0xdfff) {
                this.pos++;
                return (code - 0xd800) * 0x400 + (next - 0xdc00) + 0x10000;
            }
            return code;
        }
        nextCharClass() {
            return mapClass(classTrie.get(this.nextCodePoint()));
        }
        getSimpleBreak() {
            // handle classes not handled by the pair table
            switch(this.nextClass){
                case SP:
                    return false;
                case BK:
                case LF:
                case NL:
                    this.curClass = BK;
                    return false;
                case CR:
                    this.curClass = CR;
                    return false;
            }
            return null;
        }
        getPairTableBreak(lastClass) {
            // if not handled already, use the pair table
            let shouldBreak = false;
            switch(pairTable[this.curClass][this.nextClass]){
                case DI_BRK:
                    shouldBreak = true;
                    break;
                case IN_BRK:
                    shouldBreak = lastClass === SP;
                    break;
                case CI_BRK:
                    shouldBreak = lastClass === SP;
                    if (!shouldBreak) {
                        shouldBreak = false;
                        return shouldBreak;
                    }
                    break;
                case CP_BRK:
                    if (lastClass !== SP) {
                        return shouldBreak;
                    }
                    break;
                case PR_BRK:
                    break;
            }
            if (this.LB8a) {
                shouldBreak = false;
            }
            // Rule LB21a
            if (this.LB21a && (this.curClass === HY || this.curClass === BA)) {
                shouldBreak = false;
                this.LB21a = false;
            } else {
                this.LB21a = this.curClass === HL;
            }
            // Rule LB30a
            if (this.curClass === RI) {
                this.LB30a++;
                if (this.LB30a == 2 && this.nextClass === RI) {
                    shouldBreak = true;
                    this.LB30a = 0;
                }
            } else {
                this.LB30a = 0;
            }
            this.curClass = this.nextClass;
            return shouldBreak;
        }
        nextBreak() {
            // get the first char if we're at the beginning of the string
            if (this.curClass == null) {
                let firstClass = this.nextCharClass();
                this.curClass = mapFirst(firstClass);
                this.nextClass = firstClass;
                this.LB8a = firstClass === ZWJ;
                this.LB30a = 0;
            }
            while(this.pos < this.string.length){
                this.lastPos = this.pos;
                const lastClass = this.nextClass;
                this.nextClass = this.nextCharClass();
                // explicit newline
                if (this.curClass === BK || this.curClass === CR && this.nextClass !== LF) {
                    this.curClass = mapFirst(mapClass(this.nextClass));
                    return new Break(this.lastPos, true);
                }
                let shouldBreak = this.getSimpleBreak();
                if (shouldBreak === null) {
                    shouldBreak = this.getPairTableBreak(lastClass);
                }
                // Rule LB8a
                this.LB8a = this.nextClass === ZWJ;
                if (shouldBreak) {
                    return new Break(this.lastPos);
                }
            }
            if (this.lastPos < this.string.length) {
                this.lastPos = this.string.length;
                return new Break(this.string.length);
            }
            return null;
        }
        constructor(string){
            this.string = string;
            this.pos = 0;
            this.lastPos = 0;
            this.curClass = null;
            this.nextClass = null;
            this.LB8a = false;
            this.LB21a = false;
            this.LB30a = 0;
        }
    };
    /****** END linebreak/src/linebreaker.js ******/ return LineBreaker;
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvbGluZWJyZWFrLTEuMS4wLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhyZWUgbGlicmFyaWVzIGNvbWJpbmVkIGludG8gb25lIGZpbGUuIEFsbCBhcmUgTUlUIGxpY2Vuc2VkLiBJSUZFcyBhbmQgc29tZSBnbHVlIGNvZGUgdG8gaW5saW5lIGNsYXNzZXMudHJpZVxuICogaW5jbHVkZWQuXG4gKlxuICogLSB0aW55LWluZmxhdGUgMS4wLjMuIE1JVCBMaWNlbnNlLiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCBEZXZvbiBHb3ZldHRcbiAqIC0gdW5pY29kZS10cmllIDIuMC4wLiBNSVQgTGljZW5zZS4gQ29weXJpZ2h0IDIwMThcbiAqIC0gbGluZWJyZWFrIDEuMS4wLiBNSVQgTGljZW5zZS4gQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQgRGV2b24gR292ZXR0XG4gKlxuICogRnVsbCBsaWNlbnNlcyBhcmUgcG9zaXRpb25lZCBhaGVhZCBvZiB0aGUgY29tYmluZWQgY29kZS5cbiAqL1xuXG53aW5kb3cuTGluZUJyZWFrZXIgPSAoICgpID0+IHtcbiAgLypcbnRpbnktaW5mbGF0ZVxuaHR0cHM6Ly9naXRodWIuY29tL2ZvbGlvanMvdGlueS1pbmZsYXRlXG5cbk1JVCBMaWNlbnNlXG5cbkNvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50IERldm9uIEdvdmV0dFxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuU09GVFdBUkUuXG5cbiAgICovXG4vKioqKioqIFNUQVJUIHRpbnktaW5mbGF0ZS9pbmRleC5qcyAqKioqKiovXG4gIGNvbnN0IGluZmxhdGUgPSAoICgpID0+IHtcbiAgICB2YXIgVElORl9PSyA9IDA7XG4gICAgdmFyIFRJTkZfREFUQV9FUlJPUiA9IC0zO1xuXG4gICAgZnVuY3Rpb24gVHJlZSgpIHtcbiAgICAgIHRoaXMudGFibGUgPSBuZXcgVWludDE2QXJyYXkoMTYpOyAgIC8qIHRhYmxlIG9mIGNvZGUgbGVuZ3RoIGNvdW50cyAqL1xuICAgICAgdGhpcy50cmFucyA9IG5ldyBVaW50MTZBcnJheSgyODgpOyAgLyogY29kZSAtPiBzeW1ib2wgdHJhbnNsYXRpb24gdGFibGUgKi9cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBEYXRhKHNvdXJjZSwgZGVzdCkge1xuICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICB0aGlzLnNvdXJjZUluZGV4ID0gMDtcbiAgICAgIHRoaXMudGFnID0gMDtcbiAgICAgIHRoaXMuYml0Y291bnQgPSAwO1xuXG4gICAgICB0aGlzLmRlc3QgPSBkZXN0O1xuICAgICAgdGhpcy5kZXN0TGVuID0gMDtcblxuICAgICAgdGhpcy5sdHJlZSA9IG5ldyBUcmVlKCk7ICAvKiBkeW5hbWljIGxlbmd0aC9zeW1ib2wgdHJlZSAqL1xuICAgICAgdGhpcy5kdHJlZSA9IG5ldyBUcmVlKCk7ICAvKiBkeW5hbWljIGRpc3RhbmNlIHRyZWUgKi9cbiAgICB9XG5cbiAgICAvKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKlxuICAgICAqIC0tIHVuaW5pdGlhbGl6ZWQgZ2xvYmFsIGRhdGEgKHN0YXRpYyBzdHJ1Y3R1cmVzKSAtLSAqXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgICB2YXIgc2x0cmVlID0gbmV3IFRyZWUoKTtcbiAgICB2YXIgc2R0cmVlID0gbmV3IFRyZWUoKTtcblxuICAgIC8qIGV4dHJhIGJpdHMgYW5kIGJhc2UgdGFibGVzIGZvciBsZW5ndGggY29kZXMgKi9cbiAgICB2YXIgbGVuZ3RoX2JpdHMgPSBuZXcgVWludDhBcnJheSgzMCk7XG4gICAgdmFyIGxlbmd0aF9iYXNlID0gbmV3IFVpbnQxNkFycmF5KDMwKTtcblxuICAgIC8qIGV4dHJhIGJpdHMgYW5kIGJhc2UgdGFibGVzIGZvciBkaXN0YW5jZSBjb2RlcyAqL1xuICAgIHZhciBkaXN0X2JpdHMgPSBuZXcgVWludDhBcnJheSgzMCk7XG4gICAgdmFyIGRpc3RfYmFzZSA9IG5ldyBVaW50MTZBcnJheSgzMCk7XG5cbiAgICAvKiBzcGVjaWFsIG9yZGVyaW5nIG9mIGNvZGUgbGVuZ3RoIGNvZGVzICovXG4gICAgdmFyIGNsY2lkeCA9IG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDE2LCAxNywgMTgsIDAsIDgsIDcsIDksIDYsXG4gICAgICAxMCwgNSwgMTEsIDQsIDEyLCAzLCAxMywgMixcbiAgICAgIDE0LCAxLCAxNVxuICAgIF0pO1xuXG4gICAgLyogdXNlZCBieSB0aW5mX2RlY29kZV90cmVlcywgYXZvaWRzIGFsbG9jYXRpb25zIGV2ZXJ5IGNhbGwgKi9cbiAgICB2YXIgY29kZV90cmVlID0gbmV3IFRyZWUoKTtcbiAgICB2YXIgbGVuZ3RocyA9IG5ldyBVaW50OEFycmF5KDI4OCArIDMyKTtcblxuICAgIC8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICpcbiAgICAgKiAtLSB1dGlsaXR5IGZ1bmN0aW9ucyAtLSAqXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAgIC8qIGJ1aWxkIGV4dHJhIGJpdHMgYW5kIGJhc2UgdGFibGVzICovXG4gICAgZnVuY3Rpb24gdGluZl9idWlsZF9iaXRzX2Jhc2UoYml0cywgYmFzZSwgZGVsdGEsIGZpcnN0KSB7XG4gICAgICB2YXIgaSwgc3VtO1xuXG4gICAgICAvKiBidWlsZCBiaXRzIHRhYmxlICovXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgZGVsdGE7ICsraSkgYml0c1tpXSA9IDA7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgMzAgLSBkZWx0YTsgKytpKSBiaXRzW2kgKyBkZWx0YV0gPSBpIC8gZGVsdGEgfCAwO1xuXG4gICAgICAvKiBidWlsZCBiYXNlIHRhYmxlICovXG4gICAgICBmb3IgKHN1bSA9IGZpcnN0LCBpID0gMDsgaSA8IDMwOyArK2kpIHtcbiAgICAgICAgYmFzZVtpXSA9IHN1bTtcbiAgICAgICAgc3VtICs9IDEgPDwgYml0c1tpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBidWlsZCB0aGUgZml4ZWQgaHVmZm1hbiB0cmVlcyAqL1xuICAgIGZ1bmN0aW9uIHRpbmZfYnVpbGRfZml4ZWRfdHJlZXMobHQsIGR0KSB7XG4gICAgICB2YXIgaTtcblxuICAgICAgLyogYnVpbGQgZml4ZWQgbGVuZ3RoIHRyZWUgKi9cbiAgICAgIGZvciAoaSA9IDA7IGkgPCA3OyArK2kpIGx0LnRhYmxlW2ldID0gMDtcblxuICAgICAgbHQudGFibGVbN10gPSAyNDtcbiAgICAgIGx0LnRhYmxlWzhdID0gMTUyO1xuICAgICAgbHQudGFibGVbOV0gPSAxMTI7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCAyNDsgKytpKSBsdC50cmFuc1tpXSA9IDI1NiArIGk7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgMTQ0OyArK2kpIGx0LnRyYW5zWzI0ICsgaV0gPSBpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IDg7ICsraSkgbHQudHJhbnNbMjQgKyAxNDQgKyBpXSA9IDI4MCArIGk7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgMTEyOyArK2kpIGx0LnRyYW5zWzI0ICsgMTQ0ICsgOCArIGldID0gMTQ0ICsgaTtcblxuICAgICAgLyogYnVpbGQgZml4ZWQgZGlzdGFuY2UgdHJlZSAqL1xuICAgICAgZm9yIChpID0gMDsgaSA8IDU7ICsraSkgZHQudGFibGVbaV0gPSAwO1xuXG4gICAgICBkdC50YWJsZVs1XSA9IDMyO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgMzI7ICsraSkgZHQudHJhbnNbaV0gPSBpO1xuICAgIH1cblxuICAgIC8qIGdpdmVuIGFuIGFycmF5IG9mIGNvZGUgbGVuZ3RocywgYnVpbGQgYSB0cmVlICovXG4gICAgdmFyIG9mZnMgPSBuZXcgVWludDE2QXJyYXkoMTYpO1xuXG4gICAgZnVuY3Rpb24gdGluZl9idWlsZF90cmVlKHQsIGxlbmd0aHMsIG9mZiwgbnVtKSB7XG4gICAgICB2YXIgaSwgc3VtO1xuXG4gICAgICAvKiBjbGVhciBjb2RlIGxlbmd0aCBjb3VudCB0YWJsZSAqL1xuICAgICAgZm9yIChpID0gMDsgaSA8IDE2OyArK2kpIHQudGFibGVbaV0gPSAwO1xuXG4gICAgICAvKiBzY2FuIHN5bWJvbCBsZW5ndGhzLCBhbmQgc3VtIGNvZGUgbGVuZ3RoIGNvdW50cyAqL1xuICAgICAgZm9yIChpID0gMDsgaSA8IG51bTsgKytpKSB0LnRhYmxlW2xlbmd0aHNbb2ZmICsgaV1dKys7XG5cbiAgICAgIHQudGFibGVbMF0gPSAwO1xuXG4gICAgICAvKiBjb21wdXRlIG9mZnNldCB0YWJsZSBmb3IgZGlzdHJpYnV0aW9uIHNvcnQgKi9cbiAgICAgIGZvciAoc3VtID0gMCwgaSA9IDA7IGkgPCAxNjsgKytpKSB7XG4gICAgICAgIG9mZnNbaV0gPSBzdW07XG4gICAgICAgIHN1bSArPSB0LnRhYmxlW2ldO1xuICAgICAgfVxuXG4gICAgICAvKiBjcmVhdGUgY29kZS0+c3ltYm9sIHRyYW5zbGF0aW9uIHRhYmxlIChzeW1ib2xzIHNvcnRlZCBieSBjb2RlKSAqL1xuICAgICAgZm9yIChpID0gMDsgaSA8IG51bTsgKytpKSB7XG4gICAgICAgIGlmIChsZW5ndGhzW29mZiArIGldKSB0LnRyYW5zW29mZnNbbGVuZ3Roc1tvZmYgKyBpXV0rK10gPSBpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKlxuICAgICAqIC0tIGRlY29kZSBmdW5jdGlvbnMgLS0gKlxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAgIC8qIGdldCBvbmUgYml0IGZyb20gc291cmNlIHN0cmVhbSAqL1xuICAgIGZ1bmN0aW9uIHRpbmZfZ2V0Yml0KGQpIHtcbiAgICAgIC8qIGNoZWNrIGlmIHRhZyBpcyBlbXB0eSAqL1xuICAgICAgaWYgKCFkLmJpdGNvdW50LS0pIHtcbiAgICAgICAgLyogbG9hZCBuZXh0IHRhZyAqL1xuICAgICAgICBkLnRhZyA9IGQuc291cmNlW2Quc291cmNlSW5kZXgrK107XG4gICAgICAgIGQuYml0Y291bnQgPSA3O1xuICAgICAgfVxuXG4gICAgICAvKiBzaGlmdCBiaXQgb3V0IG9mIHRhZyAqL1xuICAgICAgdmFyIGJpdCA9IGQudGFnICYgMTtcbiAgICAgIGQudGFnID4+Pj0gMTtcblxuICAgICAgcmV0dXJuIGJpdDtcbiAgICB9XG5cbiAgICAvKiByZWFkIGEgbnVtIGJpdCB2YWx1ZSBmcm9tIGEgc3RyZWFtIGFuZCBhZGQgYmFzZSAqL1xuICAgIGZ1bmN0aW9uIHRpbmZfcmVhZF9iaXRzKGQsIG51bSwgYmFzZSkge1xuICAgICAgaWYgKCFudW0pXG4gICAgICAgIHJldHVybiBiYXNlO1xuXG4gICAgICB3aGlsZSAoZC5iaXRjb3VudCA8IDI0KSB7XG4gICAgICAgIGQudGFnIHw9IGQuc291cmNlW2Quc291cmNlSW5kZXgrK10gPDwgZC5iaXRjb3VudDtcbiAgICAgICAgZC5iaXRjb3VudCArPSA4O1xuICAgICAgfVxuXG4gICAgICB2YXIgdmFsID0gZC50YWcgJiAoMHhmZmZmID4+PiAoMTYgLSBudW0pKTtcbiAgICAgIGQudGFnID4+Pj0gbnVtO1xuICAgICAgZC5iaXRjb3VudCAtPSBudW07XG4gICAgICByZXR1cm4gdmFsICsgYmFzZTtcbiAgICB9XG5cbiAgICAvKiBnaXZlbiBhIGRhdGEgc3RyZWFtIGFuZCBhIHRyZWUsIGRlY29kZSBhIHN5bWJvbCAqL1xuICAgIGZ1bmN0aW9uIHRpbmZfZGVjb2RlX3N5bWJvbChkLCB0KSB7XG4gICAgICB3aGlsZSAoZC5iaXRjb3VudCA8IDI0KSB7XG4gICAgICAgIGQudGFnIHw9IGQuc291cmNlW2Quc291cmNlSW5kZXgrK10gPDwgZC5iaXRjb3VudDtcbiAgICAgICAgZC5iaXRjb3VudCArPSA4O1xuICAgICAgfVxuXG4gICAgICB2YXIgc3VtID0gMCwgY3VyID0gMCwgbGVuID0gMDtcbiAgICAgIHZhciB0YWcgPSBkLnRhZztcblxuICAgICAgLyogZ2V0IG1vcmUgYml0cyB3aGlsZSBjb2RlIHZhbHVlIGlzIGFib3ZlIHN1bSAqL1xuICAgICAgZG8ge1xuICAgICAgICBjdXIgPSAyICogY3VyICsgKHRhZyAmIDEpO1xuICAgICAgICB0YWcgPj4+PSAxO1xuICAgICAgICArK2xlbjtcblxuICAgICAgICBzdW0gKz0gdC50YWJsZVtsZW5dO1xuICAgICAgICBjdXIgLT0gdC50YWJsZVtsZW5dO1xuICAgICAgfSB3aGlsZSAoY3VyID49IDApO1xuXG4gICAgICBkLnRhZyA9IHRhZztcbiAgICAgIGQuYml0Y291bnQgLT0gbGVuO1xuXG4gICAgICByZXR1cm4gdC50cmFuc1tzdW0gKyBjdXJdO1xuICAgIH1cblxuICAgIC8qIGdpdmVuIGEgZGF0YSBzdHJlYW0sIGRlY29kZSBkeW5hbWljIHRyZWVzIGZyb20gaXQgKi9cbiAgICBmdW5jdGlvbiB0aW5mX2RlY29kZV90cmVlcyhkLCBsdCwgZHQpIHtcbiAgICAgIHZhciBobGl0LCBoZGlzdCwgaGNsZW47XG4gICAgICB2YXIgaSwgbnVtLCBsZW5ndGg7XG5cbiAgICAgIC8qIGdldCA1IGJpdHMgSExJVCAoMjU3LTI4NikgKi9cbiAgICAgIGhsaXQgPSB0aW5mX3JlYWRfYml0cyhkLCA1LCAyNTcpO1xuXG4gICAgICAvKiBnZXQgNSBiaXRzIEhESVNUICgxLTMyKSAqL1xuICAgICAgaGRpc3QgPSB0aW5mX3JlYWRfYml0cyhkLCA1LCAxKTtcblxuICAgICAgLyogZ2V0IDQgYml0cyBIQ0xFTiAoNC0xOSkgKi9cbiAgICAgIGhjbGVuID0gdGluZl9yZWFkX2JpdHMoZCwgNCwgNCk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCAxOTsgKytpKSBsZW5ndGhzW2ldID0gMDtcblxuICAgICAgLyogcmVhZCBjb2RlIGxlbmd0aHMgZm9yIGNvZGUgbGVuZ3RoIGFscGhhYmV0ICovXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaGNsZW47ICsraSkge1xuICAgICAgICAvKiBnZXQgMyBiaXRzIGNvZGUgbGVuZ3RoICgwLTcpICovXG4gICAgICAgIHZhciBjbGVuID0gdGluZl9yZWFkX2JpdHMoZCwgMywgMCk7XG4gICAgICAgIGxlbmd0aHNbY2xjaWR4W2ldXSA9IGNsZW47XG4gICAgICB9XG5cbiAgICAgIC8qIGJ1aWxkIGNvZGUgbGVuZ3RoIHRyZWUgKi9cbiAgICAgIHRpbmZfYnVpbGRfdHJlZShjb2RlX3RyZWUsIGxlbmd0aHMsIDAsIDE5KTtcblxuICAgICAgLyogZGVjb2RlIGNvZGUgbGVuZ3RocyBmb3IgdGhlIGR5bmFtaWMgdHJlZXMgKi9cbiAgICAgIGZvciAobnVtID0gMDsgbnVtIDwgaGxpdCArIGhkaXN0Oykge1xuICAgICAgICB2YXIgc3ltID0gdGluZl9kZWNvZGVfc3ltYm9sKGQsIGNvZGVfdHJlZSk7XG5cbiAgICAgICAgc3dpdGNoIChzeW0pIHtcbiAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgLyogY29weSBwcmV2aW91cyBjb2RlIGxlbmd0aCAzLTYgdGltZXMgKHJlYWQgMiBiaXRzKSAqL1xuICAgICAgICAgICAgdmFyIHByZXYgPSBsZW5ndGhzW251bSAtIDFdO1xuICAgICAgICAgICAgZm9yIChsZW5ndGggPSB0aW5mX3JlYWRfYml0cyhkLCAyLCAzKTsgbGVuZ3RoOyAtLWxlbmd0aCkge1xuICAgICAgICAgICAgICBsZW5ndGhzW251bSsrXSA9IHByZXY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgICAgLyogcmVwZWF0IGNvZGUgbGVuZ3RoIDAgZm9yIDMtMTAgdGltZXMgKHJlYWQgMyBiaXRzKSAqL1xuICAgICAgICAgICAgZm9yIChsZW5ndGggPSB0aW5mX3JlYWRfYml0cyhkLCAzLCAzKTsgbGVuZ3RoOyAtLWxlbmd0aCkge1xuICAgICAgICAgICAgICBsZW5ndGhzW251bSsrXSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgICAgLyogcmVwZWF0IGNvZGUgbGVuZ3RoIDAgZm9yIDExLTEzOCB0aW1lcyAocmVhZCA3IGJpdHMpICovXG4gICAgICAgICAgICBmb3IgKGxlbmd0aCA9IHRpbmZfcmVhZF9iaXRzKGQsIDcsIDExKTsgbGVuZ3RoOyAtLWxlbmd0aCkge1xuICAgICAgICAgICAgICBsZW5ndGhzW251bSsrXSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLyogdmFsdWVzIDAtMTUgcmVwcmVzZW50IHRoZSBhY3R1YWwgY29kZSBsZW5ndGhzICovXG4gICAgICAgICAgICBsZW5ndGhzW251bSsrXSA9IHN5bTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qIGJ1aWxkIGR5bmFtaWMgdHJlZXMgKi9cbiAgICAgIHRpbmZfYnVpbGRfdHJlZShsdCwgbGVuZ3RocywgMCwgaGxpdCk7XG4gICAgICB0aW5mX2J1aWxkX3RyZWUoZHQsIGxlbmd0aHMsIGhsaXQsIGhkaXN0KTtcbiAgICB9XG5cbiAgICAvKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqXG4gICAgICogLS0gYmxvY2sgaW5mbGF0ZSBmdW5jdGlvbnMgLS0gKlxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgICAvKiBnaXZlbiBhIHN0cmVhbSBhbmQgdHdvIHRyZWVzLCBpbmZsYXRlIGEgYmxvY2sgb2YgZGF0YSAqL1xuICAgIGZ1bmN0aW9uIHRpbmZfaW5mbGF0ZV9ibG9ja19kYXRhKGQsIGx0LCBkdCkge1xuICAgICAgd2hpbGUgKDEpIHtcbiAgICAgICAgdmFyIHN5bSA9IHRpbmZfZGVjb2RlX3N5bWJvbChkLCBsdCk7XG5cbiAgICAgICAgLyogY2hlY2sgZm9yIGVuZCBvZiBibG9jayAqL1xuICAgICAgICBpZiAoc3ltID09PSAyNTYpIHtcbiAgICAgICAgICByZXR1cm4gVElORl9PSztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzeW0gPCAyNTYpIHtcbiAgICAgICAgICBkLmRlc3RbZC5kZXN0TGVuKytdID0gc3ltO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBsZW5ndGgsIGRpc3QsIG9mZnM7XG4gICAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgICBzeW0gLT0gMjU3O1xuXG4gICAgICAgICAgLyogcG9zc2libHkgZ2V0IG1vcmUgYml0cyBmcm9tIGxlbmd0aCBjb2RlICovXG4gICAgICAgICAgbGVuZ3RoID0gdGluZl9yZWFkX2JpdHMoZCwgbGVuZ3RoX2JpdHNbc3ltXSwgbGVuZ3RoX2Jhc2Vbc3ltXSk7XG5cbiAgICAgICAgICBkaXN0ID0gdGluZl9kZWNvZGVfc3ltYm9sKGQsIGR0KTtcblxuICAgICAgICAgIC8qIHBvc3NpYmx5IGdldCBtb3JlIGJpdHMgZnJvbSBkaXN0YW5jZSBjb2RlICovXG4gICAgICAgICAgb2ZmcyA9IGQuZGVzdExlbiAtIHRpbmZfcmVhZF9iaXRzKGQsIGRpc3RfYml0c1tkaXN0XSwgZGlzdF9iYXNlW2Rpc3RdKTtcblxuICAgICAgICAgIC8qIGNvcHkgbWF0Y2ggKi9cbiAgICAgICAgICBmb3IgKGkgPSBvZmZzOyBpIDwgb2ZmcyArIGxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBkLmRlc3RbZC5kZXN0TGVuKytdID0gZC5kZXN0W2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qIGluZmxhdGUgYW4gdW5jb21wcmVzc2VkIGJsb2NrIG9mIGRhdGEgKi9cbiAgICBmdW5jdGlvbiB0aW5mX2luZmxhdGVfdW5jb21wcmVzc2VkX2Jsb2NrKGQpIHtcbiAgICAgIHZhciBsZW5ndGgsIGludmxlbmd0aDtcbiAgICAgIHZhciBpO1xuXG4gICAgICAvKiB1bnJlYWQgZnJvbSBiaXRidWZmZXIgKi9cbiAgICAgIHdoaWxlIChkLmJpdGNvdW50ID4gOCkge1xuICAgICAgICBkLnNvdXJjZUluZGV4LS07XG4gICAgICAgIGQuYml0Y291bnQgLT0gODtcbiAgICAgIH1cblxuICAgICAgLyogZ2V0IGxlbmd0aCAqL1xuICAgICAgbGVuZ3RoID0gZC5zb3VyY2VbZC5zb3VyY2VJbmRleCArIDFdO1xuICAgICAgbGVuZ3RoID0gMjU2ICogbGVuZ3RoICsgZC5zb3VyY2VbZC5zb3VyY2VJbmRleF07XG5cbiAgICAgIC8qIGdldCBvbmUncyBjb21wbGVtZW50IG9mIGxlbmd0aCAqL1xuICAgICAgaW52bGVuZ3RoID0gZC5zb3VyY2VbZC5zb3VyY2VJbmRleCArIDNdO1xuICAgICAgaW52bGVuZ3RoID0gMjU2ICogaW52bGVuZ3RoICsgZC5zb3VyY2VbZC5zb3VyY2VJbmRleCArIDJdO1xuXG4gICAgICAvKiBjaGVjayBsZW5ndGggKi9cbiAgICAgIGlmIChsZW5ndGggIT09ICh+aW52bGVuZ3RoICYgMHgwMDAwZmZmZikpXG4gICAgICAgIHJldHVybiBUSU5GX0RBVEFfRVJST1I7XG5cbiAgICAgIGQuc291cmNlSW5kZXggKz0gNDtcblxuICAgICAgLyogY29weSBibG9jayAqL1xuICAgICAgZm9yIChpID0gbGVuZ3RoOyBpOyAtLWkpXG4gICAgICAgIGQuZGVzdFtkLmRlc3RMZW4rK10gPSBkLnNvdXJjZVtkLnNvdXJjZUluZGV4KytdO1xuXG4gICAgICAvKiBtYWtlIHN1cmUgd2Ugc3RhcnQgbmV4dCBibG9jayBvbiBhIGJ5dGUgYm91bmRhcnkgKi9cbiAgICAgIGQuYml0Y291bnQgPSAwO1xuXG4gICAgICByZXR1cm4gVElORl9PSztcbiAgICB9XG5cbiAgICAvKiBpbmZsYXRlIHN0cmVhbSBmcm9tIHNvdXJjZSB0byBkZXN0ICovXG4gICAgZnVuY3Rpb24gdGluZl91bmNvbXByZXNzKHNvdXJjZSwgZGVzdCkge1xuICAgICAgdmFyIGQgPSBuZXcgRGF0YShzb3VyY2UsIGRlc3QpO1xuICAgICAgdmFyIGJmaW5hbCwgYnR5cGUsIHJlcztcblxuICAgICAgZG8ge1xuICAgICAgICAvKiByZWFkIGZpbmFsIGJsb2NrIGZsYWcgKi9cbiAgICAgICAgYmZpbmFsID0gdGluZl9nZXRiaXQoZCk7XG5cbiAgICAgICAgLyogcmVhZCBibG9jayB0eXBlICgyIGJpdHMpICovXG4gICAgICAgIGJ0eXBlID0gdGluZl9yZWFkX2JpdHMoZCwgMiwgMCk7XG5cbiAgICAgICAgLyogZGVjb21wcmVzcyBibG9jayAqL1xuICAgICAgICBzd2l0Y2ggKGJ0eXBlKSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgLyogZGVjb21wcmVzcyB1bmNvbXByZXNzZWQgYmxvY2sgKi9cbiAgICAgICAgICAgIHJlcyA9IHRpbmZfaW5mbGF0ZV91bmNvbXByZXNzZWRfYmxvY2soZCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAvKiBkZWNvbXByZXNzIGJsb2NrIHdpdGggZml4ZWQgaHVmZm1hbiB0cmVlcyAqL1xuICAgICAgICAgICAgcmVzID0gdGluZl9pbmZsYXRlX2Jsb2NrX2RhdGEoZCwgc2x0cmVlLCBzZHRyZWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgLyogZGVjb21wcmVzcyBibG9jayB3aXRoIGR5bmFtaWMgaHVmZm1hbiB0cmVlcyAqL1xuICAgICAgICAgICAgdGluZl9kZWNvZGVfdHJlZXMoZCwgZC5sdHJlZSwgZC5kdHJlZSk7XG4gICAgICAgICAgICByZXMgPSB0aW5mX2luZmxhdGVfYmxvY2tfZGF0YShkLCBkLmx0cmVlLCBkLmR0cmVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXMgPSBUSU5GX0RBVEFfRVJST1I7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzICE9PSBUSU5GX09LKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YSBlcnJvcicpO1xuXG4gICAgICB9IHdoaWxlICghYmZpbmFsKTtcblxuICAgICAgaWYgKGQuZGVzdExlbiA8IGQuZGVzdC5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBkLmRlc3Quc2xpY2UgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgcmV0dXJuIGQuZGVzdC5zbGljZSgwLCBkLmRlc3RMZW4pO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIGQuZGVzdC5zdWJhcnJheSgwLCBkLmRlc3RMZW4pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZC5kZXN0O1xuICAgIH1cblxuICAgIC8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tICpcbiAgICAgKiAtLSBpbml0aWFsaXphdGlvbiAtLSAqXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAgIC8qIGJ1aWxkIGZpeGVkIGh1ZmZtYW4gdHJlZXMgKi9cbiAgICB0aW5mX2J1aWxkX2ZpeGVkX3RyZWVzKHNsdHJlZSwgc2R0cmVlKTtcblxuICAgIC8qIGJ1aWxkIGV4dHJhIGJpdHMgYW5kIGJhc2UgdGFibGVzICovXG4gICAgdGluZl9idWlsZF9iaXRzX2Jhc2UobGVuZ3RoX2JpdHMsIGxlbmd0aF9iYXNlLCA0LCAzKTtcbiAgICB0aW5mX2J1aWxkX2JpdHNfYmFzZShkaXN0X2JpdHMsIGRpc3RfYmFzZSwgMiwgMSk7XG5cbiAgICAvKiBmaXggYSBzcGVjaWFsIGNhc2UgKi9cbiAgICBsZW5ndGhfYml0c1syOF0gPSAwO1xuICAgIGxlbmd0aF9iYXNlWzI4XSA9IDI1ODtcbi8qKioqKiogRU5EIHRpbnktaW5mbGF0ZS9pbmRleC5qcyAqKioqKiovXG5cbiAgICByZXR1cm4gdGluZl91bmNvbXByZXNzO1xuICB9ICkoKTtcblxuICAvKlxudW5pY29kZS10cmllXG5odHRwczovL2dpdGh1Yi5jb20vZm9saW9qcy91bmljb2RlLXRyaWVcblxuQ29weXJpZ2h0IDIwMThcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICAqL1xuXG4gIC8qKioqKiogU1RBUlQgdW5pY29kZS10cmllL3N3YXAuanMgKioqKioqL1xuICBjb25zdCBzd2FwMzJMRSA9ICggKCkgPT4ge1xuICAgIGNvbnN0IGlzQmlnRW5kaWFuID0gKG5ldyBVaW50OEFycmF5KG5ldyBVaW50MzJBcnJheShbMHgxMjM0NTY3OF0pLmJ1ZmZlcilbMF0gPT09IDB4MTIpO1xuXG4gICAgY29uc3Qgc3dhcCA9IChiLCBuLCBtKSA9PiB7XG4gICAgICBsZXQgaSA9IGJbbl07XG4gICAgICBiW25dID0gYlttXTtcbiAgICAgIGJbbV0gPSBpO1xuICAgIH07XG5cbiAgICBjb25zdCBzd2FwMzIgPSBhcnJheSA9PiB7XG4gICAgICBjb25zdCBsZW4gPSBhcnJheS5sZW5ndGg7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgICAgIHN3YXAoYXJyYXksIGksIGkgKyAzKTtcbiAgICAgICAgc3dhcChhcnJheSwgaSArIDEsIGkgKyAyKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgc3dhcDMyTEUgPSBhcnJheSA9PiB7XG4gICAgICBpZiAoaXNCaWdFbmRpYW4pIHtcbiAgICAgICAgc3dhcDMyKGFycmF5KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHN3YXAzMkxFO1xuICB9ICkoKTtcbiAgLyoqKioqKiBFTkQgdW5pY29kZS10cmllL3N3YXAuanMgKioqKioqL1xuXG4gIC8qKioqKiogU1RBUlQgdW5pY29kZS10cmllL2luZGV4LmpzICoqKioqKi9cbiAgY29uc3QgVW5pY29kZVRyaWUgPSAoICgpID0+IHtcblxuICAgIC8vIFNoaWZ0IHNpemUgZm9yIGdldHRpbmcgdGhlIGluZGV4LTEgdGFibGUgb2Zmc2V0LlxuICAgIGNvbnN0IFNISUZUXzEgPSA2ICsgNTtcblxuICAgIC8vIFNoaWZ0IHNpemUgZm9yIGdldHRpbmcgdGhlIGluZGV4LTIgdGFibGUgb2Zmc2V0LlxuICAgIGNvbnN0IFNISUZUXzIgPSA1O1xuXG4gICAgLy8gRGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSB0d28gc2hpZnQgc2l6ZXMsXG4gICAgLy8gZm9yIGdldHRpbmcgYW4gaW5kZXgtMSBvZmZzZXQgZnJvbSBhbiBpbmRleC0yIG9mZnNldC4gNj0xMS01XG4gICAgY29uc3QgU0hJRlRfMV8yID0gU0hJRlRfMSAtIFNISUZUXzI7XG5cbiAgICAvLyBOdW1iZXIgb2YgaW5kZXgtMSBlbnRyaWVzIGZvciB0aGUgQk1QLiAzMj0weDIwXG4gICAgLy8gVGhpcyBwYXJ0IG9mIHRoZSBpbmRleC0xIHRhYmxlIGlzIG9taXR0ZWQgZnJvbSB0aGUgc2VyaWFsaXplZCBmb3JtLlxuICAgIGNvbnN0IE9NSVRURURfQk1QX0lOREVYXzFfTEVOR1RIID0gMHgxMDAwMCA+PiBTSElGVF8xO1xuXG4gICAgLy8gTnVtYmVyIG9mIGVudHJpZXMgaW4gYW4gaW5kZXgtMiBibG9jay4gNjQ9MHg0MFxuICAgIGNvbnN0IElOREVYXzJfQkxPQ0tfTEVOR1RIID0gMSA8PCBTSElGVF8xXzI7XG5cbiAgICAvLyBNYXNrIGZvciBnZXR0aW5nIHRoZSBsb3dlciBiaXRzIGZvciB0aGUgaW4taW5kZXgtMi1ibG9jayBvZmZzZXQuICovXG4gICAgY29uc3QgSU5ERVhfMl9NQVNLID0gSU5ERVhfMl9CTE9DS19MRU5HVEggLSAxO1xuXG4gICAgLy8gU2hpZnQgc2l6ZSBmb3Igc2hpZnRpbmcgbGVmdCB0aGUgaW5kZXggYXJyYXkgdmFsdWVzLlxuICAgIC8vIEluY3JlYXNlcyBwb3NzaWJsZSBkYXRhIHNpemUgd2l0aCAxNi1iaXQgaW5kZXggdmFsdWVzIGF0IHRoZSBjb3N0XG4gICAgLy8gb2YgY29tcGFjdGFiaWxpdHkuXG4gICAgLy8gVGhpcyByZXF1aXJlcyBkYXRhIGJsb2NrcyB0byBiZSBhbGlnbmVkIGJ5IERBVEFfR1JBTlVMQVJJVFkuXG4gICAgY29uc3QgSU5ERVhfU0hJRlQgPSAyO1xuXG4gICAgLy8gTnVtYmVyIG9mIGVudHJpZXMgaW4gYSBkYXRhIGJsb2NrLiAzMj0weDIwXG4gICAgY29uc3QgREFUQV9CTE9DS19MRU5HVEggPSAxIDw8IFNISUZUXzI7XG5cbiAgICAvLyBNYXNrIGZvciBnZXR0aW5nIHRoZSBsb3dlciBiaXRzIGZvciB0aGUgaW4tZGF0YS1ibG9jayBvZmZzZXQuXG4gICAgY29uc3QgREFUQV9NQVNLID0gREFUQV9CTE9DS19MRU5HVEggLSAxO1xuXG4gICAgLy8gVGhlIHBhcnQgb2YgdGhlIGluZGV4LTIgdGFibGUgZm9yIFUrRDgwMC4uVStEQkZGIHN0b3JlcyB2YWx1ZXMgZm9yXG4gICAgLy8gbGVhZCBzdXJyb2dhdGUgY29kZSBfdW5pdHNfIG5vdCBjb2RlIF9wb2ludHNfLlxuICAgIC8vIFZhbHVlcyBmb3IgbGVhZCBzdXJyb2dhdGUgY29kZSBfcG9pbnRzXyBhcmUgaW5kZXhlZCB3aXRoIHRoaXMgcG9ydGlvbiBvZiB0aGUgdGFibGUuXG4gICAgLy8gTGVuZ3RoPTMyPTB4MjA9MHg0MDA+PlNISUZUXzIuIChUaGVyZSBhcmUgMTAyND0weDQwMCBsZWFkIHN1cnJvZ2F0ZXMuKVxuICAgIGNvbnN0IExTQ1BfSU5ERVhfMl9PRkZTRVQgPSAweDEwMDAwID4+IFNISUZUXzI7XG4gICAgY29uc3QgTFNDUF9JTkRFWF8yX0xFTkdUSCA9IDB4NDAwID4+IFNISUZUXzI7XG5cbiAgICAvLyBDb3VudCB0aGUgbGVuZ3RocyBvZiBib3RoIEJNUCBwaWVjZXMuIDIwODA9MHg4MjBcbiAgICBjb25zdCBJTkRFWF8yX0JNUF9MRU5HVEggPSBMU0NQX0lOREVYXzJfT0ZGU0VUICsgTFNDUF9JTkRFWF8yX0xFTkdUSDtcblxuICAgIC8vIFRoZSAyLWJ5dGUgVVRGLTggdmVyc2lvbiBvZiB0aGUgaW5kZXgtMiB0YWJsZSBmb2xsb3dzIGF0IG9mZnNldCAyMDgwPTB4ODIwLlxuICAgIC8vIExlbmd0aCAzMj0weDIwIGZvciBsZWFkIGJ5dGVzIEMwLi5ERiwgcmVnYXJkbGVzcyBvZiBTSElGVF8yLlxuICAgIGNvbnN0IFVURjhfMkJfSU5ERVhfMl9PRkZTRVQgPSBJTkRFWF8yX0JNUF9MRU5HVEg7XG4gICAgY29uc3QgVVRGOF8yQl9JTkRFWF8yX0xFTkdUSCA9IDB4ODAwID4+IDY7ICAvLyBVKzA4MDAgaXMgdGhlIGZpcnN0IGNvZGUgcG9pbnQgYWZ0ZXIgMi1ieXRlIFVURi04XG5cbiAgICAvLyBUaGUgaW5kZXgtMSB0YWJsZSwgb25seSB1c2VkIGZvciBzdXBwbGVtZW50YXJ5IGNvZGUgcG9pbnRzLCBhdCBvZmZzZXQgMjExMj0weDg0MC5cbiAgICAvLyBWYXJpYWJsZSBsZW5ndGgsIGZvciBjb2RlIHBvaW50cyB1cCB0byBoaWdoU3RhcnQsIHdoZXJlIHRoZSBsYXN0IHNpbmdsZS12YWx1ZSByYW5nZSBzdGFydHMuXG4gICAgLy8gTWF4aW11bSBsZW5ndGggNTEyPTB4MjAwPTB4MTAwMDAwPj5TSElGVF8xLlxuICAgIC8vIChGb3IgMHgxMDAwMDAgc3VwcGxlbWVudGFyeSBjb2RlIHBvaW50cyBVKzEwMDAwLi5VKzEwZmZmZi4pXG4gICAgLy9cbiAgICAvLyBUaGUgcGFydCBvZiB0aGUgaW5kZXgtMiB0YWJsZSBmb3Igc3VwcGxlbWVudGFyeSBjb2RlIHBvaW50cyBzdGFydHNcbiAgICAvLyBhZnRlciB0aGlzIGluZGV4LTEgdGFibGUuXG4gICAgLy9cbiAgICAvLyBCb3RoIHRoZSBpbmRleC0xIHRhYmxlIGFuZCB0aGUgZm9sbG93aW5nIHBhcnQgb2YgdGhlIGluZGV4LTIgdGFibGVcbiAgICAvLyBhcmUgb21pdHRlZCBjb21wbGV0ZWx5IGlmIHRoZXJlIGlzIG9ubHkgQk1QIGRhdGEuXG4gICAgY29uc3QgSU5ERVhfMV9PRkZTRVQgPSBVVEY4XzJCX0lOREVYXzJfT0ZGU0VUICsgVVRGOF8yQl9JTkRFWF8yX0xFTkdUSDtcblxuICAgIC8vIFRoZSBhbGlnbm1lbnQgc2l6ZSBvZiBhIGRhdGEgYmxvY2suIEFsc28gdGhlIGdyYW51bGFyaXR5IGZvciBjb21wYWN0aW9uLlxuICAgIGNvbnN0IERBVEFfR1JBTlVMQVJJVFkgPSAxIDw8IElOREVYX1NISUZUO1xuXG4gICAgY2xhc3MgVW5pY29kZVRyaWUge1xuICAgICAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgICAgICBjb25zdCBpc0J1ZmZlciA9ICh0eXBlb2YgZGF0YS5yZWFkVUludDMyQkUgPT09ICdmdW5jdGlvbicpICYmICh0eXBlb2YgZGF0YS5zbGljZSA9PT0gJ2Z1bmN0aW9uJyk7XG5cbiAgICAgICAgaWYgKGlzQnVmZmVyIHx8IGRhdGEgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgICAgLy8gcmVhZCBiaW5hcnkgZm9ybWF0XG4gICAgICAgICAgbGV0IHVuY29tcHJlc3NlZExlbmd0aDtcbiAgICAgICAgICBpZiAoaXNCdWZmZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaFN0YXJ0ID0gZGF0YS5yZWFkVUludDMyTEUoMCk7XG4gICAgICAgICAgICB0aGlzLmVycm9yVmFsdWUgPSBkYXRhLnJlYWRVSW50MzJMRSg0KTtcbiAgICAgICAgICAgIHVuY29tcHJlc3NlZExlbmd0aCA9IGRhdGEucmVhZFVJbnQzMkxFKDgpO1xuICAgICAgICAgICAgZGF0YSA9IGRhdGEuc2xpY2UoMTIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB2aWV3ID0gbmV3IERhdGFWaWV3KGRhdGEuYnVmZmVyKTtcbiAgICAgICAgICAgIHRoaXMuaGlnaFN0YXJ0ID0gdmlldy5nZXRVaW50MzIoMCwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmVycm9yVmFsdWUgPSB2aWV3LmdldFVpbnQzMig0LCB0cnVlKTtcbiAgICAgICAgICAgIHVuY29tcHJlc3NlZExlbmd0aCA9IHZpZXcuZ2V0VWludDMyKDgsIHRydWUpO1xuICAgICAgICAgICAgZGF0YSA9IGRhdGEuc3ViYXJyYXkoMTIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGRvdWJsZSBpbmZsYXRlIHRoZSBhY3R1YWwgdHJpZSBkYXRhXG4gICAgICAgICAgZGF0YSA9IGluZmxhdGUoZGF0YSwgbmV3IFVpbnQ4QXJyYXkodW5jb21wcmVzc2VkTGVuZ3RoKSk7XG4gICAgICAgICAgZGF0YSA9IGluZmxhdGUoZGF0YSwgbmV3IFVpbnQ4QXJyYXkodW5jb21wcmVzc2VkTGVuZ3RoKSk7XG5cbiAgICAgICAgICAvLyBzd2FwIGJ5dGVzIGZyb20gbGl0dGxlLWVuZGlhblxuICAgICAgICAgIHN3YXAzMkxFKGRhdGEpO1xuXG4gICAgICAgICAgdGhpcy5kYXRhID0gbmV3IFVpbnQzMkFycmF5KGRhdGEuYnVmZmVyKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHByZS1wYXJzZWQgZGF0YVxuICAgICAgICAgICh7IGRhdGE6IHRoaXMuZGF0YSwgaGlnaFN0YXJ0OiB0aGlzLmhpZ2hTdGFydCwgZXJyb3JWYWx1ZTogdGhpcy5lcnJvclZhbHVlIH0gPSBkYXRhKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBnZXQoY29kZVBvaW50KSB7XG4gICAgICAgIGxldCBpbmRleDtcbiAgICAgICAgaWYgKChjb2RlUG9pbnQgPCAwKSB8fCAoY29kZVBvaW50ID4gMHgxMGZmZmYpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3JWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoY29kZVBvaW50IDwgMHhkODAwKSB8fCAoKGNvZGVQb2ludCA+IDB4ZGJmZikgJiYgKGNvZGVQb2ludCA8PSAweGZmZmYpKSkge1xuICAgICAgICAgIC8vIE9yZGluYXJ5IEJNUCBjb2RlIHBvaW50LCBleGNsdWRpbmcgbGVhZGluZyBzdXJyb2dhdGVzLlxuICAgICAgICAgIC8vIEJNUCB1c2VzIGEgc2luZ2xlIGxldmVsIGxvb2t1cC4gIEJNUCBpbmRleCBzdGFydHMgYXQgb2Zmc2V0IDAgaW4gdGhlIGluZGV4LlxuICAgICAgICAgIC8vIGRhdGEgaXMgc3RvcmVkIGluIHRoZSBpbmRleCBhcnJheSBpdHNlbGYuXG4gICAgICAgICAgaW5kZXggPSAodGhpcy5kYXRhW2NvZGVQb2ludCA+PiBTSElGVF8yXSA8PCBJTkRFWF9TSElGVCkgKyAoY29kZVBvaW50ICYgREFUQV9NQVNLKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhW2luZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb2RlUG9pbnQgPD0gMHhmZmZmKSB7XG4gICAgICAgICAgLy8gTGVhZCBTdXJyb2dhdGUgQ29kZSBQb2ludC4gIEEgU2VwYXJhdGUgaW5kZXggc2VjdGlvbiBpcyBzdG9yZWQgZm9yXG4gICAgICAgICAgLy8gbGVhZCBzdXJyb2dhdGUgY29kZSB1bml0cyBhbmQgY29kZSBwb2ludHMuXG4gICAgICAgICAgLy8gICBUaGUgbWFpbiBpbmRleCBoYXMgdGhlIGNvZGUgdW5pdCBkYXRhLlxuICAgICAgICAgIC8vICAgRm9yIHRoaXMgZnVuY3Rpb24sIHdlIG5lZWQgdGhlIGNvZGUgcG9pbnQgZGF0YS5cbiAgICAgICAgICBpbmRleCA9ICh0aGlzLmRhdGFbTFNDUF9JTkRFWF8yX09GRlNFVCArICgoY29kZVBvaW50IC0gMHhkODAwKSA+PiBTSElGVF8yKV0gPDwgSU5ERVhfU0hJRlQpICsgKGNvZGVQb2ludCAmIERBVEFfTUFTSyk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVtpbmRleF07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29kZVBvaW50IDwgdGhpcy5oaWdoU3RhcnQpIHtcbiAgICAgICAgICAvLyBTdXBwbGVtZW50YWwgY29kZSBwb2ludCwgdXNlIHR3by1sZXZlbCBsb29rdXAuXG4gICAgICAgICAgaW5kZXggPSB0aGlzLmRhdGFbKElOREVYXzFfT0ZGU0VUIC0gT01JVFRFRF9CTVBfSU5ERVhfMV9MRU5HVEgpICsgKGNvZGVQb2ludCA+PiBTSElGVF8xKV07XG4gICAgICAgICAgaW5kZXggPSB0aGlzLmRhdGFbaW5kZXggKyAoKGNvZGVQb2ludCA+PiBTSElGVF8yKSAmIElOREVYXzJfTUFTSyldO1xuICAgICAgICAgIGluZGV4ID0gKGluZGV4IDw8IElOREVYX1NISUZUKSArIChjb2RlUG9pbnQgJiBEQVRBX01BU0spO1xuICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbaW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVt0aGlzLmRhdGEubGVuZ3RoIC0gREFUQV9HUkFOVUxBUklUWV07XG4gICAgICB9XG4gICAgfVxuICAgIC8qKioqKiogRU5EIHVuaWNvZGUtdHJpZS9pbmRleC5qcyAqKioqKiovXG5cbiAgICByZXR1cm4gVW5pY29kZVRyaWU7XG4gIH0gKSgpO1xuXG4gIC8qXG5saW5lYnJlYWtcbmh0dHBzOi8vZ2l0aHViLmNvbS9mb2xpb2pzL2xpbmVicmVha1xuXG5NSVQgTGljZW5zZVxuXG5Db3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCBEZXZvbiBHb3ZldHRcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbmNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcblNPRlRXQVJFLlxuICAgKi9cblxuICAvLyBTb21lIGdsdWUgdG8gYXZvaWQgdGhlIGZpbGUgcmVhZCwgYW5kIGdldCBpdCBpbnRvIGEgcHJvcGVyIFVpbnQ4QXJyYXkgZGVzaXJlZCBieSBVbmljb2RlVHJpZVxuICAvKioqKioqIFNUQVJUIGxpbmVicmVhay9zcmMvY2xhc3Nlcy50cmllICoqKioqKi9cbiAgY29uc3QgYmFzZTY0RGF0YSA9ICdBQWdPQUFBQUFBQVE0UUFBQVEwUDh2RHRuUXVNWFVVWngrZXl1N2Q3Nzk3ZDltNWJIb1dsdEtWVWxzakxXRTBWSk5pZ1FvTVZxa1N0RW9OUVFVbDVHSW8xS0ttb2dFZ3FrS2JCUmtpNzJsWWFiWk1HS29HQWpRUnRKSkRhQ0NJUmlpaWdSRUJRUzN6K3h6T1RuWjNPKzNIT2hkNU5mcGt6Wng3Zk45OTg4eml2dTJNOWhHd0IyOEY5NERud0VuZ2QvQXNjMUV0SXM5Yy9iSVBEd0N4d0xEZ2V6SGNvZHlvNHc1QytDQ3dCUzhGbndTWGdDbkExdUZiSTkzWHdiWEFiV0FmV2d4K0N6V0FiK0FuNEtmZ0ZlQXpzWVdXZll1Rno0Q1h3R3ZnYitEZm82eU5rRUV3R2g0Q1pZQjQ0RnB3STNnMU9ZK2tmQkl0Wk9vMmZCODRIeThERjRISndOYmlXcFY4UFZvTzFMSDRuMk5SWHlOK0tjQWQ0a05WUDlYc1k0YVBnY2ZBYnNCZnM2U25pTDRLL3NQamZFZjZIbGFuWENSa0N3MkJHdlVoL2tlV2ZYUy9DWStwRlhzN3g5WEhtTTk0TFRtV0llVTJjZ2J4blMvay9CM2tmODZqRGhVOEw5VjJFNDB2QUZXQWxXRlVmYisrTk9MNEYzQzdKWDQvNEdpRStodmdXc0Ywb1M3bVhsZHNwbk4rRjQ5M2d5WHJoOXhUYXYwY2czRXZ6Z1ZmQkc2d3NtVlNFa3hCT0JnZFBHcGQ3Skk2UG5xUnZKNjgveGxiSG9mNTNnUGVBOTRPendMbmdrK0FDc0F3c0J5dkFTckFLM01CMFdzM0N0UWp2Qkp2QVZyQURQTURTSGtiNENOaWphY2NUd3ZuZjRmaVBFczhMeHkrRDE4QS9RVTgveGpnWUJqUEFiREFLVGdZTHdPbmdUSEFPK0VRLzh3dUVGNEV2c1BpVkNGZjIrOXRzRlN0ekE4TFZIdVhYQnNpNlF5cXpVWWlQTVIvN01jN2RBeDdvTDhiencvM3UvQnc4QnA0QXo0QVh3Q3RnSHpzbURYUDVmaUY5aWlWdmx5NWQwc0huZ2FyMTZOS2xTNWN1WGJwMDZmTG1ZbHFIWHJjZDNwaDRQMFRIVVkzaVhoNDlub3ZqdTRTMHR6ZnM1ZCtKUEtld2ZBc1JudFpiM0s5WmhPTWxyTzZsQ0M4QW4yOFU5K091b3ZjUGNQeGxWdTVyQ0wvVm1IaC9pSElyem4zZklQdTdTTjhBeG1nKzhBT3dFV3dDbTd0cDNiUnVXamV0bTVZOGJTdTRCOXpiS082WlZzbk9SclZVM2Y0dVhUcVoySDNzTG95eDNlRFhqZkRuZEU5cXlqNkw4MzhDZndWdmdGcHpZbm9mNG9OZ09oZ0JjOEZvczlEclpJUUxtdFhQUDFNbUY2d0dqNEgrS1hvV2d1dkFEa1hhUGlsK1lwdVF5OEFtOEV5N09EZHRtSkRGNEhvd0JwNERlNkhEVE5qaGZIQUhlQnIwREJCeTBrRHhmUGJjZ1NJdXNncmNXaHRuSjh2TCtUUGl4N1VJT1F0Y0JxNEMyOENyNEtSQm5BTmJ3U3VERStzNTBKZ3lOTkZ1WGJwMDZYSWdzWGpJdlBhZmp2WG96S1krZlZGei96MExUMXVDdEtWU1dick9MV1BuenRHOGUwWGZ5N29sOFh0WkppN1d0Rys1b2QyVUZYUS9BMTJ2VWVTN2pwMjd5VktIamRzVTlsWEI4NjlUeU52QXp0MGxwUDJvV2J3TGRqaU83OGJ4L1N6K0VNSkh3SzlZL0xjSWZ3K2VaM0Y2Ny9IbDV2aDl4WDgwSityd1g4U3ZSRGhwZ0wxN2lQQVFNSE5BcmZQcnFIUGV3TGhlSStBRVJWNmVmd1Y0MThCNG5PWi9IK0lmWUhWOEdPRjVMSjNlQXowZng4c005UzBmVU51ZDM5TzlDdWxmR1poWTVodUkzd3pXZ052QmVsYkhab1RiTlBWcGZZaktRcGtId1VOZ2wwTFdibGJuazBMYmJEeHIwT01GcEwzaXFXZHU5bldZUGxWQVdrWFkzOUxuR2RDa0RiZXF2MVlOYmZjTVEzdDlvZThsem02Tkg5TjFaQjZMbjRCd2ZrSlpKazdSeUZuWUt0NmIvSkRRWHg5cDVYK2VGZHFPanpNOVA5TUIvbFVsRnpyMjBhWElkemxZNGRtbjlGM1lxdHZvTzc2LzJocC9EL3hBNVp1ZTg4bk55TDhHYkZiczA3NVgwdHlVaWczUWQyTUNuZi8vSGpuenBic1IzZzkrMWtIenpWamRuRTcxL3FWQlg5ckdQVWgveXNOV2UxbmVGenZJRGk1ekF1ZlYxc1QwTjBwb1IyMndrRlVmVE9QZkE0TjJtYlo1ZlNycU9IU3crSWJrU0JiT0dTelNSZ2Y5MS9HVFVXWUJPQjJjSVpRL0c4Y2ZCWjhDRndybkw4WHhGOEZLY0EyNGpxWGRpUEE3UXI2MU9GN0g0bU1JdHd6dXYyL1lMdGgxSVN0M0h6dTNrNFc3RUg1SnFQZFJIRC9PNGsrejhBOElYNUxxM3k3WjRuWEU5eG42a1g2dlE0YktmeStvaytoSCt4ZjNocTlkblRUSGhqS2QyR21EdVdBMjQyaUhNcTRjQzdBOGtKN2k4bzErc2tTYTdKaWVvMzhIQ1dub05qS0ZoZFNGQnh6cFo3UUU2bEk4TjRTMTRhQVNaY3J5YVYvV1dIdzY2ZjZOSHVDb3h1UXhtdk01NkdYOVFNZDhRNEQ2NXl3R1ArWnpSSnVNK3pRdngvTU9TMlZGZXFRNElYbkgyNnpNOVhlNi9FNkQrNGZvQXp6dWFqUFpwOFF5dzVheVpWRFd1SDB6MEJ0WVJrZUlEcUg5S085VmJIMWJ0ZC9saE5xQ3p2bDh6ZUxuRzBTL2huVTZiYUhmcGl1TzZ5eTByZCtESFVSby96WUY1SDI2ajAzclFzaXAybmR6ejgydTF6OU40VmpXS1dlYjY4VGVkcHQ5NUhSVlhwN0gxUjZwKy9XdDRGUHkvUHBXd3NjT0xSSitQVldGLytXMGlWeUd6czE4VEl2WGtPSjFXeG02NnZTWHordnlsZW5yWmNqMXViNDM5VytLOFJOQ0dUSmkycC9USjFLMjNWYVhyMzV0UnBuem1qeGVxdWdmY2Z5azZCL1RHQlZseWVkc05ncGRkL2grVzFVM1A5OVF5RlBObzFYM1R3cE0vV0xUSVdZZm9CcVhydjZpc2tIWi9SRnI3OVI2aEl5SEJySDNmMW5yVVZualA4U25aWityWXR6cjlFeGxkNU1OYlBORXJ1c0FQZys3N3UvZURPUGZ0VTl5ajM5VEg3cmV6eGQxTHZzWlFKbHprV2xPaXJHLzc5empNai9tdEhVS3U3dkt5KzMvTG5Ycjlva3lLZWRqWDUvMEhlOWlQL2o2M0x3T1FkYXJFVmxmeThPTy9McXcwMjNqNnhjcW13eExpT2Q2aGVNMmk5Y1Y5TEp5OGpNSjIzeVErcnBiZnU3RVEvcFhFOEtZdlVTcXZWbmI0WHpaYTZMckhNWEhSK3pjTHZxV2JtL0JuMC9IeklzNmZXUEhvYXQ4WGZuREttWkd4UnhlTWJuMlVxWjVROTRubWNaUmJxcVVYYlo4K2xjakUrY1BYMTF0ODE0b3J2dkFYTmNHOHZxajJ2dmsxTUduM2FubGowYklUNzJ2NDdidkUrTGM5OFQ5YjZyN0FLbjZqKzhEdWY3RDBublp4L2o3WmpuMGo5bmJwU1RuZGFMcjlXTkxpdlAraU4yM3hGN0wrZnF2NlpvdUZ5Yjc4anhWWHZ2NWpKOVlVczkvc2RkTzhoN0tOZzVqcmhmYUpHenRUNkc3S0YrMWQ2eUNtRDVLZGIyZmFuNjByU2M1NTJmWnIzemVROURwblBwK1NpNWN4NUt0djJRZlN6Ri9tTWJXZE9tNDZyRkk0WHN0blU5eGVxWDROS2I3VEtFZGNyNnBaT0szSUQxay9MdkZIa1ZjekV1WkxFRHI0OTlZcXZxQnltMWFFSFdnY3ZvWU90djBNOTFxUWw1VGZwTy9pbjZyV3g4T1ZwVDFXZWRrdjNmNXhvbTNUL3hlUi82R3g2Vjg2UFdBT0I0YkJwcVdkTit5VGNWeGpJeUdSei9GckRHdTZ3LzNkN2tQbThTdFg4UnlQdSt1dXZwTmp1L3ZUTEpWMzdHcHZvTTBvWlBuVzg3VkxuTC81cERubzFOb1cxUjZ5ZWRVNlR5VXYzdTE5YTNLRm5JYlRMWXorWkNMUDRUMHRVMXVpdkZnc28wcG5zSi9VdFh2YXJOWTI4WHE1Y3ZrQkRyUVAvRTVaYWl1UXd3Zm1UbHNPaVFSVTFmTXVxckRkLzNJU1N1d2pPd1hPZlR5R1VNcFpJWHE0R3BMbjNwVWNkZnpjaDJ4N1hPMXUydVpIT1BiMUc2YjNYZzlQSDFJSVdlRXBKbFBRdHFvczJFS1c4YjB1OHJudVAxVWVWTG9YSmI5YmUwdUc5bm5iY2hqVStYVHN6VDVWZU5CVGhQSG5jNU9LajFVOWFqMEdUSElWYUd5MVloRVdUNGl4bnMwMERUK1hFelduLzdWQXNJYzYzQ292M09keWh3anJuYXFRcVp2V0tYZHlwUmRscStrOG1zWjAzMVUrUm00ZkErM1R0eWVSOWh3Zlc5Rzl5eEROMGZaTU4zM0YrOVRFNm1kNGh3b3h1bWZhVXpJOWZOM1BGVDN4VlYybXNyUTNVc25DaG02TnVsazhUbmRwUzI4RDN6WDl0VElQc0YvejdBbTVPa1RqbTF0STFKWlc3NCs0VmdzWjBOM0wxeVhWM1dlUDV1UjdUR0hIZHZDM0pRbHh5YmZwZDIydERsay8yZW9mUks4VHpyTi9xbmFyL0svT1VUdGg2SS8rakFuRXB0TmJQdkZIUDJnczQwTjMrZGZNV3R3cXZWY3Q3L3dmZDhndFE3aW1pZmlhbDlaSjkvM0lITFlVNmVEajMrNFBoc05oWCt2d3ZjV0xudTZrR2ZFTWU4RHVjaVBmVWZHWkI4WC83SEp5L0dlZmU1bitWUkdGZC93eVAydGE3L0xPNHloL3NiTFYvazlsZXY2a2ZPOUR0LzVVNjdiMS82dS9lcHFCMVU5TWUyM2pmSFk5c3NjQWc0dGtiTGwrZTQvVTM2cko5ZGR4ZmQ2c2c1dnE1aWNlNDJXcGsvcGI5Rk9KMzYvVzl0cHY0a2JDNzluVWJaY2VYOFp1Ni9xSitQM1d2aHZBOHYzcmVoN0pibjJkNnJyTkM3WE5aVExtYTRCYTBKSTllZlgydUx6RjVzY0cvdzlVTlUxWnhXK3ltVWZ6RUxlVGxsWGxRMXJVdWh6alM1ZnA5Yzk2NGlGQk9xZVN6NjNiVTA2NW5aS2RVK21ERXozcUhJamppZnF1dzBwbmIvcmFSdHZybnNZY2I0NmloVDN0YW9ZejZicmROVzlsNnJXUm5FL25hdmRQbjFYbFIxa203aGN6MVdsSC9lbEt1U09TdkxMdUU4VTZtOHV6d1JkZmNHbDczVnlUSHV5TXZ6SjFTYTJjV0RUUC9aNjNLYzk0bjJCMVBZcjI0ZHoxSmx5SExsY1ArUzRCNnZEMWM5RVc0cTJMV3N0Q3ZVamVWeTYzay9MTVlkVU5kNUQxeFFmdlZUelgxVmprTXNVdjg4TjhWSDVmUmVWbi9Gam4rKy9oNlg2UThhNmIxL3EzZy9pL2V3aTAvU2NzOHp4WGVWNm1XSU9VUGxQekJnZEZlclcrYlpybTJQMThkbmp1SzZIdW5FcCtySHZQTVhicitzSFZiL2xuTCtwVFA1N2pQdzlDdmszUFcxNzhKRDlxQ2hmenV2VGY3SHRsMzhMMVFVZi9WS3U5U0Zqd1diVFdQdkZFdnU3VXE3Nnk3KzMxZzZRbFlQYzY2OXBic205WHVyMkxXSTlQdTh5cGZEWHFtM0EyejhzMUZXR240bnRMOU5mUXUyb1NsZnRYOXVldHZUdHY3SjhRbDR6eGZYR1ozems4UGVROXc1OXgydU1mcUk4L3E1ZUtoL2w5Y2IycndzdTlyU05sMDZaUDJQbXh0eityTk14OTN5bm8wbjIvODJyVkg3clEreTlQMTVINkZ5UnVuOVZpSDgxQVRtZmZJN25KNXI4dVhYVzZlbmJQNmIvQjgvbDVPaWZWSFlMbmI5UzM5czJ6Y2MrUGgrcmg4K2VRZ1ZQUzcyZWx6R1dZL3RVdGJiYWJCcERpSTd5TjFxNi80dGgyeStFckFjNSs5QlZ2dS83S2FtSmJXTlpldXFJL1I0dFJmK1l5RDFIbU9aTTFiTVYzLzE0U24xMGMwWHUrU2oxbk9YYjVqTDczbmNkeTAydXZsWFpOZGU2NWRPSFlsN1ZzNEtZdVM2RnpXTG4yekpscFpxUFhQVlBPYTV5ektPeW4xVmhUOWxtTWZkYmZIN0QxMVdmMlBYTjVoOXkrZEQyODcrcXhnU25hWW1uSXJSdEliOHBKZTYvVXY5T1ZlcjZXaG4wemZHTy9CRWxvWkk5b2ptZkFsVWZsQ2xEZDE3OGJUbVZIVlRwWlhPa0Fsay9sYjQyVXVqbUk4OUhINVYrY2w3WHRvd1k2dlR4TFZXb2s2VXJHem9HVEhOK2JCKzZyaTA1Njg3Vk5wdmZ1dlJmYVAydU1sTlF0aDFENUpqR2VsbS84eW4rOXAzcC83cWs5Z25mZWRkWFptcS9TbTMzM1BKVDY1OUt2MXpqTmJaOXV2Mk9pLy82N0NWOC9OMW5qMURtdml5WEROVmVKa2FlYVg4VXN5ZXNZZzhjdTIrTnZkYVBmYitsTER1NXR2dC8nO1xuICAvKioqKioqIEVORCBsaW5lYnJlYWsvc3JjL2NsYXNzZXMudHJpZSAqKioqKiovXG5cbiAgLy8gQ3VzdG9tIGNvbnZlcnNpb24gY29kZVxuICBjb25zdCB0b1R5cGVkQXJyYXkgPSBiYXNlNjQgPT4ge1xuICAgIGNvbnN0IGJpbmFyeSA9IHdpbmRvdy5hdG9iKCBiYXNlNjQgKTtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgVWludDhBcnJheSggYmluYXJ5Lmxlbmd0aCApO1xuICAgIGZvciAoIHZhciBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHJlc3VsdFsgaSBdID0gYmluYXJ5LmNoYXJDb2RlQXQoIGkgKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSB0b1R5cGVkQXJyYXkoIGJhc2U2NERhdGEgKTtcbiAgLy8gbGluZSBmcm9tIGxpbmVicmVhay9zcmMvbGluZWJyZWFrZXIuanNcbiAgY29uc3QgY2xhc3NUcmllID0gbmV3IFVuaWNvZGVUcmllKCBkYXRhICk7XG5cbiAgLyoqKioqKiBTVEFSVCBsaW5lYnJlYWsvc3JjL2NsYXNzZXMuanMgKioqKioqL1xuICAvLyBUaGUgZm9sbG93aW5nIGJyZWFrIGNsYXNzZXMgYXJlIGhhbmRsZWQgYnkgdGhlIHBhaXIgdGFibGVcbiAgY29uc3QgT1AgPSAwOyAgIC8vIE9wZW5pbmcgcHVuY3R1YXRpb25cbiAgY29uc3QgQ0wgPSAxOyAgIC8vIENsb3NpbmcgcHVuY3R1YXRpb25cbiAgY29uc3QgQ1AgPSAyOyAgIC8vIENsb3NpbmcgcGFyZW50aGVzaXNcbiAgY29uc3QgUVUgPSAzOyAgIC8vIEFtYmlndW91cyBxdW90YXRpb25cbiAgY29uc3QgR0wgPSA0OyAgIC8vIEdsdWVcbiAgY29uc3QgTlMgPSA1OyAgIC8vIE5vbi1zdGFydGVyc1xuICBjb25zdCBFWCA9IDY7ICAgLy8gRXhjbGFtYXRpb24vSW50ZXJyb2dhdGlvblxuICBjb25zdCBTWSA9IDc7ICAgLy8gU3ltYm9scyBhbGxvd2luZyBicmVhayBhZnRlclxuICBjb25zdCBJUyA9IDg7ICAgLy8gSW5maXggc2VwYXJhdG9yXG4gIGNvbnN0IFBSID0gOTsgICAvLyBQcmVmaXhcbiAgY29uc3QgUE8gPSAxMDsgIC8vIFBvc3RmaXhcbiAgY29uc3QgTlUgPSAxMTsgIC8vIE51bWVyaWNcbiAgY29uc3QgQUwgPSAxMjsgIC8vIEFscGhhYmV0aWNcbiAgY29uc3QgSEwgPSAxMzsgIC8vIEhlYnJldyBMZXR0ZXJcbiAgY29uc3QgSUQgPSAxNDsgIC8vIElkZW9ncmFwaGljXG4gIGNvbnN0IElOID0gMTU7ICAvLyBJbnNlcGFyYWJsZSBjaGFyYWN0ZXJzXG4gIGNvbnN0IEhZID0gMTY7ICAvLyBIeXBoZW5cbiAgY29uc3QgQkEgPSAxNzsgIC8vIEJyZWFrIGFmdGVyXG4gIGNvbnN0IEJCID0gMTg7ICAvLyBCcmVhayBiZWZvcmVcbiAgY29uc3QgQjIgPSAxOTsgIC8vIEJyZWFrIG9uIGVpdGhlciBzaWRlIChidXQgbm90IHBhaXIpXG4gIGNvbnN0IFpXID0gMjA7ICAvLyBaZXJvLXdpZHRoIHNwYWNlXG4gIGNvbnN0IENNID0gMjE7ICAvLyBDb21iaW5pbmcgbWFya3NcbiAgY29uc3QgV0ogPSAyMjsgIC8vIFdvcmQgam9pbmVyXG4gIGNvbnN0IEgyID0gMjM7ICAvLyBIYW5ndWwgTFZcbiAgY29uc3QgSDMgPSAyNDsgIC8vIEhhbmd1bCBMVlRcbiAgY29uc3QgSkwgPSAyNTsgIC8vIEhhbmd1bCBMIEphbW9cbiAgY29uc3QgSlYgPSAyNjsgIC8vIEhhbmd1bCBWIEphbW9cbiAgY29uc3QgSlQgPSAyNzsgIC8vIEhhbmd1bCBUIEphbW9cbiAgY29uc3QgUkkgPSAyODsgIC8vIFJlZ2lvbmFsIEluZGljYXRvclxuICBjb25zdCBFQiA9IDI5OyAgLy8gRW1vamkgQmFzZVxuICBjb25zdCBFTSA9IDMwOyAgLy8gRW1vamkgTW9kaWZpZXJcbiAgY29uc3QgWldKID0gMzE7IC8vIFplcm8gV2lkdGggSm9pbmVyXG4gIGNvbnN0IENCID0gMzI7ICAvLyBDb250aW5nZW50IGJyZWFrXG5cbiAgLy8gVGhlIGZvbGxvd2luZyBicmVhayBjbGFzc2VzIGFyZSBub3QgaGFuZGxlZCBieSB0aGUgcGFpciB0YWJsZVxuICBjb25zdCBBSSA9IDMzOyAgLy8gQW1iaWd1b3VzIChBbHBoYWJldGljIG9yIElkZW9ncmFwaClcbiAgY29uc3QgQksgPSAzNDsgIC8vIEJyZWFrIChtYW5kYXRvcnkpXG4gIGNvbnN0IENKID0gMzU7ICAvLyBDb25kaXRpb25hbCBKYXBhbmVzZSBTdGFydGVyXG4gIGNvbnN0IENSID0gMzY7ICAvLyBDYXJyaWFnZSByZXR1cm5cbiAgY29uc3QgTEYgPSAzNzsgIC8vIExpbmUgZmVlZFxuICBjb25zdCBOTCA9IDM4OyAgLy8gTmV4dCBsaW5lXG4gIGNvbnN0IFNBID0gMzk7ICAvLyBTb3V0aC1FYXN0IEFzaWFuXG4gIGNvbnN0IFNHID0gNDA7ICAvLyBTdXJyb2dhdGVzXG4gIGNvbnN0IFNQID0gNDE7ICAvLyBTcGFjZVxuICBjb25zdCBYWCA9IDQyOyAgLy8gVW5rbm93blxuXG4gIGNvbnN0IERJX0JSSyA9IDA7IC8vIERpcmVjdCBicmVhayBvcHBvcnR1bml0eVxuICBjb25zdCBJTl9CUksgPSAxOyAvLyBJbmRpcmVjdCBicmVhayBvcHBvcnR1bml0eVxuICBjb25zdCBDSV9CUksgPSAyOyAvLyBJbmRpcmVjdCBicmVhayBvcHBvcnR1bml0eSBmb3IgY29tYmluaW5nIG1hcmtzXG4gIGNvbnN0IENQX0JSSyA9IDM7IC8vIFByb2hpYml0ZWQgYnJlYWsgZm9yIGNvbWJpbmluZyBtYXJrc1xuICBjb25zdCBQUl9CUksgPSA0OyAvLyBQcm9oaWJpdGVkIGJyZWFrXG4gIC8qKioqKiogRU5EIGxpbmVicmVhay9zcmMvY2xhc3Nlcy5qcyAqKioqKiovXG5cbiAgLyoqKioqKiBTVEFSVCBsaW5lYnJlYWsvc3JjL3BhaXJzLmpzICoqKioqKi9cbiAgLy8gQmFzZWQgb24gZXhhbXBsZSBwYWlyIHRhYmxlIGZyb20gaHR0cHM6Ly93d3cudW5pY29kZS5vcmcvcmVwb3J0cy90cjE0L3RyMTQtMzcuaHRtbCNUYWJsZTJcbiAgLy8gLSBaV0ogc3BlY2lhbCBwcm9jZXNzaW5nIGZvciBMQjhhIG9mIFJldmlzaW9uIDQxXG4gIC8vIC0gQ0IgbWFudWFsbHkgYWRkZWQgYXMgcGVyIFJ1bGUgTEIyMFxuICAvLyAtIENMLCBDUCwgTlMsIFNZLCBJUywgUFIsIFBPLCBIWSwgQkEsIEIyIGFuZCBSSSBtYW51YWxseSBhZGp1c3RlZCBhcyBwZXIgTEIyMiBvZiBSZXZpc2lvbiA0NVxuICBjb25zdCBwYWlyVGFibGUgPSBbXG4gICAgLy9PUCAgICwgQ0wgICAgLCBDUCAgICAsIFFVICAgICwgR0wgICAgLCBOUyAgICAsIEVYICAgICwgU1kgICAgLCBJUyAgICAsIFBSICAgICwgUE8gICAgLCBOVSAgICAsIEFMICAgICwgSEwgICAgLCBJRCAgICAsIElOICAgICwgSFkgICAgLCBCQSAgICAsIEJCICAgICwgQjIgICAgLCBaVyAgICAsIENNICAgICwgV0ogICAgLCBIMiAgICAsIEgzICAgICwgSkwgICAgLCBKViAgICAsIEpUICAgICwgUkkgICAgLCBFQiAgICAsIEVNICAgICwgWldKICAgLCBDQlxuICAgIFtQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBDUF9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLXSwgLy8gT1BcbiAgICBbRElfQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIFBSX0JSSywgQ0lfQlJLLCBQUl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSS10sIC8vIENMXG4gICAgW0RJX0JSSywgUFJfQlJLLCBQUl9CUkssIElOX0JSSywgSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBESV9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBQUl9CUkssIENJX0JSSywgUFJfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBESV9CUktdLCAvLyBDUFxuICAgIFtQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgUFJfQlJLLCBDSV9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLXSwgLy8gUVVcbiAgICBbSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIFBSX0JSSywgQ0lfQlJLLCBQUl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSS10sIC8vIEdMXG4gICAgW0RJX0JSSywgUFJfQlJLLCBQUl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBQUl9CUkssIENJX0JSSywgUFJfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBESV9CUktdLCAvLyBOU1xuICAgIFtESV9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBESV9CUkssIERJX0JSSywgUFJfQlJLLCBDSV9CUkssIFBSX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgRElfQlJLXSwgLy8gRVhcbiAgICBbRElfQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIFBSX0JSSywgQ0lfQlJLLCBQUl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSS10sIC8vIFNZXG4gICAgW0RJX0JSSywgUFJfQlJLLCBQUl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBESV9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBQUl9CUkssIENJX0JSSywgUFJfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBESV9CUktdLCAvLyBJU1xuICAgIFtJTl9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBESV9CUkssIERJX0JSSywgUFJfQlJLLCBDSV9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLXSwgLy8gUFJcbiAgICBbSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIFBSX0JSSywgQ0lfQlJLLCBQUl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSS10sIC8vIFBPXG4gICAgW0lOX0JSSywgUFJfQlJLLCBQUl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBESV9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBQUl9CUkssIENJX0JSSywgUFJfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBESV9CUktdLCAvLyBOVVxuICAgIFtJTl9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBESV9CUkssIERJX0JSSywgUFJfQlJLLCBDSV9CUkssIFBSX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgRElfQlJLXSwgLy8gQUxcbiAgICBbSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIFBSX0JSSywgQ0lfQlJLLCBQUl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSS10sIC8vIEhMXG4gICAgW0RJX0JSSywgUFJfQlJLLCBQUl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIERJX0JSSywgSU5fQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBQUl9CUkssIENJX0JSSywgUFJfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBESV9CUktdLCAvLyBJRFxuICAgIFtESV9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBESV9CUkssIERJX0JSSywgUFJfQlJLLCBDSV9CUkssIFBSX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgRElfQlJLXSwgLy8gSU5cbiAgICBbRElfQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBESV9CUkssIElOX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIFBSX0JSSywgQ0lfQlJLLCBQUl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSS10sIC8vIEhZXG4gICAgW0RJX0JSSywgUFJfQlJLLCBQUl9CUkssIElOX0JSSywgRElfQlJLLCBJTl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBQUl9CUkssIENJX0JSSywgUFJfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBESV9CUktdLCAvLyBCQVxuICAgIFtJTl9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgUFJfQlJLLCBDSV9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLXSwgLy8gQkJcbiAgICBbRElfQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBQUl9CUkssIFBSX0JSSywgQ0lfQlJLLCBQUl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSS10sIC8vIEIyXG4gICAgW0RJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBQUl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUktdLCAvLyBaV1xuICAgIFtJTl9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBESV9CUkssIERJX0JSSywgUFJfQlJLLCBDSV9CUkssIFBSX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgRElfQlJLXSwgLy8gQ01cbiAgICBbSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIFBSX0JSSywgQ0lfQlJLLCBQUl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSS10sIC8vIFdKXG4gICAgW0RJX0JSSywgUFJfQlJLLCBQUl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIERJX0JSSywgSU5fQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBQUl9CUkssIENJX0JSSywgUFJfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBESV9CUktdLCAvLyBIMlxuICAgIFtESV9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBESV9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBESV9CUkssIERJX0JSSywgUFJfQlJLLCBDSV9CUkssIFBSX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgRElfQlJLXSwgLy8gSDNcbiAgICBbRElfQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIFBSX0JSSywgQ0lfQlJLLCBQUl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSS10sIC8vIEpMXG4gICAgW0RJX0JSSywgUFJfQlJLLCBQUl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIERJX0JSSywgSU5fQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBQUl9CUkssIENJX0JSSywgUFJfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBESV9CUktdLCAvLyBKVlxuICAgIFtESV9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBESV9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBESV9CUkssIERJX0JSSywgUFJfQlJLLCBDSV9CUkssIFBSX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgRElfQlJLXSwgLy8gSlRcbiAgICBbRElfQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIFBSX0JSSywgQ0lfQlJLLCBQUl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSS10sIC8vIFJJXG4gICAgW0RJX0JSSywgUFJfQlJLLCBQUl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIFBSX0JSSywgUFJfQlJLLCBQUl9CUkssIERJX0JSSywgSU5fQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgRElfQlJLLCBQUl9CUkssIENJX0JSSywgUFJfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgSU5fQlJLLCBESV9CUktdLCAvLyBFQlxuICAgIFtESV9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBESV9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBESV9CUkssIERJX0JSSywgUFJfQlJLLCBDSV9CUkssIFBSX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgRElfQlJLXSwgLy8gRU1cbiAgICBbSU5fQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgUFJfQlJLLCBQUl9CUkssIFBSX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgSU5fQlJLLCBJTl9CUkssIERJX0JSSywgSU5fQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBESV9CUkssIFBSX0JSSywgQ0lfQlJLLCBQUl9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBJTl9CUkssIERJX0JSS10sIC8vIFpXSlxuICAgIFtESV9CUkssIFBSX0JSSywgUFJfQlJLLCBJTl9CUkssIElOX0JSSywgRElfQlJLLCBQUl9CUkssIFBSX0JSSywgUFJfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgUFJfQlJLLCBDSV9CUkssIFBSX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIERJX0JSSywgRElfQlJLLCBESV9CUkssIElOX0JSSywgRElfQlJLXSAgLy8gQ0JcbiAgXTtcbiAgLyoqKioqKiBFTkQgbGluZWJyZWFrL3NyYy9wYWlycy5qcyAqKioqKiovXG5cbiAgLyoqKioqKiBTVEFSVCBsaW5lYnJlYWsvc3JjL2xpbmVicmVha2VyLmpzICoqKioqKi9cbiAgY29uc3QgbWFwQ2xhc3MgPSBmdW5jdGlvbiAoYykge1xuICAgIHN3aXRjaCAoYykge1xuICAgICAgY2FzZSBBSTpcbiAgICAgICAgcmV0dXJuIEFMO1xuXG4gICAgICBjYXNlIFNBOlxuICAgICAgY2FzZSBTRzpcbiAgICAgIGNhc2UgWFg6XG4gICAgICAgIHJldHVybiBBTDtcblxuICAgICAgY2FzZSBDSjpcbiAgICAgICAgcmV0dXJuIE5TO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gYztcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgbWFwRmlyc3QgPSBmdW5jdGlvbiAoYykge1xuICAgIHN3aXRjaCAoYykge1xuICAgICAgY2FzZSBMRjpcbiAgICAgIGNhc2UgTkw6XG4gICAgICAgIHJldHVybiBCSztcblxuICAgICAgY2FzZSBTUDpcbiAgICAgICAgcmV0dXJuIFdKO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gYztcbiAgICB9XG4gIH07XG5cbiAgY2xhc3MgQnJlYWsge1xuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uLCByZXF1aXJlZCA9IGZhbHNlKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICB0aGlzLnJlcXVpcmVkID0gcmVxdWlyZWQ7XG4gICAgfVxuICB9XG5cbiAgY2xhc3MgTGluZUJyZWFrZXIge1xuICAgIGNvbnN0cnVjdG9yKHN0cmluZykge1xuICAgICAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG4gICAgICB0aGlzLnBvcyA9IDA7XG4gICAgICB0aGlzLmxhc3RQb3MgPSAwO1xuICAgICAgdGhpcy5jdXJDbGFzcyA9IG51bGw7XG4gICAgICB0aGlzLm5leHRDbGFzcyA9IG51bGw7XG4gICAgICB0aGlzLkxCOGEgPSBmYWxzZTtcbiAgICAgIHRoaXMuTEIyMWEgPSBmYWxzZTtcbiAgICAgIHRoaXMuTEIzMGEgPSAwO1xuICAgIH1cblxuICAgIG5leHRDb2RlUG9pbnQoKSB7XG4gICAgICBjb25zdCBjb2RlID0gdGhpcy5zdHJpbmcuY2hhckNvZGVBdCh0aGlzLnBvcysrKTtcbiAgICAgIGNvbnN0IG5leHQgPSB0aGlzLnN0cmluZy5jaGFyQ29kZUF0KHRoaXMucG9zKTtcblxuICAgICAgLy8gSWYgYSBzdXJyb2dhdGUgcGFpclxuICAgICAgaWYgKCgweGQ4MDAgPD0gY29kZSAmJiBjb2RlIDw9IDB4ZGJmZikgJiYgKDB4ZGMwMCA8PSBuZXh0ICYmIG5leHQgPD0gMHhkZmZmKSkge1xuICAgICAgICB0aGlzLnBvcysrO1xuICAgICAgICByZXR1cm4gKChjb2RlIC0gMHhkODAwKSAqIDB4NDAwKSArIChuZXh0IC0gMHhkYzAwKSArIDB4MTAwMDA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb2RlO1xuICAgIH1cblxuICAgIG5leHRDaGFyQ2xhc3MoKSB7XG4gICAgICByZXR1cm4gbWFwQ2xhc3MoY2xhc3NUcmllLmdldCh0aGlzLm5leHRDb2RlUG9pbnQoKSkpO1xuICAgIH1cblxuICAgIGdldFNpbXBsZUJyZWFrKCkge1xuICAgICAgLy8gaGFuZGxlIGNsYXNzZXMgbm90IGhhbmRsZWQgYnkgdGhlIHBhaXIgdGFibGVcbiAgICAgIHN3aXRjaCAodGhpcy5uZXh0Q2xhc3MpIHtcbiAgICAgICAgY2FzZSBTUDpcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgY2FzZSBCSzpcbiAgICAgICAgY2FzZSBMRjpcbiAgICAgICAgY2FzZSBOTDpcbiAgICAgICAgICB0aGlzLmN1ckNsYXNzID0gQks7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGNhc2UgQ1I6XG4gICAgICAgICAgdGhpcy5jdXJDbGFzcyA9IENSO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZ2V0UGFpclRhYmxlQnJlYWsobGFzdENsYXNzKSB7XG4gICAgICAvLyBpZiBub3QgaGFuZGxlZCBhbHJlYWR5LCB1c2UgdGhlIHBhaXIgdGFibGVcbiAgICAgIGxldCBzaG91bGRCcmVhayA9IGZhbHNlO1xuICAgICAgc3dpdGNoIChwYWlyVGFibGVbdGhpcy5jdXJDbGFzc11bdGhpcy5uZXh0Q2xhc3NdKSB7XG4gICAgICAgIGNhc2UgRElfQlJLOiAvLyBEaXJlY3QgYnJlYWtcbiAgICAgICAgICBzaG91bGRCcmVhayA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBJTl9CUks6IC8vIHBvc3NpYmxlIGluZGlyZWN0IGJyZWFrXG4gICAgICAgICAgc2hvdWxkQnJlYWsgPSBsYXN0Q2xhc3MgPT09IFNQO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgQ0lfQlJLOlxuICAgICAgICAgIHNob3VsZEJyZWFrID0gbGFzdENsYXNzID09PSBTUDtcbiAgICAgICAgICBpZiAoIXNob3VsZEJyZWFrKSB7XG4gICAgICAgICAgICBzaG91bGRCcmVhayA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHNob3VsZEJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIENQX0JSSzogLy8gcHJvaGliaXRlZCBmb3IgY29tYmluaW5nIG1hcmtzXG4gICAgICAgICAgaWYgKGxhc3RDbGFzcyAhPT0gU1ApIHtcbiAgICAgICAgICAgIHJldHVybiBzaG91bGRCcmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBQUl9CUks6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLkxCOGEpIHtcbiAgICAgICAgc2hvdWxkQnJlYWsgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gUnVsZSBMQjIxYVxuICAgICAgaWYgKHRoaXMuTEIyMWEgJiYgKHRoaXMuY3VyQ2xhc3MgPT09IEhZIHx8IHRoaXMuY3VyQ2xhc3MgPT09IEJBKSkge1xuICAgICAgICBzaG91bGRCcmVhayA9IGZhbHNlO1xuICAgICAgICB0aGlzLkxCMjFhID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLkxCMjFhID0gKHRoaXMuY3VyQ2xhc3MgPT09IEhMKTtcbiAgICAgIH1cblxuICAgICAgLy8gUnVsZSBMQjMwYVxuICAgICAgaWYgKHRoaXMuY3VyQ2xhc3MgPT09IFJJKSB7XG4gICAgICAgIHRoaXMuTEIzMGErKztcbiAgICAgICAgaWYgKHRoaXMuTEIzMGEgPT0gMiAmJiAodGhpcy5uZXh0Q2xhc3MgPT09IFJJKSkge1xuICAgICAgICAgIHNob3VsZEJyZWFrID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLkxCMzBhID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5MQjMwYSA9IDA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY3VyQ2xhc3MgPSB0aGlzLm5leHRDbGFzcztcblxuICAgICAgcmV0dXJuIHNob3VsZEJyZWFrO1xuICAgIH1cblxuICAgIG5leHRCcmVhaygpIHtcbiAgICAgIC8vIGdldCB0aGUgZmlyc3QgY2hhciBpZiB3ZSdyZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzdHJpbmdcbiAgICAgIGlmICh0aGlzLmN1ckNsYXNzID09IG51bGwpIHtcbiAgICAgICAgbGV0IGZpcnN0Q2xhc3MgPSB0aGlzLm5leHRDaGFyQ2xhc3MoKTtcbiAgICAgICAgdGhpcy5jdXJDbGFzcyA9IG1hcEZpcnN0KGZpcnN0Q2xhc3MpO1xuICAgICAgICB0aGlzLm5leHRDbGFzcyA9IGZpcnN0Q2xhc3M7XG4gICAgICAgIHRoaXMuTEI4YSA9IChmaXJzdENsYXNzID09PSBaV0opO1xuICAgICAgICB0aGlzLkxCMzBhID0gMDtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKHRoaXMucG9zIDwgdGhpcy5zdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMubGFzdFBvcyA9IHRoaXMucG9zO1xuICAgICAgICBjb25zdCBsYXN0Q2xhc3MgPSB0aGlzLm5leHRDbGFzcztcbiAgICAgICAgdGhpcy5uZXh0Q2xhc3MgPSB0aGlzLm5leHRDaGFyQ2xhc3MoKTtcblxuICAgICAgICAvLyBleHBsaWNpdCBuZXdsaW5lXG4gICAgICAgIGlmICgodGhpcy5jdXJDbGFzcyA9PT0gQkspIHx8ICgodGhpcy5jdXJDbGFzcyA9PT0gQ1IpICYmICh0aGlzLm5leHRDbGFzcyAhPT0gTEYpKSkge1xuICAgICAgICAgIHRoaXMuY3VyQ2xhc3MgPSBtYXBGaXJzdChtYXBDbGFzcyh0aGlzLm5leHRDbGFzcykpO1xuICAgICAgICAgIHJldHVybiBuZXcgQnJlYWsodGhpcy5sYXN0UG9zLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzaG91bGRCcmVhayA9IHRoaXMuZ2V0U2ltcGxlQnJlYWsoKTtcblxuICAgICAgICBpZiAoc2hvdWxkQnJlYWsgPT09IG51bGwpIHtcbiAgICAgICAgICBzaG91bGRCcmVhayA9IHRoaXMuZ2V0UGFpclRhYmxlQnJlYWsobGFzdENsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJ1bGUgTEI4YVxuICAgICAgICB0aGlzLkxCOGEgPSAodGhpcy5uZXh0Q2xhc3MgPT09IFpXSik7XG5cbiAgICAgICAgaWYgKHNob3VsZEJyZWFrKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBCcmVhayh0aGlzLmxhc3RQb3MpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmxhc3RQb3MgPCB0aGlzLnN0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5sYXN0UG9zID0gdGhpcy5zdHJpbmcubGVuZ3RoO1xuICAgICAgICByZXR1cm4gbmV3IEJyZWFrKHRoaXMuc3RyaW5nLmxlbmd0aCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKioqKiogRU5EIGxpbmVicmVhay9zcmMvbGluZWJyZWFrZXIuanMgKioqKioqL1xuXG4gIHJldHVybiBMaW5lQnJlYWtlcjtcbn0gKSgpO1xuIl0sIm5hbWVzIjpbIndpbmRvdyIsIkxpbmVCcmVha2VyIiwiaW5mbGF0ZSIsIlRJTkZfT0siLCJUSU5GX0RBVEFfRVJST1IiLCJUcmVlIiwidGFibGUiLCJVaW50MTZBcnJheSIsInRyYW5zIiwiRGF0YSIsInNvdXJjZSIsImRlc3QiLCJzb3VyY2VJbmRleCIsInRhZyIsImJpdGNvdW50IiwiZGVzdExlbiIsImx0cmVlIiwiZHRyZWUiLCJzbHRyZWUiLCJzZHRyZWUiLCJsZW5ndGhfYml0cyIsIlVpbnQ4QXJyYXkiLCJsZW5ndGhfYmFzZSIsImRpc3RfYml0cyIsImRpc3RfYmFzZSIsImNsY2lkeCIsImNvZGVfdHJlZSIsImxlbmd0aHMiLCJ0aW5mX2J1aWxkX2JpdHNfYmFzZSIsImJpdHMiLCJiYXNlIiwiZGVsdGEiLCJmaXJzdCIsImkiLCJzdW0iLCJ0aW5mX2J1aWxkX2ZpeGVkX3RyZWVzIiwibHQiLCJkdCIsIm9mZnMiLCJ0aW5mX2J1aWxkX3RyZWUiLCJ0Iiwib2ZmIiwibnVtIiwidGluZl9nZXRiaXQiLCJkIiwiYml0IiwidGluZl9yZWFkX2JpdHMiLCJ2YWwiLCJ0aW5mX2RlY29kZV9zeW1ib2wiLCJjdXIiLCJsZW4iLCJ0aW5mX2RlY29kZV90cmVlcyIsImhsaXQiLCJoZGlzdCIsImhjbGVuIiwibGVuZ3RoIiwiY2xlbiIsInN5bSIsInByZXYiLCJ0aW5mX2luZmxhdGVfYmxvY2tfZGF0YSIsImRpc3QiLCJ0aW5mX2luZmxhdGVfdW5jb21wcmVzc2VkX2Jsb2NrIiwiaW52bGVuZ3RoIiwidGluZl91bmNvbXByZXNzIiwiYmZpbmFsIiwiYnR5cGUiLCJyZXMiLCJFcnJvciIsInNsaWNlIiwic3ViYXJyYXkiLCJzd2FwMzJMRSIsImlzQmlnRW5kaWFuIiwiVWludDMyQXJyYXkiLCJidWZmZXIiLCJzd2FwIiwiYiIsIm4iLCJtIiwic3dhcDMyIiwiYXJyYXkiLCJVbmljb2RlVHJpZSIsIlNISUZUXzEiLCJTSElGVF8yIiwiU0hJRlRfMV8yIiwiT01JVFRFRF9CTVBfSU5ERVhfMV9MRU5HVEgiLCJJTkRFWF8yX0JMT0NLX0xFTkdUSCIsIklOREVYXzJfTUFTSyIsIklOREVYX1NISUZUIiwiREFUQV9CTE9DS19MRU5HVEgiLCJEQVRBX01BU0siLCJMU0NQX0lOREVYXzJfT0ZGU0VUIiwiTFNDUF9JTkRFWF8yX0xFTkdUSCIsIklOREVYXzJfQk1QX0xFTkdUSCIsIlVURjhfMkJfSU5ERVhfMl9PRkZTRVQiLCJVVEY4XzJCX0lOREVYXzJfTEVOR1RIIiwiSU5ERVhfMV9PRkZTRVQiLCJEQVRBX0dSQU5VTEFSSVRZIiwiZ2V0IiwiY29kZVBvaW50IiwiaW5kZXgiLCJlcnJvclZhbHVlIiwiZGF0YSIsImhpZ2hTdGFydCIsImNvbnN0cnVjdG9yIiwiaXNCdWZmZXIiLCJyZWFkVUludDMyQkUiLCJ1bmNvbXByZXNzZWRMZW5ndGgiLCJyZWFkVUludDMyTEUiLCJ2aWV3IiwiRGF0YVZpZXciLCJnZXRVaW50MzIiLCJiYXNlNjREYXRhIiwidG9UeXBlZEFycmF5IiwiYmFzZTY0IiwiYmluYXJ5IiwiYXRvYiIsInJlc3VsdCIsImNoYXJDb2RlQXQiLCJjbGFzc1RyaWUiLCJPUCIsIkNMIiwiQ1AiLCJRVSIsIkdMIiwiTlMiLCJFWCIsIlNZIiwiSVMiLCJQUiIsIlBPIiwiTlUiLCJBTCIsIkhMIiwiSUQiLCJJTiIsIkhZIiwiQkEiLCJCQiIsIkIyIiwiWlciLCJDTSIsIldKIiwiSDIiLCJIMyIsIkpMIiwiSlYiLCJKVCIsIlJJIiwiRUIiLCJFTSIsIlpXSiIsIkNCIiwiQUkiLCJCSyIsIkNKIiwiQ1IiLCJMRiIsIk5MIiwiU0EiLCJTRyIsIlNQIiwiWFgiLCJESV9CUksiLCJJTl9CUksiLCJDSV9CUksiLCJDUF9CUksiLCJQUl9CUksiLCJwYWlyVGFibGUiLCJtYXBDbGFzcyIsImMiLCJtYXBGaXJzdCIsIkJyZWFrIiwicG9zaXRpb24iLCJyZXF1aXJlZCIsIm5leHRDb2RlUG9pbnQiLCJjb2RlIiwic3RyaW5nIiwicG9zIiwibmV4dCIsIm5leHRDaGFyQ2xhc3MiLCJnZXRTaW1wbGVCcmVhayIsIm5leHRDbGFzcyIsImN1ckNsYXNzIiwiZ2V0UGFpclRhYmxlQnJlYWsiLCJsYXN0Q2xhc3MiLCJzaG91bGRCcmVhayIsIkxCOGEiLCJMQjIxYSIsIkxCMzBhIiwibmV4dEJyZWFrIiwiZmlyc3RDbGFzcyIsImxhc3RQb3MiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Q0FTQyxHQUVEQSxPQUFPQyxXQUFXLEdBQUcsQUFBRSxDQUFBO0lBQ3JCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBCQyxHQUNILHlDQUF5QyxHQUN2QyxNQUFNQyxVQUFVLEFBQUUsQ0FBQTtRQUNoQixJQUFJQyxVQUFVO1FBQ2QsSUFBSUMsa0JBQWtCLENBQUM7UUFFdkIsU0FBU0M7WUFDUCxJQUFJLENBQUNDLEtBQUssR0FBRyxJQUFJQyxZQUFZLEtBQU8sK0JBQStCO1lBQ25FLElBQUksQ0FBQ0MsS0FBSyxHQUFHLElBQUlELFlBQVksTUFBTyxvQ0FBb0M7UUFDMUU7UUFFQSxTQUFTRSxLQUFL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WUFBQ0E7WUFBUUc7WUFBUUE7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUc7WUFBUUE7WUFBUUE7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUc7WUFBUUY7WUFBUUU7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7U0FBTztRQUN4UTtZQUFDRDtZQUFRSTtZQUFRQTtZQUFRSDtZQUFRQTtZQUFRQTtZQUFRRztZQUFRQTtZQUFRQTtZQUFRSjtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQztZQUFRQTtZQUFRQTtZQUFRRDtZQUFRQTtZQUFRSTtZQUFRRjtZQUFRRTtZQUFRSjtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQztZQUFRRDtTQUFPO1FBQ3hRO1lBQUNBO1lBQVFJO1lBQVFBO1lBQVFIO1lBQVFBO1lBQVFBO1lBQVFHO1lBQVFBO1lBQVFBO1lBQVFKO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFDO1lBQVFBO1lBQVFBO1lBQVFEO1lBQVFBO1lBQVFJO1lBQVFGO1lBQVFFO1lBQVFKO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFDO1lBQVFEO1NBQU87UUFDeFE7WUFBQ0E7WUFBUUk7WUFBUUE7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUc7WUFBUUE7WUFBUUE7WUFBUUo7WUFBUUE7WUFBUUM7WUFBUUQ7WUFBUUM7WUFBUUQ7WUFBUUM7WUFBUUE7WUFBUUE7WUFBUUQ7WUFBUUE7WUFBUUk7WUFBUUY7WUFBUUU7WUFBUUo7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUM7WUFBUUQ7U0FBTztRQUN4UTtZQUFDQTtZQUFRSTtZQUFRQTtZQUFRSDtZQUFRQTtZQUFRQTtZQUFRRztZQUFRQTtZQUFRQTtZQUFRSjtZQUFRQTtZQUFRQztZQUFRQTtZQUFRQTtZQUFRRDtZQUFRQztZQUFRQTtZQUFRQTtZQUFRRDtZQUFRQTtZQUFRSTtZQUFRRjtZQUFRRTtZQUFRSjtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQztZQUFRRDtTQUFPO1FBQ3hRO1lBQUNDO1lBQVFHO1lBQVFBO1lBQVFIO1lBQVFBO1lBQVFBO1lBQVFHO1lBQVFBO1lBQVFBO1lBQVFKO1lBQVFBO1lBQVFDO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFEO1lBQVFBO1lBQVFJO1lBQVFGO1lBQVFFO1lBQVFIO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFEO1lBQVFDO1lBQVFBO1lBQVFBO1lBQVFEO1NBQU87UUFDeFE7WUFBQ0M7WUFBUUc7WUFBUUE7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUc7WUFBUUE7WUFBUUE7WUFBUUo7WUFBUUE7WUFBUUM7WUFBUUE7WUFBUUE7WUFBUUQ7WUFBUUM7WUFBUUE7WUFBUUE7WUFBUUQ7WUFBUUE7WUFBUUk7WUFBUUY7WUFBUUU7WUFBUUo7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUM7WUFBUUQ7U0FBTztRQUN4UTtZQUFDQztZQUFRRztZQUFRQTtZQUFRSDtZQUFRQTtZQUFRQTtZQUFRRztZQUFRQTtZQUFRQTtZQUFRSDtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRRDtZQUFRQztZQUFRQTtZQUFRQTtZQUFRRDtZQUFRQTtZQUFRSTtZQUFRRjtZQUFRRTtZQUFRSjtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQztZQUFRRDtTQUFPO1FBQ3hRO1lBQUNDO1lBQVFHO1lBQVFBO1lBQVFIO1lBQVFBO1lBQVFBO1lBQVFHO1lBQVFBO1lBQVFBO1lBQVFIO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFEO1lBQVFDO1lBQVFBO1lBQVFBO1lBQVFEO1lBQVFBO1lBQVFJO1lBQVFGO1lBQVFFO1lBQVFKO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFDO1lBQVFEO1NBQU87UUFDeFE7WUFBQ0M7WUFBUUc7WUFBUUE7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUc7WUFBUUE7WUFBUUE7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUQ7WUFBUUM7WUFBUUE7WUFBUUE7WUFBUUQ7WUFBUUE7WUFBUUk7WUFBUUY7WUFBUUU7WUFBUUo7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUM7WUFBUUQ7U0FBTztRQUN4UTtZQUFDQTtZQUFRSTtZQUFRQTtZQUFRSDtZQUFRQTtZQUFRQTtZQUFRRztZQUFRQTtZQUFRQTtZQUFRSjtZQUFRQztZQUFRRDtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQztZQUFRQTtZQUFRQTtZQUFRRDtZQUFRQTtZQUFRSTtZQUFRRjtZQUFRRTtZQUFRSjtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQztZQUFRRDtTQUFPO1FBQ3hRO1lBQUNBO1lBQVFJO1lBQVFBO1lBQVFIO1lBQVFBO1lBQVFBO1lBQVFHO1lBQVFBO1lBQVFBO1lBQVFKO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFDO1lBQVFBO1lBQVFBO1lBQVFEO1lBQVFBO1lBQVFJO1lBQVFGO1lBQVFFO1lBQVFKO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFDO1lBQVFEO1NBQU87UUFDeFE7WUFBQ0E7WUFBUUk7WUFBUUE7WUFBUUg7WUFBUUQ7WUFBUUM7WUFBUUc7WUFBUUE7WUFBUUE7WUFBUUo7WUFBUUE7WUFBUUM7WUFBUUQ7WUFBUUE7WUFBUUE7WUFBUUM7WUFBUUE7WUFBUUE7WUFBUUQ7WUFBUUE7WUFBUUk7WUFBUUY7WUFBUUU7WUFBUUo7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUM7WUFBUUQ7U0FBTztRQUN4UTtZQUFDQTtZQUFRSTtZQUFRQTtZQUFRSDtZQUFRRDtZQUFRQztZQUFRRztZQUFRQTtZQUFRQTtZQUFRSjtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQztZQUFRQTtZQUFRQTtZQUFRRDtZQUFRQTtZQUFRSTtZQUFRRjtZQUFRRTtZQUFRSjtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQztZQUFRRDtTQUFPO1FBQ3hRO1lBQUNDO1lBQVFHO1lBQVFBO1lBQVFIO1lBQVFBO1lBQVFBO1lBQVFHO1lBQVFBO1lBQVFBO1lBQVFIO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFHO1lBQVFGO1lBQVFFO1lBQVFIO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFEO1NBQU87UUFDeFE7WUFBQ0E7WUFBUUk7WUFBUUE7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUc7WUFBUUE7WUFBUUE7WUFBUUo7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUM7WUFBUUE7WUFBUUE7WUFBUUQ7WUFBUUk7WUFBUUE7WUFBUUY7WUFBUUU7WUFBUUo7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUM7WUFBUUQ7U0FBTztRQUN4UTtZQUFDQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRSTtZQUFRSjtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtTQUFPO1FBQ3hRO1lBQUNDO1lBQVFHO1lBQVFBO1lBQVFIO1lBQVFBO1lBQVFBO1lBQVFHO1lBQVFBO1lBQVFBO1lBQVFIO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFEO1lBQVFDO1lBQVFBO1lBQVFBO1lBQVFEO1lBQVFBO1lBQVFJO1lBQVFGO1lBQVFFO1lBQVFKO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFDO1lBQVFEO1NBQU87UUFDeFE7WUFBQ0M7WUFBUUc7WUFBUUE7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUc7WUFBUUE7WUFBUUE7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUc7WUFBUUY7WUFBUUU7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7U0FBTztRQUN4UTtZQUFDRDtZQUFRSTtZQUFRQTtZQUFRSDtZQUFRQTtZQUFRQTtZQUFRRztZQUFRQTtZQUFRQTtZQUFRSjtZQUFRQztZQUFRRDtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQztZQUFRQTtZQUFRQTtZQUFRRDtZQUFRQTtZQUFRSTtZQUFRRjtZQUFRRTtZQUFRSjtZQUFRQTtZQUFRQTtZQUFRQztZQUFRQTtZQUFRRDtZQUFRQTtZQUFRQTtZQUFRQztZQUFRRDtTQUFPO1FBQ3hRO1lBQUNBO1lBQVFJO1lBQVFBO1lBQVFIO1lBQVFBO1lBQVFBO1lBQVFHO1lBQVFBO1lBQVFBO1lBQVFKO1lBQVFDO1lBQVFEO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFDO1lBQVFBO1lBQVFBO1lBQVFEO1lBQVFBO1lBQVFJO1lBQVFGO1lBQVFFO1lBQVFKO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFDO1lBQVFEO1lBQVFBO1lBQVFBO1lBQVFDO1lBQVFEO1NBQU87UUFDeFE7WUFBQ0E7WUFBUUk7WUFBUUE7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUc7WUFBUUE7WUFBUUE7WUFBUUo7WUFBUUM7WUFBUUQ7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUM7WUFBUUE7WUFBUUE7WUFBUUQ7WUFBUUE7WUFBUUk7WUFBUUY7WUFBUUU7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUQ7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUM7WUFBUUQ7U0FBTztRQUN4UTtZQUFDQTtZQUFRSTtZQUFRQTtZQUFRSDtZQUFRQTtZQUFRQTtZQUFRRztZQUFRQTtZQUFRQTtZQUFRSjtZQUFRQztZQUFRRDtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQztZQUFRQTtZQUFRQTtZQUFRRDtZQUFRQTtZQUFRSTtZQUFRRjtZQUFRRTtZQUFRSjtZQUFRQTtZQUFRQTtZQUFRQztZQUFRQTtZQUFRRDtZQUFRQTtZQUFRQTtZQUFRQztZQUFRRDtTQUFPO1FBQ3hRO1lBQUNBO1lBQVFJO1lBQVFBO1lBQVFIO1lBQVFBO1lBQVFBO1lBQVFHO1lBQVFBO1lBQVFBO1lBQVFKO1lBQVFDO1lBQVFEO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFDO1lBQVFBO1lBQVFBO1lBQVFEO1lBQVFBO1lBQVFJO1lBQVFGO1lBQVFFO1lBQVFKO1lBQVFBO1lBQVFBO1lBQVFBO1lBQVFDO1lBQVFEO1lBQVFBO1lBQVFBO1lBQVFDO1lBQVFEO1NBQU87UUFDeFE7WUFBQ0E7WUFBUUk7WUFBUUE7WUFBUUg7WUFBUUE7WUFBUUE7WUFBUUc7WUFBUUE7WUFBUUE7WUFBUUo7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUM7WUFBUUE7WUFBUUE7WUFBUUQ7WUFBUUE7WUFBUUk7WUFBUUY7WUFBUUU7WUFBUUo7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUE7WUFBUUM7WUFBUUQ7WUFBUUE7WUFBUUM7WUFBUUQ7U0FBTztRQUN4UTtZQUFDQTtZQUFRSTtZQUFRQTtZQUFRSDtZQUFRQTtZQUFRQTtZQUFRRztZQUFRQTtZQUFRQTtZQUFRSjtZQUFRQztZQUFRRDtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQztZQUFRQTtZQUFRQTtZQUFRRDtZQUFRQTtZQUFRSTtZQUFRRjtZQUFRRTtZQUFRSjtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZQUFRQTtZ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