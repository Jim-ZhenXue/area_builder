// Copyright 2024, University of Colorado Boulder
/**
 * Unit tests for FlowConstraint.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import Property from '../../../../axon/js/Property.js';
import { FlowCell, FlowConstraint, Node } from '../../imports.js';
import LayoutTestUtils from '../LayoutTestUtils.js';
QUnit.module('FlowConstraint');
const createConstraint = (constraintOptions)=>{
    const [a, b, c] = LayoutTestUtils.createRectangles(3);
    const [parent1, parent2, parent3] = LayoutTestUtils.createRectangles(3);
    parent1.addChild(a);
    parent2.addChild(b);
    parent3.addChild(c);
    const scene = new Node({
        children: [
            parent1,
            parent2,
            parent3
        ]
    });
    // parents are scaled randomly
    parent1.scale(1.5);
    parent2.scale(2);
    parent3.scale(0.5);
    const constraint = new FlowConstraint(scene, constraintOptions);
    constraint.insertCell(0, new FlowCell(constraint, a, null));
    constraint.insertCell(1, new FlowCell(constraint, b, null));
    constraint.insertCell(2, new FlowCell(constraint, c, null));
    constraint.updateLayout();
    return [
        a,
        b,
        c,
        parent1,
        parent2,
        parent3
    ];
};
QUnit.test('Construction tests', (assert)=>{
    const [a, b, c] = LayoutTestUtils.createRectangles(3);
    const [parent1, parent2, parent3] = LayoutTestUtils.createRectangles(3);
    parent1.addChild(a);
    parent2.addChild(b);
    parent3.addChild(c);
    const scene = new Node({
        children: [
            parent1,
            parent2,
            parent3
        ]
    });
    const constraint = new FlowConstraint(scene);
    constraint.dispose();
    assert.ok(true, 'FlowConstraint construction test passed');
    const constraint2 = new FlowConstraint(scene, {
        spacing: 10,
        justify: 'left',
        wrap: true
    });
    constraint2.dispose();
    assert.ok(true, 'FlowConstraint construction test with options passed');
});
QUnit.test('Spacing in global frame', (assert)=>{
    const [a, b, c] = createConstraint({
        spacing: 10,
        align: 'top'
    });
    // uniform spacing and alignment even though parents are scaled differently
    assert.equal(a.top, b.top, 'a and b are aligned to the top');
    assert.equal(b.top, c.top, 'b and c are aligned to the top');
    const aGlobalLeft = a.globalBounds.left;
    const aGlobalRight = a.globalBounds.right;
    const bGlobalLeft = b.globalBounds.left;
    const bGlobalRight = b.globalBounds.right;
    const cGlobalLeft = c.globalBounds.left;
    assert.ok(aGlobalLeft === 0, 'a is at the left edge of the scene');
    assert.ok(LayoutTestUtils.aboutEqual(aGlobalRight + 10, bGlobalLeft), 'a and b are spaced 10 apart in scene frame');
    assert.ok(LayoutTestUtils.aboutEqual(bGlobalRight + 10, cGlobalLeft), 'b and c are spaced 10 apart in scene frame');
});
QUnit.test('Wrap, lineSpacing', (assert)=>{
    // A flow constraint with wrap and lineSpacing - rectangle b is tallest, so c should be wrapped below b, but
    // to the left edge of the scene.
    const lineSpacing = 10;
    const [a, b, c] = createConstraint({
        preferredWidthProperty: new Property(LayoutTestUtils.RECT_WIDTH * 2),
        wrap: true,
        lineSpacing: lineSpacing
    });
    const aGlobalLeft = a.globalBounds.left;
    const bGlobalBottom = b.globalBounds.bottom;
    const cGlobalLeft = c.globalBounds.left;
    const cGlobalTop = c.globalBounds.top;
    assert.ok(aGlobalLeft === 0, 'a is at the left edge of the scene');
    assert.ok(cGlobalLeft === 0, 'c is is wrapped to the left edge of the scene');
    assert.ok(LayoutTestUtils.aboutEqual(bGlobalBottom + lineSpacing, cGlobalTop), 'c is wrapped below b plus lineSpacing');
});
QUnit.test('justify and justifyLines', (assert)=>{
    // justify
    const [a, b, c] = createConstraint({
        preferredWidthProperty: new Property(LayoutTestUtils.RECT_WIDTH * 3),
        wrap: true,
        justify: 'right',
        align: 'top'
    });
    // a should be in the first row while be and c are in the second row, aligned to the right
    assert.ok(a.globalBounds.right === LayoutTestUtils.RECT_WIDTH * 3, 'a is at the right edge of the scene');
    assert.ok(c.globalBounds.right === LayoutTestUtils.RECT_WIDTH * 3, 'c is at the right edge of the scene');
    assert.ok(b.globalBounds.right === c.globalBounds.left, 'b is to the left of c');
    assert.ok(c.globalBounds.top === b.globalBounds.top, 'c is aligned to b');
    // justifyLines
    const [d, e, f] = createConstraint({
        preferredWidthProperty: new Property(20),
        preferredHeightProperty: new Property(LayoutTestUtils.RECT_HEIGHT * 4),
        wrap: true,
        justifyLines: 'bottom'
    });
    // in a vertical column, left aligned
    assert.ok(d.globalBounds.left === 0, 'd is at the left edge of the scene');
    assert.ok(e.globalBounds.left === 0, 'e is at the left edge of the scene');
    assert.ok(f.globalBounds.left === 0, 'f is at the left edge of the scene');
// TODO, why doesn't this pass? https://github.com/phetsims/scenery/issues/1465
// assert.ok( f.globalBounds.bottom === LayoutTestUtils.RECT_HEIGHT * 4, 'd is at the bottom edge of the scene (justifyLines: bottom)' );
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL0Zsb3dDb25zdHJhaW50VGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFVuaXQgdGVzdHMgZm9yIEZsb3dDb25zdHJhaW50LlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCB7IEZsb3dDZWxsLCBGbG93Q29uc3RyYWludCwgRmxvd0NvbnN0cmFpbnRPcHRpb25zLCBOb2RlIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5pbXBvcnQgTGF5b3V0VGVzdFV0aWxzIGZyb20gJy4uL0xheW91dFRlc3RVdGlscy5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ0Zsb3dDb25zdHJhaW50JyApO1xuXG5jb25zdCBjcmVhdGVDb25zdHJhaW50ID0gKCBjb25zdHJhaW50T3B0aW9uczogRmxvd0NvbnN0cmFpbnRPcHRpb25zICkgPT4ge1xuICBjb25zdCBbIGEsIGIsIGMgXSA9IExheW91dFRlc3RVdGlscy5jcmVhdGVSZWN0YW5nbGVzKCAzICk7XG4gIGNvbnN0IFsgcGFyZW50MSwgcGFyZW50MiwgcGFyZW50MyBdID0gTGF5b3V0VGVzdFV0aWxzLmNyZWF0ZVJlY3RhbmdsZXMoIDMgKTtcblxuICBwYXJlbnQxLmFkZENoaWxkKCBhICk7XG4gIHBhcmVudDIuYWRkQ2hpbGQoIGIgKTtcbiAgcGFyZW50My5hZGRDaGlsZCggYyApO1xuXG4gIGNvbnN0IHNjZW5lID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgcGFyZW50MSwgcGFyZW50MiwgcGFyZW50MyBdIH0gKTtcblxuICAvLyBwYXJlbnRzIGFyZSBzY2FsZWQgcmFuZG9tbHlcbiAgcGFyZW50MS5zY2FsZSggMS41ICk7XG4gIHBhcmVudDIuc2NhbGUoIDIgKTtcbiAgcGFyZW50My5zY2FsZSggMC41ICk7XG5cbiAgY29uc3QgY29uc3RyYWludCA9IG5ldyBGbG93Q29uc3RyYWludCggc2NlbmUsIGNvbnN0cmFpbnRPcHRpb25zICk7XG5cbiAgY29uc3RyYWludC5pbnNlcnRDZWxsKCAwLCBuZXcgRmxvd0NlbGwoIGNvbnN0cmFpbnQsIGEsIG51bGwgKSApO1xuICBjb25zdHJhaW50Lmluc2VydENlbGwoIDEsIG5ldyBGbG93Q2VsbCggY29uc3RyYWludCwgYiwgbnVsbCApICk7XG4gIGNvbnN0cmFpbnQuaW5zZXJ0Q2VsbCggMiwgbmV3IEZsb3dDZWxsKCBjb25zdHJhaW50LCBjLCBudWxsICkgKTtcbiAgY29uc3RyYWludC51cGRhdGVMYXlvdXQoKTtcblxuICByZXR1cm4gWyBhLCBiLCBjLCBwYXJlbnQxLCBwYXJlbnQyLCBwYXJlbnQzIF07XG59O1xuXG5RVW5pdC50ZXN0KCAnQ29uc3RydWN0aW9uIHRlc3RzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgWyBhLCBiLCBjIF0gPSBMYXlvdXRUZXN0VXRpbHMuY3JlYXRlUmVjdGFuZ2xlcyggMyApO1xuICBjb25zdCBbIHBhcmVudDEsIHBhcmVudDIsIHBhcmVudDMgXSA9IExheW91dFRlc3RVdGlscy5jcmVhdGVSZWN0YW5nbGVzKCAzICk7XG5cbiAgcGFyZW50MS5hZGRDaGlsZCggYSApO1xuICBwYXJlbnQyLmFkZENoaWxkKCBiICk7XG4gIHBhcmVudDMuYWRkQ2hpbGQoIGMgKTtcblxuICBjb25zdCBzY2VuZSA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIHBhcmVudDEsIHBhcmVudDIsIHBhcmVudDMgXSB9ICk7XG5cbiAgY29uc3QgY29uc3RyYWludCA9IG5ldyBGbG93Q29uc3RyYWludCggc2NlbmUgKTtcbiAgY29uc3RyYWludC5kaXNwb3NlKCk7XG4gIGFzc2VydC5vayggdHJ1ZSwgJ0Zsb3dDb25zdHJhaW50IGNvbnN0cnVjdGlvbiB0ZXN0IHBhc3NlZCcgKTtcblxuICBjb25zdCBjb25zdHJhaW50MiA9IG5ldyBGbG93Q29uc3RyYWludCggc2NlbmUsIHsgc3BhY2luZzogMTAsIGp1c3RpZnk6ICdsZWZ0Jywgd3JhcDogdHJ1ZSB9ICk7XG4gIGNvbnN0cmFpbnQyLmRpc3Bvc2UoKTtcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnRmxvd0NvbnN0cmFpbnQgY29uc3RydWN0aW9uIHRlc3Qgd2l0aCBvcHRpb25zIHBhc3NlZCcgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1NwYWNpbmcgaW4gZ2xvYmFsIGZyYW1lJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgWyBhLCBiLCBjIF0gPSBjcmVhdGVDb25zdHJhaW50KCB7IHNwYWNpbmc6IDEwLCBhbGlnbjogJ3RvcCcgfSApO1xuXG4gIC8vIHVuaWZvcm0gc3BhY2luZyBhbmQgYWxpZ25tZW50IGV2ZW4gdGhvdWdoIHBhcmVudHMgYXJlIHNjYWxlZCBkaWZmZXJlbnRseVxuICBhc3NlcnQuZXF1YWwoIGEudG9wLCBiLnRvcCwgJ2EgYW5kIGIgYXJlIGFsaWduZWQgdG8gdGhlIHRvcCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLnRvcCwgYy50b3AsICdiIGFuZCBjIGFyZSBhbGlnbmVkIHRvIHRoZSB0b3AnICk7XG5cbiAgY29uc3QgYUdsb2JhbExlZnQgPSBhLmdsb2JhbEJvdW5kcy5sZWZ0O1xuICBjb25zdCBhR2xvYmFsUmlnaHQgPSBhLmdsb2JhbEJvdW5kcy5yaWdodDtcbiAgY29uc3QgYkdsb2JhbExlZnQgPSBiLmdsb2JhbEJvdW5kcy5sZWZ0O1xuICBjb25zdCBiR2xvYmFsUmlnaHQgPSBiLmdsb2JhbEJvdW5kcy5yaWdodDtcbiAgY29uc3QgY0dsb2JhbExlZnQgPSBjLmdsb2JhbEJvdW5kcy5sZWZ0O1xuXG4gIGFzc2VydC5vayggYUdsb2JhbExlZnQgPT09IDAsICdhIGlzIGF0IHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIHNjZW5lJyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBhR2xvYmFsUmlnaHQgKyAxMCwgYkdsb2JhbExlZnQgKSwgJ2EgYW5kIGIgYXJlIHNwYWNlZCAxMCBhcGFydCBpbiBzY2VuZSBmcmFtZScgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYkdsb2JhbFJpZ2h0ICsgMTAsIGNHbG9iYWxMZWZ0ICksICdiIGFuZCBjIGFyZSBzcGFjZWQgMTAgYXBhcnQgaW4gc2NlbmUgZnJhbWUnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdXcmFwLCBsaW5lU3BhY2luZycsIGFzc2VydCA9PiB7XG5cbiAgLy8gQSBmbG93IGNvbnN0cmFpbnQgd2l0aCB3cmFwIGFuZCBsaW5lU3BhY2luZyAtIHJlY3RhbmdsZSBiIGlzIHRhbGxlc3QsIHNvIGMgc2hvdWxkIGJlIHdyYXBwZWQgYmVsb3cgYiwgYnV0XG4gIC8vIHRvIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIHNjZW5lLlxuICBjb25zdCBsaW5lU3BhY2luZyA9IDEwO1xuICBjb25zdCBbIGEsIGIsIGMgXSA9IGNyZWF0ZUNvbnN0cmFpbnQoIHtcbiAgICBwcmVmZXJyZWRXaWR0aFByb3BlcnR5OiBuZXcgUHJvcGVydHkoIExheW91dFRlc3RVdGlscy5SRUNUX1dJRFRIICogMiApLFxuICAgIHdyYXA6IHRydWUsXG4gICAgbGluZVNwYWNpbmc6IGxpbmVTcGFjaW5nXG4gIH0gKTtcblxuICBjb25zdCBhR2xvYmFsTGVmdCA9IGEuZ2xvYmFsQm91bmRzLmxlZnQ7XG4gIGNvbnN0IGJHbG9iYWxCb3R0b20gPSBiLmdsb2JhbEJvdW5kcy5ib3R0b207XG4gIGNvbnN0IGNHbG9iYWxMZWZ0ID0gYy5nbG9iYWxCb3VuZHMubGVmdDtcbiAgY29uc3QgY0dsb2JhbFRvcCA9IGMuZ2xvYmFsQm91bmRzLnRvcDtcblxuICBhc3NlcnQub2soIGFHbG9iYWxMZWZ0ID09PSAwLCAnYSBpcyBhdCB0aGUgbGVmdCBlZGdlIG9mIHRoZSBzY2VuZScgKTtcbiAgYXNzZXJ0Lm9rKCBjR2xvYmFsTGVmdCA9PT0gMCwgJ2MgaXMgaXMgd3JhcHBlZCB0byB0aGUgbGVmdCBlZGdlIG9mIHRoZSBzY2VuZScgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYkdsb2JhbEJvdHRvbSArIGxpbmVTcGFjaW5nLCBjR2xvYmFsVG9wICksICdjIGlzIHdyYXBwZWQgYmVsb3cgYiBwbHVzIGxpbmVTcGFjaW5nJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnanVzdGlmeSBhbmQganVzdGlmeUxpbmVzJywgYXNzZXJ0ID0+IHtcblxuICAvLyBqdXN0aWZ5XG4gIGNvbnN0IFsgYSwgYiwgYyBdID0gY3JlYXRlQ29uc3RyYWludCgge1xuICAgIHByZWZlcnJlZFdpZHRoUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggTGF5b3V0VGVzdFV0aWxzLlJFQ1RfV0lEVEggKiAzICksXG4gICAgd3JhcDogdHJ1ZSxcbiAgICBqdXN0aWZ5OiAncmlnaHQnLFxuICAgIGFsaWduOiAndG9wJ1xuICB9ICk7XG5cbiAgLy8gYSBzaG91bGQgYmUgaW4gdGhlIGZpcnN0IHJvdyB3aGlsZSBiZSBhbmQgYyBhcmUgaW4gdGhlIHNlY29uZCByb3csIGFsaWduZWQgdG8gdGhlIHJpZ2h0XG4gIGFzc2VydC5vayggYS5nbG9iYWxCb3VuZHMucmlnaHQgPT09IExheW91dFRlc3RVdGlscy5SRUNUX1dJRFRIICogMywgJ2EgaXMgYXQgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIHNjZW5lJyApO1xuICBhc3NlcnQub2soIGMuZ2xvYmFsQm91bmRzLnJpZ2h0ID09PSBMYXlvdXRUZXN0VXRpbHMuUkVDVF9XSURUSCAqIDMsICdjIGlzIGF0IHRoZSByaWdodCBlZGdlIG9mIHRoZSBzY2VuZScgKTtcbiAgYXNzZXJ0Lm9rKCBiLmdsb2JhbEJvdW5kcy5yaWdodCA9PT0gYy5nbG9iYWxCb3VuZHMubGVmdCwgJ2IgaXMgdG8gdGhlIGxlZnQgb2YgYycgKTtcbiAgYXNzZXJ0Lm9rKCBjLmdsb2JhbEJvdW5kcy50b3AgPT09IGIuZ2xvYmFsQm91bmRzLnRvcCwgJ2MgaXMgYWxpZ25lZCB0byBiJyApO1xuXG4gIC8vIGp1c3RpZnlMaW5lc1xuICBjb25zdCBbIGQsIGUsIGYgXSA9IGNyZWF0ZUNvbnN0cmFpbnQoIHtcbiAgICBwcmVmZXJyZWRXaWR0aFByb3BlcnR5OiBuZXcgUHJvcGVydHkoIDIwICksXG4gICAgcHJlZmVycmVkSGVpZ2h0UHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggTGF5b3V0VGVzdFV0aWxzLlJFQ1RfSEVJR0hUICogNCApLFxuICAgIHdyYXA6IHRydWUsXG4gICAganVzdGlmeUxpbmVzOiAnYm90dG9tJ1xuICB9ICk7XG5cbiAgLy8gaW4gYSB2ZXJ0aWNhbCBjb2x1bW4sIGxlZnQgYWxpZ25lZFxuICBhc3NlcnQub2soIGQuZ2xvYmFsQm91bmRzLmxlZnQgPT09IDAsICdkIGlzIGF0IHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIHNjZW5lJyApO1xuICBhc3NlcnQub2soIGUuZ2xvYmFsQm91bmRzLmxlZnQgPT09IDAsICdlIGlzIGF0IHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIHNjZW5lJyApO1xuICBhc3NlcnQub2soIGYuZ2xvYmFsQm91bmRzLmxlZnQgPT09IDAsICdmIGlzIGF0IHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIHNjZW5lJyApO1xuXG4gIC8vIFRPRE8sIHdoeSBkb2Vzbid0IHRoaXMgcGFzcz8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE0NjVcbiAgLy8gYXNzZXJ0Lm9rKCBmLmdsb2JhbEJvdW5kcy5ib3R0b20gPT09IExheW91dFRlc3RVdGlscy5SRUNUX0hFSUdIVCAqIDQsICdkIGlzIGF0IHRoZSBib3R0b20gZWRnZSBvZiB0aGUgc2NlbmUgKGp1c3RpZnlMaW5lczogYm90dG9tKScgKTtcbn0gKTsiXSwibmFtZXMiOlsiUHJvcGVydHkiLCJGbG93Q2VsbCIsIkZsb3dDb25zdHJhaW50IiwiTm9kZSIsIkxheW91dFRlc3RVdGlscyIsIlFVbml0IiwibW9kdWxlIiwiY3JlYXRlQ29uc3RyYWludCIsImNvbnN0cmFpbnRPcHRpb25zIiwiYSIsImIiLCJjIiwiY3JlYXRlUmVjdGFuZ2xlcyIsInBhcmVudDEiLCJwYXJlbnQyIiwicGFyZW50MyIsImFkZENoaWxkIiwic2NlbmUiLCJjaGlsZHJlbiIsInNjYWxlIiwiY29uc3RyYWludCIsImluc2VydENlbGwiLCJ1cGRhdGVMYXlvdXQiLCJ0ZXN0IiwiYXNzZXJ0IiwiZGlzcG9zZSIsIm9rIiwiY29uc3RyYWludDIiLCJzcGFjaW5nIiwianVzdGlmeSIsIndyYXAiLCJhbGlnbiIsImVxdWFsIiwidG9wIiwiYUdsb2JhbExlZnQiLCJnbG9iYWxCb3VuZHMiLCJsZWZ0IiwiYUdsb2JhbFJpZ2h0IiwicmlnaHQiLCJiR2xvYmFsTGVmdCIsImJHbG9iYWxSaWdodCIsImNHbG9iYWxMZWZ0IiwiYWJvdXRFcXVhbCIsImxpbmVTcGFjaW5nIiwicHJlZmVycmVkV2lkdGhQcm9wZXJ0eSIsIlJFQ1RfV0lEVEgiLCJiR2xvYmFsQm90dG9tIiwiYm90dG9tIiwiY0dsb2JhbFRvcCIsImQiLCJlIiwiZiIsInByZWZlcnJlZEhlaWdodFByb3BlcnR5IiwiUkVDVF9IRUlHSFQiLCJqdXN0aWZ5TGluZXMiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyxrQ0FBa0M7QUFDdkQsU0FBU0MsUUFBUSxFQUFFQyxjQUFjLEVBQXlCQyxJQUFJLFFBQVEsbUJBQW1CO0FBQ3pGLE9BQU9DLHFCQUFxQix3QkFBd0I7QUFFcERDLE1BQU1DLE1BQU0sQ0FBRTtBQUVkLE1BQU1DLG1CQUFtQixDQUFFQztJQUN6QixNQUFNLENBQUVDLEdBQUdDLEdBQUdDLEVBQUcsR0FBR1AsZ0JBQWdCUSxnQkFBZ0IsQ0FBRTtJQUN0RCxNQUFNLENBQUVDLFNBQVNDLFNBQVNDLFFBQVMsR0FBR1gsZ0JBQWdCUSxnQkFBZ0IsQ0FBRTtJQUV4RUMs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