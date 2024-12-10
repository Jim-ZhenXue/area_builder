// Copyright 2018-2024, University of Colorado Boulder
/**
 * These are the units that can be associated with Property instances.
 *
 * When adding units to this file, please add abbreviations, preferably SI abbreviations.
 * And keep the array alphabetized by value.
 * See https://github.com/phetsims/phet-io/issues/530
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import axon from './axon.js';
const UnitsValues = [
    '1/(cm*M)',
    '%',
    'A',
    'AMU',
    'atm',
    'AU',
    'AU^2',
    'cm',
    'cm^2',
    'C',
    '\u00B0',
    '\u00B0C',
    'eV',
    'F',
    '\u00B0F',
    'g',
    'G',
    'Hz',
    'J',
    'K',
    'kg',
    'kg/m^3',
    'kg/L',
    'kg\u00b7m/s',
    'km/s',
    'kPa',
    'L',
    'L/s',
    'm',
    'm^3',
    'm/s',
    'm/s/s',
    'm/s^2',
    'mA',
    'mm',
    'mol',
    'mol/L',
    'mol/s',
    'M',
    'N',
    'N/m',
    'nm',
    'nm/ps',
    'N\u00b7s/m',
    '\u2126',
    '\u2126\u00b7cm',
    'Pa\u00b7s',
    'particles/ps',
    'pm',
    'pm/ps',
    'pm/s',
    'pm/s^2',
    'pm^3',
    'ps',
    'radians',
    'radians/s',
    'radians/s^2',
    'rpm',
    's',
    'V',
    'view-coordinates/s',
    'W',
    'Wb',
    'years' // years
];
const units = {
    values: UnitsValues,
    isValidUnits: function(unit) {
        return _.includes(units.values, unit);
    }
};
axon.register('units', units);
export default units;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvdW5pdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhlc2UgYXJlIHRoZSB1bml0cyB0aGF0IGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggUHJvcGVydHkgaW5zdGFuY2VzLlxuICpcbiAqIFdoZW4gYWRkaW5nIHVuaXRzIHRvIHRoaXMgZmlsZSwgcGxlYXNlIGFkZCBhYmJyZXZpYXRpb25zLCBwcmVmZXJhYmx5IFNJIGFiYnJldmlhdGlvbnMuXG4gKiBBbmQga2VlcCB0aGUgYXJyYXkgYWxwaGFiZXRpemVkIGJ5IHZhbHVlLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy81MzBcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBheG9uIGZyb20gJy4vYXhvbi5qcyc7XG5cbmNvbnN0IFVuaXRzVmFsdWVzID0gW1xuICAnMS8oY20qTSknLCAvLyBtb2xhciBhYnNvcnB0aXZpdHlcbiAgJyUnLCAvLyBwZXJjZW50XG4gICdBJywgLy8gYW1wZXJlc1xuICAnQU1VJywgLy8gYXRvbWljIG1hc3MgdW5pdFxuICAnYXRtJywgLy8gYXRtb3NwaGVyZXNcbiAgJ0FVJywgLy8gYXN0cm9ub21pY2FsIHVuaXRzXG4gICdBVV4yJywgLy8gYXN0cm9ub21pY2FsIHVuaXRzIHNxdWFyZWRcbiAgJ2NtJywgLy8gY2VudGltZXRlcnNcbiAgJ2NtXjInLCAvLyBjZW50aW1ldGVycyBzcXVhcmVkXG4gICdDJywgLy8gY291bG9tYnNcbiAgJ1xcdTAwQjAnLCAvLyDCsCwgZGVncmVlcyAoYW5nbGUpXG4gICdcXHUwMEIwQycsIC8vIMKwQywgZGVncmVlcyBDZWxzaXVzXG4gICdlVicsIC8vIGVsZWN0cm9uIHZvbHRcbiAgJ0YnLCAvLyBmYXJhZFxuICAnXFx1MDBCMEYnLCAvLyDCsEYsIGRlZ3JlZXMgRmFocmVuaGVpdFxuICAnZycsIC8vIGdyYW1zXG4gICdHJywgLy8gZ2F1c3NcbiAgJ0h6JywgLy8gaGVydHpcbiAgJ0onLCAvLyBKb3VsZXNcbiAgJ0snLCAvLyBLZWx2aW5cbiAgJ2tnJywgLy8ga2lsb2dyYW1zXG4gICdrZy9tXjMnLCAvLyBrZy9jdWJpYyBtZXRlclxuICAna2cvTCcsIC8vIGtnL2xpdGVyXG4gICdrZ1xcdTAwYjdtL3MnLCAvLyBrZ8K3bS9zLCBraWxvZ3JhbS1tZXRlcnMvc2Vjb25kXG4gICdrbS9zJyxcbiAgJ2tQYScsIC8vIGtpbG9wYXNjYWxzXG4gICdMJyxcbiAgJ0wvcycsXG4gICdtJywgLy8gbWV0ZXJzXG4gICdtXjMnLCAvLyBjdWJpYyBtZXRlclxuICAnbS9zJywgLy8gbWV0ZXJzL3NlY29uZFxuICAnbS9zL3MnLCAvLyBtZXRlcnMvc2Vjb25kL3NlY29uZFxuICAnbS9zXjInLCAvLyBtZXRlcnMvc2Vjb25kcyBzcXVhcmVkXG4gICdtQScsIC8vIG1pbGxpYW1wZXJlXG4gICdtbScsIC8vbWlsbGltZXRlcnNcbiAgJ21vbCcsXG4gICdtb2wvTCcsXG4gICdtb2wvcycsXG4gICdNJywgLy8gbW9sYXJcbiAgJ04nLCAvLyBOZXd0b25zXG4gICdOL20nLCAvLyBOZXd0b25zL21ldGVyXG4gICdubScsIC8vIG5hbm9tZXRlcnNcbiAgJ25tL3BzJywgLy8gbmFub21ldGVycy9waWNvc2Vjb25kXG4gICdOXFx1MDBiN3MvbScsIC8vIE7Ct3MvbSwgTmV3dG9uLXNlY29uZHMvbWV0ZXJcbiAgJ1xcdTIxMjYnLCAvLyDOqSwgb2htcyAtIGRvbid0IHVzZSB0aGUgb25lIGluIE1hdGhTeW1ib2xzIHRvIHByZXZlbnQgYSBkZXBlbmRlbmN5IG9uIHNjZW5lcnktcGhldFxuICAnXFx1MjEyNlxcdTAwYjdjbScsIC8vIM6pwrdjbSwgb2htLWNlbnRpbWV0ZXJzXG4gICdQYVxcdTAwYjdzJywgLy8gUGFzY2FsLXNlY29uZHNcbiAgJ3BhcnRpY2xlcy9wcycsIC8vIHBhcnRpY2xlcy9waWNvc2Vjb25kXG4gICdwbScsIC8vIHBpY29tZXRlcnNcbiAgJ3BtL3BzJywgLy8gcGljb21ldGVycy9waWNvc2Vjb25kXG4gICdwbS9zJywgLy8gcGljb21ldGVycy9zZWNvbmRcbiAgJ3BtL3NeMicsIC8vIHBpY29tZXRlcnMvc2Vjb25kLXNxdWFyZWRcbiAgJ3BtXjMnLCAvLyBwaWNvbWV0ZXJzIGN1YmVkXG4gICdwcycsIC8vIHBpY29zZWNvbmRzXG4gICdyYWRpYW5zJywgLy8gcmFkaWFucyAtIG5vdGUgdGhpcyBoYXMgdGhlIHNhbWUgYWJicmV2aWF0aW9uIGFzIHRoZSByYWRpYXRpb24gdGVybSBcInJhZFwiIHNvIHdlIHVzZSB0aGUgZnVsbCB0ZXJtXG4gICdyYWRpYW5zL3MnLCAvLyByYWRpYW5zL3NlY29uZFxuICAncmFkaWFucy9zXjInLCAvLyByYWRpYW5zL3NlY29uZF4yXG4gICdycG0nLCAvLyByZXZvbHV0aW9ucyBwZXIgbWludXRlXG4gICdzJywgLy8gc2Vjb25kc1xuICAnVicsIC8vIHZvbHRzXG4gICd2aWV3LWNvb3JkaW5hdGVzL3MnLFxuICAnVycsIC8vIHdhdHRzXG4gICdXYicsIC8vIHdlYmVyXG4gICd5ZWFycycgLy8geWVhcnNcbl0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBVbml0cyA9IHR5cGVvZiBVbml0c1ZhbHVlc1sgbnVtYmVyIF07XG5cbmNvbnN0IHVuaXRzID0ge1xuICB2YWx1ZXM6IFVuaXRzVmFsdWVzLFxuXG4gIGlzVmFsaWRVbml0czogZnVuY3Rpb24oIHVuaXQ6IHN0cmluZyApOiBib29sZWFuIHtcbiAgICByZXR1cm4gXy5pbmNsdWRlcyggdW5pdHMudmFsdWVzLCB1bml0ICk7XG4gIH1cbn07XG5cbmF4b24ucmVnaXN0ZXIoICd1bml0cycsIHVuaXRzICk7XG5cbmV4cG9ydCBkZWZhdWx0IHVuaXRzOyJdLCJuYW1lcyI6WyJheG9uIiwiVW5pdHNWYWx1ZXMiLCJ1bml0cyIsInZhbHVlcyIsImlzVmFsaWRVbml0cyIsInVuaXQiLCJfIiwiaW5jbHVkZXMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7OztDQVFDLEdBRUQsT0FBT0EsVUFBVSxZQUFZO0FBRTdCLE1BQU1DLGNBQWM7SUFDbEI7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsUUFBUSxRQUFRO0NBQ2pCO0FBR0QsTUFBTUMsUUFBUTtJQUNaQyxRQUFRRjtJQUVSRyxjQUFjLFNBQVVDLElBQVk7UUFDbEMsT0FBT0MsRUFBRUMsUUFBUSxDQUFFTCxNQUFNQyxNQUFNLEVBQUVFO0lBQ25DO0FBQ0Y7QUFFQUwsS0FBS1EsUUFBUSxDQUFFLFNBQVNOO0FBRXhCLGVBQWVBLE1BQU0ifQ==