// Copyright 2016-2024, University of Colorado Boulder
/**
 * Hooks up listeners to a paint (fill or stroke) to determine when its represented value has changed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { isTReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import { Color, Gradient, scenery } from '../imports.js';
let PaintObserver = class PaintObserver {
    /**
   * Should be called when our paint (fill/stroke) may have changed.
   * @public (scenery-internal)
   *
   * Should update any listeners (if necessary), and call the callback (if necessary).
   *
   * NOTE: To clean state, set this to null.
   *
   * @param {PaintDef} primary
   */ setPrimary(primary) {
        if (primary !== this.primary) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] primary update');
            sceneryLog && sceneryLog.Paints && sceneryLog.push();
            this.detachPrimary(this.primary);
            this.primary = primary;
            this.attachPrimary(primary);
            this.notifyChangeCallback();
            sceneryLog && sceneryLog.Paints && sceneryLog.pop();
        }
    }
    /**
   * Releases references without sending the notifications.
   * @public
   */ clean() {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] clean');
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        this.detachPrimary(this.primary);
        this.primary = null;
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    /**
   * Called when the value of a "primary" Property (contents of one, main or as a Gradient) is potentially changed.
   * @private
   *
   * @param {string|Color} newPaint
   * @param {string|Color} oldPaint
   * @param {Property} property
   */ updateSecondary(newPaint, oldPaint, property) {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] secondary update');
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        const count = this.secondaryPropertyCountsMap[property.id];
        assert && assert(count > 0, 'We should always be removing at least one reference');
        for(let i = 0; i < count; i++){
            this.attachSecondary(newPaint);
        }
        this.notifyChangeCallback();
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    /**
   * Attempt to attach listeners to the paint's primary (the paint itself), or something else that acts like the primary
   * (properties on a gradient).
   * @private
   *
   * TODO: Note that this is called for gradient colors also https://github.com/phetsims/scenery/issues/1581
   *
   * NOTE: If it's a Property, we'll also need to handle the secondary (part inside the Property).
   *
   * @param {PaintDef} paint
   */ attachPrimary(paint) {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] attachPrimary');
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        if (isTReadOnlyProperty(paint)) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] add Property listener');
            sceneryLog && sceneryLog.Paints && sceneryLog.push();
            this.secondaryLazyLinkProperty(paint);
            this.attachSecondary(paint.get());
            sceneryLog && sceneryLog.Paints && sceneryLog.pop();
        } else if (paint instanceof Color) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] Color changed to immutable');
            // We set the color to be immutable, so we don't need to add a listener
            paint.setImmutable();
        } else if (paint instanceof Gradient) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] add Gradient listeners');
            sceneryLog && sceneryLog.Paints && sceneryLog.push();
            for(let i = 0; i < paint.stops.length; i++){
                this.attachPrimary(paint.stops[i].color);
            }
            sceneryLog && sceneryLog.Paints && sceneryLog.pop();
        }
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    /**
   * Attempt to detach listeners from the paint's primary (the paint itself).
   * @private
   *
   * TODO: Note that this is called for gradient colors also https://github.com/phetsims/scenery/issues/1581
   *
   * NOTE: If it's a Property or Gradient, we'll also need to handle the secondaries (part(s) inside the Property(ies)).
   *
   * @param {PaintDef} paint
   */ detachPrimary(paint) {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] detachPrimary');
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        if (isTReadOnlyProperty(paint)) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] remove Property listener');
            sceneryLog && sceneryLog.Paints && sceneryLog.push();
            this.secondaryUnlinkProperty(paint);
            sceneryLog && sceneryLog.Paints && sceneryLog.pop();
        } else if (paint instanceof Gradient) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] remove Gradient listeners');
            sceneryLog && sceneryLog.Paints && sceneryLog.push();
            for(let i = 0; i < paint.stops.length; i++){
                this.detachPrimary(paint.stops[i].color);
            }
            sceneryLog && sceneryLog.Paints && sceneryLog.pop();
        }
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    /**
   * Attempt to attach listeners to the paint's secondary (part within the Property).
   * @private
   *
   * @param {string|Color} paint
   */ attachSecondary(paint) {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] attachSecondary');
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        if (paint instanceof Color) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] Color set to immutable');
            // We set the color to be immutable, so we don't need to add a listener
            paint.setImmutable();
        }
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    /**
   * Calls the change callback, and invalidates the paint itself if it's a gradient.
   * @private
   */ notifyChanged() {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints('[PaintObserver] changed');
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        if (this.primary instanceof Gradient) {
            this.primary.invalidateCanvasGradient();
        }
        this.changeCallback();
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    /**
   * Adds our secondary listener to the Property (unless there is already one, in which case we record the counts).
   * @private
   *
   * @param {Property.<*>} property
   */ secondaryLazyLinkProperty(property) {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[PaintObserver] secondaryLazyLinkProperty ${property._id}`);
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        const id = property.id;
        const count = this.secondaryPropertyCountsMap[id];
        if (count) {
            this.secondaryPropertyCountsMap[id]++;
        } else {
            this.secondaryPropertyCountsMap[id] = 1;
            property.lazyLink(this.updateSecondaryListener);
        }
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    /**
   * Removes our secondary listener from the Property (unless there were more than 1 time we needed to listen to it,
   * in which case we reduce the count).
   * @private
   *
   * @param {Property.<*>} property
   */ secondaryUnlinkProperty(property) {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[PaintObserver] secondaryUnlinkProperty ${property._id}`);
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        const id = property.id;
        const count = --this.secondaryPropertyCountsMap[id];
        assert && assert(count >= 0, 'We should have had a reference before');
        if (count === 0) {
            delete this.secondaryPropertyCountsMap[id];
            if (!property.isDisposed) {
                property.unlink(this.updateSecondaryListener);
            }
        }
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    /**
   * An observer for a paint (fill or stroke), that will be able to trigger notifications when it changes.
   *
   * @param {function} changeCallback - To be called on any change (with no arguments)
   */ constructor(changeCallback){
        // @private {PaintDef} - Our unwrapped fill/stroke value
        this.primary = null;
        // @private {function} - Our callback
        this.changeCallback = changeCallback;
        // @private {function} - To be called when a potential change is detected
        this.notifyChangeCallback = this.notifyChanged.bind(this);
        // @private {function} - To be called whenever our secondary fill/stroke value may have changed
        this.updateSecondaryListener = this.updateSecondary.bind(this);
        // @private {Object} - Maps {number} property.id => {number} count (number of times we would be listening to it)
        this.secondaryPropertyCountsMap = {};
    }
};
scenery.register('PaintObserver', PaintObserver);
export default PaintObserver;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9QYWludE9ic2VydmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEhvb2tzIHVwIGxpc3RlbmVycyB0byBhIHBhaW50IChmaWxsIG9yIHN0cm9rZSkgdG8gZGV0ZXJtaW5lIHdoZW4gaXRzIHJlcHJlc2VudGVkIHZhbHVlIGhhcyBjaGFuZ2VkLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgeyBpc1RSZWFkT25seVByb3BlcnR5IH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgeyBDb2xvciwgR3JhZGllbnQsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuY2xhc3MgUGFpbnRPYnNlcnZlciB7XG4gIC8qKlxuICAgKiBBbiBvYnNlcnZlciBmb3IgYSBwYWludCAoZmlsbCBvciBzdHJva2UpLCB0aGF0IHdpbGwgYmUgYWJsZSB0byB0cmlnZ2VyIG5vdGlmaWNhdGlvbnMgd2hlbiBpdCBjaGFuZ2VzLlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjaGFuZ2VDYWxsYmFjayAtIFRvIGJlIGNhbGxlZCBvbiBhbnkgY2hhbmdlICh3aXRoIG5vIGFyZ3VtZW50cylcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBjaGFuZ2VDYWxsYmFjayApIHtcblxuICAgIC8vIEBwcml2YXRlIHtQYWludERlZn0gLSBPdXIgdW53cmFwcGVkIGZpbGwvc3Ryb2tlIHZhbHVlXG4gICAgdGhpcy5wcmltYXJ5ID0gbnVsbDtcblxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn0gLSBPdXIgY2FsbGJhY2tcbiAgICB0aGlzLmNoYW5nZUNhbGxiYWNrID0gY2hhbmdlQ2FsbGJhY2s7XG5cbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259IC0gVG8gYmUgY2FsbGVkIHdoZW4gYSBwb3RlbnRpYWwgY2hhbmdlIGlzIGRldGVjdGVkXG4gICAgdGhpcy5ub3RpZnlDaGFuZ2VDYWxsYmFjayA9IHRoaXMubm90aWZ5Q2hhbmdlZC5iaW5kKCB0aGlzICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259IC0gVG8gYmUgY2FsbGVkIHdoZW5ldmVyIG91ciBzZWNvbmRhcnkgZmlsbC9zdHJva2UgdmFsdWUgbWF5IGhhdmUgY2hhbmdlZFxuICAgIHRoaXMudXBkYXRlU2Vjb25kYXJ5TGlzdGVuZXIgPSB0aGlzLnVwZGF0ZVNlY29uZGFyeS5iaW5kKCB0aGlzICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7T2JqZWN0fSAtIE1hcHMge251bWJlcn0gcHJvcGVydHkuaWQgPT4ge251bWJlcn0gY291bnQgKG51bWJlciBvZiB0aW1lcyB3ZSB3b3VsZCBiZSBsaXN0ZW5pbmcgdG8gaXQpXG4gICAgdGhpcy5zZWNvbmRhcnlQcm9wZXJ0eUNvdW50c01hcCA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3VsZCBiZSBjYWxsZWQgd2hlbiBvdXIgcGFpbnQgKGZpbGwvc3Ryb2tlKSBtYXkgaGF2ZSBjaGFuZ2VkLlxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBTaG91bGQgdXBkYXRlIGFueSBsaXN0ZW5lcnMgKGlmIG5lY2Vzc2FyeSksIGFuZCBjYWxsIHRoZSBjYWxsYmFjayAoaWYgbmVjZXNzYXJ5KS5cbiAgICpcbiAgICogTk9URTogVG8gY2xlYW4gc3RhdGUsIHNldCB0aGlzIHRvIG51bGwuXG4gICAqXG4gICAqIEBwYXJhbSB7UGFpbnREZWZ9IHByaW1hcnlcbiAgICovXG4gIHNldFByaW1hcnkoIHByaW1hcnkgKSB7XG4gICAgaWYgKCBwcmltYXJ5ICE9PSB0aGlzLnByaW1hcnkgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCAnW1BhaW50T2JzZXJ2ZXJdIHByaW1hcnkgdXBkYXRlJyApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgdGhpcy5kZXRhY2hQcmltYXJ5KCB0aGlzLnByaW1hcnkgKTtcbiAgICAgIHRoaXMucHJpbWFyeSA9IHByaW1hcnk7XG4gICAgICB0aGlzLmF0dGFjaFByaW1hcnkoIHByaW1hcnkgKTtcbiAgICAgIHRoaXMubm90aWZ5Q2hhbmdlQ2FsbGJhY2soKTtcblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzIHdpdGhvdXQgc2VuZGluZyB0aGUgbm90aWZpY2F0aW9ucy5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgY2xlYW4oKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggJ1tQYWludE9ic2VydmVyXSBjbGVhbicgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgdGhpcy5kZXRhY2hQcmltYXJ5KCB0aGlzLnByaW1hcnkgKTtcbiAgICB0aGlzLnByaW1hcnkgPSBudWxsO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB2YWx1ZSBvZiBhIFwicHJpbWFyeVwiIFByb3BlcnR5IChjb250ZW50cyBvZiBvbmUsIG1haW4gb3IgYXMgYSBHcmFkaWVudCkgaXMgcG90ZW50aWFsbHkgY2hhbmdlZC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8Q29sb3J9IG5ld1BhaW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfENvbG9yfSBvbGRQYWludFxuICAgKiBAcGFyYW0ge1Byb3BlcnR5fSBwcm9wZXJ0eVxuICAgKi9cbiAgdXBkYXRlU2Vjb25kYXJ5KCBuZXdQYWludCwgb2xkUGFpbnQsIHByb3BlcnR5ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoICdbUGFpbnRPYnNlcnZlcl0gc2Vjb25kYXJ5IHVwZGF0ZScgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgY29uc3QgY291bnQgPSB0aGlzLnNlY29uZGFyeVByb3BlcnR5Q291bnRzTWFwWyBwcm9wZXJ0eS5pZCBdO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvdW50ID4gMCwgJ1dlIHNob3VsZCBhbHdheXMgYmUgcmVtb3ZpbmcgYXQgbGVhc3Qgb25lIHJlZmVyZW5jZScgKTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNvdW50OyBpKysgKSB7XG4gICAgICB0aGlzLmF0dGFjaFNlY29uZGFyeSggbmV3UGFpbnQgKTtcbiAgICB9XG4gICAgdGhpcy5ub3RpZnlDaGFuZ2VDYWxsYmFjaygpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHQgdG8gYXR0YWNoIGxpc3RlbmVycyB0byB0aGUgcGFpbnQncyBwcmltYXJ5ICh0aGUgcGFpbnQgaXRzZWxmKSwgb3Igc29tZXRoaW5nIGVsc2UgdGhhdCBhY3RzIGxpa2UgdGhlIHByaW1hcnlcbiAgICogKHByb3BlcnRpZXMgb24gYSBncmFkaWVudCkuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIFRPRE86IE5vdGUgdGhhdCB0aGlzIGlzIGNhbGxlZCBmb3IgZ3JhZGllbnQgY29sb3JzIGFsc28gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICpcbiAgICogTk9URTogSWYgaXQncyBhIFByb3BlcnR5LCB3ZSdsbCBhbHNvIG5lZWQgdG8gaGFuZGxlIHRoZSBzZWNvbmRhcnkgKHBhcnQgaW5zaWRlIHRoZSBQcm9wZXJ0eSkuXG4gICAqXG4gICAqIEBwYXJhbSB7UGFpbnREZWZ9IHBhaW50XG4gICAqL1xuICBhdHRhY2hQcmltYXJ5KCBwYWludCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCAnW1BhaW50T2JzZXJ2ZXJdIGF0dGFjaFByaW1hcnknICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggcGFpbnQgKSApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoICdbUGFpbnRPYnNlcnZlcl0gYWRkIFByb3BlcnR5IGxpc3RlbmVyJyApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICAgIHRoaXMuc2Vjb25kYXJ5TGF6eUxpbmtQcm9wZXJ0eSggcGFpbnQgKTtcbiAgICAgIHRoaXMuYXR0YWNoU2Vjb25kYXJ5KCBwYWludC5nZXQoKSApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH1cbiAgICBlbHNlIGlmICggcGFpbnQgaW5zdGFuY2VvZiBDb2xvciApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoICdbUGFpbnRPYnNlcnZlcl0gQ29sb3IgY2hhbmdlZCB0byBpbW11dGFibGUnICk7XG5cbiAgICAgIC8vIFdlIHNldCB0aGUgY29sb3IgdG8gYmUgaW1tdXRhYmxlLCBzbyB3ZSBkb24ndCBuZWVkIHRvIGFkZCBhIGxpc3RlbmVyXG4gICAgICBwYWludC5zZXRJbW11dGFibGUoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHBhaW50IGluc3RhbmNlb2YgR3JhZGllbnQgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCAnW1BhaW50T2JzZXJ2ZXJdIGFkZCBHcmFkaWVudCBsaXN0ZW5lcnMnICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGFpbnQuc3RvcHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIHRoaXMuYXR0YWNoUHJpbWFyeSggcGFpbnQuc3RvcHNbIGkgXS5jb2xvciApO1xuICAgICAgfVxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0IHRvIGRldGFjaCBsaXN0ZW5lcnMgZnJvbSB0aGUgcGFpbnQncyBwcmltYXJ5ICh0aGUgcGFpbnQgaXRzZWxmKS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogVE9ETzogTm90ZSB0aGF0IHRoaXMgaXMgY2FsbGVkIGZvciBncmFkaWVudCBjb2xvcnMgYWxzbyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgKlxuICAgKiBOT1RFOiBJZiBpdCdzIGEgUHJvcGVydHkgb3IgR3JhZGllbnQsIHdlJ2xsIGFsc28gbmVlZCB0byBoYW5kbGUgdGhlIHNlY29uZGFyaWVzIChwYXJ0KHMpIGluc2lkZSB0aGUgUHJvcGVydHkoaWVzKSkuXG4gICAqXG4gICAqIEBwYXJhbSB7UGFpbnREZWZ9IHBhaW50XG4gICAqL1xuICBkZXRhY2hQcmltYXJ5KCBwYWludCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCAnW1BhaW50T2JzZXJ2ZXJdIGRldGFjaFByaW1hcnknICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggcGFpbnQgKSApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoICdbUGFpbnRPYnNlcnZlcl0gcmVtb3ZlIFByb3BlcnR5IGxpc3RlbmVyJyApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICAgIHRoaXMuc2Vjb25kYXJ5VW5saW5rUHJvcGVydHkoIHBhaW50ICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBwYWludCBpbnN0YW5jZW9mIEdyYWRpZW50ICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggJ1tQYWludE9ic2VydmVyXSByZW1vdmUgR3JhZGllbnQgbGlzdGVuZXJzJyApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBhaW50LnN0b3BzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICB0aGlzLmRldGFjaFByaW1hcnkoIHBhaW50LnN0b3BzWyBpIF0uY29sb3IgKTtcbiAgICAgIH1cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQXR0ZW1wdCB0byBhdHRhY2ggbGlzdGVuZXJzIHRvIHRoZSBwYWludCdzIHNlY29uZGFyeSAocGFydCB3aXRoaW4gdGhlIFByb3BlcnR5KS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8Q29sb3J9IHBhaW50XG4gICAqL1xuICBhdHRhY2hTZWNvbmRhcnkoIHBhaW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoICdbUGFpbnRPYnNlcnZlcl0gYXR0YWNoU2Vjb25kYXJ5JyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBpZiAoIHBhaW50IGluc3RhbmNlb2YgQ29sb3IgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCAnW1BhaW50T2JzZXJ2ZXJdIENvbG9yIHNldCB0byBpbW11dGFibGUnICk7XG5cbiAgICAgIC8vIFdlIHNldCB0aGUgY29sb3IgdG8gYmUgaW1tdXRhYmxlLCBzbyB3ZSBkb24ndCBuZWVkIHRvIGFkZCBhIGxpc3RlbmVyXG4gICAgICBwYWludC5zZXRJbW11dGFibGUoKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgdGhlIGNoYW5nZSBjYWxsYmFjaywgYW5kIGludmFsaWRhdGVzIHRoZSBwYWludCBpdHNlbGYgaWYgaXQncyBhIGdyYWRpZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbm90aWZ5Q2hhbmdlZCgpIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCAnW1BhaW50T2JzZXJ2ZXJdIGNoYW5nZWQnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGlmICggdGhpcy5wcmltYXJ5IGluc3RhbmNlb2YgR3JhZGllbnQgKSB7XG4gICAgICB0aGlzLnByaW1hcnkuaW52YWxpZGF0ZUNhbnZhc0dyYWRpZW50KCk7XG4gICAgfVxuICAgIHRoaXMuY2hhbmdlQ2FsbGJhY2soKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIG91ciBzZWNvbmRhcnkgbGlzdGVuZXIgdG8gdGhlIFByb3BlcnR5ICh1bmxlc3MgdGhlcmUgaXMgYWxyZWFkeSBvbmUsIGluIHdoaWNoIGNhc2Ugd2UgcmVjb3JkIHRoZSBjb3VudHMpLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjwqPn0gcHJvcGVydHlcbiAgICovXG4gIHNlY29uZGFyeUxhenlMaW5rUHJvcGVydHkoIHByb3BlcnR5ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoIGBbUGFpbnRPYnNlcnZlcl0gc2Vjb25kYXJ5TGF6eUxpbmtQcm9wZXJ0eSAke3Byb3BlcnR5Ll9pZH1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGNvbnN0IGlkID0gcHJvcGVydHkuaWQ7XG4gICAgY29uc3QgY291bnQgPSB0aGlzLnNlY29uZGFyeVByb3BlcnR5Q291bnRzTWFwWyBpZCBdO1xuICAgIGlmICggY291bnQgKSB7XG4gICAgICB0aGlzLnNlY29uZGFyeVByb3BlcnR5Q291bnRzTWFwWyBpZCBdKys7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5zZWNvbmRhcnlQcm9wZXJ0eUNvdW50c01hcFsgaWQgXSA9IDE7XG4gICAgICBwcm9wZXJ0eS5sYXp5TGluayggdGhpcy51cGRhdGVTZWNvbmRhcnlMaXN0ZW5lciApO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIG91ciBzZWNvbmRhcnkgbGlzdGVuZXIgZnJvbSB0aGUgUHJvcGVydHkgKHVubGVzcyB0aGVyZSB3ZXJlIG1vcmUgdGhhbiAxIHRpbWUgd2UgbmVlZGVkIHRvIGxpc3RlbiB0byBpdCxcbiAgICogaW4gd2hpY2ggY2FzZSB3ZSByZWR1Y2UgdGhlIGNvdW50KS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Kj59IHByb3BlcnR5XG4gICAqL1xuICBzZWNvbmRhcnlVbmxpbmtQcm9wZXJ0eSggcHJvcGVydHkgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYFtQYWludE9ic2VydmVyXSBzZWNvbmRhcnlVbmxpbmtQcm9wZXJ0eSAke3Byb3BlcnR5Ll9pZH1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGNvbnN0IGlkID0gcHJvcGVydHkuaWQ7XG4gICAgY29uc3QgY291bnQgPSAtLXRoaXMuc2Vjb25kYXJ5UHJvcGVydHlDb3VudHNNYXBbIGlkIF07XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY291bnQgPj0gMCwgJ1dlIHNob3VsZCBoYXZlIGhhZCBhIHJlZmVyZW5jZSBiZWZvcmUnICk7XG5cbiAgICBpZiAoIGNvdW50ID09PSAwICkge1xuICAgICAgZGVsZXRlIHRoaXMuc2Vjb25kYXJ5UHJvcGVydHlDb3VudHNNYXBbIGlkIF07XG4gICAgICBpZiAoICFwcm9wZXJ0eS5pc0Rpc3Bvc2VkICkge1xuICAgICAgICBwcm9wZXJ0eS51bmxpbmsoIHRoaXMudXBkYXRlU2Vjb25kYXJ5TGlzdGVuZXIgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1BhaW50T2JzZXJ2ZXInLCBQYWludE9ic2VydmVyICk7XG5leHBvcnQgZGVmYXVsdCBQYWludE9ic2VydmVyOyJdLCJuYW1lcyI6WyJpc1RSZWFkT25seVByb3BlcnR5IiwiQ29sb3IiLCJHcmFkaWVudCIsInNjZW5lcnkiLCJQYWludE9ic2VydmVyIiwic2V0UHJpbWFyeSIsInByaW1hcnkiLCJzY2VuZXJ5TG9nIiwiUGFpbnRzIiwicHVzaCIsImRldGFjaFByaW1hcnkiLCJhdHRhY2hQcmltYXJ5Iiwibm90aWZ5Q2hhbmdlQ2FsbGJhY2siLCJwb3AiLCJjbGVhbiIsInVwZGF0ZVNlY29uZGFyeSIsIm5ld1BhaW50Iiwib2xkUGFpbnQiLCJwcm9wZXJ0eSIsImNvdW50Iiwic2Vjb25kYXJ5UHJvcGVydHlDb3VudHNNYXAiLCJpZCIsImFzc2VydCIsImkiLCJhdHRhY2hTZWNvbmRhcnkiLCJwYWludCIsInNlY29uZGFyeUxhenlMaW5rUHJvcGVydHkiLCJnZXQiLCJzZXRJbW11dGFibGUiLCJzdG9wcyIsImxlbmd0aCIsImNvbG9yIiwic2Vjb25kYXJ5VW5saW5rUHJvcGVydHkiLCJub3RpZnlDaGFuZ2VkIiwiaW52YWxpZGF0ZUNhbnZhc0dyYWRpZW50IiwiY2hhbmdlQ2FsbGJhY2siLCJfaWQiLCJsYXp5TGluayIsInVwZGF0ZVNlY29uZGFyeUxpc3RlbmVyIiwiaXNEaXNwb3NlZCIsInVu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