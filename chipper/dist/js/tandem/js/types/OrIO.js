// Copyright 2020-2024, University of Colorado Boulder
/**
 * Parametric IOType that adds support for serializing an element as multiple types, as a composite. Serialization occurs
 * via a first-come-first-serialize basis, where the first parameterType will be the
 *
 * Sample usage:
 *
 * window.numberOrStringProperty = new Property( 'I am currently a string', {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'numberOrStringProperty' ),
      phetioValueType: OrIO( [ StringIO, NumberIO ] )
    } );
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import Validation from '../../../axon/js/Validation.js';
import IOTypeCache from '../IOTypeCache.js';
import tandemNamespace from '../tandemNamespace.js';
import IOType from './IOType.js';
import StateSchema from './StateSchema.js';
// cache each parameterized IOType so that it is only created once
const cache = new IOTypeCache();
/**
 * Parametric type constructor function, do not use `new`
 * @param parameterTypes - a list of IOType to combine into a single composite
 */ const OrIO = (parameterTypes)=>{
    assert && assert(Array.isArray(parameterTypes), 'OrIO needs to be an array');
    assert && assert(parameterTypes.length > 1, 'OrIO needs parameterTypes');
    const typeNames = parameterTypes.map((parameterType)=>parameterType.typeName);
    const key = typeNames.join(',');
    if (!cache.has(key)) {
        const isValidValue = (instance)=>{
            for(let i = 0; i < parameterTypes.length; i++){
                const parameterType = parameterTypes[i];
                if (Validation.isValueValid(instance, parameterType.validator)) {
                    return true;
                }
            }
            return false;
        };
        cache.set(key, new IOType(`OrIO<${typeNames.join(', ')}>`, {
            documentation: 'A PhET-iO Type adding support for a composite type that can be any of its parameters.',
            parameterTypes: parameterTypes,
            isValidValue: isValidValue,
            toStateObject: (instance)=>{
                for(let i = 0; i < parameterTypes.length; i++){
                    const parameterType = parameterTypes[i];
                    if (Validation.isValueValid(instance, parameterType.validator)) {
                        return {
                            index: i,
                            state: parameterType.toStateObject(instance)
                        };
                    }
                }
                throw new Error('somehow the instance was not valid, we should not get here. Why was isValidValue not used before this step?');
            },
            fromStateObject: (stateObject)=>{
                assert && assert(stateObject.hasOwnProperty('index'), 'index required for deserialization');
                assert && assert(stateObject.hasOwnProperty('state'), 'state required for deserialization');
                return parameterTypes[stateObject.index].fromStateObject(stateObject.state);
            },
            stateSchema: StateSchema.asValue(`${typeNames.join('|')}`, {
                isValidValue: (stateObject)=>{
                    // Check based on the parameter that serialized the state
                    if (typeof stateObject.index === 'number') {
                        return parameterTypes[stateObject.index].isStateObjectValid(stateObject.state);
                    }
                    return false;
                }
            })
        }));
    }
    return cache.get(key);
};
tandemNamespace.register('OrIO', OrIO);
export default OrIO;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9PcklPLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFBhcmFtZXRyaWMgSU9UeXBlIHRoYXQgYWRkcyBzdXBwb3J0IGZvciBzZXJpYWxpemluZyBhbiBlbGVtZW50IGFzIG11bHRpcGxlIHR5cGVzLCBhcyBhIGNvbXBvc2l0ZS4gU2VyaWFsaXphdGlvbiBvY2N1cnNcbiAqIHZpYSBhIGZpcnN0LWNvbWUtZmlyc3Qtc2VyaWFsaXplIGJhc2lzLCB3aGVyZSB0aGUgZmlyc3QgcGFyYW1ldGVyVHlwZSB3aWxsIGJlIHRoZVxuICpcbiAqIFNhbXBsZSB1c2FnZTpcbiAqXG4gKiB3aW5kb3cubnVtYmVyT3JTdHJpbmdQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggJ0kgYW0gY3VycmVudGx5IGEgc3RyaW5nJywge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uR0VORVJBTF9NT0RFTC5jcmVhdGVUYW5kZW0oICdudW1iZXJPclN0cmluZ1Byb3BlcnR5JyApLFxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBPcklPKCBbIFN0cmluZ0lPLCBOdW1iZXJJTyBdIClcbiAgICB9ICk7XG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBWYWxpZGF0aW9uIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVmFsaWRhdGlvbi5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBJT1R5cGVDYWNoZSBmcm9tICcuLi9JT1R5cGVDYWNoZS5qcyc7XG5pbXBvcnQgdGFuZGVtTmFtZXNwYWNlIGZyb20gJy4uL3RhbmRlbU5hbWVzcGFjZS5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4vSU9UeXBlLmpzJztcbmltcG9ydCBTdGF0ZVNjaGVtYSBmcm9tICcuL1N0YXRlU2NoZW1hLmpzJztcblxuLy8gY2FjaGUgZWFjaCBwYXJhbWV0ZXJpemVkIElPVHlwZSBzbyB0aGF0IGl0IGlzIG9ubHkgY3JlYXRlZCBvbmNlXG5jb25zdCBjYWNoZSA9IG5ldyBJT1R5cGVDYWNoZTxzdHJpbmc+KCk7XG5cbi8qKlxuICogUGFyYW1ldHJpYyB0eXBlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLCBkbyBub3QgdXNlIGBuZXdgXG4gKiBAcGFyYW0gcGFyYW1ldGVyVHlwZXMgLSBhIGxpc3Qgb2YgSU9UeXBlIHRvIGNvbWJpbmUgaW50byBhIHNpbmdsZSBjb21wb3NpdGVcbiAqL1xuY29uc3QgT3JJTyA9ICggcGFyYW1ldGVyVHlwZXM6IElPVHlwZVtdICk6IElPVHlwZSA9PiB7XG4gIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIHBhcmFtZXRlclR5cGVzICksICdPcklPIG5lZWRzIHRvIGJlIGFuIGFycmF5JyApO1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBwYXJhbWV0ZXJUeXBlcy5sZW5ndGggPiAxLCAnT3JJTyBuZWVkcyBwYXJhbWV0ZXJUeXBlcycgKTtcbiAgY29uc3QgdHlwZU5hbWVzID0gcGFyYW1ldGVyVHlwZXMubWFwKCBwYXJhbWV0ZXJUeXBlID0+IHBhcmFtZXRlclR5cGUudHlwZU5hbWUgKTtcbiAgY29uc3Qga2V5ID0gdHlwZU5hbWVzLmpvaW4oICcsJyApO1xuXG4gIGlmICggIWNhY2hlLmhhcygga2V5ICkgKSB7XG4gICAgY29uc3QgaXNWYWxpZFZhbHVlID0gKCBpbnN0YW5jZTogSW50ZW50aW9uYWxBbnkgKSA9PiB7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwYXJhbWV0ZXJUeXBlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgcGFyYW1ldGVyVHlwZSA9IHBhcmFtZXRlclR5cGVzWyBpIF07XG4gICAgICAgIGlmICggVmFsaWRhdGlvbi5pc1ZhbHVlVmFsaWQoIGluc3RhbmNlLCBwYXJhbWV0ZXJUeXBlLnZhbGlkYXRvciApICkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICBjYWNoZS5zZXQoIGtleSwgbmV3IElPVHlwZSggYE9ySU88JHt0eXBlTmFtZXMuam9pbiggJywgJyApfT5gLCB7XG4gICAgICBkb2N1bWVudGF0aW9uOiAnQSBQaEVULWlPIFR5cGUgYWRkaW5nIHN1cHBvcnQgZm9yIGEgY29tcG9zaXRlIHR5cGUgdGhhdCBjYW4gYmUgYW55IG9mIGl0cyBwYXJhbWV0ZXJzLicsXG4gICAgICBwYXJhbWV0ZXJUeXBlczogcGFyYW1ldGVyVHlwZXMsXG4gICAgICBpc1ZhbGlkVmFsdWU6IGlzVmFsaWRWYWx1ZSxcblxuICAgICAgdG9TdGF0ZU9iamVjdDogaW5zdGFuY2UgPT4ge1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwYXJhbWV0ZXJUeXBlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBjb25zdCBwYXJhbWV0ZXJUeXBlID0gcGFyYW1ldGVyVHlwZXNbIGkgXTtcbiAgICAgICAgICBpZiAoIFZhbGlkYXRpb24uaXNWYWx1ZVZhbGlkKCBpbnN0YW5jZSwgcGFyYW1ldGVyVHlwZS52YWxpZGF0b3IgKSApIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICBzdGF0ZTogcGFyYW1ldGVyVHlwZS50b1N0YXRlT2JqZWN0KCBpbnN0YW5jZSApXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdzb21laG93IHRoZSBpbnN0YW5jZSB3YXMgbm90IHZhbGlkLCB3ZSBzaG91bGQgbm90IGdldCBoZXJlLiBXaHkgd2FzIGlzVmFsaWRWYWx1ZSBub3QgdXNlZCBiZWZvcmUgdGhpcyBzdGVwPycgKTtcbiAgICAgIH0sXG5cbiAgICAgIGZyb21TdGF0ZU9iamVjdDogKCBzdGF0ZU9iamVjdDogSW50ZW50aW9uYWxBbnkgKSA9PiB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHN0YXRlT2JqZWN0Lmhhc093blByb3BlcnR5KCAnaW5kZXgnICksICdpbmRleCByZXF1aXJlZCBmb3IgZGVzZXJpYWxpemF0aW9uJyApO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdGF0ZU9iamVjdC5oYXNPd25Qcm9wZXJ0eSggJ3N0YXRlJyApLCAnc3RhdGUgcmVxdWlyZWQgZm9yIGRlc2VyaWFsaXphdGlvbicgKTtcbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlclR5cGVzWyBzdGF0ZU9iamVjdC5pbmRleCBdLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3Quc3RhdGUgKTtcbiAgICAgIH0sXG4gICAgICBzdGF0ZVNjaGVtYTogU3RhdGVTY2hlbWEuYXNWYWx1ZSggYCR7dHlwZU5hbWVzLmpvaW4oICd8JyApfWAsIHtcbiAgICAgICAgaXNWYWxpZFZhbHVlOiBzdGF0ZU9iamVjdCA9PiB7XG5cbiAgICAgICAgICAvLyBDaGVjayBiYXNlZCBvbiB0aGUgcGFyYW1ldGVyIHRoYXQgc2VyaWFsaXplZCB0aGUgc3RhdGVcbiAgICAgICAgICBpZiAoIHR5cGVvZiBzdGF0ZU9iamVjdC5pbmRleCA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyYW1ldGVyVHlwZXNbIHN0YXRlT2JqZWN0LmluZGV4IF0uaXNTdGF0ZU9iamVjdFZhbGlkKCBzdGF0ZU9iamVjdC5zdGF0ZSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gKVxuICAgIH0gKSApO1xuICB9XG5cbiAgcmV0dXJuIGNhY2hlLmdldCgga2V5ICkhO1xufTtcblxudGFuZGVtTmFtZXNwYWNlLnJlZ2lzdGVyKCAnT3JJTycsIE9ySU8gKTtcbmV4cG9ydCBkZWZhdWx0IE9ySU87Il0sIm5hbWVzIjpbIlZhbGlkYXRpb24iLCJJT1R5cGVDYWNoZSIsInRhbmRlbU5hbWVzcGFjZSIsIklPVHlwZSIsIlN0YXRlU2NoZW1hIiwiY2FjaGUiLCJPcklPIiwicGFyYW1ldGVyVHlwZXMiLCJhc3NlcnQiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJ0eXBlTmFtZXMiLCJtYXAiLCJwYXJhbWV0ZXJUeXBlIiwidHlwZU5hbWUiLCJrZXkiLCJqb2luIiwiaGFzIiwiaXNWYWxpZFZhbHVlIiwiaW5zdGFuY2UiLCJpIiwiaXNWYWx1ZVZhbGlkIiwidmFsaWRhdG9yIiwic2V0IiwiZG9jdW1lbnRhdGlvbiIsInRvU3RhdGVPYmplY3QiLCJpbmRleCIsInN0YXRlIiwiRXJyb3IiLCJmcm9tU3RhdGVPYmplY3QiLCJzdGF0ZU9iamVjdCIsImhhc093blByb3BlcnR5Iiwic3RhdGVTY2hlbWEiLCJhc1ZhbHVlIiwiaXNTdGF0ZU9iamVjdFZhbGlkIiwiZ2V0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7O0NBWUMsR0FFRCxPQUFPQSxnQkFBZ0IsaUNBQWlDO0FBRXhELE9BQU9DLGlCQUFpQixvQkFBb0I7QUFDNUMsT0FBT0MscUJBQXFCLHdCQUF3QjtBQUNwRCxPQUFPQyxZQUFZLGNBQWM7QUFDakMsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUUzQyxrRUFBa0U7QUFDbEUsTUFBTUMsUUFBUSxJQUFJSjtBQUVsQjs7O0NBR0MsR0FDRCxNQUFNSyxPQUFPLENBQUVDO0lBQ2JDLFVBQVVBLE9BQVFDLE1BQU1DLE9BQU8sQ0FBRUgsaUJBQWtCO0lBQ25EQyxVQUFVQSxPQUFRRCxlQUFlSSxNQUFNLEdBQUcsR0FBRztJQUM3QyxNQUFNQyxZQUFZTCxlQUFlTSxHQUFHLENBQUVDLENBQUFBLGdCQUFpQkEsY0FBY0MsUUFBUTtJQUM3RSxNQUFNQyxNQUFNSixVQUFVSyxJQUFJLENBQUU7SUFFNUIsSUFBSyxDQUFDWixNQUFNYSxHQUFHLENBQUVGLE1BQVE7UUFDdkIsTUFBTUcsZUFBZSxDQUFFQztZQUNyQixJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSWQsZUFBZUksTUFBTSxFQUFFVSxJQUFNO2dCQUNoRCxNQUFNUCxnQkFBZ0JQLGNBQWMsQ0FBRWMsRUFBRztnQkFDekMsSUFBS3JCLFdBQVdzQixZQUFZLENBQUVGLFVBQVVOLGNBQWNTLFNBQVMsR0FBSztvQkFDbEUsT0FBTztnQkFDVDtZQUNGO1lBQ0EsT0FBTztRQUNUO1FBQ0FsQixNQUFNbUIsR0FBRyxDQUFFUixLQUFLLElBQUliLE9BQVEsQ0FBQyxLQUFLLEVBQUVTLFVBQVVLLElBQUksQ0FBRSxNQUFPLENBQUMsQ0FBQyxFQUFFO1lBQzdEUSxlQUFlO1lBQ2ZsQixnQkFBZ0JBO1lBQ2hCWSxjQUFjQTtZQUVkTyxlQUFlTixDQUFBQTtnQkFDYixJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSWQsZUFBZUksTUFBTSxFQUFFVSxJQUFNO29CQUNoRCxNQUFNUCxnQkFBZ0JQLGNBQWMsQ0FBRWMsRUFBRztvQkFDekMsSUFBS3JCLFdBQVdzQixZQUFZLENBQUVGLFVBQVVOLGNBQWNTLFNBQVMsR0FBSzt3QkFDbEUsT0FBTzs0QkFDTEksT0FBT047NEJBQ1BPLE9BQU9kLGNBQWNZLGFBQWEsQ0FBRU47d0JBQ3RDO29CQUNGO2dCQUNGO2dCQUNBLE1BQU0sSUFBSVMsTUFBTztZQUNuQjtZQUVBQyxpQkFBaUIsQ0FBRUM7Z0JBQ2pCdkIsVUFBVUEsT0FBUXVCLFlBQVlDLGNBQWMsQ0FBRSxVQUFXO2dCQUN6RHhCLFVBQVVBLE9BQVF1QixZQUFZQyxjQUFjLENBQUUsVUFBVztnQkFDekQsT0FBT3pCLGNBQWMsQ0FBRXdCLFlBQVlKLEtBQUssQ0FBRSxDQUFDRyxlQUFlLENBQUVDLFlBQVlILEtBQUs7WUFDL0U7WUFDQUssYUFBYTdCLFlBQVk4QixPQUFPLENBQUUsR0FBR3RCLFVBQVVLLElBQUksQ0FBRSxNQUFPLEVBQUU7Z0JBQzVERSxjQUFjWSxDQUFBQTtvQkFFWix5REFBeUQ7b0JBQ3pELElBQUssT0FBT0EsWUFBWUosS0FBSyxLQUFLLFVBQVc7d0JBQzNDLE9BQU9wQixjQUFjLENBQUV3QixZQUFZSixLQUFLLENBQUUsQ0FBQ1Esa0JBQWtCLENBQUVKLFlBQVlILEtBQUs7b0JBQ2xGO29CQUNBLE9BQU87Z0JBQ1Q7WUFDRjtRQUNGO0lBQ0Y7SUFFQSxPQUFPdkIsTUFBTStCLEdBQUcsQ0FBRXBCO0FBQ3BCO0FBRUFkLGdCQUFnQm1DLFFBQVEsQ0FBRSxRQUFRL0I7QUFDbEMsZUFBZUEsS0FBSyJ9