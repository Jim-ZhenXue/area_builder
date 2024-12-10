// Copyright 2014-2022, University of Colorado Boulder
/**
 * A drawable that will paint a single instance.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { Drawable, scenery } from '../imports.js';
let SelfDrawable = class SelfDrawable extends Drawable {
    /**
   * @public
   *
   * @param {number} renderer
   * @param {Instance} instance
   * @returns {SelfDrawable}
   */ initialize(renderer, instance) {
        super.initialize(renderer);
        // @private {function}
        this.drawableVisibilityListener = this.drawableVisibilityListener || this.updateSelfVisibility.bind(this);
        // @public {Instance}
        this.instance = instance;
        // @public {Node}
        this.node = instance.trail.lastNode();
        this.node.attachDrawable(this);
        this.instance.selfVisibleEmitter.addListener(this.drawableVisibilityListener);
        this.updateSelfVisibility();
        return this;
    }
    /**
   * Releases references
   * @public
   * @override
   */ dispose() {
        this.instance.selfVisibleEmitter.removeListener(this.drawableVisibilityListener);
        this.node.detachDrawable(this);
        // free references
        this.instance = null;
        this.node = null;
        super.dispose();
    }
    /**
   * @public
   */ updateSelfVisibility() {
        // hide our drawable if it is not relatively visible
        this.visible = this.instance.selfVisible;
    }
    /**
   * Returns a more-informative string form of this object.
   * @public
   * @override
   *
   * @returns {string}
   */ toDetailedString() {
        return `${this.toString()} (${this.instance.trail.toPathString()})`;
    }
    /**
   * We have enough concrete types that want a fallback constructor to this, so we'll provide it for convenience.
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ constructor(renderer, instance){
        assert && assert(typeof renderer === 'number');
        assert && assert(instance);
        super();
        this.initialize(renderer, instance);
    }
};
scenery.register('SelfDrawable', SelfDrawable);
export default SelfDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9TZWxmRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cblxuLyoqXG4gKiBBIGRyYXdhYmxlIHRoYXQgd2lsbCBwYWludCBhIHNpbmdsZSBpbnN0YW5jZS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgRHJhd2FibGUsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuY2xhc3MgU2VsZkRyYXdhYmxlIGV4dGVuZHMgRHJhd2FibGUge1xuICAvKipcbiAgICogV2UgaGF2ZSBlbm91Z2ggY29uY3JldGUgdHlwZXMgdGhhdCB3YW50IGEgZmFsbGJhY2sgY29uc3RydWN0b3IgdG8gdGhpcywgc28gd2UnbGwgcHJvdmlkZSBpdCBmb3IgY29udmVuaWVuY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgY29uc3RydWN0b3IoIHJlbmRlcmVyLCBpbnN0YW5jZSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgcmVuZGVyZXIgPT09ICdudW1iZXInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5zdGFuY2UgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXG4gICAqIEByZXR1cm5zIHtTZWxmRHJhd2FibGV9XG4gICAqL1xuICBpbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UgKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIgKTtcblxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cbiAgICB0aGlzLmRyYXdhYmxlVmlzaWJpbGl0eUxpc3RlbmVyID0gdGhpcy5kcmF3YWJsZVZpc2liaWxpdHlMaXN0ZW5lciB8fCB0aGlzLnVwZGF0ZVNlbGZWaXNpYmlsaXR5LmJpbmQoIHRoaXMgKTtcblxuICAgIC8vIEBwdWJsaWMge0luc3RhbmNlfVxuICAgIHRoaXMuaW5zdGFuY2UgPSBpbnN0YW5jZTtcblxuICAgIC8vIEBwdWJsaWMge05vZGV9XG4gICAgdGhpcy5ub2RlID0gaW5zdGFuY2UudHJhaWwubGFzdE5vZGUoKTtcbiAgICB0aGlzLm5vZGUuYXR0YWNoRHJhd2FibGUoIHRoaXMgKTtcblxuICAgIHRoaXMuaW5zdGFuY2Uuc2VsZlZpc2libGVFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLmRyYXdhYmxlVmlzaWJpbGl0eUxpc3RlbmVyICk7XG5cbiAgICB0aGlzLnVwZGF0ZVNlbGZWaXNpYmlsaXR5KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuaW5zdGFuY2Uuc2VsZlZpc2libGVFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmRyYXdhYmxlVmlzaWJpbGl0eUxpc3RlbmVyICk7XG5cbiAgICB0aGlzLm5vZGUuZGV0YWNoRHJhd2FibGUoIHRoaXMgKTtcblxuICAgIC8vIGZyZWUgcmVmZXJlbmNlc1xuICAgIHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuICAgIHRoaXMubm9kZSA9IG51bGw7XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgdXBkYXRlU2VsZlZpc2liaWxpdHkoKSB7XG4gICAgLy8gaGlkZSBvdXIgZHJhd2FibGUgaWYgaXQgaXMgbm90IHJlbGF0aXZlbHkgdmlzaWJsZVxuICAgIHRoaXMudmlzaWJsZSA9IHRoaXMuaW5zdGFuY2Uuc2VsZlZpc2libGU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG1vcmUtaW5mb3JtYXRpdmUgc3RyaW5nIGZvcm0gb2YgdGhpcyBvYmplY3QuXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICB0b0RldGFpbGVkU3RyaW5nKCkge1xuICAgIHJldHVybiBgJHt0aGlzLnRvU3RyaW5nKCl9ICgke3RoaXMuaW5zdGFuY2UudHJhaWwudG9QYXRoU3RyaW5nKCl9KWA7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1NlbGZEcmF3YWJsZScsIFNlbGZEcmF3YWJsZSApO1xuXG5leHBvcnQgZGVmYXVsdCBTZWxmRHJhd2FibGU7Il0sIm5hbWVzIjpbIkRyYXdhYmxlIiwic2NlbmVyeSIsIlNlbGZEcmF3YWJsZSIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiZHJhd2FibGVWaXNpYmlsaXR5TGlzdGVuZXIiLCJ1cGRhdGVTZWxmVmlzaWJpbGl0eSIsImJpbmQiLCJub2RlIiwidHJhaWwiLCJsYXN0Tm9kZSIsImF0dGFjaERyYXdhYmxlIiwic2VsZlZpc2libGVFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJkaXNwb3NlIiwicmVtb3ZlTGlzdGVuZXIiLCJkZXRhY2hEcmF3YWJsZSIsInZpc2libGUiLCJzZWxmVmlzaWJsZSIsInRvRGV0YWlsZWRTdHJpbmciLCJ0b1N0cmluZyIsInRvUGF0aFN0cmluZyIsImNvbnN0cnVjdG9yIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUd0RDs7OztDQUlDLEdBRUQsU0FBU0EsUUFBUSxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRWxELElBQUEsQUFBTUMsZUFBTixNQUFNQSxxQkFBcUJGO0lBZ0J6Qjs7Ozs7O0dBTUMsR0FDREcsV0FBWUMsUUFBUSxFQUFFQyxRQUFRLEVBQUc7UUFDL0IsS0FBSyxDQUFDRixXQUFZQztRQUVsQixzQkFBc0I7UUFDdEIsSUFBSSxDQUFDRSwwQkFBMEIsR0FBRyxJQUFJLENBQUNBLDBCQUEwQixJQUFJLElBQUksQ0FBQ0Msb0JBQW9CLENBQUNDLElBQUksQ0FBRSxJQUFJO1FBRXpHLHFCQUFxQjtRQUNyQixJQUFJLENBQUNILFFBQVEsR0FBR0E7UUFFaEIsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQ0ksSUFBSSxHQUFHSixTQUFTSyxLQUFLLENBQUNDLFFBQVE7UUFDbkMsSUFBSSxDQUFDRixJQUFJLENBQUNHLGNBQWMsQ0FBRSxJQUFJO1FBRTlCLElBQUksQ0FBQ1AsUUFBUSxDQUFDUSxrQkFBa0IsQ0FBQ0MsV0FBVyxDQUFFLElBQUksQ0FBQ1IsMEJBQTBCO1FBRTdFLElBQUksQ0FBQ0Msb0JBQW9CO1FBRXpCLE9BQU8sSUFBSTtJQUNiO0lBRUE7Ozs7R0FJQyxHQUNEUSxVQUFVO1FBQ1IsSUFBSSxDQUFDVixRQUFRLENBQUNRLGtCQUFrQixDQUFDRyxjQUFjLENBQUUsSUFBSSxDQUFDViwwQkFBMEI7UUFFaEYsSUFBSSxDQUFDRyxJQUFJLENBQUNRLGNBQWMsQ0FBRSxJQUFJO1FBRTlCLGtCQUFrQjtRQUNsQixJQUFJLENBQUNaLFFBQVEsR0FBRztRQUNoQixJQUFJLENBQUNJLElBQUksR0FBRztRQUVaLEtBQUssQ0FBQ007SUFDUjtJQUVBOztHQUVDLEdBQ0RSLHVCQUF1QjtRQUNyQixvREFBb0Q7UUFDcEQsSUFBSSxDQUFDVyxPQUFPLEdBQUcsSUFBSSxDQUFDYixRQUFRLENBQUNjLFdBQVc7SUFDMUM7SUFFQTs7Ozs7O0dBTUMsR0FDREMsbUJBQW1CO1FBQ2pCLE9BQU8sR0FBRyxJQUFJLENBQUNDLFFBQVEsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDaEIsUUFBUSxDQUFDSyxLQUFLLENBQUNZLFlBQVksR0FBRyxDQUFDLENBQUM7SUFDckU7SUE1RUE7Ozs7O0dBS0MsR0FDREMsWUFBYW5CLFFBQVEsRUFBRUMsUUFBUSxDQUFHO1FBQ2hDbUIsVUFBVUEsT0FBUSxPQUFPcEIsYUFBYTtRQUN0Q29CLFVBQVVBLE9BQVFuQjtRQUVsQixLQUFLO1FBRUwsSUFBSSxDQUFDRixVQUFVLENBQUVDLFVBQVVDO0lBQzdCO0FBZ0VGO0FBRUFKLFFBQVF3QixRQUFRLENBQUUsZ0JBQWdCdkI7QUFFbEMsZUFBZUEsYUFBYSJ9