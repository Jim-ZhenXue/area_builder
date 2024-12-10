// Copyright 2024, University of Colorado Boulder
/**
 * Deploys a decaf version of the simulation
 * --project : The name of the project to deploy
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
import assert from 'assert';
import deployDecaf from '../decaf/deployDecaf.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    assert(getOption('project'), 'Requires specifying a repository with --project={{PROJECT}}');
    assert(getOption('dev') || getOption('production'), 'Requires at least one of --dev or --production');
    yield deployDecaf(getOption('project'), !!getOption('dev'), !!getOption('production'));
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9kZXBsb3ktZGVjYWYudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlcGxveXMgYSBkZWNhZiB2ZXJzaW9uIG9mIHRoZSBzaW11bGF0aW9uXG4gKiAtLXByb2plY3QgOiBUaGUgbmFtZSBvZiB0aGUgcHJvamVjdCB0byBkZXBsb3lcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGRlcGxveURlY2FmIGZyb20gJy4uL2RlY2FmL2RlcGxveURlY2FmLmpzJztcbmltcG9ydCBnZXRPcHRpb24gZnJvbSAnLi91dGlsL2dldE9wdGlvbi5qcyc7XG5cbiggYXN5bmMgKCkgPT4ge1xuXG4gIGFzc2VydCggZ2V0T3B0aW9uKCAncHJvamVjdCcgKSwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSByZXBvc2l0b3J5IHdpdGggLS1wcm9qZWN0PXt7UFJPSkVDVH19JyApO1xuICBhc3NlcnQoIGdldE9wdGlvbiggJ2RldicgKSB8fCBnZXRPcHRpb24oICdwcm9kdWN0aW9uJyApLCAnUmVxdWlyZXMgYXQgbGVhc3Qgb25lIG9mIC0tZGV2IG9yIC0tcHJvZHVjdGlvbicgKTtcbiAgYXdhaXQgZGVwbG95RGVjYWYoIGdldE9wdGlvbiggJ3Byb2plY3QnICksICEhZ2V0T3B0aW9uKCAnZGV2JyApLCAhIWdldE9wdGlvbiggJ3Byb2R1Y3Rpb24nICkgKTtcbn0gKSgpOyJdLCJuYW1lcyI6WyJhc3NlcnQiLCJkZXBsb3lEZWNhZiIsImdldE9wdGlvbiJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0QsT0FBT0EsWUFBWSxTQUFTO0FBQzVCLE9BQU9DLGlCQUFpQiwwQkFBMEI7QUFDbEQsT0FBT0MsZUFBZSxzQkFBc0I7QUFFMUMsb0JBQUE7SUFFQUYsT0FBUUUsVUFBVyxZQUFhO0lBQ2hDRixPQUFRRSxVQUFXLFVBQVdBLFVBQVcsZUFBZ0I7SUFDekQsTUFBTUQsWUFBYUMsVUFBVyxZQUFhLENBQUMsQ0FBQ0EsVUFBVyxRQUFTLENBQUMsQ0FBQ0EsVUFBVztBQUNoRiJ9