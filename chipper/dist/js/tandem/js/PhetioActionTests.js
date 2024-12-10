// Copyright 2022-2023, University of Colorado Boulder
/**
 * Unit tests for PhetioObject
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import PhetioAction from './PhetioAction.js';
import Tandem from './Tandem.js';
import NumberIO from './types/NumberIO.js';
QUnit.module('PhetioAction');
QUnit.test('PhetioAction execute', (assert)=>{
    let count = 0;
    const invokeActionOnce = ()=>phetioAction.execute(++count);
    const action = (currentCount)=>{
        assert.ok(count === currentCount, 'current count' + count);
        if (currentCount === 1) {
            invokeActionOnce();
        }
    };
    const phetioAction = new PhetioAction(action, {
        parameters: [
            {
                name: 'count',
                phetioType: NumberIO
            }
        ],
        tandem: Tandem.ROOT_TEST.createTandem('phetioAction')
    });
    invokeActionOnce();
    assert.ok(count === 2, 'called twice');
    invokeActionOnce();
    assert.ok(count === 3, 'and once more');
    phetioAction.dispose();
});
QUnit.test('PhetioAction reentrant disposal', (assert)=>{
    let count = 0;
    const invokeActionOnce = ()=>phetioAction.execute(++count);
    // We must call super.dispose() immediately, but we delay disposing the executedEmitter to prevent wonky reentrant behavior.
    const actionDisposedItself = ()=>phetioAction.executedEmitter.isDisposed;
    const action = (currentCount)=>{
        assert.ok(count === currentCount, 'current count' + count);
        if (currentCount === 1) {
            invokeActionOnce();
        } else if (currentCount === 2) {
            invokeActionOnce();
            phetioAction.dispose();
        }
        assert.ok(!actionDisposedItself(), 'should not be disposed until after executing ' + currentCount);
    };
    const phetioAction = new PhetioAction(action, {
        parameters: [
            {
                name: 'count',
                phetioType: NumberIO
            }
        ],
        tandem: Tandem.ROOT_TEST.createTandem('phetioAction')
    });
    // @ts-expect-error INTENTIONAL for testing
    const v = phetioAction.getValidationErrors('hello');
    assert.ok(v.length === 1, 'should have one validation error');
    assert.ok(typeof v[0] === 'string', 'should have correct validation error');
    phetioAction.executedEmitter.addListener((currentCount)=>{
        assert.ok(!actionDisposedItself(), 'should not be disposed until after emitting ' + currentCount);
        assert.ok(count === 3, 'count will always be last because all execute calls come before all emitting ' + currentCount);
    });
    invokeActionOnce();
    assert.ok(count === 3, 'three calls total');
    assert.ok(actionDisposedItself(), 'should now be disposed');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9BY3Rpb25UZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBVbml0IHRlc3RzIGZvciBQaGV0aW9PYmplY3RcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFBoZXRpb0FjdGlvbiBmcm9tICcuL1BoZXRpb0FjdGlvbi5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4vVGFuZGVtLmpzJztcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuL3R5cGVzL051bWJlcklPLmpzJztcblxuUVVuaXQubW9kdWxlKCAnUGhldGlvQWN0aW9uJyApO1xuXG5RVW5pdC50ZXN0KCAnUGhldGlvQWN0aW9uIGV4ZWN1dGUnLCBhc3NlcnQgPT4ge1xuXG4gIGxldCBjb3VudCA9IDA7XG5cbiAgY29uc3QgaW52b2tlQWN0aW9uT25jZSA9ICgpID0+IHBoZXRpb0FjdGlvbi5leGVjdXRlKCArK2NvdW50ICk7XG5cbiAgY29uc3QgYWN0aW9uID0gKCBjdXJyZW50Q291bnQ6IG51bWJlciApID0+IHtcbiAgICBhc3NlcnQub2soIGNvdW50ID09PSBjdXJyZW50Q291bnQsICdjdXJyZW50IGNvdW50JyArIGNvdW50ICk7XG5cbiAgICBpZiAoIGN1cnJlbnRDb3VudCA9PT0gMSApIHtcbiAgICAgIGludm9rZUFjdGlvbk9uY2UoKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IHBoZXRpb0FjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb248WyBudW1iZXIgXT4oIGFjdGlvbiwge1xuICAgIHBhcmFtZXRlcnM6IFsgeyBuYW1lOiAnY291bnQnLCBwaGV0aW9UeXBlOiBOdW1iZXJJTyB9IF0sXG4gICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ3BoZXRpb0FjdGlvbicgKVxuICB9ICk7XG5cbiAgaW52b2tlQWN0aW9uT25jZSgpO1xuICBhc3NlcnQub2soIGNvdW50ID09PSAyLCAnY2FsbGVkIHR3aWNlJyApO1xuICBpbnZva2VBY3Rpb25PbmNlKCk7XG4gIGFzc2VydC5vayggY291bnQgPT09IDMsICdhbmQgb25jZSBtb3JlJyApO1xuXG4gIHBoZXRpb0FjdGlvbi5kaXNwb3NlKCk7XG59ICk7XG5cblFVbml0LnRlc3QoICdQaGV0aW9BY3Rpb24gcmVlbnRyYW50IGRpc3Bvc2FsJywgYXNzZXJ0ID0+IHtcblxuICBsZXQgY291bnQgPSAwO1xuXG4gIGNvbnN0IGludm9rZUFjdGlvbk9uY2UgPSAoKSA9PiBwaGV0aW9BY3Rpb24uZXhlY3V0ZSggKytjb3VudCApO1xuXG4gIC8vIFdlIG11c3QgY2FsbCBzdXBlci5kaXNwb3NlKCkgaW1tZWRpYXRlbHksIGJ1dCB3ZSBkZWxheSBkaXNwb3NpbmcgdGhlIGV4ZWN1dGVkRW1pdHRlciB0byBwcmV2ZW50IHdvbmt5IHJlZW50cmFudCBiZWhhdmlvci5cbiAgY29uc3QgYWN0aW9uRGlzcG9zZWRJdHNlbGYgPSAoKSA9PiBwaGV0aW9BY3Rpb24uZXhlY3V0ZWRFbWl0dGVyLmlzRGlzcG9zZWQ7XG5cbiAgY29uc3QgYWN0aW9uID0gKCBjdXJyZW50Q291bnQ6IG51bWJlciApID0+IHtcbiAgICBhc3NlcnQub2soIGNvdW50ID09PSBjdXJyZW50Q291bnQsICdjdXJyZW50IGNvdW50JyArIGNvdW50ICk7XG5cbiAgICBpZiAoIGN1cnJlbnRDb3VudCA9PT0gMSApIHtcbiAgICAgIGludm9rZUFjdGlvbk9uY2UoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGN1cnJlbnRDb3VudCA9PT0gMiApIHtcbiAgICAgIGludm9rZUFjdGlvbk9uY2UoKTtcbiAgICAgIHBoZXRpb0FjdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGFzc2VydC5vayggIWFjdGlvbkRpc3Bvc2VkSXRzZWxmKCksICdzaG91bGQgbm90IGJlIGRpc3Bvc2VkIHVudGlsIGFmdGVyIGV4ZWN1dGluZyAnICsgY3VycmVudENvdW50ICk7XG4gIH07XG4gIGNvbnN0IHBoZXRpb0FjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb248WyBudW1iZXIgXT4oIGFjdGlvbiwge1xuICAgIHBhcmFtZXRlcnM6IFsgeyBuYW1lOiAnY291bnQnLCBwaGV0aW9UeXBlOiBOdW1iZXJJTyB9IF0sXG4gICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ3BoZXRpb0FjdGlvbicgKVxuICB9ICk7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBJTlRFTlRJT05BTCBmb3IgdGVzdGluZ1xuICBjb25zdCB2ID0gcGhldGlvQWN0aW9uLmdldFZhbGlkYXRpb25FcnJvcnMoICdoZWxsbycgKTtcbiAgYXNzZXJ0Lm9rKCB2Lmxlbmd0aCA9PT0gMSwgJ3Nob3VsZCBoYXZlIG9uZSB2YWxpZGF0aW9uIGVycm9yJyApO1xuICBhc3NlcnQub2soIHR5cGVvZiB2WyAwIF0gPT09ICdzdHJpbmcnLCAnc2hvdWxkIGhhdmUgY29ycmVjdCB2YWxpZGF0aW9uIGVycm9yJyApO1xuXG4gIHBoZXRpb0FjdGlvbi5leGVjdXRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICggY3VycmVudENvdW50OiBudW1iZXIgKSA9PiB7XG4gICAgYXNzZXJ0Lm9rKCAhYWN0aW9uRGlzcG9zZWRJdHNlbGYoKSwgJ3Nob3VsZCBub3QgYmUgZGlzcG9zZWQgdW50aWwgYWZ0ZXIgZW1pdHRpbmcgJyArIGN1cnJlbnRDb3VudCApO1xuICAgIGFzc2VydC5vayggY291bnQgPT09IDMsICdjb3VudCB3aWxsIGFsd2F5cyBiZSBsYXN0IGJlY2F1c2UgYWxsIGV4ZWN1dGUgY2FsbHMgY29tZSBiZWZvcmUgYWxsIGVtaXR0aW5nICcgKyBjdXJyZW50Q291bnQgKTtcbiAgfSApO1xuXG4gIGludm9rZUFjdGlvbk9uY2UoKTtcbiAgYXNzZXJ0Lm9rKCBjb3VudCA9PT0gMywgJ3RocmVlIGNhbGxzIHRvdGFsJyApO1xuICBhc3NlcnQub2soIGFjdGlvbkRpc3Bvc2VkSXRzZWxmKCksICdzaG91bGQgbm93IGJlIGRpc3Bvc2VkJyApO1xufSApOyJdLCJuYW1lcyI6WyJQaGV0aW9BY3Rpb24iLCJUYW5kZW0iLCJOdW1iZXJJTyIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsImNvdW50IiwiaW52b2tlQWN0aW9uT25jZSIsInBoZXRpb0FjdGlvbiIsImV4ZWN1dGUiLCJhY3Rpb24iLCJjdXJyZW50Q291bnQiLCJvayIsInBhcmFtZXRlcnMiLCJuYW1lIiwicGhldGlvVHlwZSIsInRhbmRlbSIsIlJPT1RfVEVTVCIsImNyZWF0ZVRhbmRlbSIsImRpc3Bvc2UiLCJhY3Rpb25EaXNwb3NlZEl0c2VsZiIsImV4ZWN1dGVkRW1pdHRlciIsImlzRGlzcG9zZWQiLCJ2IiwiZ2V0VmFsaWRhdGlvbkVycm9ycyIsImxlbmd0aCIsImFkZExpc3RlbmVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGtCQUFrQixvQkFBb0I7QUFDN0MsT0FBT0MsWUFBWSxjQUFjO0FBQ2pDLE9BQU9DLGNBQWMsc0JBQXNCO0FBRTNDQyxNQUFNQyxNQUFNLENBQUU7QUFFZEQsTUFBTUUsSUFBSSxDQUFFLHdCQUF3QkMsQ0FBQUE7SUFFbEMsSUFBSUMsUUFBUTtJQUVaLE1BQU1DLG1CQUFtQixJQUFNQyxhQUFhQyxPQUFPLENBQUUsRUFBRUg7SUFFdkQsTUFBTUksU0FBUyxDQUFFQztRQUNmTixPQUFPTyxFQUFFLENBQUVOLFVBQVVLLGNBQWMsa0JBQWtCTDtRQUVyRCxJQUFLSyxpQkFBaUIsR0FBSTtZQUN4Qko7UUFDRjtJQUNGO0lBQ0EsTUFBTUMsZUFBZSxJQUFJVCxhQUEwQlcsUUFBUTtRQUN6REcsWUFBWTtZQUFFO2dCQUFFQyxNQUFNO2dCQUFTQyxZQUFZZDtZQUFTO1NBQUc7UUFDdkRlLFFBQVFoQixPQUFPaUIsU0FBUyxDQUFDQyxZQUFZLENBQUU7SUFDekM7SUFFQVg7SUFDQUYsT0FBT08sRUFBRSxDQUFFTixVQUFVLEdBQUc7SUFDeEJDO0lBQ0FGLE9BQU9PLEVBQUUsQ0FBRU4sVUFBVSxHQUFHO0lBRXhCRSxhQUFhVyxPQUFPO0FBQ3RCO0FBRUFqQixNQUFNRSxJQUFJLENBQUUsbUNBQW1DQyxDQUFBQTtJQUU3QyxJQUFJQyxRQUFRO0lBRVosTUFBTUMsbUJBQW1CLElBQU1DLGFBQWFDLE9BQU8sQ0FBRSxFQUFFSDtJQUV2RCw0SEFBNEg7SUFDNUgsTUFBTWMsdUJBQXVCLElBQU1aLGFBQWFhLGVBQWUsQ0FBQ0MsVUFBVTtJQUUxRSxNQUFNWixTQUFTLENBQUVDO1FBQ2ZOLE9BQU9PLEVBQUUsQ0FBRU4sVUFBVUssY0FBYyxrQkFBa0JMO1FBRXJELElBQUtLLGlCQUFpQixHQUFJO1lBQ3hCSjtRQUNGLE9BQ0ssSUFBS0ksaUJBQWlCLEdBQUk7WUFDN0JKO1lBQ0FDLGFBQWFXLE9BQU87UUFDdEI7UUFDQWQsT0FBT08sRUFBRSxDQUFFLENBQUNRLHdCQUF3QixrREFBa0RUO0lBQ3hGO0lBQ0EsTUFBTUgsZUFBZSxJQUFJVCxhQUEwQlcsUUFBUTtRQUN6REcsWUFBWTtZQUFFO2dCQUFFQyxNQUFNO2dCQUFTQyxZQUFZZDtZQUFTO1NBQUc7UUFDdkRlLFFBQVFoQixPQUFPaUIsU0FBUyxDQUFDQyxZQUFZLENBQUU7SUFDekM7SUFFQSwyQ0FBMkM7SUFDM0MsTUFBTUssSUFBSWYsYUFBYWdCLG1CQUFtQixDQUFFO0lBQzVDbkIsT0FBT08sRUFBRSxDQUFFVyxFQUFFRSxNQUFNLEtBQUssR0FBRztJQUMzQnBCLE9BQU9PLEVBQUUsQ0FBRSxPQUFPVyxDQUFDLENBQUUsRUFBRyxLQUFLLFVBQVU7SUFFdkNmLGFBQWFhLGVBQWUsQ0FBQ0ssV0FBVyxDQUFFLENBQUVmO1FBQzFDTixPQUFPTyxFQUFFLENBQUUsQ0FBQ1Esd0JBQXdCLGlEQUFpRFQ7UUFDckZOLE9BQU9PLEVBQUUsQ0FBRU4sVUFBVSxHQUFHLGtGQUFrRks7SUFDNUc7SUFFQUo7SUFDQUYsT0FBT08sRUFBRSxDQUFFTixVQUFVLEdBQUc7SUFDeEJELE9BQU9PLEVBQUUsQ0FBRVEsd0JBQXdCO0FBQ3JDIn0=