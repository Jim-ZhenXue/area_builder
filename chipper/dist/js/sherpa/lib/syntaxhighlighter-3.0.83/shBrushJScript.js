(function() {
    // CommonJS
    typeof require != 'undefined' ? SyntaxHighlighter = require('shCore').SyntaxHighlighter : null;
    function Brush() {
        var keywords = 'break case catch continue ' + 'default delete do else false  ' + 'for function if in instanceof ' + 'new null return super switch ' + 'this throw true try typeof var while with';
        var r = SyntaxHighlighter.regexLib;
        this.regexList = [
            {
                regex: r.multiLineDoubleQuotedString,
                css: 'string'
            },
            {
                regex: r.multiLineSingleQuotedString,
                css: 'string'
            },
            {
                regex: r.singleLineCComments,
                css: 'comments'
            },
            {
                regex: r.multiLineCComments,
                css: 'comments'
            },
            {
                regex: /\s*#.*/gm,
                css: 'preprocessor'
            },
            {
                regex: new RegExp(this.getKeywords(keywords), 'gm'),
                css: 'keyword'
            } // keywords
        ];
        this.forHtmlScript(r.scriptScriptTags);
    }
    ;
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = [
        'js',
        'jscript',
        'javascript'
    ];
    SyntaxHighlighter.brushes.JScript = Brush;
    // CommonJS
    typeof exports != 'undefined' ? exports.Brush = Brush : null;
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvc3ludGF4aGlnaGxpZ2h0ZXItMy4wLjgzL3NoQnJ1c2hKU2NyaXB0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU3ludGF4SGlnaGxpZ2h0ZXJcbiAqIGh0dHA6Ly9hbGV4Z29yYmF0Y2hldi5jb20vU3ludGF4SGlnaGxpZ2h0ZXJcbiAqXG4gKiBTeW50YXhIaWdobGlnaHRlciBpcyBkb25hdGlvbndhcmUuIElmIHlvdSBhcmUgdXNpbmcgaXQsIHBsZWFzZSBkb25hdGUuXG4gKiBodHRwOi8vYWxleGdvcmJhdGNoZXYuY29tL1N5bnRheEhpZ2hsaWdodGVyL2RvbmF0ZS5odG1sXG4gKlxuICogQHZlcnNpb25cbiAqIDMuMC44MyAoSnVseSAwMiAyMDEwKVxuICogXG4gKiBAY29weXJpZ2h0XG4gKiBDb3B5cmlnaHQgKEMpIDIwMDQtMjAxMCBBbGV4IEdvcmJhdGNoZXYuXG4gKlxuICogQGxpY2Vuc2VcbiAqIER1YWwgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBhbmQgR1BMIGxpY2Vuc2VzLlxuICovXG47KGZ1bmN0aW9uKClcbntcblx0Ly8gQ29tbW9uSlNcblx0dHlwZW9mKHJlcXVpcmUpICE9ICd1bmRlZmluZWQnID8gU3ludGF4SGlnaGxpZ2h0ZXIgPSByZXF1aXJlKCdzaENvcmUnKS5TeW50YXhIaWdobGlnaHRlciA6IG51bGw7XG5cblx0ZnVuY3Rpb24gQnJ1c2goKVxuXHR7XG5cdFx0dmFyIGtleXdvcmRzID1cdCdicmVhayBjYXNlIGNhdGNoIGNvbnRpbnVlICcgK1xuXHRcdFx0XHRcdFx0J2RlZmF1bHQgZGVsZXRlIGRvIGVsc2UgZmFsc2UgICcgK1xuXHRcdFx0XHRcdFx0J2ZvciBmdW5jdGlvbiBpZiBpbiBpbnN0YW5jZW9mICcgK1xuXHRcdFx0XHRcdFx0J25ldyBudWxsIHJldHVybiBzdXBlciBzd2l0Y2ggJyArXG5cdFx0XHRcdFx0XHQndGhpcyB0aHJvdyB0cnVlIHRyeSB0eXBlb2YgdmFyIHdoaWxlIHdpdGgnXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHR2YXIgciA9IFN5bnRheEhpZ2hsaWdodGVyLnJlZ2V4TGliO1xuXHRcdFxuXHRcdHRoaXMucmVnZXhMaXN0ID0gW1xuXHRcdFx0eyByZWdleDogci5tdWx0aUxpbmVEb3VibGVRdW90ZWRTdHJpbmcsXHRcdFx0XHRcdGNzczogJ3N0cmluZycgfSxcdFx0XHQvLyBkb3VibGUgcXVvdGVkIHN0cmluZ3Ncblx0XHRcdHsgcmVnZXg6IHIubXVsdGlMaW5lU2luZ2xlUXVvdGVkU3RyaW5nLFx0XHRcdFx0XHRjc3M6ICdzdHJpbmcnIH0sXHRcdFx0Ly8gc2luZ2xlIHF1b3RlZCBzdHJpbmdzXG5cdFx0XHR7IHJlZ2V4OiByLnNpbmdsZUxpbmVDQ29tbWVudHMsXHRcdFx0XHRcdFx0XHRjc3M6ICdjb21tZW50cycgfSxcdFx0XHQvLyBvbmUgbGluZSBjb21tZW50c1xuXHRcdFx0eyByZWdleDogci5tdWx0aUxpbmVDQ29tbWVudHMsXHRcdFx0XHRcdFx0XHRjc3M6ICdjb21tZW50cycgfSxcdFx0XHQvLyBtdWx0aWxpbmUgY29tbWVudHNcblx0XHRcdHsgcmVnZXg6IC9cXHMqIy4qL2dtLFx0XHRcdFx0XHRcdFx0XHRcdGNzczogJ3ByZXByb2Nlc3NvcicgfSxcdFx0Ly8gcHJlcHJvY2Vzc29yIHRhZ3MgbGlrZSAjcmVnaW9uIGFuZCAjZW5kcmVnaW9uXG5cdFx0XHR7IHJlZ2V4OiBuZXcgUmVnRXhwKHRoaXMuZ2V0S2V5d29yZHMoa2V5d29yZHMpLCAnZ20nKSxcdGNzczogJ2tleXdvcmQnIH1cdFx0XHQvLyBrZXl3b3Jkc1xuXHRcdFx0XTtcblx0XG5cdFx0dGhpcy5mb3JIdG1sU2NyaXB0KHIuc2NyaXB0U2NyaXB0VGFncyk7XG5cdH07XG5cblx0QnJ1c2gucHJvdG90eXBlXHQ9IG5ldyBTeW50YXhIaWdobGlnaHRlci5IaWdobGlnaHRlcigpO1xuXHRCcnVzaC5hbGlhc2VzXHQ9IFsnanMnLCAnanNjcmlwdCcsICdqYXZhc2NyaXB0J107XG5cblx0U3ludGF4SGlnaGxpZ2h0ZXIuYnJ1c2hlcy5KU2NyaXB0ID0gQnJ1c2g7XG5cblx0Ly8gQ29tbW9uSlNcblx0dHlwZW9mKGV4cG9ydHMpICE9ICd1bmRlZmluZWQnID8gZXhwb3J0cy5CcnVzaCA9IEJydXNoIDogbnVsbDtcbn0pKCk7XG4iXSwibmFtZXMiOlsicmVxdWlyZSIsIlN5bnRheEhpZ2hsaWdodGVyIiwiQnJ1c2giLCJrZXl3b3JkcyIsInIiLCJyZWdleExpYiIsInJlZ2V4TGlzdCIsInJlZ2V4IiwibXVsdGlMaW5lRG91YmxlUXVvdGVkU3RyaW5nIiwiY3NzIiwibXVsdGlMaW5lU2luZ2xlUXVvdGVkU3RyaW5nIiwic2luZ2xlTGluZUNDb21tZW50cyIsIm11bHRpTGluZUNDb21tZW50cyIsIlJlZ0V4cCIsImdldEtleXdvcmRzIiwiZm9ySHRtbFNjcmlwdCIsInNjcmlwdFNjcmlwdFRhZ3MiLCJwcm90b3R5cGUiLCJIaWdobGlnaHRlciIsImFsaWFzZXMiLCJicnVzaGVzIiwiSlNjcmlwdCIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQWdCRSxDQUFBO0lBRUQsV0FBVztJQUNYLE9BQU9BLFdBQVksY0FBY0Msb0JBQW9CRCxRQUFRLFVBQVVDLGlCQUFpQixHQUFHO0lBRTNGLFNBQVNDO1FBRVIsSUFBSUMsV0FBVywrQkFDWCxtQ0FDQSxtQ0FDQSxrQ0FDQTtRQUdKLElBQUlDLElBQUlILGtCQUFrQkksUUFBUTtRQUVsQyxJQUFJLENBQUNDLFNBQVMsR0FBRztZQUNoQjtnQkFBRUMsT0FBT0gsRUFBRUksMkJBQTJCO2dCQUFNQyxLQUFLO1lBQVM7WUFDMUQ7Z0JBQUVGLE9BQU9ILEVBQUVNLDJCQUEyQjtnQkFBTUQsS0FBSztZQUFTO1lBQzFEO2dCQUFFRixPQUFPSCxFQUFFTyxtQkFBbUI7Z0JBQVFGLEtBQUs7WUFBVztZQUN0RDtnQkFBRUYsT0FBT0gsRUFBRVEsa0JBQWtCO2dCQUFRSCxLQUFLO1lBQVc7WUFDckQ7Z0JBQUVGLE9BQU87Z0JBQW9CRSxLQUFLO1lBQWU7WUFDakQ7Z0JBQUVGLE9BQU8sSUFBSU0sT0FBTyxJQUFJLENBQUNDLFdBQVcsQ0FBQ1gsV0FBVztnQkFBT00sS0FBSztZQUFVLEVBQUksV0FBVztTQUNwRjtRQUVGLElBQUksQ0FBQ00sYUFBYSxDQUFDWCxFQUFFWSxnQkFBZ0I7SUFDdEM7O0lBRUFkLE1BQU1lLFNBQVMsR0FBRyxJQUFJaEIsa0JBQWtCaUIsV0FBVztJQUNuRGhCLE1BQU1pQixPQUFPLEdBQUc7UUFBQztRQUFNO1FBQVc7S0FBYTtJQUUvQ2xCLGtCQUFrQm1CLE9BQU8sQ0FBQ0MsT0FBTyxHQUFHbkI7SUFFcEMsV0FBVztJQUNYLE9BQU9vQixXQUFZLGNBQWNBLFFBQVFwQixLQUFLLEdBQUdBLFFBQVE7QUFDMUQsQ0FBQSJ9