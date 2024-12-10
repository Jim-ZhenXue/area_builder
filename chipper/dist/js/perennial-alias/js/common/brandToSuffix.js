// Copyright 2017, University of Colorado Boulder
/**
 * Returns the brand suffix, given a brand name.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ /**
 * Returns the brand suffix, given a brand name (e.g. 'phet' => '-phet', 'phet-io' => '-phetio', 'adapted-from-phet' => '-adaptedFromPhet')
 * @public
 *
 * @param {string} brand
 * @returns {string}
 */ module.exports = function(brand) {
    if (brand === 'phet-io') {
        return 'phetio';
    }
    return brand.split('-').map((bit, index)=>{
        return (index > 0 ? bit[0].toUpperCase() : bit[0]) + bit.slice(1);
    }).join('');
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vYnJhbmRUb1N1ZmZpeC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmV0dXJucyB0aGUgYnJhbmQgc3VmZml4LCBnaXZlbiBhIGJyYW5kIG5hbWUuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbi8qKlxuICogUmV0dXJucyB0aGUgYnJhbmQgc3VmZml4LCBnaXZlbiBhIGJyYW5kIG5hbWUgKGUuZy4gJ3BoZXQnID0+ICctcGhldCcsICdwaGV0LWlvJyA9PiAnLXBoZXRpbycsICdhZGFwdGVkLWZyb20tcGhldCcgPT4gJy1hZGFwdGVkRnJvbVBoZXQnKVxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBicmFuZFxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggYnJhbmQgKSB7XG4gIGlmICggYnJhbmQgPT09ICdwaGV0LWlvJyApIHtcbiAgICByZXR1cm4gJ3BoZXRpbyc7XG4gIH1cbiAgcmV0dXJuIGJyYW5kLnNwbGl0KCAnLScgKS5tYXAoICggYml0LCBpbmRleCApID0+IHtcbiAgICByZXR1cm4gKCBpbmRleCA+IDAgPyBiaXRbIDAgXS50b1VwcGVyQ2FzZSgpIDogYml0WyAwIF0gKSArIGJpdC5zbGljZSggMSApO1xuICB9ICkuam9pbiggJycgKTtcbn07Il0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJicmFuZCIsInNwbGl0IiwibWFwIiwiYml0IiwiaW5kZXgiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwiam9pbiJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRDs7Ozs7O0NBTUMsR0FDREEsT0FBT0MsT0FBTyxHQUFHLFNBQVVDLEtBQUs7SUFDOUIsSUFBS0EsVUFBVSxXQUFZO1FBQ3pCLE9BQU87SUFDVDtJQUNBLE9BQU9BLE1BQU1DLEtBQUssQ0FBRSxLQUFNQyxHQUFHLENBQUUsQ0FBRUMsS0FBS0M7UUFDcEMsT0FBTyxBQUFFQSxDQUFBQSxRQUFRLElBQUlELEdBQUcsQ0FBRSxFQUFHLENBQUNFLFdBQVcsS0FBS0YsR0FBRyxDQUFFLEVBQUcsQUFBRCxJQUFNQSxJQUFJRyxLQUFLLENBQUU7SUFDeEUsR0FBSUMsSUFBSSxDQUFFO0FBQ1oifQ==