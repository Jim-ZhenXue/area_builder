// Copyright 2015-2024, University of Colorado Boulder
/**
 * For debugging or usage in the console, Namespace associates modules with a namespaced global for use in the browser.
 * This does not work in Node.js.
 *
 * @author Jonathan Olson
 * @author Chris Malley (PixelZoom, Inc.)
 */ let Namespace = class Namespace {
    /**
   * Registers a key-value pair with the namespace.
   *
   * If there are no dots ('.') in the key, it will be assigned to the namespace. For example:
   * - x.register( 'A', A );
   * will set x.A = A.
   *
   * If the key contains one or more dots ('.'), it's treated somewhat like a path expression. For instance, if the
   * following is called:
   * - x.register( 'A.B.C', C );
   * then the register function will navigate to the object x.A.B and add x.A.B.C = C.
   */ register(key, value) {
        // Unsupported in Node.js
        if (typeof window === 'undefined') {
            return value;
        }
        // When using hot module replacement, a module will be loaded and initialized twice, and hence its namespace.register
        // function will be called twice.  This should not be an assertion error.
        // If the key isn't compound (doesn't contain '.'), we can just look it up on this namespace
        if (key.includes('.')) {
            // @ts-expect-error
            assert && assert(!this[key], `${key} is already registered for namespace ${this.name}`);
            // @ts-expect-error
            this[key] = value;
        } else {
            const keys = key.split('.'); // e.g. [ 'A', 'B', 'C' ]
            // Walk into the namespace, verifying that each level exists. e.g. parent => x.A.B
            let parent = this; // eslint-disable-line consistent-this, @typescript-eslint/no-this-alias
            for(let i = 0; i < keys.length - 1; i++){
                // @ts-expect-error
                assert && assert(!!parent[keys[i]], `${[
                    this.name
                ].concat(keys.slice(0, i + 1)).join('.')} needs to be defined to register ${key}`);
                // @ts-expect-error
                parent = parent[keys[i]];
            }
            // Write into the inner namespace, e.g. x.A.B[ 'C' ] = C
            const lastKey = keys[keys.length - 1];
            // @ts-expect-error
            assert && assert(!parent[lastKey], `${key} is already registered for namespace ${this.name}`);
            // @ts-expect-error
            parent[lastKey] = value;
        }
        return value;
    }
    constructor(name){
        this.name = name;
        // Unsupported in Node.js
        if (typeof window === 'undefined') {
            return;
        }
        if (window.phet) {
            // We already create the chipper namespace, so we just attach to it with the register function.
            if (name === 'chipper') {
                window.phet.chipper.name = 'chipper';
                window.phet.chipper.register = this.register.bind(window.phet.chipper);
                return window.phet.chipper; // eslint-disable-line -- we want to provide the namespace API on something already existing
            } else {
                /* TODO: Ideally we should always assert this, but in PhET-iO wrapper code, multiple built modules define the
           TODO: same namespace, this should be fixed in https://github.com/phetsims/phet-io-wrappers/issues/631 */ const ignoreAssertion = !_.hasIn(window, 'phet.chipper.brand');
                assert && !ignoreAssertion && assert(!window.phet[name], `namespace ${name} already exists`);
                window.phet[name] = this;
            }
        }
    }
};
export default Namespace;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9OYW1lc3BhY2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRm9yIGRlYnVnZ2luZyBvciB1c2FnZSBpbiB0aGUgY29uc29sZSwgTmFtZXNwYWNlIGFzc29jaWF0ZXMgbW9kdWxlcyB3aXRoIGEgbmFtZXNwYWNlZCBnbG9iYWwgZm9yIHVzZSBpbiB0aGUgYnJvd3Nlci5cbiAqIFRoaXMgZG9lcyBub3Qgd29yayBpbiBOb2RlLmpzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb25cbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuY2xhc3MgTmFtZXNwYWNlIHtcbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG5hbWU6IHN0cmluZyApIHtcblxuICAgIHRoaXMubmFtZSA9IG5hbWU7XG5cbiAgICAvLyBVbnN1cHBvcnRlZCBpbiBOb2RlLmpzXG4gICAgaWYgKCB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIHdpbmRvdy5waGV0ICkge1xuICAgICAgLy8gV2UgYWxyZWFkeSBjcmVhdGUgdGhlIGNoaXBwZXIgbmFtZXNwYWNlLCBzbyB3ZSBqdXN0IGF0dGFjaCB0byBpdCB3aXRoIHRoZSByZWdpc3RlciBmdW5jdGlvbi5cbiAgICAgIGlmICggbmFtZSA9PT0gJ2NoaXBwZXInICkge1xuICAgICAgICB3aW5kb3cucGhldC5jaGlwcGVyLm5hbWUgPSAnY2hpcHBlcic7XG4gICAgICAgIHdpbmRvdy5waGV0LmNoaXBwZXIucmVnaXN0ZXIgPSB0aGlzLnJlZ2lzdGVyLmJpbmQoIHdpbmRvdy5waGV0LmNoaXBwZXIgKTtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5waGV0LmNoaXBwZXI7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgLS0gd2Ugd2FudCB0byBwcm92aWRlIHRoZSBuYW1lc3BhY2UgQVBJIG9uIHNvbWV0aGluZyBhbHJlYWR5IGV4aXN0aW5nXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLyogVE9ETzogSWRlYWxseSB3ZSBzaG91bGQgYWx3YXlzIGFzc2VydCB0aGlzLCBidXQgaW4gUGhFVC1pTyB3cmFwcGVyIGNvZGUsIG11bHRpcGxlIGJ1aWx0IG1vZHVsZXMgZGVmaW5lIHRoZVxuICAgICAgICAgICBUT0RPOiBzYW1lIG5hbWVzcGFjZSwgdGhpcyBzaG91bGQgYmUgZml4ZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8td3JhcHBlcnMvaXNzdWVzLzYzMSAqL1xuICAgICAgICBjb25zdCBpZ25vcmVBc3NlcnRpb24gPSAhXy5oYXNJbiggd2luZG93LCAncGhldC5jaGlwcGVyLmJyYW5kJyApO1xuICAgICAgICBhc3NlcnQgJiYgIWlnbm9yZUFzc2VydGlvbiAmJiBhc3NlcnQoICF3aW5kb3cucGhldFsgbmFtZSBdLCBgbmFtZXNwYWNlICR7bmFtZX0gYWxyZWFkeSBleGlzdHNgICk7XG4gICAgICAgIHdpbmRvdy5waGV0WyBuYW1lIF0gPSB0aGlzO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBrZXktdmFsdWUgcGFpciB3aXRoIHRoZSBuYW1lc3BhY2UuXG4gICAqXG4gICAqIElmIHRoZXJlIGFyZSBubyBkb3RzICgnLicpIGluIHRoZSBrZXksIGl0IHdpbGwgYmUgYXNzaWduZWQgdG8gdGhlIG5hbWVzcGFjZS4gRm9yIGV4YW1wbGU6XG4gICAqIC0geC5yZWdpc3RlciggJ0EnLCBBICk7XG4gICAqIHdpbGwgc2V0IHguQSA9IEEuXG4gICAqXG4gICAqIElmIHRoZSBrZXkgY29udGFpbnMgb25lIG9yIG1vcmUgZG90cyAoJy4nKSwgaXQncyB0cmVhdGVkIHNvbWV3aGF0IGxpa2UgYSBwYXRoIGV4cHJlc3Npb24uIEZvciBpbnN0YW5jZSwgaWYgdGhlXG4gICAqIGZvbGxvd2luZyBpcyBjYWxsZWQ6XG4gICAqIC0geC5yZWdpc3RlciggJ0EuQi5DJywgQyApO1xuICAgKiB0aGVuIHRoZSByZWdpc3RlciBmdW5jdGlvbiB3aWxsIG5hdmlnYXRlIHRvIHRoZSBvYmplY3QgeC5BLkIgYW5kIGFkZCB4LkEuQi5DID0gQy5cbiAgICovXG4gIHB1YmxpYyByZWdpc3RlcjxUPigga2V5OiBzdHJpbmcsIHZhbHVlOiBUICk6IFQge1xuXG4gICAgLy8gVW5zdXBwb3J0ZWQgaW4gTm9kZS5qc1xuICAgIGlmICggdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgLy8gV2hlbiB1c2luZyBob3QgbW9kdWxlIHJlcGxhY2VtZW50LCBhIG1vZHVsZSB3aWxsIGJlIGxvYWRlZCBhbmQgaW5pdGlhbGl6ZWQgdHdpY2UsIGFuZCBoZW5jZSBpdHMgbmFtZXNwYWNlLnJlZ2lzdGVyXG4gICAgLy8gZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgdHdpY2UuICBUaGlzIHNob3VsZCBub3QgYmUgYW4gYXNzZXJ0aW9uIGVycm9yLlxuXG4gICAgLy8gSWYgdGhlIGtleSBpc24ndCBjb21wb3VuZCAoZG9lc24ndCBjb250YWluICcuJyksIHdlIGNhbiBqdXN0IGxvb2sgaXQgdXAgb24gdGhpcyBuYW1lc3BhY2VcbiAgICBpZiAoIGtleS5pbmNsdWRlcyggJy4nICkgKSB7XG5cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzWyBrZXkgXSwgYCR7a2V5fSBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQgZm9yIG5hbWVzcGFjZSAke3RoaXMubmFtZX1gICk7XG5cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIHRoaXNbIGtleSBdID0gdmFsdWU7XG4gICAgfVxuICAgIC8vIENvbXBvdW5kIChjb250YWlucyAnLicgYXQgbGVhc3Qgb25jZSkuIHgucmVnaXN0ZXIoICdBLkIuQycsIEMgKSBzaG91bGQgc2V0IHguQS5CLkMuXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBrZXlzID0ga2V5LnNwbGl0KCAnLicgKTsgLy8gZS5nLiBbICdBJywgJ0InLCAnQycgXVxuXG4gICAgICAvLyBXYWxrIGludG8gdGhlIG5hbWVzcGFjZSwgdmVyaWZ5aW5nIHRoYXQgZWFjaCBsZXZlbCBleGlzdHMuIGUuZy4gcGFyZW50ID0+IHguQS5CXG4gICAgICBsZXQgcGFyZW50ID0gdGhpczsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjb25zaXN0ZW50LXRoaXMsIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aCAtIDE7IGkrKyApIHsgLy8gZm9yIGFsbCBidXQgdGhlIGxhc3Qga2V5XG5cbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIXBhcmVudFsga2V5c1sgaSBdIF0sXG4gICAgICAgICAgYCR7WyB0aGlzLm5hbWUgXS5jb25jYXQoIGtleXMuc2xpY2UoIDAsIGkgKyAxICkgKS5qb2luKCAnLicgKX0gbmVlZHMgdG8gYmUgZGVmaW5lZCB0byByZWdpc3RlciAke2tleX1gICk7XG5cbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICBwYXJlbnQgPSBwYXJlbnRbIGtleXNbIGkgXSBdO1xuICAgICAgfVxuXG4gICAgICAvLyBXcml0ZSBpbnRvIHRoZSBpbm5lciBuYW1lc3BhY2UsIGUuZy4geC5BLkJbICdDJyBdID0gQ1xuICAgICAgY29uc3QgbGFzdEtleSA9IGtleXNbIGtleXMubGVuZ3RoIC0gMSBdO1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhcGFyZW50WyBsYXN0S2V5IF0sIGAke2tleX0gaXMgYWxyZWFkeSByZWdpc3RlcmVkIGZvciBuYW1lc3BhY2UgJHt0aGlzLm5hbWV9YCApO1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICBwYXJlbnRbIGxhc3RLZXkgXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBOYW1lc3BhY2U7Il0sIm5hbWVzIjpbIk5hbWVzcGFjZSIsInJlZ2lzdGVyIiwia2V5IiwidmFsdWUiLCJ3aW5kb3ciLCJpbmNsdWRlcyIsImFzc2VydCIsIm5hbWUiLCJrZXlzIiwic3BsaXQiLCJwYXJlbnQiLCJpIiwibGVuZ3RoIiwiY29uY2F0Iiwic2xpY2UiLCJqb2luIiwibGFzdEtleSIsInBoZXQiLCJjaGlwcGVyIiwiYmluZCIsImlnbm9yZUFzc2VydGlvbiIsIl8iLCJoYXNJbiJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELElBQUEsQUFBTUEsWUFBTixNQUFNQTtJQTZCSjs7Ozs7Ozs7Ozs7R0FXQyxHQUNELEFBQU9DLFNBQWFDLEdBQVcsRUFBRUMsS0FBUSxFQUFNO1FBRTdDLHlCQUF5QjtRQUN6QixJQUFLLE9BQU9DLFdBQVcsYUFBYztZQUNuQyxPQUFPRDtRQUNUO1FBRUEscUhBQXFIO1FBQ3JILHlFQUF5RTtRQUV6RSw0RkFBNEY7UUFDNUYsSUFBS0QsSUFBSUcsUUFBUSxDQUFFLE1BQVE7WUFFekIsbUJBQW1CO1lBQ25CQyxVQUFVQSxPQUFRLENBQUMsSUFBSSxDQUFFSixJQUFLLEVBQUUsR0FBR0EsSUFBSSxxQ0FBcUMsRUFBRSxJQUFJLENBQUNLLElBQUksRUFBRTtZQUV6RixtQkFBbUI7WUFDbkIsSUFBSSxDQUFFTCxJQUFLLEdBQUdDO1FBQ2hCLE9BRUs7WUFDSCxNQUFNSyxPQUFPTixJQUFJTyxLQUFLLENBQUUsTUFBTyx5QkFBeUI7WUFFeEQsa0ZBQWtGO1lBQ2xGLElBQUlDLFNBQVMsSUFBSSxFQUFFLHdFQUF3RTtZQUMzRixJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSUgsS0FBS0ksTUFBTSxHQUFHLEdBQUdELElBQU07Z0JBRTFDLG1CQUFtQjtnQkFDbkJMLFVBQVVBLE9BQVEsQ0FBQyxDQUFDSSxNQUFNLENBQUVGLElBQUksQ0FBRUcsRUFBRyxDQUFFLEVBQ3JDLEdBQUc7b0JBQUUsSUFBSSxDQUFDSixJQUFJO2lCQUFFLENBQUNNLE1BQU0sQ0FBRUwsS0FBS00sS0FBSyxDQUFFLEdBQUdILElBQUksSUFBTUksSUFBSSxDQUFFLEtBQU0saUNBQWlDLEVBQUViLEtBQUs7Z0JBRXhHLG1CQUFtQjtnQkFDbkJRLFNBQVNBLE1BQU0sQ0FBRUYsSUFBSSxDQUFFRyxFQUFHLENBQUU7WUFDOUI7WUFFQSx3REFBd0Q7WUFDeEQsTUFBTUssVUFBVVIsSUFBSSxDQUFFQSxLQUFLSSxNQUFNLEdBQUcsRUFBRztZQUV2QyxtQkFBbUI7WUFDbkJOLFVBQVVBLE9BQVEsQ0FBQ0ksTUFBTSxDQUFFTSxRQUFTLEVBQUUsR0FBR2QsSUFBSSxxQ0FBcUMsRUFBRSxJQUFJLENBQUNLLElBQUksRUFBRTtZQUUvRixtQkFBbUI7WUFDbkJHLE1BQU0sQ0FBRU0sUUFBUyxHQUFHYjtRQUN0QjtRQUVBLE9BQU9BO0lBQ1Q7SUFwRkEsWUFBb0JJLElBQVksQ0FBRztRQUVqQyxJQUFJLENBQUNBLElBQUksR0FBR0E7UUFFWix5QkFBeUI7UUFDekIsSUFBSyxPQUFPSCxXQUFXLGFBQWM7WUFDbkM7UUFDRjtRQUVBLElBQUtBLE9BQU9hLElBQUksRUFBRztZQUNqQiwrRkFBK0Y7WUFDL0YsSUFBS1YsU0FBUyxXQUFZO2dCQUN4QkgsT0FBT2EsSUFBSSxDQUFDQyxPQUFPLENBQUNYLElBQUksR0FBRztnQkFDM0JILE9BQU9hLElBQUksQ0FBQ0MsT0FBTyxDQUFDakIsUUFBUSxHQUFHLElBQUksQ0FBQ0EsUUFBUSxDQUFDa0IsSUFBSSxDQUFFZixPQUFPYSxJQUFJLENBQUNDLE9BQU87Z0JBQ3RFLE9BQU9kLE9BQU9hLElBQUksQ0FBQ0MsT0FBTyxFQUFFLDRGQUE0RjtZQUMxSCxPQUNLO2dCQUNIO2lIQUN5RyxHQUN6RyxNQUFNRSxrQkFBa0IsQ0FBQ0MsRUFBRUMsS0FBSyxDQUFFbEIsUUFBUTtnQkFDMUNFLFVBQVUsQ0FBQ2MsbUJBQW1CZCxPQUFRLENBQUNGLE9BQU9hLElBQUksQ0FBRVYsS0FBTSxFQUFFLENBQUMsVUFBVSxFQUFFQSxLQUFLLGVBQWUsQ0FBQztnQkFDOUZILE9BQU9hLElBQUksQ0FBRVYsS0FBTSxHQUFHLElBQUk7WUFDNUI7UUFDRjtJQUNGO0FBNkRGO0FBRUEsZUFBZVAsVUFBVSJ9