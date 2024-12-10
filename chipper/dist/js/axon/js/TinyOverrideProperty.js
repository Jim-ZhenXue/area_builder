// Copyright 2022-2024, University of Colorado Boulder
/**
 * A TinyProperty that will take the value of a target Property until it is set to a value. When that happens, it will
 * be its own standalone Property.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import axon from './axon.js';
import TinyProperty from './TinyProperty.js';
let TinyOverrideProperty = class TinyOverrideProperty extends TinyProperty {
    set targetProperty(targetProperty) {
        this.setTargetProperty(targetProperty);
    }
    setTargetProperty(targetProperty) {
        // no-op if it's the same Property
        if (this.targetProperty === targetProperty) {
            return;
        }
        const oldValue = this.value;
        // Listeners are only connected if we are NOT overridden
        if (!this.isOverridden) {
            this._targetProperty.unlink(this._targetListener);
        }
        this._targetProperty = targetProperty;
        // Listeners are only connected if we are NOT overridden
        if (!this.isOverridden) {
            this._targetProperty.lazyLink(this._targetListener);
            // If we are overridden, changing the targetProperty will not trigger notifications
            if (!this.equalsValue(oldValue)) {
                this.notifyListeners(oldValue);
            }
        }
    }
    /**
   * Remove the "overridden" nature of this Property, so that it takes on the appearance of the targetProperty
   */ clearOverride() {
        if (this.isOverridden) {
            const oldValue = this.value;
            this.isOverridden = false;
            this._targetProperty.lazyLink(this._targetListener);
            // This could change our value!
            if (!this.equalsValue(oldValue)) {
                this.notifyListeners(oldValue);
            }
        }
    }
    get() {
        // The main logic for TinyOverrideProperty
        return this.isOverridden ? this._value : this._targetProperty.value;
    }
    set(value) {
        if (!this.isOverridden) {
            // Grab the last value of the Property, as it will be "active" after this
            this._value = this._targetProperty.value;
        }
        super.set(value);
    }
    setPropertyValue(value) {
        // Switch to "override"
        if (!this.isOverridden) {
            this.isOverridden = true;
            this._targetProperty.unlink(this._targetListener);
        }
        super.setPropertyValue(value);
    }
    // We have to override here to have the getter called
    equalsValue(value) {
        return this.areValuesEqual(value, this.value);
    }
    onTargetPropertyChange(newValue, oldValue) {
        if (!this.isOverridden) {
            this.notifyListeners(oldValue);
        }
    }
    // Overridden, since we need to call our getter
    notifyListeners(oldValue) {
        this.emit(this.value, oldValue, this);
    }
    dispose() {
        // If we've been overridden, we will already have removed the listener
        if (!this.isOverridden) {
            this._targetProperty.unlink(this._targetListener);
        }
        super.dispose();
    }
    constructor(targetProperty){
        super(targetProperty.value), // If true, we ignore our targetProperty and just use our value. If false, we only report the value of the
        // targetProperty
        this.isOverridden = false;
        this._targetProperty = targetProperty;
        assert && assert(!this.isOverridden, 'Should not be overridden on startup');
        // We'll need to listen to our target to dispatch notifications
        this._targetListener = this.onTargetPropertyChange.bind(this);
        this._targetProperty.lazyLink(this._targetListener);
    }
};
export { TinyOverrideProperty as default };
axon.register('TinyOverrideProperty', TinyOverrideProperty);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvVGlueU92ZXJyaWRlUHJvcGVydHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBUaW55UHJvcGVydHkgdGhhdCB3aWxsIHRha2UgdGhlIHZhbHVlIG9mIGEgdGFyZ2V0IFByb3BlcnR5IHVudGlsIGl0IGlzIHNldCB0byBhIHZhbHVlLiBXaGVuIHRoYXQgaGFwcGVucywgaXQgd2lsbFxuICogYmUgaXRzIG93biBzdGFuZGFsb25lIFByb3BlcnR5LlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgYXhvbiBmcm9tICcuL2F4b24uanMnO1xuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuL1RpbnlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbnlPdmVycmlkZVByb3BlcnR5PFQ+IGV4dGVuZHMgVGlueVByb3BlcnR5PFQ+IHtcblxuICAvLyBJZiB0cnVlLCB3ZSBpZ25vcmUgb3VyIHRhcmdldFByb3BlcnR5IGFuZCBqdXN0IHVzZSBvdXIgdmFsdWUuIElmIGZhbHNlLCB3ZSBvbmx5IHJlcG9ydCB0aGUgdmFsdWUgb2YgdGhlXG4gIC8vIHRhcmdldFByb3BlcnR5XG4gIHB1YmxpYyBpc092ZXJyaWRkZW4gPSBmYWxzZTtcblxuICBwcml2YXRlIF90YXJnZXRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8VD47XG4gIHByaXZhdGUgcmVhZG9ubHkgX3RhcmdldExpc3RlbmVyOiAoIG5ld1ZhbHVlOiBULCBvbGRWYWx1ZTogVCApID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YXJnZXRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8VD4gKSB7XG4gICAgc3VwZXIoIHRhcmdldFByb3BlcnR5LnZhbHVlICk7XG5cbiAgICB0aGlzLl90YXJnZXRQcm9wZXJ0eSA9IHRhcmdldFByb3BlcnR5O1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaXNPdmVycmlkZGVuLCAnU2hvdWxkIG5vdCBiZSBvdmVycmlkZGVuIG9uIHN0YXJ0dXAnICk7XG5cbiAgICAvLyBXZSdsbCBuZWVkIHRvIGxpc3RlbiB0byBvdXIgdGFyZ2V0IHRvIGRpc3BhdGNoIG5vdGlmaWNhdGlvbnNcbiAgICB0aGlzLl90YXJnZXRMaXN0ZW5lciA9IHRoaXMub25UYXJnZXRQcm9wZXJ0eUNoYW5nZS5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy5fdGFyZ2V0UHJvcGVydHkubGF6eUxpbmsoIHRoaXMuX3RhcmdldExpc3RlbmVyICk7XG4gIH1cblxuICBwdWJsaWMgc2V0IHRhcmdldFByb3BlcnR5KCB0YXJnZXRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8VD4gKSB7XG4gICAgdGhpcy5zZXRUYXJnZXRQcm9wZXJ0eSggdGFyZ2V0UHJvcGVydHkgKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRUYXJnZXRQcm9wZXJ0eSggdGFyZ2V0UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFQ+ICk6IHZvaWQge1xuICAgIC8vIG5vLW9wIGlmIGl0J3MgdGhlIHNhbWUgUHJvcGVydHlcbiAgICBpZiAoIHRoaXMudGFyZ2V0UHJvcGVydHkgPT09IHRhcmdldFByb3BlcnR5ICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG9sZFZhbHVlID0gdGhpcy52YWx1ZTtcblxuICAgIC8vIExpc3RlbmVycyBhcmUgb25seSBjb25uZWN0ZWQgaWYgd2UgYXJlIE5PVCBvdmVycmlkZGVuXG4gICAgaWYgKCAhdGhpcy5pc092ZXJyaWRkZW4gKSB7XG4gICAgICB0aGlzLl90YXJnZXRQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX3RhcmdldExpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgdGhpcy5fdGFyZ2V0UHJvcGVydHkgPSB0YXJnZXRQcm9wZXJ0eTtcblxuICAgIC8vIExpc3RlbmVycyBhcmUgb25seSBjb25uZWN0ZWQgaWYgd2UgYXJlIE5PVCBvdmVycmlkZGVuXG4gICAgaWYgKCAhdGhpcy5pc092ZXJyaWRkZW4gKSB7XG4gICAgICB0aGlzLl90YXJnZXRQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdGFyZ2V0TGlzdGVuZXIgKTtcblxuICAgICAgLy8gSWYgd2UgYXJlIG92ZXJyaWRkZW4sIGNoYW5naW5nIHRoZSB0YXJnZXRQcm9wZXJ0eSB3aWxsIG5vdCB0cmlnZ2VyIG5vdGlmaWNhdGlvbnNcbiAgICAgIGlmICggIXRoaXMuZXF1YWxzVmFsdWUoIG9sZFZhbHVlICkgKSB7XG4gICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKCBvbGRWYWx1ZSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIFwib3ZlcnJpZGRlblwiIG5hdHVyZSBvZiB0aGlzIFByb3BlcnR5LCBzbyB0aGF0IGl0IHRha2VzIG9uIHRoZSBhcHBlYXJhbmNlIG9mIHRoZSB0YXJnZXRQcm9wZXJ0eVxuICAgKi9cbiAgcHVibGljIGNsZWFyT3ZlcnJpZGUoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLmlzT3ZlcnJpZGRlbiApIHtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGhpcy52YWx1ZTtcblxuICAgICAgdGhpcy5pc092ZXJyaWRkZW4gPSBmYWxzZTtcbiAgICAgIHRoaXMuX3RhcmdldFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLl90YXJnZXRMaXN0ZW5lciApO1xuXG4gICAgICAvLyBUaGlzIGNvdWxkIGNoYW5nZSBvdXIgdmFsdWUhXG4gICAgICBpZiAoICF0aGlzLmVxdWFsc1ZhbHVlKCBvbGRWYWx1ZSApICkge1xuICAgICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyggb2xkVmFsdWUgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0KCk6IFQge1xuICAgIC8vIFRoZSBtYWluIGxvZ2ljIGZvciBUaW55T3ZlcnJpZGVQcm9wZXJ0eVxuICAgIHJldHVybiB0aGlzLmlzT3ZlcnJpZGRlbiA/IHRoaXMuX3ZhbHVlIDogdGhpcy5fdGFyZ2V0UHJvcGVydHkudmFsdWU7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgc2V0KCB2YWx1ZTogVCApOiB2b2lkIHtcbiAgICBpZiAoICF0aGlzLmlzT3ZlcnJpZGRlbiApIHtcbiAgICAgIC8vIEdyYWIgdGhlIGxhc3QgdmFsdWUgb2YgdGhlIFByb3BlcnR5LCBhcyBpdCB3aWxsIGJlIFwiYWN0aXZlXCIgYWZ0ZXIgdGhpc1xuICAgICAgdGhpcy5fdmFsdWUgPSB0aGlzLl90YXJnZXRQcm9wZXJ0eS52YWx1ZTtcbiAgICB9XG5cbiAgICBzdXBlci5zZXQoIHZhbHVlICk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgc2V0UHJvcGVydHlWYWx1ZSggdmFsdWU6IFQgKTogdm9pZCB7XG4gICAgLy8gU3dpdGNoIHRvIFwib3ZlcnJpZGVcIlxuICAgIGlmICggIXRoaXMuaXNPdmVycmlkZGVuICkge1xuICAgICAgdGhpcy5pc092ZXJyaWRkZW4gPSB0cnVlO1xuICAgICAgdGhpcy5fdGFyZ2V0UHJvcGVydHkudW5saW5rKCB0aGlzLl90YXJnZXRMaXN0ZW5lciApO1xuICAgIH1cblxuICAgIHN1cGVyLnNldFByb3BlcnR5VmFsdWUoIHZhbHVlICk7XG4gIH1cblxuICAvLyBXZSBoYXZlIHRvIG92ZXJyaWRlIGhlcmUgdG8gaGF2ZSB0aGUgZ2V0dGVyIGNhbGxlZFxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgZXF1YWxzVmFsdWUoIHZhbHVlOiBUICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmFyZVZhbHVlc0VxdWFsKCB2YWx1ZSwgdGhpcy52YWx1ZSApO1xuICB9XG5cbiAgcHJpdmF0ZSBvblRhcmdldFByb3BlcnR5Q2hhbmdlKCBuZXdWYWx1ZTogVCwgb2xkVmFsdWU6IFQgKTogdm9pZCB7XG4gICAgaWYgKCAhdGhpcy5pc092ZXJyaWRkZW4gKSB7XG4gICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyggb2xkVmFsdWUgKTtcbiAgICB9XG4gIH1cblxuICAvLyBPdmVycmlkZGVuLCBzaW5jZSB3ZSBuZWVkIHRvIGNhbGwgb3VyIGdldHRlclxuICBwdWJsaWMgb3ZlcnJpZGUgbm90aWZ5TGlzdGVuZXJzKCBvbGRWYWx1ZTogVCApOiB2b2lkIHtcbiAgICB0aGlzLmVtaXQoIHRoaXMudmFsdWUsIG9sZFZhbHVlLCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICAvLyBJZiB3ZSd2ZSBiZWVuIG92ZXJyaWRkZW4sIHdlIHdpbGwgYWxyZWFkeSBoYXZlIHJlbW92ZWQgdGhlIGxpc3RlbmVyXG4gICAgaWYgKCAhdGhpcy5pc092ZXJyaWRkZW4gKSB7XG4gICAgICB0aGlzLl90YXJnZXRQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX3RhcmdldExpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbmF4b24ucmVnaXN0ZXIoICdUaW55T3ZlcnJpZGVQcm9wZXJ0eScsIFRpbnlPdmVycmlkZVByb3BlcnR5ICk7Il0sIm5hbWVzIjpbImF4b24iLCJUaW55UHJvcGVydHkiLCJUaW55T3ZlcnJpZGVQcm9wZXJ0eSIsInRhcmdldFByb3BlcnR5Iiwic2V0VGFyZ2V0UHJvcGVydHkiLCJvbGRWYWx1ZSIsInZhbHVlIiwiaXNPdmVycmlkZGVuIiwiX3RhcmdldFByb3BlcnR5IiwidW5saW5rIiwiX3RhcmdldExpc3RlbmVyIiwibGF6eUxpbmsiLCJlcXVhbHNWYWx1ZSIsIm5vdGlmeUxpc3RlbmVycyIsImNsZWFyT3ZlcnJpZGUiLCJnZXQiLCJfdmFsdWUiLCJzZXQiLCJzZXRQcm9wZXJ0eVZhbHVlIiwiYXJlVmFsdWVzRXF1YWwiLCJvblRhcmdldFByb3BlcnR5Q2hhbmdlIiwibmV3VmFsdWUiLCJlbWl0IiwiZGlzcG9zZSIsImFzc2VydCIsImJpbmQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsVUFBVSxZQUFZO0FBQzdCLE9BQU9DLGtCQUFrQixvQkFBb0I7QUFHOUIsSUFBQSxBQUFNQyx1QkFBTixNQUFNQSw2QkFBZ0NEO0lBcUJuRCxJQUFXRSxlQUFnQkEsY0FBb0MsRUFBRztRQUNoRSxJQUFJLENBQUNDLGlCQUFpQixDQUFFRDtJQUMxQjtJQUVPQyxrQkFBbUJELGNBQW9DLEVBQVM7UUFDckUsa0NBQWtDO1FBQ2xDLElBQUssSUFBSSxDQUFDQSxjQUFjLEtBQUtBLGdCQUFpQjtZQUM1QztRQUNGO1FBRUEsTUFBTUUsV0FBVyxJQUFJLENBQUNDLEtBQUs7UUFFM0Isd0RBQXdEO1FBQ3hELElBQUssQ0FBQyxJQUFJLENBQUNDLFlBQVksRUFBRztZQUN4QixJQUFJLENBQUNDLGVBQWUsQ0FBQ0MsTUFBTSxDQUFFLElBQUksQ0FBQ0MsZUFBZTtRQUNuRDtRQUVBLElBQUksQ0FBQ0YsZUFBZSxHQUFHTDtRQUV2Qix3REFBd0Q7UUFDeEQsSUFBSyxDQUFDLElBQUksQ0FBQ0ksWUFBWSxFQUFHO1lBQ3hCLElBQUksQ0FBQ0MsZUFBZSxDQUFDRyxRQUFRLENBQUUsSUFBSSxDQUFDRCxlQUFlO1lBRW5ELG1GQUFtRjtZQUNuRixJQUFLLENBQUMsSUFBSSxDQUFDRSxXQUFXLENBQUVQLFdBQWE7Z0JBQ25DLElBQUksQ0FBQ1EsZUFBZSxDQUFFUjtZQUN4QjtRQUNGO0lBQ0Y7SUFFQTs7R0FFQyxHQUNELEFBQU9TLGdCQUFzQjtRQUMzQixJQUFLLElBQUksQ0FBQ1AsWUFBWSxFQUFHO1lBQ3ZCLE1BQU1GLFdBQVcsSUFBSSxDQUFDQyxLQUFLO1lBRTNCLElBQUksQ0FBQ0MsWUFBWSxHQUFHO1lBQ3BCLElBQUksQ0FBQ0MsZUFBZSxDQUFDRyxRQUFRLENBQUUsSUFBSSxDQUFDRCxlQUFlO1lBRW5ELCtCQUErQjtZQUMvQixJQUFLLENBQUMsSUFBSSxDQUFDRSxXQUFXLENBQUVQLFdBQWE7Z0JBQ25DLElBQUksQ0FBQ1EsZUFBZSxDQUFFUjtZQUN4QjtRQUNGO0lBQ0Y7SUFFZ0JVLE1BQVM7UUFDdkIsMENBQTBDO1FBQzFDLE9BQU8sSUFBSSxDQUFDUixZQUFZLEdBQUcsSUFBSSxDQUFDUyxNQUFNLEdBQUcsSUFBSSxDQUFDUixlQUFlLENBQUNGLEtBQUs7SUFDckU7SUFFZ0JXLElBQUtYLEtBQVEsRUFBUztRQUNwQyxJQUFLLENBQUMsSUFBSSxDQUFDQyxZQUFZLEVBQUc7WUFDeEIseUVBQXlFO1lBQ3pFLElBQUksQ0FBQ1MsTUFBTSxHQUFHLElBQUksQ0FBQ1IsZUFBZSxDQUFDRixLQUFLO1FBQzFDO1FBRUEsS0FBSyxDQUFDVyxJQUFLWDtJQUNiO0lBRWdCWSxpQkFBa0JaLEtBQVEsRUFBUztRQUNqRCx1QkFBdUI7UUFDdkIsSUFBSyxDQUFDLElBQUksQ0FBQ0MsWUFBWSxFQUFHO1lBQ3hCLElBQUksQ0FBQ0EsWUFBWSxHQUFHO1lBQ3BCLElBQUksQ0FBQ0MsZUFBZSxDQUFDQyxNQUFNLENBQUUsSUFBSSxDQUFDQyxlQUFlO1FBQ25EO1FBRUEsS0FBSyxDQUFDUSxpQkFBa0JaO0lBQzFCO0lBRUEscURBQXFEO0lBQ2xDTSxZQUFhTixLQUFRLEVBQVk7UUFDbEQsT0FBTyxJQUFJLENBQUNhLGNBQWMsQ0FBRWIsT0FBTyxJQUFJLENBQUNBLEtBQUs7SUFDL0M7SUFFUWMsdUJBQXdCQyxRQUFXLEVBQUVoQixRQUFXLEVBQVM7UUFDL0QsSUFBSyxDQUFDLElBQUksQ0FBQ0UsWUFBWSxFQUFHO1lBQ3hCLElBQUksQ0FBQ00sZUFBZSxDQUFFUjtRQUN4QjtJQUNGO0lBRUEsK0NBQStDO0lBQy9CUSxnQkFBaUJSLFFBQVcsRUFBUztRQUNuRCxJQUFJLENBQUNpQixJQUFJLENBQUUsSUFBSSxDQUFDaEIsS0FBSyxFQUFFRCxVQUFVLElBQUk7SUFDdkM7SUFFZ0JrQixVQUFnQjtRQUM5QixzRUFBc0U7UUFDdEUsSUFBSyxDQUFDLElBQUksQ0FBQ2hCLFlBQVksRUFBRztZQUN4QixJQUFJLENBQUNDLGVBQWUsQ0FBQ0MsTUFBTSxDQUFFLElBQUksQ0FBQ0MsZUFBZTtRQUNuRDtRQUVBLEtBQUssQ0FBQ2E7SUFDUjtJQTFHQSxZQUFvQnBCLGNBQW9DLENBQUc7UUFDekQsS0FBSyxDQUFFQSxlQUFlRyxLQUFLLEdBUjdCLDBHQUEwRztRQUMxRyxpQkFBaUI7YUFDVkMsZUFBZTtRQVFwQixJQUFJLENBQUNDLGVBQWUsR0FBR0w7UUFFdkJxQixVQUFVQSxPQUFRLENBQUMsSUFBSSxDQUFDakIsWUFBWSxFQUFFO1FBRXRDLCtEQUErRDtRQUMvRCxJQUFJLENBQUNHLGVBQWUsR0FBRyxJQUFJLENBQUNVLHNCQUFzQixDQUFDSyxJQUFJLENBQUUsSUFBSTtRQUM3RCxJQUFJLENBQUNqQixlQUFlLENBQUNHLFFBQVEsQ0FBRSxJQUFJLENBQUNELGVBQWU7SUFDckQ7QUFpR0Y7QUFwSEEsU0FBcUJSLGtDQW9IcEI7QUFFREYsS0FBSzBCLFFBQVEsQ0FBRSx3QkFBd0J4QiJ9