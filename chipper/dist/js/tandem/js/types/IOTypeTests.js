// Copyright 2021-2024, University of Colorado Boulder
/**
 * Unit tests for IOType
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import BooleanIO from './BooleanIO.js';
import IOType from './IOType.js';
import NumberIO from './NumberIO.js';
import StringIO from './StringIO.js';
QUnit.module('IOType');
QUnit.test('always true', (assert)=>{
    assert.ok(true, 'initial test');
});
QUnit.test('default toStateObject and applyState', (assert)=>{
    let MyClass = class MyClass {
        get gettersAndSettersTest() {
            return this._valueForGetterAndSetter;
        }
        set gettersAndSettersTest(value) {
            this._valueForGetterAndSetter = value;
        }
        constructor(){
            this.firstField = true;
            this.secondField = 5;
            this.willBePrivateInStateObject = 42;
            this._myUnsettableField = 'unacceptable!';
            this._secretName = 'Larry';
            this._secretNameButPublicState = 'Larry2';
            this._valueForGetterAndSetter = 'hi';
        }
    };
    MyClass.MyClassIO = new IOType('MyClassIO', {
        valueType: MyClass,
        stateSchema: {
            firstField: BooleanIO,
            secondField: NumberIO,
            _willBePrivateInStateObject: NumberIO,
            myUnsettableField: StringIO,
            gettersAndSettersTest: StringIO,
            _secretName: StringIO,
            secretNameButPublicState: StringIO
        }
    });
    const x = new MyClass();
    const stateObject = MyClass.MyClassIO.toStateObject(x);
    assert.ok(stateObject.firstField === true, 'stateObject firstField');
    assert.ok(stateObject.secondField === 5, 'stateObject secondField');
    assert.ok(stateObject._willBePrivateInStateObject === 42, 'stateObject willBePrivateInStateObject');
    assert.ok(stateObject.myUnsettableField === 'unacceptable!', 'stateObject myUnsettableField');
    assert.ok(stateObject.gettersAndSettersTest === 'hi', 'stateObject gettersAndSettersTest');
    assert.ok(stateObject._secretName === 'Larry', 'stateObject underscore key + underscore core');
    assert.ok(stateObject.secretNameButPublicState === 'Larry2', 'stateObject nonunderscored key + underscore core');
    const myStateObject = {
        firstField: false,
        secondField: 2,
        _willBePrivateInStateObject: 100,
        myUnsettableField: 'other',
        gettersAndSettersTest: 'other2',
        _secretName: 'Bob',
        secretNameButPublicState: 'Bob2'
    };
    MyClass.MyClassIO.applyState(x, myStateObject);
    assert.equal(x.firstField, false, 'applyState firstField');
    assert.ok(x.secondField === 2, 'applyState secondField');
    assert.ok(x.willBePrivateInStateObject === 100, 'applyState willBePrivateInStateObject');
    assert.ok(x['_myUnsettableField'] === 'other', 'applyState myUnsettableField');
    assert.ok(x.gettersAndSettersTest === 'other2', 'applyState gettersAndSettersTest');
    assert.ok(x['_secretName'] === 'Bob', 'applyState underscore key + underscore core');
    assert.ok(!x.hasOwnProperty('secretName'), 'do not write a bad field secretName');
    assert.ok(x['_secretNameButPublicState'] === 'Bob2', 'applyState nonunderscore key + underscore core');
    assert.ok(!x.hasOwnProperty('secretNameButPublicState'), 'do not write a bad field secretNameButPublicState');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGVUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBVbml0IHRlc3RzIGZvciBJT1R5cGVcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IEJvb2xlYW5JTyBmcm9tICcuL0Jvb2xlYW5JTy5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4vSU9UeXBlLmpzJztcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuL051bWJlcklPLmpzJztcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuL1N0cmluZ0lPLmpzJztcblxuUVVuaXQubW9kdWxlKCAnSU9UeXBlJyApO1xuXG5RVW5pdC50ZXN0KCAnYWx3YXlzIHRydWUnLCBhc3NlcnQgPT4ge1xuICBhc3NlcnQub2soIHRydWUsICdpbml0aWFsIHRlc3QnICk7XG59ICk7XG5RVW5pdC50ZXN0KCAnZGVmYXVsdCB0b1N0YXRlT2JqZWN0IGFuZCBhcHBseVN0YXRlJywgYXNzZXJ0ID0+IHtcblxuICBjbGFzcyBNeUNsYXNzIHtcbiAgICBwdWJsaWMgZmlyc3RGaWVsZCA9IHRydWU7XG4gICAgcHVibGljIHNlY29uZEZpZWxkID0gNTtcbiAgICBwdWJsaWMgd2lsbEJlUHJpdmF0ZUluU3RhdGVPYmplY3QgPSA0MjtcbiAgICBwcml2YXRlIF9teVVuc2V0dGFibGVGaWVsZCA9ICd1bmFjY2VwdGFibGUhJztcbiAgICBwcml2YXRlIF9zZWNyZXROYW1lID0gJ0xhcnJ5JztcbiAgICBwcml2YXRlIF9zZWNyZXROYW1lQnV0UHVibGljU3RhdGUgPSAnTGFycnkyJztcbiAgICBwcml2YXRlIF92YWx1ZUZvckdldHRlckFuZFNldHRlciA9ICdoaSc7XG5cbiAgICBwdWJsaWMgZ2V0IGdldHRlcnNBbmRTZXR0ZXJzVGVzdCgpIHsgcmV0dXJuIHRoaXMuX3ZhbHVlRm9yR2V0dGVyQW5kU2V0dGVyOyB9XG5cbiAgICBwdWJsaWMgc2V0IGdldHRlcnNBbmRTZXR0ZXJzVGVzdCggdmFsdWU6IHN0cmluZyApIHsgdGhpcy5fdmFsdWVGb3JHZXR0ZXJBbmRTZXR0ZXIgPSB2YWx1ZTsgfVxuXG4gICAgcHVibGljIHN0YXRpYyBNeUNsYXNzSU8gPSBuZXcgSU9UeXBlKCAnTXlDbGFzc0lPJywge1xuICAgICAgdmFsdWVUeXBlOiBNeUNsYXNzLFxuICAgICAgc3RhdGVTY2hlbWE6IHtcbiAgICAgICAgZmlyc3RGaWVsZDogQm9vbGVhbklPLFxuICAgICAgICBzZWNvbmRGaWVsZDogTnVtYmVySU8sXG4gICAgICAgIF93aWxsQmVQcml2YXRlSW5TdGF0ZU9iamVjdDogTnVtYmVySU8sXG4gICAgICAgIG15VW5zZXR0YWJsZUZpZWxkOiBTdHJpbmdJTyxcbiAgICAgICAgZ2V0dGVyc0FuZFNldHRlcnNUZXN0OiBTdHJpbmdJTyxcbiAgICAgICAgX3NlY3JldE5hbWU6IFN0cmluZ0lPLFxuICAgICAgICBzZWNyZXROYW1lQnV0UHVibGljU3RhdGU6IFN0cmluZ0lPXG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cbiAgY29uc3QgeCA9IG5ldyBNeUNsYXNzKCk7XG4gIGNvbnN0IHN0YXRlT2JqZWN0ID0gTXlDbGFzcy5NeUNsYXNzSU8udG9TdGF0ZU9iamVjdCggeCApO1xuICBhc3NlcnQub2soIHN0YXRlT2JqZWN0LmZpcnN0RmllbGQgPT09IHRydWUsICdzdGF0ZU9iamVjdCBmaXJzdEZpZWxkJyApO1xuICBhc3NlcnQub2soIHN0YXRlT2JqZWN0LnNlY29uZEZpZWxkID09PSA1LCAnc3RhdGVPYmplY3Qgc2Vjb25kRmllbGQnICk7XG4gIGFzc2VydC5vayggc3RhdGVPYmplY3QuX3dpbGxCZVByaXZhdGVJblN0YXRlT2JqZWN0ID09PSA0MiwgJ3N0YXRlT2JqZWN0IHdpbGxCZVByaXZhdGVJblN0YXRlT2JqZWN0JyApO1xuICBhc3NlcnQub2soIHN0YXRlT2JqZWN0Lm15VW5zZXR0YWJsZUZpZWxkID09PSAndW5hY2NlcHRhYmxlIScsICdzdGF0ZU9iamVjdCBteVVuc2V0dGFibGVGaWVsZCcgKTtcbiAgYXNzZXJ0Lm9rKCBzdGF0ZU9iamVjdC5nZXR0ZXJzQW5kU2V0dGVyc1Rlc3QgPT09ICdoaScsICdzdGF0ZU9iamVjdCBnZXR0ZXJzQW5kU2V0dGVyc1Rlc3QnICk7XG4gIGFzc2VydC5vayggc3RhdGVPYmplY3QuX3NlY3JldE5hbWUgPT09ICdMYXJyeScsICdzdGF0ZU9iamVjdCB1bmRlcnNjb3JlIGtleSArIHVuZGVyc2NvcmUgY29yZScgKTtcbiAgYXNzZXJ0Lm9rKCBzdGF0ZU9iamVjdC5zZWNyZXROYW1lQnV0UHVibGljU3RhdGUgPT09ICdMYXJyeTInLCAnc3RhdGVPYmplY3Qgbm9udW5kZXJzY29yZWQga2V5ICsgdW5kZXJzY29yZSBjb3JlJyApO1xuXG4gIGNvbnN0IG15U3RhdGVPYmplY3QgPSB7XG4gICAgZmlyc3RGaWVsZDogZmFsc2UsXG4gICAgc2Vjb25kRmllbGQ6IDIsXG4gICAgX3dpbGxCZVByaXZhdGVJblN0YXRlT2JqZWN0OiAxMDAsXG4gICAgbXlVbnNldHRhYmxlRmllbGQ6ICdvdGhlcicsXG4gICAgZ2V0dGVyc0FuZFNldHRlcnNUZXN0OiAnb3RoZXIyJyxcbiAgICBfc2VjcmV0TmFtZTogJ0JvYicsXG4gICAgc2VjcmV0TmFtZUJ1dFB1YmxpY1N0YXRlOiAnQm9iMidcbiAgfTtcblxuICBNeUNsYXNzLk15Q2xhc3NJTy5hcHBseVN0YXRlKCB4LCBteVN0YXRlT2JqZWN0ICk7XG4gIGFzc2VydC5lcXVhbCggeC5maXJzdEZpZWxkLCBmYWxzZSwgJ2FwcGx5U3RhdGUgZmlyc3RGaWVsZCcgKTtcbiAgYXNzZXJ0Lm9rKCB4LnNlY29uZEZpZWxkID09PSAyLCAnYXBwbHlTdGF0ZSBzZWNvbmRGaWVsZCcgKTtcbiAgYXNzZXJ0Lm9rKCB4LndpbGxCZVByaXZhdGVJblN0YXRlT2JqZWN0ID09PSAxMDAsICdhcHBseVN0YXRlIHdpbGxCZVByaXZhdGVJblN0YXRlT2JqZWN0JyApO1xuICBhc3NlcnQub2soIHhbICdfbXlVbnNldHRhYmxlRmllbGQnIF0gPT09ICdvdGhlcicsICdhcHBseVN0YXRlIG15VW5zZXR0YWJsZUZpZWxkJyApO1xuICBhc3NlcnQub2soIHguZ2V0dGVyc0FuZFNldHRlcnNUZXN0ID09PSAnb3RoZXIyJywgJ2FwcGx5U3RhdGUgZ2V0dGVyc0FuZFNldHRlcnNUZXN0JyApO1xuICBhc3NlcnQub2soIHhbICdfc2VjcmV0TmFtZScgXSA9PT0gJ0JvYicsICdhcHBseVN0YXRlIHVuZGVyc2NvcmUga2V5ICsgdW5kZXJzY29yZSBjb3JlJyApO1xuICBhc3NlcnQub2soICF4Lmhhc093blByb3BlcnR5KCAnc2VjcmV0TmFtZScgKSwgJ2RvIG5vdCB3cml0ZSBhIGJhZCBmaWVsZCBzZWNyZXROYW1lJyApO1xuICBhc3NlcnQub2soIHhbICdfc2VjcmV0TmFtZUJ1dFB1YmxpY1N0YXRlJyBdID09PSAnQm9iMicsICdhcHBseVN0YXRlIG5vbnVuZGVyc2NvcmUga2V5ICsgdW5kZXJzY29yZSBjb3JlJyApO1xuICBhc3NlcnQub2soICF4Lmhhc093blByb3BlcnR5KCAnc2VjcmV0TmFtZUJ1dFB1YmxpY1N0YXRlJyApLCAnZG8gbm90IHdyaXRlIGEgYmFkIGZpZWxkIHNlY3JldE5hbWVCdXRQdWJsaWNTdGF0ZScgKTtcbn0gKTsiXSwibmFtZXMiOlsiQm9vbGVhbklPIiwiSU9UeXBlIiwiTnVtYmVySU8iLCJTdHJpbmdJTyIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIm9rIiwiTXlDbGFzcyIsImdldHRlcnNBbmRTZXR0ZXJzVGVzdCIsIl92YWx1ZUZvckdldHRlckFuZFNldHRlciIsInZhbHVlIiwiZmlyc3RGaWVsZCIsInNlY29uZEZpZWxkIiwid2lsbEJlUHJpdmF0ZUluU3RhdGVPYmplY3QiLCJfbXlVbnNldHRhYmxlRmllbGQiLCJfc2VjcmV0TmFtZSIsIl9zZWNyZXROYW1lQnV0UHVibGljU3RhdGUiLCJNeUNsYXNzSU8iLCJ2YWx1ZVR5cGUiLCJzdGF0ZVNjaGVtYSIsIl93aWxsQmVQcml2YXRlSW5TdGF0ZU9iamVjdCIsIm15VW5zZXR0YWJsZUZpZWxkIiwic2VjcmV0TmFtZUJ1dFB1YmxpY1N0YXRlIiwieCIsInN0YXRlT2JqZWN0IiwidG9TdGF0ZU9iamVjdCIsIm15U3RhdGVPYmplY3QiLCJhcHBseVN0YXRlIiwiZXF1YWwiLCJoYXNPd25Qcm9wZXJ0eSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxlQUFlLGlCQUFpQjtBQUN2QyxPQUFPQyxZQUFZLGNBQWM7QUFDakMsT0FBT0MsY0FBYyxnQkFBZ0I7QUFDckMsT0FBT0MsY0FBYyxnQkFBZ0I7QUFFckNDLE1BQU1DLE1BQU0sQ0FBRTtBQUVkRCxNQUFNRSxJQUFJLENBQUUsZUFBZUMsQ0FBQUE7SUFDekJBLE9BQU9DLEVBQUUsQ0FBRSxNQUFNO0FBQ25CO0FBQ0FKLE1BQU1FLElBQUksQ0FBRSx3Q0FBd0NDLENBQUFBO0lBRWxELElBQUEsQUFBTUUsVUFBTixNQUFNQTtRQVNKLElBQVdDLHdCQUF3QjtZQUFFLE9BQU8sSUFBSSxDQUFDQyx3QkFBd0I7UUFBRTtRQUUzRSxJQUFXRCxzQkFBdUJFLEtBQWEsRUFBRztZQUFFLElBQUksQ0FBQ0Qsd0JBQXdCLEdBQUdDO1FBQU87O2lCQVZwRkMsYUFBYTtpQkFDYkMsY0FBYztpQkFDZEMsNkJBQTZCO2lCQUM1QkMscUJBQXFCO2lCQUNyQkMsY0FBYztpQkFDZEMsNEJBQTRCO2lCQUM1QlAsMkJBQTJCOztJQWtCckM7SUF6Qk1GLFFBYVVVLFlBQVksSUFBSWxCLE9BQVEsYUFBYTtRQUNqRG1CLFdBQVdYO1FBQ1hZLGFBQWE7WUFDWFIsWUFBWWI7WUFDWmMsYUFBYVo7WUFDYm9CLDZCQUE2QnBCO1lBQzdCcUIsbUJBQW1CcEI7WUFDbkJPLHVCQUF1QlA7WUFDdkJjLGFBQWFkO1lBQ2JxQiwwQkFBMEJyQjtRQUM1QjtJQUNGO0lBR0YsTUFBTXNCLElBQUksSUFBSWhCO0lBQ2QsTUFBTWlCLGNBQWNqQixRQUFRVSxTQUFTLENBQUNRLGFBQWEsQ0FBRUY7SUFDckRsQixPQUFPQyxFQUFFLENBQUVrQixZQUFZYixVQUFVLEtBQUssTUFBTTtJQUM1Q04sT0FBT0MsRUFBRSxDQUFFa0IsWUFBWVosV0FBVyxLQUFLLEdBQUc7SUFDMUNQLE9BQU9DLEVBQUUsQ0FBRWtCLFlBQVlKLDJCQUEyQixLQUFLLElBQUk7SUFDM0RmLE9BQU9DLEVBQUUsQ0FBRWtCLFlBQVlILGlCQUFpQixLQUFLLGlCQUFpQjtJQUM5RGhCLE9BQU9DLEVBQUUsQ0FBRWtCLFlBQVloQixxQkFBcUIsS0FBSyxNQUFNO0lBQ3ZESCxPQUFPQyxFQUFFLENBQUVrQixZQUFZVCxXQUFXLEtBQUssU0FBUztJQUNoRFYsT0FBT0MsRUFBRSxDQUFFa0IsWUFBWUYsd0JBQXdCLEtBQUssVUFBVTtJQUU5RCxNQUFNSSxnQkFBZ0I7UUFDcEJmLFlBQVk7UUFDWkMsYUFBYTtRQUNiUSw2QkFBNkI7UUFDN0JDLG1CQUFtQjtRQUNuQmIsdUJBQXVCO1FBQ3ZCTyxhQUFhO1FBQ2JPLDBCQUEwQjtJQUM1QjtJQUVBZixRQUFRVSxTQUFTLENBQUNVLFVBQVUsQ0FBRUosR0FBR0c7SUFDakNyQixPQUFPdUIsS0FBSyxDQUFFTCxFQUFFWixVQUFVLEVBQUUsT0FBTztJQUNuQ04sT0FBT0MsRUFBRSxDQUFFaUIsRUFBRVgsV0FBVyxLQUFLLEdBQUc7SUFDaENQLE9BQU9DLEVBQUUsQ0FBRWlCLEVBQUVWLDBCQUEwQixLQUFLLEtBQUs7SUFDakRSLE9BQU9DLEVBQUUsQ0FBRWlCLENBQUMsQ0FBRSxxQkFBc0IsS0FBSyxTQUFTO0lBQ2xEbEIsT0FBT0MsRUFBRSxDQUFFaUIsRUFBRWYscUJBQXFCLEtBQUssVUFBVTtJQUNqREgsT0FBT0MsRUFBRSxDQUFFaUIsQ0FBQyxDQUFFLGNBQWUsS0FBSyxPQUFPO0lBQ3pDbEIsT0FBT0MsRUFBRSxDQUFFLENBQUNpQixFQUFFTSxjQUFjLENBQUUsZUFBZ0I7SUFDOUN4QixPQUFPQyxFQUFFLENBQUVpQixDQUFDLENBQUUsNEJBQTZCLEtBQUssUUFBUTtJQUN4RGxCLE9BQU9DLEVBQUUsQ0FBRSxDQUFDaUIsRUFBRU0sY0FBYyxDQUFFLDZCQUE4QjtBQUM5RCJ9