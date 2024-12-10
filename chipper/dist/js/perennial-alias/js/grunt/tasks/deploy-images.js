// Copyright 2024, University of Colorado Boulder
/**
 * Rebuilds all images
 * --simulation : Optional. If present, only the given simulation will receive images from main. If absent, all sims' +
 * will receive images from main.
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
import deployImages from '../deployImages.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    console.log(getOption('simulation'));
    const simulation = getOption('simulation') || null;
    yield deployImages({
        simulation: simulation
    });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9kZXBsb3ktaW1hZ2VzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuXG4vKipcbiAqIFJlYnVpbGRzIGFsbCBpbWFnZXNcbiAqIC0tc2ltdWxhdGlvbiA6IE9wdGlvbmFsLiBJZiBwcmVzZW50LCBvbmx5IHRoZSBnaXZlbiBzaW11bGF0aW9uIHdpbGwgcmVjZWl2ZSBpbWFnZXMgZnJvbSBtYWluLiBJZiBhYnNlbnQsIGFsbCBzaW1zJyArXG4gKiB3aWxsIHJlY2VpdmUgaW1hZ2VzIGZyb20gbWFpbi5cbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgZGVwbG95SW1hZ2VzIGZyb20gJy4uL2RlcGxveUltYWdlcy5qcyc7XG5pbXBvcnQgZ2V0T3B0aW9uIGZyb20gJy4vdXRpbC9nZXRPcHRpb24uanMnO1xuXG4oIGFzeW5jICgpID0+IHtcbiAgY29uc29sZS5sb2coIGdldE9wdGlvbiggJ3NpbXVsYXRpb24nICkgKTtcbiAgY29uc3Qgc2ltdWxhdGlvbiA9IGdldE9wdGlvbiggJ3NpbXVsYXRpb24nICkgfHwgbnVsbDtcbiAgYXdhaXQgZGVwbG95SW1hZ2VzKCB7IHNpbXVsYXRpb246IHNpbXVsYXRpb24gfSApO1xufSApKCk7Il0sIm5hbWVzIjpbImRlcGxveUltYWdlcyIsImdldE9wdGlvbiIsImNvbnNvbGUiLCJsb2ciLCJzaW11bGF0aW9uIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFHakQ7Ozs7O0NBS0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0Esa0JBQWtCLHFCQUFxQjtBQUM5QyxPQUFPQyxlQUFlLHNCQUFzQjtBQUUxQyxvQkFBQTtJQUNBQyxRQUFRQyxHQUFHLENBQUVGLFVBQVc7SUFDeEIsTUFBTUcsYUFBYUgsVUFBVyxpQkFBa0I7SUFDaEQsTUFBTUQsYUFBYztRQUFFSSxZQUFZQTtJQUFXO0FBQy9DIn0=