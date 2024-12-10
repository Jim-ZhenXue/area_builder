// Copyright 2015-2024, University of Colorado Boulder
/**
 * Lightweight event & listener abstraction for a single event type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import dotRandom from '../../dot/js/dotRandom.js';
import Random from '../../dot/js/Random.js';
import Pool from '../../phet-core/js/Pool.js';
import axon from './axon.js';
// constants
const listenerOrder = _.hasIn(window, 'phet.chipper.queryParameters') && phet.chipper.queryParameters.listenerOrder;
const listenerLimit = _.hasIn(window, 'phet.chipper.queryParameters') && phet.chipper.queryParameters.listenerLimit;
const EMIT_CONTEXT_MAX_LENGTH = 1000;
let random = null;
if (listenerOrder && listenerOrder.startsWith('random')) {
    // NOTE: this regular expression must be maintained in initialize-globals as well.
    const match = listenerOrder.match(/random(?:%28|\()(\d+)(?:%29|\))/);
    const seed = match ? Number(match[1]) : dotRandom.nextInt(1000000);
    random = new Random({
        seed: seed
    });
    console.log('listenerOrder random seed: ' + seed);
}
// Store the number of listeners from the single TinyEmitter instance that has the most listeners in the whole runtime.
let maxListenerCount = 0;
let TinyEmitter = class TinyEmitter {
    /**
   * Disposes an Emitter. All listeners are removed.
   */ dispose() {
        this.removeAllListeners();
        if (assert) {
            this.isDisposed = true;
        }
    }
    /**
   * Notify listeners
   */ emit(...args) {
        assert && assert(!this.isDisposed, 'TinyEmitter.emit() should not be called if disposed.');
        // optional callback, before notifying listeners
        this.onBeforeNotify && this.onBeforeNotify.apply(null, args);
        // Support for a query parameter that shuffles listeners, but bury behind assert so it will be stripped out on build
        // so it won't impact production performance.
        if (assert && listenerOrder && listenerOrder !== 'default' && !this.hasListenerOrderDependencies) {
            const asArray = Array.from(this.listeners);
            const reorderedListeners = listenerOrder.startsWith('random') ? random.shuffle(asArray) : asArray.reverse();
            this.listeners = new Set(reorderedListeners);
        }
        // Notify wired-up listeners, if any
        if (this.listeners.size > 0) {
            // We may not be able to emit right away. If we are already emitting and this is a recursive call, then that
            // first emit needs to finish notifying its listeners before we start our notifications (in queue mode), so store
            // the args for later. No slice needed, we're not modifying the args array.
            const emitContext = EmitContext.create(0, args);
            this.emitContexts.push(emitContext);
            if (this.reentrantNotificationStrategy === 'queue') {
                // This handles all reentrancy here (with a while loop), instead of doing so with recursion. If not the first context, then no-op because a previous call will handle this call's listener notifications.
                if (this.emitContexts.length === 1) {
                    while(this.emitContexts.length){
                        var _this_emitContexts_shift;
                        // Don't remove it from the list here. We need to be able to guardListeners.
                        const emitContext = this.emitContexts[0];
                        // It is possible that this emitContext is later on in the while loop, and has already had a listenerArray set
                        const listeners = emitContext.hasListenerArray ? emitContext.listenerArray : this.listeners;
                        this.notifyLoop(emitContext, listeners);
                        (_this_emitContexts_shift = this.emitContexts.shift()) == null ? void 0 : _this_emitContexts_shift.freeToPool();
                    }
                } else {
                    assert && assert(this.emitContexts.length <= EMIT_CONTEXT_MAX_LENGTH, `emitting reentrant depth of ${EMIT_CONTEXT_MAX_LENGTH} seems like a infinite loop to me!`);
                }
            } else if (!this.reentrantNotificationStrategy || this.reentrantNotificationStrategy === 'stack') {
                var _this_emitContexts_pop;
                this.notifyLoop(emitContext, this.listeners);
                (_this_emitContexts_pop = this.emitContexts.pop()) == null ? void 0 : _this_emitContexts_pop.freeToPool();
            } else {
                assert && assert(false, `Unknown reentrantNotificationStrategy: ${this.reentrantNotificationStrategy}`);
            }
        }
    }
    /**
   * Execute the notification of listeners (from the provided context and list). This function supports guarding against
   * if listener order changes during the notification process, see guardListeners.
   */ notifyLoop(emitContext, listeners) {
        const args = emitContext.args;
        for (const listener of listeners){
            listener(...args);
            emitContext.index++;
            // If a listener was added or removed, we cannot continue processing the mutated Set, we must switch to
            // iterate over the guarded array
            if (emitContext.hasListenerArray) {
                break;
            }
        }
        // If the listeners were guarded during emit, we bailed out on the for..of and continue iterating over the original
        // listeners in order from where we left off.
        if (emitContext.hasListenerArray) {
            for(let i = emitContext.index; i < emitContext.listenerArray.length; i++){
                emitContext.listenerArray[i](...args);
            }
        }
    }
    /**
   * Adds a listener which will be called during emit.
   */ addListener(listener) {
        assert && assert(!this.isDisposed, 'Cannot add a listener to a disposed TinyEmitter');
        assert && assert(!this.hasListener(listener), 'Cannot add the same listener twice');
        // If a listener is added during an emit(), we must make a copy of the current list of listeners--the newly added
        // listener will be available for the next emit() but not the one in progress.  This is to match behavior with
        // removeListener.
        this.guardListeners();
        this.listeners.add(listener);
        this.changeCount && this.changeCount(1);
        if (assert && listenerLimit && isFinite(listenerLimit) && maxListenerCount < this.listeners.size) {
            maxListenerCount = this.listeners.size;
            console.log(`Max TinyEmitter listeners: ${maxListenerCount}`);
            assert(maxListenerCount <= listenerLimit, `listener count of ${maxListenerCount} above ?listenerLimit=${listenerLimit}`);
        }
    }
    /**
   * Removes a listener
   */ removeListener(listener) {
        // Throw an error when removing a non-listener (except when the Emitter has already been disposed, see
        // https://github.com/phetsims/sun/issues/394#issuecomment-419998231
        if (assert && !this.isDisposed) {
            assert(this.listeners.has(listener), 'tried to removeListener on something that wasn\'t a listener');
        }
        this.guardListeners();
        this.listeners.delete(listener);
        this.changeCount && this.changeCount(-1);
    }
    /**
   * Removes all the listeners
   */ removeAllListeners() {
        const size = this.listeners.size;
        this.guardListeners();
        this.listeners.clear();
        this.changeCount && this.changeCount(-size);
    }
    /**
   * If listeners are added/removed while emit() is in progress, we must make a defensive copy of the array of listeners
   * before changing the array, and use it for the rest of the notifications until the emit call has completed.
   */ guardListeners() {
        for(let i = this.emitContexts.length - 1; i >= 0; i--){
            const emitContext = this.emitContexts[i];
            // Once we meet a level that was already guarded, we can stop, since all previous levels were already guarded
            if (emitContext.hasListenerArray) {
                break;
            }
            // Mark copies as 'guarded' so that it will use the original listeners when emit started and not the modified
            // list.
            emitContext.listenerArray.push(...this.listeners);
            emitContext.hasListenerArray = true;
        }
    }
    /**
   * Checks whether a listener is registered with this Emitter
   */ hasListener(listener) {
        assert && assert(arguments.length === 1, 'Emitter.hasListener should be called with 1 argument');
        return this.listeners.has(listener);
    }
    /**
   * Returns true if there are any listeners.
   */ hasListeners() {
        assert && assert(arguments.length === 0, 'Emitter.hasListeners should be called without arguments');
        return this.listeners.size > 0;
    }
    /**
   * Returns the number of listeners.
   */ getListenerCount() {
        return this.listeners.size;
    }
    /**
   * Invokes a callback once for each listener - meant for Property's use
   */ forEachListener(callback) {
        this.listeners.forEach(callback);
    }
    // Null on parameters is a no-op
    constructor(onBeforeNotify, hasListenerOrderDependencies, reentrantNotificationStrategy){
        // During emit() keep track of iteration progress and guard listeners if mutated during emit()
        this.emitContexts = [];
        if (onBeforeNotify) {
            this.onBeforeNotify = onBeforeNotify;
        }
        if (hasListenerOrderDependencies) {
            this.hasListenerOrderDependencies = hasListenerOrderDependencies;
        }
        if (reentrantNotificationStrategy) {
            this.reentrantNotificationStrategy = reentrantNotificationStrategy;
        }
        // Listener order is preserved in Set
        this.listeners = new Set();
        // for production memory concerns; no need to keep this around.
        if (assert) {
            this.isDisposed = false;
        }
    }
};
export { TinyEmitter as default };
/**
 * Utility class for managing the context of an emit call. This is used to manage the state of the emit call, and
 * especially to handle reentrant emit calls (through the stack/queue notification strategies)
 */ let EmitContext = class EmitContext {
    initialize(index, args) {
        this.index = index;
        this.args = args;
        this.hasListenerArray = false;
        return this;
    }
    freeToPool() {
        // TypeScript doesn't need to know that we're using this for different types. When it is "active", it will be
        // the correct type.
        EmitContext.pool.freeToPool(this);
        // NOTE: If we have fewer concerns about memory in the future, we could potentially improve performance by
        // removing the clearing out of memory here. We don't seem to create many EmitContexts, HOWEVER if we have ONE
        // "more re-entrant" case on sim startup that references a BIG BIG object, it could theoretically keep that
        // object alive forever.
        // We want to null things out to prevent memory leaks. Don't tell TypeScript!
        // (It will have the correct types after the initialization, so this works well with our pooling pattern).
        this.args = null;
        // Clear out the listeners array, so we don't leak memory while we are in the pool. If we have less concerns
        this.listenerArray.length = 0;
    }
    static create(index, args) {
        // TypeScript doesn't need to know that we're using this for different types. When it is "active", it will be
        // the correct type.
        return EmitContext.pool.create(index, args);
    }
    constructor(index, args){
        // Whether we should act like there is a listenerArray (has it been copied?)
        this.hasListenerArray = false;
        // Only use this if hasListenerArray is true. NOTE: for performance, we're not using getters/etc.
        this.listenerArray = [];
        this.initialize(index, args);
    }
};
EmitContext.pool = new Pool(EmitContext, {
    initialize: EmitContext.prototype.initialize
});
axon.register('TinyEmitter', TinyEmitter);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTGlnaHR3ZWlnaHQgZXZlbnQgJiBsaXN0ZW5lciBhYnN0cmFjdGlvbiBmb3IgYSBzaW5nbGUgZXZlbnQgdHlwZS5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XG5pbXBvcnQgUmFuZG9tIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5kb20uanMnO1xuaW1wb3J0IFBvb2wsIHsgVFBvb2xhYmxlIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgYXhvbiBmcm9tICcuL2F4b24uanMnO1xuaW1wb3J0IFRFbWl0dGVyLCB7IFRFbWl0dGVyTGlzdGVuZXIsIFRFbWl0dGVyUGFyYW1ldGVyIH0gZnJvbSAnLi9URW1pdHRlci5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgbGlzdGVuZXJPcmRlciA9IF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMnICkgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5saXN0ZW5lck9yZGVyO1xuY29uc3QgbGlzdGVuZXJMaW1pdCA9IF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMnICkgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5saXN0ZW5lckxpbWl0O1xuXG5jb25zdCBFTUlUX0NPTlRFWFRfTUFYX0xFTkdUSCA9IDEwMDA7XG5cbmxldCByYW5kb206IFJhbmRvbSB8IG51bGwgPSBudWxsO1xuaWYgKCBsaXN0ZW5lck9yZGVyICYmIGxpc3RlbmVyT3JkZXIuc3RhcnRzV2l0aCggJ3JhbmRvbScgKSApIHtcblxuICAvLyBOT1RFOiB0aGlzIHJlZ3VsYXIgZXhwcmVzc2lvbiBtdXN0IGJlIG1haW50YWluZWQgaW4gaW5pdGlhbGl6ZS1nbG9iYWxzIGFzIHdlbGwuXG4gIGNvbnN0IG1hdGNoID0gbGlzdGVuZXJPcmRlci5tYXRjaCggL3JhbmRvbSg/OiUyOHxcXCgpKFxcZCspKD86JTI5fFxcKSkvICk7XG4gIGNvbnN0IHNlZWQgPSBtYXRjaCA/IE51bWJlciggbWF0Y2hbIDEgXSApIDogZG90UmFuZG9tLm5leHRJbnQoIDEwMDAwMDAgKTtcbiAgcmFuZG9tID0gbmV3IFJhbmRvbSggeyBzZWVkOiBzZWVkIH0gKTtcbiAgY29uc29sZS5sb2coICdsaXN0ZW5lck9yZGVyIHJhbmRvbSBzZWVkOiAnICsgc2VlZCApO1xufVxuXG4vKipcbiAqIEhvdyB0byBoYW5kbGUgdGhlIG5vdGlmaWNhdGlvbiBvZiBsaXN0ZW5lcnMgaW4gcmVlbnRyYW50IGVtaXQoKSBjYXNlcy4gVGhlcmUgYXJlIHR3byBwb3NzaWJpbGl0aWVzOlxuICogJ3N0YWNrJzogRWFjaCBuZXcgcmVlbnRyYW50IGNhbGwgdG8gZW1pdCAoZnJvbSBhIGxpc3RlbmVyKSwgdGFrZXMgcHJlY2VkZW50LiBUaGlzIGJlaGF2ZXMgbGlrZSBhIFwiZGVwdGggZmlyc3RcIlxuICogICAgICAgIGFsZ29yaXRobSBiZWNhdXNlIGl0IHdpbGwgbm90IGZpbmlzaCBjYWxsaW5nIGFsbCBsaXN0ZW5lcnMgZnJvbSB0aGUgb3JpZ2luYWwgY2FsbCB1bnRpbCBuZXN0ZWQgZW1pdCgpIGNhbGxzXG4gKiAgICAgICAgbm90aWZ5IGZ1bGx5LiBOb3RpZnkgbGlzdGVuZXJzIGZyb20gdGhlIGVtaXQgY2FsbCB3aXRoIFwic3RhY2stbGlrZVwiIGJlaGF2aW9yLiBXZSBhbHNvIHNvbWV0aW1lcyBjYWxsIHRoaXNcbiAqICAgICAgICBcImRlcHRoLWZpcnN0XCIgbm90aWZpY2F0aW9uLiBUaGlzIGFsZ29yaXRobSB3aWxsIHByaW9yaXRpemUgdGhlIG1vc3QgcmVjZW50IGVtaXQgY2FsbCdzIGxpc3RlbmVycywgc3VjaCB0aGF0XG4gKiAgICAgICAgcmVlbnRyYW50IGVtaXRzIHdpbGwgY2F1c2UgYSBmdWxsIHJlY3Vyc2l2ZSBjYWxsIHRvIGVtaXQoKSB0byBjb21wbGV0ZSBiZWZvcmUgY29udGludWluZyB0byBub3RpZnkgdGhlXG4gKiAgICAgICAgcmVzdCBvZiB0aGUgbGlzdGVuZXJzIGZyb20gdGhlIG9yaWdpbmFsIGNhbGwuXG4gKiAgICAgICAgTm90ZTogVGhpcyB3YXMgdGhlIG9ubHkgbWV0aG9kIG9mIG5vdGlmeWluZyBsaXN0ZW5lcnMgb24gZW1pdCBiZWZvcmUgMi8yMDI0LlxuICpcbiAqICdxdWV1ZSc6IEVhY2ggbmV3IHJlZW50cmFudCBjYWxsIHRvIGVtaXQgcXVldWVzIHRob3NlIGxpc3RlbmVycyB0byBydW4gb25jZSB0aGUgY3VycmVudCBub3RpZmljYXRpb25zIGFyZSBkb25lXG4gKiAgICAgICAgZmlyaW5nLiBIZXJlIGEgcmVjdXJzaXZlIChyZWVudHJhbnQpIGVtaXQgaXMgYmFzaWNhbGx5IGEgbm9vcCwgYmVjYXVzZSB0aGUgb3JpZ2luYWwgY2FsbCB3aWxsIGNvbnRpbnVlXG4gKiAgICAgICAgbG9vcGluZyB0aHJvdWdoIGxpc3RlbmVycyBmcm9tIGVhY2ggbmV3IGVtaXQoKSBjYWxsIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlLiBTZWUgbm90aWZ5QXNRdWV1ZSgpLlxuICogICAgICAgIE5vdGlmeSBsaXN0ZW5lcnMgZnJvbSB0aGUgZW1pdCBjYWxsIHdpdGggXCJxdWV1ZS1saWtlXCIgYmVoYXZpb3IgKEZJRk8pLiBXZSBhbHNvIHNvbWV0aW1lcyBjYWxsIHRoaXMgXCJicmVhZHRoLWZpcnN0XCJcbiAqICAgICAgICBub3RpZmljYXRpb24uIEluIHRoaXMgZnVuY3Rpb24sIGxpc3RlbmVycyBmb3IgYW4gZWFybGllciBlbWl0IGNhbGwgd2lsbCBiZSBjYWxsZWQgYmVmb3JlIGFueSBuZXdlciBlbWl0IGNhbGwgdGhhdFxuICogICAgICAgIG1heSBvY2N1ciBpbnNpZGUgb2YgbGlzdGVuZXJzIChpbiBhIHJlZW50cmFudCBjYXNlKS5cbiAqXG4gKiAgICAgICAgVGhpcyBpcyBhIGJldHRlciBzdHJhdGVneSBpbiBjYXNlcyB3aGVyZSBvcmRlciBtYXkgbWF0dGVyLCBmb3IgZXhhbXBsZTpcbiAqICAgICAgICBjb25zdCBlbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyPFsgbnVtYmVyIF0+KCAgbnVsbCwgbnVsbCwgJ3F1ZXVlJyApO1xuICogICAgICAgIGVtaXR0ZXIuYWRkTGlzdGVuZXIoIG51bWJlciA9PiB7XG4gKiAgICAgICAgICBpZiAoIG51bWJlciA8IDEwICkge1xuICogICAgICAgICAgICBlbWl0dGVyLmVtaXQoIG51bWJlciArIDEgKTtcbiAqICAgICAgICAgICAgY29uc29sZS5sb2coIG51bWJlciApO1xuICogICAgICAgICAgfVxuICogICAgICAgIH0gKTtcbiAqICAgICAgICBlbWl0dGVyLmVtaXQoIDEgKTtcbiAqICAgICAgICAtPiAxLDIsMyw0LDUsNiw3LDgsOVxuICpcbiAqICAgICAgICBXaGVyZWFzIHN0YWNrLWJhc2VkIG5vdGlmaWNhdGlvbiB3b3VsZCB5aWVsZCB0aGUgb3Bwb3NlIG9yZGVyOiA5LT4xLCBzaW5jZSB0aGUgbW9zdCByZWNlbnRseSBjYWxsZWQgZW1pdFxuICogICAgICAgIHdvdWxkIGJlIHRoZSB2ZXJ5IGZpcnN0IG9uZSBub3RpZmllZC5cbiAqXG4gKiAgICAgICAgTm90ZSwgdGhpcyBhbGdvcml0aG0gZG9lcyBpbnZvbHZlIHF1ZXVlaW5nIGEgcmVlbnRyYW50IGVtaXQoKSBjYWxscycgbGlzdGVuZXJzIGZvciBsYXRlciBub3RpZmljYXRpb24uIFNvIGluXG4gKiAgICAgICAgZWZmZWN0LCByZWVudHJhbnQgZW1pdCgpIGNhbGxzIGFyZSBuby1vcHMuIFRoaXMgY291bGQgcG90ZW50aWFsbHkgbGVhZCBzb21lIGF3a3dhcmQgb3IgY29uZnVzaW5nIGNhc2VzLiBBcyBhXG4gKiAgICAgICAgcmVzdWx0IGl0IGlzIHJlY29tbWVuZGVkIHRvIHVzZSB0aGlzIHByZWRvbWluYW50bHkgd2l0aCBQcm9wZXJ0aWVzLCBpbiB3aGljaCB0aGVpciBzdGF0ZWZ1bCB2YWx1ZSBtYWtlcyBtb3JlXG4gKiAgICAgICAgc2Vuc2UgdG8gbm90aWZ5IGNoYW5nZXMgb24gaW4gb3JkZXIgKHByZXNlcnZpbmcgdGhlIGNvcnJlY3Qgb2xkVmFsdWUgdGhyb3VnaCBhbGwgbm90aWZpY2F0aW9ucykuXG4gKi9cbmV4cG9ydCB0eXBlIFJlZW50cmFudE5vdGlmaWNhdGlvblN0cmF0ZWd5ID0gJ3F1ZXVlJyB8ICdzdGFjayc7XG5cbi8vIFdoaWxlIFRpbnlFbWl0dGVyIGRvZXNuJ3QgdXNlIHRoaXMgaW4gYW4gb3B0aW9uaXplIGNhbGwsIGl0IGlzIG5pY2UgdG8gYmUgYWJsZSB0byByZXVzZSB0aGUgdHlwZXMgb2YgdGhlc2Ugb3B0aW9ucy5cbmV4cG9ydCB0eXBlIFRpbnlFbWl0dGVyT3B0aW9uczxUIGV4dGVuZHMgVEVtaXR0ZXJQYXJhbWV0ZXJbXSA9IFtdPiA9IHtcbiAgb25CZWZvcmVOb3RpZnk/OiBURW1pdHRlckxpc3RlbmVyPFQ+O1xuICBoYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzPzogYm9vbGVhbjtcbiAgcmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3k/OiBSZWVudHJhbnROb3RpZmljYXRpb25TdHJhdGVneTtcbn07XG5cbnR5cGUgUGFyYW1ldGVyTGlzdCA9IEludGVudGlvbmFsQW55W107XG5cbi8vIFN0b3JlIHRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIGZyb20gdGhlIHNpbmdsZSBUaW55RW1pdHRlciBpbnN0YW5jZSB0aGF0IGhhcyB0aGUgbW9zdCBsaXN0ZW5lcnMgaW4gdGhlIHdob2xlIHJ1bnRpbWUuXG5sZXQgbWF4TGlzdGVuZXJDb3VudCA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbnlFbWl0dGVyPFQgZXh0ZW5kcyBURW1pdHRlclBhcmFtZXRlcltdID0gW10+IGltcGxlbWVudHMgVEVtaXR0ZXI8VD4ge1xuXG4gIC8vIE5vdCBkZWZpbmVkIHVzdWFsbHkgYmVjYXVzZSBvZiBtZW1vcnkgdXNhZ2UuIElmIGRlZmluZWQsIHRoaXMgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgbGlzdGVuZXIgY291bnQgY2hhbmdlcyxcbiAgLy8gZS5nLiBjaGFuZ2VDb3VudCgge251bWJlcn0gbGlzdGVuZXJzQWRkZWRRdWFudGl0eSApLCB3aXRoIHRoZSBudW1iZXIgYmVpbmcgbmVnYXRpdmUgZm9yIGxpc3RlbmVycyByZW1vdmVkLlxuICBwdWJsaWMgY2hhbmdlQ291bnQ/OiAoIGNvdW50OiBudW1iZXIgKSA9PiB2b2lkO1xuXG4gIC8vIE9ubHkgZGVmaW5lZCB3aGVuIGFzc2VydGlvbnMgYXJlIGVuYWJsZWQgLSB0byBrZWVwIHRyYWNrIGlmIGl0IGhhcyBiZWVuIGRpc3Bvc2VkIG9yIG5vdFxuICBwdWJsaWMgaXNEaXNwb3NlZD86IGJvb2xlYW47XG5cbiAgLy8gSWYgc3BlY2lmaWVkLCB0aGlzIHdpbGwgYmUgY2FsbGVkIGJlZm9yZSBsaXN0ZW5lcnMgYXJlIG5vdGlmaWVkLlxuICAvLyBOT1RFOiBUaGlzIGlzIHNldCBPTkxZIGlmIGl0J3Mgbm9uLW51bGxcbiAgcHJpdmF0ZSByZWFkb25seSBvbkJlZm9yZU5vdGlmeT86IFRFbWl0dGVyTGlzdGVuZXI8VD47XG5cbiAgLy8gSWYgc3BlY2lmaWVkIGFzIHRydWUsIHRoaXMgZmxhZyB3aWxsIGVuc3VyZSB0aGF0IGxpc3RlbmVyIG9yZGVyIG5ldmVyIGNoYW5nZXMgKGxpa2UgdmlhID9saXN0ZW5lck9yZGVyPXJhbmRvbSlcbiAgLy8gTk9URTogVGhpcyBpcyBzZXQgT05MWSBpZiBpdCdzIGFjdHVhbGx5IHRydWVcbiAgcHJpdmF0ZSByZWFkb25seSBoYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzPzogdHJ1ZTtcblxuICAvLyBIb3cgYmVzdCB0byBoYW5kbGUgcmVlbnRyYW50IGNhbGxzIHRvIGVtaXQoKS4gRGVmYXVsdHMgdG8gc3RhY2suIFNlZSBmdWxsIGRvYyB3aGVyZSB0aGUgVHlwZSBpcyBkZWNsYXJlZC5cbiAgcHJpdmF0ZSByZWFkb25seSByZWVudHJhbnROb3RpZmljYXRpb25TdHJhdGVneT86IFJlZW50cmFudE5vdGlmaWNhdGlvblN0cmF0ZWd5O1xuXG4gIC8vIFRoZSBsaXN0ZW5lcnMgdGhhdCB3aWxsIGJlIGNhbGxlZCBvbiBlbWl0XG4gIHByaXZhdGUgbGlzdGVuZXJzOiBTZXQ8VEVtaXR0ZXJMaXN0ZW5lcjxUPj47XG5cbiAgLy8gRHVyaW5nIGVtaXQoKSBrZWVwIHRyYWNrIG9mIGl0ZXJhdGlvbiBwcm9ncmVzcyBhbmQgZ3VhcmQgbGlzdGVuZXJzIGlmIG11dGF0ZWQgZHVyaW5nIGVtaXQoKVxuICBwcml2YXRlIGVtaXRDb250ZXh0czogRW1pdENvbnRleHQ8VD5bXSA9IFtdO1xuXG4gIC8vIE51bGwgb24gcGFyYW1ldGVycyBpcyBhIG5vLW9wXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb25CZWZvcmVOb3RpZnk/OiBUaW55RW1pdHRlck9wdGlvbnM8VD5bJ29uQmVmb3JlTm90aWZ5J10gfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgIGhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXM/OiBUaW55RW1pdHRlck9wdGlvbnM8VD5bJ2hhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXMnXSB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgcmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3k/OiBUaW55RW1pdHRlck9wdGlvbnM8VD5bJ3JlZW50cmFudE5vdGlmaWNhdGlvblN0cmF0ZWd5J10gfCBudWxsICkge1xuXG4gICAgaWYgKCBvbkJlZm9yZU5vdGlmeSApIHtcbiAgICAgIHRoaXMub25CZWZvcmVOb3RpZnkgPSBvbkJlZm9yZU5vdGlmeTtcbiAgICB9XG5cbiAgICBpZiAoIGhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXMgKSB7XG4gICAgICB0aGlzLmhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXMgPSBoYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzO1xuICAgIH1cblxuICAgIGlmICggcmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3kgKSB7XG4gICAgICB0aGlzLnJlZW50cmFudE5vdGlmaWNhdGlvblN0cmF0ZWd5ID0gcmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3k7XG4gICAgfVxuXG4gICAgLy8gTGlzdGVuZXIgb3JkZXIgaXMgcHJlc2VydmVkIGluIFNldFxuICAgIHRoaXMubGlzdGVuZXJzID0gbmV3IFNldCgpO1xuXG4gICAgLy8gZm9yIHByb2R1Y3Rpb24gbWVtb3J5IGNvbmNlcm5zOyBubyBuZWVkIHRvIGtlZXAgdGhpcyBhcm91bmQuXG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICB0aGlzLmlzRGlzcG9zZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgYW4gRW1pdHRlci4gQWxsIGxpc3RlbmVycyBhcmUgcmVtb3ZlZC5cbiAgICovXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG5cbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIHRoaXMuaXNEaXNwb3NlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE5vdGlmeSBsaXN0ZW5lcnNcbiAgICovXG4gIHB1YmxpYyBlbWl0KCAuLi5hcmdzOiBUICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzRGlzcG9zZWQsICdUaW55RW1pdHRlci5lbWl0KCkgc2hvdWxkIG5vdCBiZSBjYWxsZWQgaWYgZGlzcG9zZWQuJyApO1xuXG4gICAgLy8gb3B0aW9uYWwgY2FsbGJhY2ssIGJlZm9yZSBub3RpZnlpbmcgbGlzdGVuZXJzXG4gICAgdGhpcy5vbkJlZm9yZU5vdGlmeSAmJiB0aGlzLm9uQmVmb3JlTm90aWZ5LmFwcGx5KCBudWxsLCBhcmdzICk7XG5cbiAgICAvLyBTdXBwb3J0IGZvciBhIHF1ZXJ5IHBhcmFtZXRlciB0aGF0IHNodWZmbGVzIGxpc3RlbmVycywgYnV0IGJ1cnkgYmVoaW5kIGFzc2VydCBzbyBpdCB3aWxsIGJlIHN0cmlwcGVkIG91dCBvbiBidWlsZFxuICAgIC8vIHNvIGl0IHdvbid0IGltcGFjdCBwcm9kdWN0aW9uIHBlcmZvcm1hbmNlLlxuICAgIGlmICggYXNzZXJ0ICYmIGxpc3RlbmVyT3JkZXIgJiYgKCBsaXN0ZW5lck9yZGVyICE9PSAnZGVmYXVsdCcgKSAmJiAhdGhpcy5oYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzICkge1xuICAgICAgY29uc3QgYXNBcnJheSA9IEFycmF5LmZyb20oIHRoaXMubGlzdGVuZXJzICk7XG5cbiAgICAgIGNvbnN0IHJlb3JkZXJlZExpc3RlbmVycyA9IGxpc3RlbmVyT3JkZXIuc3RhcnRzV2l0aCggJ3JhbmRvbScgKSA/IHJhbmRvbSEuc2h1ZmZsZSggYXNBcnJheSApIDogYXNBcnJheS5yZXZlcnNlKCk7XG4gICAgICB0aGlzLmxpc3RlbmVycyA9IG5ldyBTZXQoIHJlb3JkZXJlZExpc3RlbmVycyApO1xuICAgIH1cblxuICAgIC8vIE5vdGlmeSB3aXJlZC11cCBsaXN0ZW5lcnMsIGlmIGFueVxuICAgIGlmICggdGhpcy5saXN0ZW5lcnMuc2l6ZSA+IDAgKSB7XG5cbiAgICAgIC8vIFdlIG1heSBub3QgYmUgYWJsZSB0byBlbWl0IHJpZ2h0IGF3YXkuIElmIHdlIGFyZSBhbHJlYWR5IGVtaXR0aW5nIGFuZCB0aGlzIGlzIGEgcmVjdXJzaXZlIGNhbGwsIHRoZW4gdGhhdFxuICAgICAgLy8gZmlyc3QgZW1pdCBuZWVkcyB0byBmaW5pc2ggbm90aWZ5aW5nIGl0cyBsaXN0ZW5lcnMgYmVmb3JlIHdlIHN0YXJ0IG91ciBub3RpZmljYXRpb25zIChpbiBxdWV1ZSBtb2RlKSwgc28gc3RvcmVcbiAgICAgIC8vIHRoZSBhcmdzIGZvciBsYXRlci4gTm8gc2xpY2UgbmVlZGVkLCB3ZSdyZSBub3QgbW9kaWZ5aW5nIHRoZSBhcmdzIGFycmF5LlxuICAgICAgY29uc3QgZW1pdENvbnRleHQgPSBFbWl0Q29udGV4dC5jcmVhdGUoIDAsIGFyZ3MgKTtcbiAgICAgIHRoaXMuZW1pdENvbnRleHRzLnB1c2goIGVtaXRDb250ZXh0ICk7XG5cbiAgICAgIGlmICggdGhpcy5yZWVudHJhbnROb3RpZmljYXRpb25TdHJhdGVneSA9PT0gJ3F1ZXVlJyApIHtcblxuICAgICAgICAvLyBUaGlzIGhhbmRsZXMgYWxsIHJlZW50cmFuY3kgaGVyZSAod2l0aCBhIHdoaWxlIGxvb3ApLCBpbnN0ZWFkIG9mIGRvaW5nIHNvIHdpdGggcmVjdXJzaW9uLiBJZiBub3QgdGhlIGZpcnN0IGNvbnRleHQsIHRoZW4gbm8tb3AgYmVjYXVzZSBhIHByZXZpb3VzIGNhbGwgd2lsbCBoYW5kbGUgdGhpcyBjYWxsJ3MgbGlzdGVuZXIgbm90aWZpY2F0aW9ucy5cbiAgICAgICAgaWYgKCB0aGlzLmVtaXRDb250ZXh0cy5sZW5ndGggPT09IDEgKSB7XG4gICAgICAgICAgd2hpbGUgKCB0aGlzLmVtaXRDb250ZXh0cy5sZW5ndGggKSB7XG5cbiAgICAgICAgICAgIC8vIERvbid0IHJlbW92ZSBpdCBmcm9tIHRoZSBsaXN0IGhlcmUuIFdlIG5lZWQgdG8gYmUgYWJsZSB0byBndWFyZExpc3RlbmVycy5cbiAgICAgICAgICAgIGNvbnN0IGVtaXRDb250ZXh0ID0gdGhpcy5lbWl0Q29udGV4dHNbIDAgXTtcblxuICAgICAgICAgICAgLy8gSXQgaXMgcG9zc2libGUgdGhhdCB0aGlzIGVtaXRDb250ZXh0IGlzIGxhdGVyIG9uIGluIHRoZSB3aGlsZSBsb29wLCBhbmQgaGFzIGFscmVhZHkgaGFkIGEgbGlzdGVuZXJBcnJheSBzZXRcbiAgICAgICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IGVtaXRDb250ZXh0Lmhhc0xpc3RlbmVyQXJyYXkgPyBlbWl0Q29udGV4dC5saXN0ZW5lckFycmF5IDogdGhpcy5saXN0ZW5lcnM7XG5cbiAgICAgICAgICAgIHRoaXMubm90aWZ5TG9vcCggZW1pdENvbnRleHQsIGxpc3RlbmVycyApO1xuXG4gICAgICAgICAgICB0aGlzLmVtaXRDb250ZXh0cy5zaGlmdCgpPy5mcmVlVG9Qb29sKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZW1pdENvbnRleHRzLmxlbmd0aCA8PSBFTUlUX0NPTlRFWFRfTUFYX0xFTkdUSCxcbiAgICAgICAgICAgIGBlbWl0dGluZyByZWVudHJhbnQgZGVwdGggb2YgJHtFTUlUX0NPTlRFWFRfTUFYX0xFTkdUSH0gc2VlbXMgbGlrZSBhIGluZmluaXRlIGxvb3AgdG8gbWUhYCApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggIXRoaXMucmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3kgfHwgdGhpcy5yZWVudHJhbnROb3RpZmljYXRpb25TdHJhdGVneSA9PT0gJ3N0YWNrJyApIHtcbiAgICAgICAgdGhpcy5ub3RpZnlMb29wKCBlbWl0Q29udGV4dCwgdGhpcy5saXN0ZW5lcnMgKTtcbiAgICAgICAgdGhpcy5lbWl0Q29udGV4dHMucG9wKCk/LmZyZWVUb1Bvb2woKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgYFVua25vd24gcmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3k6ICR7dGhpcy5yZWVudHJhbnROb3RpZmljYXRpb25TdHJhdGVneX1gICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGUgdGhlIG5vdGlmaWNhdGlvbiBvZiBsaXN0ZW5lcnMgKGZyb20gdGhlIHByb3ZpZGVkIGNvbnRleHQgYW5kIGxpc3QpLiBUaGlzIGZ1bmN0aW9uIHN1cHBvcnRzIGd1YXJkaW5nIGFnYWluc3RcbiAgICogaWYgbGlzdGVuZXIgb3JkZXIgY2hhbmdlcyBkdXJpbmcgdGhlIG5vdGlmaWNhdGlvbiBwcm9jZXNzLCBzZWUgZ3VhcmRMaXN0ZW5lcnMuXG4gICAqL1xuICBwcml2YXRlIG5vdGlmeUxvb3AoIGVtaXRDb250ZXh0OiBFbWl0Q29udGV4dDxUPiwgbGlzdGVuZXJzOiBURW1pdHRlckxpc3RlbmVyPFQ+W10gfCBTZXQ8VEVtaXR0ZXJMaXN0ZW5lcjxUPj4gKTogdm9pZCB7XG4gICAgY29uc3QgYXJncyA9IGVtaXRDb250ZXh0LmFyZ3M7XG5cbiAgICBmb3IgKCBjb25zdCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMgKSB7XG4gICAgICBsaXN0ZW5lciggLi4uYXJncyApO1xuXG4gICAgICBlbWl0Q29udGV4dC5pbmRleCsrO1xuXG4gICAgICAvLyBJZiBhIGxpc3RlbmVyIHdhcyBhZGRlZCBvciByZW1vdmVkLCB3ZSBjYW5ub3QgY29udGludWUgcHJvY2Vzc2luZyB0aGUgbXV0YXRlZCBTZXQsIHdlIG11c3Qgc3dpdGNoIHRvXG4gICAgICAvLyBpdGVyYXRlIG92ZXIgdGhlIGd1YXJkZWQgYXJyYXlcbiAgICAgIGlmICggZW1pdENvbnRleHQuaGFzTGlzdGVuZXJBcnJheSApIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGxpc3RlbmVycyB3ZXJlIGd1YXJkZWQgZHVyaW5nIGVtaXQsIHdlIGJhaWxlZCBvdXQgb24gdGhlIGZvci4ub2YgYW5kIGNvbnRpbnVlIGl0ZXJhdGluZyBvdmVyIHRoZSBvcmlnaW5hbFxuICAgIC8vIGxpc3RlbmVycyBpbiBvcmRlciBmcm9tIHdoZXJlIHdlIGxlZnQgb2ZmLlxuICAgIGlmICggZW1pdENvbnRleHQuaGFzTGlzdGVuZXJBcnJheSApIHtcbiAgICAgIGZvciAoIGxldCBpID0gZW1pdENvbnRleHQuaW5kZXg7IGkgPCBlbWl0Q29udGV4dC5saXN0ZW5lckFycmF5Lmxlbmd0aDsgaSsrICkge1xuICAgICAgICBlbWl0Q29udGV4dC5saXN0ZW5lckFycmF5WyBpIF0oIC4uLmFyZ3MgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGxpc3RlbmVyIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGR1cmluZyBlbWl0LlxuICAgKi9cbiAgcHVibGljIGFkZExpc3RlbmVyKCBsaXN0ZW5lcjogVEVtaXR0ZXJMaXN0ZW5lcjxUPiApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc0Rpc3Bvc2VkLCAnQ2Fubm90IGFkZCBhIGxpc3RlbmVyIHRvIGEgZGlzcG9zZWQgVGlueUVtaXR0ZXInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaGFzTGlzdGVuZXIoIGxpc3RlbmVyICksICdDYW5ub3QgYWRkIHRoZSBzYW1lIGxpc3RlbmVyIHR3aWNlJyApO1xuXG4gICAgLy8gSWYgYSBsaXN0ZW5lciBpcyBhZGRlZCBkdXJpbmcgYW4gZW1pdCgpLCB3ZSBtdXN0IG1ha2UgYSBjb3B5IG9mIHRoZSBjdXJyZW50IGxpc3Qgb2YgbGlzdGVuZXJzLS10aGUgbmV3bHkgYWRkZWRcbiAgICAvLyBsaXN0ZW5lciB3aWxsIGJlIGF2YWlsYWJsZSBmb3IgdGhlIG5leHQgZW1pdCgpIGJ1dCBub3QgdGhlIG9uZSBpbiBwcm9ncmVzcy4gIFRoaXMgaXMgdG8gbWF0Y2ggYmVoYXZpb3Igd2l0aFxuICAgIC8vIHJlbW92ZUxpc3RlbmVyLlxuICAgIHRoaXMuZ3VhcmRMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLmxpc3RlbmVycy5hZGQoIGxpc3RlbmVyICk7XG5cbiAgICB0aGlzLmNoYW5nZUNvdW50ICYmIHRoaXMuY2hhbmdlQ291bnQoIDEgKTtcblxuICAgIGlmICggYXNzZXJ0ICYmIGxpc3RlbmVyTGltaXQgJiYgaXNGaW5pdGUoIGxpc3RlbmVyTGltaXQgKSAmJiBtYXhMaXN0ZW5lckNvdW50IDwgdGhpcy5saXN0ZW5lcnMuc2l6ZSApIHtcbiAgICAgIG1heExpc3RlbmVyQ291bnQgPSB0aGlzLmxpc3RlbmVycy5zaXplO1xuICAgICAgY29uc29sZS5sb2coIGBNYXggVGlueUVtaXR0ZXIgbGlzdGVuZXJzOiAke21heExpc3RlbmVyQ291bnR9YCApO1xuICAgICAgYXNzZXJ0KCBtYXhMaXN0ZW5lckNvdW50IDw9IGxpc3RlbmVyTGltaXQsIGBsaXN0ZW5lciBjb3VudCBvZiAke21heExpc3RlbmVyQ291bnR9IGFib3ZlID9saXN0ZW5lckxpbWl0PSR7bGlzdGVuZXJMaW1pdH1gICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBsaXN0ZW5lclxuICAgKi9cbiAgcHVibGljIHJlbW92ZUxpc3RlbmVyKCBsaXN0ZW5lcjogVEVtaXR0ZXJMaXN0ZW5lcjxUPiApOiB2b2lkIHtcblxuICAgIC8vIFRocm93IGFuIGVycm9yIHdoZW4gcmVtb3ZpbmcgYSBub24tbGlzdGVuZXIgKGV4Y2VwdCB3aGVuIHRoZSBFbWl0dGVyIGhhcyBhbHJlYWR5IGJlZW4gZGlzcG9zZWQsIHNlZVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzM5NCNpc3N1ZWNvbW1lbnQtNDE5OTk4MjMxXG4gICAgaWYgKCBhc3NlcnQgJiYgIXRoaXMuaXNEaXNwb3NlZCApIHtcbiAgICAgIGFzc2VydCggdGhpcy5saXN0ZW5lcnMuaGFzKCBsaXN0ZW5lciApLCAndHJpZWQgdG8gcmVtb3ZlTGlzdGVuZXIgb24gc29tZXRoaW5nIHRoYXQgd2FzblxcJ3QgYSBsaXN0ZW5lcicgKTtcbiAgICB9XG4gICAgdGhpcy5ndWFyZExpc3RlbmVycygpO1xuICAgIHRoaXMubGlzdGVuZXJzLmRlbGV0ZSggbGlzdGVuZXIgKTtcblxuICAgIHRoaXMuY2hhbmdlQ291bnQgJiYgdGhpcy5jaGFuZ2VDb3VudCggLTEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCB0aGUgbGlzdGVuZXJzXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlQWxsTGlzdGVuZXJzKCk6IHZvaWQge1xuXG4gICAgY29uc3Qgc2l6ZSA9IHRoaXMubGlzdGVuZXJzLnNpemU7XG5cbiAgICB0aGlzLmd1YXJkTGlzdGVuZXJzKCk7XG4gICAgdGhpcy5saXN0ZW5lcnMuY2xlYXIoKTtcblxuICAgIHRoaXMuY2hhbmdlQ291bnQgJiYgdGhpcy5jaGFuZ2VDb3VudCggLXNpemUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBsaXN0ZW5lcnMgYXJlIGFkZGVkL3JlbW92ZWQgd2hpbGUgZW1pdCgpIGlzIGluIHByb2dyZXNzLCB3ZSBtdXN0IG1ha2UgYSBkZWZlbnNpdmUgY29weSBvZiB0aGUgYXJyYXkgb2YgbGlzdGVuZXJzXG4gICAqIGJlZm9yZSBjaGFuZ2luZyB0aGUgYXJyYXksIGFuZCB1c2UgaXQgZm9yIHRoZSByZXN0IG9mIHRoZSBub3RpZmljYXRpb25zIHVudGlsIHRoZSBlbWl0IGNhbGwgaGFzIGNvbXBsZXRlZC5cbiAgICovXG4gIHByaXZhdGUgZ3VhcmRMaXN0ZW5lcnMoKTogdm9pZCB7XG5cbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMuZW1pdENvbnRleHRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuXG4gICAgICBjb25zdCBlbWl0Q29udGV4dCA9IHRoaXMuZW1pdENvbnRleHRzWyBpIF07XG5cbiAgICAgIC8vIE9uY2Ugd2UgbWVldCBhIGxldmVsIHRoYXQgd2FzIGFscmVhZHkgZ3VhcmRlZCwgd2UgY2FuIHN0b3AsIHNpbmNlIGFsbCBwcmV2aW91cyBsZXZlbHMgd2VyZSBhbHJlYWR5IGd1YXJkZWRcbiAgICAgIGlmICggZW1pdENvbnRleHQuaGFzTGlzdGVuZXJBcnJheSApIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIE1hcmsgY29waWVzIGFzICdndWFyZGVkJyBzbyB0aGF0IGl0IHdpbGwgdXNlIHRoZSBvcmlnaW5hbCBsaXN0ZW5lcnMgd2hlbiBlbWl0IHN0YXJ0ZWQgYW5kIG5vdCB0aGUgbW9kaWZpZWRcbiAgICAgIC8vIGxpc3QuXG4gICAgICBlbWl0Q29udGV4dC5saXN0ZW5lckFycmF5LnB1c2goIC4uLnRoaXMubGlzdGVuZXJzICk7XG4gICAgICBlbWl0Q29udGV4dC5oYXNMaXN0ZW5lckFycmF5ID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgYSBsaXN0ZW5lciBpcyByZWdpc3RlcmVkIHdpdGggdGhpcyBFbWl0dGVyXG4gICAqL1xuICBwdWJsaWMgaGFzTGlzdGVuZXIoIGxpc3RlbmVyOiBURW1pdHRlckxpc3RlbmVyPFQ+ICk6IGJvb2xlYW4ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFyZ3VtZW50cy5sZW5ndGggPT09IDEsICdFbWl0dGVyLmhhc0xpc3RlbmVyIHNob3VsZCBiZSBjYWxsZWQgd2l0aCAxIGFyZ3VtZW50JyApO1xuICAgIHJldHVybiB0aGlzLmxpc3RlbmVycy5oYXMoIGxpc3RlbmVyICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZXJlIGFyZSBhbnkgbGlzdGVuZXJzLlxuICAgKi9cbiAgcHVibGljIGhhc0xpc3RlbmVycygpOiBib29sZWFuIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcmd1bWVudHMubGVuZ3RoID09PSAwLCAnRW1pdHRlci5oYXNMaXN0ZW5lcnMgc2hvdWxkIGJlIGNhbGxlZCB3aXRob3V0IGFyZ3VtZW50cycgKTtcbiAgICByZXR1cm4gdGhpcy5saXN0ZW5lcnMuc2l6ZSA+IDA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGxpc3RlbmVycy5cbiAgICovXG4gIHB1YmxpYyBnZXRMaXN0ZW5lckNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubGlzdGVuZXJzLnNpemU7XG4gIH1cblxuICAvKipcbiAgICogSW52b2tlcyBhIGNhbGxiYWNrIG9uY2UgZm9yIGVhY2ggbGlzdGVuZXIgLSBtZWFudCBmb3IgUHJvcGVydHkncyB1c2VcbiAgICovXG4gIHB1YmxpYyBmb3JFYWNoTGlzdGVuZXIoIGNhbGxiYWNrOiAoIGxpc3RlbmVyOiBURW1pdHRlckxpc3RlbmVyPFQ+ICkgPT4gdm9pZCApOiB2b2lkIHtcbiAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKCBjYWxsYmFjayApO1xuICB9XG59XG5cbi8qKlxuICogVXRpbGl0eSBjbGFzcyBmb3IgbWFuYWdpbmcgdGhlIGNvbnRleHQgb2YgYW4gZW1pdCBjYWxsLiBUaGlzIGlzIHVzZWQgdG8gbWFuYWdlIHRoZSBzdGF0ZSBvZiB0aGUgZW1pdCBjYWxsLCBhbmRcbiAqIGVzcGVjaWFsbHkgdG8gaGFuZGxlIHJlZW50cmFudCBlbWl0IGNhbGxzICh0aHJvdWdoIHRoZSBzdGFjay9xdWV1ZSBub3RpZmljYXRpb24gc3RyYXRlZ2llcylcbiAqL1xuY2xhc3MgRW1pdENvbnRleHQ8VCBleHRlbmRzIFBhcmFtZXRlckxpc3QgPSBQYXJhbWV0ZXJMaXN0PiBpbXBsZW1lbnRzIFRQb29sYWJsZSB7XG4gIC8vIEdldHMgaW5jcmVtZW50ZWQgd2l0aCBub3RpZmljYXRpb25zXG4gIHB1YmxpYyBpbmRleCE6IG51bWJlcjtcblxuICAvLyBBcmd1bWVudHMgdGhhdCB0aGUgZW1pdCB3YXMgY2FsbGVkIHdpdGhcbiAgcHVibGljIGFyZ3MhOiBUO1xuXG4gIC8vIFdoZXRoZXIgd2Ugc2hvdWxkIGFjdCBsaWtlIHRoZXJlIGlzIGEgbGlzdGVuZXJBcnJheSAoaGFzIGl0IGJlZW4gY29waWVkPylcbiAgcHVibGljIGhhc0xpc3RlbmVyQXJyYXkgPSBmYWxzZTtcblxuICAvLyBPbmx5IHVzZSB0aGlzIGlmIGhhc0xpc3RlbmVyQXJyYXkgaXMgdHJ1ZS4gTk9URTogZm9yIHBlcmZvcm1hbmNlLCB3ZSdyZSBub3QgdXNpbmcgZ2V0dGVycy9ldGMuXG4gIHB1YmxpYyBsaXN0ZW5lckFycmF5OiBURW1pdHRlckxpc3RlbmVyPFQ+W10gPSBbXTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGluZGV4OiBudW1iZXIsIGFyZ3M6IFQgKSB7XG4gICAgdGhpcy5pbml0aWFsaXplKCBpbmRleCwgYXJncyApO1xuICB9XG5cbiAgcHVibGljIGluaXRpYWxpemUoIGluZGV4OiBudW1iZXIsIGFyZ3M6IFQgKTogdGhpcyB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuYXJncyA9IGFyZ3M7XG4gICAgdGhpcy5oYXNMaXN0ZW5lckFycmF5ID0gZmFsc2U7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBmcmVlVG9Qb29sKCk6IHZvaWQge1xuICAgIC8vIFR5cGVTY3JpcHQgZG9lc24ndCBuZWVkIHRvIGtub3cgdGhhdCB3ZSdyZSB1c2luZyB0aGlzIGZvciBkaWZmZXJlbnQgdHlwZXMuIFdoZW4gaXQgaXMgXCJhY3RpdmVcIiwgaXQgd2lsbCBiZVxuICAgIC8vIHRoZSBjb3JyZWN0IHR5cGUuXG4gICAgRW1pdENvbnRleHQucG9vbC5mcmVlVG9Qb29sKCB0aGlzIGFzIHVua25vd24gYXMgRW1pdENvbnRleHQgKTtcblxuICAgIC8vIE5PVEU6IElmIHdlIGhhdmUgZmV3ZXIgY29uY2VybnMgYWJvdXQgbWVtb3J5IGluIHRoZSBmdXR1cmUsIHdlIGNvdWxkIHBvdGVudGlhbGx5IGltcHJvdmUgcGVyZm9ybWFuY2UgYnlcbiAgICAvLyByZW1vdmluZyB0aGUgY2xlYXJpbmcgb3V0IG9mIG1lbW9yeSBoZXJlLiBXZSBkb24ndCBzZWVtIHRvIGNyZWF0ZSBtYW55IEVtaXRDb250ZXh0cywgSE9XRVZFUiBpZiB3ZSBoYXZlIE9ORVxuICAgIC8vIFwibW9yZSByZS1lbnRyYW50XCIgY2FzZSBvbiBzaW0gc3RhcnR1cCB0aGF0IHJlZmVyZW5jZXMgYSBCSUcgQklHIG9iamVjdCwgaXQgY291bGQgdGhlb3JldGljYWxseSBrZWVwIHRoYXRcbiAgICAvLyBvYmplY3QgYWxpdmUgZm9yZXZlci5cblxuICAgIC8vIFdlIHdhbnQgdG8gbnVsbCB0aGluZ3Mgb3V0IHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzLiBEb24ndCB0ZWxsIFR5cGVTY3JpcHQhXG4gICAgLy8gKEl0IHdpbGwgaGF2ZSB0aGUgY29ycmVjdCB0eXBlcyBhZnRlciB0aGUgaW5pdGlhbGl6YXRpb24sIHNvIHRoaXMgd29ya3Mgd2VsbCB3aXRoIG91ciBwb29saW5nIHBhdHRlcm4pLlxuICAgIHRoaXMuYXJncyA9IG51bGwgYXMgdW5rbm93biBhcyBUO1xuXG4gICAgLy8gQ2xlYXIgb3V0IHRoZSBsaXN0ZW5lcnMgYXJyYXksIHNvIHdlIGRvbid0IGxlYWsgbWVtb3J5IHdoaWxlIHdlIGFyZSBpbiB0aGUgcG9vbC4gSWYgd2UgaGF2ZSBsZXNzIGNvbmNlcm5zXG4gICAgdGhpcy5saXN0ZW5lckFycmF5Lmxlbmd0aCA9IDA7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHBvb2wgPSBuZXcgUG9vbCggRW1pdENvbnRleHQsIHtcbiAgICBpbml0aWFsaXplOiBFbWl0Q29udGV4dC5wcm90b3R5cGUuaW5pdGlhbGl6ZVxuICB9ICk7XG5cbiAgcHVibGljIHN0YXRpYyBjcmVhdGU8VCBleHRlbmRzIFBhcmFtZXRlckxpc3Q+KCBpbmRleDogbnVtYmVyLCBhcmdzOiBUICk6IEVtaXRDb250ZXh0PFQ+IHtcbiAgICAvLyBUeXBlU2NyaXB0IGRvZXNuJ3QgbmVlZCB0byBrbm93IHRoYXQgd2UncmUgdXNpbmcgdGhpcyBmb3IgZGlmZmVyZW50IHR5cGVzLiBXaGVuIGl0IGlzIFwiYWN0aXZlXCIsIGl0IHdpbGwgYmVcbiAgICAvLyB0aGUgY29ycmVjdCB0eXBlLlxuICAgIHJldHVybiBFbWl0Q29udGV4dC5wb29sLmNyZWF0ZSggaW5kZXgsIGFyZ3MgKSBhcyB1bmtub3duIGFzIEVtaXRDb250ZXh0PFQ+O1xuICB9XG59XG5cbmF4b24ucmVnaXN0ZXIoICdUaW55RW1pdHRlcicsIFRpbnlFbWl0dGVyICk7Il0sIm5hbWVzIjpbImRvdFJhbmRvbSIsIlJhbmRvbSIsIlBvb2wiLCJheG9uIiwibGlzdGVuZXJPcmRlciIsIl8iLCJoYXNJbiIsIndpbmRvdyIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwibGlzdGVuZXJMaW1pdCIsIkVNSVRfQ09OVEVYVF9NQVhfTEVOR1RIIiwicmFuZG9tIiwic3RhcnRzV2l0aCIsIm1hdGNoIiwic2VlZCIsIk51bWJlciIsIm5leHRJbnQiLCJjb25zb2xlIiwibG9nIiwibWF4TGlzdGVuZXJDb3VudCIsIlRpbnlFbWl0dGVyIiwiZGlzcG9zZSIsInJlbW92ZUFsbExpc3RlbmVycyIsImFzc2VydCIsImlzRGlzcG9zZWQiLCJlbWl0IiwiYXJncyIsIm9uQmVmb3JlTm90aWZ5IiwiYXBwbHkiLCJoYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzIiwiYXNBcnJheSIsIkFycmF5IiwiZnJvbSIsImxpc3RlbmVycyIsInJlb3JkZXJlZExpc3RlbmVycyIsInNodWZmbGUiLCJyZXZlcnNlIiwiU2V0Iiwic2l6ZSIsImVtaXRDb250ZXh0IiwiRW1pdENvbnRleHQiLCJjcmVhdGUiLCJlbWl0Q29udGV4dHMiLCJwdXNoIiwicmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3kiLCJsZW5ndGgiLCJoYXNMaXN0ZW5lckFycmF5IiwibGlzdGVuZXJBcnJheSIsIm5vdGlmeUxvb3AiLCJzaGlmdCIsImZyZWVUb1Bvb2wiLCJwb3AiLCJsaXN0ZW5lciIsImluZGV4IiwiaSIsImFkZExpc3RlbmVyIiwiaGFzTGlzdGVuZXIiLCJndWFyZExpc3RlbmVycyIsImFkZCIsImNoYW5nZUNvdW50IiwiaXNGaW5pdGUiLCJyZW1vdmVMaXN0ZW5lciIsImhhcyIsImRlbGV0ZSIsImNsZWFyIiwiYXJndW1lbnRzIiwiaGFzTGlzdGVuZXJzIiwiZ2V0TGlzdGVuZXJDb3VudCIsImZvckVhY2hMaXN0ZW5lciIsImNhbGxiYWNrIiwiZm9yRWFjaCIsImluaXRpYWxp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