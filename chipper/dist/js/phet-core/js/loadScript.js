// Copyright 2013-2024, University of Colorado Boulder
/**
 * Loads a script
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
/*
 * Load a script. The only required argument is src, and can be specified either as
 * loadScript( "<url>" ) or loadScript( { src: "<url>", ... other options ... } ).
 *
 * Arguments:
 *   src:         The source of the script to load
 *   callback:    A callback to call (with no arguments) once the script is loaded and has been executed
 *   async:       Whether the script should be loaded asynchronously. Defaults to true
 *   cacheBust: Whether the URL should have an appended query string to work around caches
 */ function loadScript(inputArgs) {
    // handle a string argument
    const args = typeof inputArgs === 'string' ? {
        src: inputArgs
    } : inputArgs;
    const src = args.src;
    const callback = args.callback;
    const async = args.async === undefined ? true : args.async;
    const cacheBust = args.cacheBust === undefined ? false : args.cacheBust;
    let called = false;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = async;
    // @ts-expect-error
    script.onload = script.onreadystatechange = function() {
        // @ts-expect-error
        const state = this.readyState;
        if (state && state !== 'complete' && state !== 'loaded') {
            return;
        }
        if (!called) {
            called = true;
            if (callback) {
                callback();
            }
        }
    };
    // make sure things aren't cached, just in case
    script.src = src + (cacheBust ? `?random=${Math.random().toFixed(10)}` : ''); // eslint-disable-line phet/bad-sim-text
    const other = document.getElementsByTagName('script')[0];
    other.parentNode.insertBefore(script, other);
}
phetCore.register('loadScript', loadScript);
export default loadScript;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9sb2FkU2NyaXB0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIExvYWRzIGEgc2NyaXB0XG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcblxudHlwZSBMb2FkU2NyaXB0QXJncyA9IHtcbiAgc3JjOiBzdHJpbmc7XG4gIGNhbGxiYWNrPzogVm9pZEZ1bmN0aW9uO1xuICBhc3luYz86IGJvb2xlYW47XG4gIGNhY2hlQnVzdD86IGJvb2xlYW47XG59O1xuXG4vKlxuICogTG9hZCBhIHNjcmlwdC4gVGhlIG9ubHkgcmVxdWlyZWQgYXJndW1lbnQgaXMgc3JjLCBhbmQgY2FuIGJlIHNwZWNpZmllZCBlaXRoZXIgYXNcbiAqIGxvYWRTY3JpcHQoIFwiPHVybD5cIiApIG9yIGxvYWRTY3JpcHQoIHsgc3JjOiBcIjx1cmw+XCIsIC4uLiBvdGhlciBvcHRpb25zIC4uLiB9ICkuXG4gKlxuICogQXJndW1lbnRzOlxuICogICBzcmM6ICAgICAgICAgVGhlIHNvdXJjZSBvZiB0aGUgc2NyaXB0IHRvIGxvYWRcbiAqICAgY2FsbGJhY2s6ICAgIEEgY2FsbGJhY2sgdG8gY2FsbCAod2l0aCBubyBhcmd1bWVudHMpIG9uY2UgdGhlIHNjcmlwdCBpcyBsb2FkZWQgYW5kIGhhcyBiZWVuIGV4ZWN1dGVkXG4gKiAgIGFzeW5jOiAgICAgICBXaGV0aGVyIHRoZSBzY3JpcHQgc2hvdWxkIGJlIGxvYWRlZCBhc3luY2hyb25vdXNseS4gRGVmYXVsdHMgdG8gdHJ1ZVxuICogICBjYWNoZUJ1c3Q6IFdoZXRoZXIgdGhlIFVSTCBzaG91bGQgaGF2ZSBhbiBhcHBlbmRlZCBxdWVyeSBzdHJpbmcgdG8gd29yayBhcm91bmQgY2FjaGVzXG4gKi9cbmZ1bmN0aW9uIGxvYWRTY3JpcHQoIGlucHV0QXJnczogTG9hZFNjcmlwdEFyZ3MgfCBzdHJpbmcgKTogdm9pZCB7XG5cbiAgLy8gaGFuZGxlIGEgc3RyaW5nIGFyZ3VtZW50XG4gIGNvbnN0IGFyZ3MgPSB0eXBlb2YgaW5wdXRBcmdzID09PSAnc3RyaW5nJyA/IHsgc3JjOiBpbnB1dEFyZ3MgfSA6IGlucHV0QXJncztcblxuICBjb25zdCBzcmMgPSBhcmdzLnNyYztcbiAgY29uc3QgY2FsbGJhY2sgPSBhcmdzLmNhbGxiYWNrO1xuICBjb25zdCBhc3luYyA9IGFyZ3MuYXN5bmMgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBhcmdzLmFzeW5jO1xuICBjb25zdCBjYWNoZUJ1c3QgPSBhcmdzLmNhY2hlQnVzdCA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmdzLmNhY2hlQnVzdDtcblxuICBsZXQgY2FsbGVkID0gZmFsc2U7XG5cbiAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NjcmlwdCcgKTtcbiAgc2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgc2NyaXB0LmFzeW5jID0gYXN5bmM7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBzY3JpcHQub25sb2FkID0gc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMucmVhZHlTdGF0ZTtcbiAgICBpZiAoIHN0YXRlICYmIHN0YXRlICE9PSAnY29tcGxldGUnICYmIHN0YXRlICE9PSAnbG9hZGVkJyApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoICFjYWxsZWQgKSB7XG4gICAgICBjYWxsZWQgPSB0cnVlO1xuXG4gICAgICBpZiAoIGNhbGxiYWNrICkge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBtYWtlIHN1cmUgdGhpbmdzIGFyZW4ndCBjYWNoZWQsIGp1c3QgaW4gY2FzZVxuICBzY3JpcHQuc3JjID0gc3JjICsgKCBjYWNoZUJ1c3QgPyBgP3JhbmRvbT0ke01hdGgucmFuZG9tKCkudG9GaXhlZCggMTAgKX1gIDogJycgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuXG4gIGNvbnN0IG90aGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoICdzY3JpcHQnIClbIDAgXTtcbiAgb3RoZXIucGFyZW50Tm9kZSEuaW5zZXJ0QmVmb3JlKCBzY3JpcHQsIG90aGVyICk7XG59XG5cbnBoZXRDb3JlLnJlZ2lzdGVyKCAnbG9hZFNjcmlwdCcsIGxvYWRTY3JpcHQgKTtcblxuZXhwb3J0IGRlZmF1bHQgbG9hZFNjcmlwdDsiXSwibmFtZXMiOlsicGhldENvcmUiLCJsb2FkU2NyaXB0IiwiaW5wdXRBcmdzIiwiYXJncyIsInNyYyIsImNhbGxiYWNrIiwiYXN5bmMiLCJ1bmRlZmluZWQiLCJjYWNoZUJ1c3QiLCJjYWxsZWQiLCJzY3JpcHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0eXBlIiwib25sb2FkIiwib25yZWFkeXN0YXRlY2hhbmdlIiwic3RhdGUiLCJyZWFkeVN0YXRlIiwiTWF0aCIsInJhbmRvbSIsInRvRml4ZWQiLCJvdGhlciIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGNBQWMsZ0JBQWdCO0FBU3JDOzs7Ozs7Ozs7Q0FTQyxHQUNELFNBQVNDLFdBQVlDLFNBQWtDO0lBRXJELDJCQUEyQjtJQUMzQixNQUFNQyxPQUFPLE9BQU9ELGNBQWMsV0FBVztRQUFFRSxLQUFLRjtJQUFVLElBQUlBO0lBRWxFLE1BQU1FLE1BQU1ELEtBQUtDLEdBQUc7SUFDcEIsTUFBTUMsV0FBV0YsS0FBS0UsUUFBUTtJQUM5QixNQUFNQyxRQUFRSCxLQUFLRyxLQUFLLEtBQUtDLFlBQVksT0FBT0osS0FBS0csS0FBSztJQUMxRCxNQUFNRSxZQUFZTCxLQUFLSyxTQUFTLEtBQUtELFlBQVksUUFBUUosS0FBS0ssU0FBUztJQUV2RSxJQUFJQyxTQUFTO0lBRWIsTUFBTUMsU0FBU0MsU0FBU0MsYUFBYSxDQUFFO0lBQ3ZDRixPQUFPRyxJQUFJLEdBQUc7SUFDZEgsT0FBT0osS0FBSyxHQUFHQTtJQUVmLG1CQUFtQjtJQUNuQkksT0FBT0ksTUFBTSxHQUFHSixPQUFPSyxrQkFBa0IsR0FBRztRQUMxQyxtQkFBbUI7UUFDbkIsTUFBTUMsUUFBUSxJQUFJLENBQUNDLFVBQVU7UUFDN0IsSUFBS0QsU0FBU0EsVUFBVSxjQUFjQSxVQUFVLFVBQVc7WUFDekQ7UUFDRjtRQUVBLElBQUssQ0FBQ1AsUUFBUztZQUNiQSxTQUFTO1lBRVQsSUFBS0osVUFBVztnQkFDZEE7WUFDRjtRQUNGO0lBQ0Y7SUFFQSwrQ0FBK0M7SUFDL0NLLE9BQU9OLEdBQUcsR0FBR0EsTUFBUUksQ0FBQUEsWUFBWSxDQUFDLFFBQVEsRUFBRVUsS0FBS0MsTUFBTSxHQUFHQyxPQUFPLENBQUUsS0FBTSxHQUFHLEVBQUMsR0FBSyx3Q0FBd0M7SUFFMUgsTUFBTUMsUUFBUVYsU0FBU1csb0JBQW9CLENBQUUsU0FBVSxDQUFFLEVBQUc7SUFDNURELE1BQU1FLFVBQVUsQ0FBRUMsWUFBWSxDQUFFZCxRQUFRVztBQUMxQztBQUVBckIsU0FBU3lCLFFBQVEsQ0FBRSxjQUFjeEI7QUFFakMsZUFBZUEsV0FBVyJ9