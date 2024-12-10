// Copyright 2015-2024, University of Colorado Boulder
/**
 * Object pooling mixin, for cases where creating new objects is expensive, and we'd rather mark some objects as able
 * to be reused (i.e. 'in the pool'). This provides a pool of objects for each type it is invoked on. It allows for
 * getting "new" objects that can either be constructed OR pulled in from a pool, and requires that the objects are
 * essentially able to "re-run" the constructor. Then when putting the object back in the pool, references should be
 * released, so memory isn't leaked.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import extend from './extend.js';
import optionize from './optionize.js';
import phetCore from './phetCore.js';
/**
 * @deprecated - Please use Pool.ts instead as the new pooling pattern.
 */ const Poolable = {
    /**
   * Changes the given type (and its prototype) to support object pooling.
   */ mixInto (type, providedOptions) {
        const options = optionize()({
            defaultArguments: [],
            initialize: type.prototype.initialize,
            maxSize: 100,
            initialSize: 0,
            useDefaultConstruction: false
        }, providedOptions);
        assert && assert(options.maxSize >= 0);
        assert && assert(options.initialSize >= 0);
        // The actual array we store things in. Always push/pop.
        const pool = [];
        let maxPoolSize = options.maxSize;
        // There is a madness to this craziness. We'd want to use the method noted at
        // https://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible, but the type is
        // not provided in the arguments array below. By calling bind on itself, we're able to get a version of bind that
        // inserts the constructor as the first argument of the .apply called later so we don't create garbage by having
        // to pack `arguments` into an array AND THEN concatenate it with a new first element (the type itself).
        const partialConstructor = Function.prototype.bind.bind(type, type);
        // Basically our type constructor, but with the default arguments included already.
        const DefaultConstructor = partialConstructor(...options.defaultArguments);
        const initialize = options.initialize;
        const useDefaultConstruction = options.useDefaultConstruction;
        const proto = type.prototype;
        extend(type, {
            /**
       * This should not be modified externally. In the future if desired, functions could be added to help
       * adding/removing poolable instances manually.
       */ pool: pool,
            /**
       * Returns an object with arbitrary state (possibly constructed with the default arguments).
       */ dirtyFromPool () {
                return pool.length ? pool.pop() : new DefaultConstructor();
            },
            /**
       * Returns an object that behaves as if it was constructed with the given arguments. May result in a new object
       * being created (if the pool is empty), or it may use the constructor to mutate an object from the pool.
       */ createFromPool (...args) {
                let result;
                if (pool.length) {
                    result = pool.pop();
                    initialize.apply(result, args);
                } else if (useDefaultConstruction) {
                    result = new DefaultConstructor();
                    initialize.apply(result, args);
                } else {
                    result = new (partialConstructor(...args))();
                }
                return result;
            },
            /**
       * Returns the current size of the pool.
       */ get poolSize () {
                return pool.length;
            },
            /**
       * Sets the maximum pool size.
       */ set maxPoolSize (value){
                assert && assert(value === Number.POSITIVE_INFINITY || Number.isInteger(value) && value >= 0, 'maxPoolSize should be a non-negative integer or infinity');
                maxPoolSize = value;
            },
            /**
       * Returns the maximum pool size.
       */ get maxPoolSize () {
                return maxPoolSize;
            }
        });
        extend(proto, {
            /**
       * Adds this object into the pool, so that it can be reused elsewhere. Generally when this is done, no other
       * references to the object should be held (since they should not be used at all).
       */ freeToPool () {
                if (pool.length < maxPoolSize) {
                    pool.push(this);
                }
            }
        });
        // Initialize the pool (if it should have objects)
        while(pool.length < options.initialSize){
            pool.push(new DefaultConstructor());
        }
        return type;
    }
};
phetCore.register('Poolable', Poolable);
export default Poolable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sYWJsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBPYmplY3QgcG9vbGluZyBtaXhpbiwgZm9yIGNhc2VzIHdoZXJlIGNyZWF0aW5nIG5ldyBvYmplY3RzIGlzIGV4cGVuc2l2ZSwgYW5kIHdlJ2QgcmF0aGVyIG1hcmsgc29tZSBvYmplY3RzIGFzIGFibGVcbiAqIHRvIGJlIHJldXNlZCAoaS5lLiAnaW4gdGhlIHBvb2wnKS4gVGhpcyBwcm92aWRlcyBhIHBvb2wgb2Ygb2JqZWN0cyBmb3IgZWFjaCB0eXBlIGl0IGlzIGludm9rZWQgb24uIEl0IGFsbG93cyBmb3JcbiAqIGdldHRpbmcgXCJuZXdcIiBvYmplY3RzIHRoYXQgY2FuIGVpdGhlciBiZSBjb25zdHJ1Y3RlZCBPUiBwdWxsZWQgaW4gZnJvbSBhIHBvb2wsIGFuZCByZXF1aXJlcyB0aGF0IHRoZSBvYmplY3RzIGFyZVxuICogZXNzZW50aWFsbHkgYWJsZSB0byBcInJlLXJ1blwiIHRoZSBjb25zdHJ1Y3Rvci4gVGhlbiB3aGVuIHB1dHRpbmcgdGhlIG9iamVjdCBiYWNrIGluIHRoZSBwb29sLCByZWZlcmVuY2VzIHNob3VsZCBiZVxuICogcmVsZWFzZWQsIHNvIG1lbW9yeSBpc24ndCBsZWFrZWQuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBleHRlbmQgZnJvbSAnLi9leHRlbmQuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgcGhldENvcmUgZnJvbSAnLi9waGV0Q29yZS5qcyc7XG5pbXBvcnQgQ29uc3RydWN0b3IgZnJvbSAnLi90eXBlcy9Db25zdHJ1Y3Rvci5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5cbnR5cGUgUG9vbGFibGVPcHRpb25zPFR5cGUgZXh0ZW5kcyBDb25zdHJ1Y3Rvcj4gPSB7XG4gIC8vIElmIGFuIG9iamVjdCBuZWVkcyB0byBiZSBjcmVhdGVkIHdpdGhvdXQgYSBkaXJlY3QgY2FsbCAoc2F5LCB0byBmaWxsIHRoZSBwb29sIGluaXRpYWxseSksIHRoZXNlIGFyZSB0aGUgYXJndW1lbnRzXG4gIC8vIHRoYXQgd2lsbCBiZSBwYXNzZWQgaW50byB0aGUgY29uc3RydWN0b3JcbiAgZGVmYXVsdEFyZ3VtZW50cz86IENvbnN0cnVjdG9yUGFyYW1ldGVyczxUeXBlPjtcblxuICAvLyBUaGUgZnVuY3Rpb24gdG8gY2FsbCBvbiB0aGUgb2JqZWN0cyB0byByZWluaXRpYWxpemUgdGhlbSAodGhhdCBpcyBlaXRoZXIgdGhlIGNvbnN0cnVjdG9yLCBvciBhY3RzIGxpa2UgdGhlXG4gIC8vIGNvbnN0cnVjdG9yKS5cbiAgaW5pdGlhbGl6ZT86IFBvb2xhYmxlSW5pdGlhbGl6ZXI8VHlwZT47XG5cbiAgLy8gQSBsaW1pdCBmb3IgdGhlIHBvb2wgc2l6ZSAoc28gd2UgZG9uJ3QgbGVhayBtZW1vcnkgYnkgZ3Jvd2luZyB0aGUgcG9vbCBmYXN0ZXIgdGhhbiB3ZSB0YWtlIHRoaW5ncyBmcm9tIGl0KS4gQ2FuIGJlXG4gIC8vIGN1c3RvbWl6ZWQgYnkgc2V0dGluZyBUeXBlLm1heFBvb2xTaXplXG4gIG1heFNpemU/OiBudW1iZXI7XG5cbiAgLy8gVGhlIGluaXRpYWwgc2l6ZSBvZiB0aGUgcG9vbC4gVG8gZmlsbCBpdCwgb2JqZWN0cyB3aWxsIGJlIGNyZWF0ZWQgd2l0aCB0aGUgZGVmYXVsdCBhcmd1bWVudHMuXG4gIGluaXRpYWxTaXplPzogbnVtYmVyO1xuXG4gIC8vIElmIHRydWUsIHdoZW4gY29uc3RydWN0aW5nIHRoZSBkZWZhdWx0IGFyZ3VtZW50cyB3aWxsIGFsd2F5cyBiZSB1c2VkIChhbmQgdGhlbiBpbml0aWFsaXplZCB3aXRoIHRoZSBpbml0aWFsaXplcilcbiAgLy8gaW5zdGVhZCBvZiBqdXN0IHByb3ZpZGluZyB0aGUgYXJndW1lbnRzIHN0cmFpZ2h0IHRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgdXNlRGVmYXVsdENvbnN0cnVjdGlvbj86IGJvb2xlYW47XG59O1xudHlwZSBQb29sYWJsZUluc3RhbmNlID0ge1xuICBmcmVlVG9Qb29sKCk6IHZvaWQ7XG59O1xudHlwZSBQb29sYWJsZVZlcnNpb248VHlwZSBleHRlbmRzIENvbnN0cnVjdG9yPiA9IEluc3RhbmNlVHlwZTxUeXBlPiAmIFBvb2xhYmxlSW5zdGFuY2U7XG50eXBlIFBvb2xhYmxlSW5pdGlhbGl6ZXI8VHlwZSBleHRlbmRzIENvbnN0cnVjdG9yPiA9ICggLi4uYXJnczogQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFR5cGU+ICkgPT4gSW50ZW50aW9uYWxBbnk7XG50eXBlIFBvb2xhYmxlQ2xhc3M8VHlwZSBleHRlbmRzIENvbnN0cnVjdG9yPiA9ICggbmV3ICggLi4uYXJnczogQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFR5cGU+ICkgPT4gKCBQb29sYWJsZVZlcnNpb248VHlwZT4gKSApICYgUG9vbGFibGVUeXBlPFR5cGU+O1xudHlwZSBQb29sYWJsZUV4aXN0aW5nU3RhdGljczxUeXBlIGV4dGVuZHMgQ29uc3RydWN0b3I+ID0ge1xuICAvLyBXZSBncmFiIHRoZSBzdGF0aWMgdmFsdWVzIG9mIGEgdHlwZVxuICBbUHJvcGVydHkgaW4ga2V5b2YgVHlwZV06IFR5cGVbIFByb3BlcnR5IF1cbn07XG50eXBlIFBvb2xhYmxlVHlwZTxUeXBlIGV4dGVuZHMgQ29uc3RydWN0b3I+ID0ge1xuICBwb29sOiBQb29sYWJsZVZlcnNpb248VHlwZT5bXTtcbiAgZGlydHlGcm9tUG9vbCgpOiBQb29sYWJsZVZlcnNpb248VHlwZT47XG4gIGNyZWF0ZUZyb21Qb29sKCAuLi5hcmdzOiBDb25zdHJ1Y3RvclBhcmFtZXRlcnM8VHlwZT4gKTogUG9vbGFibGVWZXJzaW9uPFR5cGU+O1xuICBnZXQgcG9vbFNpemUoKTogbnVtYmVyO1xuICBzZXQgbWF4UG9vbFNpemUoIHZhbHVlOiBudW1iZXIgKTtcbiAgZ2V0IG1heFBvb2xTaXplKCk6IG51bWJlcjtcbn0gJiBQb29sYWJsZUV4aXN0aW5nU3RhdGljczxUeXBlPjtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCAtIFBsZWFzZSB1c2UgUG9vbC50cyBpbnN0ZWFkIGFzIHRoZSBuZXcgcG9vbGluZyBwYXR0ZXJuLlxuICovXG5jb25zdCBQb29sYWJsZSA9IHtcbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIGdpdmVuIHR5cGUgKGFuZCBpdHMgcHJvdG90eXBlKSB0byBzdXBwb3J0IG9iamVjdCBwb29saW5nLlxuICAgKi9cbiAgbWl4SW50bzxUeXBlIGV4dGVuZHMgQ29uc3RydWN0b3I+KCB0eXBlOiBUeXBlLCBwcm92aWRlZE9wdGlvbnM/OiBQb29sYWJsZU9wdGlvbnM8VHlwZT4gKTogUG9vbGFibGVDbGFzczxUeXBlPiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQb29sYWJsZU9wdGlvbnM8VHlwZT4sIFBvb2xhYmxlT3B0aW9uczxUeXBlPj4oKSgge1xuXG4gICAgICBkZWZhdWx0QXJndW1lbnRzOiBbXSBhcyB1bmtub3duIGFzIENvbnN0cnVjdG9yUGFyYW1ldGVyczxUeXBlPixcbiAgICAgIGluaXRpYWxpemU6IHR5cGUucHJvdG90eXBlLmluaXRpYWxpemUsXG4gICAgICBtYXhTaXplOiAxMDAsXG4gICAgICBpbml0aWFsU2l6ZTogMCxcbiAgICAgIHVzZURlZmF1bHRDb25zdHJ1Y3Rpb246IGZhbHNlXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICkgYXMgUmVxdWlyZWQ8UG9vbGFibGVPcHRpb25zPFR5cGU+PjtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMubWF4U2l6ZSA+PSAwICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5pbml0aWFsU2l6ZSA+PSAwICk7XG5cbiAgICAvLyBUaGUgYWN0dWFsIGFycmF5IHdlIHN0b3JlIHRoaW5ncyBpbi4gQWx3YXlzIHB1c2gvcG9wLlxuICAgIGNvbnN0IHBvb2w6IEluc3RhbmNlVHlwZTxUeXBlPltdID0gW107XG5cbiAgICBsZXQgbWF4UG9vbFNpemUgPSBvcHRpb25zLm1heFNpemU7XG5cbiAgICAvLyBUaGVyZSBpcyBhIG1hZG5lc3MgdG8gdGhpcyBjcmF6aW5lc3MuIFdlJ2Qgd2FudCB0byB1c2UgdGhlIG1ldGhvZCBub3RlZCBhdFxuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE2MDY3OTcvdXNlLW9mLWFwcGx5LXdpdGgtbmV3LW9wZXJhdG9yLWlzLXRoaXMtcG9zc2libGUsIGJ1dCB0aGUgdHlwZSBpc1xuICAgIC8vIG5vdCBwcm92aWRlZCBpbiB0aGUgYXJndW1lbnRzIGFycmF5IGJlbG93LiBCeSBjYWxsaW5nIGJpbmQgb24gaXRzZWxmLCB3ZSdyZSBhYmxlIHRvIGdldCBhIHZlcnNpb24gb2YgYmluZCB0aGF0XG4gICAgLy8gaW5zZXJ0cyB0aGUgY29uc3RydWN0b3IgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IG9mIHRoZSAuYXBwbHkgY2FsbGVkIGxhdGVyIHNvIHdlIGRvbid0IGNyZWF0ZSBnYXJiYWdlIGJ5IGhhdmluZ1xuICAgIC8vIHRvIHBhY2sgYGFyZ3VtZW50c2AgaW50byBhbiBhcnJheSBBTkQgVEhFTiBjb25jYXRlbmF0ZSBpdCB3aXRoIGEgbmV3IGZpcnN0IGVsZW1lbnQgKHRoZSB0eXBlIGl0c2VsZikuXG4gICAgY29uc3QgcGFydGlhbENvbnN0cnVjdG9yID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuYmluZCggdHlwZSwgdHlwZSApO1xuXG4gICAgLy8gQmFzaWNhbGx5IG91ciB0eXBlIGNvbnN0cnVjdG9yLCBidXQgd2l0aCB0aGUgZGVmYXVsdCBhcmd1bWVudHMgaW5jbHVkZWQgYWxyZWFkeS5cbiAgICBjb25zdCBEZWZhdWx0Q29uc3RydWN0b3IgPSBwYXJ0aWFsQ29uc3RydWN0b3IoIC4uLm9wdGlvbnMuZGVmYXVsdEFyZ3VtZW50cyApO1xuXG4gICAgY29uc3QgaW5pdGlhbGl6ZSA9IG9wdGlvbnMuaW5pdGlhbGl6ZTtcbiAgICBjb25zdCB1c2VEZWZhdWx0Q29uc3RydWN0aW9uID0gb3B0aW9ucy51c2VEZWZhdWx0Q29uc3RydWN0aW9uO1xuXG4gICAgY29uc3QgcHJvdG8gPSB0eXBlLnByb3RvdHlwZTtcblxuICAgIGV4dGVuZDxUeXBlPiggdHlwZSwge1xuICAgICAgLyoqXG4gICAgICAgKiBUaGlzIHNob3VsZCBub3QgYmUgbW9kaWZpZWQgZXh0ZXJuYWxseS4gSW4gdGhlIGZ1dHVyZSBpZiBkZXNpcmVkLCBmdW5jdGlvbnMgY291bGQgYmUgYWRkZWQgdG8gaGVscFxuICAgICAgICogYWRkaW5nL3JlbW92aW5nIHBvb2xhYmxlIGluc3RhbmNlcyBtYW51YWxseS5cbiAgICAgICAqL1xuICAgICAgcG9vbDogcG9vbCxcblxuICAgICAgLyoqXG4gICAgICAgKiBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIGFyYml0cmFyeSBzdGF0ZSAocG9zc2libHkgY29uc3RydWN0ZWQgd2l0aCB0aGUgZGVmYXVsdCBhcmd1bWVudHMpLlxuICAgICAgICovXG4gICAgICBkaXJ0eUZyb21Qb29sKCk6IFBvb2xhYmxlVmVyc2lvbjxUeXBlPiB7XG4gICAgICAgIHJldHVybiBwb29sLmxlbmd0aCA/IHBvb2wucG9wKCkgOiBuZXcgRGVmYXVsdENvbnN0cnVjdG9yKCk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgYmVoYXZlcyBhcyBpZiBpdCB3YXMgY29uc3RydWN0ZWQgd2l0aCB0aGUgZ2l2ZW4gYXJndW1lbnRzLiBNYXkgcmVzdWx0IGluIGEgbmV3IG9iamVjdFxuICAgICAgICogYmVpbmcgY3JlYXRlZCAoaWYgdGhlIHBvb2wgaXMgZW1wdHkpLCBvciBpdCBtYXkgdXNlIHRoZSBjb25zdHJ1Y3RvciB0byBtdXRhdGUgYW4gb2JqZWN0IGZyb20gdGhlIHBvb2wuXG4gICAgICAgKi9cbiAgICAgIGNyZWF0ZUZyb21Qb29sKCAuLi5hcmdzOiBDb25zdHJ1Y3RvclBhcmFtZXRlcnM8VHlwZT4gKTogUG9vbGFibGVWZXJzaW9uPFR5cGU+IHtcbiAgICAgICAgbGV0IHJlc3VsdDtcblxuICAgICAgICBpZiAoIHBvb2wubGVuZ3RoICkge1xuICAgICAgICAgIHJlc3VsdCA9IHBvb2wucG9wKCk7XG4gICAgICAgICAgaW5pdGlhbGl6ZS5hcHBseSggcmVzdWx0LCBhcmdzICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIHVzZURlZmF1bHRDb25zdHJ1Y3Rpb24gKSB7XG4gICAgICAgICAgcmVzdWx0ID0gbmV3IERlZmF1bHRDb25zdHJ1Y3RvcigpO1xuICAgICAgICAgIGluaXRpYWxpemUuYXBwbHkoIHJlc3VsdCwgYXJncyApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJlc3VsdCA9IG5ldyAoIHBhcnRpYWxDb25zdHJ1Y3RvciggLi4uYXJncyApICkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgc2l6ZSBvZiB0aGUgcG9vbC5cbiAgICAgICAqL1xuICAgICAgZ2V0IHBvb2xTaXplKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBwb29sLmxlbmd0aDtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB0aGUgbWF4aW11bSBwb29sIHNpemUuXG4gICAgICAgKi9cbiAgICAgIHNldCBtYXhQb29sU2l6ZSggdmFsdWU6IG51bWJlciApIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWUgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSB8fCAoIE51bWJlci5pc0ludGVnZXIoIHZhbHVlICkgJiYgdmFsdWUgPj0gMCApLCAnbWF4UG9vbFNpemUgc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXIgb3IgaW5maW5pdHknICk7XG5cbiAgICAgICAgbWF4UG9vbFNpemUgPSB2YWx1ZTtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0aGUgbWF4aW11bSBwb29sIHNpemUuXG4gICAgICAgKi9cbiAgICAgIGdldCBtYXhQb29sU2l6ZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gbWF4UG9vbFNpemU7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgZXh0ZW5kKCBwcm90bywge1xuICAgICAgLyoqXG4gICAgICAgKiBBZGRzIHRoaXMgb2JqZWN0IGludG8gdGhlIHBvb2wsIHNvIHRoYXQgaXQgY2FuIGJlIHJldXNlZCBlbHNld2hlcmUuIEdlbmVyYWxseSB3aGVuIHRoaXMgaXMgZG9uZSwgbm8gb3RoZXJcbiAgICAgICAqIHJlZmVyZW5jZXMgdG8gdGhlIG9iamVjdCBzaG91bGQgYmUgaGVsZCAoc2luY2UgdGhleSBzaG91bGQgbm90IGJlIHVzZWQgYXQgYWxsKS5cbiAgICAgICAqL1xuICAgICAgZnJlZVRvUG9vbCgpIHtcbiAgICAgICAgaWYgKCBwb29sLmxlbmd0aCA8IG1heFBvb2xTaXplICkge1xuICAgICAgICAgIHBvb2wucHVzaCggdGhpcyBhcyBJbnN0YW5jZVR5cGU8VHlwZT4gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIHBvb2wgKGlmIGl0IHNob3VsZCBoYXZlIG9iamVjdHMpXG4gICAgd2hpbGUgKCBwb29sLmxlbmd0aCA8IG9wdGlvbnMuaW5pdGlhbFNpemUgKSB7XG4gICAgICBwb29sLnB1c2goIG5ldyBEZWZhdWx0Q29uc3RydWN0b3IoKSApO1xuICAgIH1cblxuICAgIHJldHVybiB0eXBlIGFzIHVua25vd24gYXMgUG9vbGFibGVDbGFzczxUeXBlPjtcbiAgfVxufTtcblxucGhldENvcmUucmVnaXN0ZXIoICdQb29sYWJsZScsIFBvb2xhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFBvb2xhYmxlO1xuZXhwb3J0IHR5cGUgeyBQb29sYWJsZU9wdGlvbnMsIFBvb2xhYmxlSW5zdGFuY2UsIFBvb2xhYmxlVmVyc2lvbiwgUG9vbGFibGVJbml0aWFsaXplciwgUG9vbGFibGVDbGFzcywgUG9vbGFibGVUeXBlIH07Il0sIm5hbWVzIjpbImV4dGVuZCIsIm9wdGlvbml6ZSIsInBoZXRDb3JlIiwiUG9vbGFibGUiLCJtaXhJbnRvIiwidHlwZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJkZWZhdWx0QXJndW1lbnRzIiwiaW5pdGlhbGl6ZSIsInByb3RvdHlwZSIsIm1heFNpemUiLCJpbml0aWFsU2l6ZSIsInVzZURlZmF1bHRDb25zdHJ1Y3Rpb24iLCJhc3NlcnQiLCJwb29sIiwibWF4UG9vbFNpemUiLCJwYXJ0aWFsQ29uc3RydWN0b3IiLCJGdW5jdGlvbiIsImJpbmQiLCJEZWZhdWx0Q29uc3RydWN0b3IiLCJwcm90byIsImRpcnR5RnJvbVBvb2wiLCJsZW5ndGgiLCJwb3AiLCJjcmVhdGVGcm9tUG9vbCIsImFyZ3MiLCJyZXN1bHQiLCJhcHBseSIsInBvb2xTaXplIiwidmFsdWUiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImlzSW50ZWdlciIsImZyZWVUb1Bvb2wiLCJwdXNoIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Q0FRQyxHQUVELE9BQU9BLFlBQVksY0FBYztBQUNqQyxPQUFPQyxlQUFlLGlCQUFpQjtBQUN2QyxPQUFPQyxjQUFjLGdCQUFnQjtBQTJDckM7O0NBRUMsR0FDRCxNQUFNQyxXQUFXO0lBQ2Y7O0dBRUMsR0FDREMsU0FBbUNDLElBQVUsRUFBRUMsZUFBdUM7UUFDcEYsTUFBTUMsVUFBVU4sWUFBMkQ7WUFFekVPLGtCQUFrQixFQUFFO1lBQ3BCQyxZQUFZSixLQUFLSyxTQUFTLENBQUNELFVBQVU7WUFDckNFLFNBQVM7WUFDVEMsYUFBYTtZQUNiQyx3QkFBd0I7UUFDMUIsR0FBR1A7UUFFSFEsVUFBVUEsT0FBUVAsUUFBUUksT0FBTyxJQUFJO1FBQ3JDRyxVQUFVQSxPQUFRUCxRQUFRSyxXQUFXLElBQUk7UUFFekMsd0RBQXdEO1FBQ3hELE1BQU1HLE9BQTZCLEVBQUU7UUFFckMsSUFBSUMsY0FBY1QsUUFBUUksT0FBTztRQUVqQyw2RUFBNkU7UUFDN0UsK0dBQStHO1FBQy9HLGlIQUFpSDtRQUNqSCxnSEFBZ0g7UUFDaEgsd0dBQXdHO1FBQ3hHLE1BQU1NLHFCQUFxQkMsU0FBU1IsU0FBUyxDQUFDUyxJQUFJLENBQUNBLElBQUksQ0FBRWQsTUFBTUE7UUFFL0QsbUZBQW1GO1FBQ25GLE1BQU1lLHFCQUFxQkgsc0JBQXVCVixRQUFRQyxnQkFBZ0I7UUFFMUUsTUFBTUMsYUFBYUYsUUFBUUUsVUFBVTtRQUNyQyxNQUFNSSx5QkFBeUJOLFFBQVFNLHNCQUFzQjtRQUU3RCxNQUFNUSxRQUFRaEIsS0FBS0ssU0FBUztRQUU1QlYsT0FBY0ssTUFBTTtZQUNsQjs7O09BR0MsR0FDRFUsTUFBTUE7WUFFTjs7T0FFQyxHQUNETztnQkFDRSxPQUFPUCxLQUFLUSxNQUFNLEdBQUdSLEtBQUtTLEdBQUcsS0FBSyxJQUFJSjtZQUN4QztZQUVBOzs7T0FHQyxHQUNESyxnQkFBZ0IsR0FBR0MsSUFBaUM7Z0JBQ2xELElBQUlDO2dCQUVKLElBQUtaLEtBQUtRLE1BQU0sRUFBRztvQkFDakJJLFNBQVNaLEtBQUtTLEdBQUc7b0JBQ2pCZixXQUFXbUIsS0FBSyxDQUFFRCxRQUFRRDtnQkFDNUIsT0FDSyxJQUFLYix3QkFBeUI7b0JBQ2pDYyxTQUFTLElBQUlQO29CQUNiWCxXQUFXbUIsS0FBSyxDQUFFRCxRQUFRRDtnQkFDNUIsT0FDSztvQkFDSEMsU0FBUyxJQUFNVixDQUFBQSxzQkFBdUJTLEtBQUs7Z0JBQzdDO2dCQUVBLE9BQU9DO1lBQ1Q7WUFFQTs7T0FFQyxHQUNELElBQUlFLFlBQW1CO2dCQUNyQixPQUFPZCxLQUFLUSxNQUFNO1lBQ3BCO1lBRUE7O09BRUMsR0FDRCxJQUFJUCxhQUFhYyxNQUFnQjtnQkFDL0JoQixVQUFVQSxPQUFRZ0IsVUFBVUMsT0FBT0MsaUJBQWlCLElBQU1ELE9BQU9FLFNBQVMsQ0FBRUgsVUFBV0EsU0FBUyxHQUFLO2dCQUVyR2QsY0FBY2M7WUFDaEI7WUFFQTs7T0FFQyxHQUNELElBQUlkLGVBQXNCO2dCQUN4QixPQUFPQTtZQUNUO1FBQ0Y7UUFFQWhCLE9BQVFxQixPQUFPO1lBQ2I7OztPQUdDLEdBQ0RhO2dCQUNFLElBQUtuQixLQUFLUSxNQUFNLEdBQUdQLGFBQWM7b0JBQy9CRCxLQUFLb0IsSUFBSSxDQUFFLElBQUk7Z0JBQ2pCO1lBQ0Y7UUFDRjtRQUVBLGtEQUFrRDtRQUNsRCxNQUFRcEIsS0FBS1EsTUFBTSxHQUFHaEIsUUFBUUssV0FBVyxDQUFHO1lBQzFDRyxLQUFLb0IsSUFBSSxDQUFFLElBQUlmO1FBQ2pCO1FBRUEsT0FBT2Y7SUFDVDtBQUNGO0FBRUFILFNBQVNrQyxRQUFRLENBQUUsWUFBWWpDO0FBRS9CLGVBQWVBLFNBQVMifQ==