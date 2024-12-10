(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define([
        'exports'
    ], factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.acorn = {}));
})(this, function(exports1) {
    'use strict';
    // This file was generated. Do not modify manually!
    var astralIdentifierCodes = [
        509,
        0,
        227,
        0,
        150,
        4,
        294,
        9,
        1368,
        2,
        2,
        1,
        6,
        3,
        41,
        2,
        5,
        0,
        166,
        1,
        574,
        3,
        9,
        9,
        370,
        1,
        81,
        2,
        71,
        10,
        50,
        3,
        123,
        2,
        54,
        14,
        32,
        10,
        3,
        1,
        11,
        3,
        46,
        10,
        8,
        0,
        46,
        9,
        7,
        2,
        37,
        13,
        2,
        9,
        6,
        1,
        45,
        0,
        13,
        2,
        49,
        13,
        9,
        3,
        2,
        11,
        83,
        11,
        7,
        0,
        3,
        0,
        158,
        11,
        6,
        9,
        7,
        3,
        56,
        1,
        2,
        6,
        3,
        1,
        3,
        2,
        10,
        0,
        11,
        1,
        3,
        6,
        4,
        4,
        193,
        17,
        10,
        9,
        5,
        0,
        82,
        19,
        13,
        9,
        214,
        6,
        3,
        8,
        28,
        1,
        83,
        16,
        16,
        9,
        82,
        12,
        9,
        9,
        84,
        14,
        5,
        9,
        243,
        14,
        166,
        9,
        71,
        5,
        2,
        1,
        3,
        3,
        2,
        0,
        2,
        1,
        13,
        9,
        120,
        6,
        3,
        6,
        4,
        0,
        29,
        9,
        41,
        6,
        2,
        3,
        9,
        0,
        10,
        10,
        47,
        15,
        406,
        7,
        2,
        7,
        17,
        9,
        57,
        21,
        2,
        13,
        123,
        5,
        4,
        0,
        2,
        1,
        2,
        6,
        2,
        0,
        9,
        9,
        49,
        4,
        2,
        1,
        2,
        4,
        9,
        9,
        330,
        3,
        10,
        1,
        2,
        0,
        49,
        6,
        4,
        4,
        14,
        9,
        5351,
        0,
        7,
        14,
        13835,
        9,
        87,
        9,
        39,
        4,
        60,
        6,
        26,
        9,
        1014,
        0,
        2,
        54,
        8,
        3,
        82,
        0,
        12,
        1,
        19628,
        1,
        4706,
        45,
        3,
        22,
        543,
        4,
        4,
        5,
        9,
        7,
        3,
        6,
        31,
        3,
        149,
        2,
        1418,
        49,
        513,
        54,
        5,
        49,
        9,
        0,
        15,
        0,
        23,
        4,
        2,
        14,
        1361,
        6,
        2,
        16,
        3,
        6,
        2,
        1,
        2,
        4,
        101,
        0,
        161,
        6,
        10,
        9,
        357,
        0,
        62,
        13,
        499,
        13,
        983,
        6,
        110,
        6,
        6,
        9,
        4759,
        9,
        787719,
        239
    ];
    // This file was generated. Do not modify manually!
    var astralIdentifierStartCodes = [
        0,
        11,
        2,
        25,
        2,
        18,
        2,
        1,
        2,
        14,
        3,
        13,
        35,
        122,
        70,
        52,
        268,
        28,
        4,
        48,
        48,
        31,
        14,
        29,
        6,
        37,
        11,
        29,
        3,
        35,
        5,
        7,
        2,
        4,
        43,
        157,
        19,
        35,
        5,
        35,
        5,
        39,
        9,
        51,
        13,
        10,
        2,
        14,
        2,
        6,
        2,
        1,
        2,
        10,
        2,
        14,
        2,
        6,
        2,
        1,
        68,
        310,
        10,
        21,
        11,
        7,
        25,
        5,
        2,
        41,
        2,
        8,
        70,
        5,
        3,
        0,
        2,
        43,
        2,
        1,
        4,
        0,
        3,
        22,
        11,
        22,
        10,
        30,
        66,
        18,
        2,
        1,
        11,
        21,
        11,
        25,
        71,
        55,
        7,
        1,
        65,
        0,
        16,
        3,
        2,
        2,
        2,
        28,
        43,
        28,
        4,
        28,
        36,
        7,
        2,
        27,
        28,
        53,
        11,
        21,
        11,
        18,
        14,
        17,
        111,
        72,
        56,
        50,
        14,
        50,
        14,
        35,
        349,
        41,
        7,
        1,
        79,
        28,
        11,
        0,
        9,
        21,
        43,
        17,
        47,
        20,
        28,
        22,
        13,
        52,
        58,
        1,
        3,
        0,
        14,
        44,
        33,
        24,
        27,
        35,
        30,
        0,
        3,
        0,
        9,
        34,
        4,
        0,
        13,
        47,
        15,
        3,
        22,
        0,
        2,
        0,
        36,
        17,
        2,
        24,
        20,
        1,
        64,
        6,
        2,
        0,
        2,
        3,
        2,
        14,
        2,
        9,
        8,
        46,
        39,
        7,
        3,
        1,
        3,
        21,
        2,
        6,
        2,
        1,
        2,
        4,
        4,
        0,
        19,
        0,
        13,
        4,
        159,
        52,
        19,
        3,
        21,
        2,
        31,
        47,
        21,
        1,
        2,
        0,
        185,
        46,
        42,
        3,
        37,
        47,
        21,
        0,
        60,
        42,
        14,
        0,
        72,
        26,
        38,
        6,
        186,
        43,
        117,
        63,
        32,
        7,
        3,
        0,
        3,
        7,
        2,
        1,
        2,
        23,
        16,
        0,
        2,
        0,
        95,
        7,
        3,
        38,
        17,
        0,
        2,
        0,
        29,
        0,
        11,
        39,
        8,
        0,
        22,
        0,
        12,
        45,
        20,
        0,
        19,
        72,
        264,
        8,
        2,
        36,
        18,
        0,
        50,
        29,
        113,
        6,
        2,
        1,
        2,
        37,
        22,
        0,
        26,
        5,
        2,
        1,
        2,
        31,
        15,
        0,
        328,
        18,
        16,
        0,
        2,
        12,
        2,
        33,
        125,
        0,
        80,
        921,
        103,
        110,
        18,
        195,
        2637,
        96,
        16,
        1071,
        18,
        5,
        4026,
        582,
        8634,
        568,
        8,
        30,
        18,
        78,
        18,
        29,
        19,
        47,
        17,
        3,
        32,
        20,
        6,
        18,
        689,
        63,
        129,
        74,
        6,
        0,
        67,
        12,
        65,
        1,
        2,
        0,
        29,
        6135,
        9,
        1237,
        43,
        8,
        8936,
        3,
        2,
        6,
        2,
        1,
        2,
        290,
        16,
        0,
        30,
        2,
        3,
        0,
        15,
        3,
        9,
        395,
        2309,
        106,
        6,
        12,
        4,
        8,
        8,
        9,
        5991,
        84,
        2,
        70,
        2,
        1,
        3,
        0,
        3,
        1,
        3,
        3,
        2,
        11,
        2,
        0,
        2,
        6,
        2,
        64,
        2,
        3,
        3,
        7,
        2,
        6,
        2,
        27,
        2,
        3,
        2,
        4,
        2,
        0,
        4,
        6,
        2,
        339,
        3,
        24,
        2,
        24,
        2,
        30,
        2,
        24,
        2,
        30,
        2,
        24,
        2,
        30,
        2,
        24,
        2,
        30,
        2,
        24,
        2,
        7,
        1845,
        30,
        7,
        5,
        262,
        61,
        147,
        44,
        11,
        6,
        17,
        0,
        322,
        29,
        19,
        43,
        485,
        27,
        757,
        6,
        2,
        3,
        2,
        1,
        2,
        14,
        2,
        196,
        60,
        67,
        8,
        0,
        1205,
        3,
        2,
        26,
        2,
        1,
        2,
        0,
        3,
        0,
        2,
        9,
        2,
        3,
        2,
        0,
        2,
        0,
        7,
        0,
        5,
        0,
        2,
        0,
        2,
        0,
        2,
        2,
        2,
        1,
        2,
        0,
        3,
        0,
        2,
        0,
        2,
        0,
        2,
        0,
        2,
        0,
        2,
        1,
        2,
        0,
        3,
        3,
        2,
        6,
        2,
        3,
        2,
        3,
        2,
        0,
        2,
        9,
        2,
        16,
        6,
        2,
        2,
        4,
        2,
        16,
        4421,
        42719,
        33,
        4153,
        7,
        221,
        3,
        5761,
        15,
        7472,
        16,
        621,
        2467,
        541,
        1507,
        4938,
        6,
        4191
    ];
    // This file was generated. Do not modify manually!
    var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u0898-\u089f\u08ca-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b55-\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3c\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0cf3\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d81-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ece\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u180f-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1abf-\u1ace\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\u30fb\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua82c\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f\uff65";
    // This file was generated. Do not modify manually!
    var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u0870-\u0887\u0889-\u088e\u08a0-\u08c9\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c5d\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cdd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d04-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u1711\u171f-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4c\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u31ff\u3400-\u4dbf\u4e00-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7ca\ua7d0\ua7d1\ua7d3\ua7d5-\ua7d9\ua7f2-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab69\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
    // These are a run-length and offset encoded representation of the
    // >0xffff code points that are a valid part of identifiers. The
    // offset starts at 0x10000, and each pair of numbers represents an
    // offset to the next range, and then a size of the range.
    // Reserved word lists for various dialects of the language
    var reservedWords = {
        3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
        5: "class enum extends super const export import",
        6: "enum",
        strict: "implements interface let package private protected public static yield",
        strictBind: "eval arguments"
    };
    // And the keywords
    var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
    var keywords$1 = {
        5: ecma5AndLessKeywords,
        "5module": ecma5AndLessKeywords + " export import",
        6: ecma5AndLessKeywords + " const class extends export import super"
    };
    var keywordRelationalOperator = /^in(stanceof)?$/;
    // ## Character categories
    var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
    var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
    // This has a complexity linear to the value of the code. The
    // assumption is that looking up astral identifier characters is
    // rare.
    function isInAstralSet(code, set) {
        var pos = 0x10000;
        for(var i = 0; i < set.length; i += 2){
            pos += set[i];
            if (pos > code) {
                return false;
            }
            pos += set[i + 1];
            if (pos >= code) {
                return true;
            }
        }
        return false;
    }
    // Test whether a given character code starts an identifier.
    function isIdentifierStart(code, astral) {
        if (code < 65) {
            return code === 36;
        }
        if (code < 91) {
            return true;
        }
        if (code < 97) {
            return code === 95;
        }
        if (code < 123) {
            return true;
        }
        if (code <= 0xffff) {
            return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
        }
        if (astral === false) {
            return false;
        }
        return isInAstralSet(code, astralIdentifierStartCodes);
    }
    // Test whether a given character is part of an identifier.
    function isIdentifierChar(code, astral) {
        if (code < 48) {
            return code === 36;
        }
        if (code < 58) {
            return true;
        }
        if (code < 65) {
            return false;
        }
        if (code < 91) {
            return true;
        }
        if (code < 97) {
            return code === 95;
        }
        if (code < 123) {
            return true;
        }
        if (code <= 0xffff) {
            return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
        }
        if (astral === false) {
            return false;
        }
        return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
    }
    // ## Token types
    // The assignment of fine-grained, information-carrying type objects
    // allows the tokenizer to store the information it has about a
    // token in a way that is very cheap for the parser to look up.
    // All token type variables start with an underscore, to make them
    // easy to recognize.
    // The `beforeExpr` property is used to disambiguate between regular
    // expressions and divisions. It is set on all token types that can
    // be followed by an expression (thus, a slash after them would be a
    // regular expression).
    //
    // The `startsExpr` property is used to check if the token ends a
    // `yield` expression. It is set on all token types that either can
    // directly start an expression (like a quotation mark) or can
    // continue an expression (like the body of a string).
    //
    // `isLoop` marks a keyword as starting a loop, which is important
    // to know when parsing a label, in order to allow or disallow
    // continue jumps to that label.
    var TokenType = function TokenType(label, conf) {
        if (conf === void 0) conf = {};
        this.label = label;
        this.keyword = conf.keyword;
        this.beforeExpr = !!conf.beforeExpr;
        this.startsExpr = !!conf.startsExpr;
        this.isLoop = !!conf.isLoop;
        this.isAssign = !!conf.isAssign;
        this.prefix = !!conf.prefix;
        this.postfix = !!conf.postfix;
        this.binop = conf.binop || null;
        this.updateContext = null;
    };
    function binop(name, prec) {
        return new TokenType(name, {
            beforeExpr: true,
            binop: prec
        });
    }
    var beforeExpr = {
        beforeExpr: true
    }, startsExpr = {
        startsExpr: true
    };
    // Map keyword names to token types.
    var keywords = {};
    // Succinct definitions of keyword token types
    function kw(name, options) {
        if (options === void 0) options = {};
        options.keyword = name;
        return keywords[name] = new TokenType(name, options);
    }
    var types$1 = {
        num: new TokenType("num", startsExpr),
        regexp: new TokenType("regexp", startsExpr),
        string: new TokenType("string", startsExpr),
        name: new TokenType("name", startsExpr),
        privateId: new TokenType("privateId", startsExpr),
        eof: new TokenType("eof"),
        // Punctuation token types.
        bracketL: new TokenType("[", {
            beforeExpr: true,
            startsExpr: true
        }),
        bracketR: new TokenType("]"),
        braceL: new TokenType("{", {
            beforeExpr: true,
            startsExpr: true
        }),
        braceR: new TokenType("}"),
        parenL: new TokenType("(", {
            beforeExpr: true,
            startsExpr: true
        }),
        parenR: new TokenType(")"),
        comma: new TokenType(",", beforeExpr),
        semi: new TokenType(";", beforeExpr),
        colon: new TokenType(":", beforeExpr),
        dot: new TokenType("."),
        question: new TokenType("?", beforeExpr),
        questionDot: new TokenType("?."),
        arrow: new TokenType("=>", beforeExpr),
        template: new TokenType("template"),
        invalidTemplate: new TokenType("invalidTemplate"),
        ellipsis: new TokenType("...", beforeExpr),
        backQuote: new TokenType("`", startsExpr),
        dollarBraceL: new TokenType("${", {
            beforeExpr: true,
            startsExpr: true
        }),
        // Operators. These carry several kinds of properties to help the
        // parser use them properly (the presence of these properties is
        // what categorizes them as operators).
        //
        // `binop`, when present, specifies that this operator is a binary
        // operator, and will refer to its precedence.
        //
        // `prefix` and `postfix` mark the operator as a prefix or postfix
        // unary operator.
        //
        // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
        // binary operators with a very low precedence, that should result
        // in AssignmentExpression nodes.
        eq: new TokenType("=", {
            beforeExpr: true,
            isAssign: true
        }),
        assign: new TokenType("_=", {
            beforeExpr: true,
            isAssign: true
        }),
        incDec: new TokenType("++/--", {
            prefix: true,
            postfix: true,
            startsExpr: true
        }),
        prefix: new TokenType("!/~", {
            beforeExpr: true,
            prefix: true,
            startsExpr: true
        }),
        logicalOR: binop("||", 1),
        logicalAND: binop("&&", 2),
        bitwiseOR: binop("|", 3),
        bitwiseXOR: binop("^", 4),
        bitwiseAND: binop("&", 5),
        equality: binop("==/!=/===/!==", 6),
        relational: binop("</>/<=/>=", 7),
        bitShift: binop("<</>>/>>>", 8),
        plusMin: new TokenType("+/-", {
            beforeExpr: true,
            binop: 9,
            prefix: true,
            startsExpr: true
        }),
        modulo: binop("%", 10),
        star: binop("*", 10),
        slash: binop("/", 10),
        starstar: new TokenType("**", {
            beforeExpr: true
        }),
        coalesce: binop("??", 1),
        // Keyword token types.
        _break: kw("break"),
        _case: kw("case", beforeExpr),
        _catch: kw("catch"),
        _continue: kw("continue"),
        _debugger: kw("debugger"),
        _default: kw("default", beforeExpr),
        _do: kw("do", {
            isLoop: true,
            beforeExpr: true
        }),
        _else: kw("else", beforeExpr),
        _finally: kw("finally"),
        _for: kw("for", {
            isLoop: true
        }),
        _function: kw("function", startsExpr),
        _if: kw("if"),
        _return: kw("return", beforeExpr),
        _switch: kw("switch"),
        _throw: kw("throw", beforeExpr),
        _try: kw("try"),
        _var: kw("var"),
        _const: kw("const"),
        _while: kw("while", {
            isLoop: true
        }),
        _with: kw("with"),
        _new: kw("new", {
            beforeExpr: true,
            startsExpr: true
        }),
        _this: kw("this", startsExpr),
        _super: kw("super", startsExpr),
        _class: kw("class", startsExpr),
        _extends: kw("extends", beforeExpr),
        _export: kw("export"),
        _import: kw("import", startsExpr),
        _null: kw("null", startsExpr),
        _true: kw("true", startsExpr),
        _false: kw("false", startsExpr),
        _in: kw("in", {
            beforeExpr: true,
            binop: 7
        }),
        _instanceof: kw("instanceof", {
            beforeExpr: true,
            binop: 7
        }),
        _typeof: kw("typeof", {
            beforeExpr: true,
            prefix: true,
            startsExpr: true
        }),
        _void: kw("void", {
            beforeExpr: true,
            prefix: true,
            startsExpr: true
        }),
        _delete: kw("delete", {
            beforeExpr: true,
            prefix: true,
            startsExpr: true
        })
    };
    // Matches a whole line break (where CRLF is considered a single
    // line break). Used to count lines.
    var lineBreak = /\r\n?|\n|\u2028|\u2029/;
    var lineBreakG = new RegExp(lineBreak.source, "g");
    function isNewLine(code) {
        return code === 10 || code === 13 || code === 0x2028 || code === 0x2029;
    }
    function nextLineBreak(code, from, end) {
        if (end === void 0) end = code.length;
        for(var i = from; i < end; i++){
            var next = code.charCodeAt(i);
            if (isNewLine(next)) {
                return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1;
            }
        }
        return -1;
    }
    var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
    var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
    var ref = Object.prototype;
    var hasOwnProperty = ref.hasOwnProperty;
    var toString = ref.toString;
    var hasOwn = Object.hasOwn || function(obj, propName) {
        return hasOwnProperty.call(obj, propName);
    };
    var isArray = Array.isArray || function(obj) {
        return toString.call(obj) === "[object Array]";
    };
    var regexpCache = Object.create(null);
    function wordsRegexp(words) {
        return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"));
    }
    function codePointToString(code) {
        // UTF-16 Decoding
        if (code <= 0xFFFF) {
            return String.fromCharCode(code);
        }
        code -= 0x10000;
        return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00);
    }
    var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;
    // These are used when `options.locations` is on, for the
    // `startLoc` and `endLoc` properties.
    var Position = function Position(line, col) {
        this.line = line;
        this.column = col;
    };
    Position.prototype.offset = function offset(n) {
        return new Position(this.line, this.column + n);
    };
    var SourceLocation = function SourceLocation(p, start, end) {
        this.start = start;
        this.end = end;
        if (p.sourceFile !== null) {
            this.source = p.sourceFile;
        }
    };
    // The `getLineInfo` function is mostly useful when the
    // `locations` option is off (for performance reasons) and you
    // want to find the line/column position for a given character
    // offset. `input` should be the code string that the offset refers
    // into.
    function getLineInfo(input, offset) {
        for(var line = 1, cur = 0;;){
            var nextBreak = nextLineBreak(input, cur, offset);
            if (nextBreak < 0) {
                return new Position(line, offset - cur);
            }
            ++line;
            cur = nextBreak;
        }
    }
    // A second argument must be given to configure the parser process.
    // These options are recognized (only `ecmaVersion` is required):
    var defaultOptions = {
        // `ecmaVersion` indicates the ECMAScript version to parse. Must be
        // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
        // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
        // (the latest version the library supports). This influences
        // support for strict mode, the set of reserved words, and support
        // for new syntax features.
        ecmaVersion: null,
        // `sourceType` indicates the mode the code should be parsed in.
        // Can be either `"script"` or `"module"`. This influences global
        // strict mode and parsing of `import` and `export` declarations.
        sourceType: "script",
        // `onInsertedSemicolon` can be a callback that will be called when
        // a semicolon is automatically inserted. It will be passed the
        // position of the inserted semicolon as an offset, and if
        // `locations` is enabled, it is given the location as a `{line,
        // column}` object as second argument.
        onInsertedSemicolon: null,
        // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
        // trailing commas.
        onTrailingComma: null,
        // By default, reserved words are only enforced if ecmaVersion >= 5.
        // Set `allowReserved` to a boolean value to explicitly turn this on
        // an off. When this option has the value "never", reserved words
        // and keywords can also not be used as property names.
        allowReserved: null,
        // When enabled, a return at the top level is not considered an
        // error.
        allowReturnOutsideFunction: false,
        // When enabled, import/export statements are not constrained to
        // appearing at the top of the program, and an import.meta expression
        // in a script isn't considered an error.
        allowImportExportEverywhere: false,
        // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
        // When enabled, await identifiers are allowed to appear at the top-level scope,
        // but they are still not allowed in non-async functions.
        allowAwaitOutsideFunction: null,
        // When enabled, super identifiers are not constrained to
        // appearing in methods and do not raise an error when they appear elsewhere.
        allowSuperOutsideMethod: null,
        // When enabled, hashbang directive in the beginning of file is
        // allowed and treated as a line comment. Enabled by default when
        // `ecmaVersion` >= 2023.
        allowHashBang: false,
        // By default, the parser will verify that private properties are
        // only used in places where they are valid and have been declared.
        // Set this to false to turn such checks off.
        checkPrivateFields: true,
        // When `locations` is on, `loc` properties holding objects with
        // `start` and `end` properties in `{line, column}` form (with
        // line being 1-based and column 0-based) will be attached to the
        // nodes.
        locations: false,
        // A function can be passed as `onToken` option, which will
        // cause Acorn to call that function with object in the same
        // format as tokens returned from `tokenizer().getToken()`. Note
        // that you are not allowed to call the parser from the
        // callback—that will corrupt its internal state.
        onToken: null,
        // A function can be passed as `onComment` option, which will
        // cause Acorn to call that function with `(block, text, start,
        // end)` parameters whenever a comment is skipped. `block` is a
        // boolean indicating whether this is a block (`/* */`) comment,
        // `text` is the content of the comment, and `start` and `end` are
        // character offsets that denote the start and end of the comment.
        // When the `locations` option is on, two more parameters are
        // passed, the full `{line, column}` locations of the start and
        // end of the comments. Note that you are not allowed to call the
        // parser from the callback—that will corrupt its internal state.
        // When this option has an array as value, objects representing the
        // comments are pushed to it.
        onComment: null,
        // Nodes have their start and end characters offsets recorded in
        // `start` and `end` properties (directly on the node, rather than
        // the `loc` object, which holds line/column data. To also add a
        // [semi-standardized][range] `range` property holding a `[start,
        // end]` array with the same numbers, set the `ranges` option to
        // `true`.
        //
        // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
        ranges: false,
        // It is possible to parse multiple files into a single AST by
        // passing the tree produced by parsing the first file as
        // `program` option in subsequent parses. This will add the
        // toplevel forms of the parsed file to the `Program` (top) node
        // of an existing parse tree.
        program: null,
        // When `locations` is on, you can pass this to record the source
        // file in every node's `loc` object.
        sourceFile: null,
        // This value, if given, is stored in every node, whether
        // `locations` is on or off.
        directSourceFile: null,
        // When enabled, parenthesized expressions are represented by
        // (non-standard) ParenthesizedExpression nodes
        preserveParens: false
    };
    // Interpret and default an options object
    var warnedAboutEcmaVersion = false;
    function getOptions(opts) {
        var options = {};
        for(var opt in defaultOptions){
            options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt];
        }
        if (options.ecmaVersion === "latest") {
            options.ecmaVersion = 1e8;
        } else if (options.ecmaVersion == null) {
            if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
                warnedAboutEcmaVersion = true;
                console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
            }
            options.ecmaVersion = 11;
        } else if (options.ecmaVersion >= 2015) {
            options.ecmaVersion -= 2009;
        }
        if (options.allowReserved == null) {
            options.allowReserved = options.ecmaVersion < 5;
        }
        if (!opts || opts.allowHashBang == null) {
            options.allowHashBang = options.ecmaVersion >= 14;
        }
        if (isArray(options.onToken)) {
            var tokens = options.onToken;
            options.onToken = function(token) {
                return tokens.push(token);
            };
        }
        if (isArray(options.onComment)) {
            options.onComment = pushComment(options, options.onComment);
        }
        return options;
    }
    function pushComment(options, array) {
        return function(block, text, start, end, startLoc, endLoc) {
            var comment = {
                type: block ? "Block" : "Line",
                value: text,
                start: start,
                end: end
            };
            if (options.locations) {
                comment.loc = new SourceLocation(this, startLoc, endLoc);
            }
            if (options.ranges) {
                comment.range = [
                    start,
                    end
                ];
            }
            array.push(comment);
        };
    }
    // Each scope gets a bitset that may contain these flags
    var SCOPE_TOP = 1, SCOPE_FUNCTION = 2, SCOPE_ASYNC = 4, SCOPE_GENERATOR = 8, SCOPE_ARROW = 16, SCOPE_SIMPLE_CATCH = 32, SCOPE_SUPER = 64, SCOPE_DIRECT_SUPER = 128, SCOPE_CLASS_STATIC_BLOCK = 256, SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;
    function functionFlags(async, generator) {
        return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0);
    }
    // Used in checkLVal* and declareName to determine the type of a binding
    var BIND_NONE = 0, BIND_VAR = 1, BIND_LEXICAL = 2, BIND_FUNCTION = 3, BIND_SIMPLE_CATCH = 4, BIND_OUTSIDE = 5; // Special case for function names as bound inside the function
    var Parser = function Parser(options, input, startPos) {
        this.options = options = getOptions(options);
        this.sourceFile = options.sourceFile;
        this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
        var reserved = "";
        if (options.allowReserved !== true) {
            reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
            if (options.sourceType === "module") {
                reserved += " await";
            }
        }
        this.reservedWords = wordsRegexp(reserved);
        var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
        this.reservedWordsStrict = wordsRegexp(reservedStrict);
        this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
        this.input = String(input);
        // Used to signal to callers of `readWord1` whether the word
        // contained any escape sequences. This is needed because words with
        // escape sequences must not be interpreted as keywords.
        this.containsEsc = false;
        // Set up token state
        // The current position of the tokenizer in the input.
        if (startPos) {
            this.pos = startPos;
            this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
            this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
        } else {
            this.pos = this.lineStart = 0;
            this.curLine = 1;
        }
        // Properties of the current token:
        // Its type
        this.type = types$1.eof;
        // For tokens that include more information than their type, the value
        this.value = null;
        // Its start and end offset
        this.start = this.end = this.pos;
        // And, if locations are used, the {line, column} object
        // corresponding to those offsets
        this.startLoc = this.endLoc = this.curPosition();
        // Position information for the previous token
        this.lastTokEndLoc = this.lastTokStartLoc = null;
        this.lastTokStart = this.lastTokEnd = this.pos;
        // The context stack is used to superficially track syntactic
        // context to predict whether a regular expression is allowed in a
        // given position.
        this.context = this.initialContext();
        this.exprAllowed = true;
        // Figure out if it's a module code.
        this.inModule = options.sourceType === "module";
        this.strict = this.inModule || this.strictDirective(this.pos);
        // Used to signify the start of a potential arrow function
        this.potentialArrowAt = -1;
        this.potentialArrowInForAwait = false;
        // Positions to delayed-check that yield/await does not exist in default parameters.
        this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
        // Labels in scope.
        this.labels = [];
        // Thus-far undefined exports.
        this.undefinedExports = Object.create(null);
        // If enabled, skip leading hashbang line.
        if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!") {
            this.skipLineComment(2);
        }
        // Scope tracking for duplicate variable names (see scope.js)
        this.scopeStack = [];
        this.enterScope(SCOPE_TOP);
        // For RegExp validation
        this.regexpState = null;
        // The stack of private names.
        // Each element has two properties: 'declared' and 'used'.
        // When it exited from the outermost class definition, all used private names must be declared.
        this.privateNameStack = [];
    };
    var prototypeAccessors = {
        inFunction: {
            configurable: true
        },
        inGenerator: {
            configurable: true
        },
        inAsync: {
            configurable: true
        },
        canAwait: {
            configurable: true
        },
        allowSuper: {
            configurable: true
        },
        allowDirectSuper: {
            configurable: true
        },
        treatFunctionsAsVar: {
            configurable: true
        },
        allowNewDotTarget: {
            configurable: true
        },
        inClassStaticBlock: {
            configurable: true
        }
    };
    Parser.prototype.parse = function parse() {
        var node = this.options.program || this.startNode();
        this.nextToken();
        return this.parseTopLevel(node);
    };
    prototypeAccessors.inFunction.get = function() {
        return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
    };
    prototypeAccessors.inGenerator.get = function() {
        return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0 && !this.currentVarScope().inClassFieldInit;
    };
    prototypeAccessors.inAsync.get = function() {
        return (this.currentVarScope().flags & SCOPE_ASYNC) > 0 && !this.currentVarScope().inClassFieldInit;
    };
    prototypeAccessors.canAwait.get = function() {
        for(var i = this.scopeStack.length - 1; i >= 0; i--){
            var scope = this.scopeStack[i];
            if (scope.inClassFieldInit || scope.flags & SCOPE_CLASS_STATIC_BLOCK) {
                return false;
            }
            if (scope.flags & SCOPE_FUNCTION) {
                return (scope.flags & SCOPE_ASYNC) > 0;
            }
        }
        return this.inModule && this.options.ecmaVersion >= 13 || this.options.allowAwaitOutsideFunction;
    };
    prototypeAccessors.allowSuper.get = function() {
        var ref = this.currentThisScope();
        var flags = ref.flags;
        var inClassFieldInit = ref.inClassFieldInit;
        return (flags & SCOPE_SUPER) > 0 || inClassFieldInit || this.options.allowSuperOutsideMethod;
    };
    prototypeAccessors.allowDirectSuper.get = function() {
        return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
    };
    prototypeAccessors.treatFunctionsAsVar.get = function() {
        return this.treatFunctionsAsVarInScope(this.currentScope());
    };
    prototypeAccessors.allowNewDotTarget.get = function() {
        var ref = this.currentThisScope();
        var flags = ref.flags;
        var inClassFieldInit = ref.inClassFieldInit;
        return (flags & (SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK)) > 0 || inClassFieldInit;
    };
    prototypeAccessors.inClassStaticBlock.get = function() {
        return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0;
    };
    Parser.extend = function extend() {
        var plugins = [], len = arguments.length;
        while(len--)plugins[len] = arguments[len];
        var cls = this;
        for(var i = 0; i < plugins.length; i++){
            cls = plugins[i](cls);
        }
        return cls;
    };
    Parser.parse = function parse(input, options) {
        return new this(options, input).parse();
    };
    Parser.parseExpressionAt = function parseExpressionAt(input, pos, options) {
        var parser = new this(options, input, pos);
        parser.nextToken();
        return parser.parseExpression();
    };
    Parser.tokenizer = function tokenizer(input, options) {
        return new this(options, input);
    };
    Object.defineProperties(Parser.prototype, prototypeAccessors);
    var pp$9 = Parser.prototype;
    // ## Parser utilities
    var literal = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
    pp$9.strictDirective = function(start) {
        if (this.options.ecmaVersion < 5) {
            return false;
        }
        for(;;){
            // Try to find string literal.
            skipWhiteSpace.lastIndex = start;
            start += skipWhiteSpace.exec(this.input)[0].length;
            var match = literal.exec(this.input.slice(start));
            if (!match) {
                return false;
            }
            if ((match[1] || match[2]) === "use strict") {
                skipWhiteSpace.lastIndex = start + match[0].length;
                var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
                var next = this.input.charAt(end);
                return next === ";" || next === "}" || lineBreak.test(spaceAfter[0]) && !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "=");
            }
            start += match[0].length;
            // Skip semicolon, if any.
            skipWhiteSpace.lastIndex = start;
            start += skipWhiteSpace.exec(this.input)[0].length;
            if (this.input[start] === ";") {
                start++;
            }
        }
    };
    // Predicate that tests whether the next token is of the given
    // type, and if yes, consumes it as a side effect.
    pp$9.eat = function(type) {
        if (this.type === type) {
            this.next();
            return true;
        } else {
            return false;
        }
    };
    // Tests whether parsed token is a contextual keyword.
    pp$9.isContextual = function(name) {
        return this.type === types$1.name && this.value === name && !this.containsEsc;
    };
    // Consumes contextual keyword if possible.
    pp$9.eatContextual = function(name) {
        if (!this.isContextual(name)) {
            return false;
        }
        this.next();
        return true;
    };
    // Asserts that following token is given contextual keyword.
    pp$9.expectContextual = function(name) {
        if (!this.eatContextual(name)) {
            this.unexpected();
        }
    };
    // Test whether a semicolon can be inserted at the current position.
    pp$9.canInsertSemicolon = function() {
        return this.type === types$1.eof || this.type === types$1.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
    };
    pp$9.insertSemicolon = function() {
        if (this.canInsertSemicolon()) {
            if (this.options.onInsertedSemicolon) {
                this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
            }
            return true;
        }
    };
    // Consume a semicolon, or, failing that, see if we are allowed to
    // pretend that there is a semicolon at this position.
    pp$9.semicolon = function() {
        if (!this.eat(types$1.semi) && !this.insertSemicolon()) {
            this.unexpected();
        }
    };
    pp$9.afterTrailingComma = function(tokType, notNext) {
        if (this.type === tokType) {
            if (this.options.onTrailingComma) {
                this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
            }
            if (!notNext) {
                this.next();
            }
            return true;
        }
    };
    // Expect a token of a given type. If found, consume it, otherwise,
    // raise an unexpected token error.
    pp$9.expect = function(type) {
        this.eat(type) || this.unexpected();
    };
    // Raise an unexpected token error.
    pp$9.unexpected = function(pos) {
        this.raise(pos != null ? pos : this.start, "Unexpected token");
    };
    var DestructuringErrors = function DestructuringErrors() {
        this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = this.doubleProto = -1;
    };
    pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
        if (!refDestructuringErrors) {
            return;
        }
        if (refDestructuringErrors.trailingComma > -1) {
            this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
        }
        var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
        if (parens > -1) {
            this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern");
        }
    };
    pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
        if (!refDestructuringErrors) {
            return false;
        }
        var shorthandAssign = refDestructuringErrors.shorthandAssign;
        var doubleProto = refDestructuringErrors.doubleProto;
        if (!andThrow) {
            return shorthandAssign >= 0 || doubleProto >= 0;
        }
        if (shorthandAssign >= 0) {
            this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns");
        }
        if (doubleProto >= 0) {
            this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property");
        }
    };
    pp$9.checkYieldAwaitInDefaultParams = function() {
        if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos)) {
            this.raise(this.yieldPos, "Yield expression cannot be a default value");
        }
        if (this.awaitPos) {
            this.raise(this.awaitPos, "Await expression cannot be a default value");
        }
    };
    pp$9.isSimpleAssignTarget = function(expr) {
        if (expr.type === "ParenthesizedExpression") {
            return this.isSimpleAssignTarget(expr.expression);
        }
        return expr.type === "Identifier" || expr.type === "MemberExpression";
    };
    var pp$8 = Parser.prototype;
    // ### Statement parsing
    // Parse a program. Initializes the parser, reads any number of
    // statements, and wraps them in a Program node.  Optionally takes a
    // `program` argument.  If present, the statements will be appended
    // to its body instead of creating a new node.
    pp$8.parseTopLevel = function(node) {
        var exports1 = Object.create(null);
        if (!node.body) {
            node.body = [];
        }
        while(this.type !== types$1.eof){
            var stmt = this.parseStatement(null, true, exports1);
            node.body.push(stmt);
        }
        if (this.inModule) {
            for(var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1){
                var name = list[i];
                this.raiseRecoverable(this.undefinedExports[name].start, "Export '" + name + "' is not defined");
            }
        }
        this.adaptDirectivePrologue(node.body);
        this.next();
        node.sourceType = this.options.sourceType;
        return this.finishNode(node, "Program");
    };
    var loopLabel = {
        kind: "loop"
    }, switchLabel = {
        kind: "switch"
    };
    pp$8.isLet = function(context) {
        if (this.options.ecmaVersion < 6 || !this.isContextual("let")) {
            return false;
        }
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
        // For ambiguous cases, determine if a LexicalDeclaration (or only a
        // Statement) is allowed here. If context is not empty then only a Statement
        // is allowed. However, `let [` is an explicit negative lookahead for
        // ExpressionStatement, so special-case it first.
        if (nextCh === 91 || nextCh === 92) {
            return true;
        } // '[', '\'
        if (context) {
            return false;
        }
        if (nextCh === 123 || nextCh > 0xd7ff && nextCh < 0xdc00) {
            return true;
        } // '{', astral
        if (isIdentifierStart(nextCh, true)) {
            var pos = next + 1;
            while(isIdentifierChar(nextCh = this.input.charCodeAt(pos), true)){
                ++pos;
            }
            if (nextCh === 92 || nextCh > 0xd7ff && nextCh < 0xdc00) {
                return true;
            }
            var ident = this.input.slice(next, pos);
            if (!keywordRelationalOperator.test(ident)) {
                return true;
            }
        }
        return false;
    };
    // check 'async [no LineTerminator here] function'
    // - 'async /*foo*/ function' is OK.
    // - 'async /*\n*/ function' is invalid.
    pp$8.isAsyncFunction = function() {
        if (this.options.ecmaVersion < 8 || !this.isContextual("async")) {
            return false;
        }
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, after;
        return !lineBreak.test(this.input.slice(this.pos, next)) && this.input.slice(next, next + 8) === "function" && (next + 8 === this.input.length || !(isIdentifierChar(after = this.input.charCodeAt(next + 8)) || after > 0xd7ff && after < 0xdc00));
    };
    // Parse a single statement.
    //
    // If expecting a statement and finding a slash operator, parse a
    // regular expression literal. This is to handle cases like
    // `if (foo) /blah/.exec(foo)`, where looking at the previous token
    // does not help.
    pp$8.parseStatement = function(context, topLevel, exports1) {
        var starttype = this.type, node = this.startNode(), kind;
        if (this.isLet(context)) {
            starttype = types$1._var;
            kind = "let";
        }
        // Most types of statements are recognized by the keyword they
        // start with. Many are trivial to parse, some require a bit of
        // complexity.
        switch(starttype){
            case types$1._break:
            case types$1._continue:
                return this.parseBreakContinueStatement(node, starttype.keyword);
            case types$1._debugger:
                return this.parseDebuggerStatement(node);
            case types$1._do:
                return this.parseDoStatement(node);
            case types$1._for:
                return this.parseForStatement(node);
            case types$1._function:
                // Function as sole body of either an if statement or a labeled statement
                // works, but not when it is part of a labeled statement that is the sole
                // body of an if statement.
                if (context && (this.strict || context !== "if" && context !== "label") && this.options.ecmaVersion >= 6) {
                    this.unexpected();
                }
                return this.parseFunctionStatement(node, false, !context);
            case types$1._class:
                if (context) {
                    this.unexpected();
                }
                return this.parseClass(node, true);
            case types$1._if:
                return this.parseIfStatement(node);
            case types$1._return:
                return this.parseReturnStatement(node);
            case types$1._switch:
                return this.parseSwitchStatement(node);
            case types$1._throw:
                return this.parseThrowStatement(node);
            case types$1._try:
                return this.parseTryStatement(node);
            case types$1._const:
            case types$1._var:
                kind = kind || this.value;
                if (context && kind !== "var") {
                    this.unexpected();
                }
                return this.parseVarStatement(node, kind);
            case types$1._while:
                return this.parseWhileStatement(node);
            case types$1._with:
                return this.parseWithStatement(node);
            case types$1.braceL:
                return this.parseBlock(true, node);
            case types$1.semi:
                return this.parseEmptyStatement(node);
            case types$1._export:
            case types$1._import:
                if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
                    skipWhiteSpace.lastIndex = this.pos;
                    var skip = skipWhiteSpace.exec(this.input);
                    var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
                    if (nextCh === 40 || nextCh === 46) {
                        return this.parseExpressionStatement(node, this.parseExpression());
                    }
                }
                if (!this.options.allowImportExportEverywhere) {
                    if (!topLevel) {
                        this.raise(this.start, "'import' and 'export' may only appear at the top level");
                    }
                    if (!this.inModule) {
                        this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
                    }
                }
                return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports1);
            // If the statement does not start with a statement keyword or a
            // brace, it's an ExpressionStatement or LabeledStatement. We
            // simply start parsing an expression, and afterwards, if the
            // next token is a colon and the expression was a simple
            // Identifier node, we switch to interpreting it as a label.
            default:
                if (this.isAsyncFunction()) {
                    if (context) {
                        this.unexpected();
                    }
                    this.next();
                    return this.parseFunctionStatement(node, true, !context);
                }
                var maybeName = this.value, expr = this.parseExpression();
                if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon)) {
                    return this.parseLabeledStatement(node, maybeName, expr, context);
                } else {
                    return this.parseExpressionStatement(node, expr);
                }
        }
    };
    pp$8.parseBreakContinueStatement = function(node, keyword) {
        var isBreak = keyword === "break";
        this.next();
        if (this.eat(types$1.semi) || this.insertSemicolon()) {
            node.label = null;
        } else if (this.type !== types$1.name) {
            this.unexpected();
        } else {
            node.label = this.parseIdent();
            this.semicolon();
        }
        // Verify that there is an actual destination to break or
        // continue to.
        var i = 0;
        for(; i < this.labels.length; ++i){
            var lab = this.labels[i];
            if (node.label == null || lab.name === node.label.name) {
                if (lab.kind != null && (isBreak || lab.kind === "loop")) {
                    break;
                }
                if (node.label && isBreak) {
                    break;
                }
            }
        }
        if (i === this.labels.length) {
            this.raise(node.start, "Unsyntactic " + keyword);
        }
        return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
    };
    pp$8.parseDebuggerStatement = function(node) {
        this.next();
        this.semicolon();
        return this.finishNode(node, "DebuggerStatement");
    };
    pp$8.parseDoStatement = function(node) {
        this.next();
        this.labels.push(loopLabel);
        node.body = this.parseStatement("do");
        this.labels.pop();
        this.expect(types$1._while);
        node.test = this.parseParenExpression();
        if (this.options.ecmaVersion >= 6) {
            this.eat(types$1.semi);
        } else {
            this.semicolon();
        }
        return this.finishNode(node, "DoWhileStatement");
    };
    // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
    // loop is non-trivial. Basically, we have to parse the init `var`
    // statement or expression, disallowing the `in` operator (see
    // the second parameter to `parseExpression`), and then check
    // whether the next token is `in` or `of`. When there is no init
    // part (semicolon immediately after the opening parenthesis), it
    // is a regular `for` loop.
    pp$8.parseForStatement = function(node) {
        this.next();
        var awaitAt = this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await") ? this.lastTokStart : -1;
        this.labels.push(loopLabel);
        this.enterScope(0);
        this.expect(types$1.parenL);
        if (this.type === types$1.semi) {
            if (awaitAt > -1) {
                this.unexpected(awaitAt);
            }
            return this.parseFor(node, null);
        }
        var isLet = this.isLet();
        if (this.type === types$1._var || this.type === types$1._const || isLet) {
            var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
            this.next();
            this.parseVar(init$1, true, kind);
            this.finishNode(init$1, "VariableDeclaration");
            if ((this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && init$1.declarations.length === 1) {
                if (this.options.ecmaVersion >= 9) {
                    if (this.type === types$1._in) {
                        if (awaitAt > -1) {
                            this.unexpected(awaitAt);
                        }
                    } else {
                        node.await = awaitAt > -1;
                    }
                }
                return this.parseForIn(node, init$1);
            }
            if (awaitAt > -1) {
                this.unexpected(awaitAt);
            }
            return this.parseFor(node, init$1);
        }
        var startsWithLet = this.isContextual("let"), isForOf = false;
        var containsEsc = this.containsEsc;
        var refDestructuringErrors = new DestructuringErrors;
        var initPos = this.start;
        var init = awaitAt > -1 ? this.parseExprSubscripts(refDestructuringErrors, "await") : this.parseExpression(true, refDestructuringErrors);
        if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
            if (awaitAt > -1) {
                if (this.type === types$1._in) {
                    this.unexpected(awaitAt);
                }
                node.await = true;
            } else if (isForOf && this.options.ecmaVersion >= 8) {
                if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") {
                    this.unexpected();
                } else if (this.options.ecmaVersion >= 9) {
                    node.await = false;
                }
            }
            if (startsWithLet && isForOf) {
                this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'.");
            }
            this.toAssignable(init, false, refDestructuringErrors);
            this.checkLValPattern(init);
            return this.parseForIn(node, init);
        } else {
            this.checkExpressionErrors(refDestructuringErrors, true);
        }
        if (awaitAt > -1) {
            this.unexpected(awaitAt);
        }
        return this.parseFor(node, init);
    };
    pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
        this.next();
        return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync);
    };
    pp$8.parseIfStatement = function(node) {
        this.next();
        node.test = this.parseParenExpression();
        // allow function declarations in branches, but only in non-strict mode
        node.consequent = this.parseStatement("if");
        node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
        return this.finishNode(node, "IfStatement");
    };
    pp$8.parseReturnStatement = function(node) {
        if (!this.inFunction && !this.options.allowReturnOutsideFunction) {
            this.raise(this.start, "'return' outside of function");
        }
        this.next();
        // In `return` (and `break`/`continue`), the keywords with
        // optional arguments, we eagerly look for a semicolon or the
        // possibility to insert one.
        if (this.eat(types$1.semi) || this.insertSemicolon()) {
            node.argument = null;
        } else {
            node.argument = this.parseExpression();
            this.semicolon();
        }
        return this.finishNode(node, "ReturnStatement");
    };
    pp$8.parseSwitchStatement = function(node) {
        this.next();
        node.discriminant = this.parseParenExpression();
        node.cases = [];
        this.expect(types$1.braceL);
        this.labels.push(switchLabel);
        this.enterScope(0);
        // Statements under must be grouped (by label) in SwitchCase
        // nodes. `cur` is used to keep the node that we are currently
        // adding statements to.
        var cur;
        for(var sawDefault = false; this.type !== types$1.braceR;){
            if (this.type === types$1._case || this.type === types$1._default) {
                var isCase = this.type === types$1._case;
                if (cur) {
                    this.finishNode(cur, "SwitchCase");
                }
                node.cases.push(cur = this.startNode());
                cur.consequent = [];
                this.next();
                if (isCase) {
                    cur.test = this.parseExpression();
                } else {
                    if (sawDefault) {
                        this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
                    }
                    sawDefault = true;
                    cur.test = null;
                }
                this.expect(types$1.colon);
            } else {
                if (!cur) {
                    this.unexpected();
                }
                cur.consequent.push(this.parseStatement(null));
            }
        }
        this.exitScope();
        if (cur) {
            this.finishNode(cur, "SwitchCase");
        }
        this.next(); // Closing brace
        this.labels.pop();
        return this.finishNode(node, "SwitchStatement");
    };
    pp$8.parseThrowStatement = function(node) {
        this.next();
        if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) {
            this.raise(this.lastTokEnd, "Illegal newline after throw");
        }
        node.argument = this.parseExpression();
        this.semicolon();
        return this.finishNode(node, "ThrowStatement");
    };
    // Reused empty array added for node fields that are always empty.
    var empty$1 = [];
    pp$8.parseCatchClauseParam = function() {
        var param = this.parseBindingAtom();
        var simple = param.type === "Identifier";
        this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
        this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
        this.expect(types$1.parenR);
        return param;
    };
    pp$8.parseTryStatement = function(node) {
        this.next();
        node.block = this.parseBlock();
        node.handler = null;
        if (this.type === types$1._catch) {
            var clause = this.startNode();
            this.next();
            if (this.eat(types$1.parenL)) {
                clause.param = this.parseCatchClauseParam();
            } else {
                if (this.options.ecmaVersion < 10) {
                    this.unexpected();
                }
                clause.param = null;
                this.enterScope(0);
            }
            clause.body = this.parseBlock(false);
            this.exitScope();
            node.handler = this.finishNode(clause, "CatchClause");
        }
        node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
        if (!node.handler && !node.finalizer) {
            this.raise(node.start, "Missing catch or finally clause");
        }
        return this.finishNode(node, "TryStatement");
    };
    pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
        this.next();
        this.parseVar(node, false, kind, allowMissingInitializer);
        this.semicolon();
        return this.finishNode(node, "VariableDeclaration");
    };
    pp$8.parseWhileStatement = function(node) {
        this.next();
        node.test = this.parseParenExpression();
        this.labels.push(loopLabel);
        node.body = this.parseStatement("while");
        this.labels.pop();
        return this.finishNode(node, "WhileStatement");
    };
    pp$8.parseWithStatement = function(node) {
        if (this.strict) {
            this.raise(this.start, "'with' in strict mode");
        }
        this.next();
        node.object = this.parseParenExpression();
        node.body = this.parseStatement("with");
        return this.finishNode(node, "WithStatement");
    };
    pp$8.parseEmptyStatement = function(node) {
        this.next();
        return this.finishNode(node, "EmptyStatement");
    };
    pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
        for(var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1){
            var label = list[i$1];
            if (label.name === maybeName) {
                this.raise(expr.start, "Label '" + maybeName + "' is already declared");
            }
        }
        var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
        for(var i = this.labels.length - 1; i >= 0; i--){
            var label$1 = this.labels[i];
            if (label$1.statementStart === node.start) {
                // Update information about previous labels on this node
                label$1.statementStart = this.start;
                label$1.kind = kind;
            } else {
                break;
            }
        }
        this.labels.push({
            name: maybeName,
            kind: kind,
            statementStart: this.start
        });
        node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
        this.labels.pop();
        node.label = expr;
        return this.finishNode(node, "LabeledStatement");
    };
    pp$8.parseExpressionStatement = function(node, expr) {
        node.expression = expr;
        this.semicolon();
        return this.finishNode(node, "ExpressionStatement");
    };
    // Parse a semicolon-enclosed block of statements, handling `"use
    // strict"` declarations when `allowStrict` is true (used for
    // function bodies).
    pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
        if (createNewLexicalScope === void 0) createNewLexicalScope = true;
        if (node === void 0) node = this.startNode();
        node.body = [];
        this.expect(types$1.braceL);
        if (createNewLexicalScope) {
            this.enterScope(0);
        }
        while(this.type !== types$1.braceR){
            var stmt = this.parseStatement(null);
            node.body.push(stmt);
        }
        if (exitStrict) {
            this.strict = false;
        }
        this.next();
        if (createNewLexicalScope) {
            this.exitScope();
        }
        return this.finishNode(node, "BlockStatement");
    };
    // Parse a regular `for` loop. The disambiguation code in
    // `parseStatement` will already have parsed the init statement or
    // expression.
    pp$8.parseFor = function(node, init) {
        node.init = init;
        this.expect(types$1.semi);
        node.test = this.type === types$1.semi ? null : this.parseExpression();
        this.expect(types$1.semi);
        node.update = this.type === types$1.parenR ? null : this.parseExpression();
        this.expect(types$1.parenR);
        node.body = this.parseStatement("for");
        this.exitScope();
        this.labels.pop();
        return this.finishNode(node, "ForStatement");
    };
    // Parse a `for`/`in` and `for`/`of` loop, which are almost
    // same from parser's perspective.
    pp$8.parseForIn = function(node, init) {
        var isForIn = this.type === types$1._in;
        this.next();
        if (init.type === "VariableDeclaration" && init.declarations[0].init != null && (!isForIn || this.options.ecmaVersion < 8 || this.strict || init.kind !== "var" || init.declarations[0].id.type !== "Identifier")) {
            this.raise(init.start, (isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer");
        }
        node.left = init;
        node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
        this.expect(types$1.parenR);
        node.body = this.parseStatement("for");
        this.exitScope();
        this.labels.pop();
        return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement");
    };
    // Parse a list of variable declarations.
    pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
        node.declarations = [];
        node.kind = kind;
        for(;;){
            var decl = this.startNode();
            this.parseVarId(decl, kind);
            if (this.eat(types$1.eq)) {
                decl.init = this.parseMaybeAssign(isFor);
            } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
                this.unexpected();
            } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
                this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
            } else {
                decl.init = null;
            }
            node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
            if (!this.eat(types$1.comma)) {
                break;
            }
        }
        return node;
    };
    pp$8.parseVarId = function(decl, kind) {
        decl.id = this.parseBindingAtom();
        this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
    };
    var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;
    // Parse a function declaration or literal (depending on the
    // `statement & FUNC_STATEMENT`).
    // Remove `allowExpressionBody` for 7.0.0, as it is only called with false
    pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
        this.initFunction(node);
        if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
            if (this.type === types$1.star && statement & FUNC_HANGING_STATEMENT) {
                this.unexpected();
            }
            node.generator = this.eat(types$1.star);
        }
        if (this.options.ecmaVersion >= 8) {
            node.async = !!isAsync;
        }
        if (statement & FUNC_STATEMENT) {
            node.id = statement & FUNC_NULLABLE_ID && this.type !== types$1.name ? null : this.parseIdent();
            if (node.id && !(statement & FUNC_HANGING_STATEMENT)) // If it is a regular function declaration in sloppy mode, then it is
            // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
            // mode depends on properties of the current scope (see
            // treatFunctionsAsVar).
            {
                this.checkLValSimple(node.id, this.strict || node.generator || node.async ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION);
            }
        }
        var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
        this.yieldPos = 0;
        this.awaitPos = 0;
        this.awaitIdentPos = 0;
        this.enterScope(functionFlags(node.async, node.generator));
        if (!(statement & FUNC_STATEMENT)) {
            node.id = this.type === types$1.name ? this.parseIdent() : null;
        }
        this.parseFunctionParams(node);
        this.parseFunctionBody(node, allowExpressionBody, false, forInit);
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.finishNode(node, statement & FUNC_STATEMENT ? "FunctionDeclaration" : "FunctionExpression");
    };
    pp$8.parseFunctionParams = function(node) {
        this.expect(types$1.parenL);
        node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
        this.checkYieldAwaitInDefaultParams();
    };
    // Parse a class declaration or literal (depending on the
    // `isStatement` parameter).
    pp$8.parseClass = function(node, isStatement) {
        this.next();
        // ecma-262 14.6 Class Definitions
        // A class definition is always strict mode code.
        var oldStrict = this.strict;
        this.strict = true;
        this.parseClassId(node, isStatement);
        this.parseClassSuper(node);
        var privateNameMap = this.enterClassBody();
        var classBody = this.startNode();
        var hadConstructor = false;
        classBody.body = [];
        this.expect(types$1.braceL);
        while(this.type !== types$1.braceR){
            var element = this.parseClassElement(node.superClass !== null);
            if (element) {
                classBody.body.push(element);
                if (element.type === "MethodDefinition" && element.kind === "constructor") {
                    if (hadConstructor) {
                        this.raiseRecoverable(element.start, "Duplicate constructor in the same class");
                    }
                    hadConstructor = true;
                } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
                    this.raiseRecoverable(element.key.start, "Identifier '#" + element.key.name + "' has already been declared");
                }
            }
        }
        this.strict = oldStrict;
        this.next();
        node.body = this.finishNode(classBody, "ClassBody");
        this.exitClassBody();
        return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
    };
    pp$8.parseClassElement = function(constructorAllowsSuper) {
        if (this.eat(types$1.semi)) {
            return null;
        }
        var ecmaVersion = this.options.ecmaVersion;
        var node = this.startNode();
        var keyName = "";
        var isGenerator = false;
        var isAsync = false;
        var kind = "method";
        var isStatic = false;
        if (this.eatContextual("static")) {
            // Parse static init block
            if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
                this.parseClassStaticBlock(node);
                return node;
            }
            if (this.isClassElementNameStart() || this.type === types$1.star) {
                isStatic = true;
            } else {
                keyName = "static";
            }
        }
        node.static = isStatic;
        if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
            if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
                isAsync = true;
            } else {
                keyName = "async";
            }
        }
        if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) {
            isGenerator = true;
        }
        if (!keyName && !isAsync && !isGenerator) {
            var lastValue = this.value;
            if (this.eatContextual("get") || this.eatContextual("set")) {
                if (this.isClassElementNameStart()) {
                    kind = lastValue;
                } else {
                    keyName = lastValue;
                }
            }
        }
        // Parse element name
        if (keyName) {
            // 'async', 'get', 'set', or 'static' were not a keyword contextually.
            // The last token is any of those. Make it the element name.
            node.computed = false;
            node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
            node.key.name = keyName;
            this.finishNode(node.key, "Identifier");
        } else {
            this.parseClassElementName(node);
        }
        // Parse element value
        if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
            var isConstructor = !node.static && checkKeyName(node, "constructor");
            var allowsDirectSuper = isConstructor && constructorAllowsSuper;
            // Couldn't move this check into the 'parseClassMethod' method for backward compatibility.
            if (isConstructor && kind !== "method") {
                this.raise(node.key.start, "Constructor can't have get/set modifier");
            }
            node.kind = isConstructor ? "constructor" : kind;
            this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
        } else {
            this.parseClassField(node);
        }
        return node;
    };
    pp$8.isClassElementNameStart = function() {
        return this.type === types$1.name || this.type === types$1.privateId || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword;
    };
    pp$8.parseClassElementName = function(element) {
        if (this.type === types$1.privateId) {
            if (this.value === "constructor") {
                this.raise(this.start, "Classes can't have an element named '#constructor'");
            }
            element.computed = false;
            element.key = this.parsePrivateIdent();
        } else {
            this.parsePropertyName(element);
        }
    };
    pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
        // Check key and flags
        var key = method.key;
        if (method.kind === "constructor") {
            if (isGenerator) {
                this.raise(key.start, "Constructor can't be a generator");
            }
            if (isAsync) {
                this.raise(key.start, "Constructor can't be an async method");
            }
        } else if (method.static && checkKeyName(method, "prototype")) {
            this.raise(key.start, "Classes may not have a static property named prototype");
        }
        // Parse value
        var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
        // Check value
        if (method.kind === "get" && value.params.length !== 0) {
            this.raiseRecoverable(value.start, "getter should have no params");
        }
        if (method.kind === "set" && value.params.length !== 1) {
            this.raiseRecoverable(value.start, "setter should have exactly one param");
        }
        if (method.kind === "set" && value.params[0].type === "RestElement") {
            this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params");
        }
        return this.finishNode(method, "MethodDefinition");
    };
    pp$8.parseClassField = function(field) {
        if (checkKeyName(field, "constructor")) {
            this.raise(field.key.start, "Classes can't have a field named 'constructor'");
        } else if (field.static && checkKeyName(field, "prototype")) {
            this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
        }
        if (this.eat(types$1.eq)) {
            // To raise SyntaxError if 'arguments' exists in the initializer.
            var scope = this.currentThisScope();
            var inClassFieldInit = scope.inClassFieldInit;
            scope.inClassFieldInit = true;
            field.value = this.parseMaybeAssign();
            scope.inClassFieldInit = inClassFieldInit;
        } else {
            field.value = null;
        }
        this.semicolon();
        return this.finishNode(field, "PropertyDefinition");
    };
    pp$8.parseClassStaticBlock = function(node) {
        node.body = [];
        var oldLabels = this.labels;
        this.labels = [];
        this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
        while(this.type !== types$1.braceR){
            var stmt = this.parseStatement(null);
            node.body.push(stmt);
        }
        this.next();
        this.exitScope();
        this.labels = oldLabels;
        return this.finishNode(node, "StaticBlock");
    };
    pp$8.parseClassId = function(node, isStatement) {
        if (this.type === types$1.name) {
            node.id = this.parseIdent();
            if (isStatement) {
                this.checkLValSimple(node.id, BIND_LEXICAL, false);
            }
        } else {
            if (isStatement === true) {
                this.unexpected();
            }
            node.id = null;
        }
    };
    pp$8.parseClassSuper = function(node) {
        node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
    };
    pp$8.enterClassBody = function() {
        var element = {
            declared: Object.create(null),
            used: []
        };
        this.privateNameStack.push(element);
        return element.declared;
    };
    pp$8.exitClassBody = function() {
        var ref = this.privateNameStack.pop();
        var declared = ref.declared;
        var used = ref.used;
        if (!this.options.checkPrivateFields) {
            return;
        }
        var len = this.privateNameStack.length;
        var parent = len === 0 ? null : this.privateNameStack[len - 1];
        for(var i = 0; i < used.length; ++i){
            var id = used[i];
            if (!hasOwn(declared, id.name)) {
                if (parent) {
                    parent.used.push(id);
                } else {
                    this.raiseRecoverable(id.start, "Private field '#" + id.name + "' must be declared in an enclosing class");
                }
            }
        }
    };
    function isPrivateNameConflicted(privateNameMap, element) {
        var name = element.key.name;
        var curr = privateNameMap[name];
        var next = "true";
        if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
            next = (element.static ? "s" : "i") + element.kind;
        }
        // `class { get #a(){}; static set #a(_){} }` is also conflict.
        if (curr === "iget" && next === "iset" || curr === "iset" && next === "iget" || curr === "sget" && next === "sset" || curr === "sset" && next === "sget") {
            privateNameMap[name] = "true";
            return false;
        } else if (!curr) {
            privateNameMap[name] = next;
            return false;
        } else {
            return true;
        }
    }
    function checkKeyName(node, name) {
        var computed = node.computed;
        var key = node.key;
        return !computed && (key.type === "Identifier" && key.name === name || key.type === "Literal" && key.value === name);
    }
    // Parses module export declaration.
    pp$8.parseExportAllDeclaration = function(node, exports1) {
        if (this.options.ecmaVersion >= 11) {
            if (this.eatContextual("as")) {
                node.exported = this.parseModuleExportName();
                this.checkExport(exports1, node.exported, this.lastTokStart);
            } else {
                node.exported = null;
            }
        }
        this.expectContextual("from");
        if (this.type !== types$1.string) {
            this.unexpected();
        }
        node.source = this.parseExprAtom();
        this.semicolon();
        return this.finishNode(node, "ExportAllDeclaration");
    };
    pp$8.parseExport = function(node, exports1) {
        this.next();
        // export * from '...'
        if (this.eat(types$1.star)) {
            return this.parseExportAllDeclaration(node, exports1);
        }
        if (this.eat(types$1._default)) {
            this.checkExport(exports1, "default", this.lastTokStart);
            node.declaration = this.parseExportDefaultDeclaration();
            return this.finishNode(node, "ExportDefaultDeclaration");
        }
        // export var|const|let|function|class ...
        if (this.shouldParseExportStatement()) {
            node.declaration = this.parseExportDeclaration(node);
            if (node.declaration.type === "VariableDeclaration") {
                this.checkVariableExport(exports1, node.declaration.declarations);
            } else {
                this.checkExport(exports1, node.declaration.id, node.declaration.id.start);
            }
            node.specifiers = [];
            node.source = null;
        } else {
            node.declaration = null;
            node.specifiers = this.parseExportSpecifiers(exports1);
            if (this.eatContextual("from")) {
                if (this.type !== types$1.string) {
                    this.unexpected();
                }
                node.source = this.parseExprAtom();
            } else {
                for(var i = 0, list = node.specifiers; i < list.length; i += 1){
                    // check for keywords used as local names
                    var spec = list[i];
                    this.checkUnreserved(spec.local);
                    // check if export is defined
                    this.checkLocalExport(spec.local);
                    if (spec.local.type === "Literal") {
                        this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
                    }
                }
                node.source = null;
            }
            this.semicolon();
        }
        return this.finishNode(node, "ExportNamedDeclaration");
    };
    pp$8.parseExportDeclaration = function(node) {
        return this.parseStatement(null);
    };
    pp$8.parseExportDefaultDeclaration = function() {
        var isAsync;
        if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
            var fNode = this.startNode();
            this.next();
            if (isAsync) {
                this.next();
            }
            return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
        } else if (this.type === types$1._class) {
            var cNode = this.startNode();
            return this.parseClass(cNode, "nullableID");
        } else {
            var declaration = this.parseMaybeAssign();
            this.semicolon();
            return declaration;
        }
    };
    pp$8.checkExport = function(exports1, name, pos) {
        if (!exports1) {
            return;
        }
        if (typeof name !== "string") {
            name = name.type === "Identifier" ? name.name : name.value;
        }
        if (hasOwn(exports1, name)) {
            this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
        }
        exports1[name] = true;
    };
    pp$8.checkPatternExport = function(exports1, pat) {
        var type = pat.type;
        if (type === "Identifier") {
            this.checkExport(exports1, pat, pat.start);
        } else if (type === "ObjectPattern") {
            for(var i = 0, list = pat.properties; i < list.length; i += 1){
                var prop = list[i];
                this.checkPatternExport(exports1, prop);
            }
        } else if (type === "ArrayPattern") {
            for(var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1){
                var elt = list$1[i$1];
                if (elt) {
                    this.checkPatternExport(exports1, elt);
                }
            }
        } else if (type === "Property") {
            this.checkPatternExport(exports1, pat.value);
        } else if (type === "AssignmentPattern") {
            this.checkPatternExport(exports1, pat.left);
        } else if (type === "RestElement") {
            this.checkPatternExport(exports1, pat.argument);
        }
    };
    pp$8.checkVariableExport = function(exports1, decls) {
        if (!exports1) {
            return;
        }
        for(var i = 0, list = decls; i < list.length; i += 1){
            var decl = list[i];
            this.checkPatternExport(exports1, decl.id);
        }
    };
    pp$8.shouldParseExportStatement = function() {
        return this.type.keyword === "var" || this.type.keyword === "const" || this.type.keyword === "class" || this.type.keyword === "function" || this.isLet() || this.isAsyncFunction();
    };
    // Parses a comma-separated list of module exports.
    pp$8.parseExportSpecifier = function(exports1) {
        var node = this.startNode();
        node.local = this.parseModuleExportName();
        node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
        this.checkExport(exports1, node.exported, node.exported.start);
        return this.finishNode(node, "ExportSpecifier");
    };
    pp$8.parseExportSpecifiers = function(exports1) {
        var nodes = [], first = true;
        // export { x, y as z } [from '...']
        this.expect(types$1.braceL);
        while(!this.eat(types$1.braceR)){
            if (!first) {
                this.expect(types$1.comma);
                if (this.afterTrailingComma(types$1.braceR)) {
                    break;
                }
            } else {
                first = false;
            }
            nodes.push(this.parseExportSpecifier(exports1));
        }
        return nodes;
    };
    // Parses import declaration.
    pp$8.parseImport = function(node) {
        this.next();
        // import '...'
        if (this.type === types$1.string) {
            node.specifiers = empty$1;
            node.source = this.parseExprAtom();
        } else {
            node.specifiers = this.parseImportSpecifiers();
            this.expectContextual("from");
            node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
        }
        this.semicolon();
        return this.finishNode(node, "ImportDeclaration");
    };
    // Parses a comma-separated list of module imports.
    pp$8.parseImportSpecifier = function() {
        var node = this.startNode();
        node.imported = this.parseModuleExportName();
        if (this.eatContextual("as")) {
            node.local = this.parseIdent();
        } else {
            this.checkUnreserved(node.imported);
            node.local = node.imported;
        }
        this.checkLValSimple(node.local, BIND_LEXICAL);
        return this.finishNode(node, "ImportSpecifier");
    };
    pp$8.parseImportDefaultSpecifier = function() {
        // import defaultObj, { x, y as z } from '...'
        var node = this.startNode();
        node.local = this.parseIdent();
        this.checkLValSimple(node.local, BIND_LEXICAL);
        return this.finishNode(node, "ImportDefaultSpecifier");
    };
    pp$8.parseImportNamespaceSpecifier = function() {
        var node = this.startNode();
        this.next();
        this.expectContextual("as");
        node.local = this.parseIdent();
        this.checkLValSimple(node.local, BIND_LEXICAL);
        return this.finishNode(node, "ImportNamespaceSpecifier");
    };
    pp$8.parseImportSpecifiers = function() {
        var nodes = [], first = true;
        if (this.type === types$1.name) {
            nodes.push(this.parseImportDefaultSpecifier());
            if (!this.eat(types$1.comma)) {
                return nodes;
            }
        }
        if (this.type === types$1.star) {
            nodes.push(this.parseImportNamespaceSpecifier());
            return nodes;
        }
        this.expect(types$1.braceL);
        while(!this.eat(types$1.braceR)){
            if (!first) {
                this.expect(types$1.comma);
                if (this.afterTrailingComma(types$1.braceR)) {
                    break;
                }
            } else {
                first = false;
            }
            nodes.push(this.parseImportSpecifier());
        }
        return nodes;
    };
    pp$8.parseModuleExportName = function() {
        if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
            var stringLiteral = this.parseLiteral(this.value);
            if (loneSurrogate.test(stringLiteral.value)) {
                this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
            }
            return stringLiteral;
        }
        return this.parseIdent(true);
    };
    // Set `ExpressionStatement#directive` property for directive prologues.
    pp$8.adaptDirectivePrologue = function(statements) {
        for(var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i){
            statements[i].directive = statements[i].expression.raw.slice(1, -1);
        }
    };
    pp$8.isDirectiveCandidate = function(statement) {
        return this.options.ecmaVersion >= 5 && statement.type === "ExpressionStatement" && statement.expression.type === "Literal" && typeof statement.expression.value === "string" && // Reject parenthesized strings.
        (this.input[statement.start] === "\"" || this.input[statement.start] === "'");
    };
    var pp$7 = Parser.prototype;
    // Convert existing expression atom to assignable pattern
    // if possible.
    pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
        if (this.options.ecmaVersion >= 6 && node) {
            switch(node.type){
                case "Identifier":
                    if (this.inAsync && node.name === "await") {
                        this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
                    }
                    break;
                case "ObjectPattern":
                case "ArrayPattern":
                case "AssignmentPattern":
                case "RestElement":
                    break;
                case "ObjectExpression":
                    node.type = "ObjectPattern";
                    if (refDestructuringErrors) {
                        this.checkPatternErrors(refDestructuringErrors, true);
                    }
                    for(var i = 0, list = node.properties; i < list.length; i += 1){
                        var prop = list[i];
                        this.toAssignable(prop, isBinding);
                        // Early error:
                        //   AssignmentRestProperty[Yield, Await] :
                        //     `...` DestructuringAssignmentTarget[Yield, Await]
                        //
                        //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
                        if (prop.type === "RestElement" && (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")) {
                            this.raise(prop.argument.start, "Unexpected token");
                        }
                    }
                    break;
                case "Property":
                    // AssignmentProperty has type === "Property"
                    if (node.kind !== "init") {
                        this.raise(node.key.start, "Object pattern can't contain getter or setter");
                    }
                    this.toAssignable(node.value, isBinding);
                    break;
                case "ArrayExpression":
                    node.type = "ArrayPattern";
                    if (refDestructuringErrors) {
                        this.checkPatternErrors(refDestructuringErrors, true);
                    }
                    this.toAssignableList(node.elements, isBinding);
                    break;
                case "SpreadElement":
                    node.type = "RestElement";
                    this.toAssignable(node.argument, isBinding);
                    if (node.argument.type === "AssignmentPattern") {
                        this.raise(node.argument.start, "Rest elements cannot have a default value");
                    }
                    break;
                case "AssignmentExpression":
                    if (node.operator !== "=") {
                        this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
                    }
                    node.type = "AssignmentPattern";
                    delete node.operator;
                    this.toAssignable(node.left, isBinding);
                    break;
                case "ParenthesizedExpression":
                    this.toAssignable(node.expression, isBinding, refDestructuringErrors);
                    break;
                case "ChainExpression":
                    this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
                    break;
                case "MemberExpression":
                    if (!isBinding) {
                        break;
                    }
                default:
                    this.raise(node.start, "Assigning to rvalue");
            }
        } else if (refDestructuringErrors) {
            this.checkPatternErrors(refDestructuringErrors, true);
        }
        return node;
    };
    // Convert list of expression atoms to binding list.
    pp$7.toAssignableList = function(exprList, isBinding) {
        var end = exprList.length;
        for(var i = 0; i < end; i++){
            var elt = exprList[i];
            if (elt) {
                this.toAssignable(elt, isBinding);
            }
        }
        if (end) {
            var last = exprList[end - 1];
            if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier") {
                this.unexpected(last.argument.start);
            }
        }
        return exprList;
    };
    // Parses spread element.
    pp$7.parseSpread = function(refDestructuringErrors) {
        var node = this.startNode();
        this.next();
        node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
        return this.finishNode(node, "SpreadElement");
    };
    pp$7.parseRestBinding = function() {
        var node = this.startNode();
        this.next();
        // RestElement inside of a function parameter must be an identifier
        if (this.options.ecmaVersion === 6 && this.type !== types$1.name) {
            this.unexpected();
        }
        node.argument = this.parseBindingAtom();
        return this.finishNode(node, "RestElement");
    };
    // Parses lvalue (assignable) atom.
    pp$7.parseBindingAtom = function() {
        if (this.options.ecmaVersion >= 6) {
            switch(this.type){
                case types$1.bracketL:
                    var node = this.startNode();
                    this.next();
                    node.elements = this.parseBindingList(types$1.bracketR, true, true);
                    return this.finishNode(node, "ArrayPattern");
                case types$1.braceL:
                    return this.parseObj(true);
            }
        }
        return this.parseIdent();
    };
    pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
        var elts = [], first = true;
        while(!this.eat(close)){
            if (first) {
                first = false;
            } else {
                this.expect(types$1.comma);
            }
            if (allowEmpty && this.type === types$1.comma) {
                elts.push(null);
            } else if (allowTrailingComma && this.afterTrailingComma(close)) {
                break;
            } else if (this.type === types$1.ellipsis) {
                var rest = this.parseRestBinding();
                this.parseBindingListItem(rest);
                elts.push(rest);
                if (this.type === types$1.comma) {
                    this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
                }
                this.expect(close);
                break;
            } else {
                elts.push(this.parseAssignableListItem(allowModifiers));
            }
        }
        return elts;
    };
    pp$7.parseAssignableListItem = function(allowModifiers) {
        var elem = this.parseMaybeDefault(this.start, this.startLoc);
        this.parseBindingListItem(elem);
        return elem;
    };
    pp$7.parseBindingListItem = function(param) {
        return param;
    };
    // Parses assignment pattern around given atom if possible.
    pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
        left = left || this.parseBindingAtom();
        if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) {
            return left;
        }
        var node = this.startNodeAt(startPos, startLoc);
        node.left = left;
        node.right = this.parseMaybeAssign();
        return this.finishNode(node, "AssignmentPattern");
    };
    // The following three functions all verify that a node is an lvalue —
    // something that can be bound, or assigned to. In order to do so, they perform
    // a variety of checks:
    //
    // - Check that none of the bound/assigned-to identifiers are reserved words.
    // - Record name declarations for bindings in the appropriate scope.
    // - Check duplicate argument names, if checkClashes is set.
    //
    // If a complex binding pattern is encountered (e.g., object and array
    // destructuring), the entire pattern is recursively checked.
    //
    // There are three versions of checkLVal*() appropriate for different
    // circumstances:
    //
    // - checkLValSimple() shall be used if the syntactic construct supports
    //   nothing other than identifiers and member expressions. Parenthesized
    //   expressions are also correctly handled. This is generally appropriate for
    //   constructs for which the spec says
    //
    //   > It is a Syntax Error if AssignmentTargetType of [the production] is not
    //   > simple.
    //
    //   It is also appropriate for checking if an identifier is valid and not
    //   defined elsewhere, like import declarations or function/class identifiers.
    //
    //   Examples where this is used include:
    //     a += …;
    //     import a from '…';
    //   where a is the node to be checked.
    //
    // - checkLValPattern() shall be used if the syntactic construct supports
    //   anything checkLValSimple() supports, as well as object and array
    //   destructuring patterns. This is generally appropriate for constructs for
    //   which the spec says
    //
    //   > It is a Syntax Error if [the production] is neither an ObjectLiteral nor
    //   > an ArrayLiteral and AssignmentTargetType of [the production] is not
    //   > simple.
    //
    //   Examples where this is used include:
    //     (a = …);
    //     const a = …;
    //     try { … } catch (a) { … }
    //   where a is the node to be checked.
    //
    // - checkLValInnerPattern() shall be used if the syntactic construct supports
    //   anything checkLValPattern() supports, as well as default assignment
    //   patterns, rest elements, and other constructs that may appear within an
    //   object or array destructuring pattern.
    //
    //   As a special case, function parameters also use checkLValInnerPattern(),
    //   as they also support defaults and rest constructs.
    //
    // These functions deliberately support both assignment and binding constructs,
    // as the logic for both is exceedingly similar. If the node is the target of
    // an assignment, then bindingType should be set to BIND_NONE. Otherwise, it
    // should be set to the appropriate BIND_* constant, like BIND_VAR or
    // BIND_LEXICAL.
    //
    // If the function is called with a non-BIND_NONE bindingType, then
    // additionally a checkClashes object may be specified to allow checking for
    // duplicate argument names. checkClashes is ignored if the provided construct
    // is an assignment (i.e., bindingType is BIND_NONE).
    pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
        if (bindingType === void 0) bindingType = BIND_NONE;
        var isBind = bindingType !== BIND_NONE;
        switch(expr.type){
            case "Identifier":
                if (this.strict && this.reservedWordsStrictBind.test(expr.name)) {
                    this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
                }
                if (isBind) {
                    if (bindingType === BIND_LEXICAL && expr.name === "let") {
                        this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name");
                    }
                    if (checkClashes) {
                        if (hasOwn(checkClashes, expr.name)) {
                            this.raiseRecoverable(expr.start, "Argument name clash");
                        }
                        checkClashes[expr.name] = true;
                    }
                    if (bindingType !== BIND_OUTSIDE) {
                        this.declareName(expr.name, bindingType, expr.start);
                    }
                }
                break;
            case "ChainExpression":
                this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
                break;
            case "MemberExpression":
                if (isBind) {
                    this.raiseRecoverable(expr.start, "Binding member expression");
                }
                break;
            case "ParenthesizedExpression":
                if (isBind) {
                    this.raiseRecoverable(expr.start, "Binding parenthesized expression");
                }
                return this.checkLValSimple(expr.expression, bindingType, checkClashes);
            default:
                this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
        }
    };
    pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
        if (bindingType === void 0) bindingType = BIND_NONE;
        switch(expr.type){
            case "ObjectPattern":
                for(var i = 0, list = expr.properties; i < list.length; i += 1){
                    var prop = list[i];
                    this.checkLValInnerPattern(prop, bindingType, checkClashes);
                }
                break;
            case "ArrayPattern":
                for(var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1){
                    var elem = list$1[i$1];
                    if (elem) {
                        this.checkLValInnerPattern(elem, bindingType, checkClashes);
                    }
                }
                break;
            default:
                this.checkLValSimple(expr, bindingType, checkClashes);
        }
    };
    pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
        if (bindingType === void 0) bindingType = BIND_NONE;
        switch(expr.type){
            case "Property":
                // AssignmentProperty has type === "Property"
                this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
                break;
            case "AssignmentPattern":
                this.checkLValPattern(expr.left, bindingType, checkClashes);
                break;
            case "RestElement":
                this.checkLValPattern(expr.argument, bindingType, checkClashes);
                break;
            default:
                this.checkLValPattern(expr, bindingType, checkClashes);
        }
    };
    // The algorithm used to determine whether a regexp can appear at a
    // given point in the program is loosely based on sweet.js' approach.
    // See https://github.com/mozilla/sweet.js/wiki/design
    var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
        this.token = token;
        this.isExpr = !!isExpr;
        this.preserveSpace = !!preserveSpace;
        this.override = override;
        this.generator = !!generator;
    };
    var types = {
        b_stat: new TokContext("{", false),
        b_expr: new TokContext("{", true),
        b_tmpl: new TokContext("${", false),
        p_stat: new TokContext("(", false),
        p_expr: new TokContext("(", true),
        q_tmpl: new TokContext("`", true, true, function(p) {
            return p.tryReadTemplateToken();
        }),
        f_stat: new TokContext("function", false),
        f_expr: new TokContext("function", true),
        f_expr_gen: new TokContext("function", true, false, null, true),
        f_gen: new TokContext("function", false, false, null, true)
    };
    var pp$6 = Parser.prototype;
    pp$6.initialContext = function() {
        return [
            types.b_stat
        ];
    };
    pp$6.curContext = function() {
        return this.context[this.context.length - 1];
    };
    pp$6.braceIsBlock = function(prevType) {
        var parent = this.curContext();
        if (parent === types.f_expr || parent === types.f_stat) {
            return true;
        }
        if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr)) {
            return !parent.isExpr;
        }
        // The check for `tt.name && exprAllowed` detects whether we are
        // after a `yield` or `of` construct. See the `updateContext` for
        // `tt.name`.
        if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed) {
            return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
        }
        if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow) {
            return true;
        }
        if (prevType === types$1.braceL) {
            return parent === types.b_stat;
        }
        if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name) {
            return false;
        }
        return !this.exprAllowed;
    };
    pp$6.inGeneratorContext = function() {
        for(var i = this.context.length - 1; i >= 1; i--){
            var context = this.context[i];
            if (context.token === "function") {
                return context.generator;
            }
        }
        return false;
    };
    pp$6.updateContext = function(prevType) {
        var update, type = this.type;
        if (type.keyword && prevType === types$1.dot) {
            this.exprAllowed = false;
        } else if (update = type.updateContext) {
            update.call(this, prevType);
        } else {
            this.exprAllowed = type.beforeExpr;
        }
    };
    // Used to handle edge cases when token context could not be inferred correctly during tokenization phase
    pp$6.overrideContext = function(tokenCtx) {
        if (this.curContext() !== tokenCtx) {
            this.context[this.context.length - 1] = tokenCtx;
        }
    };
    // Token-specific context update code
    types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
        if (this.context.length === 1) {
            this.exprAllowed = true;
            return;
        }
        var out = this.context.pop();
        if (out === types.b_stat && this.curContext().token === "function") {
            out = this.context.pop();
        }
        this.exprAllowed = !out.isExpr;
    };
    types$1.braceL.updateContext = function(prevType) {
        this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
        this.exprAllowed = true;
    };
    types$1.dollarBraceL.updateContext = function() {
        this.context.push(types.b_tmpl);
        this.exprAllowed = true;
    };
    types$1.parenL.updateContext = function(prevType) {
        var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
        this.context.push(statementParens ? types.p_stat : types.p_expr);
        this.exprAllowed = true;
    };
    types$1.incDec.updateContext = function() {
    // tokExprAllowed stays unchanged
    };
    types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
        if (prevType.beforeExpr && prevType !== types$1._else && !(prevType === types$1.semi && this.curContext() !== types.p_stat) && !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) && !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat)) {
            this.context.push(types.f_expr);
        } else {
            this.context.push(types.f_stat);
        }
        this.exprAllowed = false;
    };
    types$1.colon.updateContext = function() {
        if (this.curContext().token === "function") {
            this.context.pop();
        }
        this.exprAllowed = true;
    };
    types$1.backQuote.updateContext = function() {
        if (this.curContext() === types.q_tmpl) {
            this.context.pop();
        } else {
            this.context.push(types.q_tmpl);
        }
        this.exprAllowed = false;
    };
    types$1.star.updateContext = function(prevType) {
        if (prevType === types$1._function) {
            var index = this.context.length - 1;
            if (this.context[index] === types.f_expr) {
                this.context[index] = types.f_expr_gen;
            } else {
                this.context[index] = types.f_gen;
            }
        }
        this.exprAllowed = true;
    };
    types$1.name.updateContext = function(prevType) {
        var allowed = false;
        if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
            if (this.value === "of" && !this.exprAllowed || this.value === "yield" && this.inGeneratorContext()) {
                allowed = true;
            }
        }
        this.exprAllowed = allowed;
    };
    // A recursive descent parser operates by defining functions for all
    // syntactic elements, and recursively calling those, each function
    // advancing the input stream and returning an AST node. Precedence
    // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
    // instead of `(!x)[1]` is handled by the fact that the parser
    // function that parses unary prefix operators is called first, and
    // in turn calls the function that parses `[]` subscripts — that
    // way, it'll receive the node for `x[1]` already parsed, and wraps
    // *that* in the unary operator node.
    //
    // Acorn uses an [operator precedence parser][opp] to handle binary
    // operator precedence, because it is much more compact than using
    // the technique outlined above, which uses different, nesting
    // functions to specify precedence, for all of the ten binary
    // precedence levels that JavaScript defines.
    //
    // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser
    var pp$5 = Parser.prototype;
    // Check if property name clashes with already added.
    // Object/class getters and setters are not allowed to clash —
    // either with each other or with an init property — and in
    // strict mode, init properties are also not allowed to be repeated.
    pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
        if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement") {
            return;
        }
        if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) {
            return;
        }
        var key = prop.key;
        var name;
        switch(key.type){
            case "Identifier":
                name = key.name;
                break;
            case "Literal":
                name = String(key.value);
                break;
            default:
                return;
        }
        var kind = prop.kind;
        if (this.options.ecmaVersion >= 6) {
            if (name === "__proto__" && kind === "init") {
                if (propHash.proto) {
                    if (refDestructuringErrors) {
                        if (refDestructuringErrors.doubleProto < 0) {
                            refDestructuringErrors.doubleProto = key.start;
                        }
                    } else {
                        this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
                    }
                }
                propHash.proto = true;
            }
            return;
        }
        name = "$" + name;
        var other = propHash[name];
        if (other) {
            var redefinition;
            if (kind === "init") {
                redefinition = this.strict && other.init || other.get || other.set;
            } else {
                redefinition = other.init || other[kind];
            }
            if (redefinition) {
                this.raiseRecoverable(key.start, "Redefinition of property");
            }
        } else {
            other = propHash[name] = {
                init: false,
                get: false,
                set: false
            };
        }
        other[kind] = true;
    };
    // ### Expression parsing
    // These nest, from the most general expression type at the top to
    // 'atomic', nondivisible expression types at the bottom. Most of
    // the functions will simply let the function(s) below them parse,
    // and, *if* the syntactic construct they handle is present, wrap
    // the AST node that the inner parser gave them in another node.
    // Parse a full expression. The optional arguments are used to
    // forbid the `in` operator (in for loops initalization expressions)
    // and provide reference for storing '=' operator inside shorthand
    // property assignment in contexts where both object expression
    // and object pattern might appear (so it's possible to raise
    // delayed syntax error at correct position).
    pp$5.parseExpression = function(forInit, refDestructuringErrors) {
        var startPos = this.start, startLoc = this.startLoc;
        var expr = this.parseMaybeAssign(forInit, refDestructuringErrors);
        if (this.type === types$1.comma) {
            var node = this.startNodeAt(startPos, startLoc);
            node.expressions = [
                expr
            ];
            while(this.eat(types$1.comma)){
                node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors));
            }
            return this.finishNode(node, "SequenceExpression");
        }
        return expr;
    };
    // Parse an assignment expression. This includes applications of
    // operators like `+=`.
    pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
        if (this.isContextual("yield")) {
            if (this.inGenerator) {
                return this.parseYield(forInit);
            } else {
                this.exprAllowed = false;
            }
        }
        var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
        if (refDestructuringErrors) {
            oldParenAssign = refDestructuringErrors.parenthesizedAssign;
            oldTrailingComma = refDestructuringErrors.trailingComma;
            oldDoubleProto = refDestructuringErrors.doubleProto;
            refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
        } else {
            refDestructuringErrors = new DestructuringErrors;
            ownDestructuringErrors = true;
        }
        var startPos = this.start, startLoc = this.startLoc;
        if (this.type === types$1.parenL || this.type === types$1.name) {
            this.potentialArrowAt = this.start;
            this.potentialArrowInForAwait = forInit === "await";
        }
        var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
        if (afterLeftParse) {
            left = afterLeftParse.call(this, left, startPos, startLoc);
        }
        if (this.type.isAssign) {
            var node = this.startNodeAt(startPos, startLoc);
            node.operator = this.value;
            if (this.type === types$1.eq) {
                left = this.toAssignable(left, false, refDestructuringErrors);
            }
            if (!ownDestructuringErrors) {
                refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
            }
            if (refDestructuringErrors.shorthandAssign >= left.start) {
                refDestructuringErrors.shorthandAssign = -1;
            } // reset because shorthand default was used correctly
            if (this.type === types$1.eq) {
                this.checkLValPattern(left);
            } else {
                this.checkLValSimple(left);
            }
            node.left = left;
            this.next();
            node.right = this.parseMaybeAssign(forInit);
            if (oldDoubleProto > -1) {
                refDestructuringErrors.doubleProto = oldDoubleProto;
            }
            return this.finishNode(node, "AssignmentExpression");
        } else {
            if (ownDestructuringErrors) {
                this.checkExpressionErrors(refDestructuringErrors, true);
            }
        }
        if (oldParenAssign > -1) {
            refDestructuringErrors.parenthesizedAssign = oldParenAssign;
        }
        if (oldTrailingComma > -1) {
            refDestructuringErrors.trailingComma = oldTrailingComma;
        }
        return left;
    };
    // Parse a ternary conditional (`?:`) operator.
    pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
        var startPos = this.start, startLoc = this.startLoc;
        var expr = this.parseExprOps(forInit, refDestructuringErrors);
        if (this.checkExpressionErrors(refDestructuringErrors)) {
            return expr;
        }
        if (this.eat(types$1.question)) {
            var node = this.startNodeAt(startPos, startLoc);
            node.test = expr;
            node.consequent = this.parseMaybeAssign();
            this.expect(types$1.colon);
            node.alternate = this.parseMaybeAssign(forInit);
            return this.finishNode(node, "ConditionalExpression");
        }
        return expr;
    };
    // Start the precedence parser.
    pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
        var startPos = this.start, startLoc = this.startLoc;
        var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
        if (this.checkExpressionErrors(refDestructuringErrors)) {
            return expr;
        }
        return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit);
    };
    // Parse binary operators with the operator precedence parsing
    // algorithm. `left` is the left-hand side of the operator.
    // `minPrec` provides context that allows the function to stop and
    // defer further parser to one of its callers when it encounters an
    // operator that has a lower precedence than the set it is parsing.
    pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
        var prec = this.type.binop;
        if (prec != null && (!forInit || this.type !== types$1._in)) {
            if (prec > minPrec) {
                var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
                var coalesce = this.type === types$1.coalesce;
                if (coalesce) {
                    // Handle the precedence of `tt.coalesce` as equal to the range of logical expressions.
                    // In other words, `node.right` shouldn't contain logical expressions in order to check the mixed error.
                    prec = types$1.logicalAND.binop;
                }
                var op = this.value;
                this.next();
                var startPos = this.start, startLoc = this.startLoc;
                var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
                var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
                if (logical && this.type === types$1.coalesce || coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND)) {
                    this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
                }
                return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit);
            }
        }
        return left;
    };
    pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
        if (right.type === "PrivateIdentifier") {
            this.raise(right.start, "Private identifier can only be left side of binary expression");
        }
        var node = this.startNodeAt(startPos, startLoc);
        node.left = left;
        node.operator = op;
        node.right = right;
        return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
    };
    // Parse unary operators, both prefix and postfix.
    pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
        var startPos = this.start, startLoc = this.startLoc, expr;
        if (this.isContextual("await") && this.canAwait) {
            expr = this.parseAwait(forInit);
            sawUnary = true;
        } else if (this.type.prefix) {
            var node = this.startNode(), update = this.type === types$1.incDec;
            node.operator = this.value;
            node.prefix = true;
            this.next();
            node.argument = this.parseMaybeUnary(null, true, update, forInit);
            this.checkExpressionErrors(refDestructuringErrors, true);
            if (update) {
                this.checkLValSimple(node.argument);
            } else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument)) {
                this.raiseRecoverable(node.start, "Deleting local variable in strict mode");
            } else if (node.operator === "delete" && isPrivateFieldAccess(node.argument)) {
                this.raiseRecoverable(node.start, "Private fields can not be deleted");
            } else {
                sawUnary = true;
            }
            expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
        } else if (!sawUnary && this.type === types$1.privateId) {
            if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) {
                this.unexpected();
            }
            expr = this.parsePrivateIdent();
            // only could be private fields in 'in', such as #x in obj
            if (this.type !== types$1._in) {
                this.unexpected();
            }
        } else {
            expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
            if (this.checkExpressionErrors(refDestructuringErrors)) {
                return expr;
            }
            while(this.type.postfix && !this.canInsertSemicolon()){
                var node$1 = this.startNodeAt(startPos, startLoc);
                node$1.operator = this.value;
                node$1.prefix = false;
                node$1.argument = expr;
                this.checkLValSimple(expr);
                this.next();
                expr = this.finishNode(node$1, "UpdateExpression");
            }
        }
        if (!incDec && this.eat(types$1.starstar)) {
            if (sawUnary) {
                this.unexpected(this.lastTokStart);
            } else {
                return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false);
            }
        } else {
            return expr;
        }
    };
    function isLocalVariableAccess(node) {
        return node.type === "Identifier" || node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression);
    }
    function isPrivateFieldAccess(node) {
        return node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" || node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) || node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression);
    }
    // Parse call, dot, and `[]`-subscript expressions.
    pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
        var startPos = this.start, startLoc = this.startLoc;
        var expr = this.parseExprAtom(refDestructuringErrors, forInit);
        if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")") {
            return expr;
        }
        var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
        if (refDestructuringErrors && result.type === "MemberExpression") {
            if (refDestructuringErrors.parenthesizedAssign >= result.start) {
                refDestructuringErrors.parenthesizedAssign = -1;
            }
            if (refDestructuringErrors.parenthesizedBind >= result.start) {
                refDestructuringErrors.parenthesizedBind = -1;
            }
            if (refDestructuringErrors.trailingComma >= result.start) {
                refDestructuringErrors.trailingComma = -1;
            }
        }
        return result;
    };
    pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
        var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" && this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 && this.potentialArrowAt === base.start;
        var optionalChained = false;
        while(true){
            var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);
            if (element.optional) {
                optionalChained = true;
            }
            if (element === base || element.type === "ArrowFunctionExpression") {
                if (optionalChained) {
                    var chainNode = this.startNodeAt(startPos, startLoc);
                    chainNode.expression = element;
                    element = this.finishNode(chainNode, "ChainExpression");
                }
                return element;
            }
            base = element;
        }
    };
    pp$5.shouldParseAsyncArrow = function() {
        return !this.canInsertSemicolon() && this.eat(types$1.arrow);
    };
    pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit);
    };
    pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
        var optionalSupported = this.options.ecmaVersion >= 11;
        var optional = optionalSupported && this.eat(types$1.questionDot);
        if (noCalls && optional) {
            this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions");
        }
        var computed = this.eat(types$1.bracketL);
        if (computed || optional && this.type !== types$1.parenL && this.type !== types$1.backQuote || this.eat(types$1.dot)) {
            var node = this.startNodeAt(startPos, startLoc);
            node.object = base;
            if (computed) {
                node.property = this.parseExpression();
                this.expect(types$1.bracketR);
            } else if (this.type === types$1.privateId && base.type !== "Super") {
                node.property = this.parsePrivateIdent();
            } else {
                node.property = this.parseIdent(this.options.allowReserved !== "never");
            }
            node.computed = !!computed;
            if (optionalSupported) {
                node.optional = optional;
            }
            base = this.finishNode(node, "MemberExpression");
        } else if (!noCalls && this.eat(types$1.parenL)) {
            var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
            this.yieldPos = 0;
            this.awaitPos = 0;
            this.awaitIdentPos = 0;
            var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
            if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
                this.checkPatternErrors(refDestructuringErrors, false);
                this.checkYieldAwaitInDefaultParams();
                if (this.awaitIdentPos > 0) {
                    this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function");
                }
                this.yieldPos = oldYieldPos;
                this.awaitPos = oldAwaitPos;
                this.awaitIdentPos = oldAwaitIdentPos;
                return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit);
            }
            this.checkExpressionErrors(refDestructuringErrors, true);
            this.yieldPos = oldYieldPos || this.yieldPos;
            this.awaitPos = oldAwaitPos || this.awaitPos;
            this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
            var node$1 = this.startNodeAt(startPos, startLoc);
            node$1.callee = base;
            node$1.arguments = exprList;
            if (optionalSupported) {
                node$1.optional = optional;
            }
            base = this.finishNode(node$1, "CallExpression");
        } else if (this.type === types$1.backQuote) {
            if (optional || optionalChained) {
                this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
            }
            var node$2 = this.startNodeAt(startPos, startLoc);
            node$2.tag = base;
            node$2.quasi = this.parseTemplate({
                isTagged: true
            });
            base = this.finishNode(node$2, "TaggedTemplateExpression");
        }
        return base;
    };
    // Parse an atomic expression — either a single token that is an
    // expression, an expression started by a keyword like `function` or
    // `new`, or an expression wrapped in punctuation like `()`, `[]`,
    // or `{}`.
    pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
        // If a division operator appears in an expression position, the
        // tokenizer got confused, and we force it to read a regexp instead.
        if (this.type === types$1.slash) {
            this.readRegexp();
        }
        var node, canBeArrow = this.potentialArrowAt === this.start;
        switch(this.type){
            case types$1._super:
                if (!this.allowSuper) {
                    this.raise(this.start, "'super' keyword outside a method");
                }
                node = this.startNode();
                this.next();
                if (this.type === types$1.parenL && !this.allowDirectSuper) {
                    this.raise(node.start, "super() call outside constructor of a subclass");
                }
                // The `super` keyword can appear at below:
                // SuperProperty:
                //     super [ Expression ]
                //     super . IdentifierName
                // SuperCall:
                //     super ( Arguments )
                if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL) {
                    this.unexpected();
                }
                return this.finishNode(node, "Super");
            case types$1._this:
                node = this.startNode();
                this.next();
                return this.finishNode(node, "ThisExpression");
            case types$1.name:
                var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
                var id = this.parseIdent(false);
                if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
                    this.overrideContext(types.f_expr);
                    return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit);
                }
                if (canBeArrow && !this.canInsertSemicolon()) {
                    if (this.eat(types$1.arrow)) {
                        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [
                            id
                        ], false, forInit);
                    }
                    if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc && (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
                        id = this.parseIdent(false);
                        if (this.canInsertSemicolon() || !this.eat(types$1.arrow)) {
                            this.unexpected();
                        }
                        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [
                            id
                        ], true, forInit);
                    }
                }
                return id;
            case types$1.regexp:
                var value = this.value;
                node = this.parseLiteral(value.value);
                node.regex = {
                    pattern: value.pattern,
                    flags: value.flags
                };
                return node;
            case types$1.num:
            case types$1.string:
                return this.parseLiteral(this.value);
            case types$1._null:
            case types$1._true:
            case types$1._false:
                node = this.startNode();
                node.value = this.type === types$1._null ? null : this.type === types$1._true;
                node.raw = this.type.keyword;
                this.next();
                return this.finishNode(node, "Literal");
            case types$1.parenL:
                var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
                if (refDestructuringErrors) {
                    if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr)) {
                        refDestructuringErrors.parenthesizedAssign = start;
                    }
                    if (refDestructuringErrors.parenthesizedBind < 0) {
                        refDestructuringErrors.parenthesizedBind = start;
                    }
                }
                return expr;
            case types$1.bracketL:
                node = this.startNode();
                this.next();
                node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
                return this.finishNode(node, "ArrayExpression");
            case types$1.braceL:
                this.overrideContext(types.b_expr);
                return this.parseObj(false, refDestructuringErrors);
            case types$1._function:
                node = this.startNode();
                this.next();
                return this.parseFunction(node, 0);
            case types$1._class:
                return this.parseClass(this.startNode(), false);
            case types$1._new:
                return this.parseNew();
            case types$1.backQuote:
                return this.parseTemplate();
            case types$1._import:
                if (this.options.ecmaVersion >= 11) {
                    return this.parseExprImport(forNew);
                } else {
                    return this.unexpected();
                }
            default:
                return this.parseExprAtomDefault();
        }
    };
    pp$5.parseExprAtomDefault = function() {
        this.unexpected();
    };
    pp$5.parseExprImport = function(forNew) {
        var node = this.startNode();
        // Consume `import` as an identifier for `import.meta`.
        // Because `this.parseIdent(true)` doesn't check escape sequences, it needs the check of `this.containsEsc`.
        if (this.containsEsc) {
            this.raiseRecoverable(this.start, "Escape sequence in keyword import");
        }
        this.next();
        if (this.type === types$1.parenL && !forNew) {
            return this.parseDynamicImport(node);
        } else if (this.type === types$1.dot) {
            var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
            meta.name = "import";
            node.meta = this.finishNode(meta, "Identifier");
            return this.parseImportMeta(node);
        } else {
            this.unexpected();
        }
    };
    pp$5.parseDynamicImport = function(node) {
        this.next(); // skip `(`
        // Parse node.source.
        node.source = this.parseMaybeAssign();
        // Verify ending.
        if (!this.eat(types$1.parenR)) {
            var errorPos = this.start;
            if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
                this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
            } else {
                this.unexpected(errorPos);
            }
        }
        return this.finishNode(node, "ImportExpression");
    };
    pp$5.parseImportMeta = function(node) {
        this.next(); // skip `.`
        var containsEsc = this.containsEsc;
        node.property = this.parseIdent(true);
        if (node.property.name !== "meta") {
            this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'");
        }
        if (containsEsc) {
            this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters");
        }
        if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere) {
            this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module");
        }
        return this.finishNode(node, "MetaProperty");
    };
    pp$5.parseLiteral = function(value) {
        var node = this.startNode();
        node.value = value;
        node.raw = this.input.slice(this.start, this.end);
        if (node.raw.charCodeAt(node.raw.length - 1) === 110) {
            node.bigint = node.raw.slice(0, -1).replace(/_/g, "");
        }
        this.next();
        return this.finishNode(node, "Literal");
    };
    pp$5.parseParenExpression = function() {
        this.expect(types$1.parenL);
        var val = this.parseExpression();
        this.expect(types$1.parenR);
        return val;
    };
    pp$5.shouldParseArrow = function(exprList) {
        return !this.canInsertSemicolon();
    };
    pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
        var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
        if (this.options.ecmaVersion >= 6) {
            this.next();
            var innerStartPos = this.start, innerStartLoc = this.startLoc;
            var exprList = [], first = true, lastIsComma = false;
            var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
            this.yieldPos = 0;
            this.awaitPos = 0;
            // Do not save awaitIdentPos to allow checking awaits nested in parameters
            while(this.type !== types$1.parenR){
                first ? first = false : this.expect(types$1.comma);
                if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
                    lastIsComma = true;
                    break;
                } else if (this.type === types$1.ellipsis) {
                    spreadStart = this.start;
                    exprList.push(this.parseParenItem(this.parseRestBinding()));
                    if (this.type === types$1.comma) {
                        this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
                    }
                    break;
                } else {
                    exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
                }
            }
            var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
            this.expect(types$1.parenR);
            if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
                this.checkPatternErrors(refDestructuringErrors, false);
                this.checkYieldAwaitInDefaultParams();
                this.yieldPos = oldYieldPos;
                this.awaitPos = oldAwaitPos;
                return this.parseParenArrowList(startPos, startLoc, exprList, forInit);
            }
            if (!exprList.length || lastIsComma) {
                this.unexpected(this.lastTokStart);
            }
            if (spreadStart) {
                this.unexpected(spreadStart);
            }
            this.checkExpressionErrors(refDestructuringErrors, true);
            this.yieldPos = oldYieldPos || this.yieldPos;
            this.awaitPos = oldAwaitPos || this.awaitPos;
            if (exprList.length > 1) {
                val = this.startNodeAt(innerStartPos, innerStartLoc);
                val.expressions = exprList;
                this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
            } else {
                val = exprList[0];
            }
        } else {
            val = this.parseParenExpression();
        }
        if (this.options.preserveParens) {
            var par = this.startNodeAt(startPos, startLoc);
            par.expression = val;
            return this.finishNode(par, "ParenthesizedExpression");
        } else {
            return val;
        }
    };
    pp$5.parseParenItem = function(item) {
        return item;
    };
    pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit);
    };
    // New's precedence is slightly tricky. It must allow its argument to
    // be a `[]` or dot subscript expression, but not a call — at least,
    // not without wrapping it in parentheses. Thus, it uses the noCalls
    // argument to parseSubscripts to prevent it from consuming the
    // argument list.
    var empty = [];
    pp$5.parseNew = function() {
        if (this.containsEsc) {
            this.raiseRecoverable(this.start, "Escape sequence in keyword new");
        }
        var node = this.startNode();
        this.next();
        if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
            var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
            meta.name = "new";
            node.meta = this.finishNode(meta, "Identifier");
            this.next();
            var containsEsc = this.containsEsc;
            node.property = this.parseIdent(true);
            if (node.property.name !== "target") {
                this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'");
            }
            if (containsEsc) {
                this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters");
            }
            if (!this.allowNewDotTarget) {
                this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block");
            }
            return this.finishNode(node, "MetaProperty");
        }
        var startPos = this.start, startLoc = this.startLoc;
        node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
        if (this.eat(types$1.parenL)) {
            node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false);
        } else {
            node.arguments = empty;
        }
        return this.finishNode(node, "NewExpression");
    };
    // Parse template expression.
    pp$5.parseTemplateElement = function(ref) {
        var isTagged = ref.isTagged;
        var elem = this.startNode();
        if (this.type === types$1.invalidTemplate) {
            if (!isTagged) {
                this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
            }
            elem.value = {
                raw: this.value.replace(/\r\n?/g, "\n"),
                cooked: null
            };
        } else {
            elem.value = {
                raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
                cooked: this.value
            };
        }
        this.next();
        elem.tail = this.type === types$1.backQuote;
        return this.finishNode(elem, "TemplateElement");
    };
    pp$5.parseTemplate = function(ref) {
        if (ref === void 0) ref = {};
        var isTagged = ref.isTagged;
        if (isTagged === void 0) isTagged = false;
        var node = this.startNode();
        this.next();
        node.expressions = [];
        var curElt = this.parseTemplateElement({
            isTagged: isTagged
        });
        node.quasis = [
            curElt
        ];
        while(!curElt.tail){
            if (this.type === types$1.eof) {
                this.raise(this.pos, "Unterminated template literal");
            }
            this.expect(types$1.dollarBraceL);
            node.expressions.push(this.parseExpression());
            this.expect(types$1.braceR);
            node.quasis.push(curElt = this.parseTemplateElement({
                isTagged: isTagged
            }));
        }
        this.next();
        return this.finishNode(node, "TemplateLiteral");
    };
    pp$5.isAsyncProp = function(prop) {
        return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" && (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || this.options.ecmaVersion >= 9 && this.type === types$1.star) && !lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
    };
    // Parse an object literal or binding pattern.
    pp$5.parseObj = function(isPattern, refDestructuringErrors) {
        var node = this.startNode(), first = true, propHash = {};
        node.properties = [];
        this.next();
        while(!this.eat(types$1.braceR)){
            if (!first) {
                this.expect(types$1.comma);
                if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) {
                    break;
                }
            } else {
                first = false;
            }
            var prop = this.parseProperty(isPattern, refDestructuringErrors);
            if (!isPattern) {
                this.checkPropClash(prop, propHash, refDestructuringErrors);
            }
            node.properties.push(prop);
        }
        return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
    };
    pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
        var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
        if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
            if (isPattern) {
                prop.argument = this.parseIdent(false);
                if (this.type === types$1.comma) {
                    this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
                }
                return this.finishNode(prop, "RestElement");
            }
            // Parse argument.
            prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
            // To disallow trailing comma via `this.toAssignable()`.
            if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
                refDestructuringErrors.trailingComma = this.start;
            }
            // Finish
            return this.finishNode(prop, "SpreadElement");
        }
        if (this.options.ecmaVersion >= 6) {
            prop.method = false;
            prop.shorthand = false;
            if (isPattern || refDestructuringErrors) {
                startPos = this.start;
                startLoc = this.startLoc;
            }
            if (!isPattern) {
                isGenerator = this.eat(types$1.star);
            }
        }
        var containsEsc = this.containsEsc;
        this.parsePropertyName(prop);
        if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
            isAsync = true;
            isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
            this.parsePropertyName(prop);
        } else {
            isAsync = false;
        }
        this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
        return this.finishNode(prop, "Property");
    };
    pp$5.parseGetterSetter = function(prop) {
        prop.kind = prop.key.name;
        this.parsePropertyName(prop);
        prop.value = this.parseMethod(false);
        var paramCount = prop.kind === "get" ? 0 : 1;
        if (prop.value.params.length !== paramCount) {
            var start = prop.value.start;
            if (prop.kind === "get") {
                this.raiseRecoverable(start, "getter should have no params");
            } else {
                this.raiseRecoverable(start, "setter should have exactly one param");
            }
        } else {
            if (prop.kind === "set" && prop.value.params[0].type === "RestElement") {
                this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
            }
        }
    };
    pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
        if ((isGenerator || isAsync) && this.type === types$1.colon) {
            this.unexpected();
        }
        if (this.eat(types$1.colon)) {
            prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
            prop.kind = "init";
        } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
            if (isPattern) {
                this.unexpected();
            }
            prop.kind = "init";
            prop.method = true;
            prop.value = this.parseMethod(isGenerator, isAsync);
        } else if (!isPattern && !containsEsc && this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq) {
            if (isGenerator || isAsync) {
                this.unexpected();
            }
            this.parseGetterSetter(prop);
        } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
            if (isGenerator || isAsync) {
                this.unexpected();
            }
            this.checkUnreserved(prop.key);
            if (prop.key.name === "await" && !this.awaitIdentPos) {
                this.awaitIdentPos = startPos;
            }
            prop.kind = "init";
            if (isPattern) {
                prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
            } else if (this.type === types$1.eq && refDestructuringErrors) {
                if (refDestructuringErrors.shorthandAssign < 0) {
                    refDestructuringErrors.shorthandAssign = this.start;
                }
                prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
            } else {
                prop.value = this.copyNode(prop.key);
            }
            prop.shorthand = true;
        } else {
            this.unexpected();
        }
    };
    pp$5.parsePropertyName = function(prop) {
        if (this.options.ecmaVersion >= 6) {
            if (this.eat(types$1.bracketL)) {
                prop.computed = true;
                prop.key = this.parseMaybeAssign();
                this.expect(types$1.bracketR);
                return prop.key;
            } else {
                prop.computed = false;
            }
        }
        return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
    };
    // Initialize empty function node.
    pp$5.initFunction = function(node) {
        node.id = null;
        if (this.options.ecmaVersion >= 6) {
            node.generator = node.expression = false;
        }
        if (this.options.ecmaVersion >= 8) {
            node.async = false;
        }
    };
    // Parse object or class method.
    pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
        var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
        this.initFunction(node);
        if (this.options.ecmaVersion >= 6) {
            node.generator = isGenerator;
        }
        if (this.options.ecmaVersion >= 8) {
            node.async = !!isAsync;
        }
        this.yieldPos = 0;
        this.awaitPos = 0;
        this.awaitIdentPos = 0;
        this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));
        this.expect(types$1.parenL);
        node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
        this.checkYieldAwaitInDefaultParams();
        this.parseFunctionBody(node, false, true, false);
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.finishNode(node, "FunctionExpression");
    };
    // Parse arrow function expression with given parameters.
    pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
        var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
        this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
        this.initFunction(node);
        if (this.options.ecmaVersion >= 8) {
            node.async = !!isAsync;
        }
        this.yieldPos = 0;
        this.awaitPos = 0;
        this.awaitIdentPos = 0;
        node.params = this.toAssignableList(params, true);
        this.parseFunctionBody(node, true, false, forInit);
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.finishNode(node, "ArrowFunctionExpression");
    };
    // Parse function body and check parameters.
    pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
        var isExpression = isArrowFunction && this.type !== types$1.braceL;
        var oldStrict = this.strict, useStrict = false;
        if (isExpression) {
            node.body = this.parseMaybeAssign(forInit);
            node.expression = true;
            this.checkParams(node, false);
        } else {
            var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
            if (!oldStrict || nonSimple) {
                useStrict = this.strictDirective(this.end);
                // If this is a strict mode function, verify that argument names
                // are not repeated, and it does not try to bind the words `eval`
                // or `arguments`.
                if (useStrict && nonSimple) {
                    this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
                }
            }
            // Start a new scope with regard to labels and the `inFunction`
            // flag (restore them to their old value afterwards).
            var oldLabels = this.labels;
            this.labels = [];
            if (useStrict) {
                this.strict = true;
            }
            // Add the params to varDeclaredNames to ensure that an error is thrown
            // if a let/const declaration in the function clashes with one of the params.
            this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
            // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
            if (this.strict && node.id) {
                this.checkLValSimple(node.id, BIND_OUTSIDE);
            }
            node.body = this.parseBlock(false, undefined, useStrict && !oldStrict);
            node.expression = false;
            this.adaptDirectivePrologue(node.body.body);
            this.labels = oldLabels;
        }
        this.exitScope();
    };
    pp$5.isSimpleParamList = function(params) {
        for(var i = 0, list = params; i < list.length; i += 1){
            var param = list[i];
            if (param.type !== "Identifier") {
                return false;
            }
        }
        return true;
    };
    // Checks function params for various disallowed patterns such as using "eval"
    // or "arguments" and duplicate parameters.
    pp$5.checkParams = function(node, allowDuplicates) {
        var nameHash = Object.create(null);
        for(var i = 0, list = node.params; i < list.length; i += 1){
            var param = list[i];
            this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
        }
    };
    // Parses a comma-separated list of expressions, and returns them as
    // an array. `close` is the token type that ends the list, and
    // `allowEmpty` can be turned on to allow subsequent commas with
    // nothing in between them to be parsed as `null` (which is needed
    // for array literals).
    pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
        var elts = [], first = true;
        while(!this.eat(close)){
            if (!first) {
                this.expect(types$1.comma);
                if (allowTrailingComma && this.afterTrailingComma(close)) {
                    break;
                }
            } else {
                first = false;
            }
            var elt = void 0;
            if (allowEmpty && this.type === types$1.comma) {
                elt = null;
            } else if (this.type === types$1.ellipsis) {
                elt = this.parseSpread(refDestructuringErrors);
                if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0) {
                    refDestructuringErrors.trailingComma = this.start;
                }
            } else {
                elt = this.parseMaybeAssign(false, refDestructuringErrors);
            }
            elts.push(elt);
        }
        return elts;
    };
    pp$5.checkUnreserved = function(ref) {
        var start = ref.start;
        var end = ref.end;
        var name = ref.name;
        if (this.inGenerator && name === "yield") {
            this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator");
        }
        if (this.inAsync && name === "await") {
            this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function");
        }
        if (this.currentThisScope().inClassFieldInit && name === "arguments") {
            this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer");
        }
        if (this.inClassStaticBlock && (name === "arguments" || name === "await")) {
            this.raise(start, "Cannot use " + name + " in class static initialization block");
        }
        if (this.keywords.test(name)) {
            this.raise(start, "Unexpected keyword '" + name + "'");
        }
        if (this.options.ecmaVersion < 6 && this.input.slice(start, end).indexOf("\\") !== -1) {
            return;
        }
        var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
        if (re.test(name)) {
            if (!this.inAsync && name === "await") {
                this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function");
            }
            this.raiseRecoverable(start, "The keyword '" + name + "' is reserved");
        }
    };
    // Parse the next token as an identifier. If `liberal` is true (used
    // when parsing properties), it will also convert keywords into
    // identifiers.
    pp$5.parseIdent = function(liberal) {
        var node = this.parseIdentNode();
        this.next(!!liberal);
        this.finishNode(node, "Identifier");
        if (!liberal) {
            this.checkUnreserved(node);
            if (node.name === "await" && !this.awaitIdentPos) {
                this.awaitIdentPos = node.start;
            }
        }
        return node;
    };
    pp$5.parseIdentNode = function() {
        var node = this.startNode();
        if (this.type === types$1.name) {
            node.name = this.value;
        } else if (this.type.keyword) {
            node.name = this.type.keyword;
            // To fix https://github.com/acornjs/acorn/issues/575
            // `class` and `function` keywords push new context into this.context.
            // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
            // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
            if ((node.name === "class" || node.name === "function") && (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
                this.context.pop();
            }
            this.type = types$1.name;
        } else {
            this.unexpected();
        }
        return node;
    };
    pp$5.parsePrivateIdent = function() {
        var node = this.startNode();
        if (this.type === types$1.privateId) {
            node.name = this.value;
        } else {
            this.unexpected();
        }
        this.next();
        this.finishNode(node, "PrivateIdentifier");
        // For validating existence
        if (this.options.checkPrivateFields) {
            if (this.privateNameStack.length === 0) {
                this.raise(node.start, "Private field '#" + node.name + "' must be declared in an enclosing class");
            } else {
                this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
            }
        }
        return node;
    };
    // Parses yield expression inside generator.
    pp$5.parseYield = function(forInit) {
        if (!this.yieldPos) {
            this.yieldPos = this.start;
        }
        var node = this.startNode();
        this.next();
        if (this.type === types$1.semi || this.canInsertSemicolon() || this.type !== types$1.star && !this.type.startsExpr) {
            node.delegate = false;
            node.argument = null;
        } else {
            node.delegate = this.eat(types$1.star);
            node.argument = this.parseMaybeAssign(forInit);
        }
        return this.finishNode(node, "YieldExpression");
    };
    pp$5.parseAwait = function(forInit) {
        if (!this.awaitPos) {
            this.awaitPos = this.start;
        }
        var node = this.startNode();
        this.next();
        node.argument = this.parseMaybeUnary(null, true, false, forInit);
        return this.finishNode(node, "AwaitExpression");
    };
    var pp$4 = Parser.prototype;
    // This function is used to raise exceptions on parse errors. It
    // takes an offset integer (into the current `input`) to indicate
    // the location of the error, attaches the position to the end
    // of the error message, and then raises a `SyntaxError` with that
    // message.
    pp$4.raise = function(pos, message) {
        var loc = getLineInfo(this.input, pos);
        message += " (" + loc.line + ":" + loc.column + ")";
        var err = new SyntaxError(message);
        err.pos = pos;
        err.loc = loc;
        err.raisedAt = this.pos;
        throw err;
    };
    pp$4.raiseRecoverable = pp$4.raise;
    pp$4.curPosition = function() {
        if (this.options.locations) {
            return new Position(this.curLine, this.pos - this.lineStart);
        }
    };
    var pp$3 = Parser.prototype;
    var Scope = function Scope(flags) {
        this.flags = flags;
        // A list of var-declared names in the current lexical scope
        this.var = [];
        // A list of lexically-declared names in the current lexical scope
        this.lexical = [];
        // A list of lexically-declared FunctionDeclaration names in the current lexical scope
        this.functions = [];
        // A switch to disallow the identifier reference 'arguments'
        this.inClassFieldInit = false;
    };
    // The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.
    pp$3.enterScope = function(flags) {
        this.scopeStack.push(new Scope(flags));
    };
    pp$3.exitScope = function() {
        this.scopeStack.pop();
    };
    // The spec says:
    // > At the top level of a function, or script, function declarations are
    // > treated like var declarations rather than like lexical declarations.
    pp$3.treatFunctionsAsVarInScope = function(scope) {
        return scope.flags & SCOPE_FUNCTION || !this.inModule && scope.flags & SCOPE_TOP;
    };
    pp$3.declareName = function(name, bindingType, pos) {
        var redeclared = false;
        if (bindingType === BIND_LEXICAL) {
            var scope = this.currentScope();
            redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
            scope.lexical.push(name);
            if (this.inModule && scope.flags & SCOPE_TOP) {
                delete this.undefinedExports[name];
            }
        } else if (bindingType === BIND_SIMPLE_CATCH) {
            var scope$1 = this.currentScope();
            scope$1.lexical.push(name);
        } else if (bindingType === BIND_FUNCTION) {
            var scope$2 = this.currentScope();
            if (this.treatFunctionsAsVar) {
                redeclared = scope$2.lexical.indexOf(name) > -1;
            } else {
                redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1;
            }
            scope$2.functions.push(name);
        } else {
            for(var i = this.scopeStack.length - 1; i >= 0; --i){
                var scope$3 = this.scopeStack[i];
                if (scope$3.lexical.indexOf(name) > -1 && !(scope$3.flags & SCOPE_SIMPLE_CATCH && scope$3.lexical[0] === name) || !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
                    redeclared = true;
                    break;
                }
                scope$3.var.push(name);
                if (this.inModule && scope$3.flags & SCOPE_TOP) {
                    delete this.undefinedExports[name];
                }
                if (scope$3.flags & SCOPE_VAR) {
                    break;
                }
            }
        }
        if (redeclared) {
            this.raiseRecoverable(pos, "Identifier '" + name + "' has already been declared");
        }
    };
    pp$3.checkLocalExport = function(id) {
        // scope.functions must be empty as Module code is always strict.
        if (this.scopeStack[0].lexical.indexOf(id.name) === -1 && this.scopeStack[0].var.indexOf(id.name) === -1) {
            this.undefinedExports[id.name] = id;
        }
    };
    pp$3.currentScope = function() {
        return this.scopeStack[this.scopeStack.length - 1];
    };
    pp$3.currentVarScope = function() {
        for(var i = this.scopeStack.length - 1;; i--){
            var scope = this.scopeStack[i];
            if (scope.flags & SCOPE_VAR) {
                return scope;
            }
        }
    };
    // Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
    pp$3.currentThisScope = function() {
        for(var i = this.scopeStack.length - 1;; i--){
            var scope = this.scopeStack[i];
            if (scope.flags & SCOPE_VAR && !(scope.flags & SCOPE_ARROW)) {
                return scope;
            }
        }
    };
    var Node = function Node(parser, pos, loc) {
        this.type = "";
        this.start = pos;
        this.end = 0;
        if (parser.options.locations) {
            this.loc = new SourceLocation(parser, loc);
        }
        if (parser.options.directSourceFile) {
            this.sourceFile = parser.options.directSourceFile;
        }
        if (parser.options.ranges) {
            this.range = [
                pos,
                0
            ];
        }
    };
    // Start an AST node, attaching a start offset.
    var pp$2 = Parser.prototype;
    pp$2.startNode = function() {
        return new Node(this, this.start, this.startLoc);
    };
    pp$2.startNodeAt = function(pos, loc) {
        return new Node(this, pos, loc);
    };
    // Finish an AST node, adding `type` and `end` properties.
    function finishNodeAt(node, type, pos, loc) {
        node.type = type;
        node.end = pos;
        if (this.options.locations) {
            node.loc.end = loc;
        }
        if (this.options.ranges) {
            node.range[1] = pos;
        }
        return node;
    }
    pp$2.finishNode = function(node, type) {
        return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
    };
    // Finish node at given position
    pp$2.finishNodeAt = function(node, type, pos, loc) {
        return finishNodeAt.call(this, node, type, pos, loc);
    };
    pp$2.copyNode = function(node) {
        var newNode = new Node(this, node.start, this.startLoc);
        for(var prop in node){
            newNode[prop] = node[prop];
        }
        return newNode;
    };
    // This file contains Unicode properties extracted from the ECMAScript specification.
    // The lists are extracted like so:
    // $$('#table-binary-unicode-properties > figure > table > tbody > tr > td:nth-child(1) code').map(el => el.innerText)
    // #table-binary-unicode-properties
    var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
    var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
    var ecma11BinaryProperties = ecma10BinaryProperties;
    var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
    var ecma13BinaryProperties = ecma12BinaryProperties;
    var ecma14BinaryProperties = ecma13BinaryProperties;
    var unicodeBinaryProperties = {
        9: ecma9BinaryProperties,
        10: ecma10BinaryProperties,
        11: ecma11BinaryProperties,
        12: ecma12BinaryProperties,
        13: ecma13BinaryProperties,
        14: ecma14BinaryProperties
    };
    // #table-binary-unicode-properties-of-strings
    var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";
    var unicodeBinaryPropertiesOfStrings = {
        9: "",
        10: "",
        11: "",
        12: "",
        13: "",
        14: ecma14BinaryPropertiesOfStrings
    };
    // #table-unicode-general-category-values
    var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";
    // #table-unicode-script-values
    var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
    var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
    var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
    var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
    var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
    var ecma14ScriptValues = ecma13ScriptValues + " Hrkt Katakana_Or_Hiragana Kawi Nag_Mundari Nagm Unknown Zzzz";
    var unicodeScriptValues = {
        9: ecma9ScriptValues,
        10: ecma10ScriptValues,
        11: ecma11ScriptValues,
        12: ecma12ScriptValues,
        13: ecma13ScriptValues,
        14: ecma14ScriptValues
    };
    var data = {};
    function buildUnicodeData(ecmaVersion) {
        var d = data[ecmaVersion] = {
            binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
            binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion]),
            nonBinary: {
                General_Category: wordsRegexp(unicodeGeneralCategoryValues),
                Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
            }
        };
        d.nonBinary.Script_Extensions = d.nonBinary.Script;
        d.nonBinary.gc = d.nonBinary.General_Category;
        d.nonBinary.sc = d.nonBinary.Script;
        d.nonBinary.scx = d.nonBinary.Script_Extensions;
    }
    for(var i = 0, list = [
        9,
        10,
        11,
        12,
        13,
        14
    ]; i < list.length; i += 1){
        var ecmaVersion = list[i];
        buildUnicodeData(ecmaVersion);
    }
    var pp$1 = Parser.prototype;
    // Track disjunction structure to determine whether a duplicate
    // capture group name is allowed because it is in a separate branch.
    var BranchID = function BranchID(parent, base) {
        // Parent disjunction branch
        this.parent = parent;
        // Identifies this set of sibling branches
        this.base = base || this;
    };
    BranchID.prototype.separatedFrom = function separatedFrom(alt) {
        // A branch is separate from another branch if they or any of
        // their parents are siblings in a given disjunction
        for(var self1 = this; self1; self1 = self1.parent){
            for(var other = alt; other; other = other.parent){
                if (self1.base === other.base && self1 !== other) {
                    return true;
                }
            }
        }
        return false;
    };
    BranchID.prototype.sibling = function sibling() {
        return new BranchID(this.parent, this.base);
    };
    var RegExpValidationState = function RegExpValidationState(parser) {
        this.parser = parser;
        this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
        this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
        this.source = "";
        this.flags = "";
        this.start = 0;
        this.switchU = false;
        this.switchV = false;
        this.switchN = false;
        this.pos = 0;
        this.lastIntValue = 0;
        this.lastStringValue = "";
        this.lastAssertionIsQuantifiable = false;
        this.numCapturingParens = 0;
        this.maxBackReference = 0;
        this.groupNames = Object.create(null);
        this.backReferenceNames = [];
        this.branchID = null;
    };
    RegExpValidationState.prototype.reset = function reset(start, pattern, flags) {
        var unicodeSets = flags.indexOf("v") !== -1;
        var unicode = flags.indexOf("u") !== -1;
        this.start = start | 0;
        this.source = pattern + "";
        this.flags = flags;
        if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
            this.switchU = true;
            this.switchV = true;
            this.switchN = true;
        } else {
            this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
            this.switchV = false;
            this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
        }
    };
    RegExpValidationState.prototype.raise = function raise(message) {
        this.parser.raiseRecoverable(this.start, "Invalid regular expression: /" + this.source + "/: " + message);
    };
    // If u flag is given, this returns the code point at the index (it combines a surrogate pair).
    // Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
    RegExpValidationState.prototype.at = function at(i, forceU) {
        if (forceU === void 0) forceU = false;
        var s = this.source;
        var l = s.length;
        if (i >= l) {
            return -1;
        }
        var c = s.charCodeAt(i);
        if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
            return c;
        }
        var next = s.charCodeAt(i + 1);
        return next >= 0xDC00 && next <= 0xDFFF ? (c << 10) + next - 0x35FDC00 : c;
    };
    RegExpValidationState.prototype.nextIndex = function nextIndex(i, forceU) {
        if (forceU === void 0) forceU = false;
        var s = this.source;
        var l = s.length;
        if (i >= l) {
            return l;
        }
        var c = s.charCodeAt(i), next;
        if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l || (next = s.charCodeAt(i + 1)) < 0xDC00 || next > 0xDFFF) {
            return i + 1;
        }
        return i + 2;
    };
    RegExpValidationState.prototype.current = function current(forceU) {
        if (forceU === void 0) forceU = false;
        return this.at(this.pos, forceU);
    };
    RegExpValidationState.prototype.lookahead = function lookahead(forceU) {
        if (forceU === void 0) forceU = false;
        return this.at(this.nextIndex(this.pos, forceU), forceU);
    };
    RegExpValidationState.prototype.advance = function advance(forceU) {
        if (forceU === void 0) forceU = false;
        this.pos = this.nextIndex(this.pos, forceU);
    };
    RegExpValidationState.prototype.eat = function eat(ch, forceU) {
        if (forceU === void 0) forceU = false;
        if (this.current(forceU) === ch) {
            this.advance(forceU);
            return true;
        }
        return false;
    };
    RegExpValidationState.prototype.eatChars = function eatChars(chs, forceU) {
        if (forceU === void 0) forceU = false;
        var pos = this.pos;
        for(var i = 0, list = chs; i < list.length; i += 1){
            var ch = list[i];
            var current = this.at(pos, forceU);
            if (current === -1 || current !== ch) {
                return false;
            }
            pos = this.nextIndex(pos, forceU);
        }
        this.pos = pos;
        return true;
    };
    /**
   * Validate the flags part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */ pp$1.validateRegExpFlags = function(state) {
        var validFlags = state.validFlags;
        var flags = state.flags;
        var u = false;
        var v = false;
        for(var i = 0; i < flags.length; i++){
            var flag = flags.charAt(i);
            if (validFlags.indexOf(flag) === -1) {
                this.raise(state.start, "Invalid regular expression flag");
            }
            if (flags.indexOf(flag, i + 1) > -1) {
                this.raise(state.start, "Duplicate regular expression flag");
            }
            if (flag === "u") {
                u = true;
            }
            if (flag === "v") {
                v = true;
            }
        }
        if (this.options.ecmaVersion >= 15 && u && v) {
            this.raise(state.start, "Invalid regular expression flag");
        }
    };
    function hasProp(obj) {
        for(var _ in obj){
            return true;
        }
        return false;
    }
    /**
   * Validate the pattern part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */ pp$1.validateRegExpPattern = function(state) {
        this.regexp_pattern(state);
        // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
        // parsing contains a |GroupName|, reparse with the goal symbol
        // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
        // exception if _P_ did not conform to the grammar, if any elements of _P_
        // were not matched by the parse, or if any Early Error conditions exist.
        if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
            state.switchN = true;
            this.regexp_pattern(state);
        }
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
    pp$1.regexp_pattern = function(state) {
        state.pos = 0;
        state.lastIntValue = 0;
        state.lastStringValue = "";
        state.lastAssertionIsQuantifiable = false;
        state.numCapturingParens = 0;
        state.maxBackReference = 0;
        state.groupNames = Object.create(null);
        state.backReferenceNames.length = 0;
        state.branchID = null;
        this.regexp_disjunction(state);
        if (state.pos !== state.source.length) {
            // Make the same messages as V8.
            if (state.eat(0x29 /* ) */ )) {
                state.raise("Unmatched ')'");
            }
            if (state.eat(0x5D /* ] */ ) || state.eat(0x7D /* } */ )) {
                state.raise("Lone quantifier brackets");
            }
        }
        if (state.maxBackReference > state.numCapturingParens) {
            state.raise("Invalid escape");
        }
        for(var i = 0, list = state.backReferenceNames; i < list.length; i += 1){
            var name = list[i];
            if (!state.groupNames[name]) {
                state.raise("Invalid named capture referenced");
            }
        }
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
    pp$1.regexp_disjunction = function(state) {
        var trackDisjunction = this.options.ecmaVersion >= 16;
        if (trackDisjunction) {
            state.branchID = new BranchID(state.branchID, null);
        }
        this.regexp_alternative(state);
        while(state.eat(0x7C /* | */ )){
            if (trackDisjunction) {
                state.branchID = state.branchID.sibling();
            }
            this.regexp_alternative(state);
        }
        if (trackDisjunction) {
            state.branchID = state.branchID.parent;
        }
        // Make the same message as V8.
        if (this.regexp_eatQuantifier(state, true)) {
            state.raise("Nothing to repeat");
        }
        if (state.eat(0x7B /* { */ )) {
            state.raise("Lone quantifier brackets");
        }
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
    pp$1.regexp_alternative = function(state) {
        while(state.pos < state.source.length && this.regexp_eatTerm(state)){}
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
    pp$1.regexp_eatTerm = function(state) {
        if (this.regexp_eatAssertion(state)) {
            // Handle `QuantifiableAssertion Quantifier` alternative.
            // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
            // is a QuantifiableAssertion.
            if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
                // Make the same message as V8.
                if (state.switchU) {
                    state.raise("Invalid quantifier");
                }
            }
            return true;
        }
        if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
            this.regexp_eatQuantifier(state);
            return true;
        }
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
    pp$1.regexp_eatAssertion = function(state) {
        var start = state.pos;
        state.lastAssertionIsQuantifiable = false;
        // ^, $
        if (state.eat(0x5E /* ^ */ ) || state.eat(0x24 /* $ */ )) {
            return true;
        }
        // \b \B
        if (state.eat(0x5C /* \ */ )) {
            if (state.eat(0x42 /* B */ ) || state.eat(0x62 /* b */ )) {
                return true;
            }
            state.pos = start;
        }
        // Lookahead / Lookbehind
        if (state.eat(0x28 /* ( */ ) && state.eat(0x3F /* ? */ )) {
            var lookbehind = false;
            if (this.options.ecmaVersion >= 9) {
                lookbehind = state.eat(0x3C /* < */ );
            }
            if (state.eat(0x3D /* = */ ) || state.eat(0x21 /* ! */ )) {
                this.regexp_disjunction(state);
                if (!state.eat(0x29 /* ) */ )) {
                    state.raise("Unterminated group");
                }
                state.lastAssertionIsQuantifiable = !lookbehind;
                return true;
            }
        }
        state.pos = start;
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
    pp$1.regexp_eatQuantifier = function(state, noError) {
        if (noError === void 0) noError = false;
        if (this.regexp_eatQuantifierPrefix(state, noError)) {
            state.eat(0x3F /* ? */ );
            return true;
        }
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
    pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
        return state.eat(0x2A /* * */ ) || state.eat(0x2B /* + */ ) || state.eat(0x3F /* ? */ ) || this.regexp_eatBracedQuantifier(state, noError);
    };
    pp$1.regexp_eatBracedQuantifier = function(state, noError) {
        var start = state.pos;
        if (state.eat(0x7B /* { */ )) {
            var min = 0, max = -1;
            if (this.regexp_eatDecimalDigits(state)) {
                min = state.lastIntValue;
                if (state.eat(0x2C /* , */ ) && this.regexp_eatDecimalDigits(state)) {
                    max = state.lastIntValue;
                }
                if (state.eat(0x7D /* } */ )) {
                    // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
                    if (max !== -1 && max < min && !noError) {
                        state.raise("numbers out of order in {} quantifier");
                    }
                    return true;
                }
            }
            if (state.switchU && !noError) {
                state.raise("Incomplete quantifier");
            }
            state.pos = start;
        }
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
    pp$1.regexp_eatAtom = function(state) {
        return this.regexp_eatPatternCharacters(state) || state.eat(0x2E /* . */ ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state);
    };
    pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
        var start = state.pos;
        if (state.eat(0x5C /* \ */ )) {
            if (this.regexp_eatAtomEscape(state)) {
                return true;
            }
            state.pos = start;
        }
        return false;
    };
    pp$1.regexp_eatUncapturingGroup = function(state) {
        var start = state.pos;
        if (state.eat(0x28 /* ( */ )) {
            if (state.eat(0x3F /* ? */ ) && state.eat(0x3A /* : */ )) {
                this.regexp_disjunction(state);
                if (state.eat(0x29 /* ) */ )) {
                    return true;
                }
                state.raise("Unterminated group");
            }
            state.pos = start;
        }
        return false;
    };
    pp$1.regexp_eatCapturingGroup = function(state) {
        if (state.eat(0x28 /* ( */ )) {
            if (this.options.ecmaVersion >= 9) {
                this.regexp_groupSpecifier(state);
            } else if (state.current() === 0x3F /* ? */ ) {
                state.raise("Invalid group");
            }
            this.regexp_disjunction(state);
            if (state.eat(0x29 /* ) */ )) {
                state.numCapturingParens += 1;
                return true;
            }
            state.raise("Unterminated group");
        }
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
    pp$1.regexp_eatExtendedAtom = function(state) {
        return state.eat(0x2E /* . */ ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state) || this.regexp_eatInvalidBracedQuantifier(state) || this.regexp_eatExtendedPatternCharacter(state);
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
    pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
        if (this.regexp_eatBracedQuantifier(state, true)) {
            state.raise("Nothing to repeat");
        }
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
    pp$1.regexp_eatSyntaxCharacter = function(state) {
        var ch = state.current();
        if (isSyntaxCharacter(ch)) {
            state.lastIntValue = ch;
            state.advance();
            return true;
        }
        return false;
    };
    function isSyntaxCharacter(ch) {
        return ch === 0x24 /* $ */  || ch >= 0x28 /* ( */  && ch <= 0x2B /* + */  || ch === 0x2E /* . */  || ch === 0x3F /* ? */  || ch >= 0x5B /* [ */  && ch <= 0x5E /* ^ */  || ch >= 0x7B /* { */  && ch <= 0x7D /* } */ ;
    }
    // https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
    // But eat eager.
    pp$1.regexp_eatPatternCharacters = function(state) {
        var start = state.pos;
        var ch = 0;
        while((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)){
            state.advance();
        }
        return state.pos !== start;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
    pp$1.regexp_eatExtendedPatternCharacter = function(state) {
        var ch = state.current();
        if (ch !== -1 && ch !== 0x24 /* $ */  && !(ch >= 0x28 /* ( */  && ch <= 0x2B /* + */ ) && ch !== 0x2E /* . */  && ch !== 0x3F /* ? */  && ch !== 0x5B /* [ */  && ch !== 0x5E /* ^ */  && ch !== 0x7C /* | */ ) {
            state.advance();
            return true;
        }
        return false;
    };
    // GroupSpecifier ::
    //   [empty]
    //   `?` GroupName
    pp$1.regexp_groupSpecifier = function(state) {
        if (state.eat(0x3F /* ? */ )) {
            if (!this.regexp_eatGroupName(state)) {
                state.raise("Invalid group");
            }
            var trackDisjunction = this.options.ecmaVersion >= 16;
            var known = state.groupNames[state.lastStringValue];
            if (known) {
                if (trackDisjunction) {
                    for(var i = 0, list = known; i < list.length; i += 1){
                        var altID = list[i];
                        if (!altID.separatedFrom(state.branchID)) {
                            state.raise("Duplicate capture group name");
                        }
                    }
                } else {
                    state.raise("Duplicate capture group name");
                }
            }
            if (trackDisjunction) {
                (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
            } else {
                state.groupNames[state.lastStringValue] = true;
            }
        }
    };
    // GroupName ::
    //   `<` RegExpIdentifierName `>`
    // Note: this updates `state.lastStringValue` property with the eaten name.
    pp$1.regexp_eatGroupName = function(state) {
        state.lastStringValue = "";
        if (state.eat(0x3C /* < */ )) {
            if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */ )) {
                return true;
            }
            state.raise("Invalid capture group name");
        }
        return false;
    };
    // RegExpIdentifierName ::
    //   RegExpIdentifierStart
    //   RegExpIdentifierName RegExpIdentifierPart
    // Note: this updates `state.lastStringValue` property with the eaten name.
    pp$1.regexp_eatRegExpIdentifierName = function(state) {
        state.lastStringValue = "";
        if (this.regexp_eatRegExpIdentifierStart(state)) {
            state.lastStringValue += codePointToString(state.lastIntValue);
            while(this.regexp_eatRegExpIdentifierPart(state)){
                state.lastStringValue += codePointToString(state.lastIntValue);
            }
            return true;
        }
        return false;
    };
    // RegExpIdentifierStart ::
    //   UnicodeIDStart
    //   `$`
    //   `_`
    //   `\` RegExpUnicodeEscapeSequence[+U]
    pp$1.regexp_eatRegExpIdentifierStart = function(state) {
        var start = state.pos;
        var forceU = this.options.ecmaVersion >= 11;
        var ch = state.current(forceU);
        state.advance(forceU);
        if (ch === 0x5C /* \ */  && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
            ch = state.lastIntValue;
        }
        if (isRegExpIdentifierStart(ch)) {
            state.lastIntValue = ch;
            return true;
        }
        state.pos = start;
        return false;
    };
    function isRegExpIdentifierStart(ch) {
        return isIdentifierStart(ch, true) || ch === 0x24 /* $ */  || ch === 0x5F /* _ */ ;
    }
    // RegExpIdentifierPart ::
    //   UnicodeIDContinue
    //   `$`
    //   `_`
    //   `\` RegExpUnicodeEscapeSequence[+U]
    //   <ZWNJ>
    //   <ZWJ>
    pp$1.regexp_eatRegExpIdentifierPart = function(state) {
        var start = state.pos;
        var forceU = this.options.ecmaVersion >= 11;
        var ch = state.current(forceU);
        state.advance(forceU);
        if (ch === 0x5C /* \ */  && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
            ch = state.lastIntValue;
        }
        if (isRegExpIdentifierPart(ch)) {
            state.lastIntValue = ch;
            return true;
        }
        state.pos = start;
        return false;
    };
    function isRegExpIdentifierPart(ch) {
        return isIdentifierChar(ch, true) || ch === 0x24 /* $ */  || ch === 0x5F /* _ */  || ch === 0x200C /* <ZWNJ> */  || ch === 0x200D /* <ZWJ> */ ;
    }
    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
    pp$1.regexp_eatAtomEscape = function(state) {
        if (this.regexp_eatBackReference(state) || this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state) || state.switchN && this.regexp_eatKGroupName(state)) {
            return true;
        }
        if (state.switchU) {
            // Make the same message as V8.
            if (state.current() === 0x63 /* c */ ) {
                state.raise("Invalid unicode escape");
            }
            state.raise("Invalid escape");
        }
        return false;
    };
    pp$1.regexp_eatBackReference = function(state) {
        var start = state.pos;
        if (this.regexp_eatDecimalEscape(state)) {
            var n = state.lastIntValue;
            if (state.switchU) {
                // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
                if (n > state.maxBackReference) {
                    state.maxBackReference = n;
                }
                return true;
            }
            if (n <= state.numCapturingParens) {
                return true;
            }
            state.pos = start;
        }
        return false;
    };
    pp$1.regexp_eatKGroupName = function(state) {
        if (state.eat(0x6B /* k */ )) {
            if (this.regexp_eatGroupName(state)) {
                state.backReferenceNames.push(state.lastStringValue);
                return true;
            }
            state.raise("Invalid named reference");
        }
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
    pp$1.regexp_eatCharacterEscape = function(state) {
        return this.regexp_eatControlEscape(state) || this.regexp_eatCControlLetter(state) || this.regexp_eatZero(state) || this.regexp_eatHexEscapeSequence(state) || this.regexp_eatRegExpUnicodeEscapeSequence(state, false) || !state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state) || this.regexp_eatIdentityEscape(state);
    };
    pp$1.regexp_eatCControlLetter = function(state) {
        var start = state.pos;
        if (state.eat(0x63 /* c */ )) {
            if (this.regexp_eatControlLetter(state)) {
                return true;
            }
            state.pos = start;
        }
        return false;
    };
    pp$1.regexp_eatZero = function(state) {
        if (state.current() === 0x30 /* 0 */  && !isDecimalDigit(state.lookahead())) {
            state.lastIntValue = 0;
            state.advance();
            return true;
        }
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
    pp$1.regexp_eatControlEscape = function(state) {
        var ch = state.current();
        if (ch === 0x74 /* t */ ) {
            state.lastIntValue = 0x09; /* \t */ 
            state.advance();
            return true;
        }
        if (ch === 0x6E /* n */ ) {
            state.lastIntValue = 0x0A; /* \n */ 
            state.advance();
            return true;
        }
        if (ch === 0x76 /* v */ ) {
            state.lastIntValue = 0x0B; /* \v */ 
            state.advance();
            return true;
        }
        if (ch === 0x66 /* f */ ) {
            state.lastIntValue = 0x0C; /* \f */ 
            state.advance();
            return true;
        }
        if (ch === 0x72 /* r */ ) {
            state.lastIntValue = 0x0D; /* \r */ 
            state.advance();
            return true;
        }
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
    pp$1.regexp_eatControlLetter = function(state) {
        var ch = state.current();
        if (isControlLetter(ch)) {
            state.lastIntValue = ch % 0x20;
            state.advance();
            return true;
        }
        return false;
    };
    function isControlLetter(ch) {
        return ch >= 0x41 /* A */  && ch <= 0x5A /* Z */  || ch >= 0x61 /* a */  && ch <= 0x7A /* z */ ;
    }
    // https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
    pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
        if (forceU === void 0) forceU = false;
        var start = state.pos;
        var switchU = forceU || state.switchU;
        if (state.eat(0x75 /* u */ )) {
            if (this.regexp_eatFixedHexDigits(state, 4)) {
                var lead = state.lastIntValue;
                if (switchU && lead >= 0xD800 && lead <= 0xDBFF) {
                    var leadSurrogateEnd = state.pos;
                    if (state.eat(0x5C /* \ */ ) && state.eat(0x75 /* u */ ) && this.regexp_eatFixedHexDigits(state, 4)) {
                        var trail = state.lastIntValue;
                        if (trail >= 0xDC00 && trail <= 0xDFFF) {
                            state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
                            return true;
                        }
                    }
                    state.pos = leadSurrogateEnd;
                    state.lastIntValue = lead;
                }
                return true;
            }
            if (switchU && state.eat(0x7B /* { */ ) && this.regexp_eatHexDigits(state) && state.eat(0x7D /* } */ ) && isValidUnicode(state.lastIntValue)) {
                return true;
            }
            if (switchU) {
                state.raise("Invalid unicode escape");
            }
            state.pos = start;
        }
        return false;
    };
    function isValidUnicode(ch) {
        return ch >= 0 && ch <= 0x10FFFF;
    }
    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
    pp$1.regexp_eatIdentityEscape = function(state) {
        if (state.switchU) {
            if (this.regexp_eatSyntaxCharacter(state)) {
                return true;
            }
            if (state.eat(0x2F /* / */ )) {
                state.lastIntValue = 0x2F; /* / */ 
                return true;
            }
            return false;
        }
        var ch = state.current();
        if (ch !== 0x63 /* c */  && (!state.switchN || ch !== 0x6B /* k */ )) {
            state.lastIntValue = ch;
            state.advance();
            return true;
        }
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
    pp$1.regexp_eatDecimalEscape = function(state) {
        state.lastIntValue = 0;
        var ch = state.current();
        if (ch >= 0x31 /* 1 */  && ch <= 0x39 /* 9 */ ) {
            do {
                state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */ );
                state.advance();
            }while ((ch = state.current()) >= 0x30 /* 0 */  && ch <= 0x39 /* 9 */ )
            return true;
        }
        return false;
    };
    // Return values used by character set parsing methods, needed to
    // forbid negation of sets that can match strings.
    var CharSetNone = 0; // Nothing parsed
    var CharSetOk = 1; // Construct parsed, cannot contain strings
    var CharSetString = 2; // Construct parsed, can contain strings
    // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
    pp$1.regexp_eatCharacterClassEscape = function(state) {
        var ch = state.current();
        if (isCharacterClassEscape(ch)) {
            state.lastIntValue = -1;
            state.advance();
            return CharSetOk;
        }
        var negate = false;
        if (state.switchU && this.options.ecmaVersion >= 9 && ((negate = ch === 0x50 /* P */ ) || ch === 0x70 /* p */ )) {
            state.lastIntValue = -1;
            state.advance();
            var result;
            if (state.eat(0x7B /* { */ ) && (result = this.regexp_eatUnicodePropertyValueExpression(state)) && state.eat(0x7D /* } */ )) {
                if (negate && result === CharSetString) {
                    state.raise("Invalid property name");
                }
                return result;
            }
            state.raise("Invalid property name");
        }
        return CharSetNone;
    };
    function isCharacterClassEscape(ch) {
        return ch === 0x64 /* d */  || ch === 0x44 /* D */  || ch === 0x73 /* s */  || ch === 0x53 /* S */  || ch === 0x77 /* w */  || ch === 0x57 /* W */ ;
    }
    // UnicodePropertyValueExpression ::
    //   UnicodePropertyName `=` UnicodePropertyValue
    //   LoneUnicodePropertyNameOrValue
    pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
        var start = state.pos;
        // UnicodePropertyName `=` UnicodePropertyValue
        if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */ )) {
            var name = state.lastStringValue;
            if (this.regexp_eatUnicodePropertyValue(state)) {
                var value = state.lastStringValue;
                this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
                return CharSetOk;
            }
        }
        state.pos = start;
        // LoneUnicodePropertyNameOrValue
        if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
            var nameOrValue = state.lastStringValue;
            return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
        }
        return CharSetNone;
    };
    pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
        if (!hasOwn(state.unicodeProperties.nonBinary, name)) {
            state.raise("Invalid property name");
        }
        if (!state.unicodeProperties.nonBinary[name].test(value)) {
            state.raise("Invalid property value");
        }
    };
    pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
        if (state.unicodeProperties.binary.test(nameOrValue)) {
            return CharSetOk;
        }
        if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) {
            return CharSetString;
        }
        state.raise("Invalid property name");
    };
    // UnicodePropertyName ::
    //   UnicodePropertyNameCharacters
    pp$1.regexp_eatUnicodePropertyName = function(state) {
        var ch = 0;
        state.lastStringValue = "";
        while(isUnicodePropertyNameCharacter(ch = state.current())){
            state.lastStringValue += codePointToString(ch);
            state.advance();
        }
        return state.lastStringValue !== "";
    };
    function isUnicodePropertyNameCharacter(ch) {
        return isControlLetter(ch) || ch === 0x5F /* _ */ ;
    }
    // UnicodePropertyValue ::
    //   UnicodePropertyValueCharacters
    pp$1.regexp_eatUnicodePropertyValue = function(state) {
        var ch = 0;
        state.lastStringValue = "";
        while(isUnicodePropertyValueCharacter(ch = state.current())){
            state.lastStringValue += codePointToString(ch);
            state.advance();
        }
        return state.lastStringValue !== "";
    };
    function isUnicodePropertyValueCharacter(ch) {
        return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch);
    }
    // LoneUnicodePropertyNameOrValue ::
    //   UnicodePropertyValueCharacters
    pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
        return this.regexp_eatUnicodePropertyValue(state);
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
    pp$1.regexp_eatCharacterClass = function(state) {
        if (state.eat(0x5B /* [ */ )) {
            var negate = state.eat(0x5E /* ^ */ );
            var result = this.regexp_classContents(state);
            if (!state.eat(0x5D /* ] */ )) {
                state.raise("Unterminated character class");
            }
            if (negate && result === CharSetString) {
                state.raise("Negated character class may contain strings");
            }
            return true;
        }
        return false;
    };
    // https://tc39.es/ecma262/#prod-ClassContents
    // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
    pp$1.regexp_classContents = function(state) {
        if (state.current() === 0x5D /* ] */ ) {
            return CharSetOk;
        }
        if (state.switchV) {
            return this.regexp_classSetExpression(state);
        }
        this.regexp_nonEmptyClassRanges(state);
        return CharSetOk;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
    // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
    pp$1.regexp_nonEmptyClassRanges = function(state) {
        while(this.regexp_eatClassAtom(state)){
            var left = state.lastIntValue;
            if (state.eat(0x2D /* - */ ) && this.regexp_eatClassAtom(state)) {
                var right = state.lastIntValue;
                if (state.switchU && (left === -1 || right === -1)) {
                    state.raise("Invalid character class");
                }
                if (left !== -1 && right !== -1 && left > right) {
                    state.raise("Range out of order in character class");
                }
            }
        }
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
    // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
    pp$1.regexp_eatClassAtom = function(state) {
        var start = state.pos;
        if (state.eat(0x5C /* \ */ )) {
            if (this.regexp_eatClassEscape(state)) {
                return true;
            }
            if (state.switchU) {
                // Make the same message as V8.
                var ch$1 = state.current();
                if (ch$1 === 0x63 /* c */  || isOctalDigit(ch$1)) {
                    state.raise("Invalid class escape");
                }
                state.raise("Invalid escape");
            }
            state.pos = start;
        }
        var ch = state.current();
        if (ch !== 0x5D /* ] */ ) {
            state.lastIntValue = ch;
            state.advance();
            return true;
        }
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
    pp$1.regexp_eatClassEscape = function(state) {
        var start = state.pos;
        if (state.eat(0x62 /* b */ )) {
            state.lastIntValue = 0x08; /* <BS> */ 
            return true;
        }
        if (state.switchU && state.eat(0x2D /* - */ )) {
            state.lastIntValue = 0x2D; /* - */ 
            return true;
        }
        if (!state.switchU && state.eat(0x63 /* c */ )) {
            if (this.regexp_eatClassControlLetter(state)) {
                return true;
            }
            state.pos = start;
        }
        return this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state);
    };
    // https://tc39.es/ecma262/#prod-ClassSetExpression
    // https://tc39.es/ecma262/#prod-ClassUnion
    // https://tc39.es/ecma262/#prod-ClassIntersection
    // https://tc39.es/ecma262/#prod-ClassSubtraction
    pp$1.regexp_classSetExpression = function(state) {
        var result = CharSetOk, subResult;
        if (this.regexp_eatClassSetRange(state)) ;
        else if (subResult = this.regexp_eatClassSetOperand(state)) {
            if (subResult === CharSetString) {
                result = CharSetString;
            }
            // https://tc39.es/ecma262/#prod-ClassIntersection
            var start = state.pos;
            while(state.eatChars([
                0x26,
                0x26
            ])){
                if (state.current() !== 0x26 /* & */  && (subResult = this.regexp_eatClassSetOperand(state))) {
                    if (subResult !== CharSetString) {
                        result = CharSetOk;
                    }
                    continue;
                }
                state.raise("Invalid character in character class");
            }
            if (start !== state.pos) {
                return result;
            }
            // https://tc39.es/ecma262/#prod-ClassSubtraction
            while(state.eatChars([
                0x2D,
                0x2D
            ])){
                if (this.regexp_eatClassSetOperand(state)) {
                    continue;
                }
                state.raise("Invalid character in character class");
            }
            if (start !== state.pos) {
                return result;
            }
        } else {
            state.raise("Invalid character in character class");
        }
        // https://tc39.es/ecma262/#prod-ClassUnion
        for(;;){
            if (this.regexp_eatClassSetRange(state)) {
                continue;
            }
            subResult = this.regexp_eatClassSetOperand(state);
            if (!subResult) {
                return result;
            }
            if (subResult === CharSetString) {
                result = CharSetString;
            }
        }
    };
    // https://tc39.es/ecma262/#prod-ClassSetRange
    pp$1.regexp_eatClassSetRange = function(state) {
        var start = state.pos;
        if (this.regexp_eatClassSetCharacter(state)) {
            var left = state.lastIntValue;
            if (state.eat(0x2D /* - */ ) && this.regexp_eatClassSetCharacter(state)) {
                var right = state.lastIntValue;
                if (left !== -1 && right !== -1 && left > right) {
                    state.raise("Range out of order in character class");
                }
                return true;
            }
            state.pos = start;
        }
        return false;
    };
    // https://tc39.es/ecma262/#prod-ClassSetOperand
    pp$1.regexp_eatClassSetOperand = function(state) {
        if (this.regexp_eatClassSetCharacter(state)) {
            return CharSetOk;
        }
        return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state);
    };
    // https://tc39.es/ecma262/#prod-NestedClass
    pp$1.regexp_eatNestedClass = function(state) {
        var start = state.pos;
        if (state.eat(0x5B /* [ */ )) {
            var negate = state.eat(0x5E /* ^ */ );
            var result = this.regexp_classContents(state);
            if (state.eat(0x5D /* ] */ )) {
                if (negate && result === CharSetString) {
                    state.raise("Negated character class may contain strings");
                }
                return result;
            }
            state.pos = start;
        }
        if (state.eat(0x5C /* \ */ )) {
            var result$1 = this.regexp_eatCharacterClassEscape(state);
            if (result$1) {
                return result$1;
            }
            state.pos = start;
        }
        return null;
    };
    // https://tc39.es/ecma262/#prod-ClassStringDisjunction
    pp$1.regexp_eatClassStringDisjunction = function(state) {
        var start = state.pos;
        if (state.eatChars([
            0x5C,
            0x71
        ])) {
            if (state.eat(0x7B /* { */ )) {
                var result = this.regexp_classStringDisjunctionContents(state);
                if (state.eat(0x7D /* } */ )) {
                    return result;
                }
            } else {
                // Make the same message as V8.
                state.raise("Invalid escape");
            }
            state.pos = start;
        }
        return null;
    };
    // https://tc39.es/ecma262/#prod-ClassStringDisjunctionContents
    pp$1.regexp_classStringDisjunctionContents = function(state) {
        var result = this.regexp_classString(state);
        while(state.eat(0x7C /* | */ )){
            if (this.regexp_classString(state) === CharSetString) {
                result = CharSetString;
            }
        }
        return result;
    };
    // https://tc39.es/ecma262/#prod-ClassString
    // https://tc39.es/ecma262/#prod-NonEmptyClassString
    pp$1.regexp_classString = function(state) {
        var count = 0;
        while(this.regexp_eatClassSetCharacter(state)){
            count++;
        }
        return count === 1 ? CharSetOk : CharSetString;
    };
    // https://tc39.es/ecma262/#prod-ClassSetCharacter
    pp$1.regexp_eatClassSetCharacter = function(state) {
        var start = state.pos;
        if (state.eat(0x5C /* \ */ )) {
            if (this.regexp_eatCharacterEscape(state) || this.regexp_eatClassSetReservedPunctuator(state)) {
                return true;
            }
            if (state.eat(0x62 /* b */ )) {
                state.lastIntValue = 0x08; /* <BS> */ 
                return true;
            }
            state.pos = start;
            return false;
        }
        var ch = state.current();
        if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) {
            return false;
        }
        if (isClassSetSyntaxCharacter(ch)) {
            return false;
        }
        state.advance();
        state.lastIntValue = ch;
        return true;
    };
    // https://tc39.es/ecma262/#prod-ClassSetReservedDoublePunctuator
    function isClassSetReservedDoublePunctuatorCharacter(ch) {
        return ch === 0x21 /* ! */  || ch >= 0x23 /* # */  && ch <= 0x26 /* & */  || ch >= 0x2A /* * */  && ch <= 0x2C /* , */  || ch === 0x2E /* . */  || ch >= 0x3A /* : */  && ch <= 0x40 /* @ */  || ch === 0x5E /* ^ */  || ch === 0x60 /* ` */  || ch === 0x7E /* ~ */ ;
    }
    // https://tc39.es/ecma262/#prod-ClassSetSyntaxCharacter
    function isClassSetSyntaxCharacter(ch) {
        return ch === 0x28 /* ( */  || ch === 0x29 /* ) */  || ch === 0x2D /* - */  || ch === 0x2F /* / */  || ch >= 0x5B /* [ */  && ch <= 0x5D /* ] */  || ch >= 0x7B /* { */  && ch <= 0x7D /* } */ ;
    }
    // https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
    pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
        var ch = state.current();
        if (isClassSetReservedPunctuator(ch)) {
            state.lastIntValue = ch;
            state.advance();
            return true;
        }
        return false;
    };
    // https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
    function isClassSetReservedPunctuator(ch) {
        return ch === 0x21 /* ! */  || ch === 0x23 /* # */  || ch === 0x25 /* % */  || ch === 0x26 /* & */  || ch === 0x2C /* , */  || ch === 0x2D /* - */  || ch >= 0x3A /* : */  && ch <= 0x3E /* > */  || ch === 0x40 /* @ */  || ch === 0x60 /* ` */  || ch === 0x7E /* ~ */ ;
    }
    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
    pp$1.regexp_eatClassControlLetter = function(state) {
        var ch = state.current();
        if (isDecimalDigit(ch) || ch === 0x5F /* _ */ ) {
            state.lastIntValue = ch % 0x20;
            state.advance();
            return true;
        }
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
    pp$1.regexp_eatHexEscapeSequence = function(state) {
        var start = state.pos;
        if (state.eat(0x78 /* x */ )) {
            if (this.regexp_eatFixedHexDigits(state, 2)) {
                return true;
            }
            if (state.switchU) {
                state.raise("Invalid escape");
            }
            state.pos = start;
        }
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
    pp$1.regexp_eatDecimalDigits = function(state) {
        var start = state.pos;
        var ch = 0;
        state.lastIntValue = 0;
        while(isDecimalDigit(ch = state.current())){
            state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */ );
            state.advance();
        }
        return state.pos !== start;
    };
    function isDecimalDigit(ch) {
        return ch >= 0x30 /* 0 */  && ch <= 0x39 /* 9 */ ;
    }
    // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
    pp$1.regexp_eatHexDigits = function(state) {
        var start = state.pos;
        var ch = 0;
        state.lastIntValue = 0;
        while(isHexDigit(ch = state.current())){
            state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
            state.advance();
        }
        return state.pos !== start;
    };
    function isHexDigit(ch) {
        return ch >= 0x30 /* 0 */  && ch <= 0x39 /* 9 */  || ch >= 0x41 /* A */  && ch <= 0x46 /* F */  || ch >= 0x61 /* a */  && ch <= 0x66 /* f */ ;
    }
    function hexToInt(ch) {
        if (ch >= 0x41 /* A */  && ch <= 0x46 /* F */ ) {
            return 10 + (ch - 0x41 /* A */ );
        }
        if (ch >= 0x61 /* a */  && ch <= 0x66 /* f */ ) {
            return 10 + (ch - 0x61 /* a */ );
        }
        return ch - 0x30 /* 0 */ ;
    }
    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
    // Allows only 0-377(octal) i.e. 0-255(decimal).
    pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
        if (this.regexp_eatOctalDigit(state)) {
            var n1 = state.lastIntValue;
            if (this.regexp_eatOctalDigit(state)) {
                var n2 = state.lastIntValue;
                if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
                    state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
                } else {
                    state.lastIntValue = n1 * 8 + n2;
                }
            } else {
                state.lastIntValue = n1;
            }
            return true;
        }
        return false;
    };
    // https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
    pp$1.regexp_eatOctalDigit = function(state) {
        var ch = state.current();
        if (isOctalDigit(ch)) {
            state.lastIntValue = ch - 0x30; /* 0 */ 
            state.advance();
            return true;
        }
        state.lastIntValue = 0;
        return false;
    };
    function isOctalDigit(ch) {
        return ch >= 0x30 /* 0 */  && ch <= 0x37 /* 7 */ ;
    }
    // https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
    // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
    // And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
    pp$1.regexp_eatFixedHexDigits = function(state, length) {
        var start = state.pos;
        state.lastIntValue = 0;
        for(var i = 0; i < length; ++i){
            var ch = state.current();
            if (!isHexDigit(ch)) {
                state.pos = start;
                return false;
            }
            state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
            state.advance();
        }
        return true;
    };
    // Object type used to represent tokens. Note that normally, tokens
    // simply exist as properties on the parser object. This is only
    // used for the onToken callback and the external tokenizer.
    var Token = function Token(p) {
        this.type = p.type;
        this.value = p.value;
        this.start = p.start;
        this.end = p.end;
        if (p.options.locations) {
            this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
        }
        if (p.options.ranges) {
            this.range = [
                p.start,
                p.end
            ];
        }
    };
    // ## Tokenizer
    var pp = Parser.prototype;
    // Move to the next token
    pp.next = function(ignoreEscapeSequenceInKeyword) {
        if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc) {
            this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword);
        }
        if (this.options.onToken) {
            this.options.onToken(new Token(this));
        }
        this.lastTokEnd = this.end;
        this.lastTokStart = this.start;
        this.lastTokEndLoc = this.endLoc;
        this.lastTokStartLoc = this.startLoc;
        this.nextToken();
    };
    pp.getToken = function() {
        this.next();
        return new Token(this);
    };
    // If we're in an ES6 environment, make parsers iterable
    if (typeof Symbol !== "undefined") {
        pp[Symbol.iterator] = function() {
            var this$1$1 = this;
            return {
                next: function() {
                    var token = this$1$1.getToken();
                    return {
                        done: token.type === types$1.eof,
                        value: token
                    };
                }
            };
        };
    }
    // Toggle strict mode. Re-reads the next number or string to please
    // pedantic tests (`"use strict"; 010;` should fail).
    // Read a single token, updating the parser object's token-related
    // properties.
    pp.nextToken = function() {
        var curContext = this.curContext();
        if (!curContext || !curContext.preserveSpace) {
            this.skipSpace();
        }
        this.start = this.pos;
        if (this.options.locations) {
            this.startLoc = this.curPosition();
        }
        if (this.pos >= this.input.length) {
            return this.finishToken(types$1.eof);
        }
        if (curContext.override) {
            return curContext.override(this);
        } else {
            this.readToken(this.fullCharCodeAtPos());
        }
    };
    pp.readToken = function(code) {
        // Identifier or keyword. '\uXXXX' sequences are allowed in
        // identifiers, so '\' also dispatches to that.
        if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */ ) {
            return this.readWord();
        }
        return this.getTokenFromCode(code);
    };
    pp.fullCharCodeAtPos = function() {
        var code = this.input.charCodeAt(this.pos);
        if (code <= 0xd7ff || code >= 0xdc00) {
            return code;
        }
        var next = this.input.charCodeAt(this.pos + 1);
        return next <= 0xdbff || next >= 0xe000 ? code : (code << 10) + next - 0x35fdc00;
    };
    pp.skipBlockComment = function() {
        var startLoc = this.options.onComment && this.curPosition();
        var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
        if (end === -1) {
            this.raise(this.pos - 2, "Unterminated comment");
        }
        this.pos = end + 2;
        if (this.options.locations) {
            for(var nextBreak = void 0, pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1;){
                ++this.curLine;
                pos = this.lineStart = nextBreak;
            }
        }
        if (this.options.onComment) {
            this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos, startLoc, this.curPosition());
        }
    };
    pp.skipLineComment = function(startSkip) {
        var start = this.pos;
        var startLoc = this.options.onComment && this.curPosition();
        var ch = this.input.charCodeAt(this.pos += startSkip);
        while(this.pos < this.input.length && !isNewLine(ch)){
            ch = this.input.charCodeAt(++this.pos);
        }
        if (this.options.onComment) {
            this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos, startLoc, this.curPosition());
        }
    };
    // Called at the start of the parse and after every token. Skips
    // whitespace and comments, and.
    pp.skipSpace = function() {
        loop: while(this.pos < this.input.length){
            var ch = this.input.charCodeAt(this.pos);
            switch(ch){
                case 32:
                case 160:
                    ++this.pos;
                    break;
                case 13:
                    if (this.input.charCodeAt(this.pos + 1) === 10) {
                        ++this.pos;
                    }
                case 10:
                case 8232:
                case 8233:
                    ++this.pos;
                    if (this.options.locations) {
                        ++this.curLine;
                        this.lineStart = this.pos;
                    }
                    break;
                case 47:
                    switch(this.input.charCodeAt(this.pos + 1)){
                        case 42:
                            this.skipBlockComment();
                            break;
                        case 47:
                            this.skipLineComment(2);
                            break;
                        default:
                            break loop;
                    }
                    break;
                default:
                    if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
                        ++this.pos;
                    } else {
                        break loop;
                    }
            }
        }
    };
    // Called at the end of every token. Sets `end`, `val`, and
    // maintains `context` and `exprAllowed`, and skips the space after
    // the token, so that the next one's `start` will point at the
    // right position.
    pp.finishToken = function(type, val) {
        this.end = this.pos;
        if (this.options.locations) {
            this.endLoc = this.curPosition();
        }
        var prevType = this.type;
        this.type = type;
        this.value = val;
        this.updateContext(prevType);
    };
    // ### Token reading
    // This is the function that is called to fetch the next token. It
    // is somewhat obscure, because it works in character codes rather
    // than characters, and because operator parsing has been inlined
    // into it.
    //
    // All in the name of speed.
    //
    pp.readToken_dot = function() {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next >= 48 && next <= 57) {
            return this.readNumber(true);
        }
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
            this.pos += 3;
            return this.finishToken(types$1.ellipsis);
        } else {
            ++this.pos;
            return this.finishToken(types$1.dot);
        }
    };
    pp.readToken_slash = function() {
        var next = this.input.charCodeAt(this.pos + 1);
        if (this.exprAllowed) {
            ++this.pos;
            return this.readRegexp();
        }
        if (next === 61) {
            return this.finishOp(types$1.assign, 2);
        }
        return this.finishOp(types$1.slash, 1);
    };
    pp.readToken_mult_modulo_exp = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        var size = 1;
        var tokentype = code === 42 ? types$1.star : types$1.modulo;
        // exponentiation operator ** and **=
        if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
            ++size;
            tokentype = types$1.starstar;
            next = this.input.charCodeAt(this.pos + 2);
        }
        if (next === 61) {
            return this.finishOp(types$1.assign, size + 1);
        }
        return this.finishOp(tokentype, size);
    };
    pp.readToken_pipe_amp = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === code) {
            if (this.options.ecmaVersion >= 12) {
                var next2 = this.input.charCodeAt(this.pos + 2);
                if (next2 === 61) {
                    return this.finishOp(types$1.assign, 3);
                }
            }
            return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2);
        }
        if (next === 61) {
            return this.finishOp(types$1.assign, 2);
        }
        return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1);
    };
    pp.readToken_caret = function() {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 61) {
            return this.finishOp(types$1.assign, 2);
        }
        return this.finishOp(types$1.bitwiseXOR, 1);
    };
    pp.readToken_plus_min = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === code) {
            if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 && (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
                // A `-->` line comment
                this.skipLineComment(3);
                this.skipSpace();
                return this.nextToken();
            }
            return this.finishOp(types$1.incDec, 2);
        }
        if (next === 61) {
            return this.finishOp(types$1.assign, 2);
        }
        return this.finishOp(types$1.plusMin, 1);
    };
    pp.readToken_lt_gt = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        var size = 1;
        if (next === code) {
            size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
            if (this.input.charCodeAt(this.pos + size) === 61) {
                return this.finishOp(types$1.assign, size + 1);
            }
            return this.finishOp(types$1.bitShift, size);
        }
        if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 && this.input.charCodeAt(this.pos + 3) === 45) {
            // `<!--`, an XML-style comment that should be interpreted as a line comment
            this.skipLineComment(4);
            this.skipSpace();
            return this.nextToken();
        }
        if (next === 61) {
            size = 2;
        }
        return this.finishOp(types$1.relational, size);
    };
    pp.readToken_eq_excl = function(code) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 61) {
            return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
        }
        if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
            this.pos += 2;
            return this.finishToken(types$1.arrow);
        }
        return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1);
    };
    pp.readToken_question = function() {
        var ecmaVersion = this.options.ecmaVersion;
        if (ecmaVersion >= 11) {
            var next = this.input.charCodeAt(this.pos + 1);
            if (next === 46) {
                var next2 = this.input.charCodeAt(this.pos + 2);
                if (next2 < 48 || next2 > 57) {
                    return this.finishOp(types$1.questionDot, 2);
                }
            }
            if (next === 63) {
                if (ecmaVersion >= 12) {
                    var next2$1 = this.input.charCodeAt(this.pos + 2);
                    if (next2$1 === 61) {
                        return this.finishOp(types$1.assign, 3);
                    }
                }
                return this.finishOp(types$1.coalesce, 2);
            }
        }
        return this.finishOp(types$1.question, 1);
    };
    pp.readToken_numberSign = function() {
        var ecmaVersion = this.options.ecmaVersion;
        var code = 35; // '#'
        if (ecmaVersion >= 13) {
            ++this.pos;
            code = this.fullCharCodeAtPos();
            if (isIdentifierStart(code, true) || code === 92 /* '\' */ ) {
                return this.finishToken(types$1.privateId, this.readWord1());
            }
        }
        this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
    };
    pp.getTokenFromCode = function(code) {
        switch(code){
            // The interpretation of a dot depends on whether it is followed
            // by a digit or another two dots.
            case 46:
                return this.readToken_dot();
            // Punctuation tokens.
            case 40:
                ++this.pos;
                return this.finishToken(types$1.parenL);
            case 41:
                ++this.pos;
                return this.finishToken(types$1.parenR);
            case 59:
                ++this.pos;
                return this.finishToken(types$1.semi);
            case 44:
                ++this.pos;
                return this.finishToken(types$1.comma);
            case 91:
                ++this.pos;
                return this.finishToken(types$1.bracketL);
            case 93:
                ++this.pos;
                return this.finishToken(types$1.bracketR);
            case 123:
                ++this.pos;
                return this.finishToken(types$1.braceL);
            case 125:
                ++this.pos;
                return this.finishToken(types$1.braceR);
            case 58:
                ++this.pos;
                return this.finishToken(types$1.colon);
            case 96:
                if (this.options.ecmaVersion < 6) {
                    break;
                }
                ++this.pos;
                return this.finishToken(types$1.backQuote);
            case 48:
                var next = this.input.charCodeAt(this.pos + 1);
                if (next === 120 || next === 88) {
                    return this.readRadixNumber(16);
                } // '0x', '0X' - hex number
                if (this.options.ecmaVersion >= 6) {
                    if (next === 111 || next === 79) {
                        return this.readRadixNumber(8);
                    } // '0o', '0O' - octal number
                    if (next === 98 || next === 66) {
                        return this.readRadixNumber(2);
                    } // '0b', '0B' - binary number
                }
            // Anything else beginning with a digit is an integer, octal
            // number, or float.
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
                return this.readNumber(false);
            // Quotes produce strings.
            case 34:
            case 39:
                return this.readString(code);
            // Operators are parsed inline in tiny state machines. '=' (61) is
            // often referred to. `finishOp` simply skips the amount of
            // characters it is given as second argument, and returns a token
            // of the type given by its first argument.
            case 47:
                return this.readToken_slash();
            case 37:
            case 42:
                return this.readToken_mult_modulo_exp(code);
            case 124:
            case 38:
                return this.readToken_pipe_amp(code);
            case 94:
                return this.readToken_caret();
            case 43:
            case 45:
                return this.readToken_plus_min(code);
            case 60:
            case 62:
                return this.readToken_lt_gt(code);
            case 61:
            case 33:
                return this.readToken_eq_excl(code);
            case 63:
                return this.readToken_question();
            case 126:
                return this.finishOp(types$1.prefix, 1);
            case 35:
                return this.readToken_numberSign();
        }
        this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
    };
    pp.finishOp = function(type, size) {
        var str = this.input.slice(this.pos, this.pos + size);
        this.pos += size;
        return this.finishToken(type, str);
    };
    pp.readRegexp = function() {
        var escaped, inClass, start = this.pos;
        for(;;){
            if (this.pos >= this.input.length) {
                this.raise(start, "Unterminated regular expression");
            }
            var ch = this.input.charAt(this.pos);
            if (lineBreak.test(ch)) {
                this.raise(start, "Unterminated regular expression");
            }
            if (!escaped) {
                if (ch === "[") {
                    inClass = true;
                } else if (ch === "]" && inClass) {
                    inClass = false;
                } else if (ch === "/" && !inClass) {
                    break;
                }
                escaped = ch === "\\";
            } else {
                escaped = false;
            }
            ++this.pos;
        }
        var pattern = this.input.slice(start, this.pos);
        ++this.pos;
        var flagsStart = this.pos;
        var flags = this.readWord1();
        if (this.containsEsc) {
            this.unexpected(flagsStart);
        }
        // Validate pattern
        var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
        state.reset(start, pattern, flags);
        this.validateRegExpFlags(state);
        this.validateRegExpPattern(state);
        // Create Literal#value property value.
        var value = null;
        try {
            value = new RegExp(pattern, flags);
        } catch (e) {
        // ESTree requires null if it failed to instantiate RegExp object.
        // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
        }
        return this.finishToken(types$1.regexp, {
            pattern: pattern,
            flags: flags,
            value: value
        });
    };
    // Read an integer in the given radix. Return null if zero digits
    // were read, the integer value otherwise. When `len` is given, this
    // will return `null` unless the integer has exactly `len` digits.
    pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
        // `len` is used for character escape sequences. In that case, disallow separators.
        var allowSeparators = this.options.ecmaVersion >= 12 && len === undefined;
        // `maybeLegacyOctalNumericLiteral` is true if it doesn't have prefix (0x,0o,0b)
        // and isn't fraction part nor exponent part. In that case, if the first digit
        // is zero then disallow separators.
        var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;
        var start = this.pos, total = 0, lastCode = 0;
        for(var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos){
            var code = this.input.charCodeAt(this.pos), val = void 0;
            if (allowSeparators && code === 95) {
                if (isLegacyOctalNumericLiteral) {
                    this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals");
                }
                if (lastCode === 95) {
                    this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore");
                }
                if (i === 0) {
                    this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits");
                }
                lastCode = code;
                continue;
            }
            if (code >= 97) {
                val = code - 97 + 10;
            } else if (code >= 65) {
                val = code - 65 + 10;
            } else if (code >= 48 && code <= 57) {
                val = code - 48;
            } else {
                val = Infinity;
            }
            if (val >= radix) {
                break;
            }
            lastCode = code;
            total = total * radix + val;
        }
        if (allowSeparators && lastCode === 95) {
            this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits");
        }
        if (this.pos === start || len != null && this.pos - start !== len) {
            return null;
        }
        return total;
    };
    function stringToNumber(str, isLegacyOctalNumericLiteral) {
        if (isLegacyOctalNumericLiteral) {
            return parseInt(str, 8);
        }
        // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.
        return parseFloat(str.replace(/_/g, ""));
    }
    function stringToBigInt(str) {
        if (typeof BigInt !== "function") {
            return null;
        }
        // `BigInt(value)` throws syntax error if the string contains numeric separators.
        return BigInt(str.replace(/_/g, ""));
    }
    pp.readRadixNumber = function(radix) {
        var start = this.pos;
        this.pos += 2; // 0x
        var val = this.readInt(radix);
        if (val == null) {
            this.raise(this.start + 2, "Expected number in radix " + radix);
        }
        if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
            val = stringToBigInt(this.input.slice(start, this.pos));
            ++this.pos;
        } else if (isIdentifierStart(this.fullCharCodeAtPos())) {
            this.raise(this.pos, "Identifier directly after number");
        }
        return this.finishToken(types$1.num, val);
    };
    // Read an integer, octal integer, or floating-point number.
    pp.readNumber = function(startsWithDot) {
        var start = this.pos;
        if (!startsWithDot && this.readInt(10, undefined, true) === null) {
            this.raise(start, "Invalid number");
        }
        var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
        if (octal && this.strict) {
            this.raise(start, "Invalid number");
        }
        var next = this.input.charCodeAt(this.pos);
        if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
            var val$1 = stringToBigInt(this.input.slice(start, this.pos));
            ++this.pos;
            if (isIdentifierStart(this.fullCharCodeAtPos())) {
                this.raise(this.pos, "Identifier directly after number");
            }
            return this.finishToken(types$1.num, val$1);
        }
        if (octal && /[89]/.test(this.input.slice(start, this.pos))) {
            octal = false;
        }
        if (next === 46 && !octal) {
            ++this.pos;
            this.readInt(10);
            next = this.input.charCodeAt(this.pos);
        }
        if ((next === 69 || next === 101) && !octal) {
            next = this.input.charCodeAt(++this.pos);
            if (next === 43 || next === 45) {
                ++this.pos;
            } // '+-'
            if (this.readInt(10) === null) {
                this.raise(start, "Invalid number");
            }
        }
        if (isIdentifierStart(this.fullCharCodeAtPos())) {
            this.raise(this.pos, "Identifier directly after number");
        }
        var val = stringToNumber(this.input.slice(start, this.pos), octal);
        return this.finishToken(types$1.num, val);
    };
    // Read a string value, interpreting backslash-escapes.
    pp.readCodePoint = function() {
        var ch = this.input.charCodeAt(this.pos), code;
        if (ch === 123) {
            if (this.options.ecmaVersion < 6) {
                this.unexpected();
            }
            var codePos = ++this.pos;
            code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
            ++this.pos;
            if (code > 0x10FFFF) {
                this.invalidStringToken(codePos, "Code point out of bounds");
            }
        } else {
            code = this.readHexChar(4);
        }
        return code;
    };
    pp.readString = function(quote) {
        var out = "", chunkStart = ++this.pos;
        for(;;){
            if (this.pos >= this.input.length) {
                this.raise(this.start, "Unterminated string constant");
            }
            var ch = this.input.charCodeAt(this.pos);
            if (ch === quote) {
                break;
            }
            if (ch === 92) {
                out += this.input.slice(chunkStart, this.pos);
                out += this.readEscapedChar(false);
                chunkStart = this.pos;
            } else if (ch === 0x2028 || ch === 0x2029) {
                if (this.options.ecmaVersion < 10) {
                    this.raise(this.start, "Unterminated string constant");
                }
                ++this.pos;
                if (this.options.locations) {
                    this.curLine++;
                    this.lineStart = this.pos;
                }
            } else {
                if (isNewLine(ch)) {
                    this.raise(this.start, "Unterminated string constant");
                }
                ++this.pos;
            }
        }
        out += this.input.slice(chunkStart, this.pos++);
        return this.finishToken(types$1.string, out);
    };
    // Reads template string tokens.
    var INVALID_TEMPLATE_ESCAPE_ERROR = {};
    pp.tryReadTemplateToken = function() {
        this.inTemplateElement = true;
        try {
            this.readTmplToken();
        } catch (err) {
            if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
                this.readInvalidTemplateToken();
            } else {
                throw err;
            }
        }
        this.inTemplateElement = false;
    };
    pp.invalidStringToken = function(position, message) {
        if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
            throw INVALID_TEMPLATE_ESCAPE_ERROR;
        } else {
            this.raise(position, message);
        }
    };
    pp.readTmplToken = function() {
        var out = "", chunkStart = this.pos;
        for(;;){
            if (this.pos >= this.input.length) {
                this.raise(this.start, "Unterminated template");
            }
            var ch = this.input.charCodeAt(this.pos);
            if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
                if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
                    if (ch === 36) {
                        this.pos += 2;
                        return this.finishToken(types$1.dollarBraceL);
                    } else {
                        ++this.pos;
                        return this.finishToken(types$1.backQuote);
                    }
                }
                out += this.input.slice(chunkStart, this.pos);
                return this.finishToken(types$1.template, out);
            }
            if (ch === 92) {
                out += this.input.slice(chunkStart, this.pos);
                out += this.readEscapedChar(true);
                chunkStart = this.pos;
            } else if (isNewLine(ch)) {
                out += this.input.slice(chunkStart, this.pos);
                ++this.pos;
                switch(ch){
                    case 13:
                        if (this.input.charCodeAt(this.pos) === 10) {
                            ++this.pos;
                        }
                    case 10:
                        out += "\n";
                        break;
                    default:
                        out += String.fromCharCode(ch);
                        break;
                }
                if (this.options.locations) {
                    ++this.curLine;
                    this.lineStart = this.pos;
                }
                chunkStart = this.pos;
            } else {
                ++this.pos;
            }
        }
    };
    // Reads a template token to search for the end, without validating any escape sequences
    pp.readInvalidTemplateToken = function() {
        for(; this.pos < this.input.length; this.pos++){
            switch(this.input[this.pos]){
                case "\\":
                    ++this.pos;
                    break;
                case "$":
                    if (this.input[this.pos + 1] !== "{") {
                        break;
                    }
                // fall through
                case "`":
                    return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos));
                case "\r":
                    if (this.input[this.pos + 1] === "\n") {
                        ++this.pos;
                    }
                // fall through
                case "\n":
                case "\u2028":
                case "\u2029":
                    ++this.curLine;
                    this.lineStart = this.pos + 1;
                    break;
            }
        }
        this.raise(this.start, "Unterminated template");
    };
    // Used to read escaped characters
    pp.readEscapedChar = function(inTemplate) {
        var ch = this.input.charCodeAt(++this.pos);
        ++this.pos;
        switch(ch){
            case 110:
                return "\n" // 'n' -> '\n'
                ;
            case 114:
                return "\r" // 'r' -> '\r'
                ;
            case 120:
                return String.fromCharCode(this.readHexChar(2)) // 'x'
                ;
            case 117:
                return codePointToString(this.readCodePoint()) // 'u'
                ;
            case 116:
                return "\t" // 't' -> '\t'
                ;
            case 98:
                return "\b" // 'b' -> '\b'
                ;
            case 118:
                return "\u000b" // 'v' -> '\u000b'
                ;
            case 102:
                return "\f" // 'f' -> '\f'
                ;
            case 13:
                if (this.input.charCodeAt(this.pos) === 10) {
                    ++this.pos;
                } // '\r\n'
            case 10:
                if (this.options.locations) {
                    this.lineStart = this.pos;
                    ++this.curLine;
                }
                return "";
            case 56:
            case 57:
                if (this.strict) {
                    this.invalidStringToken(this.pos - 1, "Invalid escape sequence");
                }
                if (inTemplate) {
                    var codePos = this.pos - 1;
                    this.invalidStringToken(codePos, "Invalid escape sequence in template string");
                }
            default:
                if (ch >= 48 && ch <= 55) {
                    var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
                    var octal = parseInt(octalStr, 8);
                    if (octal > 255) {
                        octalStr = octalStr.slice(0, -1);
                        octal = parseInt(octalStr, 8);
                    }
                    this.pos += octalStr.length - 1;
                    ch = this.input.charCodeAt(this.pos);
                    if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
                        this.invalidStringToken(this.pos - 1 - octalStr.length, inTemplate ? "Octal literal in template string" : "Octal literal in strict mode");
                    }
                    return String.fromCharCode(octal);
                }
                if (isNewLine(ch)) {
                    // Unicode new line characters after \ get removed from output in both
                    // template literals and strings
                    if (this.options.locations) {
                        this.lineStart = this.pos;
                        ++this.curLine;
                    }
                    return "";
                }
                return String.fromCharCode(ch);
        }
    };
    // Used to read character escape sequences ('\x', '\u', '\U').
    pp.readHexChar = function(len) {
        var codePos = this.pos;
        var n = this.readInt(16, len);
        if (n === null) {
            this.invalidStringToken(codePos, "Bad character escape sequence");
        }
        return n;
    };
    // Read an identifier, and return it as a string. Sets `this.containsEsc`
    // to whether the word contained a '\u' escape.
    //
    // Incrementally adds only escaped chars, adding other chunks as-is
    // as a micro-optimization.
    pp.readWord1 = function() {
        this.containsEsc = false;
        var word = "", first = true, chunkStart = this.pos;
        var astral = this.options.ecmaVersion >= 6;
        while(this.pos < this.input.length){
            var ch = this.fullCharCodeAtPos();
            if (isIdentifierChar(ch, astral)) {
                this.pos += ch <= 0xffff ? 1 : 2;
            } else if (ch === 92) {
                this.containsEsc = true;
                word += this.input.slice(chunkStart, this.pos);
                var escStart = this.pos;
                if (this.input.charCodeAt(++this.pos) !== 117) {
                    this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX");
                }
                ++this.pos;
                var esc = this.readCodePoint();
                if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) {
                    this.invalidStringToken(escStart, "Invalid Unicode escape");
                }
                word += codePointToString(esc);
                chunkStart = this.pos;
            } else {
                break;
            }
            first = false;
        }
        return word + this.input.slice(chunkStart, this.pos);
    };
    // Read an identifier or keyword token. Will check for reserved
    // words when necessary.
    pp.readWord = function() {
        var word = this.readWord1();
        var type = types$1.name;
        if (this.keywords.test(word)) {
            type = keywords[word];
        }
        return this.finishToken(type, word);
    };
    // Acorn is a tiny, fast JavaScript parser written in JavaScript.
    //
    // Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
    // various contributors and released under an MIT license.
    //
    // Git repositories for Acorn are available at
    //
    //     http://marijnhaverbeke.nl/git/acorn
    //     https://github.com/acornjs/acorn.git
    //
    // Please use the [github bug tracker][ghbt] to report issues.
    //
    // [ghbt]: https://github.com/acornjs/acorn/issues
    //
    // [walk]: util/walk.js
    var version = "8.12.1";
    Parser.acorn = {
        Parser: Parser,
        version: version,
        defaultOptions: defaultOptions,
        Position: Position,
        SourceLocation: SourceLocation,
        getLineInfo: getLineInfo,
        Node: Node,
        TokenType: TokenType,
        tokTypes: types$1,
        keywordTypes: keywords,
        TokContext: TokContext,
        tokContexts: types,
        isIdentifierChar: isIdentifierChar,
        isIdentifierStart: isIdentifierStart,
        Token: Token,
        isNewLine: isNewLine,
        lineBreak: lineBreak,
        lineBreakG: lineBreakG,
        nonASCIIwhitespace: nonASCIIwhitespace
    };
    // The main exported interface (under `self.acorn` when in the
    // browser) is a `parse` function that takes a code string and returns
    // an abstract syntax tree as specified by the [ESTree spec][estree].
    //
    // [estree]: https://github.com/estree/estree
    function parse(input, options) {
        return Parser.parse(input, options);
    }
    // This function tries to parse a single expression at a given
    // offset in a string. Useful for parsing mixed-language formats
    // that embed JavaScript expressions.
    function parseExpressionAt(input, pos, options) {
        return Parser.parseExpressionAt(input, pos, options);
    }
    // Acorn is organized as a tokenizer and a recursive-descent parser.
    // The `tokenizer` export provides an interface to the tokenizer.
    function tokenizer(input, options) {
        return Parser.tokenizer(input, options);
    }
    exports1.Node = Node;
    exports1.Parser = Parser;
    exports1.Position = Position;
    exports1.SourceLocation = SourceLocation;
    exports1.TokContext = TokContext;
    exports1.Token = Token;
    exports1.TokenType = TokenType;
    exports1.defaultOptions = defaultOptions;
    exports1.getLineInfo = getLineInfo;
    exports1.isIdentifierChar = isIdentifierChar;
    exports1.isIdentifierStart = isIdentifierStart;
    exports1.isNewLine = isNewLine;
    exports1.keywordTypes = keywords;
    exports1.lineBreak = lineBreak;
    exports1.lineBreakG = lineBreakG;
    exports1.nonASCIIwhitespace = nonASCIIwhitespace;
    exports1.parse = parse;
    exports1.parseExpressionAt = parseExpressionAt;
    exports1.tokContexts = types;
    exports1.tokTypes = types$1;
    exports1.tokenizer = tokenizer;
    exports1.version = version;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvYWNvcm4tOC4xMi4xLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGdsb2JhbCA9IHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbFRoaXMgOiBnbG9iYWwgfHwgc2VsZiwgZmFjdG9yeShnbG9iYWwuYWNvcm4gPSB7fSkpO1xufSkodGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxuICAvLyBUaGlzIGZpbGUgd2FzIGdlbmVyYXRlZC4gRG8gbm90IG1vZGlmeSBtYW51YWxseSFcbiAgdmFyIGFzdHJhbElkZW50aWZpZXJDb2RlcyA9IFs1MDksIDAsIDIyNywgMCwgMTUwLCA0LCAyOTQsIDksIDEzNjgsIDIsIDIsIDEsIDYsIDMsIDQxLCAyLCA1LCAwLCAxNjYsIDEsIDU3NCwgMywgOSwgOSwgMzcwLCAxLCA4MSwgMiwgNzEsIDEwLCA1MCwgMywgMTIzLCAyLCA1NCwgMTQsIDMyLCAxMCwgMywgMSwgMTEsIDMsIDQ2LCAxMCwgOCwgMCwgNDYsIDksIDcsIDIsIDM3LCAxMywgMiwgOSwgNiwgMSwgNDUsIDAsIDEzLCAyLCA0OSwgMTMsIDksIDMsIDIsIDExLCA4MywgMTEsIDcsIDAsIDMsIDAsIDE1OCwgMTEsIDYsIDksIDcsIDMsIDU2LCAxLCAyLCA2LCAzLCAxLCAzLCAyLCAxMCwgMCwgMTEsIDEsIDMsIDYsIDQsIDQsIDE5MywgMTcsIDEwLCA5LCA1LCAwLCA4MiwgMTksIDEzLCA5LCAyMTQsIDYsIDMsIDgsIDI4LCAxLCA4MywgMTYsIDE2LCA5LCA4MiwgMTIsIDksIDksIDg0LCAxNCwgNSwgOSwgMjQzLCAxNCwgMTY2LCA5LCA3MSwgNSwgMiwgMSwgMywgMywgMiwgMCwgMiwgMSwgMTMsIDksIDEyMCwgNiwgMywgNiwgNCwgMCwgMjksIDksIDQxLCA2LCAyLCAzLCA5LCAwLCAxMCwgMTAsIDQ3LCAxNSwgNDA2LCA3LCAyLCA3LCAxNywgOSwgNTcsIDIxLCAyLCAxMywgMTIzLCA1LCA0LCAwLCAyLCAxLCAyLCA2LCAyLCAwLCA5LCA5LCA0OSwgNCwgMiwgMSwgMiwgNCwgOSwgOSwgMzMwLCAzLCAxMCwgMSwgMiwgMCwgNDksIDYsIDQsIDQsIDE0LCA5LCA1MzUxLCAwLCA3LCAxNCwgMTM4MzUsIDksIDg3LCA5LCAzOSwgNCwgNjAsIDYsIDI2LCA5LCAxMDE0LCAwLCAyLCA1NCwgOCwgMywgODIsIDAsIDEyLCAxLCAxOTYyOCwgMSwgNDcwNiwgNDUsIDMsIDIyLCA1NDMsIDQsIDQsIDUsIDksIDcsIDMsIDYsIDMxLCAzLCAxNDksIDIsIDE0MTgsIDQ5LCA1MTMsIDU0LCA1LCA0OSwgOSwgMCwgMTUsIDAsIDIzLCA0LCAyLCAxNCwgMTM2MSwgNiwgMiwgMTYsIDMsIDYsIDIsIDEsIDIsIDQsIDEwMSwgMCwgMTYxLCA2LCAxMCwgOSwgMzU3LCAwLCA2MiwgMTMsIDQ5OSwgMTMsIDk4MywgNiwgMTEwLCA2LCA2LCA5LCA0NzU5LCA5LCA3ODc3MTksIDIzOV07XG5cbiAgLy8gVGhpcyBmaWxlIHdhcyBnZW5lcmF0ZWQuIERvIG5vdCBtb2RpZnkgbWFudWFsbHkhXG4gIHZhciBhc3RyYWxJZGVudGlmaWVyU3RhcnRDb2RlcyA9IFswLCAxMSwgMiwgMjUsIDIsIDE4LCAyLCAxLCAyLCAxNCwgMywgMTMsIDM1LCAxMjIsIDcwLCA1MiwgMjY4LCAyOCwgNCwgNDgsIDQ4LCAzMSwgMTQsIDI5LCA2LCAzNywgMTEsIDI5LCAzLCAzNSwgNSwgNywgMiwgNCwgNDMsIDE1NywgMTksIDM1LCA1LCAzNSwgNSwgMzksIDksIDUxLCAxMywgMTAsIDIsIDE0LCAyLCA2LCAyLCAxLCAyLCAxMCwgMiwgMTQsIDIsIDYsIDIsIDEsIDY4LCAzMTAsIDEwLCAyMSwgMTEsIDcsIDI1LCA1LCAyLCA0MSwgMiwgOCwgNzAsIDUsIDMsIDAsIDIsIDQzLCAyLCAxLCA0LCAwLCAzLCAyMiwgMTEsIDIyLCAxMCwgMzAsIDY2LCAxOCwgMiwgMSwgMTEsIDIxLCAxMSwgMjUsIDcxLCA1NSwgNywgMSwgNjUsIDAsIDE2LCAzLCAyLCAyLCAyLCAyOCwgNDMsIDI4LCA0LCAyOCwgMzYsIDcsIDIsIDI3LCAyOCwgNTMsIDExLCAyMSwgMTEsIDE4LCAxNCwgMTcsIDExMSwgNzIsIDU2LCA1MCwgMTQsIDUwLCAxNCwgMzUsIDM0OSwgNDEsIDcsIDEsIDc5LCAyOCwgMTEsIDAsIDksIDIxLCA0MywgMTcsIDQ3LCAyMCwgMjgsIDIyLCAxMywgNTIsIDU4LCAxLCAzLCAwLCAxNCwgNDQsIDMzLCAyNCwgMjcsIDM1LCAzMCwgMCwgMywgMCwgOSwgMzQsIDQsIDAsIDEzLCA0NywgMTUsIDMsIDIyLCAwLCAyLCAwLCAzNiwgMTcsIDIsIDI0LCAyMCwgMSwgNjQsIDYsIDIsIDAsIDIsIDMsIDIsIDE0LCAyLCA5LCA4LCA0NiwgMzksIDcsIDMsIDEsIDMsIDIxLCAyLCA2LCAyLCAxLCAyLCA0LCA0LCAwLCAxOSwgMCwgMTMsIDQsIDE1OSwgNTIsIDE5LCAzLCAyMSwgMiwgMzEsIDQ3LCAyMSwgMSwgMiwgMCwgMTg1LCA0NiwgNDIsIDMsIDM3LCA0NywgMjEsIDAsIDYwLCA0MiwgMTQsIDAsIDcyLCAyNiwgMzgsIDYsIDE4NiwgNDMsIDExNywgNjMsIDMyLCA3LCAzLCAwLCAzLCA3LCAyLCAxLCAyLCAyMywgMTYsIDAsIDIsIDAsIDk1LCA3LCAzLCAzOCwgMTcsIDAsIDIsIDAsIDI5LCAwLCAxMSwgMzksIDgsIDAsIDIyLCAwLCAxMiwgNDUsIDIwLCAwLCAxOSwgNzIsIDI2NCwgOCwgMiwgMzYsIDE4LCAwLCA1MCwgMjksIDExMywgNiwgMiwgMSwgMiwgMzcsIDIyLCAwLCAyNiwgNSwgMiwgMSwgMiwgMzEsIDE1LCAwLCAzMjgsIDE4LCAxNiwgMCwgMiwgMTIsIDIsIDMzLCAxMjUsIDAsIDgwLCA5MjEsIDEwMywgMTEwLCAxOCwgMTk1LCAyNjM3LCA5NiwgMTYsIDEwNzEsIDE4LCA1LCA0MDI2LCA1ODIsIDg2MzQsIDU2OCwgOCwgMzAsIDE4LCA3OCwgMTgsIDI5LCAxOSwgNDcsIDE3LCAzLCAzMiwgMjAsIDYsIDE4LCA2ODksIDYzLCAxMjksIDc0LCA2LCAwLCA2NywgMTIsIDY1LCAxLCAyLCAwLCAyOSwgNjEzNSwgOSwgMTIzNywgNDMsIDgsIDg5MzYsIDMsIDIsIDYsIDIsIDEsIDIsIDI5MCwgMTYsIDAsIDMwLCAyLCAzLCAwLCAxNSwgMywgOSwgMzk1LCAyMzA5LCAxMDYsIDYsIDEyLCA0LCA4LCA4LCA5LCA1OTkxLCA4NCwgMiwgNzAsIDIsIDEsIDMsIDAsIDMsIDEsIDMsIDMsIDIsIDExLCAyLCAwLCAyLCA2LCAyLCA2NCwgMiwgMywgMywgNywgMiwgNiwgMiwgMjcsIDIsIDMsIDIsIDQsIDIsIDAsIDQsIDYsIDIsIDMzOSwgMywgMjQsIDIsIDI0LCAyLCAzMCwgMiwgMjQsIDIsIDMwLCAyLCAyNCwgMiwgMzAsIDIsIDI0LCAyLCAzMCwgMiwgMjQsIDIsIDcsIDE4NDUsIDMwLCA3LCA1LCAyNjIsIDYxLCAxNDcsIDQ0LCAxMSwgNiwgMTcsIDAsIDMyMiwgMjksIDE5LCA0MywgNDg1LCAyNywgNzU3LCA2LCAyLCAzLCAyLCAxLCAyLCAxNCwgMiwgMTk2LCA2MCwgNjcsIDgsIDAsIDEyMDUsIDMsIDIsIDI2LCAyLCAxLCAyLCAwLCAzLCAwLCAyLCA5LCAyLCAzLCAyLCAwLCAyLCAwLCA3LCAwLCA1LCAwLCAyLCAwLCAyLCAwLCAyLCAyLCAyLCAxLCAyLCAwLCAzLCAwLCAyLCAwLCAyLCAwLCAyLCAwLCAyLCAwLCAyLCAxLCAyLCAwLCAzLCAzLCAyLCA2LCAyLCAzLCAyLCAzLCAyLCAwLCAyLCA5LCAyLCAxNiwgNiwgMiwgMiwgNCwgMiwgMTYsIDQ0MjEsIDQyNzE5LCAzMywgNDE1MywgNywgMjIxLCAzLCA1NzYxLCAxNSwgNzQ3MiwgMTYsIDYyMSwgMjQ2NywgNTQxLCAxNTA3LCA0OTM4LCA2LCA0MTkxXTtcblxuICAvLyBUaGlzIGZpbGUgd2FzIGdlbmVyYXRlZC4gRG8gbm90IG1vZGlmeSBtYW51YWxseSFcbiAgdmFyIG5vbkFTQ0lJaWRlbnRpZmllckNoYXJzID0gXCJcXHUyMDBjXFx1MjAwZFxceGI3XFx1MDMwMC1cXHUwMzZmXFx1MDM4N1xcdTA0ODMtXFx1MDQ4N1xcdTA1OTEtXFx1MDViZFxcdTA1YmZcXHUwNWMxXFx1MDVjMlxcdTA1YzRcXHUwNWM1XFx1MDVjN1xcdTA2MTAtXFx1MDYxYVxcdTA2NGItXFx1MDY2OVxcdTA2NzBcXHUwNmQ2LVxcdTA2ZGNcXHUwNmRmLVxcdTA2ZTRcXHUwNmU3XFx1MDZlOFxcdTA2ZWEtXFx1MDZlZFxcdTA2ZjAtXFx1MDZmOVxcdTA3MTFcXHUwNzMwLVxcdTA3NGFcXHUwN2E2LVxcdTA3YjBcXHUwN2MwLVxcdTA3YzlcXHUwN2ViLVxcdTA3ZjNcXHUwN2ZkXFx1MDgxNi1cXHUwODE5XFx1MDgxYi1cXHUwODIzXFx1MDgyNS1cXHUwODI3XFx1MDgyOS1cXHUwODJkXFx1MDg1OS1cXHUwODViXFx1MDg5OC1cXHUwODlmXFx1MDhjYS1cXHUwOGUxXFx1MDhlMy1cXHUwOTAzXFx1MDkzYS1cXHUwOTNjXFx1MDkzZS1cXHUwOTRmXFx1MDk1MS1cXHUwOTU3XFx1MDk2MlxcdTA5NjNcXHUwOTY2LVxcdTA5NmZcXHUwOTgxLVxcdTA5ODNcXHUwOWJjXFx1MDliZS1cXHUwOWM0XFx1MDljN1xcdTA5YzhcXHUwOWNiLVxcdTA5Y2RcXHUwOWQ3XFx1MDllMlxcdTA5ZTNcXHUwOWU2LVxcdTA5ZWZcXHUwOWZlXFx1MGEwMS1cXHUwYTAzXFx1MGEzY1xcdTBhM2UtXFx1MGE0MlxcdTBhNDdcXHUwYTQ4XFx1MGE0Yi1cXHUwYTRkXFx1MGE1MVxcdTBhNjYtXFx1MGE3MVxcdTBhNzVcXHUwYTgxLVxcdTBhODNcXHUwYWJjXFx1MGFiZS1cXHUwYWM1XFx1MGFjNy1cXHUwYWM5XFx1MGFjYi1cXHUwYWNkXFx1MGFlMlxcdTBhZTNcXHUwYWU2LVxcdTBhZWZcXHUwYWZhLVxcdTBhZmZcXHUwYjAxLVxcdTBiMDNcXHUwYjNjXFx1MGIzZS1cXHUwYjQ0XFx1MGI0N1xcdTBiNDhcXHUwYjRiLVxcdTBiNGRcXHUwYjU1LVxcdTBiNTdcXHUwYjYyXFx1MGI2M1xcdTBiNjYtXFx1MGI2ZlxcdTBiODJcXHUwYmJlLVxcdTBiYzJcXHUwYmM2LVxcdTBiYzhcXHUwYmNhLVxcdTBiY2RcXHUwYmQ3XFx1MGJlNi1cXHUwYmVmXFx1MGMwMC1cXHUwYzA0XFx1MGMzY1xcdTBjM2UtXFx1MGM0NFxcdTBjNDYtXFx1MGM0OFxcdTBjNGEtXFx1MGM0ZFxcdTBjNTVcXHUwYzU2XFx1MGM2MlxcdTBjNjNcXHUwYzY2LVxcdTBjNmZcXHUwYzgxLVxcdTBjODNcXHUwY2JjXFx1MGNiZS1cXHUwY2M0XFx1MGNjNi1cXHUwY2M4XFx1MGNjYS1cXHUwY2NkXFx1MGNkNVxcdTBjZDZcXHUwY2UyXFx1MGNlM1xcdTBjZTYtXFx1MGNlZlxcdTBjZjNcXHUwZDAwLVxcdTBkMDNcXHUwZDNiXFx1MGQzY1xcdTBkM2UtXFx1MGQ0NFxcdTBkNDYtXFx1MGQ0OFxcdTBkNGEtXFx1MGQ0ZFxcdTBkNTdcXHUwZDYyXFx1MGQ2M1xcdTBkNjYtXFx1MGQ2ZlxcdTBkODEtXFx1MGQ4M1xcdTBkY2FcXHUwZGNmLVxcdTBkZDRcXHUwZGQ2XFx1MGRkOC1cXHUwZGRmXFx1MGRlNi1cXHUwZGVmXFx1MGRmMlxcdTBkZjNcXHUwZTMxXFx1MGUzNC1cXHUwZTNhXFx1MGU0Ny1cXHUwZTRlXFx1MGU1MC1cXHUwZTU5XFx1MGViMVxcdTBlYjQtXFx1MGViY1xcdTBlYzgtXFx1MGVjZVxcdTBlZDAtXFx1MGVkOVxcdTBmMThcXHUwZjE5XFx1MGYyMC1cXHUwZjI5XFx1MGYzNVxcdTBmMzdcXHUwZjM5XFx1MGYzZVxcdTBmM2ZcXHUwZjcxLVxcdTBmODRcXHUwZjg2XFx1MGY4N1xcdTBmOGQtXFx1MGY5N1xcdTBmOTktXFx1MGZiY1xcdTBmYzZcXHUxMDJiLVxcdTEwM2VcXHUxMDQwLVxcdTEwNDlcXHUxMDU2LVxcdTEwNTlcXHUxMDVlLVxcdTEwNjBcXHUxMDYyLVxcdTEwNjRcXHUxMDY3LVxcdTEwNmRcXHUxMDcxLVxcdTEwNzRcXHUxMDgyLVxcdTEwOGRcXHUxMDhmLVxcdTEwOWRcXHUxMzVkLVxcdTEzNWZcXHUxMzY5LVxcdTEzNzFcXHUxNzEyLVxcdTE3MTVcXHUxNzMyLVxcdTE3MzRcXHUxNzUyXFx1MTc1M1xcdTE3NzJcXHUxNzczXFx1MTdiNC1cXHUxN2QzXFx1MTdkZFxcdTE3ZTAtXFx1MTdlOVxcdTE4MGItXFx1MTgwZFxcdTE4MGYtXFx1MTgxOVxcdTE4YTlcXHUxOTIwLVxcdTE5MmJcXHUxOTMwLVxcdTE5M2JcXHUxOTQ2LVxcdTE5NGZcXHUxOWQwLVxcdTE5ZGFcXHUxYTE3LVxcdTFhMWJcXHUxYTU1LVxcdTFhNWVcXHUxYTYwLVxcdTFhN2NcXHUxYTdmLVxcdTFhODlcXHUxYTkwLVxcdTFhOTlcXHUxYWIwLVxcdTFhYmRcXHUxYWJmLVxcdTFhY2VcXHUxYjAwLVxcdTFiMDRcXHUxYjM0LVxcdTFiNDRcXHUxYjUwLVxcdTFiNTlcXHUxYjZiLVxcdTFiNzNcXHUxYjgwLVxcdTFiODJcXHUxYmExLVxcdTFiYWRcXHUxYmIwLVxcdTFiYjlcXHUxYmU2LVxcdTFiZjNcXHUxYzI0LVxcdTFjMzdcXHUxYzQwLVxcdTFjNDlcXHUxYzUwLVxcdTFjNTlcXHUxY2QwLVxcdTFjZDJcXHUxY2Q0LVxcdTFjZThcXHUxY2VkXFx1MWNmNFxcdTFjZjctXFx1MWNmOVxcdTFkYzAtXFx1MWRmZlxcdTIwMGNcXHUyMDBkXFx1MjAzZlxcdTIwNDBcXHUyMDU0XFx1MjBkMC1cXHUyMGRjXFx1MjBlMVxcdTIwZTUtXFx1MjBmMFxcdTJjZWYtXFx1MmNmMVxcdTJkN2ZcXHUyZGUwLVxcdTJkZmZcXHUzMDJhLVxcdTMwMmZcXHUzMDk5XFx1MzA5YVxcdTMwZmJcXHVhNjIwLVxcdWE2MjlcXHVhNjZmXFx1YTY3NC1cXHVhNjdkXFx1YTY5ZVxcdWE2OWZcXHVhNmYwXFx1YTZmMVxcdWE4MDJcXHVhODA2XFx1YTgwYlxcdWE4MjMtXFx1YTgyN1xcdWE4MmNcXHVhODgwXFx1YTg4MVxcdWE4YjQtXFx1YThjNVxcdWE4ZDAtXFx1YThkOVxcdWE4ZTAtXFx1YThmMVxcdWE4ZmYtXFx1YTkwOVxcdWE5MjYtXFx1YTkyZFxcdWE5NDctXFx1YTk1M1xcdWE5ODAtXFx1YTk4M1xcdWE5YjMtXFx1YTljMFxcdWE5ZDAtXFx1YTlkOVxcdWE5ZTVcXHVhOWYwLVxcdWE5ZjlcXHVhYTI5LVxcdWFhMzZcXHVhYTQzXFx1YWE0Y1xcdWFhNGRcXHVhYTUwLVxcdWFhNTlcXHVhYTdiLVxcdWFhN2RcXHVhYWIwXFx1YWFiMi1cXHVhYWI0XFx1YWFiN1xcdWFhYjhcXHVhYWJlXFx1YWFiZlxcdWFhYzFcXHVhYWViLVxcdWFhZWZcXHVhYWY1XFx1YWFmNlxcdWFiZTMtXFx1YWJlYVxcdWFiZWNcXHVhYmVkXFx1YWJmMC1cXHVhYmY5XFx1ZmIxZVxcdWZlMDAtXFx1ZmUwZlxcdWZlMjAtXFx1ZmUyZlxcdWZlMzNcXHVmZTM0XFx1ZmU0ZC1cXHVmZTRmXFx1ZmYxMC1cXHVmZjE5XFx1ZmYzZlxcdWZmNjVcIjtcblxuICAvLyBUaGlzIGZpbGUgd2FzIGdlbmVyYXRlZC4gRG8gbm90IG1vZGlmeSBtYW51YWxseSFcbiAgdmFyIG5vbkFTQ0lJaWRlbnRpZmllclN0YXJ0Q2hhcnMgPSBcIlxceGFhXFx4YjVcXHhiYVxceGMwLVxceGQ2XFx4ZDgtXFx4ZjZcXHhmOC1cXHUwMmMxXFx1MDJjNi1cXHUwMmQxXFx1MDJlMC1cXHUwMmU0XFx1MDJlY1xcdTAyZWVcXHUwMzcwLVxcdTAzNzRcXHUwMzc2XFx1MDM3N1xcdTAzN2EtXFx1MDM3ZFxcdTAzN2ZcXHUwMzg2XFx1MDM4OC1cXHUwMzhhXFx1MDM4Y1xcdTAzOGUtXFx1MDNhMVxcdTAzYTMtXFx1MDNmNVxcdTAzZjctXFx1MDQ4MVxcdTA0OGEtXFx1MDUyZlxcdTA1MzEtXFx1MDU1NlxcdTA1NTlcXHUwNTYwLVxcdTA1ODhcXHUwNWQwLVxcdTA1ZWFcXHUwNWVmLVxcdTA1ZjJcXHUwNjIwLVxcdTA2NGFcXHUwNjZlXFx1MDY2ZlxcdTA2NzEtXFx1MDZkM1xcdTA2ZDVcXHUwNmU1XFx1MDZlNlxcdTA2ZWVcXHUwNmVmXFx1MDZmYS1cXHUwNmZjXFx1MDZmZlxcdTA3MTBcXHUwNzEyLVxcdTA3MmZcXHUwNzRkLVxcdTA3YTVcXHUwN2IxXFx1MDdjYS1cXHUwN2VhXFx1MDdmNFxcdTA3ZjVcXHUwN2ZhXFx1MDgwMC1cXHUwODE1XFx1MDgxYVxcdTA4MjRcXHUwODI4XFx1MDg0MC1cXHUwODU4XFx1MDg2MC1cXHUwODZhXFx1MDg3MC1cXHUwODg3XFx1MDg4OS1cXHUwODhlXFx1MDhhMC1cXHUwOGM5XFx1MDkwNC1cXHUwOTM5XFx1MDkzZFxcdTA5NTBcXHUwOTU4LVxcdTA5NjFcXHUwOTcxLVxcdTA5ODBcXHUwOTg1LVxcdTA5OGNcXHUwOThmXFx1MDk5MFxcdTA5OTMtXFx1MDlhOFxcdTA5YWEtXFx1MDliMFxcdTA5YjJcXHUwOWI2LVxcdTA5YjlcXHUwOWJkXFx1MDljZVxcdTA5ZGNcXHUwOWRkXFx1MDlkZi1cXHUwOWUxXFx1MDlmMFxcdTA5ZjFcXHUwOWZjXFx1MGEwNS1cXHUwYTBhXFx1MGEwZlxcdTBhMTBcXHUwYTEzLVxcdTBhMjhcXHUwYTJhLVxcdTBhMzBcXHUwYTMyXFx1MGEzM1xcdTBhMzVcXHUwYTM2XFx1MGEzOFxcdTBhMzlcXHUwYTU5LVxcdTBhNWNcXHUwYTVlXFx1MGE3Mi1cXHUwYTc0XFx1MGE4NS1cXHUwYThkXFx1MGE4Zi1cXHUwYTkxXFx1MGE5My1cXHUwYWE4XFx1MGFhYS1cXHUwYWIwXFx1MGFiMlxcdTBhYjNcXHUwYWI1LVxcdTBhYjlcXHUwYWJkXFx1MGFkMFxcdTBhZTBcXHUwYWUxXFx1MGFmOVxcdTBiMDUtXFx1MGIwY1xcdTBiMGZcXHUwYjEwXFx1MGIxMy1cXHUwYjI4XFx1MGIyYS1cXHUwYjMwXFx1MGIzMlxcdTBiMzNcXHUwYjM1LVxcdTBiMzlcXHUwYjNkXFx1MGI1Y1xcdTBiNWRcXHUwYjVmLVxcdTBiNjFcXHUwYjcxXFx1MGI4M1xcdTBiODUtXFx1MGI4YVxcdTBiOGUtXFx1MGI5MFxcdTBiOTItXFx1MGI5NVxcdTBiOTlcXHUwYjlhXFx1MGI5Y1xcdTBiOWVcXHUwYjlmXFx1MGJhM1xcdTBiYTRcXHUwYmE4LVxcdTBiYWFcXHUwYmFlLVxcdTBiYjlcXHUwYmQwXFx1MGMwNS1cXHUwYzBjXFx1MGMwZS1cXHUwYzEwXFx1MGMxMi1cXHUwYzI4XFx1MGMyYS1cXHUwYzM5XFx1MGMzZFxcdTBjNTgtXFx1MGM1YVxcdTBjNWRcXHUwYzYwXFx1MGM2MVxcdTBjODBcXHUwYzg1LVxcdTBjOGNcXHUwYzhlLVxcdTBjOTBcXHUwYzkyLVxcdTBjYThcXHUwY2FhLVxcdTBjYjNcXHUwY2I1LVxcdTBjYjlcXHUwY2JkXFx1MGNkZFxcdTBjZGVcXHUwY2UwXFx1MGNlMVxcdTBjZjFcXHUwY2YyXFx1MGQwNC1cXHUwZDBjXFx1MGQwZS1cXHUwZDEwXFx1MGQxMi1cXHUwZDNhXFx1MGQzZFxcdTBkNGVcXHUwZDU0LVxcdTBkNTZcXHUwZDVmLVxcdTBkNjFcXHUwZDdhLVxcdTBkN2ZcXHUwZDg1LVxcdTBkOTZcXHUwZDlhLVxcdTBkYjFcXHUwZGIzLVxcdTBkYmJcXHUwZGJkXFx1MGRjMC1cXHUwZGM2XFx1MGUwMS1cXHUwZTMwXFx1MGUzMlxcdTBlMzNcXHUwZTQwLVxcdTBlNDZcXHUwZTgxXFx1MGU4MlxcdTBlODRcXHUwZTg2LVxcdTBlOGFcXHUwZThjLVxcdTBlYTNcXHUwZWE1XFx1MGVhNy1cXHUwZWIwXFx1MGViMlxcdTBlYjNcXHUwZWJkXFx1MGVjMC1cXHUwZWM0XFx1MGVjNlxcdTBlZGMtXFx1MGVkZlxcdTBmMDBcXHUwZjQwLVxcdTBmNDdcXHUwZjQ5LVxcdTBmNmNcXHUwZjg4LVxcdTBmOGNcXHUxMDAwLVxcdTEwMmFcXHUxMDNmXFx1MTA1MC1cXHUxMDU1XFx1MTA1YS1cXHUxMDVkXFx1MTA2MVxcdTEwNjVcXHUxMDY2XFx1MTA2ZS1cXHUxMDcwXFx1MTA3NS1cXHUxMDgxXFx1MTA4ZVxcdTEwYTAtXFx1MTBjNVxcdTEwYzdcXHUxMGNkXFx1MTBkMC1cXHUxMGZhXFx1MTBmYy1cXHUxMjQ4XFx1MTI0YS1cXHUxMjRkXFx1MTI1MC1cXHUxMjU2XFx1MTI1OFxcdTEyNWEtXFx1MTI1ZFxcdTEyNjAtXFx1MTI4OFxcdTEyOGEtXFx1MTI4ZFxcdTEyOTAtXFx1MTJiMFxcdTEyYjItXFx1MTJiNVxcdTEyYjgtXFx1MTJiZVxcdTEyYzBcXHUxMmMyLVxcdTEyYzVcXHUxMmM4LVxcdTEyZDZcXHUxMmQ4LVxcdTEzMTBcXHUxMzEyLVxcdTEzMTVcXHUxMzE4LVxcdTEzNWFcXHUxMzgwLVxcdTEzOGZcXHUxM2EwLVxcdTEzZjVcXHUxM2Y4LVxcdTEzZmRcXHUxNDAxLVxcdTE2NmNcXHUxNjZmLVxcdTE2N2ZcXHUxNjgxLVxcdTE2OWFcXHUxNmEwLVxcdTE2ZWFcXHUxNmVlLVxcdTE2ZjhcXHUxNzAwLVxcdTE3MTFcXHUxNzFmLVxcdTE3MzFcXHUxNzQwLVxcdTE3NTFcXHUxNzYwLVxcdTE3NmNcXHUxNzZlLVxcdTE3NzBcXHUxNzgwLVxcdTE3YjNcXHUxN2Q3XFx1MTdkY1xcdTE4MjAtXFx1MTg3OFxcdTE4ODAtXFx1MThhOFxcdTE4YWFcXHUxOGIwLVxcdTE4ZjVcXHUxOTAwLVxcdTE5MWVcXHUxOTUwLVxcdTE5NmRcXHUxOTcwLVxcdTE5NzRcXHUxOTgwLVxcdTE5YWJcXHUxOWIwLVxcdTE5YzlcXHUxYTAwLVxcdTFhMTZcXHUxYTIwLVxcdTFhNTRcXHUxYWE3XFx1MWIwNS1cXHUxYjMzXFx1MWI0NS1cXHUxYjRjXFx1MWI4My1cXHUxYmEwXFx1MWJhZVxcdTFiYWZcXHUxYmJhLVxcdTFiZTVcXHUxYzAwLVxcdTFjMjNcXHUxYzRkLVxcdTFjNGZcXHUxYzVhLVxcdTFjN2RcXHUxYzgwLVxcdTFjODhcXHUxYzkwLVxcdTFjYmFcXHUxY2JkLVxcdTFjYmZcXHUxY2U5LVxcdTFjZWNcXHUxY2VlLVxcdTFjZjNcXHUxY2Y1XFx1MWNmNlxcdTFjZmFcXHUxZDAwLVxcdTFkYmZcXHUxZTAwLVxcdTFmMTVcXHUxZjE4LVxcdTFmMWRcXHUxZjIwLVxcdTFmNDVcXHUxZjQ4LVxcdTFmNGRcXHUxZjUwLVxcdTFmNTdcXHUxZjU5XFx1MWY1YlxcdTFmNWRcXHUxZjVmLVxcdTFmN2RcXHUxZjgwLVxcdTFmYjRcXHUxZmI2LVxcdTFmYmNcXHUxZmJlXFx1MWZjMi1cXHUxZmM0XFx1MWZjNi1cXHUxZmNjXFx1MWZkMC1cXHUxZmQzXFx1MWZkNi1cXHUxZmRiXFx1MWZlMC1cXHUxZmVjXFx1MWZmMi1cXHUxZmY0XFx1MWZmNi1cXHUxZmZjXFx1MjA3MVxcdTIwN2ZcXHUyMDkwLVxcdTIwOWNcXHUyMTAyXFx1MjEwN1xcdTIxMGEtXFx1MjExM1xcdTIxMTVcXHUyMTE4LVxcdTIxMWRcXHUyMTI0XFx1MjEyNlxcdTIxMjhcXHUyMTJhLVxcdTIxMzlcXHUyMTNjLVxcdTIxM2ZcXHUyMTQ1LVxcdTIxNDlcXHUyMTRlXFx1MjE2MC1cXHUyMTg4XFx1MmMwMC1cXHUyY2U0XFx1MmNlYi1cXHUyY2VlXFx1MmNmMlxcdTJjZjNcXHUyZDAwLVxcdTJkMjVcXHUyZDI3XFx1MmQyZFxcdTJkMzAtXFx1MmQ2N1xcdTJkNmZcXHUyZDgwLVxcdTJkOTZcXHUyZGEwLVxcdTJkYTZcXHUyZGE4LVxcdTJkYWVcXHUyZGIwLVxcdTJkYjZcXHUyZGI4LVxcdTJkYmVcXHUyZGMwLVxcdTJkYzZcXHUyZGM4LVxcdTJkY2VcXHUyZGQwLVxcdTJkZDZcXHUyZGQ4LVxcdTJkZGVcXHUzMDA1LVxcdTMwMDdcXHUzMDIxLVxcdTMwMjlcXHUzMDMxLVxcdTMwMzVcXHUzMDM4LVxcdTMwM2NcXHUzMDQxLVxcdTMwOTZcXHUzMDliLVxcdTMwOWZcXHUzMGExLVxcdTMwZmFcXHUzMGZjLVxcdTMwZmZcXHUzMTA1LVxcdTMxMmZcXHUzMTMxLVxcdTMxOGVcXHUzMWEwLVxcdTMxYmZcXHUzMWYwLVxcdTMxZmZcXHUzNDAwLVxcdTRkYmZcXHU0ZTAwLVxcdWE0OGNcXHVhNGQwLVxcdWE0ZmRcXHVhNTAwLVxcdWE2MGNcXHVhNjEwLVxcdWE2MWZcXHVhNjJhXFx1YTYyYlxcdWE2NDAtXFx1YTY2ZVxcdWE2N2YtXFx1YTY5ZFxcdWE2YTAtXFx1YTZlZlxcdWE3MTctXFx1YTcxZlxcdWE3MjItXFx1YTc4OFxcdWE3OGItXFx1YTdjYVxcdWE3ZDBcXHVhN2QxXFx1YTdkM1xcdWE3ZDUtXFx1YTdkOVxcdWE3ZjItXFx1YTgwMVxcdWE4MDMtXFx1YTgwNVxcdWE4MDctXFx1YTgwYVxcdWE4MGMtXFx1YTgyMlxcdWE4NDAtXFx1YTg3M1xcdWE4ODItXFx1YThiM1xcdWE4ZjItXFx1YThmN1xcdWE4ZmJcXHVhOGZkXFx1YThmZVxcdWE5MGEtXFx1YTkyNVxcdWE5MzAtXFx1YTk0NlxcdWE5NjAtXFx1YTk3Y1xcdWE5ODQtXFx1YTliMlxcdWE5Y2ZcXHVhOWUwLVxcdWE5ZTRcXHVhOWU2LVxcdWE5ZWZcXHVhOWZhLVxcdWE5ZmVcXHVhYTAwLVxcdWFhMjhcXHVhYTQwLVxcdWFhNDJcXHVhYTQ0LVxcdWFhNGJcXHVhYTYwLVxcdWFhNzZcXHVhYTdhXFx1YWE3ZS1cXHVhYWFmXFx1YWFiMVxcdWFhYjVcXHVhYWI2XFx1YWFiOS1cXHVhYWJkXFx1YWFjMFxcdWFhYzJcXHVhYWRiLVxcdWFhZGRcXHVhYWUwLVxcdWFhZWFcXHVhYWYyLVxcdWFhZjRcXHVhYjAxLVxcdWFiMDZcXHVhYjA5LVxcdWFiMGVcXHVhYjExLVxcdWFiMTZcXHVhYjIwLVxcdWFiMjZcXHVhYjI4LVxcdWFiMmVcXHVhYjMwLVxcdWFiNWFcXHVhYjVjLVxcdWFiNjlcXHVhYjcwLVxcdWFiZTJcXHVhYzAwLVxcdWQ3YTNcXHVkN2IwLVxcdWQ3YzZcXHVkN2NiLVxcdWQ3ZmJcXHVmOTAwLVxcdWZhNmRcXHVmYTcwLVxcdWZhZDlcXHVmYjAwLVxcdWZiMDZcXHVmYjEzLVxcdWZiMTdcXHVmYjFkXFx1ZmIxZi1cXHVmYjI4XFx1ZmIyYS1cXHVmYjM2XFx1ZmIzOC1cXHVmYjNjXFx1ZmIzZVxcdWZiNDBcXHVmYjQxXFx1ZmI0M1xcdWZiNDRcXHVmYjQ2LVxcdWZiYjFcXHVmYmQzLVxcdWZkM2RcXHVmZDUwLVxcdWZkOGZcXHVmZDkyLVxcdWZkYzdcXHVmZGYwLVxcdWZkZmJcXHVmZTcwLVxcdWZlNzRcXHVmZTc2LVxcdWZlZmNcXHVmZjIxLVxcdWZmM2FcXHVmZjQxLVxcdWZmNWFcXHVmZjY2LVxcdWZmYmVcXHVmZmMyLVxcdWZmYzdcXHVmZmNhLVxcdWZmY2ZcXHVmZmQyLVxcdWZmZDdcXHVmZmRhLVxcdWZmZGNcIjtcblxuICAvLyBUaGVzZSBhcmUgYSBydW4tbGVuZ3RoIGFuZCBvZmZzZXQgZW5jb2RlZCByZXByZXNlbnRhdGlvbiBvZiB0aGVcbiAgLy8gPjB4ZmZmZiBjb2RlIHBvaW50cyB0aGF0IGFyZSBhIHZhbGlkIHBhcnQgb2YgaWRlbnRpZmllcnMuIFRoZVxuICAvLyBvZmZzZXQgc3RhcnRzIGF0IDB4MTAwMDAsIGFuZCBlYWNoIHBhaXIgb2YgbnVtYmVycyByZXByZXNlbnRzIGFuXG4gIC8vIG9mZnNldCB0byB0aGUgbmV4dCByYW5nZSwgYW5kIHRoZW4gYSBzaXplIG9mIHRoZSByYW5nZS5cblxuICAvLyBSZXNlcnZlZCB3b3JkIGxpc3RzIGZvciB2YXJpb3VzIGRpYWxlY3RzIG9mIHRoZSBsYW5ndWFnZVxuXG4gIHZhciByZXNlcnZlZFdvcmRzID0ge1xuICAgIDM6IFwiYWJzdHJhY3QgYm9vbGVhbiBieXRlIGNoYXIgY2xhc3MgZG91YmxlIGVudW0gZXhwb3J0IGV4dGVuZHMgZmluYWwgZmxvYXQgZ290byBpbXBsZW1lbnRzIGltcG9ydCBpbnQgaW50ZXJmYWNlIGxvbmcgbmF0aXZlIHBhY2thZ2UgcHJpdmF0ZSBwcm90ZWN0ZWQgcHVibGljIHNob3J0IHN0YXRpYyBzdXBlciBzeW5jaHJvbml6ZWQgdGhyb3dzIHRyYW5zaWVudCB2b2xhdGlsZVwiLFxuICAgIDU6IFwiY2xhc3MgZW51bSBleHRlbmRzIHN1cGVyIGNvbnN0IGV4cG9ydCBpbXBvcnRcIixcbiAgICA2OiBcImVudW1cIixcbiAgICBzdHJpY3Q6IFwiaW1wbGVtZW50cyBpbnRlcmZhY2UgbGV0IHBhY2thZ2UgcHJpdmF0ZSBwcm90ZWN0ZWQgcHVibGljIHN0YXRpYyB5aWVsZFwiLFxuICAgIHN0cmljdEJpbmQ6IFwiZXZhbCBhcmd1bWVudHNcIlxuICB9O1xuXG4gIC8vIEFuZCB0aGUga2V5d29yZHNcblxuICB2YXIgZWNtYTVBbmRMZXNzS2V5d29yZHMgPSBcImJyZWFrIGNhc2UgY2F0Y2ggY29udGludWUgZGVidWdnZXIgZGVmYXVsdCBkbyBlbHNlIGZpbmFsbHkgZm9yIGZ1bmN0aW9uIGlmIHJldHVybiBzd2l0Y2ggdGhyb3cgdHJ5IHZhciB3aGlsZSB3aXRoIG51bGwgdHJ1ZSBmYWxzZSBpbnN0YW5jZW9mIHR5cGVvZiB2b2lkIGRlbGV0ZSBuZXcgaW4gdGhpc1wiO1xuXG4gIHZhciBrZXl3b3JkcyQxID0ge1xuICAgIDU6IGVjbWE1QW5kTGVzc0tleXdvcmRzLFxuICAgIFwiNW1vZHVsZVwiOiBlY21hNUFuZExlc3NLZXl3b3JkcyArIFwiIGV4cG9ydCBpbXBvcnRcIixcbiAgICA2OiBlY21hNUFuZExlc3NLZXl3b3JkcyArIFwiIGNvbnN0IGNsYXNzIGV4dGVuZHMgZXhwb3J0IGltcG9ydCBzdXBlclwiXG4gIH07XG5cbiAgdmFyIGtleXdvcmRSZWxhdGlvbmFsT3BlcmF0b3IgPSAvXmluKHN0YW5jZW9mKT8kLztcblxuICAvLyAjIyBDaGFyYWN0ZXIgY2F0ZWdvcmllc1xuXG4gIHZhciBub25BU0NJSWlkZW50aWZpZXJTdGFydCA9IG5ldyBSZWdFeHAoXCJbXCIgKyBub25BU0NJSWlkZW50aWZpZXJTdGFydENoYXJzICsgXCJdXCIpO1xuICB2YXIgbm9uQVNDSUlpZGVudGlmaWVyID0gbmV3IFJlZ0V4cChcIltcIiArIG5vbkFTQ0lJaWRlbnRpZmllclN0YXJ0Q2hhcnMgKyBub25BU0NJSWlkZW50aWZpZXJDaGFycyArIFwiXVwiKTtcblxuICAvLyBUaGlzIGhhcyBhIGNvbXBsZXhpdHkgbGluZWFyIHRvIHRoZSB2YWx1ZSBvZiB0aGUgY29kZS4gVGhlXG4gIC8vIGFzc3VtcHRpb24gaXMgdGhhdCBsb29raW5nIHVwIGFzdHJhbCBpZGVudGlmaWVyIGNoYXJhY3RlcnMgaXNcbiAgLy8gcmFyZS5cbiAgZnVuY3Rpb24gaXNJbkFzdHJhbFNldChjb2RlLCBzZXQpIHtcbiAgICB2YXIgcG9zID0gMHgxMDAwMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgcG9zICs9IHNldFtpXTtcbiAgICAgIGlmIChwb3MgPiBjb2RlKSB7IHJldHVybiBmYWxzZSB9XG4gICAgICBwb3MgKz0gc2V0W2kgKyAxXTtcbiAgICAgIGlmIChwb3MgPj0gY29kZSkgeyByZXR1cm4gdHJ1ZSB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gVGVzdCB3aGV0aGVyIGEgZ2l2ZW4gY2hhcmFjdGVyIGNvZGUgc3RhcnRzIGFuIGlkZW50aWZpZXIuXG5cbiAgZnVuY3Rpb24gaXNJZGVudGlmaWVyU3RhcnQoY29kZSwgYXN0cmFsKSB7XG4gICAgaWYgKGNvZGUgPCA2NSkgeyByZXR1cm4gY29kZSA9PT0gMzYgfVxuICAgIGlmIChjb2RlIDwgOTEpIHsgcmV0dXJuIHRydWUgfVxuICAgIGlmIChjb2RlIDwgOTcpIHsgcmV0dXJuIGNvZGUgPT09IDk1IH1cbiAgICBpZiAoY29kZSA8IDEyMykgeyByZXR1cm4gdHJ1ZSB9XG4gICAgaWYgKGNvZGUgPD0gMHhmZmZmKSB7IHJldHVybiBjb2RlID49IDB4YWEgJiYgbm9uQVNDSUlpZGVudGlmaWVyU3RhcnQudGVzdChTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGUpKSB9XG4gICAgaWYgKGFzdHJhbCA9PT0gZmFsc2UpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICByZXR1cm4gaXNJbkFzdHJhbFNldChjb2RlLCBhc3RyYWxJZGVudGlmaWVyU3RhcnRDb2RlcylcbiAgfVxuXG4gIC8vIFRlc3Qgd2hldGhlciBhIGdpdmVuIGNoYXJhY3RlciBpcyBwYXJ0IG9mIGFuIGlkZW50aWZpZXIuXG5cbiAgZnVuY3Rpb24gaXNJZGVudGlmaWVyQ2hhcihjb2RlLCBhc3RyYWwpIHtcbiAgICBpZiAoY29kZSA8IDQ4KSB7IHJldHVybiBjb2RlID09PSAzNiB9XG4gICAgaWYgKGNvZGUgPCA1OCkgeyByZXR1cm4gdHJ1ZSB9XG4gICAgaWYgKGNvZGUgPCA2NSkgeyByZXR1cm4gZmFsc2UgfVxuICAgIGlmIChjb2RlIDwgOTEpIHsgcmV0dXJuIHRydWUgfVxuICAgIGlmIChjb2RlIDwgOTcpIHsgcmV0dXJuIGNvZGUgPT09IDk1IH1cbiAgICBpZiAoY29kZSA8IDEyMykgeyByZXR1cm4gdHJ1ZSB9XG4gICAgaWYgKGNvZGUgPD0gMHhmZmZmKSB7IHJldHVybiBjb2RlID49IDB4YWEgJiYgbm9uQVNDSUlpZGVudGlmaWVyLnRlc3QoU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKSkgfVxuICAgIGlmIChhc3RyYWwgPT09IGZhbHNlKSB7IHJldHVybiBmYWxzZSB9XG4gICAgcmV0dXJuIGlzSW5Bc3RyYWxTZXQoY29kZSwgYXN0cmFsSWRlbnRpZmllclN0YXJ0Q29kZXMpIHx8IGlzSW5Bc3RyYWxTZXQoY29kZSwgYXN0cmFsSWRlbnRpZmllckNvZGVzKVxuICB9XG5cbiAgLy8gIyMgVG9rZW4gdHlwZXNcblxuICAvLyBUaGUgYXNzaWdubWVudCBvZiBmaW5lLWdyYWluZWQsIGluZm9ybWF0aW9uLWNhcnJ5aW5nIHR5cGUgb2JqZWN0c1xuICAvLyBhbGxvd3MgdGhlIHRva2VuaXplciB0byBzdG9yZSB0aGUgaW5mb3JtYXRpb24gaXQgaGFzIGFib3V0IGFcbiAgLy8gdG9rZW4gaW4gYSB3YXkgdGhhdCBpcyB2ZXJ5IGNoZWFwIGZvciB0aGUgcGFyc2VyIHRvIGxvb2sgdXAuXG5cbiAgLy8gQWxsIHRva2VuIHR5cGUgdmFyaWFibGVzIHN0YXJ0IHdpdGggYW4gdW5kZXJzY29yZSwgdG8gbWFrZSB0aGVtXG4gIC8vIGVhc3kgdG8gcmVjb2duaXplLlxuXG4gIC8vIFRoZSBgYmVmb3JlRXhwcmAgcHJvcGVydHkgaXMgdXNlZCB0byBkaXNhbWJpZ3VhdGUgYmV0d2VlbiByZWd1bGFyXG4gIC8vIGV4cHJlc3Npb25zIGFuZCBkaXZpc2lvbnMuIEl0IGlzIHNldCBvbiBhbGwgdG9rZW4gdHlwZXMgdGhhdCBjYW5cbiAgLy8gYmUgZm9sbG93ZWQgYnkgYW4gZXhwcmVzc2lvbiAodGh1cywgYSBzbGFzaCBhZnRlciB0aGVtIHdvdWxkIGJlIGFcbiAgLy8gcmVndWxhciBleHByZXNzaW9uKS5cbiAgLy9cbiAgLy8gVGhlIGBzdGFydHNFeHByYCBwcm9wZXJ0eSBpcyB1c2VkIHRvIGNoZWNrIGlmIHRoZSB0b2tlbiBlbmRzIGFcbiAgLy8gYHlpZWxkYCBleHByZXNzaW9uLiBJdCBpcyBzZXQgb24gYWxsIHRva2VuIHR5cGVzIHRoYXQgZWl0aGVyIGNhblxuICAvLyBkaXJlY3RseSBzdGFydCBhbiBleHByZXNzaW9uIChsaWtlIGEgcXVvdGF0aW9uIG1hcmspIG9yIGNhblxuICAvLyBjb250aW51ZSBhbiBleHByZXNzaW9uIChsaWtlIHRoZSBib2R5IG9mIGEgc3RyaW5nKS5cbiAgLy9cbiAgLy8gYGlzTG9vcGAgbWFya3MgYSBrZXl3b3JkIGFzIHN0YXJ0aW5nIGEgbG9vcCwgd2hpY2ggaXMgaW1wb3J0YW50XG4gIC8vIHRvIGtub3cgd2hlbiBwYXJzaW5nIGEgbGFiZWwsIGluIG9yZGVyIHRvIGFsbG93IG9yIGRpc2FsbG93XG4gIC8vIGNvbnRpbnVlIGp1bXBzIHRvIHRoYXQgbGFiZWwuXG5cbiAgdmFyIFRva2VuVHlwZSA9IGZ1bmN0aW9uIFRva2VuVHlwZShsYWJlbCwgY29uZikge1xuICAgIGlmICggY29uZiA9PT0gdm9pZCAwICkgY29uZiA9IHt9O1xuXG4gICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xuICAgIHRoaXMua2V5d29yZCA9IGNvbmYua2V5d29yZDtcbiAgICB0aGlzLmJlZm9yZUV4cHIgPSAhIWNvbmYuYmVmb3JlRXhwcjtcbiAgICB0aGlzLnN0YXJ0c0V4cHIgPSAhIWNvbmYuc3RhcnRzRXhwcjtcbiAgICB0aGlzLmlzTG9vcCA9ICEhY29uZi5pc0xvb3A7XG4gICAgdGhpcy5pc0Fzc2lnbiA9ICEhY29uZi5pc0Fzc2lnbjtcbiAgICB0aGlzLnByZWZpeCA9ICEhY29uZi5wcmVmaXg7XG4gICAgdGhpcy5wb3N0Zml4ID0gISFjb25mLnBvc3RmaXg7XG4gICAgdGhpcy5iaW5vcCA9IGNvbmYuYmlub3AgfHwgbnVsbDtcbiAgICB0aGlzLnVwZGF0ZUNvbnRleHQgPSBudWxsO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGJpbm9wKG5hbWUsIHByZWMpIHtcbiAgICByZXR1cm4gbmV3IFRva2VuVHlwZShuYW1lLCB7YmVmb3JlRXhwcjogdHJ1ZSwgYmlub3A6IHByZWN9KVxuICB9XG4gIHZhciBiZWZvcmVFeHByID0ge2JlZm9yZUV4cHI6IHRydWV9LCBzdGFydHNFeHByID0ge3N0YXJ0c0V4cHI6IHRydWV9O1xuXG4gIC8vIE1hcCBrZXl3b3JkIG5hbWVzIHRvIHRva2VuIHR5cGVzLlxuXG4gIHZhciBrZXl3b3JkcyA9IHt9O1xuXG4gIC8vIFN1Y2NpbmN0IGRlZmluaXRpb25zIG9mIGtleXdvcmQgdG9rZW4gdHlwZXNcbiAgZnVuY3Rpb24ga3cobmFtZSwgb3B0aW9ucykge1xuICAgIGlmICggb3B0aW9ucyA9PT0gdm9pZCAwICkgb3B0aW9ucyA9IHt9O1xuXG4gICAgb3B0aW9ucy5rZXl3b3JkID0gbmFtZTtcbiAgICByZXR1cm4ga2V5d29yZHNbbmFtZV0gPSBuZXcgVG9rZW5UeXBlKG5hbWUsIG9wdGlvbnMpXG4gIH1cblxuICB2YXIgdHlwZXMkMSA9IHtcbiAgICBudW06IG5ldyBUb2tlblR5cGUoXCJudW1cIiwgc3RhcnRzRXhwciksXG4gICAgcmVnZXhwOiBuZXcgVG9rZW5UeXBlKFwicmVnZXhwXCIsIHN0YXJ0c0V4cHIpLFxuICAgIHN0cmluZzogbmV3IFRva2VuVHlwZShcInN0cmluZ1wiLCBzdGFydHNFeHByKSxcbiAgICBuYW1lOiBuZXcgVG9rZW5UeXBlKFwibmFtZVwiLCBzdGFydHNFeHByKSxcbiAgICBwcml2YXRlSWQ6IG5ldyBUb2tlblR5cGUoXCJwcml2YXRlSWRcIiwgc3RhcnRzRXhwciksXG4gICAgZW9mOiBuZXcgVG9rZW5UeXBlKFwiZW9mXCIpLFxuXG4gICAgLy8gUHVuY3R1YXRpb24gdG9rZW4gdHlwZXMuXG4gICAgYnJhY2tldEw6IG5ldyBUb2tlblR5cGUoXCJbXCIsIHtiZWZvcmVFeHByOiB0cnVlLCBzdGFydHNFeHByOiB0cnVlfSksXG4gICAgYnJhY2tldFI6IG5ldyBUb2tlblR5cGUoXCJdXCIpLFxuICAgIGJyYWNlTDogbmV3IFRva2VuVHlwZShcIntcIiwge2JlZm9yZUV4cHI6IHRydWUsIHN0YXJ0c0V4cHI6IHRydWV9KSxcbiAgICBicmFjZVI6IG5ldyBUb2tlblR5cGUoXCJ9XCIpLFxuICAgIHBhcmVuTDogbmV3IFRva2VuVHlwZShcIihcIiwge2JlZm9yZUV4cHI6IHRydWUsIHN0YXJ0c0V4cHI6IHRydWV9KSxcbiAgICBwYXJlblI6IG5ldyBUb2tlblR5cGUoXCIpXCIpLFxuICAgIGNvbW1hOiBuZXcgVG9rZW5UeXBlKFwiLFwiLCBiZWZvcmVFeHByKSxcbiAgICBzZW1pOiBuZXcgVG9rZW5UeXBlKFwiO1wiLCBiZWZvcmVFeHByKSxcbiAgICBjb2xvbjogbmV3IFRva2VuVHlwZShcIjpcIiwgYmVmb3JlRXhwciksXG4gICAgZG90OiBuZXcgVG9rZW5UeXBlKFwiLlwiKSxcbiAgICBxdWVzdGlvbjogbmV3IFRva2VuVHlwZShcIj9cIiwgYmVmb3JlRXhwciksXG4gICAgcXVlc3Rpb25Eb3Q6IG5ldyBUb2tlblR5cGUoXCI/LlwiKSxcbiAgICBhcnJvdzogbmV3IFRva2VuVHlwZShcIj0+XCIsIGJlZm9yZUV4cHIpLFxuICAgIHRlbXBsYXRlOiBuZXcgVG9rZW5UeXBlKFwidGVtcGxhdGVcIiksXG4gICAgaW52YWxpZFRlbXBsYXRlOiBuZXcgVG9rZW5UeXBlKFwiaW52YWxpZFRlbXBsYXRlXCIpLFxuICAgIGVsbGlwc2lzOiBuZXcgVG9rZW5UeXBlKFwiLi4uXCIsIGJlZm9yZUV4cHIpLFxuICAgIGJhY2tRdW90ZTogbmV3IFRva2VuVHlwZShcImBcIiwgc3RhcnRzRXhwciksXG4gICAgZG9sbGFyQnJhY2VMOiBuZXcgVG9rZW5UeXBlKFwiJHtcIiwge2JlZm9yZUV4cHI6IHRydWUsIHN0YXJ0c0V4cHI6IHRydWV9KSxcblxuICAgIC8vIE9wZXJhdG9ycy4gVGhlc2UgY2Fycnkgc2V2ZXJhbCBraW5kcyBvZiBwcm9wZXJ0aWVzIHRvIGhlbHAgdGhlXG4gICAgLy8gcGFyc2VyIHVzZSB0aGVtIHByb3Blcmx5ICh0aGUgcHJlc2VuY2Ugb2YgdGhlc2UgcHJvcGVydGllcyBpc1xuICAgIC8vIHdoYXQgY2F0ZWdvcml6ZXMgdGhlbSBhcyBvcGVyYXRvcnMpLlxuICAgIC8vXG4gICAgLy8gYGJpbm9wYCwgd2hlbiBwcmVzZW50LCBzcGVjaWZpZXMgdGhhdCB0aGlzIG9wZXJhdG9yIGlzIGEgYmluYXJ5XG4gICAgLy8gb3BlcmF0b3IsIGFuZCB3aWxsIHJlZmVyIHRvIGl0cyBwcmVjZWRlbmNlLlxuICAgIC8vXG4gICAgLy8gYHByZWZpeGAgYW5kIGBwb3N0Zml4YCBtYXJrIHRoZSBvcGVyYXRvciBhcyBhIHByZWZpeCBvciBwb3N0Zml4XG4gICAgLy8gdW5hcnkgb3BlcmF0b3IuXG4gICAgLy9cbiAgICAvLyBgaXNBc3NpZ25gIG1hcmtzIGFsbCBvZiBgPWAsIGArPWAsIGAtPWAgZXRjZXRlcmEsIHdoaWNoIGFjdCBhc1xuICAgIC8vIGJpbmFyeSBvcGVyYXRvcnMgd2l0aCBhIHZlcnkgbG93IHByZWNlZGVuY2UsIHRoYXQgc2hvdWxkIHJlc3VsdFxuICAgIC8vIGluIEFzc2lnbm1lbnRFeHByZXNzaW9uIG5vZGVzLlxuXG4gICAgZXE6IG5ldyBUb2tlblR5cGUoXCI9XCIsIHtiZWZvcmVFeHByOiB0cnVlLCBpc0Fzc2lnbjogdHJ1ZX0pLFxuICAgIGFzc2lnbjogbmV3IFRva2VuVHlwZShcIl89XCIsIHtiZWZvcmVFeHByOiB0cnVlLCBpc0Fzc2lnbjogdHJ1ZX0pLFxuICAgIGluY0RlYzogbmV3IFRva2VuVHlwZShcIisrLy0tXCIsIHtwcmVmaXg6IHRydWUsIHBvc3RmaXg6IHRydWUsIHN0YXJ0c0V4cHI6IHRydWV9KSxcbiAgICBwcmVmaXg6IG5ldyBUb2tlblR5cGUoXCIhL35cIiwge2JlZm9yZUV4cHI6IHRydWUsIHByZWZpeDogdHJ1ZSwgc3RhcnRzRXhwcjogdHJ1ZX0pLFxuICAgIGxvZ2ljYWxPUjogYmlub3AoXCJ8fFwiLCAxKSxcbiAgICBsb2dpY2FsQU5EOiBiaW5vcChcIiYmXCIsIDIpLFxuICAgIGJpdHdpc2VPUjogYmlub3AoXCJ8XCIsIDMpLFxuICAgIGJpdHdpc2VYT1I6IGJpbm9wKFwiXlwiLCA0KSxcbiAgICBiaXR3aXNlQU5EOiBiaW5vcChcIiZcIiwgNSksXG4gICAgZXF1YWxpdHk6IGJpbm9wKFwiPT0vIT0vPT09LyE9PVwiLCA2KSxcbiAgICByZWxhdGlvbmFsOiBiaW5vcChcIjwvPi88PS8+PVwiLCA3KSxcbiAgICBiaXRTaGlmdDogYmlub3AoXCI8PC8+Pi8+Pj5cIiwgOCksXG4gICAgcGx1c01pbjogbmV3IFRva2VuVHlwZShcIisvLVwiLCB7YmVmb3JlRXhwcjogdHJ1ZSwgYmlub3A6IDksIHByZWZpeDogdHJ1ZSwgc3RhcnRzRXhwcjogdHJ1ZX0pLFxuICAgIG1vZHVsbzogYmlub3AoXCIlXCIsIDEwKSxcbiAgICBzdGFyOiBiaW5vcChcIipcIiwgMTApLFxuICAgIHNsYXNoOiBiaW5vcChcIi9cIiwgMTApLFxuICAgIHN0YXJzdGFyOiBuZXcgVG9rZW5UeXBlKFwiKipcIiwge2JlZm9yZUV4cHI6IHRydWV9KSxcbiAgICBjb2FsZXNjZTogYmlub3AoXCI/P1wiLCAxKSxcblxuICAgIC8vIEtleXdvcmQgdG9rZW4gdHlwZXMuXG4gICAgX2JyZWFrOiBrdyhcImJyZWFrXCIpLFxuICAgIF9jYXNlOiBrdyhcImNhc2VcIiwgYmVmb3JlRXhwciksXG4gICAgX2NhdGNoOiBrdyhcImNhdGNoXCIpLFxuICAgIF9jb250aW51ZToga3coXCJjb250aW51ZVwiKSxcbiAgICBfZGVidWdnZXI6IGt3KFwiZGVidWdnZXJcIiksXG4gICAgX2RlZmF1bHQ6IGt3KFwiZGVmYXVsdFwiLCBiZWZvcmVFeHByKSxcbiAgICBfZG86IGt3KFwiZG9cIiwge2lzTG9vcDogdHJ1ZSwgYmVmb3JlRXhwcjogdHJ1ZX0pLFxuICAgIF9lbHNlOiBrdyhcImVsc2VcIiwgYmVmb3JlRXhwciksXG4gICAgX2ZpbmFsbHk6IGt3KFwiZmluYWxseVwiKSxcbiAgICBfZm9yOiBrdyhcImZvclwiLCB7aXNMb29wOiB0cnVlfSksXG4gICAgX2Z1bmN0aW9uOiBrdyhcImZ1bmN0aW9uXCIsIHN0YXJ0c0V4cHIpLFxuICAgIF9pZjoga3coXCJpZlwiKSxcbiAgICBfcmV0dXJuOiBrdyhcInJldHVyblwiLCBiZWZvcmVFeHByKSxcbiAgICBfc3dpdGNoOiBrdyhcInN3aXRjaFwiKSxcbiAgICBfdGhyb3c6IGt3KFwidGhyb3dcIiwgYmVmb3JlRXhwciksXG4gICAgX3RyeToga3coXCJ0cnlcIiksXG4gICAgX3Zhcjoga3coXCJ2YXJcIiksXG4gICAgX2NvbnN0OiBrdyhcImNvbnN0XCIpLFxuICAgIF93aGlsZToga3coXCJ3aGlsZVwiLCB7aXNMb29wOiB0cnVlfSksXG4gICAgX3dpdGg6IGt3KFwid2l0aFwiKSxcbiAgICBfbmV3OiBrdyhcIm5ld1wiLCB7YmVmb3JlRXhwcjogdHJ1ZSwgc3RhcnRzRXhwcjogdHJ1ZX0pLFxuICAgIF90aGlzOiBrdyhcInRoaXNcIiwgc3RhcnRzRXhwciksXG4gICAgX3N1cGVyOiBrdyhcInN1cGVyXCIsIHN0YXJ0c0V4cHIpLFxuICAgIF9jbGFzczoga3coXCJjbGFzc1wiLCBzdGFydHNFeHByKSxcbiAgICBfZXh0ZW5kczoga3coXCJleHRlbmRzXCIsIGJlZm9yZUV4cHIpLFxuICAgIF9leHBvcnQ6IGt3KFwiZXhwb3J0XCIpLFxuICAgIF9pbXBvcnQ6IGt3KFwiaW1wb3J0XCIsIHN0YXJ0c0V4cHIpLFxuICAgIF9udWxsOiBrdyhcIm51bGxcIiwgc3RhcnRzRXhwciksXG4gICAgX3RydWU6IGt3KFwidHJ1ZVwiLCBzdGFydHNFeHByKSxcbiAgICBfZmFsc2U6IGt3KFwiZmFsc2VcIiwgc3RhcnRzRXhwciksXG4gICAgX2luOiBrdyhcImluXCIsIHtiZWZvcmVFeHByOiB0cnVlLCBiaW5vcDogN30pLFxuICAgIF9pbnN0YW5jZW9mOiBrdyhcImluc3RhbmNlb2ZcIiwge2JlZm9yZUV4cHI6IHRydWUsIGJpbm9wOiA3fSksXG4gICAgX3R5cGVvZjoga3coXCJ0eXBlb2ZcIiwge2JlZm9yZUV4cHI6IHRydWUsIHByZWZpeDogdHJ1ZSwgc3RhcnRzRXhwcjogdHJ1ZX0pLFxuICAgIF92b2lkOiBrdyhcInZvaWRcIiwge2JlZm9yZUV4cHI6IHRydWUsIHByZWZpeDogdHJ1ZSwgc3RhcnRzRXhwcjogdHJ1ZX0pLFxuICAgIF9kZWxldGU6IGt3KFwiZGVsZXRlXCIsIHtiZWZvcmVFeHByOiB0cnVlLCBwcmVmaXg6IHRydWUsIHN0YXJ0c0V4cHI6IHRydWV9KVxuICB9O1xuXG4gIC8vIE1hdGNoZXMgYSB3aG9sZSBsaW5lIGJyZWFrICh3aGVyZSBDUkxGIGlzIGNvbnNpZGVyZWQgYSBzaW5nbGVcbiAgLy8gbGluZSBicmVhaykuIFVzZWQgdG8gY291bnQgbGluZXMuXG5cbiAgdmFyIGxpbmVCcmVhayA9IC9cXHJcXG4/fFxcbnxcXHUyMDI4fFxcdTIwMjkvO1xuICB2YXIgbGluZUJyZWFrRyA9IG5ldyBSZWdFeHAobGluZUJyZWFrLnNvdXJjZSwgXCJnXCIpO1xuXG4gIGZ1bmN0aW9uIGlzTmV3TGluZShjb2RlKSB7XG4gICAgcmV0dXJuIGNvZGUgPT09IDEwIHx8IGNvZGUgPT09IDEzIHx8IGNvZGUgPT09IDB4MjAyOCB8fCBjb2RlID09PSAweDIwMjlcbiAgfVxuXG4gIGZ1bmN0aW9uIG5leHRMaW5lQnJlYWsoY29kZSwgZnJvbSwgZW5kKSB7XG4gICAgaWYgKCBlbmQgPT09IHZvaWQgMCApIGVuZCA9IGNvZGUubGVuZ3RoO1xuXG4gICAgZm9yICh2YXIgaSA9IGZyb207IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdmFyIG5leHQgPSBjb2RlLmNoYXJDb2RlQXQoaSk7XG4gICAgICBpZiAoaXNOZXdMaW5lKG5leHQpKVxuICAgICAgICB7IHJldHVybiBpIDwgZW5kIC0gMSAmJiBuZXh0ID09PSAxMyAmJiBjb2RlLmNoYXJDb2RlQXQoaSArIDEpID09PSAxMCA/IGkgKyAyIDogaSArIDEgfVxuICAgIH1cbiAgICByZXR1cm4gLTFcbiAgfVxuXG4gIHZhciBub25BU0NJSXdoaXRlc3BhY2UgPSAvW1xcdTE2ODBcXHUyMDAwLVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHVmZWZmXS87XG5cbiAgdmFyIHNraXBXaGl0ZVNwYWNlID0gLyg/Olxcc3xcXC9cXC8uKnxcXC9cXCpbXl0qP1xcKlxcLykqL2c7XG5cbiAgdmFyIHJlZiA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBoYXNPd25Qcm9wZXJ0eSA9IHJlZi5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHRvU3RyaW5nID0gcmVmLnRvU3RyaW5nO1xuXG4gIHZhciBoYXNPd24gPSBPYmplY3QuaGFzT3duIHx8IChmdW5jdGlvbiAob2JqLCBwcm9wTmFtZSkgeyByZXR1cm4gKFxuICAgIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wTmFtZSlcbiAgKTsgfSk7XG5cbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IChmdW5jdGlvbiAob2JqKSB7IHJldHVybiAoXG4gICAgdG9TdHJpbmcuY2FsbChvYmopID09PSBcIltvYmplY3QgQXJyYXldXCJcbiAgKTsgfSk7XG5cbiAgdmFyIHJlZ2V4cENhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICBmdW5jdGlvbiB3b3Jkc1JlZ2V4cCh3b3Jkcykge1xuICAgIHJldHVybiByZWdleHBDYWNoZVt3b3Jkc10gfHwgKHJlZ2V4cENhY2hlW3dvcmRzXSA9IG5ldyBSZWdFeHAoXCJeKD86XCIgKyB3b3Jkcy5yZXBsYWNlKC8gL2csIFwifFwiKSArIFwiKSRcIikpXG4gIH1cblxuICBmdW5jdGlvbiBjb2RlUG9pbnRUb1N0cmluZyhjb2RlKSB7XG4gICAgLy8gVVRGLTE2IERlY29kaW5nXG4gICAgaWYgKGNvZGUgPD0gMHhGRkZGKSB7IHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGUpIH1cbiAgICBjb2RlIC09IDB4MTAwMDA7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoKGNvZGUgPj4gMTApICsgMHhEODAwLCAoY29kZSAmIDEwMjMpICsgMHhEQzAwKVxuICB9XG5cbiAgdmFyIGxvbmVTdXJyb2dhdGUgPSAvKD86W1xcdUQ4MDAtXFx1REJGRl0oPyFbXFx1REMwMC1cXHVERkZGXSl8KD86W15cXHVEODAwLVxcdURCRkZdfF4pW1xcdURDMDAtXFx1REZGRl0pLztcblxuICAvLyBUaGVzZSBhcmUgdXNlZCB3aGVuIGBvcHRpb25zLmxvY2F0aW9uc2AgaXMgb24sIGZvciB0aGVcbiAgLy8gYHN0YXJ0TG9jYCBhbmQgYGVuZExvY2AgcHJvcGVydGllcy5cblxuICB2YXIgUG9zaXRpb24gPSBmdW5jdGlvbiBQb3NpdGlvbihsaW5lLCBjb2wpIHtcbiAgICB0aGlzLmxpbmUgPSBsaW5lO1xuICAgIHRoaXMuY29sdW1uID0gY29sO1xuICB9O1xuXG4gIFBvc2l0aW9uLnByb3RvdHlwZS5vZmZzZXQgPSBmdW5jdGlvbiBvZmZzZXQgKG4pIHtcbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uKHRoaXMubGluZSwgdGhpcy5jb2x1bW4gKyBuKVxuICB9O1xuXG4gIHZhciBTb3VyY2VMb2NhdGlvbiA9IGZ1bmN0aW9uIFNvdXJjZUxvY2F0aW9uKHAsIHN0YXJ0LCBlbmQpIHtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgdGhpcy5lbmQgPSBlbmQ7XG4gICAgaWYgKHAuc291cmNlRmlsZSAhPT0gbnVsbCkgeyB0aGlzLnNvdXJjZSA9IHAuc291cmNlRmlsZTsgfVxuICB9O1xuXG4gIC8vIFRoZSBgZ2V0TGluZUluZm9gIGZ1bmN0aW9uIGlzIG1vc3RseSB1c2VmdWwgd2hlbiB0aGVcbiAgLy8gYGxvY2F0aW9uc2Agb3B0aW9uIGlzIG9mZiAoZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMpIGFuZCB5b3VcbiAgLy8gd2FudCB0byBmaW5kIHRoZSBsaW5lL2NvbHVtbiBwb3NpdGlvbiBmb3IgYSBnaXZlbiBjaGFyYWN0ZXJcbiAgLy8gb2Zmc2V0LiBgaW5wdXRgIHNob3VsZCBiZSB0aGUgY29kZSBzdHJpbmcgdGhhdCB0aGUgb2Zmc2V0IHJlZmVyc1xuICAvLyBpbnRvLlxuXG4gIGZ1bmN0aW9uIGdldExpbmVJbmZvKGlucHV0LCBvZmZzZXQpIHtcbiAgICBmb3IgKHZhciBsaW5lID0gMSwgY3VyID0gMDs7KSB7XG4gICAgICB2YXIgbmV4dEJyZWFrID0gbmV4dExpbmVCcmVhayhpbnB1dCwgY3VyLCBvZmZzZXQpO1xuICAgICAgaWYgKG5leHRCcmVhayA8IDApIHsgcmV0dXJuIG5ldyBQb3NpdGlvbihsaW5lLCBvZmZzZXQgLSBjdXIpIH1cbiAgICAgICsrbGluZTtcbiAgICAgIGN1ciA9IG5leHRCcmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBBIHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGdpdmVuIHRvIGNvbmZpZ3VyZSB0aGUgcGFyc2VyIHByb2Nlc3MuXG4gIC8vIFRoZXNlIG9wdGlvbnMgYXJlIHJlY29nbml6ZWQgKG9ubHkgYGVjbWFWZXJzaW9uYCBpcyByZXF1aXJlZCk6XG5cbiAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgIC8vIGBlY21hVmVyc2lvbmAgaW5kaWNhdGVzIHRoZSBFQ01BU2NyaXB0IHZlcnNpb24gdG8gcGFyc2UuIE11c3QgYmVcbiAgICAvLyBlaXRoZXIgMywgNSwgNiAob3IgMjAxNSksIDcgKDIwMTYpLCA4ICgyMDE3KSwgOSAoMjAxOCksIDEwXG4gICAgLy8gKDIwMTkpLCAxMSAoMjAyMCksIDEyICgyMDIxKSwgMTMgKDIwMjIpLCAxNCAoMjAyMyksIG9yIGBcImxhdGVzdFwiYFxuICAgIC8vICh0aGUgbGF0ZXN0IHZlcnNpb24gdGhlIGxpYnJhcnkgc3VwcG9ydHMpLiBUaGlzIGluZmx1ZW5jZXNcbiAgICAvLyBzdXBwb3J0IGZvciBzdHJpY3QgbW9kZSwgdGhlIHNldCBvZiByZXNlcnZlZCB3b3JkcywgYW5kIHN1cHBvcnRcbiAgICAvLyBmb3IgbmV3IHN5bnRheCBmZWF0dXJlcy5cbiAgICBlY21hVmVyc2lvbjogbnVsbCxcbiAgICAvLyBgc291cmNlVHlwZWAgaW5kaWNhdGVzIHRoZSBtb2RlIHRoZSBjb2RlIHNob3VsZCBiZSBwYXJzZWQgaW4uXG4gICAgLy8gQ2FuIGJlIGVpdGhlciBgXCJzY3JpcHRcImAgb3IgYFwibW9kdWxlXCJgLiBUaGlzIGluZmx1ZW5jZXMgZ2xvYmFsXG4gICAgLy8gc3RyaWN0IG1vZGUgYW5kIHBhcnNpbmcgb2YgYGltcG9ydGAgYW5kIGBleHBvcnRgIGRlY2xhcmF0aW9ucy5cbiAgICBzb3VyY2VUeXBlOiBcInNjcmlwdFwiLFxuICAgIC8vIGBvbkluc2VydGVkU2VtaWNvbG9uYCBjYW4gYmUgYSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHdoZW5cbiAgICAvLyBhIHNlbWljb2xvbiBpcyBhdXRvbWF0aWNhbGx5IGluc2VydGVkLiBJdCB3aWxsIGJlIHBhc3NlZCB0aGVcbiAgICAvLyBwb3NpdGlvbiBvZiB0aGUgaW5zZXJ0ZWQgc2VtaWNvbG9uIGFzIGFuIG9mZnNldCwgYW5kIGlmXG4gICAgLy8gYGxvY2F0aW9uc2AgaXMgZW5hYmxlZCwgaXQgaXMgZ2l2ZW4gdGhlIGxvY2F0aW9uIGFzIGEgYHtsaW5lLFxuICAgIC8vIGNvbHVtbn1gIG9iamVjdCBhcyBzZWNvbmQgYXJndW1lbnQuXG4gICAgb25JbnNlcnRlZFNlbWljb2xvbjogbnVsbCxcbiAgICAvLyBgb25UcmFpbGluZ0NvbW1hYCBpcyBzaW1pbGFyIHRvIGBvbkluc2VydGVkU2VtaWNvbG9uYCwgYnV0IGZvclxuICAgIC8vIHRyYWlsaW5nIGNvbW1hcy5cbiAgICBvblRyYWlsaW5nQ29tbWE6IG51bGwsXG4gICAgLy8gQnkgZGVmYXVsdCwgcmVzZXJ2ZWQgd29yZHMgYXJlIG9ubHkgZW5mb3JjZWQgaWYgZWNtYVZlcnNpb24gPj0gNS5cbiAgICAvLyBTZXQgYGFsbG93UmVzZXJ2ZWRgIHRvIGEgYm9vbGVhbiB2YWx1ZSB0byBleHBsaWNpdGx5IHR1cm4gdGhpcyBvblxuICAgIC8vIGFuIG9mZi4gV2hlbiB0aGlzIG9wdGlvbiBoYXMgdGhlIHZhbHVlIFwibmV2ZXJcIiwgcmVzZXJ2ZWQgd29yZHNcbiAgICAvLyBhbmQga2V5d29yZHMgY2FuIGFsc28gbm90IGJlIHVzZWQgYXMgcHJvcGVydHkgbmFtZXMuXG4gICAgYWxsb3dSZXNlcnZlZDogbnVsbCxcbiAgICAvLyBXaGVuIGVuYWJsZWQsIGEgcmV0dXJuIGF0IHRoZSB0b3AgbGV2ZWwgaXMgbm90IGNvbnNpZGVyZWQgYW5cbiAgICAvLyBlcnJvci5cbiAgICBhbGxvd1JldHVybk91dHNpZGVGdW5jdGlvbjogZmFsc2UsXG4gICAgLy8gV2hlbiBlbmFibGVkLCBpbXBvcnQvZXhwb3J0IHN0YXRlbWVudHMgYXJlIG5vdCBjb25zdHJhaW5lZCB0b1xuICAgIC8vIGFwcGVhcmluZyBhdCB0aGUgdG9wIG9mIHRoZSBwcm9ncmFtLCBhbmQgYW4gaW1wb3J0Lm1ldGEgZXhwcmVzc2lvblxuICAgIC8vIGluIGEgc2NyaXB0IGlzbid0IGNvbnNpZGVyZWQgYW4gZXJyb3IuXG4gICAgYWxsb3dJbXBvcnRFeHBvcnRFdmVyeXdoZXJlOiBmYWxzZSxcbiAgICAvLyBCeSBkZWZhdWx0LCBhd2FpdCBpZGVudGlmaWVycyBhcmUgYWxsb3dlZCB0byBhcHBlYXIgYXQgdGhlIHRvcC1sZXZlbCBzY29wZSBvbmx5IGlmIGVjbWFWZXJzaW9uID49IDIwMjIuXG4gICAgLy8gV2hlbiBlbmFibGVkLCBhd2FpdCBpZGVudGlmaWVycyBhcmUgYWxsb3dlZCB0byBhcHBlYXIgYXQgdGhlIHRvcC1sZXZlbCBzY29wZSxcbiAgICAvLyBidXQgdGhleSBhcmUgc3RpbGwgbm90IGFsbG93ZWQgaW4gbm9uLWFzeW5jIGZ1bmN0aW9ucy5cbiAgICBhbGxvd0F3YWl0T3V0c2lkZUZ1bmN0aW9uOiBudWxsLFxuICAgIC8vIFdoZW4gZW5hYmxlZCwgc3VwZXIgaWRlbnRpZmllcnMgYXJlIG5vdCBjb25zdHJhaW5lZCB0b1xuICAgIC8vIGFwcGVhcmluZyBpbiBtZXRob2RzIGFuZCBkbyBub3QgcmFpc2UgYW4gZXJyb3Igd2hlbiB0aGV5IGFwcGVhciBlbHNld2hlcmUuXG4gICAgYWxsb3dTdXBlck91dHNpZGVNZXRob2Q6IG51bGwsXG4gICAgLy8gV2hlbiBlbmFibGVkLCBoYXNoYmFuZyBkaXJlY3RpdmUgaW4gdGhlIGJlZ2lubmluZyBvZiBmaWxlIGlzXG4gICAgLy8gYWxsb3dlZCBhbmQgdHJlYXRlZCBhcyBhIGxpbmUgY29tbWVudC4gRW5hYmxlZCBieSBkZWZhdWx0IHdoZW5cbiAgICAvLyBgZWNtYVZlcnNpb25gID49IDIwMjMuXG4gICAgYWxsb3dIYXNoQmFuZzogZmFsc2UsXG4gICAgLy8gQnkgZGVmYXVsdCwgdGhlIHBhcnNlciB3aWxsIHZlcmlmeSB0aGF0IHByaXZhdGUgcHJvcGVydGllcyBhcmVcbiAgICAvLyBvbmx5IHVzZWQgaW4gcGxhY2VzIHdoZXJlIHRoZXkgYXJlIHZhbGlkIGFuZCBoYXZlIGJlZW4gZGVjbGFyZWQuXG4gICAgLy8gU2V0IHRoaXMgdG8gZmFsc2UgdG8gdHVybiBzdWNoIGNoZWNrcyBvZmYuXG4gICAgY2hlY2tQcml2YXRlRmllbGRzOiB0cnVlLFxuICAgIC8vIFdoZW4gYGxvY2F0aW9uc2AgaXMgb24sIGBsb2NgIHByb3BlcnRpZXMgaG9sZGluZyBvYmplY3RzIHdpdGhcbiAgICAvLyBgc3RhcnRgIGFuZCBgZW5kYCBwcm9wZXJ0aWVzIGluIGB7bGluZSwgY29sdW1ufWAgZm9ybSAod2l0aFxuICAgIC8vIGxpbmUgYmVpbmcgMS1iYXNlZCBhbmQgY29sdW1uIDAtYmFzZWQpIHdpbGwgYmUgYXR0YWNoZWQgdG8gdGhlXG4gICAgLy8gbm9kZXMuXG4gICAgbG9jYXRpb25zOiBmYWxzZSxcbiAgICAvLyBBIGZ1bmN0aW9uIGNhbiBiZSBwYXNzZWQgYXMgYG9uVG9rZW5gIG9wdGlvbiwgd2hpY2ggd2lsbFxuICAgIC8vIGNhdXNlIEFjb3JuIHRvIGNhbGwgdGhhdCBmdW5jdGlvbiB3aXRoIG9iamVjdCBpbiB0aGUgc2FtZVxuICAgIC8vIGZvcm1hdCBhcyB0b2tlbnMgcmV0dXJuZWQgZnJvbSBgdG9rZW5pemVyKCkuZ2V0VG9rZW4oKWAuIE5vdGVcbiAgICAvLyB0aGF0IHlvdSBhcmUgbm90IGFsbG93ZWQgdG8gY2FsbCB0aGUgcGFyc2VyIGZyb20gdGhlXG4gICAgLy8gY2FsbGJhY2vigJR0aGF0IHdpbGwgY29ycnVwdCBpdHMgaW50ZXJuYWwgc3RhdGUuXG4gICAgb25Ub2tlbjogbnVsbCxcbiAgICAvLyBBIGZ1bmN0aW9uIGNhbiBiZSBwYXNzZWQgYXMgYG9uQ29tbWVudGAgb3B0aW9uLCB3aGljaCB3aWxsXG4gICAgLy8gY2F1c2UgQWNvcm4gdG8gY2FsbCB0aGF0IGZ1bmN0aW9uIHdpdGggYChibG9jaywgdGV4dCwgc3RhcnQsXG4gICAgLy8gZW5kKWAgcGFyYW1ldGVycyB3aGVuZXZlciBhIGNvbW1lbnQgaXMgc2tpcHBlZC4gYGJsb2NrYCBpcyBhXG4gICAgLy8gYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhpcyBpcyBhIGJsb2NrIChgLyogKi9gKSBjb21tZW50LFxuICAgIC8vIGB0ZXh0YCBpcyB0aGUgY29udGVudCBvZiB0aGUgY29tbWVudCwgYW5kIGBzdGFydGAgYW5kIGBlbmRgIGFyZVxuICAgIC8vIGNoYXJhY3RlciBvZmZzZXRzIHRoYXQgZGVub3RlIHRoZSBzdGFydCBhbmQgZW5kIG9mIHRoZSBjb21tZW50LlxuICAgIC8vIFdoZW4gdGhlIGBsb2NhdGlvbnNgIG9wdGlvbiBpcyBvbiwgdHdvIG1vcmUgcGFyYW1ldGVycyBhcmVcbiAgICAvLyBwYXNzZWQsIHRoZSBmdWxsIGB7bGluZSwgY29sdW1ufWAgbG9jYXRpb25zIG9mIHRoZSBzdGFydCBhbmRcbiAgICAvLyBlbmQgb2YgdGhlIGNvbW1lbnRzLiBOb3RlIHRoYXQgeW91IGFyZSBub3QgYWxsb3dlZCB0byBjYWxsIHRoZVxuICAgIC8vIHBhcnNlciBmcm9tIHRoZSBjYWxsYmFja+KAlHRoYXQgd2lsbCBjb3JydXB0IGl0cyBpbnRlcm5hbCBzdGF0ZS5cbiAgICAvLyBXaGVuIHRoaXMgb3B0aW9uIGhhcyBhbiBhcnJheSBhcyB2YWx1ZSwgb2JqZWN0cyByZXByZXNlbnRpbmcgdGhlXG4gICAgLy8gY29tbWVudHMgYXJlIHB1c2hlZCB0byBpdC5cbiAgICBvbkNvbW1lbnQ6IG51bGwsXG4gICAgLy8gTm9kZXMgaGF2ZSB0aGVpciBzdGFydCBhbmQgZW5kIGNoYXJhY3RlcnMgb2Zmc2V0cyByZWNvcmRlZCBpblxuICAgIC8vIGBzdGFydGAgYW5kIGBlbmRgIHByb3BlcnRpZXMgKGRpcmVjdGx5IG9uIHRoZSBub2RlLCByYXRoZXIgdGhhblxuICAgIC8vIHRoZSBgbG9jYCBvYmplY3QsIHdoaWNoIGhvbGRzIGxpbmUvY29sdW1uIGRhdGEuIFRvIGFsc28gYWRkIGFcbiAgICAvLyBbc2VtaS1zdGFuZGFyZGl6ZWRdW3JhbmdlXSBgcmFuZ2VgIHByb3BlcnR5IGhvbGRpbmcgYSBgW3N0YXJ0LFxuICAgIC8vIGVuZF1gIGFycmF5IHdpdGggdGhlIHNhbWUgbnVtYmVycywgc2V0IHRoZSBgcmFuZ2VzYCBvcHRpb24gdG9cbiAgICAvLyBgdHJ1ZWAuXG4gICAgLy9cbiAgICAvLyBbcmFuZ2VdOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD03NDU2NzhcbiAgICByYW5nZXM6IGZhbHNlLFxuICAgIC8vIEl0IGlzIHBvc3NpYmxlIHRvIHBhcnNlIG11bHRpcGxlIGZpbGVzIGludG8gYSBzaW5nbGUgQVNUIGJ5XG4gICAgLy8gcGFzc2luZyB0aGUgdHJlZSBwcm9kdWNlZCBieSBwYXJzaW5nIHRoZSBmaXJzdCBmaWxlIGFzXG4gICAgLy8gYHByb2dyYW1gIG9wdGlvbiBpbiBzdWJzZXF1ZW50IHBhcnNlcy4gVGhpcyB3aWxsIGFkZCB0aGVcbiAgICAvLyB0b3BsZXZlbCBmb3JtcyBvZiB0aGUgcGFyc2VkIGZpbGUgdG8gdGhlIGBQcm9ncmFtYCAodG9wKSBub2RlXG4gICAgLy8gb2YgYW4gZXhpc3RpbmcgcGFyc2UgdHJlZS5cbiAgICBwcm9ncmFtOiBudWxsLFxuICAgIC8vIFdoZW4gYGxvY2F0aW9uc2AgaXMgb24sIHlvdSBjYW4gcGFzcyB0aGlzIHRvIHJlY29yZCB0aGUgc291cmNlXG4gICAgLy8gZmlsZSBpbiBldmVyeSBub2RlJ3MgYGxvY2Agb2JqZWN0LlxuICAgIHNvdXJjZUZpbGU6IG51bGwsXG4gICAgLy8gVGhpcyB2YWx1ZSwgaWYgZ2l2ZW4sIGlzIHN0b3JlZCBpbiBldmVyeSBub2RlLCB3aGV0aGVyXG4gICAgLy8gYGxvY2F0aW9uc2AgaXMgb24gb3Igb2ZmLlxuICAgIGRpcmVjdFNvdXJjZUZpbGU6IG51bGwsXG4gICAgLy8gV2hlbiBlbmFibGVkLCBwYXJlbnRoZXNpemVkIGV4cHJlc3Npb25zIGFyZSByZXByZXNlbnRlZCBieVxuICAgIC8vIChub24tc3RhbmRhcmQpIFBhcmVudGhlc2l6ZWRFeHByZXNzaW9uIG5vZGVzXG4gICAgcHJlc2VydmVQYXJlbnM6IGZhbHNlXG4gIH07XG5cbiAgLy8gSW50ZXJwcmV0IGFuZCBkZWZhdWx0IGFuIG9wdGlvbnMgb2JqZWN0XG5cbiAgdmFyIHdhcm5lZEFib3V0RWNtYVZlcnNpb24gPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnZXRPcHRpb25zKG9wdHMpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xuXG4gICAgZm9yICh2YXIgb3B0IGluIGRlZmF1bHRPcHRpb25zKVxuICAgICAgeyBvcHRpb25zW29wdF0gPSBvcHRzICYmIGhhc093bihvcHRzLCBvcHQpID8gb3B0c1tvcHRdIDogZGVmYXVsdE9wdGlvbnNbb3B0XTsgfVxuXG4gICAgaWYgKG9wdGlvbnMuZWNtYVZlcnNpb24gPT09IFwibGF0ZXN0XCIpIHtcbiAgICAgIG9wdGlvbnMuZWNtYVZlcnNpb24gPSAxZTg7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmVjbWFWZXJzaW9uID09IG51bGwpIHtcbiAgICAgIGlmICghd2FybmVkQWJvdXRFY21hVmVyc2lvbiAmJiB0eXBlb2YgY29uc29sZSA9PT0gXCJvYmplY3RcIiAmJiBjb25zb2xlLndhcm4pIHtcbiAgICAgICAgd2FybmVkQWJvdXRFY21hVmVyc2lvbiA9IHRydWU7XG4gICAgICAgIGNvbnNvbGUud2FybihcIlNpbmNlIEFjb3JuIDguMC4wLCBvcHRpb25zLmVjbWFWZXJzaW9uIGlzIHJlcXVpcmVkLlxcbkRlZmF1bHRpbmcgdG8gMjAyMCwgYnV0IHRoaXMgd2lsbCBzdG9wIHdvcmtpbmcgaW4gdGhlIGZ1dHVyZS5cIik7XG4gICAgICB9XG4gICAgICBvcHRpb25zLmVjbWFWZXJzaW9uID0gMTE7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmVjbWFWZXJzaW9uID49IDIwMTUpIHtcbiAgICAgIG9wdGlvbnMuZWNtYVZlcnNpb24gLT0gMjAwOTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5hbGxvd1Jlc2VydmVkID09IG51bGwpXG4gICAgICB7IG9wdGlvbnMuYWxsb3dSZXNlcnZlZCA9IG9wdGlvbnMuZWNtYVZlcnNpb24gPCA1OyB9XG5cbiAgICBpZiAoIW9wdHMgfHwgb3B0cy5hbGxvd0hhc2hCYW5nID09IG51bGwpXG4gICAgICB7IG9wdGlvbnMuYWxsb3dIYXNoQmFuZyA9IG9wdGlvbnMuZWNtYVZlcnNpb24gPj0gMTQ7IH1cblxuICAgIGlmIChpc0FycmF5KG9wdGlvbnMub25Ub2tlbikpIHtcbiAgICAgIHZhciB0b2tlbnMgPSBvcHRpb25zLm9uVG9rZW47XG4gICAgICBvcHRpb25zLm9uVG9rZW4gPSBmdW5jdGlvbiAodG9rZW4pIHsgcmV0dXJuIHRva2Vucy5wdXNoKHRva2VuKTsgfTtcbiAgICB9XG4gICAgaWYgKGlzQXJyYXkob3B0aW9ucy5vbkNvbW1lbnQpKVxuICAgICAgeyBvcHRpb25zLm9uQ29tbWVudCA9IHB1c2hDb21tZW50KG9wdGlvbnMsIG9wdGlvbnMub25Db21tZW50KTsgfVxuXG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIGZ1bmN0aW9uIHB1c2hDb21tZW50KG9wdGlvbnMsIGFycmF5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGJsb2NrLCB0ZXh0LCBzdGFydCwgZW5kLCBzdGFydExvYywgZW5kTG9jKSB7XG4gICAgICB2YXIgY29tbWVudCA9IHtcbiAgICAgICAgdHlwZTogYmxvY2sgPyBcIkJsb2NrXCIgOiBcIkxpbmVcIixcbiAgICAgICAgdmFsdWU6IHRleHQsXG4gICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgZW5kOiBlbmRcbiAgICAgIH07XG4gICAgICBpZiAob3B0aW9ucy5sb2NhdGlvbnMpXG4gICAgICAgIHsgY29tbWVudC5sb2MgPSBuZXcgU291cmNlTG9jYXRpb24odGhpcywgc3RhcnRMb2MsIGVuZExvYyk7IH1cbiAgICAgIGlmIChvcHRpb25zLnJhbmdlcylcbiAgICAgICAgeyBjb21tZW50LnJhbmdlID0gW3N0YXJ0LCBlbmRdOyB9XG4gICAgICBhcnJheS5wdXNoKGNvbW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEVhY2ggc2NvcGUgZ2V0cyBhIGJpdHNldCB0aGF0IG1heSBjb250YWluIHRoZXNlIGZsYWdzXG4gIHZhclxuICAgICAgU0NPUEVfVE9QID0gMSxcbiAgICAgIFNDT1BFX0ZVTkNUSU9OID0gMixcbiAgICAgIFNDT1BFX0FTWU5DID0gNCxcbiAgICAgIFNDT1BFX0dFTkVSQVRPUiA9IDgsXG4gICAgICBTQ09QRV9BUlJPVyA9IDE2LFxuICAgICAgU0NPUEVfU0lNUExFX0NBVENIID0gMzIsXG4gICAgICBTQ09QRV9TVVBFUiA9IDY0LFxuICAgICAgU0NPUEVfRElSRUNUX1NVUEVSID0gMTI4LFxuICAgICAgU0NPUEVfQ0xBU1NfU1RBVElDX0JMT0NLID0gMjU2LFxuICAgICAgU0NPUEVfVkFSID0gU0NPUEVfVE9QIHwgU0NPUEVfRlVOQ1RJT04gfCBTQ09QRV9DTEFTU19TVEFUSUNfQkxPQ0s7XG5cbiAgZnVuY3Rpb24gZnVuY3Rpb25GbGFncyhhc3luYywgZ2VuZXJhdG9yKSB7XG4gICAgcmV0dXJuIFNDT1BFX0ZVTkNUSU9OIHwgKGFzeW5jID8gU0NPUEVfQVNZTkMgOiAwKSB8IChnZW5lcmF0b3IgPyBTQ09QRV9HRU5FUkFUT1IgOiAwKVxuICB9XG5cbiAgLy8gVXNlZCBpbiBjaGVja0xWYWwqIGFuZCBkZWNsYXJlTmFtZSB0byBkZXRlcm1pbmUgdGhlIHR5cGUgb2YgYSBiaW5kaW5nXG4gIHZhclxuICAgICAgQklORF9OT05FID0gMCwgLy8gTm90IGEgYmluZGluZ1xuICAgICAgQklORF9WQVIgPSAxLCAvLyBWYXItc3R5bGUgYmluZGluZ1xuICAgICAgQklORF9MRVhJQ0FMID0gMiwgLy8gTGV0LSBvciBjb25zdC1zdHlsZSBiaW5kaW5nXG4gICAgICBCSU5EX0ZVTkNUSU9OID0gMywgLy8gRnVuY3Rpb24gZGVjbGFyYXRpb25cbiAgICAgIEJJTkRfU0lNUExFX0NBVENIID0gNCwgLy8gU2ltcGxlIChpZGVudGlmaWVyIHBhdHRlcm4pIGNhdGNoIGJpbmRpbmdcbiAgICAgIEJJTkRfT1VUU0lERSA9IDU7IC8vIFNwZWNpYWwgY2FzZSBmb3IgZnVuY3Rpb24gbmFtZXMgYXMgYm91bmQgaW5zaWRlIHRoZSBmdW5jdGlvblxuXG4gIHZhciBQYXJzZXIgPSBmdW5jdGlvbiBQYXJzZXIob3B0aW9ucywgaW5wdXQsIHN0YXJ0UG9zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyA9IGdldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5zb3VyY2VGaWxlID0gb3B0aW9ucy5zb3VyY2VGaWxlO1xuICAgIHRoaXMua2V5d29yZHMgPSB3b3Jkc1JlZ2V4cChrZXl3b3JkcyQxW29wdGlvbnMuZWNtYVZlcnNpb24gPj0gNiA/IDYgOiBvcHRpb25zLnNvdXJjZVR5cGUgPT09IFwibW9kdWxlXCIgPyBcIjVtb2R1bGVcIiA6IDVdKTtcbiAgICB2YXIgcmVzZXJ2ZWQgPSBcIlwiO1xuICAgIGlmIChvcHRpb25zLmFsbG93UmVzZXJ2ZWQgIT09IHRydWUpIHtcbiAgICAgIHJlc2VydmVkID0gcmVzZXJ2ZWRXb3Jkc1tvcHRpb25zLmVjbWFWZXJzaW9uID49IDYgPyA2IDogb3B0aW9ucy5lY21hVmVyc2lvbiA9PT0gNSA/IDUgOiAzXTtcbiAgICAgIGlmIChvcHRpb25zLnNvdXJjZVR5cGUgPT09IFwibW9kdWxlXCIpIHsgcmVzZXJ2ZWQgKz0gXCIgYXdhaXRcIjsgfVxuICAgIH1cbiAgICB0aGlzLnJlc2VydmVkV29yZHMgPSB3b3Jkc1JlZ2V4cChyZXNlcnZlZCk7XG4gICAgdmFyIHJlc2VydmVkU3RyaWN0ID0gKHJlc2VydmVkID8gcmVzZXJ2ZWQgKyBcIiBcIiA6IFwiXCIpICsgcmVzZXJ2ZWRXb3Jkcy5zdHJpY3Q7XG4gICAgdGhpcy5yZXNlcnZlZFdvcmRzU3RyaWN0ID0gd29yZHNSZWdleHAocmVzZXJ2ZWRTdHJpY3QpO1xuICAgIHRoaXMucmVzZXJ2ZWRXb3Jkc1N0cmljdEJpbmQgPSB3b3Jkc1JlZ2V4cChyZXNlcnZlZFN0cmljdCArIFwiIFwiICsgcmVzZXJ2ZWRXb3Jkcy5zdHJpY3RCaW5kKTtcbiAgICB0aGlzLmlucHV0ID0gU3RyaW5nKGlucHV0KTtcblxuICAgIC8vIFVzZWQgdG8gc2lnbmFsIHRvIGNhbGxlcnMgb2YgYHJlYWRXb3JkMWAgd2hldGhlciB0aGUgd29yZFxuICAgIC8vIGNvbnRhaW5lZCBhbnkgZXNjYXBlIHNlcXVlbmNlcy4gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSB3b3JkcyB3aXRoXG4gICAgLy8gZXNjYXBlIHNlcXVlbmNlcyBtdXN0IG5vdCBiZSBpbnRlcnByZXRlZCBhcyBrZXl3b3Jkcy5cbiAgICB0aGlzLmNvbnRhaW5zRXNjID0gZmFsc2U7XG5cbiAgICAvLyBTZXQgdXAgdG9rZW4gc3RhdGVcblxuICAgIC8vIFRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSB0b2tlbml6ZXIgaW4gdGhlIGlucHV0LlxuICAgIGlmIChzdGFydFBvcykge1xuICAgICAgdGhpcy5wb3MgPSBzdGFydFBvcztcbiAgICAgIHRoaXMubGluZVN0YXJ0ID0gdGhpcy5pbnB1dC5sYXN0SW5kZXhPZihcIlxcblwiLCBzdGFydFBvcyAtIDEpICsgMTtcbiAgICAgIHRoaXMuY3VyTGluZSA9IHRoaXMuaW5wdXQuc2xpY2UoMCwgdGhpcy5saW5lU3RhcnQpLnNwbGl0KGxpbmVCcmVhaykubGVuZ3RoO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBvcyA9IHRoaXMubGluZVN0YXJ0ID0gMDtcbiAgICAgIHRoaXMuY3VyTGluZSA9IDE7XG4gICAgfVxuXG4gICAgLy8gUHJvcGVydGllcyBvZiB0aGUgY3VycmVudCB0b2tlbjpcbiAgICAvLyBJdHMgdHlwZVxuICAgIHRoaXMudHlwZSA9IHR5cGVzJDEuZW9mO1xuICAgIC8vIEZvciB0b2tlbnMgdGhhdCBpbmNsdWRlIG1vcmUgaW5mb3JtYXRpb24gdGhhbiB0aGVpciB0eXBlLCB0aGUgdmFsdWVcbiAgICB0aGlzLnZhbHVlID0gbnVsbDtcbiAgICAvLyBJdHMgc3RhcnQgYW5kIGVuZCBvZmZzZXRcbiAgICB0aGlzLnN0YXJ0ID0gdGhpcy5lbmQgPSB0aGlzLnBvcztcbiAgICAvLyBBbmQsIGlmIGxvY2F0aW9ucyBhcmUgdXNlZCwgdGhlIHtsaW5lLCBjb2x1bW59IG9iamVjdFxuICAgIC8vIGNvcnJlc3BvbmRpbmcgdG8gdGhvc2Ugb2Zmc2V0c1xuICAgIHRoaXMuc3RhcnRMb2MgPSB0aGlzLmVuZExvYyA9IHRoaXMuY3VyUG9zaXRpb24oKTtcblxuICAgIC8vIFBvc2l0aW9uIGluZm9ybWF0aW9uIGZvciB0aGUgcHJldmlvdXMgdG9rZW5cbiAgICB0aGlzLmxhc3RUb2tFbmRMb2MgPSB0aGlzLmxhc3RUb2tTdGFydExvYyA9IG51bGw7XG4gICAgdGhpcy5sYXN0VG9rU3RhcnQgPSB0aGlzLmxhc3RUb2tFbmQgPSB0aGlzLnBvcztcblxuICAgIC8vIFRoZSBjb250ZXh0IHN0YWNrIGlzIHVzZWQgdG8gc3VwZXJmaWNpYWxseSB0cmFjayBzeW50YWN0aWNcbiAgICAvLyBjb250ZXh0IHRvIHByZWRpY3Qgd2hldGhlciBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBpcyBhbGxvd2VkIGluIGFcbiAgICAvLyBnaXZlbiBwb3NpdGlvbi5cbiAgICB0aGlzLmNvbnRleHQgPSB0aGlzLmluaXRpYWxDb250ZXh0KCk7XG4gICAgdGhpcy5leHByQWxsb3dlZCA9IHRydWU7XG5cbiAgICAvLyBGaWd1cmUgb3V0IGlmIGl0J3MgYSBtb2R1bGUgY29kZS5cbiAgICB0aGlzLmluTW9kdWxlID0gb3B0aW9ucy5zb3VyY2VUeXBlID09PSBcIm1vZHVsZVwiO1xuICAgIHRoaXMuc3RyaWN0ID0gdGhpcy5pbk1vZHVsZSB8fCB0aGlzLnN0cmljdERpcmVjdGl2ZSh0aGlzLnBvcyk7XG5cbiAgICAvLyBVc2VkIHRvIHNpZ25pZnkgdGhlIHN0YXJ0IG9mIGEgcG90ZW50aWFsIGFycm93IGZ1bmN0aW9uXG4gICAgdGhpcy5wb3RlbnRpYWxBcnJvd0F0ID0gLTE7XG4gICAgdGhpcy5wb3RlbnRpYWxBcnJvd0luRm9yQXdhaXQgPSBmYWxzZTtcblxuICAgIC8vIFBvc2l0aW9ucyB0byBkZWxheWVkLWNoZWNrIHRoYXQgeWllbGQvYXdhaXQgZG9lcyBub3QgZXhpc3QgaW4gZGVmYXVsdCBwYXJhbWV0ZXJzLlxuICAgIHRoaXMueWllbGRQb3MgPSB0aGlzLmF3YWl0UG9zID0gdGhpcy5hd2FpdElkZW50UG9zID0gMDtcbiAgICAvLyBMYWJlbHMgaW4gc2NvcGUuXG4gICAgdGhpcy5sYWJlbHMgPSBbXTtcbiAgICAvLyBUaHVzLWZhciB1bmRlZmluZWQgZXhwb3J0cy5cbiAgICB0aGlzLnVuZGVmaW5lZEV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgLy8gSWYgZW5hYmxlZCwgc2tpcCBsZWFkaW5nIGhhc2hiYW5nIGxpbmUuXG4gICAgaWYgKHRoaXMucG9zID09PSAwICYmIG9wdGlvbnMuYWxsb3dIYXNoQmFuZyAmJiB0aGlzLmlucHV0LnNsaWNlKDAsIDIpID09PSBcIiMhXCIpXG4gICAgICB7IHRoaXMuc2tpcExpbmVDb21tZW50KDIpOyB9XG5cbiAgICAvLyBTY29wZSB0cmFja2luZyBmb3IgZHVwbGljYXRlIHZhcmlhYmxlIG5hbWVzIChzZWUgc2NvcGUuanMpXG4gICAgdGhpcy5zY29wZVN0YWNrID0gW107XG4gICAgdGhpcy5lbnRlclNjb3BlKFNDT1BFX1RPUCk7XG5cbiAgICAvLyBGb3IgUmVnRXhwIHZhbGlkYXRpb25cbiAgICB0aGlzLnJlZ2V4cFN0YXRlID0gbnVsbDtcblxuICAgIC8vIFRoZSBzdGFjayBvZiBwcml2YXRlIG5hbWVzLlxuICAgIC8vIEVhY2ggZWxlbWVudCBoYXMgdHdvIHByb3BlcnRpZXM6ICdkZWNsYXJlZCcgYW5kICd1c2VkJy5cbiAgICAvLyBXaGVuIGl0IGV4aXRlZCBmcm9tIHRoZSBvdXRlcm1vc3QgY2xhc3MgZGVmaW5pdGlvbiwgYWxsIHVzZWQgcHJpdmF0ZSBuYW1lcyBtdXN0IGJlIGRlY2xhcmVkLlxuICAgIHRoaXMucHJpdmF0ZU5hbWVTdGFjayA9IFtdO1xuICB9O1xuXG4gIHZhciBwcm90b3R5cGVBY2Nlc3NvcnMgPSB7IGluRnVuY3Rpb246IHsgY29uZmlndXJhYmxlOiB0cnVlIH0saW5HZW5lcmF0b3I6IHsgY29uZmlndXJhYmxlOiB0cnVlIH0saW5Bc3luYzogeyBjb25maWd1cmFibGU6IHRydWUgfSxjYW5Bd2FpdDogeyBjb25maWd1cmFibGU6IHRydWUgfSxhbGxvd1N1cGVyOiB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSB9LGFsbG93RGlyZWN0U3VwZXI6IHsgY29uZmlndXJhYmxlOiB0cnVlIH0sdHJlYXRGdW5jdGlvbnNBc1ZhcjogeyBjb25maWd1cmFibGU6IHRydWUgfSxhbGxvd05ld0RvdFRhcmdldDogeyBjb25maWd1cmFibGU6IHRydWUgfSxpbkNsYXNzU3RhdGljQmxvY2s6IHsgY29uZmlndXJhYmxlOiB0cnVlIH0gfTtcblxuICBQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UgKCkge1xuICAgIHZhciBub2RlID0gdGhpcy5vcHRpb25zLnByb2dyYW0gfHwgdGhpcy5zdGFydE5vZGUoKTtcbiAgICB0aGlzLm5leHRUb2tlbigpO1xuICAgIHJldHVybiB0aGlzLnBhcnNlVG9wTGV2ZWwobm9kZSlcbiAgfTtcblxuICBwcm90b3R5cGVBY2Nlc3NvcnMuaW5GdW5jdGlvbi5nZXQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAodGhpcy5jdXJyZW50VmFyU2NvcGUoKS5mbGFncyAmIFNDT1BFX0ZVTkNUSU9OKSA+IDAgfTtcblxuICBwcm90b3R5cGVBY2Nlc3NvcnMuaW5HZW5lcmF0b3IuZ2V0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gKHRoaXMuY3VycmVudFZhclNjb3BlKCkuZmxhZ3MgJiBTQ09QRV9HRU5FUkFUT1IpID4gMCAmJiAhdGhpcy5jdXJyZW50VmFyU2NvcGUoKS5pbkNsYXNzRmllbGRJbml0IH07XG5cbiAgcHJvdG90eXBlQWNjZXNzb3JzLmluQXN5bmMuZ2V0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gKHRoaXMuY3VycmVudFZhclNjb3BlKCkuZmxhZ3MgJiBTQ09QRV9BU1lOQykgPiAwICYmICF0aGlzLmN1cnJlbnRWYXJTY29wZSgpLmluQ2xhc3NGaWVsZEluaXQgfTtcblxuICBwcm90b3R5cGVBY2Nlc3NvcnMuY2FuQXdhaXQuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGkgPSB0aGlzLnNjb3BlU3RhY2subGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBzY29wZSA9IHRoaXMuc2NvcGVTdGFja1tpXTtcbiAgICAgIGlmIChzY29wZS5pbkNsYXNzRmllbGRJbml0IHx8IHNjb3BlLmZsYWdzICYgU0NPUEVfQ0xBU1NfU1RBVElDX0JMT0NLKSB7IHJldHVybiBmYWxzZSB9XG4gICAgICBpZiAoc2NvcGUuZmxhZ3MgJiBTQ09QRV9GVU5DVElPTikgeyByZXR1cm4gKHNjb3BlLmZsYWdzICYgU0NPUEVfQVNZTkMpID4gMCB9XG4gICAgfVxuICAgIHJldHVybiAodGhpcy5pbk1vZHVsZSAmJiB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gMTMpIHx8IHRoaXMub3B0aW9ucy5hbGxvd0F3YWl0T3V0c2lkZUZ1bmN0aW9uXG4gIH07XG5cbiAgcHJvdG90eXBlQWNjZXNzb3JzLmFsbG93U3VwZXIuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZWYgPSB0aGlzLmN1cnJlbnRUaGlzU2NvcGUoKTtcbiAgICAgIHZhciBmbGFncyA9IHJlZi5mbGFncztcbiAgICAgIHZhciBpbkNsYXNzRmllbGRJbml0ID0gcmVmLmluQ2xhc3NGaWVsZEluaXQ7XG4gICAgcmV0dXJuIChmbGFncyAmIFNDT1BFX1NVUEVSKSA+IDAgfHwgaW5DbGFzc0ZpZWxkSW5pdCB8fCB0aGlzLm9wdGlvbnMuYWxsb3dTdXBlck91dHNpZGVNZXRob2RcbiAgfTtcblxuICBwcm90b3R5cGVBY2Nlc3NvcnMuYWxsb3dEaXJlY3RTdXBlci5nZXQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAodGhpcy5jdXJyZW50VGhpc1Njb3BlKCkuZmxhZ3MgJiBTQ09QRV9ESVJFQ1RfU1VQRVIpID4gMCB9O1xuXG4gIHByb3RvdHlwZUFjY2Vzc29ycy50cmVhdEZ1bmN0aW9uc0FzVmFyLmdldCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMudHJlYXRGdW5jdGlvbnNBc1ZhckluU2NvcGUodGhpcy5jdXJyZW50U2NvcGUoKSkgfTtcblxuICBwcm90b3R5cGVBY2Nlc3NvcnMuYWxsb3dOZXdEb3RUYXJnZXQuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZWYgPSB0aGlzLmN1cnJlbnRUaGlzU2NvcGUoKTtcbiAgICAgIHZhciBmbGFncyA9IHJlZi5mbGFncztcbiAgICAgIHZhciBpbkNsYXNzRmllbGRJbml0ID0gcmVmLmluQ2xhc3NGaWVsZEluaXQ7XG4gICAgcmV0dXJuIChmbGFncyAmIChTQ09QRV9GVU5DVElPTiB8IFNDT1BFX0NMQVNTX1NUQVRJQ19CTE9DSykpID4gMCB8fCBpbkNsYXNzRmllbGRJbml0XG4gIH07XG5cbiAgcHJvdG90eXBlQWNjZXNzb3JzLmluQ2xhc3NTdGF0aWNCbG9jay5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLmN1cnJlbnRWYXJTY29wZSgpLmZsYWdzICYgU0NPUEVfQ0xBU1NfU1RBVElDX0JMT0NLKSA+IDBcbiAgfTtcblxuICBQYXJzZXIuZXh0ZW5kID0gZnVuY3Rpb24gZXh0ZW5kICgpIHtcbiAgICAgIHZhciBwbHVnaW5zID0gW10sIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICB3aGlsZSAoIGxlbi0tICkgcGx1Z2luc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiBdO1xuXG4gICAgdmFyIGNscyA9IHRoaXM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwbHVnaW5zLmxlbmd0aDsgaSsrKSB7IGNscyA9IHBsdWdpbnNbaV0oY2xzKTsgfVxuICAgIHJldHVybiBjbHNcbiAgfTtcblxuICBQYXJzZXIucGFyc2UgPSBmdW5jdGlvbiBwYXJzZSAoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMob3B0aW9ucywgaW5wdXQpLnBhcnNlKClcbiAgfTtcblxuICBQYXJzZXIucGFyc2VFeHByZXNzaW9uQXQgPSBmdW5jdGlvbiBwYXJzZUV4cHJlc3Npb25BdCAoaW5wdXQsIHBvcywgb3B0aW9ucykge1xuICAgIHZhciBwYXJzZXIgPSBuZXcgdGhpcyhvcHRpb25zLCBpbnB1dCwgcG9zKTtcbiAgICBwYXJzZXIubmV4dFRva2VuKCk7XG4gICAgcmV0dXJuIHBhcnNlci5wYXJzZUV4cHJlc3Npb24oKVxuICB9O1xuXG4gIFBhcnNlci50b2tlbml6ZXIgPSBmdW5jdGlvbiB0b2tlbml6ZXIgKGlucHV0LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG9wdGlvbnMsIGlucHV0KVxuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBQYXJzZXIucHJvdG90eXBlLCBwcm90b3R5cGVBY2Nlc3NvcnMgKTtcblxuICB2YXIgcHAkOSA9IFBhcnNlci5wcm90b3R5cGU7XG5cbiAgLy8gIyMgUGFyc2VyIHV0aWxpdGllc1xuXG4gIHZhciBsaXRlcmFsID0gL14oPzonKCg/OlxcXFxbXl18W14nXFxcXF0pKj8pJ3xcIigoPzpcXFxcW15dfFteXCJcXFxcXSkqPylcIikvO1xuICBwcCQ5LnN0cmljdERpcmVjdGl2ZSA9IGZ1bmN0aW9uKHN0YXJ0KSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA8IDUpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICBmb3IgKDs7KSB7XG4gICAgICAvLyBUcnkgdG8gZmluZCBzdHJpbmcgbGl0ZXJhbC5cbiAgICAgIHNraXBXaGl0ZVNwYWNlLmxhc3RJbmRleCA9IHN0YXJ0O1xuICAgICAgc3RhcnQgKz0gc2tpcFdoaXRlU3BhY2UuZXhlYyh0aGlzLmlucHV0KVswXS5sZW5ndGg7XG4gICAgICB2YXIgbWF0Y2ggPSBsaXRlcmFsLmV4ZWModGhpcy5pbnB1dC5zbGljZShzdGFydCkpO1xuICAgICAgaWYgKCFtYXRjaCkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgaWYgKChtYXRjaFsxXSB8fCBtYXRjaFsyXSkgPT09IFwidXNlIHN0cmljdFwiKSB7XG4gICAgICAgIHNraXBXaGl0ZVNwYWNlLmxhc3RJbmRleCA9IHN0YXJ0ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgICB2YXIgc3BhY2VBZnRlciA9IHNraXBXaGl0ZVNwYWNlLmV4ZWModGhpcy5pbnB1dCksIGVuZCA9IHNwYWNlQWZ0ZXIuaW5kZXggKyBzcGFjZUFmdGVyWzBdLmxlbmd0aDtcbiAgICAgICAgdmFyIG5leHQgPSB0aGlzLmlucHV0LmNoYXJBdChlbmQpO1xuICAgICAgICByZXR1cm4gbmV4dCA9PT0gXCI7XCIgfHwgbmV4dCA9PT0gXCJ9XCIgfHxcbiAgICAgICAgICAobGluZUJyZWFrLnRlc3Qoc3BhY2VBZnRlclswXSkgJiZcbiAgICAgICAgICAgISgvWyhgLlsrXFwtLyolPD49LD9eJl0vLnRlc3QobmV4dCkgfHwgbmV4dCA9PT0gXCIhXCIgJiYgdGhpcy5pbnB1dC5jaGFyQXQoZW5kICsgMSkgPT09IFwiPVwiKSlcbiAgICAgIH1cbiAgICAgIHN0YXJ0ICs9IG1hdGNoWzBdLmxlbmd0aDtcblxuICAgICAgLy8gU2tpcCBzZW1pY29sb24sIGlmIGFueS5cbiAgICAgIHNraXBXaGl0ZVNwYWNlLmxhc3RJbmRleCA9IHN0YXJ0O1xuICAgICAgc3RhcnQgKz0gc2tpcFdoaXRlU3BhY2UuZXhlYyh0aGlzLmlucHV0KVswXS5sZW5ndGg7XG4gICAgICBpZiAodGhpcy5pbnB1dFtzdGFydF0gPT09IFwiO1wiKVxuICAgICAgICB7IHN0YXJ0Kys7IH1cbiAgICB9XG4gIH07XG5cbiAgLy8gUHJlZGljYXRlIHRoYXQgdGVzdHMgd2hldGhlciB0aGUgbmV4dCB0b2tlbiBpcyBvZiB0aGUgZ2l2ZW5cbiAgLy8gdHlwZSwgYW5kIGlmIHllcywgY29uc3VtZXMgaXQgYXMgYSBzaWRlIGVmZmVjdC5cblxuICBwcCQ5LmVhdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlKSB7XG4gICAgICB0aGlzLm5leHQoKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfTtcblxuICAvLyBUZXN0cyB3aGV0aGVyIHBhcnNlZCB0b2tlbiBpcyBhIGNvbnRleHR1YWwga2V5d29yZC5cblxuICBwcCQ5LmlzQ29udGV4dHVhbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlID09PSB0eXBlcyQxLm5hbWUgJiYgdGhpcy52YWx1ZSA9PT0gbmFtZSAmJiAhdGhpcy5jb250YWluc0VzY1xuICB9O1xuXG4gIC8vIENvbnN1bWVzIGNvbnRleHR1YWwga2V5d29yZCBpZiBwb3NzaWJsZS5cblxuICBwcCQ5LmVhdENvbnRleHR1YWwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgaWYgKCF0aGlzLmlzQ29udGV4dHVhbChuYW1lKSkgeyByZXR1cm4gZmFsc2UgfVxuICAgIHRoaXMubmV4dCgpO1xuICAgIHJldHVybiB0cnVlXG4gIH07XG5cbiAgLy8gQXNzZXJ0cyB0aGF0IGZvbGxvd2luZyB0b2tlbiBpcyBnaXZlbiBjb250ZXh0dWFsIGtleXdvcmQuXG5cbiAgcHAkOS5leHBlY3RDb250ZXh0dWFsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGlmICghdGhpcy5lYXRDb250ZXh0dWFsKG5hbWUpKSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gIH07XG5cbiAgLy8gVGVzdCB3aGV0aGVyIGEgc2VtaWNvbG9uIGNhbiBiZSBpbnNlcnRlZCBhdCB0aGUgY3VycmVudCBwb3NpdGlvbi5cblxuICBwcCQ5LmNhbkluc2VydFNlbWljb2xvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnR5cGUgPT09IHR5cGVzJDEuZW9mIHx8XG4gICAgICB0aGlzLnR5cGUgPT09IHR5cGVzJDEuYnJhY2VSIHx8XG4gICAgICBsaW5lQnJlYWsudGVzdCh0aGlzLmlucHV0LnNsaWNlKHRoaXMubGFzdFRva0VuZCwgdGhpcy5zdGFydCkpXG4gIH07XG5cbiAgcHAkOS5pbnNlcnRTZW1pY29sb24gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5jYW5JbnNlcnRTZW1pY29sb24oKSkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5vbkluc2VydGVkU2VtaWNvbG9uKVxuICAgICAgICB7IHRoaXMub3B0aW9ucy5vbkluc2VydGVkU2VtaWNvbG9uKHRoaXMubGFzdFRva0VuZCwgdGhpcy5sYXN0VG9rRW5kTG9jKTsgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH07XG5cbiAgLy8gQ29uc3VtZSBhIHNlbWljb2xvbiwgb3IsIGZhaWxpbmcgdGhhdCwgc2VlIGlmIHdlIGFyZSBhbGxvd2VkIHRvXG4gIC8vIHByZXRlbmQgdGhhdCB0aGVyZSBpcyBhIHNlbWljb2xvbiBhdCB0aGlzIHBvc2l0aW9uLlxuXG4gIHBwJDkuc2VtaWNvbG9uID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLmVhdCh0eXBlcyQxLnNlbWkpICYmICF0aGlzLmluc2VydFNlbWljb2xvbigpKSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gIH07XG5cbiAgcHAkOS5hZnRlclRyYWlsaW5nQ29tbWEgPSBmdW5jdGlvbih0b2tUeXBlLCBub3ROZXh0KSB7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gdG9rVHlwZSkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5vblRyYWlsaW5nQ29tbWEpXG4gICAgICAgIHsgdGhpcy5vcHRpb25zLm9uVHJhaWxpbmdDb21tYSh0aGlzLmxhc3RUb2tTdGFydCwgdGhpcy5sYXN0VG9rU3RhcnRMb2MpOyB9XG4gICAgICBpZiAoIW5vdE5leHQpXG4gICAgICAgIHsgdGhpcy5uZXh0KCk7IH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9O1xuXG4gIC8vIEV4cGVjdCBhIHRva2VuIG9mIGEgZ2l2ZW4gdHlwZS4gSWYgZm91bmQsIGNvbnN1bWUgaXQsIG90aGVyd2lzZSxcbiAgLy8gcmFpc2UgYW4gdW5leHBlY3RlZCB0b2tlbiBlcnJvci5cblxuICBwcCQ5LmV4cGVjdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB0aGlzLmVhdCh0eXBlKSB8fCB0aGlzLnVuZXhwZWN0ZWQoKTtcbiAgfTtcblxuICAvLyBSYWlzZSBhbiB1bmV4cGVjdGVkIHRva2VuIGVycm9yLlxuXG4gIHBwJDkudW5leHBlY3RlZCA9IGZ1bmN0aW9uKHBvcykge1xuICAgIHRoaXMucmFpc2UocG9zICE9IG51bGwgPyBwb3MgOiB0aGlzLnN0YXJ0LCBcIlVuZXhwZWN0ZWQgdG9rZW5cIik7XG4gIH07XG5cbiAgdmFyIERlc3RydWN0dXJpbmdFcnJvcnMgPSBmdW5jdGlvbiBEZXN0cnVjdHVyaW5nRXJyb3JzKCkge1xuICAgIHRoaXMuc2hvcnRoYW5kQXNzaWduID1cbiAgICB0aGlzLnRyYWlsaW5nQ29tbWEgPVxuICAgIHRoaXMucGFyZW50aGVzaXplZEFzc2lnbiA9XG4gICAgdGhpcy5wYXJlbnRoZXNpemVkQmluZCA9XG4gICAgdGhpcy5kb3VibGVQcm90byA9XG4gICAgICAtMTtcbiAgfTtcblxuICBwcCQ5LmNoZWNrUGF0dGVybkVycm9ycyA9IGZ1bmN0aW9uKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIGlzQXNzaWduKSB7XG4gICAgaWYgKCFyZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSB7IHJldHVybiB9XG4gICAgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMudHJhaWxpbmdDb21tYSA+IC0xKVxuICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy50cmFpbGluZ0NvbW1hLCBcIkNvbW1hIGlzIG5vdCBwZXJtaXR0ZWQgYWZ0ZXIgdGhlIHJlc3QgZWxlbWVudFwiKTsgfVxuICAgIHZhciBwYXJlbnMgPSBpc0Fzc2lnbiA/IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMucGFyZW50aGVzaXplZEFzc2lnbiA6IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMucGFyZW50aGVzaXplZEJpbmQ7XG4gICAgaWYgKHBhcmVucyA+IC0xKSB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShwYXJlbnMsIGlzQXNzaWduID8gXCJBc3NpZ25pbmcgdG8gcnZhbHVlXCIgOiBcIlBhcmVudGhlc2l6ZWQgcGF0dGVyblwiKTsgfVxuICB9O1xuXG4gIHBwJDkuY2hlY2tFeHByZXNzaW9uRXJyb3JzID0gZnVuY3Rpb24ocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycywgYW5kVGhyb3cpIHtcbiAgICBpZiAoIXJlZkRlc3RydWN0dXJpbmdFcnJvcnMpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICB2YXIgc2hvcnRoYW5kQXNzaWduID0gcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5zaG9ydGhhbmRBc3NpZ247XG4gICAgdmFyIGRvdWJsZVByb3RvID0gcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5kb3VibGVQcm90bztcbiAgICBpZiAoIWFuZFRocm93KSB7IHJldHVybiBzaG9ydGhhbmRBc3NpZ24gPj0gMCB8fCBkb3VibGVQcm90byA+PSAwIH1cbiAgICBpZiAoc2hvcnRoYW5kQXNzaWduID49IDApXG4gICAgICB7IHRoaXMucmFpc2Uoc2hvcnRoYW5kQXNzaWduLCBcIlNob3J0aGFuZCBwcm9wZXJ0eSBhc3NpZ25tZW50cyBhcmUgdmFsaWQgb25seSBpbiBkZXN0cnVjdHVyaW5nIHBhdHRlcm5zXCIpOyB9XG4gICAgaWYgKGRvdWJsZVByb3RvID49IDApXG4gICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShkb3VibGVQcm90bywgXCJSZWRlZmluaXRpb24gb2YgX19wcm90b19fIHByb3BlcnR5XCIpOyB9XG4gIH07XG5cbiAgcHAkOS5jaGVja1lpZWxkQXdhaXRJbkRlZmF1bHRQYXJhbXMgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy55aWVsZFBvcyAmJiAoIXRoaXMuYXdhaXRQb3MgfHwgdGhpcy55aWVsZFBvcyA8IHRoaXMuYXdhaXRQb3MpKVxuICAgICAgeyB0aGlzLnJhaXNlKHRoaXMueWllbGRQb3MsIFwiWWllbGQgZXhwcmVzc2lvbiBjYW5ub3QgYmUgYSBkZWZhdWx0IHZhbHVlXCIpOyB9XG4gICAgaWYgKHRoaXMuYXdhaXRQb3MpXG4gICAgICB7IHRoaXMucmFpc2UodGhpcy5hd2FpdFBvcywgXCJBd2FpdCBleHByZXNzaW9uIGNhbm5vdCBiZSBhIGRlZmF1bHQgdmFsdWVcIik7IH1cbiAgfTtcblxuICBwcCQ5LmlzU2ltcGxlQXNzaWduVGFyZ2V0ID0gZnVuY3Rpb24oZXhwcikge1xuICAgIGlmIChleHByLnR5cGUgPT09IFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIilcbiAgICAgIHsgcmV0dXJuIHRoaXMuaXNTaW1wbGVBc3NpZ25UYXJnZXQoZXhwci5leHByZXNzaW9uKSB9XG4gICAgcmV0dXJuIGV4cHIudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgfHwgZXhwci50eXBlID09PSBcIk1lbWJlckV4cHJlc3Npb25cIlxuICB9O1xuXG4gIHZhciBwcCQ4ID0gUGFyc2VyLnByb3RvdHlwZTtcblxuICAvLyAjIyMgU3RhdGVtZW50IHBhcnNpbmdcblxuICAvLyBQYXJzZSBhIHByb2dyYW0uIEluaXRpYWxpemVzIHRoZSBwYXJzZXIsIHJlYWRzIGFueSBudW1iZXIgb2ZcbiAgLy8gc3RhdGVtZW50cywgYW5kIHdyYXBzIHRoZW0gaW4gYSBQcm9ncmFtIG5vZGUuICBPcHRpb25hbGx5IHRha2VzIGFcbiAgLy8gYHByb2dyYW1gIGFyZ3VtZW50LiAgSWYgcHJlc2VudCwgdGhlIHN0YXRlbWVudHMgd2lsbCBiZSBhcHBlbmRlZFxuICAvLyB0byBpdHMgYm9keSBpbnN0ZWFkIG9mIGNyZWF0aW5nIGEgbmV3IG5vZGUuXG5cbiAgcHAkOC5wYXJzZVRvcExldmVsID0gZnVuY3Rpb24obm9kZSkge1xuICAgIHZhciBleHBvcnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBpZiAoIW5vZGUuYm9keSkgeyBub2RlLmJvZHkgPSBbXTsgfVxuICAgIHdoaWxlICh0aGlzLnR5cGUgIT09IHR5cGVzJDEuZW9mKSB7XG4gICAgICB2YXIgc3RtdCA9IHRoaXMucGFyc2VTdGF0ZW1lbnQobnVsbCwgdHJ1ZSwgZXhwb3J0cyk7XG4gICAgICBub2RlLmJvZHkucHVzaChzdG10KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaW5Nb2R1bGUpXG4gICAgICB7IGZvciAodmFyIGkgPSAwLCBsaXN0ID0gT2JqZWN0LmtleXModGhpcy51bmRlZmluZWRFeHBvcnRzKTsgaSA8IGxpc3QubGVuZ3RoOyBpICs9IDEpXG4gICAgICAgIHtcbiAgICAgICAgICB2YXIgbmFtZSA9IGxpc3RbaV07XG5cbiAgICAgICAgICB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodGhpcy51bmRlZmluZWRFeHBvcnRzW25hbWVdLnN0YXJ0LCAoXCJFeHBvcnQgJ1wiICsgbmFtZSArIFwiJyBpcyBub3QgZGVmaW5lZFwiKSk7XG4gICAgICAgIH0gfVxuICAgIHRoaXMuYWRhcHREaXJlY3RpdmVQcm9sb2d1ZShub2RlLmJvZHkpO1xuICAgIHRoaXMubmV4dCgpO1xuICAgIG5vZGUuc291cmNlVHlwZSA9IHRoaXMub3B0aW9ucy5zb3VyY2VUeXBlO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJQcm9ncmFtXCIpXG4gIH07XG5cbiAgdmFyIGxvb3BMYWJlbCA9IHtraW5kOiBcImxvb3BcIn0sIHN3aXRjaExhYmVsID0ge2tpbmQ6IFwic3dpdGNoXCJ9O1xuXG4gIHBwJDguaXNMZXQgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA8IDYgfHwgIXRoaXMuaXNDb250ZXh0dWFsKFwibGV0XCIpKSB7IHJldHVybiBmYWxzZSB9XG4gICAgc2tpcFdoaXRlU3BhY2UubGFzdEluZGV4ID0gdGhpcy5wb3M7XG4gICAgdmFyIHNraXAgPSBza2lwV2hpdGVTcGFjZS5leGVjKHRoaXMuaW5wdXQpO1xuICAgIHZhciBuZXh0ID0gdGhpcy5wb3MgKyBza2lwWzBdLmxlbmd0aCwgbmV4dENoID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KG5leHQpO1xuICAgIC8vIEZvciBhbWJpZ3VvdXMgY2FzZXMsIGRldGVybWluZSBpZiBhIExleGljYWxEZWNsYXJhdGlvbiAob3Igb25seSBhXG4gICAgLy8gU3RhdGVtZW50KSBpcyBhbGxvd2VkIGhlcmUuIElmIGNvbnRleHQgaXMgbm90IGVtcHR5IHRoZW4gb25seSBhIFN0YXRlbWVudFxuICAgIC8vIGlzIGFsbG93ZWQuIEhvd2V2ZXIsIGBsZXQgW2AgaXMgYW4gZXhwbGljaXQgbmVnYXRpdmUgbG9va2FoZWFkIGZvclxuICAgIC8vIEV4cHJlc3Npb25TdGF0ZW1lbnQsIHNvIHNwZWNpYWwtY2FzZSBpdCBmaXJzdC5cbiAgICBpZiAobmV4dENoID09PSA5MSB8fCBuZXh0Q2ggPT09IDkyKSB7IHJldHVybiB0cnVlIH0gLy8gJ1snLCAnXFwnXG4gICAgaWYgKGNvbnRleHQpIHsgcmV0dXJuIGZhbHNlIH1cblxuICAgIGlmIChuZXh0Q2ggPT09IDEyMyB8fCBuZXh0Q2ggPiAweGQ3ZmYgJiYgbmV4dENoIDwgMHhkYzAwKSB7IHJldHVybiB0cnVlIH0gLy8gJ3snLCBhc3RyYWxcbiAgICBpZiAoaXNJZGVudGlmaWVyU3RhcnQobmV4dENoLCB0cnVlKSkge1xuICAgICAgdmFyIHBvcyA9IG5leHQgKyAxO1xuICAgICAgd2hpbGUgKGlzSWRlbnRpZmllckNoYXIobmV4dENoID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHBvcyksIHRydWUpKSB7ICsrcG9zOyB9XG4gICAgICBpZiAobmV4dENoID09PSA5MiB8fCBuZXh0Q2ggPiAweGQ3ZmYgJiYgbmV4dENoIDwgMHhkYzAwKSB7IHJldHVybiB0cnVlIH1cbiAgICAgIHZhciBpZGVudCA9IHRoaXMuaW5wdXQuc2xpY2UobmV4dCwgcG9zKTtcbiAgICAgIGlmICgha2V5d29yZFJlbGF0aW9uYWxPcGVyYXRvci50ZXN0KGlkZW50KSkgeyByZXR1cm4gdHJ1ZSB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIC8vIGNoZWNrICdhc3luYyBbbm8gTGluZVRlcm1pbmF0b3IgaGVyZV0gZnVuY3Rpb24nXG4gIC8vIC0gJ2FzeW5jIC8qZm9vKi8gZnVuY3Rpb24nIGlzIE9LLlxuICAvLyAtICdhc3luYyAvKlxcbiovIGZ1bmN0aW9uJyBpcyBpbnZhbGlkLlxuICBwcCQ4LmlzQXN5bmNGdW5jdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPCA4IHx8ICF0aGlzLmlzQ29udGV4dHVhbChcImFzeW5jXCIpKVxuICAgICAgeyByZXR1cm4gZmFsc2UgfVxuXG4gICAgc2tpcFdoaXRlU3BhY2UubGFzdEluZGV4ID0gdGhpcy5wb3M7XG4gICAgdmFyIHNraXAgPSBza2lwV2hpdGVTcGFjZS5leGVjKHRoaXMuaW5wdXQpO1xuICAgIHZhciBuZXh0ID0gdGhpcy5wb3MgKyBza2lwWzBdLmxlbmd0aCwgYWZ0ZXI7XG4gICAgcmV0dXJuICFsaW5lQnJlYWsudGVzdCh0aGlzLmlucHV0LnNsaWNlKHRoaXMucG9zLCBuZXh0KSkgJiZcbiAgICAgIHRoaXMuaW5wdXQuc2xpY2UobmV4dCwgbmV4dCArIDgpID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgICAgIChuZXh0ICsgOCA9PT0gdGhpcy5pbnB1dC5sZW5ndGggfHxcbiAgICAgICAhKGlzSWRlbnRpZmllckNoYXIoYWZ0ZXIgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQobmV4dCArIDgpKSB8fCBhZnRlciA+IDB4ZDdmZiAmJiBhZnRlciA8IDB4ZGMwMCkpXG4gIH07XG5cbiAgLy8gUGFyc2UgYSBzaW5nbGUgc3RhdGVtZW50LlxuICAvL1xuICAvLyBJZiBleHBlY3RpbmcgYSBzdGF0ZW1lbnQgYW5kIGZpbmRpbmcgYSBzbGFzaCBvcGVyYXRvciwgcGFyc2UgYVxuICAvLyByZWd1bGFyIGV4cHJlc3Npb24gbGl0ZXJhbC4gVGhpcyBpcyB0byBoYW5kbGUgY2FzZXMgbGlrZVxuICAvLyBgaWYgKGZvbykgL2JsYWgvLmV4ZWMoZm9vKWAsIHdoZXJlIGxvb2tpbmcgYXQgdGhlIHByZXZpb3VzIHRva2VuXG4gIC8vIGRvZXMgbm90IGhlbHAuXG5cbiAgcHAkOC5wYXJzZVN0YXRlbWVudCA9IGZ1bmN0aW9uKGNvbnRleHQsIHRvcExldmVsLCBleHBvcnRzKSB7XG4gICAgdmFyIHN0YXJ0dHlwZSA9IHRoaXMudHlwZSwgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCksIGtpbmQ7XG5cbiAgICBpZiAodGhpcy5pc0xldChjb250ZXh0KSkge1xuICAgICAgc3RhcnR0eXBlID0gdHlwZXMkMS5fdmFyO1xuICAgICAga2luZCA9IFwibGV0XCI7XG4gICAgfVxuXG4gICAgLy8gTW9zdCB0eXBlcyBvZiBzdGF0ZW1lbnRzIGFyZSByZWNvZ25pemVkIGJ5IHRoZSBrZXl3b3JkIHRoZXlcbiAgICAvLyBzdGFydCB3aXRoLiBNYW55IGFyZSB0cml2aWFsIHRvIHBhcnNlLCBzb21lIHJlcXVpcmUgYSBiaXQgb2ZcbiAgICAvLyBjb21wbGV4aXR5LlxuXG4gICAgc3dpdGNoIChzdGFydHR5cGUpIHtcbiAgICBjYXNlIHR5cGVzJDEuX2JyZWFrOiBjYXNlIHR5cGVzJDEuX2NvbnRpbnVlOiByZXR1cm4gdGhpcy5wYXJzZUJyZWFrQ29udGludWVTdGF0ZW1lbnQobm9kZSwgc3RhcnR0eXBlLmtleXdvcmQpXG4gICAgY2FzZSB0eXBlcyQxLl9kZWJ1Z2dlcjogcmV0dXJuIHRoaXMucGFyc2VEZWJ1Z2dlclN0YXRlbWVudChub2RlKVxuICAgIGNhc2UgdHlwZXMkMS5fZG86IHJldHVybiB0aGlzLnBhcnNlRG9TdGF0ZW1lbnQobm9kZSlcbiAgICBjYXNlIHR5cGVzJDEuX2ZvcjogcmV0dXJuIHRoaXMucGFyc2VGb3JTdGF0ZW1lbnQobm9kZSlcbiAgICBjYXNlIHR5cGVzJDEuX2Z1bmN0aW9uOlxuICAgICAgLy8gRnVuY3Rpb24gYXMgc29sZSBib2R5IG9mIGVpdGhlciBhbiBpZiBzdGF0ZW1lbnQgb3IgYSBsYWJlbGVkIHN0YXRlbWVudFxuICAgICAgLy8gd29ya3MsIGJ1dCBub3Qgd2hlbiBpdCBpcyBwYXJ0IG9mIGEgbGFiZWxlZCBzdGF0ZW1lbnQgdGhhdCBpcyB0aGUgc29sZVxuICAgICAgLy8gYm9keSBvZiBhbiBpZiBzdGF0ZW1lbnQuXG4gICAgICBpZiAoKGNvbnRleHQgJiYgKHRoaXMuc3RyaWN0IHx8IGNvbnRleHQgIT09IFwiaWZcIiAmJiBjb250ZXh0ICE9PSBcImxhYmVsXCIpKSAmJiB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNikgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgICAgcmV0dXJuIHRoaXMucGFyc2VGdW5jdGlvblN0YXRlbWVudChub2RlLCBmYWxzZSwgIWNvbnRleHQpXG4gICAgY2FzZSB0eXBlcyQxLl9jbGFzczpcbiAgICAgIGlmIChjb250ZXh0KSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUNsYXNzKG5vZGUsIHRydWUpXG4gICAgY2FzZSB0eXBlcyQxLl9pZjogcmV0dXJuIHRoaXMucGFyc2VJZlN0YXRlbWVudChub2RlKVxuICAgIGNhc2UgdHlwZXMkMS5fcmV0dXJuOiByZXR1cm4gdGhpcy5wYXJzZVJldHVyblN0YXRlbWVudChub2RlKVxuICAgIGNhc2UgdHlwZXMkMS5fc3dpdGNoOiByZXR1cm4gdGhpcy5wYXJzZVN3aXRjaFN0YXRlbWVudChub2RlKVxuICAgIGNhc2UgdHlwZXMkMS5fdGhyb3c6IHJldHVybiB0aGlzLnBhcnNlVGhyb3dTdGF0ZW1lbnQobm9kZSlcbiAgICBjYXNlIHR5cGVzJDEuX3RyeTogcmV0dXJuIHRoaXMucGFyc2VUcnlTdGF0ZW1lbnQobm9kZSlcbiAgICBjYXNlIHR5cGVzJDEuX2NvbnN0OiBjYXNlIHR5cGVzJDEuX3ZhcjpcbiAgICAgIGtpbmQgPSBraW5kIHx8IHRoaXMudmFsdWU7XG4gICAgICBpZiAoY29udGV4dCAmJiBraW5kICE9PSBcInZhclwiKSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZVZhclN0YXRlbWVudChub2RlLCBraW5kKVxuICAgIGNhc2UgdHlwZXMkMS5fd2hpbGU6IHJldHVybiB0aGlzLnBhcnNlV2hpbGVTdGF0ZW1lbnQobm9kZSlcbiAgICBjYXNlIHR5cGVzJDEuX3dpdGg6IHJldHVybiB0aGlzLnBhcnNlV2l0aFN0YXRlbWVudChub2RlKVxuICAgIGNhc2UgdHlwZXMkMS5icmFjZUw6IHJldHVybiB0aGlzLnBhcnNlQmxvY2sodHJ1ZSwgbm9kZSlcbiAgICBjYXNlIHR5cGVzJDEuc2VtaTogcmV0dXJuIHRoaXMucGFyc2VFbXB0eVN0YXRlbWVudChub2RlKVxuICAgIGNhc2UgdHlwZXMkMS5fZXhwb3J0OlxuICAgIGNhc2UgdHlwZXMkMS5faW1wb3J0OlxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+IDEwICYmIHN0YXJ0dHlwZSA9PT0gdHlwZXMkMS5faW1wb3J0KSB7XG4gICAgICAgIHNraXBXaGl0ZVNwYWNlLmxhc3RJbmRleCA9IHRoaXMucG9zO1xuICAgICAgICB2YXIgc2tpcCA9IHNraXBXaGl0ZVNwYWNlLmV4ZWModGhpcy5pbnB1dCk7XG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5wb3MgKyBza2lwWzBdLmxlbmd0aCwgbmV4dENoID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KG5leHQpO1xuICAgICAgICBpZiAobmV4dENoID09PSA0MCB8fCBuZXh0Q2ggPT09IDQ2KSAvLyAnKCcgb3IgJy4nXG4gICAgICAgICAgeyByZXR1cm4gdGhpcy5wYXJzZUV4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSwgdGhpcy5wYXJzZUV4cHJlc3Npb24oKSkgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5hbGxvd0ltcG9ydEV4cG9ydEV2ZXJ5d2hlcmUpIHtcbiAgICAgICAgaWYgKCF0b3BMZXZlbClcbiAgICAgICAgICB7IHRoaXMucmFpc2UodGhpcy5zdGFydCwgXCInaW1wb3J0JyBhbmQgJ2V4cG9ydCcgbWF5IG9ubHkgYXBwZWFyIGF0IHRoZSB0b3AgbGV2ZWxcIik7IH1cbiAgICAgICAgaWYgKCF0aGlzLmluTW9kdWxlKVxuICAgICAgICAgIHsgdGhpcy5yYWlzZSh0aGlzLnN0YXJ0LCBcIidpbXBvcnQnIGFuZCAnZXhwb3J0JyBtYXkgYXBwZWFyIG9ubHkgd2l0aCAnc291cmNlVHlwZTogbW9kdWxlJ1wiKTsgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHN0YXJ0dHlwZSA9PT0gdHlwZXMkMS5faW1wb3J0ID8gdGhpcy5wYXJzZUltcG9ydChub2RlKSA6IHRoaXMucGFyc2VFeHBvcnQobm9kZSwgZXhwb3J0cylcblxuICAgICAgLy8gSWYgdGhlIHN0YXRlbWVudCBkb2VzIG5vdCBzdGFydCB3aXRoIGEgc3RhdGVtZW50IGtleXdvcmQgb3IgYVxuICAgICAgLy8gYnJhY2UsIGl0J3MgYW4gRXhwcmVzc2lvblN0YXRlbWVudCBvciBMYWJlbGVkU3RhdGVtZW50LiBXZVxuICAgICAgLy8gc2ltcGx5IHN0YXJ0IHBhcnNpbmcgYW4gZXhwcmVzc2lvbiwgYW5kIGFmdGVyd2FyZHMsIGlmIHRoZVxuICAgICAgLy8gbmV4dCB0b2tlbiBpcyBhIGNvbG9uIGFuZCB0aGUgZXhwcmVzc2lvbiB3YXMgYSBzaW1wbGVcbiAgICAgIC8vIElkZW50aWZpZXIgbm9kZSwgd2Ugc3dpdGNoIHRvIGludGVycHJldGluZyBpdCBhcyBhIGxhYmVsLlxuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAodGhpcy5pc0FzeW5jRnVuY3Rpb24oKSkge1xuICAgICAgICBpZiAoY29udGV4dCkgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VGdW5jdGlvblN0YXRlbWVudChub2RlLCB0cnVlLCAhY29udGV4dClcbiAgICAgIH1cblxuICAgICAgdmFyIG1heWJlTmFtZSA9IHRoaXMudmFsdWUsIGV4cHIgPSB0aGlzLnBhcnNlRXhwcmVzc2lvbigpO1xuICAgICAgaWYgKHN0YXJ0dHlwZSA9PT0gdHlwZXMkMS5uYW1lICYmIGV4cHIudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgJiYgdGhpcy5lYXQodHlwZXMkMS5jb2xvbikpXG4gICAgICAgIHsgcmV0dXJuIHRoaXMucGFyc2VMYWJlbGVkU3RhdGVtZW50KG5vZGUsIG1heWJlTmFtZSwgZXhwciwgY29udGV4dCkgfVxuICAgICAgZWxzZSB7IHJldHVybiB0aGlzLnBhcnNlRXhwcmVzc2lvblN0YXRlbWVudChub2RlLCBleHByKSB9XG4gICAgfVxuICB9O1xuXG4gIHBwJDgucGFyc2VCcmVha0NvbnRpbnVlU3RhdGVtZW50ID0gZnVuY3Rpb24obm9kZSwga2V5d29yZCkge1xuICAgIHZhciBpc0JyZWFrID0ga2V5d29yZCA9PT0gXCJicmVha1wiO1xuICAgIHRoaXMubmV4dCgpO1xuICAgIGlmICh0aGlzLmVhdCh0eXBlcyQxLnNlbWkpIHx8IHRoaXMuaW5zZXJ0U2VtaWNvbG9uKCkpIHsgbm9kZS5sYWJlbCA9IG51bGw7IH1cbiAgICBlbHNlIGlmICh0aGlzLnR5cGUgIT09IHR5cGVzJDEubmFtZSkgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgIGVsc2Uge1xuICAgICAgbm9kZS5sYWJlbCA9IHRoaXMucGFyc2VJZGVudCgpO1xuICAgICAgdGhpcy5zZW1pY29sb24oKTtcbiAgICB9XG5cbiAgICAvLyBWZXJpZnkgdGhhdCB0aGVyZSBpcyBhbiBhY3R1YWwgZGVzdGluYXRpb24gdG8gYnJlYWsgb3JcbiAgICAvLyBjb250aW51ZSB0by5cbiAgICB2YXIgaSA9IDA7XG4gICAgZm9yICg7IGkgPCB0aGlzLmxhYmVscy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGxhYiA9IHRoaXMubGFiZWxzW2ldO1xuICAgICAgaWYgKG5vZGUubGFiZWwgPT0gbnVsbCB8fCBsYWIubmFtZSA9PT0gbm9kZS5sYWJlbC5uYW1lKSB7XG4gICAgICAgIGlmIChsYWIua2luZCAhPSBudWxsICYmIChpc0JyZWFrIHx8IGxhYi5raW5kID09PSBcImxvb3BcIikpIHsgYnJlYWsgfVxuICAgICAgICBpZiAobm9kZS5sYWJlbCAmJiBpc0JyZWFrKSB7IGJyZWFrIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGkgPT09IHRoaXMubGFiZWxzLmxlbmd0aCkgeyB0aGlzLnJhaXNlKG5vZGUuc3RhcnQsIFwiVW5zeW50YWN0aWMgXCIgKyBrZXl3b3JkKTsgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgaXNCcmVhayA/IFwiQnJlYWtTdGF0ZW1lbnRcIiA6IFwiQ29udGludWVTdGF0ZW1lbnRcIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlRGVidWdnZXJTdGF0ZW1lbnQgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgdGhpcy5zZW1pY29sb24oKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiRGVidWdnZXJTdGF0ZW1lbnRcIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlRG9TdGF0ZW1lbnQgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgdGhpcy5sYWJlbHMucHVzaChsb29wTGFiZWwpO1xuICAgIG5vZGUuYm9keSA9IHRoaXMucGFyc2VTdGF0ZW1lbnQoXCJkb1wiKTtcbiAgICB0aGlzLmxhYmVscy5wb3AoKTtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLl93aGlsZSk7XG4gICAgbm9kZS50ZXN0ID0gdGhpcy5wYXJzZVBhcmVuRXhwcmVzc2lvbigpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNilcbiAgICAgIHsgdGhpcy5lYXQodHlwZXMkMS5zZW1pKTsgfVxuICAgIGVsc2VcbiAgICAgIHsgdGhpcy5zZW1pY29sb24oKTsgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJEb1doaWxlU3RhdGVtZW50XCIpXG4gIH07XG5cbiAgLy8gRGlzYW1iaWd1YXRpbmcgYmV0d2VlbiBhIGBmb3JgIGFuZCBhIGBmb3JgL2BpbmAgb3IgYGZvcmAvYG9mYFxuICAvLyBsb29wIGlzIG5vbi10cml2aWFsLiBCYXNpY2FsbHksIHdlIGhhdmUgdG8gcGFyc2UgdGhlIGluaXQgYHZhcmBcbiAgLy8gc3RhdGVtZW50IG9yIGV4cHJlc3Npb24sIGRpc2FsbG93aW5nIHRoZSBgaW5gIG9wZXJhdG9yIChzZWVcbiAgLy8gdGhlIHNlY29uZCBwYXJhbWV0ZXIgdG8gYHBhcnNlRXhwcmVzc2lvbmApLCBhbmQgdGhlbiBjaGVja1xuICAvLyB3aGV0aGVyIHRoZSBuZXh0IHRva2VuIGlzIGBpbmAgb3IgYG9mYC4gV2hlbiB0aGVyZSBpcyBubyBpbml0XG4gIC8vIHBhcnQgKHNlbWljb2xvbiBpbW1lZGlhdGVseSBhZnRlciB0aGUgb3BlbmluZyBwYXJlbnRoZXNpcyksIGl0XG4gIC8vIGlzIGEgcmVndWxhciBgZm9yYCBsb29wLlxuXG4gIHBwJDgucGFyc2VGb3JTdGF0ZW1lbnQgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgdmFyIGF3YWl0QXQgPSAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDkgJiYgdGhpcy5jYW5Bd2FpdCAmJiB0aGlzLmVhdENvbnRleHR1YWwoXCJhd2FpdFwiKSkgPyB0aGlzLmxhc3RUb2tTdGFydCA6IC0xO1xuICAgIHRoaXMubGFiZWxzLnB1c2gobG9vcExhYmVsKTtcbiAgICB0aGlzLmVudGVyU2NvcGUoMCk7XG4gICAgdGhpcy5leHBlY3QodHlwZXMkMS5wYXJlbkwpO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuc2VtaSkge1xuICAgICAgaWYgKGF3YWl0QXQgPiAtMSkgeyB0aGlzLnVuZXhwZWN0ZWQoYXdhaXRBdCk7IH1cbiAgICAgIHJldHVybiB0aGlzLnBhcnNlRm9yKG5vZGUsIG51bGwpXG4gICAgfVxuICAgIHZhciBpc0xldCA9IHRoaXMuaXNMZXQoKTtcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLl92YXIgfHwgdGhpcy50eXBlID09PSB0eXBlcyQxLl9jb25zdCB8fCBpc0xldCkge1xuICAgICAgdmFyIGluaXQkMSA9IHRoaXMuc3RhcnROb2RlKCksIGtpbmQgPSBpc0xldCA/IFwibGV0XCIgOiB0aGlzLnZhbHVlO1xuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICB0aGlzLnBhcnNlVmFyKGluaXQkMSwgdHJ1ZSwga2luZCk7XG4gICAgICB0aGlzLmZpbmlzaE5vZGUoaW5pdCQxLCBcIlZhcmlhYmxlRGVjbGFyYXRpb25cIik7XG4gICAgICBpZiAoKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5faW4gfHwgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2ICYmIHRoaXMuaXNDb250ZXh0dWFsKFwib2ZcIikpKSAmJiBpbml0JDEuZGVjbGFyYXRpb25zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDkpIHtcbiAgICAgICAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLl9pbikge1xuICAgICAgICAgICAgaWYgKGF3YWl0QXQgPiAtMSkgeyB0aGlzLnVuZXhwZWN0ZWQoYXdhaXRBdCk7IH1cbiAgICAgICAgICB9IGVsc2UgeyBub2RlLmF3YWl0ID0gYXdhaXRBdCA+IC0xOyB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VGb3JJbihub2RlLCBpbml0JDEpXG4gICAgICB9XG4gICAgICBpZiAoYXdhaXRBdCA+IC0xKSB7IHRoaXMudW5leHBlY3RlZChhd2FpdEF0KTsgfVxuICAgICAgcmV0dXJuIHRoaXMucGFyc2VGb3Iobm9kZSwgaW5pdCQxKVxuICAgIH1cbiAgICB2YXIgc3RhcnRzV2l0aExldCA9IHRoaXMuaXNDb250ZXh0dWFsKFwibGV0XCIpLCBpc0Zvck9mID0gZmFsc2U7XG4gICAgdmFyIGNvbnRhaW5zRXNjID0gdGhpcy5jb250YWluc0VzYztcbiAgICB2YXIgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyA9IG5ldyBEZXN0cnVjdHVyaW5nRXJyb3JzO1xuICAgIHZhciBpbml0UG9zID0gdGhpcy5zdGFydDtcbiAgICB2YXIgaW5pdCA9IGF3YWl0QXQgPiAtMVxuICAgICAgPyB0aGlzLnBhcnNlRXhwclN1YnNjcmlwdHMocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycywgXCJhd2FpdFwiKVxuICAgICAgOiB0aGlzLnBhcnNlRXhwcmVzc2lvbih0cnVlLCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKTtcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLl9pbiB8fCAoaXNGb3JPZiA9IHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2ICYmIHRoaXMuaXNDb250ZXh0dWFsKFwib2ZcIikpKSB7XG4gICAgICBpZiAoYXdhaXRBdCA+IC0xKSB7IC8vIGltcGxpZXMgYGVjbWFWZXJzaW9uID49IDlgIChzZWUgZGVjbGFyYXRpb24gb2YgYXdhaXRBdClcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5faW4pIHsgdGhpcy51bmV4cGVjdGVkKGF3YWl0QXQpOyB9XG4gICAgICAgIG5vZGUuYXdhaXQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChpc0Zvck9mICYmIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA4KSB7XG4gICAgICAgIGlmIChpbml0LnN0YXJ0ID09PSBpbml0UG9zICYmICFjb250YWluc0VzYyAmJiBpbml0LnR5cGUgPT09IFwiSWRlbnRpZmllclwiICYmIGluaXQubmFtZSA9PT0gXCJhc3luY1wiKSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA5KSB7IG5vZGUuYXdhaXQgPSBmYWxzZTsgfVxuICAgICAgfVxuICAgICAgaWYgKHN0YXJ0c1dpdGhMZXQgJiYgaXNGb3JPZikgeyB0aGlzLnJhaXNlKGluaXQuc3RhcnQsIFwiVGhlIGxlZnQtaGFuZCBzaWRlIG9mIGEgZm9yLW9mIGxvb3AgbWF5IG5vdCBzdGFydCB3aXRoICdsZXQnLlwiKTsgfVxuICAgICAgdGhpcy50b0Fzc2lnbmFibGUoaW5pdCwgZmFsc2UsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpO1xuICAgICAgdGhpcy5jaGVja0xWYWxQYXR0ZXJuKGluaXQpO1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VGb3JJbihub2RlLCBpbml0KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNoZWNrRXhwcmVzc2lvbkVycm9ycyhyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCB0cnVlKTtcbiAgICB9XG4gICAgaWYgKGF3YWl0QXQgPiAtMSkgeyB0aGlzLnVuZXhwZWN0ZWQoYXdhaXRBdCk7IH1cbiAgICByZXR1cm4gdGhpcy5wYXJzZUZvcihub2RlLCBpbml0KVxuICB9O1xuXG4gIHBwJDgucGFyc2VGdW5jdGlvblN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUsIGlzQXN5bmMsIGRlY2xhcmF0aW9uUG9zaXRpb24pIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICByZXR1cm4gdGhpcy5wYXJzZUZ1bmN0aW9uKG5vZGUsIEZVTkNfU1RBVEVNRU5UIHwgKGRlY2xhcmF0aW9uUG9zaXRpb24gPyAwIDogRlVOQ19IQU5HSU5HX1NUQVRFTUVOVCksIGZhbHNlLCBpc0FzeW5jKVxuICB9O1xuXG4gIHBwJDgucGFyc2VJZlN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICBub2RlLnRlc3QgPSB0aGlzLnBhcnNlUGFyZW5FeHByZXNzaW9uKCk7XG4gICAgLy8gYWxsb3cgZnVuY3Rpb24gZGVjbGFyYXRpb25zIGluIGJyYW5jaGVzLCBidXQgb25seSBpbiBub24tc3RyaWN0IG1vZGVcbiAgICBub2RlLmNvbnNlcXVlbnQgPSB0aGlzLnBhcnNlU3RhdGVtZW50KFwiaWZcIik7XG4gICAgbm9kZS5hbHRlcm5hdGUgPSB0aGlzLmVhdCh0eXBlcyQxLl9lbHNlKSA/IHRoaXMucGFyc2VTdGF0ZW1lbnQoXCJpZlwiKSA6IG51bGw7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIklmU3RhdGVtZW50XCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZVJldHVyblN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBpZiAoIXRoaXMuaW5GdW5jdGlvbiAmJiAhdGhpcy5vcHRpb25zLmFsbG93UmV0dXJuT3V0c2lkZUZ1bmN0aW9uKVxuICAgICAgeyB0aGlzLnJhaXNlKHRoaXMuc3RhcnQsIFwiJ3JldHVybicgb3V0c2lkZSBvZiBmdW5jdGlvblwiKTsgfVxuICAgIHRoaXMubmV4dCgpO1xuXG4gICAgLy8gSW4gYHJldHVybmAgKGFuZCBgYnJlYWtgL2Bjb250aW51ZWApLCB0aGUga2V5d29yZHMgd2l0aFxuICAgIC8vIG9wdGlvbmFsIGFyZ3VtZW50cywgd2UgZWFnZXJseSBsb29rIGZvciBhIHNlbWljb2xvbiBvciB0aGVcbiAgICAvLyBwb3NzaWJpbGl0eSB0byBpbnNlcnQgb25lLlxuXG4gICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuc2VtaSkgfHwgdGhpcy5pbnNlcnRTZW1pY29sb24oKSkgeyBub2RlLmFyZ3VtZW50ID0gbnVsbDsgfVxuICAgIGVsc2UgeyBub2RlLmFyZ3VtZW50ID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oKTsgdGhpcy5zZW1pY29sb24oKTsgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJSZXR1cm5TdGF0ZW1lbnRcIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlU3dpdGNoU3RhdGVtZW50ID0gZnVuY3Rpb24obm9kZSkge1xuICAgIHRoaXMubmV4dCgpO1xuICAgIG5vZGUuZGlzY3JpbWluYW50ID0gdGhpcy5wYXJzZVBhcmVuRXhwcmVzc2lvbigpO1xuICAgIG5vZGUuY2FzZXMgPSBbXTtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLmJyYWNlTCk7XG4gICAgdGhpcy5sYWJlbHMucHVzaChzd2l0Y2hMYWJlbCk7XG4gICAgdGhpcy5lbnRlclNjb3BlKDApO1xuXG4gICAgLy8gU3RhdGVtZW50cyB1bmRlciBtdXN0IGJlIGdyb3VwZWQgKGJ5IGxhYmVsKSBpbiBTd2l0Y2hDYXNlXG4gICAgLy8gbm9kZXMuIGBjdXJgIGlzIHVzZWQgdG8ga2VlcCB0aGUgbm9kZSB0aGF0IHdlIGFyZSBjdXJyZW50bHlcbiAgICAvLyBhZGRpbmcgc3RhdGVtZW50cyB0by5cblxuICAgIHZhciBjdXI7XG4gICAgZm9yICh2YXIgc2F3RGVmYXVsdCA9IGZhbHNlOyB0aGlzLnR5cGUgIT09IHR5cGVzJDEuYnJhY2VSOykge1xuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5fY2FzZSB8fCB0aGlzLnR5cGUgPT09IHR5cGVzJDEuX2RlZmF1bHQpIHtcbiAgICAgICAgdmFyIGlzQ2FzZSA9IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5fY2FzZTtcbiAgICAgICAgaWYgKGN1cikgeyB0aGlzLmZpbmlzaE5vZGUoY3VyLCBcIlN3aXRjaENhc2VcIik7IH1cbiAgICAgICAgbm9kZS5jYXNlcy5wdXNoKGN1ciA9IHRoaXMuc3RhcnROb2RlKCkpO1xuICAgICAgICBjdXIuY29uc2VxdWVudCA9IFtdO1xuICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgaWYgKGlzQ2FzZSkge1xuICAgICAgICAgIGN1ci50ZXN0ID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc2F3RGVmYXVsdCkgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodGhpcy5sYXN0VG9rU3RhcnQsIFwiTXVsdGlwbGUgZGVmYXVsdCBjbGF1c2VzXCIpOyB9XG4gICAgICAgICAgc2F3RGVmYXVsdCA9IHRydWU7XG4gICAgICAgICAgY3VyLnRlc3QgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEuY29sb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFjdXIpIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgICAgICAgY3VyLmNvbnNlcXVlbnQucHVzaCh0aGlzLnBhcnNlU3RhdGVtZW50KG51bGwpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5leGl0U2NvcGUoKTtcbiAgICBpZiAoY3VyKSB7IHRoaXMuZmluaXNoTm9kZShjdXIsIFwiU3dpdGNoQ2FzZVwiKTsgfVxuICAgIHRoaXMubmV4dCgpOyAvLyBDbG9zaW5nIGJyYWNlXG4gICAgdGhpcy5sYWJlbHMucG9wKCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIlN3aXRjaFN0YXRlbWVudFwiKVxuICB9O1xuXG4gIHBwJDgucGFyc2VUaHJvd1N0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICBpZiAobGluZUJyZWFrLnRlc3QodGhpcy5pbnB1dC5zbGljZSh0aGlzLmxhc3RUb2tFbmQsIHRoaXMuc3RhcnQpKSlcbiAgICAgIHsgdGhpcy5yYWlzZSh0aGlzLmxhc3RUb2tFbmQsIFwiSWxsZWdhbCBuZXdsaW5lIGFmdGVyIHRocm93XCIpOyB9XG4gICAgbm9kZS5hcmd1bWVudCA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgdGhpcy5zZW1pY29sb24oKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiVGhyb3dTdGF0ZW1lbnRcIilcbiAgfTtcblxuICAvLyBSZXVzZWQgZW1wdHkgYXJyYXkgYWRkZWQgZm9yIG5vZGUgZmllbGRzIHRoYXQgYXJlIGFsd2F5cyBlbXB0eS5cblxuICB2YXIgZW1wdHkkMSA9IFtdO1xuXG4gIHBwJDgucGFyc2VDYXRjaENsYXVzZVBhcmFtID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBhcmFtID0gdGhpcy5wYXJzZUJpbmRpbmdBdG9tKCk7XG4gICAgdmFyIHNpbXBsZSA9IHBhcmFtLnR5cGUgPT09IFwiSWRlbnRpZmllclwiO1xuICAgIHRoaXMuZW50ZXJTY29wZShzaW1wbGUgPyBTQ09QRV9TSU1QTEVfQ0FUQ0ggOiAwKTtcbiAgICB0aGlzLmNoZWNrTFZhbFBhdHRlcm4ocGFyYW0sIHNpbXBsZSA/IEJJTkRfU0lNUExFX0NBVENIIDogQklORF9MRVhJQ0FMKTtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLnBhcmVuUik7XG5cbiAgICByZXR1cm4gcGFyYW1cbiAgfTtcblxuICBwcCQ4LnBhcnNlVHJ5U3RhdGVtZW50ID0gZnVuY3Rpb24obm9kZSkge1xuICAgIHRoaXMubmV4dCgpO1xuICAgIG5vZGUuYmxvY2sgPSB0aGlzLnBhcnNlQmxvY2soKTtcbiAgICBub2RlLmhhbmRsZXIgPSBudWxsO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuX2NhdGNoKSB7XG4gICAgICB2YXIgY2xhdXNlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEucGFyZW5MKSkge1xuICAgICAgICBjbGF1c2UucGFyYW0gPSB0aGlzLnBhcnNlQ2F0Y2hDbGF1c2VQYXJhbSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA8IDEwKSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gICAgICAgIGNsYXVzZS5wYXJhbSA9IG51bGw7XG4gICAgICAgIHRoaXMuZW50ZXJTY29wZSgwKTtcbiAgICAgIH1cbiAgICAgIGNsYXVzZS5ib2R5ID0gdGhpcy5wYXJzZUJsb2NrKGZhbHNlKTtcbiAgICAgIHRoaXMuZXhpdFNjb3BlKCk7XG4gICAgICBub2RlLmhhbmRsZXIgPSB0aGlzLmZpbmlzaE5vZGUoY2xhdXNlLCBcIkNhdGNoQ2xhdXNlXCIpO1xuICAgIH1cbiAgICBub2RlLmZpbmFsaXplciA9IHRoaXMuZWF0KHR5cGVzJDEuX2ZpbmFsbHkpID8gdGhpcy5wYXJzZUJsb2NrKCkgOiBudWxsO1xuICAgIGlmICghbm9kZS5oYW5kbGVyICYmICFub2RlLmZpbmFsaXplcilcbiAgICAgIHsgdGhpcy5yYWlzZShub2RlLnN0YXJ0LCBcIk1pc3NpbmcgY2F0Y2ggb3IgZmluYWxseSBjbGF1c2VcIik7IH1cbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiVHJ5U3RhdGVtZW50XCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZVZhclN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUsIGtpbmQsIGFsbG93TWlzc2luZ0luaXRpYWxpemVyKSB7XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgdGhpcy5wYXJzZVZhcihub2RlLCBmYWxzZSwga2luZCwgYWxsb3dNaXNzaW5nSW5pdGlhbGl6ZXIpO1xuICAgIHRoaXMuc2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIlZhcmlhYmxlRGVjbGFyYXRpb25cIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlV2hpbGVTdGF0ZW1lbnQgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgbm9kZS50ZXN0ID0gdGhpcy5wYXJzZVBhcmVuRXhwcmVzc2lvbigpO1xuICAgIHRoaXMubGFiZWxzLnB1c2gobG9vcExhYmVsKTtcbiAgICBub2RlLmJvZHkgPSB0aGlzLnBhcnNlU3RhdGVtZW50KFwid2hpbGVcIik7XG4gICAgdGhpcy5sYWJlbHMucG9wKCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIldoaWxlU3RhdGVtZW50XCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZVdpdGhTdGF0ZW1lbnQgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgaWYgKHRoaXMuc3RyaWN0KSB7IHRoaXMucmFpc2UodGhpcy5zdGFydCwgXCInd2l0aCcgaW4gc3RyaWN0IG1vZGVcIik7IH1cbiAgICB0aGlzLm5leHQoKTtcbiAgICBub2RlLm9iamVjdCA9IHRoaXMucGFyc2VQYXJlbkV4cHJlc3Npb24oKTtcbiAgICBub2RlLmJvZHkgPSB0aGlzLnBhcnNlU3RhdGVtZW50KFwid2l0aFwiKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiV2l0aFN0YXRlbWVudFwiKVxuICB9O1xuXG4gIHBwJDgucGFyc2VFbXB0eVN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiRW1wdHlTdGF0ZW1lbnRcIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlTGFiZWxlZFN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUsIG1heWJlTmFtZSwgZXhwciwgY29udGV4dCkge1xuICAgIGZvciAodmFyIGkkMSA9IDAsIGxpc3QgPSB0aGlzLmxhYmVsczsgaSQxIDwgbGlzdC5sZW5ndGg7IGkkMSArPSAxKVxuICAgICAge1xuICAgICAgdmFyIGxhYmVsID0gbGlzdFtpJDFdO1xuXG4gICAgICBpZiAobGFiZWwubmFtZSA9PT0gbWF5YmVOYW1lKVxuICAgICAgICB7IHRoaXMucmFpc2UoZXhwci5zdGFydCwgXCJMYWJlbCAnXCIgKyBtYXliZU5hbWUgKyBcIicgaXMgYWxyZWFkeSBkZWNsYXJlZFwiKTtcbiAgICB9IH1cbiAgICB2YXIga2luZCA9IHRoaXMudHlwZS5pc0xvb3AgPyBcImxvb3BcIiA6IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5fc3dpdGNoID8gXCJzd2l0Y2hcIiA6IG51bGw7XG4gICAgZm9yICh2YXIgaSA9IHRoaXMubGFiZWxzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgbGFiZWwkMSA9IHRoaXMubGFiZWxzW2ldO1xuICAgICAgaWYgKGxhYmVsJDEuc3RhdGVtZW50U3RhcnQgPT09IG5vZGUuc3RhcnQpIHtcbiAgICAgICAgLy8gVXBkYXRlIGluZm9ybWF0aW9uIGFib3V0IHByZXZpb3VzIGxhYmVscyBvbiB0aGlzIG5vZGVcbiAgICAgICAgbGFiZWwkMS5zdGF0ZW1lbnRTdGFydCA9IHRoaXMuc3RhcnQ7XG4gICAgICAgIGxhYmVsJDEua2luZCA9IGtpbmQ7XG4gICAgICB9IGVsc2UgeyBicmVhayB9XG4gICAgfVxuICAgIHRoaXMubGFiZWxzLnB1c2goe25hbWU6IG1heWJlTmFtZSwga2luZDoga2luZCwgc3RhdGVtZW50U3RhcnQ6IHRoaXMuc3RhcnR9KTtcbiAgICBub2RlLmJvZHkgPSB0aGlzLnBhcnNlU3RhdGVtZW50KGNvbnRleHQgPyBjb250ZXh0LmluZGV4T2YoXCJsYWJlbFwiKSA9PT0gLTEgPyBjb250ZXh0ICsgXCJsYWJlbFwiIDogY29udGV4dCA6IFwibGFiZWxcIik7XG4gICAgdGhpcy5sYWJlbHMucG9wKCk7XG4gICAgbm9kZS5sYWJlbCA9IGV4cHI7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkxhYmVsZWRTdGF0ZW1lbnRcIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlRXhwcmVzc2lvblN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUsIGV4cHIpIHtcbiAgICBub2RlLmV4cHJlc3Npb24gPSBleHByO1xuICAgIHRoaXMuc2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIilcbiAgfTtcblxuICAvLyBQYXJzZSBhIHNlbWljb2xvbi1lbmNsb3NlZCBibG9jayBvZiBzdGF0ZW1lbnRzLCBoYW5kbGluZyBgXCJ1c2VcbiAgLy8gc3RyaWN0XCJgIGRlY2xhcmF0aW9ucyB3aGVuIGBhbGxvd1N0cmljdGAgaXMgdHJ1ZSAodXNlZCBmb3JcbiAgLy8gZnVuY3Rpb24gYm9kaWVzKS5cblxuICBwcCQ4LnBhcnNlQmxvY2sgPSBmdW5jdGlvbihjcmVhdGVOZXdMZXhpY2FsU2NvcGUsIG5vZGUsIGV4aXRTdHJpY3QpIHtcbiAgICBpZiAoIGNyZWF0ZU5ld0xleGljYWxTY29wZSA9PT0gdm9pZCAwICkgY3JlYXRlTmV3TGV4aWNhbFNjb3BlID0gdHJ1ZTtcbiAgICBpZiAoIG5vZGUgPT09IHZvaWQgMCApIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuXG4gICAgbm9kZS5ib2R5ID0gW107XG4gICAgdGhpcy5leHBlY3QodHlwZXMkMS5icmFjZUwpO1xuICAgIGlmIChjcmVhdGVOZXdMZXhpY2FsU2NvcGUpIHsgdGhpcy5lbnRlclNjb3BlKDApOyB9XG4gICAgd2hpbGUgKHRoaXMudHlwZSAhPT0gdHlwZXMkMS5icmFjZVIpIHtcbiAgICAgIHZhciBzdG10ID0gdGhpcy5wYXJzZVN0YXRlbWVudChudWxsKTtcbiAgICAgIG5vZGUuYm9keS5wdXNoKHN0bXQpO1xuICAgIH1cbiAgICBpZiAoZXhpdFN0cmljdCkgeyB0aGlzLnN0cmljdCA9IGZhbHNlOyB9XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgaWYgKGNyZWF0ZU5ld0xleGljYWxTY29wZSkgeyB0aGlzLmV4aXRTY29wZSgpOyB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkJsb2NrU3RhdGVtZW50XCIpXG4gIH07XG5cbiAgLy8gUGFyc2UgYSByZWd1bGFyIGBmb3JgIGxvb3AuIFRoZSBkaXNhbWJpZ3VhdGlvbiBjb2RlIGluXG4gIC8vIGBwYXJzZVN0YXRlbWVudGAgd2lsbCBhbHJlYWR5IGhhdmUgcGFyc2VkIHRoZSBpbml0IHN0YXRlbWVudCBvclxuICAvLyBleHByZXNzaW9uLlxuXG4gIHBwJDgucGFyc2VGb3IgPSBmdW5jdGlvbihub2RlLCBpbml0KSB7XG4gICAgbm9kZS5pbml0ID0gaW5pdDtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLnNlbWkpO1xuICAgIG5vZGUudGVzdCA9IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5zZW1pID8gbnVsbCA6IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgdGhpcy5leHBlY3QodHlwZXMkMS5zZW1pKTtcbiAgICBub2RlLnVwZGF0ZSA9IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5wYXJlblIgPyBudWxsIDogdGhpcy5wYXJzZUV4cHJlc3Npb24oKTtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLnBhcmVuUik7XG4gICAgbm9kZS5ib2R5ID0gdGhpcy5wYXJzZVN0YXRlbWVudChcImZvclwiKTtcbiAgICB0aGlzLmV4aXRTY29wZSgpO1xuICAgIHRoaXMubGFiZWxzLnBvcCgpO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJGb3JTdGF0ZW1lbnRcIilcbiAgfTtcblxuICAvLyBQYXJzZSBhIGBmb3JgL2BpbmAgYW5kIGBmb3JgL2BvZmAgbG9vcCwgd2hpY2ggYXJlIGFsbW9zdFxuICAvLyBzYW1lIGZyb20gcGFyc2VyJ3MgcGVyc3BlY3RpdmUuXG5cbiAgcHAkOC5wYXJzZUZvckluID0gZnVuY3Rpb24obm9kZSwgaW5pdCkge1xuICAgIHZhciBpc0ZvckluID0gdGhpcy50eXBlID09PSB0eXBlcyQxLl9pbjtcbiAgICB0aGlzLm5leHQoKTtcblxuICAgIGlmIChcbiAgICAgIGluaXQudHlwZSA9PT0gXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIgJiZcbiAgICAgIGluaXQuZGVjbGFyYXRpb25zWzBdLmluaXQgIT0gbnVsbCAmJlxuICAgICAgKFxuICAgICAgICAhaXNGb3JJbiB8fFxuICAgICAgICB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPCA4IHx8XG4gICAgICAgIHRoaXMuc3RyaWN0IHx8XG4gICAgICAgIGluaXQua2luZCAhPT0gXCJ2YXJcIiB8fFxuICAgICAgICBpbml0LmRlY2xhcmF0aW9uc1swXS5pZC50eXBlICE9PSBcIklkZW50aWZpZXJcIlxuICAgICAgKVxuICAgICkge1xuICAgICAgdGhpcy5yYWlzZShcbiAgICAgICAgaW5pdC5zdGFydCxcbiAgICAgICAgKChpc0ZvckluID8gXCJmb3ItaW5cIiA6IFwiZm9yLW9mXCIpICsgXCIgbG9vcCB2YXJpYWJsZSBkZWNsYXJhdGlvbiBtYXkgbm90IGhhdmUgYW4gaW5pdGlhbGl6ZXJcIilcbiAgICAgICk7XG4gICAgfVxuICAgIG5vZGUubGVmdCA9IGluaXQ7XG4gICAgbm9kZS5yaWdodCA9IGlzRm9ySW4gPyB0aGlzLnBhcnNlRXhwcmVzc2lvbigpIDogdGhpcy5wYXJzZU1heWJlQXNzaWduKCk7XG4gICAgdGhpcy5leHBlY3QodHlwZXMkMS5wYXJlblIpO1xuICAgIG5vZGUuYm9keSA9IHRoaXMucGFyc2VTdGF0ZW1lbnQoXCJmb3JcIik7XG4gICAgdGhpcy5leGl0U2NvcGUoKTtcbiAgICB0aGlzLmxhYmVscy5wb3AoKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIGlzRm9ySW4gPyBcIkZvckluU3RhdGVtZW50XCIgOiBcIkZvck9mU3RhdGVtZW50XCIpXG4gIH07XG5cbiAgLy8gUGFyc2UgYSBsaXN0IG9mIHZhcmlhYmxlIGRlY2xhcmF0aW9ucy5cblxuICBwcCQ4LnBhcnNlVmFyID0gZnVuY3Rpb24obm9kZSwgaXNGb3IsIGtpbmQsIGFsbG93TWlzc2luZ0luaXRpYWxpemVyKSB7XG4gICAgbm9kZS5kZWNsYXJhdGlvbnMgPSBbXTtcbiAgICBub2RlLmtpbmQgPSBraW5kO1xuICAgIGZvciAoOzspIHtcbiAgICAgIHZhciBkZWNsID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICAgIHRoaXMucGFyc2VWYXJJZChkZWNsLCBraW5kKTtcbiAgICAgIGlmICh0aGlzLmVhdCh0eXBlcyQxLmVxKSkge1xuICAgICAgICBkZWNsLmluaXQgPSB0aGlzLnBhcnNlTWF5YmVBc3NpZ24oaXNGb3IpO1xuICAgICAgfSBlbHNlIGlmICghYWxsb3dNaXNzaW5nSW5pdGlhbGl6ZXIgJiYga2luZCA9PT0gXCJjb25zdFwiICYmICEodGhpcy50eXBlID09PSB0eXBlcyQxLl9pbiB8fCAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYgJiYgdGhpcy5pc0NvbnRleHR1YWwoXCJvZlwiKSkpKSB7XG4gICAgICAgIHRoaXMudW5leHBlY3RlZCgpO1xuICAgICAgfSBlbHNlIGlmICghYWxsb3dNaXNzaW5nSW5pdGlhbGl6ZXIgJiYgZGVjbC5pZC50eXBlICE9PSBcIklkZW50aWZpZXJcIiAmJiAhKGlzRm9yICYmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuX2luIHx8IHRoaXMuaXNDb250ZXh0dWFsKFwib2ZcIikpKSkge1xuICAgICAgICB0aGlzLnJhaXNlKHRoaXMubGFzdFRva0VuZCwgXCJDb21wbGV4IGJpbmRpbmcgcGF0dGVybnMgcmVxdWlyZSBhbiBpbml0aWFsaXphdGlvbiB2YWx1ZVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlY2wuaW5pdCA9IG51bGw7XG4gICAgICB9XG4gICAgICBub2RlLmRlY2xhcmF0aW9ucy5wdXNoKHRoaXMuZmluaXNoTm9kZShkZWNsLCBcIlZhcmlhYmxlRGVjbGFyYXRvclwiKSk7XG4gICAgICBpZiAoIXRoaXMuZWF0KHR5cGVzJDEuY29tbWEpKSB7IGJyZWFrIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGVcbiAgfTtcblxuICBwcCQ4LnBhcnNlVmFySWQgPSBmdW5jdGlvbihkZWNsLCBraW5kKSB7XG4gICAgZGVjbC5pZCA9IHRoaXMucGFyc2VCaW5kaW5nQXRvbSgpO1xuICAgIHRoaXMuY2hlY2tMVmFsUGF0dGVybihkZWNsLmlkLCBraW5kID09PSBcInZhclwiID8gQklORF9WQVIgOiBCSU5EX0xFWElDQUwsIGZhbHNlKTtcbiAgfTtcblxuICB2YXIgRlVOQ19TVEFURU1FTlQgPSAxLCBGVU5DX0hBTkdJTkdfU1RBVEVNRU5UID0gMiwgRlVOQ19OVUxMQUJMRV9JRCA9IDQ7XG5cbiAgLy8gUGFyc2UgYSBmdW5jdGlvbiBkZWNsYXJhdGlvbiBvciBsaXRlcmFsIChkZXBlbmRpbmcgb24gdGhlXG4gIC8vIGBzdGF0ZW1lbnQgJiBGVU5DX1NUQVRFTUVOVGApLlxuXG4gIC8vIFJlbW92ZSBgYWxsb3dFeHByZXNzaW9uQm9keWAgZm9yIDcuMC4wLCBhcyBpdCBpcyBvbmx5IGNhbGxlZCB3aXRoIGZhbHNlXG4gIHBwJDgucGFyc2VGdW5jdGlvbiA9IGZ1bmN0aW9uKG5vZGUsIHN0YXRlbWVudCwgYWxsb3dFeHByZXNzaW9uQm9keSwgaXNBc3luYywgZm9ySW5pdCkge1xuICAgIHRoaXMuaW5pdEZ1bmN0aW9uKG5vZGUpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOSB8fCB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNiAmJiAhaXNBc3luYykge1xuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5zdGFyICYmIChzdGF0ZW1lbnQgJiBGVU5DX0hBTkdJTkdfU1RBVEVNRU5UKSlcbiAgICAgICAgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgICAgbm9kZS5nZW5lcmF0b3IgPSB0aGlzLmVhdCh0eXBlcyQxLnN0YXIpO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDgpXG4gICAgICB7IG5vZGUuYXN5bmMgPSAhIWlzQXN5bmM7IH1cblxuICAgIGlmIChzdGF0ZW1lbnQgJiBGVU5DX1NUQVRFTUVOVCkge1xuICAgICAgbm9kZS5pZCA9IChzdGF0ZW1lbnQgJiBGVU5DX05VTExBQkxFX0lEKSAmJiB0aGlzLnR5cGUgIT09IHR5cGVzJDEubmFtZSA/IG51bGwgOiB0aGlzLnBhcnNlSWRlbnQoKTtcbiAgICAgIGlmIChub2RlLmlkICYmICEoc3RhdGVtZW50ICYgRlVOQ19IQU5HSU5HX1NUQVRFTUVOVCkpXG4gICAgICAgIC8vIElmIGl0IGlzIGEgcmVndWxhciBmdW5jdGlvbiBkZWNsYXJhdGlvbiBpbiBzbG9wcHkgbW9kZSwgdGhlbiBpdCBpc1xuICAgICAgICAvLyBzdWJqZWN0IHRvIEFubmV4IEIgc2VtYW50aWNzIChCSU5EX0ZVTkNUSU9OKS4gT3RoZXJ3aXNlLCB0aGUgYmluZGluZ1xuICAgICAgICAvLyBtb2RlIGRlcGVuZHMgb24gcHJvcGVydGllcyBvZiB0aGUgY3VycmVudCBzY29wZSAoc2VlXG4gICAgICAgIC8vIHRyZWF0RnVuY3Rpb25zQXNWYXIpLlxuICAgICAgICB7IHRoaXMuY2hlY2tMVmFsU2ltcGxlKG5vZGUuaWQsICh0aGlzLnN0cmljdCB8fCBub2RlLmdlbmVyYXRvciB8fCBub2RlLmFzeW5jKSA/IHRoaXMudHJlYXRGdW5jdGlvbnNBc1ZhciA/IEJJTkRfVkFSIDogQklORF9MRVhJQ0FMIDogQklORF9GVU5DVElPTik7IH1cbiAgICB9XG5cbiAgICB2YXIgb2xkWWllbGRQb3MgPSB0aGlzLnlpZWxkUG9zLCBvbGRBd2FpdFBvcyA9IHRoaXMuYXdhaXRQb3MsIG9sZEF3YWl0SWRlbnRQb3MgPSB0aGlzLmF3YWl0SWRlbnRQb3M7XG4gICAgdGhpcy55aWVsZFBvcyA9IDA7XG4gICAgdGhpcy5hd2FpdFBvcyA9IDA7XG4gICAgdGhpcy5hd2FpdElkZW50UG9zID0gMDtcbiAgICB0aGlzLmVudGVyU2NvcGUoZnVuY3Rpb25GbGFncyhub2RlLmFzeW5jLCBub2RlLmdlbmVyYXRvcikpO1xuXG4gICAgaWYgKCEoc3RhdGVtZW50ICYgRlVOQ19TVEFURU1FTlQpKVxuICAgICAgeyBub2RlLmlkID0gdGhpcy50eXBlID09PSB0eXBlcyQxLm5hbWUgPyB0aGlzLnBhcnNlSWRlbnQoKSA6IG51bGw7IH1cblxuICAgIHRoaXMucGFyc2VGdW5jdGlvblBhcmFtcyhub2RlKTtcbiAgICB0aGlzLnBhcnNlRnVuY3Rpb25Cb2R5KG5vZGUsIGFsbG93RXhwcmVzc2lvbkJvZHksIGZhbHNlLCBmb3JJbml0KTtcblxuICAgIHRoaXMueWllbGRQb3MgPSBvbGRZaWVsZFBvcztcbiAgICB0aGlzLmF3YWl0UG9zID0gb2xkQXdhaXRQb3M7XG4gICAgdGhpcy5hd2FpdElkZW50UG9zID0gb2xkQXdhaXRJZGVudFBvcztcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIChzdGF0ZW1lbnQgJiBGVU5DX1NUQVRFTUVOVCkgPyBcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIiA6IFwiRnVuY3Rpb25FeHByZXNzaW9uXCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZUZ1bmN0aW9uUGFyYW1zID0gZnVuY3Rpb24obm9kZSkge1xuICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEucGFyZW5MKTtcbiAgICBub2RlLnBhcmFtcyA9IHRoaXMucGFyc2VCaW5kaW5nTGlzdCh0eXBlcyQxLnBhcmVuUiwgZmFsc2UsIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA4KTtcbiAgICB0aGlzLmNoZWNrWWllbGRBd2FpdEluRGVmYXVsdFBhcmFtcygpO1xuICB9O1xuXG4gIC8vIFBhcnNlIGEgY2xhc3MgZGVjbGFyYXRpb24gb3IgbGl0ZXJhbCAoZGVwZW5kaW5nIG9uIHRoZVxuICAvLyBgaXNTdGF0ZW1lbnRgIHBhcmFtZXRlcikuXG5cbiAgcHAkOC5wYXJzZUNsYXNzID0gZnVuY3Rpb24obm9kZSwgaXNTdGF0ZW1lbnQpIHtcbiAgICB0aGlzLm5leHQoKTtcblxuICAgIC8vIGVjbWEtMjYyIDE0LjYgQ2xhc3MgRGVmaW5pdGlvbnNcbiAgICAvLyBBIGNsYXNzIGRlZmluaXRpb24gaXMgYWx3YXlzIHN0cmljdCBtb2RlIGNvZGUuXG4gICAgdmFyIG9sZFN0cmljdCA9IHRoaXMuc3RyaWN0O1xuICAgIHRoaXMuc3RyaWN0ID0gdHJ1ZTtcblxuICAgIHRoaXMucGFyc2VDbGFzc0lkKG5vZGUsIGlzU3RhdGVtZW50KTtcbiAgICB0aGlzLnBhcnNlQ2xhc3NTdXBlcihub2RlKTtcbiAgICB2YXIgcHJpdmF0ZU5hbWVNYXAgPSB0aGlzLmVudGVyQ2xhc3NCb2R5KCk7XG4gICAgdmFyIGNsYXNzQm9keSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgdmFyIGhhZENvbnN0cnVjdG9yID0gZmFsc2U7XG4gICAgY2xhc3NCb2R5LmJvZHkgPSBbXTtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLmJyYWNlTCk7XG4gICAgd2hpbGUgKHRoaXMudHlwZSAhPT0gdHlwZXMkMS5icmFjZVIpIHtcbiAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5wYXJzZUNsYXNzRWxlbWVudChub2RlLnN1cGVyQ2xhc3MgIT09IG51bGwpO1xuICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgY2xhc3NCb2R5LmJvZHkucHVzaChlbGVtZW50KTtcbiAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gXCJNZXRob2REZWZpbml0aW9uXCIgJiYgZWxlbWVudC5raW5kID09PSBcImNvbnN0cnVjdG9yXCIpIHtcbiAgICAgICAgICBpZiAoaGFkQ29uc3RydWN0b3IpIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKGVsZW1lbnQuc3RhcnQsIFwiRHVwbGljYXRlIGNvbnN0cnVjdG9yIGluIHRoZSBzYW1lIGNsYXNzXCIpOyB9XG4gICAgICAgICAgaGFkQ29uc3RydWN0b3IgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnQua2V5ICYmIGVsZW1lbnQua2V5LnR5cGUgPT09IFwiUHJpdmF0ZUlkZW50aWZpZXJcIiAmJiBpc1ByaXZhdGVOYW1lQ29uZmxpY3RlZChwcml2YXRlTmFtZU1hcCwgZWxlbWVudCkpIHtcbiAgICAgICAgICB0aGlzLnJhaXNlUmVjb3ZlcmFibGUoZWxlbWVudC5rZXkuc3RhcnQsIChcIklkZW50aWZpZXIgJyNcIiArIChlbGVtZW50LmtleS5uYW1lKSArIFwiJyBoYXMgYWxyZWFkeSBiZWVuIGRlY2xhcmVkXCIpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnN0cmljdCA9IG9sZFN0cmljdDtcbiAgICB0aGlzLm5leHQoKTtcbiAgICBub2RlLmJvZHkgPSB0aGlzLmZpbmlzaE5vZGUoY2xhc3NCb2R5LCBcIkNsYXNzQm9keVwiKTtcbiAgICB0aGlzLmV4aXRDbGFzc0JvZHkoKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIGlzU3RhdGVtZW50ID8gXCJDbGFzc0RlY2xhcmF0aW9uXCIgOiBcIkNsYXNzRXhwcmVzc2lvblwiKVxuICB9O1xuXG4gIHBwJDgucGFyc2VDbGFzc0VsZW1lbnQgPSBmdW5jdGlvbihjb25zdHJ1Y3RvckFsbG93c1N1cGVyKSB7XG4gICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuc2VtaSkpIHsgcmV0dXJuIG51bGwgfVxuXG4gICAgdmFyIGVjbWFWZXJzaW9uID0gdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uO1xuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICB2YXIga2V5TmFtZSA9IFwiXCI7XG4gICAgdmFyIGlzR2VuZXJhdG9yID0gZmFsc2U7XG4gICAgdmFyIGlzQXN5bmMgPSBmYWxzZTtcbiAgICB2YXIga2luZCA9IFwibWV0aG9kXCI7XG4gICAgdmFyIGlzU3RhdGljID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5lYXRDb250ZXh0dWFsKFwic3RhdGljXCIpKSB7XG4gICAgICAvLyBQYXJzZSBzdGF0aWMgaW5pdCBibG9ja1xuICAgICAgaWYgKGVjbWFWZXJzaW9uID49IDEzICYmIHRoaXMuZWF0KHR5cGVzJDEuYnJhY2VMKSkge1xuICAgICAgICB0aGlzLnBhcnNlQ2xhc3NTdGF0aWNCbG9jayhub2RlKTtcbiAgICAgICAgcmV0dXJuIG5vZGVcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmlzQ2xhc3NFbGVtZW50TmFtZVN0YXJ0KCkgfHwgdGhpcy50eXBlID09PSB0eXBlcyQxLnN0YXIpIHtcbiAgICAgICAgaXNTdGF0aWMgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAga2V5TmFtZSA9IFwic3RhdGljXCI7XG4gICAgICB9XG4gICAgfVxuICAgIG5vZGUuc3RhdGljID0gaXNTdGF0aWM7XG4gICAgaWYgKCFrZXlOYW1lICYmIGVjbWFWZXJzaW9uID49IDggJiYgdGhpcy5lYXRDb250ZXh0dWFsKFwiYXN5bmNcIikpIHtcbiAgICAgIGlmICgodGhpcy5pc0NsYXNzRWxlbWVudE5hbWVTdGFydCgpIHx8IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5zdGFyKSAmJiAhdGhpcy5jYW5JbnNlcnRTZW1pY29sb24oKSkge1xuICAgICAgICBpc0FzeW5jID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGtleU5hbWUgPSBcImFzeW5jXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICgha2V5TmFtZSAmJiAoZWNtYVZlcnNpb24gPj0gOSB8fCAhaXNBc3luYykgJiYgdGhpcy5lYXQodHlwZXMkMS5zdGFyKSkge1xuICAgICAgaXNHZW5lcmF0b3IgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoIWtleU5hbWUgJiYgIWlzQXN5bmMgJiYgIWlzR2VuZXJhdG9yKSB7XG4gICAgICB2YXIgbGFzdFZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgIGlmICh0aGlzLmVhdENvbnRleHR1YWwoXCJnZXRcIikgfHwgdGhpcy5lYXRDb250ZXh0dWFsKFwic2V0XCIpKSB7XG4gICAgICAgIGlmICh0aGlzLmlzQ2xhc3NFbGVtZW50TmFtZVN0YXJ0KCkpIHtcbiAgICAgICAgICBraW5kID0gbGFzdFZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGtleU5hbWUgPSBsYXN0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQYXJzZSBlbGVtZW50IG5hbWVcbiAgICBpZiAoa2V5TmFtZSkge1xuICAgICAgLy8gJ2FzeW5jJywgJ2dldCcsICdzZXQnLCBvciAnc3RhdGljJyB3ZXJlIG5vdCBhIGtleXdvcmQgY29udGV4dHVhbGx5LlxuICAgICAgLy8gVGhlIGxhc3QgdG9rZW4gaXMgYW55IG9mIHRob3NlLiBNYWtlIGl0IHRoZSBlbGVtZW50IG5hbWUuXG4gICAgICBub2RlLmNvbXB1dGVkID0gZmFsc2U7XG4gICAgICBub2RlLmtleSA9IHRoaXMuc3RhcnROb2RlQXQodGhpcy5sYXN0VG9rU3RhcnQsIHRoaXMubGFzdFRva1N0YXJ0TG9jKTtcbiAgICAgIG5vZGUua2V5Lm5hbWUgPSBrZXlOYW1lO1xuICAgICAgdGhpcy5maW5pc2hOb2RlKG5vZGUua2V5LCBcIklkZW50aWZpZXJcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGFyc2VDbGFzc0VsZW1lbnROYW1lKG5vZGUpO1xuICAgIH1cblxuICAgIC8vIFBhcnNlIGVsZW1lbnQgdmFsdWVcbiAgICBpZiAoZWNtYVZlcnNpb24gPCAxMyB8fCB0aGlzLnR5cGUgPT09IHR5cGVzJDEucGFyZW5MIHx8IGtpbmQgIT09IFwibWV0aG9kXCIgfHwgaXNHZW5lcmF0b3IgfHwgaXNBc3luYykge1xuICAgICAgdmFyIGlzQ29uc3RydWN0b3IgPSAhbm9kZS5zdGF0aWMgJiYgY2hlY2tLZXlOYW1lKG5vZGUsIFwiY29uc3RydWN0b3JcIik7XG4gICAgICB2YXIgYWxsb3dzRGlyZWN0U3VwZXIgPSBpc0NvbnN0cnVjdG9yICYmIGNvbnN0cnVjdG9yQWxsb3dzU3VwZXI7XG4gICAgICAvLyBDb3VsZG4ndCBtb3ZlIHRoaXMgY2hlY2sgaW50byB0aGUgJ3BhcnNlQ2xhc3NNZXRob2QnIG1ldGhvZCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eS5cbiAgICAgIGlmIChpc0NvbnN0cnVjdG9yICYmIGtpbmQgIT09IFwibWV0aG9kXCIpIHsgdGhpcy5yYWlzZShub2RlLmtleS5zdGFydCwgXCJDb25zdHJ1Y3RvciBjYW4ndCBoYXZlIGdldC9zZXQgbW9kaWZpZXJcIik7IH1cbiAgICAgIG5vZGUua2luZCA9IGlzQ29uc3RydWN0b3IgPyBcImNvbnN0cnVjdG9yXCIgOiBraW5kO1xuICAgICAgdGhpcy5wYXJzZUNsYXNzTWV0aG9kKG5vZGUsIGlzR2VuZXJhdG9yLCBpc0FzeW5jLCBhbGxvd3NEaXJlY3RTdXBlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGFyc2VDbGFzc0ZpZWxkKG5vZGUpO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlXG4gIH07XG5cbiAgcHAkOC5pc0NsYXNzRWxlbWVudE5hbWVTdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLnR5cGUgPT09IHR5cGVzJDEubmFtZSB8fFxuICAgICAgdGhpcy50eXBlID09PSB0eXBlcyQxLnByaXZhdGVJZCB8fFxuICAgICAgdGhpcy50eXBlID09PSB0eXBlcyQxLm51bSB8fFxuICAgICAgdGhpcy50eXBlID09PSB0eXBlcyQxLnN0cmluZyB8fFxuICAgICAgdGhpcy50eXBlID09PSB0eXBlcyQxLmJyYWNrZXRMIHx8XG4gICAgICB0aGlzLnR5cGUua2V5d29yZFxuICAgIClcbiAgfTtcblxuICBwcCQ4LnBhcnNlQ2xhc3NFbGVtZW50TmFtZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLnByaXZhdGVJZCkge1xuICAgICAgaWYgKHRoaXMudmFsdWUgPT09IFwiY29uc3RydWN0b3JcIikge1xuICAgICAgICB0aGlzLnJhaXNlKHRoaXMuc3RhcnQsIFwiQ2xhc3NlcyBjYW4ndCBoYXZlIGFuIGVsZW1lbnQgbmFtZWQgJyNjb25zdHJ1Y3RvcidcIik7XG4gICAgICB9XG4gICAgICBlbGVtZW50LmNvbXB1dGVkID0gZmFsc2U7XG4gICAgICBlbGVtZW50LmtleSA9IHRoaXMucGFyc2VQcml2YXRlSWRlbnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wYXJzZVByb3BlcnR5TmFtZShlbGVtZW50KTtcbiAgICB9XG4gIH07XG5cbiAgcHAkOC5wYXJzZUNsYXNzTWV0aG9kID0gZnVuY3Rpb24obWV0aG9kLCBpc0dlbmVyYXRvciwgaXNBc3luYywgYWxsb3dzRGlyZWN0U3VwZXIpIHtcbiAgICAvLyBDaGVjayBrZXkgYW5kIGZsYWdzXG4gICAgdmFyIGtleSA9IG1ldGhvZC5rZXk7XG4gICAgaWYgKG1ldGhvZC5raW5kID09PSBcImNvbnN0cnVjdG9yXCIpIHtcbiAgICAgIGlmIChpc0dlbmVyYXRvcikgeyB0aGlzLnJhaXNlKGtleS5zdGFydCwgXCJDb25zdHJ1Y3RvciBjYW4ndCBiZSBhIGdlbmVyYXRvclwiKTsgfVxuICAgICAgaWYgKGlzQXN5bmMpIHsgdGhpcy5yYWlzZShrZXkuc3RhcnQsIFwiQ29uc3RydWN0b3IgY2FuJ3QgYmUgYW4gYXN5bmMgbWV0aG9kXCIpOyB9XG4gICAgfSBlbHNlIGlmIChtZXRob2Quc3RhdGljICYmIGNoZWNrS2V5TmFtZShtZXRob2QsIFwicHJvdG90eXBlXCIpKSB7XG4gICAgICB0aGlzLnJhaXNlKGtleS5zdGFydCwgXCJDbGFzc2VzIG1heSBub3QgaGF2ZSBhIHN0YXRpYyBwcm9wZXJ0eSBuYW1lZCBwcm90b3R5cGVcIik7XG4gICAgfVxuXG4gICAgLy8gUGFyc2UgdmFsdWVcbiAgICB2YXIgdmFsdWUgPSBtZXRob2QudmFsdWUgPSB0aGlzLnBhcnNlTWV0aG9kKGlzR2VuZXJhdG9yLCBpc0FzeW5jLCBhbGxvd3NEaXJlY3RTdXBlcik7XG5cbiAgICAvLyBDaGVjayB2YWx1ZVxuICAgIGlmIChtZXRob2Qua2luZCA9PT0gXCJnZXRcIiAmJiB2YWx1ZS5wYXJhbXMubGVuZ3RoICE9PSAwKVxuICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodmFsdWUuc3RhcnQsIFwiZ2V0dGVyIHNob3VsZCBoYXZlIG5vIHBhcmFtc1wiKTsgfVxuICAgIGlmIChtZXRob2Qua2luZCA9PT0gXCJzZXRcIiAmJiB2YWx1ZS5wYXJhbXMubGVuZ3RoICE9PSAxKVxuICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodmFsdWUuc3RhcnQsIFwic2V0dGVyIHNob3VsZCBoYXZlIGV4YWN0bHkgb25lIHBhcmFtXCIpOyB9XG4gICAgaWYgKG1ldGhvZC5raW5kID09PSBcInNldFwiICYmIHZhbHVlLnBhcmFtc1swXS50eXBlID09PSBcIlJlc3RFbGVtZW50XCIpXG4gICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZSh2YWx1ZS5wYXJhbXNbMF0uc3RhcnQsIFwiU2V0dGVyIGNhbm5vdCB1c2UgcmVzdCBwYXJhbXNcIik7IH1cblxuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobWV0aG9kLCBcIk1ldGhvZERlZmluaXRpb25cIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlQ2xhc3NGaWVsZCA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgaWYgKGNoZWNrS2V5TmFtZShmaWVsZCwgXCJjb25zdHJ1Y3RvclwiKSkge1xuICAgICAgdGhpcy5yYWlzZShmaWVsZC5rZXkuc3RhcnQsIFwiQ2xhc3NlcyBjYW4ndCBoYXZlIGEgZmllbGQgbmFtZWQgJ2NvbnN0cnVjdG9yJ1wiKTtcbiAgICB9IGVsc2UgaWYgKGZpZWxkLnN0YXRpYyAmJiBjaGVja0tleU5hbWUoZmllbGQsIFwicHJvdG90eXBlXCIpKSB7XG4gICAgICB0aGlzLnJhaXNlKGZpZWxkLmtleS5zdGFydCwgXCJDbGFzc2VzIGNhbid0IGhhdmUgYSBzdGF0aWMgZmllbGQgbmFtZWQgJ3Byb3RvdHlwZSdcIik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuZXEpKSB7XG4gICAgICAvLyBUbyByYWlzZSBTeW50YXhFcnJvciBpZiAnYXJndW1lbnRzJyBleGlzdHMgaW4gdGhlIGluaXRpYWxpemVyLlxuICAgICAgdmFyIHNjb3BlID0gdGhpcy5jdXJyZW50VGhpc1Njb3BlKCk7XG4gICAgICB2YXIgaW5DbGFzc0ZpZWxkSW5pdCA9IHNjb3BlLmluQ2xhc3NGaWVsZEluaXQ7XG4gICAgICBzY29wZS5pbkNsYXNzRmllbGRJbml0ID0gdHJ1ZTtcbiAgICAgIGZpZWxkLnZhbHVlID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKCk7XG4gICAgICBzY29wZS5pbkNsYXNzRmllbGRJbml0ID0gaW5DbGFzc0ZpZWxkSW5pdDtcbiAgICB9IGVsc2Uge1xuICAgICAgZmllbGQudmFsdWUgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnNlbWljb2xvbigpO1xuXG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShmaWVsZCwgXCJQcm9wZXJ0eURlZmluaXRpb25cIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlQ2xhc3NTdGF0aWNCbG9jayA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBub2RlLmJvZHkgPSBbXTtcblxuICAgIHZhciBvbGRMYWJlbHMgPSB0aGlzLmxhYmVscztcbiAgICB0aGlzLmxhYmVscyA9IFtdO1xuICAgIHRoaXMuZW50ZXJTY29wZShTQ09QRV9DTEFTU19TVEFUSUNfQkxPQ0sgfCBTQ09QRV9TVVBFUik7XG4gICAgd2hpbGUgKHRoaXMudHlwZSAhPT0gdHlwZXMkMS5icmFjZVIpIHtcbiAgICAgIHZhciBzdG10ID0gdGhpcy5wYXJzZVN0YXRlbWVudChudWxsKTtcbiAgICAgIG5vZGUuYm9keS5wdXNoKHN0bXQpO1xuICAgIH1cbiAgICB0aGlzLm5leHQoKTtcbiAgICB0aGlzLmV4aXRTY29wZSgpO1xuICAgIHRoaXMubGFiZWxzID0gb2xkTGFiZWxzO1xuXG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIlN0YXRpY0Jsb2NrXCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZUNsYXNzSWQgPSBmdW5jdGlvbihub2RlLCBpc1N0YXRlbWVudCkge1xuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEubmFtZSkge1xuICAgICAgbm9kZS5pZCA9IHRoaXMucGFyc2VJZGVudCgpO1xuICAgICAgaWYgKGlzU3RhdGVtZW50KVxuICAgICAgICB7IHRoaXMuY2hlY2tMVmFsU2ltcGxlKG5vZGUuaWQsIEJJTkRfTEVYSUNBTCwgZmFsc2UpOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc1N0YXRlbWVudCA9PT0gdHJ1ZSlcbiAgICAgICAgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgICAgbm9kZS5pZCA9IG51bGw7XG4gICAgfVxuICB9O1xuXG4gIHBwJDgucGFyc2VDbGFzc1N1cGVyID0gZnVuY3Rpb24obm9kZSkge1xuICAgIG5vZGUuc3VwZXJDbGFzcyA9IHRoaXMuZWF0KHR5cGVzJDEuX2V4dGVuZHMpID8gdGhpcy5wYXJzZUV4cHJTdWJzY3JpcHRzKG51bGwsIGZhbHNlKSA6IG51bGw7XG4gIH07XG5cbiAgcHAkOC5lbnRlckNsYXNzQm9keSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbGVtZW50ID0ge2RlY2xhcmVkOiBPYmplY3QuY3JlYXRlKG51bGwpLCB1c2VkOiBbXX07XG4gICAgdGhpcy5wcml2YXRlTmFtZVN0YWNrLnB1c2goZWxlbWVudCk7XG4gICAgcmV0dXJuIGVsZW1lbnQuZGVjbGFyZWRcbiAgfTtcblxuICBwcCQ4LmV4aXRDbGFzc0JvZHkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVmID0gdGhpcy5wcml2YXRlTmFtZVN0YWNrLnBvcCgpO1xuICAgIHZhciBkZWNsYXJlZCA9IHJlZi5kZWNsYXJlZDtcbiAgICB2YXIgdXNlZCA9IHJlZi51c2VkO1xuICAgIGlmICghdGhpcy5vcHRpb25zLmNoZWNrUHJpdmF0ZUZpZWxkcykgeyByZXR1cm4gfVxuICAgIHZhciBsZW4gPSB0aGlzLnByaXZhdGVOYW1lU3RhY2subGVuZ3RoO1xuICAgIHZhciBwYXJlbnQgPSBsZW4gPT09IDAgPyBudWxsIDogdGhpcy5wcml2YXRlTmFtZVN0YWNrW2xlbiAtIDFdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXNlZC5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGlkID0gdXNlZFtpXTtcbiAgICAgIGlmICghaGFzT3duKGRlY2xhcmVkLCBpZC5uYW1lKSkge1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgcGFyZW50LnVzZWQucHVzaChpZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yYWlzZVJlY292ZXJhYmxlKGlkLnN0YXJ0LCAoXCJQcml2YXRlIGZpZWxkICcjXCIgKyAoaWQubmFtZSkgKyBcIicgbXVzdCBiZSBkZWNsYXJlZCBpbiBhbiBlbmNsb3NpbmcgY2xhc3NcIikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGlzUHJpdmF0ZU5hbWVDb25mbGljdGVkKHByaXZhdGVOYW1lTWFwLCBlbGVtZW50KSB7XG4gICAgdmFyIG5hbWUgPSBlbGVtZW50LmtleS5uYW1lO1xuICAgIHZhciBjdXJyID0gcHJpdmF0ZU5hbWVNYXBbbmFtZV07XG5cbiAgICB2YXIgbmV4dCA9IFwidHJ1ZVwiO1xuICAgIGlmIChlbGVtZW50LnR5cGUgPT09IFwiTWV0aG9kRGVmaW5pdGlvblwiICYmIChlbGVtZW50LmtpbmQgPT09IFwiZ2V0XCIgfHwgZWxlbWVudC5raW5kID09PSBcInNldFwiKSkge1xuICAgICAgbmV4dCA9IChlbGVtZW50LnN0YXRpYyA/IFwic1wiIDogXCJpXCIpICsgZWxlbWVudC5raW5kO1xuICAgIH1cblxuICAgIC8vIGBjbGFzcyB7IGdldCAjYSgpe307IHN0YXRpYyBzZXQgI2EoXyl7fSB9YCBpcyBhbHNvIGNvbmZsaWN0LlxuICAgIGlmIChcbiAgICAgIGN1cnIgPT09IFwiaWdldFwiICYmIG5leHQgPT09IFwiaXNldFwiIHx8XG4gICAgICBjdXJyID09PSBcImlzZXRcIiAmJiBuZXh0ID09PSBcImlnZXRcIiB8fFxuICAgICAgY3VyciA9PT0gXCJzZ2V0XCIgJiYgbmV4dCA9PT0gXCJzc2V0XCIgfHxcbiAgICAgIGN1cnIgPT09IFwic3NldFwiICYmIG5leHQgPT09IFwic2dldFwiXG4gICAgKSB7XG4gICAgICBwcml2YXRlTmFtZU1hcFtuYW1lXSA9IFwidHJ1ZVwiO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIGlmICghY3Vycikge1xuICAgICAgcHJpdmF0ZU5hbWVNYXBbbmFtZV0gPSBuZXh0O1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tLZXlOYW1lKG5vZGUsIG5hbWUpIHtcbiAgICB2YXIgY29tcHV0ZWQgPSBub2RlLmNvbXB1dGVkO1xuICAgIHZhciBrZXkgPSBub2RlLmtleTtcbiAgICByZXR1cm4gIWNvbXB1dGVkICYmIChcbiAgICAgIGtleS50eXBlID09PSBcIklkZW50aWZpZXJcIiAmJiBrZXkubmFtZSA9PT0gbmFtZSB8fFxuICAgICAga2V5LnR5cGUgPT09IFwiTGl0ZXJhbFwiICYmIGtleS52YWx1ZSA9PT0gbmFtZVxuICAgIClcbiAgfVxuXG4gIC8vIFBhcnNlcyBtb2R1bGUgZXhwb3J0IGRlY2xhcmF0aW9uLlxuXG4gIHBwJDgucGFyc2VFeHBvcnRBbGxEZWNsYXJhdGlvbiA9IGZ1bmN0aW9uKG5vZGUsIGV4cG9ydHMpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDExKSB7XG4gICAgICBpZiAodGhpcy5lYXRDb250ZXh0dWFsKFwiYXNcIikpIHtcbiAgICAgICAgbm9kZS5leHBvcnRlZCA9IHRoaXMucGFyc2VNb2R1bGVFeHBvcnROYW1lKCk7XG4gICAgICAgIHRoaXMuY2hlY2tFeHBvcnQoZXhwb3J0cywgbm9kZS5leHBvcnRlZCwgdGhpcy5sYXN0VG9rU3RhcnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5leHBvcnRlZCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZXhwZWN0Q29udGV4dHVhbChcImZyb21cIik7XG4gICAgaWYgKHRoaXMudHlwZSAhPT0gdHlwZXMkMS5zdHJpbmcpIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgICBub2RlLnNvdXJjZSA9IHRoaXMucGFyc2VFeHByQXRvbSgpO1xuICAgIHRoaXMuc2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkV4cG9ydEFsbERlY2xhcmF0aW9uXCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZUV4cG9ydCA9IGZ1bmN0aW9uKG5vZGUsIGV4cG9ydHMpIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICAvLyBleHBvcnQgKiBmcm9tICcuLi4nXG4gICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuc3RhcikpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlRXhwb3J0QWxsRGVjbGFyYXRpb24obm9kZSwgZXhwb3J0cylcbiAgICB9XG4gICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuX2RlZmF1bHQpKSB7IC8vIGV4cG9ydCBkZWZhdWx0IC4uLlxuICAgICAgdGhpcy5jaGVja0V4cG9ydChleHBvcnRzLCBcImRlZmF1bHRcIiwgdGhpcy5sYXN0VG9rU3RhcnQpO1xuICAgICAgbm9kZS5kZWNsYXJhdGlvbiA9IHRoaXMucGFyc2VFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24oKTtcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJFeHBvcnREZWZhdWx0RGVjbGFyYXRpb25cIilcbiAgICB9XG4gICAgLy8gZXhwb3J0IHZhcnxjb25zdHxsZXR8ZnVuY3Rpb258Y2xhc3MgLi4uXG4gICAgaWYgKHRoaXMuc2hvdWxkUGFyc2VFeHBvcnRTdGF0ZW1lbnQoKSkge1xuICAgICAgbm9kZS5kZWNsYXJhdGlvbiA9IHRoaXMucGFyc2VFeHBvcnREZWNsYXJhdGlvbihub2RlKTtcbiAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLnR5cGUgPT09IFwiVmFyaWFibGVEZWNsYXJhdGlvblwiKVxuICAgICAgICB7IHRoaXMuY2hlY2tWYXJpYWJsZUV4cG9ydChleHBvcnRzLCBub2RlLmRlY2xhcmF0aW9uLmRlY2xhcmF0aW9ucyk7IH1cbiAgICAgIGVsc2VcbiAgICAgICAgeyB0aGlzLmNoZWNrRXhwb3J0KGV4cG9ydHMsIG5vZGUuZGVjbGFyYXRpb24uaWQsIG5vZGUuZGVjbGFyYXRpb24uaWQuc3RhcnQpOyB9XG4gICAgICBub2RlLnNwZWNpZmllcnMgPSBbXTtcbiAgICAgIG5vZGUuc291cmNlID0gbnVsbDtcbiAgICB9IGVsc2UgeyAvLyBleHBvcnQgeyB4LCB5IGFzIHogfSBbZnJvbSAnLi4uJ11cbiAgICAgIG5vZGUuZGVjbGFyYXRpb24gPSBudWxsO1xuICAgICAgbm9kZS5zcGVjaWZpZXJzID0gdGhpcy5wYXJzZUV4cG9ydFNwZWNpZmllcnMoZXhwb3J0cyk7XG4gICAgICBpZiAodGhpcy5lYXRDb250ZXh0dWFsKFwiZnJvbVwiKSkge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9PSB0eXBlcyQxLnN0cmluZykgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgICAgICBub2RlLnNvdXJjZSA9IHRoaXMucGFyc2VFeHByQXRvbSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxpc3QgPSBub2RlLnNwZWNpZmllcnM7IGkgPCBsaXN0Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgLy8gY2hlY2sgZm9yIGtleXdvcmRzIHVzZWQgYXMgbG9jYWwgbmFtZXNcbiAgICAgICAgICB2YXIgc3BlYyA9IGxpc3RbaV07XG5cbiAgICAgICAgICB0aGlzLmNoZWNrVW5yZXNlcnZlZChzcGVjLmxvY2FsKTtcbiAgICAgICAgICAvLyBjaGVjayBpZiBleHBvcnQgaXMgZGVmaW5lZFxuICAgICAgICAgIHRoaXMuY2hlY2tMb2NhbEV4cG9ydChzcGVjLmxvY2FsKTtcblxuICAgICAgICAgIGlmIChzcGVjLmxvY2FsLnR5cGUgPT09IFwiTGl0ZXJhbFwiKSB7XG4gICAgICAgICAgICB0aGlzLnJhaXNlKHNwZWMubG9jYWwuc3RhcnQsIFwiQSBzdHJpbmcgbGl0ZXJhbCBjYW5ub3QgYmUgdXNlZCBhcyBhbiBleHBvcnRlZCBiaW5kaW5nIHdpdGhvdXQgYGZyb21gLlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBub2RlLnNvdXJjZSA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLnNlbWljb2xvbigpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiRXhwb3J0TmFtZWREZWNsYXJhdGlvblwiKVxuICB9O1xuXG4gIHBwJDgucGFyc2VFeHBvcnREZWNsYXJhdGlvbiA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZVN0YXRlbWVudChudWxsKVxuICB9O1xuXG4gIHBwJDgucGFyc2VFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXNBc3luYztcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLl9mdW5jdGlvbiB8fCAoaXNBc3luYyA9IHRoaXMuaXNBc3luY0Z1bmN0aW9uKCkpKSB7XG4gICAgICB2YXIgZk5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICBpZiAoaXNBc3luYykgeyB0aGlzLm5leHQoKTsgfVxuICAgICAgcmV0dXJuIHRoaXMucGFyc2VGdW5jdGlvbihmTm9kZSwgRlVOQ19TVEFURU1FTlQgfCBGVU5DX05VTExBQkxFX0lELCBmYWxzZSwgaXNBc3luYylcbiAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5fY2xhc3MpIHtcbiAgICAgIHZhciBjTm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUNsYXNzKGNOb2RlLCBcIm51bGxhYmxlSURcIilcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGRlY2xhcmF0aW9uID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKCk7XG4gICAgICB0aGlzLnNlbWljb2xvbigpO1xuICAgICAgcmV0dXJuIGRlY2xhcmF0aW9uXG4gICAgfVxuICB9O1xuXG4gIHBwJDguY2hlY2tFeHBvcnQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBwb3MpIHtcbiAgICBpZiAoIWV4cG9ydHMpIHsgcmV0dXJuIH1cbiAgICBpZiAodHlwZW9mIG5hbWUgIT09IFwic3RyaW5nXCIpXG4gICAgICB7IG5hbWUgPSBuYW1lLnR5cGUgPT09IFwiSWRlbnRpZmllclwiID8gbmFtZS5uYW1lIDogbmFtZS52YWx1ZTsgfVxuICAgIGlmIChoYXNPd24oZXhwb3J0cywgbmFtZSkpXG4gICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShwb3MsIFwiRHVwbGljYXRlIGV4cG9ydCAnXCIgKyBuYW1lICsgXCInXCIpOyB9XG4gICAgZXhwb3J0c1tuYW1lXSA9IHRydWU7XG4gIH07XG5cbiAgcHAkOC5jaGVja1BhdHRlcm5FeHBvcnQgPSBmdW5jdGlvbihleHBvcnRzLCBwYXQpIHtcbiAgICB2YXIgdHlwZSA9IHBhdC50eXBlO1xuICAgIGlmICh0eXBlID09PSBcIklkZW50aWZpZXJcIilcbiAgICAgIHsgdGhpcy5jaGVja0V4cG9ydChleHBvcnRzLCBwYXQsIHBhdC5zdGFydCk7IH1cbiAgICBlbHNlIGlmICh0eXBlID09PSBcIk9iamVjdFBhdHRlcm5cIilcbiAgICAgIHsgZm9yICh2YXIgaSA9IDAsIGxpc3QgPSBwYXQucHJvcGVydGllczsgaSA8IGxpc3QubGVuZ3RoOyBpICs9IDEpXG4gICAgICAgIHtcbiAgICAgICAgICB2YXIgcHJvcCA9IGxpc3RbaV07XG5cbiAgICAgICAgICB0aGlzLmNoZWNrUGF0dGVybkV4cG9ydChleHBvcnRzLCBwcm9wKTtcbiAgICAgICAgfSB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gXCJBcnJheVBhdHRlcm5cIilcbiAgICAgIHsgZm9yICh2YXIgaSQxID0gMCwgbGlzdCQxID0gcGF0LmVsZW1lbnRzOyBpJDEgPCBsaXN0JDEubGVuZ3RoOyBpJDEgKz0gMSkge1xuICAgICAgICB2YXIgZWx0ID0gbGlzdCQxW2kkMV07XG5cbiAgICAgICAgICBpZiAoZWx0KSB7IHRoaXMuY2hlY2tQYXR0ZXJuRXhwb3J0KGV4cG9ydHMsIGVsdCk7IH1cbiAgICAgIH0gfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09IFwiUHJvcGVydHlcIilcbiAgICAgIHsgdGhpcy5jaGVja1BhdHRlcm5FeHBvcnQoZXhwb3J0cywgcGF0LnZhbHVlKTsgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09IFwiQXNzaWdubWVudFBhdHRlcm5cIilcbiAgICAgIHsgdGhpcy5jaGVja1BhdHRlcm5FeHBvcnQoZXhwb3J0cywgcGF0LmxlZnQpOyB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gXCJSZXN0RWxlbWVudFwiKVxuICAgICAgeyB0aGlzLmNoZWNrUGF0dGVybkV4cG9ydChleHBvcnRzLCBwYXQuYXJndW1lbnQpOyB9XG4gIH07XG5cbiAgcHAkOC5jaGVja1ZhcmlhYmxlRXhwb3J0ID0gZnVuY3Rpb24oZXhwb3J0cywgZGVjbHMpIHtcbiAgICBpZiAoIWV4cG9ydHMpIHsgcmV0dXJuIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbGlzdCA9IGRlY2xzOyBpIDwgbGlzdC5sZW5ndGg7IGkgKz0gMSlcbiAgICAgIHtcbiAgICAgIHZhciBkZWNsID0gbGlzdFtpXTtcblxuICAgICAgdGhpcy5jaGVja1BhdHRlcm5FeHBvcnQoZXhwb3J0cywgZGVjbC5pZCk7XG4gICAgfVxuICB9O1xuXG4gIHBwJDguc2hvdWxkUGFyc2VFeHBvcnRTdGF0ZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlLmtleXdvcmQgPT09IFwidmFyXCIgfHxcbiAgICAgIHRoaXMudHlwZS5rZXl3b3JkID09PSBcImNvbnN0XCIgfHxcbiAgICAgIHRoaXMudHlwZS5rZXl3b3JkID09PSBcImNsYXNzXCIgfHxcbiAgICAgIHRoaXMudHlwZS5rZXl3b3JkID09PSBcImZ1bmN0aW9uXCIgfHxcbiAgICAgIHRoaXMuaXNMZXQoKSB8fFxuICAgICAgdGhpcy5pc0FzeW5jRnVuY3Rpb24oKVxuICB9O1xuXG4gIC8vIFBhcnNlcyBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIG1vZHVsZSBleHBvcnRzLlxuXG4gIHBwJDgucGFyc2VFeHBvcnRTcGVjaWZpZXIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgIG5vZGUubG9jYWwgPSB0aGlzLnBhcnNlTW9kdWxlRXhwb3J0TmFtZSgpO1xuXG4gICAgbm9kZS5leHBvcnRlZCA9IHRoaXMuZWF0Q29udGV4dHVhbChcImFzXCIpID8gdGhpcy5wYXJzZU1vZHVsZUV4cG9ydE5hbWUoKSA6IG5vZGUubG9jYWw7XG4gICAgdGhpcy5jaGVja0V4cG9ydChcbiAgICAgIGV4cG9ydHMsXG4gICAgICBub2RlLmV4cG9ydGVkLFxuICAgICAgbm9kZS5leHBvcnRlZC5zdGFydFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiRXhwb3J0U3BlY2lmaWVyXCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZUV4cG9ydFNwZWNpZmllcnMgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gICAgdmFyIG5vZGVzID0gW10sIGZpcnN0ID0gdHJ1ZTtcbiAgICAvLyBleHBvcnQgeyB4LCB5IGFzIHogfSBbZnJvbSAnLi4uJ11cbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLmJyYWNlTCk7XG4gICAgd2hpbGUgKCF0aGlzLmVhdCh0eXBlcyQxLmJyYWNlUikpIHtcbiAgICAgIGlmICghZmlyc3QpIHtcbiAgICAgICAgdGhpcy5leHBlY3QodHlwZXMkMS5jb21tYSk7XG4gICAgICAgIGlmICh0aGlzLmFmdGVyVHJhaWxpbmdDb21tYSh0eXBlcyQxLmJyYWNlUikpIHsgYnJlYWsgfVxuICAgICAgfSBlbHNlIHsgZmlyc3QgPSBmYWxzZTsgfVxuXG4gICAgICBub2Rlcy5wdXNoKHRoaXMucGFyc2VFeHBvcnRTcGVjaWZpZXIoZXhwb3J0cykpO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZXNcbiAgfTtcblxuICAvLyBQYXJzZXMgaW1wb3J0IGRlY2xhcmF0aW9uLlxuXG4gIHBwJDgucGFyc2VJbXBvcnQgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdGhpcy5uZXh0KCk7XG5cbiAgICAvLyBpbXBvcnQgJy4uLidcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLnN0cmluZykge1xuICAgICAgbm9kZS5zcGVjaWZpZXJzID0gZW1wdHkkMTtcbiAgICAgIG5vZGUuc291cmNlID0gdGhpcy5wYXJzZUV4cHJBdG9tKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUuc3BlY2lmaWVycyA9IHRoaXMucGFyc2VJbXBvcnRTcGVjaWZpZXJzKCk7XG4gICAgICB0aGlzLmV4cGVjdENvbnRleHR1YWwoXCJmcm9tXCIpO1xuICAgICAgbm9kZS5zb3VyY2UgPSB0aGlzLnR5cGUgPT09IHR5cGVzJDEuc3RyaW5nID8gdGhpcy5wYXJzZUV4cHJBdG9tKCkgOiB0aGlzLnVuZXhwZWN0ZWQoKTtcbiAgICB9XG4gICAgdGhpcy5zZW1pY29sb24oKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiSW1wb3J0RGVjbGFyYXRpb25cIilcbiAgfTtcblxuICAvLyBQYXJzZXMgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBtb2R1bGUgaW1wb3J0cy5cblxuICBwcCQ4LnBhcnNlSW1wb3J0U3BlY2lmaWVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgIG5vZGUuaW1wb3J0ZWQgPSB0aGlzLnBhcnNlTW9kdWxlRXhwb3J0TmFtZSgpO1xuXG4gICAgaWYgKHRoaXMuZWF0Q29udGV4dHVhbChcImFzXCIpKSB7XG4gICAgICBub2RlLmxvY2FsID0gdGhpcy5wYXJzZUlkZW50KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2hlY2tVbnJlc2VydmVkKG5vZGUuaW1wb3J0ZWQpO1xuICAgICAgbm9kZS5sb2NhbCA9IG5vZGUuaW1wb3J0ZWQ7XG4gICAgfVxuICAgIHRoaXMuY2hlY2tMVmFsU2ltcGxlKG5vZGUubG9jYWwsIEJJTkRfTEVYSUNBTCk7XG5cbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiSW1wb3J0U3BlY2lmaWVyXCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZUltcG9ydERlZmF1bHRTcGVjaWZpZXIgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBpbXBvcnQgZGVmYXVsdE9iaiwgeyB4LCB5IGFzIHogfSBmcm9tICcuLi4nXG4gICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgIG5vZGUubG9jYWwgPSB0aGlzLnBhcnNlSWRlbnQoKTtcbiAgICB0aGlzLmNoZWNrTFZhbFNpbXBsZShub2RlLmxvY2FsLCBCSU5EX0xFWElDQUwpO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJJbXBvcnREZWZhdWx0U3BlY2lmaWVyXCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZUltcG9ydE5hbWVzcGFjZVNwZWNpZmllciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICB0aGlzLm5leHQoKTtcbiAgICB0aGlzLmV4cGVjdENvbnRleHR1YWwoXCJhc1wiKTtcbiAgICBub2RlLmxvY2FsID0gdGhpcy5wYXJzZUlkZW50KCk7XG4gICAgdGhpcy5jaGVja0xWYWxTaW1wbGUobm9kZS5sb2NhbCwgQklORF9MRVhJQ0FMKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyXCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZUltcG9ydFNwZWNpZmllcnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbm9kZXMgPSBbXSwgZmlyc3QgPSB0cnVlO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEubmFtZSkge1xuICAgICAgbm9kZXMucHVzaCh0aGlzLnBhcnNlSW1wb3J0RGVmYXVsdFNwZWNpZmllcigpKTtcbiAgICAgIGlmICghdGhpcy5lYXQodHlwZXMkMS5jb21tYSkpIHsgcmV0dXJuIG5vZGVzIH1cbiAgICB9XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5zdGFyKSB7XG4gICAgICBub2Rlcy5wdXNoKHRoaXMucGFyc2VJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXIoKSk7XG4gICAgICByZXR1cm4gbm9kZXNcbiAgICB9XG4gICAgdGhpcy5leHBlY3QodHlwZXMkMS5icmFjZUwpO1xuICAgIHdoaWxlICghdGhpcy5lYXQodHlwZXMkMS5icmFjZVIpKSB7XG4gICAgICBpZiAoIWZpcnN0KSB7XG4gICAgICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEuY29tbWEpO1xuICAgICAgICBpZiAodGhpcy5hZnRlclRyYWlsaW5nQ29tbWEodHlwZXMkMS5icmFjZVIpKSB7IGJyZWFrIH1cbiAgICAgIH0gZWxzZSB7IGZpcnN0ID0gZmFsc2U7IH1cblxuICAgICAgbm9kZXMucHVzaCh0aGlzLnBhcnNlSW1wb3J0U3BlY2lmaWVyKCkpO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZXNcbiAgfTtcblxuICBwcCQ4LnBhcnNlTW9kdWxlRXhwb3J0TmFtZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gMTMgJiYgdGhpcy50eXBlID09PSB0eXBlcyQxLnN0cmluZykge1xuICAgICAgdmFyIHN0cmluZ0xpdGVyYWwgPSB0aGlzLnBhcnNlTGl0ZXJhbCh0aGlzLnZhbHVlKTtcbiAgICAgIGlmIChsb25lU3Vycm9nYXRlLnRlc3Qoc3RyaW5nTGl0ZXJhbC52YWx1ZSkpIHtcbiAgICAgICAgdGhpcy5yYWlzZShzdHJpbmdMaXRlcmFsLnN0YXJ0LCBcIkFuIGV4cG9ydCBuYW1lIGNhbm5vdCBpbmNsdWRlIGEgbG9uZSBzdXJyb2dhdGUuXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0cmluZ0xpdGVyYWxcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGFyc2VJZGVudCh0cnVlKVxuICB9O1xuXG4gIC8vIFNldCBgRXhwcmVzc2lvblN0YXRlbWVudCNkaXJlY3RpdmVgIHByb3BlcnR5IGZvciBkaXJlY3RpdmUgcHJvbG9ndWVzLlxuICBwcCQ4LmFkYXB0RGlyZWN0aXZlUHJvbG9ndWUgPSBmdW5jdGlvbihzdGF0ZW1lbnRzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGF0ZW1lbnRzLmxlbmd0aCAmJiB0aGlzLmlzRGlyZWN0aXZlQ2FuZGlkYXRlKHN0YXRlbWVudHNbaV0pOyArK2kpIHtcbiAgICAgIHN0YXRlbWVudHNbaV0uZGlyZWN0aXZlID0gc3RhdGVtZW50c1tpXS5leHByZXNzaW9uLnJhdy5zbGljZSgxLCAtMSk7XG4gICAgfVxuICB9O1xuICBwcCQ4LmlzRGlyZWN0aXZlQ2FuZGlkYXRlID0gZnVuY3Rpb24oc3RhdGVtZW50KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA1ICYmXG4gICAgICBzdGF0ZW1lbnQudHlwZSA9PT0gXCJFeHByZXNzaW9uU3RhdGVtZW50XCIgJiZcbiAgICAgIHN0YXRlbWVudC5leHByZXNzaW9uLnR5cGUgPT09IFwiTGl0ZXJhbFwiICYmXG4gICAgICB0eXBlb2Ygc3RhdGVtZW50LmV4cHJlc3Npb24udmFsdWUgPT09IFwic3RyaW5nXCIgJiZcbiAgICAgIC8vIFJlamVjdCBwYXJlbnRoZXNpemVkIHN0cmluZ3MuXG4gICAgICAodGhpcy5pbnB1dFtzdGF0ZW1lbnQuc3RhcnRdID09PSBcIlxcXCJcIiB8fCB0aGlzLmlucHV0W3N0YXRlbWVudC5zdGFydF0gPT09IFwiJ1wiKVxuICAgIClcbiAgfTtcblxuICB2YXIgcHAkNyA9IFBhcnNlci5wcm90b3R5cGU7XG5cbiAgLy8gQ29udmVydCBleGlzdGluZyBleHByZXNzaW9uIGF0b20gdG8gYXNzaWduYWJsZSBwYXR0ZXJuXG4gIC8vIGlmIHBvc3NpYmxlLlxuXG4gIHBwJDcudG9Bc3NpZ25hYmxlID0gZnVuY3Rpb24obm9kZSwgaXNCaW5kaW5nLCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2ICYmIG5vZGUpIHtcbiAgICAgIHN3aXRjaCAobm9kZS50eXBlKSB7XG4gICAgICBjYXNlIFwiSWRlbnRpZmllclwiOlxuICAgICAgICBpZiAodGhpcy5pbkFzeW5jICYmIG5vZGUubmFtZSA9PT0gXCJhd2FpdFwiKVxuICAgICAgICAgIHsgdGhpcy5yYWlzZShub2RlLnN0YXJ0LCBcIkNhbm5vdCB1c2UgJ2F3YWl0JyBhcyBpZGVudGlmaWVyIGluc2lkZSBhbiBhc3luYyBmdW5jdGlvblwiKTsgfVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlIFwiT2JqZWN0UGF0dGVyblwiOlxuICAgICAgY2FzZSBcIkFycmF5UGF0dGVyblwiOlxuICAgICAgY2FzZSBcIkFzc2lnbm1lbnRQYXR0ZXJuXCI6XG4gICAgICBjYXNlIFwiUmVzdEVsZW1lbnRcIjpcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBcIk9iamVjdEV4cHJlc3Npb25cIjpcbiAgICAgICAgbm9kZS50eXBlID0gXCJPYmplY3RQYXR0ZXJuXCI7XG4gICAgICAgIGlmIChyZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSB7IHRoaXMuY2hlY2tQYXR0ZXJuRXJyb3JzKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIHRydWUpOyB9XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsaXN0ID0gbm9kZS5wcm9wZXJ0aWVzOyBpIDwgbGlzdC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIHZhciBwcm9wID0gbGlzdFtpXTtcblxuICAgICAgICB0aGlzLnRvQXNzaWduYWJsZShwcm9wLCBpc0JpbmRpbmcpO1xuICAgICAgICAgIC8vIEVhcmx5IGVycm9yOlxuICAgICAgICAgIC8vICAgQXNzaWdubWVudFJlc3RQcm9wZXJ0eVtZaWVsZCwgQXdhaXRdIDpcbiAgICAgICAgICAvLyAgICAgYC4uLmAgRGVzdHJ1Y3R1cmluZ0Fzc2lnbm1lbnRUYXJnZXRbWWllbGQsIEF3YWl0XVxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gICBJdCBpcyBhIFN5bnRheCBFcnJvciBpZiB8RGVzdHJ1Y3R1cmluZ0Fzc2lnbm1lbnRUYXJnZXR8IGlzIGFuIHxBcnJheUxpdGVyYWx8IG9yIGFuIHxPYmplY3RMaXRlcmFsfC5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBwcm9wLnR5cGUgPT09IFwiUmVzdEVsZW1lbnRcIiAmJlxuICAgICAgICAgICAgKHByb3AuYXJndW1lbnQudHlwZSA9PT0gXCJBcnJheVBhdHRlcm5cIiB8fCBwcm9wLmFyZ3VtZW50LnR5cGUgPT09IFwiT2JqZWN0UGF0dGVyblwiKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5yYWlzZShwcm9wLmFyZ3VtZW50LnN0YXJ0LCBcIlVuZXhwZWN0ZWQgdG9rZW5cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgXCJQcm9wZXJ0eVwiOlxuICAgICAgICAvLyBBc3NpZ25tZW50UHJvcGVydHkgaGFzIHR5cGUgPT09IFwiUHJvcGVydHlcIlxuICAgICAgICBpZiAobm9kZS5raW5kICE9PSBcImluaXRcIikgeyB0aGlzLnJhaXNlKG5vZGUua2V5LnN0YXJ0LCBcIk9iamVjdCBwYXR0ZXJuIGNhbid0IGNvbnRhaW4gZ2V0dGVyIG9yIHNldHRlclwiKTsgfVxuICAgICAgICB0aGlzLnRvQXNzaWduYWJsZShub2RlLnZhbHVlLCBpc0JpbmRpbmcpO1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlIFwiQXJyYXlFeHByZXNzaW9uXCI6XG4gICAgICAgIG5vZGUudHlwZSA9IFwiQXJyYXlQYXR0ZXJuXCI7XG4gICAgICAgIGlmIChyZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSB7IHRoaXMuY2hlY2tQYXR0ZXJuRXJyb3JzKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIHRydWUpOyB9XG4gICAgICAgIHRoaXMudG9Bc3NpZ25hYmxlTGlzdChub2RlLmVsZW1lbnRzLCBpc0JpbmRpbmcpO1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlIFwiU3ByZWFkRWxlbWVudFwiOlxuICAgICAgICBub2RlLnR5cGUgPSBcIlJlc3RFbGVtZW50XCI7XG4gICAgICAgIHRoaXMudG9Bc3NpZ25hYmxlKG5vZGUuYXJndW1lbnQsIGlzQmluZGluZyk7XG4gICAgICAgIGlmIChub2RlLmFyZ3VtZW50LnR5cGUgPT09IFwiQXNzaWdubWVudFBhdHRlcm5cIilcbiAgICAgICAgICB7IHRoaXMucmFpc2Uobm9kZS5hcmd1bWVudC5zdGFydCwgXCJSZXN0IGVsZW1lbnRzIGNhbm5vdCBoYXZlIGEgZGVmYXVsdCB2YWx1ZVwiKTsgfVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlIFwiQXNzaWdubWVudEV4cHJlc3Npb25cIjpcbiAgICAgICAgaWYgKG5vZGUub3BlcmF0b3IgIT09IFwiPVwiKSB7IHRoaXMucmFpc2Uobm9kZS5sZWZ0LmVuZCwgXCJPbmx5ICc9JyBvcGVyYXRvciBjYW4gYmUgdXNlZCBmb3Igc3BlY2lmeWluZyBkZWZhdWx0IHZhbHVlLlwiKTsgfVxuICAgICAgICBub2RlLnR5cGUgPSBcIkFzc2lnbm1lbnRQYXR0ZXJuXCI7XG4gICAgICAgIGRlbGV0ZSBub2RlLm9wZXJhdG9yO1xuICAgICAgICB0aGlzLnRvQXNzaWduYWJsZShub2RlLmxlZnQsIGlzQmluZGluZyk7XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgXCJQYXJlbnRoZXNpemVkRXhwcmVzc2lvblwiOlxuICAgICAgICB0aGlzLnRvQXNzaWduYWJsZShub2RlLmV4cHJlc3Npb24sIGlzQmluZGluZywgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyk7XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgXCJDaGFpbkV4cHJlc3Npb25cIjpcbiAgICAgICAgdGhpcy5yYWlzZVJlY292ZXJhYmxlKG5vZGUuc3RhcnQsIFwiT3B0aW9uYWwgY2hhaW5pbmcgY2Fubm90IGFwcGVhciBpbiBsZWZ0LWhhbmQgc2lkZVwiKTtcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBcIk1lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgICAgaWYgKCFpc0JpbmRpbmcpIHsgYnJlYWsgfVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLnJhaXNlKG5vZGUuc3RhcnQsIFwiQXNzaWduaW5nIHRvIHJ2YWx1ZVwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpIHsgdGhpcy5jaGVja1BhdHRlcm5FcnJvcnMocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycywgdHJ1ZSk7IH1cbiAgICByZXR1cm4gbm9kZVxuICB9O1xuXG4gIC8vIENvbnZlcnQgbGlzdCBvZiBleHByZXNzaW9uIGF0b21zIHRvIGJpbmRpbmcgbGlzdC5cblxuICBwcCQ3LnRvQXNzaWduYWJsZUxpc3QgPSBmdW5jdGlvbihleHByTGlzdCwgaXNCaW5kaW5nKSB7XG4gICAgdmFyIGVuZCA9IGV4cHJMaXN0Lmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB2YXIgZWx0ID0gZXhwckxpc3RbaV07XG4gICAgICBpZiAoZWx0KSB7IHRoaXMudG9Bc3NpZ25hYmxlKGVsdCwgaXNCaW5kaW5nKTsgfVxuICAgIH1cbiAgICBpZiAoZW5kKSB7XG4gICAgICB2YXIgbGFzdCA9IGV4cHJMaXN0W2VuZCAtIDFdO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA9PT0gNiAmJiBpc0JpbmRpbmcgJiYgbGFzdCAmJiBsYXN0LnR5cGUgPT09IFwiUmVzdEVsZW1lbnRcIiAmJiBsYXN0LmFyZ3VtZW50LnR5cGUgIT09IFwiSWRlbnRpZmllclwiKVxuICAgICAgICB7IHRoaXMudW5leHBlY3RlZChsYXN0LmFyZ3VtZW50LnN0YXJ0KTsgfVxuICAgIH1cbiAgICByZXR1cm4gZXhwckxpc3RcbiAgfTtcblxuICAvLyBQYXJzZXMgc3ByZWFkIGVsZW1lbnQuXG5cbiAgcHAkNy5wYXJzZVNwcmVhZCA9IGZ1bmN0aW9uKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgbm9kZS5hcmd1bWVudCA9IHRoaXMucGFyc2VNYXliZUFzc2lnbihmYWxzZSwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIlNwcmVhZEVsZW1lbnRcIilcbiAgfTtcblxuICBwcCQ3LnBhcnNlUmVzdEJpbmRpbmcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgdGhpcy5uZXh0KCk7XG5cbiAgICAvLyBSZXN0RWxlbWVudCBpbnNpZGUgb2YgYSBmdW5jdGlvbiBwYXJhbWV0ZXIgbXVzdCBiZSBhbiBpZGVudGlmaWVyXG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA9PT0gNiAmJiB0aGlzLnR5cGUgIT09IHR5cGVzJDEubmFtZSlcbiAgICAgIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cblxuICAgIG5vZGUuYXJndW1lbnQgPSB0aGlzLnBhcnNlQmluZGluZ0F0b20oKTtcblxuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJSZXN0RWxlbWVudFwiKVxuICB9O1xuXG4gIC8vIFBhcnNlcyBsdmFsdWUgKGFzc2lnbmFibGUpIGF0b20uXG5cbiAgcHAkNy5wYXJzZUJpbmRpbmdBdG9tID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2KSB7XG4gICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgY2FzZSB0eXBlcyQxLmJyYWNrZXRMOlxuICAgICAgICB2YXIgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICBub2RlLmVsZW1lbnRzID0gdGhpcy5wYXJzZUJpbmRpbmdMaXN0KHR5cGVzJDEuYnJhY2tldFIsIHRydWUsIHRydWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiQXJyYXlQYXR0ZXJuXCIpXG5cbiAgICAgIGNhc2UgdHlwZXMkMS5icmFjZUw6XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlT2JqKHRydWUpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBhcnNlSWRlbnQoKVxuICB9O1xuXG4gIHBwJDcucGFyc2VCaW5kaW5nTGlzdCA9IGZ1bmN0aW9uKGNsb3NlLCBhbGxvd0VtcHR5LCBhbGxvd1RyYWlsaW5nQ29tbWEsIGFsbG93TW9kaWZpZXJzKSB7XG4gICAgdmFyIGVsdHMgPSBbXSwgZmlyc3QgPSB0cnVlO1xuICAgIHdoaWxlICghdGhpcy5lYXQoY2xvc2UpKSB7XG4gICAgICBpZiAoZmlyc3QpIHsgZmlyc3QgPSBmYWxzZTsgfVxuICAgICAgZWxzZSB7IHRoaXMuZXhwZWN0KHR5cGVzJDEuY29tbWEpOyB9XG4gICAgICBpZiAoYWxsb3dFbXB0eSAmJiB0aGlzLnR5cGUgPT09IHR5cGVzJDEuY29tbWEpIHtcbiAgICAgICAgZWx0cy5wdXNoKG51bGwpO1xuICAgICAgfSBlbHNlIGlmIChhbGxvd1RyYWlsaW5nQ29tbWEgJiYgdGhpcy5hZnRlclRyYWlsaW5nQ29tbWEoY2xvc2UpKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5lbGxpcHNpcykge1xuICAgICAgICB2YXIgcmVzdCA9IHRoaXMucGFyc2VSZXN0QmluZGluZygpO1xuICAgICAgICB0aGlzLnBhcnNlQmluZGluZ0xpc3RJdGVtKHJlc3QpO1xuICAgICAgICBlbHRzLnB1c2gocmVzdCk7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuY29tbWEpIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHRoaXMuc3RhcnQsIFwiQ29tbWEgaXMgbm90IHBlcm1pdHRlZCBhZnRlciB0aGUgcmVzdCBlbGVtZW50XCIpOyB9XG4gICAgICAgIHRoaXMuZXhwZWN0KGNsb3NlKTtcbiAgICAgICAgYnJlYWtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsdHMucHVzaCh0aGlzLnBhcnNlQXNzaWduYWJsZUxpc3RJdGVtKGFsbG93TW9kaWZpZXJzKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbHRzXG4gIH07XG5cbiAgcHAkNy5wYXJzZUFzc2lnbmFibGVMaXN0SXRlbSA9IGZ1bmN0aW9uKGFsbG93TW9kaWZpZXJzKSB7XG4gICAgdmFyIGVsZW0gPSB0aGlzLnBhcnNlTWF5YmVEZWZhdWx0KHRoaXMuc3RhcnQsIHRoaXMuc3RhcnRMb2MpO1xuICAgIHRoaXMucGFyc2VCaW5kaW5nTGlzdEl0ZW0oZWxlbSk7XG4gICAgcmV0dXJuIGVsZW1cbiAgfTtcblxuICBwcCQ3LnBhcnNlQmluZGluZ0xpc3RJdGVtID0gZnVuY3Rpb24ocGFyYW0pIHtcbiAgICByZXR1cm4gcGFyYW1cbiAgfTtcblxuICAvLyBQYXJzZXMgYXNzaWdubWVudCBwYXR0ZXJuIGFyb3VuZCBnaXZlbiBhdG9tIGlmIHBvc3NpYmxlLlxuXG4gIHBwJDcucGFyc2VNYXliZURlZmF1bHQgPSBmdW5jdGlvbihzdGFydFBvcywgc3RhcnRMb2MsIGxlZnQpIHtcbiAgICBsZWZ0ID0gbGVmdCB8fCB0aGlzLnBhcnNlQmluZGluZ0F0b20oKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uIDwgNiB8fCAhdGhpcy5lYXQodHlwZXMkMS5lcSkpIHsgcmV0dXJuIGxlZnQgfVxuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGVBdChzdGFydFBvcywgc3RhcnRMb2MpO1xuICAgIG5vZGUubGVmdCA9IGxlZnQ7XG4gICAgbm9kZS5yaWdodCA9IHRoaXMucGFyc2VNYXliZUFzc2lnbigpO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJBc3NpZ25tZW50UGF0dGVyblwiKVxuICB9O1xuXG4gIC8vIFRoZSBmb2xsb3dpbmcgdGhyZWUgZnVuY3Rpb25zIGFsbCB2ZXJpZnkgdGhhdCBhIG5vZGUgaXMgYW4gbHZhbHVlIOKAlFxuICAvLyBzb21ldGhpbmcgdGhhdCBjYW4gYmUgYm91bmQsIG9yIGFzc2lnbmVkIHRvLiBJbiBvcmRlciB0byBkbyBzbywgdGhleSBwZXJmb3JtXG4gIC8vIGEgdmFyaWV0eSBvZiBjaGVja3M6XG4gIC8vXG4gIC8vIC0gQ2hlY2sgdGhhdCBub25lIG9mIHRoZSBib3VuZC9hc3NpZ25lZC10byBpZGVudGlmaWVycyBhcmUgcmVzZXJ2ZWQgd29yZHMuXG4gIC8vIC0gUmVjb3JkIG5hbWUgZGVjbGFyYXRpb25zIGZvciBiaW5kaW5ncyBpbiB0aGUgYXBwcm9wcmlhdGUgc2NvcGUuXG4gIC8vIC0gQ2hlY2sgZHVwbGljYXRlIGFyZ3VtZW50IG5hbWVzLCBpZiBjaGVja0NsYXNoZXMgaXMgc2V0LlxuICAvL1xuICAvLyBJZiBhIGNvbXBsZXggYmluZGluZyBwYXR0ZXJuIGlzIGVuY291bnRlcmVkIChlLmcuLCBvYmplY3QgYW5kIGFycmF5XG4gIC8vIGRlc3RydWN0dXJpbmcpLCB0aGUgZW50aXJlIHBhdHRlcm4gaXMgcmVjdXJzaXZlbHkgY2hlY2tlZC5cbiAgLy9cbiAgLy8gVGhlcmUgYXJlIHRocmVlIHZlcnNpb25zIG9mIGNoZWNrTFZhbCooKSBhcHByb3ByaWF0ZSBmb3IgZGlmZmVyZW50XG4gIC8vIGNpcmN1bXN0YW5jZXM6XG4gIC8vXG4gIC8vIC0gY2hlY2tMVmFsU2ltcGxlKCkgc2hhbGwgYmUgdXNlZCBpZiB0aGUgc3ludGFjdGljIGNvbnN0cnVjdCBzdXBwb3J0c1xuICAvLyAgIG5vdGhpbmcgb3RoZXIgdGhhbiBpZGVudGlmaWVycyBhbmQgbWVtYmVyIGV4cHJlc3Npb25zLiBQYXJlbnRoZXNpemVkXG4gIC8vICAgZXhwcmVzc2lvbnMgYXJlIGFsc28gY29ycmVjdGx5IGhhbmRsZWQuIFRoaXMgaXMgZ2VuZXJhbGx5IGFwcHJvcHJpYXRlIGZvclxuICAvLyAgIGNvbnN0cnVjdHMgZm9yIHdoaWNoIHRoZSBzcGVjIHNheXNcbiAgLy9cbiAgLy8gICA+IEl0IGlzIGEgU3ludGF4IEVycm9yIGlmIEFzc2lnbm1lbnRUYXJnZXRUeXBlIG9mIFt0aGUgcHJvZHVjdGlvbl0gaXMgbm90XG4gIC8vICAgPiBzaW1wbGUuXG4gIC8vXG4gIC8vICAgSXQgaXMgYWxzbyBhcHByb3ByaWF0ZSBmb3IgY2hlY2tpbmcgaWYgYW4gaWRlbnRpZmllciBpcyB2YWxpZCBhbmQgbm90XG4gIC8vICAgZGVmaW5lZCBlbHNld2hlcmUsIGxpa2UgaW1wb3J0IGRlY2xhcmF0aW9ucyBvciBmdW5jdGlvbi9jbGFzcyBpZGVudGlmaWVycy5cbiAgLy9cbiAgLy8gICBFeGFtcGxlcyB3aGVyZSB0aGlzIGlzIHVzZWQgaW5jbHVkZTpcbiAgLy8gICAgIGEgKz0g4oCmO1xuICAvLyAgICAgaW1wb3J0IGEgZnJvbSAn4oCmJztcbiAgLy8gICB3aGVyZSBhIGlzIHRoZSBub2RlIHRvIGJlIGNoZWNrZWQuXG4gIC8vXG4gIC8vIC0gY2hlY2tMVmFsUGF0dGVybigpIHNoYWxsIGJlIHVzZWQgaWYgdGhlIHN5bnRhY3RpYyBjb25zdHJ1Y3Qgc3VwcG9ydHNcbiAgLy8gICBhbnl0aGluZyBjaGVja0xWYWxTaW1wbGUoKSBzdXBwb3J0cywgYXMgd2VsbCBhcyBvYmplY3QgYW5kIGFycmF5XG4gIC8vICAgZGVzdHJ1Y3R1cmluZyBwYXR0ZXJucy4gVGhpcyBpcyBnZW5lcmFsbHkgYXBwcm9wcmlhdGUgZm9yIGNvbnN0cnVjdHMgZm9yXG4gIC8vICAgd2hpY2ggdGhlIHNwZWMgc2F5c1xuICAvL1xuICAvLyAgID4gSXQgaXMgYSBTeW50YXggRXJyb3IgaWYgW3RoZSBwcm9kdWN0aW9uXSBpcyBuZWl0aGVyIGFuIE9iamVjdExpdGVyYWwgbm9yXG4gIC8vICAgPiBhbiBBcnJheUxpdGVyYWwgYW5kIEFzc2lnbm1lbnRUYXJnZXRUeXBlIG9mIFt0aGUgcHJvZHVjdGlvbl0gaXMgbm90XG4gIC8vICAgPiBzaW1wbGUuXG4gIC8vXG4gIC8vICAgRXhhbXBsZXMgd2hlcmUgdGhpcyBpcyB1c2VkIGluY2x1ZGU6XG4gIC8vICAgICAoYSA9IOKApik7XG4gIC8vICAgICBjb25zdCBhID0g4oCmO1xuICAvLyAgICAgdHJ5IHsg4oCmIH0gY2F0Y2ggKGEpIHsg4oCmIH1cbiAgLy8gICB3aGVyZSBhIGlzIHRoZSBub2RlIHRvIGJlIGNoZWNrZWQuXG4gIC8vXG4gIC8vIC0gY2hlY2tMVmFsSW5uZXJQYXR0ZXJuKCkgc2hhbGwgYmUgdXNlZCBpZiB0aGUgc3ludGFjdGljIGNvbnN0cnVjdCBzdXBwb3J0c1xuICAvLyAgIGFueXRoaW5nIGNoZWNrTFZhbFBhdHRlcm4oKSBzdXBwb3J0cywgYXMgd2VsbCBhcyBkZWZhdWx0IGFzc2lnbm1lbnRcbiAgLy8gICBwYXR0ZXJucywgcmVzdCBlbGVtZW50cywgYW5kIG90aGVyIGNvbnN0cnVjdHMgdGhhdCBtYXkgYXBwZWFyIHdpdGhpbiBhblxuICAvLyAgIG9iamVjdCBvciBhcnJheSBkZXN0cnVjdHVyaW5nIHBhdHRlcm4uXG4gIC8vXG4gIC8vICAgQXMgYSBzcGVjaWFsIGNhc2UsIGZ1bmN0aW9uIHBhcmFtZXRlcnMgYWxzbyB1c2UgY2hlY2tMVmFsSW5uZXJQYXR0ZXJuKCksXG4gIC8vICAgYXMgdGhleSBhbHNvIHN1cHBvcnQgZGVmYXVsdHMgYW5kIHJlc3QgY29uc3RydWN0cy5cbiAgLy9cbiAgLy8gVGhlc2UgZnVuY3Rpb25zIGRlbGliZXJhdGVseSBzdXBwb3J0IGJvdGggYXNzaWdubWVudCBhbmQgYmluZGluZyBjb25zdHJ1Y3RzLFxuICAvLyBhcyB0aGUgbG9naWMgZm9yIGJvdGggaXMgZXhjZWVkaW5nbHkgc2ltaWxhci4gSWYgdGhlIG5vZGUgaXMgdGhlIHRhcmdldCBvZlxuICAvLyBhbiBhc3NpZ25tZW50LCB0aGVuIGJpbmRpbmdUeXBlIHNob3VsZCBiZSBzZXQgdG8gQklORF9OT05FLiBPdGhlcndpc2UsIGl0XG4gIC8vIHNob3VsZCBiZSBzZXQgdG8gdGhlIGFwcHJvcHJpYXRlIEJJTkRfKiBjb25zdGFudCwgbGlrZSBCSU5EX1ZBUiBvclxuICAvLyBCSU5EX0xFWElDQUwuXG4gIC8vXG4gIC8vIElmIHRoZSBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCBhIG5vbi1CSU5EX05PTkUgYmluZGluZ1R5cGUsIHRoZW5cbiAgLy8gYWRkaXRpb25hbGx5IGEgY2hlY2tDbGFzaGVzIG9iamVjdCBtYXkgYmUgc3BlY2lmaWVkIHRvIGFsbG93IGNoZWNraW5nIGZvclxuICAvLyBkdXBsaWNhdGUgYXJndW1lbnQgbmFtZXMuIGNoZWNrQ2xhc2hlcyBpcyBpZ25vcmVkIGlmIHRoZSBwcm92aWRlZCBjb25zdHJ1Y3RcbiAgLy8gaXMgYW4gYXNzaWdubWVudCAoaS5lLiwgYmluZGluZ1R5cGUgaXMgQklORF9OT05FKS5cblxuICBwcCQ3LmNoZWNrTFZhbFNpbXBsZSA9IGZ1bmN0aW9uKGV4cHIsIGJpbmRpbmdUeXBlLCBjaGVja0NsYXNoZXMpIHtcbiAgICBpZiAoIGJpbmRpbmdUeXBlID09PSB2b2lkIDAgKSBiaW5kaW5nVHlwZSA9IEJJTkRfTk9ORTtcblxuICAgIHZhciBpc0JpbmQgPSBiaW5kaW5nVHlwZSAhPT0gQklORF9OT05FO1xuXG4gICAgc3dpdGNoIChleHByLnR5cGUpIHtcbiAgICBjYXNlIFwiSWRlbnRpZmllclwiOlxuICAgICAgaWYgKHRoaXMuc3RyaWN0ICYmIHRoaXMucmVzZXJ2ZWRXb3Jkc1N0cmljdEJpbmQudGVzdChleHByLm5hbWUpKVxuICAgICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShleHByLnN0YXJ0LCAoaXNCaW5kID8gXCJCaW5kaW5nIFwiIDogXCJBc3NpZ25pbmcgdG8gXCIpICsgZXhwci5uYW1lICsgXCIgaW4gc3RyaWN0IG1vZGVcIik7IH1cbiAgICAgIGlmIChpc0JpbmQpIHtcbiAgICAgICAgaWYgKGJpbmRpbmdUeXBlID09PSBCSU5EX0xFWElDQUwgJiYgZXhwci5uYW1lID09PSBcImxldFwiKVxuICAgICAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKGV4cHIuc3RhcnQsIFwibGV0IGlzIGRpc2FsbG93ZWQgYXMgYSBsZXhpY2FsbHkgYm91bmQgbmFtZVwiKTsgfVxuICAgICAgICBpZiAoY2hlY2tDbGFzaGVzKSB7XG4gICAgICAgICAgaWYgKGhhc093bihjaGVja0NsYXNoZXMsIGV4cHIubmFtZSkpXG4gICAgICAgICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShleHByLnN0YXJ0LCBcIkFyZ3VtZW50IG5hbWUgY2xhc2hcIik7IH1cbiAgICAgICAgICBjaGVja0NsYXNoZXNbZXhwci5uYW1lXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJpbmRpbmdUeXBlICE9PSBCSU5EX09VVFNJREUpIHsgdGhpcy5kZWNsYXJlTmFtZShleHByLm5hbWUsIGJpbmRpbmdUeXBlLCBleHByLnN0YXJ0KTsgfVxuICAgICAgfVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgXCJDaGFpbkV4cHJlc3Npb25cIjpcbiAgICAgIHRoaXMucmFpc2VSZWNvdmVyYWJsZShleHByLnN0YXJ0LCBcIk9wdGlvbmFsIGNoYWluaW5nIGNhbm5vdCBhcHBlYXIgaW4gbGVmdC1oYW5kIHNpZGVcIik7XG4gICAgICBicmVha1xuXG4gICAgY2FzZSBcIk1lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGlmIChpc0JpbmQpIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKGV4cHIuc3RhcnQsIFwiQmluZGluZyBtZW1iZXIgZXhwcmVzc2lvblwiKTsgfVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgXCJQYXJlbnRoZXNpemVkRXhwcmVzc2lvblwiOlxuICAgICAgaWYgKGlzQmluZCkgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUoZXhwci5zdGFydCwgXCJCaW5kaW5nIHBhcmVudGhlc2l6ZWQgZXhwcmVzc2lvblwiKTsgfVxuICAgICAgcmV0dXJuIHRoaXMuY2hlY2tMVmFsU2ltcGxlKGV4cHIuZXhwcmVzc2lvbiwgYmluZGluZ1R5cGUsIGNoZWNrQ2xhc2hlcylcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aGlzLnJhaXNlKGV4cHIuc3RhcnQsIChpc0JpbmQgPyBcIkJpbmRpbmdcIiA6IFwiQXNzaWduaW5nIHRvXCIpICsgXCIgcnZhbHVlXCIpO1xuICAgIH1cbiAgfTtcblxuICBwcCQ3LmNoZWNrTFZhbFBhdHRlcm4gPSBmdW5jdGlvbihleHByLCBiaW5kaW5nVHlwZSwgY2hlY2tDbGFzaGVzKSB7XG4gICAgaWYgKCBiaW5kaW5nVHlwZSA9PT0gdm9pZCAwICkgYmluZGluZ1R5cGUgPSBCSU5EX05PTkU7XG5cbiAgICBzd2l0Y2ggKGV4cHIudHlwZSkge1xuICAgIGNhc2UgXCJPYmplY3RQYXR0ZXJuXCI6XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGlzdCA9IGV4cHIucHJvcGVydGllczsgaSA8IGxpc3QubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIHByb3AgPSBsaXN0W2ldO1xuXG4gICAgICB0aGlzLmNoZWNrTFZhbElubmVyUGF0dGVybihwcm9wLCBiaW5kaW5nVHlwZSwgY2hlY2tDbGFzaGVzKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlIFwiQXJyYXlQYXR0ZXJuXCI6XG4gICAgICBmb3IgKHZhciBpJDEgPSAwLCBsaXN0JDEgPSBleHByLmVsZW1lbnRzOyBpJDEgPCBsaXN0JDEubGVuZ3RoOyBpJDEgKz0gMSkge1xuICAgICAgICB2YXIgZWxlbSA9IGxpc3QkMVtpJDFdO1xuXG4gICAgICBpZiAoZWxlbSkgeyB0aGlzLmNoZWNrTFZhbElubmVyUGF0dGVybihlbGVtLCBiaW5kaW5nVHlwZSwgY2hlY2tDbGFzaGVzKTsgfVxuICAgICAgfVxuICAgICAgYnJlYWtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aGlzLmNoZWNrTFZhbFNpbXBsZShleHByLCBiaW5kaW5nVHlwZSwgY2hlY2tDbGFzaGVzKTtcbiAgICB9XG4gIH07XG5cbiAgcHAkNy5jaGVja0xWYWxJbm5lclBhdHRlcm4gPSBmdW5jdGlvbihleHByLCBiaW5kaW5nVHlwZSwgY2hlY2tDbGFzaGVzKSB7XG4gICAgaWYgKCBiaW5kaW5nVHlwZSA9PT0gdm9pZCAwICkgYmluZGluZ1R5cGUgPSBCSU5EX05PTkU7XG5cbiAgICBzd2l0Y2ggKGV4cHIudHlwZSkge1xuICAgIGNhc2UgXCJQcm9wZXJ0eVwiOlxuICAgICAgLy8gQXNzaWdubWVudFByb3BlcnR5IGhhcyB0eXBlID09PSBcIlByb3BlcnR5XCJcbiAgICAgIHRoaXMuY2hlY2tMVmFsSW5uZXJQYXR0ZXJuKGV4cHIudmFsdWUsIGJpbmRpbmdUeXBlLCBjaGVja0NsYXNoZXMpO1xuICAgICAgYnJlYWtcblxuICAgIGNhc2UgXCJBc3NpZ25tZW50UGF0dGVyblwiOlxuICAgICAgdGhpcy5jaGVja0xWYWxQYXR0ZXJuKGV4cHIubGVmdCwgYmluZGluZ1R5cGUsIGNoZWNrQ2xhc2hlcyk7XG4gICAgICBicmVha1xuXG4gICAgY2FzZSBcIlJlc3RFbGVtZW50XCI6XG4gICAgICB0aGlzLmNoZWNrTFZhbFBhdHRlcm4oZXhwci5hcmd1bWVudCwgYmluZGluZ1R5cGUsIGNoZWNrQ2xhc2hlcyk7XG4gICAgICBicmVha1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRoaXMuY2hlY2tMVmFsUGF0dGVybihleHByLCBiaW5kaW5nVHlwZSwgY2hlY2tDbGFzaGVzKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gVGhlIGFsZ29yaXRobSB1c2VkIHRvIGRldGVybWluZSB3aGV0aGVyIGEgcmVnZXhwIGNhbiBhcHBlYXIgYXQgYVxuICAvLyBnaXZlbiBwb2ludCBpbiB0aGUgcHJvZ3JhbSBpcyBsb29zZWx5IGJhc2VkIG9uIHN3ZWV0LmpzJyBhcHByb2FjaC5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3N3ZWV0LmpzL3dpa2kvZGVzaWduXG5cblxuICB2YXIgVG9rQ29udGV4dCA9IGZ1bmN0aW9uIFRva0NvbnRleHQodG9rZW4sIGlzRXhwciwgcHJlc2VydmVTcGFjZSwgb3ZlcnJpZGUsIGdlbmVyYXRvcikge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgICB0aGlzLmlzRXhwciA9ICEhaXNFeHByO1xuICAgIHRoaXMucHJlc2VydmVTcGFjZSA9ICEhcHJlc2VydmVTcGFjZTtcbiAgICB0aGlzLm92ZXJyaWRlID0gb3ZlcnJpZGU7XG4gICAgdGhpcy5nZW5lcmF0b3IgPSAhIWdlbmVyYXRvcjtcbiAgfTtcblxuICB2YXIgdHlwZXMgPSB7XG4gICAgYl9zdGF0OiBuZXcgVG9rQ29udGV4dChcIntcIiwgZmFsc2UpLFxuICAgIGJfZXhwcjogbmV3IFRva0NvbnRleHQoXCJ7XCIsIHRydWUpLFxuICAgIGJfdG1wbDogbmV3IFRva0NvbnRleHQoXCIke1wiLCBmYWxzZSksXG4gICAgcF9zdGF0OiBuZXcgVG9rQ29udGV4dChcIihcIiwgZmFsc2UpLFxuICAgIHBfZXhwcjogbmV3IFRva0NvbnRleHQoXCIoXCIsIHRydWUpLFxuICAgIHFfdG1wbDogbmV3IFRva0NvbnRleHQoXCJgXCIsIHRydWUsIHRydWUsIGZ1bmN0aW9uIChwKSB7IHJldHVybiBwLnRyeVJlYWRUZW1wbGF0ZVRva2VuKCk7IH0pLFxuICAgIGZfc3RhdDogbmV3IFRva0NvbnRleHQoXCJmdW5jdGlvblwiLCBmYWxzZSksXG4gICAgZl9leHByOiBuZXcgVG9rQ29udGV4dChcImZ1bmN0aW9uXCIsIHRydWUpLFxuICAgIGZfZXhwcl9nZW46IG5ldyBUb2tDb250ZXh0KFwiZnVuY3Rpb25cIiwgdHJ1ZSwgZmFsc2UsIG51bGwsIHRydWUpLFxuICAgIGZfZ2VuOiBuZXcgVG9rQ29udGV4dChcImZ1bmN0aW9uXCIsIGZhbHNlLCBmYWxzZSwgbnVsbCwgdHJ1ZSlcbiAgfTtcblxuICB2YXIgcHAkNiA9IFBhcnNlci5wcm90b3R5cGU7XG5cbiAgcHAkNi5pbml0aWFsQ29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBbdHlwZXMuYl9zdGF0XVxuICB9O1xuXG4gIHBwJDYuY3VyQ29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnRleHRbdGhpcy5jb250ZXh0Lmxlbmd0aCAtIDFdXG4gIH07XG5cbiAgcHAkNi5icmFjZUlzQmxvY2sgPSBmdW5jdGlvbihwcmV2VHlwZSkge1xuICAgIHZhciBwYXJlbnQgPSB0aGlzLmN1ckNvbnRleHQoKTtcbiAgICBpZiAocGFyZW50ID09PSB0eXBlcy5mX2V4cHIgfHwgcGFyZW50ID09PSB0eXBlcy5mX3N0YXQpXG4gICAgICB7IHJldHVybiB0cnVlIH1cbiAgICBpZiAocHJldlR5cGUgPT09IHR5cGVzJDEuY29sb24gJiYgKHBhcmVudCA9PT0gdHlwZXMuYl9zdGF0IHx8IHBhcmVudCA9PT0gdHlwZXMuYl9leHByKSlcbiAgICAgIHsgcmV0dXJuICFwYXJlbnQuaXNFeHByIH1cblxuICAgIC8vIFRoZSBjaGVjayBmb3IgYHR0Lm5hbWUgJiYgZXhwckFsbG93ZWRgIGRldGVjdHMgd2hldGhlciB3ZSBhcmVcbiAgICAvLyBhZnRlciBhIGB5aWVsZGAgb3IgYG9mYCBjb25zdHJ1Y3QuIFNlZSB0aGUgYHVwZGF0ZUNvbnRleHRgIGZvclxuICAgIC8vIGB0dC5uYW1lYC5cbiAgICBpZiAocHJldlR5cGUgPT09IHR5cGVzJDEuX3JldHVybiB8fCBwcmV2VHlwZSA9PT0gdHlwZXMkMS5uYW1lICYmIHRoaXMuZXhwckFsbG93ZWQpXG4gICAgICB7IHJldHVybiBsaW5lQnJlYWsudGVzdCh0aGlzLmlucHV0LnNsaWNlKHRoaXMubGFzdFRva0VuZCwgdGhpcy5zdGFydCkpIH1cbiAgICBpZiAocHJldlR5cGUgPT09IHR5cGVzJDEuX2Vsc2UgfHwgcHJldlR5cGUgPT09IHR5cGVzJDEuc2VtaSB8fCBwcmV2VHlwZSA9PT0gdHlwZXMkMS5lb2YgfHwgcHJldlR5cGUgPT09IHR5cGVzJDEucGFyZW5SIHx8IHByZXZUeXBlID09PSB0eXBlcyQxLmFycm93KVxuICAgICAgeyByZXR1cm4gdHJ1ZSB9XG4gICAgaWYgKHByZXZUeXBlID09PSB0eXBlcyQxLmJyYWNlTClcbiAgICAgIHsgcmV0dXJuIHBhcmVudCA9PT0gdHlwZXMuYl9zdGF0IH1cbiAgICBpZiAocHJldlR5cGUgPT09IHR5cGVzJDEuX3ZhciB8fCBwcmV2VHlwZSA9PT0gdHlwZXMkMS5fY29uc3QgfHwgcHJldlR5cGUgPT09IHR5cGVzJDEubmFtZSlcbiAgICAgIHsgcmV0dXJuIGZhbHNlIH1cbiAgICByZXR1cm4gIXRoaXMuZXhwckFsbG93ZWRcbiAgfTtcblxuICBwcCQ2LmluR2VuZXJhdG9yQ29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSB0aGlzLmNvbnRleHQubGVuZ3RoIC0gMTsgaSA+PSAxOyBpLS0pIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcy5jb250ZXh0W2ldO1xuICAgICAgaWYgKGNvbnRleHQudG9rZW4gPT09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgeyByZXR1cm4gY29udGV4dC5nZW5lcmF0b3IgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICBwcCQ2LnVwZGF0ZUNvbnRleHQgPSBmdW5jdGlvbihwcmV2VHlwZSkge1xuICAgIHZhciB1cGRhdGUsIHR5cGUgPSB0aGlzLnR5cGU7XG4gICAgaWYgKHR5cGUua2V5d29yZCAmJiBwcmV2VHlwZSA9PT0gdHlwZXMkMS5kb3QpXG4gICAgICB7IHRoaXMuZXhwckFsbG93ZWQgPSBmYWxzZTsgfVxuICAgIGVsc2UgaWYgKHVwZGF0ZSA9IHR5cGUudXBkYXRlQ29udGV4dClcbiAgICAgIHsgdXBkYXRlLmNhbGwodGhpcywgcHJldlR5cGUpOyB9XG4gICAgZWxzZVxuICAgICAgeyB0aGlzLmV4cHJBbGxvd2VkID0gdHlwZS5iZWZvcmVFeHByOyB9XG4gIH07XG5cbiAgLy8gVXNlZCB0byBoYW5kbGUgZWRnZSBjYXNlcyB3aGVuIHRva2VuIGNvbnRleHQgY291bGQgbm90IGJlIGluZmVycmVkIGNvcnJlY3RseSBkdXJpbmcgdG9rZW5pemF0aW9uIHBoYXNlXG5cbiAgcHAkNi5vdmVycmlkZUNvbnRleHQgPSBmdW5jdGlvbih0b2tlbkN0eCkge1xuICAgIGlmICh0aGlzLmN1ckNvbnRleHQoKSAhPT0gdG9rZW5DdHgpIHtcbiAgICAgIHRoaXMuY29udGV4dFt0aGlzLmNvbnRleHQubGVuZ3RoIC0gMV0gPSB0b2tlbkN0eDtcbiAgICB9XG4gIH07XG5cbiAgLy8gVG9rZW4tc3BlY2lmaWMgY29udGV4dCB1cGRhdGUgY29kZVxuXG4gIHR5cGVzJDEucGFyZW5SLnVwZGF0ZUNvbnRleHQgPSB0eXBlcyQxLmJyYWNlUi51cGRhdGVDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuY29udGV4dC5sZW5ndGggPT09IDEpIHtcbiAgICAgIHRoaXMuZXhwckFsbG93ZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZhciBvdXQgPSB0aGlzLmNvbnRleHQucG9wKCk7XG4gICAgaWYgKG91dCA9PT0gdHlwZXMuYl9zdGF0ICYmIHRoaXMuY3VyQ29udGV4dCgpLnRva2VuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIG91dCA9IHRoaXMuY29udGV4dC5wb3AoKTtcbiAgICB9XG4gICAgdGhpcy5leHByQWxsb3dlZCA9ICFvdXQuaXNFeHByO1xuICB9O1xuXG4gIHR5cGVzJDEuYnJhY2VMLnVwZGF0ZUNvbnRleHQgPSBmdW5jdGlvbihwcmV2VHlwZSkge1xuICAgIHRoaXMuY29udGV4dC5wdXNoKHRoaXMuYnJhY2VJc0Jsb2NrKHByZXZUeXBlKSA/IHR5cGVzLmJfc3RhdCA6IHR5cGVzLmJfZXhwcik7XG4gICAgdGhpcy5leHByQWxsb3dlZCA9IHRydWU7XG4gIH07XG5cbiAgdHlwZXMkMS5kb2xsYXJCcmFjZUwudXBkYXRlQ29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29udGV4dC5wdXNoKHR5cGVzLmJfdG1wbCk7XG4gICAgdGhpcy5leHByQWxsb3dlZCA9IHRydWU7XG4gIH07XG5cbiAgdHlwZXMkMS5wYXJlbkwudXBkYXRlQ29udGV4dCA9IGZ1bmN0aW9uKHByZXZUeXBlKSB7XG4gICAgdmFyIHN0YXRlbWVudFBhcmVucyA9IHByZXZUeXBlID09PSB0eXBlcyQxLl9pZiB8fCBwcmV2VHlwZSA9PT0gdHlwZXMkMS5fZm9yIHx8IHByZXZUeXBlID09PSB0eXBlcyQxLl93aXRoIHx8IHByZXZUeXBlID09PSB0eXBlcyQxLl93aGlsZTtcbiAgICB0aGlzLmNvbnRleHQucHVzaChzdGF0ZW1lbnRQYXJlbnMgPyB0eXBlcy5wX3N0YXQgOiB0eXBlcy5wX2V4cHIpO1xuICAgIHRoaXMuZXhwckFsbG93ZWQgPSB0cnVlO1xuICB9O1xuXG4gIHR5cGVzJDEuaW5jRGVjLnVwZGF0ZUNvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyB0b2tFeHByQWxsb3dlZCBzdGF5cyB1bmNoYW5nZWRcbiAgfTtcblxuICB0eXBlcyQxLl9mdW5jdGlvbi51cGRhdGVDb250ZXh0ID0gdHlwZXMkMS5fY2xhc3MudXBkYXRlQ29udGV4dCA9IGZ1bmN0aW9uKHByZXZUeXBlKSB7XG4gICAgaWYgKHByZXZUeXBlLmJlZm9yZUV4cHIgJiYgcHJldlR5cGUgIT09IHR5cGVzJDEuX2Vsc2UgJiZcbiAgICAgICAgIShwcmV2VHlwZSA9PT0gdHlwZXMkMS5zZW1pICYmIHRoaXMuY3VyQ29udGV4dCgpICE9PSB0eXBlcy5wX3N0YXQpICYmXG4gICAgICAgICEocHJldlR5cGUgPT09IHR5cGVzJDEuX3JldHVybiAmJiBsaW5lQnJlYWsudGVzdCh0aGlzLmlucHV0LnNsaWNlKHRoaXMubGFzdFRva0VuZCwgdGhpcy5zdGFydCkpKSAmJlxuICAgICAgICAhKChwcmV2VHlwZSA9PT0gdHlwZXMkMS5jb2xvbiB8fCBwcmV2VHlwZSA9PT0gdHlwZXMkMS5icmFjZUwpICYmIHRoaXMuY3VyQ29udGV4dCgpID09PSB0eXBlcy5iX3N0YXQpKVxuICAgICAgeyB0aGlzLmNvbnRleHQucHVzaCh0eXBlcy5mX2V4cHIpOyB9XG4gICAgZWxzZVxuICAgICAgeyB0aGlzLmNvbnRleHQucHVzaCh0eXBlcy5mX3N0YXQpOyB9XG4gICAgdGhpcy5leHByQWxsb3dlZCA9IGZhbHNlO1xuICB9O1xuXG4gIHR5cGVzJDEuY29sb24udXBkYXRlQ29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmN1ckNvbnRleHQoKS50b2tlbiA9PT0gXCJmdW5jdGlvblwiKSB7IHRoaXMuY29udGV4dC5wb3AoKTsgfVxuICAgIHRoaXMuZXhwckFsbG93ZWQgPSB0cnVlO1xuICB9O1xuXG4gIHR5cGVzJDEuYmFja1F1b3RlLnVwZGF0ZUNvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5jdXJDb250ZXh0KCkgPT09IHR5cGVzLnFfdG1wbClcbiAgICAgIHsgdGhpcy5jb250ZXh0LnBvcCgpOyB9XG4gICAgZWxzZVxuICAgICAgeyB0aGlzLmNvbnRleHQucHVzaCh0eXBlcy5xX3RtcGwpOyB9XG4gICAgdGhpcy5leHByQWxsb3dlZCA9IGZhbHNlO1xuICB9O1xuXG4gIHR5cGVzJDEuc3Rhci51cGRhdGVDb250ZXh0ID0gZnVuY3Rpb24ocHJldlR5cGUpIHtcbiAgICBpZiAocHJldlR5cGUgPT09IHR5cGVzJDEuX2Z1bmN0aW9uKSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLmNvbnRleHQubGVuZ3RoIC0gMTtcbiAgICAgIGlmICh0aGlzLmNvbnRleHRbaW5kZXhdID09PSB0eXBlcy5mX2V4cHIpXG4gICAgICAgIHsgdGhpcy5jb250ZXh0W2luZGV4XSA9IHR5cGVzLmZfZXhwcl9nZW47IH1cbiAgICAgIGVsc2VcbiAgICAgICAgeyB0aGlzLmNvbnRleHRbaW5kZXhdID0gdHlwZXMuZl9nZW47IH1cbiAgICB9XG4gICAgdGhpcy5leHByQWxsb3dlZCA9IHRydWU7XG4gIH07XG5cbiAgdHlwZXMkMS5uYW1lLnVwZGF0ZUNvbnRleHQgPSBmdW5jdGlvbihwcmV2VHlwZSkge1xuICAgIHZhciBhbGxvd2VkID0gZmFsc2U7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2ICYmIHByZXZUeXBlICE9PSB0eXBlcyQxLmRvdCkge1xuICAgICAgaWYgKHRoaXMudmFsdWUgPT09IFwib2ZcIiAmJiAhdGhpcy5leHByQWxsb3dlZCB8fFxuICAgICAgICAgIHRoaXMudmFsdWUgPT09IFwieWllbGRcIiAmJiB0aGlzLmluR2VuZXJhdG9yQ29udGV4dCgpKVxuICAgICAgICB7IGFsbG93ZWQgPSB0cnVlOyB9XG4gICAgfVxuICAgIHRoaXMuZXhwckFsbG93ZWQgPSBhbGxvd2VkO1xuICB9O1xuXG4gIC8vIEEgcmVjdXJzaXZlIGRlc2NlbnQgcGFyc2VyIG9wZXJhdGVzIGJ5IGRlZmluaW5nIGZ1bmN0aW9ucyBmb3IgYWxsXG4gIC8vIHN5bnRhY3RpYyBlbGVtZW50cywgYW5kIHJlY3Vyc2l2ZWx5IGNhbGxpbmcgdGhvc2UsIGVhY2ggZnVuY3Rpb25cbiAgLy8gYWR2YW5jaW5nIHRoZSBpbnB1dCBzdHJlYW0gYW5kIHJldHVybmluZyBhbiBBU1Qgbm9kZS4gUHJlY2VkZW5jZVxuICAvLyBvZiBjb25zdHJ1Y3RzIChmb3IgZXhhbXBsZSwgdGhlIGZhY3QgdGhhdCBgIXhbMV1gIG1lYW5zIGAhKHhbMV0pYFxuICAvLyBpbnN0ZWFkIG9mIGAoIXgpWzFdYCBpcyBoYW5kbGVkIGJ5IHRoZSBmYWN0IHRoYXQgdGhlIHBhcnNlclxuICAvLyBmdW5jdGlvbiB0aGF0IHBhcnNlcyB1bmFyeSBwcmVmaXggb3BlcmF0b3JzIGlzIGNhbGxlZCBmaXJzdCwgYW5kXG4gIC8vIGluIHR1cm4gY2FsbHMgdGhlIGZ1bmN0aW9uIHRoYXQgcGFyc2VzIGBbXWAgc3Vic2NyaXB0cyDigJQgdGhhdFxuICAvLyB3YXksIGl0J2xsIHJlY2VpdmUgdGhlIG5vZGUgZm9yIGB4WzFdYCBhbHJlYWR5IHBhcnNlZCwgYW5kIHdyYXBzXG4gIC8vICp0aGF0KiBpbiB0aGUgdW5hcnkgb3BlcmF0b3Igbm9kZS5cbiAgLy9cbiAgLy8gQWNvcm4gdXNlcyBhbiBbb3BlcmF0b3IgcHJlY2VkZW5jZSBwYXJzZXJdW29wcF0gdG8gaGFuZGxlIGJpbmFyeVxuICAvLyBvcGVyYXRvciBwcmVjZWRlbmNlLCBiZWNhdXNlIGl0IGlzIG11Y2ggbW9yZSBjb21wYWN0IHRoYW4gdXNpbmdcbiAgLy8gdGhlIHRlY2huaXF1ZSBvdXRsaW5lZCBhYm92ZSwgd2hpY2ggdXNlcyBkaWZmZXJlbnQsIG5lc3RpbmdcbiAgLy8gZnVuY3Rpb25zIHRvIHNwZWNpZnkgcHJlY2VkZW5jZSwgZm9yIGFsbCBvZiB0aGUgdGVuIGJpbmFyeVxuICAvLyBwcmVjZWRlbmNlIGxldmVscyB0aGF0IEphdmFTY3JpcHQgZGVmaW5lcy5cbiAgLy9cbiAgLy8gW29wcF06IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvT3BlcmF0b3ItcHJlY2VkZW5jZV9wYXJzZXJcblxuXG4gIHZhciBwcCQ1ID0gUGFyc2VyLnByb3RvdHlwZTtcblxuICAvLyBDaGVjayBpZiBwcm9wZXJ0eSBuYW1lIGNsYXNoZXMgd2l0aCBhbHJlYWR5IGFkZGVkLlxuICAvLyBPYmplY3QvY2xhc3MgZ2V0dGVycyBhbmQgc2V0dGVycyBhcmUgbm90IGFsbG93ZWQgdG8gY2xhc2gg4oCUXG4gIC8vIGVpdGhlciB3aXRoIGVhY2ggb3RoZXIgb3Igd2l0aCBhbiBpbml0IHByb3BlcnR5IOKAlCBhbmQgaW5cbiAgLy8gc3RyaWN0IG1vZGUsIGluaXQgcHJvcGVydGllcyBhcmUgYWxzbyBub3QgYWxsb3dlZCB0byBiZSByZXBlYXRlZC5cblxuICBwcCQ1LmNoZWNrUHJvcENsYXNoID0gZnVuY3Rpb24ocHJvcCwgcHJvcEhhc2gsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDkgJiYgcHJvcC50eXBlID09PSBcIlNwcmVhZEVsZW1lbnRcIilcbiAgICAgIHsgcmV0dXJuIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYgJiYgKHByb3AuY29tcHV0ZWQgfHwgcHJvcC5tZXRob2QgfHwgcHJvcC5zaG9ydGhhbmQpKVxuICAgICAgeyByZXR1cm4gfVxuICAgIHZhciBrZXkgPSBwcm9wLmtleTtcbiAgICB2YXIgbmFtZTtcbiAgICBzd2l0Y2ggKGtleS50eXBlKSB7XG4gICAgY2FzZSBcIklkZW50aWZpZXJcIjogbmFtZSA9IGtleS5uYW1lOyBicmVha1xuICAgIGNhc2UgXCJMaXRlcmFsXCI6IG5hbWUgPSBTdHJpbmcoa2V5LnZhbHVlKTsgYnJlYWtcbiAgICBkZWZhdWx0OiByZXR1cm5cbiAgICB9XG4gICAgdmFyIGtpbmQgPSBwcm9wLmtpbmQ7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2KSB7XG4gICAgICBpZiAobmFtZSA9PT0gXCJfX3Byb3RvX19cIiAmJiBraW5kID09PSBcImluaXRcIikge1xuICAgICAgICBpZiAocHJvcEhhc2gucHJvdG8pIHtcbiAgICAgICAgICBpZiAocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykge1xuICAgICAgICAgICAgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMuZG91YmxlUHJvdG8gPCAwKSB7XG4gICAgICAgICAgICAgIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMuZG91YmxlUHJvdG8gPSBrZXkuc3RhcnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmFpc2VSZWNvdmVyYWJsZShrZXkuc3RhcnQsIFwiUmVkZWZpbml0aW9uIG9mIF9fcHJvdG9fXyBwcm9wZXJ0eVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJvcEhhc2gucHJvdG8gPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIG5hbWUgPSBcIiRcIiArIG5hbWU7XG4gICAgdmFyIG90aGVyID0gcHJvcEhhc2hbbmFtZV07XG4gICAgaWYgKG90aGVyKSB7XG4gICAgICB2YXIgcmVkZWZpbml0aW9uO1xuICAgICAgaWYgKGtpbmQgPT09IFwiaW5pdFwiKSB7XG4gICAgICAgIHJlZGVmaW5pdGlvbiA9IHRoaXMuc3RyaWN0ICYmIG90aGVyLmluaXQgfHwgb3RoZXIuZ2V0IHx8IG90aGVyLnNldDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlZGVmaW5pdGlvbiA9IG90aGVyLmluaXQgfHwgb3RoZXJba2luZF07XG4gICAgICB9XG4gICAgICBpZiAocmVkZWZpbml0aW9uKVxuICAgICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShrZXkuc3RhcnQsIFwiUmVkZWZpbml0aW9uIG9mIHByb3BlcnR5XCIpOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG90aGVyID0gcHJvcEhhc2hbbmFtZV0gPSB7XG4gICAgICAgIGluaXQ6IGZhbHNlLFxuICAgICAgICBnZXQ6IGZhbHNlLFxuICAgICAgICBzZXQ6IGZhbHNlXG4gICAgICB9O1xuICAgIH1cbiAgICBvdGhlcltraW5kXSA9IHRydWU7XG4gIH07XG5cbiAgLy8gIyMjIEV4cHJlc3Npb24gcGFyc2luZ1xuXG4gIC8vIFRoZXNlIG5lc3QsIGZyb20gdGhlIG1vc3QgZ2VuZXJhbCBleHByZXNzaW9uIHR5cGUgYXQgdGhlIHRvcCB0b1xuICAvLyAnYXRvbWljJywgbm9uZGl2aXNpYmxlIGV4cHJlc3Npb24gdHlwZXMgYXQgdGhlIGJvdHRvbS4gTW9zdCBvZlxuICAvLyB0aGUgZnVuY3Rpb25zIHdpbGwgc2ltcGx5IGxldCB0aGUgZnVuY3Rpb24ocykgYmVsb3cgdGhlbSBwYXJzZSxcbiAgLy8gYW5kLCAqaWYqIHRoZSBzeW50YWN0aWMgY29uc3RydWN0IHRoZXkgaGFuZGxlIGlzIHByZXNlbnQsIHdyYXBcbiAgLy8gdGhlIEFTVCBub2RlIHRoYXQgdGhlIGlubmVyIHBhcnNlciBnYXZlIHRoZW0gaW4gYW5vdGhlciBub2RlLlxuXG4gIC8vIFBhcnNlIGEgZnVsbCBleHByZXNzaW9uLiBUaGUgb3B0aW9uYWwgYXJndW1lbnRzIGFyZSB1c2VkIHRvXG4gIC8vIGZvcmJpZCB0aGUgYGluYCBvcGVyYXRvciAoaW4gZm9yIGxvb3BzIGluaXRhbGl6YXRpb24gZXhwcmVzc2lvbnMpXG4gIC8vIGFuZCBwcm92aWRlIHJlZmVyZW5jZSBmb3Igc3RvcmluZyAnPScgb3BlcmF0b3IgaW5zaWRlIHNob3J0aGFuZFxuICAvLyBwcm9wZXJ0eSBhc3NpZ25tZW50IGluIGNvbnRleHRzIHdoZXJlIGJvdGggb2JqZWN0IGV4cHJlc3Npb25cbiAgLy8gYW5kIG9iamVjdCBwYXR0ZXJuIG1pZ2h0IGFwcGVhciAoc28gaXQncyBwb3NzaWJsZSB0byByYWlzZVxuICAvLyBkZWxheWVkIHN5bnRheCBlcnJvciBhdCBjb3JyZWN0IHBvc2l0aW9uKS5cblxuICBwcCQ1LnBhcnNlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKGZvckluaXQsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpIHtcbiAgICB2YXIgc3RhcnRQb3MgPSB0aGlzLnN0YXJ0LCBzdGFydExvYyA9IHRoaXMuc3RhcnRMb2M7XG4gICAgdmFyIGV4cHIgPSB0aGlzLnBhcnNlTWF5YmVBc3NpZ24oZm9ySW5pdCwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyk7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5jb21tYSkge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyk7XG4gICAgICBub2RlLmV4cHJlc3Npb25zID0gW2V4cHJdO1xuICAgICAgd2hpbGUgKHRoaXMuZWF0KHR5cGVzJDEuY29tbWEpKSB7IG5vZGUuZXhwcmVzc2lvbnMucHVzaCh0aGlzLnBhcnNlTWF5YmVBc3NpZ24oZm9ySW5pdCwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykpOyB9XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiU2VxdWVuY2VFeHByZXNzaW9uXCIpXG4gICAgfVxuICAgIHJldHVybiBleHByXG4gIH07XG5cbiAgLy8gUGFyc2UgYW4gYXNzaWdubWVudCBleHByZXNzaW9uLiBUaGlzIGluY2x1ZGVzIGFwcGxpY2F0aW9ucyBvZlxuICAvLyBvcGVyYXRvcnMgbGlrZSBgKz1gLlxuXG4gIHBwJDUucGFyc2VNYXliZUFzc2lnbiA9IGZ1bmN0aW9uKGZvckluaXQsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIGFmdGVyTGVmdFBhcnNlKSB7XG4gICAgaWYgKHRoaXMuaXNDb250ZXh0dWFsKFwieWllbGRcIikpIHtcbiAgICAgIGlmICh0aGlzLmluR2VuZXJhdG9yKSB7IHJldHVybiB0aGlzLnBhcnNlWWllbGQoZm9ySW5pdCkgfVxuICAgICAgLy8gVGhlIHRva2VuaXplciB3aWxsIGFzc3VtZSBhbiBleHByZXNzaW9uIGlzIGFsbG93ZWQgYWZ0ZXJcbiAgICAgIC8vIGB5aWVsZGAsIGJ1dCB0aGlzIGlzbid0IHRoYXQga2luZCBvZiB5aWVsZFxuICAgICAgZWxzZSB7IHRoaXMuZXhwckFsbG93ZWQgPSBmYWxzZTsgfVxuICAgIH1cblxuICAgIHZhciBvd25EZXN0cnVjdHVyaW5nRXJyb3JzID0gZmFsc2UsIG9sZFBhcmVuQXNzaWduID0gLTEsIG9sZFRyYWlsaW5nQ29tbWEgPSAtMSwgb2xkRG91YmxlUHJvdG8gPSAtMTtcbiAgICBpZiAocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykge1xuICAgICAgb2xkUGFyZW5Bc3NpZ24gPSByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnBhcmVudGhlc2l6ZWRBc3NpZ247XG4gICAgICBvbGRUcmFpbGluZ0NvbW1hID0gcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy50cmFpbGluZ0NvbW1hO1xuICAgICAgb2xkRG91YmxlUHJvdG8gPSByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLmRvdWJsZVByb3RvO1xuICAgICAgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5wYXJlbnRoZXNpemVkQXNzaWduID0gcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy50cmFpbGluZ0NvbW1hID0gLTE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMgPSBuZXcgRGVzdHJ1Y3R1cmluZ0Vycm9ycztcbiAgICAgIG93bkRlc3RydWN0dXJpbmdFcnJvcnMgPSB0cnVlO1xuICAgIH1cblxuICAgIHZhciBzdGFydFBvcyA9IHRoaXMuc3RhcnQsIHN0YXJ0TG9jID0gdGhpcy5zdGFydExvYztcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLnBhcmVuTCB8fCB0aGlzLnR5cGUgPT09IHR5cGVzJDEubmFtZSkge1xuICAgICAgdGhpcy5wb3RlbnRpYWxBcnJvd0F0ID0gdGhpcy5zdGFydDtcbiAgICAgIHRoaXMucG90ZW50aWFsQXJyb3dJbkZvckF3YWl0ID0gZm9ySW5pdCA9PT0gXCJhd2FpdFwiO1xuICAgIH1cbiAgICB2YXIgbGVmdCA9IHRoaXMucGFyc2VNYXliZUNvbmRpdGlvbmFsKGZvckluaXQsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpO1xuICAgIGlmIChhZnRlckxlZnRQYXJzZSkgeyBsZWZ0ID0gYWZ0ZXJMZWZ0UGFyc2UuY2FsbCh0aGlzLCBsZWZ0LCBzdGFydFBvcywgc3RhcnRMb2MpOyB9XG4gICAgaWYgKHRoaXMudHlwZS5pc0Fzc2lnbikge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyk7XG4gICAgICBub2RlLm9wZXJhdG9yID0gdGhpcy52YWx1ZTtcbiAgICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuZXEpXG4gICAgICAgIHsgbGVmdCA9IHRoaXMudG9Bc3NpZ25hYmxlKGxlZnQsIGZhbHNlLCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKTsgfVxuICAgICAgaWYgKCFvd25EZXN0cnVjdHVyaW5nRXJyb3JzKSB7XG4gICAgICAgIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMucGFyZW50aGVzaXplZEFzc2lnbiA9IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMudHJhaWxpbmdDb21tYSA9IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMuZG91YmxlUHJvdG8gPSAtMTtcbiAgICAgIH1cbiAgICAgIGlmIChyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnNob3J0aGFuZEFzc2lnbiA+PSBsZWZ0LnN0YXJ0KVxuICAgICAgICB7IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMuc2hvcnRoYW5kQXNzaWduID0gLTE7IH0gLy8gcmVzZXQgYmVjYXVzZSBzaG9ydGhhbmQgZGVmYXVsdCB3YXMgdXNlZCBjb3JyZWN0bHlcbiAgICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuZXEpXG4gICAgICAgIHsgdGhpcy5jaGVja0xWYWxQYXR0ZXJuKGxlZnQpOyB9XG4gICAgICBlbHNlXG4gICAgICAgIHsgdGhpcy5jaGVja0xWYWxTaW1wbGUobGVmdCk7IH1cbiAgICAgIG5vZGUubGVmdCA9IGxlZnQ7XG4gICAgICB0aGlzLm5leHQoKTtcbiAgICAgIG5vZGUucmlnaHQgPSB0aGlzLnBhcnNlTWF5YmVBc3NpZ24oZm9ySW5pdCk7XG4gICAgICBpZiAob2xkRG91YmxlUHJvdG8gPiAtMSkgeyByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLmRvdWJsZVByb3RvID0gb2xkRG91YmxlUHJvdG87IH1cbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob3duRGVzdHJ1Y3R1cmluZ0Vycm9ycykgeyB0aGlzLmNoZWNrRXhwcmVzc2lvbkVycm9ycyhyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCB0cnVlKTsgfVxuICAgIH1cbiAgICBpZiAob2xkUGFyZW5Bc3NpZ24gPiAtMSkgeyByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnBhcmVudGhlc2l6ZWRBc3NpZ24gPSBvbGRQYXJlbkFzc2lnbjsgfVxuICAgIGlmIChvbGRUcmFpbGluZ0NvbW1hID4gLTEpIHsgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy50cmFpbGluZ0NvbW1hID0gb2xkVHJhaWxpbmdDb21tYTsgfVxuICAgIHJldHVybiBsZWZ0XG4gIH07XG5cbiAgLy8gUGFyc2UgYSB0ZXJuYXJ5IGNvbmRpdGlvbmFsIChgPzpgKSBvcGVyYXRvci5cblxuICBwcCQ1LnBhcnNlTWF5YmVDb25kaXRpb25hbCA9IGZ1bmN0aW9uKGZvckluaXQsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpIHtcbiAgICB2YXIgc3RhcnRQb3MgPSB0aGlzLnN0YXJ0LCBzdGFydExvYyA9IHRoaXMuc3RhcnRMb2M7XG4gICAgdmFyIGV4cHIgPSB0aGlzLnBhcnNlRXhwck9wcyhmb3JJbml0LCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKTtcbiAgICBpZiAodGhpcy5jaGVja0V4cHJlc3Npb25FcnJvcnMocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykpIHsgcmV0dXJuIGV4cHIgfVxuICAgIGlmICh0aGlzLmVhdCh0eXBlcyQxLnF1ZXN0aW9uKSkge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyk7XG4gICAgICBub2RlLnRlc3QgPSBleHByO1xuICAgICAgbm9kZS5jb25zZXF1ZW50ID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKCk7XG4gICAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLmNvbG9uKTtcbiAgICAgIG5vZGUuYWx0ZXJuYXRlID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKGZvckluaXQpO1xuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwiKVxuICAgIH1cbiAgICByZXR1cm4gZXhwclxuICB9O1xuXG4gIC8vIFN0YXJ0IHRoZSBwcmVjZWRlbmNlIHBhcnNlci5cblxuICBwcCQ1LnBhcnNlRXhwck9wcyA9IGZ1bmN0aW9uKGZvckluaXQsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpIHtcbiAgICB2YXIgc3RhcnRQb3MgPSB0aGlzLnN0YXJ0LCBzdGFydExvYyA9IHRoaXMuc3RhcnRMb2M7XG4gICAgdmFyIGV4cHIgPSB0aGlzLnBhcnNlTWF5YmVVbmFyeShyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCBmYWxzZSwgZmFsc2UsIGZvckluaXQpO1xuICAgIGlmICh0aGlzLmNoZWNrRXhwcmVzc2lvbkVycm9ycyhyZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSkgeyByZXR1cm4gZXhwciB9XG4gICAgcmV0dXJuIGV4cHIuc3RhcnQgPT09IHN0YXJ0UG9zICYmIGV4cHIudHlwZSA9PT0gXCJBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvblwiID8gZXhwciA6IHRoaXMucGFyc2VFeHByT3AoZXhwciwgc3RhcnRQb3MsIHN0YXJ0TG9jLCAtMSwgZm9ySW5pdClcbiAgfTtcblxuICAvLyBQYXJzZSBiaW5hcnkgb3BlcmF0b3JzIHdpdGggdGhlIG9wZXJhdG9yIHByZWNlZGVuY2UgcGFyc2luZ1xuICAvLyBhbGdvcml0aG0uIGBsZWZ0YCBpcyB0aGUgbGVmdC1oYW5kIHNpZGUgb2YgdGhlIG9wZXJhdG9yLlxuICAvLyBgbWluUHJlY2AgcHJvdmlkZXMgY29udGV4dCB0aGF0IGFsbG93cyB0aGUgZnVuY3Rpb24gdG8gc3RvcCBhbmRcbiAgLy8gZGVmZXIgZnVydGhlciBwYXJzZXIgdG8gb25lIG9mIGl0cyBjYWxsZXJzIHdoZW4gaXQgZW5jb3VudGVycyBhblxuICAvLyBvcGVyYXRvciB0aGF0IGhhcyBhIGxvd2VyIHByZWNlZGVuY2UgdGhhbiB0aGUgc2V0IGl0IGlzIHBhcnNpbmcuXG5cbiAgcHAkNS5wYXJzZUV4cHJPcCA9IGZ1bmN0aW9uKGxlZnQsIGxlZnRTdGFydFBvcywgbGVmdFN0YXJ0TG9jLCBtaW5QcmVjLCBmb3JJbml0KSB7XG4gICAgdmFyIHByZWMgPSB0aGlzLnR5cGUuYmlub3A7XG4gICAgaWYgKHByZWMgIT0gbnVsbCAmJiAoIWZvckluaXQgfHwgdGhpcy50eXBlICE9PSB0eXBlcyQxLl9pbikpIHtcbiAgICAgIGlmIChwcmVjID4gbWluUHJlYykge1xuICAgICAgICB2YXIgbG9naWNhbCA9IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5sb2dpY2FsT1IgfHwgdGhpcy50eXBlID09PSB0eXBlcyQxLmxvZ2ljYWxBTkQ7XG4gICAgICAgIHZhciBjb2FsZXNjZSA9IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5jb2FsZXNjZTtcbiAgICAgICAgaWYgKGNvYWxlc2NlKSB7XG4gICAgICAgICAgLy8gSGFuZGxlIHRoZSBwcmVjZWRlbmNlIG9mIGB0dC5jb2FsZXNjZWAgYXMgZXF1YWwgdG8gdGhlIHJhbmdlIG9mIGxvZ2ljYWwgZXhwcmVzc2lvbnMuXG4gICAgICAgICAgLy8gSW4gb3RoZXIgd29yZHMsIGBub2RlLnJpZ2h0YCBzaG91bGRuJ3QgY29udGFpbiBsb2dpY2FsIGV4cHJlc3Npb25zIGluIG9yZGVyIHRvIGNoZWNrIHRoZSBtaXhlZCBlcnJvci5cbiAgICAgICAgICBwcmVjID0gdHlwZXMkMS5sb2dpY2FsQU5ELmJpbm9wO1xuICAgICAgICB9XG4gICAgICAgIHZhciBvcCA9IHRoaXMudmFsdWU7XG4gICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICB2YXIgc3RhcnRQb3MgPSB0aGlzLnN0YXJ0LCBzdGFydExvYyA9IHRoaXMuc3RhcnRMb2M7XG4gICAgICAgIHZhciByaWdodCA9IHRoaXMucGFyc2VFeHByT3AodGhpcy5wYXJzZU1heWJlVW5hcnkobnVsbCwgZmFsc2UsIGZhbHNlLCBmb3JJbml0KSwgc3RhcnRQb3MsIHN0YXJ0TG9jLCBwcmVjLCBmb3JJbml0KTtcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLmJ1aWxkQmluYXJ5KGxlZnRTdGFydFBvcywgbGVmdFN0YXJ0TG9jLCBsZWZ0LCByaWdodCwgb3AsIGxvZ2ljYWwgfHwgY29hbGVzY2UpO1xuICAgICAgICBpZiAoKGxvZ2ljYWwgJiYgdGhpcy50eXBlID09PSB0eXBlcyQxLmNvYWxlc2NlKSB8fCAoY29hbGVzY2UgJiYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5sb2dpY2FsT1IgfHwgdGhpcy50eXBlID09PSB0eXBlcyQxLmxvZ2ljYWxBTkQpKSkge1xuICAgICAgICAgIHRoaXMucmFpc2VSZWNvdmVyYWJsZSh0aGlzLnN0YXJ0LCBcIkxvZ2ljYWwgZXhwcmVzc2lvbnMgYW5kIGNvYWxlc2NlIGV4cHJlc3Npb25zIGNhbm5vdCBiZSBtaXhlZC4gV3JhcCBlaXRoZXIgYnkgcGFyZW50aGVzZXNcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFeHByT3Aobm9kZSwgbGVmdFN0YXJ0UG9zLCBsZWZ0U3RhcnRMb2MsIG1pblByZWMsIGZvckluaXQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsZWZ0XG4gIH07XG5cbiAgcHAkNS5idWlsZEJpbmFyeSA9IGZ1bmN0aW9uKHN0YXJ0UG9zLCBzdGFydExvYywgbGVmdCwgcmlnaHQsIG9wLCBsb2dpY2FsKSB7XG4gICAgaWYgKHJpZ2h0LnR5cGUgPT09IFwiUHJpdmF0ZUlkZW50aWZpZXJcIikgeyB0aGlzLnJhaXNlKHJpZ2h0LnN0YXJ0LCBcIlByaXZhdGUgaWRlbnRpZmllciBjYW4gb25seSBiZSBsZWZ0IHNpZGUgb2YgYmluYXJ5IGV4cHJlc3Npb25cIik7IH1cbiAgICB2YXIgbm9kZSA9IHRoaXMuc3RhcnROb2RlQXQoc3RhcnRQb3MsIHN0YXJ0TG9jKTtcbiAgICBub2RlLmxlZnQgPSBsZWZ0O1xuICAgIG5vZGUub3BlcmF0b3IgPSBvcDtcbiAgICBub2RlLnJpZ2h0ID0gcmlnaHQ7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBsb2dpY2FsID8gXCJMb2dpY2FsRXhwcmVzc2lvblwiIDogXCJCaW5hcnlFeHByZXNzaW9uXCIpXG4gIH07XG5cbiAgLy8gUGFyc2UgdW5hcnkgb3BlcmF0b3JzLCBib3RoIHByZWZpeCBhbmQgcG9zdGZpeC5cblxuICBwcCQ1LnBhcnNlTWF5YmVVbmFyeSA9IGZ1bmN0aW9uKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIHNhd1VuYXJ5LCBpbmNEZWMsIGZvckluaXQpIHtcbiAgICB2YXIgc3RhcnRQb3MgPSB0aGlzLnN0YXJ0LCBzdGFydExvYyA9IHRoaXMuc3RhcnRMb2MsIGV4cHI7XG4gICAgaWYgKHRoaXMuaXNDb250ZXh0dWFsKFwiYXdhaXRcIikgJiYgdGhpcy5jYW5Bd2FpdCkge1xuICAgICAgZXhwciA9IHRoaXMucGFyc2VBd2FpdChmb3JJbml0KTtcbiAgICAgIHNhd1VuYXJ5ID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMudHlwZS5wcmVmaXgpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKSwgdXBkYXRlID0gdGhpcy50eXBlID09PSB0eXBlcyQxLmluY0RlYztcbiAgICAgIG5vZGUub3BlcmF0b3IgPSB0aGlzLnZhbHVlO1xuICAgICAgbm9kZS5wcmVmaXggPSB0cnVlO1xuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICBub2RlLmFyZ3VtZW50ID0gdGhpcy5wYXJzZU1heWJlVW5hcnkobnVsbCwgdHJ1ZSwgdXBkYXRlLCBmb3JJbml0KTtcbiAgICAgIHRoaXMuY2hlY2tFeHByZXNzaW9uRXJyb3JzKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIHRydWUpO1xuICAgICAgaWYgKHVwZGF0ZSkgeyB0aGlzLmNoZWNrTFZhbFNpbXBsZShub2RlLmFyZ3VtZW50KTsgfVxuICAgICAgZWxzZSBpZiAodGhpcy5zdHJpY3QgJiYgbm9kZS5vcGVyYXRvciA9PT0gXCJkZWxldGVcIiAmJiBpc0xvY2FsVmFyaWFibGVBY2Nlc3Mobm9kZS5hcmd1bWVudCkpXG4gICAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKG5vZGUuc3RhcnQsIFwiRGVsZXRpbmcgbG9jYWwgdmFyaWFibGUgaW4gc3RyaWN0IG1vZGVcIik7IH1cbiAgICAgIGVsc2UgaWYgKG5vZGUub3BlcmF0b3IgPT09IFwiZGVsZXRlXCIgJiYgaXNQcml2YXRlRmllbGRBY2Nlc3Mobm9kZS5hcmd1bWVudCkpXG4gICAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKG5vZGUuc3RhcnQsIFwiUHJpdmF0ZSBmaWVsZHMgY2FuIG5vdCBiZSBkZWxldGVkXCIpOyB9XG4gICAgICBlbHNlIHsgc2F3VW5hcnkgPSB0cnVlOyB9XG4gICAgICBleHByID0gdGhpcy5maW5pc2hOb2RlKG5vZGUsIHVwZGF0ZSA/IFwiVXBkYXRlRXhwcmVzc2lvblwiIDogXCJVbmFyeUV4cHJlc3Npb25cIik7XG4gICAgfSBlbHNlIGlmICghc2F3VW5hcnkgJiYgdGhpcy50eXBlID09PSB0eXBlcyQxLnByaXZhdGVJZCkge1xuICAgICAgaWYgKChmb3JJbml0IHx8IHRoaXMucHJpdmF0ZU5hbWVTdGFjay5sZW5ndGggPT09IDApICYmIHRoaXMub3B0aW9ucy5jaGVja1ByaXZhdGVGaWVsZHMpIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgICAgIGV4cHIgPSB0aGlzLnBhcnNlUHJpdmF0ZUlkZW50KCk7XG4gICAgICAvLyBvbmx5IGNvdWxkIGJlIHByaXZhdGUgZmllbGRzIGluICdpbicsIHN1Y2ggYXMgI3ggaW4gb2JqXG4gICAgICBpZiAodGhpcy50eXBlICE9PSB0eXBlcyQxLl9pbikgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICBleHByID0gdGhpcy5wYXJzZUV4cHJTdWJzY3JpcHRzKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIGZvckluaXQpO1xuICAgICAgaWYgKHRoaXMuY2hlY2tFeHByZXNzaW9uRXJyb3JzKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpKSB7IHJldHVybiBleHByIH1cbiAgICAgIHdoaWxlICh0aGlzLnR5cGUucG9zdGZpeCAmJiAhdGhpcy5jYW5JbnNlcnRTZW1pY29sb24oKSkge1xuICAgICAgICB2YXIgbm9kZSQxID0gdGhpcy5zdGFydE5vZGVBdChzdGFydFBvcywgc3RhcnRMb2MpO1xuICAgICAgICBub2RlJDEub3BlcmF0b3IgPSB0aGlzLnZhbHVlO1xuICAgICAgICBub2RlJDEucHJlZml4ID0gZmFsc2U7XG4gICAgICAgIG5vZGUkMS5hcmd1bWVudCA9IGV4cHI7XG4gICAgICAgIHRoaXMuY2hlY2tMVmFsU2ltcGxlKGV4cHIpO1xuICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgZXhwciA9IHRoaXMuZmluaXNoTm9kZShub2RlJDEsIFwiVXBkYXRlRXhwcmVzc2lvblwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWluY0RlYyAmJiB0aGlzLmVhdCh0eXBlcyQxLnN0YXJzdGFyKSkge1xuICAgICAgaWYgKHNhd1VuYXJ5KVxuICAgICAgICB7IHRoaXMudW5leHBlY3RlZCh0aGlzLmxhc3RUb2tTdGFydCk7IH1cbiAgICAgIGVsc2VcbiAgICAgICAgeyByZXR1cm4gdGhpcy5idWlsZEJpbmFyeShzdGFydFBvcywgc3RhcnRMb2MsIGV4cHIsIHRoaXMucGFyc2VNYXliZVVuYXJ5KG51bGwsIGZhbHNlLCBmYWxzZSwgZm9ySW5pdCksIFwiKipcIiwgZmFsc2UpIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGV4cHJcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gaXNMb2NhbFZhcmlhYmxlQWNjZXNzKG5vZGUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgbm9kZS50eXBlID09PSBcIklkZW50aWZpZXJcIiB8fFxuICAgICAgbm9kZS50eXBlID09PSBcIlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uXCIgJiYgaXNMb2NhbFZhcmlhYmxlQWNjZXNzKG5vZGUuZXhwcmVzc2lvbilcbiAgICApXG4gIH1cblxuICBmdW5jdGlvbiBpc1ByaXZhdGVGaWVsZEFjY2Vzcyhub2RlKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIG5vZGUudHlwZSA9PT0gXCJNZW1iZXJFeHByZXNzaW9uXCIgJiYgbm9kZS5wcm9wZXJ0eS50eXBlID09PSBcIlByaXZhdGVJZGVudGlmaWVyXCIgfHxcbiAgICAgIG5vZGUudHlwZSA9PT0gXCJDaGFpbkV4cHJlc3Npb25cIiAmJiBpc1ByaXZhdGVGaWVsZEFjY2Vzcyhub2RlLmV4cHJlc3Npb24pIHx8XG4gICAgICBub2RlLnR5cGUgPT09IFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIiAmJiBpc1ByaXZhdGVGaWVsZEFjY2Vzcyhub2RlLmV4cHJlc3Npb24pXG4gICAgKVxuICB9XG5cbiAgLy8gUGFyc2UgY2FsbCwgZG90LCBhbmQgYFtdYC1zdWJzY3JpcHQgZXhwcmVzc2lvbnMuXG5cbiAgcHAkNS5wYXJzZUV4cHJTdWJzY3JpcHRzID0gZnVuY3Rpb24ocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycywgZm9ySW5pdCkge1xuICAgIHZhciBzdGFydFBvcyA9IHRoaXMuc3RhcnQsIHN0YXJ0TG9jID0gdGhpcy5zdGFydExvYztcbiAgICB2YXIgZXhwciA9IHRoaXMucGFyc2VFeHByQXRvbShyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCBmb3JJbml0KTtcbiAgICBpZiAoZXhwci50eXBlID09PSBcIkFycm93RnVuY3Rpb25FeHByZXNzaW9uXCIgJiYgdGhpcy5pbnB1dC5zbGljZSh0aGlzLmxhc3RUb2tTdGFydCwgdGhpcy5sYXN0VG9rRW5kKSAhPT0gXCIpXCIpXG4gICAgICB7IHJldHVybiBleHByIH1cbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5wYXJzZVN1YnNjcmlwdHMoZXhwciwgc3RhcnRQb3MsIHN0YXJ0TG9jLCBmYWxzZSwgZm9ySW5pdCk7XG4gICAgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMgJiYgcmVzdWx0LnR5cGUgPT09IFwiTWVtYmVyRXhwcmVzc2lvblwiKSB7XG4gICAgICBpZiAocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5wYXJlbnRoZXNpemVkQXNzaWduID49IHJlc3VsdC5zdGFydCkgeyByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnBhcmVudGhlc2l6ZWRBc3NpZ24gPSAtMTsgfVxuICAgICAgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMucGFyZW50aGVzaXplZEJpbmQgPj0gcmVzdWx0LnN0YXJ0KSB7IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMucGFyZW50aGVzaXplZEJpbmQgPSAtMTsgfVxuICAgICAgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMudHJhaWxpbmdDb21tYSA+PSByZXN1bHQuc3RhcnQpIHsgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy50cmFpbGluZ0NvbW1hID0gLTE7IH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9O1xuXG4gIHBwJDUucGFyc2VTdWJzY3JpcHRzID0gZnVuY3Rpb24oYmFzZSwgc3RhcnRQb3MsIHN0YXJ0TG9jLCBub0NhbGxzLCBmb3JJbml0KSB7XG4gICAgdmFyIG1heWJlQXN5bmNBcnJvdyA9IHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA4ICYmIGJhc2UudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgJiYgYmFzZS5uYW1lID09PSBcImFzeW5jXCIgJiZcbiAgICAgICAgdGhpcy5sYXN0VG9rRW5kID09PSBiYXNlLmVuZCAmJiAhdGhpcy5jYW5JbnNlcnRTZW1pY29sb24oKSAmJiBiYXNlLmVuZCAtIGJhc2Uuc3RhcnQgPT09IDUgJiZcbiAgICAgICAgdGhpcy5wb3RlbnRpYWxBcnJvd0F0ID09PSBiYXNlLnN0YXJ0O1xuICAgIHZhciBvcHRpb25hbENoYWluZWQgPSBmYWxzZTtcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICB2YXIgZWxlbWVudCA9IHRoaXMucGFyc2VTdWJzY3JpcHQoYmFzZSwgc3RhcnRQb3MsIHN0YXJ0TG9jLCBub0NhbGxzLCBtYXliZUFzeW5jQXJyb3csIG9wdGlvbmFsQ2hhaW5lZCwgZm9ySW5pdCk7XG5cbiAgICAgIGlmIChlbGVtZW50Lm9wdGlvbmFsKSB7IG9wdGlvbmFsQ2hhaW5lZCA9IHRydWU7IH1cbiAgICAgIGlmIChlbGVtZW50ID09PSBiYXNlIHx8IGVsZW1lbnQudHlwZSA9PT0gXCJBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvblwiKSB7XG4gICAgICAgIGlmIChvcHRpb25hbENoYWluZWQpIHtcbiAgICAgICAgICB2YXIgY2hhaW5Ob2RlID0gdGhpcy5zdGFydE5vZGVBdChzdGFydFBvcywgc3RhcnRMb2MpO1xuICAgICAgICAgIGNoYWluTm9kZS5leHByZXNzaW9uID0gZWxlbWVudDtcbiAgICAgICAgICBlbGVtZW50ID0gdGhpcy5maW5pc2hOb2RlKGNoYWluTm9kZSwgXCJDaGFpbkV4cHJlc3Npb25cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsZW1lbnRcbiAgICAgIH1cblxuICAgICAgYmFzZSA9IGVsZW1lbnQ7XG4gICAgfVxuICB9O1xuXG4gIHBwJDUuc2hvdWxkUGFyc2VBc3luY0Fycm93ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICF0aGlzLmNhbkluc2VydFNlbWljb2xvbigpICYmIHRoaXMuZWF0KHR5cGVzJDEuYXJyb3cpXG4gIH07XG5cbiAgcHAkNS5wYXJzZVN1YnNjcmlwdEFzeW5jQXJyb3cgPSBmdW5jdGlvbihzdGFydFBvcywgc3RhcnRMb2MsIGV4cHJMaXN0LCBmb3JJbml0KSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VBcnJvd0V4cHJlc3Npb24odGhpcy5zdGFydE5vZGVBdChzdGFydFBvcywgc3RhcnRMb2MpLCBleHByTGlzdCwgdHJ1ZSwgZm9ySW5pdClcbiAgfTtcblxuICBwcCQ1LnBhcnNlU3Vic2NyaXB0ID0gZnVuY3Rpb24oYmFzZSwgc3RhcnRQb3MsIHN0YXJ0TG9jLCBub0NhbGxzLCBtYXliZUFzeW5jQXJyb3csIG9wdGlvbmFsQ2hhaW5lZCwgZm9ySW5pdCkge1xuICAgIHZhciBvcHRpb25hbFN1cHBvcnRlZCA9IHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSAxMTtcbiAgICB2YXIgb3B0aW9uYWwgPSBvcHRpb25hbFN1cHBvcnRlZCAmJiB0aGlzLmVhdCh0eXBlcyQxLnF1ZXN0aW9uRG90KTtcbiAgICBpZiAobm9DYWxscyAmJiBvcHRpb25hbCkgeyB0aGlzLnJhaXNlKHRoaXMubGFzdFRva1N0YXJ0LCBcIk9wdGlvbmFsIGNoYWluaW5nIGNhbm5vdCBhcHBlYXIgaW4gdGhlIGNhbGxlZSBvZiBuZXcgZXhwcmVzc2lvbnNcIik7IH1cblxuICAgIHZhciBjb21wdXRlZCA9IHRoaXMuZWF0KHR5cGVzJDEuYnJhY2tldEwpO1xuICAgIGlmIChjb21wdXRlZCB8fCAob3B0aW9uYWwgJiYgdGhpcy50eXBlICE9PSB0eXBlcyQxLnBhcmVuTCAmJiB0aGlzLnR5cGUgIT09IHR5cGVzJDEuYmFja1F1b3RlKSB8fCB0aGlzLmVhdCh0eXBlcyQxLmRvdCkpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGVBdChzdGFydFBvcywgc3RhcnRMb2MpO1xuICAgICAgbm9kZS5vYmplY3QgPSBiYXNlO1xuICAgICAgaWYgKGNvbXB1dGVkKSB7XG4gICAgICAgIG5vZGUucHJvcGVydHkgPSB0aGlzLnBhcnNlRXhwcmVzc2lvbigpO1xuICAgICAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLmJyYWNrZXRSKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLnByaXZhdGVJZCAmJiBiYXNlLnR5cGUgIT09IFwiU3VwZXJcIikge1xuICAgICAgICBub2RlLnByb3BlcnR5ID0gdGhpcy5wYXJzZVByaXZhdGVJZGVudCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5wcm9wZXJ0eSA9IHRoaXMucGFyc2VJZGVudCh0aGlzLm9wdGlvbnMuYWxsb3dSZXNlcnZlZCAhPT0gXCJuZXZlclwiKTtcbiAgICAgIH1cbiAgICAgIG5vZGUuY29tcHV0ZWQgPSAhIWNvbXB1dGVkO1xuICAgICAgaWYgKG9wdGlvbmFsU3VwcG9ydGVkKSB7XG4gICAgICAgIG5vZGUub3B0aW9uYWwgPSBvcHRpb25hbDtcbiAgICAgIH1cbiAgICAgIGJhc2UgPSB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJNZW1iZXJFeHByZXNzaW9uXCIpO1xuICAgIH0gZWxzZSBpZiAoIW5vQ2FsbHMgJiYgdGhpcy5lYXQodHlwZXMkMS5wYXJlbkwpKSB7XG4gICAgICB2YXIgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyA9IG5ldyBEZXN0cnVjdHVyaW5nRXJyb3JzLCBvbGRZaWVsZFBvcyA9IHRoaXMueWllbGRQb3MsIG9sZEF3YWl0UG9zID0gdGhpcy5hd2FpdFBvcywgb2xkQXdhaXRJZGVudFBvcyA9IHRoaXMuYXdhaXRJZGVudFBvcztcbiAgICAgIHRoaXMueWllbGRQb3MgPSAwO1xuICAgICAgdGhpcy5hd2FpdFBvcyA9IDA7XG4gICAgICB0aGlzLmF3YWl0SWRlbnRQb3MgPSAwO1xuICAgICAgdmFyIGV4cHJMaXN0ID0gdGhpcy5wYXJzZUV4cHJMaXN0KHR5cGVzJDEucGFyZW5SLCB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOCwgZmFsc2UsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpO1xuICAgICAgaWYgKG1heWJlQXN5bmNBcnJvdyAmJiAhb3B0aW9uYWwgJiYgdGhpcy5zaG91bGRQYXJzZUFzeW5jQXJyb3coKSkge1xuICAgICAgICB0aGlzLmNoZWNrUGF0dGVybkVycm9ycyhyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuY2hlY2tZaWVsZEF3YWl0SW5EZWZhdWx0UGFyYW1zKCk7XG4gICAgICAgIGlmICh0aGlzLmF3YWl0SWRlbnRQb3MgPiAwKVxuICAgICAgICAgIHsgdGhpcy5yYWlzZSh0aGlzLmF3YWl0SWRlbnRQb3MsIFwiQ2Fubm90IHVzZSAnYXdhaXQnIGFzIGlkZW50aWZpZXIgaW5zaWRlIGFuIGFzeW5jIGZ1bmN0aW9uXCIpOyB9XG4gICAgICAgIHRoaXMueWllbGRQb3MgPSBvbGRZaWVsZFBvcztcbiAgICAgICAgdGhpcy5hd2FpdFBvcyA9IG9sZEF3YWl0UG9zO1xuICAgICAgICB0aGlzLmF3YWl0SWRlbnRQb3MgPSBvbGRBd2FpdElkZW50UG9zO1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVN1YnNjcmlwdEFzeW5jQXJyb3coc3RhcnRQb3MsIHN0YXJ0TG9jLCBleHByTGlzdCwgZm9ySW5pdClcbiAgICAgIH1cbiAgICAgIHRoaXMuY2hlY2tFeHByZXNzaW9uRXJyb3JzKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIHRydWUpO1xuICAgICAgdGhpcy55aWVsZFBvcyA9IG9sZFlpZWxkUG9zIHx8IHRoaXMueWllbGRQb3M7XG4gICAgICB0aGlzLmF3YWl0UG9zID0gb2xkQXdhaXRQb3MgfHwgdGhpcy5hd2FpdFBvcztcbiAgICAgIHRoaXMuYXdhaXRJZGVudFBvcyA9IG9sZEF3YWl0SWRlbnRQb3MgfHwgdGhpcy5hd2FpdElkZW50UG9zO1xuICAgICAgdmFyIG5vZGUkMSA9IHRoaXMuc3RhcnROb2RlQXQoc3RhcnRQb3MsIHN0YXJ0TG9jKTtcbiAgICAgIG5vZGUkMS5jYWxsZWUgPSBiYXNlO1xuICAgICAgbm9kZSQxLmFyZ3VtZW50cyA9IGV4cHJMaXN0O1xuICAgICAgaWYgKG9wdGlvbmFsU3VwcG9ydGVkKSB7XG4gICAgICAgIG5vZGUkMS5vcHRpb25hbCA9IG9wdGlvbmFsO1xuICAgICAgfVxuICAgICAgYmFzZSA9IHRoaXMuZmluaXNoTm9kZShub2RlJDEsIFwiQ2FsbEV4cHJlc3Npb25cIik7XG4gICAgfSBlbHNlIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuYmFja1F1b3RlKSB7XG4gICAgICBpZiAob3B0aW9uYWwgfHwgb3B0aW9uYWxDaGFpbmVkKSB7XG4gICAgICAgIHRoaXMucmFpc2UodGhpcy5zdGFydCwgXCJPcHRpb25hbCBjaGFpbmluZyBjYW5ub3QgYXBwZWFyIGluIHRoZSB0YWcgb2YgdGFnZ2VkIHRlbXBsYXRlIGV4cHJlc3Npb25zXCIpO1xuICAgICAgfVxuICAgICAgdmFyIG5vZGUkMiA9IHRoaXMuc3RhcnROb2RlQXQoc3RhcnRQb3MsIHN0YXJ0TG9jKTtcbiAgICAgIG5vZGUkMi50YWcgPSBiYXNlO1xuICAgICAgbm9kZSQyLnF1YXNpID0gdGhpcy5wYXJzZVRlbXBsYXRlKHtpc1RhZ2dlZDogdHJ1ZX0pO1xuICAgICAgYmFzZSA9IHRoaXMuZmluaXNoTm9kZShub2RlJDIsIFwiVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uXCIpO1xuICAgIH1cbiAgICByZXR1cm4gYmFzZVxuICB9O1xuXG4gIC8vIFBhcnNlIGFuIGF0b21pYyBleHByZXNzaW9uIOKAlCBlaXRoZXIgYSBzaW5nbGUgdG9rZW4gdGhhdCBpcyBhblxuICAvLyBleHByZXNzaW9uLCBhbiBleHByZXNzaW9uIHN0YXJ0ZWQgYnkgYSBrZXl3b3JkIGxpa2UgYGZ1bmN0aW9uYCBvclxuICAvLyBgbmV3YCwgb3IgYW4gZXhwcmVzc2lvbiB3cmFwcGVkIGluIHB1bmN0dWF0aW9uIGxpa2UgYCgpYCwgYFtdYCxcbiAgLy8gb3IgYHt9YC5cblxuICBwcCQ1LnBhcnNlRXhwckF0b20gPSBmdW5jdGlvbihyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCBmb3JJbml0LCBmb3JOZXcpIHtcbiAgICAvLyBJZiBhIGRpdmlzaW9uIG9wZXJhdG9yIGFwcGVhcnMgaW4gYW4gZXhwcmVzc2lvbiBwb3NpdGlvbiwgdGhlXG4gICAgLy8gdG9rZW5pemVyIGdvdCBjb25mdXNlZCwgYW5kIHdlIGZvcmNlIGl0IHRvIHJlYWQgYSByZWdleHAgaW5zdGVhZC5cbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLnNsYXNoKSB7IHRoaXMucmVhZFJlZ2V4cCgpOyB9XG5cbiAgICB2YXIgbm9kZSwgY2FuQmVBcnJvdyA9IHRoaXMucG90ZW50aWFsQXJyb3dBdCA9PT0gdGhpcy5zdGFydDtcbiAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgIGNhc2UgdHlwZXMkMS5fc3VwZXI6XG4gICAgICBpZiAoIXRoaXMuYWxsb3dTdXBlcilcbiAgICAgICAgeyB0aGlzLnJhaXNlKHRoaXMuc3RhcnQsIFwiJ3N1cGVyJyBrZXl3b3JkIG91dHNpZGUgYSBtZXRob2RcIik7IH1cbiAgICAgIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLnBhcmVuTCAmJiAhdGhpcy5hbGxvd0RpcmVjdFN1cGVyKVxuICAgICAgICB7IHRoaXMucmFpc2Uobm9kZS5zdGFydCwgXCJzdXBlcigpIGNhbGwgb3V0c2lkZSBjb25zdHJ1Y3RvciBvZiBhIHN1YmNsYXNzXCIpOyB9XG4gICAgICAvLyBUaGUgYHN1cGVyYCBrZXl3b3JkIGNhbiBhcHBlYXIgYXQgYmVsb3c6XG4gICAgICAvLyBTdXBlclByb3BlcnR5OlxuICAgICAgLy8gICAgIHN1cGVyIFsgRXhwcmVzc2lvbiBdXG4gICAgICAvLyAgICAgc3VwZXIgLiBJZGVudGlmaWVyTmFtZVxuICAgICAgLy8gU3VwZXJDYWxsOlxuICAgICAgLy8gICAgIHN1cGVyICggQXJndW1lbnRzIClcbiAgICAgIGlmICh0aGlzLnR5cGUgIT09IHR5cGVzJDEuZG90ICYmIHRoaXMudHlwZSAhPT0gdHlwZXMkMS5icmFja2V0TCAmJiB0aGlzLnR5cGUgIT09IHR5cGVzJDEucGFyZW5MKVxuICAgICAgICB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiU3VwZXJcIilcblxuICAgIGNhc2UgdHlwZXMkMS5fdGhpczpcbiAgICAgIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiVGhpc0V4cHJlc3Npb25cIilcblxuICAgIGNhc2UgdHlwZXMkMS5uYW1lOlxuICAgICAgdmFyIHN0YXJ0UG9zID0gdGhpcy5zdGFydCwgc3RhcnRMb2MgPSB0aGlzLnN0YXJ0TG9jLCBjb250YWluc0VzYyA9IHRoaXMuY29udGFpbnNFc2M7XG4gICAgICB2YXIgaWQgPSB0aGlzLnBhcnNlSWRlbnQoZmFsc2UpO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA4ICYmICFjb250YWluc0VzYyAmJiBpZC5uYW1lID09PSBcImFzeW5jXCIgJiYgIXRoaXMuY2FuSW5zZXJ0U2VtaWNvbG9uKCkgJiYgdGhpcy5lYXQodHlwZXMkMS5fZnVuY3Rpb24pKSB7XG4gICAgICAgIHRoaXMub3ZlcnJpZGVDb250ZXh0KHR5cGVzLmZfZXhwcik7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlRnVuY3Rpb24odGhpcy5zdGFydE5vZGVBdChzdGFydFBvcywgc3RhcnRMb2MpLCAwLCBmYWxzZSwgdHJ1ZSwgZm9ySW5pdClcbiAgICAgIH1cbiAgICAgIGlmIChjYW5CZUFycm93ICYmICF0aGlzLmNhbkluc2VydFNlbWljb2xvbigpKSB7XG4gICAgICAgIGlmICh0aGlzLmVhdCh0eXBlcyQxLmFycm93KSlcbiAgICAgICAgICB7IHJldHVybiB0aGlzLnBhcnNlQXJyb3dFeHByZXNzaW9uKHRoaXMuc3RhcnROb2RlQXQoc3RhcnRQb3MsIHN0YXJ0TG9jKSwgW2lkXSwgZmFsc2UsIGZvckluaXQpIH1cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA4ICYmIGlkLm5hbWUgPT09IFwiYXN5bmNcIiAmJiB0aGlzLnR5cGUgPT09IHR5cGVzJDEubmFtZSAmJiAhY29udGFpbnNFc2MgJiZcbiAgICAgICAgICAgICghdGhpcy5wb3RlbnRpYWxBcnJvd0luRm9yQXdhaXQgfHwgdGhpcy52YWx1ZSAhPT0gXCJvZlwiIHx8IHRoaXMuY29udGFpbnNFc2MpKSB7XG4gICAgICAgICAgaWQgPSB0aGlzLnBhcnNlSWRlbnQoZmFsc2UpO1xuICAgICAgICAgIGlmICh0aGlzLmNhbkluc2VydFNlbWljb2xvbigpIHx8ICF0aGlzLmVhdCh0eXBlcyQxLmFycm93KSlcbiAgICAgICAgICAgIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUFycm93RXhwcmVzc2lvbih0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyksIFtpZF0sIHRydWUsIGZvckluaXQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBpZFxuXG4gICAgY2FzZSB0eXBlcyQxLnJlZ2V4cDpcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICBub2RlID0gdGhpcy5wYXJzZUxpdGVyYWwodmFsdWUudmFsdWUpO1xuICAgICAgbm9kZS5yZWdleCA9IHtwYXR0ZXJuOiB2YWx1ZS5wYXR0ZXJuLCBmbGFnczogdmFsdWUuZmxhZ3N9O1xuICAgICAgcmV0dXJuIG5vZGVcblxuICAgIGNhc2UgdHlwZXMkMS5udW06IGNhc2UgdHlwZXMkMS5zdHJpbmc6XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUxpdGVyYWwodGhpcy52YWx1ZSlcblxuICAgIGNhc2UgdHlwZXMkMS5fbnVsbDogY2FzZSB0eXBlcyQxLl90cnVlOiBjYXNlIHR5cGVzJDEuX2ZhbHNlOlxuICAgICAgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgICBub2RlLnZhbHVlID0gdGhpcy50eXBlID09PSB0eXBlcyQxLl9udWxsID8gbnVsbCA6IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5fdHJ1ZTtcbiAgICAgIG5vZGUucmF3ID0gdGhpcy50eXBlLmtleXdvcmQ7XG4gICAgICB0aGlzLm5leHQoKTtcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJMaXRlcmFsXCIpXG5cbiAgICBjYXNlIHR5cGVzJDEucGFyZW5MOlxuICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5zdGFydCwgZXhwciA9IHRoaXMucGFyc2VQYXJlbkFuZERpc3Rpbmd1aXNoRXhwcmVzc2lvbihjYW5CZUFycm93LCBmb3JJbml0KTtcbiAgICAgIGlmIChyZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSB7XG4gICAgICAgIGlmIChyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnBhcmVudGhlc2l6ZWRBc3NpZ24gPCAwICYmICF0aGlzLmlzU2ltcGxlQXNzaWduVGFyZ2V0KGV4cHIpKVxuICAgICAgICAgIHsgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5wYXJlbnRoZXNpemVkQXNzaWduID0gc3RhcnQ7IH1cbiAgICAgICAgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMucGFyZW50aGVzaXplZEJpbmQgPCAwKVxuICAgICAgICAgIHsgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5wYXJlbnRoZXNpemVkQmluZCA9IHN0YXJ0OyB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZXhwclxuXG4gICAgY2FzZSB0eXBlcyQxLmJyYWNrZXRMOlxuICAgICAgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgICB0aGlzLm5leHQoKTtcbiAgICAgIG5vZGUuZWxlbWVudHMgPSB0aGlzLnBhcnNlRXhwckxpc3QodHlwZXMkMS5icmFja2V0UiwgdHJ1ZSwgdHJ1ZSwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyk7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiQXJyYXlFeHByZXNzaW9uXCIpXG5cbiAgICBjYXNlIHR5cGVzJDEuYnJhY2VMOlxuICAgICAgdGhpcy5vdmVycmlkZUNvbnRleHQodHlwZXMuYl9leHByKTtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlT2JqKGZhbHNlLCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKVxuXG4gICAgY2FzZSB0eXBlcyQxLl9mdW5jdGlvbjpcbiAgICAgIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUZ1bmN0aW9uKG5vZGUsIDApXG5cbiAgICBjYXNlIHR5cGVzJDEuX2NsYXNzOlxuICAgICAgcmV0dXJuIHRoaXMucGFyc2VDbGFzcyh0aGlzLnN0YXJ0Tm9kZSgpLCBmYWxzZSlcblxuICAgIGNhc2UgdHlwZXMkMS5fbmV3OlxuICAgICAgcmV0dXJuIHRoaXMucGFyc2VOZXcoKVxuXG4gICAgY2FzZSB0eXBlcyQxLmJhY2tRdW90ZTpcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlVGVtcGxhdGUoKVxuXG4gICAgY2FzZSB0eXBlcyQxLl9pbXBvcnQ6XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDExKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlRXhwckltcG9ydChmb3JOZXcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy51bmV4cGVjdGVkKClcbiAgICAgIH1cblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUV4cHJBdG9tRGVmYXVsdCgpXG4gICAgfVxuICB9O1xuXG4gIHBwJDUucGFyc2VFeHByQXRvbURlZmF1bHQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnVuZXhwZWN0ZWQoKTtcbiAgfTtcblxuICBwcCQ1LnBhcnNlRXhwckltcG9ydCA9IGZ1bmN0aW9uKGZvck5ldykge1xuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcblxuICAgIC8vIENvbnN1bWUgYGltcG9ydGAgYXMgYW4gaWRlbnRpZmllciBmb3IgYGltcG9ydC5tZXRhYC5cbiAgICAvLyBCZWNhdXNlIGB0aGlzLnBhcnNlSWRlbnQodHJ1ZSlgIGRvZXNuJ3QgY2hlY2sgZXNjYXBlIHNlcXVlbmNlcywgaXQgbmVlZHMgdGhlIGNoZWNrIG9mIGB0aGlzLmNvbnRhaW5zRXNjYC5cbiAgICBpZiAodGhpcy5jb250YWluc0VzYykgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodGhpcy5zdGFydCwgXCJFc2NhcGUgc2VxdWVuY2UgaW4ga2V5d29yZCBpbXBvcnRcIik7IH1cbiAgICB0aGlzLm5leHQoKTtcblxuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEucGFyZW5MICYmICFmb3JOZXcpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlRHluYW1pY0ltcG9ydChub2RlKVxuICAgIH0gZWxzZSBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLmRvdCkge1xuICAgICAgdmFyIG1ldGEgPSB0aGlzLnN0YXJ0Tm9kZUF0KG5vZGUuc3RhcnQsIG5vZGUubG9jICYmIG5vZGUubG9jLnN0YXJ0KTtcbiAgICAgIG1ldGEubmFtZSA9IFwiaW1wb3J0XCI7XG4gICAgICBub2RlLm1ldGEgPSB0aGlzLmZpbmlzaE5vZGUobWV0YSwgXCJJZGVudGlmaWVyXCIpO1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VJbXBvcnRNZXRhKG5vZGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudW5leHBlY3RlZCgpO1xuICAgIH1cbiAgfTtcblxuICBwcCQ1LnBhcnNlRHluYW1pY0ltcG9ydCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB0aGlzLm5leHQoKTsgLy8gc2tpcCBgKGBcblxuICAgIC8vIFBhcnNlIG5vZGUuc291cmNlLlxuICAgIG5vZGUuc291cmNlID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKCk7XG5cbiAgICAvLyBWZXJpZnkgZW5kaW5nLlxuICAgIGlmICghdGhpcy5lYXQodHlwZXMkMS5wYXJlblIpKSB7XG4gICAgICB2YXIgZXJyb3JQb3MgPSB0aGlzLnN0YXJ0O1xuICAgICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuY29tbWEpICYmIHRoaXMuZWF0KHR5cGVzJDEucGFyZW5SKSkge1xuICAgICAgICB0aGlzLnJhaXNlUmVjb3ZlcmFibGUoZXJyb3JQb3MsIFwiVHJhaWxpbmcgY29tbWEgaXMgbm90IGFsbG93ZWQgaW4gaW1wb3J0KClcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVuZXhwZWN0ZWQoZXJyb3JQb3MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJJbXBvcnRFeHByZXNzaW9uXCIpXG4gIH07XG5cbiAgcHAkNS5wYXJzZUltcG9ydE1ldGEgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdGhpcy5uZXh0KCk7IC8vIHNraXAgYC5gXG5cbiAgICB2YXIgY29udGFpbnNFc2MgPSB0aGlzLmNvbnRhaW5zRXNjO1xuICAgIG5vZGUucHJvcGVydHkgPSB0aGlzLnBhcnNlSWRlbnQodHJ1ZSk7XG5cbiAgICBpZiAobm9kZS5wcm9wZXJ0eS5uYW1lICE9PSBcIm1ldGFcIilcbiAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKG5vZGUucHJvcGVydHkuc3RhcnQsIFwiVGhlIG9ubHkgdmFsaWQgbWV0YSBwcm9wZXJ0eSBmb3IgaW1wb3J0IGlzICdpbXBvcnQubWV0YSdcIik7IH1cbiAgICBpZiAoY29udGFpbnNFc2MpXG4gICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShub2RlLnN0YXJ0LCBcIidpbXBvcnQubWV0YScgbXVzdCBub3QgY29udGFpbiBlc2NhcGVkIGNoYXJhY3RlcnNcIik7IH1cbiAgICBpZiAodGhpcy5vcHRpb25zLnNvdXJjZVR5cGUgIT09IFwibW9kdWxlXCIgJiYgIXRoaXMub3B0aW9ucy5hbGxvd0ltcG9ydEV4cG9ydEV2ZXJ5d2hlcmUpXG4gICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShub2RlLnN0YXJ0LCBcIkNhbm5vdCB1c2UgJ2ltcG9ydC5tZXRhJyBvdXRzaWRlIGEgbW9kdWxlXCIpOyB9XG5cbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiTWV0YVByb3BlcnR5XCIpXG4gIH07XG5cbiAgcHAkNS5wYXJzZUxpdGVyYWwgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICBub2RlLnZhbHVlID0gdmFsdWU7XG4gICAgbm9kZS5yYXcgPSB0aGlzLmlucHV0LnNsaWNlKHRoaXMuc3RhcnQsIHRoaXMuZW5kKTtcbiAgICBpZiAobm9kZS5yYXcuY2hhckNvZGVBdChub2RlLnJhdy5sZW5ndGggLSAxKSA9PT0gMTEwKSB7IG5vZGUuYmlnaW50ID0gbm9kZS5yYXcuc2xpY2UoMCwgLTEpLnJlcGxhY2UoL18vZywgXCJcIik7IH1cbiAgICB0aGlzLm5leHQoKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiTGl0ZXJhbFwiKVxuICB9O1xuXG4gIHBwJDUucGFyc2VQYXJlbkV4cHJlc3Npb24gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLnBhcmVuTCk7XG4gICAgdmFyIHZhbCA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgdGhpcy5leHBlY3QodHlwZXMkMS5wYXJlblIpO1xuICAgIHJldHVybiB2YWxcbiAgfTtcblxuICBwcCQ1LnNob3VsZFBhcnNlQXJyb3cgPSBmdW5jdGlvbihleHByTGlzdCkge1xuICAgIHJldHVybiAhdGhpcy5jYW5JbnNlcnRTZW1pY29sb24oKVxuICB9O1xuXG4gIHBwJDUucGFyc2VQYXJlbkFuZERpc3Rpbmd1aXNoRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKGNhbkJlQXJyb3csIGZvckluaXQpIHtcbiAgICB2YXIgc3RhcnRQb3MgPSB0aGlzLnN0YXJ0LCBzdGFydExvYyA9IHRoaXMuc3RhcnRMb2MsIHZhbCwgYWxsb3dUcmFpbGluZ0NvbW1hID0gdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDg7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2KSB7XG4gICAgICB0aGlzLm5leHQoKTtcblxuICAgICAgdmFyIGlubmVyU3RhcnRQb3MgPSB0aGlzLnN0YXJ0LCBpbm5lclN0YXJ0TG9jID0gdGhpcy5zdGFydExvYztcbiAgICAgIHZhciBleHByTGlzdCA9IFtdLCBmaXJzdCA9IHRydWUsIGxhc3RJc0NvbW1hID0gZmFsc2U7XG4gICAgICB2YXIgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyA9IG5ldyBEZXN0cnVjdHVyaW5nRXJyb3JzLCBvbGRZaWVsZFBvcyA9IHRoaXMueWllbGRQb3MsIG9sZEF3YWl0UG9zID0gdGhpcy5hd2FpdFBvcywgc3ByZWFkU3RhcnQ7XG4gICAgICB0aGlzLnlpZWxkUG9zID0gMDtcbiAgICAgIHRoaXMuYXdhaXRQb3MgPSAwO1xuICAgICAgLy8gRG8gbm90IHNhdmUgYXdhaXRJZGVudFBvcyB0byBhbGxvdyBjaGVja2luZyBhd2FpdHMgbmVzdGVkIGluIHBhcmFtZXRlcnNcbiAgICAgIHdoaWxlICh0aGlzLnR5cGUgIT09IHR5cGVzJDEucGFyZW5SKSB7XG4gICAgICAgIGZpcnN0ID8gZmlyc3QgPSBmYWxzZSA6IHRoaXMuZXhwZWN0KHR5cGVzJDEuY29tbWEpO1xuICAgICAgICBpZiAoYWxsb3dUcmFpbGluZ0NvbW1hICYmIHRoaXMuYWZ0ZXJUcmFpbGluZ0NvbW1hKHR5cGVzJDEucGFyZW5SLCB0cnVlKSkge1xuICAgICAgICAgIGxhc3RJc0NvbW1hID0gdHJ1ZTtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5lbGxpcHNpcykge1xuICAgICAgICAgIHNwcmVhZFN0YXJ0ID0gdGhpcy5zdGFydDtcbiAgICAgICAgICBleHByTGlzdC5wdXNoKHRoaXMucGFyc2VQYXJlbkl0ZW0odGhpcy5wYXJzZVJlc3RCaW5kaW5nKCkpKTtcbiAgICAgICAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLmNvbW1hKSB7XG4gICAgICAgICAgICB0aGlzLnJhaXNlUmVjb3ZlcmFibGUoXG4gICAgICAgICAgICAgIHRoaXMuc3RhcnQsXG4gICAgICAgICAgICAgIFwiQ29tbWEgaXMgbm90IHBlcm1pdHRlZCBhZnRlciB0aGUgcmVzdCBlbGVtZW50XCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXhwckxpc3QucHVzaCh0aGlzLnBhcnNlTWF5YmVBc3NpZ24oZmFsc2UsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIHRoaXMucGFyc2VQYXJlbkl0ZW0pKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIGlubmVyRW5kUG9zID0gdGhpcy5sYXN0VG9rRW5kLCBpbm5lckVuZExvYyA9IHRoaXMubGFzdFRva0VuZExvYztcbiAgICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEucGFyZW5SKTtcblxuICAgICAgaWYgKGNhbkJlQXJyb3cgJiYgdGhpcy5zaG91bGRQYXJzZUFycm93KGV4cHJMaXN0KSAmJiB0aGlzLmVhdCh0eXBlcyQxLmFycm93KSkge1xuICAgICAgICB0aGlzLmNoZWNrUGF0dGVybkVycm9ycyhyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuY2hlY2tZaWVsZEF3YWl0SW5EZWZhdWx0UGFyYW1zKCk7XG4gICAgICAgIHRoaXMueWllbGRQb3MgPSBvbGRZaWVsZFBvcztcbiAgICAgICAgdGhpcy5hd2FpdFBvcyA9IG9sZEF3YWl0UG9zO1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVBhcmVuQXJyb3dMaXN0KHN0YXJ0UG9zLCBzdGFydExvYywgZXhwckxpc3QsIGZvckluaXQpXG4gICAgICB9XG5cbiAgICAgIGlmICghZXhwckxpc3QubGVuZ3RoIHx8IGxhc3RJc0NvbW1hKSB7IHRoaXMudW5leHBlY3RlZCh0aGlzLmxhc3RUb2tTdGFydCk7IH1cbiAgICAgIGlmIChzcHJlYWRTdGFydCkgeyB0aGlzLnVuZXhwZWN0ZWQoc3ByZWFkU3RhcnQpOyB9XG4gICAgICB0aGlzLmNoZWNrRXhwcmVzc2lvbkVycm9ycyhyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCB0cnVlKTtcbiAgICAgIHRoaXMueWllbGRQb3MgPSBvbGRZaWVsZFBvcyB8fCB0aGlzLnlpZWxkUG9zO1xuICAgICAgdGhpcy5hd2FpdFBvcyA9IG9sZEF3YWl0UG9zIHx8IHRoaXMuYXdhaXRQb3M7XG5cbiAgICAgIGlmIChleHByTGlzdC5sZW5ndGggPiAxKSB7XG4gICAgICAgIHZhbCA9IHRoaXMuc3RhcnROb2RlQXQoaW5uZXJTdGFydFBvcywgaW5uZXJTdGFydExvYyk7XG4gICAgICAgIHZhbC5leHByZXNzaW9ucyA9IGV4cHJMaXN0O1xuICAgICAgICB0aGlzLmZpbmlzaE5vZGVBdCh2YWwsIFwiU2VxdWVuY2VFeHByZXNzaW9uXCIsIGlubmVyRW5kUG9zLCBpbm5lckVuZExvYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBleHByTGlzdFswXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFsID0gdGhpcy5wYXJzZVBhcmVuRXhwcmVzc2lvbigpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMucHJlc2VydmVQYXJlbnMpIHtcbiAgICAgIHZhciBwYXIgPSB0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyk7XG4gICAgICBwYXIuZXhwcmVzc2lvbiA9IHZhbDtcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUocGFyLCBcIlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uXCIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YWxcbiAgICB9XG4gIH07XG5cbiAgcHAkNS5wYXJzZVBhcmVuSXRlbSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbVxuICB9O1xuXG4gIHBwJDUucGFyc2VQYXJlbkFycm93TGlzdCA9IGZ1bmN0aW9uKHN0YXJ0UG9zLCBzdGFydExvYywgZXhwckxpc3QsIGZvckluaXQpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZUFycm93RXhwcmVzc2lvbih0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyksIGV4cHJMaXN0LCBmYWxzZSwgZm9ySW5pdClcbiAgfTtcblxuICAvLyBOZXcncyBwcmVjZWRlbmNlIGlzIHNsaWdodGx5IHRyaWNreS4gSXQgbXVzdCBhbGxvdyBpdHMgYXJndW1lbnQgdG9cbiAgLy8gYmUgYSBgW11gIG9yIGRvdCBzdWJzY3JpcHQgZXhwcmVzc2lvbiwgYnV0IG5vdCBhIGNhbGwg4oCUIGF0IGxlYXN0LFxuICAvLyBub3Qgd2l0aG91dCB3cmFwcGluZyBpdCBpbiBwYXJlbnRoZXNlcy4gVGh1cywgaXQgdXNlcyB0aGUgbm9DYWxsc1xuICAvLyBhcmd1bWVudCB0byBwYXJzZVN1YnNjcmlwdHMgdG8gcHJldmVudCBpdCBmcm9tIGNvbnN1bWluZyB0aGVcbiAgLy8gYXJndW1lbnQgbGlzdC5cblxuICB2YXIgZW1wdHkgPSBbXTtcblxuICBwcCQ1LnBhcnNlTmV3ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuY29udGFpbnNFc2MpIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHRoaXMuc3RhcnQsIFwiRXNjYXBlIHNlcXVlbmNlIGluIGtleXdvcmQgbmV3XCIpOyB9XG4gICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgIHRoaXMubmV4dCgpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNiAmJiB0aGlzLnR5cGUgPT09IHR5cGVzJDEuZG90KSB7XG4gICAgICB2YXIgbWV0YSA9IHRoaXMuc3RhcnROb2RlQXQobm9kZS5zdGFydCwgbm9kZS5sb2MgJiYgbm9kZS5sb2Muc3RhcnQpO1xuICAgICAgbWV0YS5uYW1lID0gXCJuZXdcIjtcbiAgICAgIG5vZGUubWV0YSA9IHRoaXMuZmluaXNoTm9kZShtZXRhLCBcIklkZW50aWZpZXJcIik7XG4gICAgICB0aGlzLm5leHQoKTtcbiAgICAgIHZhciBjb250YWluc0VzYyA9IHRoaXMuY29udGFpbnNFc2M7XG4gICAgICBub2RlLnByb3BlcnR5ID0gdGhpcy5wYXJzZUlkZW50KHRydWUpO1xuICAgICAgaWYgKG5vZGUucHJvcGVydHkubmFtZSAhPT0gXCJ0YXJnZXRcIilcbiAgICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUobm9kZS5wcm9wZXJ0eS5zdGFydCwgXCJUaGUgb25seSB2YWxpZCBtZXRhIHByb3BlcnR5IGZvciBuZXcgaXMgJ25ldy50YXJnZXQnXCIpOyB9XG4gICAgICBpZiAoY29udGFpbnNFc2MpXG4gICAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKG5vZGUuc3RhcnQsIFwiJ25ldy50YXJnZXQnIG11c3Qgbm90IGNvbnRhaW4gZXNjYXBlZCBjaGFyYWN0ZXJzXCIpOyB9XG4gICAgICBpZiAoIXRoaXMuYWxsb3dOZXdEb3RUYXJnZXQpXG4gICAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKG5vZGUuc3RhcnQsIFwiJ25ldy50YXJnZXQnIGNhbiBvbmx5IGJlIHVzZWQgaW4gZnVuY3Rpb25zIGFuZCBjbGFzcyBzdGF0aWMgYmxvY2tcIik7IH1cbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJNZXRhUHJvcGVydHlcIilcbiAgICB9XG4gICAgdmFyIHN0YXJ0UG9zID0gdGhpcy5zdGFydCwgc3RhcnRMb2MgPSB0aGlzLnN0YXJ0TG9jO1xuICAgIG5vZGUuY2FsbGVlID0gdGhpcy5wYXJzZVN1YnNjcmlwdHModGhpcy5wYXJzZUV4cHJBdG9tKG51bGwsIGZhbHNlLCB0cnVlKSwgc3RhcnRQb3MsIHN0YXJ0TG9jLCB0cnVlLCBmYWxzZSk7XG4gICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEucGFyZW5MKSkgeyBub2RlLmFyZ3VtZW50cyA9IHRoaXMucGFyc2VFeHByTGlzdCh0eXBlcyQxLnBhcmVuUiwgdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDgsIGZhbHNlKTsgfVxuICAgIGVsc2UgeyBub2RlLmFyZ3VtZW50cyA9IGVtcHR5OyB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIk5ld0V4cHJlc3Npb25cIilcbiAgfTtcblxuICAvLyBQYXJzZSB0ZW1wbGF0ZSBleHByZXNzaW9uLlxuXG4gIHBwJDUucGFyc2VUZW1wbGF0ZUVsZW1lbnQgPSBmdW5jdGlvbihyZWYpIHtcbiAgICB2YXIgaXNUYWdnZWQgPSByZWYuaXNUYWdnZWQ7XG5cbiAgICB2YXIgZWxlbSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5pbnZhbGlkVGVtcGxhdGUpIHtcbiAgICAgIGlmICghaXNUYWdnZWQpIHtcbiAgICAgICAgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHRoaXMuc3RhcnQsIFwiQmFkIGVzY2FwZSBzZXF1ZW5jZSBpbiB1bnRhZ2dlZCB0ZW1wbGF0ZSBsaXRlcmFsXCIpO1xuICAgICAgfVxuICAgICAgZWxlbS52YWx1ZSA9IHtcbiAgICAgICAgcmF3OiB0aGlzLnZhbHVlLnJlcGxhY2UoL1xcclxcbj8vZywgXCJcXG5cIiksXG4gICAgICAgIGNvb2tlZDogbnVsbFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbS52YWx1ZSA9IHtcbiAgICAgICAgcmF3OiB0aGlzLmlucHV0LnNsaWNlKHRoaXMuc3RhcnQsIHRoaXMuZW5kKS5yZXBsYWNlKC9cXHJcXG4/L2csIFwiXFxuXCIpLFxuICAgICAgICBjb29rZWQ6IHRoaXMudmFsdWVcbiAgICAgIH07XG4gICAgfVxuICAgIHRoaXMubmV4dCgpO1xuICAgIGVsZW0udGFpbCA9IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5iYWNrUXVvdGU7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShlbGVtLCBcIlRlbXBsYXRlRWxlbWVudFwiKVxuICB9O1xuXG4gIHBwJDUucGFyc2VUZW1wbGF0ZSA9IGZ1bmN0aW9uKHJlZikge1xuICAgIGlmICggcmVmID09PSB2b2lkIDAgKSByZWYgPSB7fTtcbiAgICB2YXIgaXNUYWdnZWQgPSByZWYuaXNUYWdnZWQ7IGlmICggaXNUYWdnZWQgPT09IHZvaWQgMCApIGlzVGFnZ2VkID0gZmFsc2U7XG5cbiAgICB2YXIgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgbm9kZS5leHByZXNzaW9ucyA9IFtdO1xuICAgIHZhciBjdXJFbHQgPSB0aGlzLnBhcnNlVGVtcGxhdGVFbGVtZW50KHtpc1RhZ2dlZDogaXNUYWdnZWR9KTtcbiAgICBub2RlLnF1YXNpcyA9IFtjdXJFbHRdO1xuICAgIHdoaWxlICghY3VyRWx0LnRhaWwpIHtcbiAgICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuZW9mKSB7IHRoaXMucmFpc2UodGhpcy5wb3MsIFwiVW50ZXJtaW5hdGVkIHRlbXBsYXRlIGxpdGVyYWxcIik7IH1cbiAgICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEuZG9sbGFyQnJhY2VMKTtcbiAgICAgIG5vZGUuZXhwcmVzc2lvbnMucHVzaCh0aGlzLnBhcnNlRXhwcmVzc2lvbigpKTtcbiAgICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEuYnJhY2VSKTtcbiAgICAgIG5vZGUucXVhc2lzLnB1c2goY3VyRWx0ID0gdGhpcy5wYXJzZVRlbXBsYXRlRWxlbWVudCh7aXNUYWdnZWQ6IGlzVGFnZ2VkfSkpO1xuICAgIH1cbiAgICB0aGlzLm5leHQoKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiVGVtcGxhdGVMaXRlcmFsXCIpXG4gIH07XG5cbiAgcHAkNS5pc0FzeW5jUHJvcCA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICByZXR1cm4gIXByb3AuY29tcHV0ZWQgJiYgcHJvcC5rZXkudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgJiYgcHJvcC5rZXkubmFtZSA9PT0gXCJhc3luY1wiICYmXG4gICAgICAodGhpcy50eXBlID09PSB0eXBlcyQxLm5hbWUgfHwgdGhpcy50eXBlID09PSB0eXBlcyQxLm51bSB8fCB0aGlzLnR5cGUgPT09IHR5cGVzJDEuc3RyaW5nIHx8IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5icmFja2V0TCB8fCB0aGlzLnR5cGUua2V5d29yZCB8fCAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDkgJiYgdGhpcy50eXBlID09PSB0eXBlcyQxLnN0YXIpKSAmJlxuICAgICAgIWxpbmVCcmVhay50ZXN0KHRoaXMuaW5wdXQuc2xpY2UodGhpcy5sYXN0VG9rRW5kLCB0aGlzLnN0YXJ0KSlcbiAgfTtcblxuICAvLyBQYXJzZSBhbiBvYmplY3QgbGl0ZXJhbCBvciBiaW5kaW5nIHBhdHRlcm4uXG5cbiAgcHAkNS5wYXJzZU9iaiA9IGZ1bmN0aW9uKGlzUGF0dGVybiwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykge1xuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKSwgZmlyc3QgPSB0cnVlLCBwcm9wSGFzaCA9IHt9O1xuICAgIG5vZGUucHJvcGVydGllcyA9IFtdO1xuICAgIHRoaXMubmV4dCgpO1xuICAgIHdoaWxlICghdGhpcy5lYXQodHlwZXMkMS5icmFjZVIpKSB7XG4gICAgICBpZiAoIWZpcnN0KSB7XG4gICAgICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEuY29tbWEpO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDUgJiYgdGhpcy5hZnRlclRyYWlsaW5nQ29tbWEodHlwZXMkMS5icmFjZVIpKSB7IGJyZWFrIH1cbiAgICAgIH0gZWxzZSB7IGZpcnN0ID0gZmFsc2U7IH1cblxuICAgICAgdmFyIHByb3AgPSB0aGlzLnBhcnNlUHJvcGVydHkoaXNQYXR0ZXJuLCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKTtcbiAgICAgIGlmICghaXNQYXR0ZXJuKSB7IHRoaXMuY2hlY2tQcm9wQ2xhc2gocHJvcCwgcHJvcEhhc2gsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpOyB9XG4gICAgICBub2RlLnByb3BlcnRpZXMucHVzaChwcm9wKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBpc1BhdHRlcm4gPyBcIk9iamVjdFBhdHRlcm5cIiA6IFwiT2JqZWN0RXhwcmVzc2lvblwiKVxuICB9O1xuXG4gIHBwJDUucGFyc2VQcm9wZXJ0eSA9IGZ1bmN0aW9uKGlzUGF0dGVybiwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykge1xuICAgIHZhciBwcm9wID0gdGhpcy5zdGFydE5vZGUoKSwgaXNHZW5lcmF0b3IsIGlzQXN5bmMsIHN0YXJ0UG9zLCBzdGFydExvYztcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDkgJiYgdGhpcy5lYXQodHlwZXMkMS5lbGxpcHNpcykpIHtcbiAgICAgIGlmIChpc1BhdHRlcm4pIHtcbiAgICAgICAgcHJvcC5hcmd1bWVudCA9IHRoaXMucGFyc2VJZGVudChmYWxzZSk7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuY29tbWEpIHtcbiAgICAgICAgICB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodGhpcy5zdGFydCwgXCJDb21tYSBpcyBub3QgcGVybWl0dGVkIGFmdGVyIHRoZSByZXN0IGVsZW1lbnRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShwcm9wLCBcIlJlc3RFbGVtZW50XCIpXG4gICAgICB9XG4gICAgICAvLyBQYXJzZSBhcmd1bWVudC5cbiAgICAgIHByb3AuYXJndW1lbnQgPSB0aGlzLnBhcnNlTWF5YmVBc3NpZ24oZmFsc2UsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpO1xuICAgICAgLy8gVG8gZGlzYWxsb3cgdHJhaWxpbmcgY29tbWEgdmlhIGB0aGlzLnRvQXNzaWduYWJsZSgpYC5cbiAgICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuY29tbWEgJiYgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyAmJiByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnRyYWlsaW5nQ29tbWEgPCAwKSB7XG4gICAgICAgIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMudHJhaWxpbmdDb21tYSA9IHRoaXMuc3RhcnQ7XG4gICAgICB9XG4gICAgICAvLyBGaW5pc2hcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUocHJvcCwgXCJTcHJlYWRFbGVtZW50XCIpXG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNikge1xuICAgICAgcHJvcC5tZXRob2QgPSBmYWxzZTtcbiAgICAgIHByb3Auc2hvcnRoYW5kID0gZmFsc2U7XG4gICAgICBpZiAoaXNQYXR0ZXJuIHx8IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpIHtcbiAgICAgICAgc3RhcnRQb3MgPSB0aGlzLnN0YXJ0O1xuICAgICAgICBzdGFydExvYyA9IHRoaXMuc3RhcnRMb2M7XG4gICAgICB9XG4gICAgICBpZiAoIWlzUGF0dGVybilcbiAgICAgICAgeyBpc0dlbmVyYXRvciA9IHRoaXMuZWF0KHR5cGVzJDEuc3Rhcik7IH1cbiAgICB9XG4gICAgdmFyIGNvbnRhaW5zRXNjID0gdGhpcy5jb250YWluc0VzYztcbiAgICB0aGlzLnBhcnNlUHJvcGVydHlOYW1lKHByb3ApO1xuICAgIGlmICghaXNQYXR0ZXJuICYmICFjb250YWluc0VzYyAmJiB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOCAmJiAhaXNHZW5lcmF0b3IgJiYgdGhpcy5pc0FzeW5jUHJvcChwcm9wKSkge1xuICAgICAgaXNBc3luYyA9IHRydWU7XG4gICAgICBpc0dlbmVyYXRvciA9IHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA5ICYmIHRoaXMuZWF0KHR5cGVzJDEuc3Rhcik7XG4gICAgICB0aGlzLnBhcnNlUHJvcGVydHlOYW1lKHByb3ApO1xuICAgIH0gZWxzZSB7XG4gICAgICBpc0FzeW5jID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMucGFyc2VQcm9wZXJ0eVZhbHVlKHByb3AsIGlzUGF0dGVybiwgaXNHZW5lcmF0b3IsIGlzQXN5bmMsIHN0YXJ0UG9zLCBzdGFydExvYywgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycywgY29udGFpbnNFc2MpO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUocHJvcCwgXCJQcm9wZXJ0eVwiKVxuICB9O1xuXG4gIHBwJDUucGFyc2VHZXR0ZXJTZXR0ZXIgPSBmdW5jdGlvbihwcm9wKSB7XG4gICAgcHJvcC5raW5kID0gcHJvcC5rZXkubmFtZTtcbiAgICB0aGlzLnBhcnNlUHJvcGVydHlOYW1lKHByb3ApO1xuICAgIHByb3AudmFsdWUgPSB0aGlzLnBhcnNlTWV0aG9kKGZhbHNlKTtcbiAgICB2YXIgcGFyYW1Db3VudCA9IHByb3Aua2luZCA9PT0gXCJnZXRcIiA/IDAgOiAxO1xuICAgIGlmIChwcm9wLnZhbHVlLnBhcmFtcy5sZW5ndGggIT09IHBhcmFtQ291bnQpIHtcbiAgICAgIHZhciBzdGFydCA9IHByb3AudmFsdWUuc3RhcnQ7XG4gICAgICBpZiAocHJvcC5raW5kID09PSBcImdldFwiKVxuICAgICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShzdGFydCwgXCJnZXR0ZXIgc2hvdWxkIGhhdmUgbm8gcGFyYW1zXCIpOyB9XG4gICAgICBlbHNlXG4gICAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHN0YXJ0LCBcInNldHRlciBzaG91bGQgaGF2ZSBleGFjdGx5IG9uZSBwYXJhbVwiKTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocHJvcC5raW5kID09PSBcInNldFwiICYmIHByb3AudmFsdWUucGFyYW1zWzBdLnR5cGUgPT09IFwiUmVzdEVsZW1lbnRcIilcbiAgICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUocHJvcC52YWx1ZS5wYXJhbXNbMF0uc3RhcnQsIFwiU2V0dGVyIGNhbm5vdCB1c2UgcmVzdCBwYXJhbXNcIik7IH1cbiAgICB9XG4gIH07XG5cbiAgcHAkNS5wYXJzZVByb3BlcnR5VmFsdWUgPSBmdW5jdGlvbihwcm9wLCBpc1BhdHRlcm4sIGlzR2VuZXJhdG9yLCBpc0FzeW5jLCBzdGFydFBvcywgc3RhcnRMb2MsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIGNvbnRhaW5zRXNjKSB7XG4gICAgaWYgKChpc0dlbmVyYXRvciB8fCBpc0FzeW5jKSAmJiB0aGlzLnR5cGUgPT09IHR5cGVzJDEuY29sb24pXG4gICAgICB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG5cbiAgICBpZiAodGhpcy5lYXQodHlwZXMkMS5jb2xvbikpIHtcbiAgICAgIHByb3AudmFsdWUgPSBpc1BhdHRlcm4gPyB0aGlzLnBhcnNlTWF5YmVEZWZhdWx0KHRoaXMuc3RhcnQsIHRoaXMuc3RhcnRMb2MpIDogdGhpcy5wYXJzZU1heWJlQXNzaWduKGZhbHNlLCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKTtcbiAgICAgIHByb3Aua2luZCA9IFwiaW5pdFwiO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYgJiYgdGhpcy50eXBlID09PSB0eXBlcyQxLnBhcmVuTCkge1xuICAgICAgaWYgKGlzUGF0dGVybikgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgICAgcHJvcC5raW5kID0gXCJpbml0XCI7XG4gICAgICBwcm9wLm1ldGhvZCA9IHRydWU7XG4gICAgICBwcm9wLnZhbHVlID0gdGhpcy5wYXJzZU1ldGhvZChpc0dlbmVyYXRvciwgaXNBc3luYyk7XG4gICAgfSBlbHNlIGlmICghaXNQYXR0ZXJuICYmICFjb250YWluc0VzYyAmJlxuICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDUgJiYgIXByb3AuY29tcHV0ZWQgJiYgcHJvcC5rZXkudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgJiZcbiAgICAgICAgICAgICAgIChwcm9wLmtleS5uYW1lID09PSBcImdldFwiIHx8IHByb3Aua2V5Lm5hbWUgPT09IFwic2V0XCIpICYmXG4gICAgICAgICAgICAgICAodGhpcy50eXBlICE9PSB0eXBlcyQxLmNvbW1hICYmIHRoaXMudHlwZSAhPT0gdHlwZXMkMS5icmFjZVIgJiYgdGhpcy50eXBlICE9PSB0eXBlcyQxLmVxKSkge1xuICAgICAgaWYgKGlzR2VuZXJhdG9yIHx8IGlzQXN5bmMpIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgICAgIHRoaXMucGFyc2VHZXR0ZXJTZXR0ZXIocHJvcCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNiAmJiAhcHJvcC5jb21wdXRlZCAmJiBwcm9wLmtleS50eXBlID09PSBcIklkZW50aWZpZXJcIikge1xuICAgICAgaWYgKGlzR2VuZXJhdG9yIHx8IGlzQXN5bmMpIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgICAgIHRoaXMuY2hlY2tVbnJlc2VydmVkKHByb3Aua2V5KTtcbiAgICAgIGlmIChwcm9wLmtleS5uYW1lID09PSBcImF3YWl0XCIgJiYgIXRoaXMuYXdhaXRJZGVudFBvcylcbiAgICAgICAgeyB0aGlzLmF3YWl0SWRlbnRQb3MgPSBzdGFydFBvczsgfVxuICAgICAgcHJvcC5raW5kID0gXCJpbml0XCI7XG4gICAgICBpZiAoaXNQYXR0ZXJuKSB7XG4gICAgICAgIHByb3AudmFsdWUgPSB0aGlzLnBhcnNlTWF5YmVEZWZhdWx0KHN0YXJ0UG9zLCBzdGFydExvYywgdGhpcy5jb3B5Tm9kZShwcm9wLmtleSkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuZXEgJiYgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykge1xuICAgICAgICBpZiAocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5zaG9ydGhhbmRBc3NpZ24gPCAwKVxuICAgICAgICAgIHsgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5zaG9ydGhhbmRBc3NpZ24gPSB0aGlzLnN0YXJ0OyB9XG4gICAgICAgIHByb3AudmFsdWUgPSB0aGlzLnBhcnNlTWF5YmVEZWZhdWx0KHN0YXJ0UG9zLCBzdGFydExvYywgdGhpcy5jb3B5Tm9kZShwcm9wLmtleSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvcC52YWx1ZSA9IHRoaXMuY29weU5vZGUocHJvcC5rZXkpO1xuICAgICAgfVxuICAgICAgcHJvcC5zaG9ydGhhbmQgPSB0cnVlO1xuICAgIH0gZWxzZSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gIH07XG5cbiAgcHAkNS5wYXJzZVByb3BlcnR5TmFtZSA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYpIHtcbiAgICAgIGlmICh0aGlzLmVhdCh0eXBlcyQxLmJyYWNrZXRMKSkge1xuICAgICAgICBwcm9wLmNvbXB1dGVkID0gdHJ1ZTtcbiAgICAgICAgcHJvcC5rZXkgPSB0aGlzLnBhcnNlTWF5YmVBc3NpZ24oKTtcbiAgICAgICAgdGhpcy5leHBlY3QodHlwZXMkMS5icmFja2V0Uik7XG4gICAgICAgIHJldHVybiBwcm9wLmtleVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvcC5jb21wdXRlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvcC5rZXkgPSB0aGlzLnR5cGUgPT09IHR5cGVzJDEubnVtIHx8IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5zdHJpbmcgPyB0aGlzLnBhcnNlRXhwckF0b20oKSA6IHRoaXMucGFyc2VJZGVudCh0aGlzLm9wdGlvbnMuYWxsb3dSZXNlcnZlZCAhPT0gXCJuZXZlclwiKVxuICB9O1xuXG4gIC8vIEluaXRpYWxpemUgZW1wdHkgZnVuY3Rpb24gbm9kZS5cblxuICBwcCQ1LmluaXRGdW5jdGlvbiA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBub2RlLmlkID0gbnVsbDtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYpIHsgbm9kZS5nZW5lcmF0b3IgPSBub2RlLmV4cHJlc3Npb24gPSBmYWxzZTsgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOCkgeyBub2RlLmFzeW5jID0gZmFsc2U7IH1cbiAgfTtcblxuICAvLyBQYXJzZSBvYmplY3Qgb3IgY2xhc3MgbWV0aG9kLlxuXG4gIHBwJDUucGFyc2VNZXRob2QgPSBmdW5jdGlvbihpc0dlbmVyYXRvciwgaXNBc3luYywgYWxsb3dEaXJlY3RTdXBlcikge1xuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKSwgb2xkWWllbGRQb3MgPSB0aGlzLnlpZWxkUG9zLCBvbGRBd2FpdFBvcyA9IHRoaXMuYXdhaXRQb3MsIG9sZEF3YWl0SWRlbnRQb3MgPSB0aGlzLmF3YWl0SWRlbnRQb3M7XG5cbiAgICB0aGlzLmluaXRGdW5jdGlvbihub2RlKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYpXG4gICAgICB7IG5vZGUuZ2VuZXJhdG9yID0gaXNHZW5lcmF0b3I7IH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDgpXG4gICAgICB7IG5vZGUuYXN5bmMgPSAhIWlzQXN5bmM7IH1cblxuICAgIHRoaXMueWllbGRQb3MgPSAwO1xuICAgIHRoaXMuYXdhaXRQb3MgPSAwO1xuICAgIHRoaXMuYXdhaXRJZGVudFBvcyA9IDA7XG4gICAgdGhpcy5lbnRlclNjb3BlKGZ1bmN0aW9uRmxhZ3MoaXNBc3luYywgbm9kZS5nZW5lcmF0b3IpIHwgU0NPUEVfU1VQRVIgfCAoYWxsb3dEaXJlY3RTdXBlciA/IFNDT1BFX0RJUkVDVF9TVVBFUiA6IDApKTtcblxuICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEucGFyZW5MKTtcbiAgICBub2RlLnBhcmFtcyA9IHRoaXMucGFyc2VCaW5kaW5nTGlzdCh0eXBlcyQxLnBhcmVuUiwgZmFsc2UsIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA4KTtcbiAgICB0aGlzLmNoZWNrWWllbGRBd2FpdEluRGVmYXVsdFBhcmFtcygpO1xuICAgIHRoaXMucGFyc2VGdW5jdGlvbkJvZHkobm9kZSwgZmFsc2UsIHRydWUsIGZhbHNlKTtcblxuICAgIHRoaXMueWllbGRQb3MgPSBvbGRZaWVsZFBvcztcbiAgICB0aGlzLmF3YWl0UG9zID0gb2xkQXdhaXRQb3M7XG4gICAgdGhpcy5hd2FpdElkZW50UG9zID0gb2xkQXdhaXRJZGVudFBvcztcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiRnVuY3Rpb25FeHByZXNzaW9uXCIpXG4gIH07XG5cbiAgLy8gUGFyc2UgYXJyb3cgZnVuY3Rpb24gZXhwcmVzc2lvbiB3aXRoIGdpdmVuIHBhcmFtZXRlcnMuXG5cbiAgcHAkNS5wYXJzZUFycm93RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKG5vZGUsIHBhcmFtcywgaXNBc3luYywgZm9ySW5pdCkge1xuICAgIHZhciBvbGRZaWVsZFBvcyA9IHRoaXMueWllbGRQb3MsIG9sZEF3YWl0UG9zID0gdGhpcy5hd2FpdFBvcywgb2xkQXdhaXRJZGVudFBvcyA9IHRoaXMuYXdhaXRJZGVudFBvcztcblxuICAgIHRoaXMuZW50ZXJTY29wZShmdW5jdGlvbkZsYWdzKGlzQXN5bmMsIGZhbHNlKSB8IFNDT1BFX0FSUk9XKTtcbiAgICB0aGlzLmluaXRGdW5jdGlvbihub2RlKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDgpIHsgbm9kZS5hc3luYyA9ICEhaXNBc3luYzsgfVxuXG4gICAgdGhpcy55aWVsZFBvcyA9IDA7XG4gICAgdGhpcy5hd2FpdFBvcyA9IDA7XG4gICAgdGhpcy5hd2FpdElkZW50UG9zID0gMDtcblxuICAgIG5vZGUucGFyYW1zID0gdGhpcy50b0Fzc2lnbmFibGVMaXN0KHBhcmFtcywgdHJ1ZSk7XG4gICAgdGhpcy5wYXJzZUZ1bmN0aW9uQm9keShub2RlLCB0cnVlLCBmYWxzZSwgZm9ySW5pdCk7XG5cbiAgICB0aGlzLnlpZWxkUG9zID0gb2xkWWllbGRQb3M7XG4gICAgdGhpcy5hd2FpdFBvcyA9IG9sZEF3YWl0UG9zO1xuICAgIHRoaXMuYXdhaXRJZGVudFBvcyA9IG9sZEF3YWl0SWRlbnRQb3M7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkFycm93RnVuY3Rpb25FeHByZXNzaW9uXCIpXG4gIH07XG5cbiAgLy8gUGFyc2UgZnVuY3Rpb24gYm9keSBhbmQgY2hlY2sgcGFyYW1ldGVycy5cblxuICBwcCQ1LnBhcnNlRnVuY3Rpb25Cb2R5ID0gZnVuY3Rpb24obm9kZSwgaXNBcnJvd0Z1bmN0aW9uLCBpc01ldGhvZCwgZm9ySW5pdCkge1xuICAgIHZhciBpc0V4cHJlc3Npb24gPSBpc0Fycm93RnVuY3Rpb24gJiYgdGhpcy50eXBlICE9PSB0eXBlcyQxLmJyYWNlTDtcbiAgICB2YXIgb2xkU3RyaWN0ID0gdGhpcy5zdHJpY3QsIHVzZVN0cmljdCA9IGZhbHNlO1xuXG4gICAgaWYgKGlzRXhwcmVzc2lvbikge1xuICAgICAgbm9kZS5ib2R5ID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKGZvckluaXQpO1xuICAgICAgbm9kZS5leHByZXNzaW9uID0gdHJ1ZTtcbiAgICAgIHRoaXMuY2hlY2tQYXJhbXMobm9kZSwgZmFsc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbm9uU2ltcGxlID0gdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDcgJiYgIXRoaXMuaXNTaW1wbGVQYXJhbUxpc3Qobm9kZS5wYXJhbXMpO1xuICAgICAgaWYgKCFvbGRTdHJpY3QgfHwgbm9uU2ltcGxlKSB7XG4gICAgICAgIHVzZVN0cmljdCA9IHRoaXMuc3RyaWN0RGlyZWN0aXZlKHRoaXMuZW5kKTtcbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIHN0cmljdCBtb2RlIGZ1bmN0aW9uLCB2ZXJpZnkgdGhhdCBhcmd1bWVudCBuYW1lc1xuICAgICAgICAvLyBhcmUgbm90IHJlcGVhdGVkLCBhbmQgaXQgZG9lcyBub3QgdHJ5IHRvIGJpbmQgdGhlIHdvcmRzIGBldmFsYFxuICAgICAgICAvLyBvciBgYXJndW1lbnRzYC5cbiAgICAgICAgaWYgKHVzZVN0cmljdCAmJiBub25TaW1wbGUpXG4gICAgICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUobm9kZS5zdGFydCwgXCJJbGxlZ2FsICd1c2Ugc3RyaWN0JyBkaXJlY3RpdmUgaW4gZnVuY3Rpb24gd2l0aCBub24tc2ltcGxlIHBhcmFtZXRlciBsaXN0XCIpOyB9XG4gICAgICB9XG4gICAgICAvLyBTdGFydCBhIG5ldyBzY29wZSB3aXRoIHJlZ2FyZCB0byBsYWJlbHMgYW5kIHRoZSBgaW5GdW5jdGlvbmBcbiAgICAgIC8vIGZsYWcgKHJlc3RvcmUgdGhlbSB0byB0aGVpciBvbGQgdmFsdWUgYWZ0ZXJ3YXJkcykuXG4gICAgICB2YXIgb2xkTGFiZWxzID0gdGhpcy5sYWJlbHM7XG4gICAgICB0aGlzLmxhYmVscyA9IFtdO1xuICAgICAgaWYgKHVzZVN0cmljdCkgeyB0aGlzLnN0cmljdCA9IHRydWU7IH1cblxuICAgICAgLy8gQWRkIHRoZSBwYXJhbXMgdG8gdmFyRGVjbGFyZWROYW1lcyB0byBlbnN1cmUgdGhhdCBhbiBlcnJvciBpcyB0aHJvd25cbiAgICAgIC8vIGlmIGEgbGV0L2NvbnN0IGRlY2xhcmF0aW9uIGluIHRoZSBmdW5jdGlvbiBjbGFzaGVzIHdpdGggb25lIG9mIHRoZSBwYXJhbXMuXG4gICAgICB0aGlzLmNoZWNrUGFyYW1zKG5vZGUsICFvbGRTdHJpY3QgJiYgIXVzZVN0cmljdCAmJiAhaXNBcnJvd0Z1bmN0aW9uICYmICFpc01ldGhvZCAmJiB0aGlzLmlzU2ltcGxlUGFyYW1MaXN0KG5vZGUucGFyYW1zKSk7XG4gICAgICAvLyBFbnN1cmUgdGhlIGZ1bmN0aW9uIG5hbWUgaXNuJ3QgYSBmb3JiaWRkZW4gaWRlbnRpZmllciBpbiBzdHJpY3QgbW9kZSwgZS5nLiAnZXZhbCdcbiAgICAgIGlmICh0aGlzLnN0cmljdCAmJiBub2RlLmlkKSB7IHRoaXMuY2hlY2tMVmFsU2ltcGxlKG5vZGUuaWQsIEJJTkRfT1VUU0lERSk7IH1cbiAgICAgIG5vZGUuYm9keSA9IHRoaXMucGFyc2VCbG9jayhmYWxzZSwgdW5kZWZpbmVkLCB1c2VTdHJpY3QgJiYgIW9sZFN0cmljdCk7XG4gICAgICBub2RlLmV4cHJlc3Npb24gPSBmYWxzZTtcbiAgICAgIHRoaXMuYWRhcHREaXJlY3RpdmVQcm9sb2d1ZShub2RlLmJvZHkuYm9keSk7XG4gICAgICB0aGlzLmxhYmVscyA9IG9sZExhYmVscztcbiAgICB9XG4gICAgdGhpcy5leGl0U2NvcGUoKTtcbiAgfTtcblxuICBwcCQ1LmlzU2ltcGxlUGFyYW1MaXN0ID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxpc3QgPSBwYXJhbXM7IGkgPCBsaXN0Lmxlbmd0aDsgaSArPSAxKVxuICAgICAge1xuICAgICAgdmFyIHBhcmFtID0gbGlzdFtpXTtcblxuICAgICAgaWYgKHBhcmFtLnR5cGUgIT09IFwiSWRlbnRpZmllclwiKSB7IHJldHVybiBmYWxzZVxuICAgIH0gfVxuICAgIHJldHVybiB0cnVlXG4gIH07XG5cbiAgLy8gQ2hlY2tzIGZ1bmN0aW9uIHBhcmFtcyBmb3IgdmFyaW91cyBkaXNhbGxvd2VkIHBhdHRlcm5zIHN1Y2ggYXMgdXNpbmcgXCJldmFsXCJcbiAgLy8gb3IgXCJhcmd1bWVudHNcIiBhbmQgZHVwbGljYXRlIHBhcmFtZXRlcnMuXG5cbiAgcHAkNS5jaGVja1BhcmFtcyA9IGZ1bmN0aW9uKG5vZGUsIGFsbG93RHVwbGljYXRlcykge1xuICAgIHZhciBuYW1lSGFzaCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxpc3QgPSBub2RlLnBhcmFtczsgaSA8IGxpc3QubGVuZ3RoOyBpICs9IDEpXG4gICAgICB7XG4gICAgICB2YXIgcGFyYW0gPSBsaXN0W2ldO1xuXG4gICAgICB0aGlzLmNoZWNrTFZhbElubmVyUGF0dGVybihwYXJhbSwgQklORF9WQVIsIGFsbG93RHVwbGljYXRlcyA/IG51bGwgOiBuYW1lSGFzaCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIFBhcnNlcyBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIGV4cHJlc3Npb25zLCBhbmQgcmV0dXJucyB0aGVtIGFzXG4gIC8vIGFuIGFycmF5LiBgY2xvc2VgIGlzIHRoZSB0b2tlbiB0eXBlIHRoYXQgZW5kcyB0aGUgbGlzdCwgYW5kXG4gIC8vIGBhbGxvd0VtcHR5YCBjYW4gYmUgdHVybmVkIG9uIHRvIGFsbG93IHN1YnNlcXVlbnQgY29tbWFzIHdpdGhcbiAgLy8gbm90aGluZyBpbiBiZXR3ZWVuIHRoZW0gdG8gYmUgcGFyc2VkIGFzIGBudWxsYCAod2hpY2ggaXMgbmVlZGVkXG4gIC8vIGZvciBhcnJheSBsaXRlcmFscykuXG5cbiAgcHAkNS5wYXJzZUV4cHJMaXN0ID0gZnVuY3Rpb24oY2xvc2UsIGFsbG93VHJhaWxpbmdDb21tYSwgYWxsb3dFbXB0eSwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykge1xuICAgIHZhciBlbHRzID0gW10sIGZpcnN0ID0gdHJ1ZTtcbiAgICB3aGlsZSAoIXRoaXMuZWF0KGNsb3NlKSkge1xuICAgICAgaWYgKCFmaXJzdCkge1xuICAgICAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLmNvbW1hKTtcbiAgICAgICAgaWYgKGFsbG93VHJhaWxpbmdDb21tYSAmJiB0aGlzLmFmdGVyVHJhaWxpbmdDb21tYShjbG9zZSkpIHsgYnJlYWsgfVxuICAgICAgfSBlbHNlIHsgZmlyc3QgPSBmYWxzZTsgfVxuXG4gICAgICB2YXIgZWx0ID0gKHZvaWQgMCk7XG4gICAgICBpZiAoYWxsb3dFbXB0eSAmJiB0aGlzLnR5cGUgPT09IHR5cGVzJDEuY29tbWEpXG4gICAgICAgIHsgZWx0ID0gbnVsbDsgfVxuICAgICAgZWxzZSBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLmVsbGlwc2lzKSB7XG4gICAgICAgIGVsdCA9IHRoaXMucGFyc2VTcHJlYWQocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyk7XG4gICAgICAgIGlmIChyZWZEZXN0cnVjdHVyaW5nRXJyb3JzICYmIHRoaXMudHlwZSA9PT0gdHlwZXMkMS5jb21tYSAmJiByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnRyYWlsaW5nQ29tbWEgPCAwKVxuICAgICAgICAgIHsgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy50cmFpbGluZ0NvbW1hID0gdGhpcy5zdGFydDsgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWx0ID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKGZhbHNlLCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKTtcbiAgICAgIH1cbiAgICAgIGVsdHMucHVzaChlbHQpO1xuICAgIH1cbiAgICByZXR1cm4gZWx0c1xuICB9O1xuXG4gIHBwJDUuY2hlY2tVbnJlc2VydmVkID0gZnVuY3Rpb24ocmVmKSB7XG4gICAgdmFyIHN0YXJ0ID0gcmVmLnN0YXJ0O1xuICAgIHZhciBlbmQgPSByZWYuZW5kO1xuICAgIHZhciBuYW1lID0gcmVmLm5hbWU7XG5cbiAgICBpZiAodGhpcy5pbkdlbmVyYXRvciAmJiBuYW1lID09PSBcInlpZWxkXCIpXG4gICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShzdGFydCwgXCJDYW5ub3QgdXNlICd5aWVsZCcgYXMgaWRlbnRpZmllciBpbnNpZGUgYSBnZW5lcmF0b3JcIik7IH1cbiAgICBpZiAodGhpcy5pbkFzeW5jICYmIG5hbWUgPT09IFwiYXdhaXRcIilcbiAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHN0YXJ0LCBcIkNhbm5vdCB1c2UgJ2F3YWl0JyBhcyBpZGVudGlmaWVyIGluc2lkZSBhbiBhc3luYyBmdW5jdGlvblwiKTsgfVxuICAgIGlmICh0aGlzLmN1cnJlbnRUaGlzU2NvcGUoKS5pbkNsYXNzRmllbGRJbml0ICYmIG5hbWUgPT09IFwiYXJndW1lbnRzXCIpXG4gICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShzdGFydCwgXCJDYW5ub3QgdXNlICdhcmd1bWVudHMnIGluIGNsYXNzIGZpZWxkIGluaXRpYWxpemVyXCIpOyB9XG4gICAgaWYgKHRoaXMuaW5DbGFzc1N0YXRpY0Jsb2NrICYmIChuYW1lID09PSBcImFyZ3VtZW50c1wiIHx8IG5hbWUgPT09IFwiYXdhaXRcIikpXG4gICAgICB7IHRoaXMucmFpc2Uoc3RhcnQsIChcIkNhbm5vdCB1c2UgXCIgKyBuYW1lICsgXCIgaW4gY2xhc3Mgc3RhdGljIGluaXRpYWxpemF0aW9uIGJsb2NrXCIpKTsgfVxuICAgIGlmICh0aGlzLmtleXdvcmRzLnRlc3QobmFtZSkpXG4gICAgICB7IHRoaXMucmFpc2Uoc3RhcnQsIChcIlVuZXhwZWN0ZWQga2V5d29yZCAnXCIgKyBuYW1lICsgXCInXCIpKTsgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPCA2ICYmXG4gICAgICB0aGlzLmlucHV0LnNsaWNlKHN0YXJ0LCBlbmQpLmluZGV4T2YoXCJcXFxcXCIpICE9PSAtMSkgeyByZXR1cm4gfVxuICAgIHZhciByZSA9IHRoaXMuc3RyaWN0ID8gdGhpcy5yZXNlcnZlZFdvcmRzU3RyaWN0IDogdGhpcy5yZXNlcnZlZFdvcmRzO1xuICAgIGlmIChyZS50ZXN0KG5hbWUpKSB7XG4gICAgICBpZiAoIXRoaXMuaW5Bc3luYyAmJiBuYW1lID09PSBcImF3YWl0XCIpXG4gICAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHN0YXJ0LCBcIkNhbm5vdCB1c2Uga2V5d29yZCAnYXdhaXQnIG91dHNpZGUgYW4gYXN5bmMgZnVuY3Rpb25cIik7IH1cbiAgICAgIHRoaXMucmFpc2VSZWNvdmVyYWJsZShzdGFydCwgKFwiVGhlIGtleXdvcmQgJ1wiICsgbmFtZSArIFwiJyBpcyByZXNlcnZlZFwiKSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIFBhcnNlIHRoZSBuZXh0IHRva2VuIGFzIGFuIGlkZW50aWZpZXIuIElmIGBsaWJlcmFsYCBpcyB0cnVlICh1c2VkXG4gIC8vIHdoZW4gcGFyc2luZyBwcm9wZXJ0aWVzKSwgaXQgd2lsbCBhbHNvIGNvbnZlcnQga2V5d29yZHMgaW50b1xuICAvLyBpZGVudGlmaWVycy5cblxuICBwcCQ1LnBhcnNlSWRlbnQgPSBmdW5jdGlvbihsaWJlcmFsKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLnBhcnNlSWRlbnROb2RlKCk7XG4gICAgdGhpcy5uZXh0KCEhbGliZXJhbCk7XG4gICAgdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiSWRlbnRpZmllclwiKTtcbiAgICBpZiAoIWxpYmVyYWwpIHtcbiAgICAgIHRoaXMuY2hlY2tVbnJlc2VydmVkKG5vZGUpO1xuICAgICAgaWYgKG5vZGUubmFtZSA9PT0gXCJhd2FpdFwiICYmICF0aGlzLmF3YWl0SWRlbnRQb3MpXG4gICAgICAgIHsgdGhpcy5hd2FpdElkZW50UG9zID0gbm9kZS5zdGFydDsgfVxuICAgIH1cbiAgICByZXR1cm4gbm9kZVxuICB9O1xuXG4gIHBwJDUucGFyc2VJZGVudE5vZGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5uYW1lKSB7XG4gICAgICBub2RlLm5hbWUgPSB0aGlzLnZhbHVlO1xuICAgIH0gZWxzZSBpZiAodGhpcy50eXBlLmtleXdvcmQpIHtcbiAgICAgIG5vZGUubmFtZSA9IHRoaXMudHlwZS5rZXl3b3JkO1xuXG4gICAgICAvLyBUbyBmaXggaHR0cHM6Ly9naXRodWIuY29tL2Fjb3JuanMvYWNvcm4vaXNzdWVzLzU3NVxuICAgICAgLy8gYGNsYXNzYCBhbmQgYGZ1bmN0aW9uYCBrZXl3b3JkcyBwdXNoIG5ldyBjb250ZXh0IGludG8gdGhpcy5jb250ZXh0LlxuICAgICAgLy8gQnV0IHRoZXJlIGlzIG5vIGNoYW5jZSB0byBwb3AgdGhlIGNvbnRleHQgaWYgdGhlIGtleXdvcmQgaXMgY29uc3VtZWQgYXMgYW4gaWRlbnRpZmllciBzdWNoIGFzIGEgcHJvcGVydHkgbmFtZS5cbiAgICAgIC8vIElmIHRoZSBwcmV2aW91cyB0b2tlbiBpcyBhIGRvdCwgdGhpcyBkb2VzIG5vdCBhcHBseSBiZWNhdXNlIHRoZSBjb250ZXh0LW1hbmFnaW5nIGNvZGUgYWxyZWFkeSBpZ25vcmVkIHRoZSBrZXl3b3JkXG4gICAgICBpZiAoKG5vZGUubmFtZSA9PT0gXCJjbGFzc1wiIHx8IG5vZGUubmFtZSA9PT0gXCJmdW5jdGlvblwiKSAmJlxuICAgICAgICAodGhpcy5sYXN0VG9rRW5kICE9PSB0aGlzLmxhc3RUb2tTdGFydCArIDEgfHwgdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMubGFzdFRva1N0YXJ0KSAhPT0gNDYpKSB7XG4gICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudHlwZSA9IHR5cGVzJDEubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51bmV4cGVjdGVkKCk7XG4gICAgfVxuICAgIHJldHVybiBub2RlXG4gIH07XG5cbiAgcHAkNS5wYXJzZVByaXZhdGVJZGVudCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLnByaXZhdGVJZCkge1xuICAgICAgbm9kZS5uYW1lID0gdGhpcy52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51bmV4cGVjdGVkKCk7XG4gICAgfVxuICAgIHRoaXMubmV4dCgpO1xuICAgIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIlByaXZhdGVJZGVudGlmaWVyXCIpO1xuXG4gICAgLy8gRm9yIHZhbGlkYXRpbmcgZXhpc3RlbmNlXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jaGVja1ByaXZhdGVGaWVsZHMpIHtcbiAgICAgIGlmICh0aGlzLnByaXZhdGVOYW1lU3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMucmFpc2Uobm9kZS5zdGFydCwgKFwiUHJpdmF0ZSBmaWVsZCAnI1wiICsgKG5vZGUubmFtZSkgKyBcIicgbXVzdCBiZSBkZWNsYXJlZCBpbiBhbiBlbmNsb3NpbmcgY2xhc3NcIikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcml2YXRlTmFtZVN0YWNrW3RoaXMucHJpdmF0ZU5hbWVTdGFjay5sZW5ndGggLSAxXS51c2VkLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVcbiAgfTtcblxuICAvLyBQYXJzZXMgeWllbGQgZXhwcmVzc2lvbiBpbnNpZGUgZ2VuZXJhdG9yLlxuXG4gIHBwJDUucGFyc2VZaWVsZCA9IGZ1bmN0aW9uKGZvckluaXQpIHtcbiAgICBpZiAoIXRoaXMueWllbGRQb3MpIHsgdGhpcy55aWVsZFBvcyA9IHRoaXMuc3RhcnQ7IH1cblxuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICB0aGlzLm5leHQoKTtcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLnNlbWkgfHwgdGhpcy5jYW5JbnNlcnRTZW1pY29sb24oKSB8fCAodGhpcy50eXBlICE9PSB0eXBlcyQxLnN0YXIgJiYgIXRoaXMudHlwZS5zdGFydHNFeHByKSkge1xuICAgICAgbm9kZS5kZWxlZ2F0ZSA9IGZhbHNlO1xuICAgICAgbm9kZS5hcmd1bWVudCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUuZGVsZWdhdGUgPSB0aGlzLmVhdCh0eXBlcyQxLnN0YXIpO1xuICAgICAgbm9kZS5hcmd1bWVudCA9IHRoaXMucGFyc2VNYXliZUFzc2lnbihmb3JJbml0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIllpZWxkRXhwcmVzc2lvblwiKVxuICB9O1xuXG4gIHBwJDUucGFyc2VBd2FpdCA9IGZ1bmN0aW9uKGZvckluaXQpIHtcbiAgICBpZiAoIXRoaXMuYXdhaXRQb3MpIHsgdGhpcy5hd2FpdFBvcyA9IHRoaXMuc3RhcnQ7IH1cblxuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICB0aGlzLm5leHQoKTtcbiAgICBub2RlLmFyZ3VtZW50ID0gdGhpcy5wYXJzZU1heWJlVW5hcnkobnVsbCwgdHJ1ZSwgZmFsc2UsIGZvckluaXQpO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJBd2FpdEV4cHJlc3Npb25cIilcbiAgfTtcblxuICB2YXIgcHAkNCA9IFBhcnNlci5wcm90b3R5cGU7XG5cbiAgLy8gVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHJhaXNlIGV4Y2VwdGlvbnMgb24gcGFyc2UgZXJyb3JzLiBJdFxuICAvLyB0YWtlcyBhbiBvZmZzZXQgaW50ZWdlciAoaW50byB0aGUgY3VycmVudCBgaW5wdXRgKSB0byBpbmRpY2F0ZVxuICAvLyB0aGUgbG9jYXRpb24gb2YgdGhlIGVycm9yLCBhdHRhY2hlcyB0aGUgcG9zaXRpb24gdG8gdGhlIGVuZFxuICAvLyBvZiB0aGUgZXJyb3IgbWVzc2FnZSwgYW5kIHRoZW4gcmFpc2VzIGEgYFN5bnRheEVycm9yYCB3aXRoIHRoYXRcbiAgLy8gbWVzc2FnZS5cblxuICBwcCQ0LnJhaXNlID0gZnVuY3Rpb24ocG9zLCBtZXNzYWdlKSB7XG4gICAgdmFyIGxvYyA9IGdldExpbmVJbmZvKHRoaXMuaW5wdXQsIHBvcyk7XG4gICAgbWVzc2FnZSArPSBcIiAoXCIgKyBsb2MubGluZSArIFwiOlwiICsgbG9jLmNvbHVtbiArIFwiKVwiO1xuICAgIHZhciBlcnIgPSBuZXcgU3ludGF4RXJyb3IobWVzc2FnZSk7XG4gICAgZXJyLnBvcyA9IHBvczsgZXJyLmxvYyA9IGxvYzsgZXJyLnJhaXNlZEF0ID0gdGhpcy5wb3M7XG4gICAgdGhyb3cgZXJyXG4gIH07XG5cbiAgcHAkNC5yYWlzZVJlY292ZXJhYmxlID0gcHAkNC5yYWlzZTtcblxuICBwcCQ0LmN1clBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5sb2NhdGlvbnMpIHtcbiAgICAgIHJldHVybiBuZXcgUG9zaXRpb24odGhpcy5jdXJMaW5lLCB0aGlzLnBvcyAtIHRoaXMubGluZVN0YXJ0KVxuICAgIH1cbiAgfTtcblxuICB2YXIgcHAkMyA9IFBhcnNlci5wcm90b3R5cGU7XG5cbiAgdmFyIFNjb3BlID0gZnVuY3Rpb24gU2NvcGUoZmxhZ3MpIHtcbiAgICB0aGlzLmZsYWdzID0gZmxhZ3M7XG4gICAgLy8gQSBsaXN0IG9mIHZhci1kZWNsYXJlZCBuYW1lcyBpbiB0aGUgY3VycmVudCBsZXhpY2FsIHNjb3BlXG4gICAgdGhpcy52YXIgPSBbXTtcbiAgICAvLyBBIGxpc3Qgb2YgbGV4aWNhbGx5LWRlY2xhcmVkIG5hbWVzIGluIHRoZSBjdXJyZW50IGxleGljYWwgc2NvcGVcbiAgICB0aGlzLmxleGljYWwgPSBbXTtcbiAgICAvLyBBIGxpc3Qgb2YgbGV4aWNhbGx5LWRlY2xhcmVkIEZ1bmN0aW9uRGVjbGFyYXRpb24gbmFtZXMgaW4gdGhlIGN1cnJlbnQgbGV4aWNhbCBzY29wZVxuICAgIHRoaXMuZnVuY3Rpb25zID0gW107XG4gICAgLy8gQSBzd2l0Y2ggdG8gZGlzYWxsb3cgdGhlIGlkZW50aWZpZXIgcmVmZXJlbmNlICdhcmd1bWVudHMnXG4gICAgdGhpcy5pbkNsYXNzRmllbGRJbml0ID0gZmFsc2U7XG4gIH07XG5cbiAgLy8gVGhlIGZ1bmN0aW9ucyBpbiB0aGlzIG1vZHVsZSBrZWVwIHRyYWNrIG9mIGRlY2xhcmVkIHZhcmlhYmxlcyBpbiB0aGUgY3VycmVudCBzY29wZSBpbiBvcmRlciB0byBkZXRlY3QgZHVwbGljYXRlIHZhcmlhYmxlIG5hbWVzLlxuXG4gIHBwJDMuZW50ZXJTY29wZSA9IGZ1bmN0aW9uKGZsYWdzKSB7XG4gICAgdGhpcy5zY29wZVN0YWNrLnB1c2gobmV3IFNjb3BlKGZsYWdzKSk7XG4gIH07XG5cbiAgcHAkMy5leGl0U2NvcGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG4gIH07XG5cbiAgLy8gVGhlIHNwZWMgc2F5czpcbiAgLy8gPiBBdCB0aGUgdG9wIGxldmVsIG9mIGEgZnVuY3Rpb24sIG9yIHNjcmlwdCwgZnVuY3Rpb24gZGVjbGFyYXRpb25zIGFyZVxuICAvLyA+IHRyZWF0ZWQgbGlrZSB2YXIgZGVjbGFyYXRpb25zIHJhdGhlciB0aGFuIGxpa2UgbGV4aWNhbCBkZWNsYXJhdGlvbnMuXG4gIHBwJDMudHJlYXRGdW5jdGlvbnNBc1ZhckluU2NvcGUgPSBmdW5jdGlvbihzY29wZSkge1xuICAgIHJldHVybiAoc2NvcGUuZmxhZ3MgJiBTQ09QRV9GVU5DVElPTikgfHwgIXRoaXMuaW5Nb2R1bGUgJiYgKHNjb3BlLmZsYWdzICYgU0NPUEVfVE9QKVxuICB9O1xuXG4gIHBwJDMuZGVjbGFyZU5hbWUgPSBmdW5jdGlvbihuYW1lLCBiaW5kaW5nVHlwZSwgcG9zKSB7XG4gICAgdmFyIHJlZGVjbGFyZWQgPSBmYWxzZTtcbiAgICBpZiAoYmluZGluZ1R5cGUgPT09IEJJTkRfTEVYSUNBTCkge1xuICAgICAgdmFyIHNjb3BlID0gdGhpcy5jdXJyZW50U2NvcGUoKTtcbiAgICAgIHJlZGVjbGFyZWQgPSBzY29wZS5sZXhpY2FsLmluZGV4T2YobmFtZSkgPiAtMSB8fCBzY29wZS5mdW5jdGlvbnMuaW5kZXhPZihuYW1lKSA+IC0xIHx8IHNjb3BlLnZhci5pbmRleE9mKG5hbWUpID4gLTE7XG4gICAgICBzY29wZS5sZXhpY2FsLnB1c2gobmFtZSk7XG4gICAgICBpZiAodGhpcy5pbk1vZHVsZSAmJiAoc2NvcGUuZmxhZ3MgJiBTQ09QRV9UT1ApKVxuICAgICAgICB7IGRlbGV0ZSB0aGlzLnVuZGVmaW5lZEV4cG9ydHNbbmFtZV07IH1cbiAgICB9IGVsc2UgaWYgKGJpbmRpbmdUeXBlID09PSBCSU5EX1NJTVBMRV9DQVRDSCkge1xuICAgICAgdmFyIHNjb3BlJDEgPSB0aGlzLmN1cnJlbnRTY29wZSgpO1xuICAgICAgc2NvcGUkMS5sZXhpY2FsLnB1c2gobmFtZSk7XG4gICAgfSBlbHNlIGlmIChiaW5kaW5nVHlwZSA9PT0gQklORF9GVU5DVElPTikge1xuICAgICAgdmFyIHNjb3BlJDIgPSB0aGlzLmN1cnJlbnRTY29wZSgpO1xuICAgICAgaWYgKHRoaXMudHJlYXRGdW5jdGlvbnNBc1ZhcilcbiAgICAgICAgeyByZWRlY2xhcmVkID0gc2NvcGUkMi5sZXhpY2FsLmluZGV4T2YobmFtZSkgPiAtMTsgfVxuICAgICAgZWxzZVxuICAgICAgICB7IHJlZGVjbGFyZWQgPSBzY29wZSQyLmxleGljYWwuaW5kZXhPZihuYW1lKSA+IC0xIHx8IHNjb3BlJDIudmFyLmluZGV4T2YobmFtZSkgPiAtMTsgfVxuICAgICAgc2NvcGUkMi5mdW5jdGlvbnMucHVzaChuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMuc2NvcGVTdGFjay5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgc2NvcGUkMyA9IHRoaXMuc2NvcGVTdGFja1tpXTtcbiAgICAgICAgaWYgKHNjb3BlJDMubGV4aWNhbC5pbmRleE9mKG5hbWUpID4gLTEgJiYgISgoc2NvcGUkMy5mbGFncyAmIFNDT1BFX1NJTVBMRV9DQVRDSCkgJiYgc2NvcGUkMy5sZXhpY2FsWzBdID09PSBuYW1lKSB8fFxuICAgICAgICAgICAgIXRoaXMudHJlYXRGdW5jdGlvbnNBc1ZhckluU2NvcGUoc2NvcGUkMykgJiYgc2NvcGUkMy5mdW5jdGlvbnMuaW5kZXhPZihuYW1lKSA+IC0xKSB7XG4gICAgICAgICAgcmVkZWNsYXJlZCA9IHRydWU7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBzY29wZSQzLnZhci5wdXNoKG5hbWUpO1xuICAgICAgICBpZiAodGhpcy5pbk1vZHVsZSAmJiAoc2NvcGUkMy5mbGFncyAmIFNDT1BFX1RPUCkpXG4gICAgICAgICAgeyBkZWxldGUgdGhpcy51bmRlZmluZWRFeHBvcnRzW25hbWVdOyB9XG4gICAgICAgIGlmIChzY29wZSQzLmZsYWdzICYgU0NPUEVfVkFSKSB7IGJyZWFrIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJlZGVjbGFyZWQpIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHBvcywgKFwiSWRlbnRpZmllciAnXCIgKyBuYW1lICsgXCInIGhhcyBhbHJlYWR5IGJlZW4gZGVjbGFyZWRcIikpOyB9XG4gIH07XG5cbiAgcHAkMy5jaGVja0xvY2FsRXhwb3J0ID0gZnVuY3Rpb24oaWQpIHtcbiAgICAvLyBzY29wZS5mdW5jdGlvbnMgbXVzdCBiZSBlbXB0eSBhcyBNb2R1bGUgY29kZSBpcyBhbHdheXMgc3RyaWN0LlxuICAgIGlmICh0aGlzLnNjb3BlU3RhY2tbMF0ubGV4aWNhbC5pbmRleE9mKGlkLm5hbWUpID09PSAtMSAmJlxuICAgICAgICB0aGlzLnNjb3BlU3RhY2tbMF0udmFyLmluZGV4T2YoaWQubmFtZSkgPT09IC0xKSB7XG4gICAgICB0aGlzLnVuZGVmaW5lZEV4cG9ydHNbaWQubmFtZV0gPSBpZDtcbiAgICB9XG4gIH07XG5cbiAgcHAkMy5jdXJyZW50U2NvcGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zY29wZVN0YWNrW3RoaXMuc2NvcGVTdGFjay5sZW5ndGggLSAxXVxuICB9O1xuXG4gIHBwJDMuY3VycmVudFZhclNjb3BlID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IHRoaXMuc2NvcGVTdGFjay5sZW5ndGggLSAxOzsgaS0tKSB7XG4gICAgICB2YXIgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2tbaV07XG4gICAgICBpZiAoc2NvcGUuZmxhZ3MgJiBTQ09QRV9WQVIpIHsgcmV0dXJuIHNjb3BlIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gQ291bGQgYmUgdXNlZnVsIGZvciBgdGhpc2AsIGBuZXcudGFyZ2V0YCwgYHN1cGVyKClgLCBgc3VwZXIucHJvcGVydHlgLCBhbmQgYHN1cGVyW3Byb3BlcnR5XWAuXG4gIHBwJDMuY3VycmVudFRoaXNTY29wZSA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSB0aGlzLnNjb3BlU3RhY2subGVuZ3RoIC0gMTs7IGktLSkge1xuICAgICAgdmFyIHNjb3BlID0gdGhpcy5zY29wZVN0YWNrW2ldO1xuICAgICAgaWYgKHNjb3BlLmZsYWdzICYgU0NPUEVfVkFSICYmICEoc2NvcGUuZmxhZ3MgJiBTQ09QRV9BUlJPVykpIHsgcmV0dXJuIHNjb3BlIH1cbiAgICB9XG4gIH07XG5cbiAgdmFyIE5vZGUgPSBmdW5jdGlvbiBOb2RlKHBhcnNlciwgcG9zLCBsb2MpIHtcbiAgICB0aGlzLnR5cGUgPSBcIlwiO1xuICAgIHRoaXMuc3RhcnQgPSBwb3M7XG4gICAgdGhpcy5lbmQgPSAwO1xuICAgIGlmIChwYXJzZXIub3B0aW9ucy5sb2NhdGlvbnMpXG4gICAgICB7IHRoaXMubG9jID0gbmV3IFNvdXJjZUxvY2F0aW9uKHBhcnNlciwgbG9jKTsgfVxuICAgIGlmIChwYXJzZXIub3B0aW9ucy5kaXJlY3RTb3VyY2VGaWxlKVxuICAgICAgeyB0aGlzLnNvdXJjZUZpbGUgPSBwYXJzZXIub3B0aW9ucy5kaXJlY3RTb3VyY2VGaWxlOyB9XG4gICAgaWYgKHBhcnNlci5vcHRpb25zLnJhbmdlcylcbiAgICAgIHsgdGhpcy5yYW5nZSA9IFtwb3MsIDBdOyB9XG4gIH07XG5cbiAgLy8gU3RhcnQgYW4gQVNUIG5vZGUsIGF0dGFjaGluZyBhIHN0YXJ0IG9mZnNldC5cblxuICB2YXIgcHAkMiA9IFBhcnNlci5wcm90b3R5cGU7XG5cbiAgcHAkMi5zdGFydE5vZGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IE5vZGUodGhpcywgdGhpcy5zdGFydCwgdGhpcy5zdGFydExvYylcbiAgfTtcblxuICBwcCQyLnN0YXJ0Tm9kZUF0ID0gZnVuY3Rpb24ocG9zLCBsb2MpIHtcbiAgICByZXR1cm4gbmV3IE5vZGUodGhpcywgcG9zLCBsb2MpXG4gIH07XG5cbiAgLy8gRmluaXNoIGFuIEFTVCBub2RlLCBhZGRpbmcgYHR5cGVgIGFuZCBgZW5kYCBwcm9wZXJ0aWVzLlxuXG4gIGZ1bmN0aW9uIGZpbmlzaE5vZGVBdChub2RlLCB0eXBlLCBwb3MsIGxvYykge1xuICAgIG5vZGUudHlwZSA9IHR5cGU7XG4gICAgbm9kZS5lbmQgPSBwb3M7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5sb2NhdGlvbnMpXG4gICAgICB7IG5vZGUubG9jLmVuZCA9IGxvYzsgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKVxuICAgICAgeyBub2RlLnJhbmdlWzFdID0gcG9zOyB9XG4gICAgcmV0dXJuIG5vZGVcbiAgfVxuXG4gIHBwJDIuZmluaXNoTm9kZSA9IGZ1bmN0aW9uKG5vZGUsIHR5cGUpIHtcbiAgICByZXR1cm4gZmluaXNoTm9kZUF0LmNhbGwodGhpcywgbm9kZSwgdHlwZSwgdGhpcy5sYXN0VG9rRW5kLCB0aGlzLmxhc3RUb2tFbmRMb2MpXG4gIH07XG5cbiAgLy8gRmluaXNoIG5vZGUgYXQgZ2l2ZW4gcG9zaXRpb25cblxuICBwcCQyLmZpbmlzaE5vZGVBdCA9IGZ1bmN0aW9uKG5vZGUsIHR5cGUsIHBvcywgbG9jKSB7XG4gICAgcmV0dXJuIGZpbmlzaE5vZGVBdC5jYWxsKHRoaXMsIG5vZGUsIHR5cGUsIHBvcywgbG9jKVxuICB9O1xuXG4gIHBwJDIuY29weU5vZGUgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdmFyIG5ld05vZGUgPSBuZXcgTm9kZSh0aGlzLCBub2RlLnN0YXJ0LCB0aGlzLnN0YXJ0TG9jKTtcbiAgICBmb3IgKHZhciBwcm9wIGluIG5vZGUpIHsgbmV3Tm9kZVtwcm9wXSA9IG5vZGVbcHJvcF07IH1cbiAgICByZXR1cm4gbmV3Tm9kZVxuICB9O1xuXG4gIC8vIFRoaXMgZmlsZSBjb250YWlucyBVbmljb2RlIHByb3BlcnRpZXMgZXh0cmFjdGVkIGZyb20gdGhlIEVDTUFTY3JpcHQgc3BlY2lmaWNhdGlvbi5cbiAgLy8gVGhlIGxpc3RzIGFyZSBleHRyYWN0ZWQgbGlrZSBzbzpcbiAgLy8gJCQoJyN0YWJsZS1iaW5hcnktdW5pY29kZS1wcm9wZXJ0aWVzID4gZmlndXJlID4gdGFibGUgPiB0Ym9keSA+IHRyID4gdGQ6bnRoLWNoaWxkKDEpIGNvZGUnKS5tYXAoZWwgPT4gZWwuaW5uZXJUZXh0KVxuXG4gIC8vICN0YWJsZS1iaW5hcnktdW5pY29kZS1wcm9wZXJ0aWVzXG4gIHZhciBlY21hOUJpbmFyeVByb3BlcnRpZXMgPSBcIkFTQ0lJIEFTQ0lJX0hleF9EaWdpdCBBSGV4IEFscGhhYmV0aWMgQWxwaGEgQW55IEFzc2lnbmVkIEJpZGlfQ29udHJvbCBCaWRpX0MgQmlkaV9NaXJyb3JlZCBCaWRpX00gQ2FzZV9JZ25vcmFibGUgQ0kgQ2FzZWQgQ2hhbmdlc19XaGVuX0Nhc2Vmb2xkZWQgQ1dDRiBDaGFuZ2VzX1doZW5fQ2FzZW1hcHBlZCBDV0NNIENoYW5nZXNfV2hlbl9Mb3dlcmNhc2VkIENXTCBDaGFuZ2VzX1doZW5fTkZLQ19DYXNlZm9sZGVkIENXS0NGIENoYW5nZXNfV2hlbl9UaXRsZWNhc2VkIENXVCBDaGFuZ2VzX1doZW5fVXBwZXJjYXNlZCBDV1UgRGFzaCBEZWZhdWx0X0lnbm9yYWJsZV9Db2RlX1BvaW50IERJIERlcHJlY2F0ZWQgRGVwIERpYWNyaXRpYyBEaWEgRW1vamkgRW1vamlfQ29tcG9uZW50IEVtb2ppX01vZGlmaWVyIEVtb2ppX01vZGlmaWVyX0Jhc2UgRW1vamlfUHJlc2VudGF0aW9uIEV4dGVuZGVyIEV4dCBHcmFwaGVtZV9CYXNlIEdyX0Jhc2UgR3JhcGhlbWVfRXh0ZW5kIEdyX0V4dCBIZXhfRGlnaXQgSGV4IElEU19CaW5hcnlfT3BlcmF0b3IgSURTQiBJRFNfVHJpbmFyeV9PcGVyYXRvciBJRFNUIElEX0NvbnRpbnVlIElEQyBJRF9TdGFydCBJRFMgSWRlb2dyYXBoaWMgSWRlbyBKb2luX0NvbnRyb2wgSm9pbl9DIExvZ2ljYWxfT3JkZXJfRXhjZXB0aW9uIExPRSBMb3dlcmNhc2UgTG93ZXIgTWF0aCBOb25jaGFyYWN0ZXJfQ29kZV9Qb2ludCBOQ2hhciBQYXR0ZXJuX1N5bnRheCBQYXRfU3luIFBhdHRlcm5fV2hpdGVfU3BhY2UgUGF0X1dTIFF1b3RhdGlvbl9NYXJrIFFNYXJrIFJhZGljYWwgUmVnaW9uYWxfSW5kaWNhdG9yIFJJIFNlbnRlbmNlX1Rlcm1pbmFsIFNUZXJtIFNvZnRfRG90dGVkIFNEIFRlcm1pbmFsX1B1bmN0dWF0aW9uIFRlcm0gVW5pZmllZF9JZGVvZ3JhcGggVUlkZW8gVXBwZXJjYXNlIFVwcGVyIFZhcmlhdGlvbl9TZWxlY3RvciBWUyBXaGl0ZV9TcGFjZSBzcGFjZSBYSURfQ29udGludWUgWElEQyBYSURfU3RhcnQgWElEU1wiO1xuICB2YXIgZWNtYTEwQmluYXJ5UHJvcGVydGllcyA9IGVjbWE5QmluYXJ5UHJvcGVydGllcyArIFwiIEV4dGVuZGVkX1BpY3RvZ3JhcGhpY1wiO1xuICB2YXIgZWNtYTExQmluYXJ5UHJvcGVydGllcyA9IGVjbWExMEJpbmFyeVByb3BlcnRpZXM7XG4gIHZhciBlY21hMTJCaW5hcnlQcm9wZXJ0aWVzID0gZWNtYTExQmluYXJ5UHJvcGVydGllcyArIFwiIEVCYXNlIEVDb21wIEVNb2QgRVByZXMgRXh0UGljdFwiO1xuICB2YXIgZWNtYTEzQmluYXJ5UHJvcGVydGllcyA9IGVjbWExMkJpbmFyeVByb3BlcnRpZXM7XG4gIHZhciBlY21hMTRCaW5hcnlQcm9wZXJ0aWVzID0gZWNtYTEzQmluYXJ5UHJvcGVydGllcztcblxuICB2YXIgdW5pY29kZUJpbmFyeVByb3BlcnRpZXMgPSB7XG4gICAgOTogZWNtYTlCaW5hcnlQcm9wZXJ0aWVzLFxuICAgIDEwOiBlY21hMTBCaW5hcnlQcm9wZXJ0aWVzLFxuICAgIDExOiBlY21hMTFCaW5hcnlQcm9wZXJ0aWVzLFxuICAgIDEyOiBlY21hMTJCaW5hcnlQcm9wZXJ0aWVzLFxuICAgIDEzOiBlY21hMTNCaW5hcnlQcm9wZXJ0aWVzLFxuICAgIDE0OiBlY21hMTRCaW5hcnlQcm9wZXJ0aWVzXG4gIH07XG5cbiAgLy8gI3RhYmxlLWJpbmFyeS11bmljb2RlLXByb3BlcnRpZXMtb2Ytc3RyaW5nc1xuICB2YXIgZWNtYTE0QmluYXJ5UHJvcGVydGllc09mU3RyaW5ncyA9IFwiQmFzaWNfRW1vamkgRW1vamlfS2V5Y2FwX1NlcXVlbmNlIFJHSV9FbW9qaV9Nb2RpZmllcl9TZXF1ZW5jZSBSR0lfRW1vamlfRmxhZ19TZXF1ZW5jZSBSR0lfRW1vamlfVGFnX1NlcXVlbmNlIFJHSV9FbW9qaV9aV0pfU2VxdWVuY2UgUkdJX0Vtb2ppXCI7XG5cbiAgdmFyIHVuaWNvZGVCaW5hcnlQcm9wZXJ0aWVzT2ZTdHJpbmdzID0ge1xuICAgIDk6IFwiXCIsXG4gICAgMTA6IFwiXCIsXG4gICAgMTE6IFwiXCIsXG4gICAgMTI6IFwiXCIsXG4gICAgMTM6IFwiXCIsXG4gICAgMTQ6IGVjbWExNEJpbmFyeVByb3BlcnRpZXNPZlN0cmluZ3NcbiAgfTtcblxuICAvLyAjdGFibGUtdW5pY29kZS1nZW5lcmFsLWNhdGVnb3J5LXZhbHVlc1xuICB2YXIgdW5pY29kZUdlbmVyYWxDYXRlZ29yeVZhbHVlcyA9IFwiQ2FzZWRfTGV0dGVyIExDIENsb3NlX1B1bmN0dWF0aW9uIFBlIENvbm5lY3Rvcl9QdW5jdHVhdGlvbiBQYyBDb250cm9sIENjIGNudHJsIEN1cnJlbmN5X1N5bWJvbCBTYyBEYXNoX1B1bmN0dWF0aW9uIFBkIERlY2ltYWxfTnVtYmVyIE5kIGRpZ2l0IEVuY2xvc2luZ19NYXJrIE1lIEZpbmFsX1B1bmN0dWF0aW9uIFBmIEZvcm1hdCBDZiBJbml0aWFsX1B1bmN0dWF0aW9uIFBpIExldHRlciBMIExldHRlcl9OdW1iZXIgTmwgTGluZV9TZXBhcmF0b3IgWmwgTG93ZXJjYXNlX0xldHRlciBMbCBNYXJrIE0gQ29tYmluaW5nX01hcmsgTWF0aF9TeW1ib2wgU20gTW9kaWZpZXJfTGV0dGVyIExtIE1vZGlmaWVyX1N5bWJvbCBTayBOb25zcGFjaW5nX01hcmsgTW4gTnVtYmVyIE4gT3Blbl9QdW5jdHVhdGlvbiBQcyBPdGhlciBDIE90aGVyX0xldHRlciBMbyBPdGhlcl9OdW1iZXIgTm8gT3RoZXJfUHVuY3R1YXRpb24gUG8gT3RoZXJfU3ltYm9sIFNvIFBhcmFncmFwaF9TZXBhcmF0b3IgWnAgUHJpdmF0ZV9Vc2UgQ28gUHVuY3R1YXRpb24gUCBwdW5jdCBTZXBhcmF0b3IgWiBTcGFjZV9TZXBhcmF0b3IgWnMgU3BhY2luZ19NYXJrIE1jIFN1cnJvZ2F0ZSBDcyBTeW1ib2wgUyBUaXRsZWNhc2VfTGV0dGVyIEx0IFVuYXNzaWduZWQgQ24gVXBwZXJjYXNlX0xldHRlciBMdVwiO1xuXG4gIC8vICN0YWJsZS11bmljb2RlLXNjcmlwdC12YWx1ZXNcbiAgdmFyIGVjbWE5U2NyaXB0VmFsdWVzID0gXCJBZGxhbSBBZGxtIEFob20gQW5hdG9saWFuX0hpZXJvZ2x5cGhzIEhsdXcgQXJhYmljIEFyYWIgQXJtZW5pYW4gQXJtbiBBdmVzdGFuIEF2c3QgQmFsaW5lc2UgQmFsaSBCYW11bSBCYW11IEJhc3NhX1ZhaCBCYXNzIEJhdGFrIEJhdGsgQmVuZ2FsaSBCZW5nIEJoYWlrc3VraSBCaGtzIEJvcG9tb2ZvIEJvcG8gQnJhaG1pIEJyYWggQnJhaWxsZSBCcmFpIEJ1Z2luZXNlIEJ1Z2kgQnVoaWQgQnVoZCBDYW5hZGlhbl9BYm9yaWdpbmFsIENhbnMgQ2FyaWFuIENhcmkgQ2F1Y2FzaWFuX0FsYmFuaWFuIEFnaGIgQ2hha21hIENha20gQ2hhbSBDaGFtIENoZXJva2VlIENoZXIgQ29tbW9uIFp5eXkgQ29wdGljIENvcHQgUWFhYyBDdW5laWZvcm0gWHN1eCBDeXByaW90IENwcnQgQ3lyaWxsaWMgQ3lybCBEZXNlcmV0IERzcnQgRGV2YW5hZ2FyaSBEZXZhIER1cGxveWFuIER1cGwgRWd5cHRpYW5fSGllcm9nbHlwaHMgRWd5cCBFbGJhc2FuIEVsYmEgRXRoaW9waWMgRXRoaSBHZW9yZ2lhbiBHZW9yIEdsYWdvbGl0aWMgR2xhZyBHb3RoaWMgR290aCBHcmFudGhhIEdyYW4gR3JlZWsgR3JlayBHdWphcmF0aSBHdWpyIEd1cm11a2hpIEd1cnUgSGFuIEhhbmkgSGFuZ3VsIEhhbmcgSGFudW5vbyBIYW5vIEhhdHJhbiBIYXRyIEhlYnJldyBIZWJyIEhpcmFnYW5hIEhpcmEgSW1wZXJpYWxfQXJhbWFpYyBBcm1pIEluaGVyaXRlZCBaaW5oIFFhYWkgSW5zY3JpcHRpb25hbF9QYWhsYXZpIFBobGkgSW5zY3JpcHRpb25hbF9QYXJ0aGlhbiBQcnRpIEphdmFuZXNlIEphdmEgS2FpdGhpIEt0aGkgS2FubmFkYSBLbmRhIEthdGFrYW5hIEthbmEgS2F5YWhfTGkgS2FsaSBLaGFyb3NodGhpIEtoYXIgS2htZXIgS2htciBLaG9qa2kgS2hvaiBLaHVkYXdhZGkgU2luZCBMYW8gTGFvbyBMYXRpbiBMYXRuIExlcGNoYSBMZXBjIExpbWJ1IExpbWIgTGluZWFyX0EgTGluYSBMaW5lYXJfQiBMaW5iIExpc3UgTGlzdSBMeWNpYW4gTHljaSBMeWRpYW4gTHlkaSBNYWhhamFuaSBNYWhqIE1hbGF5YWxhbSBNbHltIE1hbmRhaWMgTWFuZCBNYW5pY2hhZWFuIE1hbmkgTWFyY2hlbiBNYXJjIE1hc2FyYW1fR29uZGkgR29ubSBNZWV0ZWlfTWF5ZWsgTXRlaSBNZW5kZV9LaWtha3VpIE1lbmQgTWVyb2l0aWNfQ3Vyc2l2ZSBNZXJjIE1lcm9pdGljX0hpZXJvZ2x5cGhzIE1lcm8gTWlhbyBQbHJkIE1vZGkgTW9uZ29saWFuIE1vbmcgTXJvIE1yb28gTXVsdGFuaSBNdWx0IE15YW5tYXIgTXltciBOYWJhdGFlYW4gTmJhdCBOZXdfVGFpX0x1ZSBUYWx1IE5ld2EgTmV3YSBOa28gTmtvbyBOdXNodSBOc2h1IE9naGFtIE9nYW0gT2xfQ2hpa2kgT2xjayBPbGRfSHVuZ2FyaWFuIEh1bmcgT2xkX0l0YWxpYyBJdGFsIE9sZF9Ob3J0aF9BcmFiaWFuIE5hcmIgT2xkX1Blcm1pYyBQZXJtIE9sZF9QZXJzaWFuIFhwZW8gT2xkX1NvdXRoX0FyYWJpYW4gU2FyYiBPbGRfVHVya2ljIE9ya2ggT3JpeWEgT3J5YSBPc2FnZSBPc2dlIE9zbWFueWEgT3NtYSBQYWhhd2hfSG1vbmcgSG1uZyBQYWxteXJlbmUgUGFsbSBQYXVfQ2luX0hhdSBQYXVjIFBoYWdzX1BhIFBoYWcgUGhvZW5pY2lhbiBQaG54IFBzYWx0ZXJfUGFobGF2aSBQaGxwIFJlamFuZyBSam5nIFJ1bmljIFJ1bnIgU2FtYXJpdGFuIFNhbXIgU2F1cmFzaHRyYSBTYXVyIFNoYXJhZGEgU2hyZCBTaGF2aWFuIFNoYXcgU2lkZGhhbSBTaWRkIFNpZ25Xcml0aW5nIFNnbncgU2luaGFsYSBTaW5oIFNvcmFfU29tcGVuZyBTb3JhIFNveW9tYm8gU295byBTdW5kYW5lc2UgU3VuZCBTeWxvdGlfTmFncmkgU3lsbyBTeXJpYWMgU3lyYyBUYWdhbG9nIFRnbGcgVGFnYmFud2EgVGFnYiBUYWlfTGUgVGFsZSBUYWlfVGhhbSBMYW5hIFRhaV9WaWV0IFRhdnQgVGFrcmkgVGFrciBUYW1pbCBUYW1sIFRhbmd1dCBUYW5nIFRlbHVndSBUZWx1IFRoYWFuYSBUaGFhIFRoYWkgVGhhaSBUaWJldGFuIFRpYnQgVGlmaW5hZ2ggVGZuZyBUaXJodXRhIFRpcmggVWdhcml0aWMgVWdhciBWYWkgVmFpaSBXYXJhbmdfQ2l0aSBXYXJhIFlpIFlpaWkgWmFuYWJhemFyX1NxdWFyZSBaYW5iXCI7XG4gIHZhciBlY21hMTBTY3JpcHRWYWx1ZXMgPSBlY21hOVNjcmlwdFZhbHVlcyArIFwiIERvZ3JhIERvZ3IgR3VuamFsYV9Hb25kaSBHb25nIEhhbmlmaV9Sb2hpbmd5YSBSb2hnIE1ha2FzYXIgTWFrYSBNZWRlZmFpZHJpbiBNZWRmIE9sZF9Tb2dkaWFuIFNvZ28gU29nZGlhbiBTb2dkXCI7XG4gIHZhciBlY21hMTFTY3JpcHRWYWx1ZXMgPSBlY21hMTBTY3JpcHRWYWx1ZXMgKyBcIiBFbHltYWljIEVseW0gTmFuZGluYWdhcmkgTmFuZCBOeWlha2VuZ19QdWFjaHVlX0htb25nIEhtbnAgV2FuY2hvIFdjaG9cIjtcbiAgdmFyIGVjbWExMlNjcmlwdFZhbHVlcyA9IGVjbWExMVNjcmlwdFZhbHVlcyArIFwiIENob3Jhc21pYW4gQ2hycyBEaWFrIERpdmVzX0FrdXJ1IEtoaXRhbl9TbWFsbF9TY3JpcHQgS2l0cyBZZXppIFllemlkaVwiO1xuICB2YXIgZWNtYTEzU2NyaXB0VmFsdWVzID0gZWNtYTEyU2NyaXB0VmFsdWVzICsgXCIgQ3lwcm9fTWlub2FuIENwbW4gT2xkX1V5Z2h1ciBPdWdyIFRhbmdzYSBUbnNhIFRvdG8gVml0aGt1cWkgVml0aFwiO1xuICB2YXIgZWNtYTE0U2NyaXB0VmFsdWVzID0gZWNtYTEzU2NyaXB0VmFsdWVzICsgXCIgSHJrdCBLYXRha2FuYV9Pcl9IaXJhZ2FuYSBLYXdpIE5hZ19NdW5kYXJpIE5hZ20gVW5rbm93biBaenp6XCI7XG5cbiAgdmFyIHVuaWNvZGVTY3JpcHRWYWx1ZXMgPSB7XG4gICAgOTogZWNtYTlTY3JpcHRWYWx1ZXMsXG4gICAgMTA6IGVjbWExMFNjcmlwdFZhbHVlcyxcbiAgICAxMTogZWNtYTExU2NyaXB0VmFsdWVzLFxuICAgIDEyOiBlY21hMTJTY3JpcHRWYWx1ZXMsXG4gICAgMTM6IGVjbWExM1NjcmlwdFZhbHVlcyxcbiAgICAxNDogZWNtYTE0U2NyaXB0VmFsdWVzXG4gIH07XG5cbiAgdmFyIGRhdGEgPSB7fTtcbiAgZnVuY3Rpb24gYnVpbGRVbmljb2RlRGF0YShlY21hVmVyc2lvbikge1xuICAgIHZhciBkID0gZGF0YVtlY21hVmVyc2lvbl0gPSB7XG4gICAgICBiaW5hcnk6IHdvcmRzUmVnZXhwKHVuaWNvZGVCaW5hcnlQcm9wZXJ0aWVzW2VjbWFWZXJzaW9uXSArIFwiIFwiICsgdW5pY29kZUdlbmVyYWxDYXRlZ29yeVZhbHVlcyksXG4gICAgICBiaW5hcnlPZlN0cmluZ3M6IHdvcmRzUmVnZXhwKHVuaWNvZGVCaW5hcnlQcm9wZXJ0aWVzT2ZTdHJpbmdzW2VjbWFWZXJzaW9uXSksXG4gICAgICBub25CaW5hcnk6IHtcbiAgICAgICAgR2VuZXJhbF9DYXRlZ29yeTogd29yZHNSZWdleHAodW5pY29kZUdlbmVyYWxDYXRlZ29yeVZhbHVlcyksXG4gICAgICAgIFNjcmlwdDogd29yZHNSZWdleHAodW5pY29kZVNjcmlwdFZhbHVlc1tlY21hVmVyc2lvbl0pXG4gICAgICB9XG4gICAgfTtcbiAgICBkLm5vbkJpbmFyeS5TY3JpcHRfRXh0ZW5zaW9ucyA9IGQubm9uQmluYXJ5LlNjcmlwdDtcblxuICAgIGQubm9uQmluYXJ5LmdjID0gZC5ub25CaW5hcnkuR2VuZXJhbF9DYXRlZ29yeTtcbiAgICBkLm5vbkJpbmFyeS5zYyA9IGQubm9uQmluYXJ5LlNjcmlwdDtcbiAgICBkLm5vbkJpbmFyeS5zY3ggPSBkLm5vbkJpbmFyeS5TY3JpcHRfRXh0ZW5zaW9ucztcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsaXN0ID0gWzksIDEwLCAxMSwgMTIsIDEzLCAxNF07IGkgPCBsaXN0Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIGVjbWFWZXJzaW9uID0gbGlzdFtpXTtcblxuICAgIGJ1aWxkVW5pY29kZURhdGEoZWNtYVZlcnNpb24pO1xuICB9XG5cbiAgdmFyIHBwJDEgPSBQYXJzZXIucHJvdG90eXBlO1xuXG4gIC8vIFRyYWNrIGRpc2p1bmN0aW9uIHN0cnVjdHVyZSB0byBkZXRlcm1pbmUgd2hldGhlciBhIGR1cGxpY2F0ZVxuICAvLyBjYXB0dXJlIGdyb3VwIG5hbWUgaXMgYWxsb3dlZCBiZWNhdXNlIGl0IGlzIGluIGEgc2VwYXJhdGUgYnJhbmNoLlxuICB2YXIgQnJhbmNoSUQgPSBmdW5jdGlvbiBCcmFuY2hJRChwYXJlbnQsIGJhc2UpIHtcbiAgICAvLyBQYXJlbnQgZGlzanVuY3Rpb24gYnJhbmNoXG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgLy8gSWRlbnRpZmllcyB0aGlzIHNldCBvZiBzaWJsaW5nIGJyYW5jaGVzXG4gICAgdGhpcy5iYXNlID0gYmFzZSB8fCB0aGlzO1xuICB9O1xuXG4gIEJyYW5jaElELnByb3RvdHlwZS5zZXBhcmF0ZWRGcm9tID0gZnVuY3Rpb24gc2VwYXJhdGVkRnJvbSAoYWx0KSB7XG4gICAgLy8gQSBicmFuY2ggaXMgc2VwYXJhdGUgZnJvbSBhbm90aGVyIGJyYW5jaCBpZiB0aGV5IG9yIGFueSBvZlxuICAgIC8vIHRoZWlyIHBhcmVudHMgYXJlIHNpYmxpbmdzIGluIGEgZ2l2ZW4gZGlzanVuY3Rpb25cbiAgICBmb3IgKHZhciBzZWxmID0gdGhpczsgc2VsZjsgc2VsZiA9IHNlbGYucGFyZW50KSB7XG4gICAgICBmb3IgKHZhciBvdGhlciA9IGFsdDsgb3RoZXI7IG90aGVyID0gb3RoZXIucGFyZW50KSB7XG4gICAgICAgIGlmIChzZWxmLmJhc2UgPT09IG90aGVyLmJhc2UgJiYgc2VsZiAhPT0gb3RoZXIpIHsgcmV0dXJuIHRydWUgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICBCcmFuY2hJRC5wcm90b3R5cGUuc2libGluZyA9IGZ1bmN0aW9uIHNpYmxpbmcgKCkge1xuICAgIHJldHVybiBuZXcgQnJhbmNoSUQodGhpcy5wYXJlbnQsIHRoaXMuYmFzZSlcbiAgfTtcblxuICB2YXIgUmVnRXhwVmFsaWRhdGlvblN0YXRlID0gZnVuY3Rpb24gUmVnRXhwVmFsaWRhdGlvblN0YXRlKHBhcnNlcikge1xuICAgIHRoaXMucGFyc2VyID0gcGFyc2VyO1xuICAgIHRoaXMudmFsaWRGbGFncyA9IFwiZ2ltXCIgKyAocGFyc2VyLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNiA/IFwidXlcIiA6IFwiXCIpICsgKHBhcnNlci5vcHRpb25zLmVjbWFWZXJzaW9uID49IDkgPyBcInNcIiA6IFwiXCIpICsgKHBhcnNlci5vcHRpb25zLmVjbWFWZXJzaW9uID49IDEzID8gXCJkXCIgOiBcIlwiKSArIChwYXJzZXIub3B0aW9ucy5lY21hVmVyc2lvbiA+PSAxNSA/IFwidlwiIDogXCJcIik7XG4gICAgdGhpcy51bmljb2RlUHJvcGVydGllcyA9IGRhdGFbcGFyc2VyLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gMTQgPyAxNCA6IHBhcnNlci5vcHRpb25zLmVjbWFWZXJzaW9uXTtcbiAgICB0aGlzLnNvdXJjZSA9IFwiXCI7XG4gICAgdGhpcy5mbGFncyA9IFwiXCI7XG4gICAgdGhpcy5zdGFydCA9IDA7XG4gICAgdGhpcy5zd2l0Y2hVID0gZmFsc2U7XG4gICAgdGhpcy5zd2l0Y2hWID0gZmFsc2U7XG4gICAgdGhpcy5zd2l0Y2hOID0gZmFsc2U7XG4gICAgdGhpcy5wb3MgPSAwO1xuICAgIHRoaXMubGFzdEludFZhbHVlID0gMDtcbiAgICB0aGlzLmxhc3RTdHJpbmdWYWx1ZSA9IFwiXCI7XG4gICAgdGhpcy5sYXN0QXNzZXJ0aW9uSXNRdWFudGlmaWFibGUgPSBmYWxzZTtcbiAgICB0aGlzLm51bUNhcHR1cmluZ1BhcmVucyA9IDA7XG4gICAgdGhpcy5tYXhCYWNrUmVmZXJlbmNlID0gMDtcbiAgICB0aGlzLmdyb3VwTmFtZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRoaXMuYmFja1JlZmVyZW5jZU5hbWVzID0gW107XG4gICAgdGhpcy5icmFuY2hJRCA9IG51bGw7XG4gIH07XG5cbiAgUmVnRXhwVmFsaWRhdGlvblN0YXRlLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIHJlc2V0IChzdGFydCwgcGF0dGVybiwgZmxhZ3MpIHtcbiAgICB2YXIgdW5pY29kZVNldHMgPSBmbGFncy5pbmRleE9mKFwidlwiKSAhPT0gLTE7XG4gICAgdmFyIHVuaWNvZGUgPSBmbGFncy5pbmRleE9mKFwidVwiKSAhPT0gLTE7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0IHwgMDtcbiAgICB0aGlzLnNvdXJjZSA9IHBhdHRlcm4gKyBcIlwiO1xuICAgIHRoaXMuZmxhZ3MgPSBmbGFncztcbiAgICBpZiAodW5pY29kZVNldHMgJiYgdGhpcy5wYXJzZXIub3B0aW9ucy5lY21hVmVyc2lvbiA+PSAxNSkge1xuICAgICAgdGhpcy5zd2l0Y2hVID0gdHJ1ZTtcbiAgICAgIHRoaXMuc3dpdGNoViA9IHRydWU7XG4gICAgICB0aGlzLnN3aXRjaE4gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN3aXRjaFUgPSB1bmljb2RlICYmIHRoaXMucGFyc2VyLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNjtcbiAgICAgIHRoaXMuc3dpdGNoViA9IGZhbHNlO1xuICAgICAgdGhpcy5zd2l0Y2hOID0gdW5pY29kZSAmJiB0aGlzLnBhcnNlci5vcHRpb25zLmVjbWFWZXJzaW9uID49IDk7XG4gICAgfVxuICB9O1xuXG4gIFJlZ0V4cFZhbGlkYXRpb25TdGF0ZS5wcm90b3R5cGUucmFpc2UgPSBmdW5jdGlvbiByYWlzZSAobWVzc2FnZSkge1xuICAgIHRoaXMucGFyc2VyLnJhaXNlUmVjb3ZlcmFibGUodGhpcy5zdGFydCwgKFwiSW52YWxpZCByZWd1bGFyIGV4cHJlc3Npb246IC9cIiArICh0aGlzLnNvdXJjZSkgKyBcIi86IFwiICsgbWVzc2FnZSkpO1xuICB9O1xuXG4gIC8vIElmIHUgZmxhZyBpcyBnaXZlbiwgdGhpcyByZXR1cm5zIHRoZSBjb2RlIHBvaW50IGF0IHRoZSBpbmRleCAoaXQgY29tYmluZXMgYSBzdXJyb2dhdGUgcGFpcikuXG4gIC8vIE90aGVyd2lzZSwgdGhpcyByZXR1cm5zIHRoZSBjb2RlIHVuaXQgb2YgdGhlIGluZGV4IChjYW4gYmUgYSBwYXJ0IG9mIGEgc3Vycm9nYXRlIHBhaXIpLlxuICBSZWdFeHBWYWxpZGF0aW9uU3RhdGUucHJvdG90eXBlLmF0ID0gZnVuY3Rpb24gYXQgKGksIGZvcmNlVSkge1xuICAgICAgaWYgKCBmb3JjZVUgPT09IHZvaWQgMCApIGZvcmNlVSA9IGZhbHNlO1xuXG4gICAgdmFyIHMgPSB0aGlzLnNvdXJjZTtcbiAgICB2YXIgbCA9IHMubGVuZ3RoO1xuICAgIGlmIChpID49IGwpIHtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgICB2YXIgYyA9IHMuY2hhckNvZGVBdChpKTtcbiAgICBpZiAoIShmb3JjZVUgfHwgdGhpcy5zd2l0Y2hVKSB8fCBjIDw9IDB4RDdGRiB8fCBjID49IDB4RTAwMCB8fCBpICsgMSA+PSBsKSB7XG4gICAgICByZXR1cm4gY1xuICAgIH1cbiAgICB2YXIgbmV4dCA9IHMuY2hhckNvZGVBdChpICsgMSk7XG4gICAgcmV0dXJuIG5leHQgPj0gMHhEQzAwICYmIG5leHQgPD0gMHhERkZGID8gKGMgPDwgMTApICsgbmV4dCAtIDB4MzVGREMwMCA6IGNcbiAgfTtcblxuICBSZWdFeHBWYWxpZGF0aW9uU3RhdGUucHJvdG90eXBlLm5leHRJbmRleCA9IGZ1bmN0aW9uIG5leHRJbmRleCAoaSwgZm9yY2VVKSB7XG4gICAgICBpZiAoIGZvcmNlVSA9PT0gdm9pZCAwICkgZm9yY2VVID0gZmFsc2U7XG5cbiAgICB2YXIgcyA9IHRoaXMuc291cmNlO1xuICAgIHZhciBsID0gcy5sZW5ndGg7XG4gICAgaWYgKGkgPj0gbCkge1xuICAgICAgcmV0dXJuIGxcbiAgICB9XG4gICAgdmFyIGMgPSBzLmNoYXJDb2RlQXQoaSksIG5leHQ7XG4gICAgaWYgKCEoZm9yY2VVIHx8IHRoaXMuc3dpdGNoVSkgfHwgYyA8PSAweEQ3RkYgfHwgYyA+PSAweEUwMDAgfHwgaSArIDEgPj0gbCB8fFxuICAgICAgICAobmV4dCA9IHMuY2hhckNvZGVBdChpICsgMSkpIDwgMHhEQzAwIHx8IG5leHQgPiAweERGRkYpIHtcbiAgICAgIHJldHVybiBpICsgMVxuICAgIH1cbiAgICByZXR1cm4gaSArIDJcbiAgfTtcblxuICBSZWdFeHBWYWxpZGF0aW9uU3RhdGUucHJvdG90eXBlLmN1cnJlbnQgPSBmdW5jdGlvbiBjdXJyZW50IChmb3JjZVUpIHtcbiAgICAgIGlmICggZm9yY2VVID09PSB2b2lkIDAgKSBmb3JjZVUgPSBmYWxzZTtcblxuICAgIHJldHVybiB0aGlzLmF0KHRoaXMucG9zLCBmb3JjZVUpXG4gIH07XG5cbiAgUmVnRXhwVmFsaWRhdGlvblN0YXRlLnByb3RvdHlwZS5sb29rYWhlYWQgPSBmdW5jdGlvbiBsb29rYWhlYWQgKGZvcmNlVSkge1xuICAgICAgaWYgKCBmb3JjZVUgPT09IHZvaWQgMCApIGZvcmNlVSA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIHRoaXMuYXQodGhpcy5uZXh0SW5kZXgodGhpcy5wb3MsIGZvcmNlVSksIGZvcmNlVSlcbiAgfTtcblxuICBSZWdFeHBWYWxpZGF0aW9uU3RhdGUucHJvdG90eXBlLmFkdmFuY2UgPSBmdW5jdGlvbiBhZHZhbmNlIChmb3JjZVUpIHtcbiAgICAgIGlmICggZm9yY2VVID09PSB2b2lkIDAgKSBmb3JjZVUgPSBmYWxzZTtcblxuICAgIHRoaXMucG9zID0gdGhpcy5uZXh0SW5kZXgodGhpcy5wb3MsIGZvcmNlVSk7XG4gIH07XG5cbiAgUmVnRXhwVmFsaWRhdGlvblN0YXRlLnByb3RvdHlwZS5lYXQgPSBmdW5jdGlvbiBlYXQgKGNoLCBmb3JjZVUpIHtcbiAgICAgIGlmICggZm9yY2VVID09PSB2b2lkIDAgKSBmb3JjZVUgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLmN1cnJlbnQoZm9yY2VVKSA9PT0gY2gpIHtcbiAgICAgIHRoaXMuYWR2YW5jZShmb3JjZVUpO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgUmVnRXhwVmFsaWRhdGlvblN0YXRlLnByb3RvdHlwZS5lYXRDaGFycyA9IGZ1bmN0aW9uIGVhdENoYXJzIChjaHMsIGZvcmNlVSkge1xuICAgICAgaWYgKCBmb3JjZVUgPT09IHZvaWQgMCApIGZvcmNlVSA9IGZhbHNlO1xuXG4gICAgdmFyIHBvcyA9IHRoaXMucG9zO1xuICAgIGZvciAodmFyIGkgPSAwLCBsaXN0ID0gY2hzOyBpIDwgbGlzdC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdmFyIGNoID0gbGlzdFtpXTtcblxuICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuYXQocG9zLCBmb3JjZVUpO1xuICAgICAgaWYgKGN1cnJlbnQgPT09IC0xIHx8IGN1cnJlbnQgIT09IGNoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgcG9zID0gdGhpcy5uZXh0SW5kZXgocG9zLCBmb3JjZVUpO1xuICAgIH1cbiAgICB0aGlzLnBvcyA9IHBvcztcbiAgICByZXR1cm4gdHJ1ZVxuICB9O1xuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSB0aGUgZmxhZ3MgcGFydCBvZiBhIGdpdmVuIFJlZ0V4cExpdGVyYWwuXG4gICAqXG4gICAqIEBwYXJhbSB7UmVnRXhwVmFsaWRhdGlvblN0YXRlfSBzdGF0ZSBUaGUgc3RhdGUgdG8gdmFsaWRhdGUgUmVnRXhwLlxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIHBwJDEudmFsaWRhdGVSZWdFeHBGbGFncyA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIHZhbGlkRmxhZ3MgPSBzdGF0ZS52YWxpZEZsYWdzO1xuICAgIHZhciBmbGFncyA9IHN0YXRlLmZsYWdzO1xuXG4gICAgdmFyIHUgPSBmYWxzZTtcbiAgICB2YXIgdiA9IGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmbGFncy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGZsYWcgPSBmbGFncy5jaGFyQXQoaSk7XG4gICAgICBpZiAodmFsaWRGbGFncy5pbmRleE9mKGZsYWcpID09PSAtMSkge1xuICAgICAgICB0aGlzLnJhaXNlKHN0YXRlLnN0YXJ0LCBcIkludmFsaWQgcmVndWxhciBleHByZXNzaW9uIGZsYWdcIik7XG4gICAgICB9XG4gICAgICBpZiAoZmxhZ3MuaW5kZXhPZihmbGFnLCBpICsgMSkgPiAtMSkge1xuICAgICAgICB0aGlzLnJhaXNlKHN0YXRlLnN0YXJ0LCBcIkR1cGxpY2F0ZSByZWd1bGFyIGV4cHJlc3Npb24gZmxhZ1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChmbGFnID09PSBcInVcIikgeyB1ID0gdHJ1ZTsgfVxuICAgICAgaWYgKGZsYWcgPT09IFwidlwiKSB7IHYgPSB0cnVlOyB9XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gMTUgJiYgdSAmJiB2KSB7XG4gICAgICB0aGlzLnJhaXNlKHN0YXRlLnN0YXJ0LCBcIkludmFsaWQgcmVndWxhciBleHByZXNzaW9uIGZsYWdcIik7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGhhc1Byb3Aob2JqKSB7XG4gICAgZm9yICh2YXIgXyBpbiBvYmopIHsgcmV0dXJuIHRydWUgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHRoZSBwYXR0ZXJuIHBhcnQgb2YgYSBnaXZlbiBSZWdFeHBMaXRlcmFsLlxuICAgKlxuICAgKiBAcGFyYW0ge1JlZ0V4cFZhbGlkYXRpb25TdGF0ZX0gc3RhdGUgVGhlIHN0YXRlIHRvIHZhbGlkYXRlIFJlZ0V4cC5cbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBwcCQxLnZhbGlkYXRlUmVnRXhwUGF0dGVybiA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdGhpcy5yZWdleHBfcGF0dGVybihzdGF0ZSk7XG5cbiAgICAvLyBUaGUgZ29hbCBzeW1ib2wgZm9yIHRoZSBwYXJzZSBpcyB8UGF0dGVyblt+VSwgfk5dfC4gSWYgdGhlIHJlc3VsdCBvZlxuICAgIC8vIHBhcnNpbmcgY29udGFpbnMgYSB8R3JvdXBOYW1lfCwgcmVwYXJzZSB3aXRoIHRoZSBnb2FsIHN5bWJvbFxuICAgIC8vIHxQYXR0ZXJuW35VLCArTl18IGFuZCB1c2UgdGhpcyByZXN1bHQgaW5zdGVhZC4gVGhyb3cgYSAqU3ludGF4RXJyb3IqXG4gICAgLy8gZXhjZXB0aW9uIGlmIF9QXyBkaWQgbm90IGNvbmZvcm0gdG8gdGhlIGdyYW1tYXIsIGlmIGFueSBlbGVtZW50cyBvZiBfUF9cbiAgICAvLyB3ZXJlIG5vdCBtYXRjaGVkIGJ5IHRoZSBwYXJzZSwgb3IgaWYgYW55IEVhcmx5IEVycm9yIGNvbmRpdGlvbnMgZXhpc3QuXG4gICAgaWYgKCFzdGF0ZS5zd2l0Y2hOICYmIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA5ICYmIGhhc1Byb3Aoc3RhdGUuZ3JvdXBOYW1lcykpIHtcbiAgICAgIHN0YXRlLnN3aXRjaE4gPSB0cnVlO1xuICAgICAgdGhpcy5yZWdleHBfcGF0dGVybihzdGF0ZSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLVBhdHRlcm5cbiAgcHAkMS5yZWdleHBfcGF0dGVybiA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgc3RhdGUucG9zID0gMDtcbiAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAwO1xuICAgIHN0YXRlLmxhc3RTdHJpbmdWYWx1ZSA9IFwiXCI7XG4gICAgc3RhdGUubGFzdEFzc2VydGlvbklzUXVhbnRpZmlhYmxlID0gZmFsc2U7XG4gICAgc3RhdGUubnVtQ2FwdHVyaW5nUGFyZW5zID0gMDtcbiAgICBzdGF0ZS5tYXhCYWNrUmVmZXJlbmNlID0gMDtcbiAgICBzdGF0ZS5ncm91cE5hbWVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBzdGF0ZS5iYWNrUmVmZXJlbmNlTmFtZXMubGVuZ3RoID0gMDtcbiAgICBzdGF0ZS5icmFuY2hJRCA9IG51bGw7XG5cbiAgICB0aGlzLnJlZ2V4cF9kaXNqdW5jdGlvbihzdGF0ZSk7XG5cbiAgICBpZiAoc3RhdGUucG9zICE9PSBzdGF0ZS5zb3VyY2UubGVuZ3RoKSB7XG4gICAgICAvLyBNYWtlIHRoZSBzYW1lIG1lc3NhZ2VzIGFzIFY4LlxuICAgICAgaWYgKHN0YXRlLmVhdCgweDI5IC8qICkgKi8pKSB7XG4gICAgICAgIHN0YXRlLnJhaXNlKFwiVW5tYXRjaGVkICcpJ1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS5lYXQoMHg1RCAvKiBdICovKSB8fCBzdGF0ZS5lYXQoMHg3RCAvKiB9ICovKSkge1xuICAgICAgICBzdGF0ZS5yYWlzZShcIkxvbmUgcXVhbnRpZmllciBicmFja2V0c1wiKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHN0YXRlLm1heEJhY2tSZWZlcmVuY2UgPiBzdGF0ZS5udW1DYXB0dXJpbmdQYXJlbnMpIHtcbiAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBlc2NhcGVcIik7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBsaXN0ID0gc3RhdGUuYmFja1JlZmVyZW5jZU5hbWVzOyBpIDwgbGlzdC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdmFyIG5hbWUgPSBsaXN0W2ldO1xuXG4gICAgICBpZiAoIXN0YXRlLmdyb3VwTmFtZXNbbmFtZV0pIHtcbiAgICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIG5hbWVkIGNhcHR1cmUgcmVmZXJlbmNlZFwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtRGlzanVuY3Rpb25cbiAgcHAkMS5yZWdleHBfZGlzanVuY3Rpb24gPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciB0cmFja0Rpc2p1bmN0aW9uID0gdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDE2O1xuICAgIGlmICh0cmFja0Rpc2p1bmN0aW9uKSB7IHN0YXRlLmJyYW5jaElEID0gbmV3IEJyYW5jaElEKHN0YXRlLmJyYW5jaElELCBudWxsKTsgfVxuICAgIHRoaXMucmVnZXhwX2FsdGVybmF0aXZlKHN0YXRlKTtcbiAgICB3aGlsZSAoc3RhdGUuZWF0KDB4N0MgLyogfCAqLykpIHtcbiAgICAgIGlmICh0cmFja0Rpc2p1bmN0aW9uKSB7IHN0YXRlLmJyYW5jaElEID0gc3RhdGUuYnJhbmNoSUQuc2libGluZygpOyB9XG4gICAgICB0aGlzLnJlZ2V4cF9hbHRlcm5hdGl2ZShzdGF0ZSk7XG4gICAgfVxuICAgIGlmICh0cmFja0Rpc2p1bmN0aW9uKSB7IHN0YXRlLmJyYW5jaElEID0gc3RhdGUuYnJhbmNoSUQucGFyZW50OyB9XG5cbiAgICAvLyBNYWtlIHRoZSBzYW1lIG1lc3NhZ2UgYXMgVjguXG4gICAgaWYgKHRoaXMucmVnZXhwX2VhdFF1YW50aWZpZXIoc3RhdGUsIHRydWUpKSB7XG4gICAgICBzdGF0ZS5yYWlzZShcIk5vdGhpbmcgdG8gcmVwZWF0XCIpO1xuICAgIH1cbiAgICBpZiAoc3RhdGUuZWF0KDB4N0IgLyogeyAqLykpIHtcbiAgICAgIHN0YXRlLnJhaXNlKFwiTG9uZSBxdWFudGlmaWVyIGJyYWNrZXRzXCIpO1xuICAgIH1cbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1BbHRlcm5hdGl2ZVxuICBwcCQxLnJlZ2V4cF9hbHRlcm5hdGl2ZSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgd2hpbGUgKHN0YXRlLnBvcyA8IHN0YXRlLnNvdXJjZS5sZW5ndGggJiYgdGhpcy5yZWdleHBfZWF0VGVybShzdGF0ZSkpIHt9XG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtYW5uZXhCLVRlcm1cbiAgcHAkMS5yZWdleHBfZWF0VGVybSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgaWYgKHRoaXMucmVnZXhwX2VhdEFzc2VydGlvbihzdGF0ZSkpIHtcbiAgICAgIC8vIEhhbmRsZSBgUXVhbnRpZmlhYmxlQXNzZXJ0aW9uIFF1YW50aWZpZXJgIGFsdGVybmF0aXZlLlxuICAgICAgLy8gYHN0YXRlLmxhc3RBc3NlcnRpb25Jc1F1YW50aWZpYWJsZWAgaXMgdHJ1ZSBpZiB0aGUgbGFzdCBlYXRlbiBBc3NlcnRpb25cbiAgICAgIC8vIGlzIGEgUXVhbnRpZmlhYmxlQXNzZXJ0aW9uLlxuICAgICAgaWYgKHN0YXRlLmxhc3RBc3NlcnRpb25Jc1F1YW50aWZpYWJsZSAmJiB0aGlzLnJlZ2V4cF9lYXRRdWFudGlmaWVyKHN0YXRlKSkge1xuICAgICAgICAvLyBNYWtlIHRoZSBzYW1lIG1lc3NhZ2UgYXMgVjguXG4gICAgICAgIGlmIChzdGF0ZS5zd2l0Y2hVKSB7XG4gICAgICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIHF1YW50aWZpZXJcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLnN3aXRjaFUgPyB0aGlzLnJlZ2V4cF9lYXRBdG9tKHN0YXRlKSA6IHRoaXMucmVnZXhwX2VhdEV4dGVuZGVkQXRvbShzdGF0ZSkpIHtcbiAgICAgIHRoaXMucmVnZXhwX2VhdFF1YW50aWZpZXIoc3RhdGUpO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1hbm5leEItQXNzZXJ0aW9uXG4gIHBwJDEucmVnZXhwX2VhdEFzc2VydGlvbiA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIHN0YXJ0ID0gc3RhdGUucG9zO1xuICAgIHN0YXRlLmxhc3RBc3NlcnRpb25Jc1F1YW50aWZpYWJsZSA9IGZhbHNlO1xuXG4gICAgLy8gXiwgJFxuICAgIGlmIChzdGF0ZS5lYXQoMHg1RSAvKiBeICovKSB8fCBzdGF0ZS5lYXQoMHgyNCAvKiAkICovKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICAvLyBcXGIgXFxCXG4gICAgaWYgKHN0YXRlLmVhdCgweDVDIC8qIFxcICovKSkge1xuICAgICAgaWYgKHN0YXRlLmVhdCgweDQyIC8qIEIgKi8pIHx8IHN0YXRlLmVhdCgweDYyIC8qIGIgKi8pKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICB9XG5cbiAgICAvLyBMb29rYWhlYWQgLyBMb29rYmVoaW5kXG4gICAgaWYgKHN0YXRlLmVhdCgweDI4IC8qICggKi8pICYmIHN0YXRlLmVhdCgweDNGIC8qID8gKi8pKSB7XG4gICAgICB2YXIgbG9va2JlaGluZCA9IGZhbHNlO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA5KSB7XG4gICAgICAgIGxvb2tiZWhpbmQgPSBzdGF0ZS5lYXQoMHgzQyAvKiA8ICovKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS5lYXQoMHgzRCAvKiA9ICovKSB8fCBzdGF0ZS5lYXQoMHgyMSAvKiAhICovKSkge1xuICAgICAgICB0aGlzLnJlZ2V4cF9kaXNqdW5jdGlvbihzdGF0ZSk7XG4gICAgICAgIGlmICghc3RhdGUuZWF0KDB4MjkgLyogKSAqLykpIHtcbiAgICAgICAgICBzdGF0ZS5yYWlzZShcIlVudGVybWluYXRlZCBncm91cFwiKTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5sYXN0QXNzZXJ0aW9uSXNRdWFudGlmaWFibGUgPSAhbG9va2JlaGluZDtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1RdWFudGlmaWVyXG4gIHBwJDEucmVnZXhwX2VhdFF1YW50aWZpZXIgPSBmdW5jdGlvbihzdGF0ZSwgbm9FcnJvcikge1xuICAgIGlmICggbm9FcnJvciA9PT0gdm9pZCAwICkgbm9FcnJvciA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMucmVnZXhwX2VhdFF1YW50aWZpZXJQcmVmaXgoc3RhdGUsIG5vRXJyb3IpKSB7XG4gICAgICBzdGF0ZS5lYXQoMHgzRiAvKiA/ICovKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLVF1YW50aWZpZXJQcmVmaXhcbiAgcHAkMS5yZWdleHBfZWF0UXVhbnRpZmllclByZWZpeCA9IGZ1bmN0aW9uKHN0YXRlLCBub0Vycm9yKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHN0YXRlLmVhdCgweDJBIC8qICogKi8pIHx8XG4gICAgICBzdGF0ZS5lYXQoMHgyQiAvKiArICovKSB8fFxuICAgICAgc3RhdGUuZWF0KDB4M0YgLyogPyAqLykgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdEJyYWNlZFF1YW50aWZpZXIoc3RhdGUsIG5vRXJyb3IpXG4gICAgKVxuICB9O1xuICBwcCQxLnJlZ2V4cF9lYXRCcmFjZWRRdWFudGlmaWVyID0gZnVuY3Rpb24oc3RhdGUsIG5vRXJyb3IpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgaWYgKHN0YXRlLmVhdCgweDdCIC8qIHsgKi8pKSB7XG4gICAgICB2YXIgbWluID0gMCwgbWF4ID0gLTE7XG4gICAgICBpZiAodGhpcy5yZWdleHBfZWF0RGVjaW1hbERpZ2l0cyhzdGF0ZSkpIHtcbiAgICAgICAgbWluID0gc3RhdGUubGFzdEludFZhbHVlO1xuICAgICAgICBpZiAoc3RhdGUuZWF0KDB4MkMgLyogLCAqLykgJiYgdGhpcy5yZWdleHBfZWF0RGVjaW1hbERpZ2l0cyhzdGF0ZSkpIHtcbiAgICAgICAgICBtYXggPSBzdGF0ZS5sYXN0SW50VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRlLmVhdCgweDdEIC8qIH0gKi8pKSB7XG4gICAgICAgICAgLy8gU3ludGF4RXJyb3IgaW4gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3NlYy10ZXJtXG4gICAgICAgICAgaWYgKG1heCAhPT0gLTEgJiYgbWF4IDwgbWluICYmICFub0Vycm9yKSB7XG4gICAgICAgICAgICBzdGF0ZS5yYWlzZShcIm51bWJlcnMgb3V0IG9mIG9yZGVyIGluIHt9IHF1YW50aWZpZXJcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS5zd2l0Y2hVICYmICFub0Vycm9yKSB7XG4gICAgICAgIHN0YXRlLnJhaXNlKFwiSW5jb21wbGV0ZSBxdWFudGlmaWVyXCIpO1xuICAgICAgfVxuICAgICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLUF0b21cbiAgcHAkMS5yZWdleHBfZWF0QXRvbSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMucmVnZXhwX2VhdFBhdHRlcm5DaGFyYWN0ZXJzKHN0YXRlKSB8fFxuICAgICAgc3RhdGUuZWF0KDB4MkUgLyogLiAqLykgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdFJldmVyc2VTb2xpZHVzQXRvbUVzY2FwZShzdGF0ZSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdENoYXJhY3RlckNsYXNzKHN0YXRlKSB8fFxuICAgICAgdGhpcy5yZWdleHBfZWF0VW5jYXB0dXJpbmdHcm91cChzdGF0ZSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdENhcHR1cmluZ0dyb3VwKHN0YXRlKVxuICAgIClcbiAgfTtcbiAgcHAkMS5yZWdleHBfZWF0UmV2ZXJzZVNvbGlkdXNBdG9tRXNjYXBlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgaWYgKHN0YXRlLmVhdCgweDVDIC8qIFxcICovKSkge1xuICAgICAgaWYgKHRoaXMucmVnZXhwX2VhdEF0b21Fc2NhcGUoc3RhdGUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG4gIHBwJDEucmVnZXhwX2VhdFVuY2FwdHVyaW5nR3JvdXAgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcbiAgICBpZiAoc3RhdGUuZWF0KDB4MjggLyogKCAqLykpIHtcbiAgICAgIGlmIChzdGF0ZS5lYXQoMHgzRiAvKiA/ICovKSAmJiBzdGF0ZS5lYXQoMHgzQSAvKiA6ICovKSkge1xuICAgICAgICB0aGlzLnJlZ2V4cF9kaXNqdW5jdGlvbihzdGF0ZSk7XG4gICAgICAgIGlmIChzdGF0ZS5lYXQoMHgyOSAvKiApICovKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUucmFpc2UoXCJVbnRlcm1pbmF0ZWQgZ3JvdXBcIik7XG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG4gIHBwJDEucmVnZXhwX2VhdENhcHR1cmluZ0dyb3VwID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuZWF0KDB4MjggLyogKCAqLykpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOSkge1xuICAgICAgICB0aGlzLnJlZ2V4cF9ncm91cFNwZWNpZmllcihzdGF0ZSk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLmN1cnJlbnQoKSA9PT0gMHgzRiAvKiA/ICovKSB7XG4gICAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBncm91cFwiKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVnZXhwX2Rpc2p1bmN0aW9uKHN0YXRlKTtcbiAgICAgIGlmIChzdGF0ZS5lYXQoMHgyOSAvKiApICovKSkge1xuICAgICAgICBzdGF0ZS5udW1DYXB0dXJpbmdQYXJlbnMgKz0gMTtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIHN0YXRlLnJhaXNlKFwiVW50ZXJtaW5hdGVkIGdyb3VwXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1hbm5leEItRXh0ZW5kZWRBdG9tXG4gIHBwJDEucmVnZXhwX2VhdEV4dGVuZGVkQXRvbSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHN0YXRlLmVhdCgweDJFIC8qIC4gKi8pIHx8XG4gICAgICB0aGlzLnJlZ2V4cF9lYXRSZXZlcnNlU29saWR1c0F0b21Fc2NhcGUoc3RhdGUpIHx8XG4gICAgICB0aGlzLnJlZ2V4cF9lYXRDaGFyYWN0ZXJDbGFzcyhzdGF0ZSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdFVuY2FwdHVyaW5nR3JvdXAoc3RhdGUpIHx8XG4gICAgICB0aGlzLnJlZ2V4cF9lYXRDYXB0dXJpbmdHcm91cChzdGF0ZSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdEludmFsaWRCcmFjZWRRdWFudGlmaWVyKHN0YXRlKSB8fFxuICAgICAgdGhpcy5yZWdleHBfZWF0RXh0ZW5kZWRQYXR0ZXJuQ2hhcmFjdGVyKHN0YXRlKVxuICAgIClcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1hbm5leEItSW52YWxpZEJyYWNlZFF1YW50aWZpZXJcbiAgcHAkMS5yZWdleHBfZWF0SW52YWxpZEJyYWNlZFF1YW50aWZpZXIgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRCcmFjZWRRdWFudGlmaWVyKHN0YXRlLCB0cnVlKSkge1xuICAgICAgc3RhdGUucmFpc2UoXCJOb3RoaW5nIHRvIHJlcGVhdFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtU3ludGF4Q2hhcmFjdGVyXG4gIHBwJDEucmVnZXhwX2VhdFN5bnRheENoYXJhY3RlciA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RhdGUuY3VycmVudCgpO1xuICAgIGlmIChpc1N5bnRheENoYXJhY3RlcihjaCkpIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IGNoO1xuICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG4gIGZ1bmN0aW9uIGlzU3ludGF4Q2hhcmFjdGVyKGNoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGNoID09PSAweDI0IC8qICQgKi8gfHxcbiAgICAgIGNoID49IDB4MjggLyogKCAqLyAmJiBjaCA8PSAweDJCIC8qICsgKi8gfHxcbiAgICAgIGNoID09PSAweDJFIC8qIC4gKi8gfHxcbiAgICAgIGNoID09PSAweDNGIC8qID8gKi8gfHxcbiAgICAgIGNoID49IDB4NUIgLyogWyAqLyAmJiBjaCA8PSAweDVFIC8qIF4gKi8gfHxcbiAgICAgIGNoID49IDB4N0IgLyogeyAqLyAmJiBjaCA8PSAweDdEIC8qIH0gKi9cbiAgICApXG4gIH1cblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1QYXR0ZXJuQ2hhcmFjdGVyXG4gIC8vIEJ1dCBlYXQgZWFnZXIuXG4gIHBwJDEucmVnZXhwX2VhdFBhdHRlcm5DaGFyYWN0ZXJzID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgdmFyIGNoID0gMDtcbiAgICB3aGlsZSAoKGNoID0gc3RhdGUuY3VycmVudCgpKSAhPT0gLTEgJiYgIWlzU3ludGF4Q2hhcmFjdGVyKGNoKSkge1xuICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGUucG9zICE9PSBzdGFydFxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLWFubmV4Qi1FeHRlbmRlZFBhdHRlcm5DaGFyYWN0ZXJcbiAgcHAkMS5yZWdleHBfZWF0RXh0ZW5kZWRQYXR0ZXJuQ2hhcmFjdGVyID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgY2ggPSBzdGF0ZS5jdXJyZW50KCk7XG4gICAgaWYgKFxuICAgICAgY2ggIT09IC0xICYmXG4gICAgICBjaCAhPT0gMHgyNCAvKiAkICovICYmXG4gICAgICAhKGNoID49IDB4MjggLyogKCAqLyAmJiBjaCA8PSAweDJCIC8qICsgKi8pICYmXG4gICAgICBjaCAhPT0gMHgyRSAvKiAuICovICYmXG4gICAgICBjaCAhPT0gMHgzRiAvKiA/ICovICYmXG4gICAgICBjaCAhPT0gMHg1QiAvKiBbICovICYmXG4gICAgICBjaCAhPT0gMHg1RSAvKiBeICovICYmXG4gICAgICBjaCAhPT0gMHg3QyAvKiB8ICovXG4gICAgKSB7XG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBHcm91cFNwZWNpZmllciA6OlxuICAvLyAgIFtlbXB0eV1cbiAgLy8gICBgP2AgR3JvdXBOYW1lXG4gIHBwJDEucmVnZXhwX2dyb3VwU3BlY2lmaWVyID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuZWF0KDB4M0YgLyogPyAqLykpIHtcbiAgICAgIGlmICghdGhpcy5yZWdleHBfZWF0R3JvdXBOYW1lKHN0YXRlKSkgeyBzdGF0ZS5yYWlzZShcIkludmFsaWQgZ3JvdXBcIik7IH1cbiAgICAgIHZhciB0cmFja0Rpc2p1bmN0aW9uID0gdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDE2O1xuICAgICAgdmFyIGtub3duID0gc3RhdGUuZ3JvdXBOYW1lc1tzdGF0ZS5sYXN0U3RyaW5nVmFsdWVdO1xuICAgICAgaWYgKGtub3duKSB7XG4gICAgICAgIGlmICh0cmFja0Rpc2p1bmN0aW9uKSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxpc3QgPSBrbm93bjsgaSA8IGxpc3QubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIHZhciBhbHRJRCA9IGxpc3RbaV07XG5cbiAgICAgICAgICAgIGlmICghYWx0SUQuc2VwYXJhdGVkRnJvbShzdGF0ZS5icmFuY2hJRCkpXG4gICAgICAgICAgICAgIHsgc3RhdGUucmFpc2UoXCJEdXBsaWNhdGUgY2FwdHVyZSBncm91cCBuYW1lXCIpOyB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXRlLnJhaXNlKFwiRHVwbGljYXRlIGNhcHR1cmUgZ3JvdXAgbmFtZVwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRyYWNrRGlzanVuY3Rpb24pIHtcbiAgICAgICAgKGtub3duIHx8IChzdGF0ZS5ncm91cE5hbWVzW3N0YXRlLmxhc3RTdHJpbmdWYWx1ZV0gPSBbXSkpLnB1c2goc3RhdGUuYnJhbmNoSUQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUuZ3JvdXBOYW1lc1tzdGF0ZS5sYXN0U3RyaW5nVmFsdWVdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gR3JvdXBOYW1lIDo6XG4gIC8vICAgYDxgIFJlZ0V4cElkZW50aWZpZXJOYW1lIGA+YFxuICAvLyBOb3RlOiB0aGlzIHVwZGF0ZXMgYHN0YXRlLmxhc3RTdHJpbmdWYWx1ZWAgcHJvcGVydHkgd2l0aCB0aGUgZWF0ZW4gbmFtZS5cbiAgcHAkMS5yZWdleHBfZWF0R3JvdXBOYW1lID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBzdGF0ZS5sYXN0U3RyaW5nVmFsdWUgPSBcIlwiO1xuICAgIGlmIChzdGF0ZS5lYXQoMHgzQyAvKiA8ICovKSkge1xuICAgICAgaWYgKHRoaXMucmVnZXhwX2VhdFJlZ0V4cElkZW50aWZpZXJOYW1lKHN0YXRlKSAmJiBzdGF0ZS5lYXQoMHgzRSAvKiA+ICovKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIGNhcHR1cmUgZ3JvdXAgbmFtZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gUmVnRXhwSWRlbnRpZmllck5hbWUgOjpcbiAgLy8gICBSZWdFeHBJZGVudGlmaWVyU3RhcnRcbiAgLy8gICBSZWdFeHBJZGVudGlmaWVyTmFtZSBSZWdFeHBJZGVudGlmaWVyUGFydFxuICAvLyBOb3RlOiB0aGlzIHVwZGF0ZXMgYHN0YXRlLmxhc3RTdHJpbmdWYWx1ZWAgcHJvcGVydHkgd2l0aCB0aGUgZWF0ZW4gbmFtZS5cbiAgcHAkMS5yZWdleHBfZWF0UmVnRXhwSWRlbnRpZmllck5hbWUgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHN0YXRlLmxhc3RTdHJpbmdWYWx1ZSA9IFwiXCI7XG4gICAgaWYgKHRoaXMucmVnZXhwX2VhdFJlZ0V4cElkZW50aWZpZXJTdGFydChzdGF0ZSkpIHtcbiAgICAgIHN0YXRlLmxhc3RTdHJpbmdWYWx1ZSArPSBjb2RlUG9pbnRUb1N0cmluZyhzdGF0ZS5sYXN0SW50VmFsdWUpO1xuICAgICAgd2hpbGUgKHRoaXMucmVnZXhwX2VhdFJlZ0V4cElkZW50aWZpZXJQYXJ0KHN0YXRlKSkge1xuICAgICAgICBzdGF0ZS5sYXN0U3RyaW5nVmFsdWUgKz0gY29kZVBvaW50VG9TdHJpbmcoc3RhdGUubGFzdEludFZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIC8vIFJlZ0V4cElkZW50aWZpZXJTdGFydCA6OlxuICAvLyAgIFVuaWNvZGVJRFN0YXJ0XG4gIC8vICAgYCRgXG4gIC8vICAgYF9gXG4gIC8vICAgYFxcYCBSZWdFeHBVbmljb2RlRXNjYXBlU2VxdWVuY2VbK1VdXG4gIHBwJDEucmVnZXhwX2VhdFJlZ0V4cElkZW50aWZpZXJTdGFydCA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIHN0YXJ0ID0gc3RhdGUucG9zO1xuICAgIHZhciBmb3JjZVUgPSB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gMTE7XG4gICAgdmFyIGNoID0gc3RhdGUuY3VycmVudChmb3JjZVUpO1xuICAgIHN0YXRlLmFkdmFuY2UoZm9yY2VVKTtcblxuICAgIGlmIChjaCA9PT0gMHg1QyAvKiBcXCAqLyAmJiB0aGlzLnJlZ2V4cF9lYXRSZWdFeHBVbmljb2RlRXNjYXBlU2VxdWVuY2Uoc3RhdGUsIGZvcmNlVSkpIHtcbiAgICAgIGNoID0gc3RhdGUubGFzdEludFZhbHVlO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHBJZGVudGlmaWVyU3RhcnQoY2gpKSB7XG4gICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSBjaDtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG4gIGZ1bmN0aW9uIGlzUmVnRXhwSWRlbnRpZmllclN0YXJ0KGNoKSB7XG4gICAgcmV0dXJuIGlzSWRlbnRpZmllclN0YXJ0KGNoLCB0cnVlKSB8fCBjaCA9PT0gMHgyNCAvKiAkICovIHx8IGNoID09PSAweDVGIC8qIF8gKi9cbiAgfVxuXG4gIC8vIFJlZ0V4cElkZW50aWZpZXJQYXJ0IDo6XG4gIC8vICAgVW5pY29kZUlEQ29udGludWVcbiAgLy8gICBgJGBcbiAgLy8gICBgX2BcbiAgLy8gICBgXFxgIFJlZ0V4cFVuaWNvZGVFc2NhcGVTZXF1ZW5jZVsrVV1cbiAgLy8gICA8WldOSj5cbiAgLy8gICA8WldKPlxuICBwcCQxLnJlZ2V4cF9lYXRSZWdFeHBJZGVudGlmaWVyUGFydCA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIHN0YXJ0ID0gc3RhdGUucG9zO1xuICAgIHZhciBmb3JjZVUgPSB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gMTE7XG4gICAgdmFyIGNoID0gc3RhdGUuY3VycmVudChmb3JjZVUpO1xuICAgIHN0YXRlLmFkdmFuY2UoZm9yY2VVKTtcblxuICAgIGlmIChjaCA9PT0gMHg1QyAvKiBcXCAqLyAmJiB0aGlzLnJlZ2V4cF9lYXRSZWdFeHBVbmljb2RlRXNjYXBlU2VxdWVuY2Uoc3RhdGUsIGZvcmNlVSkpIHtcbiAgICAgIGNoID0gc3RhdGUubGFzdEludFZhbHVlO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHBJZGVudGlmaWVyUGFydChjaCkpIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IGNoO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcbiAgZnVuY3Rpb24gaXNSZWdFeHBJZGVudGlmaWVyUGFydChjaCkge1xuICAgIHJldHVybiBpc0lkZW50aWZpZXJDaGFyKGNoLCB0cnVlKSB8fCBjaCA9PT0gMHgyNCAvKiAkICovIHx8IGNoID09PSAweDVGIC8qIF8gKi8gfHwgY2ggPT09IDB4MjAwQyAvKiA8WldOSj4gKi8gfHwgY2ggPT09IDB4MjAwRCAvKiA8WldKPiAqL1xuICB9XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtYW5uZXhCLUF0b21Fc2NhcGVcbiAgcHAkMS5yZWdleHBfZWF0QXRvbUVzY2FwZSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5yZWdleHBfZWF0QmFja1JlZmVyZW5jZShzdGF0ZSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdENoYXJhY3RlckNsYXNzRXNjYXBlKHN0YXRlKSB8fFxuICAgICAgdGhpcy5yZWdleHBfZWF0Q2hhcmFjdGVyRXNjYXBlKHN0YXRlKSB8fFxuICAgICAgKHN0YXRlLnN3aXRjaE4gJiYgdGhpcy5yZWdleHBfZWF0S0dyb3VwTmFtZShzdGF0ZSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBpZiAoc3RhdGUuc3dpdGNoVSkge1xuICAgICAgLy8gTWFrZSB0aGUgc2FtZSBtZXNzYWdlIGFzIFY4LlxuICAgICAgaWYgKHN0YXRlLmN1cnJlbnQoKSA9PT0gMHg2MyAvKiBjICovKSB7XG4gICAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCB1bmljb2RlIGVzY2FwZVwiKTtcbiAgICAgIH1cbiAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBlc2NhcGVcIik7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuICBwcCQxLnJlZ2V4cF9lYXRCYWNrUmVmZXJlbmNlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgaWYgKHRoaXMucmVnZXhwX2VhdERlY2ltYWxFc2NhcGUoc3RhdGUpKSB7XG4gICAgICB2YXIgbiA9IHN0YXRlLmxhc3RJbnRWYWx1ZTtcbiAgICAgIGlmIChzdGF0ZS5zd2l0Y2hVKSB7XG4gICAgICAgIC8vIEZvciBTeW50YXhFcnJvciBpbiBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jc2VjLWF0b21lc2NhcGVcbiAgICAgICAgaWYgKG4gPiBzdGF0ZS5tYXhCYWNrUmVmZXJlbmNlKSB7XG4gICAgICAgICAgc3RhdGUubWF4QmFja1JlZmVyZW5jZSA9IG47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIGlmIChuIDw9IHN0YXRlLm51bUNhcHR1cmluZ1BhcmVucykge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuICBwcCQxLnJlZ2V4cF9lYXRLR3JvdXBOYW1lID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuZWF0KDB4NkIgLyogayAqLykpIHtcbiAgICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRHcm91cE5hbWUoc3RhdGUpKSB7XG4gICAgICAgIHN0YXRlLmJhY2tSZWZlcmVuY2VOYW1lcy5wdXNoKHN0YXRlLmxhc3RTdHJpbmdWYWx1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBzdGF0ZS5yYWlzZShcIkludmFsaWQgbmFtZWQgcmVmZXJlbmNlXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1hbm5leEItQ2hhcmFjdGVyRXNjYXBlXG4gIHBwJDEucmVnZXhwX2VhdENoYXJhY3RlckVzY2FwZSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMucmVnZXhwX2VhdENvbnRyb2xFc2NhcGUoc3RhdGUpIHx8XG4gICAgICB0aGlzLnJlZ2V4cF9lYXRDQ29udHJvbExldHRlcihzdGF0ZSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdFplcm8oc3RhdGUpIHx8XG4gICAgICB0aGlzLnJlZ2V4cF9lYXRIZXhFc2NhcGVTZXF1ZW5jZShzdGF0ZSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdFJlZ0V4cFVuaWNvZGVFc2NhcGVTZXF1ZW5jZShzdGF0ZSwgZmFsc2UpIHx8XG4gICAgICAoIXN0YXRlLnN3aXRjaFUgJiYgdGhpcy5yZWdleHBfZWF0TGVnYWN5T2N0YWxFc2NhcGVTZXF1ZW5jZShzdGF0ZSkpIHx8XG4gICAgICB0aGlzLnJlZ2V4cF9lYXRJZGVudGl0eUVzY2FwZShzdGF0ZSlcbiAgICApXG4gIH07XG4gIHBwJDEucmVnZXhwX2VhdENDb250cm9sTGV0dGVyID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgaWYgKHN0YXRlLmVhdCgweDYzIC8qIGMgKi8pKSB7XG4gICAgICBpZiAodGhpcy5yZWdleHBfZWF0Q29udHJvbExldHRlcihzdGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIHN0YXRlLnBvcyA9IHN0YXJ0O1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcbiAgcHAkMS5yZWdleHBfZWF0WmVybyA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLmN1cnJlbnQoKSA9PT0gMHgzMCAvKiAwICovICYmICFpc0RlY2ltYWxEaWdpdChzdGF0ZS5sb29rYWhlYWQoKSkpIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IDA7XG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1Db250cm9sRXNjYXBlXG4gIHBwJDEucmVnZXhwX2VhdENvbnRyb2xFc2NhcGUgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBjaCA9IHN0YXRlLmN1cnJlbnQoKTtcbiAgICBpZiAoY2ggPT09IDB4NzQgLyogdCAqLykge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gMHgwOTsgLyogXFx0ICovXG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBpZiAoY2ggPT09IDB4NkUgLyogbiAqLykge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gMHgwQTsgLyogXFxuICovXG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBpZiAoY2ggPT09IDB4NzYgLyogdiAqLykge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gMHgwQjsgLyogXFx2ICovXG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBpZiAoY2ggPT09IDB4NjYgLyogZiAqLykge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gMHgwQzsgLyogXFxmICovXG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBpZiAoY2ggPT09IDB4NzIgLyogciAqLykge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gMHgwRDsgLyogXFxyICovXG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1Db250cm9sTGV0dGVyXG4gIHBwJDEucmVnZXhwX2VhdENvbnRyb2xMZXR0ZXIgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBjaCA9IHN0YXRlLmN1cnJlbnQoKTtcbiAgICBpZiAoaXNDb250cm9sTGV0dGVyKGNoKSkge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gY2ggJSAweDIwO1xuICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG4gIGZ1bmN0aW9uIGlzQ29udHJvbExldHRlcihjaCkge1xuICAgIHJldHVybiAoXG4gICAgICAoY2ggPj0gMHg0MSAvKiBBICovICYmIGNoIDw9IDB4NUEgLyogWiAqLykgfHxcbiAgICAgIChjaCA+PSAweDYxIC8qIGEgKi8gJiYgY2ggPD0gMHg3QSAvKiB6ICovKVxuICAgIClcbiAgfVxuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLVJlZ0V4cFVuaWNvZGVFc2NhcGVTZXF1ZW5jZVxuICBwcCQxLnJlZ2V4cF9lYXRSZWdFeHBVbmljb2RlRXNjYXBlU2VxdWVuY2UgPSBmdW5jdGlvbihzdGF0ZSwgZm9yY2VVKSB7XG4gICAgaWYgKCBmb3JjZVUgPT09IHZvaWQgMCApIGZvcmNlVSA9IGZhbHNlO1xuXG4gICAgdmFyIHN0YXJ0ID0gc3RhdGUucG9zO1xuICAgIHZhciBzd2l0Y2hVID0gZm9yY2VVIHx8IHN0YXRlLnN3aXRjaFU7XG5cbiAgICBpZiAoc3RhdGUuZWF0KDB4NzUgLyogdSAqLykpIHtcbiAgICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRGaXhlZEhleERpZ2l0cyhzdGF0ZSwgNCkpIHtcbiAgICAgICAgdmFyIGxlYWQgPSBzdGF0ZS5sYXN0SW50VmFsdWU7XG4gICAgICAgIGlmIChzd2l0Y2hVICYmIGxlYWQgPj0gMHhEODAwICYmIGxlYWQgPD0gMHhEQkZGKSB7XG4gICAgICAgICAgdmFyIGxlYWRTdXJyb2dhdGVFbmQgPSBzdGF0ZS5wb3M7XG4gICAgICAgICAgaWYgKHN0YXRlLmVhdCgweDVDIC8qIFxcICovKSAmJiBzdGF0ZS5lYXQoMHg3NSAvKiB1ICovKSAmJiB0aGlzLnJlZ2V4cF9lYXRGaXhlZEhleERpZ2l0cyhzdGF0ZSwgNCkpIHtcbiAgICAgICAgICAgIHZhciB0cmFpbCA9IHN0YXRlLmxhc3RJbnRWYWx1ZTtcbiAgICAgICAgICAgIGlmICh0cmFpbCA+PSAweERDMDAgJiYgdHJhaWwgPD0gMHhERkZGKSB7XG4gICAgICAgICAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IChsZWFkIC0gMHhEODAwKSAqIDB4NDAwICsgKHRyYWlsIC0gMHhEQzAwKSArIDB4MTAwMDA7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHN0YXRlLnBvcyA9IGxlYWRTdXJyb2dhdGVFbmQ7XG4gICAgICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gbGVhZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKFxuICAgICAgICBzd2l0Y2hVICYmXG4gICAgICAgIHN0YXRlLmVhdCgweDdCIC8qIHsgKi8pICYmXG4gICAgICAgIHRoaXMucmVnZXhwX2VhdEhleERpZ2l0cyhzdGF0ZSkgJiZcbiAgICAgICAgc3RhdGUuZWF0KDB4N0QgLyogfSAqLykgJiZcbiAgICAgICAgaXNWYWxpZFVuaWNvZGUoc3RhdGUubGFzdEludFZhbHVlKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBpZiAoc3dpdGNoVSkge1xuICAgICAgICBzdGF0ZS5yYWlzZShcIkludmFsaWQgdW5pY29kZSBlc2NhcGVcIik7XG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcbiAgZnVuY3Rpb24gaXNWYWxpZFVuaWNvZGUoY2gpIHtcbiAgICByZXR1cm4gY2ggPj0gMCAmJiBjaCA8PSAweDEwRkZGRlxuICB9XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtYW5uZXhCLUlkZW50aXR5RXNjYXBlXG4gIHBwJDEucmVnZXhwX2VhdElkZW50aXR5RXNjYXBlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuc3dpdGNoVSkge1xuICAgICAgaWYgKHRoaXMucmVnZXhwX2VhdFN5bnRheENoYXJhY3RlcihzdGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS5lYXQoMHgyRiAvKiAvICovKSkge1xuICAgICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAweDJGOyAvKiAvICovXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB2YXIgY2ggPSBzdGF0ZS5jdXJyZW50KCk7XG4gICAgaWYgKGNoICE9PSAweDYzIC8qIGMgKi8gJiYgKCFzdGF0ZS5zd2l0Y2hOIHx8IGNoICE9PSAweDZCIC8qIGsgKi8pKSB7XG4gICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSBjaDtcbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtRGVjaW1hbEVzY2FwZVxuICBwcCQxLnJlZ2V4cF9lYXREZWNpbWFsRXNjYXBlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAwO1xuICAgIHZhciBjaCA9IHN0YXRlLmN1cnJlbnQoKTtcbiAgICBpZiAoY2ggPj0gMHgzMSAvKiAxICovICYmIGNoIDw9IDB4MzkgLyogOSAqLykge1xuICAgICAgZG8ge1xuICAgICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAxMCAqIHN0YXRlLmxhc3RJbnRWYWx1ZSArIChjaCAtIDB4MzAgLyogMCAqLyk7XG4gICAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICAgIH0gd2hpbGUgKChjaCA9IHN0YXRlLmN1cnJlbnQoKSkgPj0gMHgzMCAvKiAwICovICYmIGNoIDw9IDB4MzkgLyogOSAqLylcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIC8vIFJldHVybiB2YWx1ZXMgdXNlZCBieSBjaGFyYWN0ZXIgc2V0IHBhcnNpbmcgbWV0aG9kcywgbmVlZGVkIHRvXG4gIC8vIGZvcmJpZCBuZWdhdGlvbiBvZiBzZXRzIHRoYXQgY2FuIG1hdGNoIHN0cmluZ3MuXG4gIHZhciBDaGFyU2V0Tm9uZSA9IDA7IC8vIE5vdGhpbmcgcGFyc2VkXG4gIHZhciBDaGFyU2V0T2sgPSAxOyAvLyBDb25zdHJ1Y3QgcGFyc2VkLCBjYW5ub3QgY29udGFpbiBzdHJpbmdzXG4gIHZhciBDaGFyU2V0U3RyaW5nID0gMjsgLy8gQ29uc3RydWN0IHBhcnNlZCwgY2FuIGNvbnRhaW4gc3RyaW5nc1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLUNoYXJhY3RlckNsYXNzRXNjYXBlXG4gIHBwJDEucmVnZXhwX2VhdENoYXJhY3RlckNsYXNzRXNjYXBlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgY2ggPSBzdGF0ZS5jdXJyZW50KCk7XG5cbiAgICBpZiAoaXNDaGFyYWN0ZXJDbGFzc0VzY2FwZShjaCkpIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IC0xO1xuICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIENoYXJTZXRPa1xuICAgIH1cblxuICAgIHZhciBuZWdhdGUgPSBmYWxzZTtcbiAgICBpZiAoXG4gICAgICBzdGF0ZS5zd2l0Y2hVICYmXG4gICAgICB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOSAmJlxuICAgICAgKChuZWdhdGUgPSBjaCA9PT0gMHg1MCAvKiBQICovKSB8fCBjaCA9PT0gMHg3MCAvKiBwICovKVxuICAgICkge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gLTE7XG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgICB2YXIgcmVzdWx0O1xuICAgICAgaWYgKFxuICAgICAgICBzdGF0ZS5lYXQoMHg3QiAvKiB7ICovKSAmJlxuICAgICAgICAocmVzdWx0ID0gdGhpcy5yZWdleHBfZWF0VW5pY29kZVByb3BlcnR5VmFsdWVFeHByZXNzaW9uKHN0YXRlKSkgJiZcbiAgICAgICAgc3RhdGUuZWF0KDB4N0QgLyogfSAqLylcbiAgICAgICkge1xuICAgICAgICBpZiAobmVnYXRlICYmIHJlc3VsdCA9PT0gQ2hhclNldFN0cmluZykgeyBzdGF0ZS5yYWlzZShcIkludmFsaWQgcHJvcGVydHkgbmFtZVwiKTsgfVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICB9XG4gICAgICBzdGF0ZS5yYWlzZShcIkludmFsaWQgcHJvcGVydHkgbmFtZVwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gQ2hhclNldE5vbmVcbiAgfTtcblxuICBmdW5jdGlvbiBpc0NoYXJhY3RlckNsYXNzRXNjYXBlKGNoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGNoID09PSAweDY0IC8qIGQgKi8gfHxcbiAgICAgIGNoID09PSAweDQ0IC8qIEQgKi8gfHxcbiAgICAgIGNoID09PSAweDczIC8qIHMgKi8gfHxcbiAgICAgIGNoID09PSAweDUzIC8qIFMgKi8gfHxcbiAgICAgIGNoID09PSAweDc3IC8qIHcgKi8gfHxcbiAgICAgIGNoID09PSAweDU3IC8qIFcgKi9cbiAgICApXG4gIH1cblxuICAvLyBVbmljb2RlUHJvcGVydHlWYWx1ZUV4cHJlc3Npb24gOjpcbiAgLy8gICBVbmljb2RlUHJvcGVydHlOYW1lIGA9YCBVbmljb2RlUHJvcGVydHlWYWx1ZVxuICAvLyAgIExvbmVVbmljb2RlUHJvcGVydHlOYW1lT3JWYWx1ZVxuICBwcCQxLnJlZ2V4cF9lYXRVbmljb2RlUHJvcGVydHlWYWx1ZUV4cHJlc3Npb24gPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcblxuICAgIC8vIFVuaWNvZGVQcm9wZXJ0eU5hbWUgYD1gIFVuaWNvZGVQcm9wZXJ0eVZhbHVlXG4gICAgaWYgKHRoaXMucmVnZXhwX2VhdFVuaWNvZGVQcm9wZXJ0eU5hbWUoc3RhdGUpICYmIHN0YXRlLmVhdCgweDNEIC8qID0gKi8pKSB7XG4gICAgICB2YXIgbmFtZSA9IHN0YXRlLmxhc3RTdHJpbmdWYWx1ZTtcbiAgICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRVbmljb2RlUHJvcGVydHlWYWx1ZShzdGF0ZSkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gc3RhdGUubGFzdFN0cmluZ1ZhbHVlO1xuICAgICAgICB0aGlzLnJlZ2V4cF92YWxpZGF0ZVVuaWNvZGVQcm9wZXJ0eU5hbWVBbmRWYWx1ZShzdGF0ZSwgbmFtZSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gQ2hhclNldE9rXG4gICAgICB9XG4gICAgfVxuICAgIHN0YXRlLnBvcyA9IHN0YXJ0O1xuXG4gICAgLy8gTG9uZVVuaWNvZGVQcm9wZXJ0eU5hbWVPclZhbHVlXG4gICAgaWYgKHRoaXMucmVnZXhwX2VhdExvbmVVbmljb2RlUHJvcGVydHlOYW1lT3JWYWx1ZShzdGF0ZSkpIHtcbiAgICAgIHZhciBuYW1lT3JWYWx1ZSA9IHN0YXRlLmxhc3RTdHJpbmdWYWx1ZTtcbiAgICAgIHJldHVybiB0aGlzLnJlZ2V4cF92YWxpZGF0ZVVuaWNvZGVQcm9wZXJ0eU5hbWVPclZhbHVlKHN0YXRlLCBuYW1lT3JWYWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIENoYXJTZXROb25lXG4gIH07XG5cbiAgcHAkMS5yZWdleHBfdmFsaWRhdGVVbmljb2RlUHJvcGVydHlOYW1lQW5kVmFsdWUgPSBmdW5jdGlvbihzdGF0ZSwgbmFtZSwgdmFsdWUpIHtcbiAgICBpZiAoIWhhc093bihzdGF0ZS51bmljb2RlUHJvcGVydGllcy5ub25CaW5hcnksIG5hbWUpKVxuICAgICAgeyBzdGF0ZS5yYWlzZShcIkludmFsaWQgcHJvcGVydHkgbmFtZVwiKTsgfVxuICAgIGlmICghc3RhdGUudW5pY29kZVByb3BlcnRpZXMubm9uQmluYXJ5W25hbWVdLnRlc3QodmFsdWUpKVxuICAgICAgeyBzdGF0ZS5yYWlzZShcIkludmFsaWQgcHJvcGVydHkgdmFsdWVcIik7IH1cbiAgfTtcblxuICBwcCQxLnJlZ2V4cF92YWxpZGF0ZVVuaWNvZGVQcm9wZXJ0eU5hbWVPclZhbHVlID0gZnVuY3Rpb24oc3RhdGUsIG5hbWVPclZhbHVlKSB7XG4gICAgaWYgKHN0YXRlLnVuaWNvZGVQcm9wZXJ0aWVzLmJpbmFyeS50ZXN0KG5hbWVPclZhbHVlKSkgeyByZXR1cm4gQ2hhclNldE9rIH1cbiAgICBpZiAoc3RhdGUuc3dpdGNoViAmJiBzdGF0ZS51bmljb2RlUHJvcGVydGllcy5iaW5hcnlPZlN0cmluZ3MudGVzdChuYW1lT3JWYWx1ZSkpIHsgcmV0dXJuIENoYXJTZXRTdHJpbmcgfVxuICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBwcm9wZXJ0eSBuYW1lXCIpO1xuICB9O1xuXG4gIC8vIFVuaWNvZGVQcm9wZXJ0eU5hbWUgOjpcbiAgLy8gICBVbmljb2RlUHJvcGVydHlOYW1lQ2hhcmFjdGVyc1xuICBwcCQxLnJlZ2V4cF9lYXRVbmljb2RlUHJvcGVydHlOYW1lID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgY2ggPSAwO1xuICAgIHN0YXRlLmxhc3RTdHJpbmdWYWx1ZSA9IFwiXCI7XG4gICAgd2hpbGUgKGlzVW5pY29kZVByb3BlcnR5TmFtZUNoYXJhY3RlcihjaCA9IHN0YXRlLmN1cnJlbnQoKSkpIHtcbiAgICAgIHN0YXRlLmxhc3RTdHJpbmdWYWx1ZSArPSBjb2RlUG9pbnRUb1N0cmluZyhjaCk7XG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZS5sYXN0U3RyaW5nVmFsdWUgIT09IFwiXCJcbiAgfTtcblxuICBmdW5jdGlvbiBpc1VuaWNvZGVQcm9wZXJ0eU5hbWVDaGFyYWN0ZXIoY2gpIHtcbiAgICByZXR1cm4gaXNDb250cm9sTGV0dGVyKGNoKSB8fCBjaCA9PT0gMHg1RiAvKiBfICovXG4gIH1cblxuICAvLyBVbmljb2RlUHJvcGVydHlWYWx1ZSA6OlxuICAvLyAgIFVuaWNvZGVQcm9wZXJ0eVZhbHVlQ2hhcmFjdGVyc1xuICBwcCQxLnJlZ2V4cF9lYXRVbmljb2RlUHJvcGVydHlWYWx1ZSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIGNoID0gMDtcbiAgICBzdGF0ZS5sYXN0U3RyaW5nVmFsdWUgPSBcIlwiO1xuICAgIHdoaWxlIChpc1VuaWNvZGVQcm9wZXJ0eVZhbHVlQ2hhcmFjdGVyKGNoID0gc3RhdGUuY3VycmVudCgpKSkge1xuICAgICAgc3RhdGUubGFzdFN0cmluZ1ZhbHVlICs9IGNvZGVQb2ludFRvU3RyaW5nKGNoKTtcbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlLmxhc3RTdHJpbmdWYWx1ZSAhPT0gXCJcIlxuICB9O1xuICBmdW5jdGlvbiBpc1VuaWNvZGVQcm9wZXJ0eVZhbHVlQ2hhcmFjdGVyKGNoKSB7XG4gICAgcmV0dXJuIGlzVW5pY29kZVByb3BlcnR5TmFtZUNoYXJhY3RlcihjaCkgfHwgaXNEZWNpbWFsRGlnaXQoY2gpXG4gIH1cblxuICAvLyBMb25lVW5pY29kZVByb3BlcnR5TmFtZU9yVmFsdWUgOjpcbiAgLy8gICBVbmljb2RlUHJvcGVydHlWYWx1ZUNoYXJhY3RlcnNcbiAgcHAkMS5yZWdleHBfZWF0TG9uZVVuaWNvZGVQcm9wZXJ0eU5hbWVPclZhbHVlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICByZXR1cm4gdGhpcy5yZWdleHBfZWF0VW5pY29kZVByb3BlcnR5VmFsdWUoc3RhdGUpXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtQ2hhcmFjdGVyQ2xhc3NcbiAgcHAkMS5yZWdleHBfZWF0Q2hhcmFjdGVyQ2xhc3MgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5lYXQoMHg1QiAvKiBbICovKSkge1xuICAgICAgdmFyIG5lZ2F0ZSA9IHN0YXRlLmVhdCgweDVFIC8qIF4gKi8pO1xuICAgICAgdmFyIHJlc3VsdCA9IHRoaXMucmVnZXhwX2NsYXNzQ29udGVudHMoc3RhdGUpO1xuICAgICAgaWYgKCFzdGF0ZS5lYXQoMHg1RCAvKiBdICovKSlcbiAgICAgICAgeyBzdGF0ZS5yYWlzZShcIlVudGVybWluYXRlZCBjaGFyYWN0ZXIgY2xhc3NcIik7IH1cbiAgICAgIGlmIChuZWdhdGUgJiYgcmVzdWx0ID09PSBDaGFyU2V0U3RyaW5nKVxuICAgICAgICB7IHN0YXRlLnJhaXNlKFwiTmVnYXRlZCBjaGFyYWN0ZXIgY2xhc3MgbWF5IGNvbnRhaW4gc3RyaW5nc1wiKTsgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtQ2xhc3NDb250ZW50c1xuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1DbGFzc1Jhbmdlc1xuICBwcCQxLnJlZ2V4cF9jbGFzc0NvbnRlbnRzID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuY3VycmVudCgpID09PSAweDVEIC8qIF0gKi8pIHsgcmV0dXJuIENoYXJTZXRPayB9XG4gICAgaWYgKHN0YXRlLnN3aXRjaFYpIHsgcmV0dXJuIHRoaXMucmVnZXhwX2NsYXNzU2V0RXhwcmVzc2lvbihzdGF0ZSkgfVxuICAgIHRoaXMucmVnZXhwX25vbkVtcHR5Q2xhc3NSYW5nZXMoc3RhdGUpO1xuICAgIHJldHVybiBDaGFyU2V0T2tcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1Ob25lbXB0eUNsYXNzUmFuZ2VzXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLU5vbmVtcHR5Q2xhc3NSYW5nZXNOb0Rhc2hcbiAgcHAkMS5yZWdleHBfbm9uRW1wdHlDbGFzc1JhbmdlcyA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgd2hpbGUgKHRoaXMucmVnZXhwX2VhdENsYXNzQXRvbShzdGF0ZSkpIHtcbiAgICAgIHZhciBsZWZ0ID0gc3RhdGUubGFzdEludFZhbHVlO1xuICAgICAgaWYgKHN0YXRlLmVhdCgweDJEIC8qIC0gKi8pICYmIHRoaXMucmVnZXhwX2VhdENsYXNzQXRvbShzdGF0ZSkpIHtcbiAgICAgICAgdmFyIHJpZ2h0ID0gc3RhdGUubGFzdEludFZhbHVlO1xuICAgICAgICBpZiAoc3RhdGUuc3dpdGNoVSAmJiAobGVmdCA9PT0gLTEgfHwgcmlnaHQgPT09IC0xKSkge1xuICAgICAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBjaGFyYWN0ZXIgY2xhc3NcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlZnQgIT09IC0xICYmIHJpZ2h0ICE9PSAtMSAmJiBsZWZ0ID4gcmlnaHQpIHtcbiAgICAgICAgICBzdGF0ZS5yYWlzZShcIlJhbmdlIG91dCBvZiBvcmRlciBpbiBjaGFyYWN0ZXIgY2xhc3NcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtQ2xhc3NBdG9tXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLUNsYXNzQXRvbU5vRGFzaFxuICBwcCQxLnJlZ2V4cF9lYXRDbGFzc0F0b20gPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcblxuICAgIGlmIChzdGF0ZS5lYXQoMHg1QyAvKiBcXCAqLykpIHtcbiAgICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRDbGFzc0VzY2FwZShzdGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS5zd2l0Y2hVKSB7XG4gICAgICAgIC8vIE1ha2UgdGhlIHNhbWUgbWVzc2FnZSBhcyBWOC5cbiAgICAgICAgdmFyIGNoJDEgPSBzdGF0ZS5jdXJyZW50KCk7XG4gICAgICAgIGlmIChjaCQxID09PSAweDYzIC8qIGMgKi8gfHwgaXNPY3RhbERpZ2l0KGNoJDEpKSB7XG4gICAgICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIGNsYXNzIGVzY2FwZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5yYWlzZShcIkludmFsaWQgZXNjYXBlXCIpO1xuICAgICAgfVxuICAgICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgfVxuXG4gICAgdmFyIGNoID0gc3RhdGUuY3VycmVudCgpO1xuICAgIGlmIChjaCAhPT0gMHg1RCAvKiBdICovKSB7XG4gICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSBjaDtcbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtYW5uZXhCLUNsYXNzRXNjYXBlXG4gIHBwJDEucmVnZXhwX2VhdENsYXNzRXNjYXBlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG5cbiAgICBpZiAoc3RhdGUuZWF0KDB4NjIgLyogYiAqLykpIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IDB4MDg7IC8qIDxCUz4gKi9cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLnN3aXRjaFUgJiYgc3RhdGUuZWF0KDB4MkQgLyogLSAqLykpIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IDB4MkQ7IC8qIC0gKi9cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKCFzdGF0ZS5zd2l0Y2hVICYmIHN0YXRlLmVhdCgweDYzIC8qIGMgKi8pKSB7XG4gICAgICBpZiAodGhpcy5yZWdleHBfZWF0Q2xhc3NDb250cm9sTGV0dGVyKHN0YXRlKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMucmVnZXhwX2VhdENoYXJhY3RlckNsYXNzRXNjYXBlKHN0YXRlKSB8fFxuICAgICAgdGhpcy5yZWdleHBfZWF0Q2hhcmFjdGVyRXNjYXBlKHN0YXRlKVxuICAgIClcbiAgfTtcblxuICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jcHJvZC1DbGFzc1NldEV4cHJlc3Npb25cbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtQ2xhc3NVbmlvblxuICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jcHJvZC1DbGFzc0ludGVyc2VjdGlvblxuICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jcHJvZC1DbGFzc1N1YnRyYWN0aW9uXG4gIHBwJDEucmVnZXhwX2NsYXNzU2V0RXhwcmVzc2lvbiA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIHJlc3VsdCA9IENoYXJTZXRPaywgc3ViUmVzdWx0O1xuICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRDbGFzc1NldFJhbmdlKHN0YXRlKSkgOyBlbHNlIGlmIChzdWJSZXN1bHQgPSB0aGlzLnJlZ2V4cF9lYXRDbGFzc1NldE9wZXJhbmQoc3RhdGUpKSB7XG4gICAgICBpZiAoc3ViUmVzdWx0ID09PSBDaGFyU2V0U3RyaW5nKSB7IHJlc3VsdCA9IENoYXJTZXRTdHJpbmc7IH1cbiAgICAgIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLUNsYXNzSW50ZXJzZWN0aW9uXG4gICAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgICB3aGlsZSAoc3RhdGUuZWF0Q2hhcnMoWzB4MjYsIDB4MjZdIC8qICYmICovKSkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgc3RhdGUuY3VycmVudCgpICE9PSAweDI2IC8qICYgKi8gJiZcbiAgICAgICAgICAoc3ViUmVzdWx0ID0gdGhpcy5yZWdleHBfZWF0Q2xhc3NTZXRPcGVyYW5kKHN0YXRlKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKHN1YlJlc3VsdCAhPT0gQ2hhclNldFN0cmluZykgeyByZXN1bHQgPSBDaGFyU2V0T2s7IH1cbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBjaGFyYWN0ZXIgaW4gY2hhcmFjdGVyIGNsYXNzXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXJ0ICE9PSBzdGF0ZS5wb3MpIHsgcmV0dXJuIHJlc3VsdCB9XG4gICAgICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jcHJvZC1DbGFzc1N1YnRyYWN0aW9uXG4gICAgICB3aGlsZSAoc3RhdGUuZWF0Q2hhcnMoWzB4MkQsIDB4MkRdIC8qIC0tICovKSkge1xuICAgICAgICBpZiAodGhpcy5yZWdleHBfZWF0Q2xhc3NTZXRPcGVyYW5kKHN0YXRlKSkgeyBjb250aW51ZSB9XG4gICAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBjaGFyYWN0ZXIgaW4gY2hhcmFjdGVyIGNsYXNzXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXJ0ICE9PSBzdGF0ZS5wb3MpIHsgcmV0dXJuIHJlc3VsdCB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBjaGFyYWN0ZXIgaW4gY2hhcmFjdGVyIGNsYXNzXCIpO1xuICAgIH1cbiAgICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jcHJvZC1DbGFzc1VuaW9uXG4gICAgZm9yICg7Oykge1xuICAgICAgaWYgKHRoaXMucmVnZXhwX2VhdENsYXNzU2V0UmFuZ2Uoc3RhdGUpKSB7IGNvbnRpbnVlIH1cbiAgICAgIHN1YlJlc3VsdCA9IHRoaXMucmVnZXhwX2VhdENsYXNzU2V0T3BlcmFuZChzdGF0ZSk7XG4gICAgICBpZiAoIXN1YlJlc3VsdCkgeyByZXR1cm4gcmVzdWx0IH1cbiAgICAgIGlmIChzdWJSZXN1bHQgPT09IENoYXJTZXRTdHJpbmcpIHsgcmVzdWx0ID0gQ2hhclNldFN0cmluZzsgfVxuICAgIH1cbiAgfTtcblxuICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jcHJvZC1DbGFzc1NldFJhbmdlXG4gIHBwJDEucmVnZXhwX2VhdENsYXNzU2V0UmFuZ2UgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcbiAgICBpZiAodGhpcy5yZWdleHBfZWF0Q2xhc3NTZXRDaGFyYWN0ZXIoc3RhdGUpKSB7XG4gICAgICB2YXIgbGVmdCA9IHN0YXRlLmxhc3RJbnRWYWx1ZTtcbiAgICAgIGlmIChzdGF0ZS5lYXQoMHgyRCAvKiAtICovKSAmJiB0aGlzLnJlZ2V4cF9lYXRDbGFzc1NldENoYXJhY3RlcihzdGF0ZSkpIHtcbiAgICAgICAgdmFyIHJpZ2h0ID0gc3RhdGUubGFzdEludFZhbHVlO1xuICAgICAgICBpZiAobGVmdCAhPT0gLTEgJiYgcmlnaHQgIT09IC0xICYmIGxlZnQgPiByaWdodCkge1xuICAgICAgICAgIHN0YXRlLnJhaXNlKFwiUmFuZ2Ugb3V0IG9mIG9yZGVyIGluIGNoYXJhY3RlciBjbGFzc1wiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLUNsYXNzU2V0T3BlcmFuZFxuICBwcCQxLnJlZ2V4cF9lYXRDbGFzc1NldE9wZXJhbmQgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRDbGFzc1NldENoYXJhY3RlcihzdGF0ZSkpIHsgcmV0dXJuIENoYXJTZXRPayB9XG4gICAgcmV0dXJuIHRoaXMucmVnZXhwX2VhdENsYXNzU3RyaW5nRGlzanVuY3Rpb24oc3RhdGUpIHx8IHRoaXMucmVnZXhwX2VhdE5lc3RlZENsYXNzKHN0YXRlKVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLU5lc3RlZENsYXNzXG4gIHBwJDEucmVnZXhwX2VhdE5lc3RlZENsYXNzID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgaWYgKHN0YXRlLmVhdCgweDVCIC8qIFsgKi8pKSB7XG4gICAgICB2YXIgbmVnYXRlID0gc3RhdGUuZWF0KDB4NUUgLyogXiAqLyk7XG4gICAgICB2YXIgcmVzdWx0ID0gdGhpcy5yZWdleHBfY2xhc3NDb250ZW50cyhzdGF0ZSk7XG4gICAgICBpZiAoc3RhdGUuZWF0KDB4NUQgLyogXSAqLykpIHtcbiAgICAgICAgaWYgKG5lZ2F0ZSAmJiByZXN1bHQgPT09IENoYXJTZXRTdHJpbmcpIHtcbiAgICAgICAgICBzdGF0ZS5yYWlzZShcIk5lZ2F0ZWQgY2hhcmFjdGVyIGNsYXNzIG1heSBjb250YWluIHN0cmluZ3NcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgfVxuICAgICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgfVxuICAgIGlmIChzdGF0ZS5lYXQoMHg1QyAvKiBcXCAqLykpIHtcbiAgICAgIHZhciByZXN1bHQkMSA9IHRoaXMucmVnZXhwX2VhdENoYXJhY3RlckNsYXNzRXNjYXBlKHN0YXRlKTtcbiAgICAgIGlmIChyZXN1bHQkMSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0JDFcbiAgICAgIH1cbiAgICAgIHN0YXRlLnBvcyA9IHN0YXJ0O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9O1xuXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLUNsYXNzU3RyaW5nRGlzanVuY3Rpb25cbiAgcHAkMS5yZWdleHBfZWF0Q2xhc3NTdHJpbmdEaXNqdW5jdGlvbiA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIHN0YXJ0ID0gc3RhdGUucG9zO1xuICAgIGlmIChzdGF0ZS5lYXRDaGFycyhbMHg1QywgMHg3MV0gLyogXFxxICovKSkge1xuICAgICAgaWYgKHN0YXRlLmVhdCgweDdCIC8qIHsgKi8pKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLnJlZ2V4cF9jbGFzc1N0cmluZ0Rpc2p1bmN0aW9uQ29udGVudHMoc3RhdGUpO1xuICAgICAgICBpZiAoc3RhdGUuZWF0KDB4N0QgLyogfSAqLykpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE1ha2UgdGhlIHNhbWUgbWVzc2FnZSBhcyBWOC5cbiAgICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIGVzY2FwZVwiKTtcbiAgICAgIH1cbiAgICAgIHN0YXRlLnBvcyA9IHN0YXJ0O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9O1xuXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLUNsYXNzU3RyaW5nRGlzanVuY3Rpb25Db250ZW50c1xuICBwcCQxLnJlZ2V4cF9jbGFzc1N0cmluZ0Rpc2p1bmN0aW9uQ29udGVudHMgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLnJlZ2V4cF9jbGFzc1N0cmluZyhzdGF0ZSk7XG4gICAgd2hpbGUgKHN0YXRlLmVhdCgweDdDIC8qIHwgKi8pKSB7XG4gICAgICBpZiAodGhpcy5yZWdleHBfY2xhc3NTdHJpbmcoc3RhdGUpID09PSBDaGFyU2V0U3RyaW5nKSB7IHJlc3VsdCA9IENoYXJTZXRTdHJpbmc7IH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9O1xuXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLUNsYXNzU3RyaW5nXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLU5vbkVtcHR5Q2xhc3NTdHJpbmdcbiAgcHAkMS5yZWdleHBfY2xhc3NTdHJpbmcgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBjb3VudCA9IDA7XG4gICAgd2hpbGUgKHRoaXMucmVnZXhwX2VhdENsYXNzU2V0Q2hhcmFjdGVyKHN0YXRlKSkgeyBjb3VudCsrOyB9XG4gICAgcmV0dXJuIGNvdW50ID09PSAxID8gQ2hhclNldE9rIDogQ2hhclNldFN0cmluZ1xuICB9O1xuXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLUNsYXNzU2V0Q2hhcmFjdGVyXG4gIHBwJDEucmVnZXhwX2VhdENsYXNzU2V0Q2hhcmFjdGVyID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgaWYgKHN0YXRlLmVhdCgweDVDIC8qIFxcICovKSkge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLnJlZ2V4cF9lYXRDaGFyYWN0ZXJFc2NhcGUoc3RhdGUpIHx8XG4gICAgICAgIHRoaXMucmVnZXhwX2VhdENsYXNzU2V0UmVzZXJ2ZWRQdW5jdHVhdG9yKHN0YXRlKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBpZiAoc3RhdGUuZWF0KDB4NjIgLyogYiAqLykpIHtcbiAgICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gMHgwODsgLyogPEJTPiAqL1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgdmFyIGNoID0gc3RhdGUuY3VycmVudCgpO1xuICAgIGlmIChjaCA8IDAgfHwgY2ggPT09IHN0YXRlLmxvb2thaGVhZCgpICYmIGlzQ2xhc3NTZXRSZXNlcnZlZERvdWJsZVB1bmN0dWF0b3JDaGFyYWN0ZXIoY2gpKSB7IHJldHVybiBmYWxzZSB9XG4gICAgaWYgKGlzQ2xhc3NTZXRTeW50YXhDaGFyYWN0ZXIoY2gpKSB7IHJldHVybiBmYWxzZSB9XG4gICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IGNoO1xuICAgIHJldHVybiB0cnVlXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtQ2xhc3NTZXRSZXNlcnZlZERvdWJsZVB1bmN0dWF0b3JcbiAgZnVuY3Rpb24gaXNDbGFzc1NldFJlc2VydmVkRG91YmxlUHVuY3R1YXRvckNoYXJhY3RlcihjaCkge1xuICAgIHJldHVybiAoXG4gICAgICBjaCA9PT0gMHgyMSAvKiAhICovIHx8XG4gICAgICBjaCA+PSAweDIzIC8qICMgKi8gJiYgY2ggPD0gMHgyNiAvKiAmICovIHx8XG4gICAgICBjaCA+PSAweDJBIC8qICogKi8gJiYgY2ggPD0gMHgyQyAvKiAsICovIHx8XG4gICAgICBjaCA9PT0gMHgyRSAvKiAuICovIHx8XG4gICAgICBjaCA+PSAweDNBIC8qIDogKi8gJiYgY2ggPD0gMHg0MCAvKiBAICovIHx8XG4gICAgICBjaCA9PT0gMHg1RSAvKiBeICovIHx8XG4gICAgICBjaCA9PT0gMHg2MCAvKiBgICovIHx8XG4gICAgICBjaCA9PT0gMHg3RSAvKiB+ICovXG4gICAgKVxuICB9XG5cbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtQ2xhc3NTZXRTeW50YXhDaGFyYWN0ZXJcbiAgZnVuY3Rpb24gaXNDbGFzc1NldFN5bnRheENoYXJhY3RlcihjaCkge1xuICAgIHJldHVybiAoXG4gICAgICBjaCA9PT0gMHgyOCAvKiAoICovIHx8XG4gICAgICBjaCA9PT0gMHgyOSAvKiApICovIHx8XG4gICAgICBjaCA9PT0gMHgyRCAvKiAtICovIHx8XG4gICAgICBjaCA9PT0gMHgyRiAvKiAvICovIHx8XG4gICAgICBjaCA+PSAweDVCIC8qIFsgKi8gJiYgY2ggPD0gMHg1RCAvKiBdICovIHx8XG4gICAgICBjaCA+PSAweDdCIC8qIHsgKi8gJiYgY2ggPD0gMHg3RCAvKiB9ICovXG4gICAgKVxuICB9XG5cbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtQ2xhc3NTZXRSZXNlcnZlZFB1bmN0dWF0b3JcbiAgcHAkMS5yZWdleHBfZWF0Q2xhc3NTZXRSZXNlcnZlZFB1bmN0dWF0b3IgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBjaCA9IHN0YXRlLmN1cnJlbnQoKTtcbiAgICBpZiAoaXNDbGFzc1NldFJlc2VydmVkUHVuY3R1YXRvcihjaCkpIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IGNoO1xuICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtQ2xhc3NTZXRSZXNlcnZlZFB1bmN0dWF0b3JcbiAgZnVuY3Rpb24gaXNDbGFzc1NldFJlc2VydmVkUHVuY3R1YXRvcihjaCkge1xuICAgIHJldHVybiAoXG4gICAgICBjaCA9PT0gMHgyMSAvKiAhICovIHx8XG4gICAgICBjaCA9PT0gMHgyMyAvKiAjICovIHx8XG4gICAgICBjaCA9PT0gMHgyNSAvKiAlICovIHx8XG4gICAgICBjaCA9PT0gMHgyNiAvKiAmICovIHx8XG4gICAgICBjaCA9PT0gMHgyQyAvKiAsICovIHx8XG4gICAgICBjaCA9PT0gMHgyRCAvKiAtICovIHx8XG4gICAgICBjaCA+PSAweDNBIC8qIDogKi8gJiYgY2ggPD0gMHgzRSAvKiA+ICovIHx8XG4gICAgICBjaCA9PT0gMHg0MCAvKiBAICovIHx8XG4gICAgICBjaCA9PT0gMHg2MCAvKiBgICovIHx8XG4gICAgICBjaCA9PT0gMHg3RSAvKiB+ICovXG4gICAgKVxuICB9XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtYW5uZXhCLUNsYXNzQ29udHJvbExldHRlclxuICBwcCQxLnJlZ2V4cF9lYXRDbGFzc0NvbnRyb2xMZXR0ZXIgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBjaCA9IHN0YXRlLmN1cnJlbnQoKTtcbiAgICBpZiAoaXNEZWNpbWFsRGlnaXQoY2gpIHx8IGNoID09PSAweDVGIC8qIF8gKi8pIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IGNoICUgMHgyMDtcbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLUhleEVzY2FwZVNlcXVlbmNlXG4gIHBwJDEucmVnZXhwX2VhdEhleEVzY2FwZVNlcXVlbmNlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgaWYgKHN0YXRlLmVhdCgweDc4IC8qIHggKi8pKSB7XG4gICAgICBpZiAodGhpcy5yZWdleHBfZWF0Rml4ZWRIZXhEaWdpdHMoc3RhdGUsIDIpKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBpZiAoc3RhdGUuc3dpdGNoVSkge1xuICAgICAgICBzdGF0ZS5yYWlzZShcIkludmFsaWQgZXNjYXBlXCIpO1xuICAgICAgfVxuICAgICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLURlY2ltYWxEaWdpdHNcbiAgcHAkMS5yZWdleHBfZWF0RGVjaW1hbERpZ2l0cyA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIHN0YXJ0ID0gc3RhdGUucG9zO1xuICAgIHZhciBjaCA9IDA7XG4gICAgc3RhdGUubGFzdEludFZhbHVlID0gMDtcbiAgICB3aGlsZSAoaXNEZWNpbWFsRGlnaXQoY2ggPSBzdGF0ZS5jdXJyZW50KCkpKSB7XG4gICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAxMCAqIHN0YXRlLmxhc3RJbnRWYWx1ZSArIChjaCAtIDB4MzAgLyogMCAqLyk7XG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZS5wb3MgIT09IHN0YXJ0XG4gIH07XG4gIGZ1bmN0aW9uIGlzRGVjaW1hbERpZ2l0KGNoKSB7XG4gICAgcmV0dXJuIGNoID49IDB4MzAgLyogMCAqLyAmJiBjaCA8PSAweDM5IC8qIDkgKi9cbiAgfVxuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLUhleERpZ2l0c1xuICBwcCQxLnJlZ2V4cF9lYXRIZXhEaWdpdHMgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcbiAgICB2YXIgY2ggPSAwO1xuICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IDA7XG4gICAgd2hpbGUgKGlzSGV4RGlnaXQoY2ggPSBzdGF0ZS5jdXJyZW50KCkpKSB7XG4gICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAxNiAqIHN0YXRlLmxhc3RJbnRWYWx1ZSArIGhleFRvSW50KGNoKTtcbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlLnBvcyAhPT0gc3RhcnRcbiAgfTtcbiAgZnVuY3Rpb24gaXNIZXhEaWdpdChjaCkge1xuICAgIHJldHVybiAoXG4gICAgICAoY2ggPj0gMHgzMCAvKiAwICovICYmIGNoIDw9IDB4MzkgLyogOSAqLykgfHxcbiAgICAgIChjaCA+PSAweDQxIC8qIEEgKi8gJiYgY2ggPD0gMHg0NiAvKiBGICovKSB8fFxuICAgICAgKGNoID49IDB4NjEgLyogYSAqLyAmJiBjaCA8PSAweDY2IC8qIGYgKi8pXG4gICAgKVxuICB9XG4gIGZ1bmN0aW9uIGhleFRvSW50KGNoKSB7XG4gICAgaWYgKGNoID49IDB4NDEgLyogQSAqLyAmJiBjaCA8PSAweDQ2IC8qIEYgKi8pIHtcbiAgICAgIHJldHVybiAxMCArIChjaCAtIDB4NDEgLyogQSAqLylcbiAgICB9XG4gICAgaWYgKGNoID49IDB4NjEgLyogYSAqLyAmJiBjaCA8PSAweDY2IC8qIGYgKi8pIHtcbiAgICAgIHJldHVybiAxMCArIChjaCAtIDB4NjEgLyogYSAqLylcbiAgICB9XG4gICAgcmV0dXJuIGNoIC0gMHgzMCAvKiAwICovXG4gIH1cblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1hbm5leEItTGVnYWN5T2N0YWxFc2NhcGVTZXF1ZW5jZVxuICAvLyBBbGxvd3Mgb25seSAwLTM3NyhvY3RhbCkgaS5lLiAwLTI1NShkZWNpbWFsKS5cbiAgcHAkMS5yZWdleHBfZWF0TGVnYWN5T2N0YWxFc2NhcGVTZXF1ZW5jZSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgaWYgKHRoaXMucmVnZXhwX2VhdE9jdGFsRGlnaXQoc3RhdGUpKSB7XG4gICAgICB2YXIgbjEgPSBzdGF0ZS5sYXN0SW50VmFsdWU7XG4gICAgICBpZiAodGhpcy5yZWdleHBfZWF0T2N0YWxEaWdpdChzdGF0ZSkpIHtcbiAgICAgICAgdmFyIG4yID0gc3RhdGUubGFzdEludFZhbHVlO1xuICAgICAgICBpZiAobjEgPD0gMyAmJiB0aGlzLnJlZ2V4cF9lYXRPY3RhbERpZ2l0KHN0YXRlKSkge1xuICAgICAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IG4xICogNjQgKyBuMiAqIDggKyBzdGF0ZS5sYXN0SW50VmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gbjEgKiA4ICsgbjI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IG4xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtT2N0YWxEaWdpdFxuICBwcCQxLnJlZ2V4cF9lYXRPY3RhbERpZ2l0ID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgY2ggPSBzdGF0ZS5jdXJyZW50KCk7XG4gICAgaWYgKGlzT2N0YWxEaWdpdChjaCkpIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IGNoIC0gMHgzMDsgLyogMCAqL1xuICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgc3RhdGUubGFzdEludFZhbHVlID0gMDtcbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcbiAgZnVuY3Rpb24gaXNPY3RhbERpZ2l0KGNoKSB7XG4gICAgcmV0dXJuIGNoID49IDB4MzAgLyogMCAqLyAmJiBjaCA8PSAweDM3IC8qIDcgKi9cbiAgfVxuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLUhleDREaWdpdHNcbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtSGV4RGlnaXRcbiAgLy8gQW5kIEhleERpZ2l0IEhleERpZ2l0IGluIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLUhleEVzY2FwZVNlcXVlbmNlXG4gIHBwJDEucmVnZXhwX2VhdEZpeGVkSGV4RGlnaXRzID0gZnVuY3Rpb24oc3RhdGUsIGxlbmd0aCkge1xuICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcbiAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBjaCA9IHN0YXRlLmN1cnJlbnQoKTtcbiAgICAgIGlmICghaXNIZXhEaWdpdChjaCkpIHtcbiAgICAgICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gMTYgKiBzdGF0ZS5sYXN0SW50VmFsdWUgKyBoZXhUb0ludChjaCk7XG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH07XG5cbiAgLy8gT2JqZWN0IHR5cGUgdXNlZCB0byByZXByZXNlbnQgdG9rZW5zLiBOb3RlIHRoYXQgbm9ybWFsbHksIHRva2Vuc1xuICAvLyBzaW1wbHkgZXhpc3QgYXMgcHJvcGVydGllcyBvbiB0aGUgcGFyc2VyIG9iamVjdC4gVGhpcyBpcyBvbmx5XG4gIC8vIHVzZWQgZm9yIHRoZSBvblRva2VuIGNhbGxiYWNrIGFuZCB0aGUgZXh0ZXJuYWwgdG9rZW5pemVyLlxuXG4gIHZhciBUb2tlbiA9IGZ1bmN0aW9uIFRva2VuKHApIHtcbiAgICB0aGlzLnR5cGUgPSBwLnR5cGU7XG4gICAgdGhpcy52YWx1ZSA9IHAudmFsdWU7XG4gICAgdGhpcy5zdGFydCA9IHAuc3RhcnQ7XG4gICAgdGhpcy5lbmQgPSBwLmVuZDtcbiAgICBpZiAocC5vcHRpb25zLmxvY2F0aW9ucylcbiAgICAgIHsgdGhpcy5sb2MgPSBuZXcgU291cmNlTG9jYXRpb24ocCwgcC5zdGFydExvYywgcC5lbmRMb2MpOyB9XG4gICAgaWYgKHAub3B0aW9ucy5yYW5nZXMpXG4gICAgICB7IHRoaXMucmFuZ2UgPSBbcC5zdGFydCwgcC5lbmRdOyB9XG4gIH07XG5cbiAgLy8gIyMgVG9rZW5pemVyXG5cbiAgdmFyIHBwID0gUGFyc2VyLnByb3RvdHlwZTtcblxuICAvLyBNb3ZlIHRvIHRoZSBuZXh0IHRva2VuXG5cbiAgcHAubmV4dCA9IGZ1bmN0aW9uKGlnbm9yZUVzY2FwZVNlcXVlbmNlSW5LZXl3b3JkKSB7XG4gICAgaWYgKCFpZ25vcmVFc2NhcGVTZXF1ZW5jZUluS2V5d29yZCAmJiB0aGlzLnR5cGUua2V5d29yZCAmJiB0aGlzLmNvbnRhaW5zRXNjKVxuICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodGhpcy5zdGFydCwgXCJFc2NhcGUgc2VxdWVuY2UgaW4ga2V5d29yZCBcIiArIHRoaXMudHlwZS5rZXl3b3JkKTsgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMub25Ub2tlbilcbiAgICAgIHsgdGhpcy5vcHRpb25zLm9uVG9rZW4obmV3IFRva2VuKHRoaXMpKTsgfVxuXG4gICAgdGhpcy5sYXN0VG9rRW5kID0gdGhpcy5lbmQ7XG4gICAgdGhpcy5sYXN0VG9rU3RhcnQgPSB0aGlzLnN0YXJ0O1xuICAgIHRoaXMubGFzdFRva0VuZExvYyA9IHRoaXMuZW5kTG9jO1xuICAgIHRoaXMubGFzdFRva1N0YXJ0TG9jID0gdGhpcy5zdGFydExvYztcbiAgICB0aGlzLm5leHRUb2tlbigpO1xuICB9O1xuXG4gIHBwLmdldFRva2VuID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgcmV0dXJuIG5ldyBUb2tlbih0aGlzKVxuICB9O1xuXG4gIC8vIElmIHdlJ3JlIGluIGFuIEVTNiBlbnZpcm9ubWVudCwgbWFrZSBwYXJzZXJzIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiKVxuICAgIHsgcHBbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRoaXMkMSQxID0gdGhpcztcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciB0b2tlbiA9IHRoaXMkMSQxLmdldFRva2VuKCk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRvbmU6IHRva2VuLnR5cGUgPT09IHR5cGVzJDEuZW9mLFxuICAgICAgICAgICAgdmFsdWU6IHRva2VuXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTsgfVxuXG4gIC8vIFRvZ2dsZSBzdHJpY3QgbW9kZS4gUmUtcmVhZHMgdGhlIG5leHQgbnVtYmVyIG9yIHN0cmluZyB0byBwbGVhc2VcbiAgLy8gcGVkYW50aWMgdGVzdHMgKGBcInVzZSBzdHJpY3RcIjsgMDEwO2Agc2hvdWxkIGZhaWwpLlxuXG4gIC8vIFJlYWQgYSBzaW5nbGUgdG9rZW4sIHVwZGF0aW5nIHRoZSBwYXJzZXIgb2JqZWN0J3MgdG9rZW4tcmVsYXRlZFxuICAvLyBwcm9wZXJ0aWVzLlxuXG4gIHBwLm5leHRUb2tlbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjdXJDb250ZXh0ID0gdGhpcy5jdXJDb250ZXh0KCk7XG4gICAgaWYgKCFjdXJDb250ZXh0IHx8ICFjdXJDb250ZXh0LnByZXNlcnZlU3BhY2UpIHsgdGhpcy5za2lwU3BhY2UoKTsgfVxuXG4gICAgdGhpcy5zdGFydCA9IHRoaXMucG9zO1xuICAgIGlmICh0aGlzLm9wdGlvbnMubG9jYXRpb25zKSB7IHRoaXMuc3RhcnRMb2MgPSB0aGlzLmN1clBvc2l0aW9uKCk7IH1cbiAgICBpZiAodGhpcy5wb3MgPj0gdGhpcy5pbnB1dC5sZW5ndGgpIHsgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5lb2YpIH1cblxuICAgIGlmIChjdXJDb250ZXh0Lm92ZXJyaWRlKSB7IHJldHVybiBjdXJDb250ZXh0Lm92ZXJyaWRlKHRoaXMpIH1cbiAgICBlbHNlIHsgdGhpcy5yZWFkVG9rZW4odGhpcy5mdWxsQ2hhckNvZGVBdFBvcygpKTsgfVxuICB9O1xuXG4gIHBwLnJlYWRUb2tlbiA9IGZ1bmN0aW9uKGNvZGUpIHtcbiAgICAvLyBJZGVudGlmaWVyIG9yIGtleXdvcmQuICdcXHVYWFhYJyBzZXF1ZW5jZXMgYXJlIGFsbG93ZWQgaW5cbiAgICAvLyBpZGVudGlmaWVycywgc28gJ1xcJyBhbHNvIGRpc3BhdGNoZXMgdG8gdGhhdC5cbiAgICBpZiAoaXNJZGVudGlmaWVyU3RhcnQoY29kZSwgdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYpIHx8IGNvZGUgPT09IDkyIC8qICdcXCcgKi8pXG4gICAgICB7IHJldHVybiB0aGlzLnJlYWRXb3JkKCkgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0VG9rZW5Gcm9tQ29kZShjb2RlKVxuICB9O1xuXG4gIHBwLmZ1bGxDaGFyQ29kZUF0UG9zID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvZGUgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MpO1xuICAgIGlmIChjb2RlIDw9IDB4ZDdmZiB8fCBjb2RlID49IDB4ZGMwMCkgeyByZXR1cm4gY29kZSB9XG4gICAgdmFyIG5leHQgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAxKTtcbiAgICByZXR1cm4gbmV4dCA8PSAweGRiZmYgfHwgbmV4dCA+PSAweGUwMDAgPyBjb2RlIDogKGNvZGUgPDwgMTApICsgbmV4dCAtIDB4MzVmZGMwMFxuICB9O1xuXG4gIHBwLnNraXBCbG9ja0NvbW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhcnRMb2MgPSB0aGlzLm9wdGlvbnMub25Db21tZW50ICYmIHRoaXMuY3VyUG9zaXRpb24oKTtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLnBvcywgZW5kID0gdGhpcy5pbnB1dC5pbmRleE9mKFwiKi9cIiwgdGhpcy5wb3MgKz0gMik7XG4gICAgaWYgKGVuZCA9PT0gLTEpIHsgdGhpcy5yYWlzZSh0aGlzLnBvcyAtIDIsIFwiVW50ZXJtaW5hdGVkIGNvbW1lbnRcIik7IH1cbiAgICB0aGlzLnBvcyA9IGVuZCArIDI7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5sb2NhdGlvbnMpIHtcbiAgICAgIGZvciAodmFyIG5leHRCcmVhayA9ICh2b2lkIDApLCBwb3MgPSBzdGFydDsgKG5leHRCcmVhayA9IG5leHRMaW5lQnJlYWsodGhpcy5pbnB1dCwgcG9zLCB0aGlzLnBvcykpID4gLTE7KSB7XG4gICAgICAgICsrdGhpcy5jdXJMaW5lO1xuICAgICAgICBwb3MgPSB0aGlzLmxpbmVTdGFydCA9IG5leHRCcmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5vbkNvbW1lbnQpXG4gICAgICB7IHRoaXMub3B0aW9ucy5vbkNvbW1lbnQodHJ1ZSwgdGhpcy5pbnB1dC5zbGljZShzdGFydCArIDIsIGVuZCksIHN0YXJ0LCB0aGlzLnBvcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRMb2MsIHRoaXMuY3VyUG9zaXRpb24oKSk7IH1cbiAgfTtcblxuICBwcC5za2lwTGluZUNvbW1lbnQgPSBmdW5jdGlvbihzdGFydFNraXApIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLnBvcztcbiAgICB2YXIgc3RhcnRMb2MgPSB0aGlzLm9wdGlvbnMub25Db21tZW50ICYmIHRoaXMuY3VyUG9zaXRpb24oKTtcbiAgICB2YXIgY2ggPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKz0gc3RhcnRTa2lwKTtcbiAgICB3aGlsZSAodGhpcy5wb3MgPCB0aGlzLmlucHV0Lmxlbmd0aCAmJiAhaXNOZXdMaW5lKGNoKSkge1xuICAgICAgY2ggPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQoKyt0aGlzLnBvcyk7XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMub25Db21tZW50KVxuICAgICAgeyB0aGlzLm9wdGlvbnMub25Db21tZW50KGZhbHNlLCB0aGlzLmlucHV0LnNsaWNlKHN0YXJ0ICsgc3RhcnRTa2lwLCB0aGlzLnBvcyksIHN0YXJ0LCB0aGlzLnBvcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRMb2MsIHRoaXMuY3VyUG9zaXRpb24oKSk7IH1cbiAgfTtcblxuICAvLyBDYWxsZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBwYXJzZSBhbmQgYWZ0ZXIgZXZlcnkgdG9rZW4uIFNraXBzXG4gIC8vIHdoaXRlc3BhY2UgYW5kIGNvbW1lbnRzLCBhbmQuXG5cbiAgcHAuc2tpcFNwYWNlID0gZnVuY3Rpb24oKSB7XG4gICAgbG9vcDogd2hpbGUgKHRoaXMucG9zIDwgdGhpcy5pbnB1dC5sZW5ndGgpIHtcbiAgICAgIHZhciBjaCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyk7XG4gICAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICBjYXNlIDMyOiBjYXNlIDE2MDogLy8gJyAnXG4gICAgICAgICsrdGhpcy5wb3M7XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDEzOlxuICAgICAgICBpZiAodGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMSkgPT09IDEwKSB7XG4gICAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgICAgfVxuICAgICAgY2FzZSAxMDogY2FzZSA4MjMyOiBjYXNlIDgyMzM6XG4gICAgICAgICsrdGhpcy5wb3M7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubG9jYXRpb25zKSB7XG4gICAgICAgICAgKyt0aGlzLmN1ckxpbmU7XG4gICAgICAgICAgdGhpcy5saW5lU3RhcnQgPSB0aGlzLnBvcztcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSA0NzogLy8gJy8nXG4gICAgICAgIHN3aXRjaCAodGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMSkpIHtcbiAgICAgICAgY2FzZSA0MjogLy8gJyonXG4gICAgICAgICAgdGhpcy5za2lwQmxvY2tDb21tZW50KCk7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0NzpcbiAgICAgICAgICB0aGlzLnNraXBMaW5lQ29tbWVudCgyKTtcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrIGxvb3BcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGNoID4gOCAmJiBjaCA8IDE0IHx8IGNoID49IDU3NjAgJiYgbm9uQVNDSUl3aGl0ZXNwYWNlLnRlc3QoU3RyaW5nLmZyb21DaGFyQ29kZShjaCkpKSB7XG4gICAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhayBsb29wXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gQ2FsbGVkIGF0IHRoZSBlbmQgb2YgZXZlcnkgdG9rZW4uIFNldHMgYGVuZGAsIGB2YWxgLCBhbmRcbiAgLy8gbWFpbnRhaW5zIGBjb250ZXh0YCBhbmQgYGV4cHJBbGxvd2VkYCwgYW5kIHNraXBzIHRoZSBzcGFjZSBhZnRlclxuICAvLyB0aGUgdG9rZW4sIHNvIHRoYXQgdGhlIG5leHQgb25lJ3MgYHN0YXJ0YCB3aWxsIHBvaW50IGF0IHRoZVxuICAvLyByaWdodCBwb3NpdGlvbi5cblxuICBwcC5maW5pc2hUb2tlbiA9IGZ1bmN0aW9uKHR5cGUsIHZhbCkge1xuICAgIHRoaXMuZW5kID0gdGhpcy5wb3M7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5sb2NhdGlvbnMpIHsgdGhpcy5lbmRMb2MgPSB0aGlzLmN1clBvc2l0aW9uKCk7IH1cbiAgICB2YXIgcHJldlR5cGUgPSB0aGlzLnR5cGU7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLnZhbHVlID0gdmFsO1xuXG4gICAgdGhpcy51cGRhdGVDb250ZXh0KHByZXZUeXBlKTtcbiAgfTtcblxuICAvLyAjIyMgVG9rZW4gcmVhZGluZ1xuXG4gIC8vIFRoaXMgaXMgdGhlIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHRvIGZldGNoIHRoZSBuZXh0IHRva2VuLiBJdFxuICAvLyBpcyBzb21ld2hhdCBvYnNjdXJlLCBiZWNhdXNlIGl0IHdvcmtzIGluIGNoYXJhY3RlciBjb2RlcyByYXRoZXJcbiAgLy8gdGhhbiBjaGFyYWN0ZXJzLCBhbmQgYmVjYXVzZSBvcGVyYXRvciBwYXJzaW5nIGhhcyBiZWVuIGlubGluZWRcbiAgLy8gaW50byBpdC5cbiAgLy9cbiAgLy8gQWxsIGluIHRoZSBuYW1lIG9mIHNwZWVkLlxuICAvL1xuICBwcC5yZWFkVG9rZW5fZG90ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5leHQgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAxKTtcbiAgICBpZiAobmV4dCA+PSA0OCAmJiBuZXh0IDw9IDU3KSB7IHJldHVybiB0aGlzLnJlYWROdW1iZXIodHJ1ZSkgfVxuICAgIHZhciBuZXh0MiA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDIpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNiAmJiBuZXh0ID09PSA0NiAmJiBuZXh0MiA9PT0gNDYpIHsgLy8gNDYgPSBkb3QgJy4nXG4gICAgICB0aGlzLnBvcyArPSAzO1xuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5lbGxpcHNpcylcbiAgICB9IGVsc2Uge1xuICAgICAgKyt0aGlzLnBvcztcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGVzJDEuZG90KVxuICAgIH1cbiAgfTtcblxuICBwcC5yZWFkVG9rZW5fc2xhc2ggPSBmdW5jdGlvbigpIHsgLy8gJy8nXG4gICAgdmFyIG5leHQgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAxKTtcbiAgICBpZiAodGhpcy5leHByQWxsb3dlZCkgeyArK3RoaXMucG9zOyByZXR1cm4gdGhpcy5yZWFkUmVnZXhwKCkgfVxuICAgIGlmIChuZXh0ID09PSA2MSkgeyByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLmFzc2lnbiwgMikgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaE9wKHR5cGVzJDEuc2xhc2gsIDEpXG4gIH07XG5cbiAgcHAucmVhZFRva2VuX211bHRfbW9kdWxvX2V4cCA9IGZ1bmN0aW9uKGNvZGUpIHsgLy8gJyUqJ1xuICAgIHZhciBuZXh0ID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMSk7XG4gICAgdmFyIHNpemUgPSAxO1xuICAgIHZhciB0b2tlbnR5cGUgPSBjb2RlID09PSA0MiA/IHR5cGVzJDEuc3RhciA6IHR5cGVzJDEubW9kdWxvO1xuXG4gICAgLy8gZXhwb25lbnRpYXRpb24gb3BlcmF0b3IgKiogYW5kICoqPVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNyAmJiBjb2RlID09PSA0MiAmJiBuZXh0ID09PSA0Mikge1xuICAgICAgKytzaXplO1xuICAgICAgdG9rZW50eXBlID0gdHlwZXMkMS5zdGFyc3RhcjtcbiAgICAgIG5leHQgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAyKTtcbiAgICB9XG5cbiAgICBpZiAobmV4dCA9PT0gNjEpIHsgcmV0dXJuIHRoaXMuZmluaXNoT3AodHlwZXMkMS5hc3NpZ24sIHNpemUgKyAxKSB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoT3AodG9rZW50eXBlLCBzaXplKVxuICB9O1xuXG4gIHBwLnJlYWRUb2tlbl9waXBlX2FtcCA9IGZ1bmN0aW9uKGNvZGUpIHsgLy8gJ3wmJ1xuICAgIHZhciBuZXh0ID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMSk7XG4gICAgaWYgKG5leHQgPT09IGNvZGUpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gMTIpIHtcbiAgICAgICAgdmFyIG5leHQyID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMik7XG4gICAgICAgIGlmIChuZXh0MiA9PT0gNjEpIHsgcmV0dXJuIHRoaXMuZmluaXNoT3AodHlwZXMkMS5hc3NpZ24sIDMpIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE9wKGNvZGUgPT09IDEyNCA/IHR5cGVzJDEubG9naWNhbE9SIDogdHlwZXMkMS5sb2dpY2FsQU5ELCAyKVxuICAgIH1cbiAgICBpZiAobmV4dCA9PT0gNjEpIHsgcmV0dXJuIHRoaXMuZmluaXNoT3AodHlwZXMkMS5hc3NpZ24sIDIpIH1cbiAgICByZXR1cm4gdGhpcy5maW5pc2hPcChjb2RlID09PSAxMjQgPyB0eXBlcyQxLmJpdHdpc2VPUiA6IHR5cGVzJDEuYml0d2lzZUFORCwgMSlcbiAgfTtcblxuICBwcC5yZWFkVG9rZW5fY2FyZXQgPSBmdW5jdGlvbigpIHsgLy8gJ14nXG4gICAgdmFyIG5leHQgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAxKTtcbiAgICBpZiAobmV4dCA9PT0gNjEpIHsgcmV0dXJuIHRoaXMuZmluaXNoT3AodHlwZXMkMS5hc3NpZ24sIDIpIH1cbiAgICByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLmJpdHdpc2VYT1IsIDEpXG4gIH07XG5cbiAgcHAucmVhZFRva2VuX3BsdXNfbWluID0gZnVuY3Rpb24oY29kZSkgeyAvLyAnKy0nXG4gICAgdmFyIG5leHQgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAxKTtcbiAgICBpZiAobmV4dCA9PT0gY29kZSkge1xuICAgICAgaWYgKG5leHQgPT09IDQ1ICYmICF0aGlzLmluTW9kdWxlICYmIHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDIpID09PSA2MiAmJlxuICAgICAgICAgICh0aGlzLmxhc3RUb2tFbmQgPT09IDAgfHwgbGluZUJyZWFrLnRlc3QodGhpcy5pbnB1dC5zbGljZSh0aGlzLmxhc3RUb2tFbmQsIHRoaXMucG9zKSkpKSB7XG4gICAgICAgIC8vIEEgYC0tPmAgbGluZSBjb21tZW50XG4gICAgICAgIHRoaXMuc2tpcExpbmVDb21tZW50KDMpO1xuICAgICAgICB0aGlzLnNraXBTcGFjZSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5uZXh0VG9rZW4oKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoT3AodHlwZXMkMS5pbmNEZWMsIDIpXG4gICAgfVxuICAgIGlmIChuZXh0ID09PSA2MSkgeyByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLmFzc2lnbiwgMikgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaE9wKHR5cGVzJDEucGx1c01pbiwgMSlcbiAgfTtcblxuICBwcC5yZWFkVG9rZW5fbHRfZ3QgPSBmdW5jdGlvbihjb2RlKSB7IC8vICc8PidcbiAgICB2YXIgbmV4dCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDEpO1xuICAgIHZhciBzaXplID0gMTtcbiAgICBpZiAobmV4dCA9PT0gY29kZSkge1xuICAgICAgc2l6ZSA9IGNvZGUgPT09IDYyICYmIHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDIpID09PSA2MiA/IDMgOiAyO1xuICAgICAgaWYgKHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIHNpemUpID09PSA2MSkgeyByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLmFzc2lnbiwgc2l6ZSArIDEpIH1cbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE9wKHR5cGVzJDEuYml0U2hpZnQsIHNpemUpXG4gICAgfVxuICAgIGlmIChuZXh0ID09PSAzMyAmJiBjb2RlID09PSA2MCAmJiAhdGhpcy5pbk1vZHVsZSAmJiB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAyKSA9PT0gNDUgJiZcbiAgICAgICAgdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMykgPT09IDQ1KSB7XG4gICAgICAvLyBgPCEtLWAsIGFuIFhNTC1zdHlsZSBjb21tZW50IHRoYXQgc2hvdWxkIGJlIGludGVycHJldGVkIGFzIGEgbGluZSBjb21tZW50XG4gICAgICB0aGlzLnNraXBMaW5lQ29tbWVudCg0KTtcbiAgICAgIHRoaXMuc2tpcFNwYWNlKCk7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0VG9rZW4oKVxuICAgIH1cbiAgICBpZiAobmV4dCA9PT0gNjEpIHsgc2l6ZSA9IDI7IH1cbiAgICByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLnJlbGF0aW9uYWwsIHNpemUpXG4gIH07XG5cbiAgcHAucmVhZFRva2VuX2VxX2V4Y2wgPSBmdW5jdGlvbihjb2RlKSB7IC8vICc9ISdcbiAgICB2YXIgbmV4dCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDEpO1xuICAgIGlmIChuZXh0ID09PSA2MSkgeyByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLmVxdWFsaXR5LCB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAyKSA9PT0gNjEgPyAzIDogMikgfVxuICAgIGlmIChjb2RlID09PSA2MSAmJiBuZXh0ID09PSA2MiAmJiB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNikgeyAvLyAnPT4nXG4gICAgICB0aGlzLnBvcyArPSAyO1xuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5hcnJvdylcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoT3AoY29kZSA9PT0gNjEgPyB0eXBlcyQxLmVxIDogdHlwZXMkMS5wcmVmaXgsIDEpXG4gIH07XG5cbiAgcHAucmVhZFRva2VuX3F1ZXN0aW9uID0gZnVuY3Rpb24oKSB7IC8vICc/J1xuICAgIHZhciBlY21hVmVyc2lvbiA9IHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbjtcbiAgICBpZiAoZWNtYVZlcnNpb24gPj0gMTEpIHtcbiAgICAgIHZhciBuZXh0ID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMSk7XG4gICAgICBpZiAobmV4dCA9PT0gNDYpIHtcbiAgICAgICAgdmFyIG5leHQyID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMik7XG4gICAgICAgIGlmIChuZXh0MiA8IDQ4IHx8IG5leHQyID4gNTcpIHsgcmV0dXJuIHRoaXMuZmluaXNoT3AodHlwZXMkMS5xdWVzdGlvbkRvdCwgMikgfVxuICAgICAgfVxuICAgICAgaWYgKG5leHQgPT09IDYzKSB7XG4gICAgICAgIGlmIChlY21hVmVyc2lvbiA+PSAxMikge1xuICAgICAgICAgIHZhciBuZXh0MiQxID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMik7XG4gICAgICAgICAgaWYgKG5leHQyJDEgPT09IDYxKSB7IHJldHVybiB0aGlzLmZpbmlzaE9wKHR5cGVzJDEuYXNzaWduLCAzKSB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoT3AodHlwZXMkMS5jb2FsZXNjZSwgMilcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoT3AodHlwZXMkMS5xdWVzdGlvbiwgMSlcbiAgfTtcblxuICBwcC5yZWFkVG9rZW5fbnVtYmVyU2lnbiA9IGZ1bmN0aW9uKCkgeyAvLyAnIydcbiAgICB2YXIgZWNtYVZlcnNpb24gPSB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb247XG4gICAgdmFyIGNvZGUgPSAzNTsgLy8gJyMnXG4gICAgaWYgKGVjbWFWZXJzaW9uID49IDEzKSB7XG4gICAgICArK3RoaXMucG9zO1xuICAgICAgY29kZSA9IHRoaXMuZnVsbENoYXJDb2RlQXRQb3MoKTtcbiAgICAgIGlmIChpc0lkZW50aWZpZXJTdGFydChjb2RlLCB0cnVlKSB8fCBjb2RlID09PSA5MiAvKiAnXFwnICovKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGVzJDEucHJpdmF0ZUlkLCB0aGlzLnJlYWRXb3JkMSgpKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucmFpc2UodGhpcy5wb3MsIFwiVW5leHBlY3RlZCBjaGFyYWN0ZXIgJ1wiICsgY29kZVBvaW50VG9TdHJpbmcoY29kZSkgKyBcIidcIik7XG4gIH07XG5cbiAgcHAuZ2V0VG9rZW5Gcm9tQ29kZSA9IGZ1bmN0aW9uKGNvZGUpIHtcbiAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAvLyBUaGUgaW50ZXJwcmV0YXRpb24gb2YgYSBkb3QgZGVwZW5kcyBvbiB3aGV0aGVyIGl0IGlzIGZvbGxvd2VkXG4gICAgLy8gYnkgYSBkaWdpdCBvciBhbm90aGVyIHR3byBkb3RzLlxuICAgIGNhc2UgNDY6IC8vICcuJ1xuICAgICAgcmV0dXJuIHRoaXMucmVhZFRva2VuX2RvdCgpXG5cbiAgICAvLyBQdW5jdHVhdGlvbiB0b2tlbnMuXG4gICAgY2FzZSA0MDogKyt0aGlzLnBvczsgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5wYXJlbkwpXG4gICAgY2FzZSA0MTogKyt0aGlzLnBvczsgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5wYXJlblIpXG4gICAgY2FzZSA1OTogKyt0aGlzLnBvczsgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5zZW1pKVxuICAgIGNhc2UgNDQ6ICsrdGhpcy5wb3M7IHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGVzJDEuY29tbWEpXG4gICAgY2FzZSA5MTogKyt0aGlzLnBvczsgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5icmFja2V0TClcbiAgICBjYXNlIDkzOiArK3RoaXMucG9zOyByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLmJyYWNrZXRSKVxuICAgIGNhc2UgMTIzOiArK3RoaXMucG9zOyByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLmJyYWNlTClcbiAgICBjYXNlIDEyNTogKyt0aGlzLnBvczsgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5icmFjZVIpXG4gICAgY2FzZSA1ODogKyt0aGlzLnBvczsgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5jb2xvbilcblxuICAgIGNhc2UgOTY6IC8vICdgJ1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA8IDYpIHsgYnJlYWsgfVxuICAgICAgKyt0aGlzLnBvcztcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGVzJDEuYmFja1F1b3RlKVxuXG4gICAgY2FzZSA0ODogLy8gJzAnXG4gICAgICB2YXIgbmV4dCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDEpO1xuICAgICAgaWYgKG5leHQgPT09IDEyMCB8fCBuZXh0ID09PSA4OCkgeyByZXR1cm4gdGhpcy5yZWFkUmFkaXhOdW1iZXIoMTYpIH0gLy8gJzB4JywgJzBYJyAtIGhleCBudW1iZXJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNikge1xuICAgICAgICBpZiAobmV4dCA9PT0gMTExIHx8IG5leHQgPT09IDc5KSB7IHJldHVybiB0aGlzLnJlYWRSYWRpeE51bWJlcig4KSB9IC8vICcwbycsICcwTycgLSBvY3RhbCBudW1iZXJcbiAgICAgICAgaWYgKG5leHQgPT09IDk4IHx8IG5leHQgPT09IDY2KSB7IHJldHVybiB0aGlzLnJlYWRSYWRpeE51bWJlcigyKSB9IC8vICcwYicsICcwQicgLSBiaW5hcnkgbnVtYmVyXG4gICAgICB9XG5cbiAgICAvLyBBbnl0aGluZyBlbHNlIGJlZ2lubmluZyB3aXRoIGEgZGlnaXQgaXMgYW4gaW50ZWdlciwgb2N0YWxcbiAgICAvLyBudW1iZXIsIG9yIGZsb2F0LlxuICAgIGNhc2UgNDk6IGNhc2UgNTA6IGNhc2UgNTE6IGNhc2UgNTI6IGNhc2UgNTM6IGNhc2UgNTQ6IGNhc2UgNTU6IGNhc2UgNTY6IGNhc2UgNTc6IC8vIDEtOVxuICAgICAgcmV0dXJuIHRoaXMucmVhZE51bWJlcihmYWxzZSlcblxuICAgIC8vIFF1b3RlcyBwcm9kdWNlIHN0cmluZ3MuXG4gICAgY2FzZSAzNDogY2FzZSAzOTogLy8gJ1wiJywgXCInXCJcbiAgICAgIHJldHVybiB0aGlzLnJlYWRTdHJpbmcoY29kZSlcblxuICAgIC8vIE9wZXJhdG9ycyBhcmUgcGFyc2VkIGlubGluZSBpbiB0aW55IHN0YXRlIG1hY2hpbmVzLiAnPScgKDYxKSBpc1xuICAgIC8vIG9mdGVuIHJlZmVycmVkIHRvLiBgZmluaXNoT3BgIHNpbXBseSBza2lwcyB0aGUgYW1vdW50IG9mXG4gICAgLy8gY2hhcmFjdGVycyBpdCBpcyBnaXZlbiBhcyBzZWNvbmQgYXJndW1lbnQsIGFuZCByZXR1cm5zIGEgdG9rZW5cbiAgICAvLyBvZiB0aGUgdHlwZSBnaXZlbiBieSBpdHMgZmlyc3QgYXJndW1lbnQuXG4gICAgY2FzZSA0NzogLy8gJy8nXG4gICAgICByZXR1cm4gdGhpcy5yZWFkVG9rZW5fc2xhc2goKVxuXG4gICAgY2FzZSAzNzogY2FzZSA0MjogLy8gJyUqJ1xuICAgICAgcmV0dXJuIHRoaXMucmVhZFRva2VuX211bHRfbW9kdWxvX2V4cChjb2RlKVxuXG4gICAgY2FzZSAxMjQ6IGNhc2UgMzg6IC8vICd8JidcbiAgICAgIHJldHVybiB0aGlzLnJlYWRUb2tlbl9waXBlX2FtcChjb2RlKVxuXG4gICAgY2FzZSA5NDogLy8gJ14nXG4gICAgICByZXR1cm4gdGhpcy5yZWFkVG9rZW5fY2FyZXQoKVxuXG4gICAgY2FzZSA0MzogY2FzZSA0NTogLy8gJystJ1xuICAgICAgcmV0dXJuIHRoaXMucmVhZFRva2VuX3BsdXNfbWluKGNvZGUpXG5cbiAgICBjYXNlIDYwOiBjYXNlIDYyOiAvLyAnPD4nXG4gICAgICByZXR1cm4gdGhpcy5yZWFkVG9rZW5fbHRfZ3QoY29kZSlcblxuICAgIGNhc2UgNjE6IGNhc2UgMzM6IC8vICc9ISdcbiAgICAgIHJldHVybiB0aGlzLnJlYWRUb2tlbl9lcV9leGNsKGNvZGUpXG5cbiAgICBjYXNlIDYzOiAvLyAnPydcbiAgICAgIHJldHVybiB0aGlzLnJlYWRUb2tlbl9xdWVzdGlvbigpXG5cbiAgICBjYXNlIDEyNjogLy8gJ34nXG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLnByZWZpeCwgMSlcblxuICAgIGNhc2UgMzU6IC8vICcjJ1xuICAgICAgcmV0dXJuIHRoaXMucmVhZFRva2VuX251bWJlclNpZ24oKVxuICAgIH1cblxuICAgIHRoaXMucmFpc2UodGhpcy5wb3MsIFwiVW5leHBlY3RlZCBjaGFyYWN0ZXIgJ1wiICsgY29kZVBvaW50VG9TdHJpbmcoY29kZSkgKyBcIidcIik7XG4gIH07XG5cbiAgcHAuZmluaXNoT3AgPSBmdW5jdGlvbih0eXBlLCBzaXplKSB7XG4gICAgdmFyIHN0ciA9IHRoaXMuaW5wdXQuc2xpY2UodGhpcy5wb3MsIHRoaXMucG9zICsgc2l6ZSk7XG4gICAgdGhpcy5wb3MgKz0gc2l6ZTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlLCBzdHIpXG4gIH07XG5cbiAgcHAucmVhZFJlZ2V4cCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlc2NhcGVkLCBpbkNsYXNzLCBzdGFydCA9IHRoaXMucG9zO1xuICAgIGZvciAoOzspIHtcbiAgICAgIGlmICh0aGlzLnBvcyA+PSB0aGlzLmlucHV0Lmxlbmd0aCkgeyB0aGlzLnJhaXNlKHN0YXJ0LCBcIlVudGVybWluYXRlZCByZWd1bGFyIGV4cHJlc3Npb25cIik7IH1cbiAgICAgIHZhciBjaCA9IHRoaXMuaW5wdXQuY2hhckF0KHRoaXMucG9zKTtcbiAgICAgIGlmIChsaW5lQnJlYWsudGVzdChjaCkpIHsgdGhpcy5yYWlzZShzdGFydCwgXCJVbnRlcm1pbmF0ZWQgcmVndWxhciBleHByZXNzaW9uXCIpOyB9XG4gICAgICBpZiAoIWVzY2FwZWQpIHtcbiAgICAgICAgaWYgKGNoID09PSBcIltcIikgeyBpbkNsYXNzID0gdHJ1ZTsgfVxuICAgICAgICBlbHNlIGlmIChjaCA9PT0gXCJdXCIgJiYgaW5DbGFzcykgeyBpbkNsYXNzID0gZmFsc2U7IH1cbiAgICAgICAgZWxzZSBpZiAoY2ggPT09IFwiL1wiICYmICFpbkNsYXNzKSB7IGJyZWFrIH1cbiAgICAgICAgZXNjYXBlZCA9IGNoID09PSBcIlxcXFxcIjtcbiAgICAgIH0gZWxzZSB7IGVzY2FwZWQgPSBmYWxzZTsgfVxuICAgICAgKyt0aGlzLnBvcztcbiAgICB9XG4gICAgdmFyIHBhdHRlcm4gPSB0aGlzLmlucHV0LnNsaWNlKHN0YXJ0LCB0aGlzLnBvcyk7XG4gICAgKyt0aGlzLnBvcztcbiAgICB2YXIgZmxhZ3NTdGFydCA9IHRoaXMucG9zO1xuICAgIHZhciBmbGFncyA9IHRoaXMucmVhZFdvcmQxKCk7XG4gICAgaWYgKHRoaXMuY29udGFpbnNFc2MpIHsgdGhpcy51bmV4cGVjdGVkKGZsYWdzU3RhcnQpOyB9XG5cbiAgICAvLyBWYWxpZGF0ZSBwYXR0ZXJuXG4gICAgdmFyIHN0YXRlID0gdGhpcy5yZWdleHBTdGF0ZSB8fCAodGhpcy5yZWdleHBTdGF0ZSA9IG5ldyBSZWdFeHBWYWxpZGF0aW9uU3RhdGUodGhpcykpO1xuICAgIHN0YXRlLnJlc2V0KHN0YXJ0LCBwYXR0ZXJuLCBmbGFncyk7XG4gICAgdGhpcy52YWxpZGF0ZVJlZ0V4cEZsYWdzKHN0YXRlKTtcbiAgICB0aGlzLnZhbGlkYXRlUmVnRXhwUGF0dGVybihzdGF0ZSk7XG5cbiAgICAvLyBDcmVhdGUgTGl0ZXJhbCN2YWx1ZSBwcm9wZXJ0eSB2YWx1ZS5cbiAgICB2YXIgdmFsdWUgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICB2YWx1ZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgZmxhZ3MpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIEVTVHJlZSByZXF1aXJlcyBudWxsIGlmIGl0IGZhaWxlZCB0byBpbnN0YW50aWF0ZSBSZWdFeHAgb2JqZWN0LlxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2VzdHJlZS9lc3RyZWUvYmxvYi9hMjcwMDNhZGY0ZmQ3YmZhZDQ0ZGU5Y2VmMzcyYTJlYWNkNTI3YjFjL2VzNS5tZCNyZWdleHBsaXRlcmFsXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5yZWdleHAsIHtwYXR0ZXJuOiBwYXR0ZXJuLCBmbGFnczogZmxhZ3MsIHZhbHVlOiB2YWx1ZX0pXG4gIH07XG5cbiAgLy8gUmVhZCBhbiBpbnRlZ2VyIGluIHRoZSBnaXZlbiByYWRpeC4gUmV0dXJuIG51bGwgaWYgemVybyBkaWdpdHNcbiAgLy8gd2VyZSByZWFkLCB0aGUgaW50ZWdlciB2YWx1ZSBvdGhlcndpc2UuIFdoZW4gYGxlbmAgaXMgZ2l2ZW4sIHRoaXNcbiAgLy8gd2lsbCByZXR1cm4gYG51bGxgIHVubGVzcyB0aGUgaW50ZWdlciBoYXMgZXhhY3RseSBgbGVuYCBkaWdpdHMuXG5cbiAgcHAucmVhZEludCA9IGZ1bmN0aW9uKHJhZGl4LCBsZW4sIG1heWJlTGVnYWN5T2N0YWxOdW1lcmljTGl0ZXJhbCkge1xuICAgIC8vIGBsZW5gIGlzIHVzZWQgZm9yIGNoYXJhY3RlciBlc2NhcGUgc2VxdWVuY2VzLiBJbiB0aGF0IGNhc2UsIGRpc2FsbG93IHNlcGFyYXRvcnMuXG4gICAgdmFyIGFsbG93U2VwYXJhdG9ycyA9IHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSAxMiAmJiBsZW4gPT09IHVuZGVmaW5lZDtcblxuICAgIC8vIGBtYXliZUxlZ2FjeU9jdGFsTnVtZXJpY0xpdGVyYWxgIGlzIHRydWUgaWYgaXQgZG9lc24ndCBoYXZlIHByZWZpeCAoMHgsMG8sMGIpXG4gICAgLy8gYW5kIGlzbid0IGZyYWN0aW9uIHBhcnQgbm9yIGV4cG9uZW50IHBhcnQuIEluIHRoYXQgY2FzZSwgaWYgdGhlIGZpcnN0IGRpZ2l0XG4gICAgLy8gaXMgemVybyB0aGVuIGRpc2FsbG93IHNlcGFyYXRvcnMuXG4gICAgdmFyIGlzTGVnYWN5T2N0YWxOdW1lcmljTGl0ZXJhbCA9IG1heWJlTGVnYWN5T2N0YWxOdW1lcmljTGl0ZXJhbCAmJiB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MpID09PSA0ODtcblxuICAgIHZhciBzdGFydCA9IHRoaXMucG9zLCB0b3RhbCA9IDAsIGxhc3RDb2RlID0gMDtcbiAgICBmb3IgKHZhciBpID0gMCwgZSA9IGxlbiA9PSBudWxsID8gSW5maW5pdHkgOiBsZW47IGkgPCBlOyArK2ksICsrdGhpcy5wb3MpIHtcbiAgICAgIHZhciBjb2RlID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zKSwgdmFsID0gKHZvaWQgMCk7XG5cbiAgICAgIGlmIChhbGxvd1NlcGFyYXRvcnMgJiYgY29kZSA9PT0gOTUpIHtcbiAgICAgICAgaWYgKGlzTGVnYWN5T2N0YWxOdW1lcmljTGl0ZXJhbCkgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodGhpcy5wb3MsIFwiTnVtZXJpYyBzZXBhcmF0b3IgaXMgbm90IGFsbG93ZWQgaW4gbGVnYWN5IG9jdGFsIG51bWVyaWMgbGl0ZXJhbHNcIik7IH1cbiAgICAgICAgaWYgKGxhc3RDb2RlID09PSA5NSkgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodGhpcy5wb3MsIFwiTnVtZXJpYyBzZXBhcmF0b3IgbXVzdCBiZSBleGFjdGx5IG9uZSB1bmRlcnNjb3JlXCIpOyB9XG4gICAgICAgIGlmIChpID09PSAwKSB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZSh0aGlzLnBvcywgXCJOdW1lcmljIHNlcGFyYXRvciBpcyBub3QgYWxsb3dlZCBhdCB0aGUgZmlyc3Qgb2YgZGlnaXRzXCIpOyB9XG4gICAgICAgIGxhc3RDb2RlID0gY29kZTtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYgKGNvZGUgPj0gOTcpIHsgdmFsID0gY29kZSAtIDk3ICsgMTA7IH0gLy8gYVxuICAgICAgZWxzZSBpZiAoY29kZSA+PSA2NSkgeyB2YWwgPSBjb2RlIC0gNjUgKyAxMDsgfSAvLyBBXG4gICAgICBlbHNlIGlmIChjb2RlID49IDQ4ICYmIGNvZGUgPD0gNTcpIHsgdmFsID0gY29kZSAtIDQ4OyB9IC8vIDAtOVxuICAgICAgZWxzZSB7IHZhbCA9IEluZmluaXR5OyB9XG4gICAgICBpZiAodmFsID49IHJhZGl4KSB7IGJyZWFrIH1cbiAgICAgIGxhc3RDb2RlID0gY29kZTtcbiAgICAgIHRvdGFsID0gdG90YWwgKiByYWRpeCArIHZhbDtcbiAgICB9XG5cbiAgICBpZiAoYWxsb3dTZXBhcmF0b3JzICYmIGxhc3RDb2RlID09PSA5NSkgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodGhpcy5wb3MgLSAxLCBcIk51bWVyaWMgc2VwYXJhdG9yIGlzIG5vdCBhbGxvd2VkIGF0IHRoZSBsYXN0IG9mIGRpZ2l0c1wiKTsgfVxuICAgIGlmICh0aGlzLnBvcyA9PT0gc3RhcnQgfHwgbGVuICE9IG51bGwgJiYgdGhpcy5wb3MgLSBzdGFydCAhPT0gbGVuKSB7IHJldHVybiBudWxsIH1cblxuICAgIHJldHVybiB0b3RhbFxuICB9O1xuXG4gIGZ1bmN0aW9uIHN0cmluZ1RvTnVtYmVyKHN0ciwgaXNMZWdhY3lPY3RhbE51bWVyaWNMaXRlcmFsKSB7XG4gICAgaWYgKGlzTGVnYWN5T2N0YWxOdW1lcmljTGl0ZXJhbCkge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHN0ciwgOClcbiAgICB9XG5cbiAgICAvLyBgcGFyc2VGbG9hdCh2YWx1ZSlgIHN0b3BzIHBhcnNpbmcgYXQgdGhlIGZpcnN0IG51bWVyaWMgc2VwYXJhdG9yIHRoZW4gcmV0dXJucyBhIHdyb25nIHZhbHVlLlxuICAgIHJldHVybiBwYXJzZUZsb2F0KHN0ci5yZXBsYWNlKC9fL2csIFwiXCIpKVxuICB9XG5cbiAgZnVuY3Rpb24gc3RyaW5nVG9CaWdJbnQoc3RyKSB7XG4gICAgaWYgKHR5cGVvZiBCaWdJbnQgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICAvLyBgQmlnSW50KHZhbHVlKWAgdGhyb3dzIHN5bnRheCBlcnJvciBpZiB0aGUgc3RyaW5nIGNvbnRhaW5zIG51bWVyaWMgc2VwYXJhdG9ycy5cbiAgICByZXR1cm4gQmlnSW50KHN0ci5yZXBsYWNlKC9fL2csIFwiXCIpKVxuICB9XG5cbiAgcHAucmVhZFJhZGl4TnVtYmVyID0gZnVuY3Rpb24ocmFkaXgpIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLnBvcztcbiAgICB0aGlzLnBvcyArPSAyOyAvLyAweFxuICAgIHZhciB2YWwgPSB0aGlzLnJlYWRJbnQocmFkaXgpO1xuICAgIGlmICh2YWwgPT0gbnVsbCkgeyB0aGlzLnJhaXNlKHRoaXMuc3RhcnQgKyAyLCBcIkV4cGVjdGVkIG51bWJlciBpbiByYWRpeCBcIiArIHJhZGl4KTsgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gMTEgJiYgdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zKSA9PT0gMTEwKSB7XG4gICAgICB2YWwgPSBzdHJpbmdUb0JpZ0ludCh0aGlzLmlucHV0LnNsaWNlKHN0YXJ0LCB0aGlzLnBvcykpO1xuICAgICAgKyt0aGlzLnBvcztcbiAgICB9IGVsc2UgaWYgKGlzSWRlbnRpZmllclN0YXJ0KHRoaXMuZnVsbENoYXJDb2RlQXRQb3MoKSkpIHsgdGhpcy5yYWlzZSh0aGlzLnBvcywgXCJJZGVudGlmaWVyIGRpcmVjdGx5IGFmdGVyIG51bWJlclwiKTsgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGVzJDEubnVtLCB2YWwpXG4gIH07XG5cbiAgLy8gUmVhZCBhbiBpbnRlZ2VyLCBvY3RhbCBpbnRlZ2VyLCBvciBmbG9hdGluZy1wb2ludCBudW1iZXIuXG5cbiAgcHAucmVhZE51bWJlciA9IGZ1bmN0aW9uKHN0YXJ0c1dpdGhEb3QpIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLnBvcztcbiAgICBpZiAoIXN0YXJ0c1dpdGhEb3QgJiYgdGhpcy5yZWFkSW50KDEwLCB1bmRlZmluZWQsIHRydWUpID09PSBudWxsKSB7IHRoaXMucmFpc2Uoc3RhcnQsIFwiSW52YWxpZCBudW1iZXJcIik7IH1cbiAgICB2YXIgb2N0YWwgPSB0aGlzLnBvcyAtIHN0YXJ0ID49IDIgJiYgdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHN0YXJ0KSA9PT0gNDg7XG4gICAgaWYgKG9jdGFsICYmIHRoaXMuc3RyaWN0KSB7IHRoaXMucmFpc2Uoc3RhcnQsIFwiSW52YWxpZCBudW1iZXJcIik7IH1cbiAgICB2YXIgbmV4dCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyk7XG4gICAgaWYgKCFvY3RhbCAmJiAhc3RhcnRzV2l0aERvdCAmJiB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gMTEgJiYgbmV4dCA9PT0gMTEwKSB7XG4gICAgICB2YXIgdmFsJDEgPSBzdHJpbmdUb0JpZ0ludCh0aGlzLmlucHV0LnNsaWNlKHN0YXJ0LCB0aGlzLnBvcykpO1xuICAgICAgKyt0aGlzLnBvcztcbiAgICAgIGlmIChpc0lkZW50aWZpZXJTdGFydCh0aGlzLmZ1bGxDaGFyQ29kZUF0UG9zKCkpKSB7IHRoaXMucmFpc2UodGhpcy5wb3MsIFwiSWRlbnRpZmllciBkaXJlY3RseSBhZnRlciBudW1iZXJcIik7IH1cbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGVzJDEubnVtLCB2YWwkMSlcbiAgICB9XG4gICAgaWYgKG9jdGFsICYmIC9bODldLy50ZXN0KHRoaXMuaW5wdXQuc2xpY2Uoc3RhcnQsIHRoaXMucG9zKSkpIHsgb2N0YWwgPSBmYWxzZTsgfVxuICAgIGlmIChuZXh0ID09PSA0NiAmJiAhb2N0YWwpIHsgLy8gJy4nXG4gICAgICArK3RoaXMucG9zO1xuICAgICAgdGhpcy5yZWFkSW50KDEwKTtcbiAgICAgIG5leHQgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MpO1xuICAgIH1cbiAgICBpZiAoKG5leHQgPT09IDY5IHx8IG5leHQgPT09IDEwMSkgJiYgIW9jdGFsKSB7IC8vICdlRSdcbiAgICAgIG5leHQgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQoKyt0aGlzLnBvcyk7XG4gICAgICBpZiAobmV4dCA9PT0gNDMgfHwgbmV4dCA9PT0gNDUpIHsgKyt0aGlzLnBvczsgfSAvLyAnKy0nXG4gICAgICBpZiAodGhpcy5yZWFkSW50KDEwKSA9PT0gbnVsbCkgeyB0aGlzLnJhaXNlKHN0YXJ0LCBcIkludmFsaWQgbnVtYmVyXCIpOyB9XG4gICAgfVxuICAgIGlmIChpc0lkZW50aWZpZXJTdGFydCh0aGlzLmZ1bGxDaGFyQ29kZUF0UG9zKCkpKSB7IHRoaXMucmFpc2UodGhpcy5wb3MsIFwiSWRlbnRpZmllciBkaXJlY3RseSBhZnRlciBudW1iZXJcIik7IH1cblxuICAgIHZhciB2YWwgPSBzdHJpbmdUb051bWJlcih0aGlzLmlucHV0LnNsaWNlKHN0YXJ0LCB0aGlzLnBvcyksIG9jdGFsKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLm51bSwgdmFsKVxuICB9O1xuXG4gIC8vIFJlYWQgYSBzdHJpbmcgdmFsdWUsIGludGVycHJldGluZyBiYWNrc2xhc2gtZXNjYXBlcy5cblxuICBwcC5yZWFkQ29kZVBvaW50ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNoID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zKSwgY29kZTtcblxuICAgIGlmIChjaCA9PT0gMTIzKSB7IC8vICd7J1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA8IDYpIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgICAgIHZhciBjb2RlUG9zID0gKyt0aGlzLnBvcztcbiAgICAgIGNvZGUgPSB0aGlzLnJlYWRIZXhDaGFyKHRoaXMuaW5wdXQuaW5kZXhPZihcIn1cIiwgdGhpcy5wb3MpIC0gdGhpcy5wb3MpO1xuICAgICAgKyt0aGlzLnBvcztcbiAgICAgIGlmIChjb2RlID4gMHgxMEZGRkYpIHsgdGhpcy5pbnZhbGlkU3RyaW5nVG9rZW4oY29kZVBvcywgXCJDb2RlIHBvaW50IG91dCBvZiBib3VuZHNcIik7IH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29kZSA9IHRoaXMucmVhZEhleENoYXIoNCk7XG4gICAgfVxuICAgIHJldHVybiBjb2RlXG4gIH07XG5cbiAgcHAucmVhZFN0cmluZyA9IGZ1bmN0aW9uKHF1b3RlKSB7XG4gICAgdmFyIG91dCA9IFwiXCIsIGNodW5rU3RhcnQgPSArK3RoaXMucG9zO1xuICAgIGZvciAoOzspIHtcbiAgICAgIGlmICh0aGlzLnBvcyA+PSB0aGlzLmlucHV0Lmxlbmd0aCkgeyB0aGlzLnJhaXNlKHRoaXMuc3RhcnQsIFwiVW50ZXJtaW5hdGVkIHN0cmluZyBjb25zdGFudFwiKTsgfVxuICAgICAgdmFyIGNoID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zKTtcbiAgICAgIGlmIChjaCA9PT0gcXVvdGUpIHsgYnJlYWsgfVxuICAgICAgaWYgKGNoID09PSA5MikgeyAvLyAnXFwnXG4gICAgICAgIG91dCArPSB0aGlzLmlucHV0LnNsaWNlKGNodW5rU3RhcnQsIHRoaXMucG9zKTtcbiAgICAgICAgb3V0ICs9IHRoaXMucmVhZEVzY2FwZWRDaGFyKGZhbHNlKTtcbiAgICAgICAgY2h1bmtTdGFydCA9IHRoaXMucG9zO1xuICAgICAgfSBlbHNlIGlmIChjaCA9PT0gMHgyMDI4IHx8IGNoID09PSAweDIwMjkpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA8IDEwKSB7IHRoaXMucmFpc2UodGhpcy5zdGFydCwgXCJVbnRlcm1pbmF0ZWQgc3RyaW5nIGNvbnN0YW50XCIpOyB9XG4gICAgICAgICsrdGhpcy5wb3M7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubG9jYXRpb25zKSB7XG4gICAgICAgICAgdGhpcy5jdXJMaW5lKys7XG4gICAgICAgICAgdGhpcy5saW5lU3RhcnQgPSB0aGlzLnBvcztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzTmV3TGluZShjaCkpIHsgdGhpcy5yYWlzZSh0aGlzLnN0YXJ0LCBcIlVudGVybWluYXRlZCBzdHJpbmcgY29uc3RhbnRcIik7IH1cbiAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgIH1cbiAgICB9XG4gICAgb3V0ICs9IHRoaXMuaW5wdXQuc2xpY2UoY2h1bmtTdGFydCwgdGhpcy5wb3MrKyk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5zdHJpbmcsIG91dClcbiAgfTtcblxuICAvLyBSZWFkcyB0ZW1wbGF0ZSBzdHJpbmcgdG9rZW5zLlxuXG4gIHZhciBJTlZBTElEX1RFTVBMQVRFX0VTQ0FQRV9FUlJPUiA9IHt9O1xuXG4gIHBwLnRyeVJlYWRUZW1wbGF0ZVRva2VuID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pblRlbXBsYXRlRWxlbWVudCA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMucmVhZFRtcGxUb2tlbigpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGVyciA9PT0gSU5WQUxJRF9URU1QTEFURV9FU0NBUEVfRVJST1IpIHtcbiAgICAgICAgdGhpcy5yZWFkSW52YWxpZFRlbXBsYXRlVG9rZW4oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVyclxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaW5UZW1wbGF0ZUVsZW1lbnQgPSBmYWxzZTtcbiAgfTtcblxuICBwcC5pbnZhbGlkU3RyaW5nVG9rZW4gPSBmdW5jdGlvbihwb3NpdGlvbiwgbWVzc2FnZSkge1xuICAgIGlmICh0aGlzLmluVGVtcGxhdGVFbGVtZW50ICYmIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA5KSB7XG4gICAgICB0aHJvdyBJTlZBTElEX1RFTVBMQVRFX0VTQ0FQRV9FUlJPUlxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJhaXNlKHBvc2l0aW9uLCBtZXNzYWdlKTtcbiAgICB9XG4gIH07XG5cbiAgcHAucmVhZFRtcGxUb2tlbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBcIlwiLCBjaHVua1N0YXJ0ID0gdGhpcy5wb3M7XG4gICAgZm9yICg7Oykge1xuICAgICAgaWYgKHRoaXMucG9zID49IHRoaXMuaW5wdXQubGVuZ3RoKSB7IHRoaXMucmFpc2UodGhpcy5zdGFydCwgXCJVbnRlcm1pbmF0ZWQgdGVtcGxhdGVcIik7IH1cbiAgICAgIHZhciBjaCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyk7XG4gICAgICBpZiAoY2ggPT09IDk2IHx8IGNoID09PSAzNiAmJiB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAxKSA9PT0gMTIzKSB7IC8vICdgJywgJyR7J1xuICAgICAgICBpZiAodGhpcy5wb3MgPT09IHRoaXMuc3RhcnQgJiYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS50ZW1wbGF0ZSB8fCB0aGlzLnR5cGUgPT09IHR5cGVzJDEuaW52YWxpZFRlbXBsYXRlKSkge1xuICAgICAgICAgIGlmIChjaCA9PT0gMzYpIHtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IDI7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLmRvbGxhckJyYWNlTClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGVzJDEuYmFja1F1b3RlKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvdXQgKz0gdGhpcy5pbnB1dC5zbGljZShjaHVua1N0YXJ0LCB0aGlzLnBvcyk7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGVzJDEudGVtcGxhdGUsIG91dClcbiAgICAgIH1cbiAgICAgIGlmIChjaCA9PT0gOTIpIHsgLy8gJ1xcJ1xuICAgICAgICBvdXQgKz0gdGhpcy5pbnB1dC5zbGljZShjaHVua1N0YXJ0LCB0aGlzLnBvcyk7XG4gICAgICAgIG91dCArPSB0aGlzLnJlYWRFc2NhcGVkQ2hhcih0cnVlKTtcbiAgICAgICAgY2h1bmtTdGFydCA9IHRoaXMucG9zO1xuICAgICAgfSBlbHNlIGlmIChpc05ld0xpbmUoY2gpKSB7XG4gICAgICAgIG91dCArPSB0aGlzLmlucHV0LnNsaWNlKGNodW5rU3RhcnQsIHRoaXMucG9zKTtcbiAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgICAgc3dpdGNoIChjaCkge1xuICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgIGlmICh0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MpID09PSAxMCkgeyArK3RoaXMucG9zOyB9XG4gICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgb3V0ICs9IFwiXFxuXCI7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBvdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjaCk7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmxvY2F0aW9ucykge1xuICAgICAgICAgICsrdGhpcy5jdXJMaW5lO1xuICAgICAgICAgIHRoaXMubGluZVN0YXJ0ID0gdGhpcy5wb3M7XG4gICAgICAgIH1cbiAgICAgICAgY2h1bmtTdGFydCA9IHRoaXMucG9zO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gUmVhZHMgYSB0ZW1wbGF0ZSB0b2tlbiB0byBzZWFyY2ggZm9yIHRoZSBlbmQsIHdpdGhvdXQgdmFsaWRhdGluZyBhbnkgZXNjYXBlIHNlcXVlbmNlc1xuICBwcC5yZWFkSW52YWxpZFRlbXBsYXRlVG9rZW4gPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKDsgdGhpcy5wb3MgPCB0aGlzLmlucHV0Lmxlbmd0aDsgdGhpcy5wb3MrKykge1xuICAgICAgc3dpdGNoICh0aGlzLmlucHV0W3RoaXMucG9zXSkge1xuICAgICAgY2FzZSBcIlxcXFxcIjpcbiAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBcIiRcIjpcbiAgICAgICAgaWYgKHRoaXMuaW5wdXRbdGhpcy5wb3MgKyAxXSAhPT0gXCJ7XCIpIHsgYnJlYWsgfVxuICAgICAgICAvLyBmYWxsIHRocm91Z2hcbiAgICAgIGNhc2UgXCJgXCI6XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGVzJDEuaW52YWxpZFRlbXBsYXRlLCB0aGlzLmlucHV0LnNsaWNlKHRoaXMuc3RhcnQsIHRoaXMucG9zKSlcblxuICAgICAgY2FzZSBcIlxcclwiOlxuICAgICAgICBpZiAodGhpcy5pbnB1dFt0aGlzLnBvcyArIDFdID09PSBcIlxcblwiKSB7ICsrdGhpcy5wb3M7IH1cbiAgICAgICAgLy8gZmFsbCB0aHJvdWdoXG4gICAgICBjYXNlIFwiXFxuXCI6IGNhc2UgXCJcXHUyMDI4XCI6IGNhc2UgXCJcXHUyMDI5XCI6XG4gICAgICAgICsrdGhpcy5jdXJMaW5lO1xuICAgICAgICB0aGlzLmxpbmVTdGFydCA9IHRoaXMucG9zICsgMTtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5yYWlzZSh0aGlzLnN0YXJ0LCBcIlVudGVybWluYXRlZCB0ZW1wbGF0ZVwiKTtcbiAgfTtcblxuICAvLyBVc2VkIHRvIHJlYWQgZXNjYXBlZCBjaGFyYWN0ZXJzXG5cbiAgcHAucmVhZEVzY2FwZWRDaGFyID0gZnVuY3Rpb24oaW5UZW1wbGF0ZSkge1xuICAgIHZhciBjaCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCgrK3RoaXMucG9zKTtcbiAgICArK3RoaXMucG9zO1xuICAgIHN3aXRjaCAoY2gpIHtcbiAgICBjYXNlIDExMDogcmV0dXJuIFwiXFxuXCIgLy8gJ24nIC0+ICdcXG4nXG4gICAgY2FzZSAxMTQ6IHJldHVybiBcIlxcclwiIC8vICdyJyAtPiAnXFxyJ1xuICAgIGNhc2UgMTIwOiByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSh0aGlzLnJlYWRIZXhDaGFyKDIpKSAvLyAneCdcbiAgICBjYXNlIDExNzogcmV0dXJuIGNvZGVQb2ludFRvU3RyaW5nKHRoaXMucmVhZENvZGVQb2ludCgpKSAvLyAndSdcbiAgICBjYXNlIDExNjogcmV0dXJuIFwiXFx0XCIgLy8gJ3QnIC0+ICdcXHQnXG4gICAgY2FzZSA5ODogcmV0dXJuIFwiXFxiXCIgLy8gJ2InIC0+ICdcXGInXG4gICAgY2FzZSAxMTg6IHJldHVybiBcIlxcdTAwMGJcIiAvLyAndicgLT4gJ1xcdTAwMGInXG4gICAgY2FzZSAxMDI6IHJldHVybiBcIlxcZlwiIC8vICdmJyAtPiAnXFxmJ1xuICAgIGNhc2UgMTM6IGlmICh0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MpID09PSAxMCkgeyArK3RoaXMucG9zOyB9IC8vICdcXHJcXG4nXG4gICAgY2FzZSAxMDogLy8gJyBcXG4nXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmxvY2F0aW9ucykgeyB0aGlzLmxpbmVTdGFydCA9IHRoaXMucG9zOyArK3RoaXMuY3VyTGluZTsgfVxuICAgICAgcmV0dXJuIFwiXCJcbiAgICBjYXNlIDU2OlxuICAgIGNhc2UgNTc6XG4gICAgICBpZiAodGhpcy5zdHJpY3QpIHtcbiAgICAgICAgdGhpcy5pbnZhbGlkU3RyaW5nVG9rZW4oXG4gICAgICAgICAgdGhpcy5wb3MgLSAxLFxuICAgICAgICAgIFwiSW52YWxpZCBlc2NhcGUgc2VxdWVuY2VcIlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKGluVGVtcGxhdGUpIHtcbiAgICAgICAgdmFyIGNvZGVQb3MgPSB0aGlzLnBvcyAtIDE7XG5cbiAgICAgICAgdGhpcy5pbnZhbGlkU3RyaW5nVG9rZW4oXG4gICAgICAgICAgY29kZVBvcyxcbiAgICAgICAgICBcIkludmFsaWQgZXNjYXBlIHNlcXVlbmNlIGluIHRlbXBsYXRlIHN0cmluZ1wiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgZGVmYXVsdDpcbiAgICAgIGlmIChjaCA+PSA0OCAmJiBjaCA8PSA1NSkge1xuICAgICAgICB2YXIgb2N0YWxTdHIgPSB0aGlzLmlucHV0LnN1YnN0cih0aGlzLnBvcyAtIDEsIDMpLm1hdGNoKC9eWzAtN10rLylbMF07XG4gICAgICAgIHZhciBvY3RhbCA9IHBhcnNlSW50KG9jdGFsU3RyLCA4KTtcbiAgICAgICAgaWYgKG9jdGFsID4gMjU1KSB7XG4gICAgICAgICAgb2N0YWxTdHIgPSBvY3RhbFN0ci5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgb2N0YWwgPSBwYXJzZUludChvY3RhbFN0ciwgOCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3MgKz0gb2N0YWxTdHIubGVuZ3RoIC0gMTtcbiAgICAgICAgY2ggPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MpO1xuICAgICAgICBpZiAoKG9jdGFsU3RyICE9PSBcIjBcIiB8fCBjaCA9PT0gNTYgfHwgY2ggPT09IDU3KSAmJiAodGhpcy5zdHJpY3QgfHwgaW5UZW1wbGF0ZSkpIHtcbiAgICAgICAgICB0aGlzLmludmFsaWRTdHJpbmdUb2tlbihcbiAgICAgICAgICAgIHRoaXMucG9zIC0gMSAtIG9jdGFsU3RyLmxlbmd0aCxcbiAgICAgICAgICAgIGluVGVtcGxhdGVcbiAgICAgICAgICAgICAgPyBcIk9jdGFsIGxpdGVyYWwgaW4gdGVtcGxhdGUgc3RyaW5nXCJcbiAgICAgICAgICAgICAgOiBcIk9jdGFsIGxpdGVyYWwgaW4gc3RyaWN0IG1vZGVcIlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUob2N0YWwpXG4gICAgICB9XG4gICAgICBpZiAoaXNOZXdMaW5lKGNoKSkge1xuICAgICAgICAvLyBVbmljb2RlIG5ldyBsaW5lIGNoYXJhY3RlcnMgYWZ0ZXIgXFwgZ2V0IHJlbW92ZWQgZnJvbSBvdXRwdXQgaW4gYm90aFxuICAgICAgICAvLyB0ZW1wbGF0ZSBsaXRlcmFscyBhbmQgc3RyaW5nc1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmxvY2F0aW9ucykgeyB0aGlzLmxpbmVTdGFydCA9IHRoaXMucG9zOyArK3RoaXMuY3VyTGluZTsgfVxuICAgICAgICByZXR1cm4gXCJcIlxuICAgICAgfVxuICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY2gpXG4gICAgfVxuICB9O1xuXG4gIC8vIFVzZWQgdG8gcmVhZCBjaGFyYWN0ZXIgZXNjYXBlIHNlcXVlbmNlcyAoJ1xceCcsICdcXHUnLCAnXFxVJykuXG5cbiAgcHAucmVhZEhleENoYXIgPSBmdW5jdGlvbihsZW4pIHtcbiAgICB2YXIgY29kZVBvcyA9IHRoaXMucG9zO1xuICAgIHZhciBuID0gdGhpcy5yZWFkSW50KDE2LCBsZW4pO1xuICAgIGlmIChuID09PSBudWxsKSB7IHRoaXMuaW52YWxpZFN0cmluZ1Rva2VuKGNvZGVQb3MsIFwiQmFkIGNoYXJhY3RlciBlc2NhcGUgc2VxdWVuY2VcIik7IH1cbiAgICByZXR1cm4gblxuICB9O1xuXG4gIC8vIFJlYWQgYW4gaWRlbnRpZmllciwgYW5kIHJldHVybiBpdCBhcyBhIHN0cmluZy4gU2V0cyBgdGhpcy5jb250YWluc0VzY2BcbiAgLy8gdG8gd2hldGhlciB0aGUgd29yZCBjb250YWluZWQgYSAnXFx1JyBlc2NhcGUuXG4gIC8vXG4gIC8vIEluY3JlbWVudGFsbHkgYWRkcyBvbmx5IGVzY2FwZWQgY2hhcnMsIGFkZGluZyBvdGhlciBjaHVua3MgYXMtaXNcbiAgLy8gYXMgYSBtaWNyby1vcHRpbWl6YXRpb24uXG5cbiAgcHAucmVhZFdvcmQxID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb250YWluc0VzYyA9IGZhbHNlO1xuICAgIHZhciB3b3JkID0gXCJcIiwgZmlyc3QgPSB0cnVlLCBjaHVua1N0YXJ0ID0gdGhpcy5wb3M7XG4gICAgdmFyIGFzdHJhbCA9IHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2O1xuICAgIHdoaWxlICh0aGlzLnBvcyA8IHRoaXMuaW5wdXQubGVuZ3RoKSB7XG4gICAgICB2YXIgY2ggPSB0aGlzLmZ1bGxDaGFyQ29kZUF0UG9zKCk7XG4gICAgICBpZiAoaXNJZGVudGlmaWVyQ2hhcihjaCwgYXN0cmFsKSkge1xuICAgICAgICB0aGlzLnBvcyArPSBjaCA8PSAweGZmZmYgPyAxIDogMjtcbiAgICAgIH0gZWxzZSBpZiAoY2ggPT09IDkyKSB7IC8vIFwiXFxcIlxuICAgICAgICB0aGlzLmNvbnRhaW5zRXNjID0gdHJ1ZTtcbiAgICAgICAgd29yZCArPSB0aGlzLmlucHV0LnNsaWNlKGNodW5rU3RhcnQsIHRoaXMucG9zKTtcbiAgICAgICAgdmFyIGVzY1N0YXJ0ID0gdGhpcy5wb3M7XG4gICAgICAgIGlmICh0aGlzLmlucHV0LmNoYXJDb2RlQXQoKyt0aGlzLnBvcykgIT09IDExNykgLy8gXCJ1XCJcbiAgICAgICAgICB7IHRoaXMuaW52YWxpZFN0cmluZ1Rva2VuKHRoaXMucG9zLCBcIkV4cGVjdGluZyBVbmljb2RlIGVzY2FwZSBzZXF1ZW5jZSBcXFxcdVhYWFhcIik7IH1cbiAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgICAgdmFyIGVzYyA9IHRoaXMucmVhZENvZGVQb2ludCgpO1xuICAgICAgICBpZiAoIShmaXJzdCA/IGlzSWRlbnRpZmllclN0YXJ0IDogaXNJZGVudGlmaWVyQ2hhcikoZXNjLCBhc3RyYWwpKVxuICAgICAgICAgIHsgdGhpcy5pbnZhbGlkU3RyaW5nVG9rZW4oZXNjU3RhcnQsIFwiSW52YWxpZCBVbmljb2RlIGVzY2FwZVwiKTsgfVxuICAgICAgICB3b3JkICs9IGNvZGVQb2ludFRvU3RyaW5nKGVzYyk7XG4gICAgICAgIGNodW5rU3RhcnQgPSB0aGlzLnBvcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBmaXJzdCA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gd29yZCArIHRoaXMuaW5wdXQuc2xpY2UoY2h1bmtTdGFydCwgdGhpcy5wb3MpXG4gIH07XG5cbiAgLy8gUmVhZCBhbiBpZGVudGlmaWVyIG9yIGtleXdvcmQgdG9rZW4uIFdpbGwgY2hlY2sgZm9yIHJlc2VydmVkXG4gIC8vIHdvcmRzIHdoZW4gbmVjZXNzYXJ5LlxuXG4gIHBwLnJlYWRXb3JkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHdvcmQgPSB0aGlzLnJlYWRXb3JkMSgpO1xuICAgIHZhciB0eXBlID0gdHlwZXMkMS5uYW1lO1xuICAgIGlmICh0aGlzLmtleXdvcmRzLnRlc3Qod29yZCkpIHtcbiAgICAgIHR5cGUgPSBrZXl3b3Jkc1t3b3JkXTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZSwgd29yZClcbiAgfTtcblxuICAvLyBBY29ybiBpcyBhIHRpbnksIGZhc3QgSmF2YVNjcmlwdCBwYXJzZXIgd3JpdHRlbiBpbiBKYXZhU2NyaXB0LlxuICAvL1xuICAvLyBBY29ybiB3YXMgd3JpdHRlbiBieSBNYXJpam4gSGF2ZXJiZWtlLCBJbmd2YXIgU3RlcGFueWFuLCBhbmRcbiAgLy8gdmFyaW91cyBjb250cmlidXRvcnMgYW5kIHJlbGVhc2VkIHVuZGVyIGFuIE1JVCBsaWNlbnNlLlxuICAvL1xuICAvLyBHaXQgcmVwb3NpdG9yaWVzIGZvciBBY29ybiBhcmUgYXZhaWxhYmxlIGF0XG4gIC8vXG4gIC8vICAgICBodHRwOi8vbWFyaWpuaGF2ZXJiZWtlLm5sL2dpdC9hY29yblxuICAvLyAgICAgaHR0cHM6Ly9naXRodWIuY29tL2Fjb3JuanMvYWNvcm4uZ2l0XG4gIC8vXG4gIC8vIFBsZWFzZSB1c2UgdGhlIFtnaXRodWIgYnVnIHRyYWNrZXJdW2doYnRdIHRvIHJlcG9ydCBpc3N1ZXMuXG4gIC8vXG4gIC8vIFtnaGJ0XTogaHR0cHM6Ly9naXRodWIuY29tL2Fjb3JuanMvYWNvcm4vaXNzdWVzXG4gIC8vXG4gIC8vIFt3YWxrXTogdXRpbC93YWxrLmpzXG5cblxuICB2YXIgdmVyc2lvbiA9IFwiOC4xMi4xXCI7XG5cbiAgUGFyc2VyLmFjb3JuID0ge1xuICAgIFBhcnNlcjogUGFyc2VyLFxuICAgIHZlcnNpb246IHZlcnNpb24sXG4gICAgZGVmYXVsdE9wdGlvbnM6IGRlZmF1bHRPcHRpb25zLFxuICAgIFBvc2l0aW9uOiBQb3NpdGlvbixcbiAgICBTb3VyY2VMb2NhdGlvbjogU291cmNlTG9jYXRpb24sXG4gICAgZ2V0TGluZUluZm86IGdldExpbmVJbmZvLFxuICAgIE5vZGU6IE5vZGUsXG4gICAgVG9rZW5UeXBlOiBUb2tlblR5cGUsXG4gICAgdG9rVHlwZXM6IHR5cGVzJDEsXG4gICAga2V5d29yZFR5cGVzOiBrZXl3b3JkcyxcbiAgICBUb2tDb250ZXh0OiBUb2tDb250ZXh0LFxuICAgIHRva0NvbnRleHRzOiB0eXBlcyxcbiAgICBpc0lkZW50aWZpZXJDaGFyOiBpc0lkZW50aWZpZXJDaGFyLFxuICAgIGlzSWRlbnRpZmllclN0YXJ0OiBpc0lkZW50aWZpZXJTdGFydCxcbiAgICBUb2tlbjogVG9rZW4sXG4gICAgaXNOZXdMaW5lOiBpc05ld0xpbmUsXG4gICAgbGluZUJyZWFrOiBsaW5lQnJlYWssXG4gICAgbGluZUJyZWFrRzogbGluZUJyZWFrRyxcbiAgICBub25BU0NJSXdoaXRlc3BhY2U6IG5vbkFTQ0lJd2hpdGVzcGFjZVxuICB9O1xuXG4gIC8vIFRoZSBtYWluIGV4cG9ydGVkIGludGVyZmFjZSAodW5kZXIgYHNlbGYuYWNvcm5gIHdoZW4gaW4gdGhlXG4gIC8vIGJyb3dzZXIpIGlzIGEgYHBhcnNlYCBmdW5jdGlvbiB0aGF0IHRha2VzIGEgY29kZSBzdHJpbmcgYW5kIHJldHVybnNcbiAgLy8gYW4gYWJzdHJhY3Qgc3ludGF4IHRyZWUgYXMgc3BlY2lmaWVkIGJ5IHRoZSBbRVNUcmVlIHNwZWNdW2VzdHJlZV0uXG4gIC8vXG4gIC8vIFtlc3RyZWVdOiBodHRwczovL2dpdGh1Yi5jb20vZXN0cmVlL2VzdHJlZVxuXG4gIGZ1bmN0aW9uIHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIFBhcnNlci5wYXJzZShpbnB1dCwgb3B0aW9ucylcbiAgfVxuXG4gIC8vIFRoaXMgZnVuY3Rpb24gdHJpZXMgdG8gcGFyc2UgYSBzaW5nbGUgZXhwcmVzc2lvbiBhdCBhIGdpdmVuXG4gIC8vIG9mZnNldCBpbiBhIHN0cmluZy4gVXNlZnVsIGZvciBwYXJzaW5nIG1peGVkLWxhbmd1YWdlIGZvcm1hdHNcbiAgLy8gdGhhdCBlbWJlZCBKYXZhU2NyaXB0IGV4cHJlc3Npb25zLlxuXG4gIGZ1bmN0aW9uIHBhcnNlRXhwcmVzc2lvbkF0KGlucHV0LCBwb3MsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gUGFyc2VyLnBhcnNlRXhwcmVzc2lvbkF0KGlucHV0LCBwb3MsIG9wdGlvbnMpXG4gIH1cblxuICAvLyBBY29ybiBpcyBvcmdhbml6ZWQgYXMgYSB0b2tlbml6ZXIgYW5kIGEgcmVjdXJzaXZlLWRlc2NlbnQgcGFyc2VyLlxuICAvLyBUaGUgYHRva2VuaXplcmAgZXhwb3J0IHByb3ZpZGVzIGFuIGludGVyZmFjZSB0byB0aGUgdG9rZW5pemVyLlxuXG4gIGZ1bmN0aW9uIHRva2VuaXplcihpbnB1dCwgb3B0aW9ucykge1xuICAgIHJldHVybiBQYXJzZXIudG9rZW5pemVyKGlucHV0LCBvcHRpb25zKVxuICB9XG5cbiAgZXhwb3J0cy5Ob2RlID0gTm9kZTtcbiAgZXhwb3J0cy5QYXJzZXIgPSBQYXJzZXI7XG4gIGV4cG9ydHMuUG9zaXRpb24gPSBQb3NpdGlvbjtcbiAgZXhwb3J0cy5Tb3VyY2VMb2NhdGlvbiA9IFNvdXJjZUxvY2F0aW9uO1xuICBleHBvcnRzLlRva0NvbnRleHQgPSBUb2tDb250ZXh0O1xuICBleHBvcnRzLlRva2VuID0gVG9rZW47XG4gIGV4cG9ydHMuVG9rZW5UeXBlID0gVG9rZW5UeXBlO1xuICBleHBvcnRzLmRlZmF1bHRPcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XG4gIGV4cG9ydHMuZ2V0TGluZUluZm8gPSBnZXRMaW5lSW5mbztcbiAgZXhwb3J0cy5pc0lkZW50aWZpZXJDaGFyID0gaXNJZGVudGlmaWVyQ2hhcjtcbiAgZXhwb3J0cy5pc0lkZW50aWZpZXJTdGFydCA9IGlzSWRlbnRpZmllclN0YXJ0O1xuICBleHBvcnRzLmlzTmV3TGluZSA9IGlzTmV3TGluZTtcbiAgZXhwb3J0cy5rZXl3b3JkVHlwZXMgPSBrZXl3b3JkcztcbiAgZXhwb3J0cy5saW5lQnJlYWsgPSBsaW5lQnJlYWs7XG4gIGV4cG9ydHMubGluZUJyZWFrRyA9IGxpbmVCcmVha0c7XG4gIGV4cG9ydHMubm9uQVNDSUl3aGl0ZXNwYWNlID0gbm9uQVNDSUl3aGl0ZXNwYWNlO1xuICBleHBvcnRzLnBhcnNlID0gcGFyc2U7XG4gIGV4cG9ydHMucGFyc2VFeHByZXNzaW9uQXQgPSBwYXJzZUV4cHJlc3Npb25BdDtcbiAgZXhwb3J0cy50b2tDb250ZXh0cyA9IHR5cGVzO1xuICBleHBvcnRzLnRva1R5cGVzID0gdHlwZXMkMTtcbiAgZXhwb3J0cy50b2tlbml6ZXIgPSB0b2tlbml6ZXI7XG4gIGV4cG9ydHMudmVyc2lvbiA9IHZlcnNpb247XG5cbn0pKTtcbiJdLCJuYW1lcyI6WyJnbG9iYWwiLCJmYWN0b3J5IiwiZXhwb3J0cyIsIm1vZHVsZSIsImRlZmluZSIsImFtZCIsImdsb2JhbFRoaXMiLCJzZWxmIiwiYWNvcm4iLCJhc3RyYWxJZGVudGlmaWVyQ29kZXMiLCJhc3RyYWxJZGVudGlmaWVyU3RhcnRDb2RlcyIsIm5vbkFTQ0lJaWRlbnRpZmllckNoYXJzIiwibm9uQVNDSUlpZGVudGlmaWVyU3RhcnRDaGFycyIsInJlc2VydmVkV29yZHMiLCJzdHJpY3QiLCJzdHJpY3RCaW5kIiwiZWNtYTVBbmRMZXNzS2V5d29yZHMiLCJrZXl3b3JkcyQxIiwia2V5d29yZFJlbGF0aW9uYWxPcGVyYXRvciIsIm5vbkFTQ0lJaWRlbnRpZmllclN0YXJ0IiwiUmVnRXhwIiwibm9uQVNDSUlpZGVudGlmaWVyIiwiaXNJbkFzdHJhbFNldCIsImNvZGUiLCJzZXQiLCJwb3MiLCJpIiwibGVuZ3RoIiwiaXNJZGVudGlmaWVyU3RhcnQiLCJhc3RyYWwiLCJ0ZXN0IiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiaXNJZGVudGlmaWVyQ2hhciIsIlRva2VuVHlwZSIsImxhYmVsIiwiY29uZiIsImtleXdvcmQiLCJiZWZvcmVFeHByIiwic3RhcnRzRXhwciIsImlzTG9vcCIsImlzQXNzaWduIiwicHJlZml4IiwicG9zdGZpeCIsImJpbm9wIiwidXBkYXRlQ29udGV4dCIsIm5hbWUiLCJwcmVjIiwia2V5d29yZHMiLCJrdyIsIm9wdGlvbnMiLCJ0eXBlcyQxIiwibnVtIiwicmVnZXhwIiwic3RyaW5nIiwicHJpdmF0ZUlkIiwiZW9mIiwiYnJhY2tldEwiLCJicmFja2V0UiIsImJyYWNlTCIsImJyYWNlUiIsInBhcmVuTCIsInBhcmVuUiIsImNvbW1hIiwic2VtaSIsImNvbG9uIiwiZG90IiwicXVlc3Rpb24iLCJxdWVzdGlvbkRvdCIsImFycm93IiwidGVtcGxhdGUiLCJpbnZhbGlkVGVtcGxhdGUiLCJlbGxpcHNpcyIsImJhY2tRdW90ZSIsImRvbGxhckJyYWNlTCIsImVxIiwiYXNzaWduIiwiaW5jRGVjIiwibG9naWNhbE9SIiwibG9naWNhbEFORCIsImJpdHdpc2VPUiIsImJpdHdpc2VYT1IiLCJiaXR3aXNlQU5EIiwiZXF1YWxpdHkiLCJyZWxhdGlvbmFsIiwiYml0U2hpZnQiLCJwbHVzTWluIiwibW9kdWxvIiwic3RhciIsInNsYXNoIiwic3RhcnN0YXIiLCJjb2FsZXNjZSIsIl9icmVhayIsIl9jYXNlIiwiX2NhdGNoIiwiX2NvbnRpbnVlIiwiX2RlYnVnZ2VyIiwiX2RlZmF1bHQiLCJfZG8iLCJfZWxzZSIsIl9maW5hbGx5IiwiX2ZvciIsIl9mdW5jdGlvbiIsIl9pZiIsIl9yZXR1cm4iLCJfc3dpdGNoIiwiX3Rocm93IiwiX3RyeSIsIl92YXIiLCJfY29uc3QiLCJfd2hpbGUiLCJfd2l0aCIsIl9uZXciLCJfdGhpcyIsIl9zdXBlciIsIl9jbGFzcyIsIl9leHRlbmRzIiwiX2V4cG9ydCIsIl9pbXBvcnQiLCJfbnVsbCIsIl90cnVlIiwiX2ZhbHNlIiwiX2luIiwiX2luc3RhbmNlb2YiLCJfdHlwZW9mIiwiX3ZvaWQiLCJfZGVsZXRlIiwibGluZUJyZWFrIiwibGluZUJyZWFrRyIsInNvdXJjZSIsImlzTmV3TGluZSIsIm5leHRMaW5lQnJlYWsiLCJmcm9tIiwiZW5kIiwibmV4dCIsImNoYXJDb2RlQXQiLCJub25BU0NJSXdoaXRlc3BhY2UiLCJza2lwV2hpdGVTcGFjZSIsInJlZiIsIk9iamVjdCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwidG9TdHJpbmciLCJoYXNPd24iLCJvYmoiLCJwcm9wTmFtZSIsImNhbGwiLCJpc0FycmF5IiwiQXJyYXkiLCJyZWdleHBDYWNoZSIsImNyZWF0ZSIsIndvcmRzUmVnZXhwIiwid29yZHMiLCJyZXBsYWNlIiwiY29kZVBvaW50VG9TdHJpbmciLCJsb25lU3Vycm9nYXRlIiwiUG9zaXRpb24iLCJsaW5lIiwiY29sIiwiY29sdW1uIiwib2Zmc2V0IiwibiIsIlNvdXJjZUxvY2F0aW9uIiwicCIsInN0YXJ0Iiwic291cmNlRmlsZSIsImdldExpbmVJbmZvIiwiaW5wdXQiLCJjdXIiLCJuZXh0QnJlYWsiLCJkZWZhdWx0T3B0aW9ucyIsImVjbWFWZXJzaW9uIiwic291cmNlVHlwZSIsIm9uSW5zZXJ0ZWRTZW1pY29sb24iLCJvblRyYWlsaW5nQ29tbWEiLCJhbGxvd1Jlc2VydmVkIiwiYWxsb3dSZXR1cm5PdXRzaWRlRnVuY3Rpb24iLCJhbGxvd0ltcG9ydEV4cG9ydEV2ZXJ5d2hlcmUiLCJhbGxvd0F3YWl0T3V0c2lkZUZ1bmN0aW9uIiwiYWxsb3dTdXBlck91dHNpZGVNZXRob2QiLCJhbGxvd0hhc2hCYW5nIiwiY2hlY2tQcml2YXRlRmllbGRzIiwibG9jYXRpb25zIiwib25Ub2tlbiIsIm9uQ29tbWVudCIsInJhbmdlcyIsInByb2dyYW0iLCJkaXJlY3RTb3VyY2VGaWxlIiwicHJlc2VydmVQYXJlbnMiLCJ3YXJuZWRBYm91dEVjbWFWZXJzaW9uIiwiZ2V0T3B0aW9ucyIsIm9wdHMiLCJvcHQiLCJjb25zb2xlIiwid2FybiIsInRva2VucyIsInRva2VuIiwicHVzaCIsInB1c2hDb21tZW50IiwiYXJyYXkiLCJibG9jayIsInRleHQiLCJzdGFydExvYyIsImVuZExvYyIsImNvbW1lbnQiLCJ0eXBlIiwidmFsdWUiLCJsb2MiLCJyYW5nZSIsIlNDT1BFX1RPUCIsIlNDT1BFX0ZVTkNUSU9OIiwiU0NPUEVfQVNZTkMiLCJTQ09QRV9HRU5FUkFUT1IiLCJTQ09QRV9BUlJPVyIsIlNDT1BFX1NJTVBMRV9DQVRDSCIsIlNDT1BFX1NVUEVSIiwiU0NPUEVfRElSRUNUX1NVUEVSIiwiU0NPUEVfQ0xBU1NfU1RBVElDX0JMT0NLIiwiU0NPUEVfVkFSIiwiZnVuY3Rpb25GbGFncyIsImFzeW5jIiwiZ2VuZXJhdG9yIiwiQklORF9OT05FIiwiQklORF9WQVIiLCJCSU5EX0xFWElDQUwiLCJCSU5EX0ZVTkNUSU9OIiwiQklORF9TSU1QTEVfQ0FUQ0giLCJCSU5EX09VVFNJREUiLCJQYXJzZXIiLCJzdGFydFBvcyIsInJlc2VydmVkIiwicmVzZXJ2ZWRTdHJpY3QiLCJyZXNlcnZlZFdvcmRzU3RyaWN0IiwicmVzZXJ2ZWRXb3Jkc1N0cmljdEJpbmQiLCJjb250YWluc0VzYyIsImxpbmVTdGFydCIsImxhc3RJbmRleE9mIiwiY3VyTGluZSIsInNsaWNlIiwic3BsaXQiLCJjdXJQb3NpdGlvbiIsImxhc3RUb2tFbmRMb2MiLCJsYXN0VG9rU3RhcnRMb2MiLCJsYXN0VG9rU3RhcnQiLCJsYXN0VG9rRW5kIiwiY29udGV4dCIsImluaXRpYWxDb250ZXh0IiwiZXhwckFsbG93ZWQiLCJpbk1vZHVsZSIsInN0cmljdERpcmVjdGl2ZSIsInBvdGVudGlhbEFycm93QXQiLCJwb3RlbnRpYWxBcnJvd0luRm9yQXdhaXQiLCJ5aWVsZFBvcyIsImF3YWl0UG9zIiwiYXdhaXRJZGVudFBvcyIsImxhYmVscyIsInVuZGVmaW5lZEV4cG9ydHMiLCJza2lwTGluZUNvbW1lbnQiLCJzY29wZVN0YWNrIiwiZW50ZXJTY29wZSIsInJlZ2V4cFN0YXRlIiwicHJpdmF0ZU5hbWVTdGFjayIsInByb3RvdHlwZUFjY2Vzc29ycyIsImluRnVuY3Rpb24iLCJjb25maWd1cmFibGUiLCJpbkdlbmVyYXRvciIsImluQXN5bmMiLCJjYW5Bd2FpdCIsImFsbG93U3VwZXIiLCJhbGxvd0RpcmVjdFN1cGVyIiwidHJlYXRGdW5jdGlvbnNBc1ZhciIsImFsbG93TmV3RG90VGFyZ2V0IiwiaW5DbGFzc1N0YXRpY0Jsb2NrIiwicGFyc2UiLCJub2RlIiwic3RhcnROb2RlIiwibmV4dFRva2VuIiwicGFyc2VUb3BMZXZlbCIsImdldCIsImN1cnJlbnRWYXJTY29wZSIsImZsYWdzIiwiaW5DbGFzc0ZpZWxkSW5pdCIsInNjb3BlIiwiY3VycmVudFRoaXNTY29wZSIsInRyZWF0RnVuY3Rpb25zQXNWYXJJblNjb3BlIiwiY3VycmVudFNjb3BlIiwiZXh0ZW5kIiwicGx1Z2lucyIsImxlbiIsImFyZ3VtZW50cyIsImNscyIsInBhcnNlRXhwcmVzc2lvbkF0IiwicGFyc2VyIiwicGFyc2VFeHByZXNzaW9uIiwidG9rZW5pemVyIiwiZGVmaW5lUHJvcGVydGllcyIsInBwJDkiLCJsaXRlcmFsIiwibGFzdEluZGV4IiwiZXhlYyIsIm1hdGNoIiwic3BhY2VBZnRlciIsImluZGV4IiwiY2hhckF0IiwiZWF0IiwiaXNDb250ZXh0dWFsIiwiZWF0Q29udGV4dHVhbCIsImV4cGVjdENvbnRleHR1YWwiLCJ1bmV4cGVjdGVkIiwiY2FuSW5zZXJ0U2VtaWNvbG9uIiwiaW5zZXJ0U2VtaWNvbG9uIiwic2VtaWNvbG9uIiwiYWZ0ZXJUcmFpbGluZ0NvbW1hIiwidG9rVHlwZSIsIm5vdE5leHQiLCJleHBlY3QiLCJyYWlzZSIsIkRlc3RydWN0dXJpbmdFcnJvcnMiLCJzaG9ydGhhbmRBc3NpZ24iLCJ0cmFpbGluZ0NvbW1hIiwicGFyZW50aGVzaXplZEFzc2lnbiIsInBhcmVudGhlc2l6ZWRCaW5kIiwiZG91YmxlUHJvdG8iLCJjaGVja1BhdHRlcm5FcnJvcnMiLCJyZWZEZXN0cnVjdHVyaW5nRXJyb3JzIiwicmFpc2VSZWNvdmVyYWJsZSIsInBhcmVucyIsImNoZWNrRXhwcmVzc2lvbkVycm9ycyIsImFuZFRocm93IiwiY2hlY2tZaWVsZEF3YWl0SW5EZWZhdWx0UGFyYW1zIiwiaXNTaW1wbGVBc3NpZ25UYXJnZXQiLCJleHByIiwiZXhwcmVzc2lvbiIsInBwJDgiLCJib2R5Iiwic3RtdCIsInBhcnNlU3RhdGVtZW50IiwibGlzdCIsImtleXMiLCJhZGFwdERpcmVjdGl2ZVByb2xvZ3VlIiwiZmluaXNoTm9kZSIsImxvb3BMYWJlbCIsImtpbmQiLCJzd2l0Y2hMYWJlbCIsImlzTGV0Iiwic2tpcCIsIm5leHRDaCIsImlkZW50IiwiaXNBc3luY0Z1bmN0aW9uIiwiYWZ0ZXIiLCJ0b3BMZXZlbCIsInN0YXJ0dHlwZSIsInBhcnNlQnJlYWtDb250aW51ZVN0YXRlbWVudCIsInBhcnNlRGVidWdnZXJTdGF0ZW1lbnQiLCJwYXJzZURvU3RhdGVtZW50IiwicGFyc2VGb3JTdGF0ZW1lbnQiLCJwYXJzZUZ1bmN0aW9uU3RhdGVtZW50IiwicGFyc2VDbGFzcyIsInBhcnNlSWZTdGF0ZW1lbnQiLCJwYXJzZVJldHVyblN0YXRlbWVudCIsInBhcnNlU3dpdGNoU3RhdGVtZW50IiwicGFyc2VUaHJvd1N0YXRlbWVudCIsInBhcnNlVHJ5U3RhdGVtZW50IiwicGFyc2VWYXJTdGF0ZW1lbnQiLCJwYXJzZVdoaWxlU3RhdGVtZW50IiwicGFyc2VXaXRoU3RhdGVtZW50IiwicGFyc2VCbG9jayIsInBhcnNlRW1wdHlTdGF0ZW1lbnQiLCJwYXJzZUV4cHJlc3Npb25TdGF0ZW1lbnQiLCJwYXJzZUltcG9ydCIsInBhcnNlRXhwb3J0IiwibWF5YmVOYW1lIiwicGFyc2VMYWJlbGVkU3RhdGVtZW50IiwiaXNCcmVhayIsInBhcnNlSWRlbnQiLCJsYWIiLCJwb3AiLCJwYXJzZVBhcmVuRXhwcmVzc2lvbiIsImF3YWl0QXQiLCJwYXJzZUZvciIsImluaXQkMSIsInBhcnNlVmFyIiwiZGVjbGFyYXRpb25zIiwiYXdhaXQiLCJwYXJzZUZvckluIiwic3RhcnRzV2l0aExldCIsImlzRm9yT2YiLCJpbml0UG9zIiwiaW5pdCIsInBhcnNlRXhwclN1YnNjcmlwdHMiLCJ0b0Fzc2lnbmFibGUiLCJjaGVja0xWYWxQYXR0ZXJuIiwiaXNBc3luYyIsImRlY2xhcmF0aW9uUG9zaXRpb24iLCJwYXJzZUZ1bmN0aW9uIiwiRlVOQ19TVEFURU1FTlQiLCJGVU5DX0hBTkdJTkdfU1RBVEVNRU5UIiwiY29uc2VxdWVudCIsImFsdGVybmF0ZSIsImFyZ3VtZW50IiwiZGlzY3JpbWluYW50IiwiY2FzZXMiLCJzYXdEZWZhdWx0IiwiaXNDYXNlIiwiZXhpdFNjb3BlIiwiZW1wdHkkMSIsInBhcnNlQ2F0Y2hDbGF1c2VQYXJhbSIsInBhcmFtIiwicGFyc2VCaW5kaW5nQXRvbSIsInNpbXBsZSIsImhhbmRsZXIiLCJjbGF1c2UiLCJmaW5hbGl6ZXIiLCJhbGxvd01pc3NpbmdJbml0aWFsaXplciIsIm9iamVjdCIsImkkMSIsImxhYmVsJDEiLCJzdGF0ZW1lbnRTdGFydCIsImluZGV4T2YiLCJjcmVhdGVOZXdMZXhpY2FsU2NvcGUiLCJleGl0U3RyaWN0IiwidXBkYXRlIiwiaXNGb3JJbiIsImlkIiwibGVmdCIsInJpZ2h0IiwicGFyc2VNYXliZUFzc2lnbiIsImlzRm9yIiwiZGVjbCIsInBhcnNlVmFySWQiLCJGVU5DX05VTExBQkxFX0lEIiwic3RhdGVtZW50IiwiYWxsb3dFeHByZXNzaW9uQm9keSIsImZvckluaXQiLCJpbml0RnVuY3Rpb24iLCJjaGVja0xWYWxTaW1wbGUiLCJvbGRZaWVsZFBvcyIsIm9sZEF3YWl0UG9zIiwib2xkQXdhaXRJZGVudFBvcyIsInBhcnNlRnVuY3Rpb25QYXJhbXMiLCJwYXJzZUZ1bmN0aW9uQm9keSIsInBhcmFtcyIsInBhcnNlQmluZGluZ0xpc3QiLCJpc1N0YXRlbWVudCIsIm9sZFN0cmljdCIsInBhcnNlQ2xhc3NJZCIsInBhcnNlQ2xhc3NTdXBlciIsInByaXZhdGVOYW1lTWFwIiwiZW50ZXJDbGFzc0JvZHkiLCJjbGFzc0JvZHkiLCJoYWRDb25zdHJ1Y3RvciIsImVsZW1lbnQiLCJwYXJzZUNsYXNzRWxlbWVudCIsInN1cGVyQ2xhc3MiLCJrZXkiLCJpc1ByaXZhdGVOYW1lQ29uZmxpY3RlZCIsImV4aXRDbGFzc0JvZHkiLCJjb25zdHJ1Y3RvckFsbG93c1N1cGVyIiwia2V5TmFtZSIsImlzR2VuZXJhdG9yIiwiaXNTdGF0aWMiLCJwYXJzZUNsYXNzU3RhdGljQmxvY2siLCJpc0NsYXNzRWxlbWVudE5hbWVTdGFydCIsInN0YXRpYyIsImxhc3RWYWx1ZSIsImNvbXB1dGVkIiwic3RhcnROb2RlQXQiLCJwYXJzZUNsYXNzRWxlbWVudE5hbWUiLCJpc0NvbnN0cnVjdG9yIiwiY2hlY2tLZXlOYW1lIiwiYWxsb3dzRGlyZWN0U3VwZXIiLCJwYXJzZUNsYXNzTWV0aG9kIiwicGFyc2VDbGFzc0ZpZWxkIiwicGFyc2VQcml2YXRlSWRlbnQiLCJwYXJzZVByb3BlcnR5TmFtZSIsIm1ldGhvZCIsInBhcnNlTWV0aG9kIiwiZmllbGQiLCJvbGRMYWJlbHMiLCJkZWNsYXJlZCIsInVzZWQiLCJwYXJlbnQiLCJjdXJyIiwicGFyc2VFeHBvcnRBbGxEZWNsYXJhdGlvbiIsImV4cG9ydGVkIiwicGFyc2VNb2R1bGVFeHBvcnROYW1lIiwiY2hlY2tFeHBvcnQiLCJwYXJzZUV4cHJBdG9tIiwiZGVjbGFyYXRpb24iLCJwYXJzZUV4cG9ydERlZmF1bHREZWNsYXJhdGlvbiIsInNob3VsZFBhcnNlRXhwb3J0U3RhdGVtZW50IiwicGFyc2VFeHBvcnREZWNsYXJhdGlvbiIsImNoZWNrVmFyaWFibGVFeHBvcnQiLCJzcGVjaWZpZXJzIiwicGFyc2VFeHBvcnRTcGVjaWZpZXJzIiwic3BlYyIsImNoZWNrVW5yZXNlcnZlZCIsImxvY2FsIiwiY2hlY2tMb2NhbEV4cG9ydCIsImZOb2RlIiwiY05vZGUiLCJjaGVja1BhdHRlcm5FeHBvcnQiLCJwYXQiLCJwcm9wZXJ0aWVzIiwicHJvcCIsImxpc3QkMSIsImVsZW1lbnRzIiwiZWx0IiwiZGVjbHMiLCJwYXJzZUV4cG9ydFNwZWNpZmllciIsIm5vZGVzIiwiZmlyc3QiLCJwYXJzZUltcG9ydFNwZWNpZmllcnMiLCJwYXJzZUltcG9ydFNwZWNpZmllciIsImltcG9ydGVkIiwicGFyc2VJbXBvcnREZWZhdWx0U3BlY2lmaWVyIiwicGFyc2VJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXIiLCJzdHJpbmdMaXRlcmFsIiwicGFyc2VMaXRlcmFsIiwic3RhdGVtZW50cyIsImlzRGlyZWN0aXZlQ2FuZGlkYXRlIiwiZGlyZWN0aXZlIiwicmF3IiwicHAkNyIsImlzQmluZGluZyIsInRvQXNzaWduYWJsZUxpc3QiLCJvcGVyYXRvciIsImV4cHJMaXN0IiwibGFzdCIsInBhcnNlU3ByZWFkIiwicGFyc2VSZXN0QmluZGluZyIsInBhcnNlT2JqIiwiY2xvc2UiLCJhbGxvd0VtcHR5IiwiYWxsb3dUcmFpbGluZ0NvbW1hIiwiYWxsb3dNb2RpZmllcnMiLCJlbHRzIiwicmVzdCIsInBhcnNlQmluZGluZ0xpc3RJdGVtIiwicGFyc2VBc3NpZ25hYmxlTGlzdEl0ZW0iLCJlbGVtIiwicGFyc2VNYXliZURlZmF1bHQiLCJiaW5kaW5nVHlwZSIsImNoZWNrQ2xhc2hlcyIsImlzQmluZCIsImRlY2xhcmVOYW1lIiwiY2hlY2tMVmFsSW5uZXJQYXR0ZXJuIiwiVG9rQ29udGV4dCIsImlzRXhwciIsInByZXNlcnZlU3BhY2UiLCJvdmVycmlkZSIsInR5cGVzIiwiYl9zdGF0IiwiYl9leHByIiwiYl90bXBsIiwicF9zdGF0IiwicF9leHByIiwicV90bXBsIiwidHJ5UmVhZFRlbXBsYXRlVG9rZW4iLCJmX3N0YXQiLCJmX2V4cHIiLCJmX2V4cHJfZ2VuIiwiZl9nZW4iLCJwcCQ2IiwiY3VyQ29udGV4dCIsImJyYWNlSXNCbG9jayIsInByZXZUeXBlIiwiaW5HZW5lcmF0b3JDb250ZXh0Iiwib3ZlcnJpZGVDb250ZXh0IiwidG9rZW5DdHgiLCJvdXQiLCJzdGF0ZW1lbnRQYXJlbnMiLCJhbGxvd2VkIiwicHAkNSIsImNoZWNrUHJvcENsYXNoIiwicHJvcEhhc2giLCJzaG9ydGhhbmQiLCJwcm90byIsIm90aGVyIiwicmVkZWZpbml0aW9uIiwiZXhwcmVzc2lvbnMiLCJhZnRlckxlZnRQYXJzZSIsInBhcnNlWWllbGQiLCJvd25EZXN0cnVjdHVyaW5nRXJyb3JzIiwib2xkUGFyZW5Bc3NpZ24iLCJvbGRUcmFpbGluZ0NvbW1hIiwib2xkRG91YmxlUHJvdG8iLCJwYXJzZU1heWJlQ29uZGl0aW9uYWwiLCJwYXJzZUV4cHJPcHMiLCJwYXJzZU1heWJlVW5hcnkiLCJwYXJzZUV4cHJPcCIsImxlZnRTdGFydFBvcyIsImxlZnRTdGFydExvYyIsIm1pblByZWMiLCJsb2dpY2FsIiwib3AiLCJidWlsZEJpbmFyeSIsInNhd1VuYXJ5IiwicGFyc2VBd2FpdCIsImlzTG9jYWxWYXJpYWJsZUFjY2VzcyIsImlzUHJpdmF0ZUZpZWxkQWNjZXNzIiwibm9kZSQxIiwicHJvcGVydHkiLCJyZXN1bHQiLCJwYXJzZVN1YnNjcmlwdHMiLCJiYXNlIiwibm9DYWxscyIsIm1heWJlQXN5bmNBcnJvdyIsIm9wdGlvbmFsQ2hhaW5lZCIsInBhcnNlU3Vic2NyaXB0Iiwib3B0aW9uYWwiLCJjaGFpbk5vZGUiLCJzaG91bGRQYXJzZUFzeW5jQXJyb3ciLCJwYXJzZVN1YnNjcmlwdEFzeW5jQXJyb3ciLCJwYXJzZUFycm93RXhwcmVzc2lvbiIsIm9wdGlvbmFsU3VwcG9ydGVkIiwicGFyc2VFeHByTGlzdCIsImNhbGxlZSIsIm5vZGUkMiIsInRhZyIsInF1YXNpIiwicGFyc2VUZW1wbGF0ZSIsImlzVGFnZ2VkIiwiZm9yTmV3IiwicmVhZFJlZ2V4cCIsImNhbkJlQXJyb3ciLCJyZWdleCIsInBhdHRlcm4iLCJwYXJzZVBhcmVuQW5kRGlzdGluZ3Vpc2hFeHByZXNzaW9uIiwicGFyc2VOZXciLCJwYXJzZUV4cHJJbXBvcnQiLCJwYXJzZUV4cHJBdG9tRGVmYXVsdCIsInBhcnNlRHluYW1pY0ltcG9ydCIsIm1ldGEiLCJwYXJzZUltcG9ydE1ldGEiLCJlcnJvclBvcyIsImJpZ2ludCIsInZhbCIsInNob3VsZFBhcnNlQXJyb3ciLCJpbm5lclN0YXJ0UG9zIiwiaW5uZXJTdGFydExvYyIsImxhc3RJc0NvbW1hIiwic3ByZWFkU3RhcnQiLCJwYXJzZVBhcmVuSXRlbSIsImlubmVyRW5kUG9zIiwiaW5uZXJFbmRMb2MiLCJwYXJzZVBhcmVuQXJyb3dMaXN0IiwiZmluaXNoTm9kZUF0IiwicGFyIiwiaXRlbSIsImVtcHR5IiwicGFyc2VUZW1wbGF0ZUVsZW1lbnQiLCJjb29rZWQiLCJ0YWlsIiwiY3VyRWx0IiwicXVhc2lzIiwiaXNBc3luY1Byb3AiLCJpc1BhdHRlcm4iLCJwYXJzZVByb3BlcnR5IiwicGFyc2VQcm9wZXJ0eVZhbHVlIiwicGFyc2VHZXR0ZXJTZXR0ZXIiLCJwYXJhbUNvdW50IiwiY29weU5vZGUiLCJpc0Fycm93RnVuY3Rpb24iLCJpc01ldGhvZCIsImlzRXhwcmVzc2lvbiIsInVzZVN0cmljdCIsImNoZWNrUGFyYW1zIiwibm9uU2ltcGxlIiwiaXNTaW1wbGVQYXJhbUxpc3QiLCJ1bmRlZmluZWQiLCJhbGxvd0R1cGxpY2F0ZXMiLCJuYW1lSGFzaCIsInJlIiwibGliZXJhbCIsInBhcnNlSWRlbnROb2RlIiwiZGVsZWdhdGUiLCJwcCQ0IiwibWVzc2FnZSIsImVyciIsIlN5bnRheEVycm9yIiwicmFpc2VkQXQiLCJwcCQzIiwiU2NvcGUiLCJ2YXIiLCJsZXhpY2FsIiwiZnVuY3Rpb25zIiwicmVkZWNsYXJlZCIsInNjb3BlJDEiLCJzY29wZSQyIiwic2NvcGUkMyIsIk5vZGUiLCJwcCQyIiwibmV3Tm9kZSIsImVjbWE5QmluYXJ5UHJvcGVydGllcyIsImVjbWExMEJpbmFyeVByb3BlcnRpZXMiLCJlY21hMTFCaW5hcnlQcm9wZXJ0aWVzIiwiZWNtYTEyQmluYXJ5UHJvcGVydGllcyIsImVjbWExM0JpbmFyeVByb3BlcnRpZXMiLCJlY21hMTRCaW5hcnlQcm9wZXJ0aWVzIiwidW5pY29kZUJpbmFyeVByb3BlcnRpZXMiLCJlY21hMTRCaW5hcnlQcm9wZXJ0aWVzT2ZTdHJpbmdzIiwidW5pY29kZUJpbmFyeVByb3BlcnRpZXNPZlN0cmluZ3MiLCJ1bmljb2RlR2VuZXJhbENhdGVnb3J5VmFsdWVzIiwiZWNtYTlTY3JpcHRWYWx1ZXMiLCJlY21hMTBTY3JpcHRWYWx1ZXMiLCJlY21hMTFTY3JpcHRWYWx1ZXMiLCJlY21hMTJTY3JpcHRWYWx1ZXMiLCJlY21hMTNTY3JpcHRWYWx1ZXMiLCJlY21hMTRTY3JpcHRWYWx1ZXMiLCJ1bmljb2RlU2NyaXB0VmFsdWVzIiwiZGF0YSIsImJ1aWxkVW5pY29kZURhdGEiLCJkIiwiYmluYXJ5IiwiYmluYXJ5T2ZTdHJpbmdzIiwibm9uQmluYXJ5IiwiR2VuZXJhbF9DYXRlZ29yeSIsIlNjcmlwdCIsIlNjcmlwdF9FeHRlbnNpb25zIiwiZ2MiLCJzYyIsInNjeCIsInBwJDEiLCJCcmFuY2hJRCIsInNlcGFyYXRlZEZyb20iLCJhbHQiLCJzaWJsaW5nIiwiUmVnRXhwVmFsaWRhdGlvblN0YXRlIiwidmFsaWRGbGFncyIsInVuaWNvZGVQcm9wZXJ0aWVzIiwic3dpdGNoVSIsInN3aXRjaFYiLCJzd2l0Y2hOIiwibGFzdEludFZhbHVlIiwibGFzdFN0cmluZ1ZhbHVlIiwibGFzdEFzc2VydGlvbklzUXVhbnRpZmlhYmxlIiwibnVtQ2FwdHVyaW5nUGFyZW5zIiwibWF4QmFja1JlZmVyZW5jZSIsImdyb3VwTmFtZXMiLCJiYWNrUmVmZXJlbmNlTmFtZXMiLCJicmFuY2hJRCIsInJlc2V0IiwidW5pY29kZVNldHMiLCJ1bmljb2RlIiwiYXQiLCJmb3JjZVUiLCJzIiwibCIsImMiLCJuZXh0SW5kZXgiLCJjdXJyZW50IiwibG9va2FoZWFkIiwiYWR2YW5jZSIsImNoIiwiZWF0Q2hhcnMiLCJjaHMiLCJ2YWxpZGF0ZVJlZ0V4cEZsYWdzIiwic3RhdGUiLCJ1IiwidiIsImZsYWciLCJoYXNQcm9wIiwiXyIsInZhbGlkYXRlUmVnRXhwUGF0dGVybiIsInJlZ2V4cF9wYXR0ZXJuIiwicmVnZXhwX2Rpc2p1bmN0aW9uIiwidHJhY2tEaXNqdW5jdGlvbiIsInJlZ2V4cF9hbHRlcm5hdGl2ZSIsInJlZ2V4cF9lYXRRdWFudGlmaWVyIiwicmVnZXhwX2VhdFRlcm0iLCJyZWdleHBfZWF0QXNzZXJ0aW9uIiwicmVnZXhwX2VhdEF0b20iLCJyZWdleHBfZWF0RXh0ZW5kZWRBdG9tIiwibG9va2JlaGluZCIsIm5vRXJyb3IiLCJyZWdleHBfZWF0UXVhbnRpZmllclByZWZpeCIsInJlZ2V4cF9lYXRCcmFjZWRRdWFudGlmaWVyIiwibWluIiwibWF4IiwicmVnZXhwX2VhdERlY2ltYWxEaWdpdHMiLCJyZWdleHBfZWF0UGF0dGVybkNoYXJhY3RlcnMiLCJyZWdleHBfZWF0UmV2ZXJzZVNvbGlkdXNBdG9tRXNjYXBlIiwicmVnZXhwX2VhdENoYXJhY3RlckNsYXNzIiwicmVnZXhwX2VhdFVuY2FwdHVyaW5nR3JvdXAiLCJyZWdleHBfZWF0Q2FwdHVyaW5nR3JvdXAiLCJyZWdleHBfZWF0QXRvbUVzY2FwZSIsInJlZ2V4cF9ncm91cFNwZWNpZmllciIsInJlZ2V4cF9lYXRJbnZhbGlkQnJhY2VkUXVhbnRpZmllciIsInJlZ2V4cF9lYXRFeHRlbmRlZFBhdHRlcm5DaGFyYWN0ZXIiLCJyZWdleHBfZWF0U3ludGF4Q2hhcmFjdGVyIiwiaXNTeW50YXhDaGFyYWN0ZXIiLCJyZWdleHBfZWF0R3JvdXBOYW1lIiwia25vd24iLCJhbHRJRCIsInJlZ2V4cF9lYXRSZWdFeHBJZGVudGlmaWVyTmFtZSIsInJlZ2V4cF9lYXRSZWdFeHBJZGVudGlmaWVyU3RhcnQiLCJyZWdleHBfZWF0UmVnRXhwSWRlbnRpZmllclBhcnQiLCJyZWdleHBfZWF0UmVnRXhwVW5pY29kZUVzY2FwZVNlcXVlbmNlIiwiaXNSZWdFeHBJZGVudGlmaWVyU3RhcnQiLCJpc1JlZ0V4cElkZW50aWZpZXJQYXJ0IiwicmVnZXhwX2VhdEJhY2tSZWZlcmVuY2UiLCJyZWdleHBfZWF0Q2hhcmFjdGVyQ2xhc3NFc2NhcGUiLCJyZWdleHBfZWF0Q2hhcmFjdGVyRXNjYXBlIiwicmVnZXhwX2VhdEtHcm91cE5hbWUiLCJyZWdleHBfZWF0RGVjaW1hbEVzY2FwZSIsInJlZ2V4cF9lYXRDb250cm9sRXNjYXBlIiwicmVnZXhwX2VhdENDb250cm9sTGV0dGVyIiwicmVnZXhwX2VhdFplcm8iLCJyZWdleHBfZWF0SGV4RXNjYXBlU2VxdWVuY2UiLCJyZWdleHBfZWF0TGVnYWN5T2N0YWxFc2NhcGVTZXF1ZW5jZSIsInJlZ2V4cF9lYXRJZGVudGl0eUVzY2FwZSIsInJlZ2V4cF9lYXRDb250cm9sTGV0dGVyIiwiaXNEZWNpbWFsRGlnaXQiLCJpc0NvbnRyb2xMZXR0ZXIiLCJyZWdleHBfZWF0Rml4ZWRIZXhEaWdpdHMiLCJsZWFkIiwibGVhZFN1cnJvZ2F0ZUVuZCIsInRyYWlsIiwicmVnZXhwX2VhdEhleERpZ2l0cyIsImlzVmFsaWRVbmljb2RlIiwiQ2hhclNldE5vbmUiLCJDaGFyU2V0T2siLCJDaGFyU2V0U3RyaW5nIiwiaXNDaGFyYWN0ZXJDbGFzc0VzY2FwZSIsIm5lZ2F0ZSIsInJlZ2V4cF9lYXRVbmljb2RlUHJvcGVydHlWYWx1ZUV4cHJlc3Npb24iLCJyZWdleHBfZWF0VW5pY29kZVByb3BlcnR5TmFtZSIsInJlZ2V4cF9lYXRVbmljb2RlUHJvcGVydHlWYWx1ZSIsInJlZ2V4cF92YWxpZGF0ZVVuaWNvZGVQcm9wZXJ0eU5hbWVBbmRWYWx1ZSIsInJlZ2V4cF9lYXRMb25lVW5pY29kZVByb3BlcnR5TmFtZU9yVmFsdWUiLCJuYW1lT3JWYWx1ZSIsInJlZ2V4cF92YWxpZGF0ZVVuaWNvZGVQcm9wZXJ0eU5hbWVPclZhbHVlIiwiaXNVbmljb2RlUHJvcGVydHlOYW1lQ2hhcmFjdGVyIiwiaXNVbmljb2RlUHJvcGVydHlWYWx1ZUNoYXJhY3RlciIsInJlZ2V4cF9jbGFzc0NvbnRlbnRzIiwicmVnZXhwX2NsYXNzU2V0RXhwcmVzc2lvbiIsInJlZ2V4cF9ub25FbXB0eUNsYXNzUmFuZ2VzIiwicmVnZXhwX2VhdENsYXNzQXRvbSIsInJlZ2V4cF9lYXRDbGFzc0VzY2FwZSIsImNoJDEiLCJpc09jdGFsRGlnaXQiLCJyZWdleHBfZWF0Q2xhc3NDb250cm9sTGV0dGVyIiwic3ViUmVzdWx0IiwicmVnZXhwX2VhdENsYXNzU2V0UmFuZ2UiLCJyZWdleHBfZWF0Q2xhc3NTZXRPcGVyYW5kIiwicmVnZXhwX2VhdENsYXNzU2V0Q2hhcmFjdGVyIiwicmVnZXhwX2VhdENsYXNzU3RyaW5nRGlzanVuY3Rpb24iLCJyZWdleHBfZWF0TmVzdGVkQ2xhc3MiLCJyZXN1bHQkMSIsInJlZ2V4cF9jbGFzc1N0cmluZ0Rpc2p1bmN0aW9uQ29udGVudHMiLCJyZWdleHBfY2xhc3NTdHJpbmciLCJjb3VudCIsInJlZ2V4cF9lYXRDbGFzc1NldFJlc2VydmVkUHVuY3R1YXRvciIsImlzQ2xhc3NTZXRSZXNlcnZlZERvdWJsZVB1bmN0dWF0b3JDaGFyYWN0ZXIiLCJpc0NsYXNzU2V0U3ludGF4Q2hhcmFjdGVyIiwiaXNDbGFzc1NldFJlc2VydmVkUHVuY3R1YXRvciIsImlzSGV4RGlnaXQiLCJoZXhUb0ludCIsInJlZ2V4cF9lYXRPY3RhbERpZ2l0IiwibjEiLCJuMiIsIlRva2VuIiwicHAiLCJpZ25vcmVFc2NhcGVTZXF1ZW5jZUluS2V5d29yZCIsImdldFRva2VuIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJ0aGlzJDEkMSIsImRvbmUiLCJza2lwU3BhY2UiLCJmaW5pc2hUb2tlbiIsInJlYWRUb2tlbiIsImZ1bGxDaGFyQ29kZUF0UG9zIiwicmVhZFdvcmQiLCJnZXRUb2tlbkZyb21Db2RlIiwic2tpcEJsb2NrQ29tbWVudCIsInN0YXJ0U2tpcCIsImxvb3AiLCJyZWFkVG9rZW5fZG90IiwicmVhZE51bWJlciIsIm5leHQyIiwicmVhZFRva2VuX3NsYXNoIiwiZmluaXNoT3AiLCJyZWFkVG9rZW5fbXVsdF9tb2R1bG9fZXhwIiwic2l6ZSIsInRva2VudHlwZSIsInJlYWRUb2tlbl9waXBlX2FtcCIsInJlYWRUb2tlbl9jYXJldCIsInJlYWRUb2tlbl9wbHVzX21pbiIsInJlYWRUb2tlbl9sdF9ndCIsInJlYWRUb2tlbl9lcV9leGNsIiwicmVhZFRva2VuX3F1ZXN0aW9uIiwibmV4dDIkMSIsInJlYWRUb2tlbl9udW1iZXJTaWduIiwicmVhZFdvcmQxIiwicmVhZFJhZGl4TnVtYmVyIiwicmVhZFN0cmluZyIsInN0ciIsImVzY2FwZWQiLCJpbkNsYXNzIiwiZmxhZ3NTdGFydCIsImUiLCJyZWFkSW50IiwicmFkaXgiLCJtYXliZUxlZ2FjeU9jdGFsTnVtZXJpY0xpdGVyYWwiLCJhbGxvd1NlcGFyYXRvcnMiLCJpc0xlZ2FjeU9jdGFsTnVtZXJpY0xpdGVyYWwiLCJ0b3RhbCIsImxhc3RDb2RlIiwiSW5maW5pdHkiLCJzdHJpbmdUb051bWJlciIsInBhcnNlSW50IiwicGFyc2VGbG9hdCIsInN0cmluZ1RvQmlnSW50IiwiQmlnSW50Iiwic3RhcnRzV2l0aERvdCIsIm9jdGFsIiwidmFsJDEiLCJyZWFkQ29kZVBvaW50IiwiY29kZVBvcyIsInJlYWRIZXhDaGFyIiwiaW52YWxpZFN0cmluZ1Rva2VuIiwicXVvdGUiLCJjaHVua1N0YXJ0IiwicmVhZEVzY2FwZWRDaGFyIiwiSU5WQUxJRF9URU1QTEFURV9FU0NBUEVfRVJST1IiLCJpblRlbXBsYXRlRWxlbWVudCIsInJlYWRUbXBsVG9rZW4iLCJyZWFkSW52YWxpZFRlbXBsYXRlVG9rZW4iLCJwb3NpdGlvbiIsImluVGVtcGxhdGUiLCJvY3RhbFN0ciIsInN1YnN0ciIsIndvcmQiLCJlc2NTdGFydCIsImVzYyIsInZlcnNpb24iLCJ0b2tUeXBlcyIsImtleXdvcmRUeXBlcyIsInRva0NvbnRleHRzIl0sIm1hcHBpbmdzIjoiQUFBQyxDQUFBLFNBQVVBLE1BQU0sRUFBRUMsT0FBTztJQUN4QixPQUFPQyxZQUFZLFlBQVksT0FBT0MsV0FBVyxjQUFjRixRQUFRQyxXQUN2RSxPQUFPRSxXQUFXLGNBQWNBLE9BQU9DLEdBQUcsR0FBR0QsT0FBTztRQUFDO0tBQVUsRUFBRUgsV0FDaEVELENBQUFBLFNBQVMsT0FBT00sZUFBZSxjQUFjQSxhQUFhTixVQUFVTyxNQUFNTixRQUFRRCxPQUFPUSxLQUFLLEdBQUcsQ0FBQyxFQUFDO0FBQ3RHLENBQUEsRUFBRyxJQUFJLEVBQUcsU0FBVU4sUUFBTztJQUFJO0lBRTdCLG1EQUFtRDtJQUNuRCxJQUFJTyx3QkFBd0I7UUFBQztRQUFLO1FBQUc7UUFBSztRQUFHO1FBQUs7UUFBRztRQUFLO1FBQUc7UUFBTTtRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBRztRQUFLO1FBQUc7UUFBSztRQUFHO1FBQUc7UUFBRztRQUFLO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBSTtRQUFJO1FBQUc7UUFBSztRQUFHO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFJO1FBQUk7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBSTtRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFJO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBSTtRQUFJO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFLO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUs7UUFBSTtRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBSTtRQUFJO1FBQUc7UUFBSztRQUFHO1FBQUc7UUFBRztRQUFJO1FBQUc7UUFBSTtRQUFJO1FBQUk7UUFBRztRQUFJO1FBQUk7UUFBRztRQUFHO1FBQUk7UUFBSTtRQUFHO1FBQUc7UUFBSztRQUFJO1FBQUs7UUFBRztRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFLO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFJO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBSTtRQUFJO1FBQUk7UUFBSTtRQUFLO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFJO1FBQUk7UUFBRztRQUFJO1FBQUs7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFLO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBRztRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFNO1FBQUc7UUFBRztRQUFJO1FBQU87UUFBRztRQUFJO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFJO1FBQUc7UUFBTTtRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFPO1FBQUc7UUFBTTtRQUFJO1FBQUc7UUFBSTtRQUFLO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUs7UUFBRztRQUFNO1FBQUk7UUFBSztRQUFJO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUk7UUFBTTtRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFLO1FBQUc7UUFBSztRQUFHO1FBQUk7UUFBRztRQUFLO1FBQUc7UUFBSTtRQUFJO1FBQUs7UUFBSTtRQUFLO1FBQUc7UUFBSztRQUFHO1FBQUc7UUFBRztRQUFNO1FBQUc7UUFBUTtLQUFJO0lBRTVoQyxtREFBbUQ7SUFDbkQsSUFBSUMsNkJBQTZCO1FBQUM7UUFBRztRQUFJO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBSTtRQUFLO1FBQUk7UUFBSTtRQUFLO1FBQUk7UUFBRztRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBRztRQUFJO1FBQUk7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFJO1FBQUs7UUFBSTtRQUFJO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFJO1FBQUk7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBSTtRQUFLO1FBQUk7UUFBSTtRQUFJO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBRztRQUFHO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUc7UUFBRztRQUFJO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBSTtRQUFJO1FBQUc7UUFBSTtRQUFJO1FBQUc7UUFBRztRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBSTtRQUFLO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBSztRQUFJO1FBQUc7UUFBRztRQUFJO1FBQUk7UUFBSTtRQUFHO1FBQUc7UUFBSTtRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBSTtRQUFHO1FBQUc7UUFBRztRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBSTtRQUFJO1FBQUk7UUFBRztRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBSTtRQUFHO1FBQUk7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBRztRQUFJO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFJO1FBQUc7UUFBSTtRQUFHO1FBQUs7UUFBSTtRQUFJO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBSTtRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUs7UUFBSTtRQUFJO1FBQUc7UUFBSTtRQUFJO1FBQUk7UUFBRztRQUFJO1FBQUk7UUFBSTtRQUFHO1FBQUk7UUFBSTtRQUFJO1FBQUc7UUFBSztRQUFJO1FBQUs7UUFBSTtRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFJO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBSTtRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFJO1FBQUk7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFJO1FBQUk7UUFBSTtRQUFHO1FBQUk7UUFBSTtRQUFLO1FBQUc7UUFBRztRQUFJO1FBQUk7UUFBRztRQUFJO1FBQUk7UUFBSztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFJO1FBQUk7UUFBRztRQUFLO1FBQUk7UUFBSTtRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBSztRQUFHO1FBQUk7UUFBSztRQUFLO1FBQUs7UUFBSTtRQUFLO1FBQU07UUFBSTtRQUFJO1FBQU07UUFBSTtRQUFHO1FBQU07UUFBSztRQUFNO1FBQUs7UUFBRztRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBSTtRQUFJO1FBQUk7UUFBRztRQUFJO1FBQUk7UUFBRztRQUFJO1FBQUs7UUFBSTtRQUFLO1FBQUk7UUFBRztRQUFHO1FBQUk7UUFBSTtRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBTTtRQUFHO1FBQU07UUFBSTtRQUFHO1FBQU07UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBSztRQUFJO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBRztRQUFJO1FBQUc7UUFBRztRQUFLO1FBQU07UUFBSztRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFNO1FBQUk7UUFBRztRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFJO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUs7UUFBRztRQUFJO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFJO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFJO1FBQUc7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFJO1FBQUc7UUFBRztRQUFNO1FBQUk7UUFBRztRQUFHO1FBQUs7UUFBSTtRQUFLO1FBQUk7UUFBSTtRQUFHO1FBQUk7UUFBRztRQUFLO1FBQUk7UUFBSTtRQUFJO1FBQUs7UUFBSTtRQUFLO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFLO1FBQUk7UUFBSTtRQUFHO1FBQUc7UUFBTTtRQUFHO1FBQUc7UUFBSTtRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBRztRQUFHO1FBQUc7UUFBRztRQUFHO1FBQUk7UUFBTTtRQUFPO1FBQUk7UUFBTTtRQUFHO1FBQUs7UUFBRztRQUFNO1FB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