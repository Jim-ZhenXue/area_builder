/**
 * @author mrdoob / http://mrdoob.com/
 */ var Stats = function() {
    var startTime = Date.now(), prevTime = startTime;
    var ms = 0, msMin = Infinity, msMax = 0;
    var fps = 0, fpsMin = Infinity, fpsMax = 0;
    var frames = 0, mode = 0;
    var container = document.createElement('div');
    container.id = 'stats';
    container.addEventListener('mousedown', function(event) {
        event.preventDefault();
        setMode(++mode % 2);
    }, false);
    container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';
    var fpsDiv = document.createElement('div');
    fpsDiv.id = 'fps';
    fpsDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';
    container.appendChild(fpsDiv);
    var fpsText = document.createElement('div');
    fpsText.id = 'fpsText';
    fpsText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
    fpsText.innerHTML = 'FPS';
    fpsDiv.appendChild(fpsText);
    var fpsGraph = document.createElement('div');
    fpsGraph.id = 'fpsGraph';
    fpsGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0ff';
    fpsDiv.appendChild(fpsGraph);
    while(fpsGraph.children.length < 74){
        var bar = document.createElement('span');
        bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#113';
        fpsGraph.appendChild(bar);
    }
    var msDiv = document.createElement('div');
    msDiv.id = 'ms';
    msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;display:none';
    container.appendChild(msDiv);
    var msText = document.createElement('div');
    msText.id = 'msText';
    msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
    msText.innerHTML = 'MS';
    msDiv.appendChild(msText);
    var msGraph = document.createElement('div');
    msGraph.id = 'msGraph';
    msGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0f0';
    msDiv.appendChild(msGraph);
    while(msGraph.children.length < 74){
        var bar = document.createElement('span');
        bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#131';
        msGraph.appendChild(bar);
    }
    var setMode = function(value) {
        mode = value;
        switch(mode){
            case 0:
                fpsDiv.style.display = 'block';
                msDiv.style.display = 'none';
                break;
            case 1:
                fpsDiv.style.display = 'none';
                msDiv.style.display = 'block';
                break;
        }
    };
    var updateGraph = function(dom, value) {
        var child = dom.appendChild(dom.firstChild);
        child.style.height = value + 'px';
    };
    return {
        REVISION: 12,
        domElement: container,
        setMode: setMode,
        begin: function() {
            startTime = Date.now();
        },
        end: function() {
            var time = Date.now();
            ms = time - startTime;
            msMin = Math.min(msMin, ms);
            msMax = Math.max(msMax, ms);
            msText.textContent = ms + ' MS (' + msMin + '-' + msMax + ')';
            updateGraph(msGraph, Math.min(30, 30 - ms / 200 * 30));
            frames++;
            if (time > prevTime + 1000) {
                fps = Math.round(frames * 1000 / (time - prevTime));
                fpsMin = Math.min(fpsMin, fps);
                fpsMax = Math.max(fpsMax, fps);
                fpsText.textContent = fps + ' FPS (' + fpsMin + '-' + fpsMax + ')';
                updateGraph(fpsGraph, Math.min(30, 30 - fps / 100 * 30));
                prevTime = time;
                frames = 0;
            }
            return time;
        },
        update: function() {
            startTime = this.end();
        }
    };
};
if (typeof module === 'object') {
    module.exports = Stats;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvc3RhdHMtcjEyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbS9cbiAqL1xuXG52YXIgU3RhdHMgPSBmdW5jdGlvbigpIHtcblxuICB2YXIgc3RhcnRUaW1lID0gRGF0ZS5ub3coKSwgcHJldlRpbWUgPSBzdGFydFRpbWU7XG4gIHZhciBtcyA9IDAsIG1zTWluID0gSW5maW5pdHksIG1zTWF4ID0gMDtcbiAgdmFyIGZwcyA9IDAsIGZwc01pbiA9IEluZmluaXR5LCBmcHNNYXggPSAwO1xuICB2YXIgZnJhbWVzID0gMCwgbW9kZSA9IDA7XG5cbiAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gIGNvbnRhaW5lci5pZCA9ICdzdGF0cyc7XG4gIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgc2V0TW9kZSggKyttb2RlICUgMiApXG4gIH0sIGZhbHNlICk7XG4gIGNvbnRhaW5lci5zdHlsZS5jc3NUZXh0ID0gJ3dpZHRoOjgwcHg7b3BhY2l0eTowLjk7Y3Vyc29yOnBvaW50ZXInO1xuXG4gIHZhciBmcHNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICBmcHNEaXYuaWQgPSAnZnBzJztcbiAgZnBzRGl2LnN0eWxlLmNzc1RleHQgPSAncGFkZGluZzowIDAgM3B4IDNweDt0ZXh0LWFsaWduOmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMDAyJztcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKCBmcHNEaXYgKTtcblxuICB2YXIgZnBzVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gIGZwc1RleHQuaWQgPSAnZnBzVGV4dCc7XG4gIGZwc1RleHQuc3R5bGUuY3NzVGV4dCA9ICdjb2xvcjojMGZmO2ZvbnQtZmFtaWx5OkhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmO2ZvbnQtc2l6ZTo5cHg7Zm9udC13ZWlnaHQ6Ym9sZDtsaW5lLWhlaWdodDoxNXB4JztcbiAgZnBzVGV4dC5pbm5lckhUTUwgPSAnRlBTJztcbiAgZnBzRGl2LmFwcGVuZENoaWxkKCBmcHNUZXh0ICk7XG5cbiAgdmFyIGZwc0dyYXBoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgZnBzR3JhcGguaWQgPSAnZnBzR3JhcGgnO1xuICBmcHNHcmFwaC5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOjc0cHg7aGVpZ2h0OjMwcHg7YmFja2dyb3VuZC1jb2xvcjojMGZmJztcbiAgZnBzRGl2LmFwcGVuZENoaWxkKCBmcHNHcmFwaCApO1xuXG4gIHdoaWxlICggZnBzR3JhcGguY2hpbGRyZW4ubGVuZ3RoIDwgNzQgKSB7XG5cbiAgICB2YXIgYmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NwYW4nICk7XG4gICAgYmFyLnN0eWxlLmNzc1RleHQgPSAnd2lkdGg6MXB4O2hlaWdodDozMHB4O2Zsb2F0OmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMTEzJztcbiAgICBmcHNHcmFwaC5hcHBlbmRDaGlsZCggYmFyICk7XG5cbiAgfVxuXG4gIHZhciBtc0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gIG1zRGl2LmlkID0gJ21zJztcbiAgbXNEaXYuc3R5bGUuY3NzVGV4dCA9ICdwYWRkaW5nOjAgMCAzcHggM3B4O3RleHQtYWxpZ246bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMwMjA7ZGlzcGxheTpub25lJztcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKCBtc0RpdiApO1xuXG4gIHZhciBtc1RleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICBtc1RleHQuaWQgPSAnbXNUZXh0JztcbiAgbXNUZXh0LnN0eWxlLmNzc1RleHQgPSAnY29sb3I6IzBmMDtmb250LWZhbWlseTpIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZjtmb250LXNpemU6OXB4O2ZvbnQtd2VpZ2h0OmJvbGQ7bGluZS1oZWlnaHQ6MTVweCc7XG4gIG1zVGV4dC5pbm5lckhUTUwgPSAnTVMnO1xuICBtc0Rpdi5hcHBlbmRDaGlsZCggbXNUZXh0ICk7XG5cbiAgdmFyIG1zR3JhcGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICBtc0dyYXBoLmlkID0gJ21zR3JhcGgnO1xuICBtc0dyYXBoLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246cmVsYXRpdmU7d2lkdGg6NzRweDtoZWlnaHQ6MzBweDtiYWNrZ3JvdW5kLWNvbG9yOiMwZjAnO1xuICBtc0Rpdi5hcHBlbmRDaGlsZCggbXNHcmFwaCApO1xuXG4gIHdoaWxlICggbXNHcmFwaC5jaGlsZHJlbi5sZW5ndGggPCA3NCApIHtcblxuICAgIHZhciBiYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcbiAgICBiYXIuc3R5bGUuY3NzVGV4dCA9ICd3aWR0aDoxcHg7aGVpZ2h0OjMwcHg7ZmxvYXQ6bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMxMzEnO1xuICAgIG1zR3JhcGguYXBwZW5kQ2hpbGQoIGJhciApO1xuXG4gIH1cblxuICB2YXIgc2V0TW9kZSA9IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblxuICAgIG1vZGUgPSB2YWx1ZTtcblxuICAgIHN3aXRjaCggbW9kZSApIHtcblxuICAgICAgY2FzZSAwOlxuICAgICAgICBmcHNEaXYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIG1zRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICBmcHNEaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgbXNEaXYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICB9O1xuXG4gIHZhciB1cGRhdGVHcmFwaCA9IGZ1bmN0aW9uKCBkb20sIHZhbHVlICkge1xuXG4gICAgdmFyIGNoaWxkID0gZG9tLmFwcGVuZENoaWxkKCBkb20uZmlyc3RDaGlsZCApO1xuICAgIGNoaWxkLnN0eWxlLmhlaWdodCA9IHZhbHVlICsgJ3B4JztcblxuICB9O1xuXG4gIHJldHVybiB7XG5cbiAgICBSRVZJU0lPTjogMTIsXG5cbiAgICBkb21FbGVtZW50OiBjb250YWluZXIsXG5cbiAgICBzZXRNb2RlOiBzZXRNb2RlLFxuXG4gICAgYmVnaW46IGZ1bmN0aW9uKCkge1xuXG4gICAgICBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgfSxcblxuICAgIGVuZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciB0aW1lID0gRGF0ZS5ub3coKTtcblxuICAgICAgbXMgPSB0aW1lIC0gc3RhcnRUaW1lO1xuICAgICAgbXNNaW4gPSBNYXRoLm1pbiggbXNNaW4sIG1zICk7XG4gICAgICBtc01heCA9IE1hdGgubWF4KCBtc01heCwgbXMgKTtcblxuICAgICAgbXNUZXh0LnRleHRDb250ZW50ID0gbXMgKyAnIE1TICgnICsgbXNNaW4gKyAnLScgKyBtc01heCArICcpJztcbiAgICAgIHVwZGF0ZUdyYXBoKCBtc0dyYXBoLCBNYXRoLm1pbiggMzAsIDMwIC0gKCBtcyAvIDIwMCApICogMzAgKSApO1xuXG4gICAgICBmcmFtZXMrKztcblxuICAgICAgaWYgKCB0aW1lID4gcHJldlRpbWUgKyAxMDAwICkge1xuXG4gICAgICAgIGZwcyA9IE1hdGgucm91bmQoICggZnJhbWVzICogMTAwMCApIC8gKCB0aW1lIC0gcHJldlRpbWUgKSApO1xuICAgICAgICBmcHNNaW4gPSBNYXRoLm1pbiggZnBzTWluLCBmcHMgKTtcbiAgICAgICAgZnBzTWF4ID0gTWF0aC5tYXgoIGZwc01heCwgZnBzICk7XG5cbiAgICAgICAgZnBzVGV4dC50ZXh0Q29udGVudCA9IGZwcyArICcgRlBTICgnICsgZnBzTWluICsgJy0nICsgZnBzTWF4ICsgJyknO1xuICAgICAgICB1cGRhdGVHcmFwaCggZnBzR3JhcGgsIE1hdGgubWluKCAzMCwgMzAgLSAoIGZwcyAvIDEwMCApICogMzAgKSApO1xuXG4gICAgICAgIHByZXZUaW1lID0gdGltZTtcbiAgICAgICAgZnJhbWVzID0gMDtcblxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGltZTtcblxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgICBzdGFydFRpbWUgPSB0aGlzLmVuZCgpO1xuXG4gICAgfVxuXG4gIH1cblxufTtcblxuaWYgKCB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyApIHtcblxuICBtb2R1bGUuZXhwb3J0cyA9IFN0YXRzO1xuXG59Il0sIm5hbWVzIjpbIlN0YXRzIiwic3RhcnRUaW1lIiwiRGF0ZSIsIm5vdyIsInByZXZUaW1lIiwibXMiLCJtc01pbiIsIkluZmluaXR5IiwibXNNYXgiLCJmcHMiLCJmcHNNaW4iLCJmcHNNYXgiLCJmcmFtZXMiLCJtb2RlIiwiY29udGFpbmVyIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaWQiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsInNldE1vZGUiLCJzdHlsZSIsImNzc1RleHQiLCJmcHNEaXYiLCJhcHBlbmRDaGlsZCIsImZwc1RleHQiLCJpbm5lckhUTUwiLCJmcHNHcmFwaCIsImNoaWxkcmVuIiwibGVuZ3RoIiwiYmFyIiwibXNEaXYiLCJtc1RleHQiLCJtc0dyYXBoIiwidmFsdWUiLCJkaXNwbGF5IiwidXBkYXRlR3JhcGgiLCJkb20iLCJjaGlsZCIsImZpcnN0Q2hpbGQiLCJoZWlnaHQiLCJSRVZJU0lPTiIsImRvbUVsZW1lbnQiLCJiZWdpbiIsImVuZCIsInRpbWUiLCJNYXRoIiwibWluIiwibWF4IiwidGV4dENvbnRlbnQiLCJyb3VuZCIsInVwZGF0ZSIsIm1vZHVsZSIs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