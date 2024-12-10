// Copyright 2022-2024, University of Colorado Boulder
/**
 * QUnit tests for Disposable
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import Disposable from './Disposable.js';
QUnit.module('Disposable');
QUnit.test('Disposable basics', (assert)=>{
    assert.ok(true, 'initial test');
    let MyDisposable = class MyDisposable extends Disposable {
        constructor(){
            super();
        }
    };
    const object1 = new MyDisposable();
    assert.ok(!!object1.disposeEmitter, 'disposeEmitter needed');
    const object2 = new MyDisposable();
    object1.disposeEmitter.addListener(()=>object2.dispose());
    assert.ok(!object1.isDisposed, '1 is not disposed');
    assert.ok(!object2.isDisposed, '2 is not disposed');
    object1.dispose();
    assert.ok(object1.isDisposed, '1 is disposed');
    assert.ok(object2.isDisposed, '2 is disposed');
    // @ts-expect-error isDisposed is not on TEmitter, but should be in place if assertions are enabled
    window.assert && assert.ok(object1.disposeEmitter.isDisposed, 'disposeEmitter should be disposed too');
});
QUnit.test('Disposable.isDisposable', (assert)=>{
    assert.ok(true, 'when assertions are not enabled');
    let MyDisposable = class MyDisposable extends Disposable {
        constructor(options){
            super(options);
        }
    };
    const object1 = new MyDisposable({
        isDisposable: true
    });
    const object2 = new MyDisposable();
    object1.dispose();
    object2.dispose();
    const object3 = new MyDisposable({
        isDisposable: false
    });
    const object4 = new MyDisposable();
    object4.isDisposable = false;
    if (window.assert) {
        assert.throws(()=>object3.dispose(), 'should throw if isDisposable is false1');
        assert.throws(()=>object4.dispose(), 'should throw if isDisposable is false2');
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvRGlzcG9zYWJsZVRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFFVbml0IHRlc3RzIGZvciBEaXNwb3NhYmxlXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBEaXNwb3NhYmxlLCB7IERpc3Bvc2FibGVPcHRpb25zIH0gZnJvbSAnLi9EaXNwb3NhYmxlLmpzJztcblxuUVVuaXQubW9kdWxlKCAnRGlzcG9zYWJsZScgKTtcblxuUVVuaXQudGVzdCggJ0Rpc3Bvc2FibGUgYmFzaWNzJywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnaW5pdGlhbCB0ZXN0JyApO1xuXG4gIGNsYXNzIE15RGlzcG9zYWJsZSBleHRlbmRzIERpc3Bvc2FibGUge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoKTt9XG4gIH1cblxuICBjb25zdCBvYmplY3QxID0gbmV3IE15RGlzcG9zYWJsZSgpO1xuICBhc3NlcnQub2soICEhb2JqZWN0MS5kaXNwb3NlRW1pdHRlciwgJ2Rpc3Bvc2VFbWl0dGVyIG5lZWRlZCcgKTtcbiAgY29uc3Qgb2JqZWN0MiA9IG5ldyBNeURpc3Bvc2FibGUoKTtcbiAgb2JqZWN0MS5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gb2JqZWN0Mi5kaXNwb3NlKCkgKTtcblxuICBhc3NlcnQub2soICFvYmplY3QxLmlzRGlzcG9zZWQsICcxIGlzIG5vdCBkaXNwb3NlZCcgKTtcbiAgYXNzZXJ0Lm9rKCAhb2JqZWN0Mi5pc0Rpc3Bvc2VkLCAnMiBpcyBub3QgZGlzcG9zZWQnICk7XG5cbiAgb2JqZWN0MS5kaXNwb3NlKCk7XG4gIGFzc2VydC5vayggb2JqZWN0MS5pc0Rpc3Bvc2VkLCAnMSBpcyBkaXNwb3NlZCcgKTtcbiAgYXNzZXJ0Lm9rKCBvYmplY3QyLmlzRGlzcG9zZWQsICcyIGlzIGRpc3Bvc2VkJyApO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgaXNEaXNwb3NlZCBpcyBub3Qgb24gVEVtaXR0ZXIsIGJ1dCBzaG91bGQgYmUgaW4gcGxhY2UgaWYgYXNzZXJ0aW9ucyBhcmUgZW5hYmxlZFxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC5vayggb2JqZWN0MS5kaXNwb3NlRW1pdHRlci5pc0Rpc3Bvc2VkLCAnZGlzcG9zZUVtaXR0ZXIgc2hvdWxkIGJlIGRpc3Bvc2VkIHRvbycgKTtcbn0gKTtcblxuXG5RVW5pdC50ZXN0KCAnRGlzcG9zYWJsZS5pc0Rpc3Bvc2FibGUnLCBhc3NlcnQgPT4ge1xuICBhc3NlcnQub2soIHRydWUsICd3aGVuIGFzc2VydGlvbnMgYXJlIG5vdCBlbmFibGVkJyApO1xuXG4gIGNsYXNzIE15RGlzcG9zYWJsZSBleHRlbmRzIERpc3Bvc2FibGUge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9ucz86IERpc3Bvc2FibGVPcHRpb25zICkge3N1cGVyKCBvcHRpb25zICk7fVxuICB9XG5cbiAgY29uc3Qgb2JqZWN0MSA9IG5ldyBNeURpc3Bvc2FibGUoIHtcbiAgICBpc0Rpc3Bvc2FibGU6IHRydWVcbiAgfSApO1xuICBjb25zdCBvYmplY3QyID0gbmV3IE15RGlzcG9zYWJsZSgpO1xuXG4gIG9iamVjdDEuZGlzcG9zZSgpO1xuICBvYmplY3QyLmRpc3Bvc2UoKTtcblxuICBjb25zdCBvYmplY3QzID0gbmV3IE15RGlzcG9zYWJsZSgge1xuICAgIGlzRGlzcG9zYWJsZTogZmFsc2VcbiAgfSApO1xuICBjb25zdCBvYmplY3Q0ID0gbmV3IE15RGlzcG9zYWJsZSgpO1xuICBvYmplY3Q0LmlzRGlzcG9zYWJsZSA9IGZhbHNlO1xuXG4gIGlmICggd2luZG93LmFzc2VydCApIHtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBvYmplY3QzLmRpc3Bvc2UoKSwgJ3Nob3VsZCB0aHJvdyBpZiBpc0Rpc3Bvc2FibGUgaXMgZmFsc2UxJyApO1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG9iamVjdDQuZGlzcG9zZSgpLCAnc2hvdWxkIHRocm93IGlmIGlzRGlzcG9zYWJsZSBpcyBmYWxzZTInICk7XG4gIH1cbn0gKTsiXSwibmFtZXMiOlsiRGlzcG9zYWJsZSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIm9rIiwiTXlEaXNwb3NhYmxlIiwib2JqZWN0MSIsImRpc3Bvc2VFbWl0dGVyIiwib2JqZWN0MiIsImFkZExpc3RlbmVyIiwiZGlzcG9zZSIsImlzRGlzcG9zZWQiLCJ3aW5kb3ciLCJvcHRpb25zIiwiaXNEaXNwb3NhYmxlIiwib2JqZWN0MyIsIm9iamVjdDQiLCJ0aHJvd3MiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsZ0JBQXVDLGtCQUFrQjtBQUVoRUMsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSxxQkFBcUJDLENBQUFBO0lBQy9CQSxPQUFPQyxFQUFFLENBQUUsTUFBTTtJQUVqQixJQUFBLEFBQU1DLGVBQU4sTUFBTUEscUJBQXFCTjtRQUN6QixhQUFxQjtZQUFFLEtBQUs7UUFBRztJQUNqQztJQUVBLE1BQU1PLFVBQVUsSUFBSUQ7SUFDcEJGLE9BQU9DLEVBQUUsQ0FBRSxDQUFDLENBQUNFLFFBQVFDLGNBQWMsRUFBRTtJQUNyQyxNQUFNQyxVQUFVLElBQUlIO0lBQ3BCQyxRQUFRQyxjQUFjLENBQUNFLFdBQVcsQ0FBRSxJQUFNRCxRQUFRRSxPQUFPO0lBRXpEUCxPQUFPQyxFQUFFLENBQUUsQ0FBQ0UsUUFBUUssVUFBVSxFQUFFO0lBQ2hDUixPQUFPQyxFQUFFLENBQUUsQ0FBQ0ksUUFBUUcsVUFBVSxFQUFFO0lBRWhDTCxRQUFRSSxPQUFPO0lBQ2ZQLE9BQU9DLEVBQUUsQ0FBRUUsUUFBUUssVUFBVSxFQUFFO0lBQy9CUixPQUFPQyxFQUFFLENBQUVJLFFBQVFHLFVBQVUsRUFBRTtJQUUvQixtR0FBbUc7SUFDbkdDLE9BQU9ULE1BQU0sSUFBSUEsT0FBT0MsRUFBRSxDQUFFRSxRQUFRQyxjQUFjLENBQUNJLFVBQVUsRUFBRTtBQUNqRTtBQUdBWCxNQUFNRSxJQUFJLENBQUUsMkJBQTJCQyxDQUFBQTtJQUNyQ0EsT0FBT0MsRUFBRSxDQUFFLE1BQU07SUFFakIsSUFBQSxBQUFNQyxlQUFOLE1BQU1BLHFCQUFxQk47UUFDekIsWUFBb0JjLE9BQTJCLENBQUc7WUFBQyxLQUFLLENBQUVBO1FBQVU7SUFDdEU7SUFFQSxNQUFNUCxVQUFVLElBQUlELGFBQWM7UUFDaENTLGNBQWM7SUFDaEI7SUFDQSxNQUFNTixVQUFVLElBQUlIO0lBRXBCQyxRQUFRSSxPQUFPO0lBQ2ZGLFFBQVFFLE9BQU87SUFFZixNQUFNSyxVQUFVLElBQUlWLGFBQWM7UUFDaENTLGNBQWM7SUFDaEI7SUFDQSxNQUFNRSxVQUFVLElBQUlYO0lBQ3BCVyxRQUFRRixZQUFZLEdBQUc7SUFFdkIsSUFBS0YsT0FBT1QsTUFBTSxFQUFHO1FBQ25CQSxPQUFPYyxNQUFNLENBQUUsSUFBTUYsUUFBUUwsT0FBTyxJQUFJO1FBQ3hDUCxPQUFPYyxNQUFNLENBQUUsSUFBTUQsUUFBUU4sT0FBTyxJQUFJO0lBQzFDO0FBQ0YifQ==