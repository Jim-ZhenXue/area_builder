// Copyright 2022-2024, University of Colorado Boulder
/**
 * A base class to help with managing disposal. Creates a disposeEmitter that will be fired when disposing. This occurs
 * AFTER all prototype dispose() methods have been called up the hierarchy, so be aware of potential disposal order
 * issues if using disposeEmitter and dispose() logic together.
 *
 * This class also includes a public flag set to true when disposed.
 *
 * You can also opt into asserting out when disposing, preventing disposal on your class, see Disposable.isDisposable
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import axon from './axon.js';
import TinyEmitter from './TinyEmitter.js';
let Disposable = class Disposable {
    getDisposeEmitter() {
        return this._disposeEmitter;
    }
    get disposeEmitter() {
        return this.getDisposeEmitter();
    }
    get isDisposed() {
        return this._isDisposed;
    }
    get isDisposable() {
        return this._isDisposable;
    }
    set isDisposable(isDisposable) {
        this._isDisposable = isDisposable;
    }
    initializeDisposable(options) {
        if (options && options.hasOwnProperty('isDisposable')) {
            this._isDisposable = options.isDisposable;
        }
    }
    dispose() {
        assert && !this._isDisposable && Disposable.assertNotDisposable();
        assert && assert(!this._isDisposed, 'Disposable can only be disposed once');
        this._disposeEmitter.emit();
        this._disposeEmitter.dispose();
        this._isDisposed = true;
    }
    static assertNotDisposable() {
        // eslint-disable-next-line phet/bad-sim-text
        assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    }
    // Most time, Disposable should only be used by subtypes, only instantiate it if you run into multiple inheritance issues.
    constructor(providedOptions){
        // Called after all code that is directly in `dispose()` methods. Be careful with mixing this pattern and the
        // `this.disposeMyClass()` pattern.
        this._disposeEmitter = new TinyEmitter();
        // Keep track if this instance supports disposing. If set to false, then an assertion will fire if trying to dispose
        // this instance.
        this._isDisposable = true;
        // Marked true when this Disposable has had dispose() called on it (after disposeEmitter is fired)
        this._isDisposed = false;
        providedOptions && this.initializeDisposable(providedOptions);
        if (assert) {
            // Wrap the prototype dispose method with a check. NOTE: We will not catch devious cases where the dispose() is
            // overridden after the Node constructor (which may happen).
            const protoDispose = this.dispose;
            this.dispose = ()=>{
                assert && assert(!this._isDisposed, 'This Disposable has already been disposed, and cannot be disposed again');
                protoDispose.call(this);
                assert && assert(this._isDisposed, 'Disposable.dispose() call is missing from an overridden dispose method');
            };
        }
    }
};
axon.register('Disposable', Disposable);
export default Disposable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvRGlzcG9zYWJsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIGJhc2UgY2xhc3MgdG8gaGVscCB3aXRoIG1hbmFnaW5nIGRpc3Bvc2FsLiBDcmVhdGVzIGEgZGlzcG9zZUVtaXR0ZXIgdGhhdCB3aWxsIGJlIGZpcmVkIHdoZW4gZGlzcG9zaW5nLiBUaGlzIG9jY3Vyc1xuICogQUZURVIgYWxsIHByb3RvdHlwZSBkaXNwb3NlKCkgbWV0aG9kcyBoYXZlIGJlZW4gY2FsbGVkIHVwIHRoZSBoaWVyYXJjaHksIHNvIGJlIGF3YXJlIG9mIHBvdGVudGlhbCBkaXNwb3NhbCBvcmRlclxuICogaXNzdWVzIGlmIHVzaW5nIGRpc3Bvc2VFbWl0dGVyIGFuZCBkaXNwb3NlKCkgbG9naWMgdG9nZXRoZXIuXG4gKlxuICogVGhpcyBjbGFzcyBhbHNvIGluY2x1ZGVzIGEgcHVibGljIGZsYWcgc2V0IHRvIHRydWUgd2hlbiBkaXNwb3NlZC5cbiAqXG4gKiBZb3UgY2FuIGFsc28gb3B0IGludG8gYXNzZXJ0aW5nIG91dCB3aGVuIGRpc3Bvc2luZywgcHJldmVudGluZyBkaXNwb3NhbCBvbiB5b3VyIGNsYXNzLCBzZWUgRGlzcG9zYWJsZS5pc0Rpc3Bvc2FibGVcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBheG9uIGZyb20gJy4vYXhvbi5qcyc7XG5pbXBvcnQgVEVtaXR0ZXIsIHsgVFJlYWRPbmx5RW1pdHRlciB9IGZyb20gJy4vVEVtaXR0ZXIuanMnO1xuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4vVGlueUVtaXR0ZXIuanMnO1xuXG4vLyBVc2VkIGluIHN1YmNsYXNzZXMgdG8gc3VwcG9ydCBtdXRhdGUuXG5leHBvcnQgdHlwZSBEaXNwb3NhYmxlT3B0aW9ucyA9IHtcbiAgaXNEaXNwb3NhYmxlPzogYm9vbGVhbjtcbn07XG5cbmNsYXNzIERpc3Bvc2FibGUge1xuXG4gIC8vIENhbGxlZCBhZnRlciBhbGwgY29kZSB0aGF0IGlzIGRpcmVjdGx5IGluIGBkaXNwb3NlKClgIG1ldGhvZHMuIEJlIGNhcmVmdWwgd2l0aCBtaXhpbmcgdGhpcyBwYXR0ZXJuIGFuZCB0aGVcbiAgLy8gYHRoaXMuZGlzcG9zZU15Q2xhc3MoKWAgcGF0dGVybi5cbiAgcHJpdmF0ZSByZWFkb25seSBfZGlzcG9zZUVtaXR0ZXI6IFRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XG5cbiAgLy8gS2VlcCB0cmFjayBpZiB0aGlzIGluc3RhbmNlIHN1cHBvcnRzIGRpc3Bvc2luZy4gSWYgc2V0IHRvIGZhbHNlLCB0aGVuIGFuIGFzc2VydGlvbiB3aWxsIGZpcmUgaWYgdHJ5aW5nIHRvIGRpc3Bvc2VcbiAgLy8gdGhpcyBpbnN0YW5jZS5cbiAgcHJpdmF0ZSBfaXNEaXNwb3NhYmxlID0gdHJ1ZTtcblxuICAvLyBNYXJrZWQgdHJ1ZSB3aGVuIHRoaXMgRGlzcG9zYWJsZSBoYXMgaGFkIGRpc3Bvc2UoKSBjYWxsZWQgb24gaXQgKGFmdGVyIGRpc3Bvc2VFbWl0dGVyIGlzIGZpcmVkKVxuICBwcml2YXRlIF9pc0Rpc3Bvc2VkID0gZmFsc2U7XG5cbiAgLy8gTW9zdCB0aW1lLCBEaXNwb3NhYmxlIHNob3VsZCBvbmx5IGJlIHVzZWQgYnkgc3VidHlwZXMsIG9ubHkgaW5zdGFudGlhdGUgaXQgaWYgeW91IHJ1biBpbnRvIG11bHRpcGxlIGluaGVyaXRhbmNlIGlzc3Vlcy5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBEaXNwb3NhYmxlT3B0aW9ucyApIHtcblxuICAgIHByb3ZpZGVkT3B0aW9ucyAmJiB0aGlzLmluaXRpYWxpemVEaXNwb3NhYmxlKCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGlmICggYXNzZXJ0ICkge1xuXG4gICAgICAvLyBXcmFwIHRoZSBwcm90b3R5cGUgZGlzcG9zZSBtZXRob2Qgd2l0aCBhIGNoZWNrLiBOT1RFOiBXZSB3aWxsIG5vdCBjYXRjaCBkZXZpb3VzIGNhc2VzIHdoZXJlIHRoZSBkaXNwb3NlKCkgaXNcbiAgICAgIC8vIG92ZXJyaWRkZW4gYWZ0ZXIgdGhlIE5vZGUgY29uc3RydWN0b3IgKHdoaWNoIG1heSBoYXBwZW4pLlxuICAgICAgY29uc3QgcHJvdG9EaXNwb3NlID0gdGhpcy5kaXNwb3NlO1xuICAgICAgdGhpcy5kaXNwb3NlID0gKCkgPT4ge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5faXNEaXNwb3NlZCwgJ1RoaXMgRGlzcG9zYWJsZSBoYXMgYWxyZWFkeSBiZWVuIGRpc3Bvc2VkLCBhbmQgY2Fubm90IGJlIGRpc3Bvc2VkIGFnYWluJyApO1xuICAgICAgICBwcm90b0Rpc3Bvc2UuY2FsbCggdGhpcyApO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9pc0Rpc3Bvc2VkLCAnRGlzcG9zYWJsZS5kaXNwb3NlKCkgY2FsbCBpcyBtaXNzaW5nIGZyb20gYW4gb3ZlcnJpZGRlbiBkaXNwb3NlIG1ldGhvZCcgKTtcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldERpc3Bvc2VFbWl0dGVyKCk6IFRSZWFkT25seUVtaXR0ZXIge1xuICAgIHJldHVybiB0aGlzLl9kaXNwb3NlRW1pdHRlcjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZGlzcG9zZUVtaXR0ZXIoKTogVFJlYWRPbmx5RW1pdHRlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGlzcG9zZUVtaXR0ZXIoKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNEaXNwb3NlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNEaXNwb3NlZDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNEaXNwb3NhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0Rpc3Bvc2FibGU7XG4gIH1cblxuICBwdWJsaWMgc2V0IGlzRGlzcG9zYWJsZSggaXNEaXNwb3NhYmxlOiBib29sZWFuICkge1xuICAgIHRoaXMuX2lzRGlzcG9zYWJsZSA9IGlzRGlzcG9zYWJsZTtcbiAgfVxuXG4gIHB1YmxpYyBpbml0aWFsaXplRGlzcG9zYWJsZSggb3B0aW9ucz86IERpc3Bvc2FibGVPcHRpb25zICk6IHZvaWQge1xuICAgIGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmhhc093blByb3BlcnR5KCAnaXNEaXNwb3NhYmxlJyApICkge1xuICAgICAgdGhpcy5faXNEaXNwb3NhYmxlID0gb3B0aW9ucy5pc0Rpc3Bvc2FibGUhO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiAhdGhpcy5faXNEaXNwb3NhYmxlICYmIERpc3Bvc2FibGUuYXNzZXJ0Tm90RGlzcG9zYWJsZSgpO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLl9pc0Rpc3Bvc2VkLCAnRGlzcG9zYWJsZSBjYW4gb25seSBiZSBkaXNwb3NlZCBvbmNlJyApO1xuICAgIHRoaXMuX2Rpc3Bvc2VFbWl0dGVyLmVtaXQoKTtcbiAgICB0aGlzLl9kaXNwb3NlRW1pdHRlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5faXNEaXNwb3NlZCA9IHRydWU7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGFzc2VydE5vdERpc3Bvc2FibGUoKTogdm9pZCB7XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcGhldC9iYWQtc2ltLXRleHRcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcbiAgfVxufVxuXG5heG9uLnJlZ2lzdGVyKCAnRGlzcG9zYWJsZScsIERpc3Bvc2FibGUgKTtcbmV4cG9ydCBkZWZhdWx0IERpc3Bvc2FibGU7Il0sIm5hbWVzIjpbImF4b24iLCJUaW55RW1pdHRlciIsIkRpc3Bvc2FibGUiLCJnZXREaXNwb3NlRW1pdHRlciIsIl9kaXNwb3NlRW1pdHRlciIsImRpc3Bvc2VFbWl0dGVyIiwiaXNEaXNwb3NlZCIsIl9pc0Rpc3Bvc2VkIiwiaXNEaXNwb3NhYmxlIiwiX2lzRGlzcG9zYWJsZSIsImluaXRpYWxpemVEaXNwb3NhYmxlIiwib3B0aW9ucyIsImhhc093blByb3BlcnR5IiwiZGlzcG9zZSIsImFzc2VydCIsImFzc2VydE5vdERpc3Bvc2FibGUiLCJlbWl0IiwicHJvdmlkZWRPcHRpb25zIiwicHJvdG9EaXNwb3NlIiwiY2FsbCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7O0NBV0MsR0FFRCxPQUFPQSxVQUFVLFlBQVk7QUFFN0IsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQU8zQyxJQUFBLEFBQU1DLGFBQU4sTUFBTUE7SUErQkdDLG9CQUFzQztRQUMzQyxPQUFPLElBQUksQ0FBQ0MsZUFBZTtJQUM3QjtJQUVBLElBQVdDLGlCQUFtQztRQUM1QyxPQUFPLElBQUksQ0FBQ0YsaUJBQWlCO0lBQy9CO0lBRUEsSUFBV0csYUFBc0I7UUFDL0IsT0FBTyxJQUFJLENBQUNDLFdBQVc7SUFDekI7SUFFQSxJQUFXQyxlQUF3QjtRQUNqQyxPQUFPLElBQUksQ0FBQ0MsYUFBYTtJQUMzQjtJQUVBLElBQVdELGFBQWNBLFlBQXFCLEVBQUc7UUFDL0MsSUFBSSxDQUFDQyxhQUFhLEdBQUdEO0lBQ3ZCO0lBRU9FLHFCQUFzQkMsT0FBMkIsRUFBUztRQUMvRCxJQUFLQSxXQUFXQSxRQUFRQyxjQUFjLENBQUUsaUJBQW1CO1lBQ3pELElBQUksQ0FBQ0gsYUFBYSxHQUFHRSxRQUFRSCxZQUFZO1FBQzNDO0lBQ0Y7SUFFT0ssVUFBZ0I7UUFDckJDLFVBQVUsQ0FBQyxJQUFJLENBQUNMLGFBQWEsSUFBSVAsV0FBV2EsbUJBQW1CO1FBQy9ERCxVQUFVQSxPQUFRLENBQUMsSUFBSSxDQUFDUCxXQUFXLEVBQUU7UUFDckMsSUFBSSxDQUFDSCxlQUFlLENBQUNZLElBQUk7UUFDekIsSUFBSSxDQUFDWixlQUFlLENBQUNTLE9BQU87UUFDNUIsSUFBSSxDQUFDTixXQUFXLEdBQUc7SUFDckI7SUFFQSxPQUFjUSxzQkFBNEI7UUFFeEMsNkNBQTZDO1FBQzdDRCxVQUFVQSxPQUFRLE9BQU87SUFDM0I7SUF4REEsMEhBQTBIO0lBQzFILFlBQW9CRyxlQUFtQyxDQUFHO1FBWjFELDZHQUE2RztRQUM3RyxtQ0FBbUM7YUFDbEJiLGtCQUE0QixJQUFJSDtRQUVqRCxvSEFBb0g7UUFDcEgsaUJBQWlCO2FBQ1RRLGdCQUFnQjtRQUV4QixrR0FBa0c7YUFDMUZGLGNBQWM7UUFLcEJVLG1CQUFtQixJQUFJLENBQUNQLG9CQUFvQixDQUFFTztRQUU5QyxJQUFLSCxRQUFTO1lBRVosK0dBQStHO1lBQy9HLDREQUE0RDtZQUM1RCxNQUFNSSxlQUFlLElBQUksQ0FBQ0wsT0FBTztZQUNqQyxJQUFJLENBQUNBLE9BQU8sR0FBRztnQkFDYkMsVUFBVUEsT0FBUSxDQUFDLElBQUksQ0FBQ1AsV0FBVyxFQUFFO2dCQUNyQ1csYUFBYUMsSUFBSSxDQUFFLElBQUk7Z0JBQ3ZCTCxVQUFVQSxPQUFRLElBQUksQ0FBQ1AsV0FBVyxFQUFFO1lBQ3RDO1FBQ0Y7SUFDRjtBQXlDRjtBQUVBUCxLQUFLb0IsUUFBUSxDQUFFLGNBQWNsQjtBQUM3QixlQUFlQSxXQUFXIn0=