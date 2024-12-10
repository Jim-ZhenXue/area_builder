// Copyright 2018-2021, University of Colorado Boulder
/**
 * DragListener tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import DragListener from './DragListener.js';
import ListenerTestUtils from './ListenerTestUtils.js';
QUnit.module('DragListener');
QUnit.test('translateNode', (assert)=>{
    ListenerTestUtils.simpleRectangleTest((display, rect, node)=>{
        const listener = new DragListener({
            tandem: Tandem.ROOT_TEST.createTandem('myListener'),
            translateNode: true
        });
        rect.addInputListener(listener);
        ListenerTestUtils.mouseMove(display, 10, 10);
        ListenerTestUtils.mouseDown(display, 10, 10);
        ListenerTestUtils.mouseMove(display, 20, 15);
        ListenerTestUtils.mouseUp(display, 20, 15);
        assert.equal(rect.x, 10, 'Drag with translateNode should have changed the x translation');
        assert.equal(rect.y, 5, 'Drag with translateNode should have changed the y translation');
        listener.dispose();
    });
});
QUnit.test('translateNode with applyOffset:false', (assert)=>{
    ListenerTestUtils.simpleRectangleTest((display, rect, node)=>{
        const listener = new DragListener({
            tandem: Tandem.ROOT_TEST.createTandem('myListener'),
            translateNode: true,
            applyOffset: false
        });
        rect.addInputListener(listener);
        ListenerTestUtils.mouseMove(display, 10, 10);
        ListenerTestUtils.mouseDown(display, 10, 10);
        ListenerTestUtils.mouseMove(display, 20, 15);
        ListenerTestUtils.mouseUp(display, 20, 15);
        assert.equal(rect.x, 20, 'Drag should place the rect with its origin at the last mouse position (x)');
        assert.equal(rect.y, 15, 'Drag should place the rect with its origin at the last mouse position (y)');
        listener.dispose();
    });
});
QUnit.test('translateNode with trackAncestors', (assert)=>{
    ListenerTestUtils.simpleRectangleTest((display, rect, node)=>{
        const listener = new DragListener({
            tandem: Tandem.ROOT_TEST.createTandem('myListener'),
            translateNode: true,
            trackAncestors: true
        });
        rect.addInputListener(listener);
        ListenerTestUtils.mouseMove(display, 10, 10);
        ListenerTestUtils.mouseDown(display, 10, 10);
        node.x = 5;
        ListenerTestUtils.mouseMove(display, 20, 15);
        ListenerTestUtils.mouseUp(display, 20, 15);
        assert.equal(rect.x, 5, 'The x shift of 10 on the base node will have wiped out half of the drag change');
        assert.equal(rect.y, 5, 'No y movement occurred of the base node');
        listener.dispose();
    });
});
QUnit.test('positionProperty with hooks', (assert)=>{
    ListenerTestUtils.simpleRectangleTest((display, rect, node)=>{
        const positionProperty = new Vector2Property(Vector2.ZERO);
        positionProperty.linkAttribute(rect, 'translation');
        const listener = new DragListener({
            tandem: Tandem.ROOT_TEST.createTandem('myListener'),
            positionProperty: positionProperty
        });
        rect.addInputListener(listener);
        ListenerTestUtils.mouseMove(display, 10, 10);
        ListenerTestUtils.mouseDown(display, 10, 10);
        ListenerTestUtils.mouseMove(display, 20, 15);
        ListenerTestUtils.mouseUp(display, 20, 15);
        assert.equal(positionProperty.value.x, 10, 'Drag with translateNode should have changed the x translation');
        assert.equal(positionProperty.value.y, 5, 'Drag with translateNode should have changed the y translation');
        listener.dispose();
    });
});
QUnit.test('positionProperty with hooks and transform', (assert)=>{
    ListenerTestUtils.simpleRectangleTest((display, rect, node)=>{
        const positionProperty = new Vector2Property(Vector2.ZERO);
        const transform = new Transform3(Matrix3.translation(5, 3).timesMatrix(Matrix3.scale(2)).timesMatrix(Matrix3.rotation2(Math.PI / 4)));
        // Starts at 5,3
        positionProperty.link((position)=>{
            rect.translation = transform.transformPosition2(position);
        });
        const listener = new DragListener({
            tandem: Tandem.ROOT_TEST.createTandem('myListener'),
            positionProperty: positionProperty,
            transform: transform
        });
        rect.addInputListener(listener);
        ListenerTestUtils.mouseMove(display, 10, 10);
        ListenerTestUtils.mouseDown(display, 10, 10);
        ListenerTestUtils.mouseMove(display, 20, 15);
        ListenerTestUtils.mouseUp(display, 20, 15);
        assert.equal(Utils.roundSymmetric(rect.x), 15, '[x] Started at 5, moved by 10');
        assert.equal(Utils.roundSymmetric(rect.y), 8, '[y] Started at 3, moved by 5');
        listener.dispose();
    });
});
QUnit.test('positionProperty with dragBounds', (assert)=>{
    ListenerTestUtils.simpleRectangleTest((display, rect, node)=>{
        const positionProperty = new Vector2Property(Vector2.ZERO);
        positionProperty.link((position)=>{
            rect.translation = position;
        });
        const listener = new DragListener({
            tandem: Tandem.ROOT_TEST.createTandem('myListener'),
            positionProperty: positionProperty,
            dragBoundsProperty: new Property(new Bounds2(0, 0, 5, 5))
        });
        rect.addInputListener(listener);
        ListenerTestUtils.mouseMove(display, 10, 10);
        ListenerTestUtils.mouseDown(display, 10, 10);
        ListenerTestUtils.mouseMove(display, 50, 30);
        ListenerTestUtils.mouseUp(display, 50, 30);
        assert.equal(positionProperty.value.x, 5, '[x] Should be limited to 5 by dragBounds');
        assert.equal(positionProperty.value.y, 5, '[y] Should be limited to 5 by dragBounds  ');
        listener.dispose();
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL0RyYWdMaXN0ZW5lclRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERyYWdMaXN0ZW5lciB0ZXN0c1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgVHJhbnNmb3JtMyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVHJhbnNmb3JtMy5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IERyYWdMaXN0ZW5lciBmcm9tICcuL0RyYWdMaXN0ZW5lci5qcyc7XG5pbXBvcnQgTGlzdGVuZXJUZXN0VXRpbHMgZnJvbSAnLi9MaXN0ZW5lclRlc3RVdGlscy5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ0RyYWdMaXN0ZW5lcicgKTtcblxuUVVuaXQudGVzdCggJ3RyYW5zbGF0ZU5vZGUnLCBhc3NlcnQgPT4ge1xuICBMaXN0ZW5lclRlc3RVdGlscy5zaW1wbGVSZWN0YW5nbGVUZXN0KCAoIGRpc3BsYXksIHJlY3QsIG5vZGUgKSA9PiB7XG4gICAgY29uc3QgbGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAnbXlMaXN0ZW5lcicgKSxcbiAgICAgIHRyYW5zbGF0ZU5vZGU6IHRydWVcbiAgICB9ICk7XG4gICAgcmVjdC5hZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApO1xuXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZURvd24oIGRpc3BsYXksIDEwLCAxMCApO1xuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlTW92ZSggZGlzcGxheSwgMjAsIDE1ICk7XG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VVcCggZGlzcGxheSwgMjAsIDE1ICk7XG4gICAgYXNzZXJ0LmVxdWFsKCByZWN0LngsIDEwLCAnRHJhZyB3aXRoIHRyYW5zbGF0ZU5vZGUgc2hvdWxkIGhhdmUgY2hhbmdlZCB0aGUgeCB0cmFuc2xhdGlvbicgKTtcbiAgICBhc3NlcnQuZXF1YWwoIHJlY3QueSwgNSwgJ0RyYWcgd2l0aCB0cmFuc2xhdGVOb2RlIHNob3VsZCBoYXZlIGNoYW5nZWQgdGhlIHkgdHJhbnNsYXRpb24nICk7XG4gICAgbGlzdGVuZXIuZGlzcG9zZSgpO1xuICB9ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICd0cmFuc2xhdGVOb2RlIHdpdGggYXBwbHlPZmZzZXQ6ZmFsc2UnLCBhc3NlcnQgPT4ge1xuICBMaXN0ZW5lclRlc3RVdGlscy5zaW1wbGVSZWN0YW5nbGVUZXN0KCAoIGRpc3BsYXksIHJlY3QsIG5vZGUgKSA9PiB7XG4gICAgY29uc3QgbGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAnbXlMaXN0ZW5lcicgKSxcbiAgICAgIHRyYW5zbGF0ZU5vZGU6IHRydWUsXG4gICAgICBhcHBseU9mZnNldDogZmFsc2VcbiAgICB9ICk7XG4gICAgcmVjdC5hZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApO1xuXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZURvd24oIGRpc3BsYXksIDEwLCAxMCApO1xuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlTW92ZSggZGlzcGxheSwgMjAsIDE1ICk7XG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VVcCggZGlzcGxheSwgMjAsIDE1ICk7XG4gICAgYXNzZXJ0LmVxdWFsKCByZWN0LngsIDIwLCAnRHJhZyBzaG91bGQgcGxhY2UgdGhlIHJlY3Qgd2l0aCBpdHMgb3JpZ2luIGF0IHRoZSBsYXN0IG1vdXNlIHBvc2l0aW9uICh4KScgKTtcbiAgICBhc3NlcnQuZXF1YWwoIHJlY3QueSwgMTUsICdEcmFnIHNob3VsZCBwbGFjZSB0aGUgcmVjdCB3aXRoIGl0cyBvcmlnaW4gYXQgdGhlIGxhc3QgbW91c2UgcG9zaXRpb24gKHkpJyApO1xuICAgIGxpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgfSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAndHJhbnNsYXRlTm9kZSB3aXRoIHRyYWNrQW5jZXN0b3JzJywgYXNzZXJ0ID0+IHtcbiAgTGlzdGVuZXJUZXN0VXRpbHMuc2ltcGxlUmVjdGFuZ2xlVGVzdCggKCBkaXNwbGF5LCByZWN0LCBub2RlICkgPT4ge1xuICAgIGNvbnN0IGxpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ215TGlzdGVuZXInICksXG4gICAgICB0cmFuc2xhdGVOb2RlOiB0cnVlLFxuICAgICAgdHJhY2tBbmNlc3RvcnM6IHRydWVcbiAgICB9ICk7XG4gICAgcmVjdC5hZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApO1xuXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZURvd24oIGRpc3BsYXksIDEwLCAxMCApO1xuICAgIG5vZGUueCA9IDU7XG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAyMCwgMTUgKTtcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZVVwKCBkaXNwbGF5LCAyMCwgMTUgKTtcbiAgICBhc3NlcnQuZXF1YWwoIHJlY3QueCwgNSwgJ1RoZSB4IHNoaWZ0IG9mIDEwIG9uIHRoZSBiYXNlIG5vZGUgd2lsbCBoYXZlIHdpcGVkIG91dCBoYWxmIG9mIHRoZSBkcmFnIGNoYW5nZScgKTtcbiAgICBhc3NlcnQuZXF1YWwoIHJlY3QueSwgNSwgJ05vIHkgbW92ZW1lbnQgb2NjdXJyZWQgb2YgdGhlIGJhc2Ugbm9kZScgKTtcbiAgICBsaXN0ZW5lci5kaXNwb3NlKCk7XG4gIH0gKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3Bvc2l0aW9uUHJvcGVydHkgd2l0aCBob29rcycsIGFzc2VydCA9PiB7XG4gIExpc3RlbmVyVGVzdFV0aWxzLnNpbXBsZVJlY3RhbmdsZVRlc3QoICggZGlzcGxheSwgcmVjdCwgbm9kZSApID0+IHtcbiAgICBjb25zdCBwb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPICk7XG4gICAgcG9zaXRpb25Qcm9wZXJ0eS5saW5rQXR0cmlidXRlKCByZWN0LCAndHJhbnNsYXRpb24nICk7XG5cbiAgICBjb25zdCBsaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICdteUxpc3RlbmVyJyApLFxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogcG9zaXRpb25Qcm9wZXJ0eVxuICAgIH0gKTtcbiAgICByZWN0LmFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyICk7XG5cbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDEwLCAxMCApO1xuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlRG93biggZGlzcGxheSwgMTAsIDEwICk7XG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAyMCwgMTUgKTtcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZVVwKCBkaXNwbGF5LCAyMCwgMTUgKTtcbiAgICBhc3NlcnQuZXF1YWwoIHBvc2l0aW9uUHJvcGVydHkudmFsdWUueCwgMTAsICdEcmFnIHdpdGggdHJhbnNsYXRlTm9kZSBzaG91bGQgaGF2ZSBjaGFuZ2VkIHRoZSB4IHRyYW5zbGF0aW9uJyApO1xuICAgIGFzc2VydC5lcXVhbCggcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55LCA1LCAnRHJhZyB3aXRoIHRyYW5zbGF0ZU5vZGUgc2hvdWxkIGhhdmUgY2hhbmdlZCB0aGUgeSB0cmFuc2xhdGlvbicgKTtcbiAgICBsaXN0ZW5lci5kaXNwb3NlKCk7XG4gIH0gKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3Bvc2l0aW9uUHJvcGVydHkgd2l0aCBob29rcyBhbmQgdHJhbnNmb3JtJywgYXNzZXJ0ID0+IHtcbiAgTGlzdGVuZXJUZXN0VXRpbHMuc2ltcGxlUmVjdGFuZ2xlVGVzdCggKCBkaXNwbGF5LCByZWN0LCBub2RlICkgPT4ge1xuICAgIGNvbnN0IHBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8gKTtcbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBuZXcgVHJhbnNmb3JtMyggTWF0cml4My50cmFuc2xhdGlvbiggNSwgMyApLnRpbWVzTWF0cml4KCBNYXRyaXgzLnNjYWxlKCAyICkgKS50aW1lc01hdHJpeCggTWF0cml4My5yb3RhdGlvbjIoIE1hdGguUEkgLyA0ICkgKSApO1xuXG4gICAgLy8gU3RhcnRzIGF0IDUsM1xuICAgIHBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xuICAgICAgcmVjdC50cmFuc2xhdGlvbiA9IHRyYW5zZm9ybS50cmFuc2Zvcm1Qb3NpdGlvbjIoIHBvc2l0aW9uICk7XG4gICAgfSApO1xuXG4gICAgY29uc3QgbGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAnbXlMaXN0ZW5lcicgKSxcbiAgICAgIHBvc2l0aW9uUHJvcGVydHk6IHBvc2l0aW9uUHJvcGVydHksXG4gICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybVxuICAgIH0gKTtcbiAgICByZWN0LmFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyICk7XG5cbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDEwLCAxMCApO1xuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlRG93biggZGlzcGxheSwgMTAsIDEwICk7XG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAyMCwgMTUgKTtcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZVVwKCBkaXNwbGF5LCAyMCwgMTUgKTtcbiAgICBhc3NlcnQuZXF1YWwoIFV0aWxzLnJvdW5kU3ltbWV0cmljKCByZWN0LnggKSwgMTUsICdbeF0gU3RhcnRlZCBhdCA1LCBtb3ZlZCBieSAxMCcgKTtcbiAgICBhc3NlcnQuZXF1YWwoIFV0aWxzLnJvdW5kU3ltbWV0cmljKCByZWN0LnkgKSwgOCwgJ1t5XSBTdGFydGVkIGF0IDMsIG1vdmVkIGJ5IDUnICk7XG4gICAgbGlzdGVuZXIuZGlzcG9zZSgpO1xuICB9ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdwb3NpdGlvblByb3BlcnR5IHdpdGggZHJhZ0JvdW5kcycsIGFzc2VydCA9PiB7XG4gIExpc3RlbmVyVGVzdFV0aWxzLnNpbXBsZVJlY3RhbmdsZVRlc3QoICggZGlzcGxheSwgcmVjdCwgbm9kZSApID0+IHtcbiAgICBjb25zdCBwb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPICk7XG5cbiAgICBwb3NpdGlvblByb3BlcnR5LmxpbmsoIHBvc2l0aW9uID0+IHtcbiAgICAgIHJlY3QudHJhbnNsYXRpb24gPSBwb3NpdGlvbjtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBsaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICdteUxpc3RlbmVyJyApLFxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogcG9zaXRpb25Qcm9wZXJ0eSxcbiAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBuZXcgQm91bmRzMiggMCwgMCwgNSwgNSApIClcbiAgICB9ICk7XG4gICAgcmVjdC5hZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApO1xuXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZURvd24oIGRpc3BsYXksIDEwLCAxMCApO1xuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlTW92ZSggZGlzcGxheSwgNTAsIDMwICk7XG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VVcCggZGlzcGxheSwgNTAsIDMwICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBwb3NpdGlvblByb3BlcnR5LnZhbHVlLngsIDUsICdbeF0gU2hvdWxkIGJlIGxpbWl0ZWQgdG8gNSBieSBkcmFnQm91bmRzJyApO1xuICAgIGFzc2VydC5lcXVhbCggcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55LCA1LCAnW3ldIFNob3VsZCBiZSBsaW1pdGVkIHRvIDUgYnkgZHJhZ0JvdW5kcyAgJyApO1xuICAgIGxpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgfSApO1xufSApOyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJNYXRyaXgzIiwiVHJhbnNmb3JtMyIsIlV0aWxzIiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIlRhbmRlbSIsIkRyYWdMaXN0ZW5lciIsIkxpc3RlbmVyVGVzdFV0aWxzIiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwic2ltcGxlUmVjdGFuZ2xlVGVzdCIsImRpc3BsYXkiLCJyZWN0Iiwibm9kZSIsImxpc3RlbmVyIiwidGFuZGVtIiwiUk9PVF9URVNUIiwiY3JlYXRlVGFuZGVtIiwidHJhbnNsYXRlTm9kZSIsImFkZElucHV0TGlzdGVuZXIiLCJtb3VzZU1vdmUiLCJtb3VzZURvd24iLCJtb3VzZVVwIiwiZXF1YWwiLCJ4IiwieSIsImRpc3Bvc2UiLCJhcHBseU9mZnNldCIsInRyYWNrQW5jZXN0b3JzIiwicG9zaXRpb25Qcm9wZXJ0eSIsIlpFUk8iLCJsaW5rQXR0cmlidXRlIiwidmFsdWUiLCJ0cmFuc2Zvcm0iLCJ0cmFuc2xhdGlvbiIsInRpbWVzTWF0cml4Iiwic2NhbGUiLCJyb3RhdGlvbjIiLCJNYXRoIiwiUEkiLCJsaW5rIiwicG9zaXRpb24iLCJ0cmFuc2Zvcm1Qb3NpdGlvbjIiLCJyb3VuZFN5bW1ldHJpYyIsImRyYWdCb3VuZHNQcm9wZXJ0eSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxjQUFjLCtCQUErQjtBQUNwRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxnQkFBZ0IsZ0NBQWdDO0FBQ3ZELE9BQU9DLFdBQVcsMkJBQTJCO0FBQzdDLE9BQU9DLGFBQWEsNkJBQTZCO0FBQ2pELE9BQU9DLHFCQUFxQixxQ0FBcUM7QUFDakUsT0FBT0MsWUFBWSwrQkFBK0I7QUFDbEQsT0FBT0Msa0JBQWtCLG9CQUFvQjtBQUM3QyxPQUFPQyx1QkFBdUIseUJBQXlCO0FBRXZEQyxNQUFNQyxNQUFNLENBQUU7QUFFZEQsTUFBTUUsSUFBSSxD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