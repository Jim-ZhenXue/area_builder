// Copyright 2021, University of Colorado Boulder
/**
 * Broadcasts when any Node or its ancestors in a Trail change visibility, effectively
 * observing changes to Trail.isVisible().
 *
 * @author Jesse Greenberg
 */ import TinyProperty from '../../../axon/js/TinyProperty.js';
import merge from '../../../phet-core/js/merge.js';
import { scenery } from '../imports.js';
let TrailVisibilityTracker = class TrailVisibilityTracker {
    /**
   * Adds a listener function that will be synchronously called whenever the visibility this Trail changes.
   * @public
   *
   * @param {Function} listener - Listener will be called with no arguments.
   */ addListener(listener) {
        assert && assert(typeof listener === 'function');
        this._listeners.push(listener);
    }
    /**
   * Removes a listener that was previously added with addListener().
   * @public
   *
   * @param {Function} listener
   */ removeListener(listener) {
        assert && assert(typeof listener === 'function');
        const index = _.indexOf(this._listeners, listener);
        assert && assert(index >= 0, 'TrailVisibilityTracker listener not found');
        this._listeners.splice(index, 1);
    }
    /**
   * @public
   */ dispose() {
        for(let j = 0; j < this.trail.length; j++){
            const visibilityListener = this._nodeVisibilityListeners[j];
            if (this.trail.nodes[j].visibleProperty.hasListener(visibilityListener)) {
                this.trail.nodes[j].visibleProperty.removeListener(visibilityListener);
            }
        }
        this.trailVisibleProperty.unlink(this.boundTrailVisibilityChangedListener);
    }
    /**
   * When visibility of the Trail is changed, notify listeners.
   * @private
   */ onVisibilityChange() {
        this.notifyListeners();
    }
    /**
   * Notify listeners to a change in visibility.
   * @private
   */ notifyListeners() {
        let listeners = this._listeners;
        if (!this._isStatic) {
            listeners = listeners.slice();
        }
        const length = listeners.length;
        for(let i = 0; i < length; i++){
            listeners[i]();
        }
    }
    /**
   * @param {Trail} trail - the Trail to track visibility
   * @param {Object } [options]
   */ constructor(trail, options){
        options = merge({
            // {boolan} - whether listeners are called against a defensive copy
            isStatic: false
        }, options);
        // @private {boolean}
        this.isStatic = options.isStatic;
        // @private {Trail}
        this.trail = trail;
        // @private {function[]}
        this._listeners = [];
        // @public {TinyProperty.<boolean>} - True if all Nodes in the Trail are visible.
        this.trailVisibleProperty = new TinyProperty(this.trail.isVisible());
        // Hook up listeners to each Node in the trail, so we are notified of changes. Will be removed on disposal.
        this._nodeVisibilityListeners = [];
        for(let j = 0; j < this.trail.length; j++){
            const nodeVisibilityListener = ()=>{
                this.trailVisibleProperty.set(trail.isVisible());
            };
            this._nodeVisibilityListeners.push(nodeVisibilityListener);
            trail.nodes[j].visibleProperty.link(nodeVisibilityListener);
        }
        this.boundTrailVisibilityChangedListener = this.onVisibilityChange.bind(this);
        this.trailVisibleProperty.link(this.boundTrailVisibilityChangedListener);
    }
};
scenery.register('TrailVisibilityTracker', TrailVisibilityTracker);
export default TrailVisibilityTracker;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9UcmFpbFZpc2liaWxpdHlUcmFja2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBCcm9hZGNhc3RzIHdoZW4gYW55IE5vZGUgb3IgaXRzIGFuY2VzdG9ycyBpbiBhIFRyYWlsIGNoYW5nZSB2aXNpYmlsaXR5LCBlZmZlY3RpdmVseVxuICogb2JzZXJ2aW5nIGNoYW5nZXMgdG8gVHJhaWwuaXNWaXNpYmxlKCkuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcbiAqL1xuXG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IHsgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jbGFzcyBUcmFpbFZpc2liaWxpdHlUcmFja2VyIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtUcmFpbH0gdHJhaWwgLSB0aGUgVHJhaWwgdG8gdHJhY2sgdmlzaWJpbGl0eVxuICAgKiBAcGFyYW0ge09iamVjdCB9IFtvcHRpb25zXVxuICAgKi9cbiAgY29uc3RydWN0b3IoIHRyYWlsLCBvcHRpb25zICkge1xuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG5cbiAgICAgIC8vIHtib29sYW59IC0gd2hldGhlciBsaXN0ZW5lcnMgYXJlIGNhbGxlZCBhZ2FpbnN0IGEgZGVmZW5zaXZlIGNvcHlcbiAgICAgIGlzU3RhdGljOiBmYWxzZVxuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufVxuICAgIHRoaXMuaXNTdGF0aWMgPSBvcHRpb25zLmlzU3RhdGljO1xuXG4gICAgLy8gQHByaXZhdGUge1RyYWlsfVxuICAgIHRoaXMudHJhaWwgPSB0cmFpbDtcblxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbltdfVxuICAgIHRoaXMuX2xpc3RlbmVycyA9IFtdO1xuXG4gICAgLy8gQHB1YmxpYyB7VGlueVByb3BlcnR5Ljxib29sZWFuPn0gLSBUcnVlIGlmIGFsbCBOb2RlcyBpbiB0aGUgVHJhaWwgYXJlIHZpc2libGUuXG4gICAgdGhpcy50cmFpbFZpc2libGVQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIHRoaXMudHJhaWwuaXNWaXNpYmxlKCkgKTtcblxuICAgIC8vIEhvb2sgdXAgbGlzdGVuZXJzIHRvIGVhY2ggTm9kZSBpbiB0aGUgdHJhaWwsIHNvIHdlIGFyZSBub3RpZmllZCBvZiBjaGFuZ2VzLiBXaWxsIGJlIHJlbW92ZWQgb24gZGlzcG9zYWwuXG4gICAgdGhpcy5fbm9kZVZpc2liaWxpdHlMaXN0ZW5lcnMgPSBbXTtcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLnRyYWlsLmxlbmd0aDsgaisrICkge1xuICAgICAgY29uc3Qgbm9kZVZpc2liaWxpdHlMaXN0ZW5lciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy50cmFpbFZpc2libGVQcm9wZXJ0eS5zZXQoIHRyYWlsLmlzVmlzaWJsZSgpICk7XG4gICAgICB9O1xuICAgICAgdGhpcy5fbm9kZVZpc2liaWxpdHlMaXN0ZW5lcnMucHVzaCggbm9kZVZpc2liaWxpdHlMaXN0ZW5lciApO1xuICAgICAgdHJhaWwubm9kZXNbIGogXS52aXNpYmxlUHJvcGVydHkubGluayggbm9kZVZpc2liaWxpdHlMaXN0ZW5lciApO1xuICAgIH1cblxuICAgIHRoaXMuYm91bmRUcmFpbFZpc2liaWxpdHlDaGFuZ2VkTGlzdGVuZXIgPSB0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZS5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy50cmFpbFZpc2libGVQcm9wZXJ0eS5saW5rKCB0aGlzLmJvdW5kVHJhaWxWaXNpYmlsaXR5Q2hhbmdlZExpc3RlbmVyICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGxpc3RlbmVyIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBzeW5jaHJvbm91c2x5IGNhbGxlZCB3aGVuZXZlciB0aGUgdmlzaWJpbGl0eSB0aGlzIFRyYWlsIGNoYW5nZXMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgLSBMaXN0ZW5lciB3aWxsIGJlIGNhbGxlZCB3aXRoIG5vIGFyZ3VtZW50cy5cbiAgICovXG4gIGFkZExpc3RlbmVyKCBsaXN0ZW5lciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbGlzdGVuZXIgPT09ICdmdW5jdGlvbicgKTtcbiAgICB0aGlzLl9saXN0ZW5lcnMucHVzaCggbGlzdGVuZXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgbGlzdGVuZXIgdGhhdCB3YXMgcHJldmlvdXNseSBhZGRlZCB3aXRoIGFkZExpc3RlbmVyKCkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKCBsaXN0ZW5lciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbGlzdGVuZXIgPT09ICdmdW5jdGlvbicgKTtcblxuICAgIGNvbnN0IGluZGV4ID0gXy5pbmRleE9mKCB0aGlzLl9saXN0ZW5lcnMsIGxpc3RlbmVyICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggPj0gMCwgJ1RyYWlsVmlzaWJpbGl0eVRyYWNrZXIgbGlzdGVuZXIgbm90IGZvdW5kJyApO1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMudHJhaWwubGVuZ3RoOyBqKysgKSB7XG4gICAgICBjb25zdCB2aXNpYmlsaXR5TGlzdGVuZXIgPSB0aGlzLl9ub2RlVmlzaWJpbGl0eUxpc3RlbmVyc1sgaiBdO1xuXG4gICAgICBpZiAoIHRoaXMudHJhaWwubm9kZXNbIGogXS52aXNpYmxlUHJvcGVydHkuaGFzTGlzdGVuZXIoIHZpc2liaWxpdHlMaXN0ZW5lciApICkge1xuICAgICAgICB0aGlzLnRyYWlsLm5vZGVzWyBqIF0udmlzaWJsZVByb3BlcnR5LnJlbW92ZUxpc3RlbmVyKCB2aXNpYmlsaXR5TGlzdGVuZXIgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnRyYWlsVmlzaWJsZVByb3BlcnR5LnVubGluayggdGhpcy5ib3VuZFRyYWlsVmlzaWJpbGl0eUNoYW5nZWRMaXN0ZW5lciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gdmlzaWJpbGl0eSBvZiB0aGUgVHJhaWwgaXMgY2hhbmdlZCwgbm90aWZ5IGxpc3RlbmVycy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uVmlzaWJpbGl0eUNoYW5nZSgpIHtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycygpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGlmeSBsaXN0ZW5lcnMgdG8gYSBjaGFuZ2UgaW4gdmlzaWJpbGl0eS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG5vdGlmeUxpc3RlbmVycygpIHtcbiAgICBsZXQgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXG4gICAgaWYgKCAhdGhpcy5faXNTdGF0aWMgKSB7XG4gICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuc2xpY2UoKTtcbiAgICB9XG5cbiAgICBjb25zdCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICAgbGlzdGVuZXJzWyBpIF0oKTtcbiAgICB9XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1RyYWlsVmlzaWJpbGl0eVRyYWNrZXInLCBUcmFpbFZpc2liaWxpdHlUcmFja2VyICk7XG5leHBvcnQgZGVmYXVsdCBUcmFpbFZpc2liaWxpdHlUcmFja2VyOyJdLCJuYW1lcyI6WyJUaW55UHJvcGVydHkiLCJtZXJnZSIsInNjZW5lcnkiLCJUcmFpbFZpc2liaWxpdHlUcmFja2VyIiwiYWRkTGlzdGVuZXIiLCJsaXN0ZW5lciIsImFzc2VydCIsIl9saXN0ZW5lcnMiLCJwdXNoIiwicmVtb3ZlTGlzdGVuZXIiLCJpbmRleCIsIl8iLCJpbmRleE9mIiwic3BsaWNlIiwiZGlzcG9zZSIsImoiLCJ0cmFpbCIsImxlbmd0aCIsInZpc2liaWxpdHlMaXN0ZW5lciIsIl9ub2RlVmlzaWJpbGl0eUxpc3RlbmVycyIsIm5vZGVzIiwidmlzaWJsZVByb3BlcnR5IiwiaGFzTGlzdGVuZXIiLCJ0cmFpbFZpc2libGVQcm9wZXJ0eSIsInVubGluayIsImJvdW5kVHJhaWxWaXNpYmlsaXR5Q2hhbmdlZExpc3RlbmVyIiwib25WaXNpYmlsaXR5Q2hhbmdlIiwibm90aWZ5TGlzdGVuZXJzIiwibGlzdGVuZXJzIiwiX2lzU3RhdGljIiwic2xpY2UiLCJpIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiaXNTdGF0aWMiLCJpc1Zpc2libGUiLCJub2RlVmlzaWJpbGl0eUxpc3RlbmVyIiwic2V0IiwibGluayIsImJpbmQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7OztDQUtDLEdBRUQsT0FBT0Esa0JBQWtCLG1DQUFtQztBQUM1RCxPQUFPQyxXQUFXLGlDQUFpQztBQUNuRCxTQUFTQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRXhDLElBQUEsQUFBTUMseUJBQU4sTUFBTUE7SUF3Q0o7Ozs7O0dBS0MsR0FDREMsWUFBYUMsUUFBUSxFQUFHO1FBQ3RCQyxVQUFVQSxPQUFRLE9BQU9ELGFBQWE7UUFDdEMsSUFBSSxDQUFDRSxVQUFVLENBQUNDLElBQUksQ0FBRUg7SUFDeEI7SUFFQTs7Ozs7R0FLQyxHQUNESSxlQUFnQkosUUFBUSxFQUFHO1FBQ3pCQyxVQUFVQSxPQUFRLE9BQU9ELGFBQWE7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