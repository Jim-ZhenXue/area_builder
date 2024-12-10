// Copyright 2021, University of Colorado Boulder
// @author Matt Pennington (PhET Interactive Simulations)
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
const axios = require('axios');
const getFullStringMap = require('./getFullStringMap');
const loadJSON = require('../common/loadJSON');
const gitCheckout = require('../common/gitCheckout');
/**
 * NOTE: release branch NEEDS to be checked out for this to be called, since we'll need the dependencies.json file
 *
 * @param {string} simName
 * @param {string[]} locales - a list of locale codes
 * @param {string} checkoutDir
 * @returns {Promise.<{}>}
 */ const parseScreenNamesFromSimulation = /*#__PURE__*/ _async_to_generator(function*(simName, locales, checkoutDir) {
    const stringMap = yield getFullStringMap(simName, checkoutDir);
    const packageObject = yield loadJSON(`${checkoutDir}/${simName}/package.json`);
    const screenNameKeys = packageObject.phet.screenNameKeys || [];
    const localeData = yield loadJSON(`${checkoutDir}/babel/localeData.json`);
    const result = {};
    for (const locale of locales){
        const fallbackLocales = [
            locale,
            ...localeData[locale].fallbackLocales || [],
            'en'
        ];
        // Locale fallback
        result[locale] = screenNameKeys.map((key)=>{
            for (const fallbackLocale of fallbackLocales){
                if (stringMap[key][fallbackLocale]) {
                    return stringMap[key][fallbackLocale];
                }
            }
            throw new Error('missing key: ' + key);
        });
    }
    return result;
});
const parseScreenNamesAllSimulations = /*#__PURE__*/ _async_to_generator(function*() {
    const url = 'https://phet.colorado.edu/services/metadata/1.3/simulations?format=json&type=html&summary';
    const projects = (yield axios.get(url)).data.projects;
    const screenNameObject = {};
    for(let projectIndex = 0; projectIndex < projects.length; projectIndex++){
        const project = projects[projectIndex];
        const simulation = project.simulations[0];
        const simName = simulation.name;
        const locales = Object.keys(simulation.localizedSimulations);
        yield gitCheckout(simName, `${project.version.major}.${project.version.minor}`);
        screenNameObject[simName] = yield parseScreenNamesFromSimulation(simName, locales, '..');
        yield gitCheckout(simName, 'main');
    }
    return screenNameObject;
});
module.exports = {
    parseScreenNames: parseScreenNamesFromSimulation,
    parseScreenNamesAllSimulations: parseScreenNamesAllSimulations
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9idWlsZC1zZXJ2ZXIvcGFyc2VTY3JlZW5OYW1lcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4vLyBAYXV0aG9yIE1hdHQgUGVubmluZ3RvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcblxuY29uc3QgYXhpb3MgPSByZXF1aXJlKCAnYXhpb3MnICk7XG5jb25zdCBnZXRGdWxsU3RyaW5nTWFwID0gcmVxdWlyZSggJy4vZ2V0RnVsbFN0cmluZ01hcCcgKTtcbmNvbnN0IGxvYWRKU09OID0gcmVxdWlyZSggJy4uL2NvbW1vbi9sb2FkSlNPTicgKTtcbmNvbnN0IGdpdENoZWNrb3V0ID0gcmVxdWlyZSggJy4uL2NvbW1vbi9naXRDaGVja291dCcgKTtcblxuLyoqXG4gKiBOT1RFOiByZWxlYXNlIGJyYW5jaCBORUVEUyB0byBiZSBjaGVja2VkIG91dCBmb3IgdGhpcyB0byBiZSBjYWxsZWQsIHNpbmNlIHdlJ2xsIG5lZWQgdGhlIGRlcGVuZGVuY2llcy5qc29uIGZpbGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc2ltTmFtZVxuICogQHBhcmFtIHtzdHJpbmdbXX0gbG9jYWxlcyAtIGEgbGlzdCBvZiBsb2NhbGUgY29kZXNcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaGVja291dERpclxuICogQHJldHVybnMge1Byb21pc2UuPHt9Pn1cbiAqL1xuY29uc3QgcGFyc2VTY3JlZW5OYW1lc0Zyb21TaW11bGF0aW9uID0gYXN5bmMgKCBzaW1OYW1lLCBsb2NhbGVzLCBjaGVja291dERpciApID0+IHtcblxuICBjb25zdCBzdHJpbmdNYXAgPSBhd2FpdCBnZXRGdWxsU3RyaW5nTWFwKCBzaW1OYW1lLCBjaGVja291dERpciApO1xuICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gYXdhaXQgbG9hZEpTT04oIGAke2NoZWNrb3V0RGlyfS8ke3NpbU5hbWV9L3BhY2thZ2UuanNvbmAgKTtcbiAgY29uc3Qgc2NyZWVuTmFtZUtleXMgPSBwYWNrYWdlT2JqZWN0LnBoZXQuc2NyZWVuTmFtZUtleXMgfHwgW107XG5cbiAgY29uc3QgbG9jYWxlRGF0YSA9IGF3YWl0IGxvYWRKU09OKCBgJHtjaGVja291dERpcn0vYmFiZWwvbG9jYWxlRGF0YS5qc29uYCApO1xuXG4gIGNvbnN0IHJlc3VsdCA9IHt9O1xuICBmb3IgKCBjb25zdCBsb2NhbGUgb2YgbG9jYWxlcyApIHtcbiAgICBjb25zdCBmYWxsYmFja0xvY2FsZXMgPSBbXG4gICAgICBsb2NhbGUsXG4gICAgICAuLi4oIGxvY2FsZURhdGFbIGxvY2FsZSBdLmZhbGxiYWNrTG9jYWxlcyB8fCBbXSApLFxuICAgICAgJ2VuJ1xuICAgIF07XG5cbiAgICAvLyBMb2NhbGUgZmFsbGJhY2tcbiAgICByZXN1bHRbIGxvY2FsZSBdID0gc2NyZWVuTmFtZUtleXMubWFwKCBrZXkgPT4ge1xuICAgICAgZm9yICggY29uc3QgZmFsbGJhY2tMb2NhbGUgb2YgZmFsbGJhY2tMb2NhbGVzICkge1xuICAgICAgICBpZiAoIHN0cmluZ01hcFsga2V5IF1bIGZhbGxiYWNrTG9jYWxlIF0gKSB7XG4gICAgICAgICAgcmV0dXJuIHN0cmluZ01hcFsga2V5IF1bIGZhbGxiYWNrTG9jYWxlIF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvciggJ21pc3Npbmcga2V5OiAnICsga2V5ICk7XG4gICAgfSApO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5jb25zdCBwYXJzZVNjcmVlbk5hbWVzQWxsU2ltdWxhdGlvbnMgPSBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHVybCA9ICdodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L3NlcnZpY2VzL21ldGFkYXRhLzEuMy9zaW11bGF0aW9ucz9mb3JtYXQ9anNvbiZ0eXBlPWh0bWwmc3VtbWFyeSc7XG4gIGNvbnN0IHByb2plY3RzID0gKCBhd2FpdCBheGlvcy5nZXQoIHVybCApICkuZGF0YS5wcm9qZWN0cztcblxuICBjb25zdCBzY3JlZW5OYW1lT2JqZWN0ID0ge307XG5cbiAgZm9yICggbGV0IHByb2plY3RJbmRleCA9IDA7IHByb2plY3RJbmRleCA8IHByb2plY3RzLmxlbmd0aDsgcHJvamVjdEluZGV4KysgKSB7XG4gICAgY29uc3QgcHJvamVjdCA9IHByb2plY3RzWyBwcm9qZWN0SW5kZXggXTtcbiAgICBjb25zdCBzaW11bGF0aW9uID0gcHJvamVjdC5zaW11bGF0aW9uc1sgMCBdO1xuICAgIGNvbnN0IHNpbU5hbWUgPSBzaW11bGF0aW9uLm5hbWU7XG4gICAgY29uc3QgbG9jYWxlcyA9IE9iamVjdC5rZXlzKCBzaW11bGF0aW9uLmxvY2FsaXplZFNpbXVsYXRpb25zICk7XG4gICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHNpbU5hbWUsIGAke3Byb2plY3QudmVyc2lvbi5tYWpvcn0uJHtwcm9qZWN0LnZlcnNpb24ubWlub3J9YCApO1xuICAgIHNjcmVlbk5hbWVPYmplY3RbIHNpbU5hbWUgXSA9IGF3YWl0IHBhcnNlU2NyZWVuTmFtZXNGcm9tU2ltdWxhdGlvbiggc2ltTmFtZSwgbG9jYWxlcywgJy4uJyApO1xuICAgIGF3YWl0IGdpdENoZWNrb3V0KCBzaW1OYW1lLCAnbWFpbicgKTtcbiAgfVxuXG4gIHJldHVybiBzY3JlZW5OYW1lT2JqZWN0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHBhcnNlU2NyZWVuTmFtZXM6IHBhcnNlU2NyZWVuTmFtZXNGcm9tU2ltdWxhdGlvbixcbiAgcGFyc2VTY3JlZW5OYW1lc0FsbFNpbXVsYXRpb25zOiBwYXJzZVNjcmVlbk5hbWVzQWxsU2ltdWxhdGlvbnNcbn07Il0sIm5hbWVzIjpbImF4aW9zIiwicmVxdWlyZSIsImdldEZ1bGxTdHJpbmdNYXAiLCJsb2FkSlNPTiIsImdpdENoZWNrb3V0IiwicGFyc2VTY3JlZW5OYW1lc0Zyb21TaW11bGF0aW9uIiwic2ltTmFtZSIsImxvY2FsZXMiLCJjaGVja291dERpciIsInN0cmluZ01hcCIsInBhY2thZ2VPYmplY3QiLCJzY3JlZW5OYW1lS2V5cyIsInBoZXQiLCJsb2NhbGVEYXRhIiwicmVzdWx0IiwibG9jYWxlIiwiZmFsbGJhY2tMb2NhbGVzIiwibWFwIiwia2V5IiwiZmFsbGJhY2tMb2NhbGUiLCJFcnJvciIsInBhcnNlU2NyZWVuTmFtZXNBbGxTaW11bGF0aW9ucyIsInVybCIsInByb2plY3RzIiwiZ2V0IiwiZGF0YSIsInNjcmVlbk5hbWVPYmplY3QiLCJwcm9qZWN0SW5kZXgiLCJsZW5ndGgiLCJwcm9qZWN0Iiwic2ltdWxhdGlvbiIsInNpbXVsYXRpb25zIiwibmFtZSIsIk9iamVjdCIsImtleXMiLCJsb2NhbGl6ZWRTaW11bGF0aW9ucyIsInZlcnNpb24iLCJtYWpvciIsIm1pbm9yIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcnNlU2NyZWVuTmFtZXMiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUNqRCx5REFBeUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUV6RCxNQUFNQSxRQUFRQyxRQUFTO0FBQ3ZCLE1BQU1DLG1CQUFtQkQsUUFBUztBQUNsQyxNQUFNRSxXQUFXRixRQUFTO0FBQzFCLE1BQU1HLGNBQWNILFFBQVM7QUFFN0I7Ozs7Ozs7Q0FPQyxHQUNELE1BQU1JLG1FQUFpQyxVQUFRQyxTQUFTQyxTQUFTQztJQUUvRCxNQUFNQyxZQUFZLE1BQU1QLGlCQUFrQkksU0FBU0U7SUFDbkQsTUFBTUUsZ0JBQWdCLE1BQU1QLFNBQVUsR0FBR0ssWUFBWSxDQUFDLEVBQUVGLFFBQVEsYUFBYSxDQUFDO0lBQzlFLE1BQU1LLGlCQUFpQkQsY0FBY0UsSUFBSSxDQUFDRCxjQUFjLElBQUksRUFBRTtJQUU5RCxNQUFNRSxhQUFhLE1BQU1WLFNBQVUsR0FBR0ssWUFBWSxzQkFBc0IsQ0FBQztJQUV6RSxNQUFNTSxTQUFTLENBQUM7SUFDaEIsS0FBTSxNQUFNQyxVQUFVUixRQUFVO1FBQzlCLE1BQU1TLGtCQUFrQjtZQUN0QkQ7ZUFDS0YsVUFBVSxDQUFFRSxPQUFRLENBQUNDLGVBQWUsSUFBSSxFQUFFO1lBQy9DO1NBQ0Q7UUFFRCxrQkFBa0I7UUFDbEJGLE1BQU0sQ0FBRUMsT0FBUSxHQUFHSixlQUFlTSxHQUFHLENBQUVDLENBQUFBO1lBQ3JDLEtBQU0sTUFBTUMsa0JBQWtCSCxnQkFBa0I7Z0JBQzlDLElBQUtQLFNBQVMsQ0FBRVMsSUFBSyxDQUFFQyxlQUFnQixFQUFHO29CQUN4QyxPQUFPVixTQUFTLENBQUVTLElBQUssQ0FBRUMsZUFBZ0I7Z0JBQzNDO1lBQ0Y7WUFDQSxNQUFNLElBQUlDLE1BQU8sa0JBQWtCRjtRQUNyQztJQUNGO0lBQ0EsT0FBT0o7QUFDVDtBQUVBLE1BQU1PLG1FQUFpQztJQUNyQyxNQUFNQyxNQUFNO0lBQ1osTUFBTUMsV0FBVyxBQUFFLENBQUEsTUFBTXZCLE1BQU13QixHQUFHLENBQUVGLElBQUksRUFBSUcsSUFBSSxDQUFDRixRQUFRO0lBRXpELE1BQU1HLG1CQUFtQixDQUFDO0lBRTFCLElBQU0sSUFBSUMsZUFBZSxHQUFHQSxlQUFlSixTQUFTSyxNQUFNLEVBQUVELGVBQWlCO1FBQzNFLE1BQU1FLFVBQVVOLFFBQVEsQ0FBRUksYUFBYztRQUN4QyxNQUFNRyxhQUFhRCxRQUFRRSxXQUFXLENBQUUsRUFBRztRQUMzQyxNQUFNekIsVUFBVXdCLFdBQVdFLElBQUk7UUFDL0IsTUFBTXpCLFVBQVUwQixPQUFPQyxJQUFJLENBQUVKLFdBQVdLLG9CQUFvQjtRQUM1RCxNQUFNL0IsWUFBYUUsU0FBUyxHQUFHdUIsUUFBUU8sT0FBTyxDQUFDQyxLQUFLLENBQUMsQ0FBQyxFQUFFUixRQUFRTyxPQUFPLENBQUNFLEtBQUssRUFBRTtRQUMvRVosZ0JBQWdCLENBQUVwQixRQUFTLEdBQUcsTUFBTUQsK0JBQWdDQyxTQUFTQyxTQUFTO1FBQ3RGLE1BQU1ILFlBQWFFLFNBQVM7SUFDOUI7SUFFQSxPQUFPb0I7QUFDVDtBQUVBYSxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsa0JBQWtCcEM7SUFDbEJnQixnQ0FBZ0NBO0FBQ2xDIn0=