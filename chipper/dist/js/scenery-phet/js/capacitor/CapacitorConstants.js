// Copyright 2019-2022, University of Colorado Boulder
/**
 * Constants related to CapacitorNode and its corresponding model.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import RangeWithValue from '../../../dot/js/RangeWithValue.js';
import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import sceneryPhet from '../sceneryPhet.js';
const CapacitorConstants = {
    // meters, with default corresponding to an area of 200 mm^2
    PLATE_WIDTH_RANGE: new RangeWithValue(0.01, 0.02, Math.sqrt(200 / 1000 / 1000)),
    PLATE_HEIGHT: 0.0005,
    POLARITY: EnumerationDeprecated.byKeys([
        'POSITIVE',
        'NEGATIVE'
    ]),
    PLATE_SEPARATION_RANGE: new RangeWithValue(0.002, 0.01, 0.006) // meters
};
sceneryPhet.register('CapacitorConstants', CapacitorConstants);
export default CapacitorConstants;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9jYXBhY2l0b3IvQ2FwYWNpdG9yQ29uc3RhbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENvbnN0YW50cyByZWxhdGVkIHRvIENhcGFjaXRvck5vZGUgYW5kIGl0cyBjb3JyZXNwb25kaW5nIG1vZGVsLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFJhbmdlV2l0aFZhbHVlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZVdpdGhWYWx1ZS5qcyc7XG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWQuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uL3NjZW5lcnlQaGV0LmpzJztcblxuY29uc3QgQ2FwYWNpdG9yQ29uc3RhbnRzID0ge1xuXG4gIC8vIG1ldGVycywgd2l0aCBkZWZhdWx0IGNvcnJlc3BvbmRpbmcgdG8gYW4gYXJlYSBvZiAyMDAgbW1eMlxuICBQTEFURV9XSURUSF9SQU5HRTogbmV3IFJhbmdlV2l0aFZhbHVlKCAwLjAxLCAwLjAyLCBNYXRoLnNxcnQoIDIwMCAvIDEwMDAgLyAxMDAwICkgKSxcbiAgUExBVEVfSEVJR0hUOiAwLjAwMDUsIC8vIG1ldGVyc1xuICBQT0xBUklUWTogRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5S2V5cyggWyAnUE9TSVRJVkUnLCAnTkVHQVRJVkUnIF0gKSxcbiAgUExBVEVfU0VQQVJBVElPTl9SQU5HRTogbmV3IFJhbmdlV2l0aFZhbHVlKCAwLjAwMiwgMC4wMSwgMC4wMDYgKSAvLyBtZXRlcnNcbn07XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQ2FwYWNpdG9yQ29uc3RhbnRzJywgQ2FwYWNpdG9yQ29uc3RhbnRzICk7XG5leHBvcnQgZGVmYXVsdCBDYXBhY2l0b3JDb25zdGFudHM7Il0sIm5hbWVzIjpbIlJhbmdlV2l0aFZhbHVlIiwiRW51bWVyYXRpb25EZXByZWNhdGVkIiwic2NlbmVyeVBoZXQiLCJDYXBhY2l0b3JDb25zdGFudHMiLCJQTEFURV9XSURUSF9SQU5HRSIsIk1hdGgiLCJzcXJ0IiwiUExBVEVfSEVJR0hUIiwiUE9MQVJJVFkiLCJieUtleXMiLCJQTEFURV9TRVBBUkFUSU9OX1JBTkdFIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0Esb0JBQW9CLG9DQUFvQztBQUMvRCxPQUFPQywyQkFBMkIsaURBQWlEO0FBQ25GLE9BQU9DLGlCQUFpQixvQkFBb0I7QUFFNUMsTUFBTUMscUJBQXFCO0lBRXpCLDREQUE0RDtJQUM1REMsbUJBQW1CLElBQUlKLGVBQWdCLE1BQU0sTUFBTUssS0FBS0MsSUFBSSxDQUFFLE1BQU0sT0FBTztJQUMzRUMsY0FBYztJQUNkQyxVQUFVUCxzQkFBc0JRLE1BQU0sQ0FBRTtRQUFFO1FBQVk7S0FBWTtJQUNsRUMsd0JBQXdCLElBQUlWLGVBQWdCLE9BQU8sTUFBTSxPQUFRLFNBQVM7QUFDNUU7QUFFQUUsWUFBWVMsUUFBUSxDQUFFLHNCQUFzQlI7QUFDNUMsZUFBZUEsbUJBQW1CIn0=