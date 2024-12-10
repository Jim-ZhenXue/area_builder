// Copyright 2021-2024, University of Colorado Boulder
/**
 * Gets the QueryStringMachine schema for the gameLevels query parameter.
 * Note that game levels are numbered starting from 1.
 *
 * History:
 * - The `gameLevels` query parameter was first proposed and discussed in https://github.com/phetsims/vegas/issues/86.
 * - The design of the gameLevels query parameter was solidified, and it was first implemented in Equality Explorer,
 *   see https://github.com/phetsims/equality-explorer/issues/165.
 * - When gameLevels was needed in Fourier, the schema was then copied from Fourier to Equality Explorer,
 *   see https://github.com/phetsims/fourier-making-waves/issues/145.
 * - During code review of Number Play in https://github.com/phetsims/number-play/issues/92, yet-another implementation
 *   was discovered. That motivated factoring out this function, to prevent further duplication and inconsistency.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import vegas from './vegas.js';
function getGameLevelsSchema(numberOfLevels) {
    assert && assert(Number.isInteger(numberOfLevels) && numberOfLevels > 0, `numberOfLevels must be a positive integer: ${numberOfLevels}`);
    return {
        public: true,
        type: 'array',
        // each level number in the array
        elementSchema: {
            type: 'number',
            isValidValue: (value)=>Number.isInteger(value) && value > 0 && value <= numberOfLevels
        },
        // [ 1, 2,...,numberOfLevels]
        defaultValue: Array.from({
            length: numberOfLevels
        }, (_1, i)=>i + 1),
        // validation for the array as a whole
        isValidValue: (array)=>{
            return array === null || // at least 1 level must be visible
            array.length > 0 && // unique level numbers
            array.length === _.uniq(array).length && // sorted by ascending level number
            _.every(array, (value, index, array)=>index === 0 || array[index - 1] <= value);
        }
    };
}
vegas.register('getGameLevelsSchema', getGameLevelsSchema);
export default getGameLevelsSchema;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL2dldEdhbWVMZXZlbHNTY2hlbWEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogR2V0cyB0aGUgUXVlcnlTdHJpbmdNYWNoaW5lIHNjaGVtYSBmb3IgdGhlIGdhbWVMZXZlbHMgcXVlcnkgcGFyYW1ldGVyLlxuICogTm90ZSB0aGF0IGdhbWUgbGV2ZWxzIGFyZSBudW1iZXJlZCBzdGFydGluZyBmcm9tIDEuXG4gKlxuICogSGlzdG9yeTpcbiAqIC0gVGhlIGBnYW1lTGV2ZWxzYCBxdWVyeSBwYXJhbWV0ZXIgd2FzIGZpcnN0IHByb3Bvc2VkIGFuZCBkaXNjdXNzZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlZ2FzL2lzc3Vlcy84Ni5cbiAqIC0gVGhlIGRlc2lnbiBvZiB0aGUgZ2FtZUxldmVscyBxdWVyeSBwYXJhbWV0ZXIgd2FzIHNvbGlkaWZpZWQsIGFuZCBpdCB3YXMgZmlyc3QgaW1wbGVtZW50ZWQgaW4gRXF1YWxpdHkgRXhwbG9yZXIsXG4gKiAgIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzE2NS5cbiAqIC0gV2hlbiBnYW1lTGV2ZWxzIHdhcyBuZWVkZWQgaW4gRm91cmllciwgdGhlIHNjaGVtYSB3YXMgdGhlbiBjb3BpZWQgZnJvbSBGb3VyaWVyIHRvIEVxdWFsaXR5IEV4cGxvcmVyLFxuICogICBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZvdXJpZXItbWFraW5nLXdhdmVzL2lzc3Vlcy8xNDUuXG4gKiAtIER1cmluZyBjb2RlIHJldmlldyBvZiBOdW1iZXIgUGxheSBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbnVtYmVyLXBsYXkvaXNzdWVzLzkyLCB5ZXQtYW5vdGhlciBpbXBsZW1lbnRhdGlvblxuICogICB3YXMgZGlzY292ZXJlZC4gVGhhdCBtb3RpdmF0ZWQgZmFjdG9yaW5nIG91dCB0aGlzIGZ1bmN0aW9uLCB0byBwcmV2ZW50IGZ1cnRoZXIgZHVwbGljYXRpb24gYW5kIGluY29uc2lzdGVuY3kuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgdmVnYXMgZnJvbSAnLi92ZWdhcy5qcyc7XG5cbmZ1bmN0aW9uIGdldEdhbWVMZXZlbHNTY2hlbWEoIG51bWJlck9mTGV2ZWxzOiBudW1iZXIgKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1vZHVsZS1ib3VuZGFyeS10eXBlcywgcGhldC9leHBsaWNpdC1tZXRob2QtcmV0dXJuLXR5cGVcblxuICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBudW1iZXJPZkxldmVscyApICYmIG51bWJlck9mTGV2ZWxzID4gMCxcbiAgICBgbnVtYmVyT2ZMZXZlbHMgbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXI6ICR7bnVtYmVyT2ZMZXZlbHN9YCApO1xuXG4gIHJldHVybiB7XG4gICAgcHVibGljOiB0cnVlLFxuICAgIHR5cGU6ICdhcnJheScsXG5cbiAgICAvLyBlYWNoIGxldmVsIG51bWJlciBpbiB0aGUgYXJyYXlcbiAgICBlbGVtZW50U2NoZW1hOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGlzVmFsaWRWYWx1ZTogKCB2YWx1ZTogbnVtYmVyICkgPT4gKCBOdW1iZXIuaXNJbnRlZ2VyKCB2YWx1ZSApICYmIHZhbHVlID4gMCAmJiB2YWx1ZSA8PSBudW1iZXJPZkxldmVscyApXG4gICAgfSxcblxuICAgIC8vIFsgMSwgMiwuLi4sbnVtYmVyT2ZMZXZlbHNdXG4gICAgZGVmYXVsdFZhbHVlOiBBcnJheS5mcm9tKCB7IGxlbmd0aDogbnVtYmVyT2ZMZXZlbHMgfSwgKCBfLCBpICkgPT4gaSArIDEgKSxcblxuICAgIC8vIHZhbGlkYXRpb24gZm9yIHRoZSBhcnJheSBhcyBhIHdob2xlXG4gICAgaXNWYWxpZFZhbHVlOiAoIGFycmF5OiBudW1iZXJbXSApID0+IHtcbiAgICAgIHJldHVybiAoIGFycmF5ID09PSBudWxsICkgfHwgKFxuICAgICAgICAvLyBhdCBsZWFzdCAxIGxldmVsIG11c3QgYmUgdmlzaWJsZVxuICAgICAgICBhcnJheS5sZW5ndGggPiAwICYmXG4gICAgICAgIC8vIHVuaXF1ZSBsZXZlbCBudW1iZXJzXG4gICAgICAgIGFycmF5Lmxlbmd0aCA9PT0gXy51bmlxKCBhcnJheSApLmxlbmd0aCAmJlxuICAgICAgICAvLyBzb3J0ZWQgYnkgYXNjZW5kaW5nIGxldmVsIG51bWJlclxuICAgICAgICBfLmV2ZXJ5KCBhcnJheSwgKCB2YWx1ZSwgaW5kZXgsIGFycmF5ICkgPT4gKCBpbmRleCA9PT0gMCB8fCBhcnJheVsgaW5kZXggLSAxIF0gPD0gdmFsdWUgKSApXG4gICAgICApO1xuICAgIH1cbiAgfSBhcyBjb25zdDtcbn1cblxudmVnYXMucmVnaXN0ZXIoICdnZXRHYW1lTGV2ZWxzU2NoZW1hJywgZ2V0R2FtZUxldmVsc1NjaGVtYSApO1xuZXhwb3J0IGRlZmF1bHQgZ2V0R2FtZUxldmVsc1NjaGVtYTsiXSwibmFtZXMiOlsidmVnYXMiLCJnZXRHYW1lTGV2ZWxzU2NoZW1hIiwibnVtYmVyT2ZMZXZlbHMiLCJhc3NlcnQiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJwdWJsaWMiLCJ0eXBlIiwiZWxlbWVudFNjaGVtYSIsImlzVmFsaWRWYWx1ZSIsInZhbHVlIiwiZGVmYXVsdFZhbHVlIiwiQXJyYXkiLCJmcm9tIiwibGVuZ3RoIiwiXyIsImkiLCJhcnJheSIsInVuaXEiLCJldmVyeSIsImluZGV4IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Q0FjQyxHQUVELE9BQU9BLFdBQVcsYUFBYTtBQUUvQixTQUFTQyxvQkFBcUJDLGNBQXNCO0lBRWxEQyxVQUFVQSxPQUFRQyxPQUFPQyxTQUFTLENBQUVILG1CQUFvQkEsaUJBQWlCLEdBQ3ZFLENBQUMsMkNBQTJDLEVBQUVBLGdCQUFnQjtJQUVoRSxPQUFPO1FBQ0xJLFFBQVE7UUFDUkMsTUFBTTtRQUVOLGlDQUFpQztRQUNqQ0MsZUFBZTtZQUNiRCxNQUFNO1lBQ05FLGNBQWMsQ0FBRUMsUUFBcUJOLE9BQU9DLFNBQVMsQ0FBRUssVUFBV0EsUUFBUSxLQUFLQSxTQUFTUjtRQUMxRjtRQUVBLDZCQUE2QjtRQUM3QlMsY0FBY0MsTUFBTUMsSUFBSSxDQUFFO1lBQUVDLFFBQVFaO1FBQWUsR0FBRyxDQUFFYSxJQUFHQyxJQUFPQSxJQUFJO1FBRXRFLHNDQUFzQztRQUN0Q1AsY0FBYyxDQUFFUTtZQUNkLE9BQU8sQUFBRUEsVUFBVSxRQUNqQixtQ0FBbUM7WUFDbkNBLE1BQU1ILE1BQU0sR0FBRyxLQUNmLHVCQUF1QjtZQUN2QkcsTUFBTUgsTUFBTSxLQUFLQyxFQUFFRyxJQUFJLENBQUVELE9BQVFILE1BQU0sSUFDdkMsbUNBQW1DO1lBQ25DQyxFQUFFSSxLQUFLLENBQUVGLE9BQU8sQ0FBRVAsT0FBT1UsT0FBT0gsUUFBYUcsVUFBVSxLQUFLSCxLQUFLLENBQUVHLFFBQVEsRUFBRyxJQUFJVjtRQUV0RjtJQUNGO0FBQ0Y7QUFFQVYsTUFBTXFCLFFBQVEsQ0FBRSx1QkFBdUJwQjtBQUN2QyxlQUFlQSxvQkFBb0IifQ==