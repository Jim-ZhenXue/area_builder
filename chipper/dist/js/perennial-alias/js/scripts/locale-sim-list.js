// Copyright 2024, University of Colorado Boulder
/**
 * Prints out a report (with links) for active sims/translation for each locale
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
const localeInfo = require('../../../chipper/js/data/localeInfo');
const simMetadata = require('../common/simMetadata');
const winston = require('winston');
winston.default.transports.console.level = 'error';
const production = process.argv.includes('--production');
const phettest = process.argv.includes('--phettest');
const local = process.argv.includes('--local');
const limitString = process.argv.find((arg)=>arg.startsWith('--limit='));
const limit = limitString ? Number(limitString.substring('--limit='.length)) : Number.POSITIVE_INFINITY;
_async_to_generator(function*() {
    const metadata = yield simMetadata();
    const simNamesByLocale = {};
    metadata.projects.forEach((project)=>{
        const simulations = project.simulations;
        if (simulations.length !== 1) {
            throw new Error('Expected exactly one simulation per project in metadata');
        }
        const simulation = simulations[0];
        const name = simulation.name;
        const locales = Object.keys(simulation.localizedSimulations);
        locales.forEach((locale)=>{
            if (!simNamesByLocale[locale]) {
                simNamesByLocale[locale] = [];
            }
            simNamesByLocale[locale].push(name);
        });
    });
    // https://bayes.colorado.edu/dev/phettest/acid-base-solutions/acid-base-solutions_en.html?ea&brand=phet
    const locales = Object.keys(simNamesByLocale).sort();
    for (const locale of locales){
        console.log(`## ${locale} (${localeInfo[locale].name})`);
        console.log('');
        simNamesByLocale[locale].slice(0, Math.min(limit, simNamesByLocale[locale].length)).forEach((simName)=>{
            const links = [];
            if (production) {
                links.push(`[production](https://phet.colorado.edu/sims/html/${simName}/latest/${simName}_all.html?locale=${locale})`);
            }
            if (phettest) {
                links.push(`[phettest](https://bayes.colorado.edu/dev/phettest/${simName}/${simName}_en.html?ea&brand=phet&locale=${locale})`);
            }
            if (local) {
                links.push(`[local](http://localhost/${simName}/${simName}_en.html?brand=phet&ea&debugger&locale=${locale})`);
            }
            console.log(`- ${simName} ${links.join(' ')}`);
        });
        console.log('');
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL2xvY2FsZS1zaW0tbGlzdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUHJpbnRzIG91dCBhIHJlcG9ydCAod2l0aCBsaW5rcykgZm9yIGFjdGl2ZSBzaW1zL3RyYW5zbGF0aW9uIGZvciBlYWNoIGxvY2FsZVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBsb2NhbGVJbmZvID0gcmVxdWlyZSggJy4uLy4uLy4uL2NoaXBwZXIvanMvZGF0YS9sb2NhbGVJbmZvJyApO1xuY29uc3Qgc2ltTWV0YWRhdGEgPSByZXF1aXJlKCAnLi4vY29tbW9uL3NpbU1ldGFkYXRhJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG53aW5zdG9uLmRlZmF1bHQudHJhbnNwb3J0cy5jb25zb2xlLmxldmVsID0gJ2Vycm9yJztcblxuY29uc3QgcHJvZHVjdGlvbiA9IHByb2Nlc3MuYXJndi5pbmNsdWRlcyggJy0tcHJvZHVjdGlvbicgKTtcbmNvbnN0IHBoZXR0ZXN0ID0gcHJvY2Vzcy5hcmd2LmluY2x1ZGVzKCAnLS1waGV0dGVzdCcgKTtcbmNvbnN0IGxvY2FsID0gcHJvY2Vzcy5hcmd2LmluY2x1ZGVzKCAnLS1sb2NhbCcgKTtcblxuY29uc3QgbGltaXRTdHJpbmcgPSBwcm9jZXNzLmFyZ3YuZmluZCggYXJnID0+IGFyZy5zdGFydHNXaXRoKCAnLS1saW1pdD0nICkgKTtcbmNvbnN0IGxpbWl0ID0gbGltaXRTdHJpbmcgPyBOdW1iZXIoIGxpbWl0U3RyaW5nLnN1YnN0cmluZyggJy0tbGltaXQ9Jy5sZW5ndGggKSApIDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG4oIGFzeW5jICgpID0+IHtcblxuICBjb25zdCBtZXRhZGF0YSA9IGF3YWl0IHNpbU1ldGFkYXRhKCk7XG5cbiAgY29uc3Qgc2ltTmFtZXNCeUxvY2FsZSA9IHt9O1xuXG4gIG1ldGFkYXRhLnByb2plY3RzLmZvckVhY2goIHByb2plY3QgPT4ge1xuICAgIGNvbnN0IHNpbXVsYXRpb25zID0gcHJvamVjdC5zaW11bGF0aW9ucztcbiAgICBpZiAoIHNpbXVsYXRpb25zLmxlbmd0aCAhPT0gMSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ0V4cGVjdGVkIGV4YWN0bHkgb25lIHNpbXVsYXRpb24gcGVyIHByb2plY3QgaW4gbWV0YWRhdGEnICk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2ltdWxhdGlvbiA9IHNpbXVsYXRpb25zWyAwIF07XG4gICAgY29uc3QgbmFtZSA9IHNpbXVsYXRpb24ubmFtZTtcbiAgICBjb25zdCBsb2NhbGVzID0gT2JqZWN0LmtleXMoIHNpbXVsYXRpb24ubG9jYWxpemVkU2ltdWxhdGlvbnMgKTtcblxuICAgIGxvY2FsZXMuZm9yRWFjaCggbG9jYWxlID0+IHtcbiAgICAgIGlmICggIXNpbU5hbWVzQnlMb2NhbGVbIGxvY2FsZSBdICkge1xuICAgICAgICBzaW1OYW1lc0J5TG9jYWxlWyBsb2NhbGUgXSA9IFtdO1xuICAgICAgfVxuICAgICAgc2ltTmFtZXNCeUxvY2FsZVsgbG9jYWxlIF0ucHVzaCggbmFtZSApO1xuICAgIH0gKTtcbiAgfSApO1xuXG4gIC8vIGh0dHBzOi8vYmF5ZXMuY29sb3JhZG8uZWR1L2Rldi9waGV0dGVzdC9hY2lkLWJhc2Utc29sdXRpb25zL2FjaWQtYmFzZS1zb2x1dGlvbnNfZW4uaHRtbD9lYSZicmFuZD1waGV0XG5cbiAgY29uc3QgbG9jYWxlcyA9IE9iamVjdC5rZXlzKCBzaW1OYW1lc0J5TG9jYWxlICkuc29ydCgpO1xuXG4gIGZvciAoIGNvbnN0IGxvY2FsZSBvZiBsb2NhbGVzICkge1xuXG4gICAgY29uc29sZS5sb2coIGAjIyAke2xvY2FsZX0gKCR7bG9jYWxlSW5mb1sgbG9jYWxlIF0ubmFtZX0pYCApO1xuICAgIGNvbnNvbGUubG9nKCAnJyApO1xuICAgIHNpbU5hbWVzQnlMb2NhbGVbIGxvY2FsZSBdLnNsaWNlKCAwLCBNYXRoLm1pbiggbGltaXQsIHNpbU5hbWVzQnlMb2NhbGVbIGxvY2FsZSBdLmxlbmd0aCApICkuZm9yRWFjaCggc2ltTmFtZSA9PiB7XG4gICAgICBjb25zdCBsaW5rcyA9IFtdO1xuICAgICAgaWYgKCBwcm9kdWN0aW9uICkge1xuICAgICAgICBsaW5rcy5wdXNoKCBgW3Byb2R1Y3Rpb25dKGh0dHBzOi8vcGhldC5jb2xvcmFkby5lZHUvc2ltcy9odG1sLyR7c2ltTmFtZX0vbGF0ZXN0LyR7c2ltTmFtZX1fYWxsLmh0bWw/bG9jYWxlPSR7bG9jYWxlfSlgICk7XG4gICAgICB9XG4gICAgICBpZiAoIHBoZXR0ZXN0ICkge1xuICAgICAgICBsaW5rcy5wdXNoKCBgW3BoZXR0ZXN0XShodHRwczovL2JheWVzLmNvbG9yYWRvLmVkdS9kZXYvcGhldHRlc3QvJHtzaW1OYW1lfS8ke3NpbU5hbWV9X2VuLmh0bWw/ZWEmYnJhbmQ9cGhldCZsb2NhbGU9JHtsb2NhbGV9KWAgKTtcbiAgICAgIH1cbiAgICAgIGlmICggbG9jYWwgKSB7XG4gICAgICAgIGxpbmtzLnB1c2goIGBbbG9jYWxdKGh0dHA6Ly9sb2NhbGhvc3QvJHtzaW1OYW1lfS8ke3NpbU5hbWV9X2VuLmh0bWw/YnJhbmQ9cGhldCZlYSZkZWJ1Z2dlciZsb2NhbGU9JHtsb2NhbGV9KWAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKCBgLSAke3NpbU5hbWV9ICR7bGlua3Muam9pbiggJyAnICl9YCApO1xuICAgIH0gKTtcbiAgICBjb25zb2xlLmxvZyggJycgKTtcbiAgfVxufSApKCk7Il0sIm5hbWVzIjpbImxvY2FsZUluZm8iLCJyZXF1aXJlIiwic2ltTWV0YWRhdGEiLCJ3aW5zdG9uIiwiZGVmYXVsdCIsInRyYW5zcG9ydHMiLCJjb25zb2xlIiwibGV2ZWwiLCJwcm9kdWN0aW9uIiwicHJvY2VzcyIsImFyZ3YiLCJpbmNsdWRlcyIsInBoZXR0ZXN0IiwibG9jYWwiLCJsaW1pdFN0cmluZyIsImZpbmQiLCJhcmciLCJzdGFydHNXaXRoIiwibGltaXQiLCJOdW1iZXIiLCJzdWJzdHJpbmciLCJsZW5ndGgiLCJQT1NJVElWRV9JTkZJTklUWSIsIm1ldGFkYXRhIiwic2ltTmFtZXNCeUxvY2FsZSIsInByb2plY3RzIiwiZm9yRWFjaCIsInByb2plY3QiLCJzaW11bGF0aW9ucyIsIkVycm9yIiwic2ltdWxhdGlvbiIsIm5hbWUiLCJsb2NhbGVzIiwiT2JqZWN0Iiwia2V5cyIsImxvY2FsaXplZFNpbXVsYXRpb25zIiwibG9jYWxlIiwicHVzaCIsInNvcnQiLCJsb2ciLCJzbGljZSIsIk1hdGgiLCJtaW4iLCJzaW1OYW1lIiwibGlua3MiLCJqb2luIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxhQUFhQyxRQUFTO0FBQzVCLE1BQU1DLGNBQWNELFFBQVM7QUFDN0IsTUFBTUUsVUFBVUYsUUFBUztBQUV6QkUsUUFBUUMsT0FBTyxDQUFDQyxVQUFVLENBQUNDLE9BQU8sQ0FBQ0MsS0FBSyxHQUFHO0FBRTNDLE1BQU1DLGFBQWFDLFFBQVFDLElBQUksQ0FBQ0MsUUFBUSxDQUFFO0FBQzFDLE1BQU1DLFdBQVdILFFBQVFDLElBQUksQ0FBQ0MsUUFBUSxDQUFFO0FBQ3hDLE1BQU1FLFFBQVFKLFFBQVFDLElBQUksQ0FBQ0MsUUFBUSxDQUFFO0FBRXJDLE1BQU1HLGNBQWNMLFFBQVFDLElBQUksQ0FBQ0ssSUFBSSxDQUFFQyxDQUFBQSxNQUFPQSxJQUFJQyxVQUFVLENBQUU7QUFDOUQsTUFBTUMsUUFBUUosY0FBY0ssT0FBUUwsWUFBWU0sU0FBUyxDQUFFLFdBQVdDLE1BQU0sS0FBT0YsT0FBT0csaUJBQWlCO0FBRXpHLG9CQUFBO0lBRUEsTUFBTUMsV0FBVyxNQUFNckI7SUFFdkIsTUFBTXNCLG1CQUFtQixDQUFDO0lBRTFCRCxTQUFTRSxRQUFRLENBQUNDLE9BQU8sQ0FBRUMsQ0FBQUE7UUFDekIsTUFBTUMsY0FBY0QsUUFBUUMsV0FBVztRQUN2QyxJQUFLQSxZQUFZUCxNQUFNLEtBQUssR0FBSTtZQUM5QixNQUFNLElBQUlRLE1BQU87UUFDbkI7UUFFQSxNQUFNQyxhQUFhRixXQUFXLENBQUUsRUFBRztRQUNuQyxNQUFNRyxPQUFPRCxXQUFXQyxJQUFJO1FBQzVCLE1BQU1DLFVBQVVDLE9BQU9DLElBQUksQ0FBRUosV0FBV0ssb0JBQW9CO1FBRTVESCxRQUFRTixPQUFPLENBQUVVLENBQUFBO1lBQ2YsSUFBSyxDQUFDWixnQkFBZ0IsQ0FBRVksT0FBUSxFQUFHO2dCQUNqQ1osZ0JBQWdCLENBQUVZLE9BQVEsR0FBRyxFQUFFO1lBQ2pDO1lBQ0FaLGdCQUFnQixDQUFFWSxPQUFRLENBQUNDLElBQUksQ0FBRU47UUFDbkM7SUFDRjtJQUVBLHdHQUF3RztJQUV4RyxNQUFNQyxVQUFVQyxPQUFPQyxJQUFJLENBQUVWLGtCQUFtQmMsSUFBSTtJQUVwRCxLQUFNLE1BQU1GLFVBQVVKLFFBQVU7UUFFOUIxQixRQUFRaUMsR0FBRyxDQUFFLENBQUMsR0FBRyxFQUFFSCxPQUFPLEVBQUUsRUFBRXBDLFVBQVUsQ0FBRW9DLE9BQVEsQ0FBQ0wsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMxRHpCLFFBQVFpQyxHQUFHLENBQUU7UUFDYmYsZ0JBQWdCLENBQUVZLE9BQVEsQ0FBQ0ksS0FBSyxDQUFFLEdBQUdDLEtBQUtDLEdBQUcsQ0FBRXhCLE9BQU9NLGdCQUFnQixDQUFFWSxPQUFRLENBQUNmLE1BQU0sR0FBS0ssT0FBTyxDQUFFaUIsQ0FBQUE7WUFDbkcsTUFBTUMsUUFBUSxFQUFFO1lBQ2hCLElBQUtwQyxZQUFhO2dCQUNoQm9DLE1BQU1QLElBQUksQ0FBRSxDQUFDLGlEQUFpRCxFQUFFTSxRQUFRLFFBQVEsRUFBRUEsUUFBUSxpQkFBaUIsRUFBRVAsT0FBTyxDQUFDLENBQUM7WUFDeEg7WUFDQSxJQUFLeEIsVUFBVztnQkFDZGdDLE1BQU1QLElBQUksQ0FBRSxDQUFDLG1EQUFtRCxFQUFFTSxRQUFRLENBQUMsRUFBRUEsUUFBUSw4QkFBOEIsRUFBRVAsT0FBTyxDQUFDLENBQUM7WUFDaEk7WUFDQSxJQUFLdkIsT0FBUTtnQkFDWCtCLE1BQU1QLElBQUksQ0FBRSxDQUFDLHlCQUF5QixFQUFFTSxRQUFRLENBQUMsRUFBRUEsUUFBUSx1Q0FBdUMsRUFBRVAsT0FBTyxDQUFDLENBQUM7WUFDL0c7WUFDQTlCLFFBQVFpQyxHQUFHLENBQUUsQ0FBQyxFQUFFLEVBQUVJLFFBQVEsQ0FBQyxFQUFFQyxNQUFNQyxJQUFJLENBQUUsTUFBTztRQUNsRDtRQUNBdkMsUUFBUWlDLEdBQUcsQ0FBRTtJQUNmO0FBQ0YifQ==