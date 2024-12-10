// Copyright 2019-2022, University of Colorado Boulder
/**
 * An object that contains a value for each item in an enumeration.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
// T = enumeration value type
// U = mapped value type
let EnumerationMap = class EnumerationMap {
    /**
   * Returns the value associated with the given enumeration entry.
   */ get(entry) {
        assert && assert(this._values.includes(entry));
        assert && assert(this._map.has(entry));
        return this._map.get(entry);
    }
    /**
   * Sets the value associated with the given enumeration entry.
   */ set(entry, value) {
        assert && assert(this._values.includes(entry));
        this._map.set(entry, value);
    }
    /**
   * Returns a new EnumerationMap with mapped values.
   *
   * @param mapFunction - function( {*}, {TEnumeration.*} ): {*}
   * @returns With the mapped values
   */ map(mapFunction) {
        return new EnumerationMap(this._enumeration, (entry)=>mapFunction(this.get(entry), entry));
    }
    /**
   * Calls the callback on each item of the enumeration map.
   *
   * @param callback - function(value:*, enumerationValue:*)
   */ forEach(callback) {
        this._values.forEach((entry)=>callback(this.get(entry), entry));
    }
    /**
   * Returns the values stored in the map, as an array
   *
   */ values() {
        return this._values.map((entry)=>this.get(entry));
    }
    /**
   * @param enumeration
   * @param factory - function( {TEnumeration.*} ) => {*}, maps an enumeration value to any value.
   */ constructor(enumeration, factory){
        this._map = new Map();
        this._enumeration = enumeration;
        this._values = enumeration.enumeration.values;
        this._values.forEach((entry)=>{
            assert && assert(!this._map.has(entry), 'Enumeration key override problem');
            this._map.set(entry, factory(entry));
        });
    }
};
phetCore.register('EnumerationMap', EnumerationMap);
export default EnumerationMap;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbk1hcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBbiBvYmplY3QgdGhhdCBjb250YWlucyBhIHZhbHVlIGZvciBlYWNoIGl0ZW0gaW4gYW4gZW51bWVyYXRpb24uXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcblxudHlwZSBURW51bWVyYXRpb248VD4gPSB7XG4gIGVudW1lcmF0aW9uOiB7XG4gICAgdmFsdWVzOiBUW107XG4gIH07XG59O1xuXG4vLyBUID0gZW51bWVyYXRpb24gdmFsdWUgdHlwZVxuLy8gVSA9IG1hcHBlZCB2YWx1ZSB0eXBlXG5jbGFzcyBFbnVtZXJhdGlvbk1hcDxULCBVPiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2VudW1lcmF0aW9uOiBURW51bWVyYXRpb248VD47XG4gIHByaXZhdGUgX21hcCA9IG5ldyBNYXA8VCwgVT4oKTtcbiAgcHJpdmF0ZSBfdmFsdWVzOiBUW107XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBlbnVtZXJhdGlvblxuICAgKiBAcGFyYW0gZmFjdG9yeSAtIGZ1bmN0aW9uKCB7VEVudW1lcmF0aW9uLip9ICkgPT4geyp9LCBtYXBzIGFuIGVudW1lcmF0aW9uIHZhbHVlIHRvIGFueSB2YWx1ZS5cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZW51bWVyYXRpb246IFRFbnVtZXJhdGlvbjxUPiwgZmFjdG9yeTogKCB0OiBUICkgPT4gVSApIHtcblxuICAgIHRoaXMuX2VudW1lcmF0aW9uID0gZW51bWVyYXRpb247XG5cbiAgICB0aGlzLl92YWx1ZXMgPSBlbnVtZXJhdGlvbi5lbnVtZXJhdGlvbi52YWx1ZXM7XG4gICAgdGhpcy5fdmFsdWVzLmZvckVhY2goIGVudHJ5ID0+IHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLl9tYXAuaGFzKCBlbnRyeSApLCAnRW51bWVyYXRpb24ga2V5IG92ZXJyaWRlIHByb2JsZW0nICk7XG4gICAgICB0aGlzLl9tYXAuc2V0KCBlbnRyeSwgZmFjdG9yeSggZW50cnkgKSApO1xuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGVudW1lcmF0aW9uIGVudHJ5LlxuICAgKi9cbiAgcHVibGljIGdldCggZW50cnk6IFQgKTogVSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fdmFsdWVzLmluY2x1ZGVzKCBlbnRyeSApICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fbWFwLmhhcyggZW50cnkgKSApO1xuICAgIHJldHVybiB0aGlzLl9tYXAuZ2V0KCBlbnRyeSApITtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGVudW1lcmF0aW9uIGVudHJ5LlxuICAgKi9cbiAgcHVibGljIHNldCggZW50cnk6IFQsIHZhbHVlOiBVICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3ZhbHVlcy5pbmNsdWRlcyggZW50cnkgKSApO1xuICAgIHRoaXMuX21hcC5zZXQoIGVudHJ5LCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgRW51bWVyYXRpb25NYXAgd2l0aCBtYXBwZWQgdmFsdWVzLlxuICAgKlxuICAgKiBAcGFyYW0gbWFwRnVuY3Rpb24gLSBmdW5jdGlvbiggeyp9LCB7VEVudW1lcmF0aW9uLip9ICk6IHsqfVxuICAgKiBAcmV0dXJucyBXaXRoIHRoZSBtYXBwZWQgdmFsdWVzXG4gICAqL1xuICBwdWJsaWMgbWFwKCBtYXBGdW5jdGlvbjogKCB1OiBVLCB0OiBUICkgPT4gVSApOiBFbnVtZXJhdGlvbk1hcDxULCBVPiB7XG4gICAgcmV0dXJuIG5ldyBFbnVtZXJhdGlvbk1hcCggdGhpcy5fZW51bWVyYXRpb24sIGVudHJ5ID0+IG1hcEZ1bmN0aW9uKCB0aGlzLmdldCggZW50cnkgKSwgZW50cnkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIHRoZSBjYWxsYmFjayBvbiBlYWNoIGl0ZW0gb2YgdGhlIGVudW1lcmF0aW9uIG1hcC5cbiAgICpcbiAgICogQHBhcmFtIGNhbGxiYWNrIC0gZnVuY3Rpb24odmFsdWU6KiwgZW51bWVyYXRpb25WYWx1ZToqKVxuICAgKi9cbiAgcHVibGljIGZvckVhY2goIGNhbGxiYWNrOiAoIHU6IFUsIHQ6IFQgKSA9PiB2b2lkICk6IHZvaWQge1xuICAgIHRoaXMuX3ZhbHVlcy5mb3JFYWNoKCBlbnRyeSA9PiBjYWxsYmFjayggdGhpcy5nZXQoIGVudHJ5ICksIGVudHJ5ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZXMgc3RvcmVkIGluIHRoZSBtYXAsIGFzIGFuIGFycmF5XG4gICAqXG4gICAqL1xuICBwdWJsaWMgdmFsdWVzKCk6IFVbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlcy5tYXAoIGVudHJ5ID0+IHRoaXMuZ2V0KCBlbnRyeSApICk7XG4gIH1cbn1cblxucGhldENvcmUucmVnaXN0ZXIoICdFbnVtZXJhdGlvbk1hcCcsIEVudW1lcmF0aW9uTWFwICk7XG5leHBvcnQgZGVmYXVsdCBFbnVtZXJhdGlvbk1hcDsiXSwibmFtZXMiOlsicGhldENvcmUiLCJFbnVtZXJhdGlvbk1hcCIsImdldCIsImVudHJ5IiwiYXNzZXJ0IiwiX3ZhbHVlcyIsImluY2x1ZGVzIiwiX21hcCIsImhhcyIsInNldCIsInZhbHVlIiwibWFwIiwibWFwRnVuY3Rpb24iLCJfZW51bWVyYXRpb24iLCJmb3JFYWNoIiwiY2FsbGJhY2siLCJ2YWx1ZXMiLCJlbnVtZXJhdGlvbiIsImZhY3RvcnkiLCJNYXAiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxjQUFjLGdCQUFnQjtBQVFyQyw2QkFBNkI7QUFDN0Isd0JBQXdCO0FBQ3hCLElBQUEsQUFBTUMsaUJBQU4sTUFBTUE7SUFvQko7O0dBRUMsR0FDRCxBQUFPQyxJQUFLQyxLQUFRLEVBQU07UUFDeEJDLFVBQVVBLE9BQVEsSUFBSSxDQUFDQyxPQUFPLENBQUNDLFFBQVEsQ0FBRUg7UUFDekNDLFVBQVVBLE9BQVEsSUFBSSxDQUFDRyxJQUFJLENBQUNDLEdBQUcsQ0FBRUw7UUFDakMsT0FBTyxJQUFJLENBQUNJLElBQUksQ0FBQ0wsR0FBRyxDQUFFQztJQUN4QjtJQUVBOztHQUVDLEdBQ0QsQUFBT00sSUFBS04sS0FBUSxFQUFFTyxLQUFRLEVBQVM7UUFDckNOLFVBQVVBLE9BQVEsSUFBSSxDQUFDQyxPQUFPLENBQUNDLFFBQVEsQ0FBRUg7UUFDekMsSUFBSSxDQUFDSSxJQUFJLENBQUNFLEdBQUcsQ0FBRU4sT0FBT087SUFDeEI7SUFFQTs7Ozs7R0FLQyxHQUNELEFBQU9DLElBQUtDLFdBQWdDLEVBQXlCO1FBQ25FLE9BQU8sSUFBSVgsZUFBZ0IsSUFBSSxDQUFDWSxZQUFZLEVBQUVWLENBQUFBLFFBQVNTLFlBQWEsSUFBSSxDQUFDVixHQUFHLENBQUVDLFFBQVNBO0lBQ3pGO0lBRUE7Ozs7R0FJQyxHQUNELEFBQU9XLFFBQVNDLFFBQWdDLEVBQVM7UUFDdkQsSUFBSSxDQUFDVixPQUFPLENBQUNTLE9BQU8sQ0FBRVgsQ0FBQUEsUUFBU1ksU0FBVSxJQUFJLENBQUNiLEdBQUcsQ0FBRUMsUUFBU0E7SUFDOUQ7SUFFQTs7O0dBR0MsR0FDRCxBQUFPYSxTQUFjO1FBQ25CLE9BQU8sSUFBSSxDQUFDWCxPQUFPLENBQUNNLEdBQUcsQ0FBRVIsQ0FBQUEsUUFBUyxJQUFJLENBQUNELEdBQUcsQ0FBRUM7SUFDOUM7SUF6REE7OztHQUdDLEdBQ0QsWUFBb0JjLFdBQTRCLEVBQUVDLE9BQXNCLENBQUc7YUFQbkVYLE9BQU8sSUFBSVk7UUFTakIsSUFBSSxDQUFDTixZQUFZLEdBQUdJO1FBRXBCLElBQUksQ0FBQ1osT0FBTyxHQUFHWSxZQUFZQSxXQUFXLENBQUNELE1BQU07UUFDN0MsSUFBSSxDQUFDWCxPQUFPLENBQUNTLE9BQU8sQ0FBRVgsQ0FBQUE7WUFDcEJDLFVBQVVBLE9BQVEsQ0FBQyxJQUFJLENBQUNHLElBQUksQ0FBQ0MsR0FBRyxDQUFFTCxRQUFTO1lBQzNDLElBQUksQ0FBQ0ksSUFBSSxDQUFDRSxHQUFHLENBQUVOLE9BQU9lLFFBQVNmO1FBQ2pDO0lBQ0Y7QUE2Q0Y7QUFFQUgsU0FBU29CLFFBQVEsQ0FBRSxrQkFBa0JuQjtBQUNyQyxlQUFlQSxlQUFlIn0=