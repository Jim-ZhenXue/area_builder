// Copyright 2021-2024, University of Colorado Boulder
/**
 * An object that contains a value for each item in an enumeration.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import EnumerationMap from './EnumerationMap.js';
import Orientation from './Orientation.js';
import phetCore from './phetCore.js';
let OrientationPair = class OrientationPair extends EnumerationMap {
    get horizontal() {
        return this.get(Orientation.HORIZONTAL);
    }
    set horizontal(value) {
        this.set(Orientation.HORIZONTAL, value);
    }
    get vertical() {
        return this.get(Orientation.VERTICAL);
    }
    set vertical(value) {
        this.set(Orientation.VERTICAL, value);
    }
    with(orientation, value) {
        return new OrientationPair(orientation === Orientation.HORIZONTAL ? value : this.horizontal, orientation === Orientation.VERTICAL ? value : this.vertical);
    }
    /**
   * Creates an orientation pair based on a factory method.
   *
   * @param factory - called once for each orientation to determine
   *                             the value.
   */ static create(factory) {
        return new OrientationPair(factory(Orientation.HORIZONTAL), factory(Orientation.VERTICAL));
    }
    /**
   * Returns a new EnumerationMap with mapped values.
   *
   * @param mapFunction - function( {*}, {TEnumeration.*} ): {*}
   * @returns With the mapped values
   */ map(mapFunction) {
        return new OrientationPair(mapFunction(this.horizontal, Orientation.HORIZONTAL), mapFunction(this.vertical, Orientation.VERTICAL));
    }
    /**
   * @param horizontal - Value for the horizontal orientation
   * @param vertical - Value for the vertical orientation
   */ constructor(horizontal, vertical){
        super(Orientation, (orientation)=>orientation === Orientation.HORIZONTAL ? horizontal : vertical);
    }
};
phetCore.register('OrientationPair', OrientationPair);
export default OrientationPair;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvblBhaXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSB2YWx1ZSBmb3IgZWFjaCBpdGVtIGluIGFuIGVudW1lcmF0aW9uLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgRW51bWVyYXRpb25NYXAgZnJvbSAnLi9FbnVtZXJhdGlvbk1hcC5qcyc7XG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi9PcmllbnRhdGlvbi5qcyc7XG5pbXBvcnQgcGhldENvcmUgZnJvbSAnLi9waGV0Q29yZS5qcyc7XG5cbmNsYXNzIE9yaWVudGF0aW9uUGFpcjxUPiBleHRlbmRzIEVudW1lcmF0aW9uTWFwPE9yaWVudGF0aW9uLCBUPiB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBob3Jpem9udGFsIC0gVmFsdWUgZm9yIHRoZSBob3Jpem9udGFsIG9yaWVudGF0aW9uXG4gICAqIEBwYXJhbSB2ZXJ0aWNhbCAtIFZhbHVlIGZvciB0aGUgdmVydGljYWwgb3JpZW50YXRpb25cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaG9yaXpvbnRhbDogVCwgdmVydGljYWw6IFQgKSB7XG4gICAgc3VwZXIoIE9yaWVudGF0aW9uLCBvcmllbnRhdGlvbiA9PiBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCA/IGhvcml6b250YWwgOiB2ZXJ0aWNhbCApO1xuICB9XG5cbiAgcHVibGljIGdldCBob3Jpem9udGFsKCk6IFQge1xuICAgIHJldHVybiB0aGlzLmdldCggT3JpZW50YXRpb24uSE9SSVpPTlRBTCApO1xuICB9XG5cbiAgcHVibGljIHNldCBob3Jpem9udGFsKCB2YWx1ZTogVCApIHtcbiAgICB0aGlzLnNldCggT3JpZW50YXRpb24uSE9SSVpPTlRBTCwgdmFsdWUgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdmVydGljYWwoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCBPcmllbnRhdGlvbi5WRVJUSUNBTCApO1xuICB9XG5cbiAgcHVibGljIHNldCB2ZXJ0aWNhbCggdmFsdWU6IFQgKSB7XG4gICAgdGhpcy5zZXQoIE9yaWVudGF0aW9uLlZFUlRJQ0FMLCB2YWx1ZSApO1xuICB9XG5cbiAgcHVibGljIHdpdGgoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiwgdmFsdWU6IFQgKTogT3JpZW50YXRpb25QYWlyPFQ+IHtcbiAgICByZXR1cm4gbmV3IE9yaWVudGF0aW9uUGFpcihcbiAgICAgIG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMID8gdmFsdWUgOiB0aGlzLmhvcml6b250YWwsXG4gICAgICBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uVkVSVElDQUwgPyB2YWx1ZSA6IHRoaXMudmVydGljYWxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gb3JpZW50YXRpb24gcGFpciBiYXNlZCBvbiBhIGZhY3RvcnkgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0gZmFjdG9yeSAtIGNhbGxlZCBvbmNlIGZvciBlYWNoIG9yaWVudGF0aW9uIHRvIGRldGVybWluZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHZhbHVlLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjcmVhdGU8VD4oIGZhY3Rvcnk6ICggbzogT3JpZW50YXRpb24gKSA9PiBUICk6IE9yaWVudGF0aW9uUGFpcjxUPiB7XG4gICAgcmV0dXJuIG5ldyBPcmllbnRhdGlvblBhaXIoIGZhY3RvcnkoIE9yaWVudGF0aW9uLkhPUklaT05UQUwgKSwgZmFjdG9yeSggT3JpZW50YXRpb24uVkVSVElDQUwgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgRW51bWVyYXRpb25NYXAgd2l0aCBtYXBwZWQgdmFsdWVzLlxuICAgKlxuICAgKiBAcGFyYW0gbWFwRnVuY3Rpb24gLSBmdW5jdGlvbiggeyp9LCB7VEVudW1lcmF0aW9uLip9ICk6IHsqfVxuICAgKiBAcmV0dXJucyBXaXRoIHRoZSBtYXBwZWQgdmFsdWVzXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgbWFwKCBtYXBGdW5jdGlvbjogKCB2YWx1ZTogVCwgb3JpZW50YXRpb246IE9yaWVudGF0aW9uICkgPT4gVCApOiBPcmllbnRhdGlvblBhaXI8VD4ge1xuICAgIHJldHVybiBuZXcgT3JpZW50YXRpb25QYWlyKCBtYXBGdW5jdGlvbiggdGhpcy5ob3Jpem9udGFsLCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMICksIG1hcEZ1bmN0aW9uKCB0aGlzLnZlcnRpY2FsLCBPcmllbnRhdGlvbi5WRVJUSUNBTCApICk7XG4gIH1cbn1cblxucGhldENvcmUucmVnaXN0ZXIoICdPcmllbnRhdGlvblBhaXInLCBPcmllbnRhdGlvblBhaXIgKTtcbmV4cG9ydCBkZWZhdWx0IE9yaWVudGF0aW9uUGFpcjsiXSwibmFtZXMiOlsiRW51bWVyYXRpb25NYXAiLCJPcmllbnRhdGlvbiIsInBoZXRDb3JlIiwiT3JpZW50YXRpb25QYWlyIiwiaG9yaXpvbnRhbCIsImdldCIsIkhPUklaT05UQUwiLCJ2YWx1ZSIsInNldCIsInZlcnRpY2FsIiwiVkVSVElDQUwiLCJ3aXRoIiwib3JpZW50YXRpb24iLCJjcmVhdGUiLCJmYWN0b3J5IiwibWFwIiwibWFwRnVuY3Rpb24iLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxvQkFBb0Isc0JBQXNCO0FBQ2pELE9BQU9DLGlCQUFpQixtQkFBbUI7QUFDM0MsT0FBT0MsY0FBYyxnQkFBZ0I7QUFFckMsSUFBQSxBQUFNQyxrQkFBTixNQUFNQSx3QkFBMkJIO0lBVS9CLElBQVdJLGFBQWdCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDQyxHQUFHLENBQUVKLFlBQVlLLFVBQVU7SUFDekM7SUFFQSxJQUFXRixXQUFZRyxLQUFRLEVBQUc7UUFDaEMsSUFBSSxDQUFDQyxHQUFHLENBQUVQLFlBQVlLLFVBQVUsRUFBRUM7SUFDcEM7SUFFQSxJQUFXRSxXQUFjO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDSixHQUFHLENBQUVKLFlBQVlTLFFBQVE7SUFDdkM7SUFFQSxJQUFXRCxTQUFVRixLQUFRLEVBQUc7UUFDOUIsSUFBSSxDQUFDQyxHQUFHLENBQUVQLFlBQVlTLFFBQVEsRUFBRUg7SUFDbEM7SUFFT0ksS0FBTUMsV0FBd0IsRUFBRUwsS0FBUSxFQUF1QjtRQUNwRSxPQUFPLElBQUlKLGdCQUNUUyxnQkFBZ0JYLFlBQVlLLFVBQVUsR0FBR0MsUUFBUSxJQUFJLENBQUNILFVBQVUsRUFDaEVRLGdCQUFnQlgsWUFBWVMsUUFBUSxHQUFHSCxRQUFRLElBQUksQ0FBQ0UsUUFBUTtJQUVoRTtJQUVBOzs7OztHQUtDLEdBQ0QsT0FBY0ksT0FBV0MsT0FBZ0MsRUFBdUI7UUFDOUUsT0FBTyxJQUFJWCxnQkFBaUJXLFFBQVNiLFlBQVlLLFVBQVUsR0FBSVEsUUFBU2IsWUFBWVMsUUFBUTtJQUM5RjtJQUVBOzs7OztHQUtDLEdBQ0QsQUFBZ0JLLElBQUtDLFdBQXdELEVBQXVCO1FBQ2xHLE9BQU8sSUFBSWIsZ0JBQWlCYSxZQUFhLElBQUksQ0FBQ1osVUFBVSxFQUFFSCxZQUFZSyxVQUFVLEdBQUlVLFlBQWEsSUFBSSxDQUFDUCxRQUFRLEVBQUVSLFlBQVlTLFFBQVE7SUFDdEk7SUFqREE7OztHQUdDLEdBQ0QsWUFBb0JOLFVBQWEsRUFBRUssUUFBVyxDQUFHO1FBQy9DLEtBQUssQ0FBRVIsYUFBYVcsQ0FBQUEsY0FBZUEsZ0JBQWdCWCxZQUFZSyxVQUFVLEdBQUdGLGFBQWFLO0lBQzNGO0FBNENGO0FBRUFQLFNBQVNlLFFBQVEsQ0FBRSxtQkFBbUJkO0FBQ3RDLGVBQWVBLGdCQUFnQiJ9