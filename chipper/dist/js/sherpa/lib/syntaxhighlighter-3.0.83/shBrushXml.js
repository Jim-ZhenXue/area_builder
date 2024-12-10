(function() {
    // CommonJS
    typeof require != 'undefined' ? SyntaxHighlighter = require('shCore').SyntaxHighlighter : null;
    function Brush() {
        function process(match, regexInfo) {
            var constructor = SyntaxHighlighter.Match, code = match[0], tag = new XRegExp('(&lt;|<)[\\s\\/\\?]*(?<name>[:\\w-\\.]+)', 'xg').exec(code), result = [];
            if (match.attributes != null) {
                var attributes, regex = new XRegExp('(?<name> [\\w:\\-\\.]+)' + '\\s*=\\s*' + '(?<value> ".*?"|\'.*?\'|\\w+)', 'xg');
                while((attributes = regex.exec(code)) != null){
                    result.push(new constructor(attributes.name, match.index + attributes.index, 'color1'));
                    result.push(new constructor(attributes.value, match.index + attributes.index + attributes[0].indexOf(attributes.value), 'string'));
                }
            }
            if (tag != null) result.push(new constructor(tag.name, match.index + tag[0].indexOf(tag.name), 'keyword'));
            return result;
        }
        this.regexList = [
            {
                regex: new XRegExp('(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)', 'gm'),
                css: 'color2'
            },
            {
                regex: SyntaxHighlighter.regexLib.xmlComments,
                css: 'comments'
            },
            {
                regex: new XRegExp('(&lt;|<)[\\s\\/\\?]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)', 'sg'),
                func: process
            }
        ];
    }
    ;
    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = [
        'xml',
        'xhtml',
        'xslt',
        'html'
    ];
    SyntaxHighlighter.brushes.Xml = Brush;
    // CommonJS
    typeof exports != 'undefined' ? exports.Brush = Brush : null;
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvc3ludGF4aGlnaGxpZ2h0ZXItMy4wLjgzL3NoQnJ1c2hYbWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBTeW50YXhIaWdobGlnaHRlclxuICogaHR0cDovL2FsZXhnb3JiYXRjaGV2LmNvbS9TeW50YXhIaWdobGlnaHRlclxuICpcbiAqIFN5bnRheEhpZ2hsaWdodGVyIGlzIGRvbmF0aW9ud2FyZS4gSWYgeW91IGFyZSB1c2luZyBpdCwgcGxlYXNlIGRvbmF0ZS5cbiAqIGh0dHA6Ly9hbGV4Z29yYmF0Y2hldi5jb20vU3ludGF4SGlnaGxpZ2h0ZXIvZG9uYXRlLmh0bWxcbiAqXG4gKiBAdmVyc2lvblxuICogMy4wLjgzIChKdWx5IDAyIDIwMTApXG4gKiBcbiAqIEBjb3B5cmlnaHRcbiAqIENvcHlyaWdodCAoQykgMjAwNC0yMDEwIEFsZXggR29yYmF0Y2hldi5cbiAqXG4gKiBAbGljZW5zZVxuICogRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGFuZCBHUEwgbGljZW5zZXMuXG4gKi9cbjsoZnVuY3Rpb24oKVxue1xuXHQvLyBDb21tb25KU1xuXHR0eXBlb2YocmVxdWlyZSkgIT0gJ3VuZGVmaW5lZCcgPyBTeW50YXhIaWdobGlnaHRlciA9IHJlcXVpcmUoJ3NoQ29yZScpLlN5bnRheEhpZ2hsaWdodGVyIDogbnVsbDtcblxuXHRmdW5jdGlvbiBCcnVzaCgpXG5cdHtcblx0XHRmdW5jdGlvbiBwcm9jZXNzKG1hdGNoLCByZWdleEluZm8pXG5cdFx0e1xuXHRcdFx0dmFyIGNvbnN0cnVjdG9yID0gU3ludGF4SGlnaGxpZ2h0ZXIuTWF0Y2gsXG5cdFx0XHRcdGNvZGUgPSBtYXRjaFswXSxcblx0XHRcdFx0dGFnID0gbmV3IFhSZWdFeHAoJygmbHQ7fDwpW1xcXFxzXFxcXC9cXFxcP10qKD88bmFtZT5bOlxcXFx3LVxcXFwuXSspJywgJ3hnJykuZXhlYyhjb2RlKSxcblx0XHRcdFx0cmVzdWx0ID0gW11cblx0XHRcdFx0O1xuXHRcdFxuXHRcdFx0aWYgKG1hdGNoLmF0dHJpYnV0ZXMgIT0gbnVsbCkgXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBhdHRyaWJ1dGVzLFxuXHRcdFx0XHRcdHJlZ2V4ID0gbmV3IFhSZWdFeHAoJyg/PG5hbWU+IFtcXFxcdzpcXFxcLVxcXFwuXSspJyArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCdcXFxccyo9XFxcXHMqJyArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCcoPzx2YWx1ZT4gXCIuKj9cInxcXCcuKj9cXCd8XFxcXHcrKScsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCd4ZycpO1xuXG5cdFx0XHRcdHdoaWxlICgoYXR0cmlidXRlcyA9IHJlZ2V4LmV4ZWMoY29kZSkpICE9IG51bGwpIFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmVzdWx0LnB1c2gobmV3IGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXMubmFtZSwgbWF0Y2guaW5kZXggKyBhdHRyaWJ1dGVzLmluZGV4LCAnY29sb3IxJykpO1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVzLnZhbHVlLCBtYXRjaC5pbmRleCArIGF0dHJpYnV0ZXMuaW5kZXggKyBhdHRyaWJ1dGVzWzBdLmluZGV4T2YoYXR0cmlidXRlcy52YWx1ZSksICdzdHJpbmcnKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHRhZyAhPSBudWxsKVxuXHRcdFx0XHRyZXN1bHQucHVzaChcblx0XHRcdFx0XHRuZXcgY29uc3RydWN0b3IodGFnLm5hbWUsIG1hdGNoLmluZGV4ICsgdGFnWzBdLmluZGV4T2YodGFnLm5hbWUpLCAna2V5d29yZCcpXG5cdFx0XHRcdCk7XG5cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHRcblx0XHR0aGlzLnJlZ2V4TGlzdCA9IFtcblx0XHRcdHsgcmVnZXg6IG5ldyBYUmVnRXhwKCcoXFxcXCZsdDt8PClcXFxcIVxcXFxbW1xcXFx3XFxcXHNdKj9cXFxcWygufFxcXFxzKSo/XFxcXF1cXFxcXShcXFxcJmd0O3w+KScsICdnbScpLFx0XHRcdGNzczogJ2NvbG9yMicgfSxcdC8vIDwhWyAuLi4gWyAuLi4gXV0+XG5cdFx0XHR7IHJlZ2V4OiBTeW50YXhIaWdobGlnaHRlci5yZWdleExpYi54bWxDb21tZW50cyxcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjc3M6ICdjb21tZW50cycgfSxcdC8vIDwhLS0gLi4uIC0tPlxuXHRcdFx0eyByZWdleDogbmV3IFhSZWdFeHAoJygmbHQ7fDwpW1xcXFxzXFxcXC9cXFxcP10qKFxcXFx3KykoPzxhdHRyaWJ1dGVzPi4qPylbXFxcXHNcXFxcL1xcXFw/XSooJmd0O3w+KScsICdzZycpLCBmdW5jOiBwcm9jZXNzIH1cblx0XHRdO1xuXHR9O1xuXG5cdEJydXNoLnByb3RvdHlwZVx0PSBuZXcgU3ludGF4SGlnaGxpZ2h0ZXIuSGlnaGxpZ2h0ZXIoKTtcblx0QnJ1c2guYWxpYXNlc1x0PSBbJ3htbCcsICd4aHRtbCcsICd4c2x0JywgJ2h0bWwnXTtcblxuXHRTeW50YXhIaWdobGlnaHRlci5icnVzaGVzLlhtbCA9IEJydXNoO1xuXG5cdC8vIENvbW1vbkpTXG5cdHR5cGVvZihleHBvcnRzKSAhPSAndW5kZWZpbmVkJyA/IGV4cG9ydHMuQnJ1c2ggPSBCcnVzaCA6IG51bGw7XG59KSgpO1xuIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJTeW50YXhIaWdobGlnaHRlciIsIkJydXNoIiwicHJvY2VzcyIsIm1hdGNoIiwicmVnZXhJbmZvIiwiY29uc3RydWN0b3IiLCJNYXRjaCIsImNvZGUiLCJ0YWciLCJYUmVnRXhwIiwiZXhlYyIsInJlc3VsdCIsImF0dHJpYnV0ZXMiLCJyZWdleCIsInB1c2giLCJuYW1lIiwiaW5kZXgiLCJ2YWx1ZSIsImluZGV4T2YiLCJyZWdleExpc3QiLCJjc3MiLCJyZWdleExpYiIsInhtbENvbW1lbnRzIiwiZnVuYyIsInByb3RvdHlwZSIsIkhpZ2hsaWdodGVyIiwiYWxpYXNlcyIsImJydXNoZXMiLCJYbWwiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFnQkUsQ0FBQTtJQUVELFdBQVc7SUFDWCxPQUFPQSxXQUFZLGNBQWNDLG9CQUFvQkQsUUFBUSxVQUFVQyxpQkFBaUIsR0FBRztJQUUzRixTQUFTQztRQUVSLFNBQVNDLFFBQVFDLEtBQUssRUFBRUMsU0FBUztZQUVoQyxJQUFJQyxjQUFjTCxrQkFBa0JNLEtBQUssRUFDeENDLE9BQU9KLEtBQUssQ0FBQyxFQUFFLEVBQ2ZLLE1BQU0sSUFBSUMsUUFBUSw0Q0FBNEMsTUFBTUMsSUFBSSxDQUFDSCxPQUN6RUksU0FBUyxFQUFFO1lBR1osSUFBSVIsTUFBTVMsVUFBVSxJQUFJLE1BQ3hCO2dCQUNDLElBQUlBLFlBQ0hDLFFBQVEsSUFBSUosUUFBUSw0QkFDZixjQUNBLGlDQUNBO2dCQUVOLE1BQU8sQUFBQ0csQ0FBQUEsYUFBYUMsTUFBTUgsSUFBSSxDQUFDSCxLQUFJLEtBQU0sS0FDMUM7b0JBQ0NJLE9BQU9HLElBQUksQ0FBQyxJQUFJVCxZQUFZTyxXQUFXRyxJQUFJLEVBQUVaLE1BQU1hLEtBQUssR0FBR0osV0FBV0ksS0FBSyxFQUFFO29CQUM3RUwsT0FBT0csSUFBSSxDQUFDLElBQUlULFlBQVlPLFdBQVdLLEtBQUssRUFBRWQsTUFBTWEsS0FBSyxHQUFHSixXQUFXSSxLQUFLLEdBQUdKLFVBQVUsQ0FBQyxFQUFFLENBQUNNLE9BQU8sQ0FBQ04sV0FBV0ssS0FBSyxHQUFHO2dCQUN6SDtZQUNEO1lBRUEsSUFBSVQsT0FBTyxNQUNWRyxPQUFPRyxJQUFJLENBQ1YsSUFBSVQsWUFBWUcsSUFBSU8sSUFBSSxFQUFFWixNQUFNYSxLQUFLLEdBQUdSLEdBQUcsQ0FBQyxFQUFFLENBQUNVLE9BQU8sQ0FBQ1YsSUFBSU8sSUFBSSxHQUFHO1lBR3BFLE9BQU9KO1FBQ1I7UUFFQSxJQUFJLENBQUNRLFNBQVMsR0FBRztZQUNoQjtnQkFBRU4sT0FBTyxJQUFJSixRQUFRLDBEQUEwRDtnQkFBU1csS0FBSztZQUFTO1lBQ3RHO2dCQUFFUCxPQUFPYixrQkFBa0JxQixRQUFRLENBQUNDLFdBQVc7Z0JBQWFGLEtBQUs7WUFBVztZQUM1RTtnQkFBRVAsT0FBTyxJQUFJSixRQUFRLG9FQUFvRTtnQkFBT2MsTUFBTXJCO1lBQVE7U0FDOUc7SUFDRjs7SUFFQUQsTUFBTXVCLFNBQVMsR0FBRyxJQUFJeEIsa0JBQWtCeUIsV0FBVztJQUNuRHhCLE1BQU15QixPQUFPLEdBQUc7UUFBQztRQUFPO1FBQVM7UUFBUTtLQUFPO0lBRWhEMUIsa0JBQWtCMkIsT0FBTyxDQUFDQyxHQUFHLEdBQUczQjtJQUVoQyxXQUFXO0lBQ1gsT0FBTzRCLFdBQVksY0FBY0EsUUFBUTVCLEtBQUssR0FBR0EsUUFBUTtBQUMxRCxDQUFBIn0=