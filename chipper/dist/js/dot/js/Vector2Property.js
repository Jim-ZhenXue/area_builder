// Copyright 2019-2024, University of Colorado Boulder
/**
 * Property whose value must be a Vector2.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Property from '../../axon/js/Property.js';
import optionize from '../../phet-core/js/optionize.js';
import dot from './dot.js';
import Vector2 from './Vector2.js';
const VALID_NON_NAN = {
    isValidValue: (v)=>!isNaN(v.x) && !isNaN(v.y),
    validationMessage: 'Vector2 x/y should not be NaN'
};
let Vector2Property = class Vector2Property extends Property {
    constructor(initialValue, providedOptions){
        // Fill in superclass options that are controlled by Vector2Property.
        const options = optionize()({
            valueType: Vector2,
            // {Bounds2|null} - Confine the valid area of acceptable Vector2 values to within a Bounds2.
            validBounds: null,
            validators: [],
            // phet-io
            phetioValueType: Vector2.Vector2IO
        }, providedOptions);
        options.validators.push(VALID_NON_NAN);
        options.validBounds && options.validators.push({
            validationMessage: 'Vector2 is not within validBounds',
            isValidValue: (v)=>options.validBounds.containsPoint(v)
        });
        super(initialValue, options);
        this.validBounds = options.validBounds;
    }
};
dot.register('Vector2Property', Vector2Property);
export default Vector2Property;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUHJvcGVydHkgd2hvc2UgdmFsdWUgbXVzdCBiZSBhIFZlY3RvcjIuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgUHJvcGVydHksIHsgUHJvcGVydHlPcHRpb25zIH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi9Cb3VuZHMyLmpzJztcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcblxuY29uc3QgVkFMSURfTk9OX05BTiA9IHsgaXNWYWxpZFZhbHVlOiAoIHY6IFZlY3RvcjIgKSA9PiAhaXNOYU4oIHYueCApICYmICFpc05hTiggdi55ICksIHZhbGlkYXRpb25NZXNzYWdlOiAnVmVjdG9yMiB4L3kgc2hvdWxkIG5vdCBiZSBOYU4nIH07XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIHZhbGlkQm91bmRzPzogQm91bmRzMiB8IG51bGw7XG59O1xuXG5leHBvcnQgdHlwZSBWZWN0b3IyUHJvcGVydHlPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFByb3BlcnR5T3B0aW9uczxWZWN0b3IyPiwgJ3BoZXRpb1ZhbHVlVHlwZScgfCAndmFsdWVUeXBlJz47XG5cbmNsYXNzIFZlY3RvcjJQcm9wZXJ0eSBleHRlbmRzIFByb3BlcnR5PFZlY3RvcjI+IHtcbiAgcHVibGljIHJlYWRvbmx5IHZhbGlkQm91bmRzOiBCb3VuZHMyIHwgbnVsbDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGluaXRpYWxWYWx1ZTogVmVjdG9yMiwgcHJvdmlkZWRPcHRpb25zPzogVmVjdG9yMlByb3BlcnR5T3B0aW9ucyApIHtcblxuICAgIC8vIEZpbGwgaW4gc3VwZXJjbGFzcyBvcHRpb25zIHRoYXQgYXJlIGNvbnRyb2xsZWQgYnkgVmVjdG9yMlByb3BlcnR5LlxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8VmVjdG9yMlByb3BlcnR5T3B0aW9ucywgU2VsZk9wdGlvbnMsIFByb3BlcnR5T3B0aW9uczxWZWN0b3IyPj4oKSgge1xuICAgICAgdmFsdWVUeXBlOiBWZWN0b3IyLFxuXG4gICAgICAvLyB7Qm91bmRzMnxudWxsfSAtIENvbmZpbmUgdGhlIHZhbGlkIGFyZWEgb2YgYWNjZXB0YWJsZSBWZWN0b3IyIHZhbHVlcyB0byB3aXRoaW4gYSBCb3VuZHMyLlxuICAgICAgdmFsaWRCb3VuZHM6IG51bGwsXG5cbiAgICAgIHZhbGlkYXRvcnM6IFtdLFxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IFZlY3RvcjIuVmVjdG9yMklPXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBvcHRpb25zLnZhbGlkYXRvcnMucHVzaCggVkFMSURfTk9OX05BTiApO1xuXG4gICAgb3B0aW9ucy52YWxpZEJvdW5kcyAmJiBvcHRpb25zLnZhbGlkYXRvcnMucHVzaCgge1xuICAgICAgdmFsaWRhdGlvbk1lc3NhZ2U6ICdWZWN0b3IyIGlzIG5vdCB3aXRoaW4gdmFsaWRCb3VuZHMnLFxuICAgICAgaXNWYWxpZFZhbHVlOiB2ID0+IG9wdGlvbnMudmFsaWRCb3VuZHMhLmNvbnRhaW5zUG9pbnQoIHYgKVxuICAgIH0gKTtcblxuICAgIHN1cGVyKCBpbml0aWFsVmFsdWUsIG9wdGlvbnMgKTtcblxuICAgIHRoaXMudmFsaWRCb3VuZHMgPSBvcHRpb25zLnZhbGlkQm91bmRzO1xuICB9XG59XG5cbmRvdC5yZWdpc3RlciggJ1ZlY3RvcjJQcm9wZXJ0eScsIFZlY3RvcjJQcm9wZXJ0eSApO1xuZXhwb3J0IGRlZmF1bHQgVmVjdG9yMlByb3BlcnR5OyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsImRvdCIsIlZlY3RvcjIiLCJWQUxJRF9OT05fTkFOIiwiaXNWYWxpZFZhbHVlIiwidiIsImlzTmFOIiwieCIsInkiLCJ2YWxpZGF0aW9uTWVzc2FnZSIsIlZlY3RvcjJQcm9wZXJ0eSIsImluaXRpYWxWYWx1ZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ2YWx1ZVR5cGUiLCJ2YWxpZEJvdW5kcyIsInZhbGlkYXRvcnMiLCJwaGV0aW9WYWx1ZVR5cGUiLCJWZWN0b3IySU8iLCJwdXNoIiwiY29udGFpbnNQb2ludCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGNBQW1DLDRCQUE0QjtBQUN0RSxPQUFPQyxlQUFlLGtDQUFrQztBQUd4RCxPQUFPQyxTQUFTLFdBQVc7QUFDM0IsT0FBT0MsYUFBYSxlQUFlO0FBRW5DLE1BQU1DLGdCQUFnQjtJQUFFQyxjQUFjLENBQUVDLElBQWdCLENBQUNDLE1BQU9ELEVBQUVFLENBQUMsS0FBTSxDQUFDRCxNQUFPRCxFQUFFRyxDQUFDO0lBQUlDLG1CQUFtQjtBQUFnQztBQVEzSSxJQUFBLEFBQU1DLGtCQUFOLE1BQU1BLHdCQUF3Qlg7SUFHNUIsWUFBb0JZLFlBQXFCLEVBQUVDLGVBQXdDLENBQUc7UUFFcEYscUVBQXFFO1FBQ3JFLE1BQU1DLFVBQVViLFlBQTRFO1lBQzFGYyxXQUFXWjtZQUVYLDRGQUE0RjtZQUM1RmEsYUFBYTtZQUViQyxZQUFZLEVBQUU7WUFFZCxVQUFVO1lBQ1ZDLGlCQUFpQmYsUUFBUWdCLFNBQVM7UUFDcEMsR0FBR047UUFFSEMsUUFBUUcsVUFBVSxDQUFDRyxJQUFJLENBQUVoQjtRQUV6QlUsUUFBUUUsV0FBVyxJQUFJRixRQUFRRyxVQUFVLENBQUNHLElBQUksQ0FBRTtZQUM5Q1YsbUJBQW1CO1lBQ25CTCxjQUFjQyxDQUFBQSxJQUFLUSxRQUFRRSxXQUFXLENBQUVLLGFBQWEsQ0FBRWY7UUFDekQ7UUFFQSxLQUFLLENBQUVNLGNBQWNFO1FBRXJCLElBQUksQ0FBQ0UsV0FBVyxHQUFHRixRQUFRRSxXQUFXO0lBQ3hDO0FBQ0Y7QUFFQWQsSUFBSW9CLFFBQVEsQ0FBRSxtQkFBbUJYO0FBQ2pDLGVBQWVBLGdCQUFnQiJ9