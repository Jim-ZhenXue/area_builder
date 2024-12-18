// Copyright 2020, University of Colorado Boulder
/**
 * QUnit tests for StopwatchNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import StopwatchNode from './StopwatchNode.js';
QUnit.module('StopwatchNode');
QUnit.test('Decimal Formatting', (assert)=>{
    assert.equal(StopwatchNode.getDecimalPlaces(123.123, 1), '.1');
    assert.equal(StopwatchNode.getDecimalPlaces(9.114324529783822, 2), '.11');
    assert.equal(StopwatchNode.getDecimalPlaces(10.371315125053542, 1), '.4');
    assert.equal(StopwatchNode.getDecimalPlaces(7.644452643958845, 3), '.644');
    assert.equal(StopwatchNode.getDecimalPlaces(7.64455555, 3), '.645');
    assert.equal(StopwatchNode.getDecimalPlaces(5.245326003558443, 1), '.2');
    assert.equal(StopwatchNode.getDecimalPlaces(2.3999849450475925, 3), '.400');
    assert.equal(StopwatchNode.getDecimalPlaces(5.326367375905868, 3), '.326');
    assert.equal(StopwatchNode.getDecimalPlaces(5.357599160981993, 4), '.3576');
    assert.equal(StopwatchNode.getDecimalPlaces(7.5962564199877125, 2), '.60');
    assert.equal(StopwatchNode.getDecimalPlaces(10.6347712011732, 3), '.635');
    assert.equal(StopwatchNode.getDecimalPlaces(6.805918741130546, 4), '.8059');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdG9wd2F0Y2hOb2RlVGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFFVbml0IHRlc3RzIGZvciBTdG9wd2F0Y2hOb2RlXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgU3RvcHdhdGNoTm9kZSBmcm9tICcuL1N0b3B3YXRjaE5vZGUuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdTdG9wd2F0Y2hOb2RlJyApO1xuXG5RVW5pdC50ZXN0KCAnRGVjaW1hbCBGb3JtYXR0aW5nJywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0LmVxdWFsKCBTdG9wd2F0Y2hOb2RlLmdldERlY2ltYWxQbGFjZXMoIDEyMy4xMjMsIDEgKSwgJy4xJyApO1xuICBhc3NlcnQuZXF1YWwoIFN0b3B3YXRjaE5vZGUuZ2V0RGVjaW1hbFBsYWNlcyggOS4xMTQzMjQ1Mjk3ODM4MjIsIDIgKSwgJy4xMScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBTdG9wd2F0Y2hOb2RlLmdldERlY2ltYWxQbGFjZXMoIDEwLjM3MTMxNTEyNTA1MzU0MiwgMSApLCAnLjQnICk7XG4gIGFzc2VydC5lcXVhbCggU3RvcHdhdGNoTm9kZS5nZXREZWNpbWFsUGxhY2VzKCA3LjY0NDQ1MjY0Mzk1ODg0NSwgMyApLCAnLjY0NCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBTdG9wd2F0Y2hOb2RlLmdldERlY2ltYWxQbGFjZXMoIDcuNjQ0NTU1NTUsIDMgKSwgJy42NDUnICk7XG4gIGFzc2VydC5lcXVhbCggU3RvcHdhdGNoTm9kZS5nZXREZWNpbWFsUGxhY2VzKCA1LjI0NTMyNjAwMzU1ODQ0MywgMSApLCAnLjInICk7XG4gIGFzc2VydC5lcXVhbCggU3RvcHdhdGNoTm9kZS5nZXREZWNpbWFsUGxhY2VzKCAyLjM5OTk4NDk0NTA0NzU5MjUsIDMgKSwgJy40MDAnICk7XG4gIGFzc2VydC5lcXVhbCggU3RvcHdhdGNoTm9kZS5nZXREZWNpbWFsUGxhY2VzKCA1LjMyNjM2NzM3NTkwNTg2OCwgMyApLCAnLjMyNicgKTtcbiAgYXNzZXJ0LmVxdWFsKCBTdG9wd2F0Y2hOb2RlLmdldERlY2ltYWxQbGFjZXMoIDUuMzU3NTk5MTYwOTgxOTkzLCA0ICksICcuMzU3NicgKTtcbiAgYXNzZXJ0LmVxdWFsKCBTdG9wd2F0Y2hOb2RlLmdldERlY2ltYWxQbGFjZXMoIDcuNTk2MjU2NDE5OTg3NzEyNSwgMiApLCAnLjYwJyApO1xuICBhc3NlcnQuZXF1YWwoIFN0b3B3YXRjaE5vZGUuZ2V0RGVjaW1hbFBsYWNlcyggMTAuNjM0NzcxMjAxMTczMiwgMyApLCAnLjYzNScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBTdG9wd2F0Y2hOb2RlLmdldERlY2ltYWxQbGFjZXMoIDYuODA1OTE4NzQxMTMwNTQ2LCA0ICksICcuODA1OScgKTtcbn0gKTsiXSwibmFtZXMiOlsiU3RvcHdhdGNoTm9kZSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsImVxdWFsIiwiZ2V0RGVjaW1hbFBsYWNlcyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRCxPQUFPQSxtQkFBbUIscUJBQXFCO0FBRS9DQyxNQUFNQyxNQUFNLENBQUU7QUFFZEQsTUFBTUUsSUFBSSxDQUFFLHNCQUFzQkMsQ0FBQUE7SUFDaENBLE9BQU9DLEtBQUssQ0FBRUwsY0FBY00sZ0JBQWdCLENBQUUsU0FBUyxJQUFLO0lBQzVERixPQUFPQyxLQUFLLENBQUVMLGNBQWNNLGdCQUFnQixDQUFFLG1CQUFtQixJQUFLO0lBQ3RFRixPQUFPQyxLQUFLLENBQUVMLGNBQWNNLGdCQUFnQixDQUFFLG9CQUFvQixJQUFLO0lBQ3ZFRixPQUFPQyxLQUFLLENBQUVMLGNBQWNNLGdCQUFnQixDQUFFLG1CQUFtQixJQUFLO0lBQ3RFRixPQUFPQyxLQUFLLENBQUVMLGNBQWNNLGdCQUFnQixDQUFFLFlBQVksSUFBSztJQUMvREYsT0FBT0MsS0FBSyxDQUFFTCxjQUFjTSxnQkFBZ0IsQ0FBRSxtQkFBbUIsSUFBSztJQUN0RUYsT0FBT0MsS0FBSyxDQUFFTCxjQUFjTSxnQkFBZ0IsQ0FBRSxvQkFBb0IsSUFBSztJQUN2RUYsT0FBT0MsS0FBSyxDQUFFTCxjQUFjTSxnQkFBZ0IsQ0FBRSxtQkFBbUIsSUFBSztJQUN0RUYsT0FBT0MsS0FBSyxDQUFFTCxjQUFjTSxnQkFBZ0IsQ0FBRSxtQkFBbUIsSUFBSztJQUN0RUYsT0FBT0MsS0FBSyxDQUFFTCxjQUFjTSxnQkFBZ0IsQ0FBRSxvQkFBb0IsSUFBSztJQUN2RUYsT0FBT0MsS0FBSyxDQUFFTCxjQUFjTSxnQkFBZ0IsQ0FBRSxrQkFBa0IsSUFBSztJQUNyRUYsT0FBT0MsS0FBSyxDQUFFTCxjQUFjTSxnQkFBZ0IsQ0FBRSxtQkFBbUIsSUFBSztBQUN4RSJ9