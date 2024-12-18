// Copyright 2013-2024, University of Colorado Boulder
import _ from 'lodash';
import getOption, { isOptionKeyProvided } from '../../../../perennial-alias/js/grunt/tasks/util/getOption.js';
import transpile, { getTranspileCLIOptions } from '../../common/transpile.js';
/**
 * Transpile TypeScript to JavaScript.
 *
 * Options
 * --live: Continue watching all directories and transpile on detected changes.
 * --clean: Delete of the output directory before transpiling.
 * --silent: Disable any logging output.
 * --all: Transpile all repos. (default)
 * --repo=my-repo: Transpile a specific repo.
 * --repos-my-repo-1,my-repo-2: Transpile a list of repos.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ const defaultOptions = {
    all: isOptionKeyProvided('all') ? getOption('all') : true
};
// TODO: use combineOptions, see https://github.com/phetsims/chipper/issues/1523
transpile(_.assignIn(defaultOptions, getTranspileCLIOptions()));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL3RyYW5zcGlsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBnZXRPcHRpb24sIHsgaXNPcHRpb25LZXlQcm92aWRlZCB9IGZyb20gJy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy91dGlsL2dldE9wdGlvbi5qcyc7XG5pbXBvcnQgdHJhbnNwaWxlLCB7IGdldFRyYW5zcGlsZUNMSU9wdGlvbnMgfSBmcm9tICcuLi8uLi9jb21tb24vdHJhbnNwaWxlLmpzJztcblxuLyoqXG4gKiBUcmFuc3BpbGUgVHlwZVNjcmlwdCB0byBKYXZhU2NyaXB0LlxuICpcbiAqIE9wdGlvbnNcbiAqIC0tbGl2ZTogQ29udGludWUgd2F0Y2hpbmcgYWxsIGRpcmVjdG9yaWVzIGFuZCB0cmFuc3BpbGUgb24gZGV0ZWN0ZWQgY2hhbmdlcy5cbiAqIC0tY2xlYW46IERlbGV0ZSBvZiB0aGUgb3V0cHV0IGRpcmVjdG9yeSBiZWZvcmUgdHJhbnNwaWxpbmcuXG4gKiAtLXNpbGVudDogRGlzYWJsZSBhbnkgbG9nZ2luZyBvdXRwdXQuXG4gKiAtLWFsbDogVHJhbnNwaWxlIGFsbCByZXBvcy4gKGRlZmF1bHQpXG4gKiAtLXJlcG89bXktcmVwbzogVHJhbnNwaWxlIGEgc3BlY2lmaWMgcmVwby5cbiAqIC0tcmVwb3MtbXktcmVwby0xLG15LXJlcG8tMjogVHJhbnNwaWxlIGEgbGlzdCBvZiByZXBvcy5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICBhbGw6IGlzT3B0aW9uS2V5UHJvdmlkZWQoICdhbGwnICkgPyBnZXRPcHRpb24oICdhbGwnICkgOiB0cnVlXG59O1xuXG4vLyBUT0RPOiB1c2UgY29tYmluZU9wdGlvbnMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTUyM1xudHJhbnNwaWxlKCBfLmFzc2lnbkluKCBkZWZhdWx0T3B0aW9ucywgZ2V0VHJhbnNwaWxlQ0xJT3B0aW9ucygpICkgKTsiXSwibmFtZXMiOlsiXyIsImdldE9wdGlvbiIsImlzT3B0aW9uS2V5UHJvdmlkZWQiLCJ0cmFuc3BpbGUiLCJnZXRUcmFuc3BpbGVDTElPcHRpb25zIiwiZGVmYXVsdE9wdGlvbnMiLCJhbGwiLCJhc3NpZ25JbiJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXRELE9BQU9BLE9BQU8sU0FBUztBQUN2QixPQUFPQyxhQUFhQyxtQkFBbUIsUUFBUSwrREFBK0Q7QUFDOUcsT0FBT0MsYUFBYUMsc0JBQXNCLFFBQVEsNEJBQTRCO0FBRTlFOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUVELE1BQU1DLGlCQUFpQjtJQUNyQkMsS0FBS0osb0JBQXFCLFNBQVVELFVBQVcsU0FBVTtBQUMzRDtBQUVBLGdGQUFnRjtBQUNoRkUsVUFBV0gsRUFBRU8sUUFBUSxDQUFFRixnQkFBZ0JEIn0=