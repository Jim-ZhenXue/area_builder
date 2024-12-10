// Copyright 2018-2024, University of Colorado Boulder
/**
 * "definition" type for generalized color paints (anything that can be given to a fill/stroke that represents just a
 * solid color). Does NOT include any type of gradient or pattern.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Property from '../../../axon/js/Property.js';
import { isTReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import OrIO from '../../../tandem/js/types/OrIO.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import { Color, scenery } from '../imports.js';
const ColorDef = {
    /**
   * Returns whether the parameter is considered to be a ColorDef.
   */ isColorDef (color) {
        return color === null || typeof color === 'string' || color instanceof Color || isTReadOnlyProperty(color) && (color.value === null || typeof color.value === 'string' || color.value instanceof Color);
    },
    scenerySerialize (color) {
        if (color === null) {
            return 'null';
        } else if (color instanceof Color) {
            return `'${color.toCSS()}'`;
        } else if (typeof color === 'string') {
            return `'${color}'`;
        } else {
            // Property fallback
            return ColorDef.scenerySerialize(color.value);
        }
    },
    // phet-io IOType for serialization and documentation
    ColorDefIO: null
};
ColorDef.ColorDefIO = new IOType('ColorDefIO', {
    isValidValue: ColorDef.isColorDef,
    supertype: NullableIO(OrIO([
        StringIO,
        Color.ColorIO,
        ReferenceIO(Property.PropertyIO(NullableIO(OrIO([
            StringIO,
            Color.ColorIO
        ]))))
    ]))
});
scenery.register('ColorDef', ColorDef);
export default ColorDef;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9Db2xvckRlZi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBcImRlZmluaXRpb25cIiB0eXBlIGZvciBnZW5lcmFsaXplZCBjb2xvciBwYWludHMgKGFueXRoaW5nIHRoYXQgY2FuIGJlIGdpdmVuIHRvIGEgZmlsbC9zdHJva2UgdGhhdCByZXByZXNlbnRzIGp1c3QgYVxuICogc29saWQgY29sb3IpLiBEb2VzIE5PVCBpbmNsdWRlIGFueSB0eXBlIG9mIGdyYWRpZW50IG9yIHBhdHRlcm4uXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCB7IGlzVFJlYWRPbmx5UHJvcGVydHkgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XG5pbXBvcnQgT3JJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvT3JJTy5qcyc7XG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvU3RyaW5nSU8uanMnO1xuaW1wb3J0IHsgQ29sb3IsIHNjZW5lcnksIFRDb2xvciB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBDb2xvckRlZiA9IHtcbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgcGFyYW1ldGVyIGlzIGNvbnNpZGVyZWQgdG8gYmUgYSBDb2xvckRlZi5cbiAgICovXG4gIGlzQ29sb3JEZWYoIGNvbG9yOiB1bmtub3duICk6IGNvbG9yIGlzIFRDb2xvciB7XG4gICAgcmV0dXJuIGNvbG9yID09PSBudWxsIHx8XG4gICAgICAgICAgIHR5cGVvZiBjb2xvciA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgICAgY29sb3IgaW5zdGFuY2VvZiBDb2xvciB8fFxuICAgICAgICAgICAoICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggY29sb3IgKSApICYmIChcbiAgICAgICAgICAgICBjb2xvci52YWx1ZSA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgIHR5cGVvZiBjb2xvci52YWx1ZSA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgICAgICBjb2xvci52YWx1ZSBpbnN0YW5jZW9mIENvbG9yXG4gICAgICAgICAgICkgKTtcbiAgfSxcblxuICBzY2VuZXJ5U2VyaWFsaXplKCBjb2xvcjogVENvbG9yICk6IHN0cmluZyB7XG4gICAgaWYgKCBjb2xvciA9PT0gbnVsbCApIHtcbiAgICAgIHJldHVybiAnbnVsbCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBjb2xvciBpbnN0YW5jZW9mIENvbG9yICkge1xuICAgICAgcmV0dXJuIGAnJHtjb2xvci50b0NTUygpfSdgO1xuICAgIH1cbiAgICBlbHNlIGlmICggdHlwZW9mIGNvbG9yID09PSAnc3RyaW5nJyApIHtcbiAgICAgIHJldHVybiBgJyR7Y29sb3J9J2A7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gUHJvcGVydHkgZmFsbGJhY2tcbiAgICAgIHJldHVybiBDb2xvckRlZi5zY2VuZXJ5U2VyaWFsaXplKCBjb2xvci52YWx1ZSApO1xuICAgIH1cbiAgfSxcblxuICAvLyBwaGV0LWlvIElPVHlwZSBmb3Igc2VyaWFsaXphdGlvbiBhbmQgZG9jdW1lbnRhdGlvblxuICBDb2xvckRlZklPOiBudWxsIGFzIHVua25vd24gYXMgSU9UeXBlIC8vIERlZmluZWQgYmVsb3csIHR5cGVkIGhlcmVcbn07XG5cbkNvbG9yRGVmLkNvbG9yRGVmSU8gPSBuZXcgSU9UeXBlKCAnQ29sb3JEZWZJTycsIHtcbiAgaXNWYWxpZFZhbHVlOiBDb2xvckRlZi5pc0NvbG9yRGVmLFxuICBzdXBlcnR5cGU6IE51bGxhYmxlSU8oIE9ySU8oIFsgU3RyaW5nSU8sIENvbG9yLkNvbG9ySU8sIFJlZmVyZW5jZUlPKCBQcm9wZXJ0eS5Qcm9wZXJ0eUlPKCBOdWxsYWJsZUlPKCBPcklPKCBbIFN0cmluZ0lPLCBDb2xvci5Db2xvcklPIF0gKSApICkgKSBdICkgKVxufSApO1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnQ29sb3JEZWYnLCBDb2xvckRlZiApO1xuXG5leHBvcnQgZGVmYXVsdCBDb2xvckRlZjsiXSwibmFtZXMiOlsiUHJvcGVydHkiLCJpc1RSZWFkT25seVByb3BlcnR5IiwiSU9UeXBlIiwiTnVsbGFibGVJTyIsIk9ySU8iLCJSZWZlcmVuY2VJTyIsIlN0cmluZ0lPIiwiQ29sb3IiLCJzY2VuZXJ5IiwiQ29sb3JEZWYiLCJpc0NvbG9yRGVmIiwiY29sb3IiLCJ2YWx1ZSIsInNjZW5lcnlTZXJpYWxpemUiLCJ0b0NTUyIsIkNvbG9yRGVmSU8iLCJpc1ZhbGlkVmFsdWUiLCJzdXBlcnR5cGUiLCJDb2xvcklPIiwiUHJvcGVydHlJTyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxjQUFjLCtCQUErQjtBQUNwRCxTQUFTQyxtQkFBbUIsUUFBUSx3Q0FBd0M7QUFDNUUsT0FBT0MsWUFBWSxxQ0FBcUM7QUFDeEQsT0FBT0MsZ0JBQWdCLHlDQUF5QztBQUNoRSxPQUFPQyxVQUFVLG1DQUFtQztBQUNwRCxPQUFPQyxpQkFBaUIsMENBQTBDO0FBQ2xFLE9BQU9DLGNBQWMsdUNBQXVDO0FBQzVELFNBQVNDLEtBQUssRUFBRUMsT0FBTyxRQUFnQixnQkFBZ0I7QUFFdkQsTUFBTUMsV0FBVztJQUNmOztHQUVDLEdBQ0RDLFlBQVlDLEtBQWM7UUFDeEIsT0FBT0EsVUFBVSxRQUNWLE9BQU9BLFVBQVUsWUFDakJBLGlCQUFpQkosU0FDZixBQUFFTixvQkFBcUJVLFVBQ3ZCQSxDQUFBQSxNQUFNQyxLQUFLLEtBQUssUUFDaEIsT0FBT0QsTUFBTUMsS0FBSyxLQUFLLFlBQ3ZCRCxNQUFNQyxLQUFLLFlBQVlMLEtBQUk7SUFFdEM7SUFFQU0sa0JBQWtCRixLQUFhO1FBQzdCLElBQUtBLFVBQVUsTUFBTztZQUNwQixPQUFPO1FBQ1QsT0FDSyxJQUFLQSxpQkFBaUJKLE9BQVE7WUFDakMsT0FBTyxDQUFDLENBQUMsRUFBRUksTUFBTUcsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUM3QixPQUNLLElBQUssT0FBT0gsVUFBVSxVQUFXO1lBQ3BDLE9BQU8sQ0FBQyxDQUFDLEVBQUVBLE1BQU0sQ0FBQyxDQUFDO1FBQ3JCLE9BQ0s7WUFDSCxvQkFBb0I7WUFDcEIsT0FBT0YsU0FBU0ksZ0JBQWdCLENBQUVGLE1BQU1DLEtBQUs7UUFDL0M7SUFDRjtJQUVBLHFEQUFxRDtJQUNyREcsWUFBWTtBQUNkO0FBRUFOLFNBQVNNLFVBQVUsR0FBRyxJQUFJYixPQUFRLGNBQWM7SUFDOUNjLGNBQWNQLFNBQVNDLFVBQVU7SUFDakNPLFdBQVdkLFdBQVlDLEtBQU07UUFBRUU7UUFBVUMsTUFBTVcsT0FBTztRQUFFYixZQUFhTCxTQUFTbUIsVUFBVSxDQUFFaEIsV0FBWUMsS0FBTTtZQUFFRTtZQUFVQyxNQUFNVyxPQUFPO1NBQUU7S0FBVTtBQUNuSjtBQUVBVixRQUFRWSxRQUFRLENBQUUsWUFBWVg7QUFFOUIsZUFBZUEsU0FBUyJ9