// Copyright 2013-2024, University of Colorado Boulder
/**
 * @author Sam Reid (PhET Interactive Simulations)
 */ import assert from 'assert';
import fs from 'fs';
import buildLocal from '../../../common/buildLocal.js';
import getOption from './getOption.js';
const getBrands = (repo)=>{
    var _localPackageObject_phet, _localPackageObject_phet1;
    // Determine what brands we want to build
    assert(!getOption('brand'), 'Use --brands={{BRANDS}} instead of brand');
    const localPackageObject = JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf-8'));
    const supportedBrands = ((_localPackageObject_phet = localPackageObject.phet) == null ? void 0 : _localPackageObject_phet.supportedBrands) || [];
    let brands;
    if (getOption('brands')) {
        if (getOption('brands') === '*') {
            brands = supportedBrands;
        } else {
            brands = getOption('brands').split(',');
        }
    } else if (buildLocal.brands) {
        // Extra check, see https://github.com/phetsims/chipper/issues/640
        assert(Array.isArray(buildLocal.brands), 'If brands exists in build-local.json, it should be an array');
        brands = buildLocal.brands.filter((brand)=>supportedBrands.includes(brand));
    } else {
        brands = [
            'adapted-from-phet'
        ];
    }
    if (!((_localPackageObject_phet1 = localPackageObject.phet) == null ? void 0 : _localPackageObject_phet1.buildStandalone)) {
        // Ensure all listed brands are valid
        brands.forEach((brand)=>assert(supportedBrands.includes(brand), `Unsupported brand: ${brand}`));
        assert(brands.length > 0, 'must have one or more brands to build');
    }
    return brands;
};
export default getBrands;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy91dGlsL2dldEJyYW5kcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IGJ1aWxkTG9jYWwgZnJvbSAnLi4vLi4vLi4vY29tbW9uL2J1aWxkTG9jYWwuanMnO1xuaW1wb3J0IGdldE9wdGlvbiBmcm9tICcuL2dldE9wdGlvbi5qcyc7XG5cbnR5cGUgQnJhbmQgPSBzdHJpbmc7XG5cbmNvbnN0IGdldEJyYW5kcyA9ICggcmVwbzogc3RyaW5nICk6IEJyYW5kW10gPT4ge1xuXG4gIC8vIERldGVybWluZSB3aGF0IGJyYW5kcyB3ZSB3YW50IHRvIGJ1aWxkXG4gIGFzc2VydCggIWdldE9wdGlvbiggJ2JyYW5kJyApLCAnVXNlIC0tYnJhbmRzPXt7QlJBTkRTfX0gaW5zdGVhZCBvZiBicmFuZCcgKTtcblxuICBjb25zdCBsb2NhbFBhY2thZ2VPYmplY3QgPSBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAsICd1dGYtOCcgKSApO1xuICBjb25zdCBzdXBwb3J0ZWRCcmFuZHMgPSBsb2NhbFBhY2thZ2VPYmplY3QucGhldD8uc3VwcG9ydGVkQnJhbmRzIHx8IFtdO1xuXG4gIGxldCBicmFuZHM6IHN0cmluZ1tdO1xuICBpZiAoIGdldE9wdGlvbiggJ2JyYW5kcycgKSApIHtcbiAgICBpZiAoIGdldE9wdGlvbiggJ2JyYW5kcycgKSA9PT0gJyonICkge1xuICAgICAgYnJhbmRzID0gc3VwcG9ydGVkQnJhbmRzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGJyYW5kcyA9IGdldE9wdGlvbiggJ2JyYW5kcycgKS5zcGxpdCggJywnICk7XG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKCBidWlsZExvY2FsLmJyYW5kcyApIHtcbiAgICAvLyBFeHRyYSBjaGVjaywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy82NDBcbiAgICBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGJ1aWxkTG9jYWwuYnJhbmRzICksICdJZiBicmFuZHMgZXhpc3RzIGluIGJ1aWxkLWxvY2FsLmpzb24sIGl0IHNob3VsZCBiZSBhbiBhcnJheScgKTtcbiAgICBicmFuZHMgPSBidWlsZExvY2FsLmJyYW5kcy5maWx0ZXIoICggYnJhbmQ6IHN0cmluZyApID0+IHN1cHBvcnRlZEJyYW5kcy5pbmNsdWRlcyggYnJhbmQgKSApO1xuICB9XG4gIGVsc2Uge1xuICAgIGJyYW5kcyA9IFsgJ2FkYXB0ZWQtZnJvbS1waGV0JyBdO1xuICB9XG5cbiAgaWYgKCAhbG9jYWxQYWNrYWdlT2JqZWN0LnBoZXQ/LmJ1aWxkU3RhbmRhbG9uZSApIHtcblxuICAgIC8vIEVuc3VyZSBhbGwgbGlzdGVkIGJyYW5kcyBhcmUgdmFsaWRcbiAgICBicmFuZHMuZm9yRWFjaCggYnJhbmQgPT4gYXNzZXJ0KCBzdXBwb3J0ZWRCcmFuZHMuaW5jbHVkZXMoIGJyYW5kICksIGBVbnN1cHBvcnRlZCBicmFuZDogJHticmFuZH1gICkgKTtcbiAgICBhc3NlcnQoIGJyYW5kcy5sZW5ndGggPiAwLCAnbXVzdCBoYXZlIG9uZSBvciBtb3JlIGJyYW5kcyB0byBidWlsZCcgKTtcbiAgfVxuXG4gIHJldHVybiBicmFuZHM7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBnZXRCcmFuZHM7Il0sIm5hbWVzIjpbImFzc2VydCIsImZzIiwiYnVpbGRMb2NhbCIsImdldE9wdGlvbiIsImdldEJyYW5kcyIsInJlcG8iLCJsb2NhbFBhY2thZ2VPYmplY3QiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJzdXBwb3J0ZWRCcmFuZHMiLCJwaGV0IiwiYnJhbmRzIiwic3BsaXQiLCJBcnJheSIsImlzQXJyYXkiLCJmaWx0ZXIiLCJicmFuZCIsImluY2x1ZGVzIiwiYnVpbGRTdGFuZGFsb25lIiwiZm9yRWFjaCIsImxlbmd0aCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOztDQUVDLEdBQ0QsT0FBT0EsWUFBWSxTQUFTO0FBQzVCLE9BQU9DLFFBQVEsS0FBSztBQUNwQixPQUFPQyxnQkFBZ0IsZ0NBQWdDO0FBQ3ZELE9BQU9DLGVBQWUsaUJBQWlCO0FBSXZDLE1BQU1DLFlBQVksQ0FBRUM7UUFNTUMsMEJBb0JsQkE7SUF4Qk4seUNBQXlDO0lBQ3pDTixPQUFRLENBQUNHLFVBQVcsVUFBVztJQUUvQixNQUFNRyxxQkFBcUJDLEtBQUtDLEtBQUssQ0FBRVAsR0FBR1EsWUFBWSxDQUFFLENBQUMsR0FBRyxFQUFFSixLQUFLLGFBQWEsQ0FBQyxFQUFFO0lBQ25GLE1BQU1LLGtCQUFrQkosRUFBQUEsMkJBQUFBLG1CQUFtQkssSUFBSSxxQkFBdkJMLHlCQUF5QkksZUFBZSxLQUFJLEVBQUU7SUFFdEUsSUFBSUU7SUFDSixJQUFLVCxVQUFXLFdBQWE7UUFDM0IsSUFBS0EsVUFBVyxjQUFlLEtBQU07WUFDbkNTLFNBQVNGO1FBQ1gsT0FDSztZQUNIRSxTQUFTVCxVQUFXLFVBQVdVLEtBQUssQ0FBRTtRQUN4QztJQUNGLE9BQ0ssSUFBS1gsV0FBV1UsTUFBTSxFQUFHO1FBQzVCLGtFQUFrRTtRQUNsRVosT0FBUWMsTUFBTUMsT0FBTyxDQUFFYixXQUFXVSxNQUFNLEdBQUk7UUFDNUNBLFNBQVNWLFdBQVdVLE1BQU0sQ0FBQ0ksTUFBTSxDQUFFLENBQUVDLFFBQW1CUCxnQkFBZ0JRLFFBQVEsQ0FBRUQ7SUFDcEYsT0FDSztRQUNITCxTQUFTO1lBQUU7U0FBcUI7SUFDbEM7SUFFQSxJQUFLLEdBQUNOLDRCQUFBQSxtQkFBbUJLLElBQUkscUJBQXZCTCwwQkFBeUJhLGVBQWUsR0FBRztRQUUvQyxxQ0FBcUM7UUFDckNQLE9BQU9RLE9BQU8sQ0FBRUgsQ0FBQUEsUUFBU2pCLE9BQVFVLGdCQUFnQlEsUUFBUSxDQUFFRCxRQUFTLENBQUMsbUJBQW1CLEVBQUVBLE9BQU87UUFDakdqQixPQUFRWSxPQUFPUyxNQUFNLEdBQUcsR0FBRztJQUM3QjtJQUVBLE9BQU9UO0FBQ1Q7QUFFQSxlQUFlUixVQUFVIn0=