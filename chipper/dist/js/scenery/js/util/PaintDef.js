// Copyright 2018-2024, University of Colorado Boulder
/**
 * "definition" type for generalized paints (anything that can be passed in as a fill or stroke to a Path)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { isTReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import { Color, Gradient, Paint, scenery } from '../imports.js';
const PaintDef = {
    /**
   * Returns whether the parameter is considered to be a PaintDef.
   * @public
   *
   * @param {*} paint
   * @returns {boolean}
   */ isPaintDef (paint) {
        // NOTE: Property.<Paint> is not supported. PaintObserver would technically need to listen to 3 different levels if
        // we add that (or could be recursive if we allow Property.<paintDef>. Notably, the Property value could change,
        // Color Properties in the Gradient could change, AND the Colors themselves specified in those Properties could
        // change. So it would be more code and more memory usage in general to support it.
        // See https://github.com/phetsims/scenery-phet/issues/651
        return paint === null || typeof paint === 'string' || paint instanceof Color || paint instanceof Paint || isTReadOnlyProperty(paint) && (paint.value === null || typeof paint.value === 'string' || paint.value instanceof Color);
    },
    /**
   * Takes a snapshot of the given paint, returning the current color where possible.
   * Unlike Color.toColor() this method makes a defensive copy for Color values.
   * @public
   *
   * @param {PaintDef} paint
   * @returns {Color}
   */ toColor (paint) {
        if (typeof paint === 'string') {
            return new Color(paint);
        }
        if (paint instanceof Color) {
            return paint.copy();
        }
        if (isTReadOnlyProperty(paint)) {
            return PaintDef.toColor(paint.value);
        }
        if (paint instanceof Gradient) {
            // Average the stops
            let color = Color.TRANSPARENT;
            const quantity = 0;
            paint.stops.forEach((stop)=>{
                color = color.blend(PaintDef.toColor(stop.color), 1 / (quantity + 1));
            });
            return color;
        }
        // Fall-through value (null, Pattern, etc.)
        return Color.TRANSPARENT;
    }
};
scenery.register('PaintDef', PaintDef);
export default PaintDef;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9QYWludERlZi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBcImRlZmluaXRpb25cIiB0eXBlIGZvciBnZW5lcmFsaXplZCBwYWludHMgKGFueXRoaW5nIHRoYXQgY2FuIGJlIHBhc3NlZCBpbiBhcyBhIGZpbGwgb3Igc3Ryb2tlIHRvIGEgUGF0aClcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgaXNUUmVhZE9ubHlQcm9wZXJ0eSB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IHsgQ29sb3IsIEdyYWRpZW50LCBQYWludCwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBQYWludERlZiA9IHtcbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgcGFyYW1ldGVyIGlzIGNvbnNpZGVyZWQgdG8gYmUgYSBQYWludERlZi5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0geyp9IHBhaW50XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNQYWludERlZiggcGFpbnQgKSB7XG4gICAgLy8gTk9URTogUHJvcGVydHkuPFBhaW50PiBpcyBub3Qgc3VwcG9ydGVkLiBQYWludE9ic2VydmVyIHdvdWxkIHRlY2huaWNhbGx5IG5lZWQgdG8gbGlzdGVuIHRvIDMgZGlmZmVyZW50IGxldmVscyBpZlxuICAgIC8vIHdlIGFkZCB0aGF0IChvciBjb3VsZCBiZSByZWN1cnNpdmUgaWYgd2UgYWxsb3cgUHJvcGVydHkuPHBhaW50RGVmPi4gTm90YWJseSwgdGhlIFByb3BlcnR5IHZhbHVlIGNvdWxkIGNoYW5nZSxcbiAgICAvLyBDb2xvciBQcm9wZXJ0aWVzIGluIHRoZSBHcmFkaWVudCBjb3VsZCBjaGFuZ2UsIEFORCB0aGUgQ29sb3JzIHRoZW1zZWx2ZXMgc3BlY2lmaWVkIGluIHRob3NlIFByb3BlcnRpZXMgY291bGRcbiAgICAvLyBjaGFuZ2UuIFNvIGl0IHdvdWxkIGJlIG1vcmUgY29kZSBhbmQgbW9yZSBtZW1vcnkgdXNhZ2UgaW4gZ2VuZXJhbCB0byBzdXBwb3J0IGl0LlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy82NTFcbiAgICByZXR1cm4gcGFpbnQgPT09IG51bGwgfHxcbiAgICAgICAgICAgdHlwZW9mIHBhaW50ID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgICBwYWludCBpbnN0YW5jZW9mIENvbG9yIHx8XG4gICAgICAgICAgIHBhaW50IGluc3RhbmNlb2YgUGFpbnQgfHxcbiAgICAgICAgICAgKCAoIGlzVFJlYWRPbmx5UHJvcGVydHkoIHBhaW50ICkgKSAmJiAoXG4gICAgICAgICAgICAgcGFpbnQudmFsdWUgPT09IG51bGwgfHxcbiAgICAgICAgICAgICB0eXBlb2YgcGFpbnQudmFsdWUgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICAgICAgcGFpbnQudmFsdWUgaW5zdGFuY2VvZiBDb2xvclxuICAgICAgICAgICApICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRha2VzIGEgc25hcHNob3Qgb2YgdGhlIGdpdmVuIHBhaW50LCByZXR1cm5pbmcgdGhlIGN1cnJlbnQgY29sb3Igd2hlcmUgcG9zc2libGUuXG4gICAqIFVubGlrZSBDb2xvci50b0NvbG9yKCkgdGhpcyBtZXRob2QgbWFrZXMgYSBkZWZlbnNpdmUgY29weSBmb3IgQ29sb3IgdmFsdWVzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7UGFpbnREZWZ9IHBhaW50XG4gICAqIEByZXR1cm5zIHtDb2xvcn1cbiAgICovXG4gIHRvQ29sb3IoIHBhaW50ICkge1xuICAgIGlmICggdHlwZW9mIHBhaW50ID09PSAnc3RyaW5nJyApIHtcbiAgICAgIHJldHVybiBuZXcgQ29sb3IoIHBhaW50ICk7XG4gICAgfVxuICAgIGlmICggcGFpbnQgaW5zdGFuY2VvZiBDb2xvciApIHtcbiAgICAgIHJldHVybiBwYWludC5jb3B5KCk7XG4gICAgfVxuICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggcGFpbnQgKSApIHtcbiAgICAgIHJldHVybiBQYWludERlZi50b0NvbG9yKCBwYWludC52YWx1ZSApO1xuICAgIH1cbiAgICBpZiAoIHBhaW50IGluc3RhbmNlb2YgR3JhZGllbnQgKSB7XG4gICAgICAvLyBBdmVyYWdlIHRoZSBzdG9wc1xuICAgICAgbGV0IGNvbG9yID0gQ29sb3IuVFJBTlNQQVJFTlQ7XG4gICAgICBjb25zdCBxdWFudGl0eSA9IDA7XG4gICAgICBwYWludC5zdG9wcy5mb3JFYWNoKCBzdG9wID0+IHtcbiAgICAgICAgY29sb3IgPSBjb2xvci5ibGVuZCggUGFpbnREZWYudG9Db2xvciggc3RvcC5jb2xvciApLCAxIC8gKCBxdWFudGl0eSArIDEgKSApO1xuICAgICAgfSApO1xuICAgICAgcmV0dXJuIGNvbG9yO1xuICAgIH1cblxuICAgIC8vIEZhbGwtdGhyb3VnaCB2YWx1ZSAobnVsbCwgUGF0dGVybiwgZXRjLilcbiAgICByZXR1cm4gQ29sb3IuVFJBTlNQQVJFTlQ7XG4gIH1cbn07XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdQYWludERlZicsIFBhaW50RGVmICk7XG5cbmV4cG9ydCBkZWZhdWx0IFBhaW50RGVmOyJdLCJuYW1lcyI6WyJpc1RSZWFkT25seVByb3BlcnR5IiwiQ29sb3IiLCJHcmFkaWVudCIsIlBhaW50Iiwic2NlbmVyeSIsIlBhaW50RGVmIiwiaXNQYWludERlZiIsInBhaW50IiwidmFsdWUiLCJ0b0NvbG9yIiwiY29weSIsImNvbG9yIiwiVFJBTlNQQVJFTlQiLCJxdWFudGl0eSIsInN0b3BzIiwiZm9yRWFjaCIsInN0b3AiLCJibGVuZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELFNBQVNBLG1CQUFtQixRQUFRLHdDQUF3QztBQUM1RSxTQUFTQyxLQUFLLEVBQUVDLFFBQVEsRUFBRUMsS0FBSyxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRWhFLE1BQU1DLFdBQVc7SUFDZjs7Ozs7O0dBTUMsR0FDREMsWUFBWUMsS0FBSztRQUNmLG1IQUFtSDtRQUNuSCxnSEFBZ0g7UUFDaEgsK0dBQStHO1FBQy9HLG1GQUFtRjtRQUNuRiwwREFBMEQ7UUFDMUQsT0FBT0EsVUFBVSxRQUNWLE9BQU9BLFVBQVUsWUFDakJBLGlCQUFpQk4sU0FDakJNLGlCQUFpQkosU0FDZixBQUFFSCxvQkFBcUJPLFVBQ3ZCQSxDQUFBQSxNQUFNQyxLQUFLLEtBQUssUUFDaEIsT0FBT0QsTUFBTUMsS0FBSyxLQUFLLFlBQ3ZCRCxNQUFNQyxLQUFLLFlBQVlQLEtBQUk7SUFFdEM7SUFFQTs7Ozs7OztHQU9DLEdBQ0RRLFNBQVNGLEtBQUs7UUFDWixJQUFLLE9BQU9BLFVBQVUsVUFBVztZQUMvQixPQUFPLElBQUlOLE1BQU9NO1FBQ3BCO1FBQ0EsSUFBS0EsaUJBQWlCTixPQUFRO1lBQzVCLE9BQU9NLE1BQU1HLElBQUk7UUFDbkI7UUFDQSxJQUFLVixvQkFBcUJPLFFBQVU7WUFDbEMsT0FBT0YsU0FBU0ksT0FBTyxDQUFFRixNQUFNQyxLQUFLO1FBQ3RDO1FBQ0EsSUFBS0QsaUJBQWlCTCxVQUFXO1lBQy9CLG9CQUFvQjtZQUNwQixJQUFJUyxRQUFRVixNQUFNVyxXQUFXO1lBQzdCLE1BQU1DLFdBQVc7WUFDakJOLE1BQU1PLEtBQUssQ0FBQ0MsT0FBTyxDQUFFQyxDQUFBQTtnQkFDbkJMLFFBQVFBLE1BQU1NLEtBQUssQ0FBRVosU0FBU0ksT0FBTyxDQUFFTyxLQUFLTCxLQUFLLEdBQUksSUFBTUUsQ0FBQUEsV0FBVyxDQUFBO1lBQ3hFO1lBQ0EsT0FBT0Y7UUFDVDtRQUVBLDJDQUEyQztRQUMzQyxPQUFPVixNQUFNVyxXQUFXO0lBQzFCO0FBQ0Y7QUFFQVIsUUFBUWMsUUFBUSxDQUFFLFlBQVliO0FBRTlCLGVBQWVBLFNBQVMifQ==