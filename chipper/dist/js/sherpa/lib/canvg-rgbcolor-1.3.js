/**
 * A class to parse color values
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * @link   http://www.phpied.com/rgb-color-parser-in-javascript/
 * @license Use it if you like it
 */ function RGBColor(color_string) {
    this.ok = false;
    // strip any leading #
    if (color_string.charAt(0) == '#') {
        color_string = color_string.substr(1, 6);
    }
    color_string = color_string.replace(/ /g, '');
    color_string = color_string.toLowerCase();
    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred: 'cd5c5c',
        indigo: '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    for(var key in simple_colors){
        if (color_string == key) {
            color_string = simple_colors[key];
        }
    }
    // emd of simple type-in colors
    // array of color definition objects
    var color_defs = [
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: [
                'rgb(123, 234, 45)',
                'rgb(255,234,245)'
            ],
            process: function(bits) {
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            re: /^(\w{2})(\w{2})(\w{2})$/,
            example: [
                '#00ff00',
                '336699'
            ],
            process: function(bits) {
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^(\w{1})(\w{1})(\w{1})$/,
            example: [
                '#fb0',
                'f0f'
            ],
            process: function(bits) {
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];
    // search through the definitions to find a match
    for(var i = 0; i < color_defs.length; i++){
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            this.ok = true;
        }
    }
    // validate/cleanup values
    this.r = this.r < 0 || isNaN(this.r) ? 0 : this.r > 255 ? 255 : this.r;
    this.g = this.g < 0 || isNaN(this.g) ? 0 : this.g > 255 ? 255 : this.g;
    this.b = this.b < 0 || isNaN(this.b) ? 0 : this.b > 255 ? 255 : this.b;
    // some getters
    this.toRGB = function() {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    };
    this.toHex = function() {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    };
    // help
    this.getHelpXML = function() {
        var examples = new Array();
        // add regexps
        for(var i = 0; i < color_defs.length; i++){
            var example = color_defs[i].example;
            for(var j = 0; j < example.length; j++){
                examples[examples.length] = example[j];
            }
        }
        // add type-in colors
        for(var sc in simple_colors){
            examples[examples.length] = sc;
        }
        var xml = document.createElement('ul');
        xml.setAttribute('id', 'rgbcolor-examples');
        for(var i = 0; i < examples.length; i++){
            try {
                var list_item = document.createElement('li');
                var list_color = new RGBColor(examples[i]);
                var example_div = document.createElement('div');
                example_div.style.cssText = 'margin: 3px; ' + 'border: 1px solid black; ' + 'background:' + list_color.toHex() + '; ' + 'color:' + list_color.toHex();
                example_div.appendChild(document.createTextNode('test'));
                var list_item_value = document.createTextNode(' ' + examples[i] + ' -> ' + list_color.toRGB() + ' -> ' + list_color.toHex());
                list_item.appendChild(example_div);
                list_item.appendChild(list_item_value);
                xml.appendChild(list_item);
            } catch (e) {}
        }
        return xml;
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvY2FudmctcmdiY29sb3ItMS4zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQSBjbGFzcyB0byBwYXJzZSBjb2xvciB2YWx1ZXNcbiAqIEBhdXRob3IgU3RveWFuIFN0ZWZhbm92IDxzc3Rvb0BnbWFpbC5jb20+XG4gKiBAbGluayAgIGh0dHA6Ly93d3cucGhwaWVkLmNvbS9yZ2ItY29sb3ItcGFyc2VyLWluLWphdmFzY3JpcHQvXG4gKiBAbGljZW5zZSBVc2UgaXQgaWYgeW91IGxpa2UgaXRcbiAqL1xuZnVuY3Rpb24gUkdCQ29sb3IoY29sb3Jfc3RyaW5nKVxue1xuICB0aGlzLm9rID0gZmFsc2U7XG5cbiAgLy8gc3RyaXAgYW55IGxlYWRpbmcgI1xuICBpZiAoY29sb3Jfc3RyaW5nLmNoYXJBdCgwKSA9PSAnIycpIHsgLy8gcmVtb3ZlICMgaWYgYW55XG4gICAgY29sb3Jfc3RyaW5nID0gY29sb3Jfc3RyaW5nLnN1YnN0cigxLDYpO1xuICB9XG5cbiAgY29sb3Jfc3RyaW5nID0gY29sb3Jfc3RyaW5nLnJlcGxhY2UoLyAvZywnJyk7XG4gIGNvbG9yX3N0cmluZyA9IGNvbG9yX3N0cmluZy50b0xvd2VyQ2FzZSgpO1xuXG4gIC8vIGJlZm9yZSBnZXR0aW5nIGludG8gcmVnZXhwcywgdHJ5IHNpbXBsZSBtYXRjaGVzXG4gIC8vIGFuZCBvdmVyd3JpdGUgdGhlIGlucHV0XG4gIHZhciBzaW1wbGVfY29sb3JzID0ge1xuICAgIGFsaWNlYmx1ZTogJ2YwZjhmZicsXG4gICAgYW50aXF1ZXdoaXRlOiAnZmFlYmQ3JyxcbiAgICBhcXVhOiAnMDBmZmZmJyxcbiAgICBhcXVhbWFyaW5lOiAnN2ZmZmQ0JyxcbiAgICBhenVyZTogJ2YwZmZmZicsXG4gICAgYmVpZ2U6ICdmNWY1ZGMnLFxuICAgIGJpc3F1ZTogJ2ZmZTRjNCcsXG4gICAgYmxhY2s6ICcwMDAwMDAnLFxuICAgIGJsYW5jaGVkYWxtb25kOiAnZmZlYmNkJyxcbiAgICBibHVlOiAnMDAwMGZmJyxcbiAgICBibHVldmlvbGV0OiAnOGEyYmUyJyxcbiAgICBicm93bjogJ2E1MmEyYScsXG4gICAgYnVybHl3b29kOiAnZGViODg3JyxcbiAgICBjYWRldGJsdWU6ICc1ZjllYTAnLFxuICAgIGNoYXJ0cmV1c2U6ICc3ZmZmMDAnLFxuICAgIGNob2NvbGF0ZTogJ2QyNjkxZScsXG4gICAgY29yYWw6ICdmZjdmNTAnLFxuICAgIGNvcm5mbG93ZXJibHVlOiAnNjQ5NWVkJyxcbiAgICBjb3Juc2lsazogJ2ZmZjhkYycsXG4gICAgY3JpbXNvbjogJ2RjMTQzYycsXG4gICAgY3lhbjogJzAwZmZmZicsXG4gICAgZGFya2JsdWU6ICcwMDAwOGInLFxuICAgIGRhcmtjeWFuOiAnMDA4YjhiJyxcbiAgICBkYXJrZ29sZGVucm9kOiAnYjg4NjBiJyxcbiAgICBkYXJrZ3JheTogJ2E5YTlhOScsXG4gICAgZGFya2dyZWVuOiAnMDA2NDAwJyxcbiAgICBkYXJra2hha2k6ICdiZGI3NmInLFxuICAgIGRhcmttYWdlbnRhOiAnOGIwMDhiJyxcbiAgICBkYXJrb2xpdmVncmVlbjogJzU1NmIyZicsXG4gICAgZGFya29yYW5nZTogJ2ZmOGMwMCcsXG4gICAgZGFya29yY2hpZDogJzk5MzJjYycsXG4gICAgZGFya3JlZDogJzhiMDAwMCcsXG4gICAgZGFya3NhbG1vbjogJ2U5OTY3YScsXG4gICAgZGFya3NlYWdyZWVuOiAnOGZiYzhmJyxcbiAgICBkYXJrc2xhdGVibHVlOiAnNDgzZDhiJyxcbiAgICBkYXJrc2xhdGVncmF5OiAnMmY0ZjRmJyxcbiAgICBkYXJrdHVycXVvaXNlOiAnMDBjZWQxJyxcbiAgICBkYXJrdmlvbGV0OiAnOTQwMGQzJyxcbiAgICBkZWVwcGluazogJ2ZmMTQ5MycsXG4gICAgZGVlcHNreWJsdWU6ICcwMGJmZmYnLFxuICAgIGRpbWdyYXk6ICc2OTY5NjknLFxuICAgIGRvZGdlcmJsdWU6ICcxZTkwZmYnLFxuICAgIGZlbGRzcGFyOiAnZDE5Mjc1JyxcbiAgICBmaXJlYnJpY2s6ICdiMjIyMjInLFxuICAgIGZsb3JhbHdoaXRlOiAnZmZmYWYwJyxcbiAgICBmb3Jlc3RncmVlbjogJzIyOGIyMicsXG4gICAgZnVjaHNpYTogJ2ZmMDBmZicsXG4gICAgZ2FpbnNib3JvOiAnZGNkY2RjJyxcbiAgICBnaG9zdHdoaXRlOiAnZjhmOGZmJyxcbiAgICBnb2xkOiAnZmZkNzAwJyxcbiAgICBnb2xkZW5yb2Q6ICdkYWE1MjAnLFxuICAgIGdyYXk6ICc4MDgwODAnLFxuICAgIGdyZWVuOiAnMDA4MDAwJyxcbiAgICBncmVlbnllbGxvdzogJ2FkZmYyZicsXG4gICAgaG9uZXlkZXc6ICdmMGZmZjAnLFxuICAgIGhvdHBpbms6ICdmZjY5YjQnLFxuICAgIGluZGlhbnJlZCA6ICdjZDVjNWMnLFxuICAgIGluZGlnbyA6ICc0YjAwODInLFxuICAgIGl2b3J5OiAnZmZmZmYwJyxcbiAgICBraGFraTogJ2YwZTY4YycsXG4gICAgbGF2ZW5kZXI6ICdlNmU2ZmEnLFxuICAgIGxhdmVuZGVyYmx1c2g6ICdmZmYwZjUnLFxuICAgIGxhd25ncmVlbjogJzdjZmMwMCcsXG4gICAgbGVtb25jaGlmZm9uOiAnZmZmYWNkJyxcbiAgICBsaWdodGJsdWU6ICdhZGQ4ZTYnLFxuICAgIGxpZ2h0Y29yYWw6ICdmMDgwODAnLFxuICAgIGxpZ2h0Y3lhbjogJ2UwZmZmZicsXG4gICAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6ICdmYWZhZDInLFxuICAgIGxpZ2h0Z3JleTogJ2QzZDNkMycsXG4gICAgbGlnaHRncmVlbjogJzkwZWU5MCcsXG4gICAgbGlnaHRwaW5rOiAnZmZiNmMxJyxcbiAgICBsaWdodHNhbG1vbjogJ2ZmYTA3YScsXG4gICAgbGlnaHRzZWFncmVlbjogJzIwYjJhYScsXG4gICAgbGlnaHRza3libHVlOiAnODdjZWZhJyxcbiAgICBsaWdodHNsYXRlYmx1ZTogJzg0NzBmZicsXG4gICAgbGlnaHRzbGF0ZWdyYXk6ICc3Nzg4OTknLFxuICAgIGxpZ2h0c3RlZWxibHVlOiAnYjBjNGRlJyxcbiAgICBsaWdodHllbGxvdzogJ2ZmZmZlMCcsXG4gICAgbGltZTogJzAwZmYwMCcsXG4gICAgbGltZWdyZWVuOiAnMzJjZDMyJyxcbiAgICBsaW5lbjogJ2ZhZjBlNicsXG4gICAgbWFnZW50YTogJ2ZmMDBmZicsXG4gICAgbWFyb29uOiAnODAwMDAwJyxcbiAgICBtZWRpdW1hcXVhbWFyaW5lOiAnNjZjZGFhJyxcbiAgICBtZWRpdW1ibHVlOiAnMDAwMGNkJyxcbiAgICBtZWRpdW1vcmNoaWQ6ICdiYTU1ZDMnLFxuICAgIG1lZGl1bXB1cnBsZTogJzkzNzBkOCcsXG4gICAgbWVkaXVtc2VhZ3JlZW46ICczY2IzNzEnLFxuICAgIG1lZGl1bXNsYXRlYmx1ZTogJzdiNjhlZScsXG4gICAgbWVkaXVtc3ByaW5nZ3JlZW46ICcwMGZhOWEnLFxuICAgIG1lZGl1bXR1cnF1b2lzZTogJzQ4ZDFjYycsXG4gICAgbWVkaXVtdmlvbGV0cmVkOiAnYzcxNTg1JyxcbiAgICBtaWRuaWdodGJsdWU6ICcxOTE5NzAnLFxuICAgIG1pbnRjcmVhbTogJ2Y1ZmZmYScsXG4gICAgbWlzdHlyb3NlOiAnZmZlNGUxJyxcbiAgICBtb2NjYXNpbjogJ2ZmZTRiNScsXG4gICAgbmF2YWpvd2hpdGU6ICdmZmRlYWQnLFxuICAgIG5hdnk6ICcwMDAwODAnLFxuICAgIG9sZGxhY2U6ICdmZGY1ZTYnLFxuICAgIG9saXZlOiAnODA4MDAwJyxcbiAgICBvbGl2ZWRyYWI6ICc2YjhlMjMnLFxuICAgIG9yYW5nZTogJ2ZmYTUwMCcsXG4gICAgb3JhbmdlcmVkOiAnZmY0NTAwJyxcbiAgICBvcmNoaWQ6ICdkYTcwZDYnLFxuICAgIHBhbGVnb2xkZW5yb2Q6ICdlZWU4YWEnLFxuICAgIHBhbGVncmVlbjogJzk4ZmI5OCcsXG4gICAgcGFsZXR1cnF1b2lzZTogJ2FmZWVlZScsXG4gICAgcGFsZXZpb2xldHJlZDogJ2Q4NzA5MycsXG4gICAgcGFwYXlhd2hpcDogJ2ZmZWZkNScsXG4gICAgcGVhY2hwdWZmOiAnZmZkYWI5JyxcbiAgICBwZXJ1OiAnY2Q4NTNmJyxcbiAgICBwaW5rOiAnZmZjMGNiJyxcbiAgICBwbHVtOiAnZGRhMGRkJyxcbiAgICBwb3dkZXJibHVlOiAnYjBlMGU2JyxcbiAgICBwdXJwbGU6ICc4MDAwODAnLFxuICAgIHJlZDogJ2ZmMDAwMCcsXG4gICAgcm9zeWJyb3duOiAnYmM4ZjhmJyxcbiAgICByb3lhbGJsdWU6ICc0MTY5ZTEnLFxuICAgIHNhZGRsZWJyb3duOiAnOGI0NTEzJyxcbiAgICBzYWxtb246ICdmYTgwNzInLFxuICAgIHNhbmR5YnJvd246ICdmNGE0NjAnLFxuICAgIHNlYWdyZWVuOiAnMmU4YjU3JyxcbiAgICBzZWFzaGVsbDogJ2ZmZjVlZScsXG4gICAgc2llbm5hOiAnYTA1MjJkJyxcbiAgICBzaWx2ZXI6ICdjMGMwYzAnLFxuICAgIHNreWJsdWU6ICc4N2NlZWInLFxuICAgIHNsYXRlYmx1ZTogJzZhNWFjZCcsXG4gICAgc2xhdGVncmF5OiAnNzA4MDkwJyxcbiAgICBzbm93OiAnZmZmYWZhJyxcbiAgICBzcHJpbmdncmVlbjogJzAwZmY3ZicsXG4gICAgc3RlZWxibHVlOiAnNDY4MmI0JyxcbiAgICB0YW46ICdkMmI0OGMnLFxuICAgIHRlYWw6ICcwMDgwODAnLFxuICAgIHRoaXN0bGU6ICdkOGJmZDgnLFxuICAgIHRvbWF0bzogJ2ZmNjM0NycsXG4gICAgdHVycXVvaXNlOiAnNDBlMGQwJyxcbiAgICB2aW9sZXQ6ICdlZTgyZWUnLFxuICAgIHZpb2xldHJlZDogJ2QwMjA5MCcsXG4gICAgd2hlYXQ6ICdmNWRlYjMnLFxuICAgIHdoaXRlOiAnZmZmZmZmJyxcbiAgICB3aGl0ZXNtb2tlOiAnZjVmNWY1JyxcbiAgICB5ZWxsb3c6ICdmZmZmMDAnLFxuICAgIHllbGxvd2dyZWVuOiAnOWFjZDMyJ1xuICB9O1xuICBmb3IgKHZhciBrZXkgaW4gc2ltcGxlX2NvbG9ycykge1xuICAgIGlmIChjb2xvcl9zdHJpbmcgPT0ga2V5KSB7XG4gICAgICBjb2xvcl9zdHJpbmcgPSBzaW1wbGVfY29sb3JzW2tleV07XG4gICAgfVxuICB9XG4gIC8vIGVtZCBvZiBzaW1wbGUgdHlwZS1pbiBjb2xvcnNcblxuICAvLyBhcnJheSBvZiBjb2xvciBkZWZpbml0aW9uIG9iamVjdHNcbiAgdmFyIGNvbG9yX2RlZnMgPSBbXG4gICAge1xuICAgICAgcmU6IC9ecmdiXFwoKFxcZHsxLDN9KSxcXHMqKFxcZHsxLDN9KSxcXHMqKFxcZHsxLDN9KVxcKSQvLFxuICAgICAgZXhhbXBsZTogWydyZ2IoMTIzLCAyMzQsIDQ1KScsICdyZ2IoMjU1LDIzNCwyNDUpJ10sXG4gICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoYml0cyl7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgcGFyc2VJbnQoYml0c1sxXSksXG4gICAgICAgICAgcGFyc2VJbnQoYml0c1syXSksXG4gICAgICAgICAgcGFyc2VJbnQoYml0c1szXSlcbiAgICAgICAgXTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIHJlOiAvXihcXHd7Mn0pKFxcd3syfSkoXFx3ezJ9KSQvLFxuICAgICAgZXhhbXBsZTogWycjMDBmZjAwJywgJzMzNjY5OSddLFxuICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGJpdHMpe1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgIHBhcnNlSW50KGJpdHNbMV0sIDE2KSxcbiAgICAgICAgICBwYXJzZUludChiaXRzWzJdLCAxNiksXG4gICAgICAgICAgcGFyc2VJbnQoYml0c1szXSwgMTYpXG4gICAgICAgIF07XG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICByZTogL14oXFx3ezF9KShcXHd7MX0pKFxcd3sxfSkkLyxcbiAgICAgIGV4YW1wbGU6IFsnI2ZiMCcsICdmMGYnXSxcbiAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChiaXRzKXtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICBwYXJzZUludChiaXRzWzFdICsgYml0c1sxXSwgMTYpLFxuICAgICAgICAgIHBhcnNlSW50KGJpdHNbMl0gKyBiaXRzWzJdLCAxNiksXG4gICAgICAgICAgcGFyc2VJbnQoYml0c1szXSArIGJpdHNbM10sIDE2KVxuICAgICAgICBdO1xuICAgICAgfVxuICAgIH1cbiAgXTtcblxuICAvLyBzZWFyY2ggdGhyb3VnaCB0aGUgZGVmaW5pdGlvbnMgdG8gZmluZCBhIG1hdGNoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY29sb3JfZGVmcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciByZSA9IGNvbG9yX2RlZnNbaV0ucmU7XG4gICAgdmFyIHByb2Nlc3NvciA9IGNvbG9yX2RlZnNbaV0ucHJvY2VzcztcbiAgICB2YXIgYml0cyA9IHJlLmV4ZWMoY29sb3Jfc3RyaW5nKTtcbiAgICBpZiAoYml0cykge1xuICAgICAgY2hhbm5lbHMgPSBwcm9jZXNzb3IoYml0cyk7XG4gICAgICB0aGlzLnIgPSBjaGFubmVsc1swXTtcbiAgICAgIHRoaXMuZyA9IGNoYW5uZWxzWzFdO1xuICAgICAgdGhpcy5iID0gY2hhbm5lbHNbMl07XG4gICAgICB0aGlzLm9rID0gdHJ1ZTtcbiAgICB9XG5cbiAgfVxuXG4gIC8vIHZhbGlkYXRlL2NsZWFudXAgdmFsdWVzXG4gIHRoaXMuciA9ICh0aGlzLnIgPCAwIHx8IGlzTmFOKHRoaXMucikpID8gMCA6ICgodGhpcy5yID4gMjU1KSA/IDI1NSA6IHRoaXMucik7XG4gIHRoaXMuZyA9ICh0aGlzLmcgPCAwIHx8IGlzTmFOKHRoaXMuZykpID8gMCA6ICgodGhpcy5nID4gMjU1KSA/IDI1NSA6IHRoaXMuZyk7XG4gIHRoaXMuYiA9ICh0aGlzLmIgPCAwIHx8IGlzTmFOKHRoaXMuYikpID8gMCA6ICgodGhpcy5iID4gMjU1KSA/IDI1NSA6IHRoaXMuYik7XG5cbiAgLy8gc29tZSBnZXR0ZXJzXG4gIHRoaXMudG9SR0IgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdyZ2IoJyArIHRoaXMuciArICcsICcgKyB0aGlzLmcgKyAnLCAnICsgdGhpcy5iICsgJyknO1xuICB9XG4gIHRoaXMudG9IZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHIgPSB0aGlzLnIudG9TdHJpbmcoMTYpO1xuICAgIHZhciBnID0gdGhpcy5nLnRvU3RyaW5nKDE2KTtcbiAgICB2YXIgYiA9IHRoaXMuYi50b1N0cmluZygxNik7XG4gICAgaWYgKHIubGVuZ3RoID09IDEpIHIgPSAnMCcgKyByO1xuICAgIGlmIChnLmxlbmd0aCA9PSAxKSBnID0gJzAnICsgZztcbiAgICBpZiAoYi5sZW5ndGggPT0gMSkgYiA9ICcwJyArIGI7XG4gICAgcmV0dXJuICcjJyArIHIgKyBnICsgYjtcbiAgfVxuXG4gIC8vIGhlbHBcbiAgdGhpcy5nZXRIZWxwWE1MID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGV4YW1wbGVzID0gbmV3IEFycmF5KCk7XG4gICAgLy8gYWRkIHJlZ2V4cHNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbG9yX2RlZnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBleGFtcGxlID0gY29sb3JfZGVmc1tpXS5leGFtcGxlO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBleGFtcGxlLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGV4YW1wbGVzW2V4YW1wbGVzLmxlbmd0aF0gPSBleGFtcGxlW2pdO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBhZGQgdHlwZS1pbiBjb2xvcnNcbiAgICBmb3IgKHZhciBzYyBpbiBzaW1wbGVfY29sb3JzKSB7XG4gICAgICBleGFtcGxlc1tleGFtcGxlcy5sZW5ndGhdID0gc2M7XG4gICAgfVxuXG4gICAgdmFyIHhtbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgeG1sLnNldEF0dHJpYnV0ZSgnaWQnLCAncmdiY29sb3ItZXhhbXBsZXMnKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV4YW1wbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgbGlzdF9pdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgdmFyIGxpc3RfY29sb3IgPSBuZXcgUkdCQ29sb3IoZXhhbXBsZXNbaV0pO1xuICAgICAgICB2YXIgZXhhbXBsZV9kaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZXhhbXBsZV9kaXYuc3R5bGUuY3NzVGV4dCA9XG4gICAgICAgICdtYXJnaW46IDNweDsgJ1xuICAgICAgICAgICsgJ2JvcmRlcjogMXB4IHNvbGlkIGJsYWNrOyAnXG4gICAgICAgICAgKyAnYmFja2dyb3VuZDonICsgbGlzdF9jb2xvci50b0hleCgpICsgJzsgJ1xuICAgICAgICAgICsgJ2NvbG9yOicgKyBsaXN0X2NvbG9yLnRvSGV4KClcbiAgICAgICAgO1xuICAgICAgICBleGFtcGxlX2Rpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgndGVzdCcpKTtcbiAgICAgICAgdmFyIGxpc3RfaXRlbV92YWx1ZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxuICAgICAgICAgICAgJyAnICsgZXhhbXBsZXNbaV0gKyAnIC0+ICcgKyBsaXN0X2NvbG9yLnRvUkdCKCkgKyAnIC0+ICcgKyBsaXN0X2NvbG9yLnRvSGV4KClcbiAgICAgICAgKTtcbiAgICAgICAgbGlzdF9pdGVtLmFwcGVuZENoaWxkKGV4YW1wbGVfZGl2KTtcbiAgICAgICAgbGlzdF9pdGVtLmFwcGVuZENoaWxkKGxpc3RfaXRlbV92YWx1ZSk7XG4gICAgICAgIHhtbC5hcHBlbmRDaGlsZChsaXN0X2l0ZW0pO1xuXG4gICAgICB9IGNhdGNoKGUpe31cbiAgICB9XG4gICAgcmV0dXJuIHhtbDtcblxuICB9XG5cbn0iXSwibmFtZXMiOlsiUkdCQ29sb3IiLCJjb2xvcl9zdHJpbmciLCJvayIsImNoYXJBdCIsInN1YnN0ciIsInJlcGxhY2UiLCJ0b0xvd2VyQ2FzZSIsInNpbXBsZV9jb2xvcnMiLCJhbGljZWJsdWUiLCJhbnRpcXVld2hpdGUiLCJhcXVhIiwiYXF1YW1hcmluZSIsImF6dXJlIiwiYmVpZ2UiLCJiaXNxdWUiLCJibGFjayIsImJsYW5jaGVkYWxtb25kIiwiYmx1ZSIsImJsdWV2aW9sZXQiLCJicm93biIsImJ1cmx5d29vZCIsImNhZGV0Ymx1ZSIsImNoYXJ0cmV1c2UiLCJjaG9jb2xhdGUiLCJjb3JhbCIsImNvcm5mbG93ZXJibHVlIiwiY29ybnNpbGsiLCJjcmltc29uIiwiY3lhbiIsImRhcmtibHVlIiwiZGFya2N5YW4iLCJkYXJrZ29sZGVucm9kIiwiZGFya2dyYXkiLCJkYXJrZ3JlZW4iLCJkYXJra2hha2kiLCJkYXJrbWFnZW50YSIsImRhcmtvbGl2ZWdyZWVuIiwiZGFya29yYW5nZSIsImRhcmtvcmNoaWQiLCJkYXJrcmVkIiwiZGFya3NhbG1vbiIsImRhcmtzZWFncmVlbiIsImRhcmtzbGF0ZWJsdWUiLCJkYXJrc2xhdGVncmF5IiwiZGFya3R1cnF1b2lzZSIsImRhcmt2aW9sZXQiLCJkZWVwcGluayIsImRlZXBza3libHVlIiwiZGltZ3JheSIsImRvZGdlcmJsdWUiLCJmZWxkc3BhciIsImZpcmVicmljayIsImZsb3JhbHdoaXRlIiwiZm9yZXN0Z3JlZW4iLCJmdWNoc2lhIiwiZ2FpbnNib3JvIiwiZ2hvc3R3aGl0ZSIsImdvbGQiLCJnb2xkZW5yb2QiLCJncmF5IiwiZ3JlZW4iLCJncmVlbnllbGxvdyIsImhvbmV5ZGV3IiwiaG90cGluayIsImluZGlhbnJlZCIsImluZGlnbyIsIml2b3J5Iiwia2hha2kiLCJsYXZlbmRlciIsImxhdmVuZGVyYmx1c2giLCJsYXduZ3JlZW4iLCJsZW1vbmNoaWZmb24iLCJsaWdodGJsdWUiLCJsaWdodGNvcmFsIiwibGlnaHRjeWFuIiwibGlnaHRnb2xkZW5yb2R5ZWxsb3ciLCJsaWdodGdyZXkiLCJsaWdodGdyZWVuIiwibGlnaHRwaW5rIiwibGlnaHRzYWxtb24iLCJsaWdodHNlYWdyZWVuIiwibGlnaHRza3libHVlIiwibGlnaHRzbGF0ZWJsdWUiLCJsaWdodHNsYXRlZ3JheSIsImxpZ2h0c3RlZWxibHVlIiwibGlnaHR5ZWxsb3ciLCJsaW1lIiwibGltZWdyZWVuIiwibGluZW4iLCJtYWdlbnRhIiwibWFyb29uIiwibWVkaXVtYXF1YW1hcmluZSIsIm1lZGl1bWJsdWUiLCJtZWRpdW1vcmNoaWQiLCJtZWRpdW1wdXJwbGUiLCJtZWRpdW1zZWFncmVlbiIsIm1lZGl1bXNsYXRlYmx1ZSIsIm1lZGl1bXNwcmluZ2dyZWVuIiwibWVkaXVtdHVycXVvaXNlIiwibWVkaXVtdmlvbGV0cmVkIiwibWlkbmlnaHRibHVlIiwibWludGNyZWFtIiwibWlzdHlyb3NlIiwibW9jY2FzaW4iLCJuYXZham93aGl0ZSIsIm5hdnkiLCJvbGRsYWNlIiwib2xpdmUiLCJvbGl2ZWRyYWIiLCJvcmFuZ2UiLCJvcmFuZ2VyZWQiLCJvcmNoaWQiLCJwYWxlZ29sZGVucm9kIiwicGFsZWdyZWVuIiwicGFsZXR1cnF1b2lzZSIsInBhbGV2aW9sZXRyZWQiLCJwYXBheWF3aGlwIiwicGVhY2hwdWZmIiwicGVydSIsInBpbmsiLCJwbHVtIiwicG93ZGVyYmx1ZSIsInB1cnBsZSIsInJlZCIsInJvc3licm93biIsInJveWFsYmx1ZSIsInNhZGRsZWJyb3duIiwic2FsbW9uIiwic2FuZHlicm93biIsInNlYWdyZWVuIiwic2Vhc2hlbGwiLCJzaWVubmEiLCJzaWx2ZXIiLCJza3libHVlIiwic2xhdGVibHVlIiwic2xhdGVncmF5Iiwic25vdyIsInNwcmluZ2dyZWVuIiwic3RlZWxibHVlIiwidGFuIiwidGVhbCIsInRoaXN0bGUiLCJ0b21hdG8iLCJ0dXJxdW9pc2UiLCJ2aW9sZXQiLCJ2aW9sZXRyZWQiLCJ3aGVhdCIsIndoaXRlIiwid2hpdGVzbW9rZSIsInllbGxvdyIsInllbGxvd2dyZWVuIiwia2V5IiwiY29sb3JfZGVmcyIsInJlIiwiZXhhbXBsZSIsInByb2Nlc3MiLCJiaXRzIiwicGFyc2VJbnQiLCJpIiwibGVuZ3RoIiwicHJvY2Vzc29yIiwiZXhlYyIsImNoYW5uZWxzIiwiciIsImciLCJiIiwiaXNOYU4iLCJ0b1JHQiIsInRvSGV4IiwidG9TdHJpbmciLCJnZXRIZWxwWE1MIiwiZXhhbXBsZXMiLCJBcnJheSIsImoiLCJzYyIsInhtbCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsImxpc3RfaXRlbSIsImxpc3RfY29sb3IiLCJleGFtcGxlX2RpdiIsInN0eWxlIiwiY3NzVGV4dCIsImFwcGVuZENoaWxkIiwiY3JlYXRlVGV4dE5vZGUiLCJsaXN0X2l0ZW1fdmFsdWUiLCJlIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Q0FLQyxHQUNELFNBQVNBLFNBQVNDLFlBQVk7SUFFNUIsSUFBSSxDQUFDQyxFQUFFLEdBQUc7SUFFVixzQkFBc0I7SUFDdEIsSUFBSUQsYUFBYUUsTUFBTSxDQUFDLE1BQU0sS0FBSztRQUNqQ0YsZUFBZUEsYUFBYUcsTUFBTSxDQUFDLEdBQUU7SUFDdkM7SUFFQUgsZUFBZUEsYUFBYUksT0FBTyxDQUFDLE1BQUs7SUFDekNKLGVBQWVBLGFBQWFLLFdBQVc7SUFFdkMsa0RBQWtEO0lBQ2xELDBCQUEwQjtJQUMxQixJQUFJQyxnQkFBZ0I7UUFDbEJDLFdBQVc7UUFDWEMsY0FBYztRQUNkQyxNQUFNO1FBQ05DLFlBQVk7UUFDWkMsT0FBTztRQUNQQyxPQUFPO1FBQ1BDLFFBQVE7UUFDUkMsT0FBTztRQUNQQyxnQkFBZ0I7UUFDaEJDLE1BQU07UUFDTkMsWUFBWTtRQUNaQyxPQUFPO1FBQ1BDLFdBQVc7UUFDWEMsV0FBVztRQUNYQyxZQUFZO1FBQ1pDLFdBQVc7UUFDWEMsT0FBTztRQUNQQyxnQkFBZ0I7UUFDaEJDLFVBQVU7UUFDVkMsU0FBUztRQUNUQyxNQUFNO1FBQ05DLFVBQVU7UUFDVkMsVUFBVTtRQUNWQyxlQUFlO1FBQ2ZDLFVBQVU7UUFDVkMsV0FBVztRQUNYQyxXQUFXO1FBQ1hDLGFBQWE7UUFDYkMsZ0JBQWdCO1FBQ2hCQyxZQUFZO1FBQ1pDLFlBQVk7UUFDWkMsU0FBUztRQUNUQyxZQUFZO1FBQ1pDLGNBQWM7UUFDZEMsZUFBZTtRQUNmQyxlQUFlO1FBQ2ZDLGVBQWU7UUFDZkMsWUFBWTtRQUNaQyxVQUFVO1FBQ1ZD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