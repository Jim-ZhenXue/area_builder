// Copyright 2021-2024, University of Colorado Boulder
/**
 * ManualConstraint tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Node from '../../nodes/Node.js';
import Rectangle from '../../nodes/Rectangle.js';
import ManualConstraint from './ManualConstraint.js';
QUnit.module('ManualConstraint');
QUnit.test('Identity', (assert)=>{
    const a = new Rectangle(0, 0, 100, 50, {
        fill: 'red'
    });
    const b = new Rectangle(0, 0, 100, 50, {
        fill: 'blue'
    });
    const aContainer = new Node({
        children: [
            a
        ]
    });
    const bContainer = new Node({
        children: [
            b
        ]
    });
    const root = new Node({
        children: [
            aContainer,
            bContainer
        ]
    });
    ManualConstraint.create(root, [
        a,
        b
    ], (aProxy, bProxy)=>{
        bProxy.left = aProxy.right;
    });
    root.validateBounds();
    assert.equal(b.x, 100, 'x');
    a.x = 100;
    root.validateBounds();
    assert.equal(b.x, 200, 'x after 100');
});
QUnit.test('Translation', (assert)=>{
    const a = new Rectangle(0, 0, 100, 50, {
        fill: 'red'
    });
    const b = new Rectangle(0, 0, 100, 50, {
        fill: 'blue'
    });
    const aContainer = new Node({
        children: [
            a
        ]
    });
    const bContainer = new Node({
        children: [
            b
        ],
        x: 50
    });
    const root = new Node({
        children: [
            aContainer,
            bContainer
        ]
    });
    ManualConstraint.create(root, [
        a,
        b
    ], (aProxy, bProxy)=>{
        bProxy.left = aProxy.right;
    });
    root.validateBounds();
    assert.equal(b.x, 50, 'x');
    a.x = 100;
    root.validateBounds();
    assert.equal(b.x, 150, 'x after 100');
});
QUnit.test('Scale', (assert)=>{
    const a = new Rectangle(0, 0, 100, 50, {
        fill: 'red'
    });
    const b = new Rectangle(0, 0, 100, 50, {
        fill: 'blue'
    });
    const aContainer = new Node({
        children: [
            a
        ],
        scale: 2
    });
    const bContainer = new Node({
        children: [
            b
        ]
    });
    const root = new Node({
        children: [
            aContainer,
            bContainer
        ]
    });
    ManualConstraint.create(root, [
        a,
        b
    ], (aProxy, bProxy)=>{
        bProxy.left = aProxy.right;
    });
    root.validateBounds();
    assert.equal(b.x, 200, 'x');
    a.x = 100;
    root.validateBounds();
    assert.equal(b.x, 400, 'x after 100');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL01hbnVhbENvbnN0cmFpbnRUZXN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBNYW51YWxDb25zdHJhaW50IHRlc3RzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBOb2RlIGZyb20gJy4uLy4uL25vZGVzL05vZGUuanMnO1xuaW1wb3J0IFJlY3RhbmdsZSBmcm9tICcuLi8uLi9ub2Rlcy9SZWN0YW5nbGUuanMnO1xuaW1wb3J0IE1hbnVhbENvbnN0cmFpbnQgZnJvbSAnLi9NYW51YWxDb25zdHJhaW50LmpzJztcblxuUVVuaXQubW9kdWxlKCAnTWFudWFsQ29uc3RyYWludCcgKTtcblxuUVVuaXQudGVzdCggJ0lkZW50aXR5JywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgYSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMCwgNTAsIHsgZmlsbDogJ3JlZCcgfSApO1xuICBjb25zdCBiID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAwLCA1MCwgeyBmaWxsOiAnYmx1ZScgfSApO1xuICBjb25zdCBhQ29udGFpbmVyID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYSBdIH0gKTtcbiAgY29uc3QgYkNvbnRhaW5lciA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGIgXSB9ICk7XG4gIGNvbnN0IHJvb3QgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBhQ29udGFpbmVyLCBiQ29udGFpbmVyIF0gfSApO1xuXG4gIE1hbnVhbENvbnN0cmFpbnQuY3JlYXRlKCByb290LCBbIGEsIGIgXSwgKCBhUHJveHksIGJQcm94eSApID0+IHtcbiAgICBiUHJveHkubGVmdCA9IGFQcm94eS5yaWdodDtcbiAgfSApO1xuXG4gIHJvb3QudmFsaWRhdGVCb3VuZHMoKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLngsIDEwMCwgJ3gnICk7XG5cbiAgYS54ID0gMTAwO1xuXG4gIHJvb3QudmFsaWRhdGVCb3VuZHMoKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLngsIDIwMCwgJ3ggYWZ0ZXIgMTAwJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVHJhbnNsYXRpb24nLCBhc3NlcnQgPT4ge1xuICBjb25zdCBhID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAwLCA1MCwgeyBmaWxsOiAncmVkJyB9ICk7XG4gIGNvbnN0IGIgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxMDAsIDUwLCB7IGZpbGw6ICdibHVlJyB9ICk7XG4gIGNvbnN0IGFDb250YWluZXIgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBhIF0gfSApO1xuICBjb25zdCBiQ29udGFpbmVyID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYiBdLCB4OiA1MCB9ICk7XG4gIGNvbnN0IHJvb3QgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBhQ29udGFpbmVyLCBiQ29udGFpbmVyIF0gfSApO1xuXG4gIE1hbnVhbENvbnN0cmFpbnQuY3JlYXRlKCByb290LCBbIGEsIGIgXSwgKCBhUHJveHksIGJQcm94eSApID0+IHtcbiAgICBiUHJveHkubGVmdCA9IGFQcm94eS5yaWdodDtcbiAgfSApO1xuXG4gIHJvb3QudmFsaWRhdGVCb3VuZHMoKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLngsIDUwLCAneCcgKTtcblxuICBhLnggPSAxMDA7XG5cbiAgcm9vdC52YWxpZGF0ZUJvdW5kcygpO1xuICBhc3NlcnQuZXF1YWwoIGIueCwgMTUwLCAneCBhZnRlciAxMDAnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdTY2FsZScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGEgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxMDAsIDUwLCB7IGZpbGw6ICdyZWQnIH0gKTtcbiAgY29uc3QgYiA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMCwgNTAsIHsgZmlsbDogJ2JsdWUnIH0gKTtcbiAgY29uc3QgYUNvbnRhaW5lciA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGEgXSwgc2NhbGU6IDIgfSApO1xuICBjb25zdCBiQ29udGFpbmVyID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYiBdIH0gKTtcbiAgY29uc3Qgcm9vdCA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGFDb250YWluZXIsIGJDb250YWluZXIgXSB9ICk7XG5cbiAgTWFudWFsQ29uc3RyYWludC5jcmVhdGUoIHJvb3QsIFsgYSwgYiBdLCAoIGFQcm94eSwgYlByb3h5ICkgPT4ge1xuICAgIGJQcm94eS5sZWZ0ID0gYVByb3h5LnJpZ2h0O1xuICB9ICk7XG5cbiAgcm9vdC52YWxpZGF0ZUJvdW5kcygpO1xuICBhc3NlcnQuZXF1YWwoIGIueCwgMjAwLCAneCcgKTtcblxuICBhLnggPSAxMDA7XG5cbiAgcm9vdC52YWxpZGF0ZUJvdW5kcygpO1xuICBhc3NlcnQuZXF1YWwoIGIueCwgNDAwLCAneCBhZnRlciAxMDAnICk7XG59ICk7Il0sIm5hbWVzIjpbIk5vZGUiLCJSZWN0YW5nbGUiLCJNYW51YWxDb25zdHJhaW50IiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0IiwiYSIsImZpbGwiLCJiIiwiYUNvbnRhaW5lciIsImNoaWxkcmVuIiwiYkNvbnRhaW5lciIsInJvb3QiLCJjcmVhdGUiLCJhUHJveHkiLCJiUHJveHkiLCJsZWZ0IiwicmlnaHQiLCJ2YWxpZGF0ZUJvdW5kcyIsImVxdWFsIiwieCIsInNjYWxlIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFVBQVUsc0JBQXNCO0FBQ3ZDLE9BQU9DLGVBQWUsMkJBQTJCO0FBQ2pELE9BQU9DLHNCQUFzQix3QkFBd0I7QUFFckRDLE1BQU1DLE1BQU0sQ0FBRTtBQUVkRCxNQUFNRSxJQUFJLENBQUUsWUFBWUMsQ0FB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