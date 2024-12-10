// Copyright 2017-2024, University of Colorado Boulder
/**
 * escapeHTML tests
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import escapeHTML from './escapeHTML.js';
QUnit.module('escapeHTML');
QUnit.test('escapeHTML', (assert)=>{
    assert.equal(escapeHTML('A&B'), 'A&amp;B', 'simple &');
    assert.equal(escapeHTML('A<B'), 'A&lt;B', 'simple <');
    assert.equal(escapeHTML('A>B'), 'A&gt;B', 'simple >');
    assert.equal(escapeHTML('A"B'), 'A&quot;B', 'simple "');
    assert.equal(escapeHTML('A\'B'), 'A&#x27;B', 'simple \'');
    assert.equal(escapeHTML('A/B'), 'A&#x2F;B', 'simple /');
    assert.equal(escapeHTML('&amp; & ""'), '&amp;amp;&nbsp;&amp;&nbsp;&quot;&quot;', 'multiple escaping');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9lc2NhcGVIVE1MVGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogZXNjYXBlSFRNTCB0ZXN0c1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBlc2NhcGVIVE1MIGZyb20gJy4vZXNjYXBlSFRNTC5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ2VzY2FwZUhUTUwnICk7XG5cblFVbml0LnRlc3QoICdlc2NhcGVIVE1MJywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0LmVxdWFsKCBlc2NhcGVIVE1MKCAnQSZCJyApLCAnQSZhbXA7QicsICdzaW1wbGUgJicgKTtcbiAgYXNzZXJ0LmVxdWFsKCBlc2NhcGVIVE1MKCAnQTxCJyApLCAnQSZsdDtCJywgJ3NpbXBsZSA8JyApO1xuICBhc3NlcnQuZXF1YWwoIGVzY2FwZUhUTUwoICdBPkInICksICdBJmd0O0InLCAnc2ltcGxlID4nICk7XG4gIGFzc2VydC5lcXVhbCggZXNjYXBlSFRNTCggJ0FcIkInICksICdBJnF1b3Q7QicsICdzaW1wbGUgXCInICk7XG4gIGFzc2VydC5lcXVhbCggZXNjYXBlSFRNTCggJ0FcXCdCJyApLCAnQSYjeDI3O0InLCAnc2ltcGxlIFxcJycgKTtcbiAgYXNzZXJ0LmVxdWFsKCBlc2NhcGVIVE1MKCAnQS9CJyApLCAnQSYjeDJGO0InLCAnc2ltcGxlIC8nICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBlc2NhcGVIVE1MKCAnJmFtcDsgJiBcIlwiJyApLCAnJmFtcDthbXA7Jm5ic3A7JmFtcDsmbmJzcDsmcXVvdDsmcXVvdDsnLCAnbXVsdGlwbGUgZXNjYXBpbmcnICk7XG59ICk7Il0sIm5hbWVzIjpbImVzY2FwZUhUTUwiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJlcXVhbCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsZ0JBQWdCLGtCQUFrQjtBQUV6Q0MsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSxjQUFjQyxDQUFBQTtJQUN4QkEsT0FBT0MsS0FBSyxDQUFFTCxXQUFZLFFBQVMsV0FBVztJQUM5Q0ksT0FBT0MsS0FBSyxDQUFFTCxXQUFZLFFBQVMsVUFBVTtJQUM3Q0ksT0FBT0MsS0FBSyxDQUFFTCxXQUFZLFFBQVMsVUFBVTtJQUM3Q0ksT0FBT0MsS0FBSyxDQUFFTCxXQUFZLFFBQVMsWUFBWTtJQUMvQ0ksT0FBT0MsS0FBSyxDQUFFTCxXQUFZLFNBQVUsWUFBWTtJQUNoREksT0FBT0MsS0FBSyxDQUFFTCxXQUFZLFFBQVMsWUFBWTtJQUUvQ0ksT0FBT0MsS0FBSyxDQUFFTCxXQUFZLGVBQWdCLDBDQUEwQztBQUN0RiJ9