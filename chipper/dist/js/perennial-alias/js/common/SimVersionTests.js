// Copyright 2023, University of Colorado Boulder
/**
 * Node qunit tests for SimVersion
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
const SimVersion = require('../browser-and-node/SimVersion').default;
const qunit = require('qunit');
qunit.module('SimVersion');
qunit.test('SimVersion Basics', /*#__PURE__*/ _async_to_generator(function*(assert) {
    const testVersion = (simVersion, major, minor, maintenance, message)=>{
        assert.ok(simVersion.major === major, `major: ${message}`);
        assert.ok(simVersion.minor === minor, `minor: ${message}`);
        assert.ok(simVersion.maintenance === maintenance, `maintenance: ${message}`);
    };
    const simVersion = new SimVersion(1, 2, 0);
    testVersion(simVersion, 1, 2, 0, 'basic constructor');
    let versions = [
        new SimVersion(1, 2, 0),
        new SimVersion(1, 4, 0),
        new SimVersion(1, 3, 0)
    ];
    versions.sort((a, b)=>a.compareNumber(b));
    testVersion(versions[0], 1, 2, 0, 'sorted first');
    testVersion(versions[1], 1, 3, 0, 'sorted second');
    testVersion(versions[2], 1, 4, 0, 'sorted third');
    versions = [
        new SimVersion(2, 2, 2),
        new SimVersion(1, 5, 6),
        new SimVersion(3, 0, 0)
    ];
    versions.sort(SimVersion.comparator);
    testVersion(versions[0], 1, 5, 6, 'another sorted first');
    testVersion(versions[1], 2, 2, 2, 'another sorted second');
    testVersion(versions[2], 3, 0, 0, 'another sorted third');
    assert.throws(()=>{
        return SimVersion('1fdsaf', '2fdsaf', '3fdsa');
    }, 'letters as version, boo');
    assert.throws(()=>{
        return SimVersion('fdsaf1fdsaf', 'fdsaf2fdsaf', 'fdsa3fdsa');
    }, 'letters as version, boo two');
    assert.throws(()=>{
        return SimVersion(true, false, true);
    }, 'letters as version, boo');
    const mySimVersion = new SimVersion('1', '2', '3', {
        testType: 'rc',
        testNumber: '1'
    });
    testVersion(mySimVersion, 1, 2, 3, 'basic constructor');
    assert.ok(mySimVersion.testNumber === 1, 'testNumber number cast check');
    assert.ok(mySimVersion.toString() === '1.2.3-rc.1', 'as string');
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vU2ltVmVyc2lvblRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBOb2RlIHF1bml0IHRlc3RzIGZvciBTaW1WZXJzaW9uXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgU2ltVmVyc2lvbiA9IHJlcXVpcmUoICcuLi9icm93c2VyLWFuZC1ub2RlL1NpbVZlcnNpb24nICkuZGVmYXVsdDtcbmNvbnN0IHF1bml0ID0gcmVxdWlyZSggJ3F1bml0JyApO1xuXG5xdW5pdC5tb2R1bGUoICdTaW1WZXJzaW9uJyApO1xuXG5cbnF1bml0LnRlc3QoICdTaW1WZXJzaW9uIEJhc2ljcycsIGFzeW5jIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgdGVzdFZlcnNpb24gPSAoIHNpbVZlcnNpb24sIG1ham9yLCBtaW5vciwgbWFpbnRlbmFuY2UsIG1lc3NhZ2UgKSA9PiB7XG5cbiAgICBhc3NlcnQub2soIHNpbVZlcnNpb24ubWFqb3IgPT09IG1ham9yLCBgbWFqb3I6ICR7bWVzc2FnZX1gICk7XG4gICAgYXNzZXJ0Lm9rKCBzaW1WZXJzaW9uLm1pbm9yID09PSBtaW5vciwgYG1pbm9yOiAke21lc3NhZ2V9YCApO1xuICAgIGFzc2VydC5vayggc2ltVmVyc2lvbi5tYWludGVuYW5jZSA9PT0gbWFpbnRlbmFuY2UsIGBtYWludGVuYW5jZTogJHttZXNzYWdlfWAgKTtcbiAgfTtcblxuICBjb25zdCBzaW1WZXJzaW9uID0gbmV3IFNpbVZlcnNpb24oIDEsIDIsIDAgKTtcbiAgdGVzdFZlcnNpb24oIHNpbVZlcnNpb24sIDEsIDIsIDAsICdiYXNpYyBjb25zdHJ1Y3RvcicgKTtcblxuICBsZXQgdmVyc2lvbnMgPSBbXG4gICAgbmV3IFNpbVZlcnNpb24oIDEsIDIsIDAgKSxcbiAgICBuZXcgU2ltVmVyc2lvbiggMSwgNCwgMCApLFxuICAgIG5ldyBTaW1WZXJzaW9uKCAxLCAzLCAwIClcbiAgXTtcblxuICB2ZXJzaW9ucy5zb3J0KCAoIGEsIGIgKSA9PiBhLmNvbXBhcmVOdW1iZXIoIGIgKSApO1xuXG4gIHRlc3RWZXJzaW9uKCB2ZXJzaW9uc1sgMCBdLCAxLCAyLCAwLCAnc29ydGVkIGZpcnN0JyApO1xuICB0ZXN0VmVyc2lvbiggdmVyc2lvbnNbIDEgXSwgMSwgMywgMCwgJ3NvcnRlZCBzZWNvbmQnICk7XG4gIHRlc3RWZXJzaW9uKCB2ZXJzaW9uc1sgMiBdLCAxLCA0LCAwLCAnc29ydGVkIHRoaXJkJyApO1xuXG4gIHZlcnNpb25zID0gW1xuICAgIG5ldyBTaW1WZXJzaW9uKCAyLCAyLCAyICksXG4gICAgbmV3IFNpbVZlcnNpb24oIDEsIDUsIDYgKSxcbiAgICBuZXcgU2ltVmVyc2lvbiggMywgMCwgMCApXG4gIF07XG5cbiAgdmVyc2lvbnMuc29ydCggU2ltVmVyc2lvbi5jb21wYXJhdG9yICk7XG4gIHRlc3RWZXJzaW9uKCB2ZXJzaW9uc1sgMCBdLCAxLCA1LCA2LCAnYW5vdGhlciBzb3J0ZWQgZmlyc3QnICk7XG4gIHRlc3RWZXJzaW9uKCB2ZXJzaW9uc1sgMSBdLCAyLCAyLCAyLCAnYW5vdGhlciBzb3J0ZWQgc2Vjb25kJyApO1xuICB0ZXN0VmVyc2lvbiggdmVyc2lvbnNbIDIgXSwgMywgMCwgMCwgJ2Fub3RoZXIgc29ydGVkIHRoaXJkJyApO1xuXG4gIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICByZXR1cm4gU2ltVmVyc2lvbiggJzFmZHNhZicsICcyZmRzYWYnLCAnM2Zkc2EnICk7XG4gIH0sICdsZXR0ZXJzIGFzIHZlcnNpb24sIGJvbycgKTtcblxuICBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcmV0dXJuIFNpbVZlcnNpb24oICdmZHNhZjFmZHNhZicsICdmZHNhZjJmZHNhZicsICdmZHNhM2Zkc2EnICk7XG4gIH0sICdsZXR0ZXJzIGFzIHZlcnNpb24sIGJvbyB0d28nICk7XG5cbiAgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHJldHVybiBTaW1WZXJzaW9uKCB0cnVlLCBmYWxzZSwgdHJ1ZSApO1xuICB9LCAnbGV0dGVycyBhcyB2ZXJzaW9uLCBib28nICk7XG5cbiAgY29uc3QgbXlTaW1WZXJzaW9uID0gbmV3IFNpbVZlcnNpb24oICcxJywgJzInLCAnMycsIHtcbiAgICB0ZXN0VHlwZTogJ3JjJyxcbiAgICB0ZXN0TnVtYmVyOiAnMSdcbiAgfSApO1xuICB0ZXN0VmVyc2lvbiggbXlTaW1WZXJzaW9uLCAxLCAyLCAzLCAnYmFzaWMgY29uc3RydWN0b3InICk7XG4gIGFzc2VydC5vayggbXlTaW1WZXJzaW9uLnRlc3ROdW1iZXIgPT09IDEsICd0ZXN0TnVtYmVyIG51bWJlciBjYXN0IGNoZWNrJyApO1xuICBhc3NlcnQub2soIG15U2ltVmVyc2lvbi50b1N0cmluZygpID09PSAnMS4yLjMtcmMuMScsICdhcyBzdHJpbmcnICk7XG5cbn0gKTsiXSwibmFtZXMiOlsiU2ltVmVyc2lvbiIsInJlcXVpcmUiLCJkZWZhdWx0IiwicXVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0IiwidGVzdFZlcnNpb24iLCJzaW1WZXJzaW9uIiwibWFqb3IiLCJtaW5vciIsIm1haW50ZW5hbmNlIiwibWVzc2FnZSIsIm9rIiwidmVyc2lvbnMiLCJzb3J0IiwiYSIsImIiLCJjb21wYXJlTnVtYmVyIiwiY29tcGFyYXRvciIsInRocm93cyIsIm15U2ltVmVyc2lvbiIsInRlc3RUeXBlIiwidGVzdE51bWJlciIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7OztDQUdDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLGFBQWFDLFFBQVMsa0NBQW1DQyxPQUFPO0FBQ3RFLE1BQU1DLFFBQVFGLFFBQVM7QUFFdkJFLE1BQU1DLE1BQU0sQ0FBRTtBQUdkRCxNQUFNRSxJQUFJLENBQUUsdURBQXFCLFVBQU1DO0lBRXJDLE1BQU1DLGNBQWMsQ0FBRUMsWUFBWUMsT0FBT0MsT0FBT0MsYUFBYUM7UUFFM0ROLE9BQU9PLEVBQUUsQ0FBRUwsV0FBV0MsS0FBSyxLQUFLQSxPQUFPLENBQUMsT0FBTyxFQUFFRyxTQUFTO1FBQzFETixPQUFPTyxFQUFFLENBQUVMLFdBQVdFLEtBQUssS0FBS0EsT0FBTyxDQUFDLE9BQU8sRUFBRUUsU0FBUztRQUMxRE4sT0FBT08sRUFBRSxDQUFFTCxXQUFXRyxXQUFXLEtBQUtBLGFBQWEsQ0FBQyxhQUFhLEVBQUVDLFNBQVM7SUFDOUU7SUFFQSxNQUFNSixhQUFhLElBQUlSLFdBQVksR0FBRyxHQUFHO0lBQ3pDTyxZQUFhQyxZQUFZLEdBQUcsR0FBRyxHQUFHO0lBRWxDLElBQUlNLFdBQVc7UUFDYixJQUFJZCxXQUFZLEdBQUcsR0FBRztRQUN0QixJQUFJQSxXQUFZLEdBQUcsR0FBRztRQUN0QixJQUFJQSxXQUFZLEdBQUcsR0FBRztLQUN2QjtJQUVEYyxTQUFTQyxJQUFJLENBQUUsQ0FBRUMsR0FBR0MsSUFBT0QsRUFBRUUsYUFBYSxDQUFFRDtJQUU1Q1YsWUFBYU8sUUFBUSxDQUFFLEVBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRztJQUNyQ1AsWUFBYU8sUUFBUSxDQUFFLEVBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRztJQUNyQ1AsWUFBYU8sUUFBUSxDQUFFLEVBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRztJQUVyQ0EsV0FBVztRQUNULElBQUlkLFdBQVksR0FBRyxHQUFHO1FBQ3RCLElBQUlBLFdBQVksR0FBRyxHQUFHO1FBQ3RCLElBQUlBLFdBQVksR0FBRyxHQUFHO0tBQ3ZCO0lBRURjLFNBQVNDLElBQUksQ0FBRWYsV0FBV21CLFVBQVU7SUFDcENaLFlBQWFPLFFBQVEsQ0FBRSxFQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUc7SUFDckNQLFlBQWFPLFFBQVEsQ0FBRSxFQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUc7SUFDckNQLFlBQWFPLFFBQVEsQ0FBRSxFQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUc7SUFFckNSLE9BQU9jLE1BQU0sQ0FBRTtRQUNiLE9BQU9wQixXQUFZLFVBQVUsVUFBVTtJQUN6QyxHQUFHO0lBRUhNLE9BQU9jLE1BQU0sQ0FBRTtRQUNiLE9BQU9wQixXQUFZLGVBQWUsZUFBZTtJQUNuRCxHQUFHO0lBRUhNLE9BQU9jLE1BQU0sQ0FBRTtRQUNiLE9BQU9wQixXQUFZLE1BQU0sT0FBTztJQUNsQyxHQUFHO0lBRUgsTUFBTXFCLGVBQWUsSUFBSXJCLFdBQVksS0FBSyxLQUFLLEtBQUs7UUFDbERzQixVQUFVO1FBQ1ZDLFlBQVk7SUFDZDtJQUNBaEIsWUFBYWMsY0FBYyxHQUFHLEdBQUcsR0FBRztJQUNwQ2YsT0FBT08sRUFBRSxDQUFFUSxhQUFhRSxVQUFVLEtBQUssR0FBRztJQUMxQ2pCLE9BQU9PLEVBQUUsQ0FBRVEsYUFBYUcsUUFBUSxPQUFPLGNBQWM7QUFFdkQifQ==