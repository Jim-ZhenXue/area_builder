// Copyright 2021-2024, University of Colorado Boulder
import tandemNamespace from '../tandemNamespace.js';
import IOType from './IOType.js';
import StateSchema from './StateSchema.js';
/**
 * IOType that uses value semantics for toStateObject/fromStateObject
 * @author Sam Reid (PhET Interactive Simulations)
 */ const ValueIO = new IOType('ValueIO', {
    isValidValue: _.stubTrue,
    supertype: IOType.ObjectIO,
    toStateObject: (coreObject)=>coreObject,
    fromStateObject: (stateObject)=>stateObject,
    stateSchema: StateSchema.asValue('*', {
        isValidValue: _.stubTrue
    })
});
tandemNamespace.register('ValueIO', ValueIO);
export default ValueIO;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9WYWx1ZUlPLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCB0YW5kZW1OYW1lc3BhY2UgZnJvbSAnLi4vdGFuZGVtTmFtZXNwYWNlLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi9JT1R5cGUuanMnO1xuaW1wb3J0IFN0YXRlU2NoZW1hIGZyb20gJy4vU3RhdGVTY2hlbWEuanMnO1xuXG4vKipcbiAqIElPVHlwZSB0aGF0IHVzZXMgdmFsdWUgc2VtYW50aWNzIGZvciB0b1N0YXRlT2JqZWN0L2Zyb21TdGF0ZU9iamVjdFxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuY29uc3QgVmFsdWVJTyA9IG5ldyBJT1R5cGU8SW50ZW50aW9uYWxBbnksIEludGVudGlvbmFsQW55PiggJ1ZhbHVlSU8nLCB7XG4gIGlzVmFsaWRWYWx1ZTogXy5zdHViVHJ1ZSxcbiAgc3VwZXJ0eXBlOiBJT1R5cGUuT2JqZWN0SU8sXG4gIHRvU3RhdGVPYmplY3Q6IGNvcmVPYmplY3QgPT4gY29yZU9iamVjdCxcbiAgZnJvbVN0YXRlT2JqZWN0OiBzdGF0ZU9iamVjdCA9PiBzdGF0ZU9iamVjdCxcbiAgc3RhdGVTY2hlbWE6IFN0YXRlU2NoZW1hLmFzVmFsdWUoICcqJywgeyBpc1ZhbGlkVmFsdWU6IF8uc3R1YlRydWUgfSApXG59ICk7XG5cbnRhbmRlbU5hbWVzcGFjZS5yZWdpc3RlciggJ1ZhbHVlSU8nLCBWYWx1ZUlPICk7XG5leHBvcnQgZGVmYXVsdCBWYWx1ZUlPOyJdLCJuYW1lcyI6WyJ0YW5kZW1OYW1lc3BhY2UiLCJJT1R5cGUiLCJTdGF0ZVNjaGVtYSIsIlZhbHVlSU8iLCJpc1ZhbGlkVmFsdWUiLCJfIiwic3R1YlRydWUiLCJzdXBlcnR5cGUiLCJPYmplY3RJTyIsInRvU3RhdGVPYmplY3QiLCJjb3JlT2JqZWN0IiwiZnJvbVN0YXRlT2JqZWN0Iiwic3RhdGVPYmplY3QiLCJzdGF0ZVNjaGVtYSIsImFzVmFsdWUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBR3RELE9BQU9BLHFCQUFxQix3QkFBd0I7QUFDcEQsT0FBT0MsWUFBWSxjQUFjO0FBQ2pDLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFFM0M7OztDQUdDLEdBQ0QsTUFBTUMsVUFBVSxJQUFJRixPQUF3QyxXQUFXO0lBQ3JFRyxjQUFjQyxFQUFFQyxRQUFRO0lBQ3hCQyxXQUFXTixPQUFPTyxRQUFRO0lBQzFCQyxlQUFlQyxDQUFBQSxhQUFjQTtJQUM3QkMsaUJBQWlCQyxDQUFBQSxjQUFlQTtJQUNoQ0MsYUFBYVgsWUFBWVksT0FBTyxDQUFFLEtBQUs7UUFBRVYsY0FBY0MsRUFBRUMsUUFBUTtJQUFDO0FBQ3BFO0FBRUFOLGdCQUFnQmUsUUFBUSxDQUFFLFdBQVdaO0FBQ3JDLGVBQWVBLFFBQVEifQ==