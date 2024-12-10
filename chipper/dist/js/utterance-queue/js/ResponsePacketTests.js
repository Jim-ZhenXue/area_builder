// Copyright 2021-2024, University of Colorado Boulder
/**
 * QUnit tests for ResponsePacket
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
import ResponsePacket from './ResponsePacket.js';
QUnit.module('ResponsePacket');
QUnit.test('ResponsePacket.copy()', /*#__PURE__*/ _async_to_generator(function*(assert) {
    let x = new ResponsePacket({
        nameResponse: 'nameResponse',
        objectResponse: 'objectResponse',
        contextResponse: 'contextResponse'
    });
    const testIt = (message)=>{
        assert.ok(x.nameResponse === 'nameResponse', `nameResponse: ${message}`);
        assert.ok(x.objectResponse === 'objectResponse', `objectResponse: ${message}`);
        assert.ok(x.contextResponse === 'contextResponse', `contextResponse: ${message}`);
        assert.ok(x.hintResponse === null, `hintResponse: ${message}`);
        assert.ok(x.ignoreProperties === new ResponsePacket().ignoreProperties, `ignoreProperties: ${message}`);
    };
    testIt('fromConstructor');
    x = x.copy();
    testIt('fromCopy');
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9SZXNwb25zZVBhY2tldFRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFFVbml0IHRlc3RzIGZvciBSZXNwb25zZVBhY2tldFxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgUmVzcG9uc2VQYWNrZXQgZnJvbSAnLi9SZXNwb25zZVBhY2tldC5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ1Jlc3BvbnNlUGFja2V0JyApO1xuXG5RVW5pdC50ZXN0KCAnUmVzcG9uc2VQYWNrZXQuY29weSgpJywgYXN5bmMgYXNzZXJ0ID0+IHtcblxuICBsZXQgeCA9IG5ldyBSZXNwb25zZVBhY2tldCgge1xuICAgIG5hbWVSZXNwb25zZTogJ25hbWVSZXNwb25zZScsXG4gICAgb2JqZWN0UmVzcG9uc2U6ICdvYmplY3RSZXNwb25zZScsXG4gICAgY29udGV4dFJlc3BvbnNlOiAnY29udGV4dFJlc3BvbnNlJ1xuICB9ICk7XG5cbiAgY29uc3QgdGVzdEl0ID0gKCBtZXNzYWdlOiBzdHJpbmcgKSA9PiB7XG5cbiAgICBhc3NlcnQub2soIHgubmFtZVJlc3BvbnNlID09PSAnbmFtZVJlc3BvbnNlJywgYG5hbWVSZXNwb25zZTogJHttZXNzYWdlfWAgKTtcbiAgICBhc3NlcnQub2soIHgub2JqZWN0UmVzcG9uc2UgPT09ICdvYmplY3RSZXNwb25zZScsIGBvYmplY3RSZXNwb25zZTogJHttZXNzYWdlfWAgKTtcbiAgICBhc3NlcnQub2soIHguY29udGV4dFJlc3BvbnNlID09PSAnY29udGV4dFJlc3BvbnNlJywgYGNvbnRleHRSZXNwb25zZTogJHttZXNzYWdlfWAgKTtcbiAgICBhc3NlcnQub2soIHguaGludFJlc3BvbnNlID09PSBudWxsLCBgaGludFJlc3BvbnNlOiAke21lc3NhZ2V9YCApO1xuICAgIGFzc2VydC5vayggeC5pZ25vcmVQcm9wZXJ0aWVzID09PSBuZXcgUmVzcG9uc2VQYWNrZXQoKS5pZ25vcmVQcm9wZXJ0aWVzLCBgaWdub3JlUHJvcGVydGllczogJHttZXNzYWdlfWAgKTtcbiAgfTtcblxuICB0ZXN0SXQoICdmcm9tQ29uc3RydWN0b3InICk7XG5cbiAgeCA9IHguY29weSgpO1xuXG4gIHRlc3RJdCggJ2Zyb21Db3B5JyApO1xufSApOyJdLCJuYW1lcyI6WyJSZXNwb25zZVBhY2tldCIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIngiLCJuYW1lUmVzcG9uc2UiLCJvYmplY3RSZXNwb25zZSIsImNvbnRleHRSZXNwb25zZSIsInRlc3RJdCIsIm1lc3NhZ2UiLCJvayIsImhpbnRSZXNwb25zZSIsImlnbm9yZVByb3BlcnRpZXMiLCJjb3B5Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxPQUFPQSxvQkFBb0Isc0JBQXNCO0FBRWpEQyxNQUFNQyxNQUFNLENBQUU7QUFFZEQsTUFBTUUsSUFBSSxDQUFFLDJEQUF5QixVQUFNQztJQUV6QyxJQUFJQyxJQUFJLElBQUlMLGVBQWdCO1FBQzFCTSxjQUFjO1FBQ2RDLGdCQUFnQjtRQUNoQkMsaUJBQWlCO0lBQ25CO0lBRUEsTUFBTUMsU0FBUyxDQUFFQztRQUVmTixPQUFPTyxFQUFFLENBQUVOLEVBQUVDLFlBQVksS0FBSyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUVJLFNBQVM7UUFDeEVOLE9BQU9PLEVBQUUsQ0FBRU4sRUFBRUUsY0FBYyxLQUFLLGtCQUFrQixDQUFDLGdCQUFnQixFQUFFRyxTQUFTO1FBQzlFTixPQUFPTyxFQUFFLENBQUVOLEVBQUVHLGVBQWUsS0FBSyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRUUsU0FBUztRQUNqRk4sT0FBT08sRUFBRSxDQUFFTixFQUFFTyxZQUFZLEtBQUssTUFBTSxDQUFDLGNBQWMsRUFBRUYsU0FBUztRQUM5RE4sT0FBT08sRUFBRSxDQUFFTixFQUFFUSxnQkFBZ0IsS0FBSyxJQUFJYixpQkFBaUJhLGdCQUFnQixFQUFFLENBQUMsa0JBQWtCLEVBQUVILFNBQVM7SUFDekc7SUFFQUQsT0FBUTtJQUVSSixJQUFJQSxFQUFFUyxJQUFJO0lBRVZMLE9BQVE7QUFDViJ9