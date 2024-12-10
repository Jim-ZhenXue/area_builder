// Copyright 2020-2024, University of Colorado Boulder
/**
 * A trait to be mixed into PressListeners for identifying which SpriteInstance of a given Sprites node was interacted
 * with, AND will prevent interactions that are NOT over any SpriteInstances.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import inheritance from '../../../phet-core/js/inheritance.js';
import memoize from '../../../phet-core/js/memoize.js';
import { PressListener, scenery, Sprites } from '../imports.js';
/**
 * @param type - Should be a PressListener-based type
 */ const SpriteListenable = memoize((type)=>{
    assert && assert(_.includes(inheritance(type), PressListener), 'Only PressListener subtypes should mix SpriteListenable');
    return class extends type {
        /**
     * @override - see PressListener
     */ press(event, targetNode, callback) {
            // If pressed, then the press would be exited later AND we wouldn't want to override our spriteInstance anyway.
            if (this.isPressed) {
                return false;
            }
            // Zero it out, so we only respond to Sprites instances.
            this.spriteInstance = null;
            if (event.currentTarget instanceof Sprites) {
                const sprites = event.currentTarget;
                this.spriteInstance = sprites.getSpriteInstanceFromPoint(sprites.globalToLocalPoint(event.pointer.point));
            }
            // If we have no instance, don't super-call (same behavior for never starting a press)
            if (this.spriteInstance) {
                return super.press(event, targetNode, callback);
            } else {
                return false;
            }
        }
        constructor(...args){
            super(...args), this.spriteInstance = null;
        }
    };
});
scenery.register('SpriteListenable', SpriteListenable);
export default SpriteListenable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL1Nwcml0ZUxpc3RlbmFibGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSB0cmFpdCB0byBiZSBtaXhlZCBpbnRvIFByZXNzTGlzdGVuZXJzIGZvciBpZGVudGlmeWluZyB3aGljaCBTcHJpdGVJbnN0YW5jZSBvZiBhIGdpdmVuIFNwcml0ZXMgbm9kZSB3YXMgaW50ZXJhY3RlZFxuICogd2l0aCwgQU5EIHdpbGwgcHJldmVudCBpbnRlcmFjdGlvbnMgdGhhdCBhcmUgTk9UIG92ZXIgYW55IFNwcml0ZUluc3RhbmNlcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGluaGVyaXRhbmNlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9pbmhlcml0YW5jZS5qcyc7XG5pbXBvcnQgbWVtb2l6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVtb2l6ZS5qcyc7XG5pbXBvcnQgQ29uc3RydWN0b3IgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0NvbnN0cnVjdG9yLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IHsgTm9kZSwgUHJlc3NMaXN0ZW5lciwgUHJlc3NMaXN0ZW5lckV2ZW50LCBzY2VuZXJ5LCBTcHJpdGVJbnN0YW5jZSwgU3ByaXRlcyB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG50eXBlIFRTcHJpdGVMaXN0ZW5hYmxlID0ge1xuICBzcHJpdGVJbnN0YW5jZTogU3ByaXRlSW5zdGFuY2UgfCBudWxsO1xufTtcblxuLyoqXG4gKiBAcGFyYW0gdHlwZSAtIFNob3VsZCBiZSBhIFByZXNzTGlzdGVuZXItYmFzZWQgdHlwZVxuICovXG5jb25zdCBTcHJpdGVMaXN0ZW5hYmxlID0gbWVtb2l6ZSggPFN1cGVyVHlwZSBleHRlbmRzIENvbnN0cnVjdG9yPFByZXNzTGlzdGVuZXI+PiggdHlwZTogU3VwZXJUeXBlICk6IFN1cGVyVHlwZSAmIENvbnN0cnVjdG9yPFRTcHJpdGVMaXN0ZW5hYmxlPiA9PiB7XG4gIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIGluaGVyaXRhbmNlKCB0eXBlICksIFByZXNzTGlzdGVuZXIgKSwgJ09ubHkgUHJlc3NMaXN0ZW5lciBzdWJ0eXBlcyBzaG91bGQgbWl4IFNwcml0ZUxpc3RlbmFibGUnICk7XG5cbiAgcmV0dXJuIGNsYXNzIGV4dGVuZHMgdHlwZSBpbXBsZW1lbnRzIFRTcHJpdGVMaXN0ZW5hYmxlIHtcblxuICAgIHB1YmxpYyBzcHJpdGVJbnN0YW5jZTogU3ByaXRlSW5zdGFuY2UgfCBudWxsID0gbnVsbDtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApIHtcbiAgICAgIHN1cGVyKCAuLi5hcmdzICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG92ZXJyaWRlIC0gc2VlIFByZXNzTGlzdGVuZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgcHJlc3MoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQsIHRhcmdldE5vZGU/OiBOb2RlLCBjYWxsYmFjaz86ICgpID0+IHZvaWQgKTogYm9vbGVhbiB7XG4gICAgICAvLyBJZiBwcmVzc2VkLCB0aGVuIHRoZSBwcmVzcyB3b3VsZCBiZSBleGl0ZWQgbGF0ZXIgQU5EIHdlIHdvdWxkbid0IHdhbnQgdG8gb3ZlcnJpZGUgb3VyIHNwcml0ZUluc3RhbmNlIGFueXdheS5cbiAgICAgIGlmICggKCB0aGlzIGFzIHVua25vd24gYXMgUHJlc3NMaXN0ZW5lciApLmlzUHJlc3NlZCApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgIC8vIFplcm8gaXQgb3V0LCBzbyB3ZSBvbmx5IHJlc3BvbmQgdG8gU3ByaXRlcyBpbnN0YW5jZXMuXG4gICAgICB0aGlzLnNwcml0ZUluc3RhbmNlID0gbnVsbDtcblxuICAgICAgaWYgKCBldmVudC5jdXJyZW50VGFyZ2V0IGluc3RhbmNlb2YgU3ByaXRlcyApIHtcbiAgICAgICAgY29uc3Qgc3ByaXRlcyA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG5cbiAgICAgICAgdGhpcy5zcHJpdGVJbnN0YW5jZSA9IHNwcml0ZXMuZ2V0U3ByaXRlSW5zdGFuY2VGcm9tUG9pbnQoIHNwcml0ZXMuZ2xvYmFsVG9Mb2NhbFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkgKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgd2UgaGF2ZSBubyBpbnN0YW5jZSwgZG9uJ3Qgc3VwZXItY2FsbCAoc2FtZSBiZWhhdmlvciBmb3IgbmV2ZXIgc3RhcnRpbmcgYSBwcmVzcylcbiAgICAgIGlmICggdGhpcy5zcHJpdGVJbnN0YW5jZSApIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLnByZXNzKCBldmVudCwgdGFyZ2V0Tm9kZSwgY2FsbGJhY2sgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9O1xufSApO1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnU3ByaXRlTGlzdGVuYWJsZScsIFNwcml0ZUxpc3RlbmFibGUgKTtcbmV4cG9ydCBkZWZhdWx0IFNwcml0ZUxpc3RlbmFibGU7Il0sIm5hbWVzIjpbImluaGVyaXRhbmNlIiwibWVtb2l6ZSIsIlByZXNzTGlzdGVuZXIiLCJzY2VuZXJ5IiwiU3ByaXRlcyIsIlNwcml0ZUxpc3RlbmFibGUiLCJ0eXBlIiwiYXNzZXJ0IiwiXyIsImluY2x1ZGVzIiwicHJlc3MiLCJldmVudCIsInRhcmdldE5vZGUiLCJjYWxsYmFjayIsImlzUHJlc3NlZCIsInNwcml0ZUluc3RhbmNlIiwiY3VycmVudFRhcmdldCIsInNwcml0ZXMiLCJnZXRTcHJpdGVJbnN0YW5jZUZyb21Qb2ludCIsImdsb2JhbFRvTG9jYWxQb2ludCIsInBvaW50ZXIiLCJwb2ludCIsImFyZ3MiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsaUJBQWlCLHVDQUF1QztBQUMvRCxPQUFPQyxhQUFhLG1DQUFtQztBQUd2RCxTQUFlQyxhQUFhLEVBQXNCQyxPQUFPLEVBQWtCQyxPQUFPLFFBQVEsZ0JBQWdCO0FBTTFHOztDQUVDLEdBQ0QsTUFBTUMsbUJBQW1CSixRQUFTLENBQWdESztJQUNoRkMsVUFBVUEsT0FBUUMsRUFBRUMsUUFBUSxDQUFFVCxZQUFhTSxPQUFRSixnQkFBaUI7SUFFcEUsT0FBTyxjQUFjSTtRQVFuQjs7S0FFQyxHQUNELEFBQWdCSSxNQUFPQyxLQUF5QixFQUFFQyxVQUFpQixFQUFFQyxRQUFxQixFQUFZO1lBQ3BHLCtHQUErRztZQUMvRyxJQUFLLEFBQUUsSUFBSSxDQUErQkMsU0FBUyxFQUFHO2dCQUFFLE9BQU87WUFBTztZQUV0RSx3REFBd0Q7WUFDeEQsSUFBSSxDQUFDQyxjQUFjLEdBQUc7WUFFdEIsSUFBS0osTUFBTUssYUFBYSxZQUFZWixTQUFVO2dCQUM1QyxNQUFNYSxVQUFVTixNQUFNSyxhQUFhO2dCQUVuQyxJQUFJLENBQUNELGNBQWMsR0FBR0UsUUFBUUMsMEJBQTBCLENBQUVELFFBQVFFLGtCQUFrQixDQUFFUixNQUFNUyxPQUFPLENBQUNDLEtBQUs7WUFDM0c7WUFFQSxzRkFBc0Y7WUFDdEYsSUFBSyxJQUFJLENBQUNOLGNBQWMsRUFBRztnQkFDekIsT0FBTyxLQUFLLENBQUNMLE1BQU9DLE9BQU9DLFlBQVlDO1lBQ3pDLE9BQ0s7Z0JBQ0gsT0FBTztZQUNUO1FBQ0Y7UUEzQkEsWUFBb0IsR0FBR1MsSUFBc0IsQ0FBRztZQUM5QyxLQUFLLElBQUtBLFlBSExQLGlCQUF3QztRQUkvQztJQTBCRjtBQUNGO0FBRUFaLFFBQVFvQixRQUFRLENBQUUsb0JBQW9CbEI7QUFDdEMsZUFBZUEsaUJBQWlCIn0=