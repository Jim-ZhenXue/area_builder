// Copyright 2022-2024, University of Colorado Boulder
import axon from './axon.js';
import ReadOnlyProperty from './ReadOnlyProperty.js';
let Property = class Property extends ReadOnlyProperty {
    /**
   * Returns the initial value of this Property.
   */ getInitialValue() {
        return this._initialValue;
    }
    get initialValue() {
        return this.getInitialValue();
    }
    /**
   * Stores the specified value as the initial value, which will be taken on reset. Sims should use this sparingly,
   * typically only in situations where the initial value is unknowable at instantiation.
   */ setInitialValue(initialValue) {
        this._initialValue = initialValue;
    }
    /**
   * Overridden to make public
   */ get value() {
        return super.value;
    }
    /**
   * Overridden to make public
   * We ran performance tests on Chrome, and determined that calling super.value = newValue is statistically significantly
   * slower at the p = 0.10 level( looping over 10,000 value calls). Therefore, we prefer this optimization.
   */ set value(newValue) {
        super.set(newValue);
    }
    reset() {
        this.set(this._initialValue);
    }
    /**
   * Overridden to make public
   */ set(value) {
        super.set(value);
    }
    isSettable() {
        return true;
    }
    constructor(value, providedOptions){
        super(value, providedOptions);
        this._initialValue = value;
    }
};
/**
 * Adds initial value and reset, and a mutable interface.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ export { Property as default };
axon.register('Property', Property);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbmltcG9ydCBheG9uIGZyb20gJy4vYXhvbi5qcyc7XG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSwgeyBQcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuL1JlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuL1RQcm9wZXJ0eS5qcyc7XG5cbi8qKlxuICogQWRkcyBpbml0aWFsIHZhbHVlIGFuZCByZXNldCwgYW5kIGEgbXV0YWJsZSBpbnRlcmZhY2UuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvcGVydHk8VD4gZXh0ZW5kcyBSZWFkT25seVByb3BlcnR5PFQ+IGltcGxlbWVudHMgVFByb3BlcnR5PFQ+IHtcblxuICBwcm90ZWN0ZWQgX2luaXRpYWxWYWx1ZTogVDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZhbHVlOiBULCBwcm92aWRlZE9wdGlvbnM/OiBQcm9wZXJ0eU9wdGlvbnM8VD4gKSB7XG4gICAgc3VwZXIoIHZhbHVlLCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHRoaXMuX2luaXRpYWxWYWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGluaXRpYWwgdmFsdWUgb2YgdGhpcyBQcm9wZXJ0eS5cbiAgICovXG4gIHB1YmxpYyBnZXRJbml0aWFsVmFsdWUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX2luaXRpYWxWYWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaW5pdGlhbFZhbHVlKCk6IFQge1xuICAgIHJldHVybiB0aGlzLmdldEluaXRpYWxWYWx1ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3JlcyB0aGUgc3BlY2lmaWVkIHZhbHVlIGFzIHRoZSBpbml0aWFsIHZhbHVlLCB3aGljaCB3aWxsIGJlIHRha2VuIG9uIHJlc2V0LiBTaW1zIHNob3VsZCB1c2UgdGhpcyBzcGFyaW5nbHksXG4gICAqIHR5cGljYWxseSBvbmx5IGluIHNpdHVhdGlvbnMgd2hlcmUgdGhlIGluaXRpYWwgdmFsdWUgaXMgdW5rbm93YWJsZSBhdCBpbnN0YW50aWF0aW9uLlxuICAgKi9cbiAgcHVibGljIHNldEluaXRpYWxWYWx1ZSggaW5pdGlhbFZhbHVlOiBUICk6IHZvaWQge1xuICAgIHRoaXMuX2luaXRpYWxWYWx1ZSA9IGluaXRpYWxWYWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZGVuIHRvIG1ha2UgcHVibGljXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0IHZhbHVlKCk6IFQge1xuICAgIHJldHVybiBzdXBlci52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZGVuIHRvIG1ha2UgcHVibGljXG4gICAqIFdlIHJhbiBwZXJmb3JtYW5jZSB0ZXN0cyBvbiBDaHJvbWUsIGFuZCBkZXRlcm1pbmVkIHRoYXQgY2FsbGluZyBzdXBlci52YWx1ZSA9IG5ld1ZhbHVlIGlzIHN0YXRpc3RpY2FsbHkgc2lnbmlmaWNhbnRseVxuICAgKiBzbG93ZXIgYXQgdGhlIHAgPSAwLjEwIGxldmVsKCBsb29waW5nIG92ZXIgMTAsMDAwIHZhbHVlIGNhbGxzKS4gVGhlcmVmb3JlLCB3ZSBwcmVmZXIgdGhpcyBvcHRpbWl6YXRpb24uXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgc2V0IHZhbHVlKCBuZXdWYWx1ZTogVCApIHtcbiAgICBzdXBlci5zZXQoIG5ld1ZhbHVlICk7XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5zZXQoIHRoaXMuX2luaXRpYWxWYWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRkZW4gdG8gbWFrZSBwdWJsaWNcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBzZXQoIHZhbHVlOiBUICk6IHZvaWQge1xuICAgIHN1cGVyLnNldCggdmFsdWUgKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBpc1NldHRhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIHsgUHJvcGVydHlPcHRpb25zIH07XG5cbmF4b24ucmVnaXN0ZXIoICdQcm9wZXJ0eScsIFByb3BlcnR5ICk7Il0sIm5hbWVzIjpbImF4b24iLCJSZWFkT25seVByb3BlcnR5IiwiUHJvcGVydHkiLCJnZXRJbml0aWFsVmFsdWUiLCJfaW5pdGlhbFZhbHVlIiwiaW5pdGlhbFZhbHVlIiwic2V0SW5pdGlhbFZhbHVlIiwidmFsdWUiLCJuZXdWYWx1ZSIsInNldCIsInJlc2V0IiwiaXNTZXR0YWJsZSIsInByb3ZpZGVkT3B0aW9ucyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQsT0FBT0EsVUFBVSxZQUFZO0FBQzdCLE9BQU9DLHNCQUEyQyx3QkFBd0I7QUFRM0QsSUFBQSxBQUFNQyxXQUFOLE1BQU1BLGlCQUFvQkQ7SUFVdkM7O0dBRUMsR0FDRCxBQUFPRSxrQkFBcUI7UUFDMUIsT0FBTyxJQUFJLENBQUNDLGFBQWE7SUFDM0I7SUFFQSxJQUFXQyxlQUFrQjtRQUMzQixPQUFPLElBQUksQ0FBQ0YsZUFBZTtJQUM3QjtJQUVBOzs7R0FHQyxHQUNELEFBQU9HLGdCQUFpQkQsWUFBZSxFQUFTO1FBQzlDLElBQUksQ0FBQ0QsYUFBYSxHQUFHQztJQUN2QjtJQUVBOztHQUVDLEdBQ0QsSUFBb0JFLFFBQVc7UUFDN0IsT0FBTyxLQUFLLENBQUNBO0lBQ2Y7SUFFQTs7OztHQUlDLEdBQ0QsSUFBb0JBLE1BQU9DLFFBQVcsRUFBRztRQUN2QyxLQUFLLENBQUNDLElBQUtEO0lBQ2I7SUFFT0UsUUFBYztRQUNuQixJQUFJLENBQUNELEdBQUcsQ0FBRSxJQUFJLENBQUNMLGFBQWE7SUFDOUI7SUFFQTs7R0FFQyxHQUNELEFBQWdCSyxJQUFLRixLQUFRLEVBQVM7UUFDcEMsS0FBSyxDQUFDRSxJQUFLRjtJQUNiO0lBRWdCSSxhQUFzQjtRQUNwQyxPQUFPO0lBQ1Q7SUF0REEsWUFBb0JKLEtBQVEsRUFBRUssZUFBb0MsQ0FBRztRQUNuRSxLQUFLLENBQUVMLE9BQU9LO1FBRWQsSUFBSSxDQUFDUixhQUFhLEdBQUdHO0lBQ3ZCO0FBbURGO0FBaEVBOzs7O0NBSUMsR0FDRCxTQUFxQkwsc0JBMkRwQjtBQUlERixLQUFLYSxRQUFRLENBQUUsWUFBWVgifQ==