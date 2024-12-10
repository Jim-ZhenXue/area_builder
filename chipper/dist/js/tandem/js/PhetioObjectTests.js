// Copyright 2017-2023, University of Colorado Boulder
/**
 * Unit tests for PhetioObject
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import PhetioObject from './PhetioObject.js';
import Tandem from './Tandem.js';
import IOType from './types/IOType.js';
QUnit.module('PhetioObject');
const MockTypeIO = new IOType('MockTypeIO', {
    isValidValue: ()=>true,
    documentation: 'mock type',
    events: [
        'hello'
    ]
});
QUnit.test('PhetioObject start/start', (assert)=>{
    assert.ok(true, 'initial test');
    const obj = new PhetioObject({
        tandem: Tandem.ROOT_TEST,
        phetioType: MockTypeIO,
        phetioState: false
    });
    obj.phetioStartEvent('hello');
});
QUnit.test('PhetioObject start/end', (assert)=>{
    assert.ok(true, 'initial test');
    const obj = new PhetioObject({
        tandem: Tandem.ROOT_TEST.createTandem('test1'),
        phetioType: MockTypeIO,
        phetioState: false
    });
    obj.phetioStartEvent('hello');
    obj.phetioEndEvent();
});
QUnit.test('PhetioObject end without start', (assert)=>{
    assert.ok(true, 'initial test');
    const obj = new PhetioObject({
        tandem: Tandem.ROOT_TEST.createTandem('test2'),
        phetioType: MockTypeIO,
        phetioState: false
    });
    if (Tandem.PHET_IO_ENABLED) {
        window.assert && assert.throws(()=>{
            obj.phetioEndEvent();
        }, 'Should throw an assertion error when Ending an unstarted event');
    }
});
QUnit.test('PhetioObject is a Disposable', (assert)=>{
    const object1 = new PhetioObject();
    assert.ok(!!object1.disposeEmitter, 'disposeEmitter needed');
    const object2 = new PhetioObject();
    object1.disposeEmitter.addListener(()=>object2.dispose());
    assert.ok(!object1.isDisposed, '1 is not disposed');
    assert.ok(!object2.isDisposed, '2 is not disposed');
    object1.dispose();
    assert.ok(object1.isDisposed, '1 is disposed');
    assert.ok(object2.isDisposed, '2 is disposed');
    const object3 = new PhetioObject({
        isDisposable: false
    });
    const object4 = new PhetioObject();
    object4['initializePhetioObject']({}, {
        isDisposable: false
    });
    if (window.assert) {
        assert.throws(()=>object3.dispose(), 'should throw if isDisposable is false1');
        assert.throws(()=>object4.dispose(), 'should throw if isDisposable is false2');
    }
});
Tandem.PHET_IO_ENABLED && QUnit.test('no calling addLinkedElement before instrumentation', (assert)=>{
    assert.ok(true, 'always run one test');
    const obj = new PhetioObject();
    obj.addLinkedElement(new PhetioObject());
    window.assert && assert.throws(()=>{
        obj['initializePhetioObject']({}, {
            tandem: Tandem.ROOT_TEST.createTandem('myObject')
        });
    }, 'Should throw an assertion because you should not link elements before instrumentation');
});
if (Tandem.PHET_IO_ENABLED) {
    QUnit.test('archetype bugginess when Tandem is not launched yet', (assert)=>{
        // reset Tandem launch status to make sure that nothing goes through to phetioEngine in this test until launched again.
        Tandem.unlaunch();
        assert.ok(true, 'initial test');
        const object1Tandem = Tandem.ROOT_TEST.createTandem('object1');
        const phetioObject1 = new PhetioObject({
            tandem: object1Tandem
        });
        assert.ok(!phetioObject1.phetioIsArchetype, 'should not be an archetype before marking');
        const phetioObject1Child = new PhetioObject({
            tandem: object1Tandem.createTandem('child')
        });
        phetioObject1.markDynamicElementArchetype();
        assert.ok(phetioObject1.phetioIsArchetype, 'should be an archetype after marking');
        // This should actually automatically take effect when we hit markDynamicElementArchetype!
        assert.ok(phetioObject1Child.phetioIsArchetype, 'should look in the tandem buffered elements when it is not in the map');
        // launch to make sure tandem registration fires listeners
        Tandem.launch();
        assert.ok(phetioObject1.phetioIsArchetype, 'phetioIsArchetype should not have changed after launching');
        assert.ok(phetioObject1Child.phetioIsArchetype, 'phetioIsArchetype should not have changed after launching for child');
    });
    // isDynamicElement is not set in phet brand
    QUnit.test('PhetioObject.isDynamicElement', (assert)=>{
        const test1 = Tandem.ROOT_TEST.createTandem('test1');
        const parentTandem = test1.createTandem('parent');
        const child1Tandem = parentTandem.createTandem('child1');
        const child2Tandem = parentTandem.createTandem('child2');
        const child1 = new PhetioObject({
            tandem: child1Tandem
        });
        const grandChild1 = new PhetioObject({
            tandem: child1Tandem.createTandem('grandChild')
        });
        assert.ok(!child1.phetioDynamicElement, 'direct child not dynamic before parent created');
        assert.ok(!grandChild1.phetioDynamicElement, 'grandchild not dynamic before parent created');
        const parent = new PhetioObject({
            tandem: parentTandem,
            phetioDynamicElement: true
        });
        assert.ok(parent.phetioDynamicElement, 'parent should be dynamic when marked dynamic');
        // This will only happen in phet-io brand
        if (Tandem.PHET_IO_ENABLED) {
            assert.ok(child1.phetioDynamicElement, 'direct child before parent creation');
            assert.ok(grandChild1.phetioDynamicElement, 'descendant child before parent creation');
            const child2 = new PhetioObject({
                tandem: parentTandem.createTandem('child2')
            });
            const grandChild2 = new PhetioObject({
                tandem: child2Tandem.createTandem('grandChild')
            });
            assert.ok(child2.phetioDynamicElement, 'direct child after parent creation');
            assert.ok(grandChild2.phetioDynamicElement, 'descendant child after parent creation');
            child2.markDynamicElementArchetype();
            assert.ok(!child2.phetioDynamicElement, 'Not dynamic if archetype: direct child after parent creation');
            assert.ok(!grandChild2.phetioDynamicElement, 'Not dynamic if archetype: descendant child after parent creation');
        }
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3RUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBVbml0IHRlc3RzIGZvciBQaGV0aW9PYmplY3RcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi9QaGV0aW9PYmplY3QuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuL1RhbmRlbS5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4vdHlwZXMvSU9UeXBlLmpzJztcblxuUVVuaXQubW9kdWxlKCAnUGhldGlvT2JqZWN0JyApO1xuXG5jb25zdCBNb2NrVHlwZUlPID0gbmV3IElPVHlwZSggJ01vY2tUeXBlSU8nLCB7XG4gIGlzVmFsaWRWYWx1ZTogKCkgPT4gdHJ1ZSxcbiAgZG9jdW1lbnRhdGlvbjogJ21vY2sgdHlwZScsXG4gIGV2ZW50czogWyAnaGVsbG8nIF1cbn0gKTtcblxuUVVuaXQudGVzdCggJ1BoZXRpb09iamVjdCBzdGFydC9zdGFydCcsIGFzc2VydCA9PiB7XG4gIGFzc2VydC5vayggdHJ1ZSwgJ2luaXRpYWwgdGVzdCcgKTtcblxuICBjb25zdCBvYmogPSBuZXcgUGhldGlvT2JqZWN0KCB7XG4gICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULFxuICAgIHBoZXRpb1R5cGU6IE1vY2tUeXBlSU8sXG4gICAgcGhldGlvU3RhdGU6IGZhbHNlXG4gIH0gKTtcbiAgb2JqLnBoZXRpb1N0YXJ0RXZlbnQoICdoZWxsbycgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1BoZXRpb09iamVjdCBzdGFydC9lbmQnLCBhc3NlcnQgPT4ge1xuICBhc3NlcnQub2soIHRydWUsICdpbml0aWFsIHRlc3QnICk7XG5cbiAgY29uc3Qgb2JqID0gbmV3IFBoZXRpb09iamVjdCgge1xuICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICd0ZXN0MScgKSxcbiAgICBwaGV0aW9UeXBlOiBNb2NrVHlwZUlPLFxuICAgIHBoZXRpb1N0YXRlOiBmYWxzZVxuICB9ICk7XG4gIG9iai5waGV0aW9TdGFydEV2ZW50KCAnaGVsbG8nICk7XG4gIG9iai5waGV0aW9FbmRFdmVudCgpO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnUGhldGlvT2JqZWN0IGVuZCB3aXRob3V0IHN0YXJ0JywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnaW5pdGlhbCB0ZXN0JyApO1xuXG4gIGNvbnN0IG9iaiA9IG5ldyBQaGV0aW9PYmplY3QoIHtcbiAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAndGVzdDInICksXG4gICAgcGhldGlvVHlwZTogTW9ja1R5cGVJTyxcbiAgICBwaGV0aW9TdGF0ZTogZmFsc2VcbiAgfSApO1xuXG4gIGlmICggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCApIHtcbiAgICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICAgIG9iai5waGV0aW9FbmRFdmVudCgpO1xuICAgIH0sICdTaG91bGQgdGhyb3cgYW4gYXNzZXJ0aW9uIGVycm9yIHdoZW4gRW5kaW5nIGFuIHVuc3RhcnRlZCBldmVudCcgKTtcbiAgfVxufSApO1xuXG5RVW5pdC50ZXN0KCAnUGhldGlvT2JqZWN0IGlzIGEgRGlzcG9zYWJsZScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IG9iamVjdDEgPSBuZXcgUGhldGlvT2JqZWN0KCk7XG5cbiAgYXNzZXJ0Lm9rKCAhIW9iamVjdDEuZGlzcG9zZUVtaXR0ZXIsICdkaXNwb3NlRW1pdHRlciBuZWVkZWQnICk7XG5cbiAgY29uc3Qgb2JqZWN0MiA9IG5ldyBQaGV0aW9PYmplY3QoKTtcblxuICBvYmplY3QxLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiBvYmplY3QyLmRpc3Bvc2UoKSApO1xuXG4gIGFzc2VydC5vayggIW9iamVjdDEuaXNEaXNwb3NlZCwgJzEgaXMgbm90IGRpc3Bvc2VkJyApO1xuICBhc3NlcnQub2soICFvYmplY3QyLmlzRGlzcG9zZWQsICcyIGlzIG5vdCBkaXNwb3NlZCcgKTtcblxuICBvYmplY3QxLmRpc3Bvc2UoKTtcbiAgYXNzZXJ0Lm9rKCBvYmplY3QxLmlzRGlzcG9zZWQsICcxIGlzIGRpc3Bvc2VkJyApO1xuICBhc3NlcnQub2soIG9iamVjdDIuaXNEaXNwb3NlZCwgJzIgaXMgZGlzcG9zZWQnICk7XG5cbiAgY29uc3Qgb2JqZWN0MyA9IG5ldyBQaGV0aW9PYmplY3QoIHsgaXNEaXNwb3NhYmxlOiBmYWxzZSB9ICk7XG4gIGNvbnN0IG9iamVjdDQgPSBuZXcgUGhldGlvT2JqZWN0KCk7XG4gIG9iamVjdDRbICdpbml0aWFsaXplUGhldGlvT2JqZWN0JyBdKCB7fSwgeyBpc0Rpc3Bvc2FibGU6IGZhbHNlIH0gKTtcblxuICBpZiAoIHdpbmRvdy5hc3NlcnQgKSB7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gb2JqZWN0My5kaXNwb3NlKCksICdzaG91bGQgdGhyb3cgaWYgaXNEaXNwb3NhYmxlIGlzIGZhbHNlMScgKTtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBvYmplY3Q0LmRpc3Bvc2UoKSwgJ3Nob3VsZCB0aHJvdyBpZiBpc0Rpc3Bvc2FibGUgaXMgZmFsc2UyJyApO1xuICB9XG59ICk7XG5cblRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgUVVuaXQudGVzdCggJ25vIGNhbGxpbmcgYWRkTGlua2VkRWxlbWVudCBiZWZvcmUgaW5zdHJ1bWVudGF0aW9uJywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnYWx3YXlzIHJ1biBvbmUgdGVzdCcgKTtcblxuICBjb25zdCBvYmogPSBuZXcgUGhldGlvT2JqZWN0KCk7XG4gIG9iai5hZGRMaW5rZWRFbGVtZW50KCBuZXcgUGhldGlvT2JqZWN0KCkgKTtcblxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICBvYmpbICdpbml0aWFsaXplUGhldGlvT2JqZWN0JyBdKCB7fSwge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ215T2JqZWN0JyApXG4gICAgfSApO1xuICB9LCAnU2hvdWxkIHRocm93IGFuIGFzc2VydGlvbiBiZWNhdXNlIHlvdSBzaG91bGQgbm90IGxpbmsgZWxlbWVudHMgYmVmb3JlIGluc3RydW1lbnRhdGlvbicgKTtcbn0gKTtcblxuaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICkge1xuXG4gIFFVbml0LnRlc3QoICdhcmNoZXR5cGUgYnVnZ2luZXNzIHdoZW4gVGFuZGVtIGlzIG5vdCBsYXVuY2hlZCB5ZXQnLCBhc3NlcnQgPT4ge1xuXG4gICAgLy8gcmVzZXQgVGFuZGVtIGxhdW5jaCBzdGF0dXMgdG8gbWFrZSBzdXJlIHRoYXQgbm90aGluZyBnb2VzIHRocm91Z2ggdG8gcGhldGlvRW5naW5lIGluIHRoaXMgdGVzdCB1bnRpbCBsYXVuY2hlZCBhZ2Fpbi5cbiAgICBUYW5kZW0udW5sYXVuY2goKTtcblxuICAgIGFzc2VydC5vayggdHJ1ZSwgJ2luaXRpYWwgdGVzdCcgKTtcblxuICAgIGNvbnN0IG9iamVjdDFUYW5kZW0gPSBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ29iamVjdDEnICk7XG4gICAgY29uc3QgcGhldGlvT2JqZWN0MSA9IG5ldyBQaGV0aW9PYmplY3QoIHsgdGFuZGVtOiBvYmplY3QxVGFuZGVtIH0gKTtcbiAgICBhc3NlcnQub2soICFwaGV0aW9PYmplY3QxLnBoZXRpb0lzQXJjaGV0eXBlLCAnc2hvdWxkIG5vdCBiZSBhbiBhcmNoZXR5cGUgYmVmb3JlIG1hcmtpbmcnICk7XG5cbiAgICBjb25zdCBwaGV0aW9PYmplY3QxQ2hpbGQgPSBuZXcgUGhldGlvT2JqZWN0KCB7IHRhbmRlbTogb2JqZWN0MVRhbmRlbS5jcmVhdGVUYW5kZW0oICdjaGlsZCcgKSB9ICk7XG5cbiAgICBwaGV0aW9PYmplY3QxLm1hcmtEeW5hbWljRWxlbWVudEFyY2hldHlwZSgpO1xuXG4gICAgYXNzZXJ0Lm9rKCBwaGV0aW9PYmplY3QxLnBoZXRpb0lzQXJjaGV0eXBlLCAnc2hvdWxkIGJlIGFuIGFyY2hldHlwZSBhZnRlciBtYXJraW5nJyApO1xuXG4gICAgLy8gVGhpcyBzaG91bGQgYWN0dWFsbHkgYXV0b21hdGljYWxseSB0YWtlIGVmZmVjdCB3aGVuIHdlIGhpdCBtYXJrRHluYW1pY0VsZW1lbnRBcmNoZXR5cGUhXG4gICAgYXNzZXJ0Lm9rKCBwaGV0aW9PYmplY3QxQ2hpbGQucGhldGlvSXNBcmNoZXR5cGUsICdzaG91bGQgbG9vayBpbiB0aGUgdGFuZGVtIGJ1ZmZlcmVkIGVsZW1lbnRzIHdoZW4gaXQgaXMgbm90IGluIHRoZSBtYXAnICk7XG5cbiAgICAvLyBsYXVuY2ggdG8gbWFrZSBzdXJlIHRhbmRlbSByZWdpc3RyYXRpb24gZmlyZXMgbGlzdGVuZXJzXG4gICAgVGFuZGVtLmxhdW5jaCgpO1xuXG4gICAgYXNzZXJ0Lm9rKCBwaGV0aW9PYmplY3QxLnBoZXRpb0lzQXJjaGV0eXBlLCAncGhldGlvSXNBcmNoZXR5cGUgc2hvdWxkIG5vdCBoYXZlIGNoYW5nZWQgYWZ0ZXIgbGF1bmNoaW5nJyApO1xuICAgIGFzc2VydC5vayggcGhldGlvT2JqZWN0MUNoaWxkLnBoZXRpb0lzQXJjaGV0eXBlLCAncGhldGlvSXNBcmNoZXR5cGUgc2hvdWxkIG5vdCBoYXZlIGNoYW5nZWQgYWZ0ZXIgbGF1bmNoaW5nIGZvciBjaGlsZCcgKTtcbiAgfSApO1xuXG4gIC8vIGlzRHluYW1pY0VsZW1lbnQgaXMgbm90IHNldCBpbiBwaGV0IGJyYW5kXG4gIFFVbml0LnRlc3QoICdQaGV0aW9PYmplY3QuaXNEeW5hbWljRWxlbWVudCcsIGFzc2VydCA9PiB7XG4gICAgY29uc3QgdGVzdDEgPSBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ3Rlc3QxJyApO1xuICAgIGNvbnN0IHBhcmVudFRhbmRlbSA9IHRlc3QxLmNyZWF0ZVRhbmRlbSggJ3BhcmVudCcgKTtcbiAgICBjb25zdCBjaGlsZDFUYW5kZW0gPSBwYXJlbnRUYW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hpbGQxJyApO1xuICAgIGNvbnN0IGNoaWxkMlRhbmRlbSA9IHBhcmVudFRhbmRlbS5jcmVhdGVUYW5kZW0oICdjaGlsZDInICk7XG4gICAgY29uc3QgY2hpbGQxID0gbmV3IFBoZXRpb09iamVjdCgge1xuICAgICAgdGFuZGVtOiBjaGlsZDFUYW5kZW1cbiAgICB9ICk7XG4gICAgY29uc3QgZ3JhbmRDaGlsZDEgPSBuZXcgUGhldGlvT2JqZWN0KCB7XG4gICAgICB0YW5kZW06IGNoaWxkMVRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmFuZENoaWxkJyApXG4gICAgfSApO1xuICAgIGFzc2VydC5vayggIWNoaWxkMS5waGV0aW9EeW5hbWljRWxlbWVudCwgJ2RpcmVjdCBjaGlsZCBub3QgZHluYW1pYyBiZWZvcmUgcGFyZW50IGNyZWF0ZWQnICk7XG4gICAgYXNzZXJ0Lm9rKCAhZ3JhbmRDaGlsZDEucGhldGlvRHluYW1pY0VsZW1lbnQsICdncmFuZGNoaWxkIG5vdCBkeW5hbWljIGJlZm9yZSBwYXJlbnQgY3JlYXRlZCcgKTtcblxuICAgIGNvbnN0IHBhcmVudCA9IG5ldyBQaGV0aW9PYmplY3QoIHtcbiAgICAgIHRhbmRlbTogcGFyZW50VGFuZGVtLFxuICAgICAgcGhldGlvRHluYW1pY0VsZW1lbnQ6IHRydWVcbiAgICB9ICk7XG4gICAgYXNzZXJ0Lm9rKCBwYXJlbnQucGhldGlvRHluYW1pY0VsZW1lbnQsICdwYXJlbnQgc2hvdWxkIGJlIGR5bmFtaWMgd2hlbiBtYXJrZWQgZHluYW1pYycgKTtcblxuICAgIC8vIFRoaXMgd2lsbCBvbmx5IGhhcHBlbiBpbiBwaGV0LWlvIGJyYW5kXG4gICAgaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICkge1xuXG4gICAgICBhc3NlcnQub2soIGNoaWxkMS5waGV0aW9EeW5hbWljRWxlbWVudCwgJ2RpcmVjdCBjaGlsZCBiZWZvcmUgcGFyZW50IGNyZWF0aW9uJyApO1xuICAgICAgYXNzZXJ0Lm9rKCBncmFuZENoaWxkMS5waGV0aW9EeW5hbWljRWxlbWVudCwgJ2Rlc2NlbmRhbnQgY2hpbGQgYmVmb3JlIHBhcmVudCBjcmVhdGlvbicgKTtcblxuICAgICAgY29uc3QgY2hpbGQyID0gbmV3IFBoZXRpb09iamVjdCgge1xuICAgICAgICB0YW5kZW06IHBhcmVudFRhbmRlbS5jcmVhdGVUYW5kZW0oICdjaGlsZDInIClcbiAgICAgIH0gKTtcblxuICAgICAgY29uc3QgZ3JhbmRDaGlsZDIgPSBuZXcgUGhldGlvT2JqZWN0KCB7XG4gICAgICAgIHRhbmRlbTogY2hpbGQyVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyYW5kQ2hpbGQnIClcbiAgICAgIH0gKTtcblxuICAgICAgYXNzZXJ0Lm9rKCBjaGlsZDIucGhldGlvRHluYW1pY0VsZW1lbnQsICdkaXJlY3QgY2hpbGQgYWZ0ZXIgcGFyZW50IGNyZWF0aW9uJyApO1xuICAgICAgYXNzZXJ0Lm9rKCBncmFuZENoaWxkMi5waGV0aW9EeW5hbWljRWxlbWVudCwgJ2Rlc2NlbmRhbnQgY2hpbGQgYWZ0ZXIgcGFyZW50IGNyZWF0aW9uJyApO1xuXG4gICAgICBjaGlsZDIubWFya0R5bmFtaWNFbGVtZW50QXJjaGV0eXBlKCk7XG5cbiAgICAgIGFzc2VydC5vayggIWNoaWxkMi5waGV0aW9EeW5hbWljRWxlbWVudCwgJ05vdCBkeW5hbWljIGlmIGFyY2hldHlwZTogZGlyZWN0IGNoaWxkIGFmdGVyIHBhcmVudCBjcmVhdGlvbicgKTtcbiAgICAgIGFzc2VydC5vayggIWdyYW5kQ2hpbGQyLnBoZXRpb0R5bmFtaWNFbGVtZW50LCAnTm90IGR5bmFtaWMgaWYgYXJjaGV0eXBlOiBkZXNjZW5kYW50IGNoaWxkIGFmdGVyIHBhcmVudCBjcmVhdGlvbicgKTtcbiAgICB9XG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiSU9UeXBlIiwiUVVuaXQiLCJtb2R1bGUiLCJNb2NrVHlwZUlPIiwiaXNWYWxpZFZhbHVlIiwiZG9jdW1lbnRhdGlvbiIsImV2ZW50cyIsInRlc3QiLCJhc3NlcnQiLCJvayIsIm9iaiIsInRhbmRlbSIsIlJPT1RfVEVTVCIsInBoZXRpb1R5cGUiLCJwaGV0aW9TdGF0ZSIsInBoZXRpb1N0YXJ0RXZlbnQiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9FbmRFdmVudCIsIlBIRVRfSU9fRU5BQkxFRCIsIndpbmRvdyIsInRocm93cyIsIm9iamVjdDEiLCJkaXNwb3NlRW1pdHRlciIsIm9iamVjdDIiLCJhZGRMaXN0ZW5lciIsImRpc3Bvc2UiLCJpc0Rpc3Bvc2VkIiwib2JqZWN0MyIsImlzRGlzcG9zYWJsZSIsIm9iamVjdDQiLCJhZGRMaW5rZWRFbGVtZW50IiwidW5sYXVuY2giLCJvYmplY3QxVGFuZGVtIiwicGhldGlvT2JqZWN0MSIsInBoZXRpb0lzQXJjaGV0eXBlIiwicGhldGlvT2JqZWN0MUNoaWxkIiwibWFya0R5bmFtaWNFbGVtZW50QXJjaGV0eXBlIiwibGF1bmNoIiwidGVzdDEiLCJwYXJlbnRUYW5kZW0iLCJjaGlsZDFUYW5kZW0iLCJjaGlsZDJUYW5kZW0iLCJjaGlsZDEiLCJncmFuZENoaWxkMSIsInBoZXRpb0R5bmFtaWNFbGVtZW50IiwicGFyZW50IiwiY2hpbGQyIiwiZ3JhbmRDaGlsZDIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0Esa0JBQWtCLG9CQUFvQjtBQUM3QyxPQUFPQyxZQUFZLGNBQWM7QUFDakMsT0FBT0MsWUFBWSxvQkFBb0I7QUFFdkNDLE1BQU1DLE1BQU0sQ0FBRTtBQUVkLE1BQU1DLGFBQWEsSUFBSUgsT0FBUSxjQUFjO0lBQzNDSSxjQUFjLElBQU07SUFDcEJDLGVBQWU7SUFDZkMsUUFBUTtRQUFFO0tBQVM7QUFDckI7QUFFQUwsTUFBTU0sSUFB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